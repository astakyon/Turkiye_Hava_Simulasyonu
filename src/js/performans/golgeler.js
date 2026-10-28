/* ------------------------------------------------------------------ shadows 2.0 (V2.16)
   Measured after V2.14–V2.15: the shadow pass costs 15–20 draw calls in flight and ~78 in a city street (it was 100–160 before
   the merges); a third of the city's are parts smaller than 1.5 m. The other cost is the shadow map itself: it was redrawn every
   frame (4096² at Ultra) even 700 m up, where the ground under the aircraft shows no shadow of it.
   • Quality: Kapalı · Düşük (1024) · Orta (2048) · Yüksek (4096 on PC, 2048 on phones; soft edges only here, on PC).
     The old on/off setting maps to the default level of the chosen graphics quality.
   • Parts smaller than 1.5 m (bolts, lamps, signs, wheels of far cars) no longer cast shadows; the player's aircraft keeps all.
   • The map is redrawn every frame on foot and below 300 m above ground; higher up, in menus and on the map every 4th frame,
     and the light only moves on those frames (otherwise shadows would slide). A change of the sun redraws at once.
   Back-face culling of double-sided materials was measured too: 392 meshes, 67 k triangles in the whole island (about half on
   closed shapes) — too little to gain against the risk of rooms seen from inside, so it was left as it is. */
function shadowDefaultLevel(){ const q=SETTINGS.quality||0; if(DEV.mobile) return q>=3?2:0; return q>=3?3:q>=2?2:q>=1?1:0; }
function shadowLevel(){ const s=SETTINGS.shadows; if(s===false||s===0||s==='0') return 0; if(s===true) return shadowDefaultLevel()||2; if(s==null) return shadowDefaultLevel(); return Math.max(0,Math.min(3,+s||0)); }
shadowsOn=function(){ return shadowLevel()>0; };
const SHQ_SIZE=[0,1024,2048,4096];
applyShadows=HOOK.wrap('applyShadows','performans/golgeler#_shApply',function(_shApply){ return function(){ _shApply(); const lv=shadowLevel(); if(!lv||!renderer.shadowMap.enabled) return;
  const n=DEV.mobile?Math.min(2048,SHQ_SIZE[lv]):SHQ_SIZE[lv]; if(sunLight.shadow.mapSize.x!==n){ sunLight.shadow.mapSize.set(n,n); if(sunLight.shadow.map){ sunLight.shadow.map.dispose(); sunLight.shadow.map=null; } }
  const type=(lv>=3&&!DEV.mobile)?THREE.PCFSoftShadowMap:THREE.PCFShadowMap; if(renderer.shadowMap.type!==type){ renderer.shadowMap.type=type; scene.traverse(function(o){ if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){ m.needsUpdate=true; }); }); }
  shSmallCasters(); renderer.shadowMap.needsUpdate=true; }; },applyShadows);
/* small parts do not cast (the player's aircraft keeps all its shadows) */
function shSmallCasters(){ let pg=null; try{ pg=planeGroup; }catch(e){} let n=0;
  scene.traverse(function(o){ if(!o.isMesh||!o.castShadow||o.isInstancedMesh) return; let p=o; while(p){ if(p===pg) return; p=p.parent; }
    let r=o.userData.bakedMesh?o.userData.bkR:null; if(r==null){ const g=o.geometry; if(!g) return; if(!g.boundingSphere) g.computeBoundingSphere(); r=g.boundingSphere?g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis():9; if(o.userData.mergedCell) r=MRG.cells.get(o.userData.mergedCell)?MRG.cells.get(o.userData.mergedCell).rMax:r; }
    if(r<1.5){ o.castShadow=false; o.userData.cs=false; n++; } });
  SHU.small=n; return n; }
/* when to redraw the shadow map */
const SHU={n:0, sun:new THREE.Vector3(), upd:true, small:0, skipped:0, drawn:0};
function shNeed(){ SHU.n++; if(typeof PT!=='undefined'&&PT.run) return true;   /* the performance test measures the full cost */
  if(!SUN.equals(SHU.sun)){ SHU.sun.copy(SUN); return true; }
  if(state==='walk') return true;
  if(state==='play'){ let agl=999; try{ agl=S.pos.y-Math.max(0,groundH(S.pos.x,S.pos.z)); }catch(e){} if(agl<300||S.onGround) return true; }
  return SHU.n%4===0; }
/* V2.28 aircraft shadow mode. Player report: the shadows on the aircraft flickered in flight. Above 300 m the map was redrawn only
   every 4th frame, but the aircraft moves 10–15 m in those frames, so its own shadows (wing on fuselage, tail on wing) were looked
   up in a picture taken where it was a moment ago — they jumped on and off at 15 Hz. Now, high above the ground (and on the menu
   flight), the shadow box shrinks to the aircraft alone: a few metres around it instead of 150 m, redrawn every frame, centred on
   the aircraft without texel snapping (snapping keeps still ground steady; for a moving aircraft it is what makes edges crawl).
   The ground under a high aircraft never showed its shadow anyway, so only the aircraft's own draw calls are added. Texels are
   ~3× smaller (KAAN: 2 cm instead of 7 cm at 2048) and the bias is sized to them, so the dark bands of acne are gone too. */
const SHP={mode:0, r:24, grp:null, box:new THREE.Box3(), sph:new THREE.Sphere(), f:new THREE.Vector3(), n:0};
function shPlaneR(){ let g=null; try{ g=planeGroup; }catch(e){} if(!g) return 24; if(SHP.grp!==g){ SHP.grp=g; try{ SHP.box.setFromObject(g); SHP.box.getBoundingSphere(SHP.sph); SHP.r=Math.max(8,Math.min(60,SHP.sph.radius)); }catch(e){ SHP.r=24; } } return SHP.r; }
function shPlaneWanted(){ if(!renderer.shadowMap.enabled||SETTINGS.shadowPlane===false) return false; let g=null; try{ g=planeGroup; }catch(e){} if(!g||!g.visible) return false;
  let p=null; if(state==='play'&&!S.crashed&&!S.onGround) p=S.pos; else if(state==='menu'&&typeof cineOn==='function'&&cineOn()) p=g.position; if(!p) return false;
  let agl=999; try{ agl=p.y-Math.max(0,groundH(p.x,p.z)); }catch(e){} return agl>(SHP.mode?260:320); }
function shPlaneSet(on){ const c=sunLight.shadow.camera, sh=sunLight.shadow; SHP.mode=on?1:0;
  if(on){ const r=shPlaneR()*1.08+3, tex=2*r/(sh.mapSize.x||2048); SHP.R=r; c.left=c.bottom=-r; c.right=c.top=r; c.near=1800-r-4; c.far=1800+r+4; sh.bias=-Math.max(0.01,tex*0.6)/(c.far-c.near); if('normalBias' in sh) sh.normalBias=Math.max(0.015,tex*1.4); }
  else { SHP.R=75; c.left=c.bottom=-75; c.right=c.top=75; c.near=1200; c.far=2400; sh.bias=DEV.mobile?-0.0012:-0.0008; if('normalBias' in sh) sh.normalBias=DEV.mobile?0.08:0.05; }
  c.updateProjectionMatrix(); renderer.shadowMap.needsUpdate=true; }
shadowFollow=HOOK.wrap('shadowFollow','performans/golgeler#_shFollow',function(_shFollow){ return function(){ if(!renderer.shadowMap.enabled){ SHU.upd=true; if(SHP.mode) shPlaneSet(false); return; }
  const want=shPlaneWanted(); if(want!==!!SHP.mode||(want&&SHP.grp!==planeGroup)) shPlaneSet(want);
  if(SHP.mode){ SHU.n++; SHU.upd=true; SHP.n++; const g=planeGroup; g.getWorldPosition(SHP.f); sunLight.target.position.copy(SHP.f); sunLight.position.copy(SHP.f).addScaledVector(SUN,1800); sunLight.target.updateMatrixWorld(); return; }
  SHU.upd=SETTINGS.shadowEvery===true||shNeed(); if(SHU.upd) _shFollow(); }; },shadowFollow);
/* V2.33: in aircraft mode the shadow pass looks at the aircraft only. Phone report (V2.31, Xclipse 920): flight at 700 m ran at
   16 ms of CPU per frame (P90 30 FPS, CPU-bound) — three.js r128 walks the whole scene for every shadow pass (4 000 objects,
   2 000 at the top level: a visibility, layer and frustum test each), and since V2.28 that pass runs in every frame up high.
   During the pass the other top-level objects are switched off for a moment (≈2 000 flag writes instead of 4 000 tests and
   matrix checks) and switched back right after; nothing else draws in between. */
const SHP_HID=[];
(function(){ const sm=renderer.shadowMap, orig=sm.render; if(typeof orig!=='function') return;
  sm.render=function(lights,scn,cam){ let g=null; try{ g=planeGroup; }catch(e){}
    if(!SHP.mode||SETTINGS.shadowPlaneOnly===false||!g||g.parent!==scn){ if(SETTINGS.shadowBoxCull===false||scn!==scene) return orig.call(this,lights,scn,cam); return shBoxPass(orig,this,lights,scn,cam); }
    const C=scn.children; SHP_HID.length=0; for(let i=0;i<C.length;i++){ const o=C[i]; if(o!==g&&o.visible&&!o.isLight){ o.visible=false; SHP_HID.push(o); } }
    try{ return orig.call(this,lights,scn,cam); } finally { for(let i=0;i<SHP_HID.length;i++) SHP_HID[i].visible=true; SHP.only=SHP_HID.length; SHP_HID.length=0; } }; })();
/* V2.35: the same idea for the normal 150 m shadow box (on foot, driving, flying low). Phone report (V2.33): low flight over the
   city stayed at P90 30 FPS, CPU-bound (17 ms per frame) — the map is redrawn every frame there and every pass walked all
   4 000 objects. Each top-level object gets a bounding sphere once (40 per frame, refreshed every ~20 s, moved along with the
   object); during the pass, objects whose sphere lies outside the shadow box (seen from the sun, with a 20 m margin) are
   switched off for that moment. Instanced forests, the terrain, sea and sky are never switched off. */
const SHB={i:0, f:0, hid:[], n:0, box:new THREE.Box3(), sph:new THREE.Sphere(), v:new THREE.Vector3()};
function shBoxSphere(o){ let d=o.userData._shs; if(d&&SHB.f-d.at<1200) return d; if(SHB.left<=0) return d||null; SHB.left--;
  if(o.isInstancedMesh||o.isSprite||o.isPoints||o.frustumCulled===false||o.userData.terrainTile){ d={skip:true, at:SHB.f}; o.userData._shs=d; return d; }
  try{ SHB.box.setFromObject(o); if(SHB.box.isEmpty()){ d={skip:true, at:SHB.f}; } else { SHB.box.getBoundingSphere(SHB.sph); d={c:SHB.sph.center.clone(), r:SHB.sph.radius, p:o.position.clone(), at:SHB.f, skip:SHB.sph.radius>3000}; } }catch(e){ d={skip:true, at:SHB.f}; }
  o.userData._shs=d; return d; }
function shBoxPass(orig,self,lights,scn,cam){ SHB.f++; SHB.left=40; const C=scn.children, c=sunLight.shadow.camera, half=(c.right-c.left)/2+20, T=sunLight.target.position, H=SHB.hid; H.length=0;
  const tr=T.dot(shR), tu=T.dot(shU);
  for(let i=0;i<C.length;i++){ const o=C[i]; if(!o.visible||o.isLight) continue; const d=shBoxSphere(o); if(!d||d.skip) continue;
    const v=SHB.v.copy(d.c).add(o.position).sub(d.p), m=half+d.r; if(Math.abs(v.dot(shR)-tr)>m||Math.abs(v.dot(shU)-tu)>m){ o.visible=false; H.push(o); } }
  try{ return orig.call(self,lights,scn,cam); } finally { for(let i=0;i<H.length;i++) H[i].visible=true; SHB.n=H.length; H.length=0; } }
/* the map size changes with the quality level: re-fit the aircraft box to it */
applyShadows=HOOK.wrap('applyShadows','performans/golgeler#_shpApply',function(_shpApply){ return function(){ _shpApply(); if(SHP.mode) shPlaneSet(true); }; },applyShadows);
renderFrame=HOOK.wrap('renderFrame','performans/golgeler#_shRF',function(_shRF){ return function(dt){ if(renderer.shadowMap.enabled){ renderer.shadowMap.autoUpdate=false; if(SHU.upd){ renderer.shadowMap.needsUpdate=true; SHU.drawn++; } else SHU.skipped++; } _shRF(dt); }; },renderFrame);
/* small-caster pass: after merging (2.5 s) and baking (4 s), then every 5 s for rebuilt cells / models */
cullStep=HOOK.wrap('cullStep','performans/golgeler#_shCull',function(_shCull){ return function(dt){ _shCull(dt); SHU.t=(SHU.t||0)+(dt||0); if(SHU.t>5){ SHU.t=0; try{ if(renderer.shadowMap.enabled) shSmallCasters(); }catch(e){} } }; },cullStep);
/* settings row: four levels */
(function(){ const c=$('setShadow'); if(!c||!document.createElement) return;
  c.innerHTML='<button type="button" data-s="0">Kapalı</button><button type="button" data-s="1">Düşük</button><button type="button" data-s="2">Orta</button><button type="button" data-s="3">Yüksek</button>';
  c.addEventListener('click',function(e){ const b=e.target.closest('button[data-s]'); if(!b) return; e.stopImmediatePropagation(); SETTINGS.shadows=+b.dataset.s; saveSettings(); applyShadows(); syncSettingsUI(); },true);
  const sm=c.closest&&c.closest('.srow'), s=sm&&sm.querySelector('small'); if(s) s.textContent='Düşük: 1024 · Orta: 2048 · Yüksek: 4096 ve yumuşak kenar (bilgisayar). Telefonda varsayılan kapalı; açınca FPS düşebilir'; })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','performans/golgeler#_shSync',function(_shSync){ return function(){ _shSync(); const c=$('setShadow'); if(c) Array.prototype.forEach.call(c.children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.s===shadowLevel())); }); }; },syncSettingsUI);
