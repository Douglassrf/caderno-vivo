'use strict';
function baseUrl(req){ const proto=req.headers['x-forwarded-proto']||'https'; const host=req.headers.host; return `${proto}://${host}`; }
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const { text='', targetLanguage='inglês', sourceLanguage='português do Brasil', style='natural' } = req.body || {};
    if (!String(text).trim()) return res.status(400).json({ error: 'Texto obrigatório.' });
    const r = await fetch(`${baseUrl(req)}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      system: 'Você é um tradutor musical que preserva rima, métrica, intenção emocional e cantabilidade. Entregue somente a tradução/adaptação final.',
      messages: [{ role:'user', content:`Traduza/adapte de ${sourceLanguage} para ${targetLanguage}. Estilo: ${style}.\n\n${text}` }], temperature:0.55, max_tokens:1800 }) });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json({ translation: data.content || '', targetLanguage });
  } catch (err) { return res.status(500).json({ error: err.message || 'Erro interno.' }); }
};
