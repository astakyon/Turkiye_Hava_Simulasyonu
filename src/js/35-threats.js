/* ------------------------------------------------------------------ threats: SAM sites, missiles, flares, damage */
const FLARES={kaan:24,anka3:12,hurjet:20,hurkus:12,anka:6,aksungur:8,kizilelma:20,tb2:8,tb3:10,akinci:10};
let flaresLeft=0, flareCd=0, flareId=0, rwrT=0, hitFlash=0, dmgT=0;
const flares=[], missiles=[], RWR={lock:false,msl:0}; const mvTmp=new THREE.Vector3(), mvCur=new THREE.Vector3(), mvDes=new THREE.Vector3(), mvPrev=new THREE.Vector3();
(function(){
  const c=document.createElement('canvas'); c.width=64; c.height=64; const x=c.getContext('2d');
  const gr=x.createRadialGradient(32,32,1,32,32,30); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.35,'rgba(255,190,90,0.8)'); gr.addColorStop(1,'rgba(255,120,30,0)');
  x.fillStyle=gr; x.fillRect(0,0,64,64); const tex=new THREE.CanvasTexture(c);
  for(let i=0;i<24;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); sp.visible=false; scene.add(sp);
    flares.push({sp:sp,p:new THREE.Vector3(),v:new THREE.Vector3(),life:0,id:0,t:0}); }
  const mg=new THREE.CylinderGeometry(0.25,0.25,4,8); mg.rotateX(Math.PI/2); const mm=new THREE.MeshPhongMaterial({color:0xe8e8e8});
  for(let i=0;i<6;i++){ const grp=new THREE.Group(); grp.add(new THREE.Mesh(mg,mm)); const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); gl.scale.set(12,12,1); gl.position.z=2.4; grp.add(gl); grp.visible=false; scene.add(grp);
    missiles.push({on:false,grp:grp,p:new THREE.Vector3(),v:new THREE.Vector3(),speed:0,life:0,tgt:null,lost:false,seen:{},src:null,trailT:0}); }
})();
function clearThreats(){ icps.forEach(function(i){ i.on=false; i.grp.visible=false; }); missiles.forEach(function(m){ m.on=false; m.grp.visible=false; }); flares.forEach(function(f){ f.life=0; f.sp.visible=false; }); RWR.lock=false; RWR.msl=0; hitFlash=0; }
const SAFE_R=4500, icps=[], BATT=[[330,AIRFIELD_Y,-260],[-330,AIRFIELD_Y,260],[330,AIRFIELD_Y,900],[-420,AIRFIELD_Y,-700]];
(function(){
  const c=document.createElement('canvas'); c.width=64; c.height=64; const x=c.getContext('2d');
  const gr=x.createRadialGradient(32,32,1,32,32,30); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.4,'rgba(120,255,160,0.8)'); gr.addColorStop(1,'rgba(60,200,100,0)');
  x.fillStyle=gr; x.fillRect(0,0,64,64); const tex=new THREE.CanvasTexture(c);
  const mg=new THREE.CylinderGeometry(0.25,0.25,3.6,8); mg.rotateX(Math.PI/2); const mm=new THREE.MeshPhongMaterial({color:0xdfe8df});
  for(let i=0;i<4;i++){ const grp=new THREE.Group(); grp.add(new THREE.Mesh(mg,mm)); const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); gl.scale.set(14,14,1); gl.position.z=2.2; grp.add(gl); grp.visible=false; scene.add(grp);
    icps.push({on:false,grp:grp,p:new THREE.Vector3(),v:new THREE.Vector3(),tgt:null,life:0,trailT:0}); }
})();
function buildBaseDefense(){ BATT.forEach(function(b){ const g=gBuild('sam'); g.position.set(b[0],b[1],b[2]); g.rotation.y=Math.PI; scene.add(g); }); }
function inSafeZone(){ return !NET.on&&Math.hypot(S.pos.x,S.pos.z)<SAFE_R; }
function launchInterceptor(m){
  const i=icps.find(function(x){ return !x.on; }); if(!i) return;
  let best=BATT[0], bd=1e12; BATT.forEach(function(b){ const d=Math.hypot(b[0]-m.p.x,b[2]-m.p.z); if(d<bd){ bd=d; best=b; } });
  i.on=true; i.tgt=m; i.life=8; i.trailT=0; i.p.set(best[0],best[1]+6,best[2]); i.v.set(0,500,0); i.grp.visible=true; i.grp.position.copy(i.p);
}
function killEnemyMissile(m){
  explode(m.p,40,6); m.on=false; m.grp.visible=false; toast('Hava savunma füzeyi düşürdü!','#7dffb0');
}
function updateInterceptors(dt){
  icps.forEach(function(i){
    if(!i.on) return; i.life-=dt;
    if(!i.tgt||!i.tgt.on){ i.on=false; i.grp.visible=false; return; }
    mvCur.copy(i.v).normalize(); mvDes.copy(i.tgt.p).sub(i.p); const dist=mvDes.length(); mvDes.normalize();
    const ang=Math.acos(clamp(mvCur.dot(mvDes),-1,1)), maxT=3.4*dt; if(ang>1e-5) mvCur.lerp(mvDes,Math.min(1,maxT/ang)).normalize();
    i.v.copy(mvCur).multiplyScalar(950); i.p.addScaledVector(i.v,dt); i.grp.position.copy(i.p); mvTmp.copy(i.p).add(i.v); i.grp.lookAt(mvTmp);
    i.trailT-=dt; if(i.trailT<=0){ i.trailT=0.03; emitVapor(i.p,2.6,0xcfeedd,1.5); }
    if(dist<60||i.life<=0){ if(dist<60) killEnemyMissile(i.tgt); i.on=false; i.grp.visible=false; }
  });
}
function hasLOS(a,b){
  for(let i=1;i<8;i++){ const u=i/8, x=a.x+(b.x-a.x)*u, z=a.z+(b.z-a.z)*u, y=a.y+(b.y-a.y)*u; if(terrainH(x,z)+4>y) return false; }
  return true;
}
function launchSam(o){
  const m=missiles.find(function(x){ return !x.on; }); if(!m) return false;
  m.on=true; m.life=26; m.speed=70; m.tgt=null; m.lost=false; m.seen={}; m.src=o; m.trailT=0; m.icp=false; m.doomT=null; m.vic=null; m.ghost=false; m.by=null;
  m.p.copy(o.pos); m.p.y+=6;
  mvTmp.copy(S.pos).sub(m.p).normalize(); m.v.copy(mvTmp).multiplyScalar(0.6); m.v.y+=0.8; m.v.normalize().multiplyScalar(m.speed);
  m.grp.visible=true; m.grp.position.copy(m.p); return true;
}
function samBrain(o,dt){
  o.tracking=false; if(!o.alive) return; o.cd-=dt;
  if(state!=='play'||S.onGround||S.crashed||inSafeZone()){ o.lockT=0; return; }
  const d=o.pos.distanceTo(S.pos), agl=S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z));
  mvTmp.set(o.pos.x,o.pos.y+6,o.pos.z);
  if(d<4200 && agl>25 && hasLOS(mvTmp,S.pos)){
    o.tracking=true; o.lockT+=dt;
    if(o.lockT>3 && o.cd<=0 && !missiles.some(function(m){ return m.on&&m.src===o; })){ if(launchSam(o)){ o.cd=14; toast('Füze atıldı!','#ff5a5a'); } }
  } else o.lockT=Math.max(0,o.lockT-dt*2);
}
function dropFlares(){
  if(state!=='play'||S.onGround||S.crashed||flareCd>0) return false;
  if(flaresLeft<=0){ toast('Flare kalmadı — pistte yenile','#ffc24a'); return false; }
  flaresLeft=Math.max(0,flaresLeft-2); flareCd=0.6; fwdOf(S.q,vF);
  for(let k=0;k<2;k++){
    const f=flares.find(function(x){ return x.life<=0; }); if(!f) break;
    f.life=5; f.id=++flareId; f.t=0; f.sp.visible=true;
    f.p.set((k?1:-1)*0.8,-0.6,(model.tail||5)).applyQuaternion(S.q).add(S.pos);
    f.v.set((k?1:-1)*(10+Math.random()*6),-5-Math.random()*4,0).applyQuaternion(S.q).addScaledVector(vF,S.speed*0.7); f.v.y-=S.sink*0.5;
  }
  noiseBurst(2400,'highpass',0.08,0.35); return true;
}
function beep(freq,dur,vol){
  if(!AC||muted||!master) return;
  const o=AC.createOscillator(), g=AC.createGain(); o.type='square'; o.frequency.value=freq;
  g.gain.setValueAtTime(vol||0.06,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dur); o.connect(g); g.connect(master); o.start(); o.stop(AC.currentTime+dur+0.02);
}
function damagePlayer(d,reason){
  if(S.crashed) return; S.hp=Math.max(0,S.hp-d); hitFlash=0.7; rumble(350,0.8,1);
  if(S.hp<=0){ crash(reason); } else { explode(S.pos,25,4); toast('İsabet aldın!  Hasar %'+Math.round(100-S.hp),'#ff5a5a'); }
}
function updateThreats(dt){
  hitFlash=Math.max(0,hitFlash-dt); if(flareCd>0) flareCd-=dt;
  flares.forEach(function(f){
    if(f.life<=0) return; f.life-=dt; f.v.y-=4.9*dt; f.v.multiplyScalar(1-0.55*dt); f.p.addScaledVector(f.v,dt);
    f.sp.position.copy(f.p); f.sp.material.opacity=Math.min(1,f.life/1.2)*(0.75+0.25*Math.random()); f.sp.scale.setScalar(5+2*Math.random());
    f.t-=dt; if(f.t<=0){ f.t=0.05; emitVapor(f.p,3,0xe8e8e8,1.4); }
    if(f.life<=0) f.sp.visible=false;
  });
  missiles.forEach(function(m){
    if(!m.on) return;
    m.life-=dt; m.speed=Math.min(440,m.speed+120*dt);
    let tp=null;
    if(m.vic){ if(!m.vic.alive) m.lost=true; else if(!m.lost){ tp=m.vic.pos; if(!m.ghost&&actorThreat(m.vic,m.p,m)){ m.lost=true; tp=null; } } }
    else if(!m.lost){ if(m.tgt){ if(m.tgt.life<=0){ m.lost=true; m.tgt=null; } else tp=m.tgt.p; } else tp=S.pos; }
    if(!m.vic&&!m.tgt&&!m.lost){
      mvCur.copy(m.v).normalize();
      for(let i=0;i<flares.length;i++){ const f=flares[i]; if(f.life<=0||m.seen[f.id]) continue;
        mvTmp.copy(f.p).sub(m.p); const dist=mvTmp.length(); if(dist<900 && mvTmp.dot(mvCur)/dist>0.55){ m.seen[f.id]=true; if(Math.random()<(dist>300?0.55:0.25)){ m.tgt=f; tp=f.p; break; } } }
    }
    if(tp){
      mvCur.copy(m.v).normalize(); mvDes.copy(tp).sub(m.p).normalize();
      const ang=Math.acos(clamp(mvCur.dot(mvDes),-1,1)), maxT=Math.min(1.2,(22*9.81)/m.speed)*dt;
      if(ang>1e-5){ mvCur.lerp(mvDes,Math.min(1,maxT/ang)).normalize(); }
      m.v.copy(mvCur).multiplyScalar(m.speed);
    } else m.v.setLength(m.speed);
    mvPrev.copy(m.p); m.p.addScaledVector(m.v,dt);
    m.grp.position.copy(m.p); mvTmp.copy(m.p).add(m.v); m.grp.lookAt(mvTmp);
    m.trailT-=dt; if(m.trailT<=0){ m.trailT=0.035; emitVapor(m.p,2.8,0xe6e6e6,2.2); }
    if(!m.vic&&inSafeZone()&&!S.crashed&&!m.lost&&!m.tgt){
      if(!m.icp){ m.icp=true; launchInterceptor(m); }
      m.doomT=(m.doomT==null?2.0:m.doomT)-dt;
      if(m.doomT<=0||m.p.distanceTo(S.pos)<450){ killEnemyMissile(m); return; }
    }
    let end=false;
    const dPl=Math.sqrt(segDist2(mvPrev,m.p,S.pos));
    if(m.vic){ if(!m.lost&&m.vic.alive&&m.p.distanceTo(m.vic.pos)<24){ end=true; explode(m.p,40,6); if(!m.ghost) registerHit(m.vic,100,m.by); } }
    else if(!S.crashed && dPl<24 && (!m.tgt||dPl<14) && !m.lost){ end=true; lastHitBy=m.by||null; lastHitT=T; damagePlayer(dPl<=8?100:70-(dPl-8)*2,'Füzeyle vuruldun'); explode(m.p,40,6); }
    else if(m.tgt && m.tgt.p.distanceTo(m.p)<20){ end=true; explode(m.p,30,5); toast('Flare füzeyi saptırdı','#7dffb0'); m.tgt.life=0; m.tgt.sp.visible=false; }
    else if(m.p.y<Math.max(0,terrainH(m.p.x,m.p.z))+2){ end=true; explode(m.p,25,5); }
    else if(m.life<=0){ end=true; explode(m.p,20,4); }
    if(end){ m.on=false; m.grp.visible=false; }
  });
  updateInterceptors(dt);
  // damage effects: smoke below 60 hp, fire and weak engines below 30 hp
  if(!S.crashed&&!S.onGround&&S.hp<60){
    dmgT-=dt;
    if(dmgT<=0){ dmgT=S.hp<30?0.03:0.06; vTip.set(0,0.1,model.tail||5).applyQuaternion(S.q).add(S.pos);
      emitVapor(vTip,S.hp<30?6:4,0x2c2c2c,2.8); if(S.hp<30) emitVapor(vTip,2.6,0xff8a2a,0.45); }
  }
  // radar warning
  let lock=false; gtargets.forEach(function(o){ if(o.type==='sam'&&o.alive&&o.tracking) lock=true; });
  let md=1e9; missiles.forEach(function(m){ if(m.on&&!m.lost&&!m.tgt&&!m.vic) md=Math.min(md,m.p.distanceTo(S.pos)); });
  RWR.lock=lock&&state==='play'&&!S.crashed; RWR.msl=(md<1e8&&state==='play'&&!S.crashed)?md:0;
  rwrT-=dt;
  if(rwrT<=0 && state==='play' && !S.crashed){ if(RWR.msl>0){ rwrT=clamp(md/3000,0.12,0.5); beep(1700,0.07,0.07); } else if(RWR.lock){ rwrT=0.9; beep(900,0.1,0.05); } }
}

