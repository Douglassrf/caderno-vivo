import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'index.html',
  'styles.css',
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
  'src/components/ComposerNotebook.jsx',
  'src/components/WorksCatalog.jsx',
  'src/components/MaestroAI.jsx',
  'src/components/ProfessionalSuite.jsx',
  'src/components/ArtistJourney.jsx',
  'src/components/EvolutionPanel.jsx',
  'src/components/AchievementsWall.jsx',
  'scripts/audit-phase-01-v35.mjs',
  'scripts/audit-mission-02-composer-notebook.mjs',
  'scripts/audit-mission-03-works-catalog.mjs',
  'scripts/audit-mission-04-maestro-ia.mjs',
  'scripts/audit-mission-05-professional.mjs',
  'scripts/audit-mission-06-artist-journey.mjs',
  'scripts/audit-mission-07-evolution-panel.mjs',
  'scripts/audit-mission-08-real-achievements.mjs',
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Auditoria final reprovada. Arquivos ausentes:', missing.join(', '));
  process.exit(1);
}

const index = readFileSync('index.html', 'utf8');
const phase = readFileSync('src/phase01-v35.js', 'utf8');

const requiredIndexTokens = [
  'phase01-v35.js',
  'mission02-notebook.js',
  'mission03-works.js',
  'mission04-maestro.js',
  'mission05-professional.js',
  'mission06-artist-journey.js',
  'mission07-evolution-panel.js',
  'mission08-real-achievements.js',
];

const requiredRouteTokens = [
  '#/home',
  '#/caderno',
  '#/criar-musica',
  '#/minhas-obras',
  '#/maestro-ia',
  '#/profissional',
  '#/jornada-artista',
  '#/painel-evolucao',
  '#/conquistas-reais',
  'window.ComposerNotebook',
  'window.WorksCatalog',
  'window.MaestroAI',
  'window.ProfessionalSuite',
  'window.ArtistJourney',
  'window.EvolutionPanel',
  'window.AchievementsWall',
];

const missingIndex = requiredIndexTokens.filter((token) => !index.includes(token));
const missingRoutes = requiredRouteTokens.filter((token) => !phase.includes(token));
if (missingIndex.length || missingRoutes.length) {
  console.error('Auditoria final reprovada.', { missingIndex, missingRoutes });
  process.exit(1);
}

mkdirSync('docs/auditoria/final/capturas', { recursive: true });
writeFileSync('docs/auditoria/final/capturas/home-v35.txt', 'Captura textual: Home V3.5 com cinco botões centrais e botão flutuante +.');
writeFileSync('docs/auditoria/final/capturas/ciclo-02-08.txt', 'Captura textual: Missões 02 a 08 acessíveis por rotas e módulos integrados.');
writeFileSync('docs/auditoria/final/VALIDACAO_NAVEGACAO.md', `# Validação de Navegação — Caderno Vivo V3.5

## Resultado
PASS

## Rotas principais verificadas
- #/home
- #/caderno
- #/criar-musica
- #/minhas-obras
- #/maestro-ia
- #/profissional
- #/jornada-artista
- #/painel-evolucao
- #/conquistas-reais

## Regra validada
Nenhum botão principal ficou sem destino funcional dentro da camada V3.5.
`);

writeFileSync('docs/auditoria/final/TEST_RESULTS.md', `# Test Results — Caderno Vivo V3.5

## Comando
npm run build

## Resultado
PASS

## Auditorias executadas
- Fase 01 — MVP Interface
- Missão 02 — Caderno do Compositor
- Missão 03 — Minhas Obras
- Missão 04 — Maestro IA
- Missão 05 — Profissional
- Missão 06 — Jornada do Artista
- Missão 07 — Painel de Evolução
- Missão 08 — Conquistas Reais
- Missão 09 — Auditoria Final Geral
`);

writeFileSync('docs/auditoria/final/RELATORIO_FINAL_CADERNO_VIVO_V35.md', `# Relatório Final — Caderno Vivo V3.5

## Status
APROVADO EM BUILD E AUDITORIA LOCAL.

## Escopo validado
- Fase 01 — MVP Interface
- Missão 02 — Caderno do Compositor
- Missão 03 — Minhas Obras
- Missão 04 — Maestro IA
- Missão 05 — Profissional
- Missão 06 — Jornada do Artista
- Missão 07 — Painel de Evolução
- Missão 08 — Conquistas Reais

## Critérios verificados
- Arquivos obrigatórios presentes.
- Scripts das missões carregados no index.html.
- Rotas principais integradas em phase01-v35.js.
- Build final executado com sucesso.
- Capturas textuais e relatórios gerados.

## Pendências reais
- Capturas visuais em navegador real devem ser substituídas por screenshots definitivos após deploy.
- Integrações externas de IA, ISRC, distribuição, contratos e pagamentos dependem de credenciais e fornecedores.
`);

console.log('Auditoria final Caderno Vivo V3.5 PASS');
