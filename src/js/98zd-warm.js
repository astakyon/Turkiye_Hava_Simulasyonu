/* ------------------------------------------------------------------ shader warm-up (V2.19)
   A material is turned into a GPU program (shader compile + link) the first time it is drawn. Effects that are hidden until
   needed (explosion particles, flares, muzzle flash…) and places the camera has not seen yet were compiled in the middle of play:
   the phone report showed a 33 ms frame on the first explosion and on the first flare, the İHA base a 100 ms one.
   Now, while the title menu is open, every material in the scene — visible or hidden — is compiled a few at a time (about
   8 ms per frame), with the scene's own lights, fog and shadows so the program is exactly the one the game will use later.
   Nothing is drawn; programs that already exist cost nothing. Missions started before it finishes simply compile the rest as before.
   Kill switch: SETTINGS.warm=false. */
const WARM={q:[], seen:new Set(), px:null, lights:[], i:0, done:false, ms:0, n:0, prog0:0, at:0, t:0};
function warmKey(o){ const m=o.material; return m.uuid+'|'+(o.isInstancedMesh?'i':'')+(o.isSkinnedMesh?'k':'')+(o.isPoints?'p':'')+(o.isSprite?'s':'')+(o.isLine?'l':'')+(o.geometry&&o.geometry.attributes&&o.geometry.attributes.color?'c':''); }
function warmScan(){ WARM.q=[]; WARM.i=0; WARM.lights=[];
  scene.traverse(function(o){ if(o.isLight&&o.visible) WARM.lights.push(o); });
  scene.traverse(function(o){ if(!o.material||Array.isArray(o.material)||o.userData.noWarm) return; if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)) return;
    if(o.userData.baked) return;   /* baked originals are drawn through their baked mesh */
    const k=warmKey(o); if(WARM.seen.has(k)) return; WARM.seen.add(k); WARM.q.push(o); });
  if(!WARM.px){ WARM.px=Object.create(scene); }
  WARM.px.traverseVisible=function(cb){ for(let i=0;i<WARM.lights.length;i++) cb(WARM.lights[i]); };
  WARM.done=!WARM.q.length; return WARM.q.length; }
function warmStep(budget){ if(WARM.done||SETTINGS.warm===false) return 0; const t0=performance.now(); let n=0; const one=[null];
  WARM.px.traverse=function(cb){ if(one[0]) cb(one[0]); };
  while(WARM.i<WARM.q.length){ const o=WARM.q[WARM.i++]; if(o.parent===null) continue;   /* removed meanwhile */ one[0]=o;
    try{ renderer.compile(WARM.px,camera); }catch(e){ if(!WARM.err){ WARM.err=1; console.warn('ısıtma',e); } }
    n++; if(performance.now()-t0>budget) break; }
  WARM.n+=n; WARM.ms+=performance.now()-t0; if(WARM.i>=WARM.q.length){ WARM.done=true; WARM.at=Math.round(performance.now()); } return n; }
function warmStart(){ if(SETTINGS.warm===false) return; if(!WARM.prog0) WARM.prog0=(renderer.info.programs||[]).length; warmScan(); }
/* title menu only: in play the programs compile on first sight as before */
const _wmCull=cullStep; cullStep=function(dt){ _wmCull(dt); if(!WARM.started||WARM.done) return; if(state!=='menu') return; try{ warmStep(8); }catch(e){} };
const _wmTitle=enterTitle; enterTitle=function(){ const r=_wmTitle.apply(this,arguments); if(WARM.started){ try{ warmScan(); }catch(e){} } return r; };
setTimeout(function(){ WARM.started=true; try{ warmStart(); }catch(e){ console.warn('ısıtma',e); } },4600);   /* after merging (2.5 s) and baking (4 s) */
/* start-up timings in the performance report */
function bootInfo(){ const M={}; BOOT.marks.forEach(function(m){ M[m[0]]=m[1]; }); const steps=BOOT.stepMs.slice().sort(function(a,b){ return b[1]-a[1]; }).slice(0,4);
  const g=function(k){ return M[k]!=null?M[k]:null; }; return {js:g('betik'), mod:g('modüller'), world:g('dünya hazır'), ready:BOOT.ready, first:BOOT.first, slow:steps, warm:{n:WARM.n, ms:Math.round(WARM.ms), done:WARM.done, at:WARM.at||null, prog0:WARM.prog0||null}}; }
const _wmRep=ptReport; ptReport=function(a){ const r=_wmRep(a); try{ r.boot=bootInfo(); }catch(e){} return r; };
const _wmRes=ptResults; ptResults=function(rep,list){ _wmRes(rep,list); const b=rep&&rep.boot, el=$('ptResUI'); if(!b||!el||!el.querySelector) return; const m=el.querySelector('.ptmeta'); if(!m||!m.insertAdjacentHTML) return;
  const s=function(v){ return v==null?'—':(v/1000).toFixed(1).replace('.',',')+' sn'; };
  m.insertAdjacentHTML('afterend','<p class="ptmeta">Açılış: '+s(b.ready)+' (betik '+s(b.js)+', modüller '+s(b.mod)+', dünya '+s(b.world)+', ilk kare '+(b.first==null?'—':b.first+' ms')+') · en uzun adım: '+(b.slow&&b.slow[0]?envEsc(b.slow[0][0])+' '+b.slow[0][1]+' ms':'—')+' · ön derlenen shader: '+b.warm.n+(b.warm.done?'':' (sürüyor)')+'</p>'); };
