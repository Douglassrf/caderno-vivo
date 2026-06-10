import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'index.html',
  'styles.css',
  'src/finalClosureController.js',
  'docs/missoes/MISSOES_73_87_FECHAMENTO_SEM_INFRA.md',
  'memoria/MEMORIA_MISSOES_73_87_FECHAMENTO_SEM_INFRA.md',
  'STATUS_FINAL_FECHAMENTO_SEM_INFRA.md'
];

const requiredIndexTokens = [
  'finalClosurePanel',
  'src/finalClosureController.js'
];

const requiredControllerTokens = [
  'FINAL_CLOSURE_LOGICAL_COMPLETED',
  'executeFinalClosure',
  'renderFinalClosurePanel',
  'Missões 73–87'
];

function contains(file, token) {
  return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(token);
}

const checks = [];
for (const file of requiredFiles) {
  checks.push({ name: `file:${file}`, ok: fs.existsSync(file) });
}
for (const token of requiredIndexTokens) {
  checks.push({ name: `index:${token}`, ok: contains('index.html', token) });
}
for (const token of requiredControllerTokens) {
  checks.push({ name: `controller:${token}`, ok: contains('src/finalClosureController.js', token) });
}

const failed = checks.filter((check) => !check.ok);
const report = {
  generatedAt: new Date().toISOString(),
  status: failed.length ? 'FAILED' : 'PASSED',
  total: checks.length,
  failed: failed.length,
  checks
};

fs.writeFileSync('FINAL_CLOSURE_AUDIT_REPORT.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
