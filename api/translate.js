/* ================================================================
   ENDPOINT SERVERLESS — Caderno Vivo
   Arquivo: api/translate.js

   A chave do Gemini fica NO SERVIDOR (Vercel Environment Variables).
   O navegador NUNCA vê a chave — zero exposição.

   Como funciona:
   1. O app.js chama POST /api/translate com o texto e idioma
   2. Este arquivo recebe, chama o Gemini com a chave segura
   3. Devolve só a tradução — a chave nunca sai do servidor
================================================================ */

export default async function handler(req, res) {

  /* ── CORS — permitir chamadas do próprio domínio ── */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  /* ── Ler a chave do ambiente — nunca exposta ── */
  const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Chave do Gemini não configurada no servidor.' });
  }

  /* ── Receber dados do app.js ── */
  const { lyrics, targetLang, mode, market, title } = req.body;

  if (!lyrics || !targetLang) {
    return res.status(400).json({ error: 'Campos obrigatórios: lyrics e targetLang' });
  }

  /* ── Modos de adaptação ── */
  const MODOS = {
    singable:   'singable and natural to sing, preserving syllable count and rhythm',
    faithful:   'faithful to the original meaning and emotion',
    rhyme:      'with natural rhymes matching the original rhyme scheme',
    emotional:  'deeply emotional, preserving the feeling and soul of the original',
    commercial: 'commercial and catchy, suitable for radio hits',
  };

  const modeDesc = MODOS[mode] || MODOS.singable;

  const prompt = `You are a professional music translator and lyricist specializing in adapting songs for international markets.

TASK: Translate and adapt the following song lyrics to ${targetLang}.

SONG TITLE: "${title || 'Untitled'}"
TARGET MARKET: ${market || targetLang}
ADAPTATION MODE: ${modeDesc}

RULES:
1. Preserve the emotional meaning and soul of each line
2. Keep the syllable count as close as possible (important for singing)
3. Maintain rhyme scheme where the mode allows
4. Use natural, conversational ${targetLang} — not literal translation
5. Adapt cultural references to resonate with the target audience
6. Keep the same song structure (verses, chorus, bridge)
7. Return ONLY the translated lyrics — no explanations, no labels

ORIGINAL LYRICS:
${lyrics}

TRANSLATED LYRICS (${targetLang}):`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      }),
    });

    if (!geminiResp.ok) {
      const err = await geminiResp.text();
      throw new Error(`Gemini error ${geminiResp.status}: ${err}`);
    }

    const data = await geminiResp.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translated) {
      throw new Error('Gemini retornou resposta vazia.');
    }

    return res.status(200).json({ translated });

  } catch (error) {
    console.error('Erro na tradução:', error.message);

    /* ── Fallback: MyMemory API (grátis, sem chave) ── */
    try {
      const langCodes = {
        'English': 'en', 'Spanish': 'es', 'French': 'fr', 'Italian': 'it',
        'German': 'de', 'Japanese': 'ja', 'Korean': 'ko', 'Arabic': 'ar',
        'Hindi': 'hi', 'Mandarin Chinese': 'zh', 'Russian': 'ru', 'Turkish': 'tr',
        'Polish': 'pl', 'Dutch': 'nl', 'Swedish': 'sv', 'Greek': 'el',
        'Hebrew': 'he', 'Thai': 'th', 'Vietnamese': 'vi', 'Indonesian': 'id',
        'Swahili': 'sw', 'Bengali': 'bn', 'Urdu': 'ur', 'Persian/Farsi': 'fa',
        'Ukrainian': 'uk', 'Romanian': 'ro', 'Hungarian': 'hu', 'Czech': 'cs',
        'Bulgarian': 'bg', 'Croatian': 'hr', 'Slovak': 'sk', 'Filipino': 'tl',
        'Malay': 'ms', 'Norwegian': 'no', 'Danish': 'da', 'Finnish': 'fi',
        'Portuguese': 'pt', 'Brazilian Portuguese': 'pt-BR',
      };

      const langCode = langCodes[targetLang] || 'en';
      const lines = lyrics.split('\n').filter(l => l.trim());

      const translated = await Promise.all(lines.map(async line => {
        if (!line.trim()) return '';
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(line)}&langpair=pt|${langCode}`;
        const r = await fetch(url);
        if (r.ok) {
          const d = await r.json();
          return d.responseData?.translatedText || line;
        }
        return line;
      }));

      return res.status(200).json({
        translated: translated.join('\n'),
        fallback: true,
      });

    } catch (fallbackError) {
      return res.status(500).json({
        error: 'Serviço de tradução temporariamente indisponível.',
        detail: error.message,
      });
    }
  }
}
