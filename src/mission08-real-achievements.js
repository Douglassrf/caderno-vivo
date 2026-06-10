(function () {
  const KEY = 'caderno-vivo-missao08-real-achievements-v1';

  const GROUPS = [
    {
      id: 'creation',
      title: 'Conquistas de Criação',
      items: ['Primeira Ideia', 'Primeira Letra', 'Primeira Música', 'Primeira Obra Finalizada', 'Primeiro Álbum'],
    },
    {
      id: 'professional',
      title: 'Conquistas Profissionais',
      items: ['Primeiro Registro', 'Primeiro ISRC', 'Primeira Distribuição', 'Primeiro Contrato', 'Primeira Licença'],
    },
    {
      id: 'financial',
      title: 'Conquistas Financeiras',
      items: ['Primeiro Royalty', 'Primeira Venda', 'Primeira Monetização', 'Primeiros 100 Reais', 'Primeiros 1.000 Reais', 'Primeiros 10.000 Reais'],
    },
    {
      id: 'legacy',
      title: 'Conquistas de Legado',
      items: ['100 Ideias Criadas', '100 Letras Criadas', '100 Músicas Criadas', '10 Obras Publicadas', '50 Obras Publicadas', '100 Obras Publicadas'],
    },
  ];

  const CERTIFICATES = ['Certificado de Compositor', 'Certificado de Autor', 'Certificado de Artista', 'Certificado de Profissional', 'Certificado de Legado'];

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { unlocked: ['Primeira Ideia'], dates: { 'Primeira Ideia': new Date().toISOString().slice(0, 10) } };
    } catch {
      return { unlocked: ['Primeira Ideia'], dates: { 'Primeira Ideia': new Date().toISOString().slice(0, 10) } };
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function achievement(label, state) {
    const active = state.unlocked.includes(label);
    return `
      <button class="m08-achievement ${active ? 'active' : ''}" data-achievement="${label}" type="button">
        <strong>${active ? '✅' : '○'} ${label}</strong>
        <small>${active ? `Desbloqueada em ${state.dates[label] || 'data registrada'}` : 'Clique para registrar quando cumprir'}</small>
      </button>
    `;
  }

  function render() {
    const state = load();
    return `
      <section class="m08-achievements" data-view="mission08-real-achievements">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <div class="phase01-module-hero">
          <span>🏆</span>
          <div>
            <h2>Conquistas Reais</h2>
            <p>Marcos profissionais e artísticos da carreira. Sem gamificação infantil: criação, profissão, finanças e legado.</p>
          </div>
        </div>
        <section class="m08-wall">
          ${GROUPS.map((group) => `
            <article class="m08-group">
              <h3>${group.title}</h3>
              <div>${group.items.map((item) => achievement(item, state)).join('')}</div>
            </article>
          `).join('')}
        </section>
        <section class="m08-certificates">
          <h3>Certificados Internos</h3>
          ${CERTIFICATES.map((cert, index) => `<article><strong>${cert}</strong><small>${state.unlocked.length > index * 4 ? 'Elegível / em evolução' : 'Bloqueado até novos marcos'}</small></article>`).join('')}
        </section>
      </section>
    `;
  }

  function bind(root) {
    root.querySelectorAll('[data-achievement]').forEach((button) => {
      button.addEventListener('click', () => {
        const state = load();
        const label = button.dataset.achievement;
        if (!state.unlocked.includes(label)) {
          state.unlocked.push(label);
          state.dates[label] = new Date().toISOString().slice(0, 10);
        }
        save(state);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }

  window.AchievementsWall = { render, bind, GROUPS, CERTIFICATES };
}());
