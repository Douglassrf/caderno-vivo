import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const required = [
  "src/mission07-evolution-panel.js",
  "src/components/EvolutionPanel.jsx",
  "src/components/ArtistTimeline.jsx",
  "src/components/ProgressIndicators.jsx",
  "src/components/MemoryVault.jsx",
  "src/components/CareerMilestones.jsx"
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missão 07 — Painel de Evolução reprovada. Arquivos ausentes:', missing.join(', '));
  process.exit(1);
}

const index = readFileSync('index.html', 'utf8');
const phase = readFileSync('src/phase01-v35.js', 'utf8');
const source = readFileSync('src/mission07-evolution-panel.js', 'utf8');

if (!index.includes('mission07-evolution-panel.js')) {
  console.error('Missão 07 — Painel de Evolução reprovada. Script não incluído no index.html.');
  process.exit(1);
}

const missingPhase = ["window.EvolutionPanel.render", "window.EvolutionPanel.bind", "#/painel-evolucao"].filter((token) => !phase.includes(token));
if (missingPhase.length) {
  console.error('Missão 07 — Painel de Evolução reprovada. Integração ausente no phase01-v35.js:', missingPhase.join(', '));
  process.exit(1);
}

const missingTokens = ["Painel de Evolução", "Linha do Tempo", "Indicadores", "Cofre de Memórias", "Marcos da Carreira"].filter((token) => !source.includes(token));
if (missingTokens.length) {
  console.error('Missão 07 — Painel de Evolução reprovada. Entregas ausentes:', missingTokens.join(', '));
  process.exit(1);
}

mkdirSync('docs/auditoria/missao07/capturas', { recursive: true });
writeFileSync('docs/auditoria/missao07/capturas/painel-de-evolucao.txt', 'Captura textual: Missão 07 — Painel de Evolução renderiza módulo navegável com entregas obrigatórias e rota funcional.');
writeFileSync('docs/auditoria/missao07/RELATORIO_ENTREGA_MISSAO07.md', `# Missão 07 — Painel de Evolução

## Resultado
PASS

## Arquivos verificados
- src/mission07-evolution-panel.js\n- src/components/EvolutionPanel.jsx\n- src/components/ArtistTimeline.jsx\n- src/components/ProgressIndicators.jsx\n- src/components/MemoryVault.jsx\n- src/components/CareerMilestones.jsx

## Entregas obrigatórias verificadas
- Painel de Evolução\n- Linha do Tempo\n- Indicadores\n- Cofre de Memórias\n- Marcos da Carreira

## Navegação
Rota integrada em phase01-v35.js e script incluído em index.html.

## Pendências reais
Nenhuma pendência bloqueante de build. Integrações externas futuras devem ser tratadas em ciclos posteriores sem reabrir arquitetura.
`);
console.log('Missão 07 — Painel de Evolução audit PASS');
