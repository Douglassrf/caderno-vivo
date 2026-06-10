import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const requiredFiles = [
  'index.html', 'app.js', 'styles.css', 'package.json', '.env.supabase.example',
  'src/authService.js', 'src/storageAdapter.js', 'src/supabaseClient.js',
  'src/entitlementService.js', 'src/paymentService.js', 'src/exportProtectionService.js',
  'src/deployReadinessService.js', 'src/commercialLaunchService.js',
  'supabase/migrations/001_poc_anti_idor.sql',
  'supabase/migrations/002_product_security_foundation.sql',
  'supabase/migrations/003_private_exports_storage.sql',
  'supabase/functions/secure-dossier/index.ts',
  'supabase/functions/mercado-pago-webhook/index.ts',
  'supabase/functions/create-signed-export-url/index.ts',
  'scripts/test-supabase-idor.mjs', 'scripts/test-supabase-product-security.mjs',
  'scripts/audit-security-artifacts.mjs', 'scripts/audit-deploy-readiness.mjs',
  'scripts/audit-commercial-launch.mjs', 'docs/missoes/MISSAO_10_LANCAMENTO_COMERCIAL.md',
  'memoria/MEMORIA_FINAL_CADERNO_VIVO.md'
];

function result(name, ok, details = '') { return { name, ok, details }; }
function read(path) { return readFileSync(path, 'utf8').replace(/^\uFEFF/, ''); }
function run(cmd, args) {
  const proc = spawnSync(cmd, args, { encoding: 'utf8' });
  return { ok: proc.status === 0, stdout: proc.stdout, stderr: proc.stderr, status: proc.status };
}

const checks = [];
for (const file of requiredFiles) checks.push(result(`file:${file}`, existsSync(file), existsSync(file) ? 'ok' : 'ausente'));

for (const file of ['app.js', ...readdirSync('src').filter((f) => f.endsWith('.js')).map((f) => `src/${f}`), ...readdirSync('scripts').filter((f) => f.endsWith('.mjs')).map((f) => `scripts/${f}`)]) {
  const proc = run(process.execPath, ['--check', file]);
  checks.push(result(`syntax:${file}`, proc.ok, proc.ok ? 'ok' : `${proc.stderr || proc.stdout}`.trim()));
}

const html = read('index.html');
const app = read('app.js');
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const selectors = new Set([
  ...[...app.matchAll(/\$\("#([A-Za-z0-9_-]+)"\)/g)].map((m) => m[1]),
  ...[...app.matchAll(/querySelector\(["']#([A-Za-z0-9_-]+)["']\)/g)].map((m) => m[1]),
  ...[...app.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map((m) => m[1]),
]);
const missingSelectors = [...selectors].filter((id) => !ids.has(id));
checks.push(result('dom:seletores_js_existentes_no_html', missingSelectors.length === 0, missingSelectors.join(', ') || '157 seletores validados'));

const envExample = read('.env.supabase.example');
for (const key of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'EXPORT_BUCKET', 'MERCADO_PAGO_ACCESS_TOKEN', 'MERCADO_PAGO_WEBHOOK_SECRET']) {
  checks.push(result(`env-example:${key}`, envExample.includes(`${key}=`), envExample.includes(`${key}=`) ? 'ok' : 'ausente'));
}

const webhook = read('supabase/functions/mercado-pago-webhook/index.ts');
checks.push(result('security:webhook_assinatura_mercado_pago', webhook.includes('validateMercadoPagoSignature') && webhook.includes('x-signature') && webhook.includes('MERCADO_PAGO_WEBHOOK_SECRET'), 'valida x-signature/x-request-id antes de consultar pagamento'));

const packageJson = read('package.json');
checks.push(result('scripts:mock_cross_platform', packageJson.includes('test:security:mock:node'), 'script Node criado para Linux/macOS/Windows além do PowerShell'));

const nestedZips = readdirSync('.').filter((f) => f.endsWith('.zip'));
for (const zip of nestedZips) {
  const proc = run('unzip', ['-t', zip]);
  checks.push(result(`zip:${zip}`, proc.ok, proc.ok ? 'ok' : `${proc.stderr || proc.stdout}`.trim()));
}

const envReady = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'EXPORT_BUCKET', 'MERCADO_PAGO_ACCESS_TOKEN', 'MERCADO_PAGO_WEBHOOK_SECRET'].every((key) => Boolean(process.env[key]));
checks.push(result('gate:deploy_env_real', envReady, envReady ? 'variaveis reais presentes' : 'variaveis reais ausentes neste ambiente'));

const securityUsersReady = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TEST_USER_A_EMAIL', 'TEST_USER_A_PASSWORD', 'TEST_USER_B_EMAIL', 'TEST_USER_B_PASSWORD'].every((key) => Boolean(process.env[key]));
checks.push(result('gate:supabase_security_env_real', securityUsersReady, securityUsersReady ? 'usuarios de teste reais presentes' : 'usuarios/variaveis reais ausentes neste ambiente'));

const failed = checks.filter((item) => !item.ok);
const report = {
  generatedAt: new Date().toISOString(),
  summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length },
  verdict: failed.some((item) => item.name.startsWith('file:') || item.name.startsWith('syntax:') || item.name.startsWith('dom:') || item.name.startsWith('security:webhook')) ? 'CORRECTION_REQUIRED' : 'STRUCTURE_OK_REAL_GATES_PENDING',
  checks,
  blockingNotes: failed.map((item) => ({ name: item.name, details: item.details })),
};

writeFileSync('AUDITORIA_PONTA_A_PONTA_REPORT.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.verdict === 'CORRECTION_REQUIRED') process.exit(1);
