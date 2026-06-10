(function () {
  const KEY = 'caderno-vivo-missao07-evolution-panel-v1';
  const REQUIRED_LABEL = 'Indicadores';

  const DEFAULT = {
    ideas: 12,
    lyrics: 5,
    songs: 3,
    registeredWorks: 1,
    publishedWorks: 1,
    monetizedWorks: 0,
    memories: [
      { label: 'Primeira ideia', value: 'Uma canção sobre recomeço', date: '2026-06-10' },
      { label: 'Primeiro áudio', value: 'Assobio gravado no celular', date: '2026-06-10' },
    ],
    timeline: [
      ['Ideia', 'Primeira inspiração registrada'],
      ['Letra', 'Verso e refrão organizados'],
      ['Música', 'Estrutura musical iniciada'],
      ['Obra', 'Catálogo criado em Minhas Obras'],
      ['Registro', 'Próximo passo profissional'],
      ['Lançamento', 'Aguardando publicação'],
      ['Receita', 'Aguardando primeira monetização'],
    ],
  };

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || DEFAULT;
    } catch {
      return DEFAULT;
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function indicator(label, value, target) {
    const pct = Math.min(100, Math.round((value / target) * 100));
    return `<article class="m07-indicator"><strong>${value}</strong><span>${label}</span><div><i style="width:${pct}%"></i></div><small>Meta inicial: ${target}</small></article>`;
  }

  function render() {
    const state = load();
    return `
      <section class="m07-evolution" data-view="mission07-evolution-panel">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <div class="phase01-module-hero">
          <span>📈</span>
          <div>
            <h2>Painel de Evolução</h2>
            <p>Acompanhe a carreira do artista da primeira ideia até obras, registros, lançamentos e receitas.</p>
          </div>
        </div>
        <section class="m07-grid">
          ${indicator('Ideias registradas', state.ideas, 100)}
          ${indicator('Letras criadas', state.lyrics, 100)}
          ${indicator('Músicas concluídas', state.songs, 100)}
          ${indicator('Obras registradas', state.registeredWorks, 10)}
          ${indicator('Obras publicadas', state.publishedWorks, 10)}
          ${indicator('Obras monetizadas', state.monetizedWorks, 5)}
        </section>
        <section class="m07-panel">
          <h3>Linha do Tempo</h3>
          <div class="m07-timeline">${state.timeline.map(([step, text]) => `<article><strong>${step}</strong><p>${text}</p></article>`).join('')}</div>
        </section>
        <section class="m07-panel">
          <h3>Cofre de Memórias</h3>
          <div class="m07-memories">${state.memories.map((item) => `<article><strong>${item.label}</strong><p>${item.value}</p><small>${item.date}</small></article>`).join('')}</div>
          <form id="m07MemoryForm" class="m07-form">
            <input name="label" placeholder="Marco da carreira" required>
            <input name="value" placeholder="Descrição da memória" required>
            <button type="submit">Guardar memória</button>
          </form>
        </section>
        <section class="m07-panel">
          <h3>Marcos da Carreira</h3>
          <div class="m07-milestones">
            <span>Explorador</span><span>Compositor</span><span>Autor</span><span>Artista</span><span>Profissional</span><span>Legado</span>
          </div>
        </section>
      </section>
    `;
  }

  function bind(root) {
    const form = root.querySelector('#m07MemoryForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const state = load();
      const data = new FormData(form);
      state.memories.unshift({ label: data.get('label'), value: data.get('value'), date: new Date().toISOString().slice(0, 10) });
      save(state);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  }

  window.EvolutionPanel = { render, bind };
}());
