# Pendências Técnicas Conhecidas — Caderno Vivo

Documento gerado pela auditoria do agente (branch `agent/deepsync`) para registrar
achados que **não são bugs para corrigir agora**, mas decisões de produto/arquitetura
que precisam ser tomadas deliberadamente, fora do ritmo de correção autônoma de bugs.

## 1. Funcionalidades construídas no backend, nunca conectadas ao frontend

- `credits-manager.js` — sistema de créditos/quota. Não está em nenhum `<script>` de
  `index.html`. `index.html` tem inclusive um comentário reconhecendo isso: *"Ler
  créditos do credits-manager.js se disponível"*.
- `local-processor.js` — fallback local de geração (Hugging Face MusicGen) e fila de
  processamento. Também não carregado por `index.html`.
- `api/hybrid-router.js` — endpoint backend completo (texto, imagem via
  Pollinations/Fal.ai, tradução, storyboard, mentor) com sistema de custo em créditos.
  **Zero chamadas no frontend atual.**
- `api/orchestrator.js` — só é chamado por `local-processor.js`, que por sua vez não
  está carregado. Na prática, inacessível pelo usuário real hoje.

**Decisão do agente (16/06/2026):** não conectar essas peças autonomamente. Conectar
um sistema de créditos e um router de IA alternativo ao app em produção é trabalho de
integração de feature com decisões de UX/cobrança que afetam o usuário final — não é
"corrigir um bug", é mudar o que o produto faz. Misturar isso com a missão de
estabilidade (que é a prioridade explícita) é o tipo de escopo que um engenheiro
sênior não embute silenciosamente num sprint de bugfix. Tratado como dívida técnica
documentada, não como erro do app.

## 2. "Backvocal" — funcionalidade citada mas inexistente no código

Nenhuma referência a "backvocal" (ou variações) foi encontrada em todo o repositório.
Não é um bug — é uma funcionalidade que não existe no Caderno Vivo hoje, então não há
nada para testar ou corrigir nesse item especificamente.

## 3. Renderização local de vídeo (`renderFinalClip`, app.js) — risco latente não confirmado

Carrega imagens remotas (Pollinations/Fal.ai) num `<canvas>` com `crossOrigin="anonymous"`
antes de gravar via `MediaRecorder`. Se o servidor de origem da imagem não enviar o
header `Access-Control-Allow-Origin`, o canvas fica "tainted" e a gravação pode falhar
silenciosamente. Não foi possível confirmar em runtime real (sem navegador/rede neste
ambiente) — fica registrado como ponto de atenção para teste manual em produção, não
como bug confirmado.

## 4. Idiomas experimentais na sala Internacional

37 dos 172 idiomas usam códigos placeholder (`x-af-1`...`x-af-37`) sem suporte real de
tradutor automático — já corretamente identificados pela própria UI como "modo
experimental". Comportamento intencional, não é bug.
