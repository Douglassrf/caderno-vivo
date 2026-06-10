# DEPLOY GUIDE — GitHub + Vercel

## 1. Subir no GitHub

```bash
git init
git add .
git commit -m "Caderno Vivo V3.5 final ready"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

## 2. Conectar na Vercel

1. Acesse Vercel.
2. Clique em Add New Project.
3. Importe o repositório GitHub.
4. Framework Preset: Other.
5. Build Command: `npm run build`.
6. Output Directory: deixe vazio ou configure conforme hospedagem estática.
7. Deploy.

## 3. Validação pós-deploy

- Abrir a Home.
- Validar cinco botões centrais.
- Validar botão flutuante +.
- Validar rotas:
  - `#/caderno`
  - `#/minhas-obras`
  - `#/maestro-ia`
  - `#/profissional`
  - `#/jornada-artista`
  - `#/painel-evolucao`
  - `#/conquistas-reais`

## 4. Pendências externas

Credenciais de IA, ISRC, distribuição, contratos, pagamentos e analytics reais devem ser configuradas em ciclos posteriores.
