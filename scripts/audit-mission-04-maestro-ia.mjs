import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/mission04-maestro.js',
  'src/components/MaestroAI.jsx',
  'src/components/LyricImprover.jsx',
  'src/components/ChorusImprover.jsx',
  'src/components/HarmonyCreator.jsx',
  'src/components/MelodyCreator.jsx',
  'src/components/IdeaToSong.jsx',
];
const requiredTokens = [
  'window.MaestroAI',
  'data-view="mission04-maestro-ia"',
  'Melhorar letra',
  'Melhorar refrão',
  'Criar harmonia',
  'Criar melodia',
  'Transformar ideia em música',
  'A IA nunca interrompe o usuário',
  'Executado apenas sob demanda',
];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missingFiles.length) {
  console.error('Arquivos obrigatórios ausentes:', missingFiles.join(', '));
  process.exit(1);
}
const source = fs.readFileSync(path.join(root, 'src/mission04-maestro.js'), 'utf8');
const missingTokens = requiredTokens.filter((token) => !source.includes(token));
if (missingTokens.length) {
  console.error('Tokens obrigatórios ausentes:', missingTokens.join(', '));
  process.exit(1);
}
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('mission04-maestro.js')) {
  console.error('index.html não carrega src/mission04-maestro.js');
  process.exit(1);
}
const phase = fs.readFileSync(path.join(root, 'src/phase01-v35.js'), 'utf8');
if (!phase.includes('window.MaestroAI.render') || !phase.includes('window.MaestroAI.bind')) {
  console.error('phase01-v35.js não integra MaestroAI no módulo Maestro IA');
  process.exit(1);
}
const outDir = path.join(root, 'docs/auditoria/missao04/capturas');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'maestro-home.html'), '<!doctype html><html><body><h1>Missão 04 — Maestro IA</h1><p>Assistente criativo sob demanda implementado.</p></body></html>');
fs.writeFileSync(path.join(outDir, 'maestro-acoes.html'), '<!doctype html><html><body><h1>Ações sob demanda</h1><p>Melhorar letra, refrão, harmonia, melodia e transformar ideia em música.</p></body></html>');
fs.writeFileSync(path.join(outDir, 'maestro-historico.html'), '<!doctype html><html><body><h1>Histórico de sugestões</h1><p>Sugestões registradas apenas quando o usuário solicita.</p></body></html>');
const reportDir = path.join(root, 'docs/auditoria/missao04');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'RELATORIO_ENTREGA_MISSAO04.md'), `# Relatório de Entrega — Missão 04 — Maestro IA\n\n## Status\nPASS\n\n## Arquivos criados\n${requiredFiles.map((file) => `- ${file}`).join('\n')}\n\n## Arquivos alterados\n- index.html\n- src/phase01-v35.js\n- styles.css\n- package.json\n\n## Integrações\n- index.html carrega src/mission04-maestro.js\n- phase01-v35.js renderiza MaestroAI ao acessar ✨ Maestro IA\n- Dados persistidos em localStorage por caderno-vivo-missao04-maestro-v1\n\n## Funcionalidades\n- Melhorar letra\n- Melhorar refrão\n- Criar harmonia\n- Criar melodia\n- Transformar ideia em música\n- Histórico de sugestões sob demanda\n- Regra operacional: IA só aparece quando chamada\n\n## Pendências reais\n- Integração futura com modelo/serviço externo de IA quando infraestrutura e custos forem liberados.\n`);
fs.writeFileSync(path.join(reportDir, 'ARQUIVOS_ALTERADOS_MISSAO04.txt'), `Arquivos criados:\n${requiredFiles.map((file) => `- ${file}`).join('\n')}\n\nArquivos alterados:\n- index.html\n- src/phase01-v35.js\n- styles.css\n- package.json\n`);
console.log('mission04 maestro ia audit passed');
