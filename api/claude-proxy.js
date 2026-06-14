/* ================================================================
   ENDPOINT SERVERLESS — Claude Proxy (Powered by Groq)
   Arquivo: api/claude-proxy.js

   IMPORTANTE: Esta rota NÃO usa mais a API da Anthropic.
   Ela aceita requisições no formato Anthropic (model, messages,
   max_tokens) e as redireciona para o Groq usando GROQ_API_KEY.

   Retorna resposta no mesmo formato Anthropic que o browser
   já conhece:  { content: [{ type:'text', text:'...' }] }
================================================================ */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

function anthropicContentToText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(part => part.text || '').join('\n');
  return '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.error('[claude-proxy] GROQ_API_KEY não configurada.');
    return res.status(200).json({
      content: [{
        type: 'text',
        text: 'Maestro temporariamente indisponível. Configure GROQ_API_KEY no Vercel.',
      }],
    });
  }

  const { messages, max_tokens, system } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      content: [{ type: 'text', text: 'Requisição inválida: campo messages ausente.' }],
    });
  }

  const groqMessages = [];
  if (system && typeof system === 'string' && system.trim()) {
    groqMessages.push({ role: 'system', content: system.trim() });
  }

  messages.forEach((message) => {
    const content = anthropicContentToText(message.content).trim();
    if (content) {
      groqMessages.push({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content,
      });
    }
  });

  if (!groqMessages.some(message => message.role === 'user')) {
    return res.status(200).json({
      content: [{ type: 'text', text: 'Mensagem vazia. Por favor, envie um prompt.' }],
    });
  }

  try {
    const groqResp = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.75,
        max_tokens: max_tokens || 1024,
      }),
    });

    if (!groqResp.ok) {
      const errText = await groqResp.text();
      console.error(`[claude-proxy] Groq ${groqResp.status}:`, errText);
      throw new Error(`Groq retornou status ${groqResp.status}`);
    }

    const data = await groqResp.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) throw new Error('Groq retornou resposta vazia.');

    return res.status(200).json({
      id: `msg_groq_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model: GROQ_MODEL,
      stop_reason: 'end_turn',
      content: [{ type: 'text', text }],
    });
  } catch (error) {
    console.error('[claude-proxy] Erro tratado:', error.message);

    return res.status(200).json({
      id: `msg_err_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model: GROQ_MODEL,
      stop_reason: 'error',
      content: [{
        type: 'text',
        text: 'Maestro está descansando por um instante. Tente novamente em alguns segundos! 🎵',
      }],
    });
  }
}
