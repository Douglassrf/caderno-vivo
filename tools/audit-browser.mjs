/**
 * Auditoria E2E — 8 salas, 90+ controles
 * Uso: npx serve . -l 3456  &&  node tools/audit-browser.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.AUDIT_URL || 'http://localhost:3456';
const pass = [];
const fail = [];

function ok(name, detail = '') {
  pass.push(name);
  console.log('PASS', name, detail ? `- ${detail}` : '');
}
function bad(name, detail = '') {
  fail.push({ name, detail });
  console.log('FAIL', name, detail ? `- ${detail}` : '');
}

const CONTROLS = [
  // Home / nav
  { room: 'home', sel: '[data-view="home"]', type: 'nav' },
  { room: 'home', sel: '.cv-btn-nova', type: 'click' },
  { room: 'home', sel: '.cv-room', type: 'count', min: 7 },
  // Escritório
  { room: 'escritorio', sel: '#newWorkButton', action: 'create' },
  { room: 'escritorio', sel: '#saveVersionButton' },
  { room: 'escritorio', sel: '#exportWorkButton' },
  { room: 'escritorio', sel: '#deleteWorkButton' },
  { room: 'escritorio', sel: '#addAudioButton' },
  { room: 'escritorio', sel: '#addBlockButton' },
  { room: 'escritorio', sel: '#compareButton' },
  { room: 'escritorio', sel: '#startSessionButton' },
  { room: 'escritorio', sel: '#generateMentorButton' },
  { room: 'escritorio', sel: '#applyMentorButton' },
  { room: 'escritorio', sel: '#addPhraseButton' },
  { room: 'escritorio', sel: '#reviveButton' },
  { room: 'escritorio', sel: '#markProductionActionButton' },
  { room: 'escritorio', sel: '#professionalPathButton' },
  { room: 'escritorio', sel: '#assistedPathButton' },
  { room: 'escritorio', sel: '#acceptAwarenessButton' },
  { room: 'escritorio', sel: '#acceptRevenueShareButton' },
  { room: 'escritorio', sel: '.nav-item[data-status="todas"]' },
  { room: 'escritorio', sel: '#worksList' },
  { room: 'escritorio', sel: '#phraseList' },
  { room: 'escritorio', sel: '#lyricsInput' },
  // Criar
  { room: 'criar', sel: '#quickCaptureButton' },
  { room: 'criar', sel: '#exportBackupButton' },
  { room: 'criar', sel: '#importBackupButton' },
  { room: 'criar', sel: '#searchInput' },
  { room: 'criar', sel: '#cv-obra-ativa' },
  // Maestro
  { room: 'maestro', sel: '#maestro-input' },
  { room: 'maestro', sel: '#maestro-send' },
  { room: 'maestro', sel: '#maestro-log' },
  { room: 'maestro', sel: '#maestro-quick button', type: 'count', min: 5 },
  // Obras
  { room: 'obras', sel: '#totalWorks' },
  { room: 'obras', sel: '#totalPhrases' },
  { room: 'obras', sel: '#totalVersions' },
  { room: 'obras', sel: '#totalAudios' },
  { room: 'obras', sel: '#totalDossiers' },
  { room: 'obras', sel: '#totalMentor' },
  { room: 'obras', sel: '#totalProductionReady' },
  { room: 'obras', sel: '#totalLaunchReady' },
  { room: 'obras', sel: '#totalClipPlans' },
  { room: 'obras', sel: '#totalRenderedClips' },
  // Internacional
  { room: 'internacional', sel: '#sourceLanguageInput option', type: 'count', min: 172 },
  { room: 'internacional', sel: '#targetLanguageInput option', type: 'count', min: 172 },
  { room: 'internacional', sel: '#intlLangSearch' },
  { room: 'internacional', sel: '#generateInternationalButton', action: 'intl' },
  { room: 'internacional', sel: '#saveInternationalButton' },
  { room: 'internacional', sel: '#plusOfferButton' },
  { room: 'internacional', sel: '#adaptationModeInput' },
  { room: 'internacional', sel: '#internationalOutput' },
  // Cinema
  { room: 'cinema', sel: '#generateClipPlanButton', action: 'clipPlan' },
  { room: 'cinema', sel: '#generateStoryboardButton' },
  { room: 'cinema', sel: '#exportClipScriptButton' },
  { room: 'cinema', sel: '#exportClipPromptsButton' },
  { room: 'cinema', sel: '#markClipActionButton' },
  { room: 'cinema', sel: '#addClipSceneButton' },
  { room: 'cinema', sel: '#cv-btn-gerar-capa', action: 'globalFn', fn: 'gerarCapaObra' },
  { room: 'cinema', sel: '#cv-btn-gerar-todas-imgs', action: 'globalFn', fn: 'gerarTodasImagensClipe' },
  { room: 'cinema', sel: '#generateInternationalClipButton' },
  { room: 'cinema', sel: '#primeOfferButton' },
  { room: 'cinema', sel: '#renderClipButton' },
  { room: 'cinema', sel: '#downloadRenderedClipButton' },
  { room: 'cinema', sel: '#convertMp4Button' },
  { room: 'cinema', sel: '#downloadMp4Button' },
  { room: 'cinema', sel: '#downloadPublishPackButton' },
  { room: 'cinema', sel: '#clipScenesList' },
  { room: 'cinema', sel: '#exportPresetInput' },
  // Carreira
  { room: 'carreira', sel: '#markReleaseActionButton' },
  { room: 'carreira', sel: '#generateDossierButton', action: 'dossier' },
  { room: 'carreira', sel: '#exportDossierButton' },
  { room: 'carreira', sel: '#addAuthorButton' },
  { room: 'carreira', sel: '#releaseChecklist' },
  { room: 'carreira', sel: '#protectionChecklist' },
  { room: 'carreira', sel: '#collectionChecklist' },
  { room: 'carreira', sel: '#timelineList' },
  { room: 'carreira', sel: '#dossierPreview' },
];

const browser = await chromium.launch({ headless: true, channel: 'msedge' }).catch(() => chromium.launch({ headless: true }));
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);

  if (errors.length) bad('JS page load', errors[0]);
  else ok('JS page load', 'sem erros no console');

  // Home integrity
  const home = await page.locator('#cv-home').innerHTML();
  if (home.includes('spnacional')) bad('Home HTML', 'corrupto');
  else ok('Home HTML', 'sem duplicação');
  if ((home.match(/Cofre de Ideias/g) || []).length === 1) ok('Home cards', 'Cofre único');
  else bad('Home cards', 'duplicado');

  // 8 nav rooms
  for (const v of ['home', 'escritorio', 'criar', 'maestro', 'obras', 'internacional', 'cinema', 'carreira']) {
    await page.click(`[data-view="${v}"]`);
    await page.waitForTimeout(350);
    const view = page.locator(`#cv-${v}`);
    if (await view.count() && (await view.getAttribute('class') || '').includes('active')) ok(`Nav sala:${v}`);
    else bad(`Nav sala:${v}`, 'view não ativa');
  }

  // Create work once for dependent actions
  await page.click('[data-view="escritorio"]');
  await page.waitForTimeout(300);
  if (await page.locator('#emptyNewWorkButton').isVisible()) await page.click('#emptyNewWorkButton');
  await page.waitForTimeout(400);
  await page.fill('#lyricsInput', 'Verso de teste\nRefrao de teste\nPonte de teste');
  await page.fill('#titleInput', 'Obra Auditoria');

  for (const c of CONTROLS) {
    await page.click(`[data-view="${c.room}"]`);
    await page.waitForTimeout(300);
    const loc = page.locator(c.sel);
    if (c.type === 'count') {
      const n = await loc.count();
      if (n >= (c.min || 1)) ok(`${c.room}:${c.sel}`, `count=${n}`);
      else bad(`${c.room}:${c.sel}`, `count=${n}`);
      continue;
    }
    if (!(await loc.count())) {
      bad(`${c.room}:${c.sel}`, 'ausente');
      continue;
    }
    if (c.action === 'globalFn') {
      const hasFn = await page.evaluate((fn) => typeof window[fn] === 'function', c.fn);
      if (hasFn) ok(`${c.room}:${c.fn}`, 'global');
      else bad(`${c.room}:${c.fn}`, 'não exposto em window');
      continue;
    }
    ok(`${c.room}:${c.sel}`, 'presente');
    if (c.action === 'intl') {
      const before = await page.locator('#internationalOutput').innerText();
      await page.click('#generateInternationalButton');
      await page.waitForTimeout(700);
      const after = await page.locator('#internationalOutput').innerText();
      const btn = await page.locator('#generateInternationalButton').innerText();
      if (after !== before || /Traduzindo/i.test(btn)) ok('internacional:click', 'respondeu');
      else bad('internacional:click', 'sem feedback');
    }
    if (c.action === 'clipPlan') {
      await page.click('#generateClipPlanButton');
      await page.waitForTimeout(400);
      const scenes = await page.locator('#clipScenesList .clip-scene-card').count();
      if (scenes > 0) ok('cinema:roteiro', `${scenes} cenas`);
      else bad('cinema:roteiro', 'sem cenas');
    }
    if (c.action === 'dossier') {
      await page.click('[data-view="escritorio"]');
      await page.waitForTimeout(300);
      await page.locator('#acceptAwarenessButton').scrollIntoViewIfNeeded();
      await page.click('#acceptAwarenessButton');
      await page.waitForTimeout(200);
      await page.click('[data-view="carreira"]');
      await page.waitForTimeout(300);
      await page.fill('#authorNameInput', 'Compositor Teste');
      await page.fill('#authorShareInput', '100');
      await page.click('#addAuthorButton');
      await page.waitForTimeout(200);
      await page.click('#generateDossierButton');
      await page.waitForTimeout(600);
      const st = await page.locator('#dossierStatus').innerText();
      if (/gerado/i.test(st)) ok('carreira:dossie', st.slice(0, 40));
      else bad('carreira:dossie', st);
    }
  }

  // Maestro welcome + chip
  await page.click('[data-view="maestro"]');
  await page.waitForTimeout(500);
  const welcome = await page.locator('#maestro-log').innerText();
  if (welcome.includes('Bem-vindo')) ok('maestro:welcome');
  else bad('maestro:welcome');
  await page.locator('#maestro-quick button').first().click();
  const inp = await page.locator('#maestro-input').inputValue();
  if (inp.includes('Me ajude')) ok('maestro:chip');
  else bad('maestro:chip');

  // cvNav global
  const hasNav = await page.evaluate(() => typeof window.cvNav === 'function');
  if (hasNav) ok('cvNav global');
  else bad('cvNav global');

} catch (e) {
  bad('execução', e.message);
} finally {
  await browser.close();
}

console.log(`\n=== AUDITORIA E2E ===`);
console.log(`Passaram: ${pass.length}`);
console.log(`Falharam: ${fail.length}`);
if (fail.length) {
  fail.forEach((f) => console.error(`  - ${f.name}: ${f.detail}`));
  process.exit(1);
}
console.log(`Total verificado: ${pass.length} checks (90+ controles)`);
