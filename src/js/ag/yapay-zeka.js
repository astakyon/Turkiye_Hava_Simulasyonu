/* ------------------------------------------------------------------ AI aircraft (enemies + wingman) and online play (P2P rooms) */
const ACT=[]; let lastHitBy=null, lastHitT=-99, lastFireT=-99, wingSpawned=false;
const SKILL=[{turn:0.72,spread:0.020,react:1.4,lead:0.6,name:'Kolay'},{turn:0.86,spread:0.012,react:0.9,lead:0.85,name:'Orta'},{turn:1.0,spread:0.007,react:0.5,lead:1.0,name:'Zor'}];
const ENEMY_AC=['kaan','hurjet','kizilelma'];
const DF={wave:0,waves:3,next:0,downs:0};
const NET={on:false,host:false,started:false,peer:null,conns:{},hconn:null,myId:'ME',name:'Pilot',room:'',mode:'coop',bots:true,
  roster:[],last:{},sendT:0,score:{},wave:0,waveT:0,timeLeft:0,ended:false,status:'',seq:0};
const NET_MODES={coop:{name:'İşbirliği',desc:'Herkes aynı takımda; kırmızı kuvvetin 5 dalgasını birlikte düşürün.'},
  team:{name:'Takım savaşı',desc:'Mavi ve kırmızı takım (2’ye 2). 10 düşüren takım kazanır.'},
  ffa:{name:'Herkes herkese',desc:'Herkes rakip. 8 düşüren kazanır.'}};
const NET_MAX=4, NET_PREFIX='turkgoklerinde-v1-';
const aV1=new THREE.Vector3(), aV2=new THREE.Vector3(), aV3=new THREE.Vector3(), aV4=new THREE.Vector3(), aM4=new THREE.Matrix4(), UPV=new THREE.Vector3(0,1,0);
const PLY={isPlayer:true,id:'ME',team:'blue',pos:S.pos,fwd:new THREE.Vector3(0,0,-1),speed:0,alive:true,name:'Sen'};
function aiCfg(){ const c=SETTINGS.ai||{}; return {enemies:c.enemies==null?0:c.enemies, wing:c.wing==null?true:!!c.wing, skill:c.skill==null?1:c.skill, sam:c.sam==null?false:!!c.sam}; }
function skillOf(){ return SKILL[clamp(aiCfg().skill|0,0,2)]; }
function myTeam(){ if(!NET.on) return 'blue'; const r=NET.roster.find(function(x){ return x.id===NET.myId; }); return r?r.team:'blue'; }
function plyEnt(){ PLY.id=NET.myId; PLY.team=myTeam(); fwdOf(S.q,PLY.fwd); PLY.speed=S.speed; PLY.alive=(state==='play'||state==='paused')&&!S.crashed&&!S.onGround; PLY.name=NET.on?NET.name:'Sen'; return PLY; }
function actById(id){ for(let i=0;i<ACT.length;i++) if(ACT[i].id===id) return ACT[i]; return null; }
function localAuth(a){ return a.ai&&!a.remote; }

function makeActor(o){
  const def=AIRCRAFT[o.ac]||AIRCRAFT.kaan, mdl=buildModel(AIRCRAFT[o.ac]?o.ac:'kaan');
  if(mdl.gear) mdl.gear.visible=false; scene.add(mdl.group);
  const a={id:o.id,name:o.name,team:o.team,ac:o.ac,def:def,mdl:mdl,g:mdl.group,ai:!!o.ai,remote:!!o.remote,human:!!o.human,wing:!!o.wing,slot:o.slot||1,
    pos:new THREE.Vector3(),q:new THREE.Quaternion(),fwd:new THREE.Vector3(0,0,-1),dir:new THREE.Vector3(0,0,-1),evDir:new THREE.Vector3(),wp:new THREE.Vector3(),
    speed:def.airV*1.05,hp:100,alive:true,respawnT:-1,gunCd:0,burst:0,burstT:0,mslCd:8+Math.random()*6,msl:o.msl!=null?o.msl:2,flares:o.flares!=null?o.flares:8,
    tgt:null,retT:0,lockT:0,evT:0,bank:0,safeT:0,firing:false,ghostT:0,kind:'air',label:o.name,isActor:true,
    np:new THREE.Vector3(),nq:new THREE.Quaternion(),nT:-1,spawn:o.spawn||null};
  ACT.push(a); return a;
}
function removeActor(a){ scene.remove(a.g); untrackModel(a.mdl); const i=ACT.indexOf(a); if(i>=0) ACT.splice(i,1); if(lockTgt===a){ lockTgt=null; lockT=0; } }
function aiClear(){ while(ACT.length) removeActor(ACT[ACT.length-1]); wingSpawned=false; DF.wave=0; DF.next=0; DF.downs=0; abul.forEach(function(b){ b.on=false; b.m.visible=false; }); }
function orientActor(a){
  const f=a.fwd; aV1.crossVectors(f,UPV); if(aV1.lengthSq()<1e-6) aV1.set(1,0,0); aV1.normalize(); aV2.crossVectors(aV1,f).normalize();
  const cb=Math.cos(a.bank), sb=Math.sin(a.bank);
  aV3.copy(aV1).multiplyScalar(cb).addScaledVector(aV2,-sb); aV2.multiplyScalar(cb).addScaledVector(aV1,sb); aV4.copy(f).negate();
  aM4.makeBasis(aV3,aV2,aV4); a.q.setFromRotationMatrix(aM4);
}
function placeActor(a,p,dir){ a.pos.copy(p); a.fwd.copy(dir).normalize(); a.dir.copy(a.fwd); a.bank=0; orientActor(a); a.np.copy(a.pos); a.nq.copy(a.q); syncActorVis(a,0); }
function syncActorVis(a,dt){
  a.g.position.copy(a.pos); a.g.quaternion.copy(a.q); a.g.visible=a.alive;
  const m=a.mdl; if(m.flames) m.flames.forEach(function(f){ f.outer.scale.set(1,1,2.2); f.inner.scale.set(1,1,1.2); });
  if(m.spinners) m.spinners.forEach(function(sp){ sp.obj.rotation.z+=dt*60; });
  if(m.strobe) m.strobe.visible=Math.sin(T*9+a.pos.x)>0.8;
}
function randAirPos(out,minR,maxR){
  for(let i=0;i<40;i++){ const ang=Math.random()*6.283, r=minR+Math.random()*(maxR-minR); out.set(Math.cos(ang)*r,0,Math.sin(ang)*r);
    if(Math.abs(out.x)<12000&&Math.abs(out.z)<12000) break; }
  out.y=Math.max(0,terrainH(out.x,out.z))+700+Math.random()*700; return out;
}
function spawnEnemy(idx,ac,name){
  const a=makeActor({id:'R'+(++NET.seq),name:name||('Kırmızı '+idx),team:'red',ac:ac||ENEMY_AC[idx%ENEMY_AC.length],ai:true,msl:2,flares:6});
  randAirPos(aV1,8500,11000); aV2.set(-aV1.x,0,-aV1.z).normalize(); placeActor(a,aV1,aV2); return a;
}
function spawnWing(){
  const ac=SLOTS[activeId]>0?activeId:'hurjet';
  const a=makeActor({id:'W'+(++NET.seq),name:'Kılıç 2',team:'blue',ac:ac,ai:true,wing:true,msl:4,flares:10});
  fwdOf(S.q,aV2); aV1.set(1,0,0).applyQuaternion(S.q); aV3.copy(S.pos).addScaledVector(aV1,-90).addScaledVector(aV2,-80); aV3.y+=10;
  a.speed=Math.max(S.speed,a.def.airV*0.8); placeActor(a,aV3,aV2); wingSpawned=true; toast('Kanat adamı Kılıç 2 sol arkanda','#39e6ff'); return a;
}
// offline setup, called from setupMission
function aiSetup(){
  aiClear(); if(NET.on) return;
  const c=aiCfg();
  if(M.id==='dogfight'){ DF.wave=0; DF.next=3; DF.downs=0; return; }
  for(let i=0;i<c.enemies;i++) spawnEnemy(i+1);
}
function dfStep(dt){
  if(M.id!=='dogfight'||M.done||NET.on) return;
  const alive=ACT.some(function(a){ return a.team==='red'&&a.alive; });
  if(alive) return;
  if(DF.wave>=DF.waves){ if(DF.next>0){ DF.next-=dt; if(DF.next<=0) endMission(true); } else DF.next=2; return; }
  DF.next-=dt; if(DF.next>0) return;
  ACT.filter(function(a){ return a.team==='red'; }).forEach(removeActor);
  DF.wave++; const n=DF.wave+1; for(let i=0;i<n;i++) spawnEnemy(i+1,null,'Kırmızı '+DF.wave+'-'+(i+1));
  toast('Dalga '+DF.wave+'/'+DF.waves+' — '+n+' düşman uçağı yaklaşıyor','#ff6a6a'); DF.next=4;
}

// ---------- AI brain + flight
function hostileEnts(a){
  const L=[]; const p=plyEnt();
  if(p.alive&&p.team!==a.team) L.push(p);
  for(let i=0;i<ACT.length;i++){ const b=ACT[i]; if(b!==a&&b.alive&&b.team!==a.team) L.push(b); }
  return L;
}
function aiPickTarget(a){
  let best=null, bd=1e12; const L=hostileEnts(a), ref=(a.wing&&PLY.alive)?S.pos:a.pos, lim=a.wing?8000:14000;
  for(let i=0;i<L.length;i++){ const t=L[i];
    if(!NET.on&&a.team==='red'&&Math.hypot(t.pos.x,t.pos.z)<SAFE_R) continue;     // red force stays out of the base air-defence zone
    const d=t.pos.distanceTo(ref), w=d*((t.isPlayer||t.human)?0.6:1); if(d<lim&&w<bd){ bd=w; best=t; } }
  return best;
}
function steerSafe(a,dir){
  const lookT=[1.2,2.6,4.2];
  for(let i=0;i<lookT.length;i++){ aV4.copy(a.pos).addScaledVector(a.fwd,a.speed*lookT[i]); const cl=aV4.y-Math.max(0,terrainH(aV4.x,aV4.z));
    if(cl<260){ dir.y=Math.max(dir.y,0.3+(260-cl)/380); break; } }
  const agl=a.pos.y-Math.max(0,terrainH(a.pos.x,a.pos.z)); if(agl<180) dir.y=Math.max(dir.y,0.6);
  if(a.pos.y>5200) dir.y=Math.min(dir.y,-0.15);
  const lim=Math.max(Math.abs(a.pos.x),Math.abs(a.pos.z)); if(lim>12500){ aV4.set(-a.pos.x,0,-a.pos.z).normalize(); dir.lerp(aV4,0.6); }
  if(!NET.on&&a.team==='red'&&Math.hypot(a.pos.x,a.pos.z)<SAFE_R+600){ aV4.set(a.pos.x,0,a.pos.z).normalize(); dir.lerp(aV4,0.7); }
  return dir.normalize();
}
function aiFly(a,dt,spdT){
  const sk=skillOf(), ang=Math.acos(clamp(a.fwd.dot(a.dir),-1,1)), rate=Math.min(1.15,(7.5*9.81)/Math.max(a.speed,50))*sk.turn*(a.wing?1.1:1);
  aV3.copy(a.fwd);
  if(ang>1e-4) a.fwd.lerp(a.dir,Math.min(1,rate*dt/ang)).normalize();
  const turn=aV1.crossVectors(aV3,a.fwd).y/Math.max(dt,1e-3);
  a.bank+=(clamp(-turn*1.6,-1.35,1.35)-a.bank)*(1-Math.exp(-4*dt));
  a.speed+=clamp(spdT-a.speed,-30*dt,22*dt)-a.fwd.y*9.81*0.35*dt; a.speed=clamp(a.speed,a.def.minV||40,a.def.vTop||320);
  a.pos.addScaledVector(a.fwd,a.speed*dt);
  const floor=Math.max(0,terrainH(a.pos.x,a.pos.z))+35; if(a.pos.y<floor){ a.pos.y=floor; if(a.fwd.y<0.15){ a.fwd.y=0.15; a.fwd.normalize(); } }
  orientActor(a);
}
function aiBrain(a,dt){
  const sk=skillOf(); a.gunCd-=dt; a.mslCd-=dt; a.evT-=dt; a.retT-=dt;
  if(a.retT<=0||(a.tgt&&!a.tgt.alive)){ a.retT=1.5; const keep=a.tgt&&a.tgt.alive&&a.tgt.pos.distanceTo(a.pos)<(a.wing?9000:2500)&&a.tgt.team!==a.team; if(!keep) a.tgt=aiPickTarget(a); }
  let spdT=a.def.airV*1.1;
  if(a.evT>0){ a.dir.copy(a.evDir); spdT=a.def.vTop||spdT*1.3; }
  else if(a.tgt){
    const t=a.tgt; aV1.copy(t.pos).sub(a.pos); const d=aV1.length();
    const lt=clamp(d/(850+a.speed),0,3)*sk.lead;
    aV2.copy(t.pos).addScaledVector(t.fwd,t.speed*lt);
    a.dir.copy(aV2).sub(a.pos).normalize();
    const off=Math.acos(clamp(a.fwd.dot(a.dir),-1,1));
    if(d<380&&a.fwd.dot(t.fwd)<0){ a.evT=2.4; aV3.crossVectors(a.fwd,UPV).normalize(); a.evDir.copy(aV3).multiplyScalar(Math.random()<0.5?1:-1).addScaledVector(UPV,0.35).normalize(); }
    if(d<900) spdT=clamp(t.speed+20,a.def.minV||60,a.def.airV*1.2);
    // guns: short bursts when the pipper is near
    if(d<1300&&off<(a.wing?0.1:0.08)){ if(a.burst<=0&&a.gunCd<=0){ a.burst=0.55; } }
    if(a.burst>0){ a.burst-=dt; a.burstT-=dt; if(a.burstT<=0){ a.burstT=0.075; aiGun(a); } if(a.burst<=0) a.gunCd=0.7+sk.react; }
    // missile: needs a short lock inside the cone
    if(a.msl>0&&a.mslCd<=0&&d>900&&d<5200&&off<0.35&&hasLOS(a.pos,t.pos)){ a.lockT+=dt; if(a.lockT>1.2+sk.react*1.6){ aiMissile(a,t); a.lockT=0; a.mslCd=11+Math.random()*5; } }
    else a.lockT=Math.max(0,a.lockT-dt);
  }
  else if(a.wing&&PLY.alive){
    fwdOf(S.q,aV2); aV1.set(1,0,0).applyQuaternion(S.q);
    aV3.copy(S.pos).addScaledVector(aV1,-75*a.slot).addScaledVector(aV2,-60*a.slot); aV3.y+=8;
    aV4.copy(aV3).addScaledVector(aV2,Math.max(S.speed,60)*1.2);
    a.dir.copy(aV4).sub(a.pos).normalize();
    const along=aV1.copy(aV3).sub(a.pos).dot(aV2);
    spdT=clamp(S.speed+along*0.5,(a.def.minV||50)+5,(a.def.vTop||300));
    if(a.pos.distanceTo(aV3)>4000){ spdT=a.def.vTop||spdT; }
    wingGround(a);
  }
  else {
    if(a.wp.lengthSq()<1||a.pos.distanceTo(a.wp)<900){ if(a.wing){ a.wp.set(Math.random()*2400-1200,0,Math.random()*2400-1200); a.wp.y=900; } else randAirPos(a.wp,5600,11000); }
    a.dir.copy(a.wp).sub(a.pos).normalize(); spdT=a.def.airV;
  }
  steerSafe(a,a.dir); aiFly(a,dt,spdT);
  // red force entering the base defence zone gets engaged
  if(!NET.on&&a.team==='red'&&Math.hypot(a.pos.x,a.pos.z)<SAFE_R){ a.safeT+=dt; if(a.safeT>3){ damageActor(a,999,'BASE'); toast('Üs hava savunması '+a.name+' uçağını düşürdü','#7dffb0'); } } else a.safeT=0;
}
function wingGround(a){
  if(NET.on||!MS.ground||a.msl<=0||a.mslCd>0) return;
  let best=null, bd=6000; gtargets.forEach(function(o){ if(!o.alive) return; const d=o.pos.distanceTo(a.pos); if(d<bd){ bd=d; best=o; } });
  if(!best) return;
  const m=amis.find(function(x){ return !x.on; }); if(!m) return;
  a.msl--; a.mslCd=14;
  m.on=true; m.w='m1'; m.tgt=best; m.speed=Math.max(a.speed,140); m.life=WEAPONS.m1.range/WEAPONS.m1.speed*1.25+4; m.lost=false; m.trailT=0; m.ghost=false; m.byAct=a;
  m.p.copy(a.pos).addScaledVector(UPV,-1.5); m.v.copy(a.fwd).multiplyScalar(m.speed); m.grp.visible=true; m.grp.position.copy(m.p);
  toast('Kılıç 2: '+best.label+' hedefine füze attı','#39e6ff');
}
// AI gunfire (separate tracer pool; red)
const abul=[];
(function(){ const g=new THREE.BoxGeometry(0.25,0.25,8), mt=new THREE.MeshBasicMaterial({color:0xff5a3a,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
  for(let i=0;i<140;i++){ const m=new THREE.Mesh(g,mt); m.visible=false; scene.add(m); abul.push({m:m,p:new THREE.Vector3(),prev:new THREE.Vector3(),v:new THREE.Vector3(),life:0,on:false,own:null,team:'',ghost:false}); } })();
function aiGun(a,ghost){
  const b=abul.find(function(x){ return !x.on; }); if(!b) return;
  const sp=skillOf().spread*(ghost?0.4:1)*(a.wing?0.6:1);
  b.p.copy(a.pos).addScaledVector(a.fwd,8); b.prev.copy(b.p);
  b.v.copy(a.fwd); b.v.x+=(Math.random()-.5)*sp*2; b.v.y+=(Math.random()-.5)*sp*2; b.v.z+=(Math.random()-.5)*sp*2; b.v.normalize().multiplyScalar(a.speed+850);
  b.life=1.6; b.on=true; b.own=a; b.team=a.team; b.ghost=!!ghost||a.remote; b.m.visible=true;
}
function updateABul(dt){
  for(let i=0;i<abul.length;i++){ const b=abul[i]; if(!b.on) continue;
    b.prev.copy(b.p); b.p.addScaledVector(b.v,dt); b.life-=dt; let dead=b.life<=0;
    if(!dead&&!b.ghost){
      const p=plyEnt();
      if(p.alive&&p.team!==b.team&&segDist2(b.prev,b.p,S.pos)<11*11){ hitPlayer(4,b.own?b.own.id:null); dead=true; }
      for(let j=0;!dead&&j<ACT.length;j++){ const t=ACT[j]; if(t===b.own||!t.alive||t.team===b.team) continue; if(segDist2(b.prev,b.p,t.pos)<13*13){ registerHit(t,5,b.own?b.own.id:null); dead=true; } }
    }
    if(!dead&&b.p.y<Math.max(0,terrainH(b.p.x,b.p.z))) dead=true;
    if(dead){ b.on=false; b.m.visible=false; continue; }
    b.m.position.copy(b.p); aV4.copy(b.p).add(b.v); b.m.lookAt(aV4);
  }
}
// missiles fired by AI / remote players reuse the enemy missile pool (m.vic = target actor, null = me)
function spawnMissile(p,v,vic,ghost,byId){
  const m=missiles.find(function(x){ return !x.on; }); if(!m) return null;
  m.on=true; m.life=24; m.speed=Math.max(v.length(),150); m.tgt=null; m.lost=false; m.seen={}; m.src=null; m.trailT=0; m.icp=false; m.doomT=null;
  m.vic=vic||null; m.ghost=!!ghost; m.by=byId||null; m.flareRoll=false;
  m.p.copy(p); m.v.copy(v).setLength(m.speed); m.grp.visible=true; m.grp.position.copy(m.p); return m;
}
function aiMissile(a,t){
  aV1.copy(a.pos).addScaledVector(UPV,-1.5); aV2.copy(a.fwd).multiplyScalar(Math.max(a.speed,150));
  a.msl--;
  if(t.isPlayer){ spawnMissile(aV1,aV2,null,false,a.id); toast(a.name+' füze attı!','#ff5a5a'); return; }
  if(t.remote&&t.human){ spawnMissile(aV1,aV2,t,true,a.id); netSendTo(t.id,{t:'msl',to:t.id,by:a.id,p:v3a(aV1),v:v3a(aV2)}); return; }
  spawnMissile(aV1,aV2,t,false,a.id);
}
// a missile is chasing actor a: evade + flares (returns true if the missile is decoyed)
function actorThreat(a,mp,m){
  const d=mp.distanceTo(a.pos);
  if(localAuth(a)&&d<2600&&a.evT<=0){ a.evT=2.6; aV3.copy(mp).sub(a.pos).normalize(); aV4.crossVectors(aV3,UPV).normalize(); a.evDir.copy(aV4).multiplyScalar(Math.random()<0.5?1:-1).addScaledVector(UPV,-0.15).normalize(); }
  if(d<1100&&!m.flareRoll){ m.flareRoll=true;
    if(a.flares>0&&(a.ai||a.human)){ a.flares-=2; actorFlares(a); if(Math.random()<0.4) return true; } }
  return false;
}
function actorFlares(a){
  for(let k=0;k<2;k++){ const f=flares.find(function(x){ return x.life<=0; }); if(!f) break;
    f.life=4; f.id=++flareId; f.t=0; f.sp.visible=true; f.p.copy(a.pos); f.v.copy(a.fwd).multiplyScalar(a.speed*0.6); f.v.x+=(k?1:-1)*14; f.v.y-=6; }
}
// damage routing
function registerHit(a,dmg,byId){
  if(!a||!a.alive) return;
  if(!a.remote) { damageActor(a,dmg,byId); return; }
  explode(a.pos,6,1.6);
  netSendTo(a.human?a.id:'H',{t:'hit',to:a.id,dmg:dmg,by:byId});
}
function damageActor(a,dmg,byId){
  if(!a.alive) return; a.hp-=dmg; a.lastBy=byId;
  if(a.hp<=0) actorDown(a,byId); else explode(a.pos,8,2);
}
function actorDown(a,byId){
  a.alive=false; a.hp=0; a.g.visible=false; a.tgt=null; explode(a.pos,70,9);
  if(lockTgt===a){ lockTgt=null; lockT=0; }
  const byMe=(byId===NET.myId);
  if(byMe){ score+=150; noteScore(); toast(a.name+' düşürüldü  +150','#ffb25a'); rumble(240,0.6,0.9); }
  else if(a.team===myTeam()) toast(a.name+' düştü','#ffc24a');
  else if(byId&&byId!=='BASE'){ const k=actById(byId); toast((k?k.name:'Takım arkadaşın')+' → '+a.name+' düşürdü','#7dffb0'); }
  if(NET.on&&NET.host) netKill(a.id,byId);
  if(!NET.on){ if(a.wing) a.respawnT=20; else if(M.id==='dogfight') a.respawnT=-1; else a.respawnT=35; }
  else a.respawnT=a.human?-1:7;
}
function respawnActor(a){
  a.hp=100; a.alive=true; a.tgt=null; a.evT=0; a.lockT=0; a.msl=a.wing?4:2; a.flares=a.wing?10:6; a.speed=a.def.airV;
  if(a.wing&&PLY.alive){ fwdOf(S.q,aV2); aV1.copy(S.pos).addScaledVector(aV2,-1500); aV1.y=Math.max(aV1.y,Math.max(0,terrainH(aV1.x,aV1.z))+500); placeActor(a,aV1,aV2); toast('Kılıç 2 yeniden göreve katıldı','#39e6ff'); }
  else if(NET.on&&a.spawn){ const s=spawnPoint(a.spawn); placeActor(a,s.p,s.d); }
  else { randAirPos(aV1,8500,11000); aV2.set(-aV1.x,0,-aV1.z).normalize(); placeActor(a,aV1,aV2); }
}
function hitPlayer(dmg,byId){
  if(S.crashed) return; lastHitBy=byId; lastHitT=T;
  const k=byId?actById(byId):null; damagePlayer(dmg,k?(k.name+' seni düşürdü'):'Vuruldun');
}
function onLocalDeath(){
  const by=(T-lastHitT<10)?lastHitBy:null; lastHitBy=null;
  if(NET.on&&NET.started){ if(NET.host) netKill(NET.myId,by); else netSendTo('H',{t:'dead',id:NET.myId,by:by}); }
}
function hostileActorsForLock(){ const my=myTeam(); return ACT.filter(function(a){ return a.alive&&a.team!==my; }); }

// per-frame
function actorsStep(dt){
  if(!NET.on&&state==='play'&&aiCfg().wing&&!wingSpawned&&!S.onGround&&!S.crashed&&M.id!=='rings') spawnWing();
  plyEnt();
  for(let i=0;i<ACT.length;i++){ const a=ACT[i];
    if(!a.alive){ if(localAuth(a)&&a.respawnT>0){ a.respawnT-=dt; if(a.respawnT<=0) respawnActor(a); } continue; }
    if(a.remote){
      if(a.nT>=0){ a.np.addScaledVector(aV1.set(0,0,-1).applyQuaternion(a.nq),a.nspd*dt); const k=1-Math.exp(-9*dt); a.pos.lerp(a.np,k); a.q.slerp(a.nq,k); fwdOf(a.q,a.fwd); a.speed=a.nspd; }
      if(a.firing){ a.ghostT-=dt; if(a.ghostT<=0){ a.ghostT=0.08; aiGun(a,true); } }
    }
    else aiBrain(a,dt);
    syncActorVis(a,dt);
    if(a.hp<55&&Math.random()<dt*14) emitVapor(a.pos,a.hp<30?5:3.5,0x2c2c2c,2.2);
  }
  updateABul(dt); dfStep(dt);
}

