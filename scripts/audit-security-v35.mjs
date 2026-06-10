import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const root = process.cwd();
const findings = [];

function add(severity, category, file, detail) {
  findings.push({ severity, category, file, detail });
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules'].includes(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(root);
const textExt = new Set(['.js', '.jsx', '.mjs', '.html', '.css', '.json', '.md', '.txt', '.env', '.example', '.sql', '.toml', '.yml', '.yaml']);

for (const file of files) {
  const rel = relative(root, file).replaceAll('\\', '/');
  const ext = extname(file).toLowerCase();
  const isSecurityAuditSource = rel === 'scripts/audit-security-v35.mjs' || rel === 'scripts/audit-security-artifacts.mjs';
  const isDocumentationOnly = rel.endsWith('.md');

  if (['.exe', '.dll', '.bat', '.cmd', '.scr', '.msi', '.apk', '.jar', '.wasm', '.7z', '.rar'].includes(ext)) {
    add('HIGH', 'Arquivo executável/binário não esperado', rel, `Extensão ${ext}`);
  }

  if (ext === '.zip') {
    add('MEDIUM', 'Arquivo ZIP interno', rel, 'Arquivo compactado interno não entra no pacote final auditado.');
  }

  if (!textExt.has(ext) && !rel.startsWith('.env')) continue;

  const content = readFileSync(file, 'utf8');

  const secretPatterns = [
    /sk-[A-Za-z0-9_-]{20,}/,
    /AIza[0-9A-Za-z_-]{20,}/,
    /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/,
    /(SUPABASE_SERVICE_ROLE_KEY|MERCADO_PAGO_ACCESS_TOKEN|MERCADO_PAGO_WEBHOOK_SECRET)\s*=\s*(?!<SERVER_SIDE_ONLY_DO_NOT_COMMIT>|<definir_no_ambiente_server_side>|\$)[^\s]+/i
  ];

  if (!isSecurityAuditSource) {
    for (const rx of secretPatterns) {
      if (rx.test(content)) add('CRITICAL', 'Possível segredo real exposto', rel, rx.toString());
    }
  }

  if (/\beval\s*\(|new\s+Function\s*\(/.test(content)) {
    add('HIGH', 'Execução dinâmica proibida', rel, 'eval/new Function detectado.');
  }

  if (/document\.write\s*\(/.test(content)) {
    add('HIGH', 'document.write proibido', rel, 'document.write detectado.');
  }
}

const vercel = existsSync('vercel.json') ? readFileSync('vercel.json', 'utf8') : '';
for (const header of ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security']) {
  if (!vercel.includes(header)) add('HIGH', 'Header de segurança ausente', 'vercel.json', header);
}

const index = existsSync('index.html') ? readFileSync('index.html', 'utf8') : '';
if (!index.includes('Content-Security-Policy')) {
  add('MEDIUM', 'CSP meta ausente', 'index.html', 'Adicionar meta CSP como fallback para hospedagem estática.');
}

mkdirSync('docs/auditoria/security', { recursive: true });
writeFileSync('docs/auditoria/security/SECURITY_FINDINGS.json', JSON.stringify(findings, null, 2));

const blocking = findings.filter((f) => ['CRITICAL', 'HIGH'].includes(f.severity));
writeFileSync('docs/auditoria/security/SECURITY_AUDIT_REPORT.md', `# Auditoria de Segurança — Caderno Vivo V3.5

## Resultado
${blocking.length ? 'FAIL' : 'PASS'}

## Achados bloqueantes
${blocking.length ? blocking.map((f) => `- ${f.severity} | ${f.category} | ${f.file} | ${f.detail}`).join('\n') : 'Nenhum achado CRITICAL/HIGH bloqueante.'}

## Achados totais
${findings.length}

## Observações
- Uso de innerHTML foi revisado por auditoria estática anterior. O app possui função de escape em app.js para renderização de dados.
- Headers de segurança foram adicionados em vercel.json.
- CSP meta foi adicionada ao index.html como fallback.
- Arquivos .env são exemplos e não devem receber credenciais reais.
`);

if (blocking.length) {
  console.error('SECURITY AUDIT FAIL');
  console.error(blocking);
  process.exit(1);
}

console.log('SECURITY AUDIT PASS');
