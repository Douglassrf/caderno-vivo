export const DEPLOY_REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "EXPORT_BUCKET",
  "MERCADO_PAGO_ACCESS_TOKEN",
  "MERCADO_PAGO_WEBHOOK_SECRET",
];

export const DEPLOY_REQUIRED_ARTIFACTS = [
  "supabase/migrations/001_poc_anti_idor.sql",
  "supabase/migrations/002_product_security_foundation.sql",
  "supabase/migrations/003_private_exports_storage.sql",
  "supabase/functions/secure-dossier/index.ts",
  "supabase/functions/mercado-pago-webhook/index.ts",
  "supabase/functions/create-signed-export-url/index.ts",
  "scripts/test-supabase-idor.mjs",
  "scripts/test-supabase-product-security.mjs",
  "src/authService.js",
  "src/storageAdapter.js",
  "src/entitlementService.js",
  "src/paymentService.js",
  "src/exportProtectionService.js",
];

export function buildDeployChecklist({ env = {}, files = [] } = {}) {
  const fileSet = new Set(files);
  const envChecks = DEPLOY_REQUIRED_ENV.map((name) => ({ name, ok: Boolean(env[name]) }));
  const artifactChecks = DEPLOY_REQUIRED_ARTIFACTS.map((path) => ({ path, ok: fileSet.has(path) }));
  const missingEnv = envChecks.filter((item) => !item.ok).map((item) => item.name);
  const missingArtifacts = artifactChecks.filter((item) => !item.ok).map((item) => item.path);
  return {
    ready: missingEnv.length === 0 && missingArtifacts.length === 0,
    missingEnv,
    missingArtifacts,
    envChecks,
    artifactChecks,
  };
}

export function buildHomologationGates({ idorPassed = false, productSecurityPassed = false, deployReady = false } = {}) {
  return {
    IDOR_TEST_PASSED: Boolean(idorPassed),
    PRODUCT_SECURITY_TEST_PASSED: Boolean(productSecurityPassed),
    DEPLOY_READY: Boolean(deployReady),
    APPROVED_FOR_MVP: Boolean(idorPassed && productSecurityPassed && deployReady),
  };
}
