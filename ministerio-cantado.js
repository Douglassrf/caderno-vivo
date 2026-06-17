/* ministerio-cantado.js — chat Maestro; UI em index.html, lógica /api/chat aqui */
(function () {
  'use strict';

  var history = [];

  function sanitize(str) {
    var d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  function toast(m, t) {
    if (window.CvButtons && window.CvButtons.toast) window.CvButtons.toast(m, t || 'ok');
  }

  function injectCSS() {
    if (document.getElementById('maestro-styles')) return;
    var s = document.createElement('style');
    s.id = 'maestro-styles';
    s.textContent = '.maestro-msg-user,.maestro-msg-ai{padding:10px 12px;border-radius:12px;margin:8px 0;white-space:pre-wrap}.maestro-msg-user{background:rgba(124,58,237,.22);margin-left:8%}.maestro-msg-ai{background:rgba(0,0,0,.28);border:1px solid var(--cv-border);margin-right:8%}';
    document.head.appendChild(s);
  }

  function render(c) {
    var log = c.querySelector('#maestro-log');
    if (!log) return;
    log.innerHTML = history.map(function (m) {
      return '<div class="' + (m.role === 'user' ? 'maestro-msg-user' : 'maestro-msg-ai') + '">' + sanitize(m.content) + '</div>';
    }).join('');
    log.scrollTop = log.scrollHeight;
  }

  function refresh() {
    var c = document.getElementById('cv-maestro');
    if (c) render(c);
  }

  function add(r, t) {
    history.push({ role: r, content: t });
    history = history.slice(-20);
    refresh();
  }

  function st(t) {
    var e = document.getElementById('maestro-status');
    if (e) e.textContent = t;
  }

  async function send() {
    var input = document.getElementById('maestro-input');
    var btn = document.getElementById('maestro-send');
    var text = (input.value || '').trim();
    if (!text) {
      toast('Digite uma mensagem para o Maestro.', 'aviso');
      return;
    }
    input.value = '';
    add('user', text);
    btn.disabled = true;
    st('Carregando: Maestro pensando...');
    try {
      var r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'Você é o Maestro AI do Caderno Vivo.',
          messages: history.slice(-10),
          temperature: 0.8,
          max_tokens: 1400
        })
      });
      var d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Falha');
      add('assistant', d.content || 'Pronto.');
      st('Sucesso: Maestro respondeu.');
    } catch (e) {
      add('assistant', 'Maestro temporariamente offline. Tente em instantes.');
      st('Erro: Maestro temporariamente offline. Tente em instantes.');
    } finally {
      btn.disabled = false;
      input.focus();
    }
  }

  function bindEvents(c) {
    if (c.dataset.maestroBound === 'true') return;
    c.dataset.maestroBound = 'true';
    c.addEventListener('click', function (e) {
      if (e.target.id === 'maestro-send') send();
      if (e.target.parentElement && e.target.parentElement.id === 'maestro-quick') {
        document.getElementById('maestro-input').value = 'Me ajude com ' + e.target.textContent + ' para esta música: ';
        document.getElementById('maestro-input').focus();
      }
    });
    c.addEventListener('keydown', function (e) {
      if (e.target.id === 'maestro-input' && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  function init() {
    var c = document.getElementById('cv-maestro');
    if (!c || !c.querySelector('#maestro-input')) return;
    injectCSS();
    if (!history.length) add('assistant', 'Bem-vindo ao Maestro AI. Traga uma ideia e eu ajudo a transformar em canção.');
    else render(c);
    bindEvents(c);
  }

  document.addEventListener('cv:navigate', function (e) {
    if (e && e.detail && e.detail.to === 'cv-maestro') init();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.MinistrioCantado = { init: init, render: render, refresh: refresh, bindEvents: bindEvents };
})();
