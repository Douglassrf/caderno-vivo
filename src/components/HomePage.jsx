export const HOME_BUTTONS = [
  { icon: '✍️', label: 'Caderno do Compositor', route: '#/caderno', modes: ['beginner', 'composer', 'professional'] },
  { icon: '🎵', label: 'Criar Música', route: '#/criar-musica', modes: ['beginner', 'professional'] },
  { icon: '🎼', label: 'Minhas Obras', route: '#/minhas-obras', modes: ['beginner', 'composer', 'professional'] },
  { icon: '✨', label: 'Maestro IA', route: '#/maestro-ia', modes: ['composer', 'professional'] },
  { icon: '⚙️', label: 'Profissional', route: '#/profissional', modes: ['professional'] },
];

export function HomePage({ mode = 'beginner' } = {}) {
  const visibleButtons = HOME_BUTTONS.filter((item) => item.modes.includes(mode));
  return { mode, visibleButtons };
}
