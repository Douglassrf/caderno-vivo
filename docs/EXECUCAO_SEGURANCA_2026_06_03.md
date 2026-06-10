# Execucao de Seguranca - 2026-06-03

Objetivo: continuar a maturacao iniciada em 2026-06-02 e fechar os pontos locais necessarios para o Caderno Vivo evoluir para ferramenta segura.

## Entregue nesta execucao

- Projeto de 2026-06-02 copiado para a pasta de trabalho de 2026-06-03.
- Regra premium corrigida no prototipo:
  - clique em oferta agora registra interesse comercial;
  - clique em oferta nao libera recurso final;
  - dossie completo, exportacao de dossie, download WEBM, conversao MP4, download MP4 e pacote de publicacao exigem entitlement backend.
- Estado comercial passou a suportar `entitlements`.
- Dossie passou a incluir aviso de seguranca premium e lista de entitlements registrados.
- Migration anti-IDOR corrigida:
  - `works.user_id` usa `auth.uid()` por padrao;
  - `dossiers.user_id` usa `auth.uid()` por padrao;
  - `works.updated_at` atualizado por trigger.
- Script anti-IDOR reforcado para testar:
  - leitura cruzada;
  - update cruzado;
  - tentativa de criar dossie em obra de outro usuario.
- Criada migration de fundacao comercial segura:
  - `profiles`;
  - `payments`;
  - `entitlements`;
  - `exports`;
  - `audit_logs`;
  - RLS e policies de leitura por usuario.
- Criadas Edge Functions de seguranca:
  - `mercado-pago-webhook`: confirma pagamento no provedor e cria entitlement;
  - `secure-dossier`: entrega dossie somente com usuario, obra e entitlement validos;
  - `create-signed-export-url`: cria URL assinada temporaria para export privado.
- Criado `package.json` com scripts padronizados.

## Decisao de seguranca

O prototipo local pode continuar gerando valor criativo, roteiro, adaptacao, storyboard e preview.

Recursos finais e premium nao devem ser liberados por estado local do navegador:

- dossie completo;
- exportacao do dossie;
- download de video final;
- conversao/download MP4;
- pacote de publicacao;
- qualquer recurso pago futuro.

Esses recursos precisam de entitlement criado pelo backend apos pagamento confirmado por webhook.

## Bloqueios externos

A execucao completa da seguranca real ainda depende de:

1. Criar projeto Supabase.
2. Criar dois usuarios de teste no Supabase Auth.
3. Rodar as migrations SQL no Supabase.
4. Criar `.env.supabase` com URL, anon key e credenciais dos usuarios de teste.
5. Configurar secrets das Edge Functions:
   - `SUPABASE_SERVICE_ROLE_KEY`;
   - `MERCADO_PAGO_ACCESS_TOKEN`;
   - `APP_ORIGIN`;
   - `EXPORT_BUCKET`.
6. Instalar dependencias com `npm install`.
7. Rodar `npm run test:supabase:idor`.

Resultado obrigatorio:

```text
IDOR_TEST_PASSED
```

Se o resultado for `IDOR_TEST_FAILED`, o app nao deve seguir para usuarios reais, pagamento real nem deploy.

## Proxima execucao recomendada

1. Executar a PoC Supabase Anti-IDOR em ambiente real.
2. Se aprovada, iniciar modularizacao do `app.js`.
3. Criar adapter local/Supabase.
4. Migrar `works` e `dossiers`.
5. Implementar login.
6. Implementar backend/Edge Function para dossie protegido.
7. Implementar Mercado Pago por webhook.
