(function () {
  const KEY = 'caderno-vivo-missao05-professional-v1';
  const WORKS_KEY = 'caderno-vivo-missao03-works-v1';

  const DEFAULT_STATE = {
    registrations: [
      { id: 'reg-1', title: 'Obra inicial', status: 'pendente', protocol: 'sem protocolo', owner: 'Autor principal' },
    ],
    isrcs: [
      { id: 'isrc-1', work: 'Obra inicial', code: 'BR-CV0-26-00001', status: 'reservado' },
    ],
    distributions: [
      { id: 'dist-1', work: 'Obra inicial', platform: 'Distribuição digital', status: 'preparando', releaseDate: '' },
    ],
    licenses: [
      { id: 'lic-1', work: 'Obra inicial', type: 'sincronização', status: 'rascunho', value: 0 },
    ],
    contracts: [
      { id: 'ctr-1', partner: 'Parceiro / editora', scope: 'licenciamento', status: 'rascunho' },
    ],
    royalties: [
      { id: 'roy-1', source: 'Streaming / marketplace', amount: 0, status: 'a receber' },
    ],
    analytics: {
      catalogValue: 0,
      registeredWorks: 0,
      activeContracts: 0,
      monthlyRevenue: 0,
    },
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`; }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : clone(DEFAULT_STATE);
    } catch { return clone(DEFAULT_STATE); }
  }
  function save(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
  function worksCount() {
    try {
      const raw = localStorage.getItem(WORKS_KEY);
      if (!raw) return 0;
      return JSON.parse(raw).works?.length || 0;
    } catch { return 0; }
  }
  function money(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function recompute(state) {
    state.analytics = {
      catalogValue: state.licenses.reduce((sum, item) => sum + Number(item.value || 0), 0),
      registeredWorks: state.registrations.filter((item) => item.status === 'registrado').length,
      activeContracts: state.contracts.filter((item) => item.status === 'ativo').length,
      monthlyRevenue: state.royalties.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    };
    save(state);
    return state;
  }
  function section(title, subtitle, body, action = '') {
    return `<article class="m05-panel"><div class="m05-panel-head"><div><h3>${title}</h3><p>${subtitle}</p></div>${action}</div>${body}</article>`;
  }
  function rows(items, fields) {
    return `<div class="m05-table">${items.map((item) => `<article>${fields.map((field) => `<span><small>${field.label}</small><strong>${item[field.key] ?? '-'}</strong></span>`).join('')}</article>`).join('')}</div>`;
  }
  function render() {
    const state = recompute(load());
    return `
      <section class="m05-professional" data-view="mission05-professional">
        <button class="phase01-back" data-route="#/home" type="button">← Voltar para Home</button>
        <header class="m05-hero">
          <div>
            <p>Missão 05 — Profissional</p>
            <h2>Transforme criação em negócio.</h2>
            <small>Registro autoral, ISRC, distribuição, licenciamento, contratos, analytics e royalties em um ambiente único.</small>
          </div>
          <div class="m05-hero-card"><strong>${worksCount()}</strong><span>obras disponíveis para profissionalização</span></div>
        </header>

        <section class="m05-kpis">
          <article><strong>${state.analytics.registeredWorks}</strong><span>obras registradas</span></article>
          <article><strong>${state.isrcs.length}</strong><span>ISRCs gerenciados</span></article>
          <article><strong>${state.analytics.activeContracts}</strong><span>contratos ativos</span></article>
          <article><strong>${money(state.analytics.catalogValue)}</strong><span>valor licenciado</span></article>
          <article><strong>${money(state.analytics.monthlyRevenue)}</strong><span>royalties mapeados</span></article>
        </section>

        <section class="m05-create-grid">
          <div class="m05-form-card">
            <h3>Novo registro profissional</h3>
            <input data-m05-field="work" placeholder="Nome da obra">
            <input data-m05-field="owner" placeholder="Autor / titular">
            <select data-m05-field="type"><option>Registro autoral</option><option>ISRC</option><option>Distribuição</option><option>Licenciamento</option><option>Contrato</option><option>Royalty</option></select>
            <input data-m05-field="value" type="number" min="0" placeholder="Valor / receita estimada">
            <button data-m05-add type="button">Adicionar ao profissional</button>
          </div>
          <div class="m05-flow-card">
            <h3>Fluxo profissional e Analytics</h3>
            <ol>
              <li>Validar autoria e titulares.</li>
              <li>Gerar ou registrar ISRC.</li>
              <li>Preparar distribuição digital.</li>
              <li>Formalizar licenças e contratos.</li>
              <li>Monitorar analytics, receitas e royalties.</li>
            </ol>
          </div>
        </section>

        <section class="m05-grid">
          ${section('Registro autoral', 'Controle de protocolo, titulares e status de proteção.', rows(state.registrations, [{ label: 'Obra', key: 'title' }, { label: 'Titular', key: 'owner' }, { label: 'Status', key: 'status' }, { label: 'Protocolo', key: 'protocol' }]))}
          ${section('ISRC', 'Gestão de códigos por gravação ou fonograma.', rows(state.isrcs, [{ label: 'Obra', key: 'work' }, { label: 'Código', key: 'code' }, { label: 'Status', key: 'status' }]))}
          ${section('Distribuição', 'Planejamento de lançamento, plataforma e data.', rows(state.distributions, [{ label: 'Obra', key: 'work' }, { label: 'Plataforma', key: 'platform' }, { label: 'Status', key: 'status' }, { label: 'Data', key: 'releaseDate' }]))}
          ${section('Licenciamento', 'Licenças comerciais, sincronização e uso profissional.', rows(state.licenses, [{ label: 'Obra', key: 'work' }, { label: 'Tipo', key: 'type' }, { label: 'Status', key: 'status' }, { label: 'Valor', key: 'value' }]))}
          ${section('Contratos', 'Relações comerciais com artistas, editoras, marcas e parceiros.', rows(state.contracts, [{ label: 'Parceiro', key: 'partner' }, { label: 'Escopo', key: 'scope' }, { label: 'Status', key: 'status' }]))}
          ${section('Royalties', 'Receitas, fontes de pagamento e acompanhamento financeiro.', rows(state.royalties, [{ label: 'Fonte', key: 'source' }, { label: 'Valor', key: 'amount' }, { label: 'Status', key: 'status' }]))}
        </section>
      </section>`;
  }
  function addFromForm(root) {
    const work = root.querySelector('[data-m05-field="work"]')?.value?.trim() || 'Obra sem título';
    const owner = root.querySelector('[data-m05-field="owner"]')?.value?.trim() || 'Autor principal';
    const type = root.querySelector('[data-m05-field="type"]')?.value || 'Registro autoral';
    const value = Number(root.querySelector('[data-m05-field="value"]')?.value || 0);
    const state = load();
    if (type === 'Registro autoral') state.registrations.unshift({ id: uid('reg'), title: work, owner, status: 'registrado', protocol: `CV-${Date.now()}` });
    if (type === 'ISRC') state.isrcs.unshift({ id: uid('isrc'), work, code: `BR-CV0-26-${String(state.isrcs.length + 1).padStart(5, '0')}`, status: 'ativo' });
    if (type === 'Distribuição') state.distributions.unshift({ id: uid('dist'), work, platform: 'Distribuição digital', status: 'em distribuição', releaseDate: new Date().toISOString().slice(0, 10) });
    if (type === 'Licenciamento') state.licenses.unshift({ id: uid('lic'), work, type: 'licença comercial', status: 'ativo', value });
    if (type === 'Contrato') state.contracts.unshift({ id: uid('ctr'), partner: owner, scope: work, status: 'ativo' });
    if (type === 'Royalty') state.royalties.unshift({ id: uid('roy'), source: work, amount: value, status: 'recebido' });
    recompute(state);
    location.hash = '#/profissional';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
  function bind(root) {
    root.querySelectorAll('[data-m05-add]').forEach((button) => button.addEventListener('click', () => addFromForm(root)));
  }
  window.ProfessionalSuite = { render, bind, load, save };
}());
