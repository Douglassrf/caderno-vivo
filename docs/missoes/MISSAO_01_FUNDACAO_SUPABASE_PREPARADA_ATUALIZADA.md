# Missão 1 — Fundação Supabase Preparada Atualizada

## Objetivo
Preparar a fundação real do SaaS para rodar com Supabase, Auth, RLS, Storage privado e assets por usuário.

## Implementado nesta atualização
- Migration `004_user_assets_and_profiles.sql`.
- Tabela `profiles` com RLS por `auth.uid()`.
- Buckets privados `audio`, `covers` e `documents`.
- Policies de owner para leitura e upload.
- Ampliação do `storageAdapter.js` com `uploadUserAsset()`.

## Critério local
A estrutura passa em auditoria estática e validação de sintaxe.

## Gate real obrigatório
A missão só vira produção depois de aplicar as migrations no Supabase real e passar testes reais de Auth, RLS e Storage.
