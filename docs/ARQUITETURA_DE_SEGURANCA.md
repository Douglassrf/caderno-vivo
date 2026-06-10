# Arquitetura de Seguranca - Caderno Vivo

Data: 2026-06-02

Objetivo: definir a seguranca necessaria para transformar o prototipo local em produto comercial.

## Principio central

Nenhuma permissao premium deve depender apenas do JavaScript do navegador.

O navegador pode mostrar botoes, avisos e estados visuais. A decisao real de liberar dossie completo, MP4, pacote de publicacao, adaptacao premium ou videoclipe precisa ser feita no backend.

## Camadas obrigatorias

### 1. Autenticacao

- Login por email/senha, magic link ou OAuth.
- Sessao com token seguro.
- Refresh token protegido.
- Encerramento de sessao.
- Recuperacao de conta.

### 2. Autorizacao

- Cada obra pertence a um `userId`.
- O backend deve bloquear acesso a obras de outro usuario.
- Toda rota de dossie, video, pagamento e exportacao deve validar usuario autenticado.

### 3. Entitlements

Entitlement e a permissao real que nasce apos pagamento confirmado.

Exemplos:
- `dossier_full`
- `professional_pack`
- `international_adaptation`
- `video_clip_pack`
- `mp4_export`
- `publish_pack`
- `essential_plan`
- `prime_plan`

Regra: o front-end pede acesso; o backend verifica entitlement ativo antes de entregar o recurso.

### 4. Pagamento

- Checkout via Mercado Pago.
- Confirmacao por webhook no backend.
- O front-end nao deve marcar pagamento como confirmado sozinho.
- O backend registra `payments`.
- O backend cria ou renova `entitlements`.

### 5. Dossie protegido

O dossie completo nao deve ser montado e entregue livremente no front-end em produto real.

Fluxo recomendado:
1. Usuario solicita dossie.
2. Backend valida autenticacao.
3. Backend valida propriedade da obra.
4. Backend valida entitlement.
5. Backend monta ou recupera o dossie.
6. Backend registra log de auditoria.
7. Backend entrega o arquivo permitido.

### 6. Dados sensiveis

Tratar como sensivel:
- letras ineditas;
- autores;
- percentuais;
- documentos futuros;
- dados de pagamento;
- links privados;
- dossies;
- hashes;
- arquivos de audio/video;
- contratos e termos aceitos.

Medidas:
- criptografia em repouso quando o provedor permitir;
- HTTPS obrigatorio;
- backup seguro;
- controle de acesso por usuario;
- logs sem expor letra completa ou dados pessoais.

### 7. Logs de auditoria

Registrar:
- login;
- criacao/edicao de obra;
- aceite de ciencia juridica;
- aceite 50/50;
- pagamento confirmado;
- entitlement criado;
- dossie gerado;
- dossie baixado;
- MP4 baixado;
- pacote de publicacao baixado.

### 8. Protecao contra abuso

- Rate limit em rotas de IA e renderizacao.
- Limite de tamanho para upload.
- Validacao de tipo de arquivo.
- Bloqueio de scripts em campos de texto ao renderizar HTML.
- Sanitizacao de links externos.
- Revisao de CORS.

## O que o prototipo atual ja faz

- Registra aceite juridico.
- Registra aceite 50/50.
- Calcula perfil comercial.
- Simula destravamento premium.
- Gera hash local do dossie.
- Mostra painel de seguranca por obra.
- Registra checklist de seguranca no dossie.

## O que ainda precisa backend

- Login real.
- Banco de dados.
- Entitlements reais.
- Webhook do Mercado Pago.
- Dossie servido pelo backend.
- Controle de acesso por usuario.
- Armazenamento seguro de arquivos.
- Logs de auditoria persistentes.

## Ordem recomendada

1. Criar projeto Supabase ou Firebase.
2. Implementar autenticacao.
3. Migrar `works` para banco.
4. Criar tabela `entitlements`.
5. Integrar Mercado Pago.
6. Criar rota/funcao segura para dossie.
7. Criar rota/funcao segura para download premium.
8. Ativar logs de auditoria.
