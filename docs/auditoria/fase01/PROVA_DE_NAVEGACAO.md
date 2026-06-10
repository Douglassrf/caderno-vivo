# Prova de navegação — Fase 01 Caderno Vivo V3.5

## Rotas implementadas

- `#/home` — Home principal.
- `#/caderno` — Caderno do Compositor.
- `#/criar-musica` — Criar Música.
- `#/minhas-obras` — Minhas Obras.
- `#/maestro-ia` — Maestro IA.
- `#/profissional` — Profissional.
- `#/perfil/iniciante` — Perfil Iniciante.
- `#/perfil/compositor` — Perfil Compositor.
- `#/perfil/profissional` — Perfil Profissional.

## Botão flutuante +

Ações implementadas:

- Nova Ideia → `#/caderno?acao=ideia`
- Nova Letra → `#/caderno?acao=letra`
- Novo Áudio → `#/caderno?acao=audio`
- Nova Música → `#/criar-musica?acao=musica`
- Nova Obra → `#/minhas-obras?acao=obra`

## Comprovação técnica

O arquivo `src/phase01-v35.js` usa `location.hash` para navegação entre rotas e `localStorage` para preservar o modo do usuário.

O build executa:

```bash
npm run build
```

Resultado: PASS.
