# Supabase CLI Runbook

Objetivo: tirar a gestao de migrations do dashboard e tornar o ciclo de seguranca reproduzivel por CLI.

## Estado atual

O projeto agora possui:

- `supabase/config.toml`;
- migrations em `supabase/migrations`;
- Edge Functions em `supabase/functions`;
- scripts npm para Supabase CLI;
- Dev Container/Codespaces com Node 20.

## Preparar Codespace

```bash
npm install
```

Copie o exemplo de ambiente:

```bash
cp .env.supabase.example .env.supabase
```

Preencha:

- `SUPABASE_PROJECT_REF`;
- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY`;
- `TEST_USER_A_EMAIL`;
- `TEST_USER_A_PASSWORD`;
- `TEST_USER_B_EMAIL`;
- `TEST_USER_B_PASSWORD`;
- secrets server-side para functions.

Carregue o ambiente:

```bash
set -a
source .env.supabase
set +a
```

## Fluxo local

Para subir Supabase local no Codespace:

```bash
npm run supabase:start
npm run supabase:status
```

Para resetar o banco local e reaplicar migrations:

```bash
npm run supabase:db:reset
```

## Fluxo projeto remoto

Linkar o projeto:

```bash
npm run supabase:link
```

Aplicar migrations no Supabase remoto:

```bash
npm run supabase:db:push
```

Deploy das Edge Functions:

```bash
npm run supabase:functions:deploy
```

Configurar secrets das functions:

```bash
supabase secrets set \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY=<definir_no_ambiente_server_side> \
  MERCADO_PAGO_ACCESS_TOKEN=<definir_no_ambiente_server_side> \
  APP_ORIGIN="$APP_ORIGIN" \
  EXPORT_BUCKET="$EXPORT_BUCKET"
```

## Gates obrigatorios

Depois das migrations e usuarios de teste:

```bash
npm run test:security
```

Resultados obrigatorios:

```text
IDOR_TEST_PASSED
PRODUCT_SECURITY_TEST_PASSED
```

Se qualquer gate falhar:

- nao implementar login no front;
- nao conectar pagamento real;
- nao publicar deploy;
- nao migrar usuarios reais;
- corrigir migration/policy e repetir `supabase db reset` ou `supabase db push`.

## Ordem das migrations

```text
001_poc_anti_idor.sql
002_product_security_foundation.sql
003_private_exports_storage.sql
```

## Regra de ouro

O dashboard pode ser usado para observar dados e logs.

Migrations, functions, secrets e testes devem ser executados via CLI.

