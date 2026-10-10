/* ------------------------------------------------------------------ ground targets + bombs */
const gtargets=[]; let gAllDeadT=0, bombCd=0;
const GM={ grey:new THREE.MeshLambertMaterial({color:0x6d7379}), dark:new THREE.MeshLambertMaterial({color:0x2c3035}), olive:new THREE.MeshLambertMaterial({color:0x56603f}),
  white:new THREE.MeshLambertMaterial({color:0xdadde0}), burnt:new THREE.MeshLambertMaterial({color:0x1b1b1d}) };
const GTYPE={ radar:{label:'Radar',pts:150,r:11,hp:1,armor:false}, depot:{label:'Yakıt deposu',pts:200,r:15,hp:1.4,armor:false},
  bunker:{label:'Sığınak',pts:250,r:13,hp:1,armor:true}, sam:{label:'Hava savunma bataryası',pts:300,r:12,hp:1,armor:false}, truck:{label:'Araç konvoyu',pts:100,r:7,hp:0.7,armor:false} };
function gMesh(geo,mat,x,y,z){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); return m; }
function gBuild(type){
  const g=new THREE.Group(), spin=new THREE.Group();
  if(type==='radar'){
    g.add(gMesh(new THREE.BoxGeometry(7,3,7),GM.grey,0,1.5,0)); g.add(gMesh(new THREE.CylinderGeometry(0.5,0.8,6,8),GM.dark,0,6,0));
    const dish=gMesh(new THREE.SphereGeometry(3.4,14,8,0,Math.PI*2,0,Math.PI/2.3),GM.white,0,0,0); dish.rotation.x=-1.15; dish.position.set(0,0,1.2); spin.add(dish); spin.position.y=9.6; g.add(spin);
  } else if(type==='depot'){
    [-6,0,6].forEach(function(x){ g.add(gMesh(new THREE.CylinderGeometry(3.4,3.4,6,14),GM.white,x,3,0)); });
    g.add(gMesh(new THREE.BoxGeometry(10,3,5),GM.grey,0,1.5,9));
  } else if(type==='bunker'){
    const mound=gMesh(new THREE.SphereGeometry(1,12,8),GM.olive,0,0,0); mound.scale.set(9,4.5,7); g.add(mound);
    g.add(gMesh(new THREE.BoxGeometry(5,3,0.6),GM.dark,0,1.5,6.2));
  } else if(type==='sam'){
    g.add(gMesh(new THREE.BoxGeometry(3,1.6,8),GM.olive,0,1.6,0)); g.add(gMesh(new THREE.BoxGeometry(2.6,1.4,2.4),GM.dark,0,1.5,-4.6));
    const tubes=new THREE.Group(); tubes.position.set(0,3.2,0.6); tubes.rotation.x=-0.85; g.add(tubes);
    [[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]].forEach(function(q){ tubes.add(gMesh(new THREE.CylinderGeometry(0.3,0.3,6.4,8),GM.white,q[0],q[1],0)); tubes.children[tubes.children.length-1].rotation.x=Math.PI/2; });
    spin.add(gMesh(new THREE.BoxGeometry(2.4,1.4,0.3),GM.grey,0,0.7,0)); spin.position.set(0,3.8,-4.3); g.add(spin);
  } else { // truck
    g.add(gMesh(new THREE.BoxGeometry(2.4,1.8,5),GM.olive,0,1.3,0)); g.add(gMesh(new THREE.BoxGeometry(2.3,1.5,1.9),GM.dark,0,1.1,-3.1));
  }
  const wreck=gMesh(new THREE.BoxGeometry(type==='truck'?2.6:8,1.1,type==='truck'?5:8),GM.burnt,0,0.6,0); wreck.visible=false; g.add(wreck);
  const intact=g.children.filter(function(c){ return c!==wreck; });
  g.userData={spin:spin,wreck:wreck,intact:intact};
  return g;
}
function gSite(rnd,taken){
  for(let tries=0;tries<300;tries++){
    const x=(rnd()-.5)*22000, z=(rnd()-.5)*22000;
    if(Math.hypot(x,z)<3500) continue;
    const h=terrainH(x,z); if(h<12||h>650) continue;
    if(Math.abs(terrainH(x+14,z)-h)+Math.abs(terrainH(x,z+14)-h)>5) continue;
    if(taken.some(function(q){ return Math.hypot(q[0]-x,q[1]-z)<500; })) continue;
    taken.push([x,z]); return [x,z,h];
  }
  return null;
}
function addGround(type,x,z,mv){
  const g=gBuild(type), h=terrainH(x,z), cfg=GTYPE[type];
  g.position.set(x,h,z); scene.add(g);
  const o={type:type,g:g,pos:new THREE.Vector3(x,h+2,z),hp:cfg.hp,alive:true,r:cfg.r,armor:cfg.armor,pts:cfg.pts,label:cfg.label,mv:mv||null,lockT:0,cd:6+Math.random()*6,tracking:false};
  gtargets.push(o); return o;
}
function spawnGround(){
  while(gtargets.length){ const o=gtargets.pop(); scene.remove(o.g); }
  const rnd=mulberry32((Date.now()&0xffff)+11), taken=[];
  ['radar','radar','radar','depot','depot','bunker','bunker','sam','sam','sam'].forEach(function(type){ const st=gSite(rnd,taken); if(st) addGround(type,st[0],st[1]); });
  const cv=gSite(rnd,taken);
  if(cv){ const ang=rnd()*Math.PI*2, mv={dx:Math.sin(ang),dz:Math.cos(ang),range:140,speed:6,t:0};
    for(let i=0;i<3;i++){ const o=addGround('truck',cv[0]-mv.dx*i*14,cv[1]-mv.dz*i*14,{dx:mv.dx,dz:mv.dz,range:140,speed:6,t:0,ox:cv[0]-mv.dx*i*14,oz:cv[1]-mv.dz*i*14}); o.g.rotation.y=Math.atan2(mv.dx,mv.dz); } }
}
function killGround(o){
  if(!o.alive) return; o.alive=false;
  o.g.userData.intact.forEach(function(c){ c.visible=false; }); o.g.userData.wreck.visible=true;
  explode(o.pos,50,8); score+=o.pts; noteScore(); rumble(220,0.5,0.8); toast(o.label+' imha edildi  +'+o.pts,'#ffb25a');
}
function updateGround(dt){
  gtargets.forEach(function(o){
    if(o.g.userData.spin&&o.alive) o.g.userData.spin.rotation.y+=dt*1.4;
    if(o.type==='sam') samBrain(o,dt);
    if(o.mv&&o.alive){ const m=o.mv; m.t+=dt*m.speed/m.range; const off=Math.sin(m.t)*m.range;
      const x=m.ox+m.dx*off, z=m.oz+m.dz*off, h=terrainH(x,z); o.g.position.set(x,h,z); o.pos.set(x,h+2,z);
      o.g.rotation.y=Math.atan2(m.dx,m.dz)+(Math.cos(m.t)<0?Math.PI:0); }
  });
}
// ---- weapons: inventory, bombs, guided missiles, target lock (placeholder types, to be remodelled on the real inventory)
const WEAPONS={
  gp:{kind:'bomb',name:'GP-82 genel amaçlı bomba',short:'GP',tip:'Güdümsüz bomba · 28 m patlama',r:28,dmg:1.5,armorDmg:0.6,color:0x3b4430},
  bnk:{kind:'bomb',name:'BNK-84 delici bomba',short:'BNK',tip:'Güdümsüz · sığınak gibi zırhlı hedeflere etkili',r:20,dmg:1.2,armorDmg:1.7,color:0x2c3a55},
  m1:{kind:'missile',name:'Füze-1 kısa menzil',short:'F1',tip:'Güdümlü · hava + yer · 6 km · çevik',range:6000,speed:520,turn:1.5,dmg:1.3,armorDmg:0.9,r:15,air:true,ground:true,color:0xe8e8e8},
  m2:{kind:'missile',name:'Füze-2 orta menzil',short:'F2',tip:'Güdümlü · hava + yer · 14 km · hızlı',range:14000,speed:700,turn:0.85,dmg:1.6,armorDmg:1.1,r:17,air:true,ground:true,color:0xdadfe8},
  m3:{kind:'missile',name:'Füze-3 ağır harp başlığı',short:'F3',tip:'Güdümlü · sadece yer · 9 km · yıkıcı',range:9000,speed:430,turn:0.8,dmg:2.8,armorDmg:2.2,r:26,air:false,ground:true,color:0xe0d6c4}
};
const WORDER=['gp','bnk','m1','m2','m3'];
const SLOTS={kaan:8,anka3:4,hurjet:6,hurkus:6,anka:0,aksungur:6,kizilelma:8,tb2:4,tb3:6,akinci:8};
const PYLON_Y={kaan:-0.6,anka3:-0.2,hurjet:-0.4,hurkus:-0.8,anka:-0.3,aksungur:0.25,kizilelma:-0.45,tb2:-0.05,tb3:-0.05,akinci:-0.05};
const INV={gp:0,bnk:0,m1:0,m2:0,m3:0}; let selW='gp'; const LOADOUTS={};
function wpnOf(id){ const r=regOf(id); return r.wpn?WORDER.filter(function(k){ return r.wpn.indexOf(k)>=0; }):WORDER; }
function defaultLoadout(id){ const n=SLOTS[id]||0, gp=Math.ceil(n/2); return {gp:gp,bnk:0,m1:n-gp,m2:0,m3:0}; }
function loadoutOf(id){ return LOADOUTS[id]||(LOADOUTS[id]=defaultLoadout(id)); }
function stockTotal(){ return WORDER.reduce(function(a,k){ return a+INV[k]; },0); }
function bombStock(){ return INV.gp+INV.bnk; }
function applyLoadout(id){
  const l=loadoutOf(id); WORDER.forEach(function(k){ INV[k]=l[k]||0; });
  if(INV[selW]<=0) selW=WORDER.find(function(k){ return INV[k]>0; })||'gp';
  lockTgt=null; lockT=0; refreshStoresVisual();
}
function selectWeapon(k){
  if(!WEAPONS[k]) return; if(INV[k]<=0){ toast(WEAPONS[k].short+' stokta yok','#ffc24a'); return; }
  selW=k; lockTgt=null; lockT=0; refreshStoresVisual(); toast('Seçili silah: '+WEAPONS[k].name,'#ffb25a');
}
function pickWeaponByNumber(n){ const l=WORDER.filter(function(k){ return INV[k]>0; }), k=l[n-1]; if(k) selectWeapon(k); else toast('Bu numarada silah yok','#ffc24a'); }
function cycleWeapon(d){
  const avail=WORDER.filter(function(k){ return INV[k]>0; }); if(!avail.length){ toast('Silah yok','#ffc24a'); return; }
  const i=Math.max(0,avail.indexOf(selW)); selW=avail[(i+(d||1)+avail.length)%avail.length]; lockTgt=null; lockT=0;
  toast('Seçili silah: '+WEAPONS[selW].name,'#ffb25a');
}
let lockTgt=null, lockT=0, cueT=0; const CUE={level:0,txt:'',sub:''};
function assistMul(){ return SETTINGS.bombAssist==='off'?1:1.8; }
function damageGround(o,amount){
  if(!o.alive) return; o.hp-=amount;
  if(o.hp<=0.02) killGround(o); else { explode(o.pos,16,3); toast(o.label+' hasar aldı','#ffb25a'); }
}
function killAir(t){ if(!t.alive) return; t.alive=false; kills++; score+=100; noteScore(); explode(t.pos,45,7); toast('Hedef vuruldu  +100','#ffb25a'); rumble(220,0.5,0.8); }
function fireWeapon(){
  if(state!=='play'||S.onGround||S.crashed) return false;
  if(stockTotal()<=0){ toast((SLOTS[activeId]>0)?'Silah kalmadı — bakım hangarında yükle':'Bu uçakta silah yok','#ffc24a'); return false; }
  if(INV[selW]<=0) cycleWeapon(1);
  return WEAPONS[selW].kind==='bomb'?dropBomb():launchMissile();
}
// bombs
const bombPool=[]; const bombGeo=new THREE.CylinderGeometry(0.16,0.16,1.1,8); bombGeo.rotateX(Math.PI/2); const bombMats={};
WORDER.forEach(function(k){ if(WEAPONS[k].kind==='bomb') bombMats[k]=new THREE.MeshPhongMaterial({color:WEAPONS[k].color}); });
for(let i=0;i<14;i++){ const m=new THREE.Mesh(bombGeo,bombMats.gp); m.visible=false; scene.add(m); bombPool.push({m:m,p:new THREE.Vector3(),v:new THREE.Vector3(),on:false,w:'gp',tgt:null,amax:3}); }
function dropBomb(){
  if(state!=='play'||S.onGround||S.crashed) return false;
  let k=selW; if(!(WEAPONS[k].kind==='bomb'&&INV[k]>0)) k=['gp','bnk'].find(function(x){ return INV[x]>0; });
  if(!k){ toast((SLOTS[activeId]>0)?'Bomba kalmadı — bakım hangarında yükle':'Bu uçakta bomba yok','#ffc24a'); return false; }
  if(bombCd>0) return false;
  const b=bombPool.find(function(x){ return !x.on; }); if(!b) return false;
  fwdOf(S.q,vF); INV[k]--; bombCd=0.4; b.w=k; b.m.material=bombMats[k];
  b.p.set(0,-0.9,0.5).applyQuaternion(S.q).add(S.pos);
  b.v.set(vF.x*S.speed,vF.y*S.speed-S.sink-2,vF.z*S.speed); b.on=true; b.m.visible=true; b.m.position.copy(b.p);
  b.tgt=(SETTINGS.bombAssist!=='off'&&lockTgt&&lockTgt.alive&&lockTgt.kind==='ground')?lockTgt:null; b.amax=SETTINGS.bombAssist==='guided'?14:3;
  refreshStoresVisual();
  toast((b.tgt?(SETTINGS.bombAssist==='guided'?'Güdümlü ':'Yardımlı '):'')+WEAPONS[k].short+' bırakıldı  ('+INV[k]+' kaldı)','#ffb25a'); return true;
}
function bombImpact(p,water,w){
  const W=WEAPONS[w||'gp'], R=W.r*assistMul();
  explode(p,water?22:60,water?5:9);
  if(water) return;
  gtargets.forEach(function(o){ if(o.alive && Math.hypot(o.pos.x-p.x,o.pos.z-p.z)<=R+o.r*0.4) damageGround(o,o.armor?W.armorDmg:W.dmg); });
  rumble(160,0.3,0.6);
}
// guided missiles
const amis=[];
(function(){
  const c=document.createElement('canvas'); c.width=64; c.height=64; const x=c.getContext('2d');
  const gr=x.createRadialGradient(32,32,1,32,32,30); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.4,'rgba(255,200,120,0.8)'); gr.addColorStop(1,'rgba(255,140,40,0)');
  x.fillStyle=gr; x.fillRect(0,0,64,64); const tex=new THREE.CanvasTexture(c);
  const mg=new THREE.CylinderGeometry(0.2,0.2,3.2,8); mg.rotateX(Math.PI/2); const mm=new THREE.MeshPhongMaterial({color:0xf2f2f2});
  for(let i=0;i<8;i++){ const grp=new THREE.Group(); grp.add(new THREE.Mesh(mg,mm));
    const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); gl.scale.set(9,9,1); gl.position.z=1.9; grp.add(gl); grp.visible=false; scene.add(grp);
    amis.push({on:false,grp:grp,p:new THREE.Vector3(),v:new THREE.Vector3(),speed:0,life:0,tgt:null,lost:false,w:'m1',trailT:0}); }
})();
function launchMissile(){
  const W=WEAPONS[selW]; if(W.kind!=='missile'||INV[selW]<=0) return false;
  if(!SETTINGS.lockOn){ toast('Hedef kilidi kapalı — K ile aç','#ffc24a'); return false; }
  if(!lockTgt||!lockTgt.alive||lockT<0.6){ toast('Kilit yok — hedefe dön ve kilitlenmesini bekle','#ffc24a'); return false; }
  if(bombCd>0) return false;
  const m=amis.find(function(x){ return !x.on; }); if(!m) return false;
  INV[selW]--; bombCd=0.8; fwdOf(S.q,vF);
  m.on=true; m.w=selW; m.tgt=lockTgt; m.speed=Math.max(S.speed,120); m.life=W.range/W.speed*1.25+4; m.lost=false; m.trailT=0; m.byAct=null; m.flareRoll=false;
  m.ghost=!!(lockTgt.isActor&&lockTgt.remote&&lockTgt.human);
  const side=(INV.m1+INV.m2+INV.m3)%2?1:-1; m.p.set(side*((model.tip?model.tip[0]:6)*0.3),-0.6,0).applyQuaternion(S.q).add(S.pos);
  m.v.set(vF.x*m.speed,vF.y*m.speed-S.sink,vF.z*m.speed); m.grp.visible=true; m.grp.position.copy(m.p);
  if(m.ghost){ fwdOf(S.q,vF); netSendTo(lockTgt.id,{t:'msl',to:lockTgt.id,by:NET.myId,p:v3a(m.p),v:v3a(m.v)}); }
  refreshStoresVisual(); toast(W.short+' atıldı  ('+INV[selW]+' kaldı)','#ffb25a'); rumble(200,0.4,0.6); return true;
}
function missileBlast(p,w,primary){
  const W=WEAPONS[w]; explode(p,45,Math.max(5,W.r/3));
  gtargets.forEach(function(o){ if(o.alive&&Math.hypot(o.pos.x-p.x,o.pos.z-p.z)<=W.r+o.r*0.4) damageGround(o,(o.armor?W.armorDmg:W.dmg)*(o===primary?1:0.6)); });
  if(W.air) targets.forEach(function(t){ if(t.alive&&t.pos.distanceTo(p)<=W.r+20) killAir(t); });
  rumble(160,0.3,0.6);
}
function updateAMissiles(dt){
  for(let i=0;i<amis.length;i++){
    const m=amis[i]; if(!m.on) continue; const W=WEAPONS[m.w];
    m.life-=dt; m.speed=Math.min(W.speed,m.speed+280*dt);
    if(m.tgt&&!m.tgt.alive) m.lost=true;
    if(m.tgt&&m.tgt.isActor&&!m.lost&&!m.ghost&&actorThreat(m.tgt,m.p,m)){ m.lost=true; toast(m.tgt.name+' flare attı — füze saptı','#ffc24a'); }
    const live=m.tgt&&!m.lost;
    if(live){
      mvCur.copy(m.v).normalize(); mvDes.copy(m.tgt.pos).sub(m.p).normalize();
      const ang=Math.acos(clamp(mvCur.dot(mvDes),-1,1)), maxT=Math.min(W.turn,(35*9.81)/m.speed)*dt;
      if(ang>1e-5) mvCur.lerp(mvDes,Math.min(1,maxT/ang)).normalize();
      m.v.copy(mvCur).multiplyScalar(m.speed);
    } else m.v.setLength(m.speed);
    mvPrev.copy(m.p); m.p.addScaledVector(m.v,dt);
    m.grp.position.copy(m.p); mvTmp.copy(m.p).add(m.v); m.grp.lookAt(mvTmp);
    m.trailT-=dt; if(m.trailT<=0){ m.trailT=0.03; emitVapor(m.p,2.4,0xf0f0f0,1.8); }
    let end=false;
    if(live){ const dd=Math.sqrt(segDist2(mvPrev,m.p,m.tgt.pos)); if(m.tgt.isActor){ if(dd<22){ end=true; explode(m.p,45,6); if(!m.ghost) registerHit(m.tgt,100,m.byAct?m.byAct.id:NET.myId); } } else if(dd<Math.max(10,W.r*0.45)){ end=true; missileBlast(m.p,m.w,m.tgt); } }
    if(!end && m.p.y<Math.max(0,terrainH(m.p.x,m.p.z))+1.5){ end=true; missileBlast(m.p,m.w,null); }
    if(!end && m.life<=0){ end=true; explode(m.p,20,4); }
    if(end){ m.on=false; m.grp.visible=false; }
  }
}
function updateBombs(dt){
  if(bombCd>0) bombCd-=dt;
  updateLock(dt); updateCue(dt);
  for(let i=0;i<bombPool.length;i++){ const b=bombPool[i]; if(!b.on) continue;
    if(b.tgt&&b.tgt.alive) steerBomb(b,dt);
    b.v.y-=9.81*dt; b.p.addScaledVector(b.v,dt);
    const gh=terrainH(b.p.x,b.p.z);
    if(b.p.y<=Math.max(gh,0)+0.3){ b.on=false; b.m.visible=false; bombImpact(b.p,gh<=0,b.w); continue; }
    b.m.position.copy(b.p); tD.copy(b.p).add(b.v); b.m.lookAt(tD);
  }
  updateAMissiles(dt);
}
const ccipV=new THREE.Vector3();
function ccipPoint(){ // predicted bomb impact point (ballistic, no drag)
  fwdOf(S.q,vF);
  const vx=vF.x*S.speed, vy=vF.y*S.speed-S.sink-2, vz=vF.z*S.speed;
  let gh=Math.max(0,terrainH(S.pos.x,S.pos.z)), h=S.pos.y-gh; if(h<8) return null;
  let t=(vy+Math.sqrt(vy*vy+2*9.81*h))/9.81, px=S.pos.x, pz=S.pos.z;
  for(let it=0;it<3;it++){ px=S.pos.x+vx*t; pz=S.pos.z+vz*t; gh=Math.max(0,terrainH(px,pz)); const h2=Math.max(S.pos.y-gh,1); t=(vy+Math.sqrt(vy*vy+2*9.81*h2))/9.81; }
  return ccipV.set(px,gh,pz);
}
// target lock
function toggleLock(){ SETTINGS.lockOn=!SETTINGS.lockOn; saveSettings(); lockTgt=null; lockT=0; if($('setLock')) $('setLock').checked=SETTINGS.lockOn; toast('Hedef kilidi: '+(SETTINGS.lockOn?'AÇIK':'KAPALI'),SETTINGS.lockOn?'#5dff8a':'#ffc24a'); }
function lockCandidates(){
  const W=WEAPONS[selW], list=[];
  if(W.kind==='bomb'||W.ground) gtargets.forEach(function(o){ o.kind='ground'; list.push(o); });
  if(W.kind==='missile'&&W.air){ targets.forEach(function(o){ o.kind='air'; list.push(o); }); hostileActorsForLock().forEach(function(o){ list.push(o); }); }
  return list;
}
function lockValid(o){
  if(!o.alive) return 0;
  const W=WEAPONS[selW], dx=o.pos.x-S.pos.x, dy=o.pos.y-S.pos.y, dz=o.pos.z-S.pos.z, d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(d>(W.kind==='missile'?W.range:9000)||d<150) return 0;
  const c=(dx*vF.x+dy*vF.y+dz*vF.z)/d; if(c<0.866) return 0;      // within 30 degrees of the nose
  return hasLOS(S.pos,o.pos)?c:0;
}
function updateLock(dt){
  if(state!=='play'||S.onGround||S.crashed||stockTotal()<=0){ lockTgt=null; lockT=0; return; }
  if(INV[selW]<=0) selW=WORDER.find(function(k){ return INV[k]>0; })||selW;
  fwdOf(S.q,vF);
  if(!SETTINGS.lockOn){ lockTgt=null; lockT=0; return; }
  if(lockTgt&&lockValid(lockTgt)){ lockT+=dt||0; return; }
  const prev=lockTgt; lockTgt=null; lockT=0; let best=0;
  lockCandidates().forEach(function(o){ const c=lockValid(o); if(c>best){ best=c; lockTgt=o; } });
  if(lockTgt&&lockTgt!==prev) beep(1300,0.09,0.06);
}
function cycleLock(){
  if(state!=='play'||S.onGround||stockTotal()<=0) return; if(!SETTINGS.lockOn){ toast('Hedef kilidi kapalı (K ile aç)','#ffc24a'); return; } fwdOf(S.q,vF);
  const list=lockCandidates().filter(function(o){ return lockValid(o)>0; }).sort(function(a,b){ return lockValid(b)-lockValid(a); });
  if(!list.length){ toast('Kilitlenecek hedef yok','#ffc24a'); return; }
  lockTgt=list[(Math.max(0,list.indexOf(lockTgt))+(lockTgt?1:0))%list.length]; lockT=0; toast('Kilit: '+lockTgt.label,'#5dff8a');
}
function steerBomb(b,dt){        // smart-bomb guidance: bend the fall toward the locked target
  const h=Math.max(b.p.y-b.tgt.pos.y,1), vy=b.v.y;
  const t=Math.max(0.5,(vy+Math.sqrt(vy*vy+2*9.81*h))/9.81);
  const px=b.p.x+b.v.x*t, pz=b.p.z+b.v.z*t;
  let ax=2*(b.tgt.pos.x-px)/(t*t), az=2*(b.tgt.pos.z-pz)/(t*t); const a=Math.hypot(ax,az), amax=b.amax||14;
  if(a>amax){ ax*=amax/a; az*=amax/a; }
  b.v.x+=ax*dt; b.v.z+=az*dt;
}
function updateCue(dt){
  CUE.level=0; CUE.txt=''; CUE.sub='';
  if(state!=='play'||S.onGround||S.crashed||!lockTgt||!lockTgt.alive||stockTotal()<=0) return;
  const W=WEAPONS[selW], d=lockTgt.pos.distanceTo(S.pos);
  CUE.sub=W.short+' · '+lockTgt.label+' · '+(d/1000).toFixed(1)+' km';
  if(W.kind==='missile'){ if(lockT>=1){ CUE.level=2; CUE.txt='ATEŞ!'; } else { CUE.level=1; CUE.txt='KİLİTLENİYOR'; } }
  else if(SETTINGS.bombAssist!=='off'){
    const ip=ccipPoint(), rr=W.r*assistMul(), slack=SETTINGS.bombAssist==='guided'?600:250;
    const dd=ip?Math.hypot(lockTgt.pos.x-ip.x,lockTgt.pos.z-ip.z):1e9;
    if(dd<=rr*0.85+slack){ CUE.level=2; CUE.txt='BIRAK!'; } else { CUE.level=1; CUE.txt='KİLİTLENDİ'; }
  }
  cueT-=dt||0;
  if(CUE.level===2){ if(cueT<=0){ cueT=0.45; beep(1900,0.12,0.07); } } else if(CUE.level===1&&cueT<=0){ cueT=0.9; beep(1100,0.06,0.04); }
}
// weapons visible under the wings
const misVisGeo=new THREE.CylinderGeometry(0.13,0.13,2.6,8), bombVisGeo=new THREE.CylinderGeometry(0.2,0.2,1.8,8); misVisGeo.rotateX(Math.PI/2); bombVisGeo.rotateX(Math.PI/2);
const misVisMat=new THREE.MeshPhongMaterial({color:0xeeeeee});
function refreshStoresVisual(){
  if(!model||!model.group) return;
  if(!model.stores){ model.stores=new THREE.Group(); model.group.add(model.stores); }
  const g=model.stores; while(g.children.length) g.remove(g.children[0]);
  if(!model.tip) return;
  const gs=model.group.scale.x||1, tipX=model.tip[0]/gs, k=clamp(tipX/6,0.6,1.5), zc=model.tip[2]/gs-1.2*k, y=PYLON_Y[activeId]||-0.4;
  const list=[]; WORDER.forEach(function(w){ for(let i=0;i<INV[w];i++) list.push(w); });
  list.forEach(function(w,i){
    const side=i%2?1:-1, idx=Math.floor(i/2), W=WEAPONS[w];
    const m=new THREE.Mesh(W.kind==='bomb'?bombVisGeo:misVisGeo,W.kind==='bomb'?bombMats[w]:misVisMat);
    m.position.set(side*tipX*(0.16+0.1*idx),y,zc); m.scale.setScalar(k); g.add(m);
  });
}

