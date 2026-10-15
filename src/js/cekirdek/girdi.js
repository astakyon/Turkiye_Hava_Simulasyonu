/* ------------------------------------------------------------------ input manager (V2.27)
   Before: 23 modules each put their own keydown/keyup listener on the window (28 counting keyup) — the order was the file
   order, one listener's error could stop the event for the rest, and nobody could list which key did what where.
   Now there is one real listener per phase (capture / normal) and type; modules register with
   INPUT.on('keydown', fn, capture, 'klasor/modul', 'bağlam') and are called in the same order as before. A handler that
   calls e.stopImmediatePropagation() still stops the ones after it; a handler that throws is reported once and the rest run.
   INPUT.ctx() names the current context (menü, uçuş, yürüyüş, araç, helikopter, tekne, harita, duraklatma…) for the help
   screen; INPUT.list() lists every handler with its module and context; INPUT.conflicts() lists keys bound to two actions
   in the same context (Kontroller → tuş atamaları, tests/input.test.js keeps it at zero). */
const INPUT={h:{}, real:{}, errs:{}, err:0, n:0, strict:typeof MessageChannel==='undefined'};
INPUT.ctx=function(){ try{ if(typeof MAPV!=='undefined'&&MAPV.open) return 'harita';
    if(state==='walk'){ const m=typeof WALK!=='undefined'?WALK.mode:'foot'; return m==='car'?'araç':m==='heli'?'helikopter':m==='boat'?'tekne':'yürüyüş'; }
    if(state==='play') return 'uçuş'; if(state==='paused') return 'duraklatma'; if(state==='library') return 'kütüphane'; return 'menü'; }catch(e){ return 'menü'; } };
INPUT.dispatch=function(key,e){ const L=INPUT.h[key]; if(!L||!L.length) return; let stop=false; const orig=e.stopImmediatePropagation;
  e.stopImmediatePropagation=function(){ stop=true; if(orig) return orig.call(e); };
  try{ for(let i=0;i<L.length&&!stop;i++){ const r=L[i]; try{ r.fn.call(window,e); }catch(x){ if(INPUT.strict) throw x; INPUT.err++; if(!INPUT.errs[r.id]){ INPUT.errs[r.id]=1; try{ console.error('Girdi hatası ('+r.id+')',x); }catch(y){} } } } }
  finally{ try{ delete e.stopImmediatePropagation; if(orig&&e.stopImmediatePropagation!==orig) e.stopImmediatePropagation=orig; }catch(y){} } };
INPUT.on=function(type,fn,capture,id,ctx){ const cap=!!(capture===true||(capture&&capture.capture)), key=type+(cap?':c':':b');
  if(!INPUT.h[key]){ INPUT.h[key]=[]; if(!INPUT.real[key]&&typeof window!=='undefined'&&window.addEventListener){ INPUT.real[key]=function(e){ INPUT.dispatch(key,e); }; window.addEventListener(type,INPUT.real[key],cap); } }
  INPUT.h[key].push({fn:fn, id:id||('#'+(++INPUT.n)), ctx:ctx||'her yerde', type:type, cap:cap}); return fn; };
INPUT.list=function(){ const out=[]; Object.keys(INPUT.h).forEach(function(k){ INPUT.h[k].forEach(function(r){ out.push({type:r.type, faz:r.cap?'yakalama':'normal', modul:r.id, baglam:r.ctx}); }); }); return out; };
/* keys bound to more than one action of the same context (gen actions count in every context) */
INPUT.CAM_ALIAS={'land.cam':'gen.camera','sea.cam':'gen.camera'};   /* the vehicle camera key is the general camera key on purpose */
INPUT.conflicts=function(){ const out=[]; if(typeof CTRL_DEF==='undefined') return out;
  Object.keys(CTRL_DEF).forEach(function(s){ if(s==='gen') return; const M={};
    ['gen',s].forEach(function(g){ CTRL_DEF[g].acts.forEach(function(a){ const keys=(CTRL.kb[g]&&CTRL.kb[g][a[0]])||a[2]||[]; keys.forEach(function(k){ (M[k]=M[k]||[]).push(g+'.'+a[0]); }); }); });
    Object.keys(M).forEach(function(k){ const L=M[k].filter(function(x,i,A){ return !(INPUT.CAM_ALIAS[x]&&A.indexOf(INPUT.CAM_ALIAS[x])>=0); }); if(L.length>1) out.push({sema:s, tus:k, eylemler:L}); }); });
  return out; };
/* the real listeners, capture before normal (as the browser calls them) */
(function(){ if(typeof window==='undefined'||!window.addEventListener) return; ['keydown','keyup'].forEach(function(t){ [true,false].forEach(function(cap){ const key=t+(cap?':c':':b');
  INPUT.h[key]=INPUT.h[key]||[]; INPUT.real[key]=function(e){ INPUT.dispatch(key,e); }; window.addEventListener(t,INPUT.real[key],cap); }); }); })();
