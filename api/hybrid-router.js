/* ================================================================
ENDPOINT SERVERLESS — Hybrid AI Router
Arquivo: api/hybrid-router.js

Sistema Hibrido Inteligente - o usuario NUNCA ve qual API esta sendo usada.
Tipos: text, lyrics, translation, storyboard, mentor, image
Variaveis Vercel: GROQ_API_KEY (obrigatoria), FAL_KEY (opcional)
================================================================ */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL    = 'llama-3.1-8b-instant';

const CREDIT_COST = {
  text: 1, translation: 1, mentor: 2, image: 2,
  storyboard: 3, lyrics: 5, audio: 5, video: 10,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  const { type, payload } = req.body;
  if (!type)    return res.status(400).json({ error: 'Campo "type" obrigatorio.' });
  if (!payload) return res.status(400).json({ error: 'Campo "payload" obrigatorio.' });

  try {
    if (type === 'image') return await handleImage(res, payload);
    return await handleText(res, type, payload);
  } catch (err) {
    console.error('[hybrid-router] Erro:', err.message);
    return res.status(500).json({ error: 'Servico temporariamente indisponivel.' });
  }
}

async function handleText(res, type, payload) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY nao configurada.' });

  const groqResp = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: buildPrompt(type, payload) }],
      temperature: 0.82,
      max_tokens: payload.maxTokens || 1800,
    }),
  });
  if (!groqResp.ok) throw new Error(`Groq ${groqResp.status}`);
  const data = await groqResp.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq retornou vazio.');
  return res.status(200).json({ result: text, provider: 'groq', model: GROQ_MODEL, type, creditsUsed: CREDIT_COST[type] || 1 });
}

async function handleImage(res, payload) {
  const { prompt, width = 768, height = 768, style = 'cinematic, professional, high quality' } = payload;
  if (!prompt) return res.status(400).json({ error: 'Prompt de imagem obrigatorio.' });
  const fullPrompt = `${prompt}, ${style}`;

  // Tentativa 1: Pollinations.ai — gratis, sem API key
  try {
    const encoded = encodeURIComponent(fullPrompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now()}`;
    const check = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6000) });
    if (check.ok) return res.status(200).json({ imageUrl: url, provider: 'pollinations', type: 'image', creditsUsed: CREDIT_COST.image });
  } catch (e) { console.warn('[hybrid-router] Pollinations:', e.message); }

  // Tentativa 2: Fal.ai — precisa de FAL_KEY no Vercel
  const FAL_KEY = process.env.FAL_KEY;
  if (FAL_KEY) {
    try {
      const falResp = await fetch('https://fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${FAL_KEY}` },
        body: JSON.stringify({ prompt: fullPrompt, image_size: { width, height }, num_inference_steps: 4, num_images: 1 }),
      });
      if (falResp.ok) {
        const falData = await falResp.json();
        const imageUrl = falData.images?.[0]?.url;
        if (imageUrl) return res.status(200).json({ imageUrl, provider: 'fal-ai', type: 'image', creditsUsed: CREDIT_COST.image });
      }
    } catch (e) { console.warn('[hybrid-router] Fal.ai:', e.message); }
  }
  return res.status(503).json({ error: 'Geracao de imagem temporariamente indisponivel.' });
}

function buildPrompt(type, payload) {
  const p = payload;
  if (type === 'lyrics') {
    return `Voce e um compositor profissional brasileiro especializado em ${p.genero || 'MPB'}.\nCrie uma letra COMPLETA sobre: "${p.tema}"\nEmocao: ${p.emocao || 'autentica'} | Estilo: ${p.estilo || 'contemporaneo'}\n\nFormato:\nTITULO: [titulo]\nBPM: [numero] | Tom: [ex: La menor]\n\n[VERSO 1]\n[PRE-REFRAO]\n[REFRAO]\n[VERSO 2]\n[REFRAO]\n[PONTE]\n[REFRAO FINAL]\n\nRetorne APENAS a letra.`;
  }
  if (type === 'translation') {
    return `Tradutor musical profissional. Adapte para ${p.targetLang || 'ingles'} de forma ${p.mode || 'cantavel'}.\n\nLETRA:\n${p.lyrics}\n\nRetorne APENAS a letra traduzida.`;
  }
  if (type === 'storyboard') {
    return `Diretor de videoclipes. Crie storyboard para "${p.titulo || 'Sem titulo'}" (tom: ${p.tom || 'cinematografico'}).\nLetra: ${(p.letra || '').substring(0, 400)}\n\nRetorne JSON com: conceito_geral, paleta_cores, cenas (6 cenas: numero, tempo, descricao, camera, locacao, clima, prompt_imagem).\nRetorne APENAS o JSON.`;
  }
  if (type === 'mentor') {
    return `Mentor Criativo de composicao musical. Letra:\n${p.letra}\nIntencao: ${p.intencao || 'melhorar'}\n\nFeedback em 3 partes: 1. O que esta forte 2. O que evoluir 3. Sugestao concreta. Max 4 paragrafos.`;
  }
  return p.prompt || p.text || String(p);
}
