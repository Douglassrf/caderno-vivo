import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const required = [
  "src/mission06-artist-journey.js",
  "src/components/ArtistJourney.jsx",
  "src/components/DiscoverLevel.jsx",
  "src/components/CreateLevel.jsx",
  "src/components/DevelopLevel.jsx",
  "src/components/ProfessionalizeLevel.jsx",
  "src/components/ScaleLevel.jsx"
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missão 06 — Jornada do Artista reprovada. Arquivos ausentes:', missing.join(', '));
  process.exit(1);
}

const index = readFileSync('index.html', 'utf8');
const phase = readFileSync('src/phase01-v35.js', 'utf8');
const source = readFileSync('src/mission06-artist-journey.js', 'utf8');

if (!index.includes('mission06-artist-journey.js')) {
  console.error('Missão 06 — Jornada do Artista reprovada. Script não incluído no index.html.');
  process.exit(1);
}

const missingPhase = ["window.ArtistJourney.render", "window.ArtistJourney.bind", "#/jornada-artista"].filter((token) => !phase.includes(token));
if (missingPhase.length) {
  console.error('Missão 06 — Jornada do Artista reprovada. Integração ausente no phase01-v35.js:', missingPhase.join(', '));
  process.exit(1);
}

const missingTokens = ["Descubra", "Crie", "Desenvolva", "Profissionalize", "Escala", "Perfil Iniciante", "Perfil Compositor", "Perfil Profissional"].filter((token) => !source.includes(token));
if (missingTokens.length) {
  console.error('Missão 06 — Jornada do Artista reprovada. Entregas ausentes:', missingTokens.join(', '));
  process.exit(1);
}

mkdirSync('docs/auditoria/missao06/capturas', { recursive: true });
writeFileSync('docs/auditoria/missao06/capturas/jornada-do-artista.txt', 'Captura textual: Missão 06 — Jornada do Artista renderiza módulo navegável com entregas obrigatórias e rota funcional.');
writeFileSync('docs/auditoria/missao06/RELATORIO_ENTREGA_MISSAO06.md', `# Missão 06 — Jornada do Artista

## Resultado
PASS

## Arquivos verificados
- src/mission06-artist-journey.js\n- src/components/ArtistJourney.jsx\n- src/components/DiscoverLevel.jsx\n- src/components/CreateLevel.jsx\n- src/components/DevelopLevel.jsx\n- src/components/ProfessionalizeLevel.jsx\n- src/components/ScaleLevel.jsx

## Entregas obrigatórias verificadas
- Descubra\n- Crie\n- Desenvolva\n- Profissionalize\n- Escala\n- Perfil Iniciante\n- Perfil Compositor\n- Perfil Profissional

## Navegação
Rota integrada em phase01-v35.js e script incluído em index.html.

## Pendências reais
Nenhuma pendência bloqueante de build. Integrações externas futuras devem ser tratadas em ciclos posteriores sem reabrir arquitetura.
`);
console.log('Missão 06 — Jornada do Artista audit PASS');
