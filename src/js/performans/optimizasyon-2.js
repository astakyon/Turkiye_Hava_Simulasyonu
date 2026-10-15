/* ------------------------------------------------------------------ optimisation 2.0 (V2.09)
   Draw calls are what phones choke on (a common guide: <100–300 per frame on mobile; the island used 500–800).
   • Static merge: a few seconds after start, every small static mesh (props, signs, lamps, fences, building parts …) is
     merged into one mesh per material per 800 m cell (large pieces such as baked building blocks per 4 km cell). Originals stay in the scene but are switched off. A watchdog checks
     the originals every 2 s; if the game moves, hides or removes one, that cell is un-merged at once (self-healing), so
     doors, lights and destructible targets keep working.
   • Device tier: on the first start the GPU name, memory and CPU cores pick the starting preset (phone / tablet / PC).
     Ayarlar → Grafik → "Cihaza göre ayarla" applies it again.
   • Menus: while a full-screen menu covers the 3D scene it is drawn at 10 FPS instead of 60 (battery, heat).
   • Bounding-sphere guard for instanced groups (the cause of trees vanishing in V1.94–V2.08) lives in 98d-perf. */
const MRG={done:false, cells:new Map(), src:[], t:0, ix:0, stats:{meshes:0,merged:0,cells:0}, v:new THREE.Vector3()};
function mrgExcluded(){ const S0=new Set(); const add=function(g){ if(g) S0.add(g); };
  try{ add(planeGroup); add(sky); }catch(e){}
  try{ for(const id in MODELS.inst) MODELS.inst[id].forEach(function(m){ add(m.group); }); }catch(e){}
  try{ for(const k in displays) add(displays[k].g); }catch(e){}
  try{ HELI.list.forEach(function(H){ add(H.m&&H.m.g); }); }catch(e){} try{ VEHS.forEach(function(c){ add(c.mesh); }); }catch(e){} try{ BOATS.forEach(function(b){ add(b.g); }); }catch(e){}
  try{ AP.movers.forEach(function(m){ add(m.g); }); }catch(e){} try{ gtargets.forEach(function(o){ add(o.g); }); }catch(e){} try{ targets.forEach(function(o){ add(o.g); }); }catch(e){}
  try{ HTGT.forEach(function(o){ add(o.g); }); }catch(e){} try{ rings.forEach(function(r){ add(r.mesh); }); }catch(e){} try{ AL.ai.forEach(function(a){ add(a.m&&a.m.group); }); AL.crew.forEach(function(c){ add(c.g); }); }catch(e){}
  try{ if(AP.flag) add(AP.flag.m); if(AP.radar) add(AP.radar); AP.socks.forEach(add); }catch(e){}
  return S0; }
function mrgCandidate(o,EX){ if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position) return false;
  const m=o.material; if(!m||Array.isArray(m)||m.isShaderMaterial||m.isRawShaderMaterial||m.wireframe) return false; if(o.onBeforeRender&&o.onBeforeRender.toString().length>40) return false;
  if(o.userData.noMerge||o.userData.noCull||o.userData.merged) return false; if(o.morphTargetInfluences) return false;
  let p=o; while(p){ if(!p.visible||EX.has(p)||p.userData.noMerge) return false; if(p===scene) break; p=p.parent; } if(p!==scene) return false;
  const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); const bs=g.boundingSphere; if(!bs||!isFinite(bs.radius)) return false;
  const r=bs.radius*o.matrixWorld.getMaxScaleOnAxis(); if(r>2500) return false; o.userData._mr=r;
  return true; }
function mrgMatKey(m){ const c=function(x){ return x&&x.getHexString?x.getHexString():''; }; return [m.type,c(m.color),c(m.emissive),m.map?m.map.uuid:'',m.emissiveMap?m.emissiveMap.uuid:'',m.vertexColors?1:0,m.flatShading?1:0,m.side,m.alphaTest||0,m.fog?1:0,m.polygonOffset?(m.polygonOffsetFactor+':'+m.polygonOffsetUnits):'',m.shininess||'',m.emissiveIntensity==null?'':m.emissiveIntensity,m.opacity].join(':'); }
/* untextured materials that differ only by colour merge together: the colour goes into the vertices */
function mrgVC(m){ return !m.map&&!m.emissiveMap&&!m.alphaMap&&!m.normalMap&&(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial); }
/* V2.24: the same change check as mrgMatKey without building a string (the bake watchdog runs it every few frames) */
function mrgMatSig(m){ const c=m.color, e=m.emissive; return (c?c.r*7.13+c.g*13.37+c.b*29.71:0)+(e?e.r*37.91+e.g*53.17+e.b*71.39:0)+(m.opacity==null?1:m.opacity)*97.73+(m.emissiveIntensity==null?0:m.emissiveIntensity)*113.9+(m.map?m.map.id*0.0013:0)+(m.emissiveMap?m.emissiveMap.id*0.0007:0)+(m.side||0)*0.31+(m.alphaTest||0)*3.7+(m.shininess||0)*0.011; }
function mrgGroupKey(m){ if(!mrgVC(m)) return mrgMatKey(m); const c=function(x){ return x&&x.getHexString?x.getHexString():''; }; return ['VC',m.type,c(m.emissive),m.flatShading?1:0,m.side,m.fog?1:0,m.polygonOffset?(m.polygonOffsetFactor+':'+m.polygonOffsetUnits):'',m.shininess||'',m.roughness==null?'':m.roughness,m.metalness==null?'':m.metalness].join(':'); }
function mrgSig(g){ const a=g.attributes; return (a.normal?'n':'')+(a.uv?'u':'')+(a.color?'c'+a.color.itemSize:''); }
function mrgBuild(list,vc,mfn){ /* list of meshes with the same material / attributes → one geometry in world space */
  let n=0, ni=0; list.forEach(function(o){ const g=o.geometry; n+=g.attributes.position.count; ni+=g.index?g.index.count:g.attributes.position.count; });
  const a0=list[0].geometry.attributes, P=new Float32Array(n*3), N=list.every(function(o){ return o.geometry.attributes.normal; })?new Float32Array(n*3):null, U=(!vc&&a0.uv)?new Float32Array(n*2):null, cs=vc?3:(a0.color?a0.color.itemSize:0), C=cs?new Float32Array(n*cs):null;
  const I=n>65535?new Uint32Array(ni):new Uint16Array(ni); let vo=0, io=0; const v=new THREE.Vector3(), nm=new THREE.Matrix3();
  list.forEach(function(o){ const g=o.geometry, A=g.attributes, c=A.position.count, M=mfn?mfn(o):o.matrixWorld; nm.getNormalMatrix(M);
    for(let i=0;i<c;i++){ v.fromBufferAttribute(A.position,i).applyMatrix4(M); P[(vo+i)*3]=v.x; P[(vo+i)*3+1]=v.y; P[(vo+i)*3+2]=v.z;
      if(N){ v.fromBufferAttribute(A.normal,i).applyMatrix3(nm).normalize(); N[(vo+i)*3]=v.x; N[(vo+i)*3+1]=v.y; N[(vo+i)*3+2]=v.z; }
      if(U){ U[(vo+i)*2]=A.uv.getX(i); U[(vo+i)*2+1]=A.uv.getY(i); }
      if(C){ if(vc){ const mc=o.material.color, vcol=o.material.vertexColors&&A.color; C[(vo+i)*3]=mc.r*(vcol?A.color.getX(i):1); C[(vo+i)*3+1]=mc.g*(vcol?A.color.getY(i):1); C[(vo+i)*3+2]=mc.b*(vcol?A.color.getZ(i):1); } else for(let k=0;k<cs;k++) C[(vo+i)*cs+k]=A.color.array[i*cs+k]; } }
    if(g.index){ const X=g.index.array; for(let k=0;k<X.length;k++) I[io+k]=X[k]+vo; io+=X.length; } else { for(let k=0;k<c;k++) I[io+k]=vo+k; io+=c; }
    vo+=c; });
  const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(P,3)); if(N) bg.setAttribute('normal',new THREE.BufferAttribute(N,3)); if(U) bg.setAttribute('uv',new THREE.BufferAttribute(U,2)); if(C) bg.setAttribute('color',new THREE.BufferAttribute(C,cs));
  bg.setIndex(new THREE.BufferAttribute(I,1)); bg.computeBoundingSphere(); return bg; }
/* ---- V2.14 "Birleştirme 2.0": coverage, permanent cells, ≤65 535 vertices per mesh, shared merged materials, frozen matrices.
   V2.09 merged only 42 % of the candidates (small groups of 1–2 per 800 m cell stayed single, glass was skipped) and a single
   moving part (a door, a rotating antenna) dissolved its whole cell for good (586 → 494 merged after a short flight).
   • size class in the key: small props share a cell only with small props, so a far cell of benches can be hidden by distance;
     leftovers (fewer than 2 in their cell) get a second chance in 4× larger cells of the same class.
   • transparent parts (glass, light covers) merge with parts of the same material/opacity.
   • a cell is split into meshes of at most 65 535 vertices (16-bit indices; Android guidance: some GPUs drop bigger meshes).
   • untextured cells of the same kind share one vertex-colour material (fewer shader/state switches).
   • when a part moves, only that part leaves: the cell is rebuilt from the rest at once.
   • matrices: ~3 500 static objects recomputed their matrix every frame (CPU on phones). After the merge, objects that stayed
     still for 1.5 s are frozen (matrixAutoUpdate off); a watchdog checks position/rotation/scale a slice per frame and
     unfreezes anything the game moves. */
function mrgCellKey(r,v,big){ const sc=r<3?'S':r<20?'M':r<150?'L':'B', T=sc==='B'?4000:(big?3200:800); return sc+(big?'x':'')+Math.floor(v.x/T)+','+Math.floor(v.z/T); }
function mrgBaseKey(o){ const m=o.material, vc=mrgVC(m); return (m.transparent?'T'+m.opacity+(m.depthWrite?'w':'')+':':'')+mrgGroupKey(m)+'|'+(vc?'vc':mrgSig(o.geometry))+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0); }
MRG.vmat=new Map();
function mrgVcMat(m){ const k=(m.transparent?'T'+m.opacity+(m.depthWrite?'w':''):'')+mrgGroupKey(m); let x=MRG.vmat.get(k); if(!x){ x=m.clone(); x.color.setRGB(1,1,1); x.vertexColors=true; x.needsUpdate=true; MRG.vmat.set(k,x); } return x; }
function mrgCenter(o){ const bs=o.geometry.boundingSphere; return MRG.v.copy(bs.center).applyMatrix4(o.matrixWorld); }
function mrgAdd(L,key){ const vc=key.indexOf('|vc|')>0; let rMax=0; L.forEach(function(o){ rMax=Math.max(rMax,o.userData._mr||0); });
  const meshes=[], box=new THREE.Box3(); let chunk=[], nv=0;
  const flush=function(){ if(!chunk.length) return; let geo=null; try{ geo=mrgBuild(chunk,vc); }catch(e){ geo=null; }
    if(geo){ const m0=chunk[0]; const m=new THREE.Mesh(geo,vc?mrgVcMat(m0.material):m0.material); m.castShadow=m0.castShadow; m.receiveShadow=m0.receiveShadow; m.userData.rs=m0.userData.rs; m.userData.cs=m0.userData.cs; m.userData.noMerge=true; m.userData.mergedCell=key; m.renderOrder=m0.renderOrder; m.matrixAutoUpdate=false; m.updateMatrix();
      geo.computeBoundingBox(); box.union(geo.boundingBox); meshes.push(m); } else chunk.forEach(function(o){ o.userData.noMerge=true; });
    chunk=[]; nv=0; };
  L.forEach(function(o){ const c=o.geometry.attributes.position.count; if(nv+c>65535&&chunk.length) flush(); chunk.push(o); nv+=c; }); flush();
  const used=L.filter(function(o){ return !o.userData.noMerge; }); if(!meshes.length||used.length<2){ meshes.forEach(function(m){ m.geometry.dispose(); }); return null; }
  meshes.forEach(function(m){ scene.add(m); }); const sp=box.getBoundingSphere(new THREE.Sphere());
  const cell={key:key, mesh:meshes[0], meshes:meshes, rMax:rMax, c:sp.center.clone(), R:sp.radius, src:used.map(function(o){ return {o:o,mw:o.matrixWorld.elements.slice(),parent:o.parent,mat:o.material,mk:mrgMatKey(o.material)}; })};
  used.forEach(function(o){ o.userData.merged=cell; o.userData.noCull=true; o.layers.disable(0); });
  MRG.cells.set(key,cell); MRG.stats.merged+=used.length; MRG.stats.cells++; MRG.stats.meshesOut=(MRG.stats.meshesOut||0)+meshes.length; return cell; }
function mrgRun(){ if(MRG.done||!scene||!scene.traverse) return; MRG.done=true; scene.updateMatrixWorld(true); const EX=mrgExcluded(), by=new Map(), left=new Map(); let cnt=0;
  const put=function(M,k,o){ let L=M.get(k); if(!L){ L=[]; M.set(k,L); } L.push(o); };
  scene.traverse(function(o){ if(!mrgCandidate(o,EX)) return; cnt++; put(by,mrgBaseKey(o)+'|'+mrgCellKey(o.userData._mr,mrgCenter(o)),o); });
  MRG.stats.meshes=cnt;
  by.forEach(function(L,key){ if(L.length>=2&&mrgAdd(L,key)) return; L.forEach(function(o){ if(!o.userData.merged&&!o.userData.noMerge) put(left,mrgBaseKey(o)+'|'+mrgCellKey(o.userData._mr,mrgCenter(o),true),o); }); });
  left.forEach(function(L,key){ if(L.length>=2) mrgAdd(L,key); });
  MRG.stats.single=cnt-MRG.stats.merged;
  if(typeof CULL!=='undefined') CULL.list=CULL.list.filter(function(o){ return !o.userData.merged; });   /* else the size cull's refresh would switch the originals back on */
  setTimeout(function(){ try{ mfzRun(); }catch(e){ console.warn('dondurma',e); } },200); }
function mrgUnmerge(cell,culprit){ if(!MRG.cells.has(cell.key)) return; MRG.cells.delete(cell.key); (cell.meshes||[cell.mesh]).forEach(function(m){ scene.remove(m); try{ m.geometry.dispose(); }catch(e){} });
  cell.src.forEach(function(s){ s.o.userData.merged=null; s.o.userData.noCull=false; s.o.layers.enable(0); }); MRG.stats.cells--; MRG.stats.merged-=cell.src.length; MRG.stats.meshesOut=(MRG.stats.meshesOut||0)-(cell.meshes||[1]).length;
  if(culprit){ culprit.userData.noMerge=true; MRG.stats.left=(MRG.stats.left||0)+1; const EX=mrgExcluded(); const rest=cell.src.map(function(s){ return s.o; }).filter(function(o){ return o!==culprit&&mrgCandidate(o,EX); });
    if(rest.length>=2) mrgAdd(rest,cell.key+'~'); } }
function mrgChanged(s){ const o=s.o; if(o.parent!==s.parent||o.material!==s.mat) return true; if(s.chk=(s.chk||0)+1, s.chk%4===0&&mrgMatKey(o.material)!==s.mk) return true; let p=o; while(p){ if(!p.visible) return true; if(p===scene) break; p=p.parent; } if(p!==scene) return true;
  const e=o.matrixWorld.elements; for(let k=12;k<15;k++) if(Math.abs(e[k]-s.mw[k])>0.01) return true; for(let k=0;k<11;k++) if(Math.abs(e[k]-s.mw[k])>1e-4) return true; return false; }
/* watchdog: a slice of cells every frame, all cells about every 2 s */
function mrgShow(cells){ if(!camera) return; const on=typeof CULL==='undefined'||CULL.on, k=HH/(2*Math.tan(camera.fov*Math.PI/360)), px=on?CULL.px:0, cp=camera.position;
  for(let i=0;i<cells.length;i++){ const c=cells[i], d=Math.max(1,c.c.distanceTo(cp)-c.R), show=!on||c.rMax*k/d>=px, L=c.meshes||[c.mesh]; for(let j=0;j<L.length;j++){ if(show) L[j].layers.enable(0); else L[j].layers.disable(0); } } }
function mrgStep(dt){ if(!MRG.done) return; MRG.t+=dt; const cells=Array.from(MRG.cells.values()); if(!cells.length) return; mrgShow(cells); const per=Math.max(1,Math.ceil(cells.length*dt/2));
  for(let k=0;k<per;k++){ const c=cells[MRG.ix++%cells.length]; if(!c||!MRG.cells.has(c.key)) continue; let bad=null; for(let i=0;i<c.src.length&&!bad;i++){ const o=c.src[i].o; if(o.layers.test(camera.layers)) o.layers.disable(0); if(mrgChanged(c.src[i])) bad=o; } if(bad) mrgUnmerge(c,bad); } }
/* ---- frozen matrices for objects that never move */
const MFZ={list:[], i:0, done:false, frozen:0, thawed:0, cand:null};
function mfzRun(){ if(MFZ.done||SETTINGS.freeze===false||!scene||!scene.traverse) return; MFZ.done=true; const L=[], skip=new Set(); try{ skip.add(planeGroup); skip.add(sky); }catch(e){}   /* parked aircraft, vehicles and boats are frozen too: boarding or animating them thaws the moved parts */
  scene.traverse(function(o){ if(o===scene||!o.matrixAutoUpdate||o.isCamera||o.isLight) return; let p=o; while(p&&p!==scene){ if(skip.has(p)||p.userData.noFreeze||p.isCamera) return; p=p.parent; }
    try{ if(typeof sunLight!=='undefined'&&(o===sunLight.target)) return; }catch(e){}
    L.push({o:o, p:o.position.clone(), q:o.quaternion.clone(), s:o.scale.clone()}); });
  MFZ.cand=L; setTimeout(function(){ try{ mfzFreeze(); }catch(e){} },1500); }
function mfzSame(e){ const o=e.o; return o.position.equals(e.p)&&o.quaternion.equals(e.q)&&o.scale.equals(e.s); }
function mfzFreeze(){ const L=MFZ.cand||[]; MFZ.cand=null; L.forEach(function(e){ if(!e.o.parent||!mfzSame(e)) return; e.o.updateMatrix(); e.o.matrixAutoUpdate=false; MFZ.list.push(e); }); MFZ.frozen=MFZ.list.length; }
function mfzStep(){ const L=MFZ.list, n=L.length; if(!n) return; const per=Math.min(n,Math.max(60,Math.ceil(n/15)));   /* everything checked about every 15 frames (≤ 0.25 s at 60 FPS) */
  for(let k=0;k<per;k++){ if(MFZ.i>=L.length) MFZ.i=0; const e=L[MFZ.i]; if(!mfzSame(e)){ e.o.matrixAutoUpdate=true; e.o.updateMatrix(); L.splice(MFZ.i,1); MFZ.thawed++; MFZ.frozen=L.length; if(!L.length) return; } else MFZ.i++; } }
if(SETTINGS.merge!==false)setTimeout(function(){ try{ mrgRun(); }catch(e){ console.warn('birleştirme',e); } },2500);
cullStep=HOOK.wrap('cullStep','performans/optimizasyon-2#_mrgCull',function(_mrgCull){ return function(dt){ _mrgCull(dt); try{ mrgStep(dt||0); }catch(e){} try{ mfzStep(); }catch(e){} }; },cullStep);
/* ---- device tier → starting preset */
function devTier(){ const g=String(DEV.gpu||'').toLowerCase(), mem=navigator.deviceMemory||4, cores=navigator.hardwareConcurrency||4;
  if(DEV.mobile){ if(/mali-(4|t[678])|adreno[^0-9]*([34]\d\d|50\d|51\d)|powervr|sgx|videocore/.test(g)||mem<=3||cores<=4) return 0;
    if(/apple|adreno[^0-9]*(6[4-9]\d|7\d\d|8\d\d)|mali-g(7[1-9]|[89]\d\d?)|immortalis|xclipse/.test(g)&&mem>=6) return DEV.tablet?2:1; return 1; }
  if(/swiftshader|llvmpipe|softpipe|microsoft basic/.test(g)) return 0;
  if(/intel/.test(g)&&!/arc/.test(g)) return 1; if(/rtx|radeon rx|gtx 1[06]\d0|apple m[1-9]|arc a/.test(g)||mem>=16) return 3; return 2; }
function devTierApply(silent){ const q=devTier(); SETTINGS.quality=q; SETTINGS.fx=null; SETTINGS.shadows=null; SETTINGS.res='auto'; SETTINGS.autoPerf=true; PERF.scale=1; saveSettings(); applyQuality(); syncSettingsUI();
  if(!silent) toast('Cihaza göre ayarlandı: '+['Düşük','Orta','Yüksek','Ultra'][q]+' ('+DEV.kind+(DEV.gpu&&DEV.gpu!=='?'?' · '+String(DEV.gpu).slice(0,40):'')+')','#7dffb0'); }
loadStore=HOOK.wrap('loadStore','performans/optimizasyon-2#_p3Load',function(_p3Load){ return function(){ let first=false; try{ first=!stGet('kaan-sim-settings'); }catch(e){} _p3Load(); if(first){ try{ SETTINGS.quality=devTier(); SETTINGS.tierAuto=true; }catch(e){} } }; },loadStore);
(function(){ const b=$('btnTier'); if(b) b.addEventListener('click',function(){ devTierApply(false); }); })();
/* ---- full-screen menus: draw the scene at 10 FPS */
function menuCovered(){ if(state!=='menu'||!document.querySelector) return false; return !!document.querySelector('.modal.fs:not(.hidden), #settings:not(.hidden), #records:not(.hidden), #campUI:not(.hidden)'); }
frame=HOOK.wrap('frame','performans/optimizasyon-2#_p3Frame',function(_p3Frame){ return function(now){ if(menuCovered()&&now){ if(now-(frame._mt||0)<95){ requestAnimationFrame(frame); return; } frame._mt=now; } _p3Frame(now); }; },frame);
