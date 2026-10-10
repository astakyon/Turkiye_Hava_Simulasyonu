/* ------------------------------------------------------------------ settings + records (saved in this browser) */
const SETTINGS={volume:0.8,quality:2,sens:1,rumble:true,invert:false,touch:'auto',bombAssist:'guided',lockOn:true,autoPerf:true,fps:false};
let RECORDS={};
function loadStore(){
  try{ if(!localStorage.getItem('kaan-sim-settings') && window.matchMedia && window.matchMedia('(pointer:coarse)').matches) SETTINGS.quality=1; }catch(e){}
  try{ const a=JSON.parse(localStorage.getItem('kaan-sim-settings')||'null'); if(a) Object.assign(SETTINGS,a); }catch(e){}
  try{ const b=JSON.parse(localStorage.getItem('kaan-sim-records')||'null'); if(b&&typeof b==='object') RECORDS=b; }catch(e){}
  try{ const l=JSON.parse(localStorage.getItem('kaan-sim-loadouts')||'null'); if(l&&typeof l==='object') Object.assign(LOADOUTS,l); }catch(e){}
  try{ const m=localStorage.getItem('kaan-sim-mission'); if(m&&MISSIONS[m]) missionId=m; }catch(e){}
}
function saveSettings(){ try{ localStorage.setItem('kaan-sim-settings',JSON.stringify(SETTINGS)); }catch(e){} }
function saveRecords(){ try{ localStorage.setItem('kaan-sim-records',JSON.stringify(RECORDS)); }catch(e){} }
function rec(id){ return RECORDS[id]||(RECORDS[id]={best:null,score:0}); }
function noteScore(){ const r=rec(activeId); if(score>r.score){ r.score=score; saveRecords(); } }
function applyVolume(){ if(master) master.gain.value=SETTINGS.volume; }
const PERF={base:1,scale:1,acc:0,n:0,t:0,low:0,high:0,fps:60,told:false};
function perfStep(dt){
  PERF.acc+=dt; PERF.n++;
  if(PERF.acc<1) return;
  PERF.fps=PERF.n/PERF.acc; PERF.acc=0; PERF.n=0;
  if(SETTINGS.fps){ $('fps').textContent=Math.round(PERF.fps)+' FPS · '+Math.round(PERF.base*PERF.scale*100)/100+'x'; }
  if(!SETTINGS.autoPerf||state!=='play') { PERF.low=PERF.high=0; return; }
  if(PERF.fps<38){ PERF.low++; PERF.high=0; } else if(PERF.fps>56){ PERF.high++; PERF.low=0; } else { PERF.low=PERF.high=0; }
  if(PERF.low>=3&&PERF.scale>0.6){ PERF.scale=Math.max(0.6,PERF.scale-0.15); PERF.low=0; renderer.setPixelRatio(PERF.base*PERF.scale); resize(); if(!PERF.told){ PERF.told=true; toast('Akıcılık için görüntü çözünürlüğü düşürüldü','#b8ecff'); } }
  else if(PERF.high>=6&&PERF.scale<1){ PERF.scale=Math.min(1,PERF.scale+0.1); PERF.high=0; renderer.setPixelRatio(PERF.base*PERF.scale); resize(); }
}
function applyQuality(){
  const q=SETTINGS.quality, dpr=window.devicePixelRatio||1;
  PERF.base=[1,Math.min(1.5,dpr),Math.min(2,dpr)][q]; renderer.setPixelRatio(PERF.base*PERF.scale);
  if(GFX.trees) GFX.trees.count=Math.floor(GFX.treeN*[0.35,0.7,1][q]);
  if(GFX.clouds) GFX.clouds.count=Math.floor(GFX.cloudN*[0.5,0.75,1][q]);
  resize(); if(typeof applyShadows==='function') applyShadows();
  if(typeof applyFX==='function') applyFX();
}

