const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const userAEmail = process.env.TEST_USER_A_EMAIL;
const userAPassword = process.env.TEST_USER_A_PASSWORD;
const userBEmail = process.env.TEST_USER_B_EMAIL;
const userBPassword = process.env.TEST_USER_B_PASSWORD;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
}

[
  ["SUPABASE_URL", url],
  ["SUPABASE_ANON_KEY", anonKey],
  ["TEST_USER_A_EMAIL", userAEmail],
  ["TEST_USER_A_PASSWORD", userAPassword],
  ["TEST_USER_B_EMAIL", userBEmail],
  ["TEST_USER_B_PASSWORD", userBPassword],
].forEach(([name, value]) => requireEnv(name, value));

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function signIn(email, password) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await readJson(response);
  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${body?.msg || body?.message || response.status}`);
  }
  return {
    accessToken: body.access_token,
    userId: body.user?.id,
  };
}

function restHeaders(accessToken, prefer = "return=representation") {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

function restUrl(table, query = "") {
  return `${url}/rest/v1/${table}${query ? `?${query}` : ""}`;
}

async function restInsert(accessToken, table, payload, select = "*") {
  const response = await fetch(restUrl(table, `select=${encodeURIComponent(select)}`), {
    method: "POST",
    headers: restHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  const body = await readJson(response);
  return { data: response.ok ? body : null, error: response.ok ? null : body, status: response.status };
}

async function restUpsert(accessToken, table, payload, select = "*") {
  const response = await fetch(restUrl(table, `select=${encodeURIComponent(select)}`), {
    method: "POST",
    headers: {
      ...restHeaders(accessToken),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(payload),
  });
  const body = await readJson(response);
  return { data: response.ok ? body : null, error: response.ok ? null : body, status: response.status };
}

async function restSelect(accessToken, table, query) {
  const response = await fetch(restUrl(table, query), {
    method: "GET",
    headers: restHeaders(accessToken, ""),
  });
  const body = await readJson(response);
  return { data: response.ok ? body : null, error: response.ok ? null : body, status: response.status };
}

async function restUpdate(accessToken, table, query, payload, select = "*") {
  const response = await fetch(restUrl(table, `${query}&select=${encodeURIComponent(select)}`), {
    method: "PATCH",
    headers: restHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  const body = await readJson(response);
  return { data: response.ok ? body : null, error: response.ok ? null : body, status: response.status };
}

function firstRow(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message || result.error.msg || result.status}`);
  }
  if (!Array.isArray(result.data) || !result.data[0]) {
    throw new Error(`${label}: no row returned`);
  }
  return result.data[0];
}

async function expectInsertBlocked(label, resultPromise) {
  const result = await resultPromise;
  if (!result.error || (Array.isArray(result.data) && result.data.length)) {
    console.error("PRODUCT_SECURITY_TEST_FAILED", {
      label,
      data: result.data,
      error: result.error,
      status: result.status,
    });
    process.exit(1);
  }
  return { label, blocked: true, status: result.status, message: result.error.message || result.error.msg };
}

async function expectStorageUploadBlocked(accessToken, userId, workId) {
  const response = await fetch(
    `${url}/storage/v1/object/private-exports/${encodeURIComponent(userId)}/${encodeURIComponent(workId)}/client-forbidden.json`,
    {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ forbidden: true }),
    },
  );
  const body = await readJson(response);
  if (response.ok) {
    console.error("PRODUCT_SECURITY_TEST_FAILED_STORAGE_UPLOAD", { status: response.status, body });
    process.exit(1);
  }
  return { blocked: true, status: response.status, message: body?.message || body?.error || body?.msg };
}

async function main() {
  const userB = await signIn(userBEmail, userBPassword);
  const profileB = firstRow(
    await restUpsert(userB.accessToken, "profiles", {
      id: userB.userId,
      display_name: "Perfil privado B",
    }, "id"),
    "Could not prepare user B profile",
  );

  const userA = await signIn(userAEmail, userAPassword);

  const leakedProfiles = await restSelect(
    userA.accessToken,
    "profiles",
    `select=id,display_name&id=eq.${encodeURIComponent(profileB.id)}`,
  );
  if (leakedProfiles.error) {
    throw new Error(`Unexpected profiles query error: ${leakedProfiles.error.message || leakedProfiles.status}`);
  }

  const updatedProfiles = await restUpdate(
    userA.accessToken,
    "profiles",
    `id=eq.${encodeURIComponent(profileB.id)}`,
    { display_name: "Tentativa indevida do Usuario A" },
    "id,display_name",
  );
  if (updatedProfiles.error) {
    throw new Error(`Unexpected profiles update error: ${updatedProfiles.error.message || updatedProfiles.status}`);
  }

  if (leakedProfiles.data.length || updatedProfiles.data.length) {
    console.error("PRODUCT_SECURITY_TEST_FAILED_PROFILE_IDOR", {
      leakedProfiles: leakedProfiles.data,
      updatedProfiles: updatedProfiles.data,
    });
    process.exit(1);
  }

  const work = firstRow(
    await restInsert(userA.accessToken, "works", {
      title: `Obra teste produto ${Date.now()}`,
    }, "id"),
    "Could not create owned work",
  );

  const checks = [];

  checks.push(
    await expectInsertBlocked(
      "payments_client_insert",
      restInsert(userA.accessToken, "payments", {
        user_id: userA.userId,
        work_id: work.id,
        provider: "mercado_pago",
        provider_payment_id: `client-${Date.now()}`,
        product: "dossier",
        amount_cents: 1990,
        status: "approved",
      }, "id"),
    ),
  );

  checks.push(
    await expectInsertBlocked(
      "entitlements_client_insert",
      restInsert(userA.accessToken, "entitlements", {
        user_id: userA.userId,
        work_id: work.id,
        product: "dossier",
        active: true,
      }, "id"),
    ),
  );

  checks.push(
    await expectInsertBlocked(
      "exports_client_insert",
      restInsert(userA.accessToken, "exports", {
        user_id: userA.userId,
        work_id: work.id,
        kind: "mp4",
        storage_path: `${userA.userId}/${work.id}/forbidden.mp4`,
        content_type: "video/mp4",
      }, "id"),
    ),
  );

  checks.push(
    await expectInsertBlocked(
      "audit_logs_client_insert",
      restInsert(userA.accessToken, "audit_logs", {
        user_id: userA.userId,
        work_id: work.id,
        action: "client_forbidden",
        resource: "audit_logs",
        metadata: { source: "browser" },
      }, "id"),
    ),
  );

  const storageUpload = await expectStorageUploadBlocked(userA.accessToken, userA.userId, work.id);

  console.log("PRODUCT_SECURITY_TEST_PASSED", {
    workId: work.id,
    profileIdorBlocked: true,
    blockedClientWrites: checks,
    storageClientUploadBlocked: storageUpload,
  });
}

main().catch((error) => {
  console.error("PRODUCT_SECURITY_TEST_ERROR", error.message);
  process.exit(1);
});

