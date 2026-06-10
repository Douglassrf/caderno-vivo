(function () {
  const KEY = 'caderno-vivo-missao04-maestro-v1';
  const NOTEBOOK_KEY = 'caderno-vivo-missao02-notebook-v1';
  const WORKS_KEY = 'caderno-vivo-missao03-works-v1';

  const DEFAULT_STATE = {
    requests: [
      {
        id: 'maestro-1',
        type: 'Melhorar letra',
        input: 'Quero lapidar uma letra sobre esperança.',
        output: 'Sugestão: fortaleça o refrão com uma imagem central e repita a frase-chave no encerramento.',
        at: new Date().toISOString(),
      },
    ],
    settings: {
      mode: 'sob demanda',
      interruptionPolicy: 'A IA nunca interrompe o usuário. Só aparece quando chamada.',
    },
  };

  const ACTIONS = [
    {
      id: 'improve-lyric',
      title: 'Melhorar letra',
      description: 'Refina versos, clareza, emoção, métrica e força poética sem apagar a voz do compositor.',
      button: 'Melhorar letra',
    },
    {
      id: 'improve-chorus',
      title: 'Melhorar refrão',
      description: 'Aumenta memorização, repetição estratégica e impacto emocional do refrão.',
      button: 'Melhorar refrão',
    },
    {
      id: 'create-harmony',
      title: 'Criar harmonia',
      description: 'Sugere progressões harmônicas compatíveis com o clima, gênero e intenção da obra.',
      button: 'Criar harmonia',
    },
    {
      id: 'create-melody',
      title: 'Criar melodia',
      description: 'Propõe caminhos melódicos, dinâmica e direção vocal a partir da letra ou ideia.',
      button: 'Criar melodia',
    },
    {
      id: 'idea-to-song',
      title: 'Transformar ideia em música',
      description: 'Converte uma ideia inicial em estrutura musical com verso, refrão, ponte e direção artística.',
      button: 'Transformar em música',
    },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : clone(DEFAULT_STATE);
    } catch {
      return clone(DEFAULT_STATE);
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function loadNotebook() {
    try {
      return JSON.parse(localStorage.getItem(NOTEBOOK_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function loadWorks() {
    try {
      return JSON.parse(localStorage.getItem(WORKS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function contextSummary() {
    const notebook = loadNotebook();
    const works = loadWorks();
    return {
      lyrics: notebook.lyrics?.length || 0,
      ideas: notebook.ideas?.length || 0,
      audios: notebook.audios?.length || 0,
      drafts: notebook.drafts?.length || 0,
      works: works.works?.length || 0,
    };
  }

  function buildOutput(type, input) {
    const base = input?.trim() || 'Sem material informado. Use uma ideia, letra ou rascunho do Caderno do Compositor.';
    const map = {
      'Melhorar letra': `Versão orientada: mantenha a ideia central de "${base.slice(0, 80)}" e reforce imagens concretas, cortes de excesso e uma frase de fechamento mais memorável.`,
      'Melhorar refrão': `Refrão sugerido: escolha uma frase-chave de "${base.slice(0, 80)}", repita com variação emocional e encerre com uma palavra forte para gravação.`,
      'Criar harmonia': `Harmonia sugerida: comece em I–V–vi–IV para tom pop/gospel, experimente vi–IV–I–V para clima esperançoso e marque o refrão com abertura maior.`,
      'Criar melodia': `Melodia sugerida: inicie com notas curtas no verso, suba a tessitura no pré-refrão e abra o refrão com nota longa na palavra principal.`,
      'Transformar ideia em música': `Estrutura sugerida: Intro curta → Verso 1 → Pré-refrão → Refrão forte → Verso 2 → Ponte emocional → Refrão final. Tema-base: ${base.slice(0, 120)}.`,
    };
    return map[type] || 'Sugestão criativa gerada sob demanda.';
  }

  function request(type, input) {
    const state = load();
    const record = {
      id: uid('maestro'),
      type,
      input: input || '',
      output: buildOutput(type, input),
      at: new Date().toISOString(),
    };
    state.requests.unshift(record);
    state.requests = state.requests.slice(0, 50);
    save(state);
    return record;
  }

  function historyList(state) {
    return state.requests.map((item) => `
      <article class="m04-history-item">
        <small>${new Date(item.at).toLocaleString('pt-BR')} • ${item.type}</small>
        <p><strong>Entrada:</strong> ${item.input || 'Sem entrada manual.'}</p>
        <p><strong>Saída:</strong> ${item.output}</p>
      </article>
    `).join('');
  }

  function render() {
    const state = load();
    const summary = contextSummary();
    return `
      <section class="m04-maestro" data-view="mission04-maestro-ia">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <header class="m04-hero">
          <div>
            <p>Missão 04 — Maestro IA</p>
            <h2>Assistente criativo sob demanda.</h2>
            <small>A IA nunca invade o processo. Ela só aparece quando o compositor chamar.</small>
          </div>
          <div class="m04-policy"><strong>Regra ativa</strong><span>${state.settings.interruptionPolicy}</span></div>
        </header>

        <section class="m04-context">
          <article><strong>${summary.lyrics}</strong><span>Letras no Caderno</span></article>
          <article><strong>${summary.ideas}</strong><span>Ideias registradas</span></article>
          <article><strong>${summary.audios}</strong><span>Áudios salvos</span></article>
          <article><strong>${summary.drafts}</strong><span>Rascunhos</span></article>
          <article><strong>${summary.works}</strong><span>Obras no catálogo</span></article>
        </section>

        <section class="m04-workbench">
          <div class="m04-input-panel">
            <h3>Chamar Maestro IA</h3>
            <textarea data-m04-input placeholder="Cole uma letra, ideia, refrão, tema ou pedido criativo. Ex: Quero uma música gospel sobre esperança."></textarea>
            <div class="m04-actions">
              ${ACTIONS.map((action) => `<button data-m04-action="${action.title}" type="button">${action.button}</button>`).join('')}
            </div>
          </div>
          <div class="m04-action-grid">
            ${ACTIONS.map((action) => `
              <article>
                <strong>${action.title}</strong>
                <p>${action.description}</p>
                <small>Executado apenas sob demanda</small>
              </article>
            `).join('')}
          </div>
        </section>

        <section class="m04-output">
          <h3>Histórico de sugestões</h3>
          ${historyList(state) || '<p>Nenhuma solicitação registrada.</p>'}
        </section>
      </section>
    `;
  }

  function bind(root) {
    root.querySelectorAll('[data-m04-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const input = root.querySelector('[data-m04-input]')?.value || '';
        request(button.dataset.m04Action, input);
        location.hash = '#/maestro-ia';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }

  window.MaestroAI = { render, bind, load, save, request };
}());
