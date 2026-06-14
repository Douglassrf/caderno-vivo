/* ================================================================
   ENDPOINT SERVERLESS — Maestro IA
   Arquivo: api/maestro.js

   Gerencia todas as chamadas de IA do projeto:
   - Composição de música (letra + cifra + arranjo)
   - Roteiro de videoclipe cinematográfico
   - Ministério Cantado
   - Mentor Criativo
================================================================ */

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const GEMINI_API_KEY = process.env.CHAVE_API_DO_GOOGLE;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Chave do Gemini não configurada no servidor.' });
  }

  const { tipo, dados } = req.body;
  if (!tipo || !dados) {
    return res.status(400).json({ error: 'Campos obrigatórios: tipo e dados' });
  }

  /* ── Montar prompt por tipo de requisição ── */
  let prompt = '';

  if (tipo === 'composicao') {
    const { tema, genero } = dados;
    prompt = `Você é um produtor musical e compositor de alto nível. Crie uma composição PROFISSIONAL completa.

TEMA / IDEIA: "${tema}"
GÊNERO: ${genero || 'Gospel'}

Retorne EXATAMENTE neste formato sem introdução:

TÍTULO: [título criativo]
TOM: [ex: Lá menor]
BPM: [número]
PROGRESSÃO: [ex: Am - F - C - G]
COMPASSO: [ex: 4/4]

LETRA:

[Intro]
[1-2 linhas]

[Verso 1]
[4 linhas com rimas naturais]

[Pré-refrão]
[2 linhas]

[Refrão]
[4 linhas — a parte mais forte e memorável]

[Verso 2]
[4 linhas]

[Refrão]

[Ponte]
[2 linhas emotivas]

[Refrão final]
[com pequena variação]

ARRANJO:
- Instrumentos: [lista]
- Dinâmica: [como cresce]
- Produção: [3 dicas específicas]

Use linguagem natural e autêntica. Rimas verdadeiras.`;

  } else if (tipo === 'videoclipe') {
    const { letra, conceito, estilo, paleta, humor, locacao, personagem } = dados;
    prompt = `Você é um diretor de videoclipes cinematográficos de alto nível. Crie um roteiro completo.

LETRA DA MÚSICA:
${letra}

CONCEITO: ${conceito || 'cinematográfico e emocional'}
ESTILO: ${estilo || 'realismo cinematográfico'}
PALETA: ${paleta || 'tons naturais com acento dourado'}
CLIMA: ${humor || 'emocional e poético'}
LOCAÇÃO: ${locacao || 'coerente com a letra'}
PERSONAGEM: ${personagem || 'protagonista da canção'}

Crie um roteiro com EXATAMENTE este formato para cada cena:

CENA [N] — [PARTE DA MÚSICA]
Duração: [segundos]s
Localização: [onde]
Ação: [o que acontece]
Câmera: [tipo de plano e movimento]
Lighting: [iluminação e atmosfera]
Prompt de imagem: [descrição detalhada para IA de imagem, sem texto, sem logos]
Prompt de vídeo: [descrição para Runway/Luma/Sora]

Crie pelo menos 8 cenas cobrindo toda a música.`;

  } else if (tipo === 'ministerio') {
    const { conteudo, intencao, tom, cifras } = dados;
    prompt = `Você é um especialista em ministração cantada e pregação musical. Estruture o conteúdo abaixo em um ROTEIRO DE MINISTRAÇÃO CANTADA.

CONTEÚDO: "${conteudo}"
INTENÇÃO: ${intencao}
TOM BASE: ${tom}
CIFRAS: ${cifras}

Crie um roteiro com estes blocos:

[INTRO]
(indicação: tom suave, voz em repouso)
CIFRA: ${tom}
"[linha da ministração]"
↳ [instrução de entrega]

[CRESCIMENTO]
(indicação: emoção sobe)
CIFRA: [próxima cifra]
"[linha]"
↳ [instrução]

[PICO]
(indicação: voz plena, explosão emocional)
CIFRA: [cifra de tensão]
"[linha mais poderosa]"
↳ [instrução]

[PAUSA SAGRADA]
(indicação: silêncio — 4 a 8 segundos)
↳ deixar o silêncio ministrar

[POUSO]
(indicação: voz suave, encerramento com paz)
CIFRA: ${tom}
"[linha final]"
↳ [instrução]

REGRAS: preserve as PALAVRAS ORIGINAIS do conteúdo. Tom positivo e curador.`;

  } else if (tipo === 'mentor') {
    const { letra, modo, parte, intencao } = dados;
    prompt = `Você é um Mentor Criativo especializado em composição musical brasileira.

LETRA ATUAL:
${letra}

MODO: ${modo}
PARTE: ${parte}
INTENÇÃO: ${intencao}

${modo === 'complete' ? 'Complete o trecho preservando a identidade e voz do autor.' : ''}
${modo === 'improve' ? 'Melhore o trecho sem perder a identidade original.' : ''}
${modo === 'new' ? 'Crie uma letra nova baseada na intenção fornecida.' : ''}
${modo === 'metric' ? 'Analise a métrica e sugira ajustes para melhorar o ritmo.' : ''}

Responda de forma direta e prática. Máximo 3 parágrafos.`;

  } else {
    return res.status(400).json({ error: `Tipo desconhecido: ${tipo}` });
  }

  /* ── Chamar Gemini ── */
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 2000 },
      }),
    });

    if (!geminiResp.ok) {
      throw new Error(`Gemini error ${geminiResp.status}`);
    }

    const data = await geminiResp.json();
    const resultado = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!resultado) throw new Error('Resposta vazia do Gemini.');

    return res.status(200).json({ resultado });

  } catch (error) {
    console.error(`Erro no Maestro IA (${tipo}):`, error.message);
    return res.status(500).json({
      error: 'Maestro IA temporariamente indisponível.',
      detail: error.message,
    });
  }
}
