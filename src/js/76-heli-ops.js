/* ------------------------------------------------------------------ helicopter operations (V1.72)
   Hover assist (H): with the cyclic centred the helicopter brakes to a hover by itself.
   T129 ATAK: 20 mm gun (Space, slaved to the target you look at), CİRİT laser-guided rockets and UMTAS anti-tank missiles
   (X fires the selected one, Tab switches). Re-arm by landing on a helipad.
   T625 GÖKBEY: troops (B on the ground: board / unload) and sling load (B in the air over a crate or a light vehicle).
   Helicopter missions are started from the hangar's helicopter tab. */
const HO={assist:true, pj:[], lockT:0, lock:null, cand:null, aim:new THREE.Vector3(), aimDir:new THREE.Vector3(), gunCd:0, rearmT:0};
try{ const v=localStorage.getItem('ayy-hassist'); if(v!=null) HO.assist=v==='1'; }catch(e){}
const HTGT=[];               /* helicopter mission targets */
const TROOPS=[];             /* soldier figures on the ground */
const CRATES=[];             /* sling-loadable crates */
const HO_AMMO={gun:500,cirit:12,umtas:4};
function hoAmmo(H){ if(!H.ammo) H.ammo={gun:HO_AMMO.gun,cirit:HO_AMMO.cirit,umtas:HO_AMMO.umtas}; if(!H.sel) H.sel='cirit'; return H.ammo; }
/* ---- hover assist: centred cyclic -> brake towards a hover */
const _hoInput=heliInput; heliInput=function(){ const inp=_hoInput(), H=HELI.cur;
  if(!HO.assist||!H||H.ground) return inp;
  const fx=-Math.sin(H.h), fz=-Math.cos(H.h), rx=Math.cos(H.h), rz=-Math.sin(H.h), vf=H.vx*fx+H.vz*fz, vr=H.vx*rx+H.vz*rz;
  if(Math.abs(inp.f)<0.08) inp.f=clamp(-vf/18,-0.85,0.85);
  if(Math.abs(inp.r)<0.08) inp.r=clamp(-vr/14,-0.85,0.85);
  if(H.sling||H.troops>0){ /* loaded: slower climb */ if(inp.c>0) inp.c*=H.sling?0.7:0.85; }
  return inp; };
function hoAssistToggle(){ HO.assist=!HO.assist; try{ localStorage.setItem('ayy-hassist',HO.assist?'1':'0'); }catch(e){} toast('Askı yardımı (hover assist): '+(HO.assist?'AÇIK':'KAPALI'),HO.assist?'#7dffb0':'#ffc24a'); }
/* ---- targets */
const HOM={};
function hoMats(){ if(HOM.burnt) return HOM; HOM.burnt=new THREE.MeshLambertMaterial({color:0x1d1d1f}); HOM.olive=new THREE.MeshLambertMaterial({color:0x56603f}); HOM.crate=new THREE.MeshLambertMaterial({color:0x6b7048}); HOM.strap=new THREE.MeshLambertMaterial({color:0xd8a531}); HOM.skin=new THREE.MeshLambertMaterial({color:0xc69c78}); HOM.boot=new THREE.MeshLambertMaterial({color:0x222222}); return HOM; }
const HT_KIND={tank:{n:'Tank',hp:3,r:5,pts:300,car:'altay'},apc:{n:'Zırhlı araç',hp:2,r:4.5,pts:200,car:'pars'},truck:{n:'Kamyon',hp:0.8,r:4,pts:100,g:'truck'},sam:{n:'Hava savunma',hp:1.2,r:6,pts:250,g:'sam'},radar:{n:'Radar',hp:1,r:7,pts:150,g:'radar'}};
function htAdd(kind,x,z,h,mv){
  const K=HT_KIND[kind]; let g;
  if(K.car){ const m=carBuild(K.car); g=m.g; if(m.turret) m.turret.rotation.y=Math.random()*1.2-0.6; } else g=gBuild(K.g);
  const y=groundH(x,z); g.position.set(x,y,z); g.rotation.set(0,h||0,0); scene.add(g);
  const o={kind:kind,n:K.n,g:g,pos:new THREE.Vector3(x,y+1.8,z),x:x,z:z,h:h||0,hp:K.hp,r:K.r,pts:K.pts,alive:true,mv:mv||null};
  HTGT.push(o); return o; }
function htKill(o){
  if(!o.alive) return; o.alive=false; explode(o.pos.clone(),45,7); rumble(200,0.5,0.7);
  const M=hoMats(), w=new THREE.Mesh(new THREE.BoxGeometry(o.r*0.8,1.2,o.r*1.6),M.burnt); w.position.set(o.x,groundH(o.x,o.z)+0.6,o.z); w.rotation.y=o.h; scene.add(w); o.wreck=w; o.g.visible=false;
  toast(o.n+' imha edildi  +'+o.pts,'#ffb25a'); if(HM.on){ HM.score+=o.pts; HM.kills++; } }
function htClear(){ HTGT.forEach(function(o){ scene.remove(o.g); if(o.wreck) scene.remove(o.wreck); }); HTGT.length=0; }
function htStep(dt){ HTGT.forEach(function(o){ if(!o.alive||!o.mv) return; const m=o.mv; m.s+=m.v*dt; const P=m.path; let i=0, s=m.s%m.len, acc=0;
    for(i=0;i<P.length-1;i++){ const d=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]); if(acc+d>=s){ const f=(s-acc)/d; o.x=P[i][0]+(P[i+1][0]-P[i][0])*f; o.z=P[i][1]+(P[i+1][1]-P[i][1])*f; o.h=Math.atan2(-(P[i+1][0]-P[i][0]),-(P[i+1][1]-P[i][1])); break; } acc+=d; }
    const y=groundH(o.x,o.z); o.g.position.set(o.x,y,o.z); o.g.rotation.set(0,o.h,0); o.pos.set(o.x,y+1.8,o.z); }); }
/* damage everything inside a blast */
function hoBlast(p,rad,dmg){
  HTGT.forEach(function(o){ if(!o.alive) return; const d=o.pos.distanceTo(p); if(d<o.r+rad){ o.hp-=dmg*(d<o.r?1:0.5); if(o.hp<=0.02) htKill(o); } });
  if(typeof gtargets!=='undefined') gtargets.forEach(function(o){ if(!o.alive) return; if(o.pos.distanceTo(p)<(o.r||10)+rad) damageGround(o,dmg*0.6); }); }
function hoTargets(){ const L=[]; HTGT.forEach(function(o){ if(o.alive) L.push(o); }); if(typeof gtargets!=='undefined') gtargets.forEach(function(o){ if(o.alive) L.push(o); }); return L; }
/* ---- T129 aiming: nose direction, the best target inside a cone gets the lock */
function hoAimStep(dt){
  const H=HELI.cur; HO.cand=null; if(!H||H.id!=='t129'||H.ground&&H.rpm<0.9){ HO.lock=null; HO.lockT=0; return; }
  const e=-H.pitch*0.9-0.09-WALK.pitch*0.25; HO.aimDir.set(-Math.sin(H.h)*Math.cos(e),Math.sin(e),-Math.cos(H.h)*Math.cos(e)).normalize();
  HO.aim.set(H.x,H.y+0.6,H.z).addScaledVector(HO.aimDir,4);
  let best=null, ba=0.26; hoTargets().forEach(function(o){ const dx=o.pos.x-H.x, dy=o.pos.y-H.y, dz=o.pos.z-H.z, d=Math.hypot(dx,dy,dz); if(d>6000||d<30) return;
    const a=Math.acos(clamp((dx*HO.aimDir.x+dy*HO.aimDir.y+dz*HO.aimDir.z)/d,-1,1)); if(a<ba){ ba=a; best=o; } });
  HO.cand=best; if(best&&best===HO.lock) HO.lockT+=dt; else { HO.lock=best; HO.lockT=0; }
}
function hoMuzzle(H,out){ out.set(H.x-Math.sin(H.h)*3.2,H.y+0.4,H.z-Math.cos(H.h)*3.2); return out; }
const hoV=new THREE.Vector3(), hoD=new THREE.Vector3();
function hoProj(type,H,dir,tgt){
  const sp=type==='gun'?900:type==='cirit'?420:210, p=hoMuzzle(H,new THREE.Vector3());
  if(type!=='gun'){ const side=(H.side=(H.side||1)*-1); p.x+=Math.cos(H.h)*1.7*side; p.z-=Math.sin(H.h)*1.7*side; p.y-=0.5; }
  const M=new THREE.MeshBasicMaterial({color:type==='gun'?0xffe08a:0xffb25a}), m=new THREE.Mesh(type==='gun'?new THREE.SphereGeometry(0.09,5,3):new THREE.CylinderGeometry(0.09,0.09,1.6,6),M);
  if(type!=='gun') m.rotation.x=Math.PI/2; m.position.copy(p); scene.add(m);
  const P={type:type,p:p,v:dir.clone().multiplyScalar(sp).add(new THREE.Vector3(H.vx,H.vy,H.vz)),life:type==='gun'?3.5:type==='cirit'?9:22,m:m,tgt:tgt||null,t:0}; HO.pj.push(P);
  sndPlay(type==='gun'?'gun':'missile',{vol:type==='gun'?0.6:0.7,pitch:type==='gun'?1.1:type==='cirit'?1.2:0.9}); return P; }
function hoGun(dt){
  const H=HELI.cur; if(!H||H.id!=='t129'||H.ground) return; const A=hoAmmo(H);
  HO.gunCd-=dt; if(act('heli','gun')<0.5||HO.gunCd>0) return; if(A.gun<=0){ if(!HO.dryT||T-HO.dryT>2){ HO.dryT=T; toast('20 mm mermi bitti — helipada in','#ffc24a'); } return; }
  HO.gunCd=0.1; A.gun--; let dir=HO.aimDir.clone();
  if(HO.cand){ const o=HO.cand, d=o.pos.distanceTo(hoMuzzle(H,hoV)), t=d/900; hoD.set(o.pos.x+(o.mv?-Math.sin(o.h)*o.mv.v*t:0),o.pos.y+0.4+4.9*t*t,o.pos.z+(o.mv?-Math.cos(o.h)*o.mv.v*t:0)).sub(hoV).normalize();
    if(hoD.dot(dir)>0.93) dir.copy(hoD); }   /* turret slaved to the sight */
  dir.x+=(Math.random()-0.5)*0.006; dir.y+=(Math.random()-0.5)*0.006; dir.z+=(Math.random()-0.5)*0.006; hoProj('gun',H,dir.normalize());
}
function hoFire(){
  const H=HELI.cur; if(!H) return; if(H.id!=='t129'){ toast('GÖKBEY silahsız — B: yük kancası / asker','#ffc24a'); return; }
  if(H.ground){ toast('Önce kalk','#ffc24a'); return; } const A=hoAmmo(H), w=H.sel;
  if(A[w]<=0){ toast((w==='cirit'?'CİRİT':'UMTAS')+' kalmadı — Tab ile değiştir ya da helipada in','#ffc24a'); return; }
  if(w==='umtas'&&!(HO.lock&&HO.lockT>1.2)){ toast('UMTAS için hedef kilidi gerekli — burnu hedefe tut','#ffc24a'); return; }
  if((H.mcd||0)>T) return; H.mcd=T+(w==='cirit'?0.35:1.5); A[w]--; hoProj(w,H,HO.aimDir,w==='umtas'?HO.lock:HO.cand);
}
function hoNextWpn(){ const H=HELI.cur; if(!H||H.id!=='t129') return; hoAmmo(H); H.sel=H.sel==='cirit'?'umtas':'cirit'; toast('Seçili: '+(H.sel==='cirit'?'CİRİT güdümlü roket':'UMTAS tanksavar füzesi'),'#b8ecff'); }
function hoPjStep(dt){
  for(let i=HO.pj.length-1;i>=0;i--){ const P=HO.pj[i]; P.life-=dt; P.t+=dt;
    if(P.type==='gun'){ P.v.y-=9.8*dt; }
    else { const sp=P.type==='cirit'?Math.min(620,P.v.length()+300*dt):Math.min(240,P.v.length()+60*dt); let want=null;
      if(P.tgt&&P.tgt.alive){ want=hoV.copy(P.tgt.pos).sub(P.p); if(P.type==='umtas'){ const hd=Math.hypot(want.x,want.z); if(hd>350&&P.t<20) want.y+=hd*0.45; } want.normalize(); }
      if(want){ const cur=hoD.copy(P.v).normalize(), tr=(P.type==='cirit'?1.6:2.2)*dt, ang=Math.acos(clamp(cur.dot(want),-1,1)); if(ang>0.0001){ cur.lerp(want,Math.min(1,tr/ang)).normalize(); } P.v.copy(cur).multiplyScalar(sp); }
      else { P.v.setLength(sp); P.v.y-=(P.type==='cirit'?3:1)*dt; }
      P.m.lookAt(hoV.copy(P.p).add(P.v)); P.m.rotateX(Math.PI/2); }
    const n=Math.max(1,Math.ceil(P.v.length()*dt/5)), L=hoTargets(); let hit=P.life<=0;
    for(let st=0;st<n&&!hit;st++){ P.p.addScaledVector(P.v,dt/n); if(P.p.y<=Math.max(0,groundH(P.p.x,P.p.z))) hit=true;
      for(let k=0;k<L.length&&!hit;k++){ const o=L[k], r=o.r||8; if(Math.abs(o.pos.x-P.p.x)<r&&Math.abs(o.pos.z-P.p.z)<r&&P.p.y<o.pos.y+r*0.6) hit=true; } }
    P.m.position.copy(P.p);
    if(hit){ scene.remove(P.m); HO.pj.splice(i,1); if(P.life<=0&&P.p.y>groundH(P.p.x,P.p.z)+5) continue;
      const big=P.type!=='gun'; explode(P.p.clone(),big?(P.type==='umtas'?40:26):4,big?(P.type==='umtas'?6:4):1);
      hoBlast(P.p,P.type==='gun'?2:P.type==='cirit'?7:9,P.type==='gun'?0.12:P.type==='cirit'?1.2:3.2); }
  }
}
/* re-arm and refuel on a helipad */
function hoRearm(dt){ const H=HELI.cur; if(!H||!H.ground||H.id!=='t129') return; const A=hoAmmo(H); if(A.gun===HO_AMMO.gun&&A.cirit===HO_AMMO.cirit&&A.umtas===HO_AMMO.umtas) return;
  const pad=HELI_SPOTS.some(function(s){ return Math.hypot(s.x-H.x,s.z-H.z)<30; })||(typeof deckAt==='function'&&deckAt(H.x,H.z,H.y+0.5)); if(!pad){ HO.rearmT=0; return; }
  HO.rearmT+=dt; if(HO.rearmT>3){ HO.rearmT=0; A.gun=HO_AMMO.gun; A.cirit=HO_AMMO.cirit; A.umtas=HO_AMMO.umtas; toast('Mühimmat ikmali tamam','#7dffb0'); } }
/* ---- soldiers */
function trBuild(){ const M=hoMats(), g=new THREE.Group();
  const b=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.75,0.3),M.olive); b.position.y=1.15; g.add(b);
  const h=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,5),M.skin); h.position.y=1.68; g.add(h);
  const hm=new THREE.Mesh(new THREE.SphereGeometry(0.17,6,4,0,Math.PI*2,0,Math.PI/2),M.olive); hm.position.y=1.72; g.add(hm);
  const l1=new THREE.Mesh(new THREE.BoxGeometry(0.17,0.78,0.2),M.olive), l2=l1.clone(); l1.position.set(-0.13,0.39,0); l2.position.set(0.13,0.39,0); g.add(l1); g.add(l2);
  const r=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.07,0.8),M.boot); r.position.set(0.28,1.2,-0.1); g.add(r); g.legs=[l1,l2]; return g; }
function trSpawn(x,z,n,tag){ const L=[]; for(let i=0;i<n;i++){ const g=trBuild(), a=i/n*Math.PI*2, px=x+Math.cos(a)*(2+i%3), pz=z+Math.sin(a)*(2+i%3); g.position.set(px,groundH(px,pz),pz); scene.add(g);
    const t={g:g,x:px,z:pz,tx:px,tz:pz,go:null,tag:tag||null,w:Math.random()*6}; TROOPS.push(t); L.push(t); } return L; }
function trStep(dt){ for(let i=TROOPS.length-1;i>=0;i--){ const t=TROOPS[i], dx=t.tx-t.x, dz=t.tz-t.z, d=Math.hypot(dx,dz);
    if(d>0.3){ const s=Math.min(d,3.2*dt); t.x+=dx/d*s; t.z+=dz/d*s; t.w+=dt*9; t.g.rotation.y=Math.atan2(-dx,-dz); }
    else if(t.go==='in'){ scene.remove(t.g); TROOPS.splice(i,1); continue; }
    const sw=d>0.3?Math.sin(t.w)*0.5:0; t.g.legs[0].rotation.x=sw; t.g.legs[1].rotation.x=-sw; t.g.position.set(t.x,groundH(t.x,t.z),t.z); } }
function hoDoor(H,side){ const s=Math.sin(H.h), c=Math.cos(H.h), k=side||1; return [H.x+c*2.4*k, H.z-s*2.4*k]; }
function hoTroops(){
  const H=HELI.cur; if(!H||H.id!=='t625') return false; if(!H.ground){ return false; }
  if(H.troops>0){ /* unload: they jump out and fan out beside the door */
    const L=trSpawn(hoDoor(H,1)[0],hoDoor(H,1)[1],H.troops,'off'); L.forEach(function(t,i){ t.tx=H.x+Math.cos(H.h)*(9+i%3*2)+Math.sin(H.h)*((i-L.length/2)*2.2); t.tz=H.z-Math.sin(H.h)*(9+i%3*2)+Math.cos(H.h)*((i-L.length/2)*2.2); });
    toast(H.troops+' asker indi','#7dffb0'); if(typeof radioSay==='function') radioSay({w:'kanat',t:'Timler indi, bölge güvende. Teşekkürler Gökbey.'},null,{force:true}); H.troops=0; H.unloadAt=[H.x,H.z]; return true; }
  /* board: soldiers standing within 60 m walk in */
  const near=TROOPS.filter(function(t){ return !t.go&&Math.hypot(t.x-H.x,t.z-H.z)<60; });
  if(!near.length){ toast('Yakında bekleyen asker yok','#ffc24a'); return true; }
  const n=Math.min(12,near.length), door=hoDoor(H,1); near.slice(0,n).forEach(function(t){ t.go='in'; t.tx=door[0]; t.tz=door[1]; });
  H.troops=n; toast(n+' asker biniyor','#7dffb0'); return true; }
/* ---- sling load */
function crateAdd(x,z,tag){ const M=hoMats(), g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.2,3.4),M.crate); b.position.y=1.1; g.add(b);
  [-0.9,0.9].forEach(function(o){ const s=new THREE.Mesh(new THREE.BoxGeometry(2.46,2.26,0.16),M.strap); s.position.set(0,1.1,o); g.add(s); });
  const y=groundH(x,z); g.position.set(x,y,z); scene.add(g); const c={g:g,x:x,y:y,z:z,h:0,hh:2.2,tag:tag||null,crate:true}; CRATES.push(c); return c; }
function slingables(){ const L=CRATES.slice(); VEHS.forEach(function(c){ if(c.K.heavy||(WALK.mode==='car'&&WALK.car===c)) return; if(typeof CALL!=='undefined'&&CALL.jobs.some(function(J){ return J.c===c&&!J.done; })) return; L.push(c); }); return L; }
function slingHook(){
  const H=HELI.cur; if(!H||H.id!=='t625'||H.ground) return false;
  if(H.sling){ slingRelease(H); return true; }
  let best=null, bd=10; slingables().forEach(function(o){ const oy=o.crate?o.y:(o.y==null?groundH(o.x,o.z):o.y), d=Math.hypot(o.x-H.x,o.z-H.z), up=H.y-oy; if(d<bd&&up>4&&up<26){ bd=d; best=o; } });
  if(!best){ toast('Kanca: yükün 4–25 m üstünde ve 10 m yakınında asılı dur','#ffc24a'); return true; }
  const oy=best.crate?best.y:(best.y==null?groundH(best.x,best.z):best.y);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0x222222}));
  line.frustumCulled=false; scene.add(line);
  H.sling={o:best,p:new THREE.Vector3(best.x,oy,best.z),v:new THREE.Vector3(),L:Math.max(8,Math.min(16,H.y-oy-1.5)),line:line,ground:true};
  if(!best.crate&&best===WALK.car) WALK.car=VEHS[0];
  toast((best.crate?'Yük':best.K.n)+' kancaya takıldı — B ile bırak','#7dffb0'); sndPlay('gear',{vol:0.6}); return true; }
function slingRelease(H){ const S=H.sling; if(!S) return; const o=S.o, g=groundH(S.p.x,S.p.z), up=S.p.y-g;
  scene.remove(S.line); H.sling=null;
  if(up>2.5){ o.fall={v:S.v.clone()}; o.fallP=S.p.clone(); FALLING.push(o); toast('Yük bırakıldı (havadan!)','#ffc24a'); }
  else { slingSet(o,S.p.x,S.p.z,S.ground?0:Math.hypot(S.v.x,S.v.y,S.v.z)); toast('Yük indirildi','#7dffb0'); }
  if(HM.on) hmEvent('drop',o); }
const FALLING=[];
function slingSet(o,x,z,impact){ o.x=x; o.z=z; if(o.crate){ o.y=groundH(x,z); o.g.position.set(x,o.y,z); o.g.rotation.set(0,o.h,0); }
  else { o.y=null; o.v=o._v=0; o.vx=o.vz=0; vehPlace(o,0); }
  if(impact>9){ explode(new THREE.Vector3(x,groundH(x,z)+1,z),14,2.5); toast('Yük sert düştü — hasar gördü','#ff8a7a'); o.broken=true; } }
const SL_UP=new THREE.Vector3(0,1,0);
function slingStep(dt){
  HELI.list.forEach(function(H){ const S=H.sling; if(!S) return; const o=S.o, a=hoV.set(H.x,H.y-1.2,H.z);
    if(!S.prev) S.prev=new THREE.Vector3(); S.prev.copy(S.p); S.v.y-=9.8*dt; S.v.multiplyScalar(Math.exp(-dt*0.8)); S.p.addScaledVector(S.v,dt);
    const d=hoD.copy(S.p).sub(a), len=d.length(); if(len>S.L){ d.multiplyScalar(1/len); S.p.copy(a).addScaledVector(d,S.L); const vr=S.v.dot(d); if(vr>0) S.v.addScaledVector(d,-vr); }
    const g=groundH(S.p.x,S.p.z); S.ground=false; if(S.p.y<g){ S.p.y=g; S.ground=true; if(S.v.y<0) S.v.y=0; S.p.x+=(S.prev.x-S.p.x)*Math.min(1,dt*6); S.p.z+=(S.prev.z-S.p.z)*Math.min(1,dt*6); }
    if(dt>0) S.v.copy(S.p).sub(S.prev).multiplyScalar(1/dt); if(S.ground&&S.v.y<0) S.v.y=0;
    o.x=S.p.x; o.z=S.p.z; const sw=clamp(S.v.x*0.02,-0.3,0.3), sw2=clamp(S.v.z*0.02,-0.3,0.3);
    if(o.crate){ o.y=S.p.y; o.g.position.set(o.x,o.y,o.z); o.g.rotation.set(sw2,o.h=H.h,-sw); }
    else { o.y=S.p.y; o.mesh.position.set(o.x,o.y,o.z); o.mesh.rotation.set(sw2,o.h,-sw,'YXZ'); }
    const P=S.line.geometry.attributes.position; P.setXYZ(0,a.x,a.y,a.z); P.setXYZ(1,S.p.x,S.p.y+(o.crate?2.3:(o.m&&o.m.hgt||2)),S.p.z); P.needsUpdate=true; });
  for(let i=FALLING.length-1;i>=0;i--){ const o=FALLING[i], f=o.fall; f.v.y-=9.8*dt; o.fallP.addScaledVector(f.v,dt); const g=groundH(o.fallP.x,o.fallP.z);
    if(o.fallP.y<=g){ const imp=Math.hypot(f.v.x,f.v.y,f.v.z); FALLING.splice(i,1); o.fall=null; slingSet(o,o.fallP.x,o.fallP.z,imp); continue; }
    if(o.crate) o.g.position.copy(o.fallP); else o.mesh.position.copy(o.fallP); }
}
/* ---- helicopter missions */
const HMIS=[
  {id:'h_poligon',heli:'t129',n:'Poligon Atışı',d:'Kara Üssü atış poligonundaki 6 hedefi 20 mm top, CİRİT ve UMTAS ile imha et.',spot:[1300,-7340,0],lim:360,xp:220,
   setup:function(){ [['tank',2440,-7700],['tank',2520,-7640],['apc',2480,-7740],['apc',2600,-7700],['truck',2380,-7650],['truck',2560,-7760]].forEach(function(t){ htAdd(t[0],t[1],t[2],Math.random()*6); }); },
   obj:[{t:'kill',n:'Poligondaki tüm hedefleri imha et',x:2500,z:-7700}]},
  {id:'h_konvoy',heli:'t129',n:'Konvoy Avı',d:'Kara Üssü güneydoğusunda ilerleyen düşman konvoyunu yolda durdur. 2 tank, 3 kamyon.',spot:[-450,470,Math.PI/2],lim:420,xp:300,
   setup:function(){ const path=[[1500,-5500],[2000,-5650],[2500,-5800],[3000,-6000],[2500,-5800],[2000,-5650],[1500,-5500]]; let len=0; for(let i=0;i<path.length-1;i++) len+=Math.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]);
     ['tank','truck','truck','tank','truck'].forEach(function(k,i){ htAdd(k,path[0][0],path[0][1],0,{path:path,len:len,s:i*28,v:7}); }); htStep(0); },
   obj:[{t:'kill',n:'Konvoyu durdur',x:2250,z:-5750}]},
  {id:'h_asker',heli:'t625',n:'Asker İntikali',d:'Hava Üssü helipadindeki timi al, Kara Üssü iniş bölgesine bırak.',spot:[-450,540,Math.PI/2],lim:480,xp:200,
   setup:function(){ trSpawn(-470,575,8,'mis'); },
   obj:[{t:'board',n:'Timi bindir (yerdeyken B)',x:-470,z:575},{t:'unload',n:'Kara Üssü iniş bölgesine in ve timi indir (B)',x:1150,z:-7450,r:45}]},
  {id:'h_yuk',heli:'t625',n:'Askı Yükü',d:'Deniz Üssü\'ndeki radar parçası sandığını kancaya al, dağdaki radar istasyonuna götür.',spot:[-1720,-3360,Math.PI/2],lim:480,xp:260,
   setup:function(){ const s=callSpot(-1680,-3330,3)||[-1680,-3330]; HM.crate=crateAdd(s[0],s[1],'mis'); },
   obj:[{t:'hook',n:'Sandığın üstünde asılı dur, B ile kancaya al'},{t:'deliver',n:'Sandığı radar istasyonuna indir',x:5320,z:-2660,r:22}]}];
const HM={on:false};
function hmById(id){ return HMIS.find(function(m){ return m.id===id; }); }
function hmClean(){ htClear(); for(let i=TROOPS.length-1;i>=0;i--){ if(TROOPS[i].tag){ scene.remove(TROOPS[i].g); TROOPS.splice(i,1); } } for(let i=CRATES.length-1;i>=0;i--){ if(CRATES[i].tag){ const c=CRATES[i]; HELI.list.forEach(function(H){ if(H.sling&&H.sling.o===c){ scene.remove(H.sling.line); H.sling=null; } }); scene.remove(c.g); CRATES.splice(i,1); } }
  if(HM.beacon){ scene.remove(HM.beacon); HM.beacon=null; } HO.pj.forEach(function(P){ scene.remove(P.m); }); HO.pj.length=0; }
function hmStart(id){
  const M=hmById(id); if(!M) return; if(HM.on) hmClean(); closeModals();
  startWalk(); hmClean(); buildHelis();
  let H=HELI.list.find(function(h){ return h.id===M.heli&&Math.hypot(h.home[0]-M.spot[0],h.home[1]-M.spot[1])<5; })||HELI.list.find(function(h){ return h.id===M.heli; });
  if(H.crashT>0) H.crashT=0; H.home=[M.spot[0],M.spot[1],M.spot[2]]; H.x=M.spot[0]; H.z=M.spot[1]; H.h=M.spot[2]; H.y=heliFloor(H).y; H.vx=H.vy=H.vz=0; H.pitch=H.roll=H.yr=0; H.ground=true; H.m.g.visible=true; H.troops=0; H.ammo=null; H.rpm=0.6; if(H.sling){ scene.remove(H.sling.line); H.sling=null; } heliPlace(H);
  Object.assign(HM,{on:true,id:id,M:M,H:H,i:0,t:0,score:0,kills:0,ended:false,crate:null}); M.setup();
  WALK.pos.set(H.x+6,groundH(H.x,H.z)+1.7,H.z+4); heliBoard(H); WALK.hint=10; hmBeacon();
  if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, görev: '+M.n+'. '+M.obj[0].n+'.'},null,{force:true});
}
function hmCur(){ return HM.on&&!HM.ended?HM.M.obj[HM.i]:null; }
function hmTarget(){ const o=hmCur(); if(!o) return null; if(o.t==='hook'&&HM.crate) return [HM.crate.x,HM.crate.z];
  if(o.t==='kill'){ const L=HTGT.filter(function(t){ return t.alive; }); if(L.length){ let b=L[0], bd=1e9; const H=HM.H; L.forEach(function(t){ const d=Math.hypot(t.x-H.x,t.z-H.z); if(d<bd){ bd=d; b=t; } }); return [b.x,b.z]; } }
  return o.x!=null?[o.x,o.z]:null; }
function hmBeacon(){ if(HM.beacon){ scene.remove(HM.beacon); HM.beacon=null; } const o=hmCur(); if(!o||o.t==='kill'||o.x==null) return; HM.beacon=callBeacon(o.x,o.z); }
function hmNext(){ HM.i++; if(HM.i>=HM.M.obj.length){ hmEnd(true); return; } hmBeacon(); const o=hmCur(); toast('Yeni hedef: '+o.n,'#b8ecff'); if(typeof radioSay==='function') radioSay({w:'kule',t:o.n+'.'},null,{force:true}); }
function hmEvent(ev,arg){ const o=hmCur(); if(!o) return; const H=HM.H;
  if(ev==='drop'&&o.t==='deliver'&&arg===HM.crate){ if(Math.hypot(arg.x-o.x,arg.z-o.z)<o.r&&!arg.fall){ if(arg.broken){ hmEnd(false,'Sandık hasar gördü'); return; } hmNext(); } else if(o.t==='deliver') toast('Sandık hedef bölgede değil — yeniden kancaya al','#ffc24a'); }
  if(ev==='hooked'&&o.t==='hook') hmNext(); }
function hmStep(dt){
  if(!HM.on||HM.ended) return; HM.t+=dt; const o=hmCur(), H=HM.H;
  if(HM.beacon) HM.beacon.material.opacity=0.16+0.1*Math.sin(HM.t*5);
  if(H.crashT>0){ hmEnd(false,'Helikopter kaybedildi'); return; }
  if(HM.M.lim&&HM.t>HM.M.lim){ hmEnd(false,'Süre doldu'); return; }
  if(o.t==='kill'&&!HTGT.some(function(t){ return t.alive; })) hmNext();
  else if(o.t==='board'&&H.troops>0&&!TROOPS.some(function(t){ return t.tag==='mis'&&!t.go; })) hmNext();
  else if(o.t==='unload'&&H.unloadAt&&H.troops===0&&Math.hypot(H.unloadAt[0]-o.x,H.unloadAt[1]-o.z)<o.r) hmNext();
  else if(o.t==='hook'&&H.sling&&H.sling.o===HM.crate) hmNext();
  else if(o.t==='deliver'&&HM.crate&&HM.crate.broken) hmEnd(false,'Sandık hasar gördü');
}
function hmEnd(win,why){
  if(HM.ended) return; HM.ended=true; const M=HM.M, t=Math.round(HM.t), xp=win?M.xp+Math.max(0,Math.round((M.lim-HM.t)/4)):0;
  if(HM.beacon){ scene.remove(HM.beacon); HM.beacon=null; }
  let best=null; try{ const R=JSON.parse(localStorage.getItem('ayy-hrec')||'{}'); best=R[M.id]; if(win&&(!best||t<best)){ R[M.id]=t; localStorage.setItem('ayy-hrec',JSON.stringify(R)); } }catch(e){}
  if(win&&typeof careerAdd==='function') try{ careerAdd(xp,{heliMis:1},'Helikopter görevi: '+M.n); }catch(e){}
  if(typeof musSting==='function') try{ musSting(win?'victory':'defeat'); }catch(e){}
  if(typeof radioSay==='function') radioSay({w:'kule',t:win?'Görev tamamlandı. Tebrikler {cs}, üsse dönebilirsin.':'Görev başarısız: '+why+'.'},null,{force:true});
  const el=$('hmEnd'); if(el){ $('hmEndT').textContent=win?'GÖREV TAMAMLANDI':'GÖREV BAŞARISIZ'; $('hmEndT').className=win?'ok':'bad';
    $('hmEndS').innerHTML='<b>'+M.n+'</b><span>'+(win?'Süre: '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0')+(best&&t>=best?' · rekor '+Math.floor(best/60)+':'+String(best%60).padStart(2,'0'):' · yeni rekor!')+(HM.kills?' · '+HM.kills+' hedef':'')+' · +'+xp+' XP':why)+'</span>';
    setTimeout(function(){ if(HM.ended&&HM.on){ try{ document.exitPointerLock&&document.exitPointerLock(); }catch(e){} el.classList.remove('hidden'); } },win?1800:2600); }
}
function hmQuit(){ $('hmEnd').classList.add('hidden'); hmClean(); HM.on=false; }
(function(){ const el=$('hmEnd'); if(!el) return;
  $('hmAgain').addEventListener('click',function(){ const id=HM.id; el.classList.add('hidden'); hmStart(id); });
  $('hmFree').addEventListener('click',function(){ hmQuit(); });
  $('hmHangar').addEventListener('click',function(){ hmQuit(); enterHangar(); }); })();
/* missions list in the hangar (helicopter tab) */
function hmList(){ const el=$('hMis'); if(!el) return; if(!HSEL){ el.innerHTML=''; el.classList.add('hidden'); return; } el.classList.remove('hidden');
  let R={}; try{ R=JSON.parse(localStorage.getItem('ayy-hrec')||'{}'); }catch(e){}
  el.innerHTML='<p class="hmh">HELİKOPTER GÖREVLERİ</p>'+HMIS.filter(function(m){ return m.heli===HSEL; }).map(function(m){ const r=R[m.id];
    return '<button type="button" class="hmb" data-hm="'+m.id+'"><b>'+m.n+'</b><small>'+m.d+'</small><i>'+(r?'Rekor '+Math.floor(r/60)+':'+String(r%60).padStart(2,'0'):'Süre '+Math.round(m.lim/60)+' dk')+' · '+m.xp+' XP</i></button>'; }).join(''); }
(function(){ const el=$('hMis'); if(el) el.addEventListener('click',function(e){ const b=e.target.closest('[data-hm]'); if(b) hmStart(b.dataset.hm); }); })();
const _hoRefresh=refreshHangarUI; refreshHangarUI=function(){ _hoRefresh(); hmList(); };
/* ---- input */
function hoKey(e){
  if(WALK.mode!=='heli'||!HELI.cur) return false;
  if(isKey(e,'heli','weapon')){ hoFire(); return true; }
  if(isKey(e,'heli','nextWpn')){ e.preventDefault(); hoNextWpn(); return true; }
  if(isKey(e,'heli','hook')){ if(HELI.cur.ground) hoTroops(); else { const had=!!HELI.cur.sling; slingHook(); if(!had&&HELI.cur.sling&&HM.on) hmEvent('hooked'); } return true; }
  if(isKey(e,'heli','assist')){ hoAssistToggle(); return true; }
  return false; }
window.addEventListener('keydown',function(e){ if(e.repeat||state!=='walk'||(typeof anyModalOpen==='function'&&anyModalOpen())) return; if(hoKey(e)){ e.stopImmediatePropagation(); } },true);
function hoPad(){ if(state!=='walk'||WALK.mode!=='heli'||!PADRAW) return; if(padEdge('heli','weapon')) hoFire(); if(padEdge('heli','nextWpn')) hoNextWpn(); if(padEdge('heli','assist')) hoAssistToggle();
  if(padEdge('heli','hook')){ const H=HELI.cur; if(H.ground) hoTroops(); else { const had=!!H.sling; slingHook(); if(!had&&H.sling&&HM.on) hmEvent('hooked'); } } }
/* ---- per-frame */
function heliOpsStep(dt){
  if(state==='walk'&&WALK.mode==='heli'&&HELI.cur&&HELI.cur.crashT<=0){ hoAimStep(dt); hoGun(dt); hoRearm(dt); hoPad(); }
  if(HO.pj.length) hoPjStep(dt); if(HTGT.length) htStep(dt); if(TROOPS.length) trStep(dt); slingStep(dt); hmStep(dt);
}
/* a crash drops whatever hangs on the hook */
const _hoCrash=heliCrash; heliCrash=function(H,why){ if(H.sling){ const S=H.sling; scene.remove(S.line); H.sling=null; S.o.fall={v:S.v.clone()}; S.o.fallP=S.p.clone(); FALLING.push(S.o); } H.troops=0; return _hoCrash(H,why); };
/* exit: unloading troops is done with B, getting out is G as before */
/* ---- HUD */
const hoP=new THREE.Vector3();
function hoScreen(p,w,h){ hoP.copy(p).project(camera); if(!(hoP.z<1)) return null; return [(hoP.x*0.5+0.5)*w,(-hoP.y*0.5+0.5)*h]; }
const _hoHUD=heliHUD; heliHUD=function(w,h,s){ _hoHUD(w,h,s); const H=HELI.cur; if(!H) return;
  const L=WALK.tvis?w/2:Math.round(16*s), top=Math.round(20*s)+Math.round(76*s);
  hx.textAlign=WALK.tvis?'center':'left'; hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif';
  hx.fillStyle=HO.assist?'#7dffb0':'#8899aa'; hx.fillText('ASKI YARDIMI '+(HO.assist?'AÇIK':'KAPALI')+' (H)', L, top);
  if(H.id==='t129'){ const A=hoAmmo(H); hx.fillStyle='#ffd27a';
    hx.fillText('20MM '+A.gun+'  ·  '+(H.sel==='cirit'?'▶ ':'')+'CİRİT '+A.cirit+'  ·  '+(H.sel==='umtas'?'▶ ':'')+'UMTAS '+A.umtas, L, top+Math.round(20*s));
    if(!H.ground){ /* gun cross and target boxes */
      try{ const ip=hoV.copy(HO.aim).addScaledVector(HO.aimDir,600), q=hoScreen(ip,w,h);
        if(q){ hx.strokeStyle='rgba(125,255,176,.9)'; hx.lineWidth=1.5; hx.beginPath(); hx.arc(q[0],q[1],7*s,0,6.3); hx.moveTo(q[0]-16*s,q[1]); hx.lineTo(q[0]-9*s,q[1]); hx.moveTo(q[0]+9*s,q[1]); hx.lineTo(q[0]+16*s,q[1]); hx.stroke(); }
        hoTargets().forEach(function(o){ const r=hoScreen(o.pos,w,h); if(!r) return; const lk=o===HO.lock&&HO.lockT>1.2, cd=o===HO.cand, z=(cd?14:9)*s;
          hx.strokeStyle=lk?'#ff5a4a':cd?'#ffd27a':'rgba(255,138,90,.55)'; hx.lineWidth=lk?2.5:1.5; hx.strokeRect(r[0]-z,r[1]-z,2*z,2*z);
          if(cd){ hx.textAlign='center'; hx.fillStyle=lk?'#ff5a4a':'#ffd27a'; hx.fillText(lk?'KİLİT':(H.sel==='umtas'?'KİLİTLENİYOR':o.n||o.label||''),r[0],r[1]-z-8*s); } }); }catch(e){} } }
  else { hx.fillStyle='#ffd27a'; hx.fillText('ASKER '+(H.troops||0)+'/12  ·  KANCA '+(H.sling?'YÜKLÜ':'BOŞ')+' (B)', L, top+Math.round(20*s));
    if(!H.ground&&!H.sling){ const L2=slingables(); let near=null, bd=40; L2.forEach(function(o){ const d=Math.hypot(o.x-H.x,o.z-H.z); if(d<bd){ bd=d; near=o; } });
      if(near){ const oy=near.crate?near.y:(near.y==null?groundH(near.x,near.z):near.y), up=H.y-oy, ok=bd<10&&up>4&&up<26; hx.textAlign='center'; hx.fillStyle=ok?'#7dffb0':'#ffd27a';
        hx.fillText(ok?'KANCA HAZIR — B':'YÜK '+Math.round(bd)+' m · '+Math.round(up)+' m altında', w/2, h*0.62); } } }
  /* mission objective */
  if(HM.on&&!HM.ended){ const o=hmCur(), tp=hmTarget(); hx.textAlign='center'; hx.font='700 '+Math.round(14*s)+'px "Chakra Petch",system-ui,sans-serif'; const rem=Math.max(0,Math.round(HM.M.lim-HM.t));
    hx.fillStyle='#ffb25a'; hx.fillText('GÖREV · '+HM.M.n.toLocaleUpperCase('tr-TR')+'  ·  '+Math.floor(rem/60)+':'+String(rem%60).padStart(2,'0'), w/2, Math.round((WALK.tvis?60:22)*s));
    hx.font='600 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#fff';
    let line=o.n; if(o.t==='kill') line+=' ('+HTGT.filter(function(t){ return !t.alive; }).length+'/'+HTGT.length+')';
    if(tp){ const d=Math.hypot(tp[0]-H.x,tp[1]-H.z), b=Math.atan2(tp[0]-H.x,tp[1]-H.z), rel=Math.atan2(Math.sin(b-H.h-Math.PI),Math.cos(b-H.h-Math.PI)); line+='  ·  '+(d>1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m');
      const cx=w/2, cy=Math.round((WALK.tvis?100:62)*s); hx.save(); hx.translate(cx,cy); hx.rotate(-rel); hx.fillStyle='#ffb25a'; hx.beginPath(); hx.moveTo(0,-11*s); hx.lineTo(7*s,6*s); hx.lineTo(0,2*s); hx.lineTo(-7*s,6*s); hx.closePath(); hx.fill(); hx.restore(); }
    hx.fillText(line, w/2, Math.round((WALK.tvis?80:42)*s)); }
};
/* ---- controls hint */
const _hoBoard=heliBoard; heliBoard=function(H){ _hoBoard(H); hoAmmo(H); toast(H.D.name+(H.id==='t129'?' — Space 20 mm · X '+(H.sel==='cirit'?'CİRİT':'UMTAS')+' · Tab silah · H askı yardımı · G in':' — B asker bindir/indir ya da yük kancası · H askı yardımı · G in'),'#b8ecff'); };
