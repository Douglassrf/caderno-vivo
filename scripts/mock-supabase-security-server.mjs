import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.MOCK_SUPABASE_PORT || 54399);
const anonKey = process.env.SUPABASE_ANON_KEY || "mock-anon-key";
const userAEmail = process.env.TEST_USER_A_EMAIL || "usuario-a@teste.local";
const userAPassword = process.env.TEST_USER_A_PASSWORD || "senha-a";
const userBEmail = process.env.TEST_USER_B_EMAIL || "usuario-b@teste.local";
const userBPassword = process.env.TEST_USER_B_PASSWORD || "senha-b";

const users = new Map([
  [userAEmail, { id: "user-a", email: userAEmail, password: userAPassword }],
  [userBEmail, { id: "user-b", email: userBEmail, password: userBPassword }],
]);

const tokens = new Map();
const db = {
  works: [],
  dossiers: [],
  profiles: [],
  payments: [],
  entitlements: [],
  exports: [],
  audit_logs: [],
};

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, prefer",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  });
  res.end(payload === undefined ? "" : JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function authenticatedUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  return tokens.get(token) || null;
}

function queryParams(url) {
  return Object.fromEntries(url.searchParams.entries());
}

function selectedFields(url) {
  const select = url.searchParams.get("select");
  if (!select || select === "*") return null;
  return select.split(",").map((item) => item.trim()).filter(Boolean);
}

function project(row, fields) {
  if (!fields) return row;
  return Object.fromEntries(fields.map((field) => [field, row[field]]));
}

function matchesEq(row, key, value) {
  if (value === undefined) return true;
  return String(row[key]) === value;
}

function ownerVisible(table, row, user) {
  if (!user) return false;
  if (table === "works") return row.user_id === user.id;
  if (table === "dossiers") {
    const work = db.works.find((item) => item.id === row.work_id);
    return row.user_id === user.id && work?.user_id === user.id;
  }
  if (table === "profiles") return row.id === user.id;
  return row.user_id === user.id;
}

function tableFromPath(pathname) {
  const match = pathname.match(/^\/rest\/v1\/([^/]+)$/);
  return match?.[1] || "";
}

function forbiddenSensitiveWrite(table) {
  return ["payments", "entitlements", "exports", "audit_logs"].includes(table);
}

async function handleAuth(req, res) {
  const body = await parseBody(req);
  const user = users.get(body.email);
  if (!user || user.password !== body.password) {
    send(res, 400, { message: "Invalid login credentials" });
    return;
  }
  const token = `mock-token-${user.id}-${Date.now()}`;
  tokens.set(token, user);
  send(res, 200, {
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    user: { id: user.id, email: user.email },
  });
}

async function handleRest(req, res, url) {
  const table = tableFromPath(url.pathname);
  const user = authenticatedUser(req);
  const fields = selectedFields(url);

  if (!db[table]) {
    send(res, 404, { message: "table not found" });
    return;
  }

  if (!user) {
    send(res, 401, { message: "missing auth" });
    return;
  }

  if (req.method === "GET") {
    const params = queryParams(url);
    let rows = db[table].filter((row) => ownerVisible(table, row, user));
    for (const [key, raw] of Object.entries(params)) {
      if (key === "select") continue;
      if (raw.startsWith("eq.")) {
        rows = rows.filter((row) => matchesEq(row, key, raw.slice(3)));
      }
    }
    send(res, 200, rows.map((row) => project(row, fields)));
    return;
  }

  if (req.method === "POST") {
    if (forbiddenSensitiveWrite(table)) {
      send(res, 403, { message: "new row violates row-level security policy" });
      return;
    }
    const body = await parseBody(req);
    const rows = Array.isArray(body) ? body : [body];
    const inserted = [];
    for (const row of rows) {
      if (table === "dossiers") {
        const work = db.works.find((item) => item.id === row.work_id);
        if (!work || work.user_id !== user.id) {
          send(res, 403, { message: "new row violates row-level security policy" });
          return;
        }
      }
      if (table === "profiles" && row.id !== user.id) {
        send(res, 403, { message: "new row violates row-level security policy" });
        return;
      }
      const next = {
        id: row.id || randomUUID(),
        user_id: table === "profiles" ? undefined : user.id,
        ...row,
      };
      db[table] = db[table].filter((item) => item.id !== next.id);
      db[table].push(next);
      inserted.push(project(next, fields));
    }
    send(res, 201, inserted);
    return;
  }

  if (req.method === "PATCH") {
    const params = queryParams(url);
    const body = await parseBody(req);
    const updated = [];
    for (const row of db[table]) {
      if (!ownerVisible(table, row, user)) continue;
      let match = true;
      for (const [key, raw] of Object.entries(params)) {
        if (key === "select") continue;
        if (raw.startsWith("eq.") && !matchesEq(row, key, raw.slice(3))) match = false;
      }
      if (!match) continue;
      Object.assign(row, body);
      updated.push(project(row, fields));
    }
    send(res, 200, updated);
    return;
  }

  send(res, 405, { message: "method not allowed" });
}

function handleStorage(req, res, url) {
  if (url.pathname.startsWith("/storage/v1/object/private-exports/") && req.method === "POST") {
    send(res, 403, { message: "new row violates row-level security policy" });
    return;
  }
  send(res, 404, { message: "storage route not found" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  if (req.method === "OPTIONS") {
    send(res, 200);
    return;
  }
  if (url.pathname === "/auth/v1/token") {
    await handleAuth(req, res);
    return;
  }
  if (url.pathname.startsWith("/rest/v1/")) {
    await handleRest(req, res, url);
    return;
  }
  if (url.pathname.startsWith("/storage/v1/")) {
    handleStorage(req, res, url);
    return;
  }
  if (url.pathname === "/health") {
    send(res, 200, { ok: true });
    return;
  }
  send(res, 404, { message: "not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`MOCK_SUPABASE_READY http://127.0.0.1:${port}`);
});

