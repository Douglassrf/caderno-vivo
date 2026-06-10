# Plano de Rollback — Lançamento Comercial

## Quando acionar rollback
- Falha de autenticação em produção.
- Vazamento de dados entre usuários.
- Entitlement liberando plano incorreto.
- Pagamento aprovado sem registro confiável.
- Exportação acessível sem permissão.
- Erro crítico no fluxo principal.

## Ações imediatas
1. Pausar campanhas e tráfego pago.
2. Desativar checkout real.
3. Bloquear novas assinaturas.
4. Preservar logs e eventos.
5. Voltar para última versão estável.
6. Comunicar usuários afetados, se necessário.
7. Corrigir em staging antes de reativar.

## Regra
Nunca corrigir direto em produção sem reproduzir o problema em ambiente controlado.
