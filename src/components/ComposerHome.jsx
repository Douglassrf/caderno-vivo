export const COMPOSER_HOME_CARDS = [
  { title: 'Letras', description: 'Guarde e organize letras completas ou em desenvolvimento.' },
  { title: 'Ideias', description: 'Registre frases, títulos, versos, refrões e inspirações.' },
  { title: 'Áudios', description: 'Catalogue melodias, assobios, gravações e rascunhos de voz.' },
  { title: 'Rascunhos', description: 'Mantenha músicas inacabadas em um espaço seguro.' },
  { title: 'Histórico', description: 'Revise tudo que foi criado ao longo do tempo.' },
  { title: 'Biblioteca', description: 'Acesse sua biblioteca pessoal criativa.' },
  { title: 'Versionamento', description: 'Compare versões e preserve a evolução da obra.' },
];

export function ComposerHome() {
  return { title: 'Escritório do Compositor', cards: COMPOSER_HOME_CARDS };
}
