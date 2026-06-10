import fs from "node:fs";

const required = [
  "src/supabaseClient.js",
  "src/authService.js",
  "src/storageAdapter.js",
  "src/profileService.js",
  "supabase/migrations/004_user_assets_and_profiles.sql",
  "docs/missoes/MISSAO_01_FUNDACAO_SUPABASE_PREPARADA_ATUALIZADA.md",
  "docs/missoes/MISSAO_02_AUTENTICACAO_REAL_PREPARADA_ATUALIZADA.md",
  "docs/missoes/MISSAO_03_PERFIL_SESSAO_PREPARADA_ATUALIZADA.md",
  "memoria/MEMORIA_MISSOES_01_02_03_ATUALIZADA.md",
  "memoria/MEMORIA_MISSOES_04_05_06_PREPARADA_ATUALIZADA.md",
];

const checks = required.map((path) => ({ path, ok: fs.existsSync(path) }));
const failed = checks.filter((item) => !item.ok);
const report = {
  status: failed.length ? "FAILED" : "PASSED",
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  checks,
};
fs.writeFileSync("MISSION_1_2_3_UPDATED_REPORT.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
