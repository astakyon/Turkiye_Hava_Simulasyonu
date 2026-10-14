/* ------------------------------------------------------------------ staged start-up (V2.19)
   Before: every module and then all ~30 world builders ran in one go (2.6–3 s of blocked page on a test machine, plus the first
   frame compiling ~40 shaders); the page showed the frozen menu with no sign of progress.
   Now the modules still run first (one script), then the builders run in separate steps with a loading screen and a real
   progress bar between them, and the frame loop starts after the last step. Timers that modules set up while loading (texture
   sharing, merging, baking…) wait until the world is built instead of firing half way through it, in the order they were due.
   Without a browser (headless tests) everything runs at once as before. BOOT.marks keeps the timings for the performance report. */
const BOOT={t0:performance.now(), hold:false, after:[], marks:[], stepMs:[], steps:0, done:false, first:null, ready:null};
function bootMark(n){ BOOT.marks.push([n,Math.round(performance.now())]); }   /* ms since the page started loading */
bootMark('betik');
(function(){ if(typeof window==='undefined'||typeof MessageChannel==='undefined'||!window.setTimeout||window.__bootSync) return;
  BOOT.hold=true; const st=window.setTimeout.bind(window), ct=window.clearTimeout.bind(window), si=window.setInterval.bind(window), recs=new Map();
  BOOT.st=st;
  window.setTimeout=function(fn,ms){ const a=Array.prototype.slice.call(arguments,2); if(typeof fn!=='function') return st.apply(window,arguments); let id=0;
    const run=function(){ recs.delete(id); fn.apply(window,a); };
    id=st(function(){ if(BOOT.hold){ BOOT.after.push(id); return; } run(); },ms); recs.set(id,run); return id; };
  window.clearTimeout=function(id){ recs.delete(id); ct(id); };
  window.setInterval=function(fn,ms){ const a=Array.prototype.slice.call(arguments,2); if(typeof fn!=='function') return si.apply(window,arguments); return si(function(){ if(!BOOT.hold) fn.apply(window,a); },ms); };
  BOOT.release=function(){ BOOT.hold=false; const q=BOOT.after; BOOT.after=[]; q.forEach(function(id){ const r=recs.get(id); if(r){ try{ r(); }catch(e){ console.error(e); } } });
    window.setTimeout=st; window.clearTimeout=ct; window.setInterval=si; };
  /* keys and clicks wait until the world exists */
  const block=function(e){ if(BOOT.hold){ e.stopImmediatePropagation(); if(e.cancelable&&e.type!=='keyup') e.preventDefault(); } };
  ['keydown','keyup','pointerdown','mousedown','touchstart','click','wheel'].forEach(function(t){ window.addEventListener(t,block,{capture:true,passive:false}); });
})();
/* runs the steps one task apart (MessageChannel: no 4 ms timer clamp) and updates the bar between them */
function bootRun(steps,finish){ const total=steps.reduce(function(a,s){ return a+(s[2]||1); },0); let i=0, doneW=0;
  const bar=document.getElementById('bootBar'), txt=document.getElementById('bootTxt');
  const show=function(){ if(bar) bar.style.transform='scaleX('+(0.08+0.84*doneW/total).toFixed(3)+')'; if(txt&&steps[i]) txt.textContent=steps[i][0]; };
  const one=function(){ const s=steps[i]; const t=performance.now(); try{ s[1](); }catch(e){ console.error('açılış: '+s[0],e); } BOOT.stepMs.push([s[0],Math.round(performance.now()-t)]); doneW+=s[2]||1; i++; BOOT.steps=i; };
  if(!BOOT.hold){ while(i<steps.length) one(); finish(); return; }
  const ch=new MessageChannel(); let started=false; const go=function(){ if(started) return; started=true; bootMark('ilk boya'); ch.port2.postMessage(0); };
  ch.port1.onmessage=function(){ /* several small steps per task; yield every ~50 ms so the bar moves */
    const t0=performance.now(); do{ one(); }while(i<steps.length&&performance.now()-t0<50); show();
    if(i<steps.length) ch.port2.postMessage(0); else { ch.port1.onmessage=null; finish(); } };
  show(); requestAnimationFrame(function(){ requestAnimationFrame(go); }); BOOT.st(go,250); }   /* after the loading screen is on screen (or at once in a hidden tab) */
function bootHide(){ const el=document.getElementById('boot'); if(!el) return; el.classList.add('out'); (BOOT.st||setTimeout)(function(){ if(el.parentNode) el.parentNode.removeChild(el); },450); }
