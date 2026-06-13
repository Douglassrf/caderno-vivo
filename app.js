const STORAGE_KEY="caderno-vivo-state-v5";
const LEGACY_KEYS=["caderno-vivo-state-v4","caderno-vivo-state-v3","caderno-vivo-state-v2","caderno-vivo-state-v1"];
const PROTECTION_ITEMS=["Dossie Criativo gerado","Autores e percentuais revisados","Letra e cifra conferidas","Referencias declaradas","Backup exportado"];
const COLLECTION_ITEMS=["Associacao escolhida","Obra pronta para cadastro","Fonograma/ISRC identificado quando houver","Percentuais de autores conferidos","Comprovantes guardados"];
const SECURITY_ITEMS=["Permissao premium validada no backend","Dossie servido pelo servidor","Pagamento confirmado por webhook","Dados sensiveis criptografados","Backup seguro exportado","Links externos revisados","Termos aceitos registrados","Log de auditoria ativo"];
const PRODUCTION_ITEMS=["Letra final revisada","Voz guia planejada","Referencia de arranjo definida","Produtor ou estudio definido","Checklist de lancamento iniciado"];
const RELEASE_ITEMS=["Capa definida","Arquivo master finalizado","ISRC/UPC conferido","Distribuicao enviada","Conteudo de divulgacao preparado","Link principal divulgado","Acompanhamento pos-lancamento iniciado"];
const CLIP_ITEMS=["Conceito visual aprovado","Roteiro por cenas iniciado","Prompts revisados","Storyboard visual criado","Direitos de imagem conferidos","Takes gerados ou planejados","Links de takes catalogados","Montagem/exportacao planejada","Corte final localizado","Video renderizado para plataforma"];
const EXPORT_PRESETS={tiktok:{label:"TikTok / Reels / Shorts",ratio:"9:16",width:720,height:1280,platform:"TikTok, Reels e Shorts",hint:"Vertical para celulares. Baixe e publique como video curto."},youtube:{label:"YouTube clipe oficial",ratio:"16:9",width:1280,height:720,platform:"YouTube",hint:"Horizontal para clipe oficial, premiere ou canal do artista."},"instagram-feed":{label:"Instagram Feed",ratio:"4:5",width:864,height:1080,platform:"Instagram Feed",hint:"Vertical moderado para feed e impulsionamento."},"instagram-stories":{label:"Instagram Stories",ratio:"9:16",width:720,height:1280,platform:"Stories/Reels",hint:"Tela cheia vertical para Stories e Reels."},"spotify-canvas":{label:"Spotify Canvas",ratio:"9:16",width:720,height:1280,platform:"Spotify Canvas",hint:"Loop visual curto para Canvas. Use cenas de 2 a 3 segundos."},master:{label:"Arquivo mestre",ratio:"16:9",width:1280,height:720,platform:"Arquivo mestre",hint:"Versao principal de backup para converter depois em outros formatos."}};
const ADAPTATION_MODES={singable:"Cantavel",faithful:"Fiel ao sentido",rhyme:"Com rima",emotional:"Emocional",commercial:"Comercial/hit"};
const LEGAL_NOTICE="O Caderno Vivo nao e cartorio, orgao oficial, associacao de direitos autorais, editora ou escritorio juridico. A plataforma organiza, prepara, orienta e intermedia materiais para profissionalizacao, sem realizar registro oficial nem garantir protecao juridica automatica.";
const REVENUE_SHARE_NOTICE="Criadores assistidos que usam o Caderno Vivo para criar substancialmente a obra do zero deverao aceitar participacao economica 50% usuario e 50% empresa/equipe criativa antes de profissionalizar, distribuir ou monetizar.";
const SECURITY_NOTICE="A versao atual ainda roda localmente. Para produto comercial, pagamentos, permissoes premium, dossie completo e arquivos finais precisam ser validados no backend antes de serem entregues ao usuario.";
const PREMIUM_SECURITY_NOTICE="Destravamento premium seguro exige entitlement criado pelo backend apos pagamento confirmado por webhook. Clique em oferta registra interesse, mas nao libera recurso final no navegador.";
const OFFER_CATALOG={professional:{title:"Leve sua composicao para o nivel profissional.",text:"Uma boa letra merece estrutura, cifra, arranjo e organizacao. Desbloqueie o Pacote Profissional da Obra com dossie completo, PDF, escopo musical e checklist de preparacao.",button:"Profissionalizar por R$ 19,90",product:"Pacote Profissional"},dossier:{title:"A profissionalizacao da sua obra comeca na organizacao.",text:"Compor e arte. Profissionalizar exige tecnica. Gere o Dossie Criativo completo com autores, percentuais, historico e checklist de preparacao para registro e monetizacao.",button:"Gerar Dossie e Checklist",product:"Dossie Completo"},global:{title:"Sua musica pode falar com o mundo.",text:"Adapte sua musica para outro mercado preservando emocao, metrica, rima e intencao artistica.",button:"Adaptar a partir de R$ 19,90",product:"Adaptacao Internacional"},clip:{title:"Sua musica merece ser vista.",text:"Transforme sua musica em um videoclipe com roteiro, prompts, identidade visual e pacote pronto para publicacao.",button:"Criar videoclipe profissional",product:"Pacote Videoclipe"},essential:{title:"Seu patrimonio artistico esta seguro?",text:"Suas musicas sao ativos criativos. Ative o Plano Essencial para liberar mais espaco, historico e backup avancado.",button:"Assinar Essencial - R$ 19,90",product:"Plano Essencial"},club:{title:"Voce ja cria como profissional. Agora tenha beneficios de profissional.",text:"Entre no Clube Caderno Vivo para receber descontos, creditos, prioridade e acesso antecipado aos recursos premium.",button:"Entrar no Clube - R$ 29,90",product:"Clube Caderno Vivo"},limit:{title:"Maestro, seu Caderno Vivo atingiu o nivel maximo de produtividade.",text:"Voce acaba de criar sua 10a obra. O caderno gratuito chegou ao limite. Nao pare agora, quando sua proxima grande musica pode estar prestes a nascer.",button:"Liberar espaco ilimitado",product:"Plano Essencial"}};
const LANGUAGE_PHRASES={
  ingles:["I carry your light inside my song","Tonight my heart learns how to fly","Even in silence I keep moving on","Your memory turns the dark into dawn","I sing it louder so the world can feel"],
  espanhol:["Guardo tu luz dentro de mi cancion","Esta noche mi alma vuelve a volar","Aunque el silencio quiera regresar","Tu recuerdo enciende todo mi lugar","Canto mas fuerte para el mundo escuchar"],
  frances:["Je garde ta lumiere dans ma chanson","Ce soir mon coeur apprend a s'envoler","Meme le silence me laisse avancer","Ton souvenir rallume mon matin","Je chante plus fort pour toucher le monde"],
  italiano:["Porto la tua luce nella mia canzone","Stanotte il cuore impara a volare","Anche il silenzio mi lascia camminare","Il tuo ricordo accende il mio domani","Canto piu forte per farmi sentire"],
  alemao:["Ich trag dein Licht in meinem Lied","Heute lernt mein Herz zu fliegen","Auch die Stille kann mich nicht besiegen","Deine Spur macht jede Nacht zum Morgen","Ich singe laut, damit die Welt es spurt"],
  "portugues do Brasil":["Eu guardo tua luz dentro da cancao","Hoje meu peito aprende a voar","Mesmo em silencio eu sigo sem parar","Tua lembranca acende o meu lugar","Eu canto alto para o mundo sentir"],
  japones:["Kimi no hikari wo uta ni nosete","Kokoro wa ima sora e noboru","Shizukesa no naka demo aruite iku","Omoide ga asa wo terasu","Sekai ni todoku made utau"],
  coreano:["Neoui bicheul norae soge dama","Oneul bam nae maeumi naraga","Chimmuk sogeseodo georeoga","Gieogi saebyeogeul balkhyeo","Sesangi neukkil ttaekkaji noraehae"],
  arabe:["Ahmil nurak fi ughniyati","Qalbi yataallam an yatir","Hatta fi assamt amdi","Dhikrak yudi layli","Ughanni aala li yasmaa alalam"],
  hindi:["Teri roshni ko geet mein rakhu","Aaj mera dil udna seekhe","Khamoshi mein bhi main chalta rahu","Teri yaad subah ko jagaye","Duniya mehsoos kare tab tak gaun"],
  mandarim:["Wo ba ni de guang fang jin ge li","Jin ye wo de xin xue hui fei","Chenmo zhong ye jixu qianxing","Ni de huiyi dianliang qingchen","Chang dao shijie dou neng ganjue"],
  russo:["Ya nesu tvoy svet v svoey pesne","Segodnya serdtse uchitsya letat","Dazhe v tishine ya idu vpered","Tvoya pamyat zazhigaet rassvet","Poyu gromche chtoby mir uslyshal"],
  outro:["Your light becomes the voice I sing","My heart keeps rising with the sound","I turn the night into a stage","This melody can cross the world","Let every country feel this song"]
};
let renderedClipBlob=null,renderedClipUrl="",mp4ClipBlob=null,mp4ClipUrl="",ffmpegInstance=null;
const $=s=>document.querySelector(s);
const els={newWorkButton:$("#newWorkButton"),emptyNewWorkButton:$("#emptyNewWorkButton"),quickCaptureButton:$("#quickCaptureButton"),exportBackupButton:$("#exportBackupButton"),importBackupButton:$("#importBackupButton"),importFileInput:$("#importFileInput"),searchInput:$("#searchInput"),navItems:document.querySelectorAll(".nav-item"),activeFilterLabel:$("#activeFilterLabel"),worksList:$("#worksList"),emptyState:$("#emptyState"),workForm:$("#workForm"),totalWorks:$("#totalWorks"),totalPhrases:$("#totalPhrases"),totalVersions:$("#totalVersions"),totalAudios:$("#totalAudios"),totalDossiers:$("#totalDossiers"),totalMentor:$("#totalMentor"),totalProductionReady:$("#totalProductionReady"),totalLaunchReady:$("#totalLaunchReady"),totalClipPlans:$("#totalClipPlans"),titleInput:$("#titleInput"),statusInput:$("#statusInput"),keyInput:$("#keyInput"),bpmInput:$("#bpmInput"),genreInput:$("#genreInput"),moodInput:$("#moodInput"),tagsInput:$("#tagsInput"),lyricsInput:$("#lyricsInput"),chordsInput:$("#chordsInput"),referencesInput:$("#referencesInput"),readinessPercent:$("#readinessPercent"),readinessBar:$("#readinessBar"),readinessList:$("#readinessList"),securityLevel:$("#securityLevel"),securitySummary:$("#securitySummary"),securityChecklist:$("#securityChecklist"),securityWarningBox:$("#securityWarningBox"),productionStageInput:$("#productionStageInput"),priorityInput:$("#priorityInput"),targetDateInput:$("#targetDateInput"),nextActionInput:$("#nextActionInput"),markProductionActionButton:$("#markProductionActionButton"),productionChecklist:$("#productionChecklist"),releaseStatusInput:$("#releaseStatusInput"),releaseDateInput:$("#releaseDateInput"),distributorInput:$("#distributorInput"),releaseCodeInput:$("#releaseCodeInput"),mainLinkInput:$("#mainLinkInput"),campaignActionInput:$("#campaignActionInput"),markReleaseActionButton:$("#markReleaseActionButton"),releaseChecklist:$("#releaseChecklist"),clipConceptInput:$("#clipConceptInput"),clipFormatInput:$("#clipFormatInput"),clipStyleInput:$("#clipStyleInput"),clipPaletteInput:$("#clipPaletteInput"),clipReferenceInput:$("#clipReferenceInput"),clipPersonaInput:$("#clipPersonaInput"),clipLocationInput:$("#clipLocationInput"),clipMoodInput:$("#clipMoodInput"),clipProviderInput:$("#clipProviderInput"),clipNextActionInput:$("#clipNextActionInput"),clipCoverPromptInput:$("#clipCoverPromptInput"),clipFinalVideoInput:$("#clipFinalVideoInput"),clipMontageNotesInput:$("#clipMontageNotesInput"),generateClipPlanButton:$("#generateClipPlanButton"),generateStoryboardButton:$("#generateStoryboardButton"),exportClipScriptButton:$("#exportClipScriptButton"),exportClipPromptsButton:$("#exportClipPromptsButton"),markClipActionButton:$("#markClipActionButton"),addClipSceneButton:$("#addClipSceneButton"),clipChecklist:$("#clipChecklist"),clipScenesList:$("#clipScenesList"),reviveText:$("#reviveText"),reviveButton:$("#reviveButton"),saveVersionButton:$("#saveVersionButton"),exportWorkButton:$("#exportWorkButton"),deleteWorkButton:$("#deleteWorkButton"),audioTypeInput:$("#audioTypeInput"),audioNameInput:$("#audioNameInput"),audioLinkInput:$("#audioLinkInput"),audioFileInput:$("#audioFileInput"),addAudioButton:$("#addAudioButton"),audioList:$("#audioList"),addBlockButton:$("#addBlockButton"),blocksList:$("#blocksList"),versionsList:$("#versionsList"),compareAInput:$("#compareAInput"),compareBInput:$("#compareBInput"),compareButton:$("#compareButton"),compareResult:$("#compareResult"),startSessionButton:$("#startSessionButton"),sessionList:$("#sessionList"),timelineList:$("#timelineList"),authorNameInput:$("#authorNameInput"),authorRoleInput:$("#authorRoleInput"),authorShareInput:$("#authorShareInput"),addAuthorButton:$("#addAuthorButton"),authorsList:$("#authorsList"),protectionChecklist:$("#protectionChecklist"),collectionChecklist:$("#collectionChecklist"),generateDossierButton:$("#generateDossierButton"),exportDossierButton:$("#exportDossierButton"),dossierStatus:$("#dossierStatus"),dossierHash:$("#dossierHash"),dossierPreview:$("#dossierPreview"),mentorModeInput:$("#mentorModeInput"),mentorSectionInput:$("#mentorSectionInput"),mentorIntentInput:$("#mentorIntentInput"),generateMentorButton:$("#generateMentorButton"),applyMentorButton:$("#applyMentorButton"),mentorOutput:$("#mentorOutput"),mentorHistoryList:$("#mentorHistoryList"),phraseInput:$("#phraseInput"),addPhraseButton:$("#addPhraseButton"),phraseList:$("#phraseList")};
const state=loadState();let activeWorkId=state.works[0]?.id||null;let activeStatus="todas";let pendingMentorText="";
function createId(){const c=globalThis.crypto;if(c?.randomUUID)return c.randomUUID();return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}
function blocks(){return[{id:createId(),name:"Intro",notes:""},{id:createId(),name:"Verso",notes:""},{id:createId(),name:"Refrao",notes:""}]}
function loadState(){const saved=localStorage.getItem(STORAGE_KEY)||LEGACY_KEYS.map(k=>localStorage.getItem(k)).find(Boolean);if(!saved)return{works:[],phrases:[]};try{const parsed=JSON.parse(saved);const data=parsed.data||parsed;const next={works:Array.isArray(data.works)?data.works.map(normalizeWork):[],phrases:Array.isArray(data.phrases)?data.phrases:[]};localStorage.setItem(STORAGE_KEY,JSON.stringify(next));return next}catch{return{works:[],phrases:[]}}}
function normalizeWork(work={}){const now=new Date().toISOString();return{id:work.id||createId(),title:work.title||"Sem titulo",status:work.status||"ideia solta",key:work.key||"",bpm:work.bpm||"",genre:work.genre||"",mood:work.mood||"",tags:work.tags||"",lyrics:work.lyrics||"",chords:work.chords||"",references:work.references||"",blocks:Array.isArray(work.blocks)&&work.blocks.length?work.blocks:blocks(),versions:Array.isArray(work.versions)?work.versions:[],audios:Array.isArray(work.audios)?work.audios:[],sessions:Array.isArray(work.sessions)?work.sessions:[],mentor:Array.isArray(work.mentor)?work.mentor:[],production:normalizeProduction(work.production),release:normalizeRelease(work.release),clip:normalizeClip(work.clip),international:normalizeInternational(work.international),commercial:normalizeCommercial(work.commercial),security:normalizeSecurity(work.security),protection:normalizeProtection(work.protection),timeline:Array.isArray(work.timeline)&&work.timeline.length?work.timeline:[{id:createId(),label:"Obra criada",at:work.createdAt||now}],createdAt:work.createdAt||now,updatedAt:work.updatedAt||now}}
function normalizeCommercial(c={}){c=c||{};return{path:c.path||"unknown",materials:c.materials||{},profile:c.profile||"indefinido",score:Number(c.score||0),rights:c.rights||"",awarenessAcceptedAt:c.awarenessAcceptedAt||"",revenueShareAcceptedAt:c.revenueShareAcceptedAt||"",lastOfferKey:c.lastOfferKey||"",lastOfferAt:c.lastOfferAt||"",dismissedOffers:Array.isArray(c.dismissedOffers)?c.dismissedOffers:[],entitlements:Array.isArray(c.entitlements)?c.entitlements:[],events:Array.isArray(c.events)?c.events:[]}}
function normalizeSecurity(s={}){s=s||{};return{checklist:s.checklist||{},lastAuditAt:s.lastAuditAt||"",notes:s.notes||""}}
function normalizeInternational(i={}){i=i||{};return{sourceLanguage:i.sourceLanguage||"portugues do Brasil",targetLanguage:i.targetLanguage||"ingles",targetMarket:i.targetMarket||"",mode:i.mode||"singable",draft:i.draft||null,versions:Array.isArray(i.versions)?i.versions:[],selectedVersionId:i.selectedVersionId||"",reviewText:i.reviewText||"",reviewAcceptedAt:i.reviewAcceptedAt||"",plusInterest:Boolean(i.plusInterest),primeInterest:Boolean(i.primeInterest),clip:i.clip||null}}
function normalizeProtection(p={}){p=p||{};return{authors:Array.isArray(p.authors)?p.authors:[],checklist:p.checklist||{},collection:p.collection||{},dossier:p.dossier||null}}
function normalizeProduction(p={}){p=p||{};return{stage:p.stage||"ideia",priority:p.priority||"normal",targetDate:p.targetDate||"",nextAction:p.nextAction||"",checklist:p.checklist||{}}}
function normalizeRelease(r={}){r=r||{};return{status:r.status||"nao planejado",date:r.date||"",distributor:r.distributor||"",code:r.code||"",mainLink:r.mainLink||"",campaignAction:r.campaignAction||"",checklist:r.checklist||{}}}
function normalizeClip(c={}){c=c||{};return{concept:c.concept||"",format:c.format||"clipe completo 16:9",style:c.style||"cinematografico realista",palette:c.palette||"",reference:c.reference||"",persona:c.persona||"",location:c.location||"",mood:c.mood||"",provider:c.provider||"planejamento local",nextAction:c.nextAction||"",coverPrompt:c.coverPrompt||"",finalVideo:c.finalVideo||"",montageNotes:c.montageNotes||"",exportPreset:c.exportPreset||"tiktok",exportQuality:c.exportQuality||"padrao",exportSceneSeconds:c.exportSceneSeconds||4,exportFileName:c.exportFileName||"",exportCaption:c.exportCaption||"",renderedAt:c.renderedAt||"",renderedFormat:c.renderedFormat||"",mp4RenderedAt:c.mp4RenderedAt||"",mp4File:c.mp4File||"",checklist:c.checklist||{},scenes:Array.isArray(c.scenes)?c.scenes.map(normalizeClipScene):[]}}
function normalizeClipScene(s={}){return{id:s.id||createId(),part:s.part||"Cena",duration:s.duration||"6s",shot:s.shot||"plano medio cinematografico",status:s.status||"planejada",prompt:s.prompt||"",imagePrompt:s.imagePrompt||"",storyboard:s.storyboard||"",takeUrl:s.takeUrl||"",assetNotes:s.assetNotes||""}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function bindEvents(){els.workForm.addEventListener("submit",e=>e.preventDefault());els.newWorkButton.addEventListener("click",createWork);els.emptyNewWorkButton.addEventListener("click",createWork);els.quickCaptureButton.addEventListener("click",quickCapture);els.exportBackupButton.addEventListener("click",exportBackup);els.importBackupButton.addEventListener("click",()=>els.importFileInput.click());els.importFileInput.addEventListener("change",importBackup);els.searchInput.addEventListener("input",renderWorks);els.reviveButton.addEventListener("click",applyReviveAction);els.markProductionActionButton.addEventListener("click",markProductionAction);els.markReleaseActionButton.addEventListener("click",markReleaseAction);els.markClipActionButton.addEventListener("click",markClipAction);els.generateClipPlanButton.addEventListener("click",generateClipPlan);els.generateStoryboardButton.addEventListener("click",generateStoryboard);els.exportClipScriptButton.addEventListener("click",exportClipScript);els.exportClipPromptsButton.addEventListener("click",exportClipPrompts);els.addClipSceneButton.addEventListener("click",addClipScene);els.navItems.forEach(item=>item.addEventListener("click",()=>{activeStatus=item.dataset.status;els.navItems.forEach(n=>n.classList.remove("active"));item.classList.add("active");els.activeFilterLabel.textContent=item.textContent;renderWorks()}));[els.titleInput,els.statusInput,els.keyInput,els.bpmInput,els.genreInput,els.moodInput,els.tagsInput,els.lyricsInput,els.chordsInput,els.referencesInput].forEach(i=>i.addEventListener("input",updateActiveWork));[els.productionStageInput,els.priorityInput,els.targetDateInput,els.nextActionInput].forEach(i=>i.addEventListener("input",updateProduction));[els.releaseStatusInput,els.releaseDateInput,els.distributorInput,els.releaseCodeInput,els.mainLinkInput,els.campaignActionInput].forEach(i=>i.addEventListener("input",updateRelease));[els.clipConceptInput,els.clipFormatInput,els.clipStyleInput,els.clipPaletteInput,els.clipReferenceInput,els.clipPersonaInput,els.clipLocationInput,els.clipMoodInput,els.clipProviderInput,els.clipNextActionInput,els.clipCoverPromptInput,els.clipFinalVideoInput,els.clipMontageNotesInput].forEach(i=>i.addEventListener("input",updateClip));els.saveVersionButton.addEventListener("click",saveCurrentVersion);els.exportWorkButton.addEventListener("click",()=>downloadJson(slugify(getActiveWork()?.title||"obra")+".json",getActiveWork()));els.deleteWorkButton.addEventListener("click",deleteActiveWork);els.addAudioButton.addEventListener("click",addAudio);els.addBlockButton.addEventListener("click",addBlock);els.compareButton.addEventListener("click",compareVersions);els.startSessionButton.addEventListener("click",startGuidedSession);els.addAuthorButton.addEventListener("click",addAuthor);els.generateDossierButton.addEventListener("click",generateDossier);els.exportDossierButton.addEventListener("click",exportDossier);els.generateMentorButton.addEventListener("click",generateMentor);els.applyMentorButton.addEventListener("click",applyMentor);els.addPhraseButton.addEventListener("click",addPhrase)}
function getActiveWork(){return state.works.find(w=>w.id===activeWorkId)||null}
function createWork(){const now=new Date().toISOString();const work=normalizeWork({id:createId(),title:"Nova obra",createdAt:now,updatedAt:now,timeline:[{id:createId(),label:"Obra criada",at:now}]});state.works.unshift(work);activeWorkId=work.id;saveState();render();els.titleInput.focus();els.titleInput.select()}
function quickCapture(){createWork();const w=getActiveWork();w.title="Ideia rapida";addTimeline(w,"Captura rapida iniciada");saveState();render();els.lyricsInput.focus()}
function updateActiveWork(){const w=getActiveWork();if(!w)return;const old=w.status;w.title=els.titleInput.value.trimStart()||"Sem titulo";w.status=els.statusInput.value;w.key=els.keyInput.value;w.bpm=els.bpmInput.value;w.genre=els.genreInput.value;w.mood=els.moodInput.value;w.tags=els.tagsInput.value;w.lyrics=els.lyricsInput.value;w.chords=els.chordsInput.value;w.references=els.referencesInput.value;evaluateCommercialProfile(w);w.updatedAt=new Date().toISOString();if(old!==w.status)addTimeline(w,`Status alterado para ${w.status}`);saveState();renderSummary();renderWorks();renderReadiness();renderRevive();renderCommercialPanel()}
function updateProduction(){const w=getActiveWork();if(!w)return;const old=w.production.stage;w.production.stage=els.productionStageInput.value;w.production.priority=els.priorityInput.value;w.production.targetDate=els.targetDateInput.value;w.production.nextAction=els.nextActionInput.value;w.updatedAt=new Date().toISOString();if(old!==w.production.stage)addTimeline(w,`Etapa de producao alterada para ${w.production.stage}`);saveState();renderSummary();renderWorks();renderReadiness();renderProduction()}
function markProductionAction(){const w=getActiveWork();if(!w)return;const action=w.production.nextAction.trim()||"Acao de producao registrada";addTimeline(w,`Producao: ${action}`);saveState();renderTimeline()}
function updateRelease(){const w=getActiveWork();if(!w)return;const old=w.release.status;w.release.status=els.releaseStatusInput.value;w.release.date=els.releaseDateInput.value;w.release.distributor=els.distributorInput.value;w.release.code=els.releaseCodeInput.value;w.release.mainLink=els.mainLinkInput.value;w.release.campaignAction=els.campaignActionInput.value;w.updatedAt=new Date().toISOString();if(old!==w.release.status)addTimeline(w,`Status de lancamento alterado para ${w.release.status}`);saveState();renderSummary();renderWorks();renderReadiness();renderRelease()}
function markReleaseAction(){const w=getActiveWork();if(!w)return;const action=w.release.campaignAction.trim()||"Acao de campanha registrada";addTimeline(w,`Lancamento: ${action}`);saveState();renderTimeline()}
function updateClip(){const w=getActiveWork();if(!w)return;w.clip.concept=els.clipConceptInput.value;w.clip.format=els.clipFormatInput.value;w.clip.style=els.clipStyleInput.value;w.clip.palette=els.clipPaletteInput.value;w.clip.reference=els.clipReferenceInput.value;w.clip.persona=els.clipPersonaInput.value;w.clip.location=els.clipLocationInput.value;w.clip.mood=els.clipMoodInput.value;w.clip.provider=els.clipProviderInput.value;w.clip.nextAction=els.clipNextActionInput.value;w.clip.coverPrompt=els.clipCoverPromptInput.value;w.clip.finalVideo=els.clipFinalVideoInput.value;w.clip.montageNotes=els.clipMontageNotesInput.value;w.updatedAt=new Date().toISOString();saveState();renderSummary();renderWorks();renderReadiness()}
function markClipAction(){const w=getActiveWork();if(!w)return;const action=w.clip.nextAction.trim()||"Acao de videoclipe registrada";addTimeline(w,`Videoclipe: ${action}`);saveState();renderTimeline()}
function generateClipPlan(){const w=getActiveWork();if(!w)return;const concept=w.clip.concept.trim()||w.title;const style=w.clip.style.trim()||"cinematografico realista";const palette=w.clip.palette.trim()||"tons naturais com acento cobre";const mood=w.clip.mood.trim()||w.mood||"emocional";const location=w.clip.location.trim()||"locacao coerente com a letra";const persona=w.clip.persona.trim()||"protagonista da cancao";const source=w.blocks.filter(b=>b.notes.trim()).map(b=>({part:b.name,text:b.notes}));if(!source.length){const lines=w.lyrics.split("\n").map(l=>l.trim()).filter(Boolean);if(lines.length)lines.slice(0,6).forEach((line,i)=>source.push({part:i===0?"Intro":i%3===0?"Refrao":"Verso",text:line}))}if(!source.length){source.push({part:"Intro",text:"Apresentar o universo visual da musica"},{part:"Verso",text:"Mostrar o conflito emocional da letra"},{part:"Refrao",text:"Elevar a imagem principal da cancao"},{part:"Final",text:"Encerrar com uma imagem memoravel"})}w.clip.scenes=source.slice(0,10).map((s,i)=>{const emotion=i===0?mood:i===source.length-1?"resolucao emocional":mood;const scene={id:createId(),part:s.part||`Cena ${i+1}`,duration:i===0?"5s":"6s",shot:i%3===0?"plano geral com movimento lento":i%3===1?"plano medio cinematografico":"close expressivo",status:"planejada",prompt:clipPrompt({title:w.title,concept,style,palette,mood:emotion,location,persona,part:s.part,text:s.text}),imagePrompt:"",storyboard:"",takeUrl:"",assetNotes:""};scene.imagePrompt=imagePromptForScene(w,scene,s.text);return scene});w.clip.coverPrompt=w.clip.coverPrompt||imagePromptForCover(w);w.clip.checklist["Conceito visual aprovado"]=Boolean(w.clip.concept.trim());w.clip.checklist["Roteiro por cenas iniciado"]=true;w.clip.checklist["Prompts revisados"]=false;w.clip.nextAction=w.clip.nextAction||"Revisar prompts e escolher o primeiro take para gerar";touchWork(w,"Roteiro de videoclipe gerado");render()}
function clipPrompt({title,concept,style,palette,mood,location,persona,part,text}){return`Videoclipe da musica "${title}". Parte: ${part}. Conceito: ${concept}. Cena inspirada em: ${text}. ${style}, imagem altamente realista, direcao de fotografia cinematografica, luz natural controlada, textura premium, camera suave, ${location}, personagem: ${persona}, emocao: ${mood}, paleta: ${palette}. Evitar texto na imagem, logos e imitacao de artistas reais.`}
function imagePromptForScene(w,scene,text){return`Frame de storyboard para "${w.title}". ${scene.part}: ${text||scene.prompt}. ${w.clip.style||"cinematografico realista"}, ${w.clip.location||"locacao coerente com a letra"}, personagem: ${w.clip.persona||"protagonista"}, paleta ${w.clip.palette||"tons naturais"}, composicao cinematografica, alta definicao, sem texto, sem logos.`}

/* ════════════════════════════════════════════════════════════════
   GERADOR DE IMAGEM — Caderno Vivo
   Motor: Pollinations.ai (100% gratuito, sem chave, sem cadastro)
   Fallback: Hugging Face SDXL-Turbo (gratuito com cota)
   
   Limites por plano (localStorage):
   - Gratuito:    3 imagens/mês
   - Compositor:  20 imagens/mês
   - Artista:     100 imagens/mês
   - Profissional: ilimitado
════════════════════════════════════════════════════════════════ */

const IMG_LIMITES = {
  free:         3,
  compositor:   20,
  artista:      100,
  profissional: Infinity,
};
const IMG_STORAGE_KEY = 'cv-img-uso-';

function getPlanoAtual() {
  // Lê o plano do localStorage (integrado com sistema comercial existente)
  try {
    const raw = localStorage.getItem('caderno-vivo-state-v5');
    if (!raw) return 'free';
    const st = JSON.parse(raw);
    const plano = st.commercial?.activePlan || 'free';
    return ['compositor','artista','profissional'].includes(plano) ? plano : 'free';
  } catch { return 'free'; }
}

function getMesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}`;
}

function getUsoImagens() {
  const key = IMG_STORAGE_KEY + getMesAtual();
  return parseInt(localStorage.getItem(key) || '0');
}

function incrementarUsoImagens() {
  const key = IMG_STORAGE_KEY + getMesAtual();
  localStorage.setItem(key, String(getUsoImagens() + 1));
}

function verificarLimiteImagem() {
  const plano = getPlanoAtual();
  const limite = IMG_LIMITES[plano] || IMG_LIMITES.free;
  const uso = getUsoImagens();
  return { ok: uso < limite, uso, limite, plano };
}

function urlPollinationsAi(prompt, width, height, seed) {
  const encoded = encodeURIComponent(prompt);
  const w = width  || 1024;
  const h = height || 1024;
  const s = seed   || Math.floor(Math.random() * 99999);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${s}&nologo=true&model=flux`;
}

async function gerarImagemPollinationsAi(prompt, width, height) {
  const url = urlPollinationsAi(prompt, width, height);
  // Pollinations funciona como <img src> — não precisa de fetch
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
    img.onload = () => { clearTimeout(timeout); resolve({ url, img }); };
    img.onerror = () => { clearTimeout(timeout); reject(new Error('Falha no carregamento')); };
    img.src = url;
  });
}

async function gerarImagemHuggingFace(prompt) {
  // Fallback: Hugging Face Inference API (grátis com cota)
  const resp = await fetch(
    'https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  if (!resp.ok) throw new Error(`HF error ${resp.status}`);
  const blob = await resp.blob();
  return URL.createObjectURL(blob);
}

async function gerarImagem(prompt, opcoes = {}) {
  const { width = 1024, height = 1024, elementoDestino, callbackStatus, callbackOk, callbackErro } = opcoes;

  // Verificar limite do plano
  const limite = verificarLimiteImagem();
  if (!limite.ok) {
    const msg = `Você atingiu o limite de ${limite.limite} imagens/mês do plano ${limite.plano}.

Faça upgrade para gerar mais imagens.`;
    alert(msg);
    if (callbackErro) callbackErro(msg);
    return null;
  }

  if (callbackStatus) callbackStatus('Gerando imagem com IA...');

  try {
    // Tentar Pollinations.ai primeiro (sempre grátis)
    const resultado = await gerarImagemPollinationsAi(prompt, width, height);
    incrementarUsoImagens();

    if (elementoDestino) {
      elementoDestino.src = resultado.url;
      elementoDestino.classList.remove('cv-img-hidden');
    }
    if (callbackStatus) callbackStatus(`✅ Imagem gerada! (${limite.uso + 1}/${limite.limite === Infinity ? '∞' : limite.limite} este mês)`);
    if (callbackOk) callbackOk(resultado.url);
    return resultado.url;

  } catch (e1) {
    // Fallback: Hugging Face
    try {
      if (callbackStatus) callbackStatus('Tentando via Hugging Face...');
      const url = await gerarImagemHuggingFace(prompt);
      incrementarUsoImagens();
      if (elementoDestino) { elementoDestino.src = url; elementoDestino.classList.remove('cv-img-hidden'); }
      if (callbackStatus) callbackStatus(`✅ Imagem gerada via HF! (${limite.uso + 1}/${limite.limite === Infinity ? '∞' : limite.limite} este mês)`);
      if (callbackOk) callbackOk(url);
      return url;
    } catch (e2) {
      const erro = 'Serviço de imagem temporariamente indisponível. Tente novamente em instantes.';
      if (callbackStatus) callbackStatus('❌ ' + erro);
      if (callbackErro) callbackErro(erro);
      return null;
    }
  }
}

// ── GERAR CAPA DA OBRA ─────────────────────────────────────────
async function gerarCapaObra() {
  const w = getActiveWork();
  if (!w) return;
  const prompt = imagePromptForCover(w);
  const container = document.getElementById('cv-capa-preview');
  const status = document.getElementById('cv-capa-status');
  const btn = document.getElementById('cv-btn-gerar-capa');
  if (btn) { btn.disabled = true; btn.textContent = 'Gerando...'; }

  // Determinar dimensões pela plataforma
  const plano = getPlanoAtual();
  const tamanho = plano === 'free' ? 512 : 1024;

  await gerarImagem(prompt, {
    width: tamanho, height: tamanho,
    elementoDestino: document.getElementById('cv-capa-img'),
    callbackStatus: txt => { if (status) status.textContent = txt; },
    callbackOk: url => {
      // Salvar URL da capa na obra
      w.clip = w.clip || {};
      w.clip.coverImageUrl = url;
      touchWork(w, 'Capa gerada com IA');
      saveState();
      // Mostrar botão de download
      const dl = document.getElementById('cv-btn-baixar-capa');
      if (dl) { dl.href = url; dl.download = `capa-${w.title||'musica'}.jpg`; dl.classList.remove('cv-img-hidden'); }
    },
    callbackErro: () => { if (btn) { btn.disabled = false; btn.textContent = '🎨 Gerar capa'; } }
  });
  if (btn) { btn.disabled = false; btn.textContent = '🎨 Gerar capa'; }
}

// ── GERAR IMAGEM DE CENA DO CLIPE ──────────────────────────────
async function gerarImagemCena(sceneId, btnEl) {
  const w = getActiveWork();
  if (!w) return;
  const scene = w.clip?.scenes?.find(s => s.id === sceneId);
  if (!scene) return;
  const prompt = imagePromptForScene(w, scene, scene.storyboard || scene.prompt);
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Gerando...'; }

  const plano = getPlanoAtual();
  const tamanho = plano === 'free' ? 512 : 1024;

  // Criar elemento de imagem para a cena se não existir
  let imgEl = btnEl?.parentElement?.querySelector('.cv-cena-img');
  if (!imgEl) {
    imgEl = document.createElement('img');
    imgEl.className = 'cv-cena-img cv-img-hidden';
    imgEl.style.cssText = 'width:100%;border-radius:6px;margin-top:8px;max-height:200px;object-fit:cover';
    btnEl?.parentElement?.appendChild(imgEl);
  }

  await gerarImagem(prompt, {
    width: tamanho, height: Math.round(tamanho * 0.5625), // 16:9
    elementoDestino: imgEl,
    callbackStatus: txt => {
      if (btnEl) btnEl.textContent = txt.startsWith('✅') ? '✅ Gerada' : txt;
    },
    callbackOk: url => {
      scene.imageUrl = url;
      if (scene._imgEl) { scene._imgEl = null; } // forçar recarregamento
      touchWork(w, `Imagem gerada para cena ${scene.part}`);
      saveState();
    },
  });
  if (btnEl) { btnEl.disabled = false; btnEl.textContent = '🎨 Gerar imagem'; }
}

// ── GERAR TODAS AS IMAGENS DO CLIPE ────────────────────────────
async function gerarTodasImagensClipe() {
  const w = getActiveWork();
  if (!w || !w.clip?.scenes?.length) { alert('Gere o roteiro primeiro.'); return; }
  const btn = document.getElementById('cv-btn-gerar-todas-imgs');
  if (btn) { btn.disabled = true; btn.textContent = 'Gerando todas...'; }

  for (const scene of w.clip.scenes) {
    const prompt = imagePromptForScene(w, scene, scene.storyboard || scene.prompt);
    const plano = getPlanoAtual();
    const tamanho = plano === 'free' ? 512 : 1024;
    const limite = verificarLimiteImagem();
    if (!limite.ok) {
      alert(`Limite de imagens atingido (${limite.uso}/${limite.limite}). Upgrade de plano para continuar.`);
      break;
    }
    await gerarImagem(prompt, {
      width: tamanho, height: Math.round(tamanho * 0.5625),
      callbackOk: url => { scene.imageUrl = url; saveState(); }
    });
    // Delay entre imagens para não sobrecarregar a API
    await new Promise(r => setTimeout(r, 1500));
  }

  if (btn) { btn.disabled = false; btn.textContent = '🎨 Gerar todas as imagens'; }
  renderClipScenes();
}

// ── MOSTRAR CONTADOR DE CRÉDITOS ───────────────────────────────
function renderizarContadorImagens() {
  const el = document.getElementById('cv-contador-imgs');
  if (!el) return;
  const { uso, limite, plano } = verificarLimiteImagem();
  const limiteStr = limite === Infinity ? '∞' : limite;
  el.textContent = `🎨 Imagens: ${uso}/${limiteStr} — plano ${plano}`;
  el.style.color = uso >= limite * 0.8 ? 'var(--danger)' : 'var(--muted)';
}
function imagePromptForCover(w){return`Capa visual do videoclipe "${w.title}". Conceito: ${w.clip.concept||w.title}. ${w.clip.style||"cinematografico realista"}, personagem: ${w.clip.persona||"protagonista"}, locacao: ${w.clip.location||"ambiente da musica"}, clima: ${w.clip.mood||w.mood||"emocional"}, paleta: ${w.clip.palette||"tons naturais"}, imagem premium para divulgacao, sem texto, sem logos.`}
function generateStoryboard(){const w=getActiveWork();if(!w)return;if(!w.clip.scenes.length)generateClipPlan();w.clip.coverPrompt=w.clip.coverPrompt||imagePromptForCover(w);w.clip.scenes.forEach((scene,i)=>{scene.imagePrompt=scene.imagePrompt||imagePromptForScene(w,scene,scene.prompt);const base=`Quadro ${i+1}: ${scene.shot}; foco em ${scene.part}; emocao ${w.clip.mood||w.mood||"principal"}; transicao sugerida para o take seguinte.`;scene.storyboard=scene.storyboard?.trim()?scene.storyboard:base});w.clip.checklist["Storyboard visual criado"]=true;touchWork(w,"Storyboard visual do videoclipe gerado");render()}
function addClipScene(){const w=getActiveWork();if(!w)return;const scene={id:createId(),part:"Nova cena",duration:"6s",shot:"plano medio cinematografico",status:"planejada",prompt:clipPrompt({title:w.title,concept:w.clip.concept||w.title,style:w.clip.style||"cinematografico realista",palette:w.clip.palette||"tons naturais",mood:w.clip.mood||w.mood||"emocional",location:w.clip.location||"locacao coerente com a letra",persona:w.clip.persona||"protagonista",part:"Nova cena",text:"novo momento visual da musica"}),imagePrompt:"",storyboard:"",takeUrl:"",assetNotes:""};scene.imagePrompt=imagePromptForScene(w,scene,"novo momento visual da musica");w.clip.scenes.push(scene);touchWork(w,"Cena de videoclipe adicionada");renderClip();renderReadiness();renderSummary()}
function updateClipScene(id,key,value){const w=getActiveWork();const scene=w?.clip.scenes.find(s=>s.id===id);if(!scene)return;scene[key]=value;w.updatedAt=new Date().toISOString();saveState();renderReadiness();renderSummary()}
function removeClipScene(id){const w=getActiveWork();if(!w)return;w.clip.scenes=w.clip.scenes.filter(s=>s.id!==id);touchWork(w,"Cena de videoclipe removida");renderClip();renderReadiness();renderSummary()}
function toggleClipItem(item){const w=getActiveWork();if(!w)return;w.clip.checklist[item]=!w.clip.checklist[item];touchWork(w,`Videoclipe - ${item}: ${w.clip.checklist[item]?"marcado":"desmarcado"}`);renderClip();renderReadiness();renderSummary()}
function buildClipPackage(w){return{title:w.title,genre:w.genre,mood:w.mood,lyrics:w.lyrics,clip:{concept:w.clip.concept,format:w.clip.format,style:w.clip.style,palette:w.clip.palette,reference:w.clip.reference,persona:w.clip.persona,location:w.clip.location,mood:w.clip.mood,provider:w.clip.provider,nextAction:w.clip.nextAction,coverPrompt:w.clip.coverPrompt,finalVideo:w.clip.finalVideo,montageNotes:w.clip.montageNotes,exportPreset:w.clip.exportPreset,exportQuality:w.clip.exportQuality,exportSceneSeconds:w.clip.exportSceneSeconds,exportFileName:w.clip.exportFileName,exportCaption:w.clip.exportCaption,renderedAt:w.clip.renderedAt,renderedFormat:w.clip.renderedFormat,mp4RenderedAt:w.clip.mp4RenderedAt,mp4File:w.clip.mp4File,checklist:w.clip.checklist,scenes:w.clip.scenes.map(({part,duration,shot,status,prompt,imagePrompt,storyboard,takeUrl,assetNotes})=>({part,duration,shot,status,prompt,imagePrompt,storyboard,takeUrl,assetNotes}))},exportedAt:new Date().toISOString()}}
function exportClipScript(){const w=getActiveWork();if(!w)return;downloadJson(`${slugify(w.title)}-roteiro-videoclipe.json`,buildClipPackage(w));addTimeline(w,"Roteiro do videoclipe exportado");saveState();renderTimeline()}
function exportClipPrompts(){const w=getActiveWork();if(!w)return;const payload={title:w.title,coverPrompt:w.clip.coverPrompt,videoPrompts:w.clip.scenes.map((s,i)=>({scene:i+1,part:s.part,duration:s.duration,videoPrompt:s.prompt,imagePrompt:s.imagePrompt,takeUrl:s.takeUrl,status:s.status})),montageNotes:w.clip.montageNotes,exportedAt:new Date().toISOString()};downloadJson(`${slugify(w.title)}-prompts-video-imagem.json`,payload);addTimeline(w,"Prompts de video e imagem exportados");saveState();renderTimeline()}
function bindExportEvents(){["#exportPresetInput","#exportQualityInput","#exportSceneSecondsInput","#exportFileNameInput","#exportCaptionInput"].forEach(s=>$(s)?.addEventListener("input",updateExportSettings));$("#renderClipButton")?.addEventListener("click",renderFinalClip);$("#downloadRenderedClipButton")?.addEventListener("click",downloadRenderedClip);$("#convertMp4Button")?.addEventListener("click",convertRenderedClipToMp4);$("#downloadMp4Button")?.addEventListener("click",downloadMp4Clip);$("#downloadPublishPackButton")?.addEventListener("click",downloadPublishPack)}
function bindInternationalEvents(){["#sourceLanguageInput","#targetLanguageInput","#targetMarketInput","#adaptationModeInput","#internationalReviewInput"].forEach(s=>{$(s)?.addEventListener("input",updateInternationalSettings);$(s)?.addEventListener("change",updateInternationalSettings)});$("#generateInternationalButton")?.addEventListener("click",generateInternationalAdaptation);$("#saveInternationalButton")?.addEventListener("click",saveInternationalVersion);$("#plusOfferButton")?.addEventListener("click",markPlusInterest);$("#generateInternationalClipButton")?.addEventListener("click",generateInternationalClip);$("#primeOfferButton")?.addEventListener("click",markPrimeInterest)}
function bindCommercialEvents(){$("#professionalPathButton")?.addEventListener("click",()=>setCreativePath("professional"));$("#assistedPathButton")?.addEventListener("click",()=>setCreativePath("assisted"));$("#acceptAwarenessButton")?.addEventListener("click",acceptAwarenessTerm);$("#acceptRevenueShareButton")?.addEventListener("click",acceptRevenueShareTerm);document.querySelectorAll("[data-origin]").forEach(i=>i.addEventListener("change",()=>toggleOriginMaterial(i.dataset.origin,i.checked)));$("#smartOfferBox")?.addEventListener("click",e=>{const action=e.target?.dataset?.offerAction;if(action==="accept")acceptSmartOffer();if(action==="dismiss")dismissSmartOffer()})}
function updateExportSettings(){const w=getActiveWork();if(!w)return;w.clip.exportPreset=$("#exportPresetInput").value;w.clip.exportQuality=$("#exportQualityInput").value;w.clip.exportSceneSeconds=Number($("#exportSceneSecondsInput").value||4);w.clip.exportFileName=$("#exportFileNameInput").value;w.clip.exportCaption=$("#exportCaptionInput").value;w.updatedAt=new Date().toISOString();saveState();renderExportPanel();renderReadiness()}
function renderExportPanel(){const w=getActiveWork();if(!w||!$("#exportPresetInput"))return;renderizarContadorImagens();const preset=EXPORT_PRESETS[w.clip.exportPreset]||EXPORT_PRESETS.tiktok;$("#exportPresetInput").value=w.clip.exportPreset||"tiktok";$("#exportQualityInput").value=w.clip.exportQuality||"padrao";$("#exportSceneSecondsInput").value=w.clip.exportSceneSeconds||4;$("#exportFileNameInput").value=w.clip.exportFileName||slugify(w.title||"videoclipe-final");$("#exportCaptionInput").value=w.clip.exportCaption||"";const canvas=$("#renderCanvas");if(canvas){canvas.width=preset.width;canvas.height=preset.height;drawExportFrame(canvas,w,preset,w.clip.scenes[0],0,0)}const ready={scenes:w.clip.scenes.length>0,prompts:w.clip.scenes.some(s=>s.prompt),storyboard:w.clip.scenes.some(s=>s.storyboard||s.imagePrompt),takes:w.clip.scenes.some(s=>s.takeUrl),rendered:Boolean(w.clip.renderedAt),mp4:Boolean(w.clip.mp4RenderedAt)};$("#exportSpec").textContent=`${preset.label}: ${preset.ratio}, ${preset.width}x${preset.height}. ${preset.hint}`;$("#exportStatus").textContent=w.clip.renderedAt?`Ultimo render: ${formatDate(w.clip.renderedAt)} (${w.clip.renderedFormat||"video/webm"})`:"Pronto para renderizar.";$("#mp4Status").textContent=w.clip.mp4RenderedAt?`MP4 profissional gerado em ${formatDate(w.clip.mp4RenderedAt)}: ${w.clip.mp4File}`:"MP4 profissional: renderize o video e depois converta com FFmpeg.";if(!w.clip.mp4RenderedAt)updateMp4Progress(0,"Aguardando conversao.");$("#exportChecklist").innerHTML=[["Cenas criadas",ready.scenes],["Prompts prontos",ready.prompts],["Storyboard pronto",ready.storyboard],["Takes catalogados",ready.takes],["Video renderizado",ready.rendered],["MP4 profissional",ready.mp4]].map(([label,ok])=>`<span class="check-item ${ok?"done":""}">${ok?"ok":"-"} ${label}</span>`).join("");$("#downloadRenderedClipButton").disabled=!renderedClipBlob;$("#convertMp4Button").disabled=!renderedClipBlob;$("#downloadMp4Button").disabled=!mp4ClipBlob}
function updateMp4Progress(ratio,label,isError=false){const bar=$("#mp4ProgressBar"),text=$("#mp4ProgressText"),box=$(".mp4-progress");const pct=Math.max(0,Math.min(100,Math.round(Number(ratio||0)*100)));if(bar)bar.style.width=`${pct}%`;if(text)text.textContent=label||`${pct}%`;if(box)box.classList.toggle("error",Boolean(isError))}
/* ── LYRIC VIDEO ENGINE — Kinetic Typography + Canvas Cinematográfico ── */
const CV_PALETAS={
  "tons naturais com acento cobre":["#15130f","#2a1f0d","#d8b56f","#f7ead3"],
  "escuro e dramático":["#08080f","#1a1a2e","#7b9ee0","#e8f0fe"],
  "quente e intimista":["#1a0a00","#3d1f00","#e8935a","#fff0e8"],
  "azul profundo":["#030b1a","#0d2137","#4a9fd4","#e8f4fd"],
  "gospel e luz":["#0d0a00","#2a2200","#f0c040","#fffdf0"],
  "minimalista":["#0a0a0a","#1a1a1a","#888888","#ffffff"],
};
function getPaleta(w){
  const p=w.clip?.palette||"";
  for(const k of Object.keys(CV_PALETAS)){if(p.toLowerCase().includes(k.split(" ")[0]))return CV_PALETAS[k];}
  return CV_PALETAS["tons naturais com acento cobre"];
}
function wrapText(ctx,text,x,y,maxW,lineH){
  const words=text.split(" ");let line="";const lines=[];
  for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=word;}else{line=test;}}
  if(line)lines.push(line);
  const startY=y-(lines.length-1)*lineH/2;
  lines.forEach((l,i)=>ctx.fillText(l,x,startY+i*lineH));
  return lines.length;
}
function drawKineticFrame(canvas,w,preset,scene,progress,sceneIdx,total,beatPhase){
  const ctx=canvas.getContext("2d");
  const W=canvas.width,H=canvas.height;
  const pal=getPaleta(w);
  const [bg1,bg2,accent,text1]=pal;

  // ── FUNDO com gradiente dinâmico ──
  const grad=ctx.createLinearGradient(0,0,W,H);
  const shift=Math.sin(progress*Math.PI*2)*0.08;
  grad.addColorStop(0,bg1);
  grad.addColorStop(Math.max(0.1,Math.min(0.9,0.5+shift)),bg2);
  grad.addColorStop(1,bg1);
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,W,H);

  // ── PARTÍCULAS pulsantes no beat ──
  const pulse=1+Math.sin(beatPhase*Math.PI*2)*0.03;
  ctx.save();
  for(let i=0;i<12;i++){
    const angle=(i/12)*Math.PI*2+progress*0.5;
    const r=(W*0.38)*pulse;
    const px=W/2+Math.cos(angle)*r;
    const py=H/2+Math.sin(angle)*r*0.6;
    const alpha=0.04+Math.sin(beatPhase*Math.PI*2+i)*0.03;
    ctx.beginPath();
    ctx.arc(px,py,W*0.003,0,Math.PI*2);
    ctx.fillStyle=`rgba(${hexRgb(accent)},${alpha})`;
    ctx.fill();
  }
  ctx.restore();

  // ── FORMAS geométricas abstratas (visualizer) ──
  ctx.save();
  const shapes=5;
  for(let i=0;i<shapes;i++){
    const t=progress+i/shapes;
    const x=W*(0.1+0.8*(i/shapes));
    const barH=H*0.06*(0.5+Math.sin(beatPhase*Math.PI*4+i)*0.5);
    const alpha=0.12+Math.sin(beatPhase*Math.PI*2+i*0.7)*0.06;
    ctx.fillStyle=`rgba(${hexRgb(accent)},${alpha})`;
    const bw=W*0.04;
    ctx.fillRect(x-bw/2,H*0.85-barH,bw,barH);
  }
  ctx.restore();

  // ── VINHETA cinematográfica ──
  const vig=ctx.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,H*0.85);
  vig.addColorStop(0,"rgba(0,0,0,0)");
  vig.addColorStop(1,"rgba(0,0,0,0.72)");
  ctx.fillStyle=vig;
  ctx.fillRect(0,0,W,H);

  // ── FOTO DO ARTISTA (se tiver) ──
  if(scene?._imgEl){
    ctx.save();
    // Ken Burns: zoom suave de 100% a 108%
    const zoom=1+progress*0.08;
    const iw=scene._imgEl.naturalWidth||W;
    const ih=scene._imgEl.naturalHeight||H;
    const scale=Math.max(W/iw,H/ih)*zoom;
    const dx=(W-iw*scale)/2;
    const dy=(H-ih*scale)/2;
    ctx.globalAlpha=0.45;
    ctx.drawImage(scene._imgEl,dx,dy,iw*scale,ih*scale);
    ctx.globalAlpha=1;
    // Overlay de cor (duotone)
    ctx.fillStyle=`rgba(${hexRgb(bg1)},0.55)`;
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }

  // ── FADE IN/OUT entre cenas ──
  if(progress<0.08){
    ctx.fillStyle=`rgba(0,0,0,${1-progress/0.08})`;
    ctx.fillRect(0,0,W,H);
  }
  if(progress>0.92){
    ctx.fillStyle=`rgba(0,0,0,${(progress-0.92)/0.08})`;
    ctx.fillRect(0,0,W,H);
  }

  // ── NOME DA PARTE (parte superior, pequeno) ──
  ctx.save();
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.fillStyle=`rgba(${hexRgb(accent)},0.7)`;
  ctx.font=`${Math.max(14,W*0.022)}px Inter,Arial,sans-serif`;
  ctx.letterSpacing="0.15em";
  ctx.fillText((scene?.part||"").toUpperCase(),W/2,H*0.12);
  ctx.restore();

  // ── TÍTULO DA MÚSICA (Kinetic — escala com beat) ──
  ctx.save();
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  const titleScale=1+Math.sin(beatPhase*Math.PI*2)*0.015;
  ctx.translate(W/2,H*0.28);
  ctx.scale(titleScale,titleScale);
  ctx.fillStyle=text1;
  const titleSize=Math.max(20,Math.min(W*0.065,72));
  ctx.font=`700 ${titleSize}px Inter,Arial,sans-serif`;
  ctx.shadowColor=accent;
  ctx.shadowBlur=W*0.012;
  wrapText(ctx,w.title||"Caderno Vivo",0,0,W*0.82,titleSize*1.3);
  ctx.restore();

  // ── LETRA DA CENA (principal — Kinetic Typography) ──
  const lyricLine=getLyricLine(w,scene,sceneIdx);
  if(lyricLine){
    ctx.save();
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    // Animação de entrada: slide up
    const enterY=progress<0.15?(1-progress/0.15)*H*0.04:0;
    const lyricAlpha=progress<0.1?progress/0.1:progress>0.88?1-(progress-0.88)/0.12:1;
    ctx.globalAlpha=lyricAlpha;
    ctx.translate(W/2,H*0.55+enterY);
    const lyricScale=1+Math.sin(beatPhase*Math.PI*2)*0.008;
    ctx.scale(lyricScale,lyricScale);
    // Sombra da letra
    ctx.shadowColor="rgba(0,0,0,0.9)";
    ctx.shadowBlur=W*0.018;
    ctx.fillStyle=text1;
    const lyricSize=Math.max(18,Math.min(W*0.055,60));
    ctx.font=`500 ${lyricSize}px Inter,Arial,sans-serif`;
    wrapText(ctx,lyricLine,0,0,W*0.8,lyricSize*1.4);
    ctx.restore();
  }

  // ── LINHA DECORATIVA ACCENT ──
  ctx.save();
  const lineW=W*0.12*(0.5+Math.sin(beatPhase*Math.PI*2)*0.5+0.5);
  ctx.fillStyle=accent;
  ctx.fillRect(W/2-lineW/2,H*0.72,lineW,Math.max(2,H*0.003));
  ctx.restore();

  // ── CAPTION / CRÉDITO ──
  if(w.clip?.exportCaption){
    ctx.save();
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillStyle=`rgba(${hexRgb(text1)},0.55)`;
    ctx.font=`${Math.max(11,W*0.018)}px Inter,Arial,sans-serif`;
    ctx.fillText(w.clip.exportCaption,W/2,H*0.9);
    ctx.restore();
  }

  // ── BARRA DE PROGRESSO dourada ──
  ctx.fillStyle="rgba(0,0,0,0.35)";
  ctx.fillRect(W*0.08,H*0.945,W*0.84,Math.max(3,H*0.008));
  ctx.fillStyle=accent;
  const prog=(sceneIdx+progress)/Math.max(total,1);
  ctx.fillRect(W*0.08,H*0.945,W*0.84*prog,Math.max(3,H*0.008));

  // ── MARCA D'ÁGUA ──
  ctx.save();
  ctx.textAlign="right";
  ctx.textBaseline="bottom";
  ctx.fillStyle=`rgba(${hexRgb(accent)},0.35)`;
  ctx.font=`${Math.max(10,W*0.016)}px Inter,Arial,sans-serif`;
  ctx.fillText("caderno vivo",W*0.95,H*0.97);
  ctx.restore();
}
function hexRgb(hex){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
function getLyricLine(w,scene,idx){
  // Pegar linha da letra correspondente à cena
  const lines=(w.lyrics||"").split("\n").map(l=>l.trim()).filter(Boolean);
  if(!lines.length)return scene?.storyboard||scene?.prompt||w.clip?.concept||"";
  return lines[idx%lines.length]||lines[0];
}
function drawExportFrame(canvas,w,preset,scene,index,total){
  const progress=index%1||0;
  const sceneIdx=Math.floor(index)||0;
  const beatPhase=(index*2)%1;
  drawKineticFrame(canvas,w,preset,scene,progress,sceneIdx,total,beatPhase);
}
function fitText(ctx,text,maxSize,minSize,maxWidth,y){let size=maxSize;ctx.font=`700 ${size}px Inter, Segoe UI, Arial`;while(ctx.measureText(text).width>maxWidth&&size>minSize){size-=2;ctx.font=`700 ${size}px Inter, Segoe UI, Arial`}const words=String(text||"").split(" ");let line="",lines=[];for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);const lineHeight=size*1.18;lines.slice(0,3).forEach((l,i)=>ctx.fillText(l,ctx.canvas.width/2,y+(i-(Math.min(lines.length,3)-1)/2)*lineHeight))}
async function renderFinalClip(){
  const w=getActiveWork();if(!w)return;
  if(!w.clip.scenes.length)generateClipPlan();
  if(!w.clip.scenes.some(s=>s.storyboard||s.imagePrompt))generateStoryboard();
  if(!window.MediaRecorder){$("#exportStatus").textContent="Este navegador nao suporta renderizacao local de video.";return}
  const preset=EXPORT_PRESETS[w.clip.exportPreset]||EXPORT_PRESETS.tiktok;
  const canvas=$("#renderCanvas");
  canvas.width=preset.width;canvas.height=preset.height;
  const fps=24;
  const seconds=Math.max(2,Math.min(12,Number(w.clip.exportSceneSeconds||4)));
  // Pré-carregar imagens das cenas
  const scenes=w.clip.scenes.length?w.clip.scenes:[normalizeClipScene({part:"Cena",prompt:w.clip.concept})];
  for(const sc of scenes){
    if(sc.imageUrl&&!sc._imgEl){
      try{
        const img=new Image();img.crossOrigin="anonymous";
        await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=sc.imageUrl;});
        sc._imgEl=img;
      }catch(e){sc._imgEl=null;}
    }
  }
  const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm";
  const chunks=[];
  const stream=canvas.captureStream(fps);
  const bitrate=w.clip.exportQuality==="alta"?6000000:w.clip.exportQuality==="leve"?1800000:3500000;
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:bitrate});
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  // Análise de beat via BPM da obra
  const bpm=Number(w.bpm)||80;
  const beatInterval=60/bpm;
  let startTime=null;
  $("#exportStatus").textContent="Renderizando Lyric Video...";
  rec.start();
  for(let i=0;i<scenes.length;i++){
    const frames=seconds*fps;
    for(let f=0;f<frames;f++){
      if(!startTime)startTime=performance.now();
      const elapsed=(performance.now()-(startTime||0))/1000;
      const beatPhase=(elapsed/beatInterval)%1;
      const progress=f/frames;
      drawKineticFrame(canvas,w,preset,scenes[i],progress,i,scenes.length,beatPhase);
      const pct=Math.round(((i*frames+f)/(scenes.length*frames))*100);
      if(f%fps===0)$("#exportStatus").textContent=`Renderizando... ${pct}%`;
      await new Promise(r=>setTimeout(r,1000/fps));
    }
  }
  await new Promise(resolve=>{rec.onstop=resolve;rec.stop();});
  if(renderedClipUrl)URL.revokeObjectURL(renderedClipUrl);
  renderedClipBlob=new Blob(chunks,{type:"video/webm"});
  renderedClipUrl=URL.createObjectURL(renderedClipBlob);
  $("#renderedVideoPreview").src=renderedClipUrl;
  $("#renderedVideoPreview").classList.remove("hidden");
  $("#downloadRenderedClipButton").disabled=false;
  w.clip.renderedAt=new Date().toISOString();
  w.clip.renderedFormat="video/webm";
  w.clip.finalVideo=`${exportFileBase(w)}.webm`;
  if(els.clipFinalVideoInput)els.clipFinalVideoInput.value=w.clip.finalVideo;
  w.clip.checklist["Video renderizado para plataforma"]=true;
  touchWork(w,`Lyric Video renderizado para ${preset.label}`);
  renderExportPanel();renderSummary();renderReadiness();renderTimeline();
  $("#exportStatus").textContent=`✅ Lyric Video pronto! ${preset.label} — ${preset.width}x${preset.height}`;
}
function exportFileBase(w){return slugify(w.clip.exportFileName||`${w.title||"videoclipe"}-${w.clip.exportPreset||"video"}`)}
function downloadRenderedClip(){if(!renderedClipBlob)return;const w=getActiveWork();const a=document.createElement("a");a.href=renderedClipUrl;a.download=`${exportFileBase(w)}.webm`;document.body.appendChild(a);a.click();a.remove()}
async function ensureFfmpeg(){if(ffmpegInstance)return ffmpegInstance;if(!window.FFmpeg){$("#mp4Status").textContent="Carregando FFmpeg WebAssembly...";updateMp4Progress(.08,"Carregando biblioteca FFmpeg...");await loadScript("https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js")}if(!window.FFmpeg?.createFFmpeg)throw new Error("FFmpeg WebAssembly nao foi carregado.");const {createFFmpeg}=window.FFmpeg;ffmpegInstance=createFFmpeg({log:false,corePath:"https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"});ffmpegInstance.setProgress?.(({ratio})=>updateMp4Progress(.25+Math.max(0,Math.min(1,ratio||0))*.65,`Convertendo MP4: ${Math.round(Math.max(0,Math.min(1,ratio||0))*100)}%`));updateMp4Progress(.15,"Inicializando motor de video...");await ffmpegInstance.load();return ffmpegInstance}
function loadScript(src){return new Promise((resolve,reject)=>{const existing=[...document.scripts].find(s=>s.src===src);if(existing){resolve();return}const script=document.createElement("script");script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error(`Falha ao carregar ${src}`));document.head.appendChild(script)})}
async function convertRenderedClipToMp4(){const w=getActiveWork();if(!w||!renderedClipBlob)return;try{$("#convertMp4Button").disabled=true;$("#mp4Status").textContent="Convertendo para MP4 profissional com FFmpeg...";updateMp4Progress(.03,"Preparando arquivo WEBM...");const ffmpeg=await ensureFfmpeg();const {fetchFile}=window.FFmpeg;const input="input.webm",output="output.mp4";try{ffmpeg.FS("unlink",input)}catch{}try{ffmpeg.FS("unlink",output)}catch{}ffmpeg.FS("writeFile",input,await fetchFile(renderedClipBlob));updateMp4Progress(.22,"Arquivo carregado. Iniciando conversao...");await ffmpeg.run("-i",input,"-c:v","libx264","-preset","veryfast","-pix_fmt","yuv420p","-movflags","faststart","-an",output);const data=ffmpeg.FS("readFile",output);if(mp4ClipUrl)URL.revokeObjectURL(mp4ClipUrl);mp4ClipBlob=new Blob([data.buffer],{type:"video/mp4"});mp4ClipUrl=URL.createObjectURL(mp4ClipBlob);w.clip.mp4RenderedAt=new Date().toISOString();w.clip.mp4File=`${exportFileBase(w)}.mp4`;w.clip.finalVideo=w.clip.mp4File;w.clip.checklist["Video renderizado para plataforma"]=true;touchWork(w,"MP4 profissional gerado com FFmpeg");if(els.clipFinalVideoInput)els.clipFinalVideoInput.value=w.clip.finalVideo;updateMp4Progress(1,"MP4 pronto para baixar.");renderExportPanel();renderSummary();renderReadiness();renderTimeline()}catch(error){$("#mp4Status").textContent="A conversao MP4 foi interrompida. Baixe o WEBM ou tente novamente com menos cenas, qualidade leve e navegador atualizado.";updateMp4Progress(1,"Falha na conversao. O WEBM continua disponivel.",true);$("#convertMp4Button").disabled=false;console.error("Falha no FFmpeg",error)}}
function downloadMp4Clip(){if(!mp4ClipBlob)return;const w=getActiveWork();const a=document.createElement("a");a.href=mp4ClipUrl;a.download=`${exportFileBase(w)}.mp4`;document.body.appendChild(a);a.click();a.remove()}
function downloadPublishPack(){const w=getActiveWork();if(!w)return;const preset=EXPORT_PRESETS[w.clip.exportPreset]||EXPORT_PRESETS.tiktok;downloadJson(`${exportFileBase(w)}-pacote-publicacao.json`,{title:w.title,platform:preset.platform,preset,render:{webm:`${exportFileBase(w)}.webm`,mp4:w.clip.mp4File||"",format:w.clip.mp4RenderedAt?"video/mp4":"video/webm",renderedAt:w.clip.mp4RenderedAt||w.clip.renderedAt||""},caption:w.clip.exportCaption||"",description:`${w.title} - videoclipe oficial`,hashtags:["#musica","#videoclipe","#lancamento"],credits:w.protection.authors,clip:buildClipPackage(w).clip,dossierHash:w.protection.dossier?.hash||"",exportedAt:new Date().toISOString()});addTimeline(w,`Pacote de publicacao exportado para ${preset.label}`);saveState();renderTimeline()}
function deleteActiveWork(){const w=getActiveWork();if(!w||!confirm(`Excluir "${w.title}"?`))return;state.works=state.works.filter(i=>i.id!==w.id);activeWorkId=state.works[0]?.id||null;saveState();render()}
function touchWork(w,label){w.updatedAt=new Date().toISOString();addTimeline(w,label);saveState()}
function addTimeline(w,label){w.timeline.unshift({id:createId(),label,at:new Date().toISOString()})}
function saveCurrentVersion(){const w=getActiveWork();if(!w)return;if(!w.lyrics.trim()&&!w.chords.trim()){alert("Escreva a letra ou cifra antes.");return}const n=w.versions.length+1;w.versions.unshift({id:createId(),name:`Versao ${n}`,lyrics:w.lyrics,chords:w.chords,title:w.title,at:new Date().toISOString()});touchWork(w,`Versao ${n} da letra salva`);render()}
function restoreVersion(id){const w=getActiveWork();const v=w?.versions.find(i=>i.id===id);if(!v)return;w.lyrics=v.lyrics;w.chords=v.chords;touchWork(w,`${v.name} restaurada`);render()}
async function addAudio(){const w=getActiveWork();if(!w)return;const file=els.audioFileInput.files?.[0]||null;const link=els.audioLinkInput.value.trim();const name=els.audioNameInput.value.trim()||file?.name||link;if(!name&&!file&&!link){els.audioNameInput.focus();return}let dataUrl="";if(file)dataUrl=await readFileAsDataUrl(file);w.audios.unshift({id:createId(),type:els.audioTypeInput.value,name:name||"Audio sem nome",link,dataUrl,fileName:file?.name||"",fileType:file?.type||"",createdAt:new Date().toISOString()});els.audioNameInput.value="";els.audioLinkInput.value="";els.audioFileInput.value="";touchWork(w,`${els.audioTypeInput.value} adicionado`);render()}
function readFileAsDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=rej;r.readAsDataURL(file)})}
function removeAudio(id){const w=getActiveWork();if(!w)return;w.audios=w.audios.filter(a=>a.id!==id);touchWork(w,"Audio removido");render()}
function addBlock(){const w=getActiveWork();if(!w)return;w.blocks.push({id:createId(),name:"Novo bloco",notes:""});touchWork(w,"Bloco de composicao adicionado");render()}
function updateBlock(id,k,v){const w=getActiveWork();const b=w?.blocks.find(i=>i.id===id);if(!b)return;b[k]=v;w.updatedAt=new Date().toISOString();saveState();renderReadiness()}
function removeBlock(id){const w=getActiveWork();if(!w)return;w.blocks=w.blocks.filter(b=>b.id!==id);touchWork(w,"Bloco removido");render()}
function startGuidedSession(){const w=getActiveWork();if(!w)return;w.sessions.unshift({id:createId(),at:new Date().toISOString(),steps:[{label:"Revisar a ideia central",done:false},{label:"Melhorar uma linha do verso",done:false},{label:"Fortalecer o refrao",done:false},{label:"Salvar uma nova versao",done:false}]});touchWork(w,"Sessao guiada iniciada");render()}
function toggleSessionStep(id,i){const w=getActiveWork();const s=w?.sessions.find(x=>x.id===id);if(!s)return;s.steps[i].done=!s.steps[i].done;touchWork(w,"Sessao guiada atualizada");render()}
function getReviveAction(w){if(!w.lyrics.trim())return"Escreva quatro linhas livres sobre a emocao principal.";if(!w.versions.length)return"Salve a primeira versao para proteger este momento.";if(!w.mentor.length)return"Peca ao Mentor Criativo uma alternativa para o refrao.";if(!w.audios.length)return"Adicione uma voz guia, demo ou referencia sonora.";if(!w.production.nextAction.trim())return"Defina a proxima acao de repertorio ou producao.";if(["lancado","pos-lancamento"].includes(w.release.status)&&!w.release.mainLink.trim())return"Informe o link principal do lancamento.";return"Compare uma versao antiga com a atual e escolha o proximo ajuste."}
function renderRevive(){const w=getActiveWork();if(!w)return;const days=Math.floor((Date.now()-new Date(w.updatedAt).getTime())/86400000);els.reviveText.textContent=(days>0?`Parada ha ${days} dia(s). `:"Em movimento. ")+getReviveAction(w)}
function applyReviveAction(){const w=getActiveWork();if(!w)return;addTimeline(w,`Acao sugerida: ${getReviveAction(w)}`);saveState();renderTimeline()}
async function generateMentor(){const w=getActiveWork();if(!w)return;const mode=els.mentorModeInput.value;const part=els.mentorSectionInput.value;const intent=els.mentorIntentInput.value.trim()||w.mood||"emocao principal";const base=lastLine(w.lyrics)||"a ideia ainda esta nascendo";const btn=els.generateMentorButton;if(btn){btn.disabled=true;btn.textContent="Gerando...";}els.mentorOutput.textContent="Maestro pensando...";try{const resp=await fetch('/api/maestro',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:'mentor',dados:{letra:w.lyrics||base,modo:mode,parte:part,intencao:intent}})});if(resp.ok){const data=await resp.json();const text=data.resultado||"";pendingMentorText=text;els.mentorOutput.textContent=text;w.mentor.unshift({id:createId(),mode,section:part,intent,text,createdAt:new Date().toISOString()});touchWork(w,"Mentor Criativo gerou sugestao com IA");renderSummary();renderMentorHistory();renderReadiness();}else{throw new Error("API indisponível");}}catch(e){// Fallback local se API indisponível
const genre=w.genre||"cancao brasileira";const key=w.key?` em ${w.key}`:"";let text="";if(mode==="new")text=`Tema: ${intent}\nGenero: ${genre}${key}\n\nVerso\nEu vi meu sonho acordar devagar\nMesmo no medo, eu continuei\nCada silencio me ensinou a cantar\nO que eu guardei, hoje entregarei\n\nRefrao\nVai clarear, vai florescer\nMinha voz encontra o caminho\nSe o mundo pesar, eu vou escrever\nUm novo sol dentro de mim`;else if(mode==="metric")text=metricAdvice(w.lyrics);else if(mode==="improve")text=`Sugestao para melhorar o ${part}:\nMantenha a ideia "${base}" e aumente contraste emocional.\n\nAlternativa:\nSe a noite tentar me calar\nEu canto mais alto pra vida ouvir\nO que nasceu pequeno no peito\nHoje aprendeu a existir`;else text=`Continuacao sugerida para o ${part}:\n${base}\nE se faltar coragem, eu lembro quem sou\nA minha verdade vira melodia\nNo passo imperfeito, o sonho chegou\nPra transformar saudade em poesia`;pendingMentorText=text;els.mentorOutput.textContent=text;w.mentor.unshift({id:createId(),mode,section:part,intent,text,createdAt:new Date().toISOString()});touchWork(w,"Mentor Criativo gerou sugestao");renderSummary();renderMentorHistory();renderReadiness();}finally{if(btn){btn.disabled=false;btn.textContent="Gerar sugestao";}}}
function metricAdvice(text){const lines=text.split("\n").filter(l=>l.trim());if(!lines.length)return"Ainda nao ha letra suficiente para analisar metrica.";const counts=lines.map(l=>l.trim().split(/\s+/).length);const avg=Math.round(counts.reduce((a,b)=>a+b,0)/counts.length);return`Analise simples de metrica:\nLinhas analisadas: ${lines.length}\nMedia de palavras por linha: ${avg}\nMapa: ${counts.join(" / ")}\n\nDirecao: mantenha versos proximos de ${avg} palavras para soar mais cantavel. Se uma linha fugir muito, divida em duas ou corte palavras fracas.`}
function applyMentor(){const w=getActiveWork();if(!w||!pendingMentorText.trim())return;w.lyrics=(w.lyrics.trim()?w.lyrics.trim()+"\n\n":"")+pendingMentorText;pendingMentorText="";touchWork(w,"Sugestao do Mentor aplicada a letra");render()}
function updateInternationalSettings(){const w=getActiveWork();if(!w)return;w.international.sourceLanguage=$("#sourceLanguageInput")?.value||w.international.sourceLanguage;w.international.targetLanguage=$("#targetLanguageInput")?.value||w.international.targetLanguage;w.international.targetMarket=$("#targetMarketInput")?.value||"";w.international.mode=$("#adaptationModeInput")?.value||w.international.mode;w.international.reviewText=$("#internationalReviewInput")?.value||"";w.updatedAt=new Date().toISOString();saveState();renderWorks()}
function generateInternationalAdaptation(){const w=getActiveWork();if(!w)return;updateInternationalSettings();const lines=w.lyrics.split("\n").map(l=>l.trim()).filter(Boolean);const source=lines.length?lines:firstSongLines(w);const lang=w.international.targetLanguage;const mode=w.international.mode;const market=w.international.targetMarket.trim()||marketForLanguage(lang);const btn=$("#generateInternationalButton");const out=$("#internationalOutput");if(btn){btn.disabled=true;btn.textContent="Traduzindo..."}if(out)out.textContent="Maestro está adaptando sua música para "+lang+"...";translateWithGemini(source.join("\n"),lang,mode,market,w.title).then(adapted=>{const score=scoreInternational(source,mode);w.international.targetMarket=market;w.international.draft={id:createId(),sourceLanguage:w.international.sourceLanguage,targetLanguage:lang,targetMarket:market,mode,source:source.join("\n"),adapted,score,createdAt:new Date().toISOString()};w.international.reviewText=adapted;touchWork(w,"Adaptacao internacional gerada para "+lang);renderInternational();renderReadiness();renderWorks()}).catch(err=>{if(out)out.textContent="Erro na tradução: "+err.message;}).finally(()=>{if(btn){btn.disabled=false;btn.textContent="Gerar adaptação"}})}
function firstSongLines(w){const base=[w.title,w.mood,w.genre].filter(Boolean).join(" ");return[base||"Minha musica nasceu para atravessar fronteiras","Eu transformo sentimento em melodia","Agora essa historia pode tocar outro pais"]}
function adaptInternationalLine(line,index,lang,mode,w){return line}
function scoreInternational(lines,mode){const qty=Math.max(lines.length,1);return{sentido:mode==="faithful"?96:88,emocao:mode==="emotional"?97:91,metrica:qty>1?92:86,rima:mode==="rhyme"?96:88,naturalidade:mode==="singable"?93:89,comercial:mode==="commercial"?97:90}}
function marketForLanguage(lang){return{ingles:"Estados Unidos / Reino Unido",espanhol:"Mexico / Espanha",frances:"Franca / Canada",italiano:"Italia",alemao:"Alemanha",japones:"Japao",coreano:"Coreia do Sul",arabe:"Oriente Medio",hindi:"India",mandarim:"China",russo:"Leste Europeu","portugues do Brasil":"Brasil"}[lang]||"Mercado internacional"}
function saveInternationalVersion(){const w=getActiveWork();if(!w?.international.draft){alert("Gere uma adaptacao antes de salvar.");return}const d=w.international.draft;const saved={...d,id:createId(),name:`${ADAPTATION_MODES[d.mode]||"Versao"} - ${d.targetLanguage}`,savedAt:new Date().toISOString()};w.international.versions.unshift(saved);w.international.selectedVersionId=saved.id;touchWork(w,`Versao internacional salva: ${saved.targetLanguage}`);renderInternational();renderReadiness();renderWorks()}
function markPlusInterest(){const w=getActiveWork();if(!w)return;w.international.plusInterest=true;touchWork(w,"Interesse registrado no Plano Plus internacional");renderInternational();renderTimeline()}
function getInternationalSelection(w){return w.international.versions.find(v=>v.id===w.international.selectedVersionId)||w.international.draft||w.international.versions[0]||null}
function generateInternationalClip(){const w=getActiveWork();if(!w)return;updateInternationalSettings();const v=getInternationalSelection(w);if(!v){alert("Gere e salve uma adaptacao internacional antes do clipe.");return}if(!w.international.reviewText.trim()){alert("Revise a versao internacional antes de gerar o clipe. Essa etapa evita erro cultural e deixa o pacote mais profissional.");$("#internationalReviewInput")?.focus();return}const reviewed=w.international.reviewText.trim();const lines=reviewed.split("\n").filter(Boolean);const scenes=(lines.length?lines:["Opening emotional image","Main chorus performance","Final cinematic frame"]).slice(0,6).map((line,i)=>({part:i===0?"Intro":i%3===0?"Refrao":"Verso",duration:i===0?"5s":"6s",prompt:`International videoclip for "${w.title}" in ${v.targetLanguage}. Market: ${v.targetMarket}. Reviewed lyric/context: ${line}. ${w.clip.style||"cinematic realistic"}, ${w.clip.location||"location aligned with the song"}, expressive performance, premium lighting, no text, no logos.`,caption:line}));w.international.reviewAcceptedAt=new Date().toISOString();w.international.clip={id:createId(),targetLanguage:v.targetLanguage,targetMarket:v.targetMarket,title:`${w.title} - ${v.targetLanguage} version`,description:`Videoclipe internacional preparado para ${v.targetMarket}. Versao ${ADAPTATION_MODES[v.mode]||v.mode}, revisada manualmente antes do roteiro visual.`,hashtags:["#music","#international","#videoclip",`#${slugify(v.targetLanguage)}`,`#${slugify(v.targetMarket)}`],reviewText:reviewed,reviewAcceptedAt:w.international.reviewAcceptedAt,scenes,createdAt:new Date().toISOString()};touchWork(w,`Videoclipe internacional gerado para ${v.targetLanguage} apos revisao humana`);renderInternationalClip();renderReadiness();renderWorks()}
function markPrimeInterest(){const w=getActiveWork();if(!w)return;w.international.primeInterest=true;touchWork(w,"Interesse registrado no Plano Prime de videoclipe internacional");renderInternationalClip();renderTimeline()}
function renderInternational(){const w=getActiveWork();if(!w||!$("#internationalOutput"))return;$("#sourceLanguageInput").value=w.international.sourceLanguage;$("#targetLanguageInput").value=w.international.targetLanguage;$("#targetMarketInput").value=w.international.targetMarket;$("#adaptationModeInput").value=w.international.mode;const draft=w.international.draft;$("#internationalOutput").textContent=draft?`${draft.name||"Rascunho internacional"}\nIdioma: ${draft.targetLanguage}\nMercado: ${draft.targetMarket}\nModo: ${ADAPTATION_MODES[draft.mode]||draft.mode}\n\n${draft.adapted}`:"Escolha idioma, mercado e modo para gerar uma versao internacional.";if(draft&&!w.international.reviewText)w.international.reviewText=draft.adapted;if($("#internationalReviewInput"))$("#internationalReviewInput").value=w.international.reviewText||"";$("#internationalScore").innerHTML=draft?Object.entries(draft.score).map(([k,v])=>`<span class="check-item done">${esc(k)} ${Number(v)}%</span>`).join(""):"";$("#plusOfferBox")?.classList.toggle("done",w.international.plusInterest);$("#internationalVersionsList").innerHTML=w.international.versions.length?"":'<div class="phrase-card"><p>Nenhuma versao internacional salva.</p></div>';w.international.versions.forEach(v=>{const d=document.createElement("div");d.className="version-card";d.innerHTML=`<div><strong>${esc(v.name)}</strong><p>${esc(v.targetMarket)} - ${formatDate(v.savedAt||v.createdAt)}</p></div><button class="small-action" type="button">${w.international.selectedVersionId===v.id?"Selecionada":"Selecionar"}</button>`;d.querySelector("button").addEventListener("click",()=>{w.international.selectedVersionId=v.id;w.international.reviewText=v.adapted||w.international.reviewText;touchWork(w,`Versao internacional selecionada: ${v.targetLanguage}`);renderInternational();renderInternationalClip()});$("#internationalVersionsList").appendChild(d)})}
function renderInternationalClip(){const w=getActiveWork();if(!w||!$("#internationalClipOutput"))return;$("#primeOfferBox")?.classList.toggle("done",w.international.primeInterest);const c=w.international.clip;if(!c){$("#internationalClipOutput").textContent="Gere uma adaptacao internacional, revise o texto e crie o clipe para o mercado escolhido.";return}$("#internationalClipOutput").textContent=`${c.title}\nMercado: ${c.targetMarket}\nDescricao: ${c.description}\nHashtags: ${c.hashtags.join(" ")}\nRevisao humana: ${c.reviewAcceptedAt?formatDate(c.reviewAcceptedAt):"pendente"}\n\n${c.scenes.map((s,i)=>`${i+1}. ${s.part} ${s.duration}\n${s.caption}\n${s.prompt}`).join("\n\n")}`}
function setCreativePath(path){const w=getActiveWork();if(!w)return;w.commercial.path=path;evaluateCommercialProfile(w);touchWork(w,path==="professional"?"Origem marcada: compositor profissional":"Origem marcada: criador assistido");renderCommercialPanel();renderReadiness();renderWorks()}
function toggleOriginMaterial(key,checked){const w=getActiveWork();if(!w)return;w.commercial.materials[key]=checked;if(checked&&w.commercial.path==="unknown")w.commercial.path="professional";evaluateCommercialProfile(w);w.updatedAt=new Date().toISOString();saveState();renderCommercialPanel();renderReadiness();renderWorks()}
function evaluateCommercialProfile(w){const m=w.commercial.materials||{};let score=0;if((w.lyrics||"").trim().length>80||m.lyrics)score+=20;if(m.chorus)score+=15;if(m.melody||w.audios.length)score+=25;if(m.harmony||w.chords.trim()||w.key.trim())score+=20;if(m.recording)score+=10;if(m.direction||w.genre.trim()||w.mood.trim()||w.references.trim())score+=10;w.commercial.score=Math.min(100,score);if(w.commercial.path==="assisted"&&score<30){w.commercial.profile="criador assistido";w.commercial.rights="50/50 na exploracao economica apos aceite"}else if(score>=30||w.commercial.path==="professional"){w.commercial.profile="compositor profissional";w.commercial.rights="100% do usuario na obra autoral enviada"}else{w.commercial.profile="indefinido";w.commercial.rights="preencha a origem criativa"}return w.commercial}
function acceptAwarenessTerm(){const w=getActiveWork();if(!w)return;w.commercial.awarenessAcceptedAt=new Date().toISOString();w.commercial.events.unshift({id:createId(),type:"awareness",label:"Usuario aceitou ciencia: Caderno Vivo nao e cartorio nem orgao oficial",at:w.commercial.awarenessAcceptedAt});touchWork(w,"Termo de ciencia aceito");renderCommercialPanel();renderTimeline()}
function acceptRevenueShareTerm(){const w=getActiveWork();if(!w)return;evaluateCommercialProfile(w);if(w.commercial.profile!=="criador assistido"){alert("A regra 50/50 se aplica apenas ao criador assistido.");return}w.commercial.revenueShareAcceptedAt=new Date().toISOString();w.commercial.events.unshift({id:createId(),type:"revenue-share",label:"Usuario aceitou participacao economica 50/50 para criacao assistida",at:w.commercial.revenueShareAcceptedAt});touchWork(w,"Termo 50/50 da criacao assistida aceito");renderCommercialPanel();renderTimeline()}
function pickSmartOffer(w){evaluateCommercialProfile(w);if(state.works.length>=10)return"limit";if(w.clip.renderedAt||w.clip.scenes.some(s=>s.takeUrl)||w.international.clip)return"clip";if(w.international.draft||w.international.versions.length)return"global";if(w.protection.authors.length||w.protection.dossier)return"dossier";if(w.commercial.profile==="criador assistido"&&w.commercial.score>=20)return"professional";if(w.versions.length||w.lyrics.trim().length>180)return"professional";if(state.works.length>=5)return"essential";return""}
function renderCommercialPanel(){const w=getActiveWork();if(!w||!$("#profileSummary"))return;evaluateCommercialProfile(w);document.querySelectorAll("[data-origin]").forEach(i=>{i.checked=Boolean(w.commercial.materials[i.dataset.origin])});const profileLabel=w.commercial.profile==="compositor profissional"?"Compositor profissional":w.commercial.profile==="criador assistido"?"Criador assistido":"Indefinido";const entitlementCount=w.commercial.entitlements.filter(e=>e.active&&e.source==="backend").length;$("#profileSummary").innerHTML=`<div><strong>${profileLabel}</strong><p>Base autoral identificada: ${w.commercial.score}%. Regra: ${esc(w.commercial.rights||"preencha a origem criativa")}.</p></div><div class="badge-row"><span class="badge">${w.commercial.awarenessAcceptedAt?"ciencia aceita":"ciencia pendente"}</span><span class="badge">${w.commercial.revenueShareAcceptedAt?"50/50 aceito":"50/50 pendente"}</span><span class="badge">${entitlementCount?`${entitlementCount} entitlement backend`:"sem entitlement backend"}</span></div>`;$("#legalNoticeBox").innerHTML=`<strong>Transparencia juridica</strong><p>${LEGAL_NOTICE}</p><p>${PREMIUM_SECURITY_NOTICE}</p>${w.commercial.profile==="criador assistido"?`<p>${REVENUE_SHARE_NOTICE}</p>`:""}`;const offerKey=w.commercial.lastOfferKey||pickSmartOffer(w);if(!offerKey){$("#smartOfferBox").innerHTML="<strong>Fluxo sem oferta ativa</strong><p>Continue preenchendo a obra. O destravamento aparece apenas quando houver valor claro para o usuario.</p>";return}const offer=OFFER_CATALOG[offerKey]||OFFER_CATALOG.professional;w.commercial.lastOfferKey=offerKey;w.commercial.lastOfferAt=w.commercial.lastOfferAt||new Date().toISOString();const unlocked=hasUnlockedOffer(w,[offerKey]);$("#smartOfferBox").innerHTML=`<strong>${esc(offer.title)}</strong><p>${esc(offer.text)}</p><p>${unlocked?"Entitlement backend ativo para este recurso.":"Clique registra interesse; liberacao real depende de pagamento confirmado no backend."}</p><div class="badge-row"><span class="badge">${esc(offer.product)}</span><button class="primary-action compact" type="button" data-offer-action="accept">${esc(offer.button)}</button><button class="small-action" type="button" data-offer-action="dismiss">Agora nao</button></div>`}
function acceptSmartOffer(){const w=getActiveWork();if(!w)return;const key=w.commercial.lastOfferKey||pickSmartOffer(w);const offer=OFFER_CATALOG[key];if(!offer)return;w.commercial.events.unshift({id:createId(),type:"offer-interest",label:`Interesse registrado: ${offer.product}`,offer:key,at:new Date().toISOString()});touchWork(w,`Interesse registrado: ${offer.product}`);renderCommercialPanel();renderTimeline()}
function dismissSmartOffer(){const w=getActiveWork();if(!w)return;const key=w.commercial.lastOfferKey||pickSmartOffer(w);if(!OFFER_CATALOG[key])return;w.commercial.dismissedOffers.push({key,at:new Date().toISOString()});touchWork(w,`Oferta adiada: ${OFFER_CATALOG[key].product}`);renderCommercialPanel();renderTimeline()}
function hasUnlockedOffer(w,keys){const aliases={professional:["professional","dossier"],dossier:["dossier","professional"],clip:["clip","prime"],global:["global","plus"],limit:["limit","essential"],essential:["essential","limit"]};const wanted=new Set(keys.flatMap(k=>aliases[k]||[k]));return w.commercial.entitlements.some(e=>e.active&&e.source==="backend"&&wanted.has(e.product))}
function requireUnlock(w,key,message){if(hasUnlockedOffer(w,[key]))return true;w.commercial.lastOfferKey=key;w.commercial.lastOfferAt=new Date().toISOString();w.commercial.events.unshift({id:createId(),type:"secure-entitlement-required",label:`Entitlement backend exigido: ${key}`,offer:key,at:new Date().toISOString()});saveState();renderCommercialPanel();alert(`${message||"Este recurso faz parte de um pacote premium."}\n\n${PREMIUM_SECURITY_NOTICE}`);return false}
function addPhrase(){const text=els.phraseInput.value.trim();if(!text){els.phraseInput.focus();return}state.phrases.unshift({id:createId(),text,createdAt:new Date().toISOString()});els.phraseInput.value="";saveState();render()}
function phraseToWork(id){const p=state.phrases.find(i=>i.id===id);if(!p)return;createWork();const w=getActiveWork();w.title=firstLine(p.text)||"Nova obra";w.lyrics=p.text;touchWork(w,"Obra criada a partir do Cofre de Frases");render()}
function removePhrase(id){state.phrases=state.phrases.filter(p=>p.id!==id);saveState();render()}
function addAuthor(){const w=getActiveWork();if(!w)return;const name=els.authorNameInput.value.trim();const share=Number(els.authorShareInput.value||0);if(!name||share<=0){els.authorNameInput.focus();return}const total=w.protection.authors.reduce((t,a)=>t+Number(a.share||0),0);if(total+share>100){alert("A soma das participacoes nao pode passar de 100%.");els.authorShareInput.focus();return}w.protection.authors.push({id:createId(),name,role:els.authorRoleInput.value,share,createdAt:new Date().toISOString()});els.authorNameInput.value="";els.authorShareInput.value="";touchWork(w,"Autor ou titular adicionado");render()}
function removeAuthor(id){const w=getActiveWork();if(!w)return;w.protection.authors=w.protection.authors.filter(a=>a.id!==id);touchWork(w,"Autor removido");render()}
function toggleProtectionItem(group,item){const w=getActiveWork();const target=group==="collection"?w.protection.collection:w.protection.checklist;target[item]=!target[item];touchWork(w,`${item}: ${target[item]?"marcado":"desmarcado"}`);renderProtection();renderReadiness()}
function toggleProductionItem(item){const w=getActiveWork();if(!w)return;w.production.checklist[item]=!w.production.checklist[item];touchWork(w,`Producao - ${item}: ${w.production.checklist[item]?"marcado":"desmarcado"}`);renderProduction();renderReadiness();renderSummary()}
function toggleReleaseItem(item){const w=getActiveWork();if(!w)return;w.release.checklist[item]=!w.release.checklist[item];touchWork(w,`Lancamento - ${item}: ${w.release.checklist[item]?"marcado":"desmarcado"}`);renderRelease();renderReadiness();renderSummary()}
function toggleSecurityItem(item){const w=getActiveWork();if(!w)return;w.security.checklist[item]=!w.security.checklist[item];w.security.lastAuditAt=new Date().toISOString();touchWork(w,`Seguranca - ${item}: ${w.security.checklist[item]?"marcado":"pendente"}`);renderSecurity();renderReadiness()}
function getSecurityAudit(w){const checks=w.security?.checklist||{};const done=SECURITY_ITEMS.filter(i=>checks[i]).length;const localOnly=!(checks["Permissao premium validada no backend"]&&checks["Dossie servido pelo servidor"]&&checks["Pagamento confirmado por webhook"]);const sensitive=[w.lyrics,w.chords,w.references,w.protection.authors.map(a=>a.name).join(" "),w.release.code,w.release.mainLink].join(" ").trim();const hasSensitive=Boolean(sensitive);const risk=localOnly?"alto":done<SECURITY_ITEMS.length?"medio":"baixo";return{done,total:SECURITY_ITEMS.length,percent:Math.round(done/SECURITY_ITEMS.length*100),risk,localOnly,hasSensitive}}
async function generateDossier(){const w=getActiveWork();if(!w)return;evaluateCommercialProfile(w);const total=w.protection.authors.reduce((t,a)=>t+Number(a.share||0),0);if(!hasUnlockedOffer(w,["professional","dossier"])){w.commercial.lastOfferKey="dossier";renderCommercialPanel();els.dossierStatus.textContent="O dossie completo faz parte do Pacote Profissional da Obra. Desbloqueie para gerar o relatorio.";return}if(!w.commercial.awarenessAcceptedAt){els.dossierStatus.textContent="Aceite o termo de ciencia antes de gerar o dossie: o Caderno Vivo nao e cartorio nem orgao oficial.";renderCommercialPanel();return}if(w.commercial.profile==="criador assistido"&&!w.commercial.revenueShareAcceptedAt){els.dossierStatus.textContent="Para criacao assistida, aceite o termo 50/50 antes de profissionalizar ou monetizar a obra.";renderCommercialPanel();return}if(!w.protection.authors.length){els.dossierStatus.textContent="Adicione ao menos um autor ou titular antes de gerar o dossie.";els.authorNameInput.focus();return}if(Math.abs(total-100)>0.01){els.dossierStatus.textContent=`Revise as participacoes: o total atual e ${total}%.`;els.authorShareInput.focus();return}try{els.dossierStatus.textContent="Gerando dossie...";const d=buildDossier(w);const hash=await sha256(JSON.stringify(d));w.protection.dossier={id:createId(),generatedAt:new Date().toISOString(),hash,data:d};w.protection.checklist["Dossie Criativo gerado"]=true;touchWork(w,"Dossie Criativo gerado");render()}catch(error){els.dossierStatus.textContent="Nao foi possivel gerar o dossie. Revise os dados da obra.";console.error("Falha ao gerar dossie",error)}}
function buildDossier(w){evaluateCommercialProfile(w);return{title:w.title,status:w.status,key:w.key,bpm:w.bpm,genre:w.genre,mood:w.mood,tags:w.tags,lyrics:w.lyrics,chords:w.chords,references:w.references,commercial:{profile:w.commercial.profile,score:w.commercial.score,path:w.commercial.path,rights:w.commercial.rights,materials:w.commercial.materials,legalNotice:LEGAL_NOTICE,premiumSecurityNotice:PREMIUM_SECURITY_NOTICE,revenueShareNotice:w.commercial.profile==="criador assistido"?REVENUE_SHARE_NOTICE:"",awarenessAcceptedAt:w.commercial.awarenessAcceptedAt,revenueShareAcceptedAt:w.commercial.revenueShareAcceptedAt,entitlements:w.commercial.entitlements.map(({product,source,active,createdAt,expiresAt,paymentId})=>({product,source,active,createdAt,expiresAt,paymentId})),events:w.commercial.events.map(({type,label,at,offer})=>({type,label,at,offer}))},security:{notice:SECURITY_NOTICE,audit:getSecurityAudit(w),checklist:w.security.checklist,lastAuditAt:w.security.lastAuditAt},production:{stage:w.production.stage,priority:w.production.priority,targetDate:w.production.targetDate,nextAction:w.production.nextAction,checklist:w.production.checklist},release:{status:w.release.status,date:w.release.date,distributor:w.release.distributor,code:w.release.code,mainLink:w.release.mainLink,campaignAction:w.release.campaignAction,checklist:w.release.checklist},clip:{concept:w.clip.concept,format:w.clip.format,style:w.clip.style,palette:w.clip.palette,reference:w.clip.reference,persona:w.clip.persona,location:w.clip.location,mood:w.clip.mood,provider:w.clip.provider,nextAction:w.clip.nextAction,coverPrompt:w.clip.coverPrompt,finalVideo:w.clip.finalVideo,montageNotes:w.clip.montageNotes,exportPreset:w.clip.exportPreset,exportQuality:w.clip.exportQuality,exportSceneSeconds:w.clip.exportSceneSeconds,exportFileName:w.clip.exportFileName,exportCaption:w.clip.exportCaption,renderedAt:w.clip.renderedAt,renderedFormat:w.clip.renderedFormat,mp4RenderedAt:w.clip.mp4RenderedAt,mp4File:w.clip.mp4File,checklist:w.clip.checklist,scenes:w.clip.scenes.map(({part,duration,shot,status,prompt,imagePrompt,storyboard,takeUrl,assetNotes})=>({part,duration,shot,status,prompt,imagePrompt,storyboard,takeUrl,assetNotes}))},international:{sourceLanguage:w.international.sourceLanguage,targetLanguage:w.international.targetLanguage,targetMarket:w.international.targetMarket,mode:w.international.mode,reviewText:w.international.reviewText,reviewAcceptedAt:w.international.reviewAcceptedAt,plusInterest:w.international.plusInterest,primeInterest:w.international.primeInterest,draft:w.international.draft,versions:w.international.versions,clip:w.international.clip},authors:w.protection.authors.map(({id,...a})=>a),authorShareTotal:w.protection.authors.reduce((t,a)=>t+Number(a.share||0),0),blocks:w.blocks.map(({name,notes})=>({name,notes})),versions:w.versions.map(({name,lyrics,chords,at})=>({name,lyrics,chords,at})),audios:w.audios.map(({type,name,link,fileName,fileType,createdAt})=>({type,name,link,fileName,fileType,createdAt})),mentor:w.mentor.map(({mode,section,intent,text,createdAt})=>({mode,section,intent,text,createdAt})),timeline:w.timeline.map(({label,at})=>({label,at})),protectionChecklist:w.protection.checklist,collectionChecklist:w.protection.collection,createdAt:w.createdAt,updatedAt:w.updatedAt}}
function exportDossier(){const w=getActiveWork();if(!w?.protection.dossier){alert("Gere o dossie antes de exportar.");return}downloadJson(`${slugify(w.title)}-dossie-criativo.json`,w.protection.dossier)}
async function sha256(text){const c=globalThis.crypto;if(c?.subtle){const bytes=new TextEncoder().encode(text);const digest=await c.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("")}let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)}return`local-${(hash>>>0).toString(16).padStart(8,"0")}`}
function exportBackup(){downloadJson("caderno-vivo-backup.json",{exportedAt:new Date().toISOString(),product:"Caderno Vivo",version:7,data:state})}
function importBackup(e){const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(String(r.result));const data=parsed.data||parsed;if(!Array.isArray(data.works)||!Array.isArray(data.phrases))throw new Error();state.works=data.works.map(normalizeWork);state.phrases=data.phrases;activeWorkId=state.works[0]?.id||null;saveState();render();alert("Backup importado com sucesso.")}catch{alert("Nao foi possivel importar este arquivo.")}finally{els.importFileInput.value=""}};r.readAsText(file)}
function downloadJson(filename,payload){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
function render(){renderSummary();renderWorks();renderEditor();renderPhrases()}
function renderSummary(){els.totalWorks.textContent=state.works.length;els.totalPhrases.textContent=state.phrases.length;els.totalVersions.textContent=state.works.reduce((t,w)=>t+w.versions.length,0);els.totalAudios.textContent=state.works.reduce((t,w)=>t+w.audios.length,0);els.totalDossiers.textContent=state.works.filter(w=>w.protection.dossier).length;els.totalMentor.textContent=state.works.reduce((t,w)=>t+w.mentor.length,0);els.totalProductionReady.textContent=state.works.filter(w=>["pronta para guia","em producao","gravada","lancada"].includes(w.production.stage)).length;els.totalLaunchReady.textContent=state.works.filter(w=>["em distribuicao","pre-save","lancado","pos-lancamento"].includes(w.release.status)).length;els.totalClipPlans.textContent=state.works.filter(w=>w.clip.concept.trim()||w.clip.scenes.length).length;if($("#totalRenderedClips"))$("#totalRenderedClips").textContent=state.works.filter(w=>w.clip.renderedAt).length}
function renderWorks(){const q=els.searchInput.value.trim().toLowerCase();const works=state.works.filter(w=>(activeStatus==="todas"||w.status===activeStatus)&&[w.title,w.tags,w.lyrics,w.genre,w.mood,w.production.stage,w.production.priority,w.production.nextAction,w.release.status,w.release.distributor,w.release.campaignAction,w.release.mainLink,w.clip.concept,w.clip.format,w.clip.style,w.clip.palette,w.clip.location,w.clip.nextAction,w.clip.coverPrompt,w.clip.finalVideo,w.clip.montageNotes,w.international.targetLanguage,w.international.targetMarket,w.international.draft?.adapted,w.international.versions.map(v=>`${v.targetLanguage} ${v.targetMarket} ${v.adapted}`).join(" "),w.international.clip?.description,w.international.clip?.hashtags?.join(" "),w.clip.scenes.map(s=>`${s.part} ${s.prompt} ${s.imagePrompt} ${s.storyboard} ${s.takeUrl} ${s.assetNotes}`).join(" ")].join(" ").toLowerCase().includes(q));els.worksList.innerHTML="";if(!works.length){els.worksList.innerHTML='<div class="phrase-card"><p>Nenhuma obra encontrada.</p></div>';return}works.forEach(w=>{const b=document.createElement("button");b.type="button";b.className=`work-card ${w.id===activeWorkId?"active":""}`;b.innerHTML=`<h3>${esc(w.title)}</h3><p>${esc(w.genre||"Genero nao definido")}</p><div class="badge-row"><span class="badge">${esc(w.status)}</span><span class="badge">${esc(w.production.stage)}</span><span class="badge">${esc(w.release.status)}</span><span class="badge">${esc(w.production.priority)}</span>${w.clip.scenes.length?`<span class="badge">${w.clip.scenes.length} cenas</span>`:""}${w.international.versions.length?`<span class="badge">${w.international.versions.length} intl</span>`:""}${w.international.clip?'<span class="badge">clipe intl</span>':""}${w.clip.scenes.some(s=>s.takeUrl)?'<span class="badge">takes</span>':""}${w.versions.length?`<span class="badge">${w.versions.length} versoes</span>`:""}${w.mentor.length?`<span class="badge">${w.mentor.length} sugestoes</span>`:""}</div>`;b.addEventListener("click",()=>{activeWorkId=w.id;renderEditor();renderWorks()});els.worksList.appendChild(b)})}
function renderEditor(){const w=getActiveWork();const has=Boolean(w);els.emptyState.classList.toggle("hidden",has);els.workForm.classList.toggle("hidden",!has);if(!w)return;els.titleInput.value=w.title;els.statusInput.value=w.status;els.keyInput.value=w.key;els.bpmInput.value=w.bpm;els.genreInput.value=w.genre;els.moodInput.value=w.mood;els.tagsInput.value=w.tags;els.lyricsInput.value=w.lyrics;els.chordsInput.value=w.chords;els.referencesInput.value=w.references;els.productionStageInput.value=w.production.stage;els.priorityInput.value=w.production.priority;els.targetDateInput.value=w.production.targetDate;els.nextActionInput.value=w.production.nextAction;els.releaseStatusInput.value=w.release.status;els.releaseDateInput.value=w.release.date;els.distributorInput.value=w.release.distributor;els.releaseCodeInput.value=w.release.code;els.mainLinkInput.value=w.release.mainLink;els.campaignActionInput.value=w.release.campaignAction;els.clipConceptInput.value=w.clip.concept;els.clipFormatInput.value=w.clip.format;els.clipStyleInput.value=w.clip.style;els.clipPaletteInput.value=w.clip.palette;els.clipReferenceInput.value=w.clip.reference;els.clipPersonaInput.value=w.clip.persona;els.clipLocationInput.value=w.clip.location;els.clipMoodInput.value=w.clip.mood;els.clipProviderInput.value=w.clip.provider;els.clipNextActionInput.value=w.clip.nextAction;els.clipCoverPromptInput.value=w.clip.coverPrompt;els.clipFinalVideoInput.value=w.clip.finalVideo;els.clipMontageNotesInput.value=w.clip.montageNotes;renderReadiness();renderCommercialPanel();renderSecurity();renderProduction();renderRelease();renderClip();renderInternational();renderInternationalClip();renderExportPanel();renderRevive();renderAudios();renderBlocks();renderVersions();renderCompareOptions();renderSessions();renderMentorHistory();renderProtection();renderTimeline()}
function getReadiness(w){evaluateCommercialProfile(w);const sec=getSecurityAudit(w);const items=[['Titulo definido',w.title&&w.title!=="Nova obra"&&w.title!=="Sem titulo"],['Letra ou ideia escrita',w.lyrics.trim()],['Origem criativa classificada',w.commercial.profile!=="indefinido"],['Ciencia juridica aceita',w.commercial.awarenessAcceptedAt],['Regra 50/50 aceita se assistido',w.commercial.profile!=="criador assistido"||w.commercial.revenueShareAcceptedAt],['Auditoria de seguranca iniciada',sec.done>0],['Seguranca critica mapeada',sec.done>=3],['Tom informado',w.key.trim()],['BPM informado',String(w.bpm).trim()],['Cifra adicionada',w.chords.trim()],['Blocos organizados',w.blocks.some(b=>b.notes.trim())],['Versao salva',w.versions.length],['Audio ou instrumental',w.audios.length],['Mentor usado',w.mentor.length],['Versao internacional',w.international.versions.length],['Revisao humana internacional',w.international.reviewAcceptedAt],['Oferta Plus apresentada',w.international.plusInterest],['Clipe internacional',w.international.clip],['Oferta Prime apresentada',w.international.primeInterest],['Autor definido',w.protection.authors.length],['Dossie gerado',w.protection.dossier],['Proxima acao definida',w.production.nextAction.trim()],['Pre-producao iniciada',Object.values(w.production.checklist).some(Boolean)],['Lancamento planejado',w.release.status!=="nao planejado"],['Campanha definida',w.release.campaignAction.trim()],['Link de lancamento informado',w.release.mainLink.trim()],['Conceito de clipe definido',w.clip.concept.trim()],['Roteiro de clipe iniciado',w.clip.scenes.length],['Prompt visual aprovado',w.clip.scenes.some(s=>String(s.prompt||"").trim())&&w.clip.checklist["Prompts revisados"]],['Storyboard visual criado',w.clip.coverPrompt.trim()&&w.clip.scenes.some(s=>String(s.imagePrompt||"").trim())],['Takes catalogados',w.clip.scenes.some(s=>String(s.takeUrl||"").trim())],['Montagem planejada',w.clip.montageNotes.trim()],['Corte final localizado',w.clip.finalVideo.trim()],['Video renderizado',w.clip.renderedAt],['MP4 profissional',w.clip.mp4RenderedAt]];const done=items.filter(i=>i[1]).length;return{items:items.map(([label,ok])=>({label,ok:Boolean(ok)})),percent:Math.round(done/items.length*100)}}
function renderReadiness(){const w=getActiveWork();if(!w)return;const r=getReadiness(w);els.readinessPercent.textContent=`${r.percent}%`;els.readinessBar.style.width=`${r.percent}%`;els.readinessList.innerHTML=r.items.map(i=>`<span class="check-item ${i.ok?"done":""}">${i.ok?"ok":"-"} ${esc(i.label)}</span>`).join("")}
function renderProduction(){const w=getActiveWork();if(!w)return;els.productionChecklist.innerHTML=PRODUCTION_ITEMS.map(i=>checkItem("production",i,Boolean(w.production.checklist[i]))).join("");els.productionChecklist.querySelectorAll("input").forEach(i=>i.addEventListener("change",()=>toggleProductionItem(i.value)))}
function renderRelease(){const w=getActiveWork();if(!w)return;els.releaseChecklist.innerHTML=RELEASE_ITEMS.map(i=>checkItem("release",i,Boolean(w.release.checklist[i]))).join("");els.releaseChecklist.querySelectorAll("input").forEach(i=>i.addEventListener("change",()=>toggleReleaseItem(i.value)))}
function renderClip(){const w=getActiveWork();if(!w)return;els.clipChecklist.innerHTML=CLIP_ITEMS.map(i=>checkItem("clip",i,Boolean(w.clip.checklist[i]))).join("");els.clipChecklist.querySelectorAll("input").forEach(i=>i.addEventListener("change",()=>toggleClipItem(i.value)));els.clipScenesList.innerHTML=w.clip.scenes.length?"":'<div class="phrase-card"><p>Nenhuma cena criada. Gere um roteiro para transformar a letra em takes curtos.</p></div>';w.clip.scenes.forEach(s=>{const d=document.createElement("div");d.className="clip-scene-card";d.innerHTML=`<div class="clip-scene-grid"><input data-field="part" value="${attr(s.part)}" placeholder="Parte"><input data-field="duration" value="${attr(s.duration)}" placeholder="6s"><input data-field="shot" value="${attr(s.shot)}" placeholder="Plano/camera"><select data-field="status"><option>planejada</option><option>prompt aprovado</option><option>storyboard pronto</option><option>take gerado</option><option>revisar</option><option>montado</option></select></div><div class="clip-scene-assets"><label class="field"><span>Prompt de video</span><textarea class="clip-scene-prompt" data-field="prompt" rows="4">${esc(s.prompt||"")}</textarea></label><label class="field"><span>Prompt de imagem/storyboard</span><textarea class="clip-image-prompt" data-field="imagePrompt" rows="4">${esc(s.imagePrompt||"")}</textarea></label><label class="field"><span>Link do take</span><input data-field="takeUrl" value="${attr(s.takeUrl||"")}" placeholder="URL do take gerado"></label><label class="field"><span>Notas do asset</span><input data-field="assetNotes" value="${attr(s.assetNotes||"")}" placeholder="versao, problema, ajuste"></label>
<label class="field"><span>📸 Foto da cena (aparece no clipe)</span>
<input type="file" accept="image/*" class="clip-scene-photo-input" data-scene-id="${s.id}" style="font-size:12px">
${s.imageUrl?`<img src="${s.imageUrl}" style="width:100%;max-height:80px;object-fit:cover;border-radius:6px;margin-top:4px;opacity:.8" alt="foto da cena">`:""}
<input type="url" data-field="imageUrl" value="${attr(s.imageUrl||"")}" placeholder="ou cole URL de imagem/Pexels" style="margin-top:4px;font-size:12px">
</label></div><textarea data-field="storyboard" rows="2" placeholder="Descricao do quadro de storyboard">${esc(s.storyboard||"")}</textarea><pre class="clip-prompt-preview">${esc(s.prompt||"")}</pre><div class="badge-row">
  <button class="small-action" type="button" data-action="remove">Remover cena</button>
  <button class="ghost-button" style="font-size:12px;padding:5px 10px" type="button" data-action="gerar-img">🎨 Gerar imagem</button>
</div>`;d.querySelector('select[data-field="status"]').value=s.status||"planejada";d.querySelectorAll("[data-field]").forEach(input=>input.addEventListener("input",()=>updateClipScene(s.id,input.dataset.field,input.value)));d.querySelector('[data-action="remove"]').addEventListener("click",()=>removeClipScene(s.id));
// Listener para gerar imagem da cena
const btnGerarImg = d.querySelector('[data-action="gerar-img"]');
if(btnGerarImg) btnGerarImg.addEventListener("click", () => gerarImagemCena(s.id, btnGerarImg));
// Listener para upload de foto da cena
const photoInput=d.querySelector('.clip-scene-photo-input');
if(photoInput){
  photoInput.addEventListener('change',e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      updateClipScene(s.id,'imageUrl',ev.target.result);
      // Mostrar preview imediato
      const existing=photoInput.parentElement.querySelector('img');
      if(existing){existing.src=ev.target.result;}
      else{
        const img=document.createElement('img');
        img.src=ev.target.result;
        img.style.cssText='width:100%;max-height:80px;object-fit:cover;border-radius:6px;margin-top:4px;opacity:.8';
        photoInput.parentElement.insertBefore(img,photoInput.nextSibling);
      }
    };
    reader.readAsDataURL(file);
  });
}
els.clipScenesList.appendChild(d)})}
function renderAudios(){const w=getActiveWork();els.audioList.innerHTML="";if(!w.audios.length){els.audioList.innerHTML='<div class="audio-chip"><span>Nenhum audio catalogado.</span></div>';return}w.audios.forEach(a=>{const div=document.createElement("div");div.className="audio-chip";const src=a.dataUrl||a.link;div.innerHTML=`<div class="audio-meta"><strong>${esc(a.name)}</strong><span class="badge">${esc(a.type)}</span></div>${src?`<audio controls src="${attr(src)}"></audio>`:"<p>Sem arquivo/link tocavel.</p>"}<button class="small-action" type="button">Remover</button>`;div.querySelector("button").addEventListener("click",()=>removeAudio(a.id));els.audioList.appendChild(div)})}
function renderBlocks(){const w=getActiveWork();els.blocksList.innerHTML="";w.blocks.forEach(b=>{const div=document.createElement("div");div.className="block-card";div.innerHTML=`<input value="${attr(b.name)}"><textarea rows="3">${esc(b.notes||"")}</textarea><button class="small-action" type="button">Remover</button>`;const i=div.querySelector("input"),t=div.querySelector("textarea");i.addEventListener("input",()=>updateBlock(b.id,"name",i.value));t.addEventListener("input",()=>updateBlock(b.id,"notes",t.value));div.querySelector("button").addEventListener("click",()=>removeBlock(b.id));els.blocksList.appendChild(div)})}
function renderVersions(){const w=getActiveWork();els.versionsList.innerHTML=w.versions.length?"":'<div class="phrase-card"><p>Nenhuma versao salva.</p></div>';w.versions.forEach(v=>{const d=document.createElement("div");d.className="version-card";d.innerHTML=`<div><strong>${esc(v.name)}</strong><p>${formatDate(v.at)} - ${esc(firstLine(v.lyrics)||"Sem trecho")}</p></div><button class="small-action" type="button">Restaurar</button>`;d.querySelector("button").addEventListener("click",()=>restoreVersion(v.id));els.versionsList.appendChild(d)})}
function renderCompareOptions(){const w=getActiveWork();const opts=[{id:"current",name:"Atual"},...w.versions.map(v=>({id:v.id,name:v.name}))];els.compareAInput.innerHTML=opts.map(o=>`<option value="${attr(o.id)}">${esc(o.name)}</option>`).join("");els.compareBInput.innerHTML=els.compareAInput.innerHTML;if(opts[1])els.compareBInput.value=opts[1].id}
function compareVersions(){const w=getActiveWork();const a=getVersionSource(w,els.compareAInput.value),b=getVersionSource(w,els.compareBInput.value);if(!a||!b){els.compareResult.innerHTML="<p>Salve ao menos uma versao.</p>";return}els.compareResult.innerHTML=`<div class="compare-card"><strong>${esc(a.name)}</strong><pre>${esc(a.lyrics||"Sem letra")}</pre></div><div class="compare-card"><strong>${esc(b.name)}</strong><pre>${esc(b.lyrics||"Sem letra")}</pre></div>`;addTimeline(w,`Comparacao aberta: ${a.name} x ${b.name}`);saveState();renderTimeline()}
function getVersionSource(w,id){return id==="current"?{id,name:"Atual",lyrics:w.lyrics,chords:w.chords}:w.versions.find(v=>v.id===id)}
function renderSessions(){const w=getActiveWork();els.sessionList.innerHTML=w.sessions.length?"":'<div class="phrase-card"><p>Nenhuma sessao iniciada.</p></div>';w.sessions.slice(0,3).forEach(s=>{const d=document.createElement("div");d.className="session-card";d.innerHTML=`<strong>${formatDate(s.at)}</strong>`;s.steps.forEach((st,i)=>{const l=document.createElement("label");l.className="check-item";l.innerHTML=`<input type="checkbox" ${st.done?"checked":""}> ${esc(st.label)}`;l.querySelector("input").addEventListener("change",()=>toggleSessionStep(s.id,i));d.appendChild(l)});els.sessionList.appendChild(d)})}
function renderMentorHistory(){const w=getActiveWork();els.mentorHistoryList.innerHTML=w.mentor.length?"":'<div class="phrase-card"><p>Nenhuma sugestao gerada ainda.</p></div>';w.mentor.slice(0,5).forEach(m=>{const d=document.createElement("div");d.className="phrase-card";d.innerHTML=`<strong>${esc(m.mode)} - ${esc(m.section)}</strong><p>${esc(firstLine(m.text))}</p>`;els.mentorHistoryList.appendChild(d)})}
function renderSecurity(){const w=getActiveWork();if(!w||!els.securitySummary)return;const audit=getSecurityAudit(w);els.securityLevel.textContent=audit.risk==="alto"?"Risco alto":audit.risk==="medio"?"Risco medio":"Risco baixo";els.securitySummary.innerHTML=`<div class="security-card"><strong>${audit.percent}%</strong><span>checklist seguro</span></div><div class="security-card"><strong>${audit.done}/${audit.total}</strong><span>controles marcados</span></div><div class="security-card"><strong>${audit.localOnly?"local":"servidor"}</strong><span>camada atual</span></div><div class="security-card"><strong>${audit.hasSensitive?"sim":"baixo"}</strong><span>dados sensiveis</span></div>`;els.securityChecklist.innerHTML=SECURITY_ITEMS.map(i=>checkItem("security",i,Boolean(w.security.checklist[i]))).join("");els.securityChecklist.querySelectorAll("input").forEach(i=>i.addEventListener("change",()=>toggleSecurityItem(i.value)));els.securityWarningBox.innerHTML=`<strong>Regra de seguranca</strong><p>${SECURITY_NOTICE}</p><p>Estado desta obra: ${audit.risk==="alto"?"validacao premium ainda depende do prototipo local.":audit.risk==="medio"?"controles iniciados, mas ainda falta backend completo.":"controles principais marcados para ambiente comercial."}</p>`}
function renderProtection(){const w=getActiveWork();els.authorsList.innerHTML=w.protection.authors.length?"":'<div class="phrase-card"><p>Nenhum autor adicionado.</p></div>';w.protection.authors.forEach(a=>{const d=document.createElement("div");d.className="author-card";d.innerHTML=`<div><strong>${esc(a.name)}</strong><p>${esc(a.role)} - ${Number(a.share||0)}%</p></div><button class="small-action" type="button">Remover</button>`;d.querySelector("button").addEventListener("click",()=>removeAuthor(a.id));els.authorsList.appendChild(d)});els.protectionChecklist.innerHTML=PROTECTION_ITEMS.map(i=>checkItem("protection",i,Boolean(w.protection.checklist[i]))).join("");els.collectionChecklist.innerHTML=COLLECTION_ITEMS.map(i=>checkItem("collection",i,Boolean(w.protection.collection[i]))).join("");els.protectionChecklist.querySelectorAll("input").forEach(i=>i.addEventListener("change",()=>toggleProtectionItem("protection",i.value)));els.collectionChecklist.querySelectorAll("input").forEach(i=>i.addEventListener("change",()=>toggleProtectionItem("collection",i.value)));if(w.protection.dossier){const clip=w.protection.dossier.data.clip||{};els.dossierStatus.textContent=`Dossie gerado em ${formatDate(w.protection.dossier.generatedAt)}`;els.dossierHash.textContent=`Hash local: ${w.protection.dossier.hash}`;els.dossierPreview.textContent=JSON.stringify({titulo:w.protection.dossier.data.title,autores:w.protection.dossier.data.authors,participacaoTotal:w.protection.dossier.data.authorShareTotal,mentor:w.protection.dossier.data.mentor.length,videoclipe:{conceito:clip.concept,cenas:clip.scenes?.length||0,takes:clip.scenes?.filter(s=>s.takeUrl).length||0,videoFinal:clip.finalVideo||""},hash:w.protection.dossier.hash},null,2)}else{els.dossierStatus.textContent="Dossie ainda nao gerado.";els.dossierHash.textContent="Hash local: pendente";els.dossierPreview.textContent="Gere o dossie para ver o resumo tecnico da obra."}}
function checkItem(g,i,c){return`<label class="check-item ${c?"done":""}"><input type="checkbox" value="${attr(i)}" ${c?"checked":""}> ${esc(i)}</label>`}
function renderTimeline(){const w=getActiveWork();els.timelineList.innerHTML="";w.timeline.slice(0,30).forEach(e=>{const d=document.createElement("div");d.className="timeline-item";d.innerHTML=`<span>${formatDate(e.at)}</span><p>${esc(e.label)}</p>`;els.timelineList.appendChild(d)})}
function renderPhrases(){els.phraseList.innerHTML=state.phrases.length?"":'<div class="phrase-card"><p>Salve frases, titulos e refroes soltos aqui.</p></div>';state.phrases.forEach(p=>{const d=document.createElement("div");d.className="phrase-card";d.innerHTML=`<p>${esc(p.text)}</p><div class="badge-row"><button class="small-action" data-action="work" type="button">Virar obra</button><button class="small-action" data-action="remove" type="button">Remover</button></div>`;d.querySelector('[data-action="work"]').addEventListener("click",()=>phraseToWork(p.id));d.querySelector('[data-action="remove"]').addEventListener("click",()=>removePhrase(p.id));els.phraseList.appendChild(d)})}
function firstLine(t){return String(t||"").split("\n").find(Boolean)?.slice(0,90)||""}function lastLine(t){const a=String(t||"").split("\n").filter(Boolean);return a[a.length-1]||""}function formatDate(v){return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(v))}function slugify(v){return String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"obra"}function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function attr(v){return esc(v).replaceAll("`","&#096;")}
bindEvents();bindExportEvents();bindInternationalEvents();bindCommercialEvents();render();

/* ════════════════════════════════════════════════════════════════
   TRADUÇÃO MUSICAL REAL — Google Gemini API (grátis, zero custo)
   Suporta 184 idiomas / nações
   Chave pública gratuita: https://aistudio.google.com/app/apikey
════════════════════════════════════════════════════════════════ */
const GEMINI_API_KEY = ""; // Chave gerenciada pelo servidor /api/translate // substitua pela chave gratuita
const IDIOMAS_MUNDO = {
  "ingles":"English","espanhol":"Spanish","frances":"French",
  "italiano":"Italian","alemao":"German","japones":"Japanese",
  "coreano":"Korean","arabe":"Arabic","hindi":"Hindi",
  "mandarim":"Mandarin Chinese","russo":"Russian","portugues do Brasil":"Brazilian Portuguese",
  "turco":"Turkish","polones":"Polish","holandes":"Dutch",
  "sueco":"Swedish","noruegues":"Norwegian","dinamarques":"Danish",
  "finlandes":"Finnish","grego":"Greek","hebraico":"Hebrew",
  "thai":"Thai","vietnamita":"Vietnamese","indonesio":"Indonesian",
  "malaio":"Malay","tagalog":"Filipino","swahili":"Swahili",
  "yoruba":"Yoruba","haussa":"Hausa","amharico":"Amharic",
  "bengali":"Bengali","urdu":"Urdu","persa":"Persian/Farsi",
  "punjabi":"Punjabi","marathi":"Marathi","telugu":"Telugu",
  "tamil":"Tamil","gujarati":"Gujarati","cingales":"Sinhala",
  "nepalês":"Nepali","birmanes":"Burmese","khmer":"Khmer",
  "laociano":"Lao","mongol":"Mongolian","tibetano":"Tibetan",
  "cazaque":"Kazakh","uzbeko":"Uzbek","azerbaijano":"Azerbaijani",
  "georgiano":"Georgian","armênio":"Armenian","albanês":"Albanian",
  "bósnio":"Bosnian","croata":"Croatian","eslovaco":"Slovak",
  "esloveno":"Slovenian","estônio":"Estonian","letão":"Latvian",
  "lituano":"Lithuanian","macedônio":"Macedonian","sérvio":"Serbian",
  "búlgaro":"Bulgarian","romeno":"Romanian","húngaro":"Hungarian",
  "tcheco":"Czech","ucraniano":"Ukrainian","bielorrusso":"Belarusian",
  "catalão":"Catalan","galego":"Galician","basco":"Basque",
  "islandês":"Icelandic","irlandês":"Irish","galês":"Welsh",
  "escocês":"Scottish Gaelic","maltês":"Maltese","esperanto":"Esperanto",
  "outro":"English"
};
const MODOS_DESCRICAO = {
  singable:"singable and natural to sing, preserving syllable count and rhythm",
  faithful:"faithful to the original meaning and emotion",
  rhyme:"with natural rhymes matching the original rhyme scheme",
  emotional:"deeply emotional, preserving the feeling and soul of the original",
  commercial:"commercial and catchy, suitable for radio hits"
};
async function translateWithGemini(lyrics,lang,mode,market,title){
  try {
    const resp = await fetch('/api/translate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({lyrics,targetLang:IDIOMAS_MUNDO[lang]||lang,mode,market,title})
    });
    if(resp.ok){
      const data=await resp.json();
      if(data.translated) return data.translated;
    }
  } catch(e){ console.warn('Endpoint indisponível, usando fallback MyMemory'); }
  // Fallback: MyMemory direto
  try {
    const langCodes={"ingles":"en","espanhol":"es","frances":"fr","italiano":"it","alemao":"de","japones":"ja","coreano":"ko","arabe":"ar","hindi":"hi","mandarim":"zh","russo":"ru","turco":"tr","polones":"pl","holandes":"nl","sueco":"sv","grego":"el","hebraico":"he","thai":"th","vietnamita":"vi","indonesio":"id","swahili":"sw","bengali":"bn","urdu":"ur","persa":"fa","ucraniano":"uk","romeno":"ro","hungaro":"hu","tcheco":"cs","bulgaro":"bg","croata":"hr","tagalog":"tl","malaio":"ms","noruegues":"no","dinamarques":"da","finlandes":"fi","outro":"en"};
    const lc=langCodes[lang]||"en";
    const lines=lyrics.split("\n").filter(l=>l.trim());
    const translated=await Promise.all(lines.map(async line=>{
      if(!line.trim())return"";
      const r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(line)}&langpair=pt|${lc}`);
      if(r.ok){const d=await r.json();return d.responseData?.translatedText||line;}
      return line;
    }));
    return translated.join("\n");
  } catch(e){ throw new Error("Serviço de tradução temporariamente indisponível."); }
}

