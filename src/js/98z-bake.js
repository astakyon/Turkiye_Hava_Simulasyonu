/* ------------------------------------------------------------------ model baking (V2.15)
   Aircraft, helicopters, vehicles and targets are built from many small parts: ~1 280 parts in ~50 groups (an aircraft ≈ 40,
   the player's KAAN 126), each one a draw call — the largest source of draw calls left after V2.14. Most parts never move
   relative to their model (fuselage, wings, tanks, wheels of a parked plane): only ~6 % did in a test flight (control
   surfaces, gear, propellers, rotors) and a few changed visibility (weapons, flames).
   • Each model group is "baked": its still parts are merged per material into a few meshes in the group's own space, added
     as children of the group, so the model can still taxi, fly, be boarded or carried. Moving parts stay as they are.
   • A watchdog compares every baked part with its snapshot (position relative to the model, visibility, material). A part
     that moves or appears/disappears leaves the bake for good (noBake) and the model is rebuilt from the rest at once; a
     material change (livery, damage flash) just rebuilds. The player's aircraft is checked every frame, before drawing, so a
     fired missile never hangs under the wing; other models a slice per frame.
   • A model that keeps changing (more than 6 rebuilds in 10 s) is left unbaked.
   Kill switch: SETTINGS.bake=false. */
const BK={recs:new Map(), scanT:0, ix:0, inv:new THREE.Matrix4(), m:new THREE.Matrix4(), stats:{groups:0,parts:0,meshes:0,rebuilds:0,off:0,left:0}};
function bkGroups(){ const G=new Set(); const add=function(g){ if(!g||!g.parent||g===sky) return; let r=g; while(r.parent) r=r.parent; if(r===scene) G.add(g); };   /* main scene only (the model library has its own) */
  try{ for(const id in MODELS.inst) MODELS.inst[id].forEach(function(m){ add(m.group); }); }catch(e){} try{ for(const k in displays) add(displays[k].g); }catch(e){}
  try{ HELI.list.forEach(function(H){ add(H.m&&H.m.g); }); }catch(e){} try{ VEHS.forEach(function(c){ add(c.mesh); }); }catch(e){} try{ BOATS.forEach(function(b){ add(b.g); }); }catch(e){}
  try{ AP.movers.forEach(function(m){ add(m.g); }); }catch(e){} try{ gtargets.forEach(function(o){ add(o.g); }); }catch(e){} try{ targets.forEach(function(o){ add(o.g); }); }catch(e){}
  try{ HTGT.forEach(function(o){ add(o.g); }); }catch(e){} try{ AL.ai.forEach(function(a){ add(a.m&&a.m.group); }); }catch(e){} try{ ACT.forEach(function(a){ add(a.g); }); }catch(e){}
  try{ add(planeGroup); }catch(e){}
  /* nested groups: bake only the outermost one */
  const out=new Set(); G.forEach(function(g){ let p=g.parent, inner=false; while(p&&p!==scene){ if(G.has(p)){ inner=true; break; } p=p.parent; } if(!inner) out.add(g); }); return out; }
function bkPart(o,g){ if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position) return false;
  const m=o.material; if(!m||Array.isArray(m)||m.isShaderMaterial||m.isRawShaderMaterial||m.wireframe) return false; if(o.morphTargetInfluences) return false;
  if(o.onBeforeRender&&o.onBeforeRender.toString().length>40) return false; if(o.userData.noBake||o.userData.noCull||o.userData.bakedMesh) return false;
  let p=o; while(p&&p!==g){ if(!p.visible||p.userData.noBake) return false; p=p.parent; } return p===g; }
function bkRel(g,o,out){ BK.inv.copy(g.matrixWorld).invert(); return out.multiplyMatrices(BK.inv,o.matrixWorld); }
function bkSize(o){ const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); return g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis(); }
function bkKey(o){ const m=o.material, vc=mrgVC(m), r=bkSize(o); return (r<0.6?'s':r<3?'m':'l')+':'+(m.transparent?'T'+m.opacity+(m.depthWrite?'w':'')+':':'')+mrgGroupKey(m)+'|'+(vc?'vc':mrgSig(o.geometry))+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+o.renderOrder; }
function bkBake(g){ if(SETTINGS.bake===false) return null; let rec=BK.recs.get(g); if(rec&&rec.off) return rec;
  g.updateMatrixWorld(true); const parts=[]; g.traverse(function(o){ if(bkPart(o,g)) parts.push(o); });
  if(!rec){ rec={g:g, parts:[], meshes:[], rb:[], off:false}; BK.recs.set(g,rec); }
  if(parts.length<3){ rec.parts=[]; rec.meshes=[]; return rec; }
  const by=new Map(); parts.forEach(function(o){ const k=bkKey(o); let L=by.get(k); if(!L){ L=[]; by.set(k,L); } L.push(o); });
  const rel=new Map(); parts.forEach(function(o){ rel.set(o,bkRel(g,o,new THREE.Matrix4())); }); const mfn=function(o){ return rel.get(o); };
  const meshes=[], used=[];
  by.forEach(function(L,key){ if(L.length<2) return; const vc=key.indexOf('|vc|')>0; let chunk=[], nv=0;
    const flush=function(){ if(chunk.length<2){ chunk=[]; nv=0; return; } let geo=null; try{ geo=mrgBuild(chunk,vc,mfn); }catch(e){ geo=null; }
      if(geo){ const m0=chunk[0]; const m=new THREE.Mesh(geo,vc?mrgVcMat(m0.material):m0.material); m.castShadow=m0.castShadow; m.receiveShadow=m0.receiveShadow; m.renderOrder=m0.renderOrder; m.userData.bakedMesh=true; m.userData.noMerge=true; m.userData.noCull=true; m.userData.bkR=chunk.reduce(function(a,o){ return Math.max(a,bkSize(o)); },0); if(m.userData.bkR<1.5&&typeof shadowLevel==='function'){ let pg=null; try{ pg=planeGroup; }catch(e){} if(g!==pg) m.castShadow=false; } m.matrixAutoUpdate=false; m.updateMatrix(); meshes.push(m); chunk.forEach(function(o){ used.push(o); }); }
      chunk=[]; nv=0; };
    L.forEach(function(o){ const c=o.geometry.attributes.position.count; if(nv+c>65535&&chunk.length) flush(); chunk.push(o); nv+=c; }); flush(); });
  if(!meshes.length){ rec.parts=[]; rec.meshes=[]; return rec; }
  meshes.forEach(function(m){ g.add(m); }); g.updateMatrixWorld(true);
  rec.meshes=meshes; rec.parts=used.map(function(o){ return {o:o, e:rel.get(o).elements.slice(), v:true, mat:o.material, mk:mrgMatKey(o.material), chk:0}; });
  used.forEach(function(o){ o.userData.baked=rec; o.userData.noCull=true; o.layers.disable(0); });
  if(typeof CULL!=='undefined') CULL.list=CULL.list.filter(function(o){ return !o.userData.baked; });
  BK.stats.parts+=used.length; BK.stats.meshes+=meshes.length; return rec; }
function bkUnbake(rec){ if(!rec) return; rec.meshes.forEach(function(m){ if(m.parent) m.parent.remove(m); try{ m.geometry.dispose(); }catch(e){} }); BK.stats.meshes-=rec.meshes.length;
  rec.parts.forEach(function(p){ p.o.userData.baked=null; p.o.userData.noCull=false; p.o.layers.enable(0); }); BK.stats.parts-=rec.parts.length; rec.meshes=[]; rec.parts=[]; }
function bkRebuild(rec,why){ const now=performance.now(); rec.rb=rec.rb.filter(function(t){ return now-t<10000; }); rec.rb.push(now); BK.stats.rebuilds++;
  bkUnbake(rec); if(rec.rb.length>6){ rec.off=true; BK.stats.off++; return; } if(rec.g.parent) bkBake(rec.g); }
/* one part: still where it was baked, still visible, same material? */
function bkPartState(rec,p){ const o=p.o, g=rec.g; let q=o; while(q&&q!==g){ if(!q.visible) return 'vis'; q=q.parent; } if(q!==g) return 'gone';
  if(o.material!==p.mat) return 'mat'; if((p.chk=(p.chk+1)%6)===0&&mrgMatKey(o.material)!==p.mk) return 'mat';
  const e=bkRel(g,o,BK.m).elements; for(let k=0;k<16;k++){ if(Math.abs(e[k]-p.e[k])>(k>=12&&k<15?0.002:1e-4)) return 'move'; } return null; }
function bkCheck(rec){ if(!rec.parts.length) return; if(!rec.g.parent){ bkUnbake(rec); BK.recs.delete(rec.g); return; } rec.g.updateMatrixWorld(); let culprit=null, why=null;
  for(let i=0;i<rec.parts.length;i++){ const p=rec.parts[i]; if(p.o.layers.test(camera.layers)) p.o.layers.disable(0); const w=bkPartState(rec,p); if(w){ culprit=p.o; why=w; break; } }
  if(!culprit) return; if(why!=='mat'){ culprit.userData.noBake=true; BK.stats.left++; } bkRebuild(rec,why); }
function bkScan(){ if(SETTINGS.bake===false) return; const G=bkGroups(); G.forEach(function(g){ if(!BK.recs.has(g)) bkBake(g); }); BK.recs.forEach(function(rec,g){ if(!g.parent||!G.has(g)){ bkUnbake(rec); BK.recs.delete(g); } }); BK.stats.groups=BK.recs.size; }
function bkStep(dt){ if(SETTINGS.bake===false||!BK.started) return; BK.scanT+=dt||0; if(BK.scanT>3){ BK.scanT=0; try{ bkScan(); }catch(e){ console.warn('pişirme',e); } }
  let pg=null; try{ pg=planeGroup; }catch(e){} const pr=pg&&BK.recs.get(pg); if(pr) bkCheck(pr);   /* the player's aircraft every frame */
  const L=Array.from(BK.recs.values()); if(!L.length) return; const per=Math.max(1,Math.ceil(L.length/12));   /* all models about every 12 frames */
  for(let k=0;k<per;k++){ const r=L[BK.ix++%L.length]; if(r&&r!==pr) bkCheck(r); }
  bkShow(L,pr); }
/* size cull for baked meshes: by their largest part (a mesh of bolts spans the whole aircraft but is a few pixels far away) */
function bkShow(L,pr){ if(!camera) return; const on=typeof CULL==='undefined'||CULL.on, k=HH/(2*Math.tan(camera.fov*Math.PI/360)), px=on?CULL.px:0, cp=camera.position, v=BK.v||(BK.v=new THREE.Vector3());
  for(let i=0;i<L.length;i++){ const r=L[i]; if(r===pr) continue; for(let j=0;j<r.meshes.length;j++){ const m=r.meshes[j], g=m.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); v.copy(g.boundingSphere.center).applyMatrix4(m.matrixWorld);
    const d=Math.max(1,v.distanceTo(cp)-g.boundingSphere.radius); if(!on||m.userData.bkR*k/d>=px) m.layers.enable(0); else m.layers.disable(0); } } }
const _bkCull=cullStep; cullStep=function(dt){ _bkCull(dt); try{ bkStep(dt); }catch(e){} };
setTimeout(function(){ BK.started=true; try{ bkScan(); }catch(e){ console.warn('pişirme',e); } },4000);
