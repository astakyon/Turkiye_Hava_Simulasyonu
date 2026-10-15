/* ------------------------------------------------------------------ terrain levels of detail (V2.21)
   Each 5 km terrain tile (dunya/arazi.js) shows the version its distance asks for: 100 m grid near the camera, then 200, 500
   and 1000 m. The distances grow with the graphics quality and shrink a little on phones; a tile only switches back to a finer
   version 10 % closer than where it became coarser, so it does not flicker on the border. Tiles outside the view are not drawn
   (normal view culling — the old single mesh was always drawn whole). Measured from the camera to the nearest point of the tile.
   Draw calls: only the full-detail tiles are drawn one by one; all coarser tiles are joined into one mesh, rebuilt when one of
   them changes version (a few thousand points, under a millisecond), so the terrain costs ~3–7 draw calls instead of 15–30.
   Tiles with mountains (over 600 m of height difference) stay one step finer than their distance asks, for the outline.
   Kill switch: SETTINGS.terrainLod=false (all tiles at full detail). */
const TLOD={t:0, d:new THREE.Vector3(), tris:0, sw:0};
function terLodDist(){ const q=SETTINGS.quality||0, T=[[2500,5500,10000],[3200,7000,12000],[4000,8500,15000],[4500,10000,18000]][Math.max(0,Math.min(3,q))];
  const k=DEV.mobile?0.85:1; return [T[0]*k,T[1]*k,T[2]*k]; }
function terBoxDist(b,p){ const dx=Math.max(b.min.x-p.x,0,p.x-b.max.x), dy=Math.max(b.min.y-p.y,0,p.y-b.max.y), dz=Math.max(b.min.z-p.z,0,p.z-b.max.z); return Math.sqrt(dx*dx+dy*dy+dz*dz); }
function terLevel(d,cur,D){ let lv=0; while(lv<3&&d>D[lv]) lv++;
  if(lv<cur&&d>D[lv]*0.9) lv=cur;   /* coming closer: switch to the finer version only 10 % inside the border */
  return lv; }
function terLodStep(force){ if(typeof TER==='undefined'||!TER.tiles.length||!camera) return; const off=SETTINGS.terrainLod===false, D=terLodDist(), p=camera.position; let tris=0;
  for(let i=0;i<TER.tiles.length;i++){ const t=TER.tiles[i]; let lv=off?0:terLevel(terBoxDist(t.box,p),t.lv,D); if(lv>0&&t.rng>600) lv--;   /* mountains: one step finer, their outline shows from far */
    if(lv!==t.lv||force){ t.lv=lv; t.m.geometry=t.geos[lv]; TLOD.sw++; } tris+=t.geos[t.lv].userData.tris; }
  TLOD.tris=tris; TER.tris=tris; terFar(off); }
/* the coarse tiles as one mesh */
/* V2.26: one mesh with buffers made once for the largest case; a change only copies the coarse tiles in and uploads the used
   part (no new geometry, no garbage — the phone report showed 11 slow frames in flight, when the far set changed). */
function terFarInit(){ if(TLOD.far) return TLOD.far; let nv=0, ni=0; TER.tiles.forEach(function(t){ let v=0, i=0; for(let l=1;l<4;l++){ v=Math.max(v,t.geos[l].attributes.position.count); i=Math.max(i,t.geos[l].index.count); } nv+=v; ni+=i; });
  const g=new THREE.BufferGeometry(); ['position','normal','color'].forEach(function(n){ const A=new THREE.BufferAttribute(new Float32Array(nv*3),3); A.usage=THREE.DynamicDrawUsage||A.usage; g.setAttribute(n,A); });
  const I=new THREE.BufferAttribute(nv>65535?new Uint32Array(ni):new Uint16Array(ni),1); I.usage=THREE.DynamicDrawUsage||I.usage; g.setIndex(I);
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,0,0),TER.size); g.setDrawRange(0,0);
  const m=new THREE.Mesh(g,TER.mat); m.userData.terrainTile=true; m.userData.noMerge=true; m.userData.noBake=true; m.userData.noWarm=false; m.userData.rs=true; m.userData.cs=false; m.receiveShadow=renderer.shadowMap.enabled; m.castShadow=false; m.matrixAutoUpdate=false; m.frustumCulled=false;
  scene.add(m); TLOD.far=m; return m; }
function terFar(off){ let key=''; for(let i=0;i<TER.tiles.length;i++){ const t=TER.tiles[i], far=!off&&t.lv>0; t.m.visible=!far; if(far) key+=i+':'+t.lv+','; }
  if(key===TLOD.key) return; TLOD.key=key; TLOD.rebuilds=(TLOD.rebuilds||0)+1;
  const m=terFarInit(), G=m.geometry, P=G.attributes.position, N=G.attributes.normal, C=G.attributes.color, I=G.index; m.visible=!!key;
  let ov=0, oi=0; if(key) TER.tiles.forEach(function(t){ if(off||t.lv===0) return; const g=t.geos[t.lv];
    P.array.set(g.attributes.position.array,ov*3); N.array.set(g.attributes.normal.array,ov*3); C.array.set(g.attributes.color.array,ov*3);
    const S=g.index.array, D=I.array; for(let k=0;k<S.length;k++) D[oi+k]=S[k]+ov; ov+=g.attributes.position.count; oi+=S.length; });
  [P,N,C].forEach(function(A){ A.updateRange.offset=0; A.updateRange.count=ov*3; A.needsUpdate=true; }); I.updateRange.offset=0; I.updateRange.count=oi; I.needsUpdate=true; G.setDrawRange(0,oi); }
cullStep=HOOK.wrap('cullStep','dunya/arazi-kademeleri#_tlCull',function(_tlCull){ return function(dt){ _tlCull(dt); TLOD.t+=dt||0; if(TLOD.t>0.25){ TLOD.t=0; try{ terLodStep(); }catch(e){} } }; },cullStep);
applyQuality=HOOK.wrap('applyQuality','dunya/arazi-kademeleri#_tlQ',function(_tlQ){ return function(){ const r=_tlQ.apply(this,arguments); try{ terLodStep(true); }catch(e){} return r; }; },applyQuality);
