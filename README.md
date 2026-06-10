# Caderno Vivo

Prototipo local do Caderno Vivo com Fases 1 a 9 concluidas e auditadas, agora com internacionalizacao comercial.

Abra `index.html` no navegador para testar. Os dados ficam salvos no armazenamento local do navegador.

## Estado atual

- Fase 1: caderno de composicao.
- Fase 2: memoria e audio.
- Fase 3: Proteger e Receber.
- Fase 4: Mentor Criativo.
- Fase 4.1: Adaptacao Internacional da musica, preservando sentido, emocao, metrica e rima.
- Fase 5: Repertorio e Producao.
- Fase 6: Lancamento e Carreira.
- Fase 7: Videoclipe Cinematografico.
- Fase 7.1: exportacao, imagem, takes e montagem.
- Fase 7.2: Videoclipe Internacional.
- Fase 8: renderizacao e exportacao final do videoclipe.
- Fase 9: exportacao MP4 profissional com FFmpeg.
- Monetizacao: Plano Plus para adaptacao internacional e Plano Prime para videoclipe internacional.
- Politica comercial/juridica: compositor profissional mantem 100%; criador assistido aceita 50/50 para profissionalizar, distribuir ou monetizar.
- Gatilhos inteligentes: ofertas aparecem como destravamentos, sem interromper a composicao.

Ultima evolucao registrada nesta entrega: fechamento local da camada segura em 2026-06-03, com ofertas sem destravamento falso no navegador, exigencia de entitlement backend para recursos finais, PoC anti-IDOR reforcada e fundacao SQL para pagamentos, entitlements, exports e logs.

## Seguranca

Recursos finais e premium nao devem ser liberados apenas pelo front-end:

- dossie completo;
- exportacao do dossie;
- download de video final;
- conversao/download MP4;
- pacote de publicacao.

Esses recursos exigem entitlement validado no backend apos pagamento confirmado por webhook.

Para validar a PoC Supabase Anti-IDOR:

```bash
npm install
npm run test:security
```

Resultado obrigatorio:

```text
IDOR_TEST_PASSED
PRODUCT_SECURITY_TEST_PASSED
```

Alternativa local sem `npm`, usando o Node funcional encontrado no ambiente:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-security-tests.ps1
```

Esse caminho ainda exige `.env.supabase` real e migrations aplicadas no Supabase.

Preflight local da Etapa 1, sem exigir `.env.supabase`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\preflight-stage1.ps1
```

Resultado esperado antes de configurar Supabase real:

```text
SECURITY_ARTIFACT_AUDIT_PASSED
STAGE1_PREFLIGHT_READY_BUT_ENV_MISSING
```

Valide os scripts dos gates contra mock local:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-security-tests-local-mock.ps1
```

Resultado esperado:

```text
IDOR_TEST_PASSED
PRODUCT_SECURITY_TEST_PASSED
LOCAL_MOCK_SECURITY_GATES_PASSED
```

Artefatos server-side preparados:

- `supabase/functions/mercado-pago-webhook`
- `supabase/functions/secure-dossier`
- `supabase/functions/create-signed-export-url`

Ambiente recomendado para a proxima etapa:

- GitHub Codespaces ou Dev Container.
- A configuracao esta em `.devcontainer/devcontainer.json`.
- Nao depender do Node/npm local se a maquina continuar bloqueando `node.exe`.

Fluxo Supabase CLI:

```bash
npm run supabase:link
npm run supabase:db:push
npm run supabase:functions:deploy
npm run test:security
```

Runbook: `docs/SUPABASE_CLI_RUNBOOK.md`.
