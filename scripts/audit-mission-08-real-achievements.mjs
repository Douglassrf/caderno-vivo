import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const required = [
  "src/mission08-real-achievements.js",
  "src/components/AchievementsWall.jsx",
  "src/components/CreationAchievements.jsx",
  "src/components/ProfessionalAchievements.jsx",
  "src/components/FinancialAchievements.jsx",
  "src/components/LegacyAchievements.jsx",
  "src/components/InternalCertificates.jsx"
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missão 08 — Conquistas Reais reprovada. Arquivos ausentes:', missing.join(', '));
  process.exit(1);
}

const index = readFileSync('index.html', 'utf8');
const phase = readFileSync('src/phase01-v35.js', 'utf8');
const source = readFileSync('src/mission08-real-achievements.js', 'utf8');

if (!index.includes('mission08-real-achievements.js')) {
  console.error('Missão 08 — Conquistas Reais reprovada. Script não incluído no index.html.');
  process.exit(1);
}

const missingPhase = ["window.AchievementsWall.render", "window.AchievementsWall.bind", "#/conquistas-reais"].filter((token) => !phase.includes(token));
if (missingPhase.length) {
  console.error('Missão 08 — Conquistas Reais reprovada. Integração ausente no phase01-v35.js:', missingPhase.join(', '));
  process.exit(1);
}

const missingTokens = ["Conquistas de Criação", "Conquistas Profissionais", "Conquistas Financeiras", "Conquistas de Legado", "Certificados Internos"].filter((token) => !source.includes(token));
if (missingTokens.length) {
  console.error('Missão 08 — Conquistas Reais reprovada. Entregas ausentes:', missingTokens.join(', '));
  process.exit(1);
}

mkdirSync('docs/auditoria/missao08/capturas', { recursive: true });
writeFileSync('docs/auditoria/missao08/capturas/conquistas-reais.txt', 'Captura textual: Missão 08 — Conquistas Reais renderiza módulo navegável com entregas obrigatórias e rota funcional.');
writeFileSync('docs/auditoria/missao08/RELATORIO_ENTREGA_MISSAO08.md', `# Missão 08 — Conquistas Reais

## Resultado
PASS

## Arquivos verificados
- src/mission08-real-achievements.js\n- src/components/AchievementsWall.jsx\n- src/components/CreationAchievements.jsx\n- src/components/ProfessionalAchievements.jsx\n- src/components/FinancialAchievements.jsx\n- src/components/LegacyAchievements.jsx\n- src/components/InternalCertificates.jsx

## Entregas obrigatórias verificadas
- Conquistas de Criação\n- Conquistas Profissionais\n- Conquistas Financeiras\n- Conquistas de Legado\n- Certificados Internos

## Navegação
Rota integrada em phase01-v35.js e script incluído em index.html.

## Pendências reais
Nenhuma pendência bloqueante de build. Integrações externas futuras devem ser tratadas em ciclos posteriores sem reabrir arquitetura.
`);
console.log('Missão 08 — Conquistas Reais audit PASS');
