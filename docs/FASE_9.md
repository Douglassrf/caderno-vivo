# Fase 9 - Exportacao MP4 Profissional com FFmpeg

Status: implementada como integracao de conversao MP4 no navegador.

## Objetivo

Adicionar ao fluxo de exportacao final a conversao do video renderizado para `.mp4`, usando FFmpeg WebAssembly.

## Entregue

- Botao Converter MP4.
- Botao Baixar MP4.
- Status dedicado para FFmpeg.
- Carregamento dinamico do FFmpeg WebAssembly.
- Conversao do arquivo `.webm` renderizado para `.mp4`.
- Registro de `mp4RenderedAt` e `mp4File` na obra.
- Inclusao do arquivo MP4 no pacote de publicacao.
- Prontidao reconhecendo MP4 profissional.
- Dossie Criativo incluindo dados de MP4.

## Observacao tecnica

Como o Caderno Vivo atual e um app local em HTML/JavaScript, o FFmpeg e carregado como WebAssembly no navegador. Para funcionar em ambiente totalmente offline, os arquivos do FFmpeg WebAssembly precisam ser empacotados junto com o projeto ou o app precisa ser transformado em versao desktop.

## Decisao

A Fase 9 fecha o fluxo de exportacao profissional em MP4 quando o FFmpeg WebAssembly esta disponivel no navegador.
