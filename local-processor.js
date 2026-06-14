/* ================================================================
PROCESSADOR LOCAL — Caderno Vivo  |  local-processor.js
Camada 1 do sistema de 4 camadas (frontend, carregado no browser).
Detecta WebGPU/WASM e processa localmente com Transformers.js.
Tipos locais: translation, mentor, lyrics
Tipos remotos: image, audio, video, storyboard -> api/orchestrator.js
================================================================ */

const ORCHESTRATOR_URL = '/api/orchestrator';
const LOCAL_MODELS = {
  translation: { model: 'Xenova/nllb-200-distilled-600M', task: 'translation' },
  mentor:      { model: 'Xenova/phi-3-mini-4k-instruct',  task: 'text-generation' },
  lyrics:      { model: 'Xenova/phi-3-mini-4k-instruct',  task: 'text-generation' },
};
const LANG_CODES = {
  'ingles':'eng_Latn','espanhol':'spa_Latn','frances':'fra_Latn','italiano':'ita_Latn',
  'alemao':'deu_Latn','japones':'jpn_Jpan','coreano':'kor_Hang','portugues':'por_Latn',
  'arabe':'arb_Arab','hindi':'hin_Deva','mandarin':'zho_Hans','russo':'rus_Cyrl',
};

let _tfLoaded=false, _pipeline=null, _loadedModel=null, _gpuOk=null, _localOn=true;

export async function process({ type, payload, onProgress = () => {} }) {
  onProgress(0, 'Iniciando...');
  if (_localOn && LOCAL_MODELS[type]) {
    try {
      onProgress(10, 'Verificando processamento local...');
      if (await checkSupport()) {
        onProgress(20, 'Processando localmente (privacidade total)...');
        const r = await processLocal(type, payload, onProgress);
        if (r) { onProgress(100, 'Concluido localmente!'); return { ...r, layer: 1, cached: false }; }
      }
    } catch(e) { console.warn('[local-processor] Camada 1 falhou:', e.message); }
  }
  onProgress(40, 'Conectando ao servidor...');
  return callBackend(type, payload, onProgress);
}

export function disableLocal() { _localOn = false; }
export function enableLocal()  { _localOn = true; }
export async function preloadModel(type) {
  if (!LOCAL_MODELS[type]) return false;
  try { await loadPipeline(type); return true; } catch { return false; }
}

async function checkSupport() {
  if (_gpuOk !== null) return _gpuOk;
  const mem = navigator.deviceMemory ?? 4;
  _gpuOk = mem >= 2;
  console.log('[local-processor] RAM estimada: ' + mem + 'GB, local: ' + _gpuOk);
  return _gpuOk;
}

async function processLocal(type, payload, onProgress) {
  const pipe = await loadPipeline(type, onProgress);
  if (!pipe) return null;
  if (type === 'translation') return localTranslation(pipe, payload, onProgress);
  return localGeneration(pipe, type, payload, onProgress);
}

async function loadPipeline(type, onProgress = () => {}) {
  if (_loadedModel === type && _pipeline) return _pipeline;
  const cfg = LOCAL_MODELS[type];
  if (!cfg) return null;
  if (!_tfLoaded) {
    onProgress(15, 'Carregando motor de IA local...');
    await loadScript('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
    _tfLoaded = true;
  }
  onProgress(20, 'Carregando modelo ' + cfg.model.split('/')[1] + '...');
  const { pipeline } = window.Transformers ?? {};
  if (!pipeline) return null;
  _pipeline = await pipeline(cfg.task, cfg.model, {
    progress_callback: (p) => {
      if (p.status === 'downloading') onProgress(Math.round(20 + (p.progress ?? 0) * 0.3), 'Baixando: ' + Math.round(p.progress ?? 0) + '%');
    },
  });
  _loadedModel = type;
  return _pipeline;
}

async function localTranslation(pipe, payload, onProgress) {
  const { lyrics, targetLang = 'ingles' } = payload;
  const tgt = LANG_CODES[targetLang] ?? 'eng_Latn';
  const parts = lyrics.split('\n\n').filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    onProgress(55 + Math.round(i / parts.length * 35), 'Traduzindo parte ' + (i+1) + '/' + parts.length + '...');
    const r = await pipe(parts[i], { src_lang: 'por_Latn', tgt_lang: tgt, max_new_tokens: 200 });
    out.push(r[0]?.translation_text ?? parts[i]);
  }
  return { result: out.join('\n\n'), provider: 'local-wasm' };
}

async function localGeneration(pipe, type, payload, onProgress) {
  const prompt = type === 'lyrics'
    ? '<|user|>Crie uma letra de musica brasileira sobre "' + payload.tema + '" estilo ' + (payload.genero || 'MPB') + '.<|end|><|assistant|>'
    : '<|user|>Analise esta letra e de feedback criativo em 3 pontos:\n' + payload.letra + '<|end|><|assistant|>';
  onProgress(55, 'Gerando com IA local...');
  const r = await pipe(prompt, { max_new_tokens: type === 'lyrics' ? 600 : 350, temperature: 0.8, do_sample: true, repetition_penalty: 1.1 });
  const text = r?.[0]?.generated_text?.replace(prompt, '').trim();
  if (!text) return null;
  return { result: text, provider: 'local-webgpu' };
}

async function callBackend(type, payload, onProgress) {
  onProgress(50, 'Verificando cache...');
  const resp = await fetch(ORCHESTRATOR_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, payload }) });
  if (resp.status === 202) {
    const d = await resp.json();
    onProgress(100, d.message ?? 'Sua obra esta em processamento.');
    return { queued: true, layer: 4, message: d.message, estimatedMinutes: d.estimatedMinutes };
  }
  if (!resp.ok) { const e = await resp.json().catch(() => ({ error: 'Erro desconhecido' })); throw new Error(e.error ?? 'HTTP ' + resp.status); }
  const data = await resp.json();
  onProgress(100, data.cached ? 'Entregue do cache!' : 'Processado via ' + (data.provider ?? 'servidor') + '.');
  return data;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) return resolve();
    const s = document.createElement('script');
    s.src = src; s.type = 'module';
    s.onload = resolve; s.onerror = () => reject(new Error('Falha ao carregar ' + src));
    document.head.appendChild(s);
  });
}
