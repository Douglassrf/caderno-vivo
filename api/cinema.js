'use strict';
function baseUrl(req){ return `${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}`; }
function parseJson(s){ const t=String(s||'').replace(/```json|```/g,'').trim(); try{return JSON.parse(t);}catch(e){ const m=t.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw e; } }
module.exports = async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Método não permitido.'});
 try{ const {title='',genre='',style='',synopsis=''}=req.body||{};
  const r=await fetch(`${baseUrl(req)}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:'Você é um diretor de videoclipes. Responda somente JSON válido com title, concept, location, scenes array de {id,time,description,shot,mood,action}, cast, budget_estimate, production_notes.',messages:[{role:'user',content:`Título: ${title}\nGênero: ${genre}\nEstilo visual: ${style}\nSinopse/letra: ${synopsis}`}],temperature:0.75,max_tokens:2400})});
  const data=await r.json(); if(!r.ok) return res.status(r.status).json(data); return res.status(200).json(parseJson(data.content));
 }catch(err){ return res.status(500).json({error:err.message||'Erro ao gerar roteiro.'}); }
};
