(function () {
  const KEY = 'caderno-vivo-missao03-works-v1';
  const NOTEBOOK_KEY = 'caderno-vivo-missao02-notebook-v1';
  const STATUS = ['em construção', 'finalizada', 'arquivada'];
  const DEFAULT_STATE = {
    works: [
      {
        id: 'work-1',
        title: 'Obra inicial',
        status: 'em construção',
        genre: 'Gospel / Autoral',
        currentVersion: 'v1',
        nextAction: 'Revisar letra e anexar áudio guia',
        repertoire: 'principal',
        timeline: [
          { at: new Date().toISOString(), event: 'Obra criada em Minhas Obras' },
        ],
        versions: [
          { id: 'wv-1', name: 'v1', note: 'Primeira versão catalogada' },
        ],
      },
    ],
  };

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

  function notebookSummary() {
    try {
      const raw = localStorage.getItem(NOTEBOOK_KEY);
      if (!raw) return { lyrics: 0, ideas: 0, audios: 0, drafts: 0, versions: 0 };
      const data = JSON.parse(raw);
      return {
        lyrics: data.lyrics?.length || 0,
        ideas: data.ideas?.length || 0,
        audios: data.audios?.length || 0,
        drafts: data.drafts?.length || 0,
        versions: data.versions?.length || 0,
      };
    } catch {
      return { lyrics: 0, ideas: 0, audios: 0, drafts: 0, versions: 0 };
    }
  }

  function addTimeline(work, event) {
    work.timeline = work.timeline || [];
    work.timeline.unshift({ at: new Date().toISOString(), event });
    work.timeline = work.timeline.slice(0, 30);
  }

  function createWork(payload) {
    const state = load();
    const work = {
      id: uid('work'),
      title: payload.title || 'Obra sem título',
      status: payload.status || 'em construção',
      genre: payload.genre || 'Autoral',
      currentVersion: 'v1',
      nextAction: payload.nextAction || 'Definir próxima ação',
      repertoire: payload.repertoire || 'principal',
      timeline: [],
      versions: [{ id: uid('wv'), name: 'v1', note: 'Versão inicial' }],
    };
    addTimeline(work, 'Obra cadastrada no catálogo');
    state.works.unshift(work);
    save(state);
    return work;
  }

  function counts(state) {
    return STATUS.reduce((acc, status) => {
      acc[status] = state.works.filter((work) => work.status === status).length;
      return acc;
    }, {});
  }

  function timeline(work) {
    return (work.timeline || [])
      .map((item) => `<li><strong>${new Date(item.at).toLocaleString('pt-BR')}</strong><span>${item.event}</span></li>`)
      .join('');
  }

  function versions(work) {
    return (work.versions || [])
      .map((item) => `<article class="m03-version"><strong>${item.name}</strong><span>${item.note}</span></article>`)
      .join('');
  }

  function workCard(work) {
    return `
      <article class="m03-work" data-work-id="${work.id}">
        <div>
          <small>${work.status}</small>
          <h3>${work.title}</h3>
          <p>${work.genre} • ${work.repertoire}</p>
        </div>
        <div class="m03-work-actions">
          <button data-m03-status="em construção" data-work-id="${work.id}" type="button">Construção</button>
          <button data-m03-status="finalizada" data-work-id="${work.id}" type="button">Finalizar</button>
          <button data-m03-status="arquivada" data-work-id="${work.id}" type="button">Arquivar</button>
          <button data-m03-version="${work.id}" type="button">Nova versão</button>
        </div>
        <dl>
          <dt>Versão atual</dt><dd>${work.currentVersion}</dd>
          <dt>Próxima ação</dt><dd>${work.nextAction}</dd>
        </dl>
        <details>
          <summary>Timeline da obra</summary>
          <ul class="m03-timeline">${timeline(work)}</ul>
        </details>
        <details>
          <summary>Controle de versões</summary>
          <div class="m03-versions">${versions(work)}</div>
        </details>
      </article>
    `;
  }

  function render() {
    const state = load();
    const c = counts(state);
    const notebook = notebookSummary();
    const totalVersions = state.works.reduce((sum, work) => sum + (work.versions?.length || 0), 0);
    return `
      <section class="m03-catalog" data-view="mission03-works-catalog">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <header class="m03-hero">
          <div>
            <p>Missão 03 — Minhas Obras</p>
            <h2>Catálogo central do artista.</h2>
            <small>Toda criação produzida no sistema termina rastreável em Minhas Obras.</small>
          </div>
          <button class="primary-action" data-m03-export type="button">Exportar catálogo</button>
        </header>
        <section class="m03-stats">
          <article><strong>${state.works.length}</strong><span>Obras no catálogo</span></article>
          <article><strong>${c['em construção'] || 0}</strong><span>Em construção</span></article>
          <article><strong>${c.finalizada || 0}</strong><span>Finalizadas</span></article>
          <article><strong>${c.arquivada || 0}</strong><span>Arquivadas</span></article>
          <article><strong>${totalVersions}</strong><span>Versões rastreadas</span></article>
          <article><strong>${notebook.lyrics + notebook.ideas + notebook.audios + notebook.drafts}</strong><span>Itens vindos do Caderno</span></article>
        </section>
        <section class="m03-new-work">
          <h3>Nova obra no catálogo</h3>
          <div class="m03-form">
            <input data-m03-title placeholder="Título da obra">
            <input data-m03-genre placeholder="Gênero / estilo">
            <select data-m03-status-input>
              <option>em construção</option>
              <option>finalizada</option>
              <option>arquivada</option>
            </select>
            <input data-m03-next placeholder="Próxima ação">
            <button data-m03-create type="button">Cadastrar obra</button>
          </div>
        </section>
        <section class="m03-board">
          ${STATUS.map((status) => `
            <div class="m03-column">
              <h3>${status}</h3>
              ${state.works.filter((work) => work.status === status).map(workCard).join('') || '<p class="m03-empty">Nenhuma obra nesta etapa.</p>'}
            </div>
          `).join('')}
        </section>
      </section>
    `;
  }

  function bind(root) {
    root.querySelectorAll('[data-m03-create]').forEach((button) => {
      button.addEventListener('click', () => {
        const title = root.querySelector('[data-m03-title]')?.value?.trim();
        const genre = root.querySelector('[data-m03-genre]')?.value?.trim();
        const status = root.querySelector('[data-m03-status-input]')?.value;
        const nextAction = root.querySelector('[data-m03-next]')?.value?.trim();
        createWork({ title, genre, status, nextAction });
        location.hash = '#/minhas-obras';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
    root.querySelectorAll('[data-m03-status]').forEach((button) => {
      button.addEventListener('click', () => {
        const state = load();
        const work = state.works.find((item) => item.id === button.dataset.workId);
        if (!work) return;
        work.status = button.dataset.m03Status;
        addTimeline(work, `Status alterado para ${work.status}`);
        save(state);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
    root.querySelectorAll('[data-m03-version]').forEach((button) => {
      button.addEventListener('click', () => {
        const state = load();
        const work = state.works.find((item) => item.id === button.dataset.m03Version);
        if (!work) return;
        const next = (work.versions?.length || 0) + 1;
        work.currentVersion = `v${next}`;
        work.versions = work.versions || [];
        work.versions.unshift({ id: uid('wv'), name: work.currentVersion, note: `Versão ${next} criada no controle de catálogo` });
        addTimeline(work, `Nova versão criada: ${work.currentVersion}`);
        save(state);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
    const exportButton = root.querySelector('[data-m03-export]');
    if (exportButton) {
      exportButton.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minhas-obras-catalogo.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  window.WorksCatalog = { render, bind, load, save, createWork };
}());
