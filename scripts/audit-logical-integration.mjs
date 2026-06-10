import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/logicalMissionController.js',
  'src/analyticsService.js',
  'src/backupService.js',
  'src/monitoringService.js',
  'src/adminDashboardService.js',
  'src/creativeLibraryService.js',
  'src/mentorService.js',
  'src/marketplaceService.js',
  'src/workspaceService.js',
  'src/versionService.js',
  'src/syncService.js',
  'src/launchAiService.js',
  'src/ecosystemService.js'
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};
globalThis.window = { addEventListener() {}, CadernoVivoLogicalMissions: null };
globalThis.document = { getElementById() { return null; } };
const mod = await import('../src/logicalMissionController.js');
const execution = await mod.runLogicalMissions({ silent: true });
const state = mod.getLogicalMissionState();
const checks = [
  { name: 'logicalMissionController.js exists', ok: !missing.includes('src/logicalMissionController.js') },
  { name: 'index has logicalMissionPanel root', ok: index.includes('id="logicalMissionPanel"') },
  { name: 'index loads logicalMissionController module', ok: index.includes('src="src/logicalMissionController.js"') },
  { name: 'all logical service dependencies exist', ok: missing.length === 0 },
  { name: 'logical execution completes', ok: execution.status === 'LOGICAL_EXECUTION_COMPLETED' },
  { name: '30 missions completed logical', ok: state.missions.filter((m) => m.status === 'completed_logical').length === 30 }
];
const failed = checks.filter((check) => !check.ok);
const report = {
  status: failed.length ? 'FAILED' : 'PASSED',
  checks,
  missing,
  executionStatus: execution.status,
  completed: state.missions.filter((m) => m.status === 'completed_logical').length,
  generatedAt: new Date().toISOString(),
  nextMission: 'Polimento visual do painel ou Infra real quando disponível'
};
fs.writeFileSync(path.join(root, 'LOGICAL_INTEGRATION_REPORT.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
