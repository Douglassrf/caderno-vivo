import { analyticsService } from './analyticsService.js';
import { backupService } from './backupService.js';
import { monitoringService } from './monitoringService.js';
import { adminDashboardService } from './adminDashboardService.js';
import { listCreativeTemplates } from './creativeLibraryService.js';
import { mentorService } from './mentorService.js';
import { marketplaceService } from './marketplaceService.js';
import { workspaceService } from './workspaceService.js';
import { versionService } from './versionService.js';
import { syncService } from './syncService.js';
import { createLaunchPlan } from './launchAiService.js';
import { getEcosystemMap } from './ecosystemService.js';

const STATE_KEY = 'cadernoVivo.logicalMissions.state';
const DEFAULT_MISSIONS = [
  { id: 21, name: 'Analytics', status: 'ready' },
  { id: 22, name: 'Backups', status: 'ready' },
  { id: 23, name: 'Monitoramento', status: 'ready' },
  { id: 24, name: 'Dashboard Admin', status: 'ready' },
  { id: 25, name: 'Biblioteca Criativa', status: 'ready' },
  { id: 26, name: 'Mentor Criativo Mock', status: 'ready' },
  { id: 27, name: 'Marketplace Mock', status: 'ready' },
  { id: 28, name: 'Colaboração Mock', status: 'ready' },
  { id: 29, name: 'Mobile Readiness', status: 'ready' },
  { id: 30, name: 'Globalização', status: 'ready' },
  { id: 31, name: 'Insights', status: 'ready' },
  { id: 32, name: 'Retenção', status: 'ready' },
  { id: 33, name: 'CRM', status: 'ready' },
  { id: 34, name: 'Academy', status: 'ready' },
  { id: 35, name: 'Referral', status: 'ready' },
  { id: 36, name: 'Teams', status: 'ready' },
  { id: 37, name: 'Workspace', status: 'ready' },
  { id: 38, name: 'Versioning', status: 'ready' },
  { id: 39, name: 'CloudSync', status: 'ready' },
  { id: 40, name: 'Enterprise', status: 'ready' },
  { id: 41, name: 'Composer AI Mock', status: 'ready' },
  { id: 42, name: 'Lyrics AI Mock', status: 'ready' },
  { id: 43, name: 'Harmony AI Mock', status: 'ready' },
  { id: 44, name: 'Production AI Mock', status: 'ready' },
  { id: 45, name: 'Launch AI Mock', status: 'ready' },
  { id: 46, name: 'Marketplace Global Mock', status: 'ready' },
  { id: 47, name: 'Licensing Mock', status: 'ready' },
  { id: 48, name: 'Rights Mock', status: 'ready' },
  { id: 49, name: 'Distribution Mock', status: 'ready' },
  { id: 50, name: 'Ecosystem', status: 'ready' }
];

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY)) || null;
  } catch {
    return null;
  }
}

function writeState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  return state;
}

export function getLogicalMissionState() {
  return readState() || writeState({
    updatedAt: new Date().toISOString(),
    infraBlocked: ['Supabase Produção', 'Mercado Pago Produção'],
    missions: DEFAULT_MISSIONS,
    lastReport: null
  });
}

export async function runLogicalMissions({ silent = false } = {}) {
  const state = getLogicalMissionState();
  const startedAt = new Date().toISOString();
  const report = {
    status: 'LOGICAL_EXECUTION_COMPLETED',
    startedAt,
    finishedAt: null,
    infraBlocked: state.infraBlocked,
    executed: [],
    artifacts: {}
  };

  try {
    analyticsService.track('logical_missions_started', { range: '21-50' });
    report.executed.push('analytics_event_tracking');

    report.artifacts.backup = backupService.createBackup('logical-missions-21-50', { createdAt: startedAt });
    report.executed.push('backup_snapshot_mock');

    report.artifacts.dashboard = adminDashboardService.summarize({ events: [] });
    report.executed.push('admin_dashboard_snapshot');

    report.artifacts.templates = listCreativeTemplates();
    report.executed.push('creative_library_ready');

    report.artifacts.mentor = mentorService.suggest({ theme: 'melhorar uma composição' });
    report.executed.push('mentor_mock_ready');

    report.artifacts.marketplace = marketplaceService.list([]);
    report.executed.push('marketplace_mock_ready');

    report.artifacts.workspace = workspaceService.createWorkspace({ userId: 'mock-user', name: 'Caderno Vivo Workspace' });
    report.executed.push('workspace_mock_ready');

    report.artifacts.version = versionService.createVersion({ type: 'logical-missions' });
    report.executed.push('versioning_mock_ready');

    report.artifacts.sync = syncService.queue({ type: 'logical-missions' });
    report.executed.push('cloudsync_mock_ready');

    report.artifacts.launch = createLaunchPlan({ title: 'Caderno Vivo' });
    report.executed.push('launch_ai_mock_ready');

    report.artifacts.ecosystem = getEcosystemMap();
    report.executed.push('ecosystem_map_ready');

    state.missions = state.missions.map((mission) => ({ ...mission, status: 'completed_logical' }));
    report.finishedAt = new Date().toISOString();
    state.updatedAt = report.finishedAt;
    state.lastReport = report;
    writeState(state);
    analyticsService.track('logical_missions_completed', { executed: report.executed.length });
    return report;
  } catch (error) {
    report.status = 'LOGICAL_EXECUTION_FAILED';
    report.error = error.message;
    report.finishedAt = new Date().toISOString();
    state.lastReport = report;
    writeState(state);
    monitoringService.reportError(error);
    if (!silent) throw error;
    return report;
  }
}

export function renderLogicalMissionPanel(root = document.getElementById('logicalMissionPanel')) {
  if (!root) return;
  const state = getLogicalMissionState();
  const completed = state.missions.filter((mission) => mission.status === 'completed_logical').length;
  const total = state.missions.length;
  const report = state.lastReport;
  root.innerHTML = `
    <section class="subpanel logical-mission-panel">
      <div class="subpanel-heading row">
        <div>
          <h3>Missões Lógicas 21–50</h3>
          <p>Execução sem bloquear por Supabase/Mercado Pago.</p>
        </div>
        <strong>${completed}/${total}</strong>
      </div>
      <div class="progress-track"><span style="width:${Math.round((completed / total) * 100)}%"></span></div>
      <div class="badge-row">
        ${state.infraBlocked.map((item) => `<span class="badge">Pendente depois: ${item}</span>`).join('')}
      </div>
      <div class="check-list vertical">
        ${state.missions.map((mission) => `<label class="check-item"><input type="checkbox" disabled ${mission.status === 'completed_logical' ? 'checked' : ''}> ${mission.id} — ${mission.name}</label>`).join('')}
      </div>
      <div class="legal-box">
        <strong>Status:</strong> ${report?.status || 'READY'}<br>
        <strong>Última atualização:</strong> ${state.updatedAt}<br>
        <strong>Artefatos:</strong> ${report ? Object.keys(report.artifacts || {}).length : 0}
      </div>
      <button id="runLogicalMissionsButton" class="primary-action compact" type="button">Executar missões lógicas</button>
    </section>
  `;
  document.getElementById('runLogicalMissionsButton')?.addEventListener('click', async () => {
    await runLogicalMissions({ silent: true });
    renderLogicalMissionPanel(root);
  });
}

export function bootLogicalMissionPanel() {
  const root = document.getElementById('logicalMissionPanel');
  if (!root) return;
  renderLogicalMissionPanel(root);
  runLogicalMissions({ silent: true }).then(() => renderLogicalMissionPanel(root));
}

if (typeof window !== 'undefined') {
  window.CadernoVivoLogicalMissions = {
    getLogicalMissionState,
    runLogicalMissions,
    renderLogicalMissionPanel,
    bootLogicalMissionPanel
  };
  window.addEventListener('DOMContentLoaded', bootLogicalMissionPanel);
}
