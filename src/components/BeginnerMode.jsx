export const BEGINNER_MODE = {
  id: 'beginner',
  label: 'Modo Iniciante',
  visibleRoutes: ['#/caderno', '#/criar-musica', '#/minhas-obras'],
  goal: 'Guardar ideias, criar músicas e encontrar obras sem complexidade.'
};

export function BeginnerMode() {
  return BEGINNER_MODE;
}
