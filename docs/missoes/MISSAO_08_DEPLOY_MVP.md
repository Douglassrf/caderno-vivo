# Missão 8 — Deploy MVP

## Objetivo
Preparar o Caderno Vivo para deploy controlado sem expor dados sensíveis, chaves secretas ou arquivos premium.

## Entregas realizadas neste bloco
- Criado `src/deployReadinessService.js`.
- Criado script `scripts/audit-deploy-readiness.mjs`.
- Adicionado script `npm run audit:deploy-readiness`.
- Definido gate `DEPLOY_READY`.

## Variáveis obrigatórias
```txt
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
EXPORT_BUCKET
MERCADO_PAGO_ACCESS_TOKEN
MERCADO_PAGO_WEBHOOK_SECRET
```

## Regra de deploy
O MVP não deve ser publicado como produto comercial enquanto os gates abaixo não passarem em ambiente real:

```txt
IDOR_TEST_PASSED=true
PRODUCT_SECURITY_TEST_PASSED=true
DEPLOY_READY=true
```
