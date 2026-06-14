—# OPEN_ISSUES — Caderno Vivo
**Atualizado:** 2026-06-14

## CRITICO — Bloqueia funcionalidades em producao

### [CRIT-1] GROQ_API_KEY nao esta no Vercel
- **Efeito:** Todas as chamadas de AI (Maestro, traducao, etc) falham silenciosamente ou usam fallback MyMemory
- **Acao:** Vercel dashboard → caderno-vivo → Settings → Environment Variables → adicionar GROQ_API_KEY
- **Valor:** Pegar em https://console.groq.com

### [CRIT-2] SUPABASE_URL e SUPABASE_KEY nao estao no Vercel
- **Efeito:** Banco de dados nao conecta; cache e persistencia desativados
- **Acao:** Vercel dashboard → Settings → Environment Variables → adicionar SUPABASE_URL e SUPABASE_ANON_KEY
- **Valor:** Pegar em https://supabase.com → projeto → Settings → API

## IMPORTANTE — Salas nao totalmente funcionais

### [IMP-1] Sala Maestro — sem AI real
- Depende de CRIT-1 (GROQ_API_KEY)
- Placeholder visual funcional, mas composicao AI nao processa

### [IMP-2] Sala Internacional — fallback apenas
- Traducao usa MyMemory (gratis, limitado) em vez de Groq
- Depende de CRIT-1

### [IMP-3] Cofre do Artista — sem persistencia
- Creditos calculados em memoria apenas
- Depende de CRIT-2 (Supabase)

## PENDENTE — Limpeza

### [PEND-1] Fechar PR #1 (Google API key — obsoleto)
- PR criado para adicionar Google/Gemini key — migrado para Groq, nao precisa mais
- Acao: github.com/Douglassrf/caderno-vivo/pull/1 → Close pull request

## RESOLVIDOS NESTA SESSAO (2026-06-14)
- [x] Dark theme CSS completo (PR #3)
- [x] Migracao Gemini → Groq (PR #4)
- [x] vercel.json configurado (PR #5)
- [x] 90 features auditadas (PR #6)
- [x] translate.js fallback sem travar (PR #7)
- [x] hybrid-router validacao tipo (PR #7)
- [x] orchestrator MyMemory hardening (PR #7)
- [x] Starfield 240 estrelas futuristico (PR #8)
- [x] Sistema de memoria criado (memory/ folder)
