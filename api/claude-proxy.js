/* ================================================================
   ENDPOINT SERVERLESS — Claude Proxy (Powered by Google Gemini)
   Arquivo: api/claude-proxy.js

   IMPORTANTE: Esta rota NÃO usa mais a API da Anthropic.
   Ela aceita requisições no formato Anthropic (model, messages,
   max_tokens) e as redireciona para o Google Gemini usando
   GEMINI_API_KEY — sem necessidade de ANTHROPIC_API_KEY.

   Retorna resposta no mesmo formato Anthropic que o browser
   já conhece:  { content: [{ type:'text', text:'...' }] }
   → nenhum arquivo de cliente precisou ser alterado.
================================================================ */

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  /* ── Única chave necessária: Google Gemini ── */
  const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('[claude-proxy] GEMINI_API_KEY não configurada.');
    return res.status(200).json({
      content: [{
        type: 'text',
        text: 'Maestro temporariamente indisponível. Configure GEMINI_API_KEY no Vercel.',
      }],
    });
  }

  /* ── Receber payload no formato Anthropic ── */
  const { messages, max_tokens, system } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      content: [{ type: 'text', text: 'Requisição inválida: campo messages ausente.' }],
    });
  }

  /* ── Montar prompt para o Gemini ── */
  // Concatena system prompt + mensagens do usuário em texto único
  const parts = [];

  if (system && typeof system === 'string' && system.trim()) {
    parts.push({ text: `[INSTRUÇÕES DO SISTEMA]\n${system.trim()}\n\n` });
  }

  // Pega o conteúdo da última mensagem do usuário
  const lastMsg = messages[messages.length - 1];
  const userText = typeof lastMsg.content === 'string'
    ? lastMsg.content
    : Array.isArray(lastMsg.content)
      ? lastMsg.content.map(c => c.text || '').join('\n')
      : '';

  if (!userText.trim()) {
    return res.status(200).json({
      content: [{ type: 'text', text: 'Mensagem vazia. Por favor, envie um prompt.' }],
    });
  }

  parts.push({ text: userText });

  /* ── Chamar Gemini ── */
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: max_tokens || 1024,
        },
      }),
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error(`[claude-proxy] Gemini ${geminiResp.status}:`, errText);
      throw new Error(`Gemini retornou status ${geminiResp.status}`);
    }

    const data = await geminiResp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error('Gemini retornou resposta vazia.');
    }

    /* ── Retornar no formato Anthropic que o browser espera ── */
    return res.status(200).json({
      id:         `msg_gemini_${Date.now()}`,
      type:       'message',
      role:       'assistant',
      model:      'gemini-2.0-flash',
      stop_reason:'end_turn',
      content:    [{ type: 'text', text }],
    });

  } catch (error) {
    /* ── Falha tratada: log-only, nunca quebra o browser ── */
    console.error('[claude-proxy] Erro tratado:', error.message);

    return res.status(200).json({
      id:         `msg_err_${Date.now()}`,
      type:       'message',
      role:       'assistant',
      model:      'gemini-2.0-flash',
      stop_reason:'error',
      content:    [{
        type: 'text',
        text: 'Maestro está descansando por um instante. Tente novamente em alguns segundos! 🎵',
      }],
    });
  }
}
