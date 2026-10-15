/* ------------------------------------------------------------------ every vehicle can be boarded: parked fleet, weapons, towing
   VEHS holds all drivable vehicles (the walk-mode car included); WALK.car is the one being driven or the default car.
   Tanks / Korkut / Pars aim the turret with the camera and fire (X, LB or left click); the fire truck sprays water;
   the aircraft tug hitches the parked trainer jet on the apron and tows it. */
const VEHS=[];
const VEH_SPOTS=[
  /* air base apron, in front of the service area */
  ['fire',-420,760,Math.PI/2],['fuel',-420,775,Math.PI/2],['bus',-420,793,Math.PI/2],['tug',-470,820,0],
  /* land base: open ground beside the motor pool */
  ['altay',930,-7560,Math.PI/2],['firtina',930,-7540,Math.PI/2],['pars',930,-7520,Math.PI/2],['korkut',930,-7500,Math.PI/2],
  ['hisar',960,-7560,Math.PI/2],['kirpi',960,-7540,Math.PI/2],['truck',960,-7520,Math.PI/2],['mil',960,-7500,Math.PI/2],
  /* Hilalkent */
  ['bus',-7300,-7012,Math.PI/2],['suvR',-7330,-7025,0]];
function vehNew(kind,x,z,h){
  const c={x:x,z:z,h:h||0,v:0,_v:0,vx:0,vz:0,yr:0,steer:0,ki:Math.max(0,CAR_KINDS.findIndex(function(k){ return k.id===kind; })),mesh:null};
  const m=carBuild(CAR_KINDS[c.ki].id); c.m=m; c.K=m.kind; c.mesh=m.g; scene.add(m.g); c.pitch=c.roll=c.bp=c.br=0; c.y=null; c.ty=0; c.cd=0;
  VEHS.push(c); vehPlace(c,0); return c;
}
function vehPlace(c,dt){ const keep=WALK.car; WALK.car=c; placeCar(dt); WALK.car=keep; }
let VEH_BUILT=false;
function buildVehicles(){ if(VEH_BUILT) return; VEH_BUILT=true; VEH_SPOTS.forEach(function(s){ try{ vehNew(s[0],s[1],s[2],s[3]); }catch(e){ console.warn('araç',s[0],e); } }); towBuild(); }
function vehNear(p){ let best=null, bd=1e9; VEHS.forEach(function(c){ if(c===WALK.car&&WALK.mode==='car') return; const r=(c.m.len||4.6)/2+2.2, d=Math.hypot(c.x-p.x,c.z-p.z); if(d<r&&d<bd){ bd=d; best=c; } }); return best; }
function vehBoxes(except){ const L=[]; VEHS.forEach(function(c){ if(c===except) return; const hw=c.m.tw/2+0.15, hl=(c.m.len||c.m.wb+1.8)/2, s=Math.abs(Math.sin(c.h)), co=Math.abs(Math.cos(c.h)), ex=hw*co+hl*s, ez=hl*co+hw*s; L.push({x0:c.x-ex*0.85,x1:c.x+ex*0.85,z0:c.z-ez*0.85,z1:c.z+ez*0.85}); }); return L; }
/* ---- weapons */
const VFX={shells:[], water:null, wv:[], wn:0};
function vehMuzzle(c,out,dir){
  const t=c.m.turret, yaw=c.h+(t?t.rotation.y:0), len=(c.m.len||6)*(t?0.55:0.5), up=t?t.position.y+0.45:2.4;
  dir.set(-Math.sin(yaw),0,-Math.cos(yaw)); out.set(c.x,(c.y||groundH(c.x,c.z))+up,c.z).addScaledVector(dir,len); return yaw; }
const vM=new THREE.Vector3(), vD=new THREE.Vector3();
function vehFire(){
  const c=WALK.car, K=c&&c.K; if(WALK.mode!=='car'||!K||!K.weapon) return;
  if(K.weapon==='tow'){ towToggle(); return; }
  if(K.weapon==='water'){ VFX.spray=0.25; return; }
  if(c.cd>0) return; const big=K.weapon==='cannon'; c.cd=big?2.4:0.11;
  vehMuzzle(c,vM,vD); const el=big?0.035:0.02, sp=big?240:420, sh={p:vM.clone(),v:vD.clone().multiplyScalar(sp*Math.cos(el)),life:big?6:3,big:big};
  sh.v.y=sp*Math.sin(el)+(-WALK.pitch*sp*0.35);
  const m=new THREE.Mesh(new THREE.SphereGeometry(big?0.18:0.08,6,4),new THREE.MeshBasicMaterial({color:0xffd27a})); m.position.copy(sh.p); scene.add(m); sh.m=m; VFX.shells.push(sh);
  if(big){ explode(vM.clone(),6,1.2); c.bp=-0.05; rumble(160,0.6,0.5); } sndPlay(big?'boom':'gun',{vol:big?0.45:0.8,pitch:big?1.4:0.8});
}
function vehWeaponsStep(dt){
  VEHS.forEach(function(c){ if(c.cd>0) c.cd-=dt; });
  for(let i=VFX.shells.length-1;i>=0;i--){ const s=VFX.shells[i]; s.life-=dt; s.v.y-=9.8*dt; const ox=s.p.x, oz=s.p.z; s.p.addScaledVector(s.v,dt); s.m.position.copy(s.p);
    let hit=s.life<=0||s.p.y<=Math.max(0,groundH(s.p.x,s.p.z));
    for(let k=0;k<gtargets.length&&!hit;k++){ const o=gtargets[k]; if(!o.alive) continue; if(Math.hypot(o.pos.x-s.p.x,o.pos.z-s.p.z)<(o.r||10)&&s.p.y<o.pos.y+(o.r||10)){ hit=true; } }
    for(let k=0;k<AP.obst.length&&!hit;k++){ const b=AP.obst[k]; if(!b.air&&s.p.x>b.x0&&s.p.x<b.x1&&s.p.z>b.z0&&s.p.z<b.z1&&s.p.y<b.y1) hit=true; }
    if(hit){ scene.remove(s.m); s.m.geometry.dispose(); VFX.shells.splice(i,1); if(s.life<=0) continue;
      explode(s.p.clone(),s.big?36:6,s.big?6:1.4);
      gtargets.forEach(function(o){ if(!o.alive) return; const d=Math.hypot(o.pos.x-s.p.x,o.pos.z-s.p.z); if(d<(o.r||10)+(s.big?14:3)){ o.vhp=(o.vhp==null?(o.hp||1):o.vhp)-(s.big?1.2:0.08); if(o.vhp<=0) killGround(o); } }); }
  }
  /* water cannon */
  if(VFX.spray>0||VFX.wn>0){ waterStep(dt); }
  if(VFX.spray>0) VFX.spray-=dt;
  towStep(dt);
}
function waterStep(dt){
  if(!VFX.water){ const N=260, g=new THREE.BufferGeometry(), P=new Float32Array(N*3); g.setAttribute('position',new THREE.BufferAttribute(P,3));
    VFX.water=new THREE.Points(g,new THREE.PointsMaterial({color:0xcfe9ff,size:0.55,transparent:true,opacity:0.75,depthWrite:false})); VFX.water.frustumCulled=false; scene.add(VFX.water);
    for(let i=0;i<N;i++) VFX.wv.push({p:new THREE.Vector3(0,-999,0),v:new THREE.Vector3(),l:0}); }
  const c=WALK.car, P=VFX.water.geometry.attributes.position; let alive=0;
  if(VFX.spray>0&&c&&c.K&&c.K.weapon==='water'){ const yaw=c.h+WALK.cy; vD.set(-Math.sin(yaw),0,-Math.cos(yaw)); vM.set(c.x,(c.y||groundH(c.x,c.z))+3.1,c.z).addScaledVector(vD,2.8);
    for(let k=0;k<6;k++){ const w=VFX.wv[VFX.wn++%VFX.wv.length]; w.p.copy(vM); w.v.copy(vD).multiplyScalar(26+Math.random()*4); w.v.y=6-WALK.pitch*20+Math.random()*1.5; w.v.x+=(Math.random()-0.5)*1.2; w.v.z+=(Math.random()-0.5)*1.2; w.l=2.2; } }
  VFX.wv.forEach(function(w,i){ if(w.l>0){ w.l-=dt; w.v.y-=9.8*dt; w.p.addScaledVector(w.v,dt); if(w.p.y<groundH(w.p.x,w.p.z)) w.l=0; alive++; } P.setXYZ(i,w.p.x,w.l>0?w.p.y:-999,w.p.z); });
  P.needsUpdate=true; if(!alive&&VFX.spray<=0) VFX.wn=0;
}
/* ---- towing: a trainer jet parked on the apron */
const TOW={ac:null, on:false, L:0, h:0, x:0, z:0};
function towBuild(){ try{ const m=buildModel('hurjet'); if(m.flames) m.flames.forEach(function(f){ f.visible=false; }); TOW.ac=m; TOW.def=AIRCRAFT.hurjet; TOW.x=-490; TOW.z=846; TOW.h=Math.PI; TOW.L=6.5; scene.add(m.group); towPlace(); }catch(e){} }
function towPlace(){ const m=TOW.ac; if(!m) return; m.group.position.set(TOW.x,groundH(TOW.x,TOW.z)+(TOW.def.gearOff||1.6),TOW.z); m.group.rotation.set(0,TOW.h,0); }
function towHitch(c,out){ const s=Math.sin(c.h), co=Math.cos(c.h), b=(c.m.len||4.2)/2+0.4; out.set(c.x+s*b,0,c.z+co*b); return out; }
const tH=new THREE.Vector3();
function towToggle(){ const c=WALK.car; if(!TOW.ac) return;
  if(TOW.on){ TOW.on=false; toast('Uçak bırakıldı','#b8ecff'); sndPlay('ui_click'); return; }
  towHitch(c,tH); const nx=TOW.x-Math.sin(TOW.h)*TOW.L, nz=TOW.z-Math.cos(TOW.h)*TOW.L;
  if(Math.hypot(nx-tH.x,nz-tH.z)<7){ TOW.on=true; toast('Hürjet bağlandı — dikkatli çek (X ile bırak)','#7dffb0'); sndPlay('ui_ok'); }
  else toast('Çekici arkasını uçağın burnuna yanaştır (X ile bağla)','#ffc24a'); }
function towStep(){ if(!TOW.on||!TOW.ac) return; const c=WALK.car; if(!c||c.K.id!=='tug'){ TOW.on=false; return; }
  towHitch(c,tH); const dx=tH.x-TOW.x, dz=tH.z-TOW.z; TOW.h=Math.atan2(-dx,-dz); TOW.x=tH.x+Math.sin(TOW.h)*TOW.L; TOW.z=tH.z+Math.cos(TOW.h)*TOW.L; towPlace(); }
/* input: X / LB / left mouse button (pointer locked) */
window.addEventListener('keydown',function(e){ if(state==='walk'&&WALK.mode==='car'&&isKey(e,'land','fire')){ vehFire(); } },true);
window.addEventListener('mousedown',function(e){ if(state==='walk'&&WALK.mode==='car'&&e.button===0&&document.pointerLockElement===$('gl')) vehFire(); });
setInterval(function(){ if(state==='walk'&&WALK.mode==='car'&&WALK.car&&WALK.car.K&&WALK.car.K.weapon&&WALK.car.K.weapon!=='tow'&&WALK.car.K.weapon!=='cannon'&&(act('land','fire')>0.5)) vehFire(); },110);
