/* ================================================================
MODULO — Credits Manager (Cofre do Artista)
Arquivo: credits-manager.js

Sistema de creditos gratuitos:
  100 creditos ao primeiro acesso ("Cofre do Artista")
  Custo: traducao=1, mentor=2, capa=2, storyboard=3, letra=5, audio=5, clipe=10
  Armazenado no localStorage (pronto para migrar ao Supabase)

Como usar em app.js:
  import { initCredits, canAfford, deductCredits } from './credits-manager.js';
  initCredits();
  if (!canAfford('lyrics')) { alert('Creditos insuficientes'); return; }
  deductCredits('lyrics', 'Gerar letra');
================================================================ */

const CV_CREDITS_KEY     = 'cv_credits_v1';
const CV_FIRST_VISIT_KEY = 'cv_first_visit_v1';
const INITIAL_CREDITS    = 100;

export const CREDIT_COST = {
  text: 1, translation: 1, mentor: 2, image: 2,
  storyboard: 3, lyrics: 5, audio: 5, video: 10,
};

/* ── Inicializar — chamar no DOMContentLoaded ── */
export function initCredits() {
  const isFirst = !localStorage.getItem(CV_FIRST_VISIT_KEY);
  if (isFirst) {
    localStorage.setItem(CV_FIRST_VISIT_KEY, Date.now().toString());
    _saveCredits({
      balance: INITIAL_CREDITS,
      gifted:  INITIAL_CREDITS,
      history: [{ type: 'gift', cost: -INITIAL_CREDITS, description: 'Cofre do Artista - boas-vindas', timestamp: Date.now() }],
    });
    setTimeout(showCofreWelcome, 800);
  }
  _renderBadge();
  return getCredits();
}

export function getCredits() {
  try {
    const raw = localStorage.getItem(CV_CREDITS_KEY);
    return raw ? JSON.parse(raw) : { balance: 0, gifted: 0, history: [] };
  } catch { return { balance: 0, gifted: 0, history: [] }; }
}

export function getBalance() { return getCredits().balance; }

export function canAfford(type) {
  return getBalance() >= (CREDIT_COST[type] ?? 1);
}

export function deductCredits(type, description = '') {
  const cost = CREDIT_COST[type] ?? 1;
  const data = getCredits();
  if (data.balance < cost) { showInsufficientCredits(cost, data.balance); return false; }
  data.balance -= cost;
  data.history.push({ type, cost, description, timestamp: Date.now() });
  _saveCredits(data);
  _renderBadge();
  return true;
}

export function addCredits(amount, reason = 'Bonus') {
  const data = getCredits();
  data.balance += amount;
  data.gifted  += amount;
  data.history.push({ type: 'credit', cost: -amount, description: reason, timestamp: Date.now() });
  _saveCredits(data);
  _renderBadge();
  _flashBadge('+ ' + amount + ' creditos!');
}

function _renderBadge() {
  const { balance } = getCredits();
  let badge = document.getElementById('cv-credits-badge');
  if (!badge) {
    badge = document.createElement('button');
    badge.id    = 'cv-credits-badge';
    badge.type  = 'button';
    badge.title = 'Ver seu Cofre do Artista';
    badge.style.cssText = `
      position:fixed; bottom:80px; right:20px;
      background:linear-gradient(135deg,#3b82f6,#8b5cf6);
      color:#fff; border:none; border-radius:20px;
      padding:7px 16px; font-size:13px; font-weight:600;
      box-shadow:0 0 14px rgba(139,92,246,.55);
      cursor:pointer; z-index:900;
      transition:transform .18s ease, box-shadow .18s ease;
    `;
    badge.addEventListener('click', toggleCreditsPanel);
    badge.addEventListener('mouseenter', () => { badge.style.transform='scale(1.06)'; badge.style.boxShadow='0 0 22px rgba(139,92,246,.75)'; });
    badge.addEventListener('mouseleave', () => { badge.style.transform='scale(1)'; badge.style.boxShadow='0 0 14px rgba(139,92,246,.55)'; });
    document.body.appendChild(badge);
  }
  badge.textContent = `Cofre: ${balance}`;
}

function _flashBadge(msg) {
  const badge = document.getElementById('cv-credits-badge');
  if (!badge) return;
  const orig = badge.textContent;
  badge.textContent = msg;
  badge.style.transform = 'scale(1.15)';
  setTimeout(() => { badge.style.transform='scale(1)'; _renderBadge(); }, 1800);
}

function toggleCreditsPanel() {
  const existing = document.getElementById('cv-credits-panel');
  if (existing) { existing.remove(); return; }

  const { balance, gifted, history } = getCredits();
  const used = Math.max(0, gifted - balance);

  const panel = document.createElement('div');
  panel.id = 'cv-credits-panel';
  panel.style.cssText = `
    position:fixed; bottom:124px; right:20px;
    background:linear-gradient(145deg,#0f0f23,#1a1a3e);
    border:1px solid rgba(139,92,246,.35); border-radius:16px;
    padding:20px; width:290px;
    box-shadow:0 0 32px rgba(139,92,246,.28);
    z-index:901; color:#fff; font-family:inherit;
  `;

  const recentHistory = [...history].reverse().slice(0, 5);
  const historyHTML = recentHistory.length
    ? recentHistory.map(h => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px"><span style="color:#c0c0d8">${h.description||h.type}</span><span style="color:${h.cost>0?'#ef4444':'#10b981'};font-weight:600">${h.cost>0?`-${h.cost}`:`+${Math.abs(h.cost)}`}</span></div>`).join('')
    : '<p style="color:#6060a0;font-size:12px;text-align:center;padding:8px 0">Nenhuma atividade ainda</p>';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="margin:0;font-size:15px;font-weight:700">Cofre do Artista</h3>
      <button onclick="this.closest('#cv-credits-panel').remove()" style="background:none;border:none;color:#808098;font-size:18px;cursor:pointer">x</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:18px;text-align:center">
      <div style="background:rgba(139,92,246,.12);border-radius:10px;padding:10px 4px">
        <div style="font-size:26px;font-weight:700;color:#8b5cf6">${balance}</div>
        <div style="font-size:10px;color:#8080a0;margin-top:2px">disponiveis</div>
      </div>
      <div style="background:rgba(59,130,246,.12);border-radius:10px;padding:10px 4px">
        <div style="font-size:26px;font-weight:700;color:#3b82f6">${used}</div>
        <div style="font-size:10px;color:#8080a0;margin-top:2px">usados</div>
      </div>
      <div style="background:rgba(16,185,129,.12);border-radius:10px;padding:10px 4px">
        <div style="font-size:26px;font-weight:700;color:#10b981">${gifted}</div>
        <div style="font-size:10px;color:#8080a0;margin-top:2px">recebidos</div>
      </div>
    </div>
    <div style="margin-bottom:14px">
      <p style="font-size:11px;color:#6060a0;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:.5px">Atividade recente</p>
      ${historyHTML}
    </div>
    <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:12px;font-size:12px;color:#9090b8">
      Letra=5 &middot; Traducao=1 &middot; Capa=2 &middot; Storyboard=3 &middot; Mentor=2 &middot; Audio=5
    </div>
  `;
  document.body.appendChild(panel);
  setTimeout(() => {
    function closer(e) {
      const p = document.getElementById('cv-credits-panel');
      const b = document.getElementById('cv-credits-badge');
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) { p.remove(); document.removeEventListener('click', closer); }
    }
    document.addEventListener('click', closer);
  }, 120);
}

function showCofreWelcome() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,10,.75);
    display:flex; align-items:center; justify-content:center;
    z-index:9999; backdrop-filter:blur(6px);
  `;
  overlay.innerHTML = `
    <div style="background:linear-gradient(145deg,#0f0f23,#1c1c40);border:1px solid rgba(139,92,246,.4);border-radius:22px;padding:40px 36px;max-width:420px;width:90%;text-align:center;box-shadow:0 0 60px rgba(139,92,246,.3)">
      <div style="font-size:52px;margin-bottom:12px">&#127873;</div>
      <h2 style="color:#fff;font-size:22px;margin:0 0 10px 0;font-weight:700">Bem-vindo ao Cofre do Artista</h2>
      <p style="color:#9090b8;font-size:14px;line-height:1.6;margin:0 0 24px 0">
        Voce recebeu <strong style="color:#8b5cf6">100 creditos gratuitos</strong> para explorar o Caderno Vivo.
      </p>
      <div style="background:rgba(255,255,255,.04);border-radius:14px;padding:16px 20px;margin-bottom:28px;text-align:left">
        <p style="color:#6060a0;font-size:11px;text-transform:uppercase;letter-spacing:.6px;margin:0 0 10px 0">O que voce pode criar</p>
        <div style="color:#c8c8e0;font-size:13px;line-height:2.1">
          Gerar letra completa — <span style="color:#8b5cf6;font-weight:600">5 creditos</span><br>
          Traduzir para outro idioma — <span style="color:#8b5cf6;font-weight:600">1 credito</span><br>
          Criar capa com IA — <span style="color:#8b5cf6;font-weight:600">2 creditos</span><br>
          Gerar storyboard — <span style="color:#8b5cf6;font-weight:600">3 creditos</span><br>
          Consultar o Mentor Criativo — <span style="color:#8b5cf6;font-weight:600">2 creditos</span>
        </div>
      </div>
      <button id="cv-cofre-start-btn" style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;border:none;border-radius:14px;padding:14px 0;font-size:16px;font-weight:700;cursor:pointer;width:100%">
        Comecar a criar
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('cv-cofre-start-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function showInsufficientCredits(needed, have) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; top:24px; left:50%;
    transform:translateX(-50%) translateY(-10px);
    background:linear-gradient(135deg,#1a1a3e,#2a0a2e);
    border:1px solid rgba(239,68,68,.4); border-radius:14px;
    padding:14px 24px; color:#fff; font-size:14px; font-weight:500;
    box-shadow:0 0 24px rgba(239,68,68,.25); z-index:9998;
    transition:transform .3s ease, opacity .3s ease;
    max-width:340px; text-align:center;
  `;
  toast.textContent = `Precisa de ${needed} creditos. Saldo: ${have}. Em breve: plano compositor!`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
    setTimeout(() => toast.remove(), 310);
  }, 3500);
}

function _saveCredits(data) {
  localStorage.setItem(CV_CREDITS_KEY, JSON.stringify(data));
}
