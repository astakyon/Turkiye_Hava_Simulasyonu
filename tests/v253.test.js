let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* V2.53: imported models backed up to the player's cloud folder; restored after sign-in */
T_('functions',typeof mcSync==='function'&&typeof mcUpload==='function'&&typeof mcRemove==='function');
T_('off when signed out',(function(){ const u=ACC.user; ACC.user=null; const r=mcOn(); ACC.user=u; return r===false; })());
/* fake storage: cloud has kızılelma, this device has kaan → kızılelma comes down, kaan goes up */
const SAVE={user:ACC.user, prof:ACC.prof, sb:ACC.sb, all:mdbAll, put:mdbPut, apply:mcApply, need:needLibs};
const ups=[], downs=[]; let applied=null;
ACC.user={id:'u1'}; ACC.prof={callsign:'Test'};
ACC.sb={from:function(){ const q={select:function(){ return q; },eq:function(){ return q; },order:function(){ return q; },limit:function(){ return q; },maybeSingle:function(){ return q; },then:function(f,r){ return Promise.resolve({data:[]}).then(f,r); }}; return q; }, storage:{from:function(b){ return {
  list:function(dir){ return Promise.resolve({data:[{name:'kizilelma.glb'},{name:'kizilelma.json'}]}); },
  upload:function(p){ ups.push(p); return Promise.resolve({data:{}}); },
  download:function(p){ downs.push(p); return Promise.resolve({data:{text:function(){ return Promise.resolve('{"name":"k.glb","spec":{"rotation":[0,90,0]}}'); }, arrayBuffer:function(){ return Promise.resolve(new ArrayBuffer(8)); }}}); },
  remove:function(){ return Promise.resolve({}); } }; }}};
mdbAll=function(){ return Promise.resolve([{id:'kaan',name:'kaan.glb',glb:new ArrayBuffer(16),spec:{rotation:[0,0,0]}}]); };
needLibs=function(){ return Promise.resolve(); };
mcApply=function(id,buf,meta){ applied={id:id,meta:meta,size:buf.byteLength}; return Promise.resolve(true); };
mcSync().then(function(){
  T_('uploads local-only model',ups.indexOf('u1/kaan.glb')>=0&&ups.indexOf('u1/kaan.json')>=0,ups.join(','));
  T_('downloads cloud-only model',downs.indexOf('u1/kizilelma.json')>=0&&downs.indexOf('u1/kizilelma.glb')>=0&&applied&&applied.id==='kizilelma'&&applied.meta.spec.rotation[1]===90);
  T_('second upload skips unchanged glb',(function(){ ups.length=0; return true; })());
  return mcUpload('kaan',{name:'kaan.glb',glb:new ArrayBuffer(16),spec:{}});
}).then(function(){ T_('json only',ups.length===1&&ups[0]==='u1/kaan.json',ups.join(','));
}).finally(function(){ ACC.user=SAVE.user; ACC.prof=SAVE.prof; ACC.sb=SAVE.sb; mdbAll=SAVE.all; needLibs=SAVE.need; mcApply=SAVE.apply; console.log('v253: pass '+ok+' fail '+bad); });
