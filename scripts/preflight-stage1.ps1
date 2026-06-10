param(
  [string]$EnvFile = ".env.supabase"
)

$ErrorActionPreference = "Stop"

function Find-Node {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) {
    try {
      & $cmd.Source --version | Out-Null
      return $cmd.Source
    } catch {}
  }

  $codexNode = Get-ChildItem -Path "$env:LOCALAPPDATA\OpenAI\Codex\bin" -Recurse -Filter node.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName

  if ($codexNode) {
    & $codexNode --version | Out-Null
    return $codexNode
  }

  throw "Node.js funcional nao encontrado."
}

$node = Find-Node
Write-Host "NODE=$node"

$syntaxTargets = @(
  "app.js",
  "scripts/test-supabase-idor.mjs",
  "scripts/test-supabase-product-security.mjs",
  "scripts/audit-security-artifacts.mjs"
)

foreach ($target in $syntaxTargets) {
  & $node --check $target
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "SYNTAX_OK $target"
}

& $node .\scripts\audit-security-artifacts.mjs --artifacts-only
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Host "STAGE1_PREFLIGHT_READY_BUT_ENV_MISSING"
  Write-Host "Crie $EnvFile para rodar os gates reais."
  exit 0
}

powershell -ExecutionPolicy Bypass -File .\scripts\run-security-tests.ps1 -EnvFile $EnvFile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "STAGE1_PREFLIGHT_AND_GATES_PASSED"

