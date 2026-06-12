/* ================================================================
   MINISTÉRIO CANTADO — Caderno Vivo
   Arquivo: ministerio-cantado.js
   Adicione no index.html antes de </body>:
   <link rel="stylesheet" href="ministerio-cantado.css">
   <script src="ministerio-cantado.js"></script>
   ================================================================ */

(function () {
  'use strict';

  /* ── FREQUÊNCIAS CURATIVAS (Solfeggio) ─────────────────────────
     O usuário não vê esses valores — apenas sente o efeito.
     Cada intenção de ministração mapeia para uma frequência real.
  ─────────────────────────────────────────────────────────────── */
  const FREQUENCIAS = {
    adoracao:      { hz: 528,  nome: 'Adoração profunda',   intencao: 'cura e transformação do coração'     },
    paz:           { hz: 432,  nome: 'Paz e equilíbrio',    intencao: 'sintonia natural e descanso interior' },
    profecia:      { hz: 639,  nome: 'Profético',           intencao: 'conexão e abertura espiritual'        },
    cura:          { hz: 528,  nome: 'Cura da alma',        intencao: 'restauração e renovação'              },
    encorajamento: { hz: 396,  nome: 'Encorajamento',       intencao: 'libertação de medo e culpa'          },
    fabula:        { hz: 741,  nome: 'Fábula / Parábola',   intencao: 'despertar consciência e clareza'      },
    missional:     { hz: 963,  nome: 'Missional',           intencao: 'conexão com o propósito mais alto'   },
    poema:         { hz: 432,  nome: 'Poema lírico',        intencao: 'beleza, leveza e contemplação'        },
  };

  /* ── CIFRAS POR INTENÇÃO ────────────────────────────────────── */
  const CIFRAS = {
    adoracao:      ['Ré', 'Sol', 'Lá m', 'Mi m'],
    paz:           ['Dó', 'Fá', 'Sol', 'Lá m'],
    profecia:      ['Mi m', 'Lá m', 'Ré', 'Sol'],
    cura:          ['Fá', 'Dó', 'Sol', 'Lá m'],
    encorajamento: ['Sol', 'Ré', 'Mi m', 'Dó'],
    fabula:        ['Lá m', 'Mi m', 'Ré', 'Sol'],
    missional:     ['Ré', 'Mi m', 'Sol', 'Lá m'],
    poema:         ['Dó', 'Lá m', 'Fá', 'Sol'],
  };

  /* ── MARCAÇÕES DE INTENSIDADE ───────────────────────────────── */
  const MARCACOES = [
    { tipo: 'intro',   label: 'Introdução',     cor: '#7b9e87', desc: 'voz suave · tom em repouso · deixar o silêncio falar' },
    { tipo: 'subida',  label: 'Crescimento',    cor: '#b08040', desc: 'intensidade sobe · voz ganha corpo · emoção aumenta' },
    { tipo: 'pico',    label: 'Pico',           cor: '#a33428', desc: 'voz plena · explosão emocional · povo responde' },
    { tipo: 'pausa',   label: 'Pausa sagrada',  cor: '#5a7a9e', desc: 'silêncio intencional · deixar cair · respirar junto' },
    { tipo: 'pouso',   label: 'Pouso',          cor: '#7b9e87', desc: 'voz desce · suavidade · encerramento com paz' },
  ];

  /* ── ESTADO ─────────────────────────────────────────────────── */
  const SK = 'cv-ministerio-v1';
  let state = carregarEstado();
  let audioCtx = null;
  let droneNode = null;
  let gainNode = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let gravando = false;
  let droneAtivo = false;
  let ministerioGerado = null;

  function carregarEstado() {
    try {
      const raw = localStorage.getItem(SK);
      return raw ? JSON.parse(raw) : estadoInicial();
    } catch { return estadoInicial(); }
  }

  function estadoInicial() {
    return {
      ministerios: [],
      ultimoModo: 'audio',
      ultimaIntencao: 'adoracao',
    };
  }

  function salvarEstado() {
    localStorage.setItem(SK, JSON.stringify(state));
  }

  function uid() {
    return `mc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  /* ── ÁUDIO: DRONE DE FREQUÊNCIA ─────────────────────────────── */
  function iniciarDrone(hz) {
    if (droneAtivo) pararDrone();
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      droneNode = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      droneNode.type = 'sine';
      droneNode.frequency.setValueAtTime(hz, audioCtx.currentTime);

      // Adiciona harmônicos sutis para enriquecer o som
      const harmonico = audioCtx.createOscillator();
      harmonico.type = 'sine';
      harmonico.frequency.setValueAtTime(hz * 2, audioCtx.currentTime);
      const gainHarmonico = audioCtx.createGain();
      gainHarmonico.gain.setValueAtTime(0.08, audioCtx.currentTime);
      harmonico.connect(gainHarmonico);
      gainHarmonico.connect(audioCtx.destination);
      harmonico.start();

      // Fade in suave — 3 segundos para entrar
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 3);

      droneNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      droneNode.start();
      droneAtivo = true;
    } catch (e) {
      console.warn('AudioContext não disponível:', e);
    }
  }

  function pararDrone() {
    if (!droneAtivo || !gainNode || !audioCtx) return;
    try {
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
      setTimeout(() => {
        try { droneNode?.stop(); audioCtx?.close(); } catch {}
        droneNode = null; gainNode = null; audioCtx = null;
      }, 2200);
    } catch {}
    droneAtivo = false;
  }

  /* ── GRAVAÇÃO DE VOZ ─────────────────────────────────────────── */
  async function iniciarGravacao() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => { if (e.data.size) audioChunks.push(e.data); };
      mediaRecorder.onstop = processarAudioGravado;
      mediaRecorder.start();
      gravando = true;
      atualizarBotaoGravacao(true);
    } catch (e) {
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  }

  function pararGravacao() {
    if (mediaRecorder && gravando) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
      gravando = false;
      atualizarBotaoGravacao(false);
    }
  }

  function processarAudioGravado() {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const preview = document.getElementById('mc-audio-preview');
    if (preview) {
      preview.src = url;
      preview.classList.remove('mc-hidden');
    }
    const status = document.getElementById('mc-audio-status');
    if (status) status.textContent = 'Áudio gravado! Agora clique em "Estruturar Ministração".';
    // Guardar blob para envio
    window._mcAudioBlob = blob;
  }

  function atualizarBotaoGravacao(ativo) {
    const btn = document.getElementById('mc-btn-gravar');
    if (!btn) return;
    if (ativo) {
      btn.innerHTML = '<span class="mc-dot mc-pulsar"></span> Parar gravação';
      btn.classList.add('mc-gravando');
    } else {
      btn.innerHTML = '<span class="mc-dot"></span> Gravar ministração';
      btn.classList.remove('mc-gravando');
    }
  }

  /* ── GERAÇÃO DO ROTEIRO VIA IA ───────────────────────────────── */
  async function gerarMinisterio() {
    const modo = document.querySelector('.mc-modo-btn.mc-sel')?.dataset.modo || 'texto';
    const intencao = document.querySelector('.mc-intencao-btn.mc-sel')?.dataset.intencao || 'adoracao';
    const freq = FREQUENCIAS[intencao];
    const cifras = CIFRAS[intencao];

    let conteudo = '';
    if (modo === 'texto') {
      conteudo = document.getElementById('mc-texto-input')?.value?.trim();
      if (!conteudo) { alert('Escreva sua mensagem antes de estruturar.'); return; }
    } else if (modo === 'musica') {
      conteudo = `Tema: ${freq.intencao}. Tom base: ${cifras[0]}.`;
    } else {
      // modo áudio — usa transcrição simulada ou blob
      conteudo = document.getElementById('mc-texto-base')?.value?.trim()
        || `Ministração sobre ${freq.intencao} gravada em voz.`;
    }

    const output = document.getElementById('mc-output');
    const btnGerar = document.getElementById('mc-btn-gerar');
    if (output) output.innerHTML = '<div class="mc-loading">Maestro está estruturando sua ministração<span class="mc-dots"></span></div>';
    if (btnGerar) { btnGerar.disabled = true; btnGerar.textContent = 'Gerando...'; }

    const prompt = `Você é um especialista em ministração cantada e pregação musical. Sua missão é transformar o conteúdo abaixo em um ROTEIRO DE MINISTRAÇÃO CANTADA estruturado.

CONTEÚDO DA MINISTRAÇÃO:
"${conteudo}"

INTENÇÃO: ${freq.intencao}
TOM BASE: ${cifras[0]}
CIFRAS DISPONÍVEIS: ${cifras.join(' — ')}

Crie um roteiro de ministração cantada com exatamente este formato para cada bloco:

[INTRO]
(indicação: tom suave, voz em repouso)
CIFRA: ${cifras[0]}
"[linha da ministração]"
↳ [instrução de entrega: pausa, intensidade, olhar, respiração]

[CRESCIMENTO]
(indicação: emoção sobe, voz ganha corpo)
CIFRA: ${cifras[1]}
"[linha da ministração]"
↳ [instrução de entrega]

[PICO]
(indicação: voz plena, explosão emocional)
CIFRA: ${cifras[2]}
"[linha da ministração — mais poderosa]"
↳ [instrução de entrega]

[PAUSA SAGRADA]
(indicação: silêncio intencional — 4 a 8 segundos)
↳ deixar o silêncio ministrar

[POUSO]
(indicação: voz suave, encerramento com paz)
CIFRA: ${cifras[0]}
"[linha final — traz paz e fechamento]"
↳ [instrução de entrega]

REGRAS ABSOLUTAS:
- Preserve as PALAVRAS ORIGINAIS do conteúdo fornecido — não invente frases novas
- Reorganize e distribua o conteúdo nos blocos certos
- As instruções de entrega são práticas e corporais (ex: "respirar fundo antes", "olhar para o povo", "abaixar o microfone")
- Tom sempre positivo, curador, que traz paz e esperança
- Máximo 2 linhas de texto por bloco
- Responda APENAS o roteiro, sem introdução ou explicação`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await resp.json();
      const texto = data.content?.find(b => b.type === 'text')?.text || '';

      ministerioGerado = {
        id: uid(),
        conteudo,
        intencao,
        frequencia: freq.hz,
        roteiro: texto,
        criadoEm: new Date().toISOString(),
      };

      renderizarRoteiro(texto, freq, cifras);
      salvarMinisterio(ministerioGerado);

    } catch (e) {
      if (output) output.innerHTML = '<div class="mc-erro">Não foi possível conectar ao Maestro. Verifique sua conexão.</div>';
    }

    if (btnGerar) { btnGerar.disabled = false; btnGerar.textContent = '✨ Estruturar Ministração'; }
  }

  function renderizarRoteiro(texto, freq, cifras) {
    const output = document.getElementById('mc-output');
    if (!output) return;

    // Formatar blocos com cores e ícones
    let html = `<div class="mc-roteiro">`;

    const blocos = texto.split(/\[([A-ZÇÃÁÉÍÓÚ\s]+)\]/g).filter(Boolean);
    const icones = { 'INTRO': '🌅', 'CRESCIMENTO': '🔥', 'PICO': '⚡', 'PAUSA SAGRADA': '🕊️', 'POUSO': '🌙' };
    const cores = { 'INTRO': 'mc-bloco-verde', 'CRESCIMENTO': 'mc-bloco-dourado', 'PICO': 'mc-bloco-vermelho', 'PAUSA SAGRADA': 'mc-bloco-azul', 'POUSO': 'mc-bloco-verde' };

    let i = 0;
    while (i < blocos.length) {
      const tituloRaw = blocos[i].trim();
      const conteudoBloco = blocos[i + 1] || '';
      if (icones[tituloRaw]) {
        const classeBloco = cores[tituloRaw] || 'mc-bloco-padrao';
        const icone = icones[tituloRaw];
        // formatar linhas
        const linhas = conteudoBloco.split('\n').filter(l => l.trim()).map(l => {
          l = l.trim();
          if (l.startsWith('↳')) return `<span class="mc-instrucao">${esc(l)}</span>`;
          if (l.startsWith('CIFRA:')) return `<span class="mc-cifra">${esc(l)}</span>`;
          if (l.startsWith('(')) return `<span class="mc-indicacao">${esc(l)}</span>`;
          if (l.startsWith('"') || l.startsWith('\u201c')) return `<span class="mc-linha-principal">${esc(l)}</span>`;
          return `<span class="mc-linha">${esc(l)}</span>`;
        }).join('');
        html += `<div class="mc-bloco ${classeBloco}">
          <div class="mc-bloco-header">${icone} ${esc(tituloRaw)}</div>
          <div class="mc-bloco-corpo">${linhas}</div>
        </div>`;
        i += 2;
      } else {
        i++;
      }
    }

    html += `</div>`;

    // Botões de ação
    html += `<div class="mc-acoes-roteiro">
      <button class="mc-btn-acao mc-btn-drone" id="mc-btn-drone" onclick="window.McMinisterio.toggleDrone()">
        🎵 Ativar frequência de fundo
      </button>
      <button class="mc-btn-acao mc-btn-salvar" onclick="window.McMinisterio.exportar()">
        💾 Salvar roteiro
      </button>
      <button class="mc-btn-acao mc-btn-copiar" onclick="window.McMinisterio.copiar()">
        📋 Copiar texto
      </button>
      <button class="mc-btn-acao mc-btn-video" id="mc-btn-video" onclick="window.McMinisterio.abrirGerarVideo()">
        🎬 Gerar vídeo da ministração
      </button>
    </div>
    <div class="mc-freq-status" id="mc-freq-status"></div>

    <!-- PAINEL DE VÍDEO DA MINISTRAÇÃO -->
    <div id="mc-video-painel" style="display:none;margin-top:16px;background:var(--accent-soft,#f0e3cb);border:1.5px solid var(--gold,#c9a05a);border-radius:12px;padding:16px">
      <div style="font-size:13px;font-weight:700;color:var(--accent-strong,#8a5f28);margin-bottom:12px">
        🎬 Vídeo da Ministração Cantada
      </div>

      <!-- Upload de foto ou vídeo do ministro -->
      <div style="margin-bottom:12px">
        <div class="field-label">📸 Foto ou vídeo do ministro (aparece no clipe)</div>
        <input type="file" id="mc-video-midia" accept="image/*,video/*"
          style="font-size:12px;margin-bottom:8px"
          onchange="window.McMinisterio.carregarMidia(this.files[0])">
        <div id="mc-video-preview" style="margin-top:6px"></div>
      </div>

      <!-- Estilo do vídeo -->
      <div style="margin-bottom:12px">
        <div class="field-label">Estilo visual</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="mc-video-estilos">
          <button class="mc-intencao-btn mc-sel" data-estilo="cinematografico" onclick="window.McMinisterio.selecionarEstiloVideo('cinematografico',this)">🎬 Cinematográfico</button>
          <button class="mc-intencao-btn" data-estilo="gospel" onclick="window.McMinisterio.selecionarEstiloVideo('gospel',this)">✝️ Gospel</button>
          <button class="mc-intencao-btn" data-estilo="minimalista" onclick="window.McMinisterio.selecionarEstiloVideo('minimalista',this)">⬛ Minimalista</button>
          <button class="mc-intencao-btn" data-estilo="lofi" onclick="window.McMinisterio.selecionarEstiloVideo('lofi',this)">🌙 Lo-fi</button>
        </div>
      </div>

      <!-- Formato -->
      <div style="margin-bottom:12px">
        <div class="field-label">Formato</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="mc-intencao-btn mc-sel" data-formato="9:16" onclick="window.McMinisterio.selecionarFormato('9:16',this)">📱 Stories/Reels (9:16)</button>
          <button class="mc-intencao-btn" data-formato="16:9" onclick="window.McMinisterio.selecionarFormato('16:9',this)">🖥️ YouTube (16:9)</button>
          <button class="mc-intencao-btn" data-formato="1:1" onclick="window.McMinisterio.selecionarFormato('1:1',this)">⬜ Feed (1:1)</button>
        </div>
      </div>

      <!-- Botão renderizar -->
      <button class="mc-btn-principal" id="mc-btn-renderizar-video" onclick="window.McMinisterio.renderizarVideoMinisterio()" style="margin-top:4px">
        ▶️ Renderizar vídeo da ministração
      </button>
      <div id="mc-video-status" style="font-size:12px;color:var(--muted,#7a7166);margin-top:8px"></div>

      <!-- Preview do vídeo gerado -->
      <video id="mc-video-resultado" controls style="display:none;width:100%;border-radius:8px;margin-top:10px"></video>
      <a id="mc-btn-baixar-video" style="display:none;margin-top:8px" class="mc-btn-acao mc-btn-salvar">⬇️ Baixar vídeo</a>
    </div>`;

    output.innerHTML = html;
  }

  function esc(v) {
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── DRONE TOGGLE (exposto globalmente) ─────────────────────── */
  function toggleDrone() {
    if (!ministerioGerado) return;
    const btn = document.getElementById('mc-btn-drone');
    const status = document.getElementById('mc-freq-status');
    if (droneAtivo) {
      pararDrone();
      if (btn) btn.textContent = '🎵 Ativar frequência de fundo';
      if (status) status.textContent = '';
    } else {
      iniciarDrone(ministerioGerado.frequencia);
      if (btn) btn.textContent = '⏹️ Parar frequência';
      if (status) status.textContent = `♪ Frequência ${ministerioGerado.frequencia}Hz ativa — ${FREQUENCIAS[ministerioGerado.intencao].intencao}`;
    }
  }

  function exportar() {
    if (!ministerioGerado) return;
    const texto = `MINISTÉRIO CANTADO — Caderno Vivo\n${'='.repeat(40)}\nIntenção: ${FREQUENCIAS[ministerioGerado.intencao].nome}\nCriado em: ${new Date(ministerioGerado.criadoEm).toLocaleString('pt-BR')}\n\n${ministerioGerado.roteiro}`;
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ministerio-cantado.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function copiar() {
    if (!ministerioGerado) return;
    navigator.clipboard.writeText(ministerioGerado.roteiro)
      .then(() => {
        const btn = document.querySelector('.mc-btn-copiar');
        if (btn) { btn.textContent = '✓ Copiado!'; setTimeout(() => btn.textContent = '📋 Copiar texto', 2000); }
      });
  }

  function salvarMinisterio(m) {
    state.ministerios.unshift(m);
    if (state.ministerios.length > 20) state.ministerios.pop();
    salvarEstado();
    renderizarHistorico();
  }

  function renderizarHistorico() {
    const lista = document.getElementById('mc-historico-lista');
    if (!lista) return;
    if (!state.ministerios.length) {
      lista.innerHTML = '<p class="mc-vazio">Nenhum ministério gerado ainda.</p>';
      return;
    }
    lista.innerHTML = state.ministerios.slice(0, 5).map(m => `
      <div class="mc-historico-item" onclick="window.McMinisterio.carregarHistorico('${m.id}')">
        <strong>${FREQUENCIAS[m.intencao]?.nome || m.intencao}</strong>
        <span>${new Date(m.criadoEm).toLocaleDateString('pt-BR')}</span>
        <small>${m.conteudo.slice(0, 60)}...</small>
      </div>
    `).join('');
  }

  function carregarHistorico(id) {
    const m = state.ministerios.find(x => x.id === id);
    if (!m) return;
    ministerioGerado = m;
    const freq = FREQUENCIAS[m.intencao];
    const cifras = CIFRAS[m.intencao];
    renderizarRoteiro(m.roteiro, freq, cifras);
  }

  /* ── MONTAR PAINEL PRINCIPAL ─────────────────────────────────── */
  function montarPainel() {
    const panel = document.getElementById('mc-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="mc-container">

        <div class="mc-header">
          <h2 class="mc-titulo">🎙️ Ministério Cantado</h2>
          <p class="mc-subtitulo">Transforme sua mensagem em ministração musical — preservando sua voz e intenção.</p>
        </div>

        <!-- MODO DE ENTRADA -->
        <div class="mc-secao">
          <div class="mc-secao-label">Como você quer entrar?</div>
          <div class="mc-modos">
            <button class="mc-modo-btn mc-sel" data-modo="audio" onclick="window.McMinisterio.selecionarModo('audio', this)">
              <span class="mc-modo-icone">🎙️</span>
              <strong>Gravar voz</strong>
              <small>Fala e a IA estrutura</small>
            </button>
            <button class="mc-modo-btn" data-modo="texto" onclick="window.McMinisterio.selecionarModo('texto', this)">
              <span class="mc-modo-icone">✍️</span>
              <strong>Digitar texto</strong>
              <small>Escreve a mensagem</small>
            </button>
            <button class="mc-modo-btn" data-modo="musica" onclick="window.McMinisterio.selecionarModo('musica', this)">
              <span class="mc-modo-icone">🎵</span>
              <strong>Música base</strong>
              <small>Usa obra do Caderno</small>
            </button>
          </div>
        </div>

        <!-- PAINEL ÁUDIO -->
        <div id="mc-painel-audio" class="mc-entrada">
          <div class="mc-secao-label">Grave sua ministração</div>
          <button id="mc-btn-gravar" class="mc-btn-gravar" onclick="window.McMinisterio.toggleGravacao()">
            <span class="mc-dot"></span> Gravar ministração
          </button>
          <div class="mc-wave" id="mc-wave">
            ${Array.from({length: 16}, (_, i) =>
              `<span style="--d:${(0.4 + Math.random()*0.5).toFixed(2)}s;--delay:${(i*0.06).toFixed(2)}s;--h:${8 + Math.floor(Math.random()*22)}px"></span>`
            ).join('')}
          </div>
          <audio id="mc-audio-preview" controls class="mc-hidden mc-audio-player"></audio>
          <p id="mc-audio-status" class="mc-status-txt">Clique para começar a gravar sua voz</p>
          <div class="mc-secao-label" style="margin-top:12px">Ou cole o texto do que você falou</div>
          <textarea id="mc-texto-base" class="mc-textarea" rows="3" placeholder="Se preferir, escreva aqui o que vai ministrar (a IA organiza no ritmo)..."></textarea>
        </div>

        <!-- PAINEL TEXTO -->
        <div id="mc-painel-texto" class="mc-entrada mc-hidden">
          <div class="mc-secao-label">Escreva sua mensagem</div>
          <textarea id="mc-texto-input" class="mc-textarea" rows="6"
            placeholder="Ex: A adoração não é um momento, é um estilo de vida. Quando você levanta as mãos, está dizendo que Deus é maior do que qualquer coisa que você enfrenta..."></textarea>
          <p class="mc-status-txt">Pode ser uma ministração, poema, fábula, reflexão ou parábola.</p>
        </div>

        <!-- PAINEL MÚSICA BASE -->
        <div id="mc-painel-musica" class="mc-entrada mc-hidden">
          <div class="mc-secao-label">Escolha a música base</div>
          <select class="mc-select" id="mc-select-musica">
            <option>Selecione uma obra do Caderno Vivo...</option>
          </select>
          <textarea id="mc-texto-sobre" class="mc-textarea" rows="4" style="margin-top:10px"
            placeholder="Escreva o tema ou mensagem que você quer ministrar em cima dessa música..."></textarea>
          <p class="mc-status-txt">A IA mantém o tom e o ritmo da obra — você ministra por cima com sua voz.</p>
        </div>

        <!-- INTENÇÃO -->
        <div class="mc-secao">
          <div class="mc-secao-label">Intenção da ministração</div>
          <div class="mc-intencoes">
            ${Object.entries(FREQUENCIAS).map(([key, val], i) => `
              <button class="mc-intencao-btn ${i === 0 ? 'mc-sel' : ''}"
                data-intencao="${key}"
                onclick="window.McMinisterio.selecionarIntencao('${key}', this)">
                ${val.nome}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- BOTÃO PRINCIPAL -->
        <button id="mc-btn-gerar" class="mc-btn-principal" onclick="window.McMinisterio.gerarMinisterio()">
          ✨ Estruturar Ministração
        </button>

        <!-- OUTPUT -->
        <div id="mc-output" class="mc-output">
          <div class="mc-output-placeholder">
            <p>🕊️ Sua ministração estruturada aparecerá aqui</p>
            <p>com cifras, marcações de intensidade e instruções de entrega.</p>
          </div>
        </div>

        <!-- HISTÓRICO -->
        <div class="mc-secao" style="margin-top:20px">
          <div class="mc-secao-label">Ministérios anteriores</div>
          <div id="mc-historico-lista"></div>
        </div>

      </div>
    `;

    carregarObrasNoSelect();
    renderizarHistorico();
  }

  function carregarObrasNoSelect() {
    const sel = document.getElementById('mc-select-musica');
    if (!sel) return;
    try {
      const raw = localStorage.getItem('caderno-vivo-state-v5');
      if (!raw) return;
      const data = JSON.parse(raw);
      const obras = data.works || [];
      if (!obras.length) return;
      obras.forEach(obra => {
        const opt = document.createElement('option');
        opt.value = obra.id;
        opt.textContent = `${obra.title} — ${obra.key || '?'}, ${obra.bpm || '?'} BPM`;
        sel.appendChild(opt);
      });
    } catch {}
  }

  /* ── API PÚBLICA ─────────────────────────────────────────────── */
  function selecionarModo(modo, btn) {
    document.querySelectorAll('.mc-modo-btn').forEach(b => b.classList.remove('mc-sel'));
    btn.classList.add('mc-sel');
    ['audio', 'texto', 'musica'].forEach(m => {
      const el = document.getElementById(`mc-painel-${m}`);
      if (el) el.classList.toggle('mc-hidden', m !== modo);
    });
  }

  function selecionarIntencao(intencao, btn) {
    document.querySelectorAll('.mc-intencao-btn').forEach(b => b.classList.remove('mc-sel'));
    btn.classList.add('mc-sel');
  }

  function toggleGravacao() {
    if (gravando) pararGravacao();
    else iniciarGravacao();
  }

  window.McMinisterio = {
    selecionarModo,
    selecionarIntencao,
    toggleGravacao,
    gerarMinisterio,
    toggleDrone,
    exportar,
    copiar,
    carregarHistorico,
    abrirGerarVideo,
    carregarMidia,
    selecionarEstiloVideo,
    selecionarFormato,
    renderizarVideoMinisterio,
  };

  /* ── INJETAR CSS ─────────────────────────────────────────────── */
  function injetarCSS() {
    const style = document.createElement('style');
    style.textContent = `
      #mc-panel { display: none; }
      .mc-container { max-width: 860px; margin: 0 auto; padding: 24px 20px; }
      .mc-header { margin-bottom: 20px; }
      .mc-titulo { margin: 0 0 4px; font-size: 20px; font-weight: 800; color: var(--ink, #1c1710); }
      .mc-subtitulo { margin: 0; font-size: 14px; color: var(--muted, #7a7166); }
      .mc-secao { margin-bottom: 16px; }
      .mc-secao-label { font-size: 12px; font-weight: 700; color: var(--muted, #7a7166); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
      .mc-modos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .mc-modo-btn { background: var(--surface, #fffcf5); border: 1px solid var(--line, #e2d9c8); border-radius: 10px; padding: 14px 10px; cursor: pointer; transition: all .15s; text-align: center; }
      .mc-modo-btn:hover, .mc-modo-btn.mc-sel { border-color: var(--accent, #b08040); background: var(--accent-soft, #f0e3cb); }
      .mc-modo-icone { display: block; font-size: 22px; margin-bottom: 6px; }
      .mc-modo-btn strong { display: block; font-size: 13px; color: var(--ink, #1c1710); margin-bottom: 2px; }
      .mc-modo-btn small { font-size: 11px; color: var(--muted, #7a7166); }
      .mc-entrada { background: var(--surface, #fffcf5); border: 1px solid var(--line, #e2d9c8); border-radius: 10px; padding: 16px; margin-bottom: 14px; }
      .mc-hidden { display: none !important; }
      .mc-btn-gravar { display: flex; align-items: center; gap: 10px; background: #fce8e6; color: #a33428; border: 1px solid #e8c0bc; border-radius: 24px; padding: 10px 20px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
      .mc-btn-gravar:hover, .mc-btn-gravar.mc-gravando { background: #a33428; color: #fff; border-color: #a33428; }
      .mc-dot { width: 10px; height: 10px; border-radius: 50%; background: currentColor; display: inline-block; }
      .mc-pulsar { animation: mc-pulse 1s ease infinite; }
      @keyframes mc-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
      .mc-wave { display: flex; align-items: center; gap: 3px; height: 36px; margin: 10px 0; }
      .mc-wave span { display: inline-block; width: 3px; border-radius: 2px; background: var(--accent, #b08040); opacity: .5; animation: mc-wave var(--d,.8s) ease-in-out infinite var(--delay,0s) alternate; }
      @keyframes mc-wave { from{height:4px} to{height:var(--h,20px)} }
      .mc-audio-player { width: 100%; margin-top: 8px; border-radius: 8px; }
      .mc-status-txt { font-size: 12px; color: var(--muted, #7a7166); margin: 6px 0 0; }
      .mc-textarea { width: 100%; border: 1px solid var(--line, #e2d9c8); border-radius: 8px; background: var(--surface, #fffcf5); color: var(--ink, #1c1710); padding: 10px 12px; font-size: 13px; line-height: 1.6; resize: vertical; font-family: inherit; box-sizing: border-box; }
      .mc-select { width: 100%; border: 1px solid var(--line, #e2d9c8); border-radius: 8px; background: var(--surface, #fffcf5); color: var(--ink, #1c1710); padding: 10px 12px; font-size: 13px; font-family: inherit; }
      .mc-intencoes { display: flex; gap: 7px; flex-wrap: wrap; }
      .mc-intencao-btn { border: 1px solid var(--line, #e2d9c8); border-radius: 20px; padding: 6px 13px; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--surface, #fffcf5); color: var(--muted, #7a7166); transition: all .12s; }
      .mc-intencao-btn:hover, .mc-intencao-btn.mc-sel { background: var(--accent, #b08040); color: #fff; border-color: var(--accent, #b08040); }
      .mc-btn-principal { width: 100%; background: var(--accent, #b08040); color: #fff; border: none; border-radius: 10px; padding: 14px; font-size: 15px; font-weight: 800; cursor: pointer; margin-bottom: 16px; transition: all .15s; }
      .mc-btn-principal:hover { background: var(--accent-strong, #8a5f28); }
      .mc-btn-principal:disabled { opacity: .5; cursor: not-allowed; }
      .mc-output { background: var(--surface, #fffcf5); border: 1px solid var(--line, #e2d9c8); border-radius: 10px; padding: 16px; min-height: 120px; }
      .mc-output-placeholder { text-align: center; padding: 24px; color: var(--muted, #7a7166); font-size: 14px; }
      .mc-output-placeholder p { margin: 4px 0; }
      .mc-loading { text-align: center; padding: 20px; color: var(--muted, #7a7166); font-size: 14px; }
      .mc-dots::after { content: '...'; animation: mc-dots 1.2s steps(4) infinite; }
      @keyframes mc-dots { 0%,25%{content:'.'} 50%{content:'..'} 75%,100%{content:'...'} }
      .mc-erro { color: #a33428; font-size: 14px; padding: 12px; }
      .mc-roteiro { display: grid; gap: 12px; margin-bottom: 14px; }
      .mc-bloco { border-radius: 10px; padding: 14px 16px; border-left: 4px solid transparent; }
      .mc-bloco-verde  { background: #f0f7f2; border-left-color: #7b9e87; }
      .mc-bloco-dourado{ background: #fdf6eb; border-left-color: #b08040; }
      .mc-bloco-vermelho{ background: #fdf0ee; border-left-color: #a33428; }
      .mc-bloco-azul   { background: #eef4fb; border-left-color: #5a7a9e; }
      .mc-bloco-header { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--muted, #7a7166); margin-bottom: 8px; }
      .mc-bloco-corpo  { display: grid; gap: 4px; }
      .mc-linha-principal { font-size: 15px; font-weight: 700; color: var(--ink, #1c1710); line-height: 1.5; display: block; }
      .mc-linha { font-size: 14px; color: var(--ink, #1c1710); line-height: 1.5; display: block; }
      .mc-cifra { font-size: 12px; font-weight: 700; color: var(--accent, #b08040); background: var(--accent-soft, #f0e3cb); border-radius: 4px; padding: 2px 7px; display: inline-block; margin-bottom: 4px; }
      .mc-indicacao { font-size: 12px; color: var(--muted, #7a7166); font-style: italic; display: block; }
      .mc-instrucao { font-size: 12px; color: #5a7a9e; display: block; margin-top: 2px; }
      .mc-acoes-roteiro { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
      .mc-btn-acao { border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid var(--line, #e2d9c8); background: var(--surface, #fffcf5); color: var(--ink, #1c1710); transition: all .12s; }
      .mc-btn-drone { background: var(--accent-soft, #f0e3cb); border-color: var(--accent, #b08040); color: var(--accent-strong, #8a5f28); }
      .mc-btn-drone:hover { background: var(--accent, #b08040); color: #fff; }
      .mc-freq-status { font-size: 12px; color: var(--accent, #b08040); margin-top: 8px; font-style: italic; }
      .mc-historico-item { background: var(--surface, #fffcf5); border: 1px solid var(--line, #e2d9c8); border-radius: 8px; padding: 10px 12px; margin-bottom: 6px; cursor: pointer; transition: all .12s; }
      .mc-historico-item:hover { border-color: var(--accent, #b08040); }
      .mc-historico-item strong { display: block; font-size: 13px; color: var(--ink, #1c1710); }
      .mc-historico-item span { font-size: 11px; color: var(--muted, #7a7166); }
      .mc-historico-item small { display: block; font-size: 12px; color: var(--muted, #7a7166); margin-top: 2px; }
      .mc-vazio { font-size: 13px; color: var(--muted, #7a7166); }
      @media (max-width: 600px) {
        .mc-modos { grid-template-columns: 1fr; }
        .mc-acoes-roteiro { flex-direction: column; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── BOTÃO NA SIDEBAR DO CADERNO VIVO ────────────────────────── */
  function injetarBotaoSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.textContent = '🎙️ Ministério Cantado';
    btn.style.marginTop = '8px';
    btn.addEventListener('click', () => {
      const panel = document.getElementById('mc-panel');
      if (!panel) return;
      const estaAberto = panel.style.display === 'block';
      panel.style.display = estaAberto ? 'none' : 'block';
      if (!estaAberto) montarPainel();
    });
    sidebar.appendChild(btn);
  }

  /* ── INJETAR PAINEL NO DOM ───────────────────────────────────── */
  function injetarPainel() {
    const workspace = document.querySelector('.workspace');
    if (!workspace) return;
    const panel = document.createElement('section');
    panel.id = 'mc-panel';
    panel.style.display = 'none';
    workspace.appendChild(panel);
  }


/* ════════════════════════════════════════════════════════
   VÍDEO DA MINISTRAÇÃO CANTADA
   Canvas API + frequência de fundo + foto/vídeo do ministro
════════════════════════════════════════════════════════ */

let _midiaEl = null;      // foto ou vídeo do ministro
let _midiaBlob = null;
let _estiloVideo = 'cinematografico';
let _formatoVideo = '9:16';
let _videoBlob = null;

function carregarMidia(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const preview = document.getElementById('mc-video-preview');
  _midiaBlob = file;

  if (file.type.startsWith('image/')) {
    const img = new Image();
    img.src = url;
    img.style.cssText = 'width:100%;max-height:120px;object-fit:cover;border-radius:8px;margin-top:4px';
    _midiaEl = img;
    if (preview) { preview.innerHTML = ''; preview.appendChild(img); }
  } else if (file.type.startsWith('video/')) {
    const vid = document.createElement('video');
    vid.src = url; vid.muted = true; vid.loop = true;
    vid.style.cssText = 'width:100%;max-height:120px;border-radius:8px;margin-top:4px';
    vid.play();
    _midiaEl = vid;
    if (preview) { preview.innerHTML = ''; preview.appendChild(vid); }
  }
}

function selecionarEstiloVideo(estilo, btn) {
  document.querySelectorAll('[data-estilo]').forEach(b => b.classList.remove('mc-sel'));
  if (btn) btn.classList.add('mc-sel');
  _estiloVideo = estilo;
}

function selecionarFormato(formato, btn) {
  document.querySelectorAll('[data-formato]').forEach(b => b.classList.remove('mc-sel'));
  if (btn) btn.classList.add('mc-sel');
  _formatoVideo = formato;
}

function abrirGerarVideo() {
  const painel = document.getElementById('mc-video-painel');
  if (!painel) return;
  const aberto = painel.style.display === 'block';
  painel.style.display = aberto ? 'none' : 'block';
  document.getElementById('mc-btn-video').textContent = aberto ? '🎬 Gerar vídeo da ministração' : '✕ Fechar vídeo';
}

const ESTILOS_VIDEO = {
  cinematografico: { bg1: '#0d0a04', bg2: '#2a1f0d', accent: '#d8b56f', text: '#fffdf5' },
  gospel:          { bg1: '#030b1a', bg2: '#0d2137', accent: '#f0c040', text: '#ffffff' },
  minimalista:     { bg1: '#000000', bg2: '#111111', accent: '#ffffff', text: '#ffffff' },
  lofi:            { bg1: '#1a1025', bg2: '#2d1b4e', accent: '#b388ff', text: '#e8d5ff' },
};

async function renderizarVideoMinisterio() {
  const btn = document.getElementById('mc-btn-renderizar-video');
  const status = document.getElementById('mc-video-status');
  const roteiro = window._ministerioGerado?.roteiro || document.getElementById('mc-balao-texto')?.innerText || '';

  if (!roteiro) { alert('Gere o roteiro da ministração primeiro.'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Renderizando...'; }
  if (status) status.textContent = 'Preparando canvas...';

  // Dimensões por formato
  const dims = {
    '9:16': { w: 720, h: 1280 },
    '16:9': { w: 1280, h: 720 },
    '1:1':  { w: 720, h: 720 },
  };
  const { w, h } = dims[_formatoVideo] || dims['9:16'];
  const estilo = ESTILOS_VIDEO[_estiloVideo] || ESTILOS_VIDEO.cinematografico;

  // Criar canvas
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Pré-carregar mídia
  if (_midiaEl && _midiaEl.tagName === 'IMG' && !_midiaEl.complete) {
    await new Promise(r => { _midiaEl.onload = r; });
  }

  // Dividir roteiro em blocos
  const linhas = roteiro.split('\n').filter(l => l.trim());
  const fps = 24;
  const segsPorBloco = 4;
  const totalFrames = linhas.length * segsPorBloco * fps;

  // Capturar stream do canvas
  const stream = canvas.captureStream(fps);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  const chunks = [];
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3500000 });
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  rec.start();

  if (status) status.textContent = 'Renderizando vídeo (0%)...';

  let frameAtual = 0;
  for (let b = 0; b < linhas.length; b++) {
    const linha = linhas[b];
    const frames = segsPorBloco * fps;
    for (let f = 0; f < frames; f++) {
      const progress = f / frames;
      const beatPhase = (frameAtual / fps * 0.5) % 1;
      desenharFrameMinisterio(ctx, w, h, linha, linhas, b, progress, beatPhase, estilo);
      const pct = Math.round((frameAtual / totalFrames) * 100);
      if (f % fps === 0 && status) status.textContent = `Renderizando... ${pct}%`;
      frameAtual++;
      await new Promise(r => setTimeout(r, 1000 / fps));
    }
  }

  rec.stop();
  await new Promise(r => { rec.onstop = r; });

  _videoBlob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(_videoBlob);

  const videoEl = document.getElementById('mc-video-resultado');
  const dlBtn = document.getElementById('mc-btn-baixar-video');

  if (videoEl) {
    videoEl.src = url;
    videoEl.style.display = 'block';
  }
  if (dlBtn) {
    dlBtn.href = url;
    dlBtn.download = `ministerio-cantado-${_formatoVideo.replace(':','x')}.webm`;
    dlBtn.style.display = 'inline-block';
    dlBtn.textContent = '⬇️ Baixar vídeo da ministração';
  }
  if (status) status.textContent = `✅ Vídeo pronto! ${w}x${h} — pronto para publicar.`;
  if (btn) { btn.disabled = false; btn.textContent = '▶️ Renderizar vídeo da ministração'; }
}

function desenharFrameMinisterio(ctx, w, h, linhaAtual, todasLinhas, blocoIdx, progress, beatPhase, estilo) {
  // Fundo gradiente
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, estilo.bg1);
  grad.addColorStop(1, estilo.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Foto/vídeo do ministro (se tiver)
  if (_midiaEl) {
    ctx.save();
    const zoom = 1 + progress * 0.04;
    let sw, sh;
    if (_midiaEl.tagName === 'IMG') { sw = _midiaEl.naturalWidth || w; sh = _midiaEl.naturalHeight || h; }
    else { sw = _midiaEl.videoWidth || w; sh = _midiaEl.videoHeight || h; }
    const scale = Math.max(w / sw, h / sh) * zoom;
    const dx = (w - sw * scale) / 2;
    const dy = (h - sh * scale) / 2;
    ctx.globalAlpha = 0.35;
    ctx.drawImage(_midiaEl, dx, dy, sw * scale, sh * scale);
    ctx.globalAlpha = 1;
    // Overlay de cor
    ctx.fillStyle = `rgba(${hexToRgb(estilo.bg1)},0.65)`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Vinheta
  const vig = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Fade in/out
  if (progress < 0.08) { ctx.fillStyle = `rgba(0,0,0,${1-progress/0.08})`; ctx.fillRect(0,0,w,h); }
  if (progress > 0.92) { ctx.fillStyle = `rgba(0,0,0,${(progress-0.92)/0.08})`; ctx.fillRect(0,0,w,h); }

  // Linha accent pulsante
  const pulso = 0.5 + Math.sin(beatPhase * Math.PI * 2) * 0.5;
  ctx.fillStyle = estilo.accent;
  ctx.fillRect(w * 0.1, h * 0.42, w * 0.8 * pulso, Math.max(2, h * 0.003));

  // Texto principal — Kinetic Typography
  const fadeIn = progress < 0.12 ? progress / 0.12 : progress > 0.88 ? 1-(progress-0.88)/0.12 : 1;
  const slideY = progress < 0.15 ? (1 - progress/0.15) * h * 0.04 : 0;
  ctx.save();
  ctx.globalAlpha = fadeIn;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = estilo.text;
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = w * 0.02;
  const fontSize = Math.max(20, Math.min(w * 0.058, 56));
  ctx.font = `600 ${fontSize}px Inter,Arial,sans-serif`;
  wrapTextVideo(ctx, linhaAtual.replace(/^[[\]↳CIFRA:✝️🎵⚡🌅🌙🕊️]+\s*/,'').trim(), w/2, h/2 + slideY, w * 0.82, fontSize * 1.4);
  ctx.restore();

  // Linha anterior (pequena, acima)
  if (blocoIdx > 0) {
    const linhaAnterior = todasLinhas[blocoIdx-1];
    ctx.save();
    ctx.globalAlpha = 0.3 * (1 - progress);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = estilo.accent;
    ctx.font = `400 ${Math.max(12, w*0.03)}px Inter,Arial,sans-serif`;
    ctx.fillText(linhaAnterior?.slice(0,50) || '', w/2, h * 0.35);
    ctx.restore();
  }

  // Marca d'água
  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = `rgba(${hexToRgb(estilo.accent)},0.3)`;
  ctx.font = `${Math.max(10,w*0.016)}px Inter,Arial,sans-serif`;
  ctx.fillText('caderno vivo', w * 0.95, h * 0.97);
  ctx.restore();

  // Barra de progresso
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(w*0.08, h*0.955, w*0.84, 3);
  ctx.fillStyle = estilo.accent;
  ctx.fillRect(w*0.08, h*0.955, w*0.84 * ((blocoIdx + progress) / Math.max(todasLinhas.length, 1)), 3);
}

function wrapTextVideo(ctx, text, x, y, maxW, lineH) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  const startY = y - (lines.length - 1) * lineH / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineH));
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

  /* ── INICIALIZAR ─────────────────────────────────────────────── */
  function init() {
    injetarCSS();
    injetarPainel();
    injetarBotaoSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
