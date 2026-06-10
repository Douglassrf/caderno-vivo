import { spawn } from 'node:child_process';

const port = process.env.MOCK_SUPABASE_PORT || '54399';
const env = {
  ...process.env,
  MOCK_SUPABASE_PORT: port,
  SUPABASE_URL: `http://127.0.0.1:${port}`,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'mock-anon-key',
  TEST_USER_A_EMAIL: process.env.TEST_USER_A_EMAIL || 'usuario-a@teste.local',
  TEST_USER_A_PASSWORD: process.env.TEST_USER_A_PASSWORD || 'senha-a',
  TEST_USER_B_EMAIL: process.env.TEST_USER_B_EMAIL || 'usuario-b@teste.local',
  TEST_USER_B_PASSWORD: process.env.TEST_USER_B_PASSWORD || 'senha-b',
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const response = await fetch(`${env.SUPABASE_URL}/health`);
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok) return true;
    } catch {}
    await wait(250);
  }
  return false;
}

function runNodeScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], { env, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} saiu com codigo ${code}`));
    });
    child.on('error', reject);
  });
}

const mock = spawn(process.execPath, ['scripts/mock-supabase-security-server.mjs'], { env, stdio: 'inherit' });

try {
  const ready = await waitForHealth();
  if (!ready) throw new Error('Mock Supabase nao ficou pronto.');
  console.log(`MOCK_SUPABASE_READY ${env.SUPABASE_URL}`);
  await runNodeScript('scripts/test-supabase-idor.mjs');
  await runNodeScript('scripts/test-supabase-product-security.mjs');
  console.log('LOCAL_MOCK_SECURITY_GATES_PASSED');
} finally {
  mock.kill('SIGTERM');
}
