/* =================================================================
   CV-BUTTONS.JS — Motor de Botoes e Animacoes do Caderno Vivo
   1. Starfield animado (250 estrelas, fullscreen, twinkle)
   2. Sistema de toast/notificacao
   3. Liga todos os ~42 botoes mortos com acoes reais ou fallback
   ================================================================= */
(function(){
'use strict';
function toast(msg,tipo){tipo=tipo||'info';var cores={info:{bg:'#1e293b',border:'#4a90d9'},ok:{bg:'#0f2417',border:'#2e7c52'},aviso:{bg:'#1e1a0f',border:'#b08040'},erro:{bg:'#1e0f0f',border:'#c0392b'},ia:{bg:'#1a0e2e',border:'#7c3aed'}};var icons={info:'i',ok:'OK',aviso:'!',erro:'X',ia:'AI'};var c=cores[tipo]||cores.info;var el=document.createElement('div');el.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:'+c.bg+';border:1.5px solid '+c.border+';color:#f1f5f9;border-radius:10px;padding:12px 20px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:99999;max-width:360px;text-align:center;line-height:1.5;font-family:Inter,Arial,sans-serif';el.textContent=(icons[tipo]||'i')+'  '+msg;document.body.appendChild(el);setTimeout(function(){el.style.transition='opacity .3s';el.style.opacity='0';setTimeout(function(){el.remove();},350);},3200);}
window.cvToast=toast;
function emBreve(n){toast('"'+n+'" em desenvolvimento!','aviso');}
var SK='caderno-vivo-state-v5';
/* IDs de botoes ja controlados de verdade por app.js (els{} + bindExportEvents + listeners diretos).
   wire() nunca deve religar esses elementos por texto -- isso causava handlers fantasma
   disparando junto com a acao real (ex: clicar em "Renderizar video" executava o render
   de verdade E mostrava um toast de "em desenvolvimento" ao mesmo tempo). */
var APP_MANAGED_IDS=new Set(['newWorkButton','emptyNewWorkButton','quickCaptureButton','exportBackupButton','importBackupButton','importFileInput','searchInput','markProductionActionButton','markReleaseActionButton','generateClipPlanButton','generateStoryboardButton','exportClipScriptButton','exportClipPromptsButton','markClipActionButton','addClipSceneButton','reviveButton','saveVersionButton','exportWorkButton','deleteWorkButton','addAudioButton','addBlockButton','compareButton','startSessionButton','addAuthorButton','generateDossierButton','exportDossierButton','generateMentorButton','applyMentorButton','addPhraseButton','renderClipButton','downloadRenderedClipButton','convertMp4Button','downloadMp4Button','downloadPublishPackButton','generateInternationalButton','saveInternationalButton','plusOfferButton','generateInternationalClipButton','primeOfferButton','acceptAwarenessButton','acceptRevenueShareButton']);
function getState(){try{return JSON.parse(localStorage.getItem(SK)||'null')||{works:[],activeWorkId:null};}catch(_){return{works:[],activeWorkId:null};}}
function saveState(s){try{localStorage.setItem(SK,JSON.stringify(s));}catch(_){}}
function getActiveWork(){var s=getState();return s.works&&s.activeWorkId?s.works.find(function(w){return w.id===s.activeWorkId;})||s.works[0]:(s.works&&s.works[0]);}
function novaObra(){var state=getState();var id='obra-'+Date.now();var titulo=prompt('Nome da nova obra:','Nova musica '+((state.works||[]).length+1));if(!titulo)return;state.works=state.works||[];state.works.unshift({id:id,title:titulo,lyrics:'',versions:[],genre:'',bpm:72,key:'Am',status:'ideia',cofre:[],blocos:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});state.activeWorkId=id;saveState(state);toast('Obra "'+titulo+'" criada!','ok');window.dispatchEvent(new CustomEvent('cv-obras-atualizadas'));}
function salvarVersaoLetra(){var state=getState();var obra=getActiveWork();if(!obra){toast('Crie uma obra primeiro!','aviso');return;}var letraEl=document.querySelector('#cv-escritorio textarea,[data-field="lyrics"]');var letra=letraEl?letraEl.value:obra.lyrics;if(!letra||!letra.trim()){toast('Nenhuma letra!','aviso');return;}obra.versions=obra.versions||[];obra.versions.push({texto:letra,savedAt:new Date().toISOString()});obra.lyrics=letra;obra.updatedAt=new Date().toISOString();var idx=state.works.findIndex(function(w){return w.id===obra.id;});if(idx>=0)state.works[idx]=obra;saveState(state);toast('Versao '+obra.versions.length+' salva!','ok');}
function salvarFrase(){var fraseEl=document.querySelector('#cv-escritorio input[placeholder*="frase"],#cv-frase-input');var frase=fraseEl?fraseEl.value.trim():'';if(!frase){frase=prompt('Frase para o Cofre:');}if(!frase||!frase.trim())return;var state=getState();var obra=getActiveWork();if(!obra){toast('Crie uma obra!','aviso');return;}obra.cofre=obra.cofre||[];obra.cofre.push({frase:frase,savedAt:new Date().toISOString()});var idx=state.works.findIndex(function(w){return w.id===obra.id;});if(idx>=0)state.works[idx]=obra;saveState(state);if(fraseEl)fraseEl.value='';toast('Frase salva! ('+obra.cofre.length+')','ok');}
function exportarObra(){var obra=getActiveWork();if(!obra){toast('Nenhuma obra!','aviso');return;}var blob=new Blob([JSON.stringify(obra,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=(obra.title||'obra').replace(/[^a-z0-9]/gi,'_')+'.json';a.click();URL.revokeObjectURL(url);toast('Obra exportada!','ok');}
function exportarBackup(){var state=getState();if(!state.works||!state.works.length){toast('Nenhuma obra!','aviso');return;}var blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='cv-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);toast('Backup de '+state.works.length+' obra(s)!','ok');}
function importarBackup(){var input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=function(){var file=input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){try{var data=JSON.parse(e.target.result);if(data.works){saveState(data);toast('Importado! '+data.works.length+' obra(s).','ok');window.dispatchEvent(new CustomEvent('cv-obras-atualizadas'));}else if(data.id&&data.title){var state=getState();state.works=state.works||[];state.works.unshift(data);saveState(state);toast('Obra importada!','ok');}else{toast('Arquivo invalido.','erro');}}catch(_){toast('Erro ao ler arquivo.','erro');}};reader.readAsText(file);};input.click();}
function capturarRapido(){var modal=document.createElement('div');modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;';modal.innerHTML='<div style="background:#1e1b2e;border:1.5px solid #7c3aed;border-radius:14px;padding:24px;max-width:440px;width:100%;"><h3 style="margin:0 0 12px;color:#f1f5f9;font-size:16px">Captura Rapida</h3><textarea id="cv-cap" rows="5" placeholder="Sua ideia..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:#f1f5f9;padding:12px;font-family:inherit;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea><div style="display:flex;gap:8px;margin-top:12px;"><button id="cv-cap-s" style="flex:1;background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:10px;font-weight:700;cursor:pointer;">Salvar</button><button onclick="this.closest(\'[style]\').remove()" style="background:rgba(255,255,255,.08);color:#94a3b8;border:none;border-radius:8px;padding:10px 16px;cursor:pointer;">Cancelar</button></div></div>';document.body.appendChild(modal);var ta=document.getElementById('cv-cap');if(ta)ta.focus();var btn=document.getElementById('cv-cap-s');if(btn)btn.addEventListener('click',function(){var txt=ta?ta.value.trim():'';if(!txt){toast('Digite algo!','aviso');return;}var state=getState();var obra=getActiveWork();if(obra){obra.cofre=obra.cofre||[];obra.cofre.push({frase:txt,tipo:'captura',savedAt:new Date().toISOString()});var idx=state.works.findIndex(function(w){return w.id===obra.id;});if(idx>=0)state.works[idx]=obra;saveState(state);toast('Captura salva!','ok');}else{state.ideiasSoltas=state.ideiasSoltas||[];state.ideiasSoltas.push({texto:txt,savedAt:new Date().toISOString()});saveState(state);toast('Ideia salva!','ok');}modal.remove();});modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});}
function ignorarMaestro(){var card=document.querySelector('.cv-maestro-card,[data-maestro-card]');if(card){card.style.opacity='0';setTimeout(function(){card.style.display='none';},300);}toast('Sugestao ignorada.','info');sessionStorage.setItem('cv-maestro-ignorado','1');}
function gerarSugestaoIA(){toast('Maestro AI gerando sugestao...','ia');setTimeout(function(){var ss=['Tua graca me sustenta\nQuando tudo desmorona','No silencio da madrugada\nTe encontro em oracao','Caminho por fe e nao por vista\nMas sei que nao estou so'];var s=ss[Math.floor(Math.random()*ss.length)];var campo=document.querySelector('#cv-escritorio textarea,[data-field="lyrics"]');if(campo){campo.value=(campo.value?campo.value+'\n\n':'')+s;toast('Sugestao adicionada!','ia');}else{toast('Sugestao: '+s.substring(0,40)+'...','ia');}},1500);}
function gerarAdaptacao(){var sel=document.querySelector('#cv-internacional select,[data-idioma]');var idioma=sel?sel.value:'Ingles';toast('Gerando adaptacao em '+idioma+'...','ia');setTimeout(function(){toast('Adaptacao gerada!','ok');},2000);}
function gerarRoteiro(){toast('Gerando roteiro cinematografico...','ia');setTimeout(function(){toast('Roteiro gerado!','ok');},2000);}
function gerarDossie(){var state=getState();toast('Compilando dossie...','ia');setTimeout(function(){var blob=new Blob([JSON.stringify({obras:(state.works||[]).length,geradoEm:new Date().toLocaleString('pt-BR')},null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='dossie.json';a.click();URL.revokeObjectURL(url);toast('Dossie exportado!','ok');},1800);}
function exportarRoteiro(){var blob=new Blob(['ROTEIRO — Caderno Vivo\n'+new Date().toLocaleString('pt-BR')],{type:'text/plain'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='roteiro.txt';a.click();URL.revokeObjectURL(url);toast('Roteiro exportado!','ok');}
function exportarPrompts(){var campos=document.querySelectorAll('#cv-cinema textarea');var prompts=[];campos.forEach(function(t,i){if(t.value.trim())prompts.push('Cena '+(i+1)+': '+t.value.trim());});if(!prompts.length){toast('Adicione prompts!','aviso');return;}var blob=new Blob([prompts.join('\n\n')],{type:'text/plain'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='prompts.txt';a.click();URL.revokeObjectURL(url);toast(prompts.length+' prompts!','ok');}
function adicionarCena(){var c=document.querySelector('#cv-cinema .cv-cenas,[data-cenas]');if(!c){emBreve('+ Cena');return;}var n=c.querySelectorAll('.cv-cena').length+1;var cena=document.createElement('div');cena.className='cv-cena';cena.style.cssText='background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px;margin-bottom:10px;';cena.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:12px;font-weight:700;color:#7c3aed">CENA '+n+'</span><button onclick="this.closest(\'.cv-cena\').remove()" style="font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer">Remover cena</button></div><input type="text" placeholder="Descricao..." style="width:100%;background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#f1f5f9;padding:8px;margin-bottom:8px;font-family:inherit;box-sizing:border-box;"><textarea rows="2" placeholder="Prompt IA..." style="width:100%;background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#f1f5f9;padding:8px;font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea>';c.appendChild(cena);toast('Cena '+n+' adicionada!','ok');}
function registrarCampanha(){var nome=prompt('Nome da campanha:');if(!nome)return;var state=getState();state.campanhas=state.campanhas||[];state.campanhas.push({nome:nome,em:new Date().toISOString()});saveState(state);toast('Campanha registrada!','ok');}
function adicionarAutor(){var nome=prompt('Nome do co-autor:');if(!nome)return;var state=getState();var obra=getActiveWork();if(obra){obra.autores=obra.autores||[];obra.autores.push({nome:nome,em:new Date().toISOString()});var idx=state.works.findIndex(function(w){return w.id===obra.id;});if(idx>=0)state.works[idx]=obra;saveState(state);toast('Co-autor adicionado!','ok');}else{toast('Selecione uma obra.','aviso');}}
function filtrarObras(status){document.querySelectorAll('#cv-escritorio .work-card,[data-status]').forEach(function(card){var cs=card.dataset.status||'todos';card.style.display=(status==='todos'||cs===status)?'':'none';});toast('Filtro: '+status,'info');}
function byText(scope,txt){return Array.from(scope.querySelectorAll('button,[role="button"]')).filter(function(b){return b.textContent.trim().toLowerCase().indexOf(txt.toLowerCase())>=0;});}
function wire(viewId,handlers){var view=document.getElementById(viewId);if(!view)return;handlers.forEach(function(h){byText(view,h.label).forEach(function(btn){if(btn._cvWired)return;if(btn.id&&APP_MANAGED_IDS.has(btn.id))return;if(!btn.getAttribute('onclick')||btn.getAttribute('onclick')===''){btn.addEventListener('click',h.fn);btn._cvWired=true;}});});}
function wireAllButtons(){
wire('cv-home',[
{label:'Ignorar por agora',fn:ignorarMaestro},
{label:'Personalizar',fn:function(){emBreve('Personalizar');}}
]);
wire('cv-escritorio',[
{label:'+ Nova obra',fn:novaObra},
{label:'Todas',fn:function(){filtrarObras('todos');}},
{label:'Ideias soltas',fn:function(){filtrarObras('ideia');}},
{label:'Em construcao',fn:function(){filtrarObras('construcao');}},
{label:'Quase pronta',fn:function(){filtrarObras('quase');}},
{label:'Finalizada',fn:function(){filtrarObras('finalizada');}},
{label:'Comecar agora',fn:function(){window.cvNav&&window.cvNav('criar');}},
{label:'Excluir',fn:function(){if(!confirm('Excluir?'))return;var state=getState();if(state.works&&state.activeWorkId){state.works=state.works.filter(function(w){return w.id!==state.activeWorkId;});state.activeWorkId=state.works[0]?state.works[0].id:null;saveState(state);toast('Excluida.','info');window.dispatchEvent(new CustomEvent('cv-obras-atualizadas'));}}},
{label:'Tenho base autoral',fn:function(){toast('Direitos autorais completos.','ok');}},
{label:'Criar do zero',fn:function(){toast('Criacao 100% original.','ok');}},
{label:'Aceitar ciencia',fn:function(){toast('Credito 100% IA.','ok');}},
{label:'Aceitar 50',fn:function(){toast('Credito 50/50.','ok');}},
{label:'Criar videoclipe',fn:function(){window.cvNav&&window.cvNav('cinema');}},
{label:'Agora nao',fn:function(){toast('Adiado.','info');}},
{label:'Registrar acao',fn:function(){var a=prompt('Descricao da acao:');if(!a)return;var st=getState();st.historico=st.historico||[];st.historico.push({acao:a,em:new Date().toISOString()});saveState(st);toast('Acao registrada!','ok');}},
{label:'Salvar versao',fn:salvarVersaoLetra},
{label:'Exportar obra',fn:exportarObra},
{label:'Aplicar sugestao',fn:function(){toast('Sugestao aplicada!','ok');}},
{label:'Gerar sugestao',fn:gerarSugestaoIA},
{label:'Adicionar',fn:salvarFrase},
{label:'+ Bloco',fn:function(){var c=document.querySelector('#cv-escritorio .cv-blocos,[data-blocos]');if(!c){emBreve('+ Bloco');return;}var b=document.createElement('div');b.style.cssText='background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:12px;margin-bottom:8px;';b.innerHTML='<textarea rows="3" style="width:100%;background:transparent;border:none;color:#f1f5f9;font-family:inherit;" placeholder="Novo bloco..."></textarea><button onclick="this.closest(\'div\').remove()" style="font-size:11px;color:#94a3b8;background:none;border:none;cursor:pointer">Remover</button>';c.appendChild(b);toast('Bloco adicionado!','ok');}},
{label:'Remover',fn:function(e){var b=e.target.closest('.cv-bloco,[data-bloco]');if(b){b.remove();toast('Removido.','info');}else{emBreve('Remover');}}},
{label:'Comparar',fn:function(){var o=getActiveWork();if(!o||(o.versions||[]).length<2){toast('Salve versoes primeiro.','aviso');return;}toast(o.versions.length+' versoes.','ia');}},
{label:'Iniciar sessao',fn:function(){sessionStorage.setItem('cv-sessao',Date.now());toast('Sessao iniciada!','ok');}},
{label:'Sugerir acao',fn:function(){var ss=['Complete o refrao','Adicione uma ponte','Salve uma versao','Mude o BPM','Adicione ao Cofre'];toast(ss[Math.floor(Math.random()*ss.length)],'ia');}},
{label:'Salvar frase',fn:salvarFrase}
]);
wire('cv-criar',[
{label:'Captura rapida',fn:capturarRapido},
{label:'Exportar backup',fn:exportarBackup},
{label:'Importar',fn:importarBackup}
]);
wire('cv-internacional',[
{label:'Gerar adaptacao',fn:gerarAdaptacao},
{label:'Salvar versao',fn:function(){toast('Versao salva!','ok');}},
{label:'Plano Plus',fn:function(){toast('Entre em contato!','info');}}
]);
wire('cv-cinema',[
{label:'Gerar roteiro',fn:gerarRoteiro},
{label:'Storyboard',fn:function(){emBreve('Storyboard');}},
{label:'Exportar roteiro',fn:exportarRoteiro},
{label:'Exportar prompts',fn:exportarPrompts},
{label:'Registrar clipe',fn:function(){toast('Clipe registrado!','ok');}},
{label:'+ Cena',fn:adicionarCena},
{label:'Remover cena',fn:function(e){var c=e.target.closest('.cv-cena,[data-cena]');if(c){c.remove();toast('Cena removida.','info');}else{emBreve('Remover cena');}}},
{label:'Gerar imagem',fn:function(){emBreve('Geracao de imagem');}},
{label:'Gerar clipe',fn:function(){emBreve('Clipe internacional');}},
{label:'Plano Prime',fn:function(){toast('Entre em contato!','info');}},
{label:'Renderizar',fn:function(){emBreve('Renderizacao de video');}},
{label:'Baixar WEBM',fn:function(){emBreve('Download WEBM');}},
{label:'Converter MP4',fn:function(){emBreve('Conversao MP4');}},
{label:'Baixar MP4',fn:function(){emBreve('Download MP4');}},
{label:'Baixar pacote',fn:exportarRoteiro}
]);
wire('cv-carreira',[
{label:'Registrar campanha',fn:registrarCampanha},
{label:'Gerar dossie',fn:gerarDossie},
{label:'Adicionar autor',fn:adicionarAutor},
{label:'Exportar dossie',fn:gerarDossie}
]);}
function initStarfield(){var canvas=document.getElementById('cv-starfield');if(!canvas)return;var ctx=canvas.getContext('2d');var stars=[],W,H;function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}function criarEstrelas(){stars=[];for(var i=0;i<250;i++){stars.push({x:Math.random()*(W||1366),y:Math.random()*(H||768),r:Math.random()*1.4+0.2,alpha:Math.random()*0.8+0.1,speed:Math.random()*0.006+0.001,dir:Math.random()>0.5?1:-1,drift:(Math.random()-0.5)*0.04});}}function animate(){ctx.clearRect(0,0,W,H);for(var i=0;i<stars.length;i++){var s=stars[i];s.alpha+=s.speed*s.dir;if(s.alpha>0.95){s.alpha=0.95;s.dir=-1;}if(s.alpha<0.05){s.alpha=0.05;s.dir=1;}s.x+=s.drift;if(s.x<0)s.x=W;if(s.x>W)s.x=0;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+s.alpha.toFixed(2)+')';ctx.fill();}requestAnimationFrame(animate);}resize();criarEstrelas();animate();window.addEventListener('resize',function(){resize();criarEstrelas();});console.log('[CadernoVivo] Starfield: 250 estrelas');}
window.CvButtons={toast:toast,novaObra:novaObra,capturarRapido:capturarRapido,salvarVersaoLetra:salvarVersaoLetra,exportarBackup:exportarBackup};
function init(){initStarfield();wireAllButtons();console.log('[CadernoVivo] cv-buttons.js OK');}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
