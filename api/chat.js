'use strict';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) return res.status(500).json({ error: 'GROQ_API_KEY não configurada.' });
    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const system = body.system || 'Você é um assistente criativo do Caderno Vivo.';
    const payload = {
      model: MODEL,
      messages: [{ role: 'system', content: String(system) }, ...messages.map(m => ({ role: m.role || 'user', content: String(m.content || '') }))],
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
      max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 1600
    };
    const groq = await fetch(GROQ_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(payload) });
    const data = await groq.json().catch(() => ({}));
    if (!groq.ok) return res.status(groq.status).json({ error: data.error?.message || 'Erro ao chamar Groq.' });
    return res.status(200).json({ content: data.choices?.[0]?.message?.content || '', usage: data.usage || null });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno.' });
  }
};
