/* ------------------------------------------------------------------ hook registry (V2.24)
   Before: modules extended each other by wrapping functions — `const _x=fn; fn=function(){ … _x() … }` — 284 times (drawHUD
   10 deep, syncSettingsUI 14, cullStep 10…). The order was the file order nobody saw, one module's error stopped the rest of
   the chain, and every wrapper needed a unique top-level name (we had collisions).
   Now a wrapped function is one dispatcher: `fn=HOOK.wrap('fn','klasor/modul#ad',function(next){ return function(…){ … next(…) … }; })`.
   The layer still decides when to call the previous one (`next`), so behaviour is unchanged, but:
   • HOOK.list('drawHUD') shows the layers in order (outermost last);
   • a layer that throws is reported once and the call carries on with the layers below it (if it had not reached them yet);
   • with HOOK.prof=true every layer's own time (without the layers below it) is summed in HOOK.ms — the performance test uses it.
   HOOK.on(name, fn) / HOOK.emit(name, …) are plain events for new code. */
const HOOK={fns:{}, ev:{}, prof:false, ms:{}, n:{}, mx:{}, errs:{}, err:0, strict:typeof MessageChannel==='undefined'};   /* strict (headless tests): errors go to the caller as before */
/* fixed arity (no `arguments` object per call: this runs every frame); hooked functions take at most 4 parameters */
HOOK.wrap=function(name,id,factory,base){ let D=HOOK.fns[name];
  /* new chain the first time, and also when the function was replaced (or wrapped the old way) meanwhile — the new chain
     starts from what is there now, which may itself call the old chain, exactly as before */
  if(!D||(base&&base!==D.call)){ const N={name:name, base:base, layers:[], top:null}; HOOK.fns[name]=N; D=N;
    N.call=function(a,b,c,d,e,f){ if(!N.top) HOOK.build(N); return N.top.call(this,a,b,c,d,e,f); }; }
  D.layers.push({id:id, f:factory}); D.top=null; return D.call; };
HOOK.build=function(D){ const base=D.base||function(){}, bid=D.name+'#asıl';   /* the original function is timed as its own entry */
  let prev=function(a,b,c,d,e,f){ if(!HOOK.prof) return base.call(this,a,b,c,d,e,f); const t0=performance.now(), keep=HOOK._in; HOOK._in=0;
    try{ return base.call(this,a,b,c,d,e,f); } finally{ const dt=performance.now()-t0; const own=dt-HOOK._in; HOOK.ms[bid]=(HOOK.ms[bid]||0)+own; HOOK.n[bid]=(HOOK.n[bid]||0)+1; if(own>(HOOK.mx[bid]||0)) HOOK.mx[bid]=own; HOOK._in=keep+dt; } };
  D.layers.forEach(function(L){ const below=prev; let reached=0;
    const next=function(a,b,c,d,e,f){ reached++; return below.call(this,a,b,c,d,e,f); };
    const fn=L.f(next);
    prev=function(a,b,c,d,e,f){ const r0=reached;
      if(!HOOK.prof){ try{ return fn.call(this,a,b,c,d,e,f); }catch(x){ HOOK.fail(L.id,x); if(reached===r0) return below.call(this,a,b,c,d,e,f); return; } }
      const t0=performance.now(), keep=HOOK._in; HOOK._in=0;
      try{ return fn.call(this,a,b,c,d,e,f); }catch(x){ HOOK.fail(L.id,x); if(reached===r0) return below.call(this,a,b,c,d,e,f); }
      finally{ const dt=performance.now()-t0; const own=dt-HOOK._in; HOOK.ms[L.id]=(HOOK.ms[L.id]||0)+own; HOOK.n[L.id]=(HOOK.n[L.id]||0)+1; if(own>(HOOK.mx[L.id]||0)) HOOK.mx[L.id]=own; HOOK._in=keep+dt; } }; });
  D.top=prev; };
HOOK._in=0;
/* a layer that throws is reported once (then counted); the layers below it still run if it had not called them yet */
HOOK.fail=function(id,e){ if(HOOK.strict) throw e; HOOK.err++; if(!HOOK.errs[id]){ HOOK.errs[id]=1; try{ console.error('Modül hatası ('+id+')',e); }catch(x){} } else HOOK.errs[id]++; };
HOOK.list=function(name){ const D=HOOK.fns[name]; return D?D.layers.map(function(L){ return L.id; }):[]; };
HOOK.on=function(name,fn){ (HOOK.ev[name]||(HOOK.ev[name]=[])).push(fn); };
HOOK.emit=function(name){ const L=HOOK.ev[name]; if(!L) return; const a=Array.prototype.slice.call(arguments,1);
  for(let i=0;i<L.length;i++){ try{ L[i].apply(null,a); }catch(e){ HOOK.err++; if(!HOOK.errs[name+'#'+i]){ HOOK.errs[name+'#'+i]=1; try{ console.error('Olay hatası ('+name+')',e); }catch(x){} } } } };
/* the most expensive layers since HOOK.prof was turned on: [[id, ms per call, calls]]; HOOK.peaks: the longest single calls */
HOOK.peaks=function(n){ return Object.keys(HOOK.mx).map(function(k){ return [k,HOOK.mx[k]]; }).sort(function(a,b){ return b[1]-a[1]; }).slice(0,n||8); };
HOOK.top=function(n){ return Object.keys(HOOK.ms).map(function(k){ return [k,HOOK.ms[k]/(HOOK.n[k]||1),HOOK.n[k]]; }).sort(function(a,b){ return b[1]*b[2]-a[1]*a[2]; }).slice(0,n||10); };
