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
  const m=o.material; if(!m||Array.isArray(m)||m.transparent||m.isShaderMaterial||m.isRawShaderMaterial||m.wireframe) return false; if(o.onBeforeRender&&o.onBeforeRender.toString().length>40) return false;
  if(o.userData.noMerge||o.userData.noCull||o.userData.merged) return false; if(o.morphTargetInfluences) return false;
  let p=o; while(p){ if(!p.visible||EX.has(p)||p.userData.noMerge) return false; if(p===scene) break; p=p.parent; } if(p!==scene) return false;
  const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); const bs=g.boundingSphere; if(!bs||!isFinite(bs.radius)) return false;
  const r=bs.radius*o.matrixWorld.getMaxScaleOnAxis(); if(r>2500) return false; o.userData._mr=r;
  return true; }
function mrgMatKey(m){ const c=function(x){ return x&&x.getHexString?x.getHexString():''; }; return [m.type,c(m.color),c(m.emissive),m.map?m.map.uuid:'',m.emissiveMap?m.emissiveMap.uuid:'',m.vertexColors?1:0,m.flatShading?1:0,m.side,m.alphaTest||0,m.fog?1:0,m.polygonOffset?(m.polygonOffsetFactor+':'+m.polygonOffsetUnits):'',m.shininess||'',m.emissiveIntensity==null?'':m.emissiveIntensity,m.opacity].join(':'); }
/* untextured materials that differ only by colour merge together: the colour goes into the vertices */
function mrgVC(m){ return !m.map&&!m.emissiveMap&&!m.alphaMap&&!m.normalMap&&(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial); }
function mrgGroupKey(m){ if(!mrgVC(m)) return mrgMatKey(m); const c=function(x){ return x&&x.getHexString?x.getHexString():''; }; return ['VC',m.type,c(m.emissive),m.flatShading?1:0,m.side,m.fog?1:0,m.polygonOffset?(m.polygonOffsetFactor+':'+m.polygonOffsetUnits):'',m.shininess||'',m.roughness==null?'':m.roughness,m.metalness==null?'':m.metalness].join(':'); }
function mrgSig(g){ const a=g.attributes; return (a.normal?'n':'')+(a.uv?'u':'')+(a.color?'c'+a.color.itemSize:''); }
function mrgBuild(list,vc){ /* list of meshes with the same material / attributes → one geometry in world space */
  let n=0, ni=0; list.forEach(function(o){ const g=o.geometry; n+=g.attributes.position.count; ni+=g.index?g.index.count:g.attributes.position.count; });
  const a0=list[0].geometry.attributes, P=new Float32Array(n*3), N=list.every(function(o){ return o.geometry.attributes.normal; })?new Float32Array(n*3):null, U=(!vc&&a0.uv)?new Float32Array(n*2):null, cs=vc?3:(a0.color?a0.color.itemSize:0), C=cs?new Float32Array(n*cs):null;
  const I=n>65535?new Uint32Array(ni):new Uint16Array(ni); let vo=0, io=0; const v=new THREE.Vector3(), nm=new THREE.Matrix3();
  list.forEach(function(o){ const g=o.geometry, A=g.attributes, c=A.position.count, M=o.matrixWorld; nm.getNormalMatrix(M);
    for(let i=0;i<c;i++){ v.fromBufferAttribute(A.position,i).applyMatrix4(M); P[(vo+i)*3]=v.x; P[(vo+i)*3+1]=v.y; P[(vo+i)*3+2]=v.z;
      if(N){ v.fromBufferAttribute(A.normal,i).applyMatrix3(nm).normalize(); N[(vo+i)*3]=v.x; N[(vo+i)*3+1]=v.y; N[(vo+i)*3+2]=v.z; }
      if(U){ U[(vo+i)*2]=A.uv.getX(i); U[(vo+i)*2+1]=A.uv.getY(i); }
      if(C){ if(vc){ const mc=o.material.color, vcol=o.material.vertexColors&&A.color; C[(vo+i)*3]=mc.r*(vcol?A.color.getX(i):1); C[(vo+i)*3+1]=mc.g*(vcol?A.color.getY(i):1); C[(vo+i)*3+2]=mc.b*(vcol?A.color.getZ(i):1); } else for(let k=0;k<cs;k++) C[(vo+i)*cs+k]=A.color.array[i*cs+k]; } }
    if(g.index){ const X=g.index.array; for(let k=0;k<X.length;k++) I[io+k]=X[k]+vo; io+=X.length; } else { for(let k=0;k<c;k++) I[io+k]=vo+k; io+=c; }
    vo+=c; });
  const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(P,3)); if(N) bg.setAttribute('normal',new THREE.BufferAttribute(N,3)); if(U) bg.setAttribute('uv',new THREE.BufferAttribute(U,2)); if(C) bg.setAttribute('color',new THREE.BufferAttribute(C,cs));
  bg.setIndex(new THREE.BufferAttribute(I,1)); bg.computeBoundingSphere(); return bg; }
/* size class in the key: small props share a cell only with small props, so the whole cell can be hidden by distance the way
   the per-object size cull hid them before merging (otherwise far cells drew every bench and sign — triangles went up ~25 %) */
function mrgCellKey(r,v){ const sc=r<3?'S':r<20?'M':r<150?'L':'B', T=sc==='B'?4000:800; return sc+Math.floor(v.x/T)+','+Math.floor(v.z/T); }
function mrgRun(){ if(MRG.done||!scene||!scene.traverse) return; MRG.done=true; scene.updateMatrixWorld(true); const EX=mrgExcluded(), by=new Map(); let cnt=0;
  scene.traverse(function(o){ if(!mrgCandidate(o,EX)) return; cnt++; const bs=o.geometry.boundingSphere; MRG.v.copy(bs.center).applyMatrix4(o.matrixWorld);
    const vc=mrgVC(o.material), key=mrgGroupKey(o.material)+'|'+(vc?'vc':mrgSig(o.geometry))+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+mrgCellKey(o.userData._mr,MRG.v); let L=by.get(key); if(!L){ L=[]; by.set(key,L); } L.push(o); });
  MRG.stats.meshes=cnt;
  by.forEach(function(L,key){ if(L.length<(key.indexOf('|B')>0?2:3)) return; let rMax=0; L.forEach(function(o){ rMax=Math.max(rMax,o.userData._mr||0); }); const vc=key.indexOf('|vc|')>0; let geo; try{ geo=mrgBuild(L,vc); }catch(e){ return; }
    let mat=L[0].material; if(vc){ mat=mat.clone(); mat.color.setRGB(1,1,1); mat.vertexColors=true; mat.needsUpdate=true; }
    const m=new THREE.Mesh(geo,mat); m.castShadow=L[0].castShadow; m.receiveShadow=L[0].receiveShadow; m.userData.rs=L[0].userData.rs; m.userData.cs=L[0].userData.cs; m.userData.noMerge=true; m.userData.mergedCell=key; m.matrixAutoUpdate=false; m.updateMatrix();
    scene.add(m); const cell={key:key,mesh:m,rMax:rMax,c:geo.boundingSphere.center.clone(),R:geo.boundingSphere.radius,src:L.map(function(o){ return {o:o,mw:o.matrixWorld.elements.slice(),parent:o.parent,mat:o.material,mk:mrgMatKey(o.material)}; })};
    L.forEach(function(o){ o.userData.merged=cell; o.userData.noCull=true; o.layers.disable(0); });
    MRG.cells.set(key,cell); MRG.stats.merged+=L.length; MRG.stats.cells++; });
  if(typeof CULL!=='undefined') CULL.list=CULL.list.filter(function(o){ return !o.userData.merged; });   /* else the size cull's refresh would switch the originals back on */ }
function mrgUnmerge(cell){ if(!MRG.cells.has(cell.key)) return; MRG.cells.delete(cell.key); scene.remove(cell.mesh); try{ cell.mesh.geometry.dispose(); }catch(e){}
  cell.src.forEach(function(s){ s.o.userData.merged=null; s.o.userData.noCull=false; s.o.layers.enable(0); }); MRG.stats.cells--; MRG.stats.merged-=cell.src.length; }
function mrgChanged(s){ const o=s.o; if(o.parent!==s.parent||o.material!==s.mat) return true; if(s.chk=(s.chk||0)+1, s.chk%4===0&&mrgMatKey(o.material)!==s.mk) return true; let p=o; while(p){ if(!p.visible) return true; if(p===scene) break; p=p.parent; } if(p!==scene) return true;
  const e=o.matrixWorld.elements; for(let k=12;k<15;k++) if(Math.abs(e[k]-s.mw[k])>0.01) return true; for(let k=0;k<11;k++) if(Math.abs(e[k]-s.mw[k])>1e-4) return true; return false; }
/* watchdog: a slice of cells every frame, all cells about every 2 s */
function mrgShow(cells){ if(!camera) return; const on=typeof CULL==='undefined'||CULL.on, k=HH/(2*Math.tan(camera.fov*Math.PI/360)), px=on?CULL.px:0, cp=camera.position;
  for(let i=0;i<cells.length;i++){ const c=cells[i], d=Math.max(1,c.c.distanceTo(cp)-c.R); if(!on||c.rMax*k/d>=px) c.mesh.layers.enable(0); else c.mesh.layers.disable(0); } }
function mrgStep(dt){ if(!MRG.done) return; MRG.t+=dt; const cells=Array.from(MRG.cells.values()); if(!cells.length) return; mrgShow(cells); const per=Math.max(1,Math.ceil(cells.length*dt/2));
  for(let k=0;k<per;k++){ const c=cells[MRG.ix++%cells.length]; if(!c) continue; let bad=false; for(let i=0;i<c.src.length&&!bad;i++){ if(c.src[i].o.layers.test(camera.layers)) c.src[i].o.layers.disable(0); if(mrgChanged(c.src[i])) bad=true; } if(bad) mrgUnmerge(c); } }
if(SETTINGS.merge!==false)setTimeout(function(){ try{ mrgRun(); }catch(e){ console.warn('birleştirme',e); } },2500);
const _mrgCull=cullStep; cullStep=function(dt){ _mrgCull(dt); try{ mrgStep(dt||0); }catch(e){} };
/* ---- device tier → starting preset */
function devTier(){ const g=String(DEV.gpu||'').toLowerCase(), mem=navigator.deviceMemory||4, cores=navigator.hardwareConcurrency||4;
  if(DEV.mobile){ if(/mali-(4|t[678])|adreno[^0-9]*([34]\d\d|50\d|51\d)|powervr|sgx|videocore/.test(g)||mem<=3||cores<=4) return 0;
    if(/apple|adreno[^0-9]*(6[4-9]\d|7\d\d|8\d\d)|mali-g(7[1-9]|[89]\d\d?)|immortalis|xclipse/.test(g)&&mem>=6) return DEV.tablet?2:1; return 1; }
  if(/swiftshader|llvmpipe|softpipe|microsoft basic/.test(g)) return 0;
  if(/intel/.test(g)&&!/arc/.test(g)) return 1; if(/rtx|radeon rx|gtx 1[06]\d0|apple m[1-9]|arc a/.test(g)||mem>=16) return 3; return 2; }
function devTierApply(silent){ const q=devTier(); SETTINGS.quality=q; SETTINGS.fx=null; SETTINGS.shadows=null; SETTINGS.res='auto'; SETTINGS.autoPerf=true; PERF.scale=1; saveSettings(); applyQuality(); syncSettingsUI();
  if(!silent) toast('Cihaza göre ayarlandı: '+['Düşük','Orta','Yüksek','Ultra'][q]+' ('+DEV.kind+(DEV.gpu&&DEV.gpu!=='?'?' · '+String(DEV.gpu).slice(0,40):'')+')','#7dffb0'); }
const _p3Load=loadStore; loadStore=function(){ let first=false; try{ first=!localStorage.getItem('kaan-sim-settings'); }catch(e){} _p3Load(); if(first){ try{ SETTINGS.quality=devTier(); SETTINGS.tierAuto=true; }catch(e){} } };
(function(){ const b=$('btnTier'); if(b) b.addEventListener('click',function(){ devTierApply(false); }); })();
/* ---- full-screen menus: draw the scene at 10 FPS */
function menuCovered(){ if(state!=='menu'||!document.querySelector) return false; return !!document.querySelector('.modal.fs:not(.hidden), #settings:not(.hidden), #records:not(.hidden), #campUI:not(.hidden)'); }
const _p3Frame=frame; frame=function(now){ if(menuCovered()&&now){ if(now-(frame._mt||0)<95){ requestAnimationFrame(frame); return; } frame._mt=now; } _p3Frame(now); };
