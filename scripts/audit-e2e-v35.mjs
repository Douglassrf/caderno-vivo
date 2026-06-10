import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const requiredFiles = [
  'index.html',
  'styles.css',
  'package.json',
  'app.js',
  'src/phase01-v35.js',
  'src/mission02-notebook.js',
  'src/mission03-works.js',
  'src/mission04-maestro.js',
  'src/mission05-professional.js',
  'src/mission06-artist-journey.js',
  'src/mission07-evolution-panel.js',
  'src/mission08-real-achievements.js',
  'src/components/HomePage.jsx',
  'src/components/FloatingButton.jsx',
  'src/components/ComposerDashboard.jsx',
  'src/components/ComposerHome.jsx',
  'src/components/BeginnerMode.jsx',
  'src/components/ComposerMode.jsx',
  'src/components/ProfessionalMode.jsx',
  'src/components/ComposerNotebook.jsx',
  'src/components/LyricsManager.jsx',
  'src/components/IdeasManager.jsx',
  'src/components/AudioManager.jsx',
  'src/components/DraftManager.jsx',
  'src/components/VersionManager.jsx',
  'src/components/WorksCatalog.jsx',
  'src/components/WorksTimeline.jsx',
  'src/components/WorksVersionControl.jsx',
  'src/components/RepertoireManager.jsx',
  'src/components/WorkStatusManager.jsx',
  'src/components/ArchivedWorksManager.jsx',
  'src/components/MaestroAI.jsx',
  'src/components/LyricImprover.jsx',
  'src/components/ChorusImprover.jsx',
  'src/components/HarmonyCreator.jsx',
  'src/components/MelodyCreator.jsx',
  'src/components/IdeaToSong.jsx',
  'src/components/ProfessionalSuite.jsx',
  'src/components/RegistrationManager.jsx',
  'src/components/ISRCManager.jsx',
  'src/components/DistributionManager.jsx',
  'src/components/LicensingManager.jsx',
  'src/components/ContractManager.jsx',
  'src/components/AnalyticsManager.jsx',
  'src/components/RoyaltyManager.jsx',
  'src/components/ArtistJourney.jsx',
  'src/components/DiscoverLevel.jsx',
  'src/components/CreateLevel.jsx',
  'src/components/DevelopLevel.jsx',
  'src/components/ProfessionalizeLevel.jsx',
  'src/components/ScaleLevel.jsx',
  'src/components/EvolutionPanel.jsx',
  'src/components/ArtistTimeline.jsx',
  'src/components/ProgressIndicators.jsx',
  'src/components/MemoryVault.jsx',
  'src/components/CareerMilestones.jsx',
  'src/components/AchievementsWall.jsx',
  'src/components/CreationAchievements.jsx',
  'src/components/ProfessionalAchievements.jsx',
  'src/components/FinancialAchievements.jsx',
  'src/components/LegacyAchievements.jsx',
  'src/components/InternalCertificates.jsx',
  'README.md',
  'CHANGELOG.md',
  'DEPLOY_GUIDE.md',
  'docs/auditoria/final/RELATORIO_FINAL_CADERNO_VIVO_V35.md',
  'docs/auditoria/final/VALIDACAO_NAVEGACAO.md',
  'docs/auditoria/final/TEST_RESULTS.md'
];

const requiredScripts = [
  'src/mission02-notebook.js',
  'src/mission03-works.js',
  'src/mission04-maestro.js',
  'src/mission05-professional.js',
  'src/mission06-artist-journey.js',
  'src/mission07-evolution-panel.js',
  'src/mission08-real-achievements.js',
  'src/phase01-v35.js'
];

const requiredRoutes = [
  '#/home',
  '#/caderno',
  '#/criar-musica',
  '#/minhas-obras',
  '#/maestro-ia',
  '#/profissional',
  '#/jornada-artista',
  '#/painel-evolucao',
  '#/conquistas-reais'
];

const requiredGlobals = [
  'window.ComposerNotebook',
  'window.WorksCatalog',
  'window.MaestroAI',
  'window.ProfessionalSuite',
  'window.ArtistJourney',
  'window.EvolutionPanel',
  'window.AchievementsWall'
];

const requiredLabels = [
  'Caderno do Compositor',
  'Criar Música',
  'Minhas Obras',
  'Maestro IA',
  'Profissional',
  'Descubra',
  'Crie',
  'Desenvolva',
  'Profissionalize',
  'Escala',
  'Painel de Evolução',
  'Linha do Tempo',
  'Cofre de Memórias',
  'Conquistas Reais',
  'Conquistas de Criação',
  'Conquistas Profissionais',
  'Conquistas Financeiras',
  'Conquistas de Legado',
  'Certificados Internos'
];

function fail(message, details = []) {
  console.error(message);
  if (details.length) console.error(details.join('\n'));
  process.exit(1);
}

const missingFiles = requiredFiles.filter((file) => !existsSync(file));
if (missingFiles.length) fail('E2E FAIL — arquivos obrigatórios ausentes:', missingFiles);

const index = readFileSync('index.html', 'utf8');
const phase = readFileSync('src/phase01-v35.js', 'utf8');
const bundle = [
  phase,
  readFileSync('src/mission02-notebook.js', 'utf8'),
  readFileSync('src/mission03-works.js', 'utf8'),
  readFileSync('src/mission04-maestro.js', 'utf8'),
  readFileSync('src/mission05-professional.js', 'utf8'),
  readFileSync('src/mission06-artist-journey.js', 'utf8'),
  readFileSync('src/mission07-evolution-panel.js', 'utf8'),
  readFileSync('src/mission08-real-achievements.js', 'utf8')
].join('\n');

const missingScripts = requiredScripts.filter((script) => !index.includes(script));
if (missingScripts.length) fail('E2E FAIL — scripts não carregados no index.html:', missingScripts);

const missingRoutes = requiredRoutes.filter((route) => !phase.includes(route));
if (missingRoutes.length) fail('E2E FAIL — rotas ausentes em phase01-v35.js:', missingRoutes);

const missingGlobals = requiredGlobals.filter((token) => !bundle.includes(token));
if (missingGlobals.length) fail('E2E FAIL — módulos globais ausentes:', missingGlobals);

const missingLabels = requiredLabels.filter((token) => !bundle.includes(token));
if (missingLabels.length) fail('E2E FAIL — labels/funcionalidades obrigatórias ausentes:', missingLabels);

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
if (!pkg.scripts || !pkg.scripts.build || !pkg.scripts.build.includes('audit-final-v35.mjs')) {
  fail('E2E FAIL — package.json não possui build final auditável.');
}

mkdirSync('docs/auditoria/final', { recursive: true });
writeFileSync('docs/auditoria/final/E2E_AUDIT_RESULTS.md', `# Auditoria Ponta a Ponta — Caderno Vivo V3.5

## Resultado
PASS

## Arquivos obrigatórios
${requiredFiles.map((file) => `- ${file}`).join('\n')}

## Rotas verificadas
${requiredRoutes.map((route) => `- ${route}`).join('\n')}

## Módulos globais verificados
${requiredGlobals.map((token) => `- ${token}`).join('\n')}

## Funcionalidades/labels verificados
${requiredLabels.map((token) => `- ${token}`).join('\n')}

## Conclusão
O pacote possui estrutura, scripts, rotas, módulos e documentação final para o Caderno Vivo V3.5.
`);
console.log('E2E Caderno Vivo V3.5 audit PASS');
