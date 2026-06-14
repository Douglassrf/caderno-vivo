import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const fail=[]; const pass=[];
const html=fs.readFileSync('index.html','utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
function ok(name, cond){(cond?pass:fail).push(name);}
['home','escritorio','criar','maestro','obras','internacional','cinema','carreira'].forEach(v=>{
  ok(`nav:${v}`, html.includes(`data-view="${v}"`));
  ok(`view:cv-${v}`, ids.has(`cv-${v}`));
});
ok('sidebar tem exatamente 8 botões principais', (html.match(/class="cv-nav-btn/g)||[]).length===8);
ok('mobile icon bar configurada', /@media \(max-width:900px\)[\s\S]*--cv-nav-w:var\(--cv-nav-w-sm\)/.test(html));
ok('destino internacional possui 70+ idiomas', ((html.match(/id="targetLanguageInput"[\s\S]*?<\/select>/)||[''])[0].match(/<option/g)||[]).length>=70);
['newWorkButton','saveVersionButton','addAudioButton','generateMentorButton','generateInternationalButton','generateClipPlanButton','generateStoryboardButton','renderClipButton','generateDossierButton','exportDossierButton','searchInput','quickCaptureButton','exportBackupButton','importBackupButton'].forEach(id=>ok(`controle:${id}`,ids.has(id)));
const app=fs.readFileSync('app.js','utf8').replace(/^\uFEFF/,'');
const elsBlock=(app.match(/const els=\{([\s\S]*?)\};/)||[])[1]||'';
[...elsBlock.matchAll(/:\$\("#([^"]+)"\)/g)].forEach(m=>ok(`elemento referenciado existe:${m[1]}`,ids.has(m[1])));
for (const file of ['app.js','cv-engine.js','maestro.js','api/claude-proxy.js','api/translate.js','api/maestro.js','api/hybrid-router.js','api/orchestrator.js']) {
  const result = spawnSync(process.execPath, ['--check', file], {encoding:'utf8'});
  ok(`syntax:${file}${result.status ? ' '+(result.stderr || result.stdout).trim() : ''}`, result.status === 0);
}
const vercel=JSON.parse(fs.readFileSync('vercel.json','utf8'));
['claude-proxy','translate','maestro','hybrid-router','orchestrator'].forEach(api=>ok(`vercel route:${api}`, JSON.stringify(vercel).includes(`/api/${api}`)));
console.log(`✅ Passaram: ${pass.length}`); pass.forEach(x=>console.log(`✅ ${x}`));
if(fail.length){console.error(`❌ Falharam: ${fail.length}`); fail.forEach(x=>console.error(`❌ ${x}`)); process.exit(1);} 
console.log('✅ Auditoria ponta a ponta estática concluída sem falhas.');
