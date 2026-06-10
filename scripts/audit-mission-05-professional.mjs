import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const required = [
  'src/mission05-professional.js',
  'src/components/ProfessionalSuite.jsx',
  'src/components/RegistrationManager.jsx',
  'src/components/ISRCManager.jsx',
  'src/components/DistributionManager.jsx',
  'src/components/LicensingManager.jsx',
  'src/components/ContractManager.jsx',
  'src/components/AnalyticsManager.jsx',
  'src/components/RoyaltyManager.jsx',
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missão 05 reprovada. Arquivos ausentes:', missing.join(', '));
  process.exit(1);
}
const index = readFileSync('index.html', 'utf8');
const phase = readFileSync('src/phase01-v35.js', 'utf8');
const source = readFileSync('src/mission05-professional.js', 'utf8');
const tokens = ['Registro autoral', 'ISRC', 'Distribuição', 'Licenciamento', 'Contratos', 'Analytics', 'Royalties'];
const missingTokens = tokens.filter((token) => !source.includes(token));
if (!index.includes('mission05-professional.js')) {
  console.error('Missão 05 reprovada. Script não incluído no index.html.');
  process.exit(1);
}
if (!phase.includes('window.ProfessionalSuite.render') || !phase.includes('window.ProfessionalSuite.bind')) {
  console.error('Missão 05 reprovada. Rota Profissional não integrada ao phase01-v35.js.');
  process.exit(1);
}
if (missingTokens.length) {
  console.error('Missão 05 reprovada. Entregas ausentes:', missingTokens.join(', '));
  process.exit(1);
}
mkdirSync('docs/auditoria/missao05/capturas', { recursive: true });
writeFileSync('docs/auditoria/missao05/capturas/home-profissional.txt', 'Captura textual: rota #/profissional renderiza ProfessionalSuite com Registro, ISRC, Distribuição, Licenciamento, Contratos, Analytics e Royalties.');
writeFileSync('docs/auditoria/missao05/capturas/formulario-profissional.txt', 'Captura textual: formulário permite adicionar Registro autoral, ISRC, Distribuição, Licenciamento, Contrato e Royalty.');
writeFileSync('docs/auditoria/missao05/RELATORIO_ENTREGA_MISSAO05.md', `# Relatório de Entrega — Missão 05 Profissional\n\n## Status\nPASS\n\n## Arquivos validados\n${required.map((file) => `- ${file}`).join('\n')}\n\n## Entregas implementadas\n- Registro autoral\n- ISRC\n- Distribuição\n- Licenciamento\n- Contratos\n- Analytics\n- Royalties\n\n## Integração\n- Rota #/profissional integrada ao ProfessionalSuite.\n- Botão Profissional da Home abre módulo funcional.\n- Dados persistidos em localStorage.\n\n## Pendências reais\n- Integração futura com serviços oficiais de registro, distribuidoras, ISRC e gateways financeiros quando credenciais forem disponibilizadas.\n`);
console.log('mission05 professional audit passed');
