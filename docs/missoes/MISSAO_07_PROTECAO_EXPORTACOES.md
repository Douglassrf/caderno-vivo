# Missão 7 — Proteção de Exportações

## Objetivo
Impedir que dossiês, PDFs, MP4, WEBM e pacotes finais sejam entregues diretamente pelo navegador sem validação de usuário, obra e entitlement.

## Entregas realizadas neste bloco
- Criado `src/exportProtectionService.js`.
- Catalogado bucket privado `private-exports`.
- Confirmado uso da Edge Function `create-signed-export-url`.
- Definida política: exportação final premium só deve sair por backend/Edge Function.

## Regras
- Não usar bucket público para arquivos finais.
- Não gerar link permanente para exportação premium.
- Não liberar dossiê completo sem entitlement ativo.
- Não confiar em flag local do navegador para recursos pagos.

## Gate de aprovação
A Missão 7 só fica produtiva quando:

```txt
Usuário autenticado
+ obra pertencente ao usuário
+ entitlement ativo
+ registro em exports
+ storage_path privado
+ URL assinada com TTL curto
```
