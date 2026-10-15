/* ------------------------------------------------------------------ module costs in the performance test (V2.24)
   While the performance test runs, HOOK.prof is on: every module layer of the wrapped game functions (frame update, HUD,
   culling, settings…) sums its own time. The report lists the most expensive ones (ms per call and calls), so a slow
   phone shows which module costs what. Profiling adds two clock reads per layer call, only during the test. */
ptStart=HOOK.wrap('ptStart','98zh-hookprof#start',function(next){ return function(o){ HOOK.ms={}; HOOK.n={}; HOOK.prof=true; return next(o); }; },ptStart);
ptFinish=HOOK.wrap('ptFinish','98zh-hookprof#finish',function(next){ return function(a){ const r=next(a); HOOK.prof=false; return r; }; },ptFinish);
ptReport=HOOK.wrap('ptReport','98zh-hookprof#report',function(next){ return function(a){ const r=next(a);
  try{ r.hooks=HOOK.top(8).map(function(h){ return [h[0], Math.round(h[1]*1000)/1000, h[2]]; }); r.hookErr=HOOK.err; }catch(e){} return r; }; },ptReport);
ptResults=HOOK.wrap('ptResults','98zh-hookprof#results',function(next){ return function(rep,list){ next(rep,list); const el=$('ptResUI'), h=rep&&rep.hooks; if(!el||!h||!h.length||!el.querySelector) return;
  const m=el.querySelectorAll('.ptmeta'); const last=m&&m[m.length-1]; if(!last||!last.insertAdjacentHTML) return;
  last.insertAdjacentHTML('afterend','<p class="ptmeta">En pahalı modüller: '+h.slice(0,5).map(function(x){ return envEsc(/#asıl$/.test(x[0])?x[0].replace('#asıl',''):x[0].replace(/#.*/,''))+' '+String(x[1]).replace('.',',')+' ms'; }).join(' · ')+(rep.hookErr?' · modül hatası: '+rep.hookErr:'')+'</p>'); }; },ptResults);
