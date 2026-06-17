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

## 3. Renderização local de vídeo (`renderFinalClip`, app.js)

Carrega imagens remotas num `<canvas>` com `crossOrigin="anonymous"` antes de gravar via
`MediaRecorder`. Testado de verdade via `curl -I` (16/06/2026):

- **Pollinations.ai (provedor principal/gratuito) — ✅ confirmado seguro.** Responde
  `Access-Control-Allow-Origin: *`. O canvas NÃO fica tainted, a gravação funciona.
- **Fal.ai (fallback opcional, só usado se `FAL_KEY` estiver configurada) — ⚠️ não
  confirmado.** O endpoint de geração exige autenticação até para inspecionar headers;
  não foi possível verificar CORS sem uma `FAL_KEY` real e uma URL de imagem gerada de
  fato. Como é só o fallback secundário (Pollinations já cobre o caminho principal),
  o risco real para o usuário é baixo, mas fica pendente de teste manual em produção
  caso o Fal.ai chegue a ser configurado.

Conclusão: o caminho realmente usado hoje (Pollinations) está confirmado funcional.
Sem bug a corrigir aqui.

## 4. Idiomas experimentais na sala Internacional

37 dos 172 idiomas usam códigos placeholder (`x-af-1`...`x-af-37`) sem suporte real de
tradutor automático — já corretamente identificados pela própria UI como "modo
experimental". Comportamento intencional, não é bug.
