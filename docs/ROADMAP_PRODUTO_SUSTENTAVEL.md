# Roadmap de Produto Sustentavel

Data: 2026-06-02

Objetivo: organizar a transicao do Caderno Vivo de prototipo local para produto comercial seguro, modular e monetizavel.

## Veredito estrategico

O Caderno Vivo nao deve virar um estudio de gravacao completo.

O foco correto e ser o cerebro juridico, criativo, estrategico e comercial da obra musical:

- organizar a criacao;
- proteger a autoria;
- documentar versoes;
- preparar dossies;
- orientar producao e lancamento;
- internacionalizar;
- planejar clipes;
- vender destravamentos no momento de valor;
- preservar historico e prova de evolucao da obra.

## Principio de execucao

Nao migrar tudo de uma vez.

A ordem correta e:

1. provar seguranca;
2. modularizar o front;
3. criar persistencia real;
4. mover regras sensiveis para backend;
5. implementar pagamento;
6. evoluir diferenciais premium.

## Fase 1 - Seguranca real minima

Status: proxima prioridade.

Objetivo: provar que um usuario nao acessa dados de outro.

Entregas:

- executar PoC Supabase Anti-IDOR;
- criar dois usuarios de teste;
- rodar migration `001_poc_anti_idor.sql`;
- rodar `scripts/test-supabase-idor.mjs`;
- obter `IDOR_TEST_PASSED`;
- documentar resultado.

Nao avancar para pagamento real antes disso.

## Fase 2 - Modularizacao do prototipo

Objetivo: sair do `app.js` monolitico sem quebrar o prototipo.

Modulos recomendados:

- `stateService.js`: estado, normalizacao e persistencia local;
- `workService.js`: obras, blocos e versoes;
- `protectionService.js`: autores, percentuais, dossie e hash;
- `commercialService.js`: perfil, ofertas, 100%, 50/50 e entitlements locais;
- `securityService.js`: checklist, risco e auditoria;
- `internationalService.js`: adaptacao, revisao humana e clipe internacional;
- `videoService.js`: roteiro, storyboard, renderizacao, MP4 e pacote;
- `uiService.js`: renderizacao da interface;
- `storageAdapter.js`: localStorage agora, Supabase depois.

Regra: modularizar por comportamento, nao por tela.

## Fase 3 - Persistencia autenticada

Objetivo: substituir localStorage como fonte principal.

Escolha: Supabase Auth + Postgres + RLS.

Entregas:

- login;
- cadastro;
- sessao;
- tabela `profiles`;
- tabela `works`;
- tabela `work_versions`;
- tabela `authors`;
- tabela `dossiers`;
- tabela `security_audits`;
- RLS em todas;
- storage adapter apontando para Supabase.

O localStorage pode continuar como cache/offline temporario, mas nao como fonte de verdade.

## Fase 4 - Backend minimo

Objetivo: mover operacoes sensiveis para servidor.

Usar Supabase Edge Functions ou backend Node pequeno.

Funcoes sensiveis:

- confirmar pagamento;
- receber webhook do Mercado Pago;
- criar entitlement;
- gerar dossie protegido;
- gerar URL assinada;
- registrar audit log;
- limitar uso premium;
- executar tarefas administrativas.

Regra: service role key nunca entra no front-end.

## Fase 5 - Monetizacao segura

Objetivo: transformar destravamentos simulados em destravamentos reais.

Produtos iniciais:

- Dossie completo;
- Pacote Profissional;
- Adaptacao Internacional;
- Pacote Videoclipe;
- MP4/export final;
- Plano Essencial;
- Plano Prime.

Fluxo:

1. usuario chega ao momento de valor;
2. app mostra oferta;
3. usuario paga via Mercado Pago;
4. webhook confirma;
5. backend cria entitlement;
6. recurso e liberado pelo backend.

## Fase 6 - Diferenciais premium

Estes recursos devem vir depois da base segura.

### Mapa da Obra

Dashboard visual da evolucao:

- nascimento da ideia;
- versoes;
- autores;
- mudancas;
- dossie;
- internacionalizacao;
- clipe;
- lancamento;
- monetizacao.

Valor: aumenta apego emocional e torna o app dificil de trocar.

### Watermark dinamico

Plano gratuito:

- dossie com marca visivel;
- video com marca;
- pacote com limitacoes.

Plano pago:

- arquivo limpo;
- hash;
- export completo;
- dossie profissional.

Valor: protege o app e cria conversao sem bloquear a criacao.

### Time Machine

Historico premium de versoes:

- comparar letras;
- restaurar versao antiga;
- ver linha do tempo;
- proteger rascunhos;
- registrar evolucao autoral.

Valor: alto para criadores, porque medo de perder ideia e real.

### Marketplace de colaboracao

Somente depois de seguranca, contratos e permissao.

Funcao:

- compositor profissional encontra criador assistido;
- parceria com regra clara;
- contrato digital;
- splits;
- trilha de aceite.

Risco: alto juridicamente. Deve esperar revisao legal.

### Integracao com distribuidores

Preparar pacote para CD Baby, DistroKid, ONErpm ou similares.

Primeira etapa deve ser exportar checklist e metadados. API direta deve vir depois.

## O que evitar

- tentar criar uma DAW;
- tentar gravar/mixar/masterizar como foco principal;
- criar backend grande antes da PoC de seguranca;
- implementar marketplace antes de contratos e auditoria;
- vender premium real sem webhook;
- confiar em estado premium no navegador;
- migrar tudo para Supabase de uma vez.

## Ordem recomendada para trabalharmos

1. Executar PoC Supabase Anti-IDOR.
2. Modularizar `app.js` em servicos.
3. Criar adapter local/Supabase.
4. Migrar `works` e `dossiers`.
5. Implementar login.
6. Proteger dossie no backend.
7. Implementar Mercado Pago webhook.
8. Implementar watermark.
9. Implementar Time Machine.
10. Implementar Mapa da Obra.

## Decisao para agora

A proxima coisa a fazer nao e marketplace, distribuidor ou mais IA.

A proxima coisa a fazer e:

1. validar a seguranca com Supabase/RLS;
2. modularizar o codigo;
3. preparar a migracao de dados reais.

Essa sequencia reduz risco e aumenta o valor comercial do Caderno Vivo.
