let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* layers run in registration order, outermost last; each decides when to call the ones below */
const log=[]; let f=function(x){ log.push('base'+x); return x*2; };
f=HOOK.wrap('tst','a',function(next){ return function(x){ log.push('a'); return next(x)+1; }; },f);
f=HOOK.wrap('tst','b',function(next){ return function(x){ const r=next(x); log.push('b'); return r*10; }; },f);
T_('result composed',f(3)===70,f(3)); log.length=0; f(1); T_('order',log.join()==='a,base1,b',log.join());
T_('list',HOOK.list('tst').join()==='a,b');
/* error isolation (browser mode): a layer that throws before calling below still lets them run */
HOOK.strict=false; let below=0; let g=function(){ below++; return 5; };
g=HOOK.wrap('tst2','ok',function(next){ return function(){ return next(); }; },g);
g=HOOK.wrap('tst2','bad',function(next){ return function(){ throw new Error('x'); }; },g);
const ce=console.error; console.error=function(){}; const r=g(); console.error=ce;
T_('failing layer skipped, rest runs',r===5&&below===1,r+'/'+below); T_('error counted',HOOK.errs['bad']===1);
/* a layer that throws after calling below does not run them twice */
let h=function(){ below++; }; below=0; h=HOOK.wrap('tst3','late',function(next){ return function(){ next(); throw new Error('y'); }; },h); console.error=function(){}; h(); console.error=ce; T_('no double call',below===1,below);
HOOK.strict=true; let threw=false; try{ g(); }catch(e){ threw=true; } T_('strict mode rethrows (headless tests)',threw);
/* a function replaced outright (or wrapped the old way) starts a new chain that keeps working, no recursion */
let k=function(){ return 1; }; k=HOOK.wrap('tst4','a',function(n){ return function(){ return n()+1; }; },k);
const old=k; k=function(){ return old()*10; };   /* old-style wrapper */
k=HOOK.wrap('tst4','b',function(n){ return function(){ return n()+5; }; },k); T_('old-style wrapper in between',k()===25,k());
/* profiling sums each layer's own time */
HOOK.prof=true; HOOK.ms={}; HOOK.n={}; f(2); HOOK.prof=false; T_('profiled calls counted',HOOK.n['a']===1&&HOOK.n['b']===1);
/* events */
let ev=0; HOOK.on('tstev',function(a){ ev+=a; }); HOOK.on('tstev',function(){ throw new Error('z'); }); HOOK.strict=false; console.error=function(){}; HOOK.emit('tstev',3); console.error=ce; HOOK.strict=true; T_('events isolated',ev===3);
/* the game's own chains */
T_('update chain has its layers',HOOK.list('update').length>=6,HOOK.list('update').length);
console.log('hook: pass '+ok+' fail '+bad);
