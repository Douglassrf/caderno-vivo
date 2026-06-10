# MISSÃO 05 — Multiusuário Completo

## Status
Preparada tecnicamente. Execução real depende de Supabase configurado.

## Objetivo
Garantir que cada usuário veja apenas suas próprias obras, dossiês, exports, pagamentos e entitlements.

## Base já disponível

```txt
supabase/migrations/001_poc_anti_idor.sql
supabase/migrations/002_product_security_foundation.sql
src/authService.js
src/storageAdapter.js
```

## O que foi validado no pacote

- Migrations contêm `auth.uid()` como base de isolamento.
- Tabelas sensíveis têm RLS habilitado e forçado.
- `works` e `dossiers` possuem políticas de dono.
- `payments`, `entitlements`, `exports` e `audit_logs` permitem leitura apenas do dono.
- Escrita de pagamentos/entitlements deve continuar exclusiva de backend/webhook/service role.

## Próxima implementação no app

1. Criar painel de login/cadastro/logout usando `AuthService`.
2. Bloquear sincronização cloud quando não houver sessão.
3. Após login, carregar obras via `createSupabaseStorageAdapter().loadState()`.
4. Ao salvar, usar `saveState(state)` ou `saveWork(work)`.
5. Manter fallback local enquanto Supabase não estiver configurado.

## Critério de aprovação

```txt
Usuário A cria obra.
Usuário B não lista, não altera e não cria dossiê sobre obra do Usuário A.
```

## Risco
Médio, porque a integração direta no `app.js` deve ser feita com cuidado: o arquivo é grande e atualmente não usa módulos ES.
