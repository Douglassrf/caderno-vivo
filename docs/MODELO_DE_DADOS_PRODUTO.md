# Modelo de Dados - Produto Comercial

Data: 2026-06-02

Objetivo: preparar o Caderno Vivo para sair do prototipo local e conectar banco de dados, pagamento e permissoes reais.

## Entidades principais

### users

- id
- name
- email
- createdAt
- plan
- role
- billingCustomerId

### works

- id
- userId
- title
- status
- key
- bpm
- genre
- mood
- tags
- lyrics
- chords
- references
- createdAt
- updatedAt

### work_blocks

- id
- workId
- name
- notes
- order

### work_versions

- id
- workId
- name
- lyrics
- chords
- createdAt

### authors

- id
- workId
- name
- role
- share
- createdAt

### commercial_profiles

- id
- workId
- path
- profile
- score
- rights
- materials
- awarenessAcceptedAt
- revenueShareAcceptedAt

### commercial_events

- id
- workId
- type
- offer
- label
- at

### security_audits

- id
- workId
- userId
- checklist
- risk
- percent
- localOnly
- hasSensitiveData
- lastAuditAt
- createdAt

### audit_logs

- id
- userId
- workId
- action
- resource
- ipHash
- userAgentHash
- metadata
- createdAt

### dossiers

- id
- workId
- userId
- hash
- data
- generatedAt
- accessLevel

Regra de produto: em ambiente real, o dossie deve ser servido pelo backend somente quando a permissao do usuario estiver validada.

### international_adaptations

- id
- workId
- sourceLanguage
- targetLanguage
- targetMarket
- mode
- source
- adapted
- score
- reviewText
- reviewAcceptedAt
- createdAt
- savedAt

### video_clips

- id
- workId
- concept
- format
- style
- palette
- reference
- persona
- location
- mood
- provider
- coverPrompt
- montageNotes
- finalVideo
- renderedAt
- renderedFormat
- mp4RenderedAt
- mp4File

### clip_scenes

- id
- clipId
- part
- duration
- shot
- status
- prompt
- imagePrompt
- storyboard
- takeUrl
- assetNotes
- order

### subscriptions

- id
- userId
- provider
- providerSubscriptionId
- plan
- status
- currentPeriodEnd

### payments

- id
- userId
- workId
- provider
- providerPaymentId
- product
- amount
- status
- paidAt

### entitlements

- id
- userId
- workId
- product
- sourcePaymentId
- active
- createdAt
- expiresAt

## Prioridade de implementacao

1. Autenticacao e users.
2. works, blocks, versions, authors.
3. entitlements e payments via Mercado Pago.
4. dossiers protegidos no backend.
5. internacionalizacao e clipes.
6. armazenamento de videos/assets.

## Observacoes

- O localStorage continua valido para prototipo e auto-save local.
- Para produto comercial, permissao premium nao deve depender de JavaScript no navegador.
- O backend precisa validar pagamento e liberar entitlements antes de gerar dossie completo, download final, MP4 e pacote de publicacao.
