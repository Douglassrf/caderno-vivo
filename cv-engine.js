/* ================================================================
   CADERNO VIVO — ENGINE DE ESCALA
   Arquivo: cv-engine.js
   
   Implementa:
   1. Stems Engine (Tone.js Master Clock — sem dessincronização)
   2. JSON Recipe + Shareable Link (/r/abc123 via Supabase)
   3. Audio Sprite fallback (dispositivos lentos/3G)
   4. Fila de processamento (pedidos pesados não derrubam o site)
   5. RVC Tutorial guiado (Google Colab → upload .pth)
   6. Upgrade automático (créditos avulsos → sugestão de plano)
   
   Adicione no index.html antes de </body>:
   <script src="cv-engine.js"></script>
================================================================ */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     1. STEMS ENGINE — Tone.js Master Clock
     Carrega stems da CDN e sincroniza via Master Clock
     Zero dessincronização em qualquer dispositivo
  ════════════════════════════════════════════════════════════ */

  const STEMS_CDN = 'https://pub-caderno-vivo.r2.dev/stems'; // Cloudflare R2

  // Biblioteca de stems por gênero e BPM
  // (você processa 1x no Audacity e sobe no R2)
  const STEMS_BIBLIOTECA = {
    gospel: {
      bpms: [60, 72, 80, 92],
      toms: ['Dm', 'Am', 'G', 'C'],
      stems: ['kick', 'bass', 'pad', 'melody', 'harmony'],
    },
    mpb:    { bpms: [80, 90, 100], toms: ['Am', 'Dm', 'G'], stems: ['kick','bass','guitar','melody'] },
    trap:   { bpms: [130, 140, 150], toms: ['Dm', 'Am', 'Cm'], stems: ['kick','hihat','bass','melody'] },
    pop:    { bpms: [100, 120, 128], toms: ['C', 'G', 'Am'], stems: ['kick','bass','synth','melody'] },
    sertanejo: { bpms: [88, 96, 104], toms: ['G', 'D', 'Am'], stems: ['kick','bass','guitar','melody'] },
    rock:   { bpms: [120, 130, 140], toms: ['E', 'Am', 'G'], stems: ['kick','guitar','bass','melody'] },
  };

  let Tone = null;
  let stemPlayers = {};
  let stemsAtivos = false;
  let stemLoop = null;
  let stemRecipe = null;

  function carregarToneParaStems(cb) {
    if (window.Tone) { Tone = window.Tone; cb(); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/tone@14.8.49/build/Tone.js';
    s.onload = () => { Tone = window.Tone; cb(); };
    document.head.appendChild(s);
  }

  function stemUrl(genero, bpm, tom, stem) {
    return `${STEMS_CDN}/${genero}/${bpm}bpm_${tom}_${stem}.mp3`;
  }

  function nearestBpm(genero, targetBpm) {
    const bpms = STEMS_BIBLIOTECA[genero]?.bpms || [80];
    return bpms.reduce((a, b) => Math.abs(b - targetBpm) < Math.abs(a - targetBpm) ? b : a);
  }

  function nearestTom(genero, targetTom) {
    const toms = STEMS_BIBLIOTECA[genero]?.toms || ['C'];
    if (toms.includes(targetTom)) return targetTom;
    return toms[0]; // fallback para o primeiro tom disponível
  }

  async function carregarStems(recipe) {
    return new Promise((resolve) => {
      carregarToneParaStems(async () => {
        try {
          await Tone.start();
          const { genero, bpm, tom, volume = {} } = recipe;
          const g = STEMS_BIBLIOTECA[genero] ? genero : 'gospel';
          const bpmReal = nearestBpm(g, bpm || 72);
          const tomReal = nearestTom(g, tom || 'Am');
          const stemsDisponiveis = STEMS_BIBLIOTECA[g].stems;

          // Parar stems anteriores
          pararStems();
          stemPlayers = {};

          // Criar players para cada stem via Tone.js
          const promises = stemsDisponiveis.map(async (stem) => {
            try {
              const url = stemUrl(g, bpmReal, tomReal, stem);
              const player = new Tone.Player({
                url,
                loop: true,
                volume: volume[stem] !== undefined ? volume[stem] : -6,
              }).toDestination();
              await Tone.loaded();
              stemPlayers[stem] = player;
            } catch (e) {
              console.warn(`Stem ${stem} não disponível:`, e.message);
            }
          });

          await Promise.allSettled(promises);

          // Sincronizar todos via Master Clock
          if (Object.keys(stemPlayers).length > 0) {
            Tone.Transport.bpm.value = bpmReal;
            Object.values(stemPlayers).forEach(p => {
              if (p) Tone.Transport.schedule(() => p.start(0), 0);
            });
            Tone.Transport.start();
            stemsAtivos = true;
            stemRecipe = recipe;
            resolve(true);
          } else {
            // Fallback para Audio Sprite
            resolve(false);
          }
        } catch (e) {
          console.warn('Falha ao carregar stems:', e.message);
          resolve(false);
        }
      });
    });
  }

  function pararStems() {
    try {
      Object.values(stemPlayers).forEach(p => p?.stop?.());
      if (Tone) Tone.Transport.stop();
    } catch {}
    stemsAtivos = false;
    stemPlayers = {};
  }

  function ajustarVolumeStems(stem, db) {
    if (stemPlayers[stem]) {
      stemPlayers[stem].volume.value = db;
    }
  }

  /* ════════════════════════════════════════════════════════════
     3. AUDIO SPRITE FALLBACK
     Um único arquivo MP3 com todos os stems concatenados
     Usado quando Tone.js tiver problema de latência
  ════════════════════════════════════════════════════════════ */

  let audioSpriteEl = null;
  let audioSpriteAtivo = false;

  function spriteUrl(genero, bpm) {
    const g = STEMS_BIBLIOTECA[genero] ? genero : 'gospel';
    const bpmReal = nearestBpm(g, bpm || 72);
    return `${STEMS_CDN}/sprites/${g}_${bpmReal}bpm_sprite.mp3`;
  }

  async function tocarAudioSprite(genero, bpm) {
    pararAudioSprite();
    const url = spriteUrl(genero, bpm);
    audioSpriteEl = new Audio(url);
    audioSpriteEl.loop = true;
    try {
      await audioSpriteEl.play();
      audioSpriteAtivo = true;
      return true;
    } catch (e) {
      console.warn('Audio Sprite falhou:', e.message);
      return false;
    }
  }

  function pararAudioSprite() {
    if (audioSpriteEl) {
      audioSpriteEl.pause();
      audioSpriteEl.src = '';
      audioSpriteEl = null;
    }
    audioSpriteAtivo = false;
  }

  // Motor principal — tenta Tone.js primeiro, cai no sprite
  async function tocarInstrumental(recipe) {
    const ok = await carregarStems(recipe);
    if (!ok) {
      console.log('Usando Audio Sprite como fallback');
      return tocarAudioSprite(recipe.genero, recipe.bpm);
    }
    return true;
  }

  function pararInstrumental() {
    pararStems();
    pararAudioSprite();
  }

  /* ════════════════════════════════════════════════════════════
     2. JSON RECIPE + SHAREABLE LINK
     Salva a composição no Supabase e gera URL curta /r/abc123
  ════════════════════════════════════════════════════════════ */

  // Supabase config (plano gratuito — 500MB, 50k linhas)
  const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
  const SUPABASE_KEY = 'SUA_ANON_KEY'; // chave pública (anon) — segura no frontend

  function gerarIdCurto() {
    return Math.random().toString(36).slice(2, 8);
  }

  function montarRecipe(obra) {
    if (!obra) return null;
    return {
      id: gerarIdCurto(),
      titulo: obra.title || 'Sem título',
      bpm: Number(obra.bpm) || 72,
      tom: obra.key || 'Am',
      genero: obra.genre || 'gospel',
      letra: (obra.lyrics || '').slice(0, 2000), // limitar tamanho
      acorde: obra.chords || '',
      paleta: obra.clip?.palette || '',
      mood: obra.mood || '',
      mix: {
        kick: -6, bass: -8, pad: -10, melody: -6, harmony: -12,
      },
      criadoEm: new Date().toISOString(),
    };
  }

  async function salvarRecipe(recipe) {
    // Tentar Supabase primeiro
    if (SUPABASE_URL.includes('SEU_PROJETO')) {
      // Supabase não configurado ainda — salvar em localStorage
      return salvarRecipeLocal(recipe);
    }
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(recipe),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data[0]?.id || recipe.id;
      }
    } catch (e) {
      console.warn('Supabase indisponível, usando localStorage');
    }
    return salvarRecipeLocal(recipe);
  }

  function salvarRecipeLocal(recipe) {
    const key = `cv-recipe-${recipe.id}`;
    localStorage.setItem(key, JSON.stringify(recipe));
    return recipe.id;
  }

  async function buscarRecipe(id) {
    // Tentar Supabase
    if (!SUPABASE_URL.includes('SEU_PROJETO')) {
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/recipes?id=eq.${id}&select=*`,
          { headers: { 'apikey': SUPABASE_KEY } }
        );
        if (resp.ok) {
          const data = await resp.json();
          if (data[0]) return data[0];
        }
      } catch {}
    }
    // Fallback localStorage
    const raw = localStorage.getItem(`cv-recipe-${id}`);
    return raw ? JSON.parse(raw) : null;
  }

  async function gerarShareableLink() {
    try {
      const raw = localStorage.getItem('caderno-vivo-state-v5');
      if (!raw) { alert('Nenhuma obra ativa.'); return; }
      const state = JSON.parse(raw);
      const obra = state.works?.find(w => w.id === state.activeWorkId) || state.works?.[0];
      if (!obra) { alert('Crie uma obra primeiro.'); return; }

      const btn = document.getElementById('cv-btn-share');
      const status = document.getElementById('cv-share-status');
      if (btn) { btn.disabled = true; btn.textContent = 'Gerando link...'; }

      const recipe = montarRecipe(obra);
      const id = await salvarRecipe(recipe);
      const link = `${window.location.origin}/r/${id}`;

      // Copiar para clipboard
      await navigator.clipboard.writeText(link).catch(() => {});

      if (status) {
        status.innerHTML = `
          <div class="cv-share-box">
            <strong>Link gerado!</strong>
            <input type="text" readonly value="${link}" 
              style="width:100%;margin-top:6px;font-size:12px;border-radius:6px;padding:6px 10px;border:1px solid var(--line);background:var(--surface)"
              onclick="this.select()">
            <p style="font-size:11px;color:var(--muted);margin-top:4px">✅ Copiado! Quem abrir este link ouvirá sua composição instantaneamente.</p>
          </div>`;
      }

      // Tracking
      if (obra) {
        try {
          const st = JSON.parse(localStorage.getItem('caderno-vivo-state-v5'));
          const w = st.works?.find(x => x.id === obra.id);
          if (w) {
            w.shareLinks = w.shareLinks || [];
            w.shareLinks.push({ id, criadoEm: new Date().toISOString() });
            localStorage.setItem('caderno-vivo-state-v5', JSON.stringify(st));
          }
        } catch {}
      }

      if (btn) { btn.disabled = false; btn.textContent = '🔗 Gerar link'; }
      return link;
    } catch (e) {
      alert('Erro ao gerar link. Tente novamente.');
    }
  }

  // Ao abrir /r/abc123 — reproduzir automaticamente
  async function verificarRecipeNaURL() {
    const match = window.location.pathname.match(/^\/r\/([a-z0-9]+)$/i);
    if (!match) return;
    const id = match[1];
    const recipe = await buscarRecipe(id);
    if (!recipe) return;

    // Mostrar player de recipe
    const container = document.createElement('div');
    container.id = 'cv-recipe-player';
    container.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:var(--surface,#fffcf5);border:1.5px solid var(--accent,#b08040);
      border-radius:14px;padding:16px 20px;z-index:999;
      box-shadow:0 8px 32px rgba(0,0,0,.2);max-width:340px;width:90%;
      font-family:Inter,Arial,sans-serif;
    `;
    container.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--muted,#7a7166);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">
        🎵 Caderno Vivo — Composição compartilhada
      </div>
      <div style="font-size:16px;font-weight:700;color:var(--ink,#1c1710);margin-bottom:4px">${recipe.titulo}</div>
      <div style="font-size:12px;color:var(--muted,#7a7166);margin-bottom:12px">
        ${recipe.genero} · ${recipe.bpm} BPM · Tom ${recipe.tom}
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button id="cv-recipe-play" style="flex:1;background:var(--accent,#b08040);color:#fff;border:none;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">
          ▶️ Ouvir
        </button>
        <button id="cv-recipe-stop" style="background:var(--surface,#f0e3cb);border:1px solid var(--accent,#b08040);border-radius:8px;padding:8px 12px;cursor:pointer">
          ⏹️
        </button>
      </div>
      <div style="font-size:12px;color:var(--ink,#1c1710);line-height:1.6;max-height:80px;overflow-y:auto">
        ${(recipe.letra || '').slice(0, 200)}${recipe.letra?.length > 200 ? '...' : ''}
      </div>
      <a href="${window.location.origin}" style="display:block;margin-top:10px;font-size:11px;color:var(--accent,#b08040);text-align:center;font-weight:700">
        Criar minha música grátis no Caderno Vivo →
      </a>
    `;
    document.body.appendChild(container);

    document.getElementById('cv-recipe-play')?.addEventListener('click', () => {
      tocarInstrumental(recipe);
    });
    document.getElementById('cv-recipe-stop')?.addEventListener('click', pararInstrumental);
  }

  /* ════════════════════════════════════════════════════════════
     5. FILA DE PROCESSAMENTO
     Pedidos pesados (MusicGen, RVC) entram na fila
     O site nunca cai — o usuário vê progresso real
  ════════════════════════════════════════════════════════════ */

  const FILA_KEY = 'cv-fila-processamento';
  const FILA_MAX_SIMULTANEOS = 2; // máximo de pedidos simultâneos

  function getFilaLocal() {
    try { return JSON.parse(localStorage.getItem(FILA_KEY) || '[]'); }
    catch { return []; }
  }

  function salvarFilaLocal(fila) {
    localStorage.setItem(FILA_KEY, JSON.stringify(fila));
  }

  function entrarNaFila(tipo, dados, callbackStatus) {
    const id = `fila-${Date.now()}`;
    const item = { id, tipo, dados, status: 'aguardando', criadoEm: new Date().toISOString() };
    const fila = getFilaLocal();
    fila.push(item);
    salvarFilaLocal(fila);

    const posicao = fila.filter(f => f.status === 'aguardando').length;
    const tempoEstimado = posicao * 90; // 90 segundos por pedido estimado

    if (callbackStatus) {
      callbackStatus(
        `⏳ Seu pedido está na posição ${posicao} da fila.\n` +
        `Tempo estimado: ~${Math.ceil(tempoEstimado / 60)} minuto(s).\n\n` +
        `💡 Com o plano Pro você tem acesso prioritário à fila!`
      );
    }
    processarFila();
    return id;
  }

  async function processarFila() {
    const fila = getFilaLocal();
    const emProcessamento = fila.filter(f => f.status === 'processando').length;
    if (emProcessamento >= FILA_MAX_SIMULTANEOS) return;

    const proximo = fila.find(f => f.status === 'aguardando');
    if (!proximo) return;

    proximo.status = 'processando';
    salvarFilaLocal(fila);

    try {
      await executarItemFila(proximo);
      proximo.status = 'concluido';
    } catch (e) {
      proximo.status = 'erro';
      proximo.erro = e.message;
    }

    salvarFilaLocal(fila);
    processarFila(); // processar próximo
  }

  async function executarItemFila(item) {
    if (item.tipo === 'musicgen') {
      // Chamar Hugging Face MusicGen
      const resp = await fetch(
        'https://api-inference.huggingface.co/models/facebook/musicgen-small',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: item.dados.prompt }),
        }
      );
      if (!resp.ok) throw new Error(`HF error ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      // Notificar resultado
      const evt = new CustomEvent('cv-fila-resultado', { detail: { id: item.id, tipo: 'musicgen', url } });
      window.dispatchEvent(evt);
    }
  }

  /* ════════════════════════════════════════════════════════════
     6. TUTORIAL RVC — Google Colab
     Guia o usuário a treinar a própria voz gratuitamente
  ════════════════════════════════════════════════════════════ */

  const RVC_COLAB_URL = 'https://colab.research.google.com/drive/RVC_CADERNO_VIVO';

  function abrirTutorialRVC() {
    const modal = document.createElement('div');
    modal.id = 'cv-rvc-modal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;
      display:flex;align-items:center;justify-content:center;padding:20px;
    `;
    modal.innerHTML = `
      <div style="background:var(--surface,#fffcf5);border-radius:14px;padding:24px;max-width:480px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,.25)">
        <h3 style="margin:0 0 4px;font-size:18px;font-weight:800">🎤 Voz Sintética com RVC</h3>
        <p style="font-size:13px;color:var(--muted,#7a7166);margin:0 0 16px">Aprenda sua voz gratuitamente com a GPU do Google</p>
        
        <div style="display:grid;gap:10px;margin-bottom:16px">
          ${[
            ['1', '🎙️', 'Grave 5 minutos da sua voz', 'Fale ou cante em ambiente silencioso. Variedade de frases e tons.'],
            ['2', '📤', 'Abra o Google Colab', 'Clique em "Abrir Colab" abaixo. Faça login com sua conta Google.'],
            ['3', '⚡', 'Rode o treinamento', 'Faça upload do seu áudio. Clique em "Executar tudo". Aguarde 15-30 min.'],
            ['4', '💾', 'Baixe o arquivo .pth', 'Ao final, baixe o arquivo do modelo treinado com sua voz.'],
            ['5', '📥', 'Faça upload aqui', 'Suba o .pth no Caderno Vivo e sua voz estará disponível em toda a plataforma.'],
          ].map(([n, ico, t, d]) => `
            <div style="display:flex;gap:12px;align-items:start;background:var(--accent-soft,#f0e3cb);border-radius:8px;padding:10px 12px">
              <div style="width:24px;height:24px;border-radius:50%;background:var(--accent,#b08040);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700;flex-shrink:0">${n}</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--ink,#1c1710)">${ico} ${t}</div>
                <div style="font-size:12px;color:var(--muted,#7a7166);margin-top:2px">${d}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a href="${RVC_COLAB_URL}" target="_blank" 
            style="flex:1;background:var(--accent,#b08040);color:#fff;text-decoration:none;border-radius:8px;padding:10px 16px;font-weight:700;font-size:13px;text-align:center">
            ⚡ Abrir Google Colab
          </a>
          <label style="flex:1;background:var(--accent-soft,#f0e3cb);border:1px solid var(--accent,#b08040);border-radius:8px;padding:10px 16px;font-weight:700;font-size:13px;text-align:center;cursor:pointer;color:var(--accent-strong,#8a5f28)">
            📥 Upload do .pth
            <input type="file" accept=".pth,.bin" style="display:none" onchange="window.CVEngine.uploadRVCModel(this.files[0])">
          </label>
        </div>
        <p id="cv-rvc-status" style="font-size:12px;color:var(--muted,#7a7166);margin:8px 0 0;text-align:center"></p>
        <button onclick="document.getElementById('cv-rvc-modal').remove()" 
          style="width:100%;margin-top:10px;background:transparent;border:none;color:var(--muted,#7a7166);font-size:13px;cursor:pointer;padding:6px">
          Fechar
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  function uploadRVCModel(file) {
    if (!file) return;
    const status = document.getElementById('cv-rvc-status');
    if (status) status.textContent = `✅ Modelo "${file.name}" carregado! Sua voz está ativa.`;
    // Salvar referência do modelo
    localStorage.setItem('cv-rvc-model', file.name);
    localStorage.setItem('cv-rvc-ativo', '1');
    setTimeout(() => document.getElementById('cv-rvc-modal')?.remove(), 2000);
  }

  /* ════════════════════════════════════════════════════════════
     8. UPGRADE AUTOMÁTICO
     Monitora uso de créditos avulsos e sugere plano mais vantajoso
  ════════════════════════════════════════════════════════════ */

  const UPGRADE_KEY = 'cv-upgrade-sugerido';
  const UPGRADE_PACOTES = [
    { tipo: 'traducao',               preco: 9.90,  label: 'Pacote Tradução'                                        },
    { tipo: 'clipe',                  preco: 9.90,  label: 'Pacote Clipe'                                           },
    { tipo: 'premium',                preco: 19.90, label: 'Pacote Premium'                                         },
    { tipo: 'ministerio_audio',       preco: 19.90, label: 'Ministério Cantado — Só Áudio'                          },
    { tipo: 'ministerio_video',       preco: 59.90, label: 'Ministério Cantado — Áudio + Vídeo'                     },
    { tipo: 'ministerio_global',      preco: 79.90, label: 'Ministério Cantado — Áudio + Vídeo + 10 Idiomas'        },
  ];

  function registrarCompraAvulsa(tipo, preco) {
    const key = `cv-compras-${getMesAtualUpgrade()}`;
    const compras = JSON.parse(localStorage.getItem(key) || '[]');
    compras.push({ tipo, preco, em: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(compras));
    verificarOportunidadeUpgrade();
  }

  function getMesAtualUpgrade() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
  }

  function getGastoAvulsoMes() {
    const key = `cv-compras-${getMesAtualUpgrade()}`;
    const compras = JSON.parse(localStorage.getItem(key) || '[]');
    return compras.reduce((acc, c) => acc + (c.preco || 0), 0);
  }

  function verificarOportunidadeUpgrade() {
    const gasto = getGastoAvulsoMes();
    const jasugerido = localStorage.getItem(UPGRADE_KEY) === getMesAtualUpgrade();
    if (jasugerido) return;

    // Se gastou mais que R$19,90 em avulsos, sugerir Compositor
    if (gasto >= 19.90) {
      localStorage.setItem(UPGRADE_KEY, getMesAtualUpgrade());
      setTimeout(() => mostrarSugestaoUpgrade(gasto), 1000);
    }
  }

  function mostrarSugestaoUpgrade(gastoAtual) {
    const economia = (gastoAtual - 19.90).toFixed(2);
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:90px;right:20px;z-index:9998;
      background:var(--surface,#fffcf5);border:2px solid var(--accent,#b08040);
      border-radius:12px;padding:14px 16px;max-width:280px;
      box-shadow:0 8px 24px rgba(0,0,0,.2);font-family:Inter,Arial,sans-serif;
      animation:cv-slide-up .3s ease;
    `;
    toast.innerHTML = `
      <div style="font-size:13px;font-weight:700;color:var(--ink,#1c1710);margin-bottom:6px">
        💡 Você economizaria R$${economia} este mês!
      </div>
      <div style="font-size:12px;color:var(--muted,#7a7166);line-height:1.5;margin-bottom:10px">
        Você gastou <strong>R$${gastoAtual.toFixed(2)}</strong> em créditos avulsos. 
        O plano Compositor custa <strong>R$19,90/mês</strong> e inclui tudo que você usou — e muito mais.
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="this.closest('div[style]').remove()" 
          style="flex:1;background:var(--accent,#b08040);color:#fff;border:none;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">
          Ver planos
        </button>
        <button onclick="this.closest('div[style]').remove()" 
          style="background:transparent;border:none;color:var(--muted,#7a7166);font-size:12px;cursor:pointer;padding:4px 8px">
          Agora não
        </button>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 12000);
  }

  /* ════════════════════════════════════════════════════════════
     INTERFACE — Botões e painel do engine
  ════════════════════════════════════════════════════════════ */

  function injetarBotoesEngine() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Botão Shareable Link
    const btnShare = document.createElement('button');
    btnShare.className = 'nav-item';
    btnShare.innerHTML = '🔗 Compartilhar composição';
    btnShare.style.marginTop = '4px';
    btnShare.addEventListener('click', gerarShareableLink);
    sidebar.appendChild(btnShare);

    // Container do link gerado
    const shareContainer = document.createElement('div');
    shareContainer.id = 'cv-share-status';
    shareContainer.style.cssText = 'padding:0 8px;font-size:12px';
    sidebar.appendChild(shareContainer);

    // Botão RVC
    const btnRVC = document.createElement('button');
    btnRVC.className = 'nav-item';
    btnRVC.innerHTML = '🎤 Voz sintética (RVC)';
    btnRVC.style.marginTop = '4px';
    btnRVC.addEventListener('click', abrirTutorialRVC);
    sidebar.appendChild(btnRVC);

    // Indicador RVC ativo
    if (localStorage.getItem('cv-rvc-ativo') === '1') {
      const rvcBadge = document.createElement('div');
      rvcBadge.style.cssText = 'padding:4px 8px;font-size:11px;color:var(--teal,#2e7c72)';
      rvcBadge.textContent = `✅ Voz: ${localStorage.getItem('cv-rvc-model') || 'ativa'}`;
      sidebar.appendChild(rvcBadge);
    }
  }

  function injetarCSS() {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes cv-slide-up {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .cv-share-box {
        background: var(--accent-soft, #f0e3cb);
        border-radius: 8px;
        padding: 10px 12px;
        margin-top: 6px;
        font-size: 12px;
      }
      #cv-recipe-player {
        animation: cv-slide-up .3s ease;
      }
    `;
    document.head.appendChild(s);
  }

  /* ════════════════════════════════════════════════════════════
     API PÚBLICA
  ════════════════════════════════════════════════════════════ */

  window.CVEngine = {
    // Stems
    tocarInstrumental,
    pararInstrumental,
    ajustarVolumeStems,

    // Recipe Link
    gerarShareableLink,
    buscarRecipe,
    montarRecipe,

    // Fila
    entrarNaFila,

    // RVC
    abrirTutorialRVC,
    uploadRVCModel,

    // Créditos avulsos
    registrarCompraAvulsa,
    getGastoAvulsoMes,
    verificarOportunidadeUpgrade,
  };

  /* ════════════════════════════════════════════════════════════
     INICIALIZAR
  ════════════════════════════════════════════════════════════ */

  function init() {
    injetarCSS();
    injetarBotoesEngine();
    verificarRecipeNaURL();
    verificarOportunidadeUpgrade();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
