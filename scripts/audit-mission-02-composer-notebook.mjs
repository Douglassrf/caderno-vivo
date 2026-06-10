import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'src/mission02-notebook.js',
  'src/components/ComposerNotebook.jsx',
  'src/components/LyricsManager.jsx',
  'src/components/IdeasManager.jsx',
  'src/components/AudioManager.jsx',
  'src/components/DraftManager.jsx',
  'src/components/VersionManager.jsx',
];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error('Missing Mission 02 files:', missing.join(', '));
  process.exit(1);
}
const html = fs.readFileSync('index.html', 'utf8');
const phase = fs.readFileSync('src/phase01-v35.js', 'utf8');
const notebook = fs.readFileSync('src/mission02-notebook.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const checks = [
  ['mission script loaded', html.includes('src/mission02-notebook.js')],
  ['caderno route binds notebook', phase.includes('window.ComposerNotebook.render')],
  ['ComposerNotebook global', notebook.includes('window.ComposerNotebook')],
  ['Letras', notebook.includes('Letras')],
  ['Ideias', notebook.includes('Ideias')],
  ['Áudios', notebook.includes('Áudios')],
  ['Rascunhos', notebook.includes('Rascunhos')],
  ['Histórico', notebook.includes('Histórico')],
  ['Biblioteca', notebook.includes('Biblioteca')],
  ['Versionamento', notebook.includes('Versionamento')],
  ['localStorage persistence', notebook.includes('localStorage')],
  ['export memory', notebook.includes('Exportar memória')],
  ['CSS mission02', css.includes('m02-notebook')],
];
const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error('Mission 02 audit failed:', failed.join(', '));
  process.exit(1);
}
console.log('MISSÃO 02 CADERNO DO COMPOSITOR AUDIT PASS');
console.log(JSON.stringify({ requiredFiles, checks: checks.map(([name]) => name) }, null, 2));
