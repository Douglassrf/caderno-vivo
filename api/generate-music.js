'use strict';
function baseUrl(req){ return `${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}`; }
function parseJson(s){ const t=String(s||'').replace(/```json|```/g,'').trim(); try{return JSON.parse(t);}catch(e){ const m=t.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw e; } }
module.exports = async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Método não permitido.'});
 try{ const {prompt='',genre='',mood='',key='',tempo=''}=req.body||{}; if(!String(prompt).trim()) return res.status(400).json({error:'Prompt obrigatório.'});
  const r=await fetch(`${baseUrl(req)}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:'Você é um compositor brasileiro. Responda somente JSON válido com title, style, key, tempo, structure, lyrics (objeto por seções), chords (objeto por seções), production_notes.',messages:[{role:'user',content:`Crie uma música completa. Inspiração: ${prompt}. Gênero: ${genre}. Mood: ${mood}. Tom: ${key}. BPM: ${tempo}.`}],temperature:0.8,max_tokens:2400})});
  const data=await r.json(); if(!r.ok) return res.status(r.status).json(data); return res.status(200).json(parseJson(data.content));
 }catch(err){ return res.status(500).json({error:err.message||'Erro ao gerar música.'}); }
};
