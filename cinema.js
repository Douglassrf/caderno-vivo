/* cinema.js — UI unificada em index.html + app.js; helpers opcionais sem substituir DOM */
(function () {
  'use strict';

  async function generateRoteiro(payload) {
    var r = await fetch('/api/cinema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    var d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Falha ao gerar roteiro');
    return d;
  }

  window.Cinema = { generateRoteiro: generateRoteiro };
})();
