/* ------------------------------------------------------------------ import: many formats → .glb, kept on this device (IndexedDB) */
const MDB={db:null};
function mdbOpen(){ if(MDB.db) return Promise.resolve(MDB.db); if(typeof indexedDB==='undefined') return Promise.reject(new Error('IndexedDB yok'));
  return new Promise(function(res,rej){ const r=indexedDB.open('ayyildiz-models',1); r.onupgradeneeded=function(){ r.result.createObjectStore('skins',{keyPath:'id'}); }; r.onsuccess=function(){ MDB.db=r.result; res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
function mdbTx(mode,fn){ return mdbOpen().then(function(db){ return new Promise(function(res,rej){ const tx=db.transaction('skins',mode), st=tx.objectStore('skins'), q=fn(st); tx.oncomplete=function(){ res(q&&q.result); }; tx.onerror=function(){ rej(tx.error); }; }); }); }
function mdbPut(rec){ return mdbTx('readwrite',function(s){ return s.put(rec); }); }
function mdbDel(id){ return mdbTx('readwrite',function(s){ return s.delete(id); }); }
function mdbAll(){ return mdbTx('readonly',function(s){ return s.getAll(); }); }
/* models saved on this device win over assets/models.json */
function localModelsInit(){
  mdbAll().then(function(list){ (list||[]).forEach(function(r){ if(!AIRCRAFT[r.id]||!r.glb) return;
    gltfLoader().then(function(l){ l.parse(r.glb,'',function(g){ LIB.raw[r.id]={root:g.scene, glb:r.glb, name:r.name}; setSkin(r.id,g.scene,Object.assign({},r.spec,{local:true})); if(LIB.on) libRenderList(); },function(){}); }); }); }).catch(function(){});
}
const EXT_PRI=['glb','gltf','fbx','obj','dae','stl'];
function extOf(n){ const m=/\.([a-z0-9]+)$/i.exec(n||''); return m?m[1].toLowerCase():''; }
function importFiles(files,id){
  files=Array.prototype.slice.call(files||[]); if(!files.length) return;
  id=id||(LIB.item&&LIB.item.kind==='ac'?LIB.item.id:selectedId);
  const main=EXT_PRI.map(function(e){ return files.find(function(f){ return extOf(f.name)===e; }); }).find(Boolean);
  if(!main){ libMsg('Desteklenen model dosyası yok (.glb .gltf .fbx .obj .stl .dae)',true); return; }
  const ext=extOf(main.name), urls={}; files.forEach(function(f){ urls[f.name.toLowerCase()]=URL.createObjectURL(f); });
  const mgr=new THREE.LoadingManager(); mgr.setURLModifier(function(u){ if(/^(blob|data):/.test(u)&&!/\/[^\/]*\.[a-z0-9]{2,4}$/i.test(u)) return u; const n=decodeURIComponent(u.split(/[\\\/]/).pop().split('?')[0]).toLowerCase(); return urls[n]||u; });
  libMsg('Model okunuyor: '+main.name+' …');
  const need={glb:['GLTFLoader','DRACOLoader'],gltf:['GLTFLoader','DRACOLoader'],fbx:['fflate','NURBSUtils','NURBSCurve','TGALoader','FBXLoader'],obj:['MTLLoader','OBJLoader'],dae:['TGALoader','ColladaLoader'],stl:['STLLoader']}[ext].concat(['GLTFExporter']);
  const done=function(){ Object.keys(urls).forEach(function(k){ URL.revokeObjectURL(urls[k]); }); };
  needLibs(need).then(function(){ return readModel(ext,main,files,mgr,urls); }).then(function(root){
    if(!root) throw new Error('boş model');
    if(ext==='glb') return main.arrayBuffer().then(function(buf){ return {root:root, glb:buf}; });
    return toGLB(root).then(function(buf){ return gltfLoader().then(function(l){ return new Promise(function(res,rej){ l.parse(buf,'',function(g){ res({root:g.scene, glb:buf}); },rej); }); }); });
  }).then(function(r){
    done(); const prev=MODELS.skins[id]&&MODELS.skins[id].spec&&MODELS.skins[id].spec.local?MODELS.skins[id].spec:null;
    const spec={rotation:ext==='stl'?[-90,0,0]:[0,0,0], local:true};   /* STL files are usually Z-up */
    if(prev&&LIB.raw[id]&&LIB.raw[id].name===main.name){ spec.rotation=prev.rotation.slice(); }
    LIB.raw[id]={root:r.root, glb:r.glb, name:main.name}; setSkin(id,r.root,spec); libPersist(id);
    libMsg(AIRCRAFT[id].name+' ← '+main.name+' ('+Math.round(r.glb.byteLength/1024)+' KB). Yön yanlışsa Model sekmesinden döndür.');
    if(LIB.on){ libSelect('ac:'+id); libTab('model'); }
  }).catch(function(e){ done(); console.warn(e); libMsg('Model yüklenemedi: '+(e&&e.message||e),true); });
}
function readModel(ext,main,files,mgr,urls){
  if(ext==='glb'||ext==='gltf') return gltfLoader().then(function(l){ return new Promise(function(res,rej){
    if(ext==='glb') main.arrayBuffer().then(function(b){ l.parse(b,'',function(g){ res(g.scene); },rej); });
    else { const l2=new THREE.GLTFLoader(mgr); if(l.dracoLoader) l2.setDRACOLoader(l.dracoLoader); l2.load(urls[main.name.toLowerCase()],function(g){ res(g.scene); },undefined,rej); } }); });
  if(ext==='fbx') return main.arrayBuffer().then(function(b){ return new THREE.FBXLoader(mgr).parse(b,''); });
  if(ext==='stl') return main.arrayBuffer().then(function(b){ const g=new THREE.STLLoader().parse(b); g.computeVertexNormals();
    const col=g.hasColors?new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.5,metalness:0.2}):new THREE.MeshStandardMaterial({color:0xa9b1b8,roughness:0.5,metalness:0.25}); const m=new THREE.Mesh(g,col); m.name='stl'; const r=new THREE.Group(); r.add(m); return r; });
  if(ext==='dae') return main.text().then(function(t){ return new THREE.ColladaLoader(mgr).parse(t,'').scene; });
  if(ext==='obj'){ const mtl=files.find(function(f){ return extOf(f.name)==='mtl'; });
    return (mtl?mtl.text():Promise.resolve(null)).then(function(mt){ return main.text().then(function(t){ const ol=new THREE.OBJLoader(mgr);
      if(mt){ const mats=new THREE.MTLLoader(mgr).parse(mt,''); mats.preload(); ol.setMaterials(mats); } return ol.parse(t); }); }); }
  return Promise.reject(new Error('desteklenmeyen biçim'));
}
function toGLB(root){ return new Promise(function(res,rej){ try{ new THREE.GLTFExporter().parse(root,function(b){ res(b); },{binary:true, onlyVisible:true, embedImages:true, maxTextureSize:2048}); }catch(e){ rej(e); } }); }
function libPersist(id){ const r=LIB.raw[id], sk=MODELS.skins[id]; if(!r||!sk) return;
  const spec=libSpecOut(sk.spec); mdbPut({id:id, name:r.name, glb:r.glb, spec:spec}).catch(function(e){ libMsg('Cihaza kaydedilemedi: '+(e&&e.message||e),true); }); }
function libSpecOut(s){ const o={rotation:(s.rotation||[0,0,0]).slice()}; ['length','offset','gearNodes','propNodes','surfaces','flames'].forEach(function(k){ if(s[k]!=null&&!(Array.isArray(s[k])&&!s[k].length)) o[k]=JSON.parse(JSON.stringify(s[k])); }); return o; }
function libReskin(patch){
  const it=LIB.item; if(!it||it.kind!=='ac') return; const id=it.id, sk=MODELS.skins[id], r=LIB.raw[id]; if(!sk||!r) return;
  const spec=Object.assign({},sk.spec,patch); if(r.root.parent) r.root.parent.remove(r.root);
  setSkin(id,r.root,spec); libPersist(id); libSelectKeep();
}
function libSelectKeep(){ const yaw=LIB.yaw, pitch=LIB.pitch, d=LIB.dist/LIB.dist0, tests=Object.assign({},LIB.tests); libSelect(LIB.item.key); LIB.yaw=yaw; LIB.pitch=pitch; LIB.dist=LIB.dist0*d; Object.assign(LIB.tests,tests,{wire:false}); libApplyTests(); libStores(); libRefreshTests(); }
function libRemoveSkin(){ const it=LIB.item; if(!it||it.kind!=='ac') return; const id=it.id; clearSkin(id); delete LIB.raw[id]; mdbDel(id).catch(function(){});
  if(MODELS.manifest&&MODELS.manifest.models&&MODELS.manifest.models[id]){ MODELS.busy[id]=null; loadModelFile(id,MODELS.manifest.models[id]); }
  libMsg(AIRCRAFT[id].name+' kod modeline döndü'); libSelectKeep(); }
const PART_ROLES=[['','—'],['gear','İniş takımı'],['prop','Pervane'],['ail_l','Kanatçık sol'],['ail_r','Kanatçık sağ'],['elev','İrtifa dümeni'],['rud','İstikamet dümeni']];
function libPartRole(spec,n){
  if((spec.gearNodes||[]).indexOf(n)>=0) return 'gear'; if((spec.propNodes||[]).indexOf(n)>=0) return 'prop';
  const s=(spec.surfaces||[]).find(function(x){ return x.node===n; }); if(!s) return '';
  return s.input==='roll'?(s.sign<0?'ail_l':'ail_r'):(s.input==='pitch'?'elev':'rud');
}
function libSetPart(n,role){
  const sk=MODELS.skins[LIB.item.id]; const s=sk.spec;
  const gear=(s.gearNodes||[]).filter(function(x){ return x!==n; }), prop=(s.propNodes||[]).filter(function(x){ return x!==n; }), surf=(s.surfaces||[]).filter(function(x){ return x.node!==n; });
  if(role==='gear') gear.push(n); else if(role==='prop') prop.push(n);
  else if(role==='ail_l') surf.push({node:n,axis:'x',input:'roll',max:18,sign:-1}); else if(role==='ail_r') surf.push({node:n,axis:'x',input:'roll',max:18,sign:1});
  else if(role==='elev') surf.push({node:n,axis:'x',input:'pitch',max:20,sign:1}); else if(role==='rud') surf.push({node:n,axis:'y',input:'yaw',max:22,sign:1});
  libReskin({gearNodes:gear.length?gear:null, propNodes:prop.length?prop:null, surfaces:surf});
  if(role==='surf'||/ail|elev|rud/.test(role)){ LIB.tests.surf=true; libRefreshTests(); }
}
function libFlashPart(n){
  const m=LIB.inst; if(!m||!m.skin) return; const o=m.skin.getObjectByName(n); if(!o) return; const mats=[];
  o.traverse(function(c){ if(!c.isMesh) return; const arr=Array.isArray(c.material)?c.material:[c.material];
    const nm=arr.map(function(x){ const k=x.clone(); mats.push({m:k,e:x.emissive?x.emissive.getHex():0}); return k; }); c.material=Array.isArray(c.material)?nm:nm[0]; });
  LIB.flash={t:1.6, mats:mats};
}
function libRefreshModel(){
  const it=LIB.item; if(!it||it.kind!=='ac') return; const id=it.id, sk=MODELS.skins[id], r=LIB.raw[id];
  const editable=!!(sk&&r);
  $('libModelNote').textContent=sk?(editable?'İçe aktarılmış model: '+r.name+'. Yön, boy ve hareketli parçaları buradan ayarla; değişiklikler bu cihazda saklanır.':'Bu model assets/models.json dosyasından geliyor. Düzenlemek için aynı dosyayı buradan içe aktar.'):'Şu an kodla çizilen model kullanılıyor. Kendi modelini yükleyebilirsin; oyunda hangar, sen ve yapay zekâ kopyalarına uygulanır.';
  $('libSkinBox').hidden=!editable; $('libJsonOut').hidden=true; if(!editable) return;
  const s=sk.spec; $('libRotV').textContent='Döndürme: X '+s.rotation[0]+'°, Y '+s.rotation[1]+'°, Z '+s.rotation[2]+'° · burun kırmızı oka (Kılavuz) bakmalı';
  const bb=libBox(); $('libLen').value=(s.length||(bb.max.z-bb.min.z)).toFixed(1); $('libOffY').value=s.offset?s.offset[1]:0;
  const names=[]; r.root.traverse(function(o){ if(o!==r.root&&o.name&&names.indexOf(o.name)<0&&names.length<300) names.push(o.name); });
  $('libParts').innerHTML=names.length?names.map(function(n){ const role=libPartRole(s,n);
    return '<div class="pr"><button type="button" data-n="'+n.replace(/"/g,'&quot;')+'" title="'+n.replace(/"/g,'&quot;')+'">'+n.replace(/</g,'&lt;')+'</button><select data-n="'+n.replace(/"/g,'&quot;')+'">'+PART_ROLES.map(function(p){ return '<option value="'+p[0]+'"'+(p[0]===role?' selected':'')+'>'+p[1]+'</option>'; }).join('')+'</select></div>'; }).join(''):'<div class="pr">Modelde adlandırılmış parça yok</div>';
}
function libJsonLine(){
  const id=LIB.item.id, s=libSpecOut(MODELS.skins[id].spec), o={file:'assets/models/'+id+'.glb'}; Object.assign(o,s);
  const txt='"'+id+'": '+JSON.stringify(o);
  const el=$('libJsonOut'); el.textContent=txt+'\n\n.glb dosyasını assets/models/'+id+'.glb olarak kaydet (Bilgi → .glb olarak indir).'; el.hidden=false;
  try{ navigator.clipboard.writeText(txt).then(function(){ libMsg('models.json satırı kopyalandı'); },function(){}); }catch(e){}
}
/* export what is on screen (code model or imported one, with current paint) as .glb */
function libExport(){
  const it=LIB.item; if(!it||!LIB.obj) return; libMsg('.glb hazırlanıyor…');
  needLibs(['GLTFExporter']).then(function(){
    const m=LIB.inst, hide=[]; if(m){ m.flames.forEach(function(f){ [f.outer,f.inner].forEach(function(x){ if(x.visible){ x.visible=false; hide.push(x); } }); }); }
    if(LIB.helpers) LIB.helpers.forEach(function(h){ h.visible=false; });
    const wire=LIB.wireMats.slice(); libWire(false);
    const pos=LIB.obj.position.clone(); LIB.obj.position.set(0,0,0); LIB.obj.updateMatrixWorld(true);
    return toGLB(LIB.obj).then(function(buf){ LIB.obj.position.copy(pos); hide.forEach(function(x){ x.visible=true; }); if(LIB.helpers) LIB.helpers.forEach(function(h){ h.visible=true; }); if(wire.length) libWire(true);
      const name=(it.kind==='ac'?it.id:it.key.replace(':','-'))+'.glb', a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([buf],{type:'model/gltf-binary'})); a.download=name; document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },2000); libMsg(name+' indirildi ('+Math.round(buf.byteLength/1024)+' KB)'); LIB.lastExport=buf; });
  }).catch(function(e){ libMsg('Dışa aktarılamadı: '+(e&&e.message||e),true); });
}
/* ---- wiring */
$('libList').addEventListener('click',function(e){ const c=e.target.closest('button[data-cat]'); if(c){ LIB.cat=c.dataset.cat; libRenderList(); const f=libItems().find(function(i){ return i.cat===LIB.cat&&!i.head&&!i.off; }); if(f&&(!LIB.item||LIB.item.cat!==LIB.cat)) libSelect(f.key); return; } const b=e.target.closest('button[data-k]'); if(b) libSelect(b.dataset.k); });
$('libTabs').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled) libTab(b.dataset.t); });
$('libTests').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled) libToggle(b.dataset.x); });
$('btnLibBack').addEventListener('click',closeLibrary);
$('libBg').addEventListener('click',function(){ libSetBg((LIB.bg+1)%LIB_BGS.length); });
$('libRot').addEventListener('click',function(){ LIB.auto=!LIB.auto; $('libRot').setAttribute('aria-pressed',String(LIB.auto)); });
$('libGuide').addEventListener('click',function(){ LIB.guides=!LIB.guides; $('libGuide').setAttribute('aria-pressed',String(LIB.guides)); libGuides(LIB.guides); });
$('libReset').addEventListener('click',function(){ LIB.yaw=0.9; LIB.pitch=0.28; LIB.dist=LIB.dist0; LIB.idle=0; });
$('libExport').addEventListener('click',libExport);
$('libColors').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; livSet(LIB.item.id,{color:b.dataset.col||null}); });
$('libColor').addEventListener('input',function(e){ livSet(LIB.item.id,{color:e.target.value}); });
$('libCamo').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b) livSet(LIB.item.id,{camo:+b.dataset.c}); });
$('libColor2').addEventListener('input',function(e){ livSet(LIB.item.id,{camo2:e.target.value, camo:(LIV.data[LIB.item.id]||{}).camo||1}); });
$('libCamoS').addEventListener('input',function(e){ livSet(LIB.item.id,{camoS:+e.target.value}); });
$('libGloss').addEventListener('input',function(e){ livSet(LIB.item.id,{gloss:+e.target.value}); });
$('libLookReset').addEventListener('click',function(){ livReset(LIB.item.id); });
$('libImport').addEventListener('click',function(){ $('libFile').click(); });
$('libFile').addEventListener('change',function(e){ importFiles(e.target.files); e.target.value=''; });
document.querySelector('#libSkinBox .seg').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; const sk=MODELS.skins[LIB.item.id]; const r=sk.spec.rotation.slice(); r[+b.dataset.r]=(r[+b.dataset.r]+90)%360; libReskin({rotation:r}); });
$('libLen').addEventListener('change',function(e){ const v=+e.target.value; if(v>0.5) libReskin({length:v, scale:null}); });
$('libOffY').addEventListener('change',function(e){ libReskin({offset:[0,+e.target.value,0]}); });
$('libParts').addEventListener('click',function(e){ const b=e.target.closest('button[data-n]'); if(b) libFlashPart(b.dataset.n); });
$('libParts').addEventListener('change',function(e){ const s=e.target.closest('select'); if(s) libSetPart(s.dataset.n,s.value); });
$('libJson').addEventListener('click',libJsonLine);
$('libRemove').addEventListener('click',libRemoveSkin);
$('btnLibOpen').addEventListener('click',function(){ if(state==='menu') openLibrary(); else toast('Model kütüphanesi ana menüden açılır','#ffc24a'); });
window.addEventListener('dragover',function(e){ if(e.dataTransfer&&Array.prototype.indexOf.call(e.dataTransfer.types||[],'Files')>=0) e.preventDefault(); });
window.addEventListener('drop',function(e){ const f=e.dataTransfer&&e.dataTransfer.files; if(!f||!f.length) return; e.preventDefault(); if(state==='menu'&&!LIB.on) openLibrary('ac:'+selectedId); if(LIB.on) importFiles(f); });
