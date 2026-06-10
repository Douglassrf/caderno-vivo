# MISSÃO 06 — Pagamentos + Entitlements

## Status
Preparada tecnicamente no pacote.

## Objetivo
Separar interesse de compra no navegador de liberação real de produto no backend.

## Arquivos criados

```txt
src/paymentService.js
src/entitlementService.js
```

## Arquivos já existentes e reaproveitados

```txt
supabase/functions/mercado-pago-webhook/index.ts
supabase/migrations/002_product_security_foundation.sql
```

## Regra inviolável
O frontend nunca cria pagamento aprovado e nunca cria entitlement ativo.

Fluxo correto:

```txt
Usuário clica em oferta
↓
frontend registra intenção/audit_log
↓
checkout Mercado Pago sandbox/produção
↓
webhook confirma pagamento no backend
↓
backend cria payment approved
↓
backend cria entitlement active
↓
frontend apenas consulta entitlement
```

## Serviços criados

### `PaymentService`

- exige usuário logado;
- monta metadata mínima para checkout;
- registra intenção de checkout em `audit_logs`.

### `EntitlementService`

- lista entitlements ativos;
- verifica permissão por produto e obra;
- lança erro quando falta entitlement obrigatório.

## Critério de aprovação

```txt
Pagamento aprovado via webhook cria entitlement ativo.
Frontend só libera produto após consultar entitlement ativo.
```

## Próxima missão dependente
Missão 07 — Proteção de exportações.
