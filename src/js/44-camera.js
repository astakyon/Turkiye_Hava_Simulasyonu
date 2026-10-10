/* ------------------------------------------------------------------ camera */
const cV=new THREE.Vector3(), camFwd=new THREE.Vector3(), camInv=new THREE.Quaternion();
let lastFov=0;
const CAMU={yaw:0,pitch:0,zoom:1};                      // play-mode camera orbit (offset from the chase / cockpit view)
const MENUV={yaw:2.7,pitch:0.22,zoom:1,idle:99,dist:36,init:false,tgt:new THREE.Vector3()};
const qU=new THREE.Quaternion(), eU=new THREE.Euler(), mcGoal=new THREE.Vector3();
function placeModel(dt){
  planeGroup.position.copy(S.pos); planeGroup.quaternion.copy(S.q);
  const cine=cineOn()&&activeId===selectedId; if(cine){ cineStep(dt); planeGroup.position.copy(CINE.pos); planeGroup.quaternion.copy(CINE.q); }
  if(!cine&&state==='menu'&&menuMode!=='title'&&activeId===selectedId&&displays[activeId]){ const dd=displays[activeId]; planeGroup.position.set(dd.x,AIRFIELD_Y+CUR.gearOff,HANGAR.z); planeGroup.quaternion.identity(); planeGroup.visible=true; }
  const thr=cine?0.65:(state==='menu'?0.15:(S.ab?1:S.throttle)), ab=state==='play'&&S.ab&&!S.crashed;
  const len=0.9+thr*2.4+(ab?5.5:0), fl=1+(Math.random()-.5)*0.2, wd=ab?1.15:1;
  model.flames.forEach(f=>{ f.outer.scale.set(wd,wd,len*fl); f.inner.scale.set(wd,wd,len*0.55*fl);
    if(f.ds) f.ds.forEach((m,i)=>{ m.visible=ab; if(ab){ m.position.set(f.base[0],f.base[1],f.base[2]+len*fl*(0.2+0.2*i)); const k2=1-0.22*i; m.scale.set(k2,k2,1.5); } }); });
  model.spinners.forEach(sp=>{ sp.obj.rotation.z+=dt*(8+thr*75)*(state==='menu'?0.4:1); sp.disc.material.opacity=0.04+0.2*thr; });
  if(model.strobe) model.strobe.visible=Math.sin(T*9)>0.8;
  model.gear.visible=cine?false:S.gear;
}
function cameraUpdate(dt){
  const cockpit=camMode===1;
  planeGroup.visible=!cockpit&&!S.crashed;
  if(cockpit){
    eU.set(CAMU.pitch,CAMU.yaw,0,'YXZ'); qU.setFromEuler(eU);
    camera.position.copy(cV.set(CUR.eye[0],CUR.eye[1],CUR.eye[2]).applyQuaternion(S.q).add(S.pos)); camera.quaternion.copy(S.q).multiply(qU);
  } else {
    if(camSnap){ camQ.copy(S.q); camSnap=false; } else if(state==='play') camQ.slerp(S.q,1-Math.exp(-6.5*dt));
    eU.set(CAMU.pitch,CAMU.yaw,0,'YXZ'); qU.setFromEuler(eU);
    camera.position.copy(cV.set(0,CUR.cam[0]*CAMU.zoom,CUR.cam[1]*CAMU.zoom).applyQuaternion(qU).applyQuaternion(camQ).add(S.pos));
    camera.quaternion.copy(camQ).multiply(qU).multiply(tiltQ);
  }
  const gh=Math.max(terrainH(camera.position.x,camera.position.z),0)+3;
  if(camera.position.y<gh) camera.position.y=gh;
  const fov=(cockpit?78:64)+smooth(CUR.vTop*0.33,CUR.vTop*1.5,S.speed)*9;
  if(Math.abs(fov-lastFov)>0.05){ camera.fov=fov; lastFov=fov; camera.updateProjectionMatrix(); }
  camera.updateMatrixWorld();
}
function menuCam(dt){
  if(cineOn()&&activeId===selectedId){
    const st=uiStyle(), D=VIEW_D[selectedId]*(menuMode!=='title'?1.05:(st==='A'?0.85:1.0));
    cV1.crossVectors(CINE.fwd,cUP).normalize();
    const sideA=(st==='A'||menuMode!=='title');
    CINE.shotT+=dt;
    const SH=CINE_SHOTS[CINE.shot%CINE_SHOTS.length];
    if(CINE.shotT>SH.dur){ CINE.shotT=0; CINE.shot=(CINE.shot+1)%CINE_SHOTS.length; CINE.init=false; const gl=$('gl'); gl.classList.add('cfade'); requestAnimationFrame(function(){ requestAnimationFrame(function(){ gl.classList.remove('cfade'); }); }); }
    const S2=CINE_SHOTS[CINE.shot%CINE_SHOTS.length], sd=sideA?-1:1;
    if(S2.fly){
      if(!CINE.init){ CINE.fix.copy(CINE.pos).addScaledVector(CINE.fwd,Math.max(D*2,(CINE.spd||100)*1.3)).addScaledVector(cV1,sd*D*S2.r); CINE.fix.y+=D*S2.u; CINE.init=true; }
      camera.position.copy(CINE.fix);
    } else {
      cV2.copy(CINE.pos).addScaledVector(CINE.fwd,D*S2.f).addScaledVector(cV1,sd*D*S2.r); cV2.y+=D*S2.u;
      cV2.sub(CINE.pos); if(!CINE.init){ CINE.off.copy(cV2); CINE.init=true; } else CINE.off.lerp(cV2,1-Math.exp(-3*dt)); camera.position.copy(CINE.pos).add(CINE.off);
    }
    const gmin=Math.max(0,terrainH(camera.position.x,camera.position.z))+20; if(camera.position.y<gmin) camera.position.y=gmin;
    camera.lookAt(CINE.pos);
    const wide=window.innerWidth>760;
    if(menuMode!=='title'){ camera.rotateY(wide?0.3:0.26); camera.rotateX(0.2); } else if(st==='A') camera.rotateY(wide?0.3:0.26); else camera.rotateX(-0.03);
    if(Math.abs(50-lastFov)>0.05){ camera.fov=50; lastFov=50; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld(); planeGroup.visible=true; MENUV.init=false; return;
  }
  CINE.init=false;
  const wide=(menuMode==='title'), d=displays[selectedId], def=AIRCRAFT[selectedId];
  if(wide) mcGoal.set(HANGAR.cx,AIRFIELD_Y+6,HANGAR.z-6); else mcGoal.set(d.x+(d.ox||0),AIRFIELD_Y+def.cam[0]*0.45,HANGAR.z+(d.oz||0));
  if(!MENUV.init){ MENUV.tgt.copy(mcGoal); MENUV.dist=wide?330:VIEW_D[selectedId]; MENUV.init=true; }
  const k=1-Math.exp(-4*dt);
  MENUV.tgt.lerp(mcGoal,k);
  if(wide){
    MENUV.yaw+=((2.55+Math.sin(T*0.1)*0.4)-MENUV.yaw)*(1-Math.exp(-1.2*dt));
    MENUV.pitch+=(0.13-MENUV.pitch)*k; MENUV.dist+=(330-MENUV.dist)*k;
  } else {
    MENUV.idle+=dt; if(menuMode==='loadout') MENUV.yaw+=dt*(MENUV.idle>2?0.32:0); else if(MENUV.idle>3) MENUV.yaw+=dt*0.12;
    MENUV.dist+=(VIEW_D[selectedId]*MENUV.zoom-MENUV.dist)*k;
  }
  const cp=Math.cos(MENUV.pitch), sp=Math.sin(MENUV.pitch);
  camera.position.set(MENUV.tgt.x+Math.sin(MENUV.yaw)*cp*MENUV.dist, MENUV.tgt.y+sp*MENUV.dist, MENUV.tgt.z+Math.cos(MENUV.yaw)*cp*MENUV.dist);
  if(camera.position.y<AIRFIELD_Y+1.5) camera.position.y=AIRFIELD_Y+1.5;
  camera.lookAt(MENUV.tgt);
  if(wide) camera.rotateY(window.innerWidth>760?0.2:0); else if(menuMode==='loadout'){ const W=window.innerWidth, pr=$('setupUI').firstElementChild.getBoundingClientRect(); if(W>760&&pr.width>0){ const ndc=((W-pr.width-16)/2)/W*2-1; camera.rotateY(Math.atan(ndc*Math.tan(25*D2R)*camera.aspect)); camera.rotateX(-0.08); } else camera.rotateX(-0.28); } else camera.rotateX(-0.11);
  if(Math.abs(50-lastFov)>0.05){ camera.fov=50; lastFov=50; camera.updateProjectionMatrix(); }
  camera.updateMatrixWorld(); planeGroup.visible=(menuMode!=='title'&&activeId===selectedId);
}

