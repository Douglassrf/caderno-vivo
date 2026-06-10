# Plano de Seguranca Pre-Deploy

Data: 2026-06-02

Objetivo: proteger os usuarios, as obras, os dossies, os pagamentos e o proprio app antes de transformar o Caderno Vivo em produto comercial.

## Decisao tecnica recomendada

Escolha inicial: Supabase com Postgres, Row Level Security e uma camada server-side pequena para operacoes sensiveis.

Motivo: o Caderno Vivo tem dados relacionais e autorais importantes:

- obras;
- autores;
- percentuais;
- dossies;
- versoes;
- adaptacoes internacionais;
- videoclipes;
- exports;
- pagamentos;
- permissoes premium;
- logs de auditoria.

Esse tipo de produto combina melhor com Postgres e RLS do que com um banco NoSQL puro.

## Arquitetura alvo

1. Frontend autenticado.
2. Supabase Auth para login.
3. Postgres com RLS obrigatorio.
4. Supabase Storage privado para arquivos.
5. Mercado Pago via webhook no backend.
6. Edge Functions ou backend Node minimo para operacoes sensiveis.
7. CI/CD com secrets protegidos, migrations e testes de permissao.

## Regra principal

O front-end nunca decide seguranca.

O navegador pode mostrar botoes, mensagens e estados. Mas a liberacao real de dossie completo, MP4, pacote de publicacao, premium, adaptacao paga e arquivos finais precisa ser validada pelo backend e/ou pelo banco.

## Comparacao das opcoes

| Opcao | Pontos fortes | Riscos | Decisao |
|---|---|---|---|
| Supabase/Postgres com RLS | RLS protege contra IDOR no banco; bom para autores, percentuais, dossies e auditoria; SQL forte; backups reais | RLS mal escrita pode vazar ou bloquear dados; service key e perigosa se vazar | Melhor escolha inicial |
| Firebase/Firestore | Rapido, Auth e Storage integrados, bom realtime | Modelagem relacional mais fraca; regras podem ficar complexas; auditoria e relatorios mais limitados | Nao e a melhor base para este dominio |
| Backend Node/Express completo | Controle maximo e regras centralizadas | Mais superficie de ataque e mais manutencao desde o inicio | Usar apenas como camada sensivel no comeco |

## Ameacas principais

### IDOR

Usuario A tenta acessar obra, dossie, export ou pagamento do Usuario B trocando o ID na URL ou no payload.

Defesa:
- RLS no banco;
- middleware de autorizacao;
- testes com dois usuarios;
- nunca confiar em `user_id` vindo do front.

### Vazamento de dados

API retorna `password_hash`, CPF futuro, token, chave, email privado, dados de pagamento ou letra/dossie de outro usuario.

Defesa:
- DTOs/serializers;
- nunca `SELECT *`;
- revisar responses;
- sanitizar payloads;
- logs sem dados sensiveis completos.

### Premium falso

Usuario altera estado no navegador para liberar dossie, MP4 ou pacote.

Defesa:
- entitlement no banco;
- webhook do Mercado Pago;
- validacao server-side antes de entregar arquivo.

### Secrets expostos

Chaves aparecem no Git, `.env`, bundle front-end ou logs.

Defesa:
- gitleaks;
- trufflehog;
- secrets do provedor;
- rotacao de chave vazada;
- service role key somente no servidor.

### Perda de dados autorais

Usuario perde obras, letras ou dossies por falha, deploy ou erro operacional.

Defesa:
- backup automatico;
- teste de restore;
- staging isolado;
- logs de auditoria;
- export manual.

## Sprint 1 - Blindagem da base

Objetivo: sair da fragilidade do localStorage e criar isolamento real por usuario.

Entregas:

1. Criar projeto Supabase.
2. Criar tabelas principais:
   - `profiles`;
   - `works`;
   - `work_blocks`;
   - `work_versions`;
   - `authors`;
   - `commercial_profiles`;
   - `commercial_events`;
   - `security_audits`;
   - `dossiers`;
   - `exports`;
   - `audit_logs`.
3. Ativar RLS em todas as tabelas com dados de usuario.
4. Criar policies por `user_id` e `work_id`.
5. Criar teste IDOR com Usuario A e Usuario B.
6. Criar DTOs/serializers de resposta.
7. Proibir retorno direto de entidade do banco.
8. Documentar as rotas publicas e privadas.

Criterio de pronto:

- Usuario A nao le, altera ou exporta dados do Usuario B.
- Nenhuma tabela sensivel fica sem RLS.
- Nenhuma resposta retorna campo sensivel desnecessario.

## Sprint 2 - Premium, pagamentos e arquivos

Objetivo: proteger dinheiro, planos, dossies e downloads.

Entregas:

1. Criar tabela `payments`.
2. Criar tabela `entitlements`.
3. Integrar Mercado Pago apenas via backend/webhook.
4. Criar webhook que confirma pagamento e libera entitlement.
5. Proteger dossie completo por entitlement.
6. Proteger MP4, pacote de publicacao e exports finais.
7. Usar Storage privado.
8. Criar URLs assinadas com expiracao.
9. Separar `.env` dev/staging/prod.
10. Rodar gitleaks/trufflehog antes do deploy.

Critério de pronto:

- O front nao consegue marcar premium sozinho.
- Sem entitlement ativo, backend nao entrega dossie completo nem arquivo final.
- Chaves sensiveis nao aparecem no front-end.

## Sprint 3 - Operacao segura

Objetivo: preparar o produto para usuarios reais.

Entregas:

1. Backups automaticos.
2. Restore testado em staging.
3. Rate limit em login, signup, password reset, exports e IA.
4. CORS restrito aos dominios oficiais.
5. Headers de seguranca.
6. Logs de auditoria para acoes criticas.
7. Alertas para erro de webhook, falha de pagamento e excesso de 500.
8. Deploy em producao com aprovacao manual.
9. Ambiente de producao isolado de dev/staging.
10. Revisao final de RLS e policies.

Critério de pronto:

- Backup restaurado com sucesso.
- Deploy em producao nao acontece automaticamente sem aprovacao.
- Acoes criticas deixam rastro auditavel.

## Checklist pre-deploy obrigatorio

| Area | Validacao | Teste | Sobe? |
|---|---|---|---|
| Exposicao de dados | Nenhum endpoint retorna campos sensiveis | Inspecionar responses com curl/Postman | Nao se falhar |
| DTOs | API nao retorna entidade direta do banco | Code review: procurar `SELECT *` e `return user` | Nao se falhar |
| Autorizacao | Usuario A nao acessa dados do Usuario B | Teste IDOR com dois usuarios | Nao se falhar |
| RLS | Todas as tabelas sensiveis com RLS ativa | Query em `pg_tables` | Nao se falhar |
| Policies | Usuario ve somente o que e seu | Teste SELECT/UPDATE cruzado | Nao se falhar |
| Secrets | Nenhuma chave no repo/bundle/log | gitleaks e trufflehog | Nao se falhar |
| Ambientes | Prod separado de dev/staging | Conferir URLs, chaves e banco | Nao se falhar |
| CI/CD | Deploy prod exige aprovacao manual | Revisar pipeline | Nao se falhar |
| Rate limit | Login/export/IA limitados | Teste de carga e 429 | Nao se falhar |
| CORS | Sem `*` em producao | Inspecionar headers | Nao se falhar |
| Logs | Acoes criticas auditadas | Criar acao e verificar log | Nao se falhar |
| Backups | Restore testado | Restaurar em staging | Nao se falhar |

## Primeiro experimento recomendado

Implementar um mini-projeto Supabase com apenas:

1. Auth.
2. Tabela `works`.
3. Tabela `dossiers`.
4. RLS ligada.
5. Dois usuarios de teste.
6. Teste IDOR.

Se esse experimento funcionar, seguimos migrando o restante do Caderno Vivo para a mesma base.

## Artefatos criados para a PoC

- `supabase/migrations/001_poc_anti_idor.sql`
- `scripts/test-supabase-idor.mjs`
- `.env.supabase.example`

## Como executar a PoC anti-IDOR

1. Criar um projeto Supabase.
2. Criar dois usuarios no Supabase Auth:
   - Usuario A;
   - Usuario B.
3. Executar `supabase/migrations/001_poc_anti_idor.sql` no SQL Editor do Supabase.
4. Criar um arquivo `.env.supabase` local baseado em `.env.supabase.example`.
5. Instalar `@supabase/supabase-js` no ambiente de teste.
6. Rodar:

```bash
node scripts/test-supabase-idor.mjs
```

Resultado esperado:

```text
IDOR_TEST_PASSED
```

Resultado proibido:

```text
IDOR_TEST_FAILED
```

Se falhar, o app nao deve seguir para usuarios reais nem pagamentos reais.

## Decisao final

O melhor caminho para proteger o app e os usuarios e:

Supabase/Postgres com RLS como fundacao, backend minimo para webhooks/premium/arquivos, e checklist pre-deploy automatizado.

Nao devemos seguir para pagamentos reais nem usuarios reais enquanto RLS, IDOR, secrets, backups e ambiente de producao isolado nao estiverem validados.
