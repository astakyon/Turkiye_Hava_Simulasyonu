/* ------------------------------------------------------------------ assets: optional libraries and 3D models (GLB/GLTF)
   Every vehicle is first built from code (always works, no download). If assets/models.json lists a .glb file
   for an id, that model is loaded in the background and "skins" every copy of the vehicle (player, hangar, AI).
   See docs/ARCHITECTURE.md → "3B modeller". */
const VENDOR={base:'vendor/three-r128/', cdn:'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/',
  files:{CopyShader:'shaders/CopyShader.js', LuminosityHighPassShader:'shaders/LuminosityHighPassShader.js', FXAAShader:'shaders/FXAAShader.js',
    EffectComposer:'postprocessing/EffectComposer.js', RenderPass:'postprocessing/RenderPass.js', ShaderPass:'postprocessing/ShaderPass.js', UnrealBloomPass:'postprocessing/UnrealBloomPass.js',
    GLTFLoader:'loaders/GLTFLoader.js', DRACOLoader:'loaders/DRACOLoader.js', GLTFExporter:'exporters/GLTFExporter.js',
    FBXLoader:'loaders/FBXLoader.js', OBJLoader:'loaders/OBJLoader.js', MTLLoader:'loaders/MTLLoader.js', STLLoader:'loaders/STLLoader.js', ColladaLoader:'loaders/ColladaLoader.js', TGALoader:'loaders/TGALoader.js',
    NURBSUtils:'curves/NURBSUtils.js', NURBSCurve:'curves/NURBSCurve.js', fflate:'libs/fflate.min.js'}};
const LIBS={};
function loadScript(src){ return new Promise(function(res,rej){ const s=document.createElement('script'); s.src=src; s.async=false; s.onload=function(){ res(); }; s.onerror=function(){ s.remove(); rej(new Error('yüklenemedi: '+src)); }; document.head.appendChild(s); }); }
/* load three.js add-ons on demand: first from our own vendor/ folder (works offline / in the Android app), then from the CDN */
function needLibs(names){
  return names.reduce(function(p,n){ return p.then(function(){
    if(THREE[n]||(n==='fflate'&&typeof window!=='undefined'&&window.fflate)) return; if(LIBS[n]) return LIBS[n];
    const f=VENDOR.files[n]; if(!f) throw new Error('bilinmeyen kitaplık '+n);
    LIBS[n]=loadScript(VENDOR.base+f.split('/').pop()).catch(function(){ return loadScript(VENDOR.cdn+f); });
    return LIBS[n];
  }); },Promise.resolve());
}
const MODELS={manifest:null, skins:{}, inst:{}, loader:null, busy:{}, preview:null};
/* every built vehicle goes through here so a model file can replace its look later */
function buildModel(id){ const def=AIRCRAFT[id]||AIRCRAFT.kaan, m=def.build(); upgradeModel(m.group); return trackModel(AIRCRAFT[id]?id:'kaan',m); }
function trackModel(id,m){ m.acId=id; (MODELS.inst[id]||(MODELS.inst[id]=[])).push(m); if(MODELS.skins[id]) applySkin(m,MODELS.skins[id]); applyLivery(m); return m; }
function untrackModel(m){ const L=MODELS.inst[m&&m.acId]; if(!L) return; const i=L.indexOf(m); if(i>=0) L.splice(i,1); }
function gltfLoader(){
  return needLibs(['GLTFLoader','DRACOLoader']).then(function(){
    if(MODELS.loader) return MODELS.loader;
    const l=new THREE.GLTFLoader();
    /* Draco-compressed models: decoder from vendor/ when it is there (GitHub Pages, Android app), else from the CDN */
    const local=VENDOR.base+'draco/', cdn='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/gltf/';
    return fetch(local+'draco_wasm_wrapper.js',{method:'HEAD'}).then(function(r){ return r.ok?local:cdn; },function(){ return cdn; }).then(function(path){
      try{ const d=new THREE.DRACOLoader(); d.setDecoderPath(path); d.setDecoderConfig({type:'wasm'}); l.setDRACOLoader(d); }catch(e){}
      MODELS.loader=l; return l; });
  });
}
/* parts of the code-built model the game still needs on top of any skin */
function skinKeep(m,spec){
  const k=new Set(); (m.flames||[]).forEach(function(f){ k.add(f.outer); k.add(f.inner); (f.ds||[]).forEach(function(d){ k.add(d); }); });
  if(m.strobe) k.add(m.strobe); if(m.gear&&!spec.gearNodes) k.add(m.gear); if(!spec.propNodes) (m.spinners||[]).forEach(function(s){ k.add(s.obj); });
  return k;
}
function isNavLight(c){ return c.isMesh&&c.material&&c.material.isMeshBasicMaterial&&c.geometry&&c.geometry.type==='SphereGeometry'&&c.geometry.parameters&&c.geometry.parameters.radius<0.3; }
/* prepare a loaded scene once: our colour pipeline, shadows, reflections, then fit it to the vehicle's real size */
function makeSkin(id,root,spec){
  spec=Object.assign({rotation:[0,0,0]},spec||{});
  if(!root.userData.prepared) root.traverse(function(o){ if(!o.isMesh) return; o.castShadow=true; o.receiveShadow=true; o.userData.rs=true; o.userData.cs=true;
    (Array.isArray(o.material)?o.material:[o.material]).forEach(function(mt){ if(!mt) return;
      ['map','emissiveMap'].forEach(function(k){ if(mt[k]){ mt[k].encoding=THREE.LinearEncoding; mt[k].needsUpdate=true; } });   /* game renders in display colours */
      if(mt.color&&mt.color.convertLinearToSRGB) mt.color.convertLinearToSRGB(); if(mt.emissive&&mt.emissive.convertLinearToSRGB) mt.emissive.convertLinearToSRGB();
      if(mt.isMeshStandardMaterial&&!mt.envMap){ mt.envMap=ENVMAP; mt.envMapIntensity=0.9; } mt.needsUpdate=true; }); });
  root.userData.prepared=true;
  const inner=new THREE.Group(); inner.add(root); inner.rotation.set(spec.rotation[0]*D2R,spec.rotation[1]*D2R,spec.rotation[2]*D2R);
  const fit=new THREE.Group(); fit.add(inner); fit.updateMatrixWorld(true);
  /* size and place it like the code-built model (same length, centre and wheel height) */
  const ref=(MODELS.inst[id]&&MODELS.inst[id][0])||null, def=AIRCRAFT[id]||{};
  const rb=new THREE.Box3(); if(ref){ const keep=skinKeep(ref,{}); keep.add(ref.gear); ref.group.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(ref.group.matrixWorld).invert();
    ref.group.children.forEach(function(c){ if(keep.has(c)||isNavLight(c)||(c.userData&&(c.userData.skin||c.userData.keep))) return; const b=new THREE.Box3().setFromObject(c); if(!b.isEmpty()){ b.applyMatrix4(inv); rb.union(b); } }); }
  const gb=new THREE.Box3().setFromObject(fit), gs=gb.getSize(new THREE.Vector3()), gc=gb.getCenter(new THREE.Vector3());
  const L=spec.length||(rb.isEmpty()?(def.lenM||12):(rb.max.z-rb.min.z));
  const s=spec.scale||(gs.z>1e-6?L/gs.z:1); fit.scale.setScalar(s);
  const rc=rb.isEmpty()?new THREE.Vector3():rb.getCenter(new THREE.Vector3());
  let y=rc.y-gc.y*s; if(spec.gearNodes&&def.gearOff!=null) y=-def.gearOff-gb.min.y*s;
  fit.position.set(rc.x-gc.x*s, y, rc.z-gc.z*s);
  if(spec.offset) fit.position.add(new THREE.Vector3().fromArray(spec.offset));
  fit.userData.skin=true;
  return {id:id, scene:fit, spec:spec, fitScale:s};
}
function applySkin(m,skin){
  removeSkin(m);
  const spec=skin.spec, keep=skinKeep(m,spec), v=skin.scene.clone(true); v.userData.skin=true;
  m.hidden=[]; m.group.children.forEach(function(c){ if((keep.has(c)&&c!==m.strobe)||(spec.keepLights&&isNavLight(c))||c.userData.keep||!c.visible) return; c.visible=false; m.hidden.push(c); });
  if(m.strobe&&!spec.keepLights){ m.strobeOff=m.strobe; m.strobe=null; }
  m.group.add(v); m.skin=v;
  const byName=function(n){ return v.getObjectByName(n); };
  if(spec.gearNodes&&m.gear){ m.gearNodes=spec.gearNodes.map(byName).filter(Boolean); m.gear.children.forEach(function(c){ if(c.visible){ c.visible=false; m.hidden.push(c); } }); }
  if(spec.propNodes){ m.spinBack=m.spinners; m.spinners=spec.propNodes.map(byName).filter(Boolean).map(function(n){ return {obj:n, disc:{material:{opacity:0}}}; }); }
  m.surfaces=(spec.surfaces||[]).map(function(s){ const n=byName(s.node); return n?{n:n, axis:s.axis||'x', input:s.input||'pitch', max:(s.max||20)*D2R, sign:s.sign||1, base:n.rotation[s.axis||'x']}:null; }).filter(Boolean);
  if(spec.flames&&m.flames) spec.flames.forEach(function(p,i){ const f=m.flames[i]; if(!f) return; f.outer.position.fromArray(p); f.inner.position.fromArray(p); f.base=p.slice(); });
  if(renderer.shadowMap.enabled) v.traverse(function(o){ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
}
function removeSkin(m){
  if(!m.skin) return; m.group.remove(m.skin); m.skin=null;
  (m.hidden||[]).forEach(function(c){ c.visible=true; }); m.hidden=[]; m.gearNodes=null; m.surfaces=null; if(m.strobeOff){ m.strobe=m.strobeOff; m.strobeOff=null; }
  if(m.spinBack){ m.spinners=m.spinBack; m.spinBack=null; }
}
function setSkin(id,root,spec){
  const skin=makeSkin(id,root,spec); MODELS.skins[id]=skin;
  (MODELS.inst[id]||[]).forEach(function(m){ applySkin(m,skin); });
  return skin;
}
function clearSkin(id){ delete MODELS.skins[id]; (MODELS.inst[id]||[]).forEach(removeSkin); }
/* per frame: gear doors / props / control surfaces of skinned models follow the game */
function skinSync(){
  for(const id in MODELS.skins){ (MODELS.inst[id]||[]).forEach(function(m){ if(m.gearNodes){ const on=m.gear?m.gear.visible:true; m.gearNodes.forEach(function(n){ n.visible=on; }); } }); }
  if(model&&model.surfaces&&model.surfaces.length){ const inp={pitch:S.pitchIn||0, roll:S.rollIn||0, yaw:S.yawIn||0};
    model.surfaces.forEach(function(s){ s.n.rotation[s.axis]=s.base+clamp(inp[s.input],-1,1)*s.max*s.sign; }); }
}
/* read assets/models.json and load what it lists (selected vehicle first) */
function modelsInit(){
  localModelsInit();
  if(typeof fetch!=='function'||typeof location==='undefined'||location.protocol==='file:') return;
  fetch('assets/models.json',{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; }).then(function(j){
    if(!j||!j.models) return; MODELS.manifest=j;
    const ids=Object.keys(j.models).filter(function(id){ return j.models[id]&&j.models[id].file&&AIRCRAFT[id]; });
    ids.sort(function(a,b){ return (b===selectedId)-(a===selectedId); });
    ids.reduce(function(p,id){ return p.then(function(){ return loadModelFile(id,j.models[id]); }); },Promise.resolve());
  }).catch(function(){});
}
function loadModelFile(id,spec){
  if(MODELS.busy[id]) return MODELS.busy[id];
  MODELS.busy[id]=gltfLoader().then(function(l){ return new Promise(function(res){ l.load(spec.file,function(g){ if(MODELS.skins[id]&&MODELS.skins[id].spec.local){ res(false); return; } setSkin(id,g.scene,spec); res(true); },undefined,function(e){ console.warn('model yüklenemedi',spec.file,e); res(false); }); }); });
  return MODELS.busy[id];
}
