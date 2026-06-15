/*
 * TESTE MANUAL — carreira.js
 * 1. Abrir sala Carreira → ver stats, XP, metas renderizados
 * 2. Abrir Console → window.CarreiraDoArtista deve existir
 * 3. Criar obra em Escritório → voltar para Carreira → stats atualizados
 * 4. Em mobile (380px) → grid deve estar em 2 ou 1 coluna
 * 5. localStorage vazio → fallback visual aparece
 * 6. Injetar texto malicioso no localStorage → não deve renderizar como HTML
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'caderno-vivo-state-v5';

  function injectCSS() {
    if (document.querySelector('.carreira-styles')) return;
    var style = document.createElement('style');
    style.className = 'carreira-styles';
    style.textContent = [
      '.carreira-section{background:rgba(15,10,30,.82);border:1px solid #4c1d95;border-radius:16px;color:#e2e8f0;padding:18px;margin-bottom:16px;box-shadow:0 18px 40px rgba(0,0,0,.18)}',
      '.carreira-section h3{margin:0 0 14px;color:#e2e8f0;font-size:18px}',
      '.carreira-muted{color:#a78bfa;font-size:13px;line-height:1.55}',
      '.carreira-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}',
      '.carreira-card{background:rgba(0,0,0,.28);border:1px solid #4c1d95;border-radius:14px;padding:16px;min-height:92px}',
      '.carreira-card-valor{color:#a78bfa;font-size:34px;font-weight:900;line-height:1;margin-bottom:8px}',
      '.carreira-card-label{color:#e2e8f0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}',
      '.carreira-xp-container{height:14px;background:rgba(0,0,0,.35);border:1px solid #4c1d95;border-radius:999px;overflow:hidden;margin:10px 0 8px}',
      '.carreira-xp-bar{display:block;height:100%;width:0;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:inherit;transition:width .25s ease}',
      '.carreira-conquistas{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}',
      '.carreira-conquista-item{background:rgba(0,0,0,.24);border:1px solid #4c1d95;border-radius:12px;color:#e2e8f0;padding:12px;font-weight:700}',
      '.carreira-conquista-item.is-locked{color:#a78bfa;opacity:.72}',
      '.carreira-metas{display:grid;gap:12px}',
      '.carreira-meta-item{background:rgba(0,0,0,.24);border:1px solid #4c1d95;border-radius:12px;padding:12px;color:#e2e8f0}',
      '.carreira-meta-top{display:flex;justify-content:space-between;gap:12px;margin-bottom:8px;font-weight:700}',
      '.carreira-meta-progress{height:10px;background:rgba(0,0,0,.35);border-radius:999px;overflow:hidden}',
      '.carreira-meta-progress span{display:block;height:100%;width:0;background:#7c3aed;border-radius:inherit;transition:width .25s ease}',
      '.carreira-empty{background:rgba(124,58,237,.12);border:1px dashed #7c3aed;border-radius:14px;color:#e2e8f0;padding:14px;margin-top:14px;text-align:center}',
      '@media (max-width: 768px){.carreira-grid{grid-template-columns:repeat(2,1fr)}.carreira-conquistas{grid-template-columns:repeat(2,1fr)}}',
      '@media (max-width: 480px){.carreira-grid{grid-template-columns:1fr}.carreira-conquistas{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);
  }

  function sanitize(str) {
    var d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function getWorks(state) {
    if (Array.isArray(state.works)) return state.works;
    if (Array.isArray(state.obras)) return state.obras;
    return [];
  }

  function getStats() {
    var state = readState();
    var obrasList = getWorks(state);
    var obras = obrasList.length;
    var concluidas = obrasList.filter(function(obra) {
      return /final|conclu|public|lanç|lanc|registr/i.test(String((obra && obra.status) || ''));
    }).length;
    var emProducao = obrasList.filter(function(obra) {
      var production = obra && obra.production && obra.production.stage;
      return /produção|produc|andamento|constru|pronta para guia|gravada/i.test(String((obra && (obra.status || obra.productionStage)) || production || ''));
    }).length;
    var xp = obras * 40 + concluidas * 120 + emProducao * 60;
    var xpMax = 1000;
    var nivel = Math.max(1, Math.floor(xp / xpMax) + 1);
    var conquistas = [
      { label: 'Primeira obra', unlocked: obras >= 1 },
      { label: 'Catálogo 5+', unlocked: obras >= 5 },
      { label: 'Finalizador', unlocked: concluidas >= 1 },
      { label: 'Produtor ativo', unlocked: emProducao >= 1 },
      { label: 'Discografia 10+', unlocked: obras >= 10 },
      { label: 'Mestre Vivo', unlocked: nivel >= 5 }
    ];
    var metas = [
      { label: 'Criar 3 obras', atual: obras, alvo: 3 },
      { label: 'Concluir 2 obras', atual: concluidas, alvo: 2 },
      { label: 'Produzir 3 faixas', atual: emProducao, alvo: 3 },
      { label: 'Chegar ao nível 5', atual: nivel, alvo: 5 }
    ];
    return { obras: obras || 0, concluidas: concluidas || 0, emProducao: emProducao || 0, nivel: nivel || 1, xp: xp || 0, xpMax: xpMax, conquistas: conquistas, metas: metas };
  }

  function renderUI(container) {
    var body = container.querySelector('.cv-view-body') || container;
    body.innerHTML = '<section class="carreira-section"><div id="car-stats" class="carreira-grid"></div><div id="car-empty" class="carreira-empty" hidden></div></section><section class="carreira-section"><h3>XP de carreira</h3><div class="carreira-xp-container"><span id="car-xp" class="carreira-xp-bar"></span></div><p id="car-level" class="carreira-muted"></p></section><section class="carreira-section"><h3>Conquistas</h3><div id="car-ach" class="carreira-conquistas"></div></section><section class="carreira-section"><h3>Metas</h3><div id="car-goals" class="carreira-metas"></div></section>';
  }

  function statCard(label, value) {
    return '<div class="carreira-card"><div class="carreira-card-valor">' + sanitize(value) + '</div><div class="carreira-card-label">' + sanitize(label) + '</div></div>';
  }

  function render(container, stats) {
    var safeStats = stats || getStats();
    if (!container.querySelector('#car-stats')) renderUI(container);
    var statsEl = container.querySelector('#car-stats');
    var xpEl = container.querySelector('#car-xp');
    var levelEl = container.querySelector('#car-level');
    var achEl = container.querySelector('#car-ach');
    var goalsEl = container.querySelector('#car-goals');
    var emptyEl = container.querySelector('#car-empty');
    if (!statsEl || !xpEl || !levelEl || !achEl || !goalsEl) return;

    statsEl.innerHTML = statCard('Total obras', safeStats.obras) + statCard('Concluídas', safeStats.concluidas) + statCard('Em produção', safeStats.emProducao) + statCard('Nível', safeStats.nivel);
    var pct = Math.max(0, Math.min(100, Math.round((safeStats.xp % safeStats.xpMax) / safeStats.xpMax * 100)));
    xpEl.style.width = pct + '%';
    levelEl.textContent = safeStats.xp + ' XP · faltam ' + (safeStats.xpMax - (safeStats.xp % safeStats.xpMax)) + ' XP para o próximo nível';
    if (emptyEl) {
      emptyEl.hidden = safeStats.obras !== 0;
      emptyEl.innerHTML = sanitize('Comece sua primeira composição para desbloquear conquistas! 🎵');
    }
    achEl.innerHTML = (safeStats.conquistas || []).map(function(item) {
      return '<div class="carreira-conquista-item' + (item.unlocked ? '' : ' is-locked') + '">' + sanitize(item.unlocked ? '🏆 ' : '🔒 ') + sanitize(item.label) + '</div>';
    }).join('');
    goalsEl.innerHTML = (safeStats.metas || []).map(function(meta) {
      var alvo = Number(meta.alvo) || 1;
      var atual = Number(meta.atual) || 0;
      var progress = Math.max(0, Math.min(100, Math.round(atual / alvo * 100)));
      return '<div class="carreira-meta-item"><div class="carreira-meta-top"><span>' + sanitize(meta.label) + '</span><span>' + sanitize(atual + '/' + alvo) + '</span></div><div class="carreira-meta-progress"><span data-progress="' + sanitize(progress) + '"></span></div></div>';
    }).join('');
    goalsEl.querySelectorAll('[data-progress]').forEach(function(bar) {
      bar.style.width = (Number(bar.getAttribute('data-progress')) || 0) + '%';
    });
  }

  function refresh() {
    var container = document.getElementById('cv-carreira');
    if (!container) return;
    render(container, getStats());
  }

  function bindEvents(container) {
    if (!container || container.dataset.carreiraBound === 'true') return;
    container.dataset.carreiraBound = 'true';
  }

  function init() {
    var container = document.getElementById('cv-carreira');
    if (!container) return;
    if (!document.querySelector('.carreira-styles')) injectCSS();
    renderUI(container);
    render(container, getStats());
    bindEvents(container);
  }

  document.addEventListener('cv:navigate', function(e) {
    if (e && e.detail && e.detail.to === 'cv-carreira') init();
  });
  document.addEventListener('cv:state-changed', refresh);
  document.addEventListener('cv:obra-salva', refresh);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 300);
  }

  window.CarreiraDoArtista = { init: init, render: render, refresh: refresh, getStats: getStats, bindEvents: bindEvents };

})();
