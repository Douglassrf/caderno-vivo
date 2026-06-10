export const FLOATING_ACTIONS = [
  { label: 'Nova Ideia', route: '#/caderno?acao=ideia' },
  { label: 'Nova Letra', route: '#/caderno?acao=letra' },
  { label: 'Novo Áudio', route: '#/caderno?acao=audio' },
  { label: 'Nova Música', route: '#/criar-musica?acao=musica' },
  { label: 'Nova Obra', route: '#/minhas-obras?acao=obra' },
];

export function FloatingButton() {
  return { actions: FLOATING_ACTIONS };
}
