/* ------------------------------------------------------------------ distance culling by on-screen size
   Most of the ~2 800 meshes are small props (benches, lamps, sheds, signs) spread over a 30 km island; they cost a draw call each
   even when they would cover less than a pixel. Every object whose projected size falls below a quality-dependent threshold is
   taken off render layer 0 (so .visible, which the game logic uses, stays untouched). The list is refreshed every few seconds
   and checked a slice per frame. Shadow casting follows automatically (the shadow pass uses the same layer test). */
const CULL={list:[], i:0, t:99, px:2.5, on:true, hidden:0, cv:new THREE.Vector3()};
const CULL_PX=[6,4,2.5,1.2];   /* Düşük / Orta / Yüksek / Ultra: hide below this many pixels */
function cullCollect(){
  const L=[]; scene.updateMatrixWorld();
  scene.traverse(function(o){
    if(!(o.isMesh||o.isPoints||o.isLine)||(o.isInstancedMesh&&!o.userData.full)||o===sky||o.userData.noCull||!o.layers||!o.matrixWorld||!o.matrixWorld.getMaxScaleOnAxis) return;
    let p=o; while(p){ if(p===planeGroup||p.userData.noCull) return; p=p.parent; }
    const g=o.geometry; if(!g) return; if(!g.boundingSphere) g.computeBoundingSphere(); const bs=g.boundingSphere; if(!bs||!isFinite(bs.radius)) return;
    const r=bs.radius*o.matrixWorld.getMaxScaleOnAxis(); if(r>1500) return;   /* terrain, sea, roads network: always drawn */
    L.push(o);
  });
  /* objects dropped from the list must be visible again */
  const keep=new Set(L); CULL.list.forEach(function(o){ if(!keep.has(o)) o.layers.enable(0); });   /* Set: indexOf here was O(n²), a 10–20 ms hitch every 4 s on phones */
  CULL.list=L; CULL.i=0;
}
function cullStep(dt){
  if(!CULL.on){ return; }
  CULL.t+=dt; if(CULL.t>4){ CULL.t=0; cullCollect(); }
  const L=CULL.list, n=L.length; if(!n) return;
  const k=HH/(2*Math.tan(camera.fov*Math.PI/360)), cp=camera.position, px=CULL.px, per=Math.max(60,Math.ceil(n/6)), v=CULL.cv;
  for(let c=0;c<per;c++){
    if(CULL.i>=n) CULL.i=0; const o=L[CULL.i++], g=o.geometry, bs=g.boundingSphere; if(!bs) continue;
    v.copy(bs.center).applyMatrix4(o.matrixWorld);
    const d=Math.max(1,v.distanceTo(cp)-bs.radius), r=bs.radius*o.matrixWorld.getMaxScaleOnAxis(), show=r*k/d>=px;
    if(show) o.layers.enable(0); else o.layers.disable(0);
  }
}
function cullSet(on){ CULL.on=on; if(!on) CULL.list.forEach(function(o){ o.layers.enable(0); }); }
function cullAll(){ const n=CULL.list.length; const old=CULL.i; CULL.i=0; const keep=CULL.list; for(let s=0;s<6;s++) cullStep(0); CULL.i=old; return keep.filter(function(o){ return !o.layers.test(camera.layers); }).length; }
/* split big static instanced meshes (forests, rocks, fence posts, parked cars …) into 4 km tiles with their own bounding spheres,
   so the camera frustum and the size cull skip whole tiles behind or far from the camera (they were always drawn in full) */
function chunkInstances(){
  if(!scene.children) return 0;
  const dyn=new Set([GFX.clouds]);
  try{ if(LMK.rotors) dyn.add(LMK.rotors); if(LMK.cabM) dyn.add(LMK.cabM); }catch(e){}
  try{ if(RURAL.rotors) dyn.add(RURAL.rotors); if(RURAL.sheep) RURAL.sheep.forEach(function(m){ dyn.add(m); }); }catch(e){}
  try{ if(MARINA.gulls) dyn.add(MARINA.gulls); if(MARINA.g) dyn.add(MARINA.g); }catch(e){}
  try{ const t=TRAFFIC; (t.lanes||[t]).forEach(function(L){ if(L&&L.mesh) ['body','glass','wheel'].forEach(function(k){ dyn.add(L.mesh[k]); }); }); }catch(e){}
  const src=scene.children.filter(function(o){ return o.isInstancedMesh&&o.count>=400&&!dyn.has(o)&&!o.userData.noChunk; });
  const mt=new THREE.Matrix4(), v=new THREE.Vector3(), TILE=4000; let made=0;
  src.forEach(function(im){
    if(!im.geometry.boundingSphere) im.geometry.computeBoundingSphere(); const gr=im.geometry.boundingSphere.radius;
    const tiles=new Map();
    for(let i=0;i<im.count;i++){ im.getMatrixAt(i,mt); v.setFromMatrixPosition(mt); const key=Math.floor(v.x/TILE)+','+Math.floor(v.z/TILE);
      let t=tiles.get(key); if(!t){ t=[]; tiles.set(key,t); } t.push(i); }
    if(tiles.size<2) return;
    const col=im.instanceColor, c3=new THREE.Color(), isTrees=GFX.trees===im, chunks=[];
    tiles.forEach(function(idx){
      const g=im.geometry.clone(), m=new THREE.InstancedMesh(g,im.material,idx.length); let cx=0,cy=0,cz=0, sMax=1;
      idx.forEach(function(i,j){ im.getMatrixAt(i,mt); m.setMatrixAt(j,mt); v.setFromMatrixPosition(mt); cx+=v.x; cy+=v.y; cz+=v.z; sMax=Math.max(sMax,mt.getMaxScaleOnAxis()); if(col){ im.getColorAt(i,c3); m.setColorAt(j,c3); } });
      cx/=idx.length; cy/=idx.length; cz/=idx.length; let R=0;
      idx.forEach(function(i){ im.getMatrixAt(i,mt); v.setFromMatrixPosition(mt); R=Math.max(R,Math.hypot(v.x-cx,v.y-cy,v.z-cz)); });
      g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,cy,cz),R+gr*sMax);
      m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true;
      m.frustumCulled=true; m.castShadow=im.castShadow; m.receiveShadow=im.receiveShadow; m.userData=Object.assign({},im.userData,{full:idx.length}); m.renderOrder=im.renderOrder;
      scene.add(m); chunks.push(m); made++; });
    scene.remove(im);
    if(isTrees){ GFX.treeChunks=chunks; GFX.trees=null; }
  });
  return made;
}
