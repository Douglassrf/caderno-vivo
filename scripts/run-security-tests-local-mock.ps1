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
$port = 54399
$env:MOCK_SUPABASE_PORT = "$port"
$env:SUPABASE_URL = "http://127.0.0.1:$port"
$env:SUPABASE_ANON_KEY = "mock-anon-key"
$env:TEST_USER_A_EMAIL = "usuario-a@teste.local"
$env:TEST_USER_A_PASSWORD = "senha-a"
$env:TEST_USER_B_EMAIL = "usuario-b@teste.local"
$env:TEST_USER_B_PASSWORD = "senha-b"

$mock = $null

try {
  $mock = Start-Process -FilePath $node -ArgumentList @(".\scripts\mock-supabase-security-server.mjs") -WindowStyle Hidden -PassThru

  $ready = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 250
    try {
      $health = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health" -Method Get -TimeoutSec 2
      if ($health.ok) {
        $ready = $true
        break
      }
    } catch {}
  }

  if (-not $ready) {
    throw "Mock Supabase nao ficou pronto."
  }

  Write-Host "MOCK_SUPABASE_READY http://127.0.0.1:$port"

  & $node .\scripts\test-supabase-idor.mjs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  & $node .\scripts\test-supabase-product-security.mjs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host "LOCAL_MOCK_SECURITY_GATES_PASSED"
} finally {
  if ($mock -and -not $mock.HasExited) {
    Stop-Process -Id $mock.Id -Force
  }
}

