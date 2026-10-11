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
  if(WALK.car.mesh){ buildVehicles(); return; }
  let ki=0; try{ const v=+localStorage.getItem('ayy-car'); if(v>=0&&v<CAR_SWAP) ki=v; }catch(e){}
  WALK.car=vehNew(CAR_KINDS[ki].id,HG.X0+7,896,0); buildVehicles();
}
function carMake(){
  const c=WALK.car; if(c.mesh) scene.remove(c.mesh);
  const m=carBuild(CAR_KINDS[c.ki].id); c.m=m; c.K=m.kind; c.mesh=m.g; scene.add(m.g);
  c.pitch=c.roll=c.bp=c.br=0; c.y=null;
}
function carSwap(){
  const c=WALK.car; if(c.ki>=CAR_SWAP){ toast(c.K.n+' değiştirilemez — başka araca yürüyüp bin','#ffc24a'); return; } c.ki=(c.ki+1)%CAR_SWAP; try{ localStorage.setItem('ayy-car',c.ki); }catch(e){}
  carMake(); c.v=0; c._v=0; c.vx=c.vz=0; c.yr=0; placeCar(0); toast('🚙 '+c.K.n,'#b8ecff');
}
/* place the car on the terrain: height and tilt from the four wheel contact points, plus body squat/dive/roll from the motion */
function placeCar(dt){
  const c=WALK.car, m=c.m; if(!m) return;
  const sh=Math.sin(c.h), ch=Math.cos(c.h), hw=m.tw/2, hl=m.wb/2;
  const H=function(lx,lz){ return groundH(c.x+lx*ch+lz*sh, c.z-lx*sh+lz*ch); };
  const fl=H(-hw,-hl), fr=H(hw,-hl), rl=H(-hw,hl), rr=H(hw,hl);
  const y=(fl+fr+rl+rr)/4, tp=Math.atan2((fl+fr)-(rl+rr),2*m.wb), tr=Math.atan2((fr+rr)-(fl+rl),2*m.tw);
  const k=dt>0?1-Math.exp(-dt*10):1;
  c.pitch+=(tp-c.pitch)*k; c.roll+=(tr-c.roll)*k; c.y=(c.y==null||!dt)?y:c.y+(y-c.y)*Math.min(1,dt*18);
  m.g.position.set(c.x,c.y,c.z); m.g.rotation.set(c.pitch,c.h,c.roll,'YXZ');
  /* body: spring towards the load-transfer pose */
  const bp=clamp((c.acc||0)*0.0045,-0.05,0.04), br=clamp(-(c.v||0)*(c.yr||0)*0.0035,-0.06,0.06), kb=dt>0?1-Math.exp(-dt*6):1;
  c.bp+=(bp-c.bp)*kb; c.br+=(br-c.br)*kb;
  m.body.rotation.set(c.bp,0,c.br); m.body.position.y=m.ride+Math.sin(T*23+c.x*0.3)*Math.min(0.012,Math.abs(c.v||0)*0.0004);
  if(m.turret) m.turret.rotation.y=c.ty||0;
  for(let i=0;i<m.wheels.length;i++){ const w=m.wheels[i]; w.spin.rotation.x-=(c.v||0)/w.r*(dt||0); if(w.front) w.pivot.rotation.y=-(c.steer||0); }
}
function startWalk(){
  if(NET.on){ toast('Yürüyüş modu çok oyunculu oyunda kullanılamaz','#ffc24a'); return; }
  initAudio(); aiClear(); clearThreats(); setPrep(false,[],'');
  if(activeId!==selectedId) setAircraft(selectedId);
  if(HELI.cur){ const H=HELI.cur; HELI.cur=null; if(!H.ground){ H.x=H.home[0]; H.z=H.home[1]; H.h=H.home[2]; H.y=groundH(H.x,H.z); H.ground=true; H.pitch=H.roll=0; heliPlace(H); } }
  buildCar(); WALK.boxes=walkBoxes(); WALK.mode='foot'; WALK.run=false; WALK.camD=1; WALK.cy=0; WALK.fp=false; WALK.hint=8;
  const d=displays[selectedId]; WALK.pos.set(d.x+(d.ox||0)+4,AIRFIELD_Y+1.7,HANGAR.z-22); WALK.yaw=Math.PI+0.25; WALK.pitch=-0.05;
  state='walk'; showScreen(''); $('gl').focus(); planeGroup.visible=false;
  if(Math.abs(lastFov-70)>0.05){ camera.fov=70; lastFov=70; camera.updateProjectionMatrix(); }
  toast(touchWanted()?'Sol çubukla yürü, ekranı sürükleyerek bak. Uçağa ya da araca yaklaşıp düğmeye bas.':'WASD yürü · fareyle bak (ekrana tıkla) · Shift koş · E uçağa/araca bin · Esc menü','#b8ecff');
}
function walkLeave(){ try{ if(document.pointerLockElement) document.exitPointerLock(); }catch(e){} }
function walkInput(){
  const car=WALK.mode==='car', f=(car?act('land','gas')-act('land','brake'):act('foot','fwd')-act('foot','back'))+(-WALK.sy), r=(car?act('land','right')-act('land','left'):act('foot','right')-act('foot','left'))+WALK.sx;
  return {f:clamp(f,-1,1), r:clamp(r,-1,1)};
}
function walkUpdate(dt){
  planeGroup.visible=false; WALK.hint=Math.max(0,WALK.hint-dt);
  const inp=walkInput(), gy=AIRFIELD_Y;
  if(WALK.mode==='foot'){
    const sp=(WALK.run||act('foot','run')>0.5)?8.5:4.2, sy=Math.sin(WALK.yaw), cy=Math.cos(WALK.yaw);
    let mx=(-sy*inp.f+cy*inp.r), mz=(-cy*inp.f-sy*inp.r); const m=Math.hypot(mx,mz); if(m>1){ mx/=m; mz/=m; }
    WALK.pos.x+=mx*sp*dt; WALK.pos.z+=mz*sp*dt;
    pushCircle(WALK.pos,0.35,WALK.boxes); pushCircle(WALK.pos,0.35,vehBoxes(null)); pushCircle(WALK.pos,0.35,heliBoxes());
    if(Math.abs(WALK.pos.x)>14500||Math.abs(WALK.pos.z)>14500||groundH(WALK.pos.x,WALK.pos.z)<0.8){ WALK.pos.x-=mx*sp*dt; WALK.pos.z-=mz*sp*dt; }
    const gh=groundH(WALK.pos.x,WALK.pos.z)+1.7;
    if(WALK.jumpQ&&!WALK.air){ WALK.vy=5.4; WALK.air=true; WALK.y=WALK.pos.y; } WALK.jumpQ=false;
    if(WALK.air){ WALK.vy-=13*dt; WALK.y+=WALK.vy*dt; if(WALK.y<=gh){ WALK.y=gh; WALK.air=false; WALK.vy=0; } WALK.pos.y=WALK.y; }
    else { WALK.bob+=m*sp*dt*1.7; WALK.pos.y=gh+Math.sin(WALK.bob)*0.035*Math.min(1,m); }
    /* what can I interact with? */
    WALK.near=null; WALK.nearId=null;
    const vn=vehNear(WALK.pos), hn=heliNear(WALK.pos); WALK.nearHeli=hn; WALK.nearCar=vn; if(vn) WALK.near='car';
    else if(hn) WALK.near='heli';
    else { let best=9; AC_ORDER.forEach(function(id){ const d=displays[id]; if(!d||!d.g.visible) return; const dd=Math.hypot(d.x+(d.ox||0)-WALK.pos.x,HANGAR.z+(d.oz||0)-WALK.pos.z); if(dd<best){ best=dd; WALK.nearId=id; } }); if(WALK.nearId) WALK.near='plane'; }
  } else if(WALK.mode==='heli'){ heliStep(dt); WALK.near=null; }
  else {
    carStep(dt,inp);
    placeCar(dt); WALK.near='car';
    if(!WALK.car.m.turret&&WALK.car.K.weapon!=='water') WALK.cy*=Math.exp(-dt*(Math.abs(WALK.car.v)>2?1.2:0.15));
  }
}
function carStep(dt,inp){
  const c=WALK.car, K=c.K, brk=act('land','handbrake')>0.5, turbo=act('land','turbo')>0.5;
  const fx=-Math.sin(c.h), fz=-Math.cos(c.h), rx=Math.cos(c.h), rz=-Math.sin(c.h);
  if(c.v!==c._v||c.vx==null){ c.vx=fx*c.v; c.vz=fz*c.v; }          // speed set from outside (teleport, tests)
  let vf=c.vx*fx+c.vz*fz, vr=c.vx*rx+c.vz*rz;
  const thr=Math.max(0,inp.f), rev=Math.max(0,-inp.f), top=K.top*(turbo?1.3:1), sg=Math.sign(vf);
  let a=0;
  if(thr>0) a=vf<-0.5?16*thr:K.acc*(turbo?1.4:1)*thr*Math.max(0,1-Math.pow(Math.max(0,vf)/top,2))-(vf>top?(vf-top)*0.8:0);
  else if(rev>0) a=vf>0.5?-16*rev:(vf>-11?-5.5*rev:0);
  else a=-sg*(0.9+0.0005*vf*vf);
  a-=9.8*Math.sin(c.pitch||0)*K.slope;                              // hills
  if(brk) a-=sg*7.5;
  if(thr===0&&rev===0&&Math.abs(vf)<Math.abs(a)*dt&&Math.abs(c.pitch||0)<0.12) { a=0; vf=0; }
  vf+=a*dt; c.acc=a; c.thr=thr; c.turbo=turbo&&thr>0;
  /* steering: less lock at speed; rear grip drops on the handbrake -> drift */
  const smax=0.62/(1+Math.abs(vf)/15); c.steer+=(inp.r*smax-c.steer)*Math.min(1,dt*7);
  const yt=K.tracked?inp.r*0.7*(vf<-0.5?-1:1)*(1-Math.min(0.5,Math.abs(vf)/40)):(vf/c.m.wb)*Math.tan(c.steer)*(brk?1.7:1);
  if(c.m.turret){ const d=clamp(WALK.cy-(c.ty||0),-1.1*dt,1.1*dt); c.ty=(c.ty||0)+d; }
  c.yr=(c.yr||0)+(yt-(c.yr||0))*Math.min(1,dt*(brk?3:9));
  c.h-=c.yr*dt;
  const G=brk?1.3:K.grip*(groundH(c.x,c.z)>AIRFIELD_Y+40&&!K.mil?0.75:1);
  vr*=Math.exp(-G*dt); vf*=Math.exp(-Math.abs(vr)*0.03*dt);
  c.vx=fx*vf+rx*vr; c.vz=fz*vf+rz*vr; c.slip=Math.abs(vr);
  c.x+=c.vx*dt; c.z+=c.vz*dt;
  /* three circles along the car body */
  const o1=c.m.wb*0.55, rad=c.m.tw*0.62;
  const VB=vehBoxes(c); let hit=false; for(const o of [o1,0,-o1]){ const p={x:c.x-Math.sin(c.h)*o, z:c.z-Math.cos(c.h)*o}, ox=p.x, oz=p.z; if(pushCircle(p,rad,WALK.boxes)|pushCircle(p,rad,VB)){ hit=true; c.x+=p.x-ox; c.z+=p.z-oz; } }
  if(hit){ c.vx*=0.35; c.vz*=0.35; vf*=0.35; }
  if(Math.abs(c.x)>14500||Math.abs(c.z)>14500||groundH(c.x,c.z)<0.8){ c.x-=c.vx*dt; c.z-=c.vz*dt; c.vx*=-0.2; c.vz*=-0.2; vf*=-0.2; }
  c.v=vf; c._v=vf;
}
/* simulated gearbox for the HUD and the engine note: [gear, rpm 0..1] */
function carGear(v){ const t=[0,9,17,25,34,44,99], a=Math.abs(v); let g=1; while(g<6&&a>t[g]) g++; const lo=t[g-1], hi=g===6?62:t[g]; return [g, clamp(0.22+0.78*(a-lo)/(hi-lo+(g===1?0:4)),0.18,1)]; }
function carBoxes(){ const c=WALK.car, hw=c.m?c.m.tw/2+0.15:1.0, hl=c.m?c.m.wb/2+0.9:2.35, s=Math.abs(Math.sin(c.h)), co=Math.abs(Math.cos(c.h)), ex=hw*co+hl*s, ez=hl*co+hw*s; return [{x0:c.x-ex*0.8,x1:c.x+ex*0.8,z0:c.z-ez*0.8,z1:c.z+ez*0.8}]; }
function walkInteract(){
  if(state!=='walk') return;
  if(WALK.mode==='heli'){ heliExit(); return; }
  if(WALK.near==='heli'&&WALK.nearHeli){ heliBoard(WALK.nearHeli); return; }
  if(WALK.mode==='car'){ const c=WALK.car; WALK.mode='foot'; c.v=0; WALK.pos.set(c.x-Math.cos(c.h)*(c.m.tw/2+1.3),0,c.z+Math.sin(c.h)*(c.m.tw/2+1.3)); WALK.yaw=c.h; WALK.pitch=0;
    WALK.pos.y=groundH(WALK.pos.x,WALK.pos.z)+1.7; pushCircle(WALK.pos,0.35,WALK.boxes); return; }
  if(WALK.near==='car'){ if(WALK.nearCar) WALK.car=WALK.nearCar; const c0=WALK.car; WALK.mode='car'; c0.v=0; c0._v=0; c0.vx=c0.vz=0; WALK.cy=0; toast(c0.K.n+' — W/S gaz-fren · A/D direksiyon · Space el freni'+(c0.K.weapon==='cannon'||c0.K.weapon==='auto'?' · fareyle nişan, X / sol tık ateş':c0.K.weapon==='water'?' · X su topu':c0.K.weapon==='tow'?' · X uçağı bağla/bırak':'')+(c0.ki<CAR_SWAP?' · T araç değiştir':'')+' · C kamera · E in','#b8ecff'); return; }
  if(WALK.near==='plane'&&WALK.nearId){ const id=WALK.nearId; walkLeave(); selectedId=id; if(activeId!==id) setAircraft(id); startGame('hangar'); }
}
const wE=new THREE.Euler(0,0,0,'YXZ'), wV=new THREE.Vector3(), wV2=new THREE.Vector3();
function walkCam(dt){
  if(WALK.mode==='heli'&&HELI.cur){ heliCam(dt); return; }
  if(Math.abs(lastFov-70)>0.05){ camera.fov=70; lastFov=70; camera.updateProjectionMatrix(); }
  if(WALK.mode==='foot'){ camera.position.copy(WALK.pos); wE.set(WALK.pitch,WALK.yaw,0); camera.quaternion.setFromEuler(wE); camera.updateMatrixWorld(); return; }
  const c=WALK.car, m=c.m, gy=c.y==null?groundH(c.x,c.z):c.y, big=c.K&&c.K.mil?1.18:1, sp=Math.abs(c.v);
  const fov=70+clamp((sp-12)*0.33,0,15); if(Math.abs(lastFov-fov)>0.05){ camera.fov=fov; lastFov=fov; camera.updateProjectionMatrix(); }
  if(WALK.fp){ wV.set(-0.4*big,(c.K&&c.K.mil?1.78:1.3),0.15).applyAxisAngle(UP,c.h); camera.position.set(c.x+wV.x,gy+wV.y,c.z+wV.z); wE.set(WALK.pitch+(c.pitch||0),c.h+WALK.cy,-(c.roll||0)*0.6); camera.quaternion.setFromEuler(wE); camera.updateMatrixWorld(); return; }
  /* chase camera: pulls back with speed, swings a little into drifts */
  const vh=sp>3?Math.atan2(-c.vx,-c.vz):c.h, a=c.h+WALK.cy+clamp(Math.atan2(Math.sin(vh-c.h),Math.cos(vh-c.h)),-0.5,0.5)*0.45, D=(6.6+sp*0.045)*big*WALK.camD;
  wV.set(c.x+Math.sin(a)*D, gy+1.9*big+D*0.2+WALK.pitch*-4, c.z+Math.cos(a)*D);
  const gc=groundH(wV.x,wV.z)+0.8; if(wV.y<gc) wV.y=gc;
  if(dt>0&&camera.position.distanceTo(wV)<40) camera.position.lerp(wV,1-Math.exp(-dt*7)); else camera.position.copy(wV);
  camera.lookAt(wV2.set(c.x,gy+1.3*big,c.z));
  if(sp>30&&!SETTINGS.rm){ const j=(sp-30)*0.00025; camera.rotation.z+=(Math.random()-0.5)*j; }
  camera.updateMatrixWorld();
}
function drawWalkHUD(){
  const w=HW, h=HH, s=clamp(Math.min(w,h)/760,0.7,1.5), foot=WALK.mode==='foot';
  hx.save(); hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,0.7)'; hx.shadowBlur=4;
  if(WALK.mode==='heli'&&HELI.cur){ heliHUD(w,h,s);
    if(WALK.hint>0&&!WALK.tvis){ hx.textAlign='center'; hx.font='600 '+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.globalAlpha=Math.min(1,WALK.hint); hx.fillStyle='#dfe9f1';
      hx.fillText('R/Shift yüksel · F/Ctrl alçal · W/S ileri-geri · A/D yana · Q/E dön · C kamera · G in (yerdeyken) · M harita', w/2, h-24*s); hx.globalAlpha=1; }
    hx.restore(); return; }
  if(foot){ hx.fillStyle='rgba(255,255,255,0.85)'; hx.beginPath(); hx.arc(w/2,h/2,2.2*s,0,Math.PI*2); hx.fill(); }
  hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.textAlign='left'; hx.fillStyle='#b8ecff';
  const top=Math.round(20*s); hx.textAlign=WALK.tvis?'center':'left';
  hx.fillText(foot?(WALK.run||act('foot','run')>0.5?'YAYA · KOŞU':'YAYA'):'ARAÇ · '+WALK.car.K.n.toLocaleUpperCase('tr-TR'), WALK.tvis?w/2:Math.round(16*s), top);
  if(!foot){ hx.font='700 '+Math.round(30*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#fff'; hx.fillText(Math.round(Math.abs(WALK.car.v)*3.6)+' km/sa', WALK.tvis?w/2:Math.round(16*s), top+Math.round(30*s));
    const c=WALK.car, gr=c.v<-0.5?'R':(Math.abs(c.v)<0.5?'N':String(carGear(c.v)[0])); hx.font='700 '+Math.round(14*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#b8ecff';
    hx.fillText('VİTES '+gr+(c.turbo?'  ·  TURBO':'')+(c.slip>3.5?'  ·  DRİFT':''), WALK.tvis?w/2:Math.round(16*s), top+Math.round(56*s));
    if(c.K.weapon){ hx.fillStyle='#ffd27a'; hx.fillText(c.K.weapon==='cannon'?(c.cd>0?'TOP DOLDURULUYOR…':'TOP HAZIR (X / sol tık)'):c.K.weapon==='auto'?'OTOMATİK TOP (X basılı tut)':c.K.weapon==='water'?'SU TOPU (X basılı tut)':(TOW.on?'UÇAK BAĞLI (X bırak)':'ÇEKİCİ (X ile bağla)'), WALK.tvis?w/2:Math.round(16*s), top+Math.round(76*s));
      if(c.m.turret&&!WALK.tvis){ hx.strokeStyle='rgba(255,210,122,.8)'; hx.lineWidth=1.5; hx.beginPath(); hx.arc(w/2,h*0.42,9*s,0,Math.PI*2); hx.moveTo(w/2-16*s,h*0.42); hx.lineTo(w/2-5*s,h*0.42); hx.moveTo(w/2+5*s,h*0.42); hx.lineTo(w/2+16*s,h*0.42); hx.stroke(); } } }
  let msg='';
  if(foot&&WALK.near==='car') msg=(WALK.tvis?'BİN':'E')+' — araca bin';
  else if(foot&&WALK.near==='heli'&&WALK.nearHeli) msg=(WALK.tvis?'BİN':'E')+' — '+WALK.nearHeli.D.name+' helikopterine bin';
  else if(foot&&WALK.near==='plane'&&WALK.nearId) msg=(WALK.tvis?'UÇAĞA BİN':'E')+' — '+AIRCRAFT[WALK.nearId].name+' ile uç';
  else if(!foot) msg=(WALK.tvis?'İN':'E')+' — araçtan in';
  if(msg){ hx.textAlign='center'; hx.font='700 '+Math.round(16*s)+'px "Chakra Petch",system-ui,sans-serif'; const tw=hx.measureText(msg).width+28*s, y=h*0.72;
    hx.fillStyle='rgba(8,15,28,0.6)'; hx.fillRect(w/2-tw/2,y-16*s,tw,32*s); hx.fillStyle='#fff'; hx.fillText(msg,w/2,y); }
  if(WALK.hint>0&&!WALK.tvis){ hx.textAlign='center'; hx.font='600 '+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.globalAlpha=Math.min(1,WALK.hint); hx.fillStyle='#dfe9f1';
    hx.fillText(foot?'WASD yürü · fareyle bak (ekrana tıkla) · Shift koş · Boşluk zıpla · E etkileşim · M yerler · Esc menü':('W/S gaz-fren · A/D direksiyon · Space el freni · Shift turbo'+(WALK.car.ki<CAR_SWAP?' · T araç değiştir':'')+(WALK.car.K.weapon?' · X '+({cannon:'ateş',auto:'ateş',water:'su topu',tow:'uçağı bağla'}[WALK.car.K.weapon]):'')+' · C kamera · E in · M harita'), w/2, h-24*s); hx.globalAlpha=1; }
  hx.restore();
}
function walkLook(dx,dy){ const s=SETTINGS.sens||1;
  if(WALK.mode==='foot'){ WALK.yaw-=dx*0.004*s; WALK.pitch=clamp(WALK.pitch-dy*0.004*s,-1.35,1.35); }
  else { WALK.cy-=dx*0.005*s; WALK.pitch=clamp(WALK.pitch-dy*0.004*s,-0.6,0.9); } }
function walkKey(e){
  if(isKey(e,'gen','pause')||e.code==='Escape'){ walkLeave(); pauseGame(); return; }
  if(WALK.mode==='heli'){
    if(isKey(e,'heli','exit')){ heliExit(); return; }
    if(isKey(e,'gen','camera')){ HELI.fp=!HELI.fp; WALK.pitch=0; WALK.cy=0; return; }
    if(isKey(e,'gen','map')) openMap(); if(isKey(e,'gen','mute')) toggleMute();
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>=0) e.preventDefault(); return; }
  const foot=WALK.mode==='foot';
  if(foot?isKey(e,'foot','use'):isKey(e,'land','exit')){ walkInteract(); return; }
  if(!foot&&isKey(e,'land','cam')){ WALK.fp=!WALK.fp; WALK.pitch=0; return; }
  if((!foot||WALK.near==='car')&&isKey(e,'land','swap')){ carSwap(); return; }
  if(isKey(e,'gen','map')){ if(typeof openMap==='function') openMap(); else walkWarp(); }
  if(isKey(e,'gen','mute')) toggleMute();
  if(foot&&isKey(e,'foot','jump')) WALK.jumpQ=true;
  if(isKey(e,'foot','runToggle')) WALK.run=!WALK.run;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>=0) e.preventDefault();
}
function updateWalkTouch(){
  const vis=touchWanted()&&state==='walk'; const el=$('wtouch');
  if(vis!==!el.classList.contains('hidden')){ el.classList.toggle('hidden',!vis); }
  WALK.tvis=vis;
  if(!vis){ WALK.sx=WALK.sy=0; return; }
  $('wKnob').style.transform='translate('+(WALK.sx*60)+'%,'+(WALK.sy*60)+'%)';
  const foot=WALK.mode==='foot', a=$('wAct');
  const lbl=!foot?'İN':(WALK.near==='car'||WALK.near==='heli'?'BİN':(WALK.near==='plane'?'UÇAĞA<br>BİN':''));
  a.innerHTML=lbl; a.classList.toggle('off',!lbl);
  $('wRun').classList.toggle('hidden',!foot); $('wJump').classList.toggle('hidden',!foot); $('wRun').classList.toggle('on',WALK.run); const heli=WALK.mode==='heli'; $('wCam').classList.toggle('hidden',foot); $('wSwap').classList.toggle('hidden',foot||heli); $('wheli').classList.toggle('hidden',!heli);
}
(function(){
  const stick=$('wStick'); let sid=null;
  function sMove(e){ const r=stick.getBoundingClientRect(); let x=(e.clientX-(r.left+r.width/2))/(r.width/2), y=(e.clientY-(r.top+r.height/2))/(r.height/2); const m=Math.hypot(x,y); if(m>1){ x/=m; y/=m; } WALK.sx=x; WALK.sy=y; }
  stick.addEventListener('pointerdown',function(e){ e.preventDefault(); try{ stick.setPointerCapture(e.pointerId); }catch(err){} sid=e.pointerId; sMove(e); });
  stick.addEventListener('pointermove',function(e){ if(e.pointerId===sid) sMove(e); });
  function sEnd(e){ if(e.pointerId!==sid) return; sid=null; WALK.sx=WALK.sy=0; }
  stick.addEventListener('pointerup',sEnd); stick.addEventListener('pointercancel',sEnd);
  function tap(id,fn){ const el=$(id); el.addEventListener('pointerdown',function(e){ e.preventDefault(); fn(); el.classList.add('on'); setTimeout(function(){ el.classList.remove('on'); },130); }); }
  tap('wAct',walkInteract); tap('wPause',function(){ walkLeave(); pauseGame(); }); tap('wCam',function(){ if(WALK.mode==='heli') HELI.fp=!HELI.fp; else WALK.fp=!WALK.fp; WALK.pitch=0; }); tap('wRun',function(){ WALK.run=!WALK.run; }); tap('wJump',function(){ WALK.jumpQ=true; }); tap('wWarp',function(){ openMap(); }); tap('wSwap',carSwap);
  function hold(id,set){ const el=$(id); const on=function(e){ e.preventDefault(); set(1); el.classList.add('on'); }, off=function(){ set(0); el.classList.remove('on'); };
    el.addEventListener('pointerdown',on); el.addEventListener('pointerup',off); el.addEventListener('pointercancel',off); el.addEventListener('pointerleave',off); }
  hold('hUp',function(v){ WALK.tcoll=v; }); hold('hDn',function(v){ WALK.tcoll=-v; }); hold('hYL',function(v){ WALK.tyaw=-v; }); hold('hYR',function(v){ WALK.tyaw=v; });
  const glc=$('gl');
  glc.addEventListener('click',function(){ if(state==='walk'&&!touchWanted()&&glc.requestPointerLock){ try{ glc.requestPointerLock(); }catch(e){} } });
  document.addEventListener('mousemove',function(e){ if(state==='walk'&&document.pointerLockElement===glc) walkLook(e.movementX*0.6,e.movementY*0.6); });
})();


/* quick travel between the places of the island (on foot or in the car) */
const WARPS=[{n:'Hangar',x:null},{n:'Nizamiye',x:-150,z:-1700,h:0},{n:'Köy',x:-330,z:-2960,h:0},{n:'Deniz Üssü',x:-1560,z:-3330,h:Math.PI/2},{n:'Deniz Üssü · rıhtım',x:-1940,z:-3780,h:0},{n:'Kara Üssü',x:900,z:-7290,h:0},{n:'Kara Üssü · motorlu birlik',x:1200,z:-7545,h:Math.PI/2},{n:'Atış poligonu',x:2160,z:-7660,h:-Math.PI/2},{n:'Hilalkent',x:-7300,z:-7000,h:Math.PI/2},{n:'Hilalkent · meydan',x:-8150,z:-7000,h:Math.PI/2},{n:'Hilal Marina',x:2190,z:1180,h:-2.1},{n:'Kumsal',x:1200,z:2380,h:2.9},{n:'Gölet',x:1440,z:-3750,h:Math.PI/2},{n:'Köy · çay bahçesi',x:-300,z:-2800,h:Math.PI},{n:'Hava savunma mevzisi',x:600,z:-470,h:-0.5},{n:'Mühimmat deposu',x:-1020,z:-290,h:Math.PI/2},{n:'Radar istasyonu',x:5340,z:-2600,h:0},{n:'Hilal Köprüsü',x:-604,z:3600,h:Math.PI},{n:'Anadolukent',x:-600,z:6100,h:Math.PI},{n:'İHA ve test merkezi',x:11560,z:11400,h:Math.PI/2},{n:'Füze test alanı',x:11400,z:12470,h:Math.PI},{n:'Hilal Barajı',x:-3000,z:12000,h:0},{n:'Kayak merkezi',x:4360,z:-5420,h:-1.4},{n:'Kayak · zirve',x:6700,z:-5020,h:2},{n:'Antik kent',x:-6040,z:5780,h:Math.PI},{n:'Kale',x:9310,z:8045,h:Math.PI},{n:'Rasathane',x:10700,z:-10470,h:Math.PI}];
function walkWarp(){
  WALK.warp=((WALK.warp==null?0:WALK.warp)+1)%WARPS.length; const w=WARPS[WALK.warp], c=WALK.car;
  if(w.x==null){ if(WALK.mode==='car'){ c.x=HG.X0+7; c.z=896; c.h=0; } else { const d=displays[selectedId]; WALK.pos.set(d.x+(d.ox||0)+4,AIRFIELD_Y+1.7,HANGAR.z-22); WALK.yaw=Math.PI+0.25; } }
  else if(WALK.mode==='car'){ c.x=w.x; c.z=w.z; c.h=w.h; }
  else { WALK.pos.set(w.x,groundH(w.x,w.z)+1.7,w.z); WALK.yaw=w.h; }
  if(WALK.mode==='car'){ c.v=0; placeCar(); }
  toast('📍 '+w.n,'#b8ecff');
}
