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
const _shApply=applyShadows; applyShadows=function(){ _shApply(); const lv=shadowLevel(); if(!lv||!renderer.shadowMap.enabled) return;
  const n=DEV.mobile?Math.min(2048,SHQ_SIZE[lv]):SHQ_SIZE[lv]; if(sunLight.shadow.mapSize.x!==n){ sunLight.shadow.mapSize.set(n,n); if(sunLight.shadow.map){ sunLight.shadow.map.dispose(); sunLight.shadow.map=null; } }
  const type=(lv>=3&&!DEV.mobile)?THREE.PCFSoftShadowMap:THREE.PCFShadowMap; if(renderer.shadowMap.type!==type){ renderer.shadowMap.type=type; scene.traverse(function(o){ if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){ m.needsUpdate=true; }); }); }
  shSmallCasters(); renderer.shadowMap.needsUpdate=true; };
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
const _shFollow=shadowFollow; shadowFollow=function(){ if(!renderer.shadowMap.enabled){ SHU.upd=true; return; } SHU.upd=SETTINGS.shadowEvery===true||shNeed(); if(SHU.upd) _shFollow(); };
const _shRF=renderFrame; renderFrame=function(dt){ if(renderer.shadowMap.enabled){ renderer.shadowMap.autoUpdate=false; if(SHU.upd){ renderer.shadowMap.needsUpdate=true; SHU.drawn++; } else SHU.skipped++; } _shRF(dt); };
/* small-caster pass: after merging (2.5 s) and baking (4 s), then every 5 s for rebuilt cells / models */
const _shCull=cullStep; cullStep=function(dt){ _shCull(dt); SHU.t=(SHU.t||0)+(dt||0); if(SHU.t>5){ SHU.t=0; try{ if(renderer.shadowMap.enabled) shSmallCasters(); }catch(e){} } };
/* settings row: four levels */
(function(){ const c=$('setShadow'); if(!c||!document.createElement) return;
  c.innerHTML='<button type="button" data-s="0">Kapalı</button><button type="button" data-s="1">Düşük</button><button type="button" data-s="2">Orta</button><button type="button" data-s="3">Yüksek</button>';
  c.addEventListener('click',function(e){ const b=e.target.closest('button[data-s]'); if(!b) return; e.stopImmediatePropagation(); SETTINGS.shadows=+b.dataset.s; saveSettings(); applyShadows(); syncSettingsUI(); },true);
  const sm=c.closest&&c.closest('.srow'), s=sm&&sm.querySelector('small'); if(s) s.textContent='Düşük: 1024 · Orta: 2048 · Yüksek: 4096 ve yumuşak kenar (bilgisayar). Telefonda varsayılan kapalı; açınca FPS düşebilir'; })();
const _shSync=syncSettingsUI; syncSettingsUI=function(){ _shSync(); const c=$('setShadow'); if(c) Array.prototype.forEach.call(c.children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.s===shadowLevel())); }); };
