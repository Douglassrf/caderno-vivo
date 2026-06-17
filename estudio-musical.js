/* estudio-musical.js — UI unificada em index.html + app.js; API helper sem substituir DOM */
(function () {
  'use strict';

  async function generateMusic(payload) {
    var r = await fetch('/api/generate-music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    var d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Falha ao gerar música');
    return d;
  }

  window.EstudioMusical = { generateMusic: generateMusic };
})();
