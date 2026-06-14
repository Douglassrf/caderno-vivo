/* ================================================================
ORQUESTRADOR — Caderno Vivo  |  api/orchestrator.js
4 Camadas: 1=WebGPU local  2=Cache Supabase  3=Pool APIs  4=Fila n8n
Variaveis Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY, N8N_WEBHOOK_URL, GROQ_API_KEY
================================================================ */
import crypto from 'crypto';
const SUPABASE_URL=process.env.SUPABASE_URL, SUPABASE_SERVICE_KEY=process.env.SUPABASE_SERVICE_KEY, N8N_WEBHOOK_URL=process.env.N8N_WEBHOOK_URL, GROQ_API_KEY=process.env.GROQ_API_KEY;
const CREDIT_COST={text:1,translation:1,mentor:2,image:2,storyboard:3,lyrics:5,audio:5,video:10};
const TYPE_PROVIDERS={text:['groq','huggingface','together'],lyrics:['groq','together','huggingface'],translation:['groq','mymemory','huggingface'],mentor:['groq','together'],storyboard:['groq','together'],image:['pollinations','fal-ai','replicate','huggingface'],audio:['replicate','fal-ai','huggingface'],video:['fal-ai','replicate']};

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(200).end();
  if(req.method!=='POST')return res.status(405).json({error:'Metodo nao permitido.'});
  const{type,payload,userId='anon',skipCache=false}=req.body??{};
  if(!type)return res.status(400).json({error:'Campo type obrigatorio.'});
  if(!payload)return res.status(400).json({error:'Campo payload obrigatorio.'});
  if(!TYPE_PROVIDERS[type])return res.status(400).json({error:'Tipo nao suportado.'});
  const requestId=crypto.randomUUID(), startedAt=Date.now();
  console.log('[orchestrator]['+requestId.slice(0,8)+'] inicio tipo='+type);
  /* CAMADA 2: Cache */
  if(!skipCache){const hit=await checkCache(type,payload);if(hit)return res.status(200).json({...hit,layer:2,cached:true,requestId,latencyMs:Date.now()-startedAt});}
  /* CAMADA 3: Pool rotativo */
  let lastError=null;
  for(const provider of TYPE_PROVIDERS[type]){
    const apiKey=await getAvailableKey(provider);
    if(!apiKey){console.log('[orchestrator] '+provider+': sem cota');continue;}
    try{
      const result=await callProvider(provider,type,payload,apiKey.key);
      await markKeyUsed(apiKey.id);
      await saveCache(type,payload,result);
      console.log('[orchestrator] sucesso via '+provider+' em '+(Date.now()-startedAt)+'ms');
      return res.status(200).json({...result,layer:3,cached:false,provider,requestId,creditsUsed:CREDIT_COST[type]??1,latencyMs:Date.now()-startedAt});
    }catch(err){lastError=err;console.warn('[orchestrator] '+provider+' falhou: '+err.message);await markKeyFailed(apiKey.id,err.message);}
  }
  /* CAMADA 4: Fila n8n */
  const queued=await sendToQueue(requestId,type,payload,userId,lastError?.message);
  if(queued)return res.status(202).json({layer:4,queued:true,requestId,message:'Sua obra esta em processamento prioritario e sera entregue em breve.',estimatedMinutes:{text:1,translation:1,lyrics:2,mentor:2,storyboard:3,image:5,audio:10,video:20}[type]??5});
  return res.status(503).json({error:'Servico temporariamente indisponivel.',requestId});
}

/* ── CAMADA 2: Cache ── */
async function checkCache(type,payload){
  if(!SUPABASE_URL||!SUPABASE_SERVICE_KEY)return null;
  try{const hash=buildHash(type,payload);const resp=await sbFetch('/rest/v1/cache_obras?hash=eq.'+hash+'&select=result_json,result_url,provider');if(!resp.ok)return null;const rows=await resp.json();if(!rows.length)return null;await sbFetch('/rest/v1/rpc/increment_cache_hit','POST',{p_hash:hash});return rows[0].result_json??{imageUrl:rows[0].result_url,provider:rows[0].provider};}catch{return null;}
}
async function saveCache(type,payload,result){
  if(!SUPABASE_URL||!SUPABASE_SERVICE_KEY)return;
  try{await sbFetch('/rest/v1/cache_obras','POST',{hash:buildHash(type,payload),type,result_json:result,result_url:result.imageUrl??null,provider:result.provider??'unknown',hit_count:0});}catch{}
}
function stableStringify(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(stableStringify).join(',')+']';
  return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stableStringify(value[key])).join(',')+'}';
}
function buildHash(type,payload){return crypto.createHash('sha256').update(stableStringify({type,payload})).digest('hex').slice(0,32);}

/* ── CAMADA 3: Pool rotativo ── */
async function getAvailableKey(provider){
  if(!SUPABASE_URL||!SUPABASE_SERVICE_KEY){
    if(provider==='groq'&&GROQ_API_KEY)return{id:'env-groq',key:GROQ_API_KEY};
    if(provider==='pollinations')return{id:'pollinations-free',key:'free'};
    return null;
  }
  try{
    const resp=await sbFetch('/rest/v1/api_keys?provider=eq.'+provider+'&is_active=eq.true&select=id,api_key,requests_today,daily_limit&order=last_used.asc.nullsfirst&limit=1');
    if(!resp.ok){
      /* DB indisponivel — fallback para env var */
      if(provider==='groq'&&GROQ_API_KEY)return{id:'env-groq',key:GROQ_API_KEY};
      if(provider==='pollinations')return{id:'pollinations-free',key:'free'};
      return null;
    }
    const rows=await resp.json();
    if(!rows.length){
      /* Tabela vazia — fallback para env var */
      if(provider==='groq'&&GROQ_API_KEY)return{id:'env-groq',key:GROQ_API_KEY};
      if(provider==='pollinations')return{id:'pollinations-free',key:'free'};
      return null;
    }
    const row=rows[0];
    if(row.daily_limit&&row.requests_today>=row.daily_limit)return null;
    return{id:row.id,key:row.api_key};
  }catch{
    /* Excecao — fallback para env var */
    if(provider==='groq'&&GROQ_API_KEY)return{id:'env-groq',key:GROQ_API_KEY};
    if(provider==='pollinations')return{id:'pollinations-free',key:'free'};
    return null;
  }
}
async function markKeyUsed(keyId){if(keyId==='env-groq'||keyId==='pollinations-free')return;try{await sbFetch('/rest/v1/rpc/increment_key_usage','POST',{key_id:keyId});}catch{}}
async function markKeyFailed(keyId,reason){if(keyId==='env-groq'||keyId==='pollinations-free')return;try{await sbFetch('/rest/v1/api_keys?id=eq.'+keyId,'PATCH',{last_error:reason,last_error_at:new Date().toISOString()});}catch{}}

/* ── CAMADA 4: Fila n8n ── */
async function sendToQueue(requestId,type,payload,userId,lastError){
  if(!N8N_WEBHOOK_URL)return false;
  try{const resp=await fetch(N8N_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId,type,payload,userId,lastError,queuedAt:new Date().toISOString(),priority:type==='audio'||type==='video'?'high':'normal'}),signal:AbortSignal.timeout(8000)});return resp.ok;}catch{return false;}
}

/* ── Provedores ── */
async function callProvider(provider,type,payload,apiKey){
  if(provider==='groq')return callGroq(type,payload,apiKey);
  if(provider==='huggingface')return callHuggingFace(type,payload,apiKey);
  if(provider==='together')return callTogether(type,payload,apiKey);
  if(provider==='pollinations')return callPollinations(payload);
  if(provider==='fal-ai')return callFalAi(type,payload,apiKey);
  if(provider==='replicate')return callReplicate(type,payload,apiKey);
  if(provider==='mymemory')return callMyMemory(payload);
  throw new Error('Provedor desconhecido: '+provider);
}
async function callGroq(type,payload,apiKey){const resp=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify({model:'llama-3.1-8b-instant',messages:[{role:'user',content:buildPrompt(type,payload)}],temperature:0.82,max_tokens:payload.maxTokens??1800}),signal:AbortSignal.timeout(30000)});if(!resp.ok)throw new Error('Groq HTTP '+resp.status);const data=await resp.json();const text=data.choices?.[0]?.message?.content?.trim();if(!text)throw new Error('Groq vazio');return{result:text,provider:'groq'};}
async function callHuggingFace(type,payload,apiKey){const isImage=type==='image';const model=isImage?'black-forest-labs/FLUX.1-schnell':'mistralai/Mistral-7B-Instruct-v0.3';const resp=await fetch('https://api-inference.huggingface.co/models/'+model,{method:'POST',headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},body:isImage?JSON.stringify({inputs:payload.prompt}):JSON.stringify({inputs:buildPrompt(type,payload)}),signal:AbortSignal.timeout(45000)});if(!resp.ok)throw new Error('HF HTTP '+resp.status);if(isImage){const b64=Buffer.from(await(await resp.blob()).arrayBuffer()).toString('base64');return{imageBase64:'data:image/jpeg;base64,'+b64,provider:'huggingface'};}const data=await resp.json();const text=Array.isArray(data)?data[0]?.generated_text:data?.generated_text;if(!text)throw new Error('HF vazio');return{result:text.trim(),provider:'huggingface'};}
async function callTogether(type,payload,apiKey){const resp=await fetch('https://api.together.xyz/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify({model:'meta-llama/Llama-3-8b-chat-hf',messages:[{role:'user',content:buildPrompt(type,payload)}],temperature:0.8,max_tokens:payload.maxTokens??1800}),signal:AbortSignal.timeout(30000)});if(!resp.ok)throw new Error('Together HTTP '+resp.status);const data=await resp.json();const text=data.choices?.[0]?.message?.content?.trim();if(!text)throw new Error('Together vazio');return{result:text,provider:'together'};}
async function callPollinations(payload){const{prompt,width=768,height=768,style='cinematic, professional'}=payload;const imageUrl='https://image.pollinations.ai/prompt/'+encodeURIComponent(prompt+', '+style)+'?width='+width+'&height='+height+'&nologo=true&model=flux&seed='+Date.now();const check=await fetch(imageUrl,{method:'HEAD',signal:AbortSignal.timeout(8000)});if(!check.ok)throw new Error('Pollinations HEAD '+check.status);return{imageUrl,provider:'pollinations'};}
async function callFalAi(type,payload,apiKey){const endpoint=type==='video'?'https://fal.run/fal-ai/fast-svd/text-to-video':'https://fal.run/fal-ai/flux/schnell';const body=type==='video'?{prompt:payload.prompt,num_frames:14}:{prompt:payload.prompt,image_size:{width:payload.width??768,height:payload.height??768},num_inference_steps:4};const resp=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Key '+apiKey},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});if(!resp.ok)throw new Error('Fal.ai HTTP '+resp.status);const data=await resp.json();const url=data.images?.[0]?.url??data.video?.url;if(!url)throw new Error('Fal.ai sem URL');return type==='video'?{videoUrl:url,provider:'fal-ai'}:{imageUrl:url,provider:'fal-ai'};}
async function callReplicate(type,payload,apiKey){const models={audio:'suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787',image:'black-forest-labs/flux-schnell',video:'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438'};const version=models[type];if(!version)throw new Error('Replicate sem modelo para '+type);const input=type==='audio'?{prompt:payload.prompt??payload.text}:{prompt:payload.prompt,width:payload.width??768,height:payload.height??768};const cr=await fetch('https://api.replicate.com/v1/predictions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Token '+apiKey},body:JSON.stringify({version,input}),signal:AbortSignal.timeout(10000)});if(!cr.ok)throw new Error('Replicate create HTTP '+cr.status);const pred=await cr.json();for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,3000));const poll=await fetch(pred.urls.get,{headers:{'Authorization':'Token '+apiKey},signal:AbortSignal.timeout(8000)});const st=await poll.json();if(st.status==='succeeded'){const out=Array.isArray(st.output)?st.output[0]:st.output;const key=type==='audio'?'audioUrl':type==='video'?'videoUrl':'imageUrl';return{[key]:out,provider:'replicate'};}if(st.status==='failed')throw new Error('Replicate falhou: '+st.error);}throw new Error('Replicate timeout');}
async function callMyMemory(payload){const{lyrics='',text='',targetLang='en'}=payload;const sourceText=String(lyrics||text||'').trim();if(!sourceText)throw new Error('MyMemory sem texto para traduzir');const langMap={ingles:'en',espanhol:'es',frances:'fr',italiano:'it',alemao:'de',japones:'ja',coreano:'ko'};const to=langMap[targetLang]??targetLang.slice(0,2);const resp=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(sourceText.slice(0,500))+'&langpair=pt|'+to,{signal:AbortSignal.timeout(8000)});if(!resp.ok)throw new Error('MyMemory HTTP '+resp.status);const data=await resp.json();const text=data.responseData?.translatedText;if(!text)throw new Error('MyMemory vazio');return{result:text,provider:'mymemory'};}

/* ── Prompts ── */
function buildPrompt(type,p){
  if(type==='lyrics')return 'Voce e compositor profissional brasileiro especializado em '+(p.genero||'MPB')+'.\nCrie uma letra COMPLETA sobre: "'+p.tema+'"\nEmocao: '+(p.emocao||'autentica')+' | Estilo: '+(p.estilo||'contemporaneo')+'\n\nFormato: TITULO | BPM | Tom | [VERSO 1] | [PRE-REFRAO] | [REFRAO] | [VERSO 2] | [PONTE] | [REFRAO FINAL]\n\nRetorne APENAS a letra.';
  if(type==='translation')return 'Adapte a letra para '+(p.targetLang||'ingles')+' de forma '+(p.mode||'cantavel')+'.\n\nLETRA:\n'+p.lyrics+'\n\nRetorne APENAS a letra adaptada.';
  if(type==='storyboard')return 'Storyboard para "'+p.titulo+'" tom: '+p.tom+'. Letra: '+(p.letra||'').slice(0,400)+'\n\nJSON: {conceito_geral, paleta_cores, cenas:[{numero,tempo,descricao,camera,locacao,clima,prompt_imagem}]}';
  if(type==='mentor')return 'Mentor criativo. Intencao: '+(p.intencao||'melhorar')+'\n\nLETRA:\n'+p.letra+'\n\n1. O que esta forte  2. O que evoluir  3. Sugestao concreta. Max 4 paragrafos.';
  return p.prompt??p.text??JSON.stringify(p);
}

/* ── Supabase helper ── */
async function sbFetch(path,method='GET',body=null){const opts={method,headers:{'apikey':SUPABASE_SERVICE_KEY,'Authorization':'Bearer '+SUPABASE_SERVICE_KEY,'Content-Type':'application/json','Prefer':method==='POST'?'return=minimal':''}};if(body)opts.body=JSON.stringify(body);return fetch(SUPABASE_URL+path,opts);}
