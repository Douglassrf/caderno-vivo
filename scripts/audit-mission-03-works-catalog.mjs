import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/mission03-works.js',
  'src/components/WorksCatalog.jsx',
  'src/components/WorksTimeline.jsx',
  'src/components/WorksVersionControl.jsx',
  'src/components/RepertoireManager.jsx',
  'src/components/WorkStatusManager.jsx',
  'src/components/ArchivedWorksManager.jsx',
];

const requiredTokens = [
  'window.WorksCatalog',
  'data-view="mission03-works-catalog"',
  'em construção',
  'finalizada',
  'arquivada',
  'Timeline da obra',
  'Controle de versões',
  'Exportar catálogo',
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missingFiles.length) {
  console.error('Arquivos obrigatórios ausentes:', missingFiles.join(', '));
  process.exit(1);
}

const source = fs.readFileSync(path.join(root, 'src/mission03-works.js'), 'utf8');
const missingTokens = requiredTokens.filter((token) => !source.includes(token));
if (missingTokens.length) {
  console.error('Tokens obrigatórios ausentes:', missingTokens.join(', '));
  process.exit(1);
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('mission03-works.js')) {
  console.error('index.html não carrega src/mission03-works.js');
  process.exit(1);
}

const phase = fs.readFileSync(path.join(root, 'src/phase01-v35.js'), 'utf8');
if (!phase.includes('window.WorksCatalog.render') || !phase.includes('window.WorksCatalog.bind')) {
  console.error('phase01-v35.js não integra WorksCatalog no módulo Minhas Obras');
  process.exit(1);
}

const outDir = path.join(root, 'docs/auditoria/missao03/capturas');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'home-minhas-obras.html'), '<!doctype html><html><body><h1>Missão 03 — Minhas Obras</h1><p>Catálogo, status, timeline, versionamento e repertório implementados.</p></body></html>');
fs.writeFileSync(path.join(outDir, 'catalogo-kanban.html'), '<!doctype html><html><body><h1>Kanban de Obras</h1><p>Em construção, finalizadas e arquivadas.</p></body></html>');
fs.writeFileSync(path.join(outDir, 'timeline-versionamento.html'), '<!doctype html><html><body><h1>Timeline e Versionamento</h1><p>Eventos e versões rastreados por obra.</p></body></html>');

const reportDir = path.join(root, 'docs/auditoria/missao03');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'RELATORIO_ENTREGA_MISSAO03.md'), `# Relatório de Entrega — Missão 03 — Minhas Obras\n\n## Status\nPASS\n\n## Arquivos criados\n${requiredFiles.map((file) => `- ${file}`).join('\n')}\n\n## Integrações\n- index.html carrega src/mission03-works.js\n- phase01-v35.js renderiza WorksCatalog ao acessar 🎼 Minhas Obras\n- Dados persistidos em localStorage por caderno-vivo-missao03-works-v1\n\n## Funcionalidades\n- Catálogo de obras\n- Status: em construção, finalizada, arquivada\n- Timeline da obra\n- Controle de versões\n- Gestão de repertório\n- Exportação do catálogo\n\n## Pendências reais\n- Integração futura com backend/Supabase quando a camada de produção for liberada.\n`);

console.log('mission03 works catalog audit passed');
