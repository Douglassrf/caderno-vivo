'use strict';
function baseUrl(req){ return `${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}`; }
function parseJson(s){ const t=String(s||'').replace(/```json|```/g,'').trim(); try{return JSON.parse(t);}catch(e){ const m=t.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw e; } }
function normalizeSections(obj){ if(!obj||typeof obj!=='object') return {}; const out={}; Object.keys(obj).forEach(function(k){ const v=obj[k]; if(typeof v==='string') out[k]=v; else if(Array.isArray(v)) out[k]=v.join('\n'); else if(v&&typeof v==='object') out[k]=Object.values(v).join('\n'); else out[k]=String(v||''); }); return out; }
module.exports = async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Método não permitido.'});
  try{ const {prompt='',genre='',mood='',key='',tempo=''}=req.body||{}; if(!String(prompt).trim()) return res.status(400).json({error:'Prompt obrigatório.'});
        const systemPrompt='Você é um compositor brasileiro. Responda SOMENTE com JSON válido sem markdown. Estrutura obrigatória: {"title":"string","style":"string","key":"string","tempo":120,"structure":{"intro":"4 compassos","verso1":"8 compassos","refrão":"8 compassos","outro":"4 compassos"},"lyrics":{"intro":"string","verso1":"string","refrão":"string","verso2":"string","ponte":"string","outro":"string"},"chords":{"intro":"string","verso1":"string","refrão":"string"},"production_notes":"string"}. CRÍTICO: todos os valores dentro de lyrics e chords DEVEM ser strings simples, nunca objetos ou arrays.';
        const r=await fetch(`${baseUrl(req)}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:systemPrompt,messages:[{role:'user',content:`Crie uma música completa. Inspiração: ${prompt}. Gênero: ${genre||'gospel'}. Mood: ${mood||'emocional'}. Tom: ${key||'C'}. BPM: ${tempo||90}.`}],temperature:0.8,max_tokens:2400})});
        const data=await r.json(); if(!r.ok) return res.status(r.status).json(data);
        const parsed=parseJson(data.content);
        if(parsed.lyrics) parsed.lyrics=normalizeSections(parsed.lyrics);
        if(parsed.chords) parsed.chords=normalizeSections(parsed.chords);
        return res.status(200).json(parsed);
     }catch(err){ return res.status(500).json({error:err.message||'Erro ao gerar música.'}); }
};
