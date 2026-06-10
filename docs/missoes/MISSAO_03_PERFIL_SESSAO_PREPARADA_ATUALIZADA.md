# Missão 3 — Perfil e Sessão Preparados Atualizados

## Objetivo
Criar camada de perfil para complementar Auth e preparar personalização por usuário.

## Implementado
- Novo arquivo `src/profileService.js`.
- Métodos `getCurrentProfile()` e `upsertCurrentProfile()`.
- Migration `profiles` com plano, idioma e preferências.

## Memória para próxima missão
A Missão 4 deve usar Auth + Profile + StorageAdapter para migrar dados locais de forma segura, sempre vinculando dados ao usuário autenticado.
