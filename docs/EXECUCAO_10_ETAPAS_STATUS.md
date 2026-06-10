# Execucao das 10 Etapas - Status Operacional

Data: 2026-06-03

Objetivo: executar as etapas restantes do Caderno Vivo em ordem, concluindo e testando cada etapa antes de avancar.

## Regra de execucao

Nenhuma etapa posterior deve ser considerada concluida sem teste da etapa anterior.

Ordem obrigatoria:

1. Validar ambiente, Supabase CLI e gates de seguranca.
2. Implementar Supabase Auth.
3. Criar adapter local/Supabase.
4. Migrar `works` e `dossiers`.
5. Conectar dossie protegido.
6. Conectar Mercado Pago e entitlements.
7. Proteger storage e exports finais.
8. Modularizar `app.js`.
9. Preparar deploy seguro.
10. Validar produto e documentar fechamento.

## Etapa 1 - Ambiente e gates

Status: bloqueada no Windows local, pronta para Codespace/Dev Container.

Verificado no notebook local:

- Git esta disponivel.
- Docker CLI existe, mas Docker daemon nao esta rodando.
- Tentativa de iniciar `com.docker.service` falhou por permissao/servico inacessivel.
- `node.exe` local esta bloqueado por acesso negado.
- `npm` nao esta disponivel no PATH.
- `supabase` CLI nao esta disponivel no PATH.
- `winget` funciona fora do sandbox, mas a tentativa de instalar Node.js LTS ficou presa em instalador `msiexec`.
- Existe um Node funcional em `AppData\Local\OpenAI\Codex\bin`.
- Os testes foram ajustados para rodar via REST/Auth/Storage com `fetch` nativo, sem depender de `@supabase/supabase-js`.
- `scripts/run-security-tests.ps1` carrega `.env.supabase`, encontra Node funcional e executa os dois gates.
- `scripts/audit-security-artifacts.mjs` audita migrations, RLS, functions, scripts e env esperado sem depender de Supabase real.
- `scripts/preflight-stage1.ps1` executa sintaxe, auditoria estrutural e, se `.env.supabase` existir, os gates reais.
- Nao existe `.env.supabase` real nesta pasta.

Conclusao: o notebook local agora consegue rodar os scripts Node sem `npm`, mas ainda depende de `.env.supabase` real e de migrations ja aplicadas no Supabase. Docker local nao ficou disponivel. Codespace/Dev Container continua sendo o caminho preferencial para Supabase CLI.

## Preflight local da Etapa 1

Comando executado:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\preflight-stage1.ps1
```

Resultado:

```text
SYNTAX_OK app.js
SYNTAX_OK scripts/test-supabase-idor.mjs
SYNTAX_OK scripts/test-supabase-product-security.mjs
SYNTAX_OK scripts/audit-security-artifacts.mjs
SECURITY_ARTIFACT_AUDIT_PASSED
total: 85
passed: 85
failed: 0
STAGE1_PREFLIGHT_READY_BUT_ENV_MISSING
```

Interpretacao: sintaxe e artefatos locais da Etapa 1 estao prontos. O preflight parou corretamente antes dos gates reais porque `.env.supabase` ainda nao existe.

## Gates contra mock local de Supabase/RLS

Objetivo: validar os scripts dos gates ponta a ponta sem depender de credenciais reais.

Arquivos criados:

- `scripts/mock-supabase-security-server.mjs`
- `scripts/run-security-tests-local-mock.ps1`

Comando executado:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-security-tests-local-mock.ps1
```

Resultado:

```text
MOCK_SUPABASE_READY http://127.0.0.1:54399
IDOR_TEST_PASSED
PRODUCT_SECURITY_TEST_PASSED
LOCAL_MOCK_SECURITY_GATES_PASSED
```

O mock validou:

- Usuario A nao le obra/dossie de B.
- Usuario A nao altera obra/dossie de B.
- Usuario A nao cria dossie em obra de B.
- Usuario A nao le/altera profile de B.
- Cliente autenticado nao escreve em `payments`, `entitlements`, `exports`, `audit_logs`.
- Cliente autenticado nao faz upload direto no bucket `private-exports`.

Interpretacao: os scripts de gate estao funcionais ponta a ponta. Isso nao substitui Supabase real, mas reduz o risco de descobrir erro no proprio teste apenas depois de configurar o ambiente remoto.

## Auditoria completa com env obrigatorio

Comando executado:

```powershell
& 'C:\Users\USUÁRIO\AppData\Local\OpenAI\Codex\bin\5b9024f90663758b\node.exe' scripts\audit-security-artifacts.mjs
```

Resultado:

```text
SECURITY_ARTIFACT_AUDIT_FAILED
total: 91
passed: 84
failed: 7
```

Falhas esperadas:

- `.env.supabase` ausente;
- `SUPABASE_URL` ausente;
- `SUPABASE_ANON_KEY` ausente;
- `TEST_USER_A_EMAIL` ausente;
- `TEST_USER_A_PASSWORD` ausente;
- `TEST_USER_B_EMAIL` ausente;
- `TEST_USER_B_PASSWORD` ausente.

Interpretacao: no modo completo, a auditoria exige `.env.supabase` e variaveis reais. O gate real continua dependendo de Supabase configurado.

## Comandos da etapa 1 no Codespace

```bash
npm install
cp .env.supabase.example .env.supabase
```

Preencher `.env.supabase` com:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `TEST_USER_A_EMAIL`
- `TEST_USER_A_PASSWORD`
- `TEST_USER_B_EMAIL`
- `TEST_USER_B_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `APP_ORIGIN`
- `EXPORT_BUCKET`

Depois:

```bash
set -a
source .env.supabase
set +a
npm run supabase:link
npm run supabase:db:push
npm run supabase:functions:deploy
npm run test:security
```

## Alternativa local sem npm

Se as migrations ja tiverem sido aplicadas no Supabase e `.env.supabase` estiver preenchido:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-security-tests.ps1
```

Esse comando deve terminar com:

```text
SECURITY_GATES_PASSED
```

Resultados obrigatorios:

```text
IDOR_TEST_PASSED
PRODUCT_SECURITY_TEST_PASSED
```

## Criterio para avancar para Etapa 2

Somente avancar para Supabase Auth quando os dois gates acima passarem.

Se qualquer gate falhar:

- corrigir migration ou policy;
- repetir `npm run supabase:db:push` ou `npm run supabase:db:reset`;
- repetir `npm run test:security`.
