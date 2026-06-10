import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'index.html',
  'styles.css',
  'src/phase01-v35.js',
  'src/routes/AppRoutes.jsx',
  'src/components/HomePage.jsx',
  'src/components/FloatingButton.jsx',
  'src/components/ComposerDashboard.jsx',
  'src/components/ComposerHome.jsx',
  'src/components/BeginnerMode.jsx',
  'src/components/ComposerMode.jsx',
  'src/components/ProfessionalMode.jsx',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error('Missing required Fase 01 files:', missing.join(', '));
  process.exit(1);
}

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('src/phase01-v35.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const checks = [
  ['phase script loaded', html.includes('src/phase01-v35.js')],
  ['Home principal', js.includes('Caderno Vivo V3.5')],
  ['Caderno do Compositor', js.includes('Caderno do Compositor')],
  ['Criar Música', js.includes('Criar Música')],
  ['Minhas Obras', js.includes('Minhas Obras')],
  ['Maestro IA', js.includes('Maestro IA')],
  ['Profissional', js.includes('Profissional')],
  ['Botão flutuante +', js.includes('phase01Fab')],
  ['Perfil Iniciante', js.includes('Modo Iniciante')],
  ['Perfil Compositor', js.includes('Modo Compositor')],
  ['Perfil Profissional', js.includes('Modo Profissional')],
  ['Navegação por rotas', js.includes('location.hash')],
  ['CSS Fase 01', css.includes('phase01-root')],
];
const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error('Fase 01 audit failed:', failed.join(', '));
  process.exit(1);
}
console.log('FASE 01 V3.5 AUDIT PASS');
console.log(JSON.stringify({ requiredFiles, checks: checks.map(([name]) => name) }, null, 2));
