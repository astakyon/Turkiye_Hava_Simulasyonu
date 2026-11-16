/* ------------------------------------------------------------------ imported models in the cloud (V2.53)
   Imported .glb models used to live only in this browser (IndexedDB 'ayyildiz-models'); clearing the site data lost them.
   Now, for a signed-in player, every saved model is also kept in the private Supabase Storage bucket 'models'
   (supabase/model_yedek.sql): <uid>/<aircraft id>.glb + <uid>/<aircraft id>.json ({name, spec, size, t}).
   • after sign-in: models missing on this device are downloaded and applied; models only on this device are uploaded
     (so a phone that still has them backs them up the first time the player signs in there);
   • saving a model (import, turning it, marking parts) uploads it a moment later (the .glb only when it changed);
   • "back to the code model" removes the cloud copy too.
   Only the player's own folder is readable and writable (storage policies). Files over 45 MB stay on the device. */
const MCLOUD={busy:false, t:{}, sent:{}, err:null, max:45*1024*1024, last:null};
function mcOn(){ return !!(ACC&&ACC.sb&&ACC.user&&ACC.prof); }
function mcPath(id,ext){ return ACC.user.id+'/'+id+'.'+ext; }
function mcBucket(){ return ACC.sb.storage.from('models'); }
function mcMsg(t,err){ MCLOUD.last=t; if(typeof libMsg==='function'&&LIB&&LIB.on) libMsg(t,err); }
/* upload one model (json always, glb when its name or size differs from what we sent before) */
function mcUpload(id,rec){ if(!mcOn()) return Promise.resolve(false); const r=rec||LIB.raw[id], sk=MODELS.skins[id]; if(!r||!r.glb||(!rec&&!sk)) return Promise.resolve(false);
  const size=r.glb.byteLength; if(size>MCLOUD.max){ mcMsg(AIRCRAFT[id].name+': model 45 MB\'tan büyük, yalnız bu cihazda saklanıyor',true); return Promise.resolve(false); }
  const meta={name:r.name||id, spec:rec?(rec.spec||{}):libSpecOut(sk.spec), size:size, t:Date.now()}, key=(r.name||'')+'|'+size, B=mcBucket();
  const glb=MCLOUD.sent[id]===key?Promise.resolve({}):B.upload(mcPath(id,'glb'),new Blob([r.glb],{type:'model/gltf-binary'}),{upsert:true,contentType:'model/gltf-binary'});
  return glb.then(function(x){ if(x&&x.error) throw x.error; return B.upload(mcPath(id,'json'),new Blob([JSON.stringify(meta)],{type:'application/json'}),{upsert:true,contentType:'application/json'}); })
    .then(function(x){ if(x&&x.error) throw x.error; MCLOUD.sent[id]=key; MCLOUD.err=null; return true; })
    .catch(function(e){ MCLOUD.err=e&&e.message||String(e); console.warn('model bulut',MCLOUD.err); return false; }); }
function mcSoon(id){ if(!mcOn()) return; clearTimeout(MCLOUD.t[id]); MCLOUD.t[id]=setTimeout(function(){ mcUpload(id).then(function(ok){ if(ok) mcMsg(AIRCRAFT[id].name+' modeli buluta yedeklendi'); }); },1500); }
function mcRemove(id){ if(!mcOn()) return; delete MCLOUD.sent[id]; mcBucket().remove([mcPath(id,'glb'),mcPath(id,'json')]).catch(function(){}); }
/* apply a downloaded model exactly like a model loaded from this device */
function mcApply(id,buf,meta){ return mdbPut({id:id, name:meta.name, glb:buf, spec:meta.spec||{}}).then(function(){ return gltfLoader(); }).then(function(l){
  return new Promise(function(res){ l.parse(buf,'',function(g){ LIB.raw[id]={root:g.scene, glb:buf, name:meta.name}; setSkin(id,g.scene,Object.assign({},meta.spec,{local:true})); MCLOUD.sent[id]=(meta.name||'')+'|'+buf.byteLength; if(LIB.on) libRenderList(); res(true); },function(){ res(false); }); }); }); }
/* both ways after sign-in */
function mcSync(){ if(!mcOn()||MCLOUD.busy) return Promise.resolve(); MCLOUD.busy=true; const B=mcBucket(); let down=0, up=0;
  return Promise.all([B.list(ACC.user.id,{limit:200}), mdbAll().catch(function(){ return []; })]).then(function(a){
    if(a[0].error) throw a[0].error;
    const cloud={}; (a[0].data||[]).forEach(function(f){ const m=/^(.+)\.json$/.exec(f.name); if(m) cloud[m[1]]=true; });
    const local={}; (a[1]||[]).forEach(function(r){ if(r&&r.id) local[r.id]=r; });
    const jobs=[];
    Object.keys(cloud).forEach(function(id){ if(local[id]||!AIRCRAFT[id]) return;
      jobs.push(B.download(mcPath(id,'json')).then(function(j){ if(j.error) throw j.error; return j.data.text(); }).then(function(t){ const meta=JSON.parse(t);
        return B.download(mcPath(id,'glb')).then(function(g){ if(g.error) throw g.error; return g.data.arrayBuffer(); }).then(function(buf){ return needLibs(['GLTFLoader','DRACOLoader']).then(function(){ return mcApply(id,buf,meta); }); }); })
        .then(function(ok){ if(ok) down++; }).catch(function(e){ console.warn('model indirilemedi',id,e); })); });
    Object.keys(local).forEach(function(id){ if(cloud[id]||!AIRCRAFT[id]||!local[id].glb) return;
      jobs.push(mcUpload(id,local[id]).then(function(ok){ if(ok) up++; })); });
    return Promise.all(jobs);
  }).then(function(){ if(down) toast(down+' model buluttan geri yüklendi','#7dffb0'); if(up) toast(up+' model buluta yedeklendi','#b8ecff'); })
  .catch(function(e){ MCLOUD.err=e&&e.message||String(e); console.warn('model bulut eşitleme',MCLOUD.err); })
  .finally(function(){ MCLOUD.busy=false; }); }
libPersist=HOOK.wrap('libPersist','ag/model-bulut#mcSoon',function(next){ return function(id){ next(id); mcSoon(id); }; },libPersist);
libRemoveSkin=HOOK.wrap('libRemoveSkin','ag/model-bulut#mcRemove',function(next){ return function(){ const id=LIB.item&&LIB.item.kind==='ac'?LIB.item.id:null; next(); if(id) mcRemove(id); }; },libRemoveSkin);
accAfterLogin=HOOK.wrap('accAfterLogin','ag/model-bulut#mcSync',function(next){ return function(){ const p=next(); Promise.resolve(p).then(function(ok){ if(ok) setTimeout(mcSync,800); }); return p; }; },accAfterLogin);
