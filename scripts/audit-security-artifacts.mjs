import { readFileSync, readdirSync, existsSync } from "node:fs";

const checks = [];
const artifactsOnly = process.argv.includes("--artifacts-only");

function read(path) {
  return readFileSync(path, "utf8");
}

function pass(name, details = "") {
  checks.push({ name, ok: true, details });
}

function fail(name, details) {
  checks.push({ name, ok: false, details });
}

function requireFile(path) {
  if (existsSync(path)) pass(`file:${path}`);
  else fail(`file:${path}`, "arquivo ausente");
}

function requireIncludes(path, patterns) {
  const content = read(path);
  for (const pattern of patterns) {
    if (content.includes(pattern)) pass(`${path} includes ${pattern}`);
    else fail(`${path} includes ${pattern}`, "trecho obrigatorio ausente");
  }
}

function requireRegex(path, regex, label) {
  const content = read(path);
  if (regex.test(content)) pass(`${path} ${label}`);
  else fail(`${path} ${label}`, `regex ausente: ${regex}`);
}

function migrationFiles() {
  return readdirSync("supabase/migrations")
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

function auditFiles() {
  [
    "supabase/config.toml",
    "supabase/migrations/001_poc_anti_idor.sql",
    "supabase/migrations/002_product_security_foundation.sql",
    "supabase/migrations/003_private_exports_storage.sql",
    "supabase/functions/mercado-pago-webhook/index.ts",
    "supabase/functions/secure-dossier/index.ts",
    "supabase/functions/create-signed-export-url/index.ts",
    "supabase/functions/_shared/cors.ts",
    "scripts/test-supabase-idor.mjs",
    "scripts/test-supabase-product-security.mjs",
    "scripts/run-security-tests.ps1",
    ".env.supabase.example",
    ".devcontainer/devcontainer.json",
    "package.json",
  ].forEach(requireFile);
}

function auditMigrations() {
  const migrations = migrationFiles();
  const expected = [
    "001_poc_anti_idor.sql",
    "002_product_security_foundation.sql",
    "003_private_exports_storage.sql",
  ];
  const exact = expected.every((name, index) => migrations[index] === name);
  if (exact) pass("migration order", migrations.join(", "));
  else fail("migration order", `esperado inicio ${expected.join(", ")}; atual ${migrations.join(", ")}`);

  requireIncludes("supabase/migrations/001_poc_anti_idor.sql", [
    "alter table public.works enable row level security",
    "alter table public.dossiers enable row level security",
    "create policy \"works_owner_all\"",
    "create policy \"dossiers_owner_all\"",
    "auth.uid() = user_id",
  ]);

  requireIncludes("supabase/migrations/002_product_security_foundation.sql", [
    "create table if not exists public.payments",
    "create table if not exists public.entitlements",
    "create table if not exists public.exports",
    "create table if not exists public.audit_logs",
    "alter table public.profiles force row level security",
    "alter table public.works force row level security",
    "alter table public.dossiers force row level security",
    "alter table public.payments force row level security",
    "alter table public.entitlements force row level security",
    "alter table public.exports force row level security",
    "alter table public.audit_logs force row level security",
    "create policy \"payments_owner_select\"",
    "create policy \"entitlements_owner_select\"",
    "create policy \"exports_owner_select\"",
    "create policy \"audit_logs_owner_select\"",
  ]);

  for (const table of ["payments", "entitlements", "exports", "audit_logs"]) {
    requireRegex(
      "supabase/migrations/002_product_security_foundation.sql",
      new RegExp(`create policy\\s+"${table}_[^"]+"\\s+on\\s+public\\.${table}\\s+for\\s+select`, "i"),
      `${table} only has select client policy`,
    );
    requireRegex(
      "supabase/migrations/002_product_security_foundation.sql",
      new RegExp(`create policy\\s+"${table}_[^"]+"\\s+on\\s+public\\.${table}\\s+for\\s+(?!select)`, "i"),
      `${table} no non-select client policy should be absent`,
    );
    const last = checks.at(-1);
    if (last?.ok) {
      last.ok = false;
      last.details = "policy nao-select encontrada em tabela sensivel";
    } else if (last) {
      last.ok = true;
      last.details = "nenhuma policy nao-select encontrada";
    }
  }

  requireIncludes("supabase/migrations/003_private_exports_storage.sql", [
    "'private-exports'",
    "false",
    "create policy \"private_exports_owner_read\"",
    "for select",
    "Sem policy de insert/update/delete para authenticated",
  ]);
}

function auditFunctions() {
  requireIncludes("supabase/functions/mercado-pago-webhook/index.ts", [
    "MERCADO_PAGO_ACCESS_TOKEN",
    "SUPABASE_SERVICE_ROLE_KEY",
    "https://api.mercadopago.com/v1/payments/",
    ".from(\"payments\")",
    ".from(\"entitlements\")",
    "payment.status !== \"approved\"",
    "payment_approved",
  ]);

  requireIncludes("supabase/functions/secure-dossier/index.ts", [
    "auth.getUser()",
    ".from(\"works\")",
    ".from(\"entitlements\")",
    ".from(\"dossiers\")",
    "entitlement_required",
    "dossier_downloaded",
  ]);

  requireIncludes("supabase/functions/create-signed-export-url/index.ts", [
    "private-exports",
    ".from(\"exports\")",
    ".from(\"entitlements\")",
    "createSignedUrl",
    "signed_export_url_created",
  ]);
}

function auditScriptsAndEnv() {
  requireIncludes(".env.supabase.example", [
    "SUPABASE_URL=",
    "SUPABASE_ANON_KEY=",
    "SUPABASE_PROJECT_REF=",
    "TEST_USER_A_EMAIL=",
    "TEST_USER_B_EMAIL=",
    "SUPABASE_SERVICE_ROLE_KEY=",
    "MERCADO_PAGO_ACCESS_TOKEN=",
    "EXPORT_BUCKET=",
  ]);

  requireIncludes("package.json", [
    "\"supabase:db:push\"",
    "\"supabase:functions:deploy\"",
    "\"test:security\"",
  ]);

  requireIncludes("scripts/test-supabase-idor.mjs", [
    "IDOR_TEST_PASSED",
    "IDOR_TEST_FAILED",
    "fetch(`${url}/auth/v1/token?grant_type=password`",
  ]);

  requireIncludes("scripts/test-supabase-product-security.mjs", [
    "PRODUCT_SECURITY_TEST_PASSED",
    "PRODUCT_SECURITY_TEST_FAILED",
    "/storage/v1/object/private-exports/",
  ]);

  const example = read(".env.supabase.example");
  const suspiciousSecrets = [
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    /APP_USR-[A-Za-z0-9_-]{20,}/,
  ];
  const leaked = suspiciousSecrets.some((regex) => regex.test(example));
  if (leaked) fail("env example has no real-looking secrets", "possivel segredo real encontrado");
  else pass("env example has no real-looking secrets");
}

function auditLocalEnvState() {
  if (artifactsOnly) {
    pass("env audit skipped", "--artifacts-only");
    return;
  }

  if (existsSync(".env.supabase")) pass(".env.supabase present");
  else fail(".env.supabase present", "arquivo real ausente; gates remotos nao podem rodar");

  const requiredEnv = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "TEST_USER_A_EMAIL",
    "TEST_USER_A_PASSWORD",
    "TEST_USER_B_EMAIL",
    "TEST_USER_B_PASSWORD",
  ];
  for (const name of requiredEnv) {
    if (process.env[name]) pass(`env:${name}`);
    else fail(`env:${name}`, "variavel ausente na sessao atual");
  }
}

auditFiles();
auditMigrations();
auditFunctions();
auditScriptsAndEnv();
auditLocalEnvState();

const failed = checks.filter((check) => !check.ok);
const summary = {
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed,
};

if (failed.length) {
  console.error("SECURITY_ARTIFACT_AUDIT_FAILED", JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("SECURITY_ARTIFACT_AUDIT_PASSED", JSON.stringify(summary, null, 2));
