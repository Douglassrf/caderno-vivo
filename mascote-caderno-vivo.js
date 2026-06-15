/* =========================================================
   MASCOTE DO CADERNO VIVO — Cifra Musical Assistente
   Arquivo: mascote-caderno-vivo.js
   Adicione ao final do <body> do index.html:
   <script src="mascote-caderno-vivo.js"></script>
   ========================================================= */

(function () {
  'use strict';

  /* ---- MENSAGENS DO MASCOTE ---- */
  const DICAS = [
    { gatilho: 'idle', msg: 'Ei, tô aqui! 🎵 Clica em "+ Nova obra" pra começar sua primeira composição.' },
    { gatilho: 'idle', msg: 'Você sabia? Cada ideia que você salva no Cofre de Frases pode virar uma música completa.' },
    { gatilho: 'idle', msg: 'Tem uma melodia na cabeça? Usa a "Captura rápida" — é pra isso que ela existe!' },
    { gatilho: 'idle', msg: 'Preenche o Tom e o BPM da obra. Isso ajuda na hora de chamar um produtor.' },
    { gatilho: 'idle', msg: 'Já salvou uma versão da letra hoje? Cada versão é um checkpoint da sua criatividade.' },
    { gatilho: 'idle', msg: 'O Mentor Criativo consegue completar um trecho da sua letra em segundos. Testa aí!' },
    { gatilho: 'idle', msg: 'Você pode exportar backup das suas obras. Melhor manter tudo salvo, né?' },
    { gatilho: 'idle', msg: 'Adiciona um áudio de referência na obra — mesmo que seja um áudio do WhatsApp!' },
  ];

  const FLUXO_TUTORIAL = [
    '👋 Oi! Eu sou o **Dó**, mascote do Caderno Vivo!\nVou te guiar pelos primeiros passos. Pode contar comigo!',
    '📝 **Passo 1 — Crie uma obra**\nClica no botão **"+ Nova obra"** na barra lateral esquerda.\nDê um título pra sua música — pode ser qualquer coisa, mesmo que provisório.',
    '✍️ **Passo 2 — Escreva a letra**\nNo painel central, você encontra o campo **"Letra e anotações"**.\nEscreva versos, ideias, refrões — qualquer coisa que vier na cabeça.',
    '💾 **Passo 3 — Salve uma versão**\nClica em **"Salvar versão da letra"**.\nIsso cria um checkpoint da sua criação. Você pode voltar a versões antigas quando quiser.',
    '🧠 **Passo 4 — Use o Mentor Criativo**\nEle fica logo abaixo da letra.\nEscolha o modo, a parte da música e clica em **"Gerar sugestão"**.',
    '🎼 **Passo 5 — Organize os blocos**\nUse os **"Blocos de composição"** para separar Intro, Verso, Refrão e Ponte.\nIsso deixa a estrutura da música mais clara.',
    '🚀 **Você está pronto!**\nO Caderno Vivo tem muito mais: videoclipe, adaptação internacional, dossiê criativo e muito mais.\nExplore sem medo — tô aqui se precisar de ajuda! 🎵',
  ];

  /* ---- ESTADO ---- */
  let tutorialEtapa = parseInt(localStorage.getItem('cv-mascote-tutorial') || '0', 10);
  let tutorialConcluido = localStorage.getItem('cv-mascote-done') === '1';
  let mascoteAberto = false;
  let idleTimer = null;
  let ultimaMensagemIdle = -1;
  let digitandoTimer = null;

  /* ---- CRIAR DOM ---- */
  function criarMascote() {
    const style = document.createElement('style');
    style.textContent = `
      /* Mascote container */
      #cv-mascote {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        font-family: Inter, Segoe UI, Arial, sans-serif;
      }

      /* Balão de fala */
      #cv-balao {
        background: #fffcf5;
        border: 1.5px solid #c9a05a;
        border-radius: 14px 14px 4px 14px;
        padding: 14px 16px;
        max-width: 280px;
        min-width: 200px;
        box-shadow: 0 4px 24px rgba(80,60,20,.16);
        font-size: 13.5px;
        line-height: 1.55;
        color: #1c1710;
        display: none;
        position: relative;
        animation: cvBalooPop .2s cubic-bezier(.34,1.56,.64,1);
      }
      #cv-balao.visible { display: block; }
      #cv-balao strong { color: #8a5f28; }

      #cv-balao-fechar {
        position: absolute;
        top: 6px; right: 8px;
        background: none; border: none;
        font-size: 15px; color: #a08060;
        cursor: pointer; line-height: 1;
        padding: 0 2px;
      }
      #cv-balao-fechar:hover { color: #5a3010; }

      #cv-balao-texto { margin: 0 18px 0 0; }

      /* Botões de ação no balão */
      #cv-balao-acoes {
        display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;
      }
      .cv-btn-acao {
        background: #f0e3cb; color: #8a5f28;
        border: 1px solid #c9a05a; border-radius: 20px;
        padding: 5px 12px; font-size: 12px; font-weight: 700;
        cursor: pointer; transition: all .12s;
      }
      .cv-btn-acao:hover { background: #b08040; color: #fff; border-color: #b08040; }
      .cv-btn-acao.primary { background: #b08040; color: #fff; border-color: #b08040; }
      .cv-btn-acao.primary:hover { background: #8a5f28; }

      /* Input de chat */
      #cv-chat-area {
        margin-top: 8px;
        display: none;
      }
      #cv-chat-area.visible { display: flex; gap: 6px; }
      #cv-chat-input {
        flex: 1; border: 1px solid #c9a05a; border-radius: 20px;
        background: #fff; color: #1c1710; padding: 7px 12px;
        font-size: 13px; outline: none; font-family: inherit;
      }
      #cv-chat-input:focus { border-color: #8a5f28; box-shadow: 0 0 0 2px rgba(176,128,64,.15); }
      #cv-chat-enviar {
        background: #b08040; color: #fff; border: none;
        border-radius: 20px; padding: 7px 14px;
        font-size: 13px; font-weight: 700; cursor: pointer;
      }
      #cv-chat-enviar:hover { background: #8a5f28; }

      /* Indicador digitando */
      #cv-digitando {
        font-size: 12px; color: #a08060; font-style: italic;
        margin-top: 4px; display: none;
      }
      #cv-digitando.visible { display: block; }

      /* Avatar — cifra musical */
      #cv-avatar {
        width: 56px; height: 56px;
        background: linear-gradient(135deg, #b08040, #8a5f28);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 16px rgba(176,128,64,.4);
        cursor: pointer;
        transition: transform .15s, box-shadow .15s;
        position: relative;
        border: 3px solid #f0e3cb;
        user-select: none;
      }
      #cv-avatar:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(176,128,64,.5); }
      #cv-avatar:active { transform: scale(.96); }
      #cv-avatar svg { width: 30px; height: 30px; }

      /* Notificação no avatar */
      #cv-notif {
        position: absolute; top: -2px; right: -2px;
        width: 14px; height: 14px; border-radius: 50%;
        background: #e03030; border: 2px solid #fff;
        display: none;
      }
      #cv-notif.visible { display: block; }

      /* Pulsação quando tem mensagem nova */
      #cv-avatar.pulsar { animation: cvPulsar 1.4s ease infinite; }
      @keyframes cvPulsar {
        0%, 100% { box-shadow: 0 4px 16px rgba(176,128,64,.4); }
        50% { box-shadow: 0 4px 28px rgba(176,128,64,.75); }
      }

      @keyframes cvBalooPop {
        from { opacity: 0; transform: scale(.85) translateY(8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }

      /* Nome do mascote */
      #cv-nome {
        font-size: 10px; font-weight: 700; color: #fff;
        position: absolute; bottom: -16px; left: 50%;
        transform: translateX(-50%);
        white-space: nowrap; letter-spacing: .04em;
        text-shadow: 0 1px 3px rgba(0,0,0,.3);
      }

      @media (max-width: 600px) {
        #cv-mascote { bottom: 12px; right: 12px; }
        #cv-balao { max-width: 240px; font-size: 13px; }
      }
    `;
    document.head.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.id = 'cv-mascote';
    wrapper.innerHTML = `
      <div id="cv-balao">
        <button id="cv-balao-fechar" title="Fechar">✕</button>
        <div id="cv-balao-texto"></div>
        <div id="cv-digitando">Dó está pensando...</div>
        <div id="cv-balao-acoes"></div>
        <div id="cv-chat-area">
          <input id="cv-chat-input" type="text" placeholder="Pergunte ao Dó..." maxlength="200">
          <button id="cv-chat-enviar">➤</button>
        </div>
      </div>
      <div id="cv-avatar" title="Falar com o Dó">
        <span id="cv-notif"></span>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Cifra musical estilizada -->
          <circle cx="10" cy="22" r="4" fill="rgba(255,255,255,.9)"/>
          <circle cx="22" cy="20" r="4" fill="rgba(255,255,255,.9)"/>
          <line x1="14" y1="22" x2="14" y2="6" stroke="rgba(255,255,255,.9)" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="26" y1="20" x2="26" y2="4" stroke="rgba(255,255,255,.9)" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="14" y1="6" x2="26" y2="4" stroke="rgba(255,255,255,.9)" stroke-width="2" stroke-linecap="round"/>
          <!-- Olhinhos expressivos -->
          <circle cx="8" cy="20" r="1.2" fill="#8a5f28"/>
          <circle cx="20" cy="18" r="1.2" fill="#8a5f28"/>
          <!-- Sorriso -->
          <path d="M7 23.5 Q9 25.5 11 23.5" stroke="#8a5f28" stroke-width="1.2" stroke-linecap="round" fill="none"/>
        </svg>
        <span id="cv-nome">Dó ♪</span>
      </div>
    `;
    document.body.appendChild(wrapper);
  }

  /* ---- FORMATAR TEXTO (markdown simples) ---- */
  function formatarTexto(texto) {
    return texto
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  /* ---- MOSTRAR MENSAGEM ---- */
  function mostrarMensagem(texto, acoes, mostrarChat) {
    const balao = document.getElementById('cv-balao');
    const textoEl = document.getElementById('cv-balao-texto');
    const acoesEl = document.getElementById('cv-balao-acoes');
    const chatArea = document.getElementById('cv-chat-area');
    const digitando = document.getElementById('cv-digitando');

    textoEl.innerHTML = formatarTexto(texto);
    acoesEl.innerHTML = '';
    digitando.classList.remove('visible');

    if (acoes && acoes.length) {
      acoes.forEach(a => {
        const btn = document.createElement('button');
        btn.className = `cv-btn-acao${a.primary ? ' primary' : ''}`;
        btn.textContent = a.label;
        btn.addEventListener('click', a.acao);
        acoesEl.appendChild(btn);
      });
    }

    if (mostrarChat) {
      chatArea.classList.add('visible');
    } else {
      chatArea.classList.remove('visible');
    }

    balao.classList.add('visible');
    mascoteAberto = true;

    const avatar = document.getElementById('cv-avatar');
    const notif = document.getElementById('cv-notif');
    avatar.classList.remove('pulsar');
    notif.classList.remove('visible');
  }

  function fecharBalao() {
    document.getElementById('cv-balao').classList.remove('visible');
    mascoteAberto = false;
  }

  function mostrarDigitando() {
    document.getElementById('cv-digitando').classList.add('visible');
    document.getElementById('cv-balao').classList.add('visible');
    mascoteAberto = true;
  }

  function esconderDigitando() {
    document.getElementById('cv-digitando').classList.remove('visible');
  }

  /* ---- NOTIFICAR (avatar pisca) ---- */
  function notificar() {
    if (mascoteAberto) return;
    const avatar = document.getElementById('cv-avatar');
    const notif = document.getElementById('cv-notif');
    avatar.classList.add('pulsar');
    notif.classList.add('visible');
  }

  /* ---- TUTORIAL PASSO A PASSO ---- */
  function mostrarEtapaTutorial(etapa) {
    if (etapa >= FLUXO_TUTORIAL.length) {
      tutorialConcluido = true;
      localStorage.setItem('cv-mascote-done', '1');
      mostrarMensagem(
        '🎉 Tutorial concluído!\nAgora você conhece o básico. Pode perguntar qualquer coisa — é só clicar em mim!',
        [
          { label: 'Obrigado, Dó!', primary: true, acao: fecharBalao },
          { label: 'Fazer uma pergunta', acao: () => mostrarChat() },
        ],
        false
      );
      return;
    }
    tutorialEtapa = etapa;
    localStorage.setItem('cv-mascote-tutorial', String(etapa));

    const acoes = [];
    if (etapa < FLUXO_TUTORIAL.length - 1) {
      acoes.push({ label: 'Próximo →', primary: true, acao: () => mostrarEtapaTutorial(etapa + 1) });
      acoes.push({ label: 'Pular tutorial', acao: () => { tutorialConcluido = true; localStorage.setItem('cv-mascote-done', '1'); fecharBalao(); } });
    } else {
      acoes.push({ label: 'Concluir! 🎉', primary: true, acao: () => mostrarEtapaTutorial(etapa + 1) });
    }

    mostrarMensagem(
      `**${etapa + 1}/${FLUXO_TUTORIAL.length}** \n\n${FLUXO_TUTORIAL[etapa]}`,
      acoes,
      false
    );
  }

  /* ---- CHAT COM IA ---- */
  function mostrarChat() {
    mostrarMensagem(
      '🎵 Pode perguntar à vontade!\nEx: "Como gravo uma música?", "O que é ISRC?", "Como uso o Mentor Criativo?"',
      [],
      true
    );
    setTimeout(() => document.getElementById('cv-chat-input')?.focus(), 100);
  }

  async function enviarPergunta(pergunta) {
    if (!pergunta.trim()) return;
    mostrarDigitando();

    const prompt = `Você é o Dó, mascote assistente do aplicativo "Caderno Vivo" — uma ferramenta web para compositores e músicos organizarem suas músicas, letras, áudios, videoclipes e carreira musical.

O usuário fez a seguinte pergunta:
"${pergunta}"

Responda de forma amigável, direta e curta (máximo 3 parágrafos). Use emojis musicais ocasionalmente.

REGRAS OBRIGATÓRIAS — siga sempre:
1. Se for sobre como usar o app, use apenas os nomes reais dos botões e seções: "Nova obra", "Captura rápida", "Mentor Criativo", "Cofre de Frases", "Blocos de composição", "Salvar versão da letra", "Exportar backup", "Dossiê Criativo", "Adaptação Internacional", "Videoclipe Cinematográfico".
2. NUNCA invente funcionalidades que não existem. Se não souber se existe, diga que não sabe.
3. NUNCA diga "está nos planos", "em breve", "vai ter em breve" ou qualquer promessa de roadmap — você não tem essa informação.
4. O Caderno Vivo é um app WEB — não tem versão nativa na App Store ou Google Play. Não diga "por enquanto" quando falar isso, pois não há previsão de lançamento de app nativo.
5. Não sabe preços nem planos comerciais exatos — se perguntarem, diga que não tem essa informação e oriente a verificar no site.
6. Não tem integração direta com Spotify, YouTube, redes sociais ou qualquer serviço externo — não invente.
7. Não opine sobre política, religião ou temas alheios ao app e à música.
8. Se não souber algo, seja honesto: "Não tenho essa informação, mas posso te ajudar com [tema do app ou música]".`;

    try {
      const resp = await fetch('/api/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await resp.json();
      const resposta = data.content?.find(b => b.type === 'text')?.text || 'Desculpa, não consegui responder agora. Tenta de novo!';
      esconderDigitando();
      mostrarMensagem(resposta, [
        { label: 'Perguntar mais', acao: () => mostrarChat() },
        { label: 'Fechar', acao: fecharBalao },
      ], false);
    } catch {
      esconderDigitando();
      mostrarMensagem('Ih, perdi a conexão! 😅 Tenta de novo em instantes.', [
        { label: 'Tentar novamente', acao: () => mostrarChat() },
        { label: 'Fechar', acao: fecharBalao },
      ], false);
    }
  }

  /* ---- DICA IDLE ---- */
  function agendarDicaIdle() {
    clearTimeout(idleTimer);
    // Se usuário ficar 90 seg sem interagir e o balão estiver fechado
    idleTimer = setTimeout(() => {
      if (!mascoteAberto && document.visibilityState === 'visible') {
        ultimaMensagemIdle = (ultimaMensagemIdle + 1) % DICAS.length;
        const dica = DICAS[ultimaMensagemIdle];
        notificar();
        // Mostrar balão com dica apenas se não estiver ocupado
        if (!mascoteAberto) {
          mostrarMensagem(
            `💡 ${dica.msg}`,
            [
              { label: 'Entendi!', primary: true, acao: fecharBalao },
              { label: 'Tenho uma dúvida', acao: () => mostrarChat() },
            ],
            false
          );
        }
        agendarDicaIdle(); // reagendar
      }
    }, 90000); // 90 segundos
  }

  /* ---- BIND EVENTOS ---- */
  function bindEventos() {
    // Clique no avatar
    document.getElementById('cv-avatar').addEventListener('click', () => {
      if (mascoteAberto) {
        fecharBalao();
        return;
      }
      if (!tutorialConcluido) {
        mostrarEtapaTutorial(tutorialEtapa);
      } else {
        mostrarMensagem(
          '🎵 Oi! Sou o **Dó**, seu assistente musical.\nPosso responder dúvidas sobre o Caderno Vivo ou sobre música!',
          [
            { label: 'Tirar uma dúvida', primary: true, acao: () => mostrarChat() },
            { label: 'Ver tutorial', acao: () => { tutorialEtapa = 0; mostrarEtapaTutorial(0); } },
            { label: 'Fechar', acao: fecharBalao },
          ],
          false
        );
      }
    });

    // Fechar balão
    document.getElementById('cv-balao-fechar').addEventListener('click', fecharBalao);

    // Enviar pergunta (botão)
    document.getElementById('cv-chat-enviar').addEventListener('click', () => {
      const input = document.getElementById('cv-chat-input');
      const texto = input.value.trim();
      input.value = '';
      if (texto) enviarPergunta(texto);
    });

    // Enviar pergunta (Enter)
    document.getElementById('cv-chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const input = e.target;
        const texto = input.value.trim();
        input.value = '';
        if (texto) enviarPergunta(texto);
      }
    });

    // Resetar timer idle em qualquer interação
    ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(ev => {
      document.addEventListener(ev, () => agendarDicaIdle(), { passive: true });
    });
  }

  /* ---- INICIALIZAR ---- */
  const MENSAGENS_SALA = {
    'cv-home': '🏠 Bem-vindo ao Caderno Vivo! Escolha uma sala para começar sua criação.',
    'cv-escritorio': '✍️ Escritório aberto: organize suas obras, frases e versões com calma.',
    'cv-criar': '🎼 Criar Música: traga uma inspiração e eu fico por perto enquanto a IA compõe.',
    'cv-maestro': '🎙️ Maestro AI: peça rimas, refrões, acordes ou uma revisão da letra.',
    'cv-obras': '📚 Minhas Obras: seu catálogo vivo fica mais forte a cada música salva.',
    'cv-internacional': '🌍 Internacional: adapte sua letra para outros idiomas sem perder emoção.',
    'cv-cinema': '🎬 Cinema Musical: transforme a canção em cenas, planos e storyboard.',
    'cv-carreira': '🚀 Carreira do Artista: acompanhe XP, metas e conquistas do seu caminho musical.'
  };

  function falar(texto, acoes, mostrarChat) {
    if (!document.getElementById('cv-mascote')) init();
    mostrarMensagem(texto, acoes || [{ label: 'Valeu, Dó!', primary: true, acao: fecharBalao }], !!mostrarChat);
  }

  function animar() {
    const avatar = document.getElementById('cv-avatar');
    if (!avatar) return;
    avatar.classList.add('pulsar');
    setTimeout(() => avatar.classList.remove('pulsar'), 1600);
  }

  function seguirSala(sala) {
    const msg = MENSAGENS_SALA[sala] || '🎵 Estou por aqui para ajudar em qualquer sala do Caderno Vivo.';
    animar();
    falar(msg);
  }

  function init() {
    if (document.getElementById('cv-mascote')) return;
    criarMascote();
    bindEventos();
    agendarDicaIdle();

    // Primeira visita: mostrar saudação após 2 segundos
    if (!tutorialConcluido && tutorialEtapa === 0) {
      setTimeout(() => {
        notificar();
        mostrarEtapaTutorial(0);
      }, 2000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('cv:navigate', function(e) {
    if (e && e.detail && e.detail.to) seguirSala(e.detail.to);
  });

  window.MascoteCaderno = { init, falar, animar, seguirSala };
})();
