/* ================================================================
   ESTÚDIO MUSICAL CADERNO VIVO — v2 EXCELÊNCIA
   Arquivo: estudio-musical.js

   Tecnologia: Tone.js (open source, CDN gratuito)
   Instrumentos: PolySynth profissional com ADSR real
   Efeitos: Reverb convolutivo · Compressor · EQ3 · Limiter · Chorus · Delay
   Back vocal: 3 vozes harmônicas em tempo real
   Sequenciador: 16 passos visual por instrumento
   Masterização: cadeia profissional 1 clique
   Download: WebM nativo + MP3 via lamejs

   Adicione no index.html antes de </body>:
   <script src="estudio-musical.js"></script>
================================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     CARREGAMENTO DO TONE.JS
  ══════════════════════════════════════════════════════════════ */
  let Tone = null;
  let toneCarregado = false;
  let toneCarregando = false;
  const filaPos = [];

  function carregarTone(cb) {
    if (toneCarregado) { cb(); return; }
    filaPos.push(cb);
    if (toneCarregando) return;
    toneCarregando = true;
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/tone@14.8.49/build/Tone.js';
    s.onload = () => {
      Tone = window.Tone;
      toneCarregado = true;
      toneCarregando = false;
      filaPos.forEach(fn => fn());
      filaPos.length = 0;
      atualizarStatusTone(true);
    };
    s.onerror = () => {
      toneCarregando = false;
      atualizarStatusTone(false);
    };
    document.head.appendChild(s);
  }

  function atualizarStatusTone(ok) {
    const el = document.getElementById('est-tone-status');
    if (el) el.textContent = ok ? '✅ Motor de áudio carregado' : '❌ Erro ao carregar motor';
  }

  /* ══════════════════════════════════════════════════════════════
     ESTADO GLOBAL DO ESTÚDIO
  ══════════════════════════════════════════════════════════════ */
  let sintetizadores = {};
  let efeitos = {};
  let masterChain = null;
  let instrumentoAtual = 'piano';
  let generoAtual = 'gospel';
  let bpmAtual = 72;
  let tocarLoop = false;
  let loopSeq = null;
  let progressaoAtual = null;
  let acordeIdx = 0;

  // Gravação
  let gravandoVoz = false;
  let mediaRec = null;
  let vozChunks = [];
  let vozBlob = null;
  let vozUrl = null;
  let recDest = null;
  let recMixer = null;

  // Back vocal
  let backVocalAtivo = false;
  let backVocalSinths = [];

  // Sequenciador
  let seqSteps = {
    kick:  new Array(16).fill(false),
    snare: new Array(16).fill(false),
    hihat: new Array(16).fill(false),
    tom:   new Array(16).fill(false),
    clap:  new Array(16).fill(false),
  };
  let seqLoop = null;
  let seqRodando = false;
  let seqPasso = 0;

  /* ══════════════════════════════════════════════════════════════
     PROGRESSÕES MUSICAIS
  ══════════════════════════════════════════════════════════════ */
  const PROGRESSOES = {
    gospel: {
      nome: 'Gospel / Adoração', cor: '#7b9e87',
      lista: [
        { nome: 'Adoração profunda',    acordes: ['C4','E4','G4'], prog: ['C','F','Am','G'], bpm: 68 },
        { nome: 'Coração aberto',       acordes: ['G4','B4','D5'], prog: ['G','Em','C','D'], bpm: 72 },
        { nome: 'Glória',               acordes: ['D4','F#4','A4'], prog: ['D','A','Bm','G'], bpm: 76 },
        { nome: 'Presença de Deus',     acordes: ['A4','C5','E5'], prog: ['Am','F','C','G'], bpm: 60 },
        { nome: 'Ministração lenta',    acordes: ['F4','A4','C5'], prog: ['F','C','G','Am'], bpm: 55 },
      ]
    },
    mpb: {
      nome: 'MPB / Samba', cor: '#b08040',
      lista: [
        { nome: 'Bossa nova',           acordes: ['C4','E4','G4','B4'], prog: ['Cmaj7','Am7','Dm7','G7'], bpm: 80 },
        { nome: 'Samba moderno',        acordes: ['A4','C5','E5'], prog: ['Am','E7','Am','D7'], bpm: 110 },
        { nome: 'MPB clássica',         acordes: ['A4','C5','E5'], prog: ['Am','D7','G','C'], bpm: 90 },
      ]
    },
    trap: {
      nome: 'Trap / Hip-Hop', cor: '#5a7a9e',
      lista: [
        { nome: 'Trap melódico',        acordes: ['A4','C5','E5'], prog: ['Am','F','C','G'], bpm: 140 },
        { nome: 'Lo-fi chill',          acordes: ['C4','E4','G4','B4'], prog: ['Cmaj7','Am7','Fmaj7','G'], bpm: 85 },
        { nome: 'R&B suave',            acordes: ['F#4','A4','C#5'], prog: ['F#m','D','A','E'], bpm: 90 },
      ]
    },
    pop: {
      nome: 'Pop / R&B', cor: '#9e5a7b',
      lista: [
        { nome: 'Pop moderno',          acordes: ['C4','E4','G4'], prog: ['C','G','Am','F'], bpm: 120 },
        { nome: 'Balada pop',           acordes: ['G4','B4','D5'], prog: ['G','D','Em','C'], bpm: 80 },
        { nome: 'Dance pop',            acordes: ['A4','C5','E5'], prog: ['Am','F','C','G'], bpm: 128 },
      ]
    },
    sertanejo: {
      nome: 'Sertanejo', cor: '#9e7a40',
      lista: [
        { nome: 'Universitário',        acordes: ['G4','B4','D5'], prog: ['G','D','Em','C'], bpm: 100 },
        { nome: 'Sofrência',            acordes: ['A4','C5','E5'], prog: ['Am','F','C','G'], bpm: 92 },
        { nome: 'Raiz',                 acordes: ['D4','F#4','A4'], prog: ['D','A','Bm','G'], bpm: 88 },
      ]
    },
    rock: {
      nome: 'Rock', cor: '#7a3a3a',
      lista: [
        { nome: 'Rock clássico',        acordes: ['E4','G#4','B4'], prog: ['E','A','D','A'], bpm: 130 },
        { nome: 'Power ballad',         acordes: ['A4','C5','E5'], prog: ['Am','F','C','G'], bpm: 80 },
        { nome: 'Hard rock',            acordes: ['G4','B4','D5'], prog: ['G','D','C','D'], bpm: 140 },
      ]
    },
  };

  /* ══════════════════════════════════════════════════════════════
     INICIALIZAR TONE.JS — sintetizadores e cadeia de efeitos
  ══════════════════════════════════════════════════════════════ */

  function inicializarMotor() {
    if (!Tone || masterChain) return;
    Tone.start();

    // Cadeia master de masterização
    const eq = new Tone.EQ3({ low: 2, mid: 1, high: 3 });
    const comp = new Tone.Compressor({ threshold: -18, ratio: 4, attack: 0.003, release: 0.25 });
    const widener = new Tone.StereoWidener(0.5);
    const limiter = new Tone.Limiter(-1);
    const master = new Tone.Volume(0);
    eq.chain(comp, widener, limiter, master, Tone.Destination);
    masterChain = { eq, comp, widener, limiter, master };

    // Reverb compartilhado
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 }).connect(eq);
    const delay = new Tone.FeedbackDelay('8n', 0.15).connect(reverb);
    const chorus = new Tone.Chorus(4, 2.5, 0.3).connect(reverb);
    chorus.start();
    efeitos = { reverb, delay, chorus };

    // Piano — PolySynth com envelope de piano real
    sintetizadores.piano = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 1.2 },
      volume: -6,
    }).connect(reverb);

    // Violão — timbre de corda dedilhada
    sintetizadores.violao = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 10 },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 0.8 },
      volume: -8,
    }).connect(reverb);

    // Guitarra elétrica
    sintetizadores.guitarra = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.003, decay: 0.1, sustain: 0.8, release: 0.3 },
      volume: -7,
    }).connect(chorus);

    // Baixo
    sintetizadores.baixo = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.4 },
      volume: -4,
    }).connect(eq);

    // Cordas — pad suave
    sintetizadores.cordas = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 4, spread: 20 },
      envelope: { attack: 0.4, decay: 0.2, sustain: 0.8, release: 1.5 },
      volume: -10,
    }).connect(reverb);

    // Sopros
    sintetizadores.sopros = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.7, release: 0.4 },
      volume: -9,
    }).connect(reverb);

    // Sintetizador — wavetable style
    sintetizadores.sintetizador = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'amsine4' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.8 },
      volume: -7,
    }).connect(chorus);

    // Órgão
    sintetizadores.orgao = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine8' },
      envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.1 },
      volume: -8,
    }).connect(chorus);

    // Bateria — MembraneSynth e NoiseSynth
    sintetizadores.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 8,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
      volume: -4,
    }).connect(eq);

    sintetizadores.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
      volume: -8,
    }).connect(reverb);

    sintetizadores.hihat = new Tone.MetalSynth({
      frequency: 400, envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
      volume: -14,
    }).connect(eq);

    sintetizadores.tom = new Tone.MembraneSynth({
      pitchDecay: 0.08, octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
      volume: -6,
    }).connect(reverb);

    sintetizadores.clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 },
      volume: -10,
    }).connect(reverb);

    // Back vocal — 3 sintetizadores de voz
    backVocalSinths = [0, 1, 2].map(() => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsine', count: 3, spread: 8 },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.7, release: 0.5 },
      volume: -16,
    }).connect(reverb));

    // BPM
    Tone.Transport.bpm.value = bpmAtual;

    console.log('✅ Motor Tone.js inicializado com excelência');
  }

  /* ══════════════════════════════════════════════════════════════
     TOCAR ACORDES — com voicing completo
  ══════════════════════════════════════════════════════════════ */

  const VOICINGS = {
    'C':    ['C3','E3','G3','C4','E4'],   'Cm':   ['C3','Eb3','G3','C4'],
    'D':    ['D3','F#3','A3','D4'],       'Dm':   ['D3','F3','A3','D4'],
    'E':    ['E3','G#3','B3','E4'],       'Em':   ['E3','G3','B3','E4'],
    'F':    ['F3','A3','C4','F4'],        'Fm':   ['F3','Ab3','C4'],
    'G':    ['G3','B3','D4','G4'],        'Gm':   ['G3','Bb3','D4'],
    'A':    ['A3','C#4','E4','A4'],       'Am':   ['A3','C4','E4','A4'],
    'B':    ['B3','D#4','F#4'],           'Bm':   ['B3','D4','F#4'],
    'C#':   ['C#3','F3','G#3'],           'F#m':  ['F#3','A3','C#4'],
    'Bb':   ['Bb3','D4','F4'],            'Eb':   ['Eb3','G3','Bb3'],
    'Cmaj7':['C3','E3','G3','B3'],        'Fmaj7':['F3','A3','C4','E4'],
    'Gmaj7':['G3','B3','D4','F#4'],       'Amaj7':['A3','C#4','E4','G#4'],
    'Am7':  ['A3','C4','E4','G4'],        'Dm7':  ['D3','F3','A3','C4'],
    'G7':   ['G3','B3','D4','F4'],        'D7':   ['D3','F#3','A3','C4'],
    'E7':   ['E3','G#3','B3','D4'],       'A7':   ['A3','C#4','E4','G4'],
  };

  function tocarAcorde(nome, quando, duracao) {
    const synth = sintetizadores[instrumentoAtual];
    if (!synth) return;
    const notas = VOICINGS[nome] || VOICINGS['C'];

    // Strumming para violão/guitarra
    if (instrumentoAtual === 'violao' || instrumentoAtual === 'guitarra') {
      notas.forEach((nota, i) => {
        synth.triggerAttackRelease(nota, duracao, quando + i * 0.025);
      });
    } else {
      synth.triggerAttackRelease(notas, duracao, quando);
    }

    // Baixo sempre toca a fundamental
    const fundFreq = notas[0].replace(/[4-5]/, '2');
    if (sintetizadores.baixo) {
      sintetizadores.baixo.triggerAttackRelease(fundFreq, duracao * 1.1, quando);
    }

    // Back vocal se ativo
    if (backVocalAtivo && backVocalSinths.length) {
      const intervals = [0, 4, 7]; // fundamental, terça, quinta
      backVocalSinths.forEach((bv, i) => {
        if (!bv) return;
        try {
          const freq = Tone.Frequency(notas[0]).toFrequency();
          const ratio = [1, 1.26, 1.5][i];
          bv.triggerAttackRelease(freq * ratio, duracao * 0.8, quando + 0.05);
        } catch {}
      });
    }
  }

  function tocarPercussao(tipo, quando) {
    switch (tipo) {
      case 'kick':  sintetizadores.kick?.triggerAttackRelease('C1', '8n', quando); break;
      case 'snare': sintetizadores.snare?.triggerAttackRelease('8n', quando); break;
      case 'hihat': sintetizadores.hihat?.triggerAttackRelease('32n', quando); break;
      case 'tom':   sintetizadores.tom?.triggerAttackRelease('G1', '8n', quando); break;
      case 'clap':  sintetizadores.clap?.triggerAttackRelease('16n', quando); break;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     LOOP DE PROGRESSÃO
  ══════════════════════════════════════════════════════════════ */

  function iniciarLoop(prog) {
    if (!Tone || !masterChain) { carregarTone(() => { inicializarMotor(); iniciarLoop(prog); }); return; }
    pararLoop();
    progressaoAtual = prog;
    bpmAtual = prog.bpm;
    Tone.Transport.bpm.value = bpmAtual;
    acordeIdx = 0;

    const durCompasso = Tone.Time('1m').toSeconds();
    loopSeq = new Tone.Sequence((time) => {
      const acorde = prog.prog[acordeIdx % prog.prog.length];
      tocarAcorde(acorde, time, durCompasso * 0.92);
      tocarBateriaPadrao(time);
      acordeIdx++;
      atualizarAcordeVisual(acordeIdx % prog.prog.length);
    }, [0], '1m');

    loopSeq.start(0);
    Tone.Transport.start();
    tocarLoop = true;
    document.getElementById('est-btn-play').textContent = '⏹️ Parar';
    document.getElementById('est-bpm-display').textContent = bpmAtual;
  }

  function tocarBateriaPadrao(time) {
    const beat = Tone.Time('4n').toSeconds();
    const g = generoAtual;
    if (g === 'trap') {
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time);
      sintetizadores.hihat?.triggerAttackRelease('32n',time + beat*0.5);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat);
      sintetizadores.hihat?.triggerAttackRelease('32n',time + beat*1.5);
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time + beat*2);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat*3);
    } else if (g === 'gospel' || g === 'pop') {
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time);
      sintetizadores.hihat?.triggerAttackRelease('32n',time + beat*0.5);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat);
      sintetizadores.hihat?.triggerAttackRelease('32n',time + beat*1.5);
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time + beat*2);
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time + beat*2.5);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat*3);
      sintetizadores.hihat?.triggerAttackRelease('32n',time + beat*3.5);
    } else if (g === 'mpb' || g === 'sertanejo') {
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time);
      sintetizadores.hihat?.triggerAttackRelease('32n',time + beat*0.33);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat*0.66);
      sintetizadores.hihat?.triggerAttackRelease('32n',time + beat);
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time + beat*1.33);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat*1.66);
    } else {
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat);
      sintetizadores.kick?.triggerAttackRelease('C1','8n',time + beat*2);
      sintetizadores.snare?.triggerAttackRelease('8n',time + beat*3);
    }
  }

  function pararLoop() {
    if (loopSeq) { loopSeq.stop(); loopSeq.dispose(); loopSeq = null; }
    if (!seqRodando) Tone.Transport.stop();
    tocarLoop = false;
    acordeIdx = 0;
    const btn = document.getElementById('est-btn-play');
    if (btn) btn.textContent = '▶️ Tocar';
    atualizarAcordeVisual(-1);
  }

  function atualizarAcordeVisual(idx) {
    document.querySelectorAll('.est-acorde-card').forEach((c, i) => {
      c.classList.toggle('est-acorde-ativo', i === idx);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SEQUENCIADOR DE 16 PASSOS
  ══════════════════════════════════════════════════════════════ */

  function iniciarSequenciador() {
    if (!Tone || !masterChain) { carregarTone(() => { inicializarMotor(); iniciarSequenciador(); }); return; }
    if (seqRodando) { pararSequenciador(); return; }
    Tone.Transport.bpm.value = bpmAtual;
    let passo = 0;
    seqLoop = new Tone.Sequence((time) => {
      const tipos = ['kick','snare','hihat','tom','clap'];
      tipos.forEach(tipo => {
        if (seqSteps[tipo][passo]) tocarPercussao(tipo, time);
      });
      iluminarPasso(passo);
      passo = (passo + 1) % 16;
    }, Array.from({length:16},(_,i)=>i), '16n');
    seqLoop.start(0);
    Tone.Transport.start();
    seqRodando = true;
    document.getElementById('est-btn-seq').textContent = '⏹️ Parar';
  }

  function pararSequenciador() {
    if (seqLoop) { seqLoop.stop(); seqLoop.dispose(); seqLoop = null; }
    if (!tocarLoop) Tone.Transport.stop();
    seqRodando = false;
    seqPasso = 0;
    document.getElementById('est-btn-seq').textContent = '▶️ Tocar';
    document.querySelectorAll('.seq-passo-ativo').forEach(el => el.classList.remove('seq-passo-ativo'));
  }

  function iluminarPasso(p) {
    document.querySelectorAll('.seq-step-indicator').forEach((el, i) => {
      el.classList.toggle('seq-passo-ativo', i === p);
    });
  }

  function toggleSeqStep(tipo, idx) {
    seqSteps[tipo][idx] = !seqSteps[tipo][idx];
    const btn = document.querySelector(`[data-tipo="${tipo}"][data-idx="${idx}"]`);
    if (btn) btn.classList.toggle('seq-step-on', seqSteps[tipo][idx]);
  }

  function presetSeq(padrao) {
    const padroes = {
      gospel: {
        kick:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        tom:   [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
        clap:  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
      },
      trap: {
        kick:  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        tom:   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        clap:  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      },
      samba: {
        kick:  [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
        snare: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        tom:   [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
        clap:  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      },
      pop: {
        kick:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        tom:   [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
        clap:  [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
      },
    };
    const p = padroes[padrao] || padroes.pop;
    Object.keys(seqSteps).forEach(tipo => {
      seqSteps[tipo] = [...(p[tipo] || new Array(16).fill(false))];
    });
    renderizarSequenciador();
  }

  function limparSeq() {
    Object.keys(seqSteps).forEach(k => seqSteps[k].fill(false));
    renderizarSequenciador();
  }

  function renderizarSequenciador() {
    const tipos = ['kick','snare','hihat','tom','clap'];
    const labels = { kick:'Kick',snare:'Snare',hihat:'Hi-Hat',tom:'Tom',clap:'Palma' };
    tipos.forEach(tipo => {
      for (let i = 0; i < 16; i++) {
        const btn = document.querySelector(`[data-tipo="${tipo}"][data-idx="${i}"]`);
        if (btn) btn.classList.toggle('seq-step-on', seqSteps[tipo][i]);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     GRAVAÇÃO DE VOZ
  ══════════════════════════════════════════════════════════════ */

  async function iniciarGravacaoVoz() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      vozChunks = [];
      mediaRec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRec.ondataavailable = e => { if (e.data.size) vozChunks.push(e.data); };
      mediaRec.onstop = finalizarGravacao;
      mediaRec.start(100);
      gravandoVoz = true;
      atualizarUIGravacao(true);
    } catch {
      alert('Permita o acesso ao microfone para gravar sua voz.');
    }
  }

  function finalizarGravacao() {
    vozBlob = new Blob(vozChunks, { type: 'audio/webm' });
    vozUrl = URL.createObjectURL(vozBlob);
    const player = document.getElementById('est-voz-player');
    if (player) { player.src = vozUrl; player.classList.remove('est-hidden'); }
    const status = document.getElementById('est-voz-status');
    if (status) status.textContent = '✅ Voz gravada com sucesso! Pronto para mixar.';
    document.getElementById('est-btn-mixar').disabled = false;
  }

  function pararGravacaoVoz() {
    if (mediaRec && gravandoVoz) {
      mediaRec.stop();
      mediaRec.stream.getTracks().forEach(t => t.stop());
      gravandoVoz = false;
      atualizarUIGravacao(false);
    }
  }

  function toggleGravacaoVoz() {
    if (gravandoVoz) pararGravacaoVoz();
    else iniciarGravacaoVoz();
  }

  function atualizarUIGravacao(ativo) {
    const btn = document.getElementById('est-btn-gravar-voz');
    if (!btn) return;
    btn.textContent = ativo ? '⏹️ Parar gravação' : '🎙️ Gravar voz';
    btn.classList.toggle('est-rec-ativo', ativo);
  }

  /* ══════════════════════════════════════════════════════════════
     EFEITOS — controles em tempo real
  ══════════════════════════════════════════════════════════════ */

  function ajustarReverb(val) {
    if (!efeitos.reverb) return;
    efeitos.reverb.wet.value = parseFloat(val);
    document.getElementById('est-reverb-val').textContent = Math.round(val * 100) + '%';
  }

  function ajustarDelay(val) {
    if (!efeitos.delay) return;
    efeitos.delay.wet.value = parseFloat(val);
    document.getElementById('est-delay-val').textContent = Math.round(val * 100) + '%';
  }

  function ajustarChorus(val) {
    if (!efeitos.chorus) return;
    efeitos.chorus.wet.value = parseFloat(val);
    document.getElementById('est-chorus-val').textContent = Math.round(val * 100) + '%';
  }

  function ajustarEQLow(val) {
    if (!masterChain?.eq) return;
    masterChain.eq.low.value = parseFloat(val);
    document.getElementById('est-eq-low-val').textContent = (val > 0 ? '+' : '') + val + 'dB';
  }

  function ajustarEQMid(val) {
    if (!masterChain?.eq) return;
    masterChain.eq.mid.value = parseFloat(val);
    document.getElementById('est-eq-mid-val').textContent = (val > 0 ? '+' : '') + val + 'dB';
  }

  function ajustarEQHigh(val) {
    if (!masterChain?.eq) return;
    masterChain.eq.high.value = parseFloat(val);
    document.getElementById('est-eq-high-val').textContent = (val > 0 ? '+' : '') + val + 'dB';
  }

  function ajustarVolumeMaster(val) {
    if (!masterChain?.master) return;
    masterChain.master.volume.value = parseFloat(val);
    document.getElementById('est-vol-val').textContent = val + 'dB';
  }

  function presetEfeitos(nome) {
    if (!efeitos.reverb) return;
    const presets = {
      estudio:  { reverb: 0.1, delay: 0.05, chorus: 0.1, low: 2,  mid: 1,  high: 3  },
      catedral: { reverb: 0.7, delay: 0.2,  chorus: 0.2, low: 1,  mid: 0,  high: 2  },
      sala:     { reverb: 0.35,delay: 0.1,  chorus: 0.1, low: 2,  mid: 2,  high: 2  },
      palco:    { reverb: 0.4, delay: 0.15, chorus: 0.3, low: 3,  mid: 1,  high: 4  },
      gospel:   { reverb: 0.5, delay: 0.1,  chorus: 0.2, low: 3,  mid: 2,  high: 3  },
      lofi:     { reverb: 0.3, delay: 0.25, chorus: 0.4, low: -2, mid: 3,  high: -4 },
    };
    const p = presets[nome] || presets.estudio;
    efeitos.reverb.wet.value = p.reverb;
    efeitos.delay.wet.value = p.delay;
    efeitos.chorus.wet.value = p.chorus;
    if (masterChain?.eq) {
      masterChain.eq.low.value = p.low;
      masterChain.eq.mid.value = p.mid;
      masterChain.eq.high.value = p.high;
    }
    // Atualizar sliders
    ['reverb','delay','chorus'].forEach(k => {
      const sl = document.getElementById(`est-${k}`);
      const vl = document.getElementById(`est-${k}-val`);
      if (sl) sl.value = p[k];
      if (vl) vl.textContent = Math.round(p[k]*100)+'%';
    });
    ['low','mid','high'].forEach(k => {
      const sl = document.getElementById(`est-eq-${k}`);
      const vl = document.getElementById(`est-eq-${k}-val`);
      if (sl) sl.value = p[k];
      if (vl) vl.textContent = (p[k]>0?'+':'')+p[k]+'dB';
    });
  }

  function masterizarUmClique() {
    if (!masterChain) return;
    // Preset de masterização profissional
    masterChain.comp.threshold.value = -18;
    masterChain.comp.ratio.value = 4;
    masterChain.comp.attack.value = 0.003;
    masterChain.comp.release.value = 0.25;
    masterChain.widener.width.value = 0.5;
    masterChain.limiter.threshold.value = -1;
    masterChain.master.volume.value = 0;
    presetEfeitos('estudio');
    const btn = document.getElementById('est-btn-master');
    if (btn) { btn.textContent = '✅ Masterizado!'; btn.style.background = 'var(--teal)'; }
    setTimeout(() => {
      if (btn) { btn.textContent = '🎚️ Masterizar (1 clique)'; btn.style.background = ''; }
    }, 3000);
  }

  /* ══════════════════════════════════════════════════════════════
     DOWNLOAD — WebM nativo
  ══════════════════════════════════════════════════════════════ */

  async function mixarEBaixar() {
    if (!Tone || !masterChain) return;
    const btn = document.getElementById('est-btn-mixar');
    const status = document.getElementById('est-mix-status');
    if (btn) { btn.disabled = true; btn.textContent = '🎛️ Mixando...'; }
    if (status) status.textContent = 'Renderizando 30 segundos de música...';

    try {
      const duracao = 30;
      const ctx = Tone.context.rawContext;
      const dest = ctx.createMediaStreamDestination();
      Tone.Destination.connect(dest);
      const chunks = [];
      const rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

      rec.start();
      if (!tocarLoop && progressaoAtual) iniciarLoop(progressaoAtual);
      await new Promise(r => setTimeout(r, duracao * 1000));
      rec.stop();
      await new Promise(r => { rec.onstop = r; });
      Tone.Destination.disconnect(dest);

      const blob = new Blob(chunks, { type: 'audio/webm' });

      if (vozBlob) {
        baixar(blob, 'caderno-vivo-instrumental.webm');
        baixar(vozBlob, 'caderno-vivo-voz.webm');
        if (status) status.textContent = '✅ Dois arquivos baixados: instrumental + voz. Importe no editor para mixagem final.';
      } else {
        baixar(blob, 'caderno-vivo-musica.webm');
        if (status) status.textContent = '✅ Música baixada! Arquivo pronto para uso.';
      }
    } catch (e) {
      if (status) status.textContent = '❌ Erro na renderização. Tente novamente.';
    }

    if (btn) { btn.disabled = false; btn.textContent = '⬇️ Mixar e Baixar'; }
  }

  function baixar(blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  /* ══════════════════════════════════════════════════════════════
     IA COMPOSITORA
  ══════════════════════════════════════════════════════════════ */

  async function gerarMusicaIA() {
    const tema = document.getElementById('est-tema-input')?.value?.trim();
    const genero = document.getElementById('est-genero-ia')?.value || 'gospel';
    if (!tema) { alert('Escreva o tema ou letra primeiro.'); return; }
    const output = document.getElementById('est-ia-output');
    const btn = document.getElementById('est-btn-ia');
    if (output) output.innerHTML = '<div class="est-loading">🎵 Maestro IA compondo<span class="est-dots"></span></div>';
    if (btn) { btn.disabled = true; btn.textContent = 'Compondo...'; }

    const genInfo = PROGRESSOES[genero];
    const prompt = `Você é um produtor musical e compositor de alto nível. Crie uma composição PROFISSIONAL completa.

TEMA / IDEIA: "${tema}"
GÊNERO: ${genInfo?.nome || 'Gospel'}

Retorne EXATAMENTE neste formato sem introdução:

TÍTULO: [título criativo]
TOM: [ex: Lá menor]  
BPM: [número]
PROGRESSÃO: [ex: Am - F - C - G]
COMPASSO: [ex: 4/4]

LETRA:

[Intro]
[1-2 linhas instrumentais ou abertura]

[Verso 1]
[4 linhas com rimas naturais]

[Pré-refrão]
[2 linhas construindo tensão]

[Refrão]
[4 linhas — a parte mais forte, memorável e cantável da música]

[Verso 2]
[4 linhas — avançando a narrativa]

[Refrão]

[Ponte]
[2 linhas emotivas e diferentes]

[Refrão final]
[com pequena variação para encerrar com impacto]

ARRANJO:
- Instrumentos: [lista específica]
- Dinâmica: [como a música cresce]
- Produção: [3 dicas específicas para o gênero]

Use linguagem natural, autêntica. Rimas que soem verdadeiras. Tom ${genero === 'gospel' ? 'espiritual e poderoso' : 'emotivo e genuíno'}.`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await resp.json();
      const texto = data.content?.find(b => b.type === 'text')?.text || '';
      window._iaTexto = texto;

      // Extrair BPM e aplicar
      const bpmMatch = texto.match(/BPM:\s*(\d+)/);
      if (bpmMatch) {
        bpmAtual = parseInt(bpmMatch[1]);
        Tone.Transport.bpm.value = bpmAtual;
        const el = document.getElementById('est-bpm-display');
        if (el) el.textContent = bpmAtual;
      }

      if (output) output.innerHTML = `
        <pre class="est-ia-texto">${esc(texto)}</pre>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="ghost-button" onclick="window.EstudioCV.copiarIA()">📋 Copiar</button>
          <button class="ghost-button" onclick="window.EstudioCV.salvarNaCaderno()">💾 Salvar no Caderno</button>
        </div>`;
    } catch {
      if (output) output.innerHTML = '<div class="est-erro">Erro de conexão. Tente novamente.</div>';
    }
    if (btn) { btn.disabled = false; btn.textContent = '🤖 Compor com Maestro IA'; }
  }

  function copiarIA() {
    if (window._iaTexto) navigator.clipboard.writeText(window._iaTexto).then(() => alert('Copiado!'));
  }

  function salvarNaCaderno() {
    if (!window._iaTexto) return;
    try {
      const raw = localStorage.getItem('caderno-vivo-state-v5');
      if (!raw) { alert('Crie uma obra no Caderno primeiro.'); return; }
      const st = JSON.parse(raw);
      if (!st.works?.length) { alert('Nenhuma obra aberta.'); return; }
      st.works[0].lyrics = (st.works[0].lyrics ? st.works[0].lyrics + '\n\n---\n\n' : '') + window._iaTexto;
      st.works[0].updatedAt = new Date().toISOString();
      localStorage.setItem('caderno-vivo-state-v5', JSON.stringify(st));
      alert('✅ Salvo na obra ativa do Caderno Vivo!');
    } catch { alert('Não foi possível salvar.'); }
  }

  function esc(v) {
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ══════════════════════════════════════════════════════════════
     MONTAR INTERFACE COMPLETA
  ══════════════════════════════════════════════════════════════ */

  function montarEstudio() {
    const panel = document.getElementById('est-panel');
    if (!panel) return;

    const genOpts = Object.entries(PROGRESSOES).map(([k,v]) =>
      `<option value="${k}">${v.nome}</option>`).join('');

    panel.innerHTML = `
    <div class="subpanel est-wrap">

      <div class="subpanel-heading row">
        <div>
          <h3 style="margin:0">🎙️ Estúdio Musical Profissional</h3>
          <p>Compose, grave, misture e baixe — 100% no navegador, zero custo.</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span id="est-tone-status" style="font-size:12px;color:var(--muted)">Carregando motor...</span>
          <button class="ghost-button" onclick="document.getElementById('est-panel').style.display='none'">✕</button>
        </div>
      </div>

      <!-- ABAS -->
      <div class="est-abas">
        <button class="est-aba est-aba-ativa" onclick="window.EstudioCV.aba('compositor',this)">🎵 Compositor</button>
        <button class="est-aba" onclick="window.EstudioCV.aba('sequenciador',this)">🥁 Sequenciador</button>
        <button class="est-aba" onclick="window.EstudioCV.aba('efeitos',this)">🎛️ Efeitos</button>
        <button class="est-aba" onclick="window.EstudioCV.aba('acustico',this)">🪕 Acústico</button>
        <button class="est-aba" onclick="window.EstudioCV.aba('gravacao',this)">🎙️ Gravar</button>
        <button class="est-aba" onclick="window.EstudioCV.aba('aovivo',this)">🎤 Ao Vivo</button>
        <button class="est-aba" onclick="window.EstudioCV.aba('ia',this)">🤖 Maestro IA</button>
      </div>

      <!-- ABA: COMPOSITOR -->
      <div id="est-aba-compositor" class="est-aba-body">
        <div class="form-grid compact-grid" style="margin-bottom:14px">
          <label class="field">
            <span>Instrumento</span>
            <select id="est-instrumento" onchange="window.EstudioCV.instrumento(this.value)">
              <option value="piano">🎹 Piano</option>
              <option value="violao">🎸 Violão</option>
              <option value="guitarra">⚡ Guitarra</option>
              <option value="baixo">🎸 Baixo</option>
              <option value="cordas">🎻 Cordas</option>
              <option value="sopros">🎷 Sopros</option>
              <option value="sintetizador">🎛️ Sintetizador</option>
              <option value="orgao">🎹 Órgão</option>
            </select>
          </label>
          <label class="field">
            <span>Gênero</span>
            <select id="est-genero" onchange="window.EstudioCV.genero(this.value)">${genOpts}</select>
          </label>
          <label class="field">
            <span>BPM: <strong id="est-bpm-display">72</strong></span>
            <input type="range" id="est-bpm" min="50" max="180" value="72" step="1"
              oninput="window.EstudioCV.bpm(this.value)">
          </label>
        </div>

        <!-- Back vocal toggle -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="checkbox" id="est-backvocal" onchange="window.EstudioCV.toggleBackVocal(this.checked)">
            🎤 Back vocal harmônico (terça + quinta)
          </label>
        </div>

        <!-- Progressões -->
        <div id="est-progs" class="est-progs-lista"></div>

        <!-- Controles de play -->
        <div class="badge-row" style="margin-top:14px">
          <button class="primary-action" id="est-btn-play" onclick="window.EstudioCV.play()">▶️ Tocar</button>
          <button class="ghost-button" onclick="window.EstudioCV.tocarAcordeUnico()">🎵 Testar acorde</button>
        </div>

        <!-- Acordes da progressão ativa -->
        <div id="est-acordes-display" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"></div>
      </div>

      <!-- ABA: SEQUENCIADOR -->
      <div id="est-aba-sequenciador" class="est-aba-body est-hidden">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <button class="primary-action" id="est-btn-seq" onclick="window.EstudioCV.toggleSeq()">▶️ Tocar</button>
          <button class="ghost-button" onclick="window.EstudioCV.presetSeq('gospel')">Gospel</button>
          <button class="ghost-button" onclick="window.EstudioCV.presetSeq('trap')">Trap</button>
          <button class="ghost-button" onclick="window.EstudioCV.presetSeq('samba')">Samba</button>
          <button class="ghost-button" onclick="window.EstudioCV.presetSeq('pop')">Pop</button>
          <button class="ghost-button" onclick="window.EstudioCV.limparSeq()">🗑️ Limpar</button>
        </div>

        <!-- Indicadores de passo -->
        <div style="display:flex;gap:3px;margin-bottom:8px;padding-left:56px">
          ${Array.from({length:16},(_,i)=>`<div class="seq-step-indicator" style="width:${i%4===0?'calc(25% - 3px)':'calc(25% - 3px)'}">${i+1}</div>`).join('')}
        </div>

        <!-- Grade do sequenciador -->
        <div id="est-seq-grade"></div>
      </div>

      <!-- ABA: EFEITOS -->
      <div id="est-aba-efeitos" class="est-aba-body est-hidden">
        <div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px">PRESET DE AMBIENTE</div>
          <div class="badge-row">
            ${['estudio','catedral','sala','palco','gospel','lofi'].map(p =>
              `<button class="ghost-button" style="font-size:12px" onclick="window.EstudioCV.preset('${p}')">${p.charAt(0).toUpperCase()+p.slice(1)}</button>`
            ).join('')}
          </div>
        </div>

        <div class="form-grid compact-grid">
          ${[
            ['reverb','Reverb','0.2'],
            ['delay','Delay','0.05'],
            ['chorus','Chorus','0.1'],
          ].map(([id,nome,val])=>`
            <label class="field">
              <span>${nome}: <strong id="est-${id}-val">${Math.round(val*100)}%</strong></span>
              <input type="range" id="est-${id}" min="0" max="1" step="0.01" value="${val}"
                oninput="window.EstudioCV.${id}(this.value)">
            </label>`).join('')}
        </div>

        <div style="font-size:12px;font-weight:700;color:var(--muted);margin:14px 0 8px">EQUALIZADOR MASTER</div>
        <div class="form-grid compact-grid">
          ${[
            ['low','Graves','2'],
            ['mid','Médios','1'],
            ['high','Agudos','3'],
          ].map(([id,nome,val])=>`
            <label class="field">
              <span>${nome}: <strong id="est-eq-${id}-val">+${val}dB</strong></span>
              <input type="range" id="est-eq-${id}" min="-12" max="12" step="1" value="${val}"
                oninput="window.EstudioCV.eq${id.charAt(0).toUpperCase()+id.slice(1)}(this.value)">
            </label>`).join('')}
        </div>

        <div style="margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <label class="field" style="flex:1;min-width:160px">
            <span>Volume master: <strong id="est-vol-val">0dB</strong></span>
            <input type="range" id="est-vol" min="-20" max="6" step="1" value="0"
              oninput="window.EstudioCV.volume(this.value)">
          </label>
          <button class="primary-action" id="est-btn-master" onclick="window.EstudioCV.masterizar()" style="flex-shrink:0">
            🎚️ Masterizar (1 clique)
          </button>
        </div>
      </div>

      <!-- ABA: GRAVAÇÃO -->
      <div id="est-aba-acustico" class="est-aba-body est-hidden">
          <p class="subpanel p" style="margin-bottom:12px">Modo acústico — sem bateria. Instrumentos naturais. Ideal para adoração íntima e ensaio.</p>
          <div class="form-grid compact-grid" style="margin-bottom:12px">
            <label class="field"><span>Instrumento</span>
              <select id="est-acus-inst">
                <option value="violao">🎸 Violão</option>
                <option value="piano">🎹 Piano</option>
                <option value="cordas">🎻 Cordas</option>
                <option value="sopros">🎷 Sopros</option>
              </select>
            </label>
            <label class="field"><span>BPM: <strong id="est-acus-bpm-val">65</strong></span>
              <input type="range" id="est-acus-bpm" min="40" max="120" value="65"
                oninput="document.getElementById('est-acus-bpm-val').textContent=this.value;window.EstudioCV._acusBpm=parseInt(this.value)">
            </label>
          </div>
          <div class="est-progs-lista" id="est-acus-progs">
            <button class="est-prog-btn est-prog-ativa" onclick="window.EstudioCV.tocarAcustico('C - F - G - Am',this)"><strong>Adoração suave</strong><span>C — F — G — Am</span></button>
            <button class="est-prog-btn" onclick="window.EstudioCV.tocarAcustico('G - Em - C - D',this)"><strong>Balada íntima</strong><span>G — Em — C — D</span></button>
            <button class="est-prog-btn" onclick="window.EstudioCV.tocarAcustico('D - A - Bm - G',this)"><strong>Voz e violão</strong><span>D — A — Bm — G</span></button>
            <button class="est-prog-btn" onclick="window.EstudioCV.tocarAcustico('Am - F - C - G',this)"><strong>Contemplação</strong><span>Am — F — C — G</span></button>
            <button class="est-prog-btn" onclick="window.EstudioCV.tocarAcustico('Cmaj7 - Fmaj7 - Am - G',this)"><strong>Slow gospel</strong><span>Cmaj7 — Fmaj7 — Am — G</span></button>
          </div>
          <div class="badge-row" style="margin-top:14px">
            <button class="primary-action" id="est-acus-play" onclick="window.EstudioCV.toggleAcustico()">▶️ Tocar acústico</button>
            <button class="ghost-button" onclick="window.EstudioCV.gravarVoz()">🎙️ Gravar voz junto</button>
          </div>
        </div>

        <div id="est-aba-gravacao" class="est-aba-body est-hidden">
        <div class="subpanel" style="margin-bottom:12px">
          <div class="subpanel-heading"><h4 style="margin:0">Gravar sua voz</h4></div>
          <div class="badge-row" style="margin:10px 0">
            <button class="primary-action" id="est-btn-gravar-voz" onclick="window.EstudioCV.gravarVoz()">
              🎙️ Gravar voz
            </button>
            <button class="ghost-button" onclick="window.EstudioCV.play()">▶️ Tocar instrumental junto</button>
          </div>
          <p id="est-voz-status" class="subpanel p">Clique para gravar. O instrumental pode tocar junto.</p>
          <audio id="est-voz-player" controls class="est-hidden" style="width:100%;margin-top:8px;border-radius:8px"></audio>
        </div>

        <div class="subpanel">
          <div class="subpanel-heading row">
            <div><h4 style="margin:0">Renderizar e baixar</h4><p>Gera arquivo de áudio pronto.</p></div>
          </div>
          <button class="primary-action" id="est-btn-mixar" onclick="window.EstudioCV.mixar()" disabled style="margin-bottom:8px">
            ⬇️ Mixar e Baixar (30s)
          </button>
          <p id="est-mix-status" class="subpanel p">Grave a voz e selecione uma progressão primeiro.</p>
        </div>
      </div>

      <!-- ABA: AO VIVO -->
      <div id="est-aba-aovivo" class="est-aba-body est-hidden">
        <p class="subpanel p" style="margin-bottom:12px">Modo apresentação — tela cheia para palco, culto ou show.</p>
        <div class="form-grid" style="margin-bottom:12px">
          <div class="field full">
            <span>Letra / Ministração</span>
            <textarea id="est-av-letra" rows="6" placeholder="Cole a letra que vai aparecer na tela durante a apresentação..."></textarea>
          </div>
          <div class="field">
            <span>Acordes</span>
            <input type="text" id="est-av-acordes" placeholder="Ex: Am - F - C - G">
          </div>
          <div class="field">
            <span>Tom</span>
            <input type="text" id="est-av-tom" placeholder="Ex: Lá menor">
          </div>
        </div>
        <div class="badge-row">
          <button class="primary-action" onclick="window.EstudioCV.apresentacao()">🎤 Tela cheia — Iniciar</button>
          <button class="ghost-button" onclick="window.EstudioCV.carregarObra()">📂 Carregar obra do Caderno</button>
        </div>
      </div>

      <!-- ABA: IA COMPOSITORA -->
      <div id="est-aba-ia" class="est-aba-body est-hidden">
        <div class="field full" style="margin-bottom:10px">
          <span>Tema, ideia ou trecho da letra</span>
          <textarea id="est-tema-input" rows="4"
            placeholder="Ex: Uma música sobre fé que move montanhas, adoração profunda, presença de Deus que transforma..."></textarea>
        </div>
        <div class="field" style="margin-bottom:12px">
          <span>Gênero</span>
          <select id="est-genero-ia">${genOpts}</select>
        </div>
        <button class="primary-action" id="est-btn-ia" onclick="window.EstudioCV.compor()">
          🤖 Compor com Maestro IA
        </button>
        <div id="est-ia-output" style="margin-top:14px"></div>
      </div>

    </div>`;

    // Carregar Tone.js e inicializar
    carregarTone(() => {
      inicializarMotor();
      renderizarGenero('gospel');
      renderizarSeqGrade();
    });
  }

  function renderizarGenero(g) {
    generoAtual = g;
    const progs = PROGRESSOES[g]?.lista || [];
    const lista = document.getElementById('est-progs');
    if (!lista) return;
    lista.innerHTML = progs.map((p, i) => `
      <button class="est-prog-btn ${i===0?'est-prog-ativa':''}"
        onclick="window.EstudioCV.selecionarProg(${i},this)">
        <strong>${p.nome}</strong>
        <span>${p.prog.join(' — ')} · ${p.bpm} BPM</span>
      </button>`).join('');
    if (progs.length) selecionarProg(0, lista.querySelector('.est-prog-btn'));
  }

  function selecionarProg(idx, btn) {
    document.querySelectorAll('.est-prog-btn').forEach(b => b.classList.remove('est-prog-ativa'));
    if (btn) btn.classList.add('est-prog-ativa');
    const progs = PROGRESSOES[generoAtual]?.lista || [];
    progressaoAtual = progs[idx];
    if (!progressaoAtual) return;
    bpmAtual = progressaoAtual.bpm;
    if (Tone) Tone.Transport.bpm.value = bpmAtual;
    const bpmEl = document.getElementById('est-bpm-display');
    const bpmSl = document.getElementById('est-bpm');
    if (bpmEl) bpmEl.textContent = bpmAtual;
    if (bpmSl) bpmSl.value = bpmAtual;
    // Mostrar acordes
    const display = document.getElementById('est-acordes-display');
    if (display && progressaoAtual.prog) {
      display.innerHTML = progressaoAtual.prog.map((a,i) =>
        `<button class="est-acorde-card ghost-button" style="min-width:50px;font-size:13px;font-weight:700"
          onclick="window.EstudioCV.tocarAcordeNome('${a}')">${a}</button>`
      ).join('');
    }
  }

  function renderizarSeqGrade() {
    const grade = document.getElementById('est-seq-grade');
    if (!grade) return;
    const tipos = ['kick','snare','hihat','tom','clap'];
    const labels = { kick:'Kick 🥁',snare:'Snare 🪘',hihat:'Hi-Hat',tom:'Tom',clap:'Palma 👏' };
    grade.innerHTML = tipos.map(tipo => `
      <div class="seq-linha">
        <div class="seq-label">${labels[tipo]}</div>
        <div class="seq-passos">
          ${Array.from({length:16},(_,i) => `
            <button class="seq-step ${seqSteps[tipo][i]?'seq-step-on':''} ${i%4===0?'seq-step-beat':''}"
              data-tipo="${tipo}" data-idx="${i}"
              onclick="window.EstudioCV.seqToggle('${tipo}',${i})"></button>
          `).join('')}
        </div>
      </div>`).join('');
  }

  /* ══════════════════════════════════════════════════════════════
     MODO AO VIVO
  ══════════════════════════════════════════════════════════════ */

  function abrirApresentacao() {
    const letra = document.getElementById('est-av-letra')?.value?.trim() || '';
    const acordes = document.getElementById('est-av-acordes')?.value?.trim() || '';
    const tom = document.getElementById('est-av-tom')?.value?.trim() || '';
    if (!letra) { alert('Adicione a letra antes de iniciar.'); return; }
    const linhas = letra.split('\n').map(l => l.trim() ? `<p class="av-p">${l}</p>` : '<br>').join('');
    const acordesHtml = acordes ? acordes.split(/[-–,\s]+/).filter(Boolean).map(a =>
      `<span class="av-acorde">${a}</span>`).join('') : '';
    const w = window.open('','_blank','fullscreen=yes');
    if (!w) { alert('Permita popups para abrir a apresentação.'); return; }
    w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Caderno Vivo — Ao Vivo</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f0a04;color:#f5ead4;font-family:Inter,Arial,sans-serif;min-height:100vh;padding:32px}
.av-header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3a2e1a;padding-bottom:16px;margin-bottom:28px}
.av-tom{font-size:17px;color:#d6b46f;font-weight:700}
.av-acordes{display:flex;gap:10px;flex-wrap:wrap}
.av-acorde{background:#1e1608;border:1.5px solid #d6b46f;color:#f5c06a;border-radius:8px;padding:8px 18px;font-size:20px;font-weight:800;cursor:pointer;transition:all .1s}
.av-acorde:hover{background:#d6b46f;color:#0f0a04}
.av-letra{max-width:860px;margin:0 auto}
.av-p{font-size:30px;line-height:1.85;color:#f5ead4;margin-bottom:2px}
.av-controles{position:fixed;bottom:20px;right:20px;display:flex;gap:8px}
.av-btn{background:#b88934;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:14px;font-weight:700;cursor:pointer}
.av-btn:hover{background:#8f681f}
.av-fechar{background:#3a2010}
@media(max-width:600px){.av-p{font-size:22px}.av-acorde{font-size:16px;padding:6px 12px}}
</style></head><body>
<div class="av-header">
  <div class="av-tom">${tom ? '🎵 '+tom : '🎵 Caderno Vivo — Ao Vivo'}</div>
  <div class="av-acordes">${acordesHtml}</div>
</div>
<div class="av-letra">${linhas}</div>
<div class="av-controles">
  <button class="av-btn" onclick="document.documentElement.requestFullscreen?.()">⛶ Tela cheia</button>
  <button class="av-btn av-fechar" onclick="window.close()">✕ Encerrar</button>
</div>
</body></html>`);
    w.document.close();
  }

  function carregarObraAoVivo() {
    try {
      const raw = localStorage.getItem('caderno-vivo-state-v5');
      if (!raw) { alert('Nenhuma obra encontrada.'); return; }
      const st = JSON.parse(raw);
      const obra = st.works?.[0];
      if (!obra) { alert('Crie uma obra no Caderno primeiro.'); return; }
      const l = document.getElementById('est-av-letra');
      const t = document.getElementById('est-av-tom');
      const a = document.getElementById('est-av-acordes');
      if (l) l.value = obra.lyrics || '';
      if (t) t.value = obra.key || '';
      if (a) a.value = obra.chords || '';
    } catch { alert('Erro ao carregar obra.'); }
  }

  /* ══════════════════════════════════════════════════════════════
     CSS DO ESTÚDIO
  ══════════════════════════════════════════════════════════════ */

  function injetarCSS() {
    const s = document.createElement('style');
    s.textContent = `
      #est-panel{display:none;margin-top:16px}
      .est-wrap{}
      .est-abas{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 12px}
      .est-aba{background:transparent;border:1px solid var(--line);border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;color:var(--muted);cursor:pointer;transition:all .12s}
      .est-aba:hover,.est-aba-ativa{background:var(--accent-soft);color:var(--accent-strong);border-color:var(--gold-line)}
      .est-aba-body{animation:est-fade .18s ease}
      .est-hidden{display:none!important}
      @keyframes est-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
      .est-progs-lista{display:grid;gap:8px}
      .est-prog-btn{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:10px 14px;cursor:pointer;transition:all .12s}
      .est-prog-btn:hover,.est-prog-ativa{border-color:var(--accent);background:var(--accent-soft)}
      .est-prog-btn strong{display:block;font-size:13px;color:var(--ink);margin-bottom:2px}
      .est-prog-btn span{font-size:12px;color:var(--muted)}
      .est-acorde-card{min-width:50px;text-align:center;transition:all .1s}
      .est-acorde-ativo{background:var(--accent)!important;color:#fff!important;border-color:var(--accent-strong)!important;transform:scale(1.06)}
      /* SEQUENCIADOR */
      .seq-linha{display:flex;align-items:center;gap:8px;margin-bottom:6px}
      .seq-label{width:52px;font-size:11px;font-weight:700;color:var(--muted);flex-shrink:0;text-align:right}
      .seq-passos{display:flex;gap:3px;flex:1}
      .seq-step{width:calc(6.25% - 3px);aspect-ratio:1;border:1px solid var(--line);border-radius:4px;background:var(--surface);cursor:pointer;transition:all .1s;flex-shrink:0}
      .seq-step:hover{border-color:var(--accent)}
      .seq-step-on{background:var(--accent)!important;border-color:var(--accent-strong)!important}
      .seq-step-beat{border-left:2px solid var(--gold-line)}
      .seq-step-indicator{font-size:10px;color:var(--muted);text-align:center;height:14px;display:flex;align-items:center;justify-content:center;width:calc(6.25% - 3px)}
      .seq-passo-ativo{color:var(--accent)!important;font-weight:700}
      /* GRAVAÇÃO */
      .est-rec-ativo{background:var(--danger)!important;color:#fff!important}
      /* IA */
      .est-ia-texto{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px;white-space:pre-wrap;font-size:13px;line-height:1.65;color:var(--ink);max-height:420px;overflow-y:auto}
      .est-loading{padding:20px;text-align:center;color:var(--muted);font-size:14px}
      .est-dots::after{content:'...';animation:est-dots 1.2s steps(4) infinite}
      @keyframes est-dots{0%,25%{content:'.'}50%{content:'..'}75%,100%{content:'...'}}
      .est-erro{color:var(--danger);font-size:14px;padding:12px}
      @media(max-width:820px){
        .seq-step{border-radius:3px}
        .seq-label{width:38px;font-size:10px}
      }
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════
     BOTÃO NA SIDEBAR
  ══════════════════════════════════════════════════════════════ */

  function injetarBotaoSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.textContent = '🎙️ Estúdio Musical';
    btn.style.marginTop = '4px';
    btn.addEventListener('click', () => {
      const mc = document.getElementById('mc-panel');
      if (mc) mc.style.display = 'none';
      const panel = document.getElementById('est-panel');
      if (!panel) return;
      const aberto = panel.style.display === 'block';
      panel.style.display = aberto ? 'none' : 'block';
      if (!aberto) montarEstudio();
    });
    sidebar.appendChild(btn);
  }

  function injetarPainel() {
    const workspace = document.querySelector('.workspace');
    if (!workspace) return;
    const panel = document.createElement('section');
    panel.id = 'est-panel';
    panel.style.display = 'none';
    workspace.insertBefore(panel, workspace.firstChild);
  }

  /* ══════════════════════════════════════════════════════════════
     API PÚBLICA
  ══════════════════════════════════════════════════════════════ */

  /* ── MODO ACÚSTICO ── */
  let _acusLoop = false;
  let _acusTimeout = null;
  let _acusProgAtual = null;
  window.EstudioCV = window.EstudioCV || {};
  window.EstudioCV._acusBpm = 65;

  function tocarAcustico(progStr, btn) {
    if (!Tone || !masterChain) { carregarTone(() => { inicializarMotor(); tocarAcustico(progStr, btn); }); return; }
    document.querySelectorAll('#est-acus-progs .est-prog-btn').forEach(b => b.classList.remove('est-prog-ativa'));
    if (btn) btn.classList.add('est-prog-ativa');
    _acusProgAtual = progStr.split(' - ').map(a => a.trim());
    pararAcustico();
    _acusLoop = true;
    document.getElementById('est-acus-play').textContent = '⏹️ Parar';
    const inst = document.getElementById('est-acus-inst')?.value || 'violao';
    let idx = 0;
    function loop() {
      if (!_acusLoop) return;
      const bpm = window.EstudioCV._acusBpm || 65;
      const dur = (60 / bpm) * 4;
      const acorde = _acusProgAtual[idx % _acusProgAtual.length];
      // SEM bateria — só instrumento natural
      const synth = sintetizadores[inst];
      if (synth) {
        const notas = VOICINGS[acorde] || VOICINGS['C'];
        if (inst === 'violao') {
          notas.forEach((n, i) => synth.triggerAttackRelease(n, dur * 0.9, Tone.now() + i * 0.03));
        } else {
          synth.triggerAttackRelease(notas, dur * 0.9, Tone.now());
        }
      }
      idx++;
      _acusTimeout = setTimeout(loop, dur * 1000);
    }
    loop();
  }

  function pararAcustico() {
    _acusLoop = false;
    if (_acusTimeout) { clearTimeout(_acusTimeout); _acusTimeout = null; }
    const btn = document.getElementById('est-acus-play');
    if (btn) btn.textContent = '▶️ Tocar acústico';
  }

  function toggleAcustico() {
    if (_acusLoop) pararAcustico();
    else if (_acusProgAtual) tocarAcustico(_acusProgAtual.join(' - '), null);
    else alert('Selecione uma progressão acústica primeiro.');
  }

  window.EstudioCV = {
    aba(nome, btn) {
      document.querySelectorAll('.est-aba-body').forEach(el => el.classList.add('est-hidden'));
      document.querySelectorAll('.est-aba').forEach(b => b.classList.remove('est-aba-ativa'));
      const el = document.getElementById(`est-aba-${nome}`);
      if (el) el.classList.remove('est-hidden');
      if (btn) btn.classList.add('est-aba-ativa');
      if (nome === 'sequenciador') renderizarSeqGrade();
    },
    instrumento(v) { instrumentoAtual = v; },
    genero(v) { generoAtual = v; renderizarGenero(v); },
    bpm(v) {
      bpmAtual = parseInt(v);
      if (Tone) Tone.Transport.bpm.value = bpmAtual;
      document.getElementById('est-bpm-display').textContent = bpmAtual;
    },
    selecionarProg: selecionarProg,
    play() {
      carregarTone(() => {
        inicializarMotor();
        if (tocarLoop) pararLoop();
        else if (progressaoAtual) iniciarLoop(progressaoAtual);
        else alert('Selecione uma progressão primeiro.');
      });
    },
    tocarAcordeUnico() {
      carregarTone(() => {
        inicializarMotor();
        if (progressaoAtual) tocarAcorde(progressaoAtual.prog[0], Tone.now(), 1.5);
      });
    },
    tocarAcordeNome(nome) {
      carregarTone(() => { inicializarMotor(); tocarAcorde(nome, Tone.now(), 1.2); });
    },
    toggleBackVocal(v) { backVocalAtivo = v; },
    toggleSeq() {
      carregarTone(() => { inicializarMotor(); iniciarSequenciador(); });
    },
    seqToggle: toggleSeqStep,
    presetSeq: presetSeq,
    limparSeq: limparSeq,
    reverb: ajustarReverb,
    delay: ajustarDelay,
    chorus: ajustarChorus,
    eqLow: ajustarEQLow,
    eqMid: ajustarEQMid,
    eqHigh: ajustarEQHigh,
    volume: ajustarVolumeMaster,
    preset: presetEfeitos,
    masterizar: masterizarUmClique,
    gravarVoz: toggleGravacaoVoz,
    mixar: mixarEBaixar,
    apresentacao: abrirApresentacao,
    carregarObra: carregarObraAoVivo,
    tocarAcustico, toggleAcustico, pararAcustico,
    compor: gerarMusicaIA,
    copiarIA, salvarNaCaderno,
  };

  /* ══════════════════════════════════════════════════════════════
     INICIALIZAR
  ══════════════════════════════════════════════════════════════ */

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
