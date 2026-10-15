/* ------------------------------------------------------------------ performance and depth (V1.94)
   Measured in flight over the base: ~840 draw calls and ~1.6 M triangles per frame, two thirds of them in instanced meshes
   (forests, rocks, parked and moving cars) that were drawn across the whole 30 km island whatever the camera saw.
   • Traffic: only cars near the camera are written to the GPU; far cars keep driving on paper (no terrain lookups).
   • Static instanced groups get real bounding spheres so the frustum skips them; whole tiles whose single objects would be
     smaller than a few pixels are hidden; far forests thin out with distance.
   • Smart performance ladder: when the frame rate stays low after the resolution has already dropped, shadows and effects
     switch off temporarily, then distant detail is reduced; everything comes back when it runs smoothly again.
   • FPS limit (30 / 60 / unlimited): phones default to 60 so 90–120 Hz screens do not heat the phone for nothing.
   • Depth split (phones and "Standart" depth): the scene is drawn in two depth ranges (far, then near after a depth clear),
     each with its own near/far planes. This removes the depth-precision bands ("black waves") on GPUs without a logarithmic
     depth buffer. Water also sits on a subdivided plane with a small depth offset and per-vertex lighting on phones. */
const PERF2={lvl:0, bad:0, good:0, told:0, t:0, cap:0, capLast:0, split:0, splitMid:0, tr:0, inst:[], ii:0, ib:0};
const PERF_LVL_TXT=['','Akıcılık için gölgeler ve efektler geçici olarak kapatıldı','Akıcılık için uzak ayrıntı azaltıldı','Akıcılık için en hafif görüntüye geçildi'];
/* ---- FPS limit */
function fpsCap(){ const c=SETTINGS.fpsCap; if(c==null) return DEV.mobile?60:0; return +c||0; }
const _p2Frame=frame;
frame=function(now){ const cap=fpsCap();
  if(cap>0&&now){ const iv=1000/cap; if(now-PERF2.capLast<iv-2.5){ requestAnimationFrame(frame); return; } PERF2.capLast=(now-PERF2.capLast>iv*3)?now:PERF2.capLast+iv; }
  _p2Frame(now); };
/* ---- depth split */
function splitWanted(){ return !DEV.logDepth&&SETTINGS.split!==false; }
(function(){ if(!renderer||typeof renderer.render!=='function') return; const rr=renderer.render.bind(renderer);
  renderer.render=function(sc,cam){
    if(sc!==scene||cam!==camera) return rr(sc,cam);
    const stat=function(){ try{ const i=renderer.info.render; PERF2.calls=i.calls; PERF2.tris=i.triangles; }catch(e){} };
    const n=cam.near, f=cam.far, mid=Math.max(n*500,120);
    if(!splitWanted()||!(mid<f*0.6)){ PERF2.split=0; rr(sc,cam); stat(); return; }
    PERF2.split=1; PERF2.splitMid=mid;
    const ac=renderer.autoClear, au=renderer.shadowMap.autoUpdate, ar=renderer.info.autoReset;
    try{
      cam.near=mid; cam.updateProjectionMatrix(); rr(sc,cam);                                      /* far range: sky, terrain, sea, distant objects */
      renderer.info.autoReset=false; renderer.autoClear=false; renderer.shadowMap.autoUpdate=false; renderer.clearDepth();
      const sv=sky.visible; sky.visible=false; cam.near=n; cam.far=mid; cam.updateProjectionMatrix(); rr(sc,cam); sky.visible=sv; stat();   /* near range */
    } finally { cam.near=n; cam.far=f; cam.updateProjectionMatrix(); renderer.autoClear=ac; renderer.shadowMap.autoUpdate=au; renderer.info.autoReset=ar; }
  }; })();
/* ---- water: subdivided, pulled slightly towards the camera over shallow sea floor; phones use per-vertex lighting */
function waterFix(){ const w=GFX.water; if(!w||w.userData.fixed) return; w.userData.fixed=true;
  try{ const g=new THREE.PlaneGeometry(90000,90000,48,48); g.rotateX(-Math.PI/2); if(w.geometry&&w.geometry.dispose) w.geometry.dispose(); w.geometry=g; }catch(e){}
  try{ let m=w.material; if(DEV.mobile&&m&&m.isMeshPhongMaterial){ const l=new THREE.MeshLambertMaterial({color:m.color.getHex(), transparent:true, opacity:m.opacity}); m.dispose&&m.dispose(); w.material=l; m=l; }
    m.polygonOffset=true; m.polygonOffsetFactor=-1; m.polygonOffsetUnits=-2; m.needsUpdate=true; }catch(e){} }
/* ---- traffic: only nearby cars are uploaded */
function trafficRadius(){ const q=SETTINGS.quality||0; return (DEV.mobile?[1200,1800,2500,3200]:[2000,3200,4500,6000])[q]*(PERF2.lvl>=2?0.6:1); }
trafficStep=function(dt){
  const T1=TRAFFIC; if(!T1.mesh) return; const mt=trafficStep.mt||(trafficStep.mt=new THREE.Matrix4()), q=trafficStep.q||(trafficStep.q=new THREE.Quaternion()), s=trafficStep.s||(trafficStep.s=new THREE.Vector3(1,1,1)), p=trafficStep.p||(trafficStep.p=new THREE.Vector3());
  const cp=camera.position, R=trafficRadius(), R2=R*R; let j=0;
  for(let k=0;k<T1.cars.length;k++){ const c=T1.cars[k], P=c.P; c.s+=c.dir*c.v*dt;
    if(c.s>P.len-3){ c.s=P.len-3; c.dir=-1; } else if(c.s<3){ c.s=3; c.dir=1; }
    while(c.i<P.L.length-2&&P.L[c.i+1]<c.s) c.i++; while(c.i>0&&P.L[c.i]>c.s) c.i--;
    const a=P.pts[c.i], b=P.pts[c.i+1], dx0=a[0]-cp.x, dz0=a[1]-cp.z; if(dx0*dx0+dz0*dz0>R2*1.6&&(b[0]-cp.x)*(b[0]-cp.x)+(b[1]-cp.z)*(b[1]-cp.z)>R2*1.6) continue;
    const seg=P.L[c.i+1]-P.L[c.i]||1, u=(c.s-P.L[c.i])/seg, cx=a[0]+(b[0]-a[0])*u, cz=a[1]+(b[1]-a[1])*u;
    const ddx=cx-cp.x, ddz=cz-cp.z; if(ddx*ddx+ddz*ddz>R2) continue;
    let fx=(b[0]-a[0])/seg*c.dir, fz=(b[1]-a[1])/seg*c.dir; const x=cx-fz*2.0, z=cz+fx*2.0;
    const y=Math.max(groundH(x,z),groundH(cx,cz))+0.3;
    mt.compose(p.set(x,y,z),q.setFromAxisAngle(UP,Math.atan2(-fx,-fz)),s);
    T1.mesh.body.setMatrixAt(j,mt); T1.mesh.glass.setMatrixAt(j,mt); T1.mesh.wheel.setMatrixAt(j,mt); j++; }
  PERF2.tr=j; ['body','glass','wheel'].forEach(function(key){ const m=T1.mesh[key]; m.count=j; m.instanceMatrix.needsUpdate=true; });
};
/* ---- static instanced meshes: bounds, pixel-size cull and forest thinning */
function instDynSet(){ const d=new Set(); try{ ['body','glass','wheel'].forEach(function(k){ if(TRAFFIC.mesh) d.add(TRAFFIC.mesh[k]); }); }catch(e){} try{ if(GFX.clouds) d.add(GFX.clouds); }catch(e){} return d; }
function instPrep(){
  if(!scene||!scene.traverse) return 0; const dyn=instDynSet(), mt=new THREE.Matrix4(), v=new THREE.Vector3(), L=[];
  scene.traverse(function(o){ if(!o.isInstancedMesh||dyn.has(o)||o.userData.noCull||!o.geometry||!o.instanceMatrix) return; const g=o.geometry;
    let p=o.parent; while(p){ if(p===planeGroup||p.userData.noCull) return; p=p.parent; }
    if(o.userData.full){ /* chunk made by chunkInstances: its geometry sphere covers the tile; measure one object */
      if(o.userData.ir==null){ const keep=g.boundingSphere.clone(); g.computeBoundingSphere(); const gr=g.boundingSphere.radius; g.boundingSphere=keep;   /* computeBoundingSphere overwrites the same Sphere object: keep a copy (V2.09 fix) */ let sm=1; for(let i=0;i<Math.min(o.count,64);i++){ o.getMatrixAt(i,mt); sm=Math.max(sm,mt.getMaxScaleOnAxis()); } o.userData.ir=gr*sm; }
    } else {
      if(o.frustumCulled!==false||o.count<8) return;
      if(!g.boundingSphere) g.computeBoundingSphere(); const gr=g.boundingSphere.radius; if(!isFinite(gr)) return;
      let cx=0,cy=0,cz=0,sm=1; const n=o.count; for(let i=0;i<n;i++){ o.getMatrixAt(i,mt); v.setFromMatrixPosition(mt); cx+=v.x; cy+=v.y; cz+=v.z; sm=Math.max(sm,mt.getMaxScaleOnAxis()); }
      cx/=n; cy/=n; cz/=n; let R=0; for(let i=0;i<n;i++){ o.getMatrixAt(i,mt); v.setFromMatrixPosition(mt); R=Math.max(R,Math.hypot(v.x-cx,v.y-cy,v.z-cz)); }
      if(!(R>0)&&n>1) return; const ng=g.clone(); ng.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,cy,cz),R+gr*sm); o.geometry=ng;
      o.frustumCulled=true; o.userData.full=n; o.userData.ir=gr*sm; o.userData.bounded=true; }
    o.userData.bv=o.instanceMatrix.version; o.userData.noCull=true; o.userData.bs0=o.geometry.boundingSphere.clone(); L.push(o); });   /* the general size cull leaves these to instStep */
  PERF2.inst=L; PERF2.ii=0; return L.length; }
chunkInstances=HOOK.wrap('chunkInstances','performans/optimizasyon-1#_p2Chunk',function(_p2Chunk){ return function(){ const r=_p2Chunk(); try{ waterFix(); instPrep(); }catch(e){ console.warn('perf',e); } return r; }; },chunkInstances);
function treeDensity(){ return [0.35,0.7,1,1][SETTINGS.quality||0]*(PERF2.lvl>=2?0.6:1); }
function instStep(){
  const L=PERF2.inst, n=L.length; if(!n||!camera) return; const k=HH/(2*Math.tan(camera.fov*Math.PI/360)), cp=camera.position, px=(typeof CULL!=='undefined'?CULL.px:2.5)*1.4, v=instStep.v||(instStep.v=new THREE.Vector3()), td=treeDensity(), mob=DEV.mobile;
  const per=Math.max(24,Math.ceil(n/4));
  for(let c=0;c<per;c++){ if(PERF2.ii>=n) PERF2.ii=0; const o=L[PERF2.ii++], g=o.geometry; if(o.userData.bs0&&g&&(!g.boundingSphere||!g.boundingSphere.equals(o.userData.bs0))) g.boundingSphere=o.userData.bs0.clone(); const bs=g&&g.boundingSphere; if(!bs) continue;
    if(o.userData.bounded&&o.instanceMatrix.version!==o.userData.bv){ o.frustumCulled=false; o.layers.enable(0); L.splice(PERF2.ii-1,1); PERF2.ii--; return; }   /* it moves after all: draw it as before */
    v.copy(bs.center).applyMatrix4(o.matrixWorld); const d=Math.max(1,v.distanceTo(cp)-bs.radius), show=(o.userData.ir||1)*k/d>=px;
    if(show) o.layers.enable(0); else o.layers.disable(0);
    if(o.userData.tree){ const far=Math.max(0,d-(mob?1500:2500)), thin=Math.max(mob?0.3:0.4,1-far/(mob?7000:11000)); o.count=Math.max(0,Math.floor(o.userData.full*td*thin)); } }
}
(function(){ /* mark forest chunks once they exist */ const t=function(){ if(GFX.treeChunks) GFX.treeChunks.forEach(function(m){ m.userData.tree=true; }); }; chunkInstances=HOOK.wrap('chunkInstances','performans/optimizasyon-1#_ca',function(_ca){ return function(){ const r=_ca(); t(); return r; }; },chunkInstances); })();
cullStep=HOOK.wrap('cullStep','performans/optimizasyon-1#_p2Cull',function(_p2Cull){ return function(dt){ _p2Cull(dt); if(!CULL.on){ PERF2.inst.forEach(function(o){ o.layers.enable(0); }); return; } try{ instStep(); }catch(e){} }; },cullStep);
/* ---- smart performance ladder */
function perfLvlApply(){ if(typeof CULL!=='undefined') CULL.t=99;
  if(GFX.clouds&&GFX.cloudN) GFX.clouds.count=Math.floor(GFX.cloudN*[0.5,0.75,1,1][SETTINGS.quality||0]*(PERF2.lvl>=3?0.5:1)); }
applyShadows=HOOK.wrap('applyShadows','performans/optimizasyon-1#_p2Shadows',function(_p2Shadows){ return function(){ _p2Shadows(); if(PERF2.lvl>=1&&renderer.shadowMap.enabled){ renderer.shadowMap.enabled=false; sunLight.castShadow=false; } }; },applyShadows);
applyFX=HOOK.wrap('applyFX','performans/optimizasyon-1#_p2FX',function(_p2FX){ return function(){ _p2FX(); if(PERF2.lvl>=1){ FX.on=false; try{ glowApply(false); }catch(e){} } }; },applyFX);
perfMin=HOOK.wrap('perfMin','performans/optimizasyon-1#_p2Min',function(_p2Min){ return function(){ return PERF2.lvl>=3?(DEV.mobile?0.55:0.7):_p2Min(); }; },perfMin);
applyQuality=HOOK.wrap('applyQuality','performans/optimizasyon-1#_p2AQ',function(_p2AQ){ return function(){
  _p2AQ(); const fixed=SETTINGS.res&&SETTINGS.res!=='auto';
  if(DEV.mobile&&!fixed){ const q=SETTINGS.quality||0, cap=[1,1.25,1.5,1.75][q]; if(PERF.base>cap){ PERF.base=cap; renderer.setPixelRatio(PERF.base*PERF.scale); resize(); } }   /* 3x phone screens: 1.25x is already sharp */
  if(typeof CULL!=='undefined'&&PERF2.lvl>=2) CULL.px*=1.6; perfLvlApply(); }; },applyQuality);
function perfLadder(){
  if(!SETTINGS.autoPerf||(state!=='play'&&state!=='walk')){ PERF2.bad=PERF2.good=0; return; }
  const lo=DEV.mobile?32:38, atMin=(SETTINGS.res&&SETTINGS.res!=='auto')||PERF.scale<=perfMin()+0.001;
  if(PERF.fps<lo&&atMin){ PERF2.bad++; PERF2.good=0; } else if(PERF.fps>55){ PERF2.good++; PERF2.bad=0; } else { PERF2.bad=Math.max(0,PERF2.bad-1); PERF2.good=0; }
  if(PERF2.bad>=4&&PERF2.lvl<3){ PERF2.lvl++; PERF2.bad=0; applyQuality(); if(PERF2.told<PERF2.lvl){ PERF2.told=PERF2.lvl; toast(PERF_LVL_TXT[PERF2.lvl]+' (Ayarlar → Grafik)','#b8ecff'); } }
  else if(PERF2.good>=12&&PERF2.lvl>0){ PERF2.lvl--; PERF2.good=0; applyQuality(); }
}
perfStep=HOOK.wrap('perfStep','performans/optimizasyon-1#_p2Step',function(_p2Step){ return function(dt){ const before=PERF.n; _p2Step(dt); if(PERF.n===0&&before>0){ perfLadder();
  if(SETTINGS.fps){ const el=$('fps'); if(el){ el.textContent=Math.round(PERF.fps)+' FPS · '+Math.round(renderer.getPixelRatio()*100)/100+'x'+(PERF2.calls?' · '+PERF2.calls+' çizim · '+Math.round(PERF2.tris/1000)+'k üçgen':'')+(PERF2.lvl?' · hafif '+PERF2.lvl:'')+(PERF2.split?' · derinlik 2 kat':''); } } } }; },perfStep);
/* ---- settings UI */
(function(){ const c=$('setCap'); if(c) c.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.fpsCap=+b.dataset.c; PERF2.capLast=0; saveSettings(); syncSettingsUI(); });
  const sp=$('setSplit'); if(sp) sp.addEventListener('change',function(){ SETTINGS.split=sp.checked; saveSettings(); });
  const pm=$('btnPerfMode'); if(pm) pm.addEventListener('click',function(){ SETTINGS.quality=0; SETTINGS.fx=0; SETTINGS.shadows=false; SETTINGS.res='auto'; SETTINGS.autoPerf=true; if(DEV.mobile) SETTINGS.fpsCap=30; PERF.scale=1; saveSettings(); applyQuality(); syncSettingsUI(); toast('Performans modu: en akıcı ayarlar uygulandı','#7dffb0'); }); })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','performans/optimizasyon-1#_p2Sync',function(_p2Sync){ return function(){ _p2Sync(); const c=$('setCap'); if(c) Array.prototype.forEach.call(c.children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.c===fpsCap())); });
  const sp=$('setSplit'); if(sp){ sp.checked=SETTINGS.split!==false; sp.disabled=!!DEV.logDepth; } }; },syncSettingsUI);
