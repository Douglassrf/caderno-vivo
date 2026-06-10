(function () {
  const KEY = 'caderno-vivo-missao02-notebook-v1';
  const DEFAULT_STATE = {
    lyrics: [{ id: 'lyr-1', title: 'Primeira letra', body: 'Escreva aqui sua letra completa...', tags: 'rascunho' }],
    ideas: [{ id: 'idea-1', title: 'Ideia inicial', body: 'Uma frase, tema ou inspiração rápida.' }],
    audios: [{ id: 'aud-1', title: 'Assobio / melodia', kind: 'voz', link: '' }],
    drafts: [{ id: 'draft-1', title: 'Rascunho de música', status: 'em construção' }],
    versions: [{ id: 'ver-1', title: 'Versão 1', note: 'Primeiro registro salvo no caderno.' }],
    history: [{ id: 'his-1', action: 'Caderno do Compositor iniciado', at: new Date().toISOString() }],
  };

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : structuredClone(DEFAULT_STATE);
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function addHistory(state, action) {
    state.history.unshift({ id: uid('his'), action, at: new Date().toISOString() });
    state.history = state.history.slice(0, 20);
  }

  function card(title, count, text) {
    return `<article class="m02-stat"><strong>${count}</strong><span>${title}</span><small>${text}</small></article>`;
  }

  function list(name, items, renderer) {
    return `<div class="m02-list" data-list="${name}">${items.map(renderer).join('')}</div>`;
  }

  function item(title, body, meta = '') {
    return `<article class="m02-item"><strong>${title}</strong><p>${body || 'Sem conteúdo.'}</p>${meta ? `<small>${meta}</small>` : ''}</article>`;
  }

  function render() {
    const state = load();
    const total = state.lyrics.length + state.ideas.length + state.audios.length + state.drafts.length;
    return `
      <section class="m02-notebook" data-view="mission02-composer-notebook">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <header class="m02-hero">
          <div>
            <p>Missão 02 — Caderno do Compositor</p>
            <h2>Seu escritório pessoal de criação.</h2>
            <small>Guarde letras, ideias, áudios, rascunhos, histórico, biblioteca e versões em um único lugar.</small>
          </div>
          <button class="primary-action" data-m02-export type="button">Exportar memória</button>
        </header>
        <section class="m02-stats">
          ${card('Letras', state.lyrics.length, 'composições escritas')}
          ${card('Ideias', state.ideas.length, 'frases e títulos')}
          ${card('Áudios', state.audios.length, 'voz, guia e assobios')}
          ${card('Rascunhos', state.drafts.length, 'obras em andamento')}
          ${card('Versões', state.versions.length, 'controle criativo')}
          ${card('Itens na biblioteca', total, 'material criativo salvo')}
        </section>
        <section class="m02-grid">
          <article class="m02-panel">
            <h3>📝 Letras</h3>
            <div class="m02-form"><input data-m02-title="lyrics" placeholder="Título da letra"><textarea data-m02-body="lyrics" placeholder="Cole ou escreva a letra"></textarea><button data-m02-add="lyrics" type="button">Salvar letra</button></div>
            ${list('lyrics', state.lyrics, (x) => item(x.title, x.body, x.tags))}
          </article>
          <article class="m02-panel">
            <h3>💡 Ideias</h3>
            <div class="m02-form"><input data-m02-title="ideas" placeholder="Título ou frase"><textarea data-m02-body="ideas" placeholder="Ideia, inspiração, tema ou metáfora"></textarea><button data-m02-add="ideas" type="button">Salvar ideia</button></div>
            ${list('ideas', state.ideas, (x) => item(x.title, x.body))}
          </article>
          <article class="m02-panel">
            <h3>🎙 Áudios</h3>
            <div class="m02-form"><input data-m02-title="audios" placeholder="Nome do áudio"><input data-m02-body="audios" placeholder="Link ou observação"><button data-m02-add="audios" type="button">Salvar áudio</button></div>
            ${list('audios', state.audios, (x) => item(x.title, x.link || 'Registro de áudio catalogado', x.kind))}
          </article>
          <article class="m02-panel">
            <h3>📂 Rascunhos</h3>
            <div class="m02-form"><input data-m02-title="drafts" placeholder="Nome do rascunho"><input data-m02-body="drafts" placeholder="Status ou próxima ação"><button data-m02-add="drafts" type="button">Salvar rascunho</button></div>
            ${list('drafts', state.drafts, (x) => item(x.title, x.status))}
          </article>
          <article class="m02-panel">
            <h3>🔄 Versionamento</h3>
            <div class="m02-form"><input data-m02-title="versions" placeholder="Nome da versão"><textarea data-m02-body="versions" placeholder="O que mudou nesta versão?"></textarea><button data-m02-add="versions" type="button">Salvar versão</button></div>
            ${list('versions', state.versions, (x) => item(x.title, x.note))}
          </article>
          <article class="m02-panel">
            <h3>🕒 Histórico</h3>
            ${list('history', state.history, (x) => item(x.action, new Date(x.at).toLocaleString('pt-BR')))}
          </article>
        </section>
        <section class="m02-library"><h3>📚 Biblioteca Pessoal</h3><p>Busca unificada em letras, ideias, áudios, rascunhos e versões.</p><input data-m02-search placeholder="Buscar por palavra, título ou inspiração"><div data-m02-results></div></section>
      </section>`;
  }

  function bind(root) {
    root.querySelectorAll('[data-m02-add]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.m02Add;
        const title = root.querySelector(`[data-m02-title="${type}"]`)?.value?.trim();
        const body = root.querySelector(`[data-m02-body="${type}"]`)?.value?.trim();
        if (!title && !body) return;
        const state = load();
        const record = { id: uid(type), title: title || 'Sem título' };
        if (type === 'lyrics') Object.assign(record, { body, tags: 'manual' });
        if (type === 'ideas') Object.assign(record, { body });
        if (type === 'audios') Object.assign(record, { link: body, kind: 'voz' });
        if (type === 'drafts') Object.assign(record, { status: body || 'em construção' });
        if (type === 'versions') Object.assign(record, { note: body || 'Nova versão' });
        state[type].unshift(record);
        addHistory(state, `Novo item em ${type}: ${record.title}`);
        save(state);
        location.hash = '#/caderno';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
    const search = root.querySelector('[data-m02-search]');
    const results = root.querySelector('[data-m02-results]');
    if (search && results) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        const state = load();
        const all = [
          ...state.lyrics.map((x) => ['Letra', x.title, x.body]),
          ...state.ideas.map((x) => ['Ideia', x.title, x.body]),
          ...state.audios.map((x) => ['Áudio', x.title, x.link]),
          ...state.drafts.map((x) => ['Rascunho', x.title, x.status]),
          ...state.versions.map((x) => ['Versão', x.title, x.note]),
        ];
        const found = q ? all.filter(([, a, b]) => `${a} ${b}`.toLowerCase().includes(q)) : [];
        results.innerHTML = found.map(([type, a, b]) => `<article class="m02-search-result"><strong>${type}: ${a}</strong><p>${b || ''}</p></article>`).join('') || (q ? '<p>Nenhum item encontrado.</p>' : '');
      });
    }
    const exportButton = root.querySelector('[data-m02-export]');
    if (exportButton) {
      exportButton.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'caderno-do-compositor.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  window.ComposerNotebook = { render, bind, load, save };
}());
