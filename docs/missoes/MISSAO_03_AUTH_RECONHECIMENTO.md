# MISSÃO 3 — Auditoria da Autenticação e Plano de Integração Real

Data: 2026-06-04

## Veredito

Missão 3 concluída como auditoria técnica e preparação da integração Auth. A fundação de autenticação existe, mas ainda não está conectada à interface principal.

## Arquivos auditados

```text
src/supabaseClient.js
src/authService.js
src/storageAdapter.js
index.html
app.js
```

## Estado dos serviços

### `supabaseClient.js`

- Lê configuração de `window.CADERNO_VIVO_SUPABASE` ou `sessionStorage`.
- Exige URL e anon key antes de criar cliente.
- Usa `@supabase/supabase-js@2.44.4` via ESM remoto.
- Mantém sessão persistente, auto refresh e detecção de sessão na URL.

### `authService.js`

Já possui métodos:

```text
signUp
login
getSession
getUser
logout
onAuthChange
```

### `storageAdapter.js`

Já possui:

```text
createLocalStorageAdapter
createSupabaseStorageAdapter
listWorks
saveWork
saveDossier
```

## Bloqueio atual

`index.html` ainda carrega:

```html
<script src="app.js?v=20260603-secure"></script>
```

O `app.js` não importa os serviços de `src/`. Portanto, login, sessão, usuário e storage remoto ainda não foram ligados ao fluxo principal.

## Decisão técnica

Não converter `app.js` inteiro para módulo de uma vez. Isso é arriscado porque o arquivo é grande e concentra 140 funções. A integração deve ser feita com uma ponte controlada, preservando o protótipo local.

## Plano seguro para a próxima execução

1. Criar um módulo `src/appBootstrap.js` ou `src/authUiBridge.js`.
2. Alterar `index.html` para carregar o módulo sem quebrar `app.js`.
3. Criar painel simples de configuração Supabase/Auth.
4. Testar login/cadastro/logout sem migrar dados ainda.
5. Depois ligar `storageAdapter`.
6. Só então migrar `works` e `dossiers`.

## Critério de aprovação da Missão 3

Aprovada como reconhecimento da camada Auth e definição da estratégia segura. A implementação visual/funcional do login fica como primeira tarefa do bloco 4-6, depois da configuração Supabase real.
