(function () {
  const KEY = 'caderno-vivo-missao06-artist-journey-v1';
  const PROFILE_REQUIREMENTS = ['Perfil Iniciante', 'Perfil Compositor', 'Perfil Profissional'];


  const LEVELS = [
    {
      id: 'descubra',
      icon: '🌱',
      title: 'Descubra',
      audience: 'Para quem ainda está transformando inspiração em primeira criação.',
      goal: 'Registrar ideias, frases, títulos, gravações rápidas e usar um Maestro IA iniciante.',
      unlock: 'Registre sua primeira ideia ou gravação.',
      actions: ['Nova ideia', 'Frase rápida', 'Título', 'Gravação rápida', 'Maestro IA iniciante'],
      routes: ['#/caderno?acao=ideia', '#/caderno?acao=frase', '#/caderno?acao=titulo', '#/caderno?acao=audio', '#/maestro-ia?modo=iniciante'],
    },
    {
      id: 'crie',
      icon: '✍️',
      title: 'Crie',
      audience: 'Para quem já começou a compor.',
      goal: 'Desenvolver letras, áudios, rascunhos, estrutura musical, harmonia e melodia.',
      unlock: 'Transforme uma ideia em letra, música ou rascunho.',
      actions: ['Caderno do Compositor', 'Letras', 'Áudios', 'Rascunhos', 'Harmonia e melodia'],
      routes: ['#/caderno', '#/caderno?acao=letra', '#/caderno?acao=audio', '#/caderno?acao=rascunho', '#/criar-musica'],
    },
    {
      id: 'desenvolva',
      icon: '🎼',
      title: 'Desenvolva',
      audience: 'Para quem já possui músicas.',
      goal: 'Organizar obras, versões, biblioteca, revisão e colaboração.',
      unlock: 'Cadastre sua obra em Minhas Obras.',
      actions: ['Minhas Obras', 'Versionamento', 'Biblioteca', 'Revisão', 'Colaboração'],
      routes: ['#/minhas-obras', '#/minhas-obras?acao=versao', '#/caderno?acao=biblioteca', '#/minhas-obras?acao=revisao', '#/minhas-obras?acao=colaboracao'],
    },
    {
      id: 'profissionalize',
      icon: '⚙️',
      title: 'Profissionalize',
      audience: 'Para quem deseja viver de música.',
      goal: 'Preparar registro, direitos autorais, ISRC, licenciamento, contratos e distribuição.',
      unlock: 'Formalize sua primeira obra.',
      actions: ['Registro', 'Direitos autorais', 'ISRC', 'Licenciamento', 'Distribuição'],
      routes: ['#/profissional?acao=registro', '#/profissional?acao=direitos', '#/profissional?acao=isrc', '#/profissional?acao=licenciamento', '#/profissional?acao=distribuicao'],
    },
    {
      id: 'escala',
      icon: '🚀',
      title: 'Escala',
      audience: 'Para quem quer crescer.',
      goal: 'Acompanhar analytics, marketplace, monetização, lançamentos, catálogo e carreira.',
      unlock: 'Lance e acompanhe sua evolução.',
      actions: ['Analytics', 'Marketplace', 'Monetização', 'Lançamentos', 'Gestão de carreira'],
      routes: ['#/profissional?acao=analytics', '#/profissional?acao=marketplace', '#/profissional?acao=royalties', '#/profissional?acao=lancamento', '#/profissional?acao=carreira'],
    },
  ];

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { current: saved.current || 'descubra', completed: saved.completed || [] };
    } catch {
      return { current: 'descubra', completed: [] };
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function visibleLevels(state) {
    const index = Math.max(0, LEVELS.findIndex((level) => level.id === state.current));
    return LEVELS.slice(0, Math.min(LEVELS.length, index + 2));
  }

  function progressPercent(state) {
    const currentIndex = Math.max(0, LEVELS.findIndex((level) => level.id === state.current));
    return Math.round(((currentIndex + state.completed.length * 0.15) / LEVELS.length) * 100);
  }

  function levelCard(level, state) {
    const active = level.id === state.current;
    const done = state.completed.includes(level.id);
    return `
      <article class="m06-level ${active ? 'active' : ''} ${done ? 'done' : ''}">
        <div class="m06-level-head">
          <span>${level.icon}</span>
          <div><h3>${level.title}</h3><p>${level.audience}</p></div>
        </div>
        <p>${level.goal}</p>
        <small>Próximo degrau: ${level.unlock}</small>
        <div class="m06-actions">
          ${level.actions.map((action, index) => `<button data-journey-route="${level.routes[index]}" type="button">${action}</button>`).join('')}
        </div>
        <button class="ghost-button" data-complete-level="${level.id}" type="button">${done ? 'Marco registrado' : 'Marcar avanço'}</button>
      </article>
    `;
  }

  function render() {
    const state = load();
    const visible = visibleLevels(state);
    return `
      <section class="m06-journey" data-view="mission06-artist-journey">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <div class="phase01-module-hero">
          <span>🧭</span>
          <div>
            <h2>Jornada do Artista</h2>
            <p>Descubra → Crie → Desenvolva → Profissionalize → Escala. O usuário vê apenas o próximo degrau.</p>
          </div>
        </div>
        <div class="m06-progress">
          <strong>${progressPercent(state)}%</strong>
          <div><span style="width:${Math.min(100, progressPercent(state))}%"></span></div>
          <small>Nível atual: ${LEVELS.find((level) => level.id === state.current).title}</small>
        </div>
        <div class="m06-levels">${visible.map((level) => levelCard(level, state)).join('')}</div>
      </section>
    `;
  }

  function bind(root) {
    root.querySelectorAll('[data-journey-route]').forEach((button) => {
      button.addEventListener('click', () => { window.location.hash = button.dataset.journeyRoute; });
    });
    root.querySelectorAll('[data-complete-level]').forEach((button) => {
      button.addEventListener('click', () => {
        const state = load();
        const id = button.dataset.completeLevel;
        if (!state.completed.includes(id)) state.completed.push(id);
        const currentIndex = LEVELS.findIndex((level) => level.id === id);
        const next = LEVELS[currentIndex + 1];
        if (next) state.current = next.id;
        save(state);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }

  window.ArtistJourney = { render, bind, LEVELS };
}());
