/* ------------------------------------------------------------------ physics */
const vF=new THREE.Vector3(), vR=new THREE.Vector3(), vU=new THREE.Vector3(), vel=new THREE.Vector3(), prevPos=new THREE.Vector3();
const dq=new THREE.Quaternion(), eul=new THREE.Euler();
function fwdOf(q,out){ return out.set(0,0,-1).applyQuaternion(q); }
function crash(reason){
  if(S.crashed) return;
  S.crashed=true; S.crashT=3.4; S.crashReason=reason; S.speed=0; S.sink=0;
  S.pos.y=Math.max(S.pos.y,Math.max(0,terrainH(S.pos.x,S.pos.z))+1);
  explode(S.pos,90,10); rumble(700,1,1); planeGroup.visible=false; courseT=null; ringIdx=0; updateRingVisuals();
  onLocalDeath();
}
function update(dt){
  if(S.crashed){ S.crashT-=dt; if(S.crashT<=0) resetFlight(startMode==='hangar'?'runway':startMode); updateParts(dt); updateBullets(dt); updateTargets(dt); vaporStep(dt); updateBombs(dt); updateGround(dt); updateThreats(dt); return; }

  const k=keys;
  const pc=clamp(((k.KeyS||k.ArrowDown)?1:0)-((k.KeyW||k.ArrowUp)?1:0)+PAD.pitch+TOUCH.pitch,-1,1);
  const rc=clamp(((k.KeyD||k.ArrowRight)?1:0)-((k.KeyA||k.ArrowLeft)?1:0)+PAD.roll+TOUCH.roll,-1,1);
  const yc=clamp((k.KeyE?1:0)-(k.KeyQ?1:0)+PAD.yaw+TOUCH.yaw,-1,1);
  const ease=1-Math.exp(-9*dt);
  S.pitchIn+=((invertY?-pc:pc)-S.pitchIn)*ease; S.rollIn+=(rc-S.rollIn)*ease; S.yawIn+=(yc-S.yawIn)*ease;
  if(!S.auto){
    if(k.KeyR) S.throttle=Math.min(1,S.throttle+0.45*dt);
    if(k.KeyF) S.throttle=Math.max(0,S.throttle-0.45*dt);
    if(PAD.thr) S.throttle=clamp(S.throttle+clamp(PAD.thr,-1.5,1.5)*0.5*dt,0,1);
  }
  S.ab=!!(CUR.hasAB&&(k.ShiftLeft||k.ShiftRight||PAD.ab||TOUCH.ab)); S.brake=!!(k.KeyB||PAD.brake||TOUCH.brake);
  if(S.auto) autoTaxi(dt);
  if(courseT!==null) courseT+=dt;

  const sp=S.speed, stallS=smooth(CUR.stall[0],CUR.stall[1],sp);
  const thr=S.ab?1:S.throttle;
  const thrust=(CUR.idle+thr*CUR.thrust+(S.ab?CUR.abT:0))*(S.hp<30?0.65:1);
  const kD=CUR.kD*(1+(S.gear?0.55:0)+(S.brake&&!S.onGround?1.0:0)+Math.abs(S.pitchIn)*0.22);
  fwdOf(S.q,vF);
  let acc=thrust-kD*sp*sp-9.81*vF.y*0.85;
  if(S.onGround) acc-=(sp>0.2?(S.brake?CUR.brake:CUR.rollFric):0);
  S.speed=clamp(sp+acc*dt,0,650);
  if(S.onGround && S.speed<0.05 && thrust<1) S.speed=0;

  prevPos.copy(S.pos);

  if(!S.onGround){
    const auth=clamp(sp/CUR.authV,0.2,1)*(0.3+0.7*stallS);
    const gcap=CUR.gLim*9.81/Math.max(sp,CUR.minV);
    const pr=S.pitchIn*Math.min(CUR.pitchMax,gcap)*auth-(1-stallS)*CUR.stallNose;
    const rr=S.rollIn*CUR.roll*auth*(1-0.25*smooth(CUR.vTop*0.8,CUR.vTop*1.4,sp));
    const yr=S.yawIn*CUR.yaw*auth;
    eul.set(pr*dt,-yr*dt,-rr*dt,'YXZ'); dq.setFromEuler(eul); S.q.multiply(dq).normalize();
    S.g+=((1+pr*sp/9.81)-S.g)*(1-Math.exp(-6*dt));
    S.sink+=9.81*(1-stallS)*dt; S.sink*=Math.exp(-3*stallS*dt); S.sink=Math.min(S.sink,120);
    fwdOf(S.q,vF);
    vel.copy(vF).multiplyScalar(S.speed); vel.y-=S.sink; S.vy=vel.y;
    S.pos.addScaledVector(vel,dt);

    // terrain / ground contact
    const gh=terrainH(S.pos.x,S.pos.z), gl=Math.max(gh,0);
    const off=S.gear?CUR.gearOff:CUR.belly;
    if(S.pos.y<=gl+off){
      const inField=Math.hypot(S.pos.x,S.pos.z)<1700 && gh>0;
      vR.set(1,0,0).applyQuaternion(S.q); vU.set(0,1,0).applyQuaternion(S.q);
      const bank=Math.atan2(-vR.y,vU.y), pitch=Math.asin(clamp(vF.y,-1,1));
      if(S.gear && inField){
        if(-S.vy<=CUR.sinkMax && pitch>-0.06 && pitch<0.36 && Math.abs(bank)<0.35 && S.speed<CUR.landV){
          S.onGround=true; S.sink=0; S.pos.y=AIRFIELD_Y+CUR.gearOff; toast('İniş tamamlandı','#7dffb0'); rumble(180,0.3,0.6); if(needsService()) toast('Bakım hangarına git (işaretli): onar ve silah yükle','#b8ecff');
        } else crash(-S.vy>CUR.sinkMax?'Sert iniş':'Hatalı iniş açısı');
      } else if(S.gear && gh<=0) crash('Denize düştün');
      else crash(inField?'İniş takımı kapalıydı':(gh<=0?'Denize düştün':'Yere çarptın'));
    }
  } else {
    // ground roll
    if(S.taxi) S.speed=Math.min(S.speed,Math.min(18,CUR.vr*0.45));
    const heading0=Math.atan2(vF.x,-vF.z); let pitch=Math.asin(clamp(vF.y,-1,1));
    const lift=smooth(CUR.stall[0]+3,CUR.stall[1]+1,S.speed);
    const stRate=S.taxi?0.9:0.5, stSpd=S.taxi?5:0.32*CUR.vr;
    let heading=heading0+(S.rollIn+S.yawIn)*stRate*clamp(S.speed/stSpd,S.auto?0.3:(S.taxi?0.2:0),1)*(1-0.6*smooth(0.4*CUR.vr,1.15*CUR.vr,S.speed))*dt;
    pitch+=S.pitchIn*0.55*lift*dt;
    if(S.pitchIn<0.1) pitch-=0.25*dt;
    pitch=clamp(pitch,0,0.38);
    S.q.setFromEuler(eul.set(pitch,-heading,0,'YXZ'));
    S.pos.x+=Math.sin(heading)*S.speed*dt; S.pos.z-=Math.cos(heading)*S.speed*dt;
    S.pos.y=AIRFIELD_Y+CUR.gearOff; S.vy=0; S.g+=(1-S.g)*(1-Math.exp(-6*dt));
    if(!S.clearance) updateTaxi(dt);
    serviceWalls(); serviceStep(dt);
    if(S.speed>CUR.vr && pitch>0.04){ S.onGround=false; S.sink=0; toast('Havalandın!'); }
    if(Math.hypot(S.pos.x,S.pos.z)>1850) crash('Pist dışına çıktın');
  }

  obstacleStep();
  // world bounds
  const lim=Math.max(Math.abs(S.pos.x),Math.abs(S.pos.z));
  if(lim>16500){ toast('Alan dışı — yeniden konumlandırıldın','#ffc24a'); resetFlight('air'); }

  if(!S.crashed){
    if(MS.rings&&rings.length) checkRing(prevPos,S.pos);
    if(k.Space||PAD.fire||TOUCH.fire){ fireCd-=dt; while(fireCd<=0){ fire(); fireCd+=CUR.fireInt; } } else fireCd=0;
  }
  updateBullets(dt); updateParts(dt); updateTargets(dt); vaporStep(dt); updateBombs(dt); updateGround(dt); updateThreats(dt);
  if(M.id==='free' && targets.length && targets.every(t=>!t.alive)){ allDeadT+=dt; if(allDeadT>4){ allDeadT=0; spawnTargets(); toast('Yeni hedefler havada','#ffb25a'); } } else allDeadT=0;
  if(M.id==='free'&&gtargets.length&&gtargets.every(function(o){ return !o.alive; })){ gAllDeadT+=dt; if(gAllDeadT>5){ gAllDeadT=0; spawnGround(); toast('Yeni yer hedefleri tespit edildi','#ffb25a'); } } else gAllDeadT=0;
  updateMission(dt);
}

