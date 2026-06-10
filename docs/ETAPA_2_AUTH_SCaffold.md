# Etapa 2 - Scaffolding de Auth

Status: preparado, nao integrado.

Motivo: a Etapa 2 so deve ser ativada depois dos gates da Etapa 1:

```text
IDOR_TEST_PASSED
PRODUCT_SECURITY_TEST_PASSED
SECURITY_GATES_PASSED
```

## Arquivos preparados

- `src/supabaseClient.js`
- `src/authService.js`
- `src/storageAdapter.js`

## O que esta pronto

### `supabaseClient.js`

- Le configuracao de `window.CADERNO_VIVO_SUPABASE` ou `sessionStorage`.
- Cria client Supabase sob demanda.
- Mantem `persistSession: true` para SPA.

Observacao: autorizacao real continua sendo RLS/backend. Estado de sessao no navegador nao libera recurso sensivel.

### `authService.js`

- `signUp(email, password)`;
- `login(email, password)`;
- `getSession()`;
- `getUser()`;
- `logout()`;
- `onAuthChange(callback)`.

Regra: usar `getUser()` quando precisar confirmar identidade atual.

### `storageAdapter.js`

- Adapter local para estado legado.
- Adapter inicial Supabase para:
  - listar obras;
  - salvar obra;
  - salvar dossie.

## O que ainda falta na Etapa 2

- UI de login/cadastro/logout.
- Estado visual logado/deslogado.
- Configuracao segura da URL/anon key no app.
- Primeira leitura de `user.id` real na interface.
- Teste manual e funcional com RLS.

## Regra de ativacao

Nao importar esses arquivos no `index.html` ou `app.js` antes da Etapa 1 estar aprovada.

