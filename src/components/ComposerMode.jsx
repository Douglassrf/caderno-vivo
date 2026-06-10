export const COMPOSER_MODE = {
  id: 'composer',
  label: 'Modo Compositor',
  visibleRoutes: ['#/caderno', '#/minhas-obras', '#/maestro-ia'],
  goal: 'Organizar repertório, evoluir letras e chamar a IA apenas quando necessário.'
};

export function ComposerMode() {
  return COMPOSER_MODE;
}
