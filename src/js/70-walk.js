/* ------------------------------------------------------------------ on foot (first person) and driving a car around the base */
const WALK={mode:'foot', pos:new THREE.Vector3(), yaw:Math.PI, pitch:0, run:false, camD:1, cy:0, fp:false, boxes:null, near:null, nearId:null, sx:0, sy:0,
  car:{x:0,z:0,h:0,v:0,steer:0,mesh:null}, from:'play', bob:0, hint:6};
const WALKBOX=[];       // walk-blocking props (benches, carts, vehicles) collected while building
function wbAdd(obj){ obj.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(obj); if(isFinite(b.min.x)) WALKBOX.push({x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z}); }
function walkBoxes(){
  const L=AP.obst.filter(function(b){ return !b.air; }).concat(svcWallBoxes(),WALKBOX);
  AC_ORDER.forEach(function(id){ const d=displays[id]; if(!d) return; const cx=d.x+(d.ox||0), cz=HANGAR.z+(d.oz||0), hl=(d.len||10)*0.45;
    L.push({x0:cx-1.2,x1:cx+1.2,z0:cz-hl,z1:cz+hl,ac:id}); });
  /* service hangar roof/lintel are above head height; its side walls already in svcWallBoxes */
  return L;
}
function pushCircle(p,r,boxes,skipAc){
  let hit=false;
  for(let k=0;k<boxes.length;k++){ const b=boxes[k]; if(skipAc&&b.ac) continue;
    if(b.ac&&displays[b.ac]&&!displays[b.ac].g.visible) continue;
    if(p.x>b.x0-r&&p.x<b.x1+r&&p.z>b.z0-r&&p.z<b.z1+r){
      const c=[[p.x-(b.x0-r),-1,0],[(b.x1+r)-p.x,1,0],[p.z-(b.z0-r),0,-1],[(b.z1+r)-p.z,0,1]].reduce(function(a,v){ return v[0]<a[0]?v:a; });
      p.x+=c[1]*c[0]; p.z+=c[2]*c[0]; hit=true; }
  }
  return hit;
}
function buildCar(){
  if(WALK.car.mesh) return; const g=bakeGroup(vehCar('follow')); scene.add(g); WALK.car.mesh=g;
  WALK.car.x=HG.X0+7; WALK.car.z=896; WALK.car.h=0; WALK.car.v=0; placeCar();
}
function placeCar(){ const c=WALK.car, gy=Math.max(AIRFIELD_Y,terrainH(c.x,c.z)); c.mesh.position.set(c.x,gy+0.22,c.z); c.mesh.rotation.set(0,c.h,0); c.mesh.rotateZ(clamp(-c.steer*c.v*0.012,-0.06,0.06)); }
function startWalk(){
  if(NET.on){ toast('Yürüyüş modu çok oyunculu oyunda kullanılamaz','#ffc24a'); return; }
  initAudio(); aiClear(); clearThreats(); setPrep(false,[],'');
  if(activeId!==selectedId) setAircraft(selectedId);
  buildCar(); WALK.boxes=walkBoxes(); WALK.mode='foot'; WALK.run=false; WALK.camD=1; WALK.cy=0; WALK.fp=false; WALK.hint=8;
  const d=displays[selectedId]; WALK.pos.set(d.x+(d.ox||0)+4,AIRFIELD_Y+1.7,HANGAR.z-22); WALK.yaw=Math.PI+0.25; WALK.pitch=-0.05;
  state='walk'; showScreen(''); $('gl').focus(); planeGroup.visible=false;
  if(Math.abs(lastFov-70)>0.05){ camera.fov=70; lastFov=70; camera.updateProjectionMatrix(); }
  toast(touchWanted()?'Sol çubukla yürü, ekranı sürükleyerek bak. Uçağa ya da araca yaklaşıp düğmeye bas.':'WASD yürü · fareyle bak (ekrana tıkla) · Shift koş · E uçağa/araca bin · Esc menü','#b8ecff');
}
function walkLeave(){ try{ if(document.pointerLockElement) document.exitPointerLock(); }catch(e){} }
function walkInput(){
  const k=keys, f=((k.KeyW||k.ArrowUp)?1:0)-((k.KeyS||k.ArrowDown)?1:0)+(-WALK.sy), r=((k.KeyD||k.ArrowRight)?1:0)-((k.KeyA||k.ArrowLeft)?1:0)+WALK.sx;
  return {f:clamp(f,-1,1), r:clamp(r,-1,1)};
}
function walkUpdate(dt){
  planeGroup.visible=false; WALK.hint=Math.max(0,WALK.hint-dt);
  const inp=walkInput(), gy=AIRFIELD_Y;
  if(WALK.mode==='foot'){
    const sp=(WALK.run||keys.ShiftLeft||keys.ShiftRight)?8.5:4.2, sy=Math.sin(WALK.yaw), cy=Math.cos(WALK.yaw);
    let mx=(-sy*inp.f+cy*inp.r), mz=(-cy*inp.f-sy*inp.r); const m=Math.hypot(mx,mz); if(m>1){ mx/=m; mz/=m; }
    WALK.pos.x+=mx*sp*dt; WALK.pos.z+=mz*sp*dt;
    pushCircle(WALK.pos,0.35,WALK.boxes); pushCircle(WALK.pos,0.35,carBoxes());
    const R=Math.hypot(WALK.pos.x,WALK.pos.z); if(R>1760){ WALK.pos.x*=1760/R; WALK.pos.z*=1760/R; }
    WALK.bob+=m*sp*dt*1.7; WALK.pos.y=Math.max(gy,terrainH(WALK.pos.x,WALK.pos.z))+1.7+Math.sin(WALK.bob)*0.035*Math.min(1,m);
    /* what can I interact with? */
    WALK.near=null; WALK.nearId=null;
    const c=WALK.car; if(Math.hypot(c.x-WALK.pos.x,c.z-WALK.pos.z)<4) WALK.near='car';
    else { let best=9; AC_ORDER.forEach(function(id){ const d=displays[id]; if(!d||!d.g.visible) return; const dd=Math.hypot(d.x+(d.ox||0)-WALK.pos.x,HANGAR.z+(d.oz||0)-WALK.pos.z); if(dd<best){ best=dd; WALK.nearId=id; } }); if(WALK.nearId) WALK.near='plane'; }
  } else {
    const c=WALK.car, brk=keys.Space;
    let thr=Math.max(0,inp.f), rev=Math.max(0,-inp.f);
    if(thr>0){ c.v+=(c.v<0?14:5.5)*thr*dt; }
    else if(rev>0){ c.v-=(c.v>0.3?14:3.5)*rev*dt; c.v=Math.max(c.v,-7); }
    else { const dec=1.6*dt; c.v=Math.abs(c.v)<dec?0:c.v-Math.sign(c.v)*dec; }
    if(brk){ const dec=18*dt; c.v=Math.abs(c.v)<dec?0:c.v-Math.sign(c.v)*dec; }
    c.v=clamp(c.v-c.v*0.04*dt,-7,30);
    const tgt=inp.r*0.55*(1-Math.min(0.65,Math.abs(c.v)/38)); c.steer+=(tgt-c.steer)*Math.min(1,dt*6);
    c.h-=(c.v/2.7)*Math.tan(c.steer)*dt;
    c.x+=-Math.sin(c.h)*c.v*dt; c.z+=-Math.cos(c.h)*c.v*dt;
    /* three circles along the car body */
    let hit=false; for(const o of [1.5,0,-1.5]){ const p={x:c.x-Math.sin(c.h)*o, z:c.z-Math.cos(c.h)*o}, ox=p.x, oz=p.z; if(pushCircle(p,1.0,WALK.boxes)){ hit=true; c.x+=p.x-ox; c.z+=p.z-oz; } }
    if(hit) c.v*=0.35;
    const R=Math.hypot(c.x,c.z); if(R>1760){ c.x*=1760/R; c.z*=1760/R; c.v*=0.5; }
    placeCar(); WALK.near='car';
    WALK.cy*=Math.exp(-dt*(Math.abs(c.v)>2?1.2:0.15));
  }
}
function carBoxes(){ const c=WALK.car, hw=1.0, hl=2.35, s=Math.abs(Math.sin(c.h)), co=Math.abs(Math.cos(c.h)), ex=hw*co+hl*s, ez=hl*co+hw*s; return [{x0:c.x-ex*0.8,x1:c.x+ex*0.8,z0:c.z-ez*0.8,z1:c.z+ez*0.8}]; }
function walkInteract(){
  if(state!=='walk') return;
  if(WALK.mode==='car'){ const c=WALK.car; WALK.mode='foot'; c.v=0; WALK.pos.set(c.x-Math.cos(c.h)*2.3,0,c.z+Math.sin(c.h)*2.3); WALK.yaw=c.h; WALK.pitch=0;
    WALK.pos.y=Math.max(AIRFIELD_Y,terrainH(WALK.pos.x,WALK.pos.z))+1.7; pushCircle(WALK.pos,0.35,WALK.boxes); return; }
  if(WALK.near==='car'){ WALK.mode='car'; WALK.cy=0; toast('W/S gaz-fren · A/D direksiyon · Space el freni · C kamera · E in','#b8ecff'); return; }
  if(WALK.near==='plane'&&WALK.nearId){ const id=WALK.nearId; walkLeave(); selectedId=id; if(activeId!==id) setAircraft(id); startGame('hangar'); }
}
const wE=new THREE.Euler(0,0,0,'YXZ'), wV=new THREE.Vector3(), wV2=new THREE.Vector3();
function walkCam(dt){
  if(Math.abs(lastFov-70)>0.05){ camera.fov=70; lastFov=70; camera.updateProjectionMatrix(); }
  if(WALK.mode==='foot'){ camera.position.copy(WALK.pos); wE.set(WALK.pitch,WALK.yaw,0); camera.quaternion.setFromEuler(wE); camera.updateMatrixWorld(); return; }
  const c=WALK.car, gy=Math.max(AIRFIELD_Y,terrainH(c.x,c.z));
  if(WALK.fp){ wV.set(-0.4,1.35,0.25).applyAxisAngle(UP,c.h); camera.position.set(c.x+wV.x,gy+wV.y,c.z+wV.z); wE.set(WALK.pitch,c.h+WALK.cy,0); camera.quaternion.setFromEuler(wE); camera.updateMatrixWorld(); return; }
  const a=c.h+WALK.cy, D=7.5*WALK.camD;
  wV.set(c.x+Math.sin(a)*D, gy+2.4+D*0.22+WALK.pitch*-4, c.z+Math.cos(a)*D);
  if(dt>0&&camera.position.distanceTo(wV)<40) camera.position.lerp(wV,1-Math.exp(-dt*8)); else camera.position.copy(wV);
  if(camera.position.y<gy+0.8) camera.position.y=gy+0.8;
  camera.lookAt(wV2.set(c.x,gy+1.2,c.z)); camera.updateMatrixWorld();
}
function drawWalkHUD(){
  const w=HW, h=HH, s=clamp(Math.min(w,h)/760,0.7,1.5), foot=WALK.mode==='foot';
  hx.save(); hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,0.7)'; hx.shadowBlur=4;
  if(foot){ hx.fillStyle='rgba(255,255,255,0.85)'; hx.beginPath(); hx.arc(w/2,h/2,2.2*s,0,Math.PI*2); hx.fill(); }
  hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.textAlign='left'; hx.fillStyle='#b8ecff';
  const top=Math.round(20*s); hx.textAlign=WALK.tvis?'center':'left';
  hx.fillText(foot?(WALK.run||keys.ShiftLeft?'YAYA · KOŞU':'YAYA'):'ARAÇ · BENİ İZLE', WALK.tvis?w/2:Math.round(16*s), top);
  if(!foot){ hx.font='700 '+Math.round(30*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#fff'; hx.fillText(Math.round(Math.abs(WALK.car.v)*3.6)+' km/sa', WALK.tvis?w/2:Math.round(16*s), top+Math.round(30*s)); }
  let msg='';
  if(foot&&WALK.near==='car') msg=(WALK.tvis?'BİN':'E')+' — araca bin';
  else if(foot&&WALK.near==='plane'&&WALK.nearId) msg=(WALK.tvis?'UÇAĞA BİN':'E')+' — '+AIRCRAFT[WALK.nearId].name+' ile uç';
  else if(!foot) msg=(WALK.tvis?'İN':'E')+' — araçtan in';
  if(msg){ hx.textAlign='center'; hx.font='700 '+Math.round(16*s)+'px "Chakra Petch",system-ui,sans-serif'; const tw=hx.measureText(msg).width+28*s, y=h*0.72;
    hx.fillStyle='rgba(8,15,28,0.6)'; hx.fillRect(w/2-tw/2,y-16*s,tw,32*s); hx.fillStyle='#fff'; hx.fillText(msg,w/2,y); }
  if(WALK.hint>0&&!WALK.tvis){ hx.textAlign='center'; hx.font='600 '+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.globalAlpha=Math.min(1,WALK.hint); hx.fillStyle='#dfe9f1';
    hx.fillText(foot?'WASD yürü · fareyle bak (ekrana tıkla) · Shift koş · E etkileşim · Esc menü':'W/S gaz-fren · A/D direksiyon · Space el freni · C kamera · E in', w/2, h-24*s); hx.globalAlpha=1; }
  hx.restore();
}
function walkLook(dx,dy){ const s=SETTINGS.sens||1;
  if(WALK.mode==='foot'){ WALK.yaw-=dx*0.004*s; WALK.pitch=clamp(WALK.pitch-dy*0.004*s,-1.35,1.35); }
  else { WALK.cy-=dx*0.005*s; WALK.pitch=clamp(WALK.pitch-dy*0.004*s,-0.6,0.9); } }
function walkKey(e){
  if(e.code==='Escape'||e.code==='KeyP'){ walkLeave(); pauseGame(); return; }
  if(e.code==='KeyE'||e.code==='Enter'||e.code==='KeyF'){ walkInteract(); return; }
  if(e.code==='KeyC'&&WALK.mode==='car'){ WALK.fp=!WALK.fp; WALK.pitch=0; return; }
  if(e.code==='CapsLock') WALK.run=!WALK.run;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>=0) e.preventDefault();
}
function updateWalkTouch(){
  const vis=touchWanted()&&state==='walk'; const el=$('wtouch');
  if(vis!==!el.classList.contains('hidden')){ el.classList.toggle('hidden',!vis); }
  WALK.tvis=vis;
  if(!vis){ WALK.sx=WALK.sy=0; return; }
  $('wKnob').style.transform='translate('+(WALK.sx*60)+'%,'+(WALK.sy*60)+'%)';
  const foot=WALK.mode==='foot', a=$('wAct');
  const lbl=!foot?'İN':(WALK.near==='car'?'BİN':(WALK.near==='plane'?'UÇAĞA<br>BİN':''));
  a.innerHTML=lbl; a.classList.toggle('off',!lbl);
  $('wRun').classList.toggle('hidden',!foot); $('wRun').classList.toggle('on',WALK.run); $('wCam').classList.toggle('hidden',foot);
}
(function(){
  const stick=$('wStick'); let sid=null;
  function sMove(e){ const r=stick.getBoundingClientRect(); let x=(e.clientX-(r.left+r.width/2))/(r.width/2), y=(e.clientY-(r.top+r.height/2))/(r.height/2); const m=Math.hypot(x,y); if(m>1){ x/=m; y/=m; } WALK.sx=x; WALK.sy=y; }
  stick.addEventListener('pointerdown',function(e){ e.preventDefault(); try{ stick.setPointerCapture(e.pointerId); }catch(err){} sid=e.pointerId; sMove(e); });
  stick.addEventListener('pointermove',function(e){ if(e.pointerId===sid) sMove(e); });
  function sEnd(e){ if(e.pointerId!==sid) return; sid=null; WALK.sx=WALK.sy=0; }
  stick.addEventListener('pointerup',sEnd); stick.addEventListener('pointercancel',sEnd);
  function tap(id,fn){ const el=$(id); el.addEventListener('pointerdown',function(e){ e.preventDefault(); fn(); el.classList.add('on'); setTimeout(function(){ el.classList.remove('on'); },130); }); }
  tap('wAct',walkInteract); tap('wPause',function(){ walkLeave(); pauseGame(); }); tap('wCam',function(){ WALK.fp=!WALK.fp; WALK.pitch=0; }); tap('wRun',function(){ WALK.run=!WALK.run; });
  const glc=$('gl');
  glc.addEventListener('click',function(){ if(state==='walk'&&!touchWanted()&&glc.requestPointerLock){ try{ glc.requestPointerLock(); }catch(e){} } });
  document.addEventListener('mousemove',function(e){ if(state==='walk'&&document.pointerLockElement===glc) walkLook(e.movementX*0.6,e.movementY*0.6); });
})();

