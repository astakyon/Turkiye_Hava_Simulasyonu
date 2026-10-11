/* ------------------------------------------------------------------ fuel, damage model and ejection seat (V1.73)
   Fuel burns with throttle (afterburner much faster), UAVs fly far longer; empty tank = flame-out and glide.
   Refuel by stopping on any runway, full repair + refuel in the maintenance hangar.
   Hits can damage the engine (less thrust, engine fire, failure), start a fuel leak or hit a wing (roll drift, parts fly off).
   Ejection (J twice, touch FIRLAT twice): seat fires, parachute opens, steer with WASD, land and continue on foot. */
SETTINGS.fuel=SETTINGS.fuel||'on'; if(typeof SETTINGS_DEF!=='undefined') SETTINGS_DEF.fuel='on';
const DMG={warnT:0, low:false, crit:false, refuelMsg:false, debris:[], ejT:-9};
function fuelMul(){ return SETTINGS.fuel==='off'?0:SETTINGS.fuel==='real'?2:1; }
function dmgReset(){ S.fuel=1; S.eng=0; S.leak=0; S.efire=0; S.wingL=0; S.wingR=0; S.ejected=false; DMG.low=DMG.crit=false; }
function engineDead(){ return (S.eng||0)>=1||(S.fuel!=null&&S.fuel<=0&&fuelMul()>0); }
/* thrust multiplier used by the flight model */
function dmgThrust(){ if(engineDead()) return 0; let k=S.hp<30?0.65:1; k*=1-(S.eng||0)*0.5; return k; }
const _dmgReset=resetFlight; resetFlight=function(mode){ _dmgReset(mode); dmgReset(); EJ.on&&ejClear(); };
/* ---- hits: sub-system damage */
const _dmgHit=damagePlayer; damagePlayer=function(d,reason){ _dmgHit(d,reason); if(S.crashed||d<12) return;
  const r=Math.random();
  if(r<0.34){ S.eng=Math.min(1,(S.eng||0)+0.35+Math.random()*0.2); if(S.eng>=0.6&&!S.efire&&Math.random()<0.55){ S.efire=12; toast('🔥 MOTOR YANGINI','#ff5a4a'); } else toast('MOTOR HASAR ALDI — itki düştü','#ff8a5a'); }
  else if(r<0.6){ S.leak=Math.min(0.02,(S.leak||0)+0.004+Math.random()*0.004); toast('YAKIT SIZINTISI','#ff8a5a'); }
  else if(r<0.9){ const L=Math.random()<0.5, k=L?'wingL':'wingR'; S[k]=Math.min(1.5,(S[k]||0)+0.5+Math.random()*0.4); if(S[k]>=1) dmgDebris(L?1:-1); toast((L?'SOL':'SAĞ')+' KANAT HASARLI','#ff8a5a'); }
};
/* a piece of wing breaks off and tumbles down */
const dmgM=new THREE.MeshLambertMaterial({color:0x5c6670});
function dmgDebris(side){ for(let i=0;i<3;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.4+Math.random()*1.4,0.12,0.4+Math.random()*1.1),dmgM);
    const tip=new THREE.Vector3(-side*((model.tip&&model.tip[0])||5)*0.8,0,0).applyQuaternion(S.q).add(S.pos); m.position.copy(tip); scene.add(m);
    fwdOf(S.q,vF); DMG.debris.push({m:m,v:vF.clone().multiplyScalar(S.speed*0.8).add(new THREE.Vector3((Math.random()-0.5)*12,4+Math.random()*6,(Math.random()-0.5)*12)),w:new THREE.Vector3(Math.random()*9,Math.random()*9,Math.random()*9),t:10}); } }
function debrisStep(dt){ for(let i=DMG.debris.length-1;i>=0;i--){ const d=DMG.debris[i]; d.t-=dt; d.v.y-=9.8*dt; d.v.multiplyScalar(Math.exp(-dt*0.6)); d.m.position.addScaledVector(d.v,dt); d.m.rotation.x+=d.w.x*dt; d.m.rotation.y+=d.w.y*dt; d.m.rotation.z+=d.w.z*dt;
    if(d.t<=0||d.m.position.y<Math.max(0,terrainH(d.m.position.x,d.m.position.z))){ scene.remove(d.m); DMG.debris.splice(i,1); } } }
/* ---- per-frame: fuel, fires, drift, warnings, refuel */
const dmgFV=new THREE.Vector3(), dmgQ=new THREE.Quaternion(), dmgAx=new THREE.Vector3();
function dmgStep(dt){
  debrisStep(dt); if(S.crashed||state!=='play') return; if(S.fuel==null) dmgReset();
  const uav=AIRCRAFT[activeId].uav, run=!engineDead()&&(!S.onGround||S.throttle>0.02||S.speed>1);
  if(run&&fuelMul()>0){ const thr=S.ab?1:S.throttle, burn=(0.00055+thr*0.0016+(S.ab?0.0062:0))*(uav?0.22:1)*fuelMul(); S.fuel=Math.max(0,S.fuel-burn*dt); }
  if(S.leak>0&&fuelMul()>0&&!S.onGround) S.fuel=Math.max(0,S.fuel-S.leak*dt);
  if(S.fuel<=0&&fuelMul()>0&&!DMG.out){ DMG.out=true; toast('YAKIT BİTTİ — motor durdu, süzülerek in','#ff5a4a'); if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, yakıtın bitti! En yakın piste süzül, gerekirse fırlat.'},null,{force:true}); }
  if(S.fuel>0) DMG.out=false;
  if(S.fuel<0.2&&!DMG.low&&fuelMul()>0){ DMG.low=true; toast('YAKIT AZ — üsse dön','#ffc24a'); if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, yakıtın azaldı. Üsse dönüş rotası ver.'},null,{force:true}); }
  if(S.fuel<0.08&&!DMG.crit&&fuelMul()>0){ DMG.crit=true; toast('YAKIT KRİTİK','#ff5a4a'); }
  if(S.fuel>0.25){ DMG.low=false; DMG.crit=false; }
  /* engine fire: burns the airframe until the engine quits */
  if(S.efire>0){ S.efire-=dt; S.hp=Math.max(1,S.hp-1.6*dt); DMG.fT=(DMG.fT||0)-dt;
    if(DMG.fT<=0){ DMG.fT=0.04; dmgFV.set(0,0.2,(model.tail||5)*0.9).applyQuaternion(S.q).add(S.pos); emitVapor(dmgFV,3.2,0xff7a1a,0.35); emitVapor(dmgFV,5,0x222222,2.4); }
    if(S.efire<=0){ S.efire=0; S.eng=1; toast('MOTOR DURDU','#ff5a4a'); } }
  /* damaged wing: roll drift */
  const drift=((S.wingR||0)-(S.wingL||0))*0.32; if(drift&&!S.onGround){ fwdOf(S.q,dmgAx); dmgQ.setFromAxisAngle(dmgAx,drift*dt); S.q.premultiply(dmgQ).normalize(); }
  if(S.leak>0&&!S.onGround){ DMG.lT=(DMG.lT||0)-dt; if(DMG.lT<=0){ DMG.lT=0.08; dmgFV.set(0,-0.3,(model.tail||5)*0.3).applyQuaternion(S.q).add(S.pos); emitVapor(dmgFV,2.2,0xd8dde2,1.2); } }
  /* warning tone */
  if((S.efire>0||S.fuel<0.08&&fuelMul()>0||engineDead())&&!S.onGround){ DMG.warnT-=dt; if(DMG.warnT<=0){ DMG.warnT=1.1; if(typeof beep==='function') beep(620,0.18,0.05); } }
  /* refuel: stopped on a runway with the throttle closed */
  if(S.onGround&&S.speed<0.6&&S.throttle<0.05&&S.fuel<1&&landZone(S.pos.x,S.pos.z)){ S.fuel=Math.min(1,S.fuel+0.05*dt*3); if(!DMG.refuelMsg){ DMG.refuelMsg=true; toast('Yakıt ikmali yapılıyor…','#7dffb0'); } if(S.fuel>=1){ toast('Yakıt dolu','#7dffb0'); } }
  else DMG.refuelMsg=false;
}
const _dmgUpdate=update; update=function(dt){
  if(EJ.on){ ejStep(dt); return; }
  _dmgUpdate(dt); dmgStep(dt); };
/* service hangar: full repair and fuel */
const _dmgSvc=closeService; closeService=function(ok){ const r=_dmgSvc(ok); if(ok){ dmgReset(); } return r; };
/* ---- HUD: fuel gauge + caution panel */
const _dmgHealth=hudHealth; hudHealth=function(x,y){ _dmgHealth(x,y);
  const bw=176*sc, bh=7*sc, by=y+10*sc+13*sc+24*sc, f=clamp(S.fuel==null?1:S.fuel,0,1), col=f>0.2?'#7fd0ff':f>0.08?AMB:RED;
  if(fuelMul()===0) return;
  hx.save(); hx.shadowBlur=0; hx.fillStyle='rgba(4,12,22,0.62)'; hx.fillRect(x,by,bw,bh); hx.globalAlpha=f<0.08?0.6+0.4*Math.sin(T*10):1; hx.fillStyle=col; hx.fillRect(x,by,bw*f,bh); hx.globalAlpha=1;
  hx.strokeStyle=C; hx.lineWidth=1*sc; hx.strokeRect(x,by,bw,bh); hx.restore();
  tx('YAKIT'+(S.leak>0?' · SIZINTI':''),x,by+bh+11*sc,11,'left',S.leak>0?AMB:CD); tx('%'+Math.round(f*100),x+bw,by+bh+11*sc,13,'right',col);
  /* caution list */
  const W=[]; if(S.efire>0) W.push(['MOTOR YANGINI',RED]); else if((S.eng||0)>=1) W.push(['MOTOR DURDU',RED]); else if((S.eng||0)>0) W.push(['MOTOR HASARLI',AMB]);
  if(S.fuel<=0&&fuelMul()>0) W.push(['YAKIT BİTTİ',RED]); else if(S.fuel<0.2&&fuelMul()>0) W.push([S.fuel<0.08?'YAKIT KRİTİK':'YAKIT AZ',S.fuel<0.08?RED:AMB]);
  if(S.leak>0) W.push(['YAKIT SIZINTISI',AMB]); if((S.wingL||0)>0) W.push(['SOL KANAT HASARLI',AMB]); if((S.wingR||0)>0) W.push(['SAĞ KANAT HASARLI',AMB]);
  if(W.length&&!S.crashed){ const tc=TOUCH.vis, px=tc?HW/2:x, py=tc?HH*0.27:by+bh+34*sc, al=tc?'center':'left'; hx.save(); W.forEach(function(w,i){ if(w[1]===RED&&Math.sin(T*8)<-0.3) return; tx('▲ '+w[0],px,py+i*17*sc,13,al,w[1]); });
    if(!AIRCRAFT[activeId].uav&&(S.efire>0||engineDead()||S.hp<35)&&!S.onGround) tx(TOUCH.vis?'FIRLAT düğmesine iki kez dokun':'Fırlatma koltuğu: J tuşuna iki kez bas',px,py+W.length*17*sc+4*sc,11,al,CD); hx.restore(); } };
/* ---- ejection */
const EJ={on:false, p:new THREE.Vector3(), v:new THREE.Vector3(), ph:'seat', t:0, g:null, chute:null, seat:null, canopy:null, yaw:0, plane:true};
function ejBuild(){ const g=new THREE.Group(); const M=hoMats(); const p=trBuild(); p.rotation.x=0; g.add(p); const seat=new THREE.Mesh(new THREE.BoxGeometry(0.75,1.2,0.7),new THREE.MeshLambertMaterial({color:0x2a2e33})); seat.position.set(0,0.9,0.35); g.add(seat); EJ.seatM=seat; return g; }
function ejArm(){ if(state!=='play'||S.crashed||EJ.on) return;
  if(AIRCRAFT[activeId].uav){ toast('İnsansız hava aracı — fırlatma koltuğu yok','#ffc24a'); return; }
  if(S.onGround&&S.speed<20){ toast('Yerdesin — uçaktan inmek için durup Esc → Yürüyerek gez','#ffc24a'); return; }
  if(T-DMG.ejT<1.2) ejectNow(); else { DMG.ejT=T; toast('FIRLATMA: onaylamak için tekrar bas','#ff8a5a'); } }
function ejectNow(){
  if(NET.on){ crash('Fırlatma koltuğuyla atladın'); return; }
  EJ.on=true; S.ejected=true; EJ.ph='seat'; EJ.t=0; fwdOf(S.q,vF); vU.set(0,1,0).applyQuaternion(S.q);
  EJ.p.copy(S.pos).addScaledVector(vU,1.6); EJ.v.copy(vF).multiplyScalar(S.speed*0.85).addScaledVector(vU,42); EJ.yaw=Math.atan2(-vF.x,-vF.z);
  EJ.g=ejBuild(); EJ.g.position.copy(EJ.p); scene.add(EJ.g);
  /* canopy flies off */
  const cm=new THREE.Mesh(new THREE.SphereGeometry(0.9,8,5,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0x8fb6cc,transparent:true,opacity:0.6})); cm.scale.set(0.8,0.6,1.8); cm.position.copy(EJ.p); scene.add(cm);
  DMG.debris.push({m:cm,v:EJ.v.clone().addScaledVector(vU,10),w:new THREE.Vector3(3,1,2),t:8});
  explode(EJ.p.clone(),10,1.5); rumble(400,1,1); sndPlay('boom',{vol:0.7,pitch:1.6});
  /* the jet flies on without a pilot */
  EJ.plane=true; S.throttle=Math.min(S.throttle,0.6); S.ab=false;
  if(M.id!=='free'&&M.id!=='net'&&!M.done){ M.done=true; toast('Görev başarısız — uçaktan atladın','#ff6a5a'); }
  try{ if(typeof careerAdd==='function') careerAdd(0,{eject:1}); }catch(e){}
  toast('FIRLATILDIN! Paraşüt açılıyor — WASD ile yön ver','#ffd27a'); if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs} fırlattı! Paraşüt görüldü, kurtarma ekibi yönlendiriliyor.'},null,{force:true});
}
function ejClear(){ if(EJ.g) scene.remove(EJ.g); if(EJ.chute) scene.remove(EJ.chute); if(EJ.seat) scene.remove(EJ.seat); EJ.g=EJ.chute=EJ.seat=null; EJ.on=false; S.ejected=false; }
function ejStep(dt){
  EJ.t+=dt; debrisStep(dt); updateParts(dt); vaporStep(dt); updateBullets(dt); updateBombs(dt); updateGround(dt); updateThreats(dt);
  /* pilot-less aircraft: run the physics with neutral controls until it hits something */
  if(EJ.plane&&!S.crashed){ const kk=Object.assign({},keys); for(const k in keys) keys[k]=false; const pd={p:PAD.pitch,r:PAD.roll,y:PAD.yaw,t:PAD.thr,f:PAD.fire}; PAD.pitch=PAD.roll=PAD.yaw=PAD.thr=0; PAD.fire=false;
    const tp={p:TOUCH.pitch,r:TOUCH.roll,y:TOUCH.yaw,f:TOUCH.fire}; TOUCH.pitch=TOUCH.roll=TOUCH.yaw=0; TOUCH.fire=false;
    try{ _dmgUpdate(dt); } finally { Object.assign(keys,kk); PAD.pitch=pd.p; PAD.roll=pd.r; PAD.yaw=pd.y; PAD.thr=pd.t; PAD.fire=pd.f; TOUCH.pitch=tp.p; TOUCH.roll=tp.r; TOUCH.yaw=tp.y; TOUCH.fire=tp.f; }
    fwdOf(S.q,dmgAx); dmgQ.setFromAxisAngle(vR.set(1,0,0).applyQuaternion(S.q),-0.12*dt); S.q.premultiply(dmgQ).normalize(); /* nose drops */ }
  if(S.crashed){ EJ.plane=false; S.crashT=99; }
  const g=groundH(EJ.p.x,EJ.p.z), gw=Math.max(g,0);
  if(EJ.ph==='seat'){ EJ.v.y-=9.8*dt; EJ.v.multiplyScalar(Math.exp(-dt*0.9)); EJ.p.addScaledVector(EJ.v,dt); EJ.g.rotation.x+=dt*1.5;
    if(EJ.t>1.4||EJ.p.y-gw<60){ EJ.ph='chute'; EJ.chute=callChute(); EJ.chute.scale.setScalar(0.5); scene.add(EJ.chute); EJ.g.rotation.set(0,EJ.yaw,0);
      /* the empty seat drops away */
      if(EJ.seatM){ EJ.g.remove(EJ.seatM); EJ.seatM.position.copy(EJ.p); scene.add(EJ.seatM); DMG.debris.push({m:EJ.seatM,v:EJ.v.clone(),w:new THREE.Vector3(2,1,3),t:12}); EJ.seatM=null; } } }
  else if(EJ.ph==='chute'){ const ix=act('foot','right')-act('foot','left')+(TOUCH.roll||0), iz=act('foot','fwd')-act('foot','back')-(TOUCH.pitch||0)*0;
    EJ.yaw-=ix*0.8*dt; const fx=-Math.sin(EJ.yaw), fz=-Math.cos(EJ.yaw), hs=3+Math.max(0,iz)*3.5;
    EJ.v.x+=(fx*hs-EJ.v.x)*Math.min(1,dt*1.2); EJ.v.z+=(fz*hs-EJ.v.z)*Math.min(1,dt*1.2); EJ.v.y+=(-(iz<0?4:5.5)-EJ.v.y)*Math.min(1,dt*1.6);
    EJ.p.addScaledVector(EJ.v,dt); EJ.g.rotation.set(0,EJ.yaw,-ix*0.25); const sw=Math.sin(EJ.t*1.1)*0.06;
    EJ.chute.position.set(EJ.p.x,EJ.p.y-0.2,EJ.p.z); EJ.chute.rotation.set(sw,EJ.yaw,-ix*0.25+sw*0.5);
    if(EJ.p.y<=gw+0.05){ ejLand(g<0.3); return; } }
  EJ.g.position.copy(EJ.p);
}
function ejLand(water){
  let x=EJ.p.x, z=EJ.p.z, msg='Yere indin — yürüyebilir ya da G ile araç çağırabilirsin';
  if(water){ let found=null; for(let r=30;r<=4000&&!found;r+=30){ for(let k=0;k<24;k++){ const a=k/24*6.283, px=x+Math.cos(a)*r, pz=z+Math.sin(a)*r; if(groundH(px,pz)>1.5){ found=[px,pz]; break; } } }
    if(found){ x=found[0]; z=found[1]; } else { x=-150; z=-1700; } msg='Denize indin — kurtarma helikopteri seni en yakın kıyıya bıraktı'; }
  const yaw=EJ.yaw; ejClear(); S.crashed=true; S.crashT=99;
  if(DMG.debris.length){ DMG.debris.forEach(function(d){ scene.remove(d.m); }); DMG.debris.length=0; }
  startWalk(); if(state!=='walk') return; WALK.pos.set(x,groundH(x,z)+1.7,z); WALK.yaw=yaw; WALK.pitch=0; WALK.air=false; WALK.hint=10;
  toast(msg,'#7dffb0'); }
/* chase camera on the parachute */
const ejC=new THREE.Vector3();
const _dmgCam=cameraUpdate; cameraUpdate=function(dt){ if(!EJ.on) return _dmgCam(dt);
  const a=EJ.yaw+(typeof CAMU!=='undefined'?CAMU.yaw||0:0), D=EJ.ph==='seat'?14:19; ejC.set(EJ.p.x+Math.sin(a)*D,EJ.p.y+(EJ.ph==='seat'?3:5),EJ.p.z+Math.cos(a)*D);
  const gc=Math.max(groundH(ejC.x,ejC.z),0)+1.2; if(ejC.y<gc) ejC.y=gc;
  if(dt>0&&camera.position.distanceTo(ejC)<60) camera.position.lerp(ejC,1-Math.exp(-dt*4)); else camera.position.copy(ejC);
  camera.lookAt(EJ.p.x,EJ.p.y+(EJ.ph==='chute'?3.6:0.8),EJ.p.z); if(Math.abs(camera.fov-62)>0.1){ camera.fov=62; camera.updateProjectionMatrix(); } camera.updateMatrixWorld(); };
const _dmgHUD=drawHUD; drawHUD=function(){ if(!(EJ.on&&state==='play')) return _dmgHUD();
  hx.setTransform(DPR,0,0,DPR,0,0); hx.clearRect(0,0,HW,HH); const s=clamp(Math.min(HW,HH)/760,0.7,1.5), alt=Math.max(0,Math.round(EJ.p.y-Math.max(groundH(EJ.p.x,EJ.p.z),0)));
  hx.save(); hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,.7)'; hx.shadowBlur=4;
  hx.font='700 '+Math.round(15*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#ffd27a'; hx.fillText(EJ.ph==='seat'?'FIRLATMA KOLTUĞU':'PARAŞÜT', HW/2, 26*s);
  hx.font='700 '+Math.round(30*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#fff'; hx.fillText(alt+' m', HW/2, 58*s);
  hx.font='600 '+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#dfe9f1'; if(EJ.ph==='chute') hx.fillText(TOUCH.vis?'Sola/sağa yatır: dön · ileri: hızlan':'A/D dön · W hızlan · S yavaşla', HW/2, HH-26*s);
  hx.restore(); };
/* input */
window.addEventListener('keydown',function(e){ if(e.repeat||state!=='play') return; if(isKey(e,'air','eject')){ ejArm(); } });
(function(){ const b=$('tEject'); if(b) b.addEventListener('pointerdown',function(e){ e.preventDefault(); ejArm(); }); })();
const _dmgTouch=updateTouchUI; updateTouchUI=function(){ _dmgTouch(); const b=$('tEject'); if(!b) return; const show=state==='play'&&!S.crashed&&!EJ.on&&!S.onGround&&!AIRCRAFT[activeId].uav&&(S.hp<60||engineDead()||S.efire>0||S.fuel<0.1); b.classList.toggle('hidden',!show); };
const _dmgNeeds=needsService; needsService=function(){ return _dmgNeeds()||(S.eng||0)>0||(S.leak||0)>0||(S.wingL||0)>0||(S.wingR||0)>0; };
