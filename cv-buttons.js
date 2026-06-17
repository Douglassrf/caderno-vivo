/* cv-buttons.js — toast e ações pontuais da Home (sem handlers fantasma nas salas do app.js) */
(function () {
  'use strict';

  function toast(msg, tipo) {
    tipo = tipo || 'info';
    var cores = {
      info: { bg: '#1e293b', border: '#4a90d9' },
      ok: { bg: '#0f2417', border: '#2e7c52' },
      aviso: { bg: '#1e1a0f', border: '#b08040' },
      erro: { bg: '#1e0f0f', border: '#c0392b' },
      ia: { bg: '#1a0e2e', border: '#7c3aed' }
    };
    var icons = { info: 'i', ok: 'OK', aviso: '!', erro: 'X', ia: 'AI' };
    var c = cores[tipo] || cores.info;
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:' + c.bg + ';border:1.5px solid ' + c.border + ';color:#f1f5f9;border-radius:10px;padding:12px 20px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:99999;max-width:360px;text-align:center;line-height:1.5;font-family:Inter,Arial,sans-serif';
    el.textContent = (icons[tipo] || 'i') + '  ' + msg;
    document.body.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 350);
    }, 3200);
  }

  window.cvToast = toast;

  function emBreve(n) {
    toast('"' + n + '" em desenvolvimento!', 'aviso');
  }

  function ignorarMaestro() {
    var card = document.querySelector('.cv-maestro-row');
    if (card) {
      card.style.opacity = '0';
      setTimeout(function () { card.style.display = 'none'; }, 300);
    }
    toast('Sugestão ignorada.', 'info');
    sessionStorage.setItem('cv-maestro-ignorado', '1');
  }

  function wireHome() {
    var home = document.getElementById('cv-home');
    if (!home) return;
    home.querySelectorAll('button').forEach(function (btn) {
      if (btn._cvWired) return;
      var t = btn.textContent.trim().toLowerCase();
      if (t.indexOf('ignorar por agora') >= 0) {
        btn.addEventListener('click', ignorarMaestro);
        btn._cvWired = true;
      }
      if (t.indexOf('personalizar') >= 0) {
        btn.addEventListener('click', function () { emBreve('Personalizar'); });
        btn._cvWired = true;
      }
    });
  }

  window.CvButtons = { toast: toast };

  function init() {
    wireHome();
    console.log('[CadernoVivo] cv-buttons.js OK (sem handlers fantasma)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
