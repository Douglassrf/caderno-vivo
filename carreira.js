/* carreira.js — stats de carreira; UI principal fica em index.html + app.js */
(function () {
  'use strict';

  var STORAGE_KEY = 'caderno-vivo-state-v5';

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
    var concluidas = obrasList.filter(function (obra) {
      return /final|conclu|public|lanç|lanc|registr/i.test(String((obra && obra.status) || ''));
    }).length;
    var emProducao = obrasList.filter(function (obra) {
      var production = obra && obra.production && obra.production.stage;
      return /produção|produc|andamento|constru|pronta para guia|gravada/i.test(String((obra && (obra.status || obra.productionStage)) || production || ''));
    }).length;
    var xp = obras * 40 + concluidas * 120 + emProducao * 60;
    var xpMax = 1000;
    var nivel = Math.max(1, Math.floor(xp / xpMax) + 1);
    return { obras: obras || 0, concluidas: concluidas || 0, emProducao: emProducao || 0, nivel: nivel || 1, xp: xp || 0, xpMax: xpMax };
  }

  window.CarreiraDoArtista = { getStats: getStats };
})();
