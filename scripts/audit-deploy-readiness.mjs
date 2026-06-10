import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { buildDeployChecklist, buildHomologationGates } from "../src/deployReadinessService.js";

const root = process.cwd();

function listFiles(dir) {
  const out = [];
  for (const item of readdirSync(dir)) {
    if (["node_modules", ".git"].includes(item)) continue;
    const full = join(dir, item);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listFiles(full));
    else out.push(relative(root, full).replaceAll("\\\\", "/").replaceAll("\\", "/"));
  }
  return out;
}

const env = process.env;
const files = listFiles(root);
const deploy = buildDeployChecklist({ env, files });
const gates = buildHomologationGates({
  idorPassed: env.IDOR_TEST_PASSED === "true",
  productSecurityPassed: env.PRODUCT_SECURITY_TEST_PASSED === "true",
  deployReady: deploy.ready,
});

const report = {
  generatedAt: new Date().toISOString(),
  deploy,
  gates,
  recommendation: gates.APPROVED_FOR_MVP
    ? "MVP pode seguir para deploy controlado."
    : "Nao liberar MVP ate passar gates reais de Supabase, seguranca e variaveis.",
};

writeFileSync("DEPLOY_READINESS_REPORT.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!existsSync("DEPLOY_READINESS_REPORT.json")) process.exit(1);
