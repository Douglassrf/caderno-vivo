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

async function restSelect(accessToken, table, query) {
  const response = await fetch(restUrl(table, query), {
    method: "GET",
    headers: restHeaders(accessToken, ""),
  });
  const body = await readJson(response);
  return { data: response.ok ? body : null, error: response.ok ? null : body, status: response.status };
}

async function restUpdate(accessToken, table, query, payload, select = "*") {
  const fullQuery = `${query}&select=${encodeURIComponent(select)}`;
  const response = await fetch(restUrl(table, fullQuery), {
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

async function main() {
  const userB = await signIn(userBEmail, userBPassword);

  const workB = firstRow(
    await restInsert(userB.accessToken, "works", {
      title: `Obra privada B ${Date.now()}`,
    }, "id,title"),
    "Could not create work as user B",
  );

  const dossierB = firstRow(
    await restInsert(userB.accessToken, "dossiers", {
      work_id: workB.id,
      content: "Dossie privado do Usuario B",
      hash: `test-${Date.now()}`,
    }, "id,work_id"),
    "Could not create dossier as user B",
  );

  const userA = await signIn(userAEmail, userAPassword);
  const workQuery = `select=id,title,user_id&id=eq.${encodeURIComponent(workB.id)}`;
  const dossierQuery = `select=id,work_id,user_id,content&id=eq.${encodeURIComponent(dossierB.id)}`;

  const leakedWorks = await restSelect(userA.accessToken, "works", workQuery);
  if (leakedWorks.error) {
    throw new Error(`Unexpected works query error: ${leakedWorks.error.message || leakedWorks.status}`);
  }

  const leakedDossiers = await restSelect(userA.accessToken, "dossiers", dossierQuery);
  if (leakedDossiers.error) {
    throw new Error(`Unexpected dossiers query error: ${leakedDossiers.error.message || leakedDossiers.status}`);
  }

  const updatedWorks = await restUpdate(
    userA.accessToken,
    "works",
    `id=eq.${encodeURIComponent(workB.id)}`,
    { title: "Tentativa indevida do Usuario A" },
    "id,title",
  );
  if (updatedWorks.error) {
    throw new Error(`Unexpected works update error: ${updatedWorks.error.message || updatedWorks.status}`);
  }

  const updatedDossiers = await restUpdate(
    userA.accessToken,
    "dossiers",
    `id=eq.${encodeURIComponent(dossierB.id)}`,
    { content: "Tentativa indevida do Usuario A" },
    "id,content",
  );
  if (updatedDossiers.error) {
    throw new Error(`Unexpected dossiers update error: ${updatedDossiers.error.message || updatedDossiers.status}`);
  }

  const forgedDossier = await restInsert(userA.accessToken, "dossiers", {
    work_id: workB.id,
    content: "Dossie forjado por A em obra de B",
    hash: `forged-${Date.now()}`,
  }, "id,work_id");

  if (!forgedDossier.error || forgedDossier.data?.length) {
    console.error("IDOR_TEST_FAILED_FORGED_DOSSIER", forgedDossier);
    process.exit(1);
  }

  if (
    leakedWorks.data.length ||
    leakedDossiers.data.length ||
    updatedWorks.data.length ||
    updatedDossiers.data.length
  ) {
    console.error("IDOR_TEST_FAILED", {
      leakedWorks: leakedWorks.data,
      leakedDossiers: leakedDossiers.data,
      updatedWorks: updatedWorks.data,
      updatedDossiers: updatedDossiers.data,
    });
    process.exit(1);
  }

  console.log("IDOR_TEST_PASSED", {
    attemptedWorkId: workB.id,
    attemptedDossierId: dossierB.id,
    userAVisibleWorks: leakedWorks.data.length,
    userAVisibleDossiers: leakedDossiers.data.length,
    userAUpdatedWorks: updatedWorks.data.length,
    userAUpdatedDossiers: updatedDossiers.data.length,
    forgedDossierBlocked: Boolean(forgedDossier.error),
  });
}

main().catch((error) => {
  console.error("IDOR_TEST_ERROR", error.message);
  process.exit(1);
});

