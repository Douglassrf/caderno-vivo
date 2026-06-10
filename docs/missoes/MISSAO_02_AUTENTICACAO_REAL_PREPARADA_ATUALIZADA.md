# Missão 2 — Autenticação Real Preparada Atualizada

## Objetivo
Consolidar o uso de `authService.js` para cadastro, login, logout, sessão e usuário atual.

## Estado
O serviço `AuthService` já possui:
- `signUp()`
- `login()`
- `getSession()`
- `getUser()`
- `logout()`
- `onAuthChange()`

## Próxima etapa real
Conectar os formulários reais da interface ao `AuthService`, criar fluxo visual de usuário logado e bloquear ações premium sem sessão.

## Gate
- Cadastro real OK.
- Login real OK.
- Logout OK.
- Sessão persistente OK.
- Usuário não autenticado impedido de salvar na nuvem.
