# Política de Autonomia do Agente (DeepSeek / DeepSync)

Este documento descreve o que o agente de IA (modelo `deepseek-chat`, operando via Open WebUI)
tem permissão de fazer neste repositório, e os mecanismos técnicos que garantem esses limites —
não apenas instrução em prompt, mas controle de acesso real no GitHub.

## Permitido (autônomo, sem aprovação prévia)

Na branch `agent/deepsync` (e somente nela):

- Editar código existente
- Criar novos arquivos
- Apagar arquivos quando necessário
- Instalar dependências
- Rodar testes localmente
- Corrigir erros e repetir até os testes passarem
- Fazer commit
- Fazer push — **apenas para `agent/deepsync`**
- Abrir Pull Request de `agent/deepsync` para `main`
- Disparar o workflow de CI (`.github/workflows/ci.yml`)

## Proibido (bloqueado por controle de acesso, não só por instrução)

- Push direto na branch `main`
- Apagar o repositório
- Alterar Secrets do GitHub Actions
- Desligar ou modificar os workflows de CI/CD (`.github/workflows/*`)
- Disparar deploy sem o CI ter passado
- Fazer merge do próprio Pull Request

## Como cada proibição é garantida tecnicamente

| Regra | Mecanismo |
|---|---|
| Sem push direto na `main` | Proteção de branch do GitHub: `main` exige Pull Request, exige o status check `CI` verde, e exige 1 aprovação humana antes do merge. Push direto é rejeitado pelo próprio GitHub, independente do que o agente "decida". |
| Sem apagar o repositório | O token usado pelo agente é um *Fine-grained Personal Access Token* restrito a este repositório, com permissões apenas de `Contents: Read & Write` e `Pull requests: Read & Write`. Não tem permissão de administração (`Administration`), então não consegue apagar ou transferir o repositório. |
| Sem alterar Secrets / workflows | O mesmo token não tem o escopo `Workflows` nem `Secrets`. Tentativas de alterar `.github/workflows/*` ou Secrets via API são rejeitadas pelo GitHub com 403. |
| Sem deploy sem CI | O workflow `deploy.yml` só é disparado pelo evento `workflow_run` do workflow `CI`, e só executa o passo de deploy `if: github.event.workflow_run.conclusion == 'success'`. Não existe nenhum outro gatilho de deploy configurado. |
| Sem merge do próprio PR | A aprovação obrigatória (`required_pull_request_reviews`) exige um aprovador humano (o dono do repositório). O token do agente não tem permissão de admin para contornar essa regra. |
| Sem token de produção no Open WebUI | O token do Vercel (`VERCEL_TOKEN`) existe somente como Secret do GitHub Actions, nunca como variável de ambiente do container do Open WebUI. O agente nunca tem acesso a esse valor. |

## Resumo do fluxo

```
Agente (deepseek-chat)
   │
   ├─ edita código, roda testes, corrige (branch agent/deepsync)
   ├─ commit + push (só agent/deepsync — bloqueado em qualquer outra branch)
   └─ abre Pull Request → main
            │
            ▼
      CI roda automaticamente (.github/workflows/ci.yml)
            │
      ┌─────┴─────┐
   falhou        passou
      │             │
   PR bloqueado   aguarda aprovação humana (Douglas)
      │             │
   (sem deploy)   aprovado e mesclado na main
                     │
                     ▼
            deploy.yml dispara automaticamente
                     │
                     ▼
            Deploy real na Vercel (produção)
```

## Revisão e revogação

- O token do agente pode ser revogado a qualquer momento em
  https://github.com/settings/personal-access-tokens (sem afetar o restante do projeto).
- A proteção da branch `main` pode ser auditada em
  `Settings → Branches` no repositório no GitHub.
- Este documento deve ser atualizado sempre que a política mudar.
