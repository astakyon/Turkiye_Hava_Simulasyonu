/* ------------------------------------------------------------------ settings + records (saved in this browser) */
const SETTINGS={volume:0.8,quality:2,sens:1,rumble:true,invert:false,touch:'auto',bombAssist:'guided',lockOn:true,autoPerf:true,fps:false};
const SETTINGS_DEF=JSON.parse(JSON.stringify(SETTINGS));
let RECORDS={};
function loadStore(){
  try{ if(!stGet('kaan-sim-settings') && window.matchMedia && window.matchMedia('(pointer:coarse)').matches) SETTINGS.quality=1; }catch(e){}
  try{ const a=JSON.parse(stGet('kaan-sim-settings')||'null'); if(a) Object.assign(SETTINGS,a); }catch(e){}
  try{ const b=JSON.parse(stGet('kaan-sim-records')||'null'); if(b&&typeof b==='object') RECORDS=b; }catch(e){}
  try{ const l=JSON.parse(stGet('kaan-sim-loadouts')||'null'); if(l&&typeof l==='object') Object.assign(LOADOUTS,l); }catch(e){}
  try{ const m=stGet('kaan-sim-mission'); if(m&&MISSIONS[m]) missionId=m; }catch(e){}
}
function saveSettings(){ try{ stSet('kaan-sim-settings',JSON.stringify(SETTINGS)); }catch(e){} }
function saveRecords(){ try{ stSet('kaan-sim-records',JSON.stringify(RECORDS)); }catch(e){} }
function rec(id){ return RECORDS[id]||(RECORDS[id]={best:null,score:0}); }
function noteScore(){ const r=rec(activeId); if(score>r.score){ r.score=score; saveRecords(); } }
function applyVolume(){ if(master) master.gain.value=SETTINGS.volume; }
const PERF={base:1,scale:1,acc:0,n:0,t:0,low:0,high:0,fps:60,told:false};
/* automatic resolution: only when the player chose "Otomatik"; PC never drops below 85 % (it was 60 % and looked pixelated),
   phones below 70 %. Drops in small steps after 3 slow seconds, recovers after 5 smooth ones. */
function perfMin(){ return DEV.mobile?0.8:0.85; }   /* V2.28: phones 70 % → 80 % (at 70 % a 2.8× screen was drawn at 1.2×: the picture looked pixelated) */
function perfStep(dt){
  PERF.acc+=dt; PERF.n++;
  if(PERF.acc<1) return;
  PERF.fps=PERF.n/PERF.acc; PERF.acc=0; PERF.n=0;
  if(SETTINGS.fps){ $('fps').textContent=Math.round(PERF.fps)+' FPS · '+Math.round(renderer.getPixelRatio()*100)/100+'x'; }
  if(!SETTINGS.autoPerf||(SETTINGS.res&&SETTINGS.res!=='auto')||(state!=='play'&&state!=='walk')) { PERF.low=PERF.high=0; return; }
  const lo=DEV.mobile?36:40;
  if(PERF.fps<lo){ PERF.low++; PERF.high=0; } else if(PERF.fps>57){ PERF.high++; PERF.low=0; } else { PERF.low=PERF.high=0; }
  if(PERF.low>=3&&PERF.scale>perfMin()+0.001){ PERF.scale=Math.max(perfMin(),PERF.scale-0.05); PERF.low=0; renderer.setPixelRatio(PERF.base*PERF.scale); resize(); if(!PERF.told){ PERF.told=true; toast('Akıcılık için çözünürlük biraz düşürüldü (Ayarlar → Grafik → Çözünürlük)','#b8ecff'); } }
  else if(PERF.high>=5&&PERF.scale<1){ PERF.scale=Math.min(1,PERF.scale+0.05); PERF.high=0; renderer.setPixelRatio(PERF.base*PERF.scale); resize(); }
}
function applyQuality(){
  const q=SETTINGS.quality, dpr=window.devicePixelRatio||1;
  const r=SETTINGS.res&&SETTINGS.res!=='auto'?+SETTINGS.res:0;
  if(r){ PERF.scale=1; PERF.base=Math.min(DEV.mobile?2:2.5,dpr*r); }                 /* fixed resolution scale chosen by the player (can supersample on PC) */
  else PERF.base=[1,Math.min(1.5,dpr),Math.min(2,dpr),Math.min(2,dpr)][q];
  PERF.scale=Math.max(PERF.scale,perfMin()); renderer.setPixelRatio(PERF.base*PERF.scale); texQuality();
  const td=[0.35,0.7,1,1][q]; if(GFX.trees) GFX.trees.count=Math.floor(GFX.treeN*td);
  if(GFX.treeChunks) GFX.treeChunks.forEach(function(m){ m.count=Math.max(0,Math.floor(m.userData.full*td)); });
  if(GFX.clouds) GFX.clouds.count=Math.floor(GFX.cloudN*[0.5,0.75,1,1][q]);
  if(typeof CULL!=='undefined'){ CULL.px=CULL_PX[q]*(DEV.mobile?1.3:1); CULL.t=99; }
  resize(); if(typeof applyShadows==='function') applyShadows();
  if(typeof applyFX==='function') applyFX();
}


/* texture filtering: every texture gets anisotropic filtering and mipmaps (sharp runways and signs at grazing angles, no sparkle) */
const TEXQ=new WeakSet();
function texQuality(){
  if(typeof scene==='undefined') return; let maxA=1; try{ maxA=renderer.capabilities.getMaxAnisotropy(); }catch(e){}
  const a=Math.min(DEV.mobile?2:16,maxA||1);   /* V2.18: Android guidance — above 2× is very costly on phones */
  scene.traverse(function(o){ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):null; if(!ms) return;
    ms.forEach(function(m){ if(!m) return; ['map','emissiveMap','normalMap','roughnessMap','alphaMap'].forEach(function(k){ const t=m[k]; if(!t||!t.isTexture||TEXQ.has(t)) return; TEXQ.add(t);
      if(t.anisotropy!==a){ t.anisotropy=a; t.needsUpdate=true; } }); }); });
}
