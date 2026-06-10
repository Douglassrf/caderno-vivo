# Preparação — Missões 4, 5 e 6

## Missão 4 — Migração de Dados
Usar `migrateLocalStateToSupabase()` como ponto de partida. Expandir para obras, dossiês, preferências, assets e histórico.

## Missão 5 — Multiusuário
Validar isolamento com dois usuários reais. Nenhum usuário pode ler, alterar ou baixar dados do outro.

## Missão 6 — Entitlements
Conectar plano `free`, `plus`, `prime` ao sistema de permissões. O plano no perfil não deve ser fonte única de verdade em produção; entitlements devem ser controlados por backend/webhook.

## Gates
- IDOR real aprovado.
- Product security real aprovado.
- Storage privado aprovado.
- Usuário sem assinatura bloqueado corretamente.
