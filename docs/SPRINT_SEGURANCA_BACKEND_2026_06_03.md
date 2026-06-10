# Sprint de Seguranca Backend - 2026-06-03

Objetivo: seguir as atualizacoes de seguranca sem mexer no front-end, priorizando Supabase, RLS, Auth, Storage privado e testes verificaveis.

## Decisao operacional

Nao gastar mais tempo tentando destravar Node/npm no Windows local.

Ambiente recomendado:

- GitHub Codespaces; ou
- Dev Container local; ou
- Gitpod/container equivalente.

Foi criada a pasta `.devcontainer/` para abrir o projeto com Node 20 e instalar dependencias automaticamente.

## Entregas desta sprint

- `.devcontainer/devcontainer.json` para ambiente Node/npm confiavel.
- `supabase/config.toml` para Supabase CLI.
- `.gitignore` para impedir commit de secrets e dependencias locais.
- Teste `scripts/test-supabase-product-security.mjs`.
- Script `npm run test:security` para rodar:
  - PoC anti-IDOR;
  - bloqueio de escrita direta em tabelas sensiveis;
  - bloqueio de upload direto no bucket privado.
- Migration `003_private_exports_storage.sql` para bucket `private-exports`.
- Migration `002_product_security_foundation.sql` reforcada com:
  - constraints de `provider`, `product`, `status`, `kind` e `storage_path`;
  - indices unicos para entitlements ativos;
  - trigger de profile ao criar usuario;
  - `force row level security`.

## Ordem de execucao no Codespace

1. Abrir o repositorio no GitHub Codespaces.
2. Confirmar dependencias:

```bash
npm install
```

3. Criar projeto Supabase.
4. Configurar `.env.supabase`.
5. Linkar o projeto:

```bash
npm run supabase:link
```

6. Criar os usuarios de teste A e B no Supabase Auth.
7. Aplicar migrations:

```bash
npm run supabase:db:push
```

Ordem esperada:

```text
001_poc_anti_idor.sql
002_product_security_foundation.sql
003_private_exports_storage.sql
```

8. Exportar variaveis para a sessao:

```bash
set -a
source .env.supabase
set +a
```

9. Deploy das functions:

```bash
npm run supabase:functions:deploy
```

10. Rodar:

```bash
npm run test:security
```

## Resultados obrigatorios

```text
IDOR_TEST_PASSED
PRODUCT_SECURITY_TEST_PASSED
```

Se qualquer um falhar, nao seguir para:

- login no app;
- pagamento real;
- deploy;
- usuarios reais;
- migracao completa de dados.

## O que os testes provam

`IDOR_TEST_PASSED` prova que:

- Usuario A nao le obra de B;
- Usuario A nao le dossie de B;
- Usuario A nao altera obra/dossie de B;
- Usuario A nao cria dossie usando `work_id` de B.

`PRODUCT_SECURITY_TEST_PASSED` prova que:

- Usuario A nao le/altera profile de B;
- cliente autenticado nao insere pagamentos;
- cliente autenticado nao cria entitlements;
- cliente autenticado nao cria exports;
- cliente autenticado nao cria audit logs;
- cliente autenticado nao faz upload direto no bucket privado.

## Proximo passo apos os testes

Somente depois dos dois resultados aprovados:

1. Implementar login Supabase Auth no app.
2. Criar `storageAdapter` local/Supabase.
3. Migrar `works` e `dossiers`.
4. Publicar Edge Functions.
5. Testar webhook Mercado Pago em sandbox.
