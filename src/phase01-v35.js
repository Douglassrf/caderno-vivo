(function () {
  const ROUTES = {
    home: '#/home',
    caderno: '#/caderno',
    criar: '#/criar-musica',
    obras: '#/minhas-obras',
    maestro: '#/maestro-ia',
    profissional: '#/profissional',
    jornada: '#/jornada-artista',
    evolucao: '#/painel-evolucao',
    conquistas: '#/conquistas-reais',
  };

  const MODES = {
    beginner: {
      label: 'Modo Iniciante',
      description: 'Mostra apenas o essencial: Caderno, Criar Música e Minhas Obras.',
      allowed: ['caderno', 'criar', 'obras'],
    },
    composer: {
      label: 'Modo Compositor',
      description: 'Foco no escritório criativo: Caderno, Minhas Obras e Maestro IA.',
      allowed: ['caderno', 'obras', 'maestro'],
    },
    professional: {
      label: 'Modo Profissional',
      description: 'Libera todas as áreas: criação, IA, catálogo e profissionalização.',
      allowed: ['caderno', 'criar', 'obras', 'maestro', 'profissional'],
    },
  };

  const CARDS = [
    { key: 'caderno', icon: '✍️', title: 'Caderno do Compositor', text: 'Guarde letras, ideias, áudios, rascunhos, histórico, biblioteca e versões.', route: ROUTES.caderno },
    { key: 'criar', icon: '🎵', title: 'Criar Música', text: 'Transforme ideias, letras e rascunhos em músicas completas.', route: ROUTES.criar },
    { key: 'obras', icon: '🎼', title: 'Minhas Obras', text: 'Gerencie catálogo, status, timeline, versões e repertório.', route: ROUTES.obras },
    { key: 'maestro', icon: '✨', title: 'Maestro IA', text: 'Chame a IA para melhorar letra, refrão, harmonia, melodia e estrutura.', route: ROUTES.maestro },
    { key: 'profissional', icon: '⚙️', title: 'Profissional', text: 'Registro, direitos, ISRC, distribuição, licenciamento e analytics.', route: ROUTES.profissional },
  ];

  const ACTIONS = [
    { label: 'Nova Ideia', route: '#/caderno?acao=ideia' },
    { label: 'Nova Letra', route: '#/caderno?acao=letra' },
    { label: 'Novo Áudio', route: '#/caderno?acao=audio' },
    { label: 'Nova Música', route: '#/criar-musica?acao=musica' },
    { label: 'Nova Obra', route: '#/minhas-obras?acao=obra' },
    { label: 'Ver Jornada', route: '#/jornada-artista' },
    { label: 'Ver Evolução', route: '#/painel-evolucao' },
    { label: 'Ver Conquistas', route: '#/conquistas-reais' },
  ];

  function getMode() {
    return localStorage.getItem('caderno-vivo-user-mode') || 'beginner';
  }

  function setMode(mode) {
    localStorage.setItem('caderno-vivo-user-mode', mode);
    if (mode === 'beginner') location.hash = '#/perfil/iniciante';
    else if (mode === 'composer') location.hash = '#/perfil/compositor';
    else location.hash = '#/perfil/profissional';
  }

  function normalizeRoute() {
    const raw = location.hash || ROUTES.home;
    const route = raw.split('?')[0];
    if (route.includes('perfil/iniciante')) return 'profile-beginner';
    if (route.includes('perfil/compositor')) return 'profile-composer';
    if (route.includes('perfil/profissional')) return 'profile-professional';
    if (route.includes('caderno')) return 'caderno';
    if (route.includes('criar-musica')) return 'criar';
    if (route.includes('minhas-obras')) return 'obras';
    if (route.includes('maestro-ia')) return 'maestro';
    if (route.includes('profissional')) return 'profissional';
    return 'home';
  }

  function go(route) {
    location.hash = route;
  }

  function activeActionHint() {
    const query = location.hash.split('?')[1] || '';
    const params = new URLSearchParams(query);
    const action = params.get('acao');
    if (!action) return '';
    const map = {
      ideia: 'Ação rápida: registrar uma nova ideia no Caderno do Compositor.',
      letra: 'Ação rápida: iniciar uma nova letra.',
      audio: 'Ação rápida: adicionar novo áudio ou gravação.',
      musica: 'Ação rápida: criar nova música.',
      obra: 'Ação rápida: criar nova obra no catálogo.',
    };
    return `<div class="phase01-alert">${map[action] || 'Ação rápida selecionada.'}</div>`;
  }

  function mount() {
    const legacy = document.querySelector('.app-shell');
    if (!legacy) return;
    if (document.getElementById('phase01Root')) return;
    const root = document.createElement('div');
    root.id = 'phase01Root';
    root.className = 'phase01-root';
    legacy.parentNode.insertBefore(root, legacy);
    legacy.classList.add('legacy-app-shell');
    render();
    window.addEventListener('hashchange', render);
  }

  function modeButtons(mode) {
    return Object.entries(MODES).map(([id, item]) => `
      <button class="phase01-mode ${mode === id ? 'active' : ''}" data-mode="${id}" type="button">
        <strong>${item.label}</strong><span>${item.description}</span>
      </button>
    `).join('');
  }

  function homeCards(mode) {
    const allowed = MODES[mode].allowed;
    return CARDS.map((card) => {
      const locked = !allowed.includes(card.key);
      return `
        <button class="phase01-card ${locked ? 'locked' : ''}" data-route="${card.route}" ${locked ? 'disabled' : ''} type="button">
          <span class="phase01-icon">${card.icon}</span>
          <strong>${card.title}</strong>
          <small>${card.text}</small>
          ${locked ? '<em>Disponível no modo Profissional</em>' : '<em>Abrir</em>'}
        </button>
      `;
    }).join('');
  }

  function moduleView(key) {
    const data = {
      caderno: {
        icon: '✍️', title: 'Caderno do Compositor', subtitle: 'Seu escritório criativo sem distração.',
        items: ['Letras', 'Ideias', 'Áudios', 'Rascunhos', 'Histórico', 'Biblioteca', 'Versionamento'],
        cta: 'Abrir painel completo do compositor',
      },
      criar: {
        icon: '🎵', title: 'Criar Música', subtitle: 'Transforme ideia, letra ou áudio em composição.',
        items: ['Nova Música', 'Letra', 'Refrão', 'Ponte', 'Harmonia', 'Melodia', 'Arranjo'],
        cta: 'Começar criação musical',
      },
      obras: {
        icon: '🎼', title: 'Minhas Obras', subtitle: 'Catálogo, status, timeline, versões e repertório.',
        items: ['Em construção', 'Quase pronta', 'Finalizada', 'Lançada', 'Arquivada', 'Dossiê', 'Checklist'],
        cta: 'Abrir gestão de obras',
      },
      maestro: {
        icon: '✨', title: 'Maestro IA', subtitle: 'A IA aparece apenas quando chamada.',
        items: ['Melhorar letra', 'Melhorar refrão', 'Criar harmonia', 'Criar melodia', 'Transformar ideia em música'],
        cta: 'Chamar Maestro IA',
      },

      'jornada-artista': {
        icon: '🧭', title: 'Jornada do Artista', subtitle: 'Descubra, Crie, Desenvolva, Profissionalize e Escala.',
        items: ['Descubra', 'Crie', 'Desenvolva', 'Profissionalize', 'Escala'],
        cta: 'Abrir jornada guiada',
      },
      'painel-evolucao': {
        icon: '📈', title: 'Painel de Evolução', subtitle: 'Linha do tempo, indicadores, memórias e marcos da carreira.',
        items: ['Linha do tempo', 'Indicadores', 'Cofre de Memórias', 'Marcos'],
        cta: 'Abrir painel de evolução',
      },
      'conquistas-reais': {
        icon: '🏆', title: 'Conquistas Reais', subtitle: 'Marcos artísticos, profissionais, financeiros e de legado.',
        items: ['Criação', 'Profissionais', 'Financeiras', 'Legado', 'Certificados'],
        cta: 'Abrir mural de conquistas',
      },
      profissional: {
        icon: '⚙️', title: 'Profissional', subtitle: 'Transforme criação em negócio.',
        items: ['Registro', 'Direitos autorais', 'ISRC', 'Distribuição', 'Licenciamento', 'Analytics', 'Royalties'],
        cta: 'Abrir área profissional',
      },
    }[key];
    if (key === 'caderno' && window.ComposerNotebook) {
      return window.ComposerNotebook.render();
    }
    if (key === 'obras' && window.WorksCatalog) {
      return window.WorksCatalog.render();
    }
    if (key === 'maestro' && window.MaestroAI) {
      return window.MaestroAI.render();
    }
    if (key === 'profissional' && window.ProfessionalSuite) {
      return window.ProfessionalSuite.render();
    }

    if (key === 'jornada-artista' && window.ArtistJourney) {
      return window.ArtistJourney.render();
    }
    if (key === 'painel-evolucao' && window.EvolutionPanel) {
      return window.EvolutionPanel.render();
    }
    if (key === 'conquistas-reais' && window.AchievementsWall) {
      return window.AchievementsWall.render();
    }

    return `
      <section class="phase01-module" data-view="${key}">
        ${activeActionHint()}
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <div class="phase01-module-hero"><span>${data.icon}</span><div><h2>${data.title}</h2><p>${data.subtitle}</p></div></div>
        <div class="phase01-feature-grid">
          ${data.items.map((item) => `<article><strong>${item}</strong><small>Rota funcional da Fase 01</small></article>`).join('')}
        </div>
        <div class="phase01-link-panel">
          <button class="primary-action" id="phase01OpenLegacy" type="button">${data.cta}</button>
          <p>Esta rota está ativa e conectada ao sistema existente. Os módulos internos continuam preservados.</p>
        </div>
      </section>
    `;
  }

  function profileView(type) {
    const map = {
      'profile-beginner': ['beginner', 'Modo Iniciante', ['Caderno do Compositor', 'Criar Música', 'Minhas Obras']],
      'profile-composer': ['composer', 'Modo Compositor', ['Caderno do Compositor', 'Minhas Obras', 'Maestro IA']],
      'profile-professional': ['professional', 'Modo Profissional', ['Caderno do Compositor', 'Criar Música', 'Minhas Obras', 'Maestro IA', 'Profissional']],
    };
    const [modeId, title, visible] = map[type];
    localStorage.setItem('caderno-vivo-user-mode', modeId);
    return `
      <section class="phase01-module" data-view="${type}">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <div class="phase01-module-hero"><span>👤</span><div><h2>${title}</h2><p>${MODES[modeId].description}</p></div></div>
        <div class="phase01-feature-grid">
          ${visible.map((item) => `<article><strong>${item}</strong><small>Visível para este perfil</small></article>`).join('')}
        </div>
      </section>
    `;
  }

  function floatingButton() {
    return `
      <div class="phase01-floating">
        <button class="phase01-fab" id="phase01Fab" type="button">+</button>
        <div class="phase01-floating-menu" id="phase01FloatingMenu">
          ${ACTIONS.map((item) => `<button data-route="${item.route}" type="button">${item.label}</button>`).join('')}
        </div>
      </div>
    `;
  }

  function render() {
    const root = document.getElementById('phase01Root');
    const legacy = document.querySelector('.legacy-app-shell');
    if (!root || !legacy) return;
    const mode = getMode();
    const route = normalizeRoute();
    const showLegacy = route === 'legacy';
    legacy.classList.toggle('phase01-show-legacy', showLegacy);
    let content = '';
    if (route === 'home') {
      content = `
        <section class="phase01-home" data-view="home">
          <div class="phase01-topline"><span>Caderno Vivo V3.5</span><strong>Fase 01 — MVP Interface</strong></div>
          <header class="phase01-hero">
            <div><p>Da ideia ao legado</p><h1>Escolha seu próximo passo criativo.</h1><small>Interface simplificada com revelação progressiva. As 87 funcionalidades continuam preservadas nos módulos certos.</small></div>
          </header>
          <section class="phase01-modes" aria-label="Perfis de usuário">${modeButtons(mode)}</section>
          <section class="phase01-cards" aria-label="Home principal com cinco botões">${homeCards(mode)}</section>
        </section>
      `;
    } else if (route.startsWith('profile-')) {
      content = profileView(route);
    } else {
      content = moduleView(route);
    }
    root.innerHTML = `${content}${floatingButton()}`;
    bindRootEvents(root);
  }

  function bindRootEvents(root) {
    root.querySelectorAll('[data-route]').forEach((button) => {
      button.addEventListener('click', () => go(button.dataset.route));
    });
    root.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });
    const fab = root.querySelector('#phase01Fab');
    const menu = root.querySelector('#phase01FloatingMenu');
    if (fab && menu) fab.addEventListener('click', () => menu.classList.toggle('open'));
    const openLegacy = root.querySelector('#phase01OpenLegacy');
    if (window.ComposerNotebook) window.ComposerNotebook.bind(root);
    if (window.WorksCatalog) window.WorksCatalog.bind(root);
    if (window.MaestroAI) window.MaestroAI.bind(root);
    if (window.ProfessionalSuite) window.ProfessionalSuite.bind(root);
    if (window.ArtistJourney) window.ArtistJourney.bind(root);
    if (window.EvolutionPanel) window.EvolutionPanel.bind(root);
    if (window.AchievementsWall) window.AchievementsWall.bind(root);
    if (openLegacy) openLegacy.addEventListener('click', () => {
      const legacy = document.querySelector('.legacy-app-shell');
      if (legacy) {
        legacy.classList.add('phase01-show-legacy');
        legacy.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}());
