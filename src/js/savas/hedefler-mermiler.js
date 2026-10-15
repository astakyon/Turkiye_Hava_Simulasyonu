/* ------------------------------------------------------------------ targets, bullets, particles */
const targets=[];
const tgtGeo=new THREE.IcosahedronGeometry(18,1), tgtMat=new THREE.MeshPhongMaterial({color:0xd0141f, emissive:0x35060a, flatShading:true, shininess:50});
const bandGeo=new THREE.TorusGeometry(25,1.6,8,32), bandMat=new THREE.MeshBasicMaterial({color:0xffffff});
function spawnTargets(){
  while(targets.length){ const t=targets.pop(); scene.remove(t.g); }
  kills=0;
  for(let i=0;i<8;i++){
    let cx,cz,rad,y;
    for(let tries=0;tries<80;tries++){
      cx=(Math.random()-.5)*20000; cz=(Math.random()-.5)*20000; rad=250+Math.random()*350;
      if(Math.hypot(cx,cz)<2800) continue;
      const hm=Math.max(0,terrainH(cx,cz),terrainH(cx+rad,cz),terrainH(cx-rad,cz),terrainH(cx,cz+rad),terrainH(cx,cz-rad));
      y=hm+220+Math.random()*420; break;
    }
    const g=new THREE.Group(); g.add(new THREE.Mesh(tgtGeo,tgtMat));
    const b=new THREE.Mesh(bandGeo,bandMat); b.rotation.x=Math.PI/2; g.add(b); scene.add(g);
    targets.push({label:'Hava hedefi', g, c:new THREE.Vector3(cx,y,cz), rad, w:(Math.random()<.5?-1:1)*(0.05+Math.random()*0.06), ph:Math.random()*6.28, alive:true, pos:new THREE.Vector3()});
  }
}
function updateTargets(dt){
  targets.forEach(t=>{
    t.ph+=t.w*dt; t.pos.set(t.c.x+Math.cos(t.ph)*t.rad, t.c.y+Math.sin(t.ph*1.7)*40, t.c.z+Math.sin(t.ph)*t.rad);
    t.g.position.copy(t.pos); t.g.rotation.y+=dt; t.g.visible=t.alive;
  });
}
spawnTargets();

const bullets=[]; const bulGeo=new THREE.BoxGeometry(0.2,0.2,7), bulMat=new THREE.MeshBasicMaterial({color:0xffd66b, blending:THREE.AdditiveBlending, depthWrite:false, transparent:true});
for(let i=0;i<90;i++){ const m=new THREE.Mesh(bulGeo,bulMat); m.visible=false; scene.add(m); bullets.push({m,p:new THREE.Vector3(),prev:new THREE.Vector3(),v:new THREE.Vector3(),life:0,on:false}); }
let fireCd=0, fireSide=0;
function fire(){
  const b=bullets.find(x=>!x.on); if(!b) return;
  fireSide^=1; const side=fireSide?1:-1;
  const mz=CUR.muzzle; b.p.set(mz[0]===0?0:side*mz[0],mz[1],mz[2]).applyQuaternion(S.q).add(S.pos); b.prev.copy(b.p);
  b.v.set((Math.random()-.5)*0.012,(Math.random()-.5)*0.012,-1).normalize().applyQuaternion(S.q);
  b.v.multiplyScalar(S.speed+CUR.bulletV); b.life=CUR.blife; b.on=true; b.m.visible=true; lastFireT=T; gunSound(); if(T-padBuzzT>0.2){ padBuzzT=T; rumble(120,0.3,0.15); }
}
function segDist2(a,b,p){
  tA.copy(b).sub(a); const l2=tA.lengthSq()||1e-6; const t=clamp(tB.copy(p).sub(a).dot(tA)/l2,0,1);
  tC.copy(a).addScaledVector(tA,t); return tC.distanceToSquared(p);
}
function updateBullets(dt){
  bullets.forEach(b=>{
    if(!b.on) return;
    b.prev.copy(b.p); b.p.addScaledVector(b.v,dt); b.life-=dt;
    let dead=b.life<=0;
    if(!dead){
      for(const t of targets){ if(t.alive && segDist2(b.prev,b.p,t.pos)<28*28){ t.alive=false; kills++; score+=100; noteScore(); explode(t.pos,45,7); toast('Hedef vuruldu  +100','#ffb25a'); rumble(220,0.5,0.8); dead=true; break; } }
    }
    if(!dead&&ACT.length){ const my=myTeam();
      for(let ai=0;ai<ACT.length;ai++){ const a=ACT[ai]; if(a.alive&&a.team!==my&&segDist2(b.prev,b.p,a.pos)<14*14){ registerHit(a,8,NET.myId); dead=true; break; } } }
    if(!dead){
      for(let gi=0;gi<gtargets.length;gi++){ const o=gtargets[gi];
        if(o.alive && !o.armor && segDist2(b.prev,b.p,o.pos)<o.r*o.r){ o.hp-=0.34; if(o.hp<=0.02) killGround(o); else explode(b.p,5,1.5); dead=true; break; } }
    }
    if(!dead && b.p.y<Math.max(0,terrainH(b.p.x,b.p.z))) dead=true;
    if(dead){ b.on=false; b.m.visible=false; return; }
    b.m.position.copy(b.p); tD.copy(b.p).add(b.v); b.m.lookAt(tD);
  });
}
const parts=[]; const partGeo=new THREE.IcosahedronGeometry(1,0);
const partMats=[0xff7a1a,0xffc43d,0x3b3b3b].map((c,i)=>new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:i===2?0.75:0.95, blending:i===2?THREE.NormalBlending:THREE.AdditiveBlending, depthWrite:false}));
for(let i=0;i<180;i++){ const m=new THREE.Mesh(partGeo,partMats[i%3]); m.visible=false; scene.add(m); parts.push({m,v:new THREE.Vector3(),life:0,max:1,size:1,on:false}); }
function explode(pos,n,size){
  boomSound();
  let used=0;
  for(const p of parts){ if(p.on) continue; if(used++>=n) break;
    p.on=true; p.m.visible=true; p.m.position.copy(pos);
    p.v.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(15+Math.random()*70);
    p.max=p.life=0.6+Math.random()*1.1; p.size=size*(0.5+Math.random()); }
}
function updateParts(dt){
  parts.forEach(p=>{ if(!p.on) return; p.life-=dt; if(p.life<=0){ p.on=false; p.m.visible=false; return; }
    p.m.position.addScaledVector(p.v,dt); p.v.multiplyScalar(1-1.8*dt); p.v.y+=2*dt;
    const t=p.life/p.max; p.m.scale.setScalar(p.size*(0.4+1.4*(1-t))*Math.max(t,0.05)*1.8); });
}

