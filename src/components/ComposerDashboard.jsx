export const COMPOSER_DASHBOARD_SECTIONS = [
  'Letras',
  'Ideias',
  'Áudios',
  'Rascunhos',
  'Histórico',
  'Biblioteca',
  'Versionamento',
];

export function ComposerDashboard() {
  return { title: 'Caderno do Compositor', sections: COMPOSER_DASHBOARD_SECTIONS };
}
