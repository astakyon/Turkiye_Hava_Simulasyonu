let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* one manager holds every window key handler, in the old order */
const L=INPUT.list(); T_('handlers registered',L.length>=23,L.length); T_('every handler has its module',L.every(function(r){ return r.modul&&r.modul.indexOf('/')>0; }));
/* no key bound to two actions in the same context */
const C=INPUT.conflicts(); T_('no conflicting keys',C.length===0,JSON.stringify(C));
/* a deliberately conflicting binding is found */
const keep=CTRL.kb.air.gear.slice(); CTRL.kb.air.gear=['KeyM']; T_('conflict detected',INPUT.conflicts().some(function(c){ return c.tus==='KeyM'; })); CTRL.kb.air.gear=keep;
/* dispatch: order, stopImmediatePropagation, error isolation in the browser */
const log=[]; INPUT.on('keydown',function(){ log.push('a'); },false,'test/a'); INPUT.on('keydown',function(e){ log.push('b'); e.stopImmediatePropagation(); },false,'test/b'); INPUT.on('keydown',function(){ log.push('c'); },false,'test/c');
const H=INPUT.h['keydown:b'], n0=H.length; INPUT.h['keydown:b']=H.slice(n0-3);
INPUT.dispatch('keydown:b',{code:'KeyQ',stopImmediatePropagation:function(){}}); T_('order and stop',log.join()==='a,b',log.join());
INPUT.h['keydown:b']=[{fn:function(){ throw new Error('x'); },id:'t/x'},{fn:function(){ log.push('d'); },id:'t/d'}]; INPUT.strict=false; const ce=console.error; console.error=function(){};
INPUT.dispatch('keydown:b',{code:'KeyQ'}); console.error=ce; INPUT.strict=true; T_('error isolated',log[log.length-1]==='d'&&INPUT.errs['t/x']===1);
INPUT.h['keydown:b']=H.slice(0,n0);
/* context names */
const ks=state; state='play'; T_('flight context',INPUT.ctx()==='uçuş'); state='menu'; T_('menu context',INPUT.ctx()==='menü'); state=ks;
console.log('input: pass '+ok+' fail '+bad);
