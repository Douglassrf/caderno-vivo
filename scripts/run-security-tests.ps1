param(
  [string]$EnvFile = ".env.supabase"
)

$ErrorActionPreference = "Stop"

function Import-DotEnv {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Arquivo de ambiente nao encontrado: $Path"
  }

  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $parts = $line.Split("=", 2)
    if ($parts.Count -ne 2) { return }
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

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

Import-DotEnv -Path $EnvFile
$node = Find-Node

Write-Host "NODE=$node"
& $node .\scripts\test-supabase-idor.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $node .\scripts\test-supabase-product-security.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "SECURITY_GATES_PASSED"

