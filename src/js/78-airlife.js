/* ------------------------------------------------------------------ living air base (V1.75)
   AI traffic: three aircraft park on the north apron, taxi out along the taxiway, hold short while the runway is busy,
   take off to the north, fly a right-hand circuit, land, roll out, backtrack and taxi back in (go-around if blocked).
   Ground crew in hi-vis vests stand by the parked aircraft and a marshaller waves taxiing aircraft out.
   Pedestrians walk the sidewalks of the base, the villages and the towns (instanced, cheap).
   SETTINGS.life=false turns all of it off. */
SETTINGS.life=SETTINGS.life==null?true:SETTINGS.life; if(typeof SETTINGS_DEF!=='undefined') SETTINGS_DEF.life=true;
const AL={built:false, ai:[], crew:[], walkers:[], wmesh:[], rwy:null, mar:null, sayT:0};
const AL_SPOTS=[[-275,712],[-225,712],[-175,712]];   /* north end of the main apron, clear of the shelters */
function alOut(s){ return [[s[0],748],[-150,752],[-150,800]]; }
function alIn(s){ return [[-150,800],[-150,752],[s[0],748],[s[0],s[1]]]; }
const AL_TYPES=[['hurjet','Şimşek 05'],['hurkus','Doğan 11'],['aksungur','Kartal 21']];
const AL_CIRCUIT=[[900,-3300,470],[2600,-2200,520],[2700,2600,520],[1700,5200,420],[0,5600,330]];
/* ---- person geometry (merged boxes with vertex colours) */
function alBoxes(list){ const pos=[], nor=[], col=[];
  list.forEach(function(b){ const g=new THREE.BoxGeometry(b[0],b[1],b[2]).toNonIndexed(); g.translate(b[3],b[4],b[5]); const P=g.attributes.position, N=g.attributes.normal, c=new THREE.Color(b[6]);
    for(let i=0;i<P.count;i++){ pos.push(P.getX(i),P.getY(i),P.getZ(i)); nor.push(N.getX(i),N.getY(i),N.getZ(i)); col.push(c.r,c.g,c.b); } });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return g; }
function alPersonGeo(shirt,legs,vest){ return alBoxes([[0.17,0.8,0.22,-0.12,0.4,0,legs],[0.17,0.8,0.22,0.12,0.4,0,legs],[0.48,0.66,0.28,0,1.13,0,shirt],[0.13,0.6,0.15,-0.32,1.12,0,vest||shirt],[0.13,0.6,0.15,0.32,1.12,0,vest||shirt],[0.24,0.26,0.24,0,1.6,0,0xc79a76],[0.26,0.08,0.26,0,1.75,0,0x3a2a20]].concat(vest?[[0.5,0.42,0.3,0,1.2,0,vest]]:[])); }
const AL_MAT=new THREE.MeshLambertMaterial({vertexColors:true});
function alCrew(x,z,h,kind){ const g=new THREE.Group(), body=new THREE.Mesh(alPersonGeo(0x2b3440,0x2a2f36,kind==='mar'?0xf2c21a:0xff7a1a),AL_MAT); g.add(body);
  let armL=null, armR=null;
  if(kind==='mar'){ /* marshaller: separate arms with lit wands */ armL=new THREE.Group(); armR=new THREE.Group(); armL.position.set(-0.32,1.42,0); armR.position.set(0.32,1.42,0);
    const wm=new THREE.MeshBasicMaterial({color:0xff6a1a}); wm.userData.glow=3; [armL,armR].forEach(function(a){ const s=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.62,0.14),new THREE.MeshLambertMaterial({color:0xf2c21a})); s.position.y=-0.3; a.add(s); const w=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.55,6),wm); w.position.y=-0.85; a.add(w); g.add(a); }); }
  g.position.set(x,groundH(x,z),z); g.rotation.y=h; scene.add(g); const c={g:g,x:x,z:z,h:h,kind:kind,armL:armL,armR:armR,t:Math.random()*6}; AL.crew.push(c); return c; }
/* ---- AI aircraft */
function alTaxiIdx(x){ const P=TAXI.pts; let best=0, bd=1e9; for(let i=0;i<P.length;i++){ const d=Math.abs(P[i].x-x)+Math.abs(P[i].z-840)*3; if(d<bd){ bd=d; best=i; } } return best; }
function alNew(k){ const id=AL_TYPES[k][0], m=buildModel(id); if(m.flames) m.flames.forEach(function(f){ f.visible=false; }); scene.add(m.group);
  const s=AL_SPOTS[k], a={id:id, cs:AL_TYPES[k][1], m:m, D:AIRCRAFT[id], gy:AIRFIELD_Y+(AIRCRAFT[id].gearOff||1.6), x:s[0], z:s[1], y:0, h:0, v:0, pitch:0, bank:0, st:'park', t:20+k*45+Math.random()*30, i:0, wp:0, spot:k, ti:alTaxiIdx(-150)};
  a.y=a.gy; AL.ai.push(a); alPlace(a); alCrew(s[0]-9,s[1]+8,0.6,'crew'); alCrew(s[0]+9,s[1]-5,-2.2,'crew'); return a; }
function alPlace(a){ a.h=Math.atan2(Math.sin(a.h),Math.cos(a.h)); const g=a.m.group; g.position.set(a.x,a.y,a.z); g.rotation.set(0,0,0); g.rotateY(a.h); g.rotateX(a.pitch); g.rotateZ(a.bank);
  if(a.m.flames) a.m.flames.forEach(function(f){ f.visible=a.st==='roll'||a.st==='climb'; }); }
function alRunwayBusy(me){
  if(state==='play'&&!S.crashed){ if(S.onGround&&Math.abs(S.pos.x)<70&&Math.abs(S.pos.z)<1320&&(S.clearance||!S.taxi)) return true;
    if(!S.onGround&&S.gear&&Math.abs(S.pos.x)<500&&S.pos.z>-1300&&S.pos.z<6000&&S.pos.y-AIRFIELD_Y<700) return true; }
  return AL.ai.some(function(o){ return o!==me&&(o.st==='roll'||o.st==='final'&&o.z<4200||o.st==='rollout'||o.st==='uturn'||o.st==='back'); }); }
function alHold(){ if(AL.hold==null){ const P=TAXI.pts; AL.hold=P.length-26; for(let i=0;i<P.length;i++){ if(P[i].x>-95&&P[i].z>1150){ AL.hold=Math.max(0,i-2); break; } } } return AL.hold; }
function alPlayerTaxiing(){ return state==='play'&&S.onGround&&S.taxi&&!S.clearance; }
function alSay(t){ if(state!=='play'||typeof radioSay!=='function') return; if(S.pos.distanceTo(new THREE.Vector3(0,0,0))>9000) return; if(T-AL.sayT<14) return; AL.sayT=T; radioSay({w:'kule',t:t},null,{}); }
function alTurnTo(a,tx,tz,rate,dt){ const want=Math.atan2(-(tx-a.x),-(tz-a.z)); const d=Math.atan2(Math.sin(want-a.h),Math.cos(want-a.h)), st=clamp(d,-rate*dt,rate*dt); a.h+=st; return {d:d,turn:st/Math.max(dt,1e-4)}; }
function alPassed(a,p){ const dx=p.x-a.x, dz=p.z-a.z; return Math.hypot(dx,dz)<6||(dx*-Math.sin(a.h)+dz*-Math.cos(a.h))<0&&Math.hypot(dx,dz)<30; }
/* follow a short list of apron points; true when the last one is reached */
function alWp(a,L,dt){ a.wi=a.wi||0; const w=L[Math.min(a.wi,L.length-1)], r=alTurnTo(a,w[0],w[1],0.9,dt), last=a.wi>=L.length-1, d=Math.hypot(w[0]-a.x,w[1]-a.z);
  a.v+=clamp((Math.abs(r.d)>0.5?1.5:(last?Math.min(4,d*0.5+0.5):5))-a.v,-4*dt,2*dt); alMove(a,dt);
  if(d<(last?1.5:5)){ if(last){ a.wi=0; return true; } a.wi++; } return false; }
function alMove(a,dt){ a.x+=-Math.sin(a.h)*a.v*dt; a.z+=-Math.cos(a.h)*a.v*dt; }
function alStep(a,dt){
  const P=TAXI.pts; a.t-=dt;
  /* keep spacing on the ground: stop behind another aircraft */
  if(a.v>0.5&&a.y<=a.gy+0.5&&a.st!=='roll'&&a.st!=='rollout'){ const fx=-Math.sin(a.h), fz=-Math.cos(a.h); for(let k=0;k<AL.ai.length;k++){ const o=AL.ai[k]; if(o===a||o.y>o.gy+5) continue; const dx=o.x-a.x, dz=o.z-a.z, d=Math.hypot(dx,dz); if(d<45&&(dx*fx+dz*fz)>d*0.6){ a.v=Math.max(0,a.v-6*dt); alPlace(a); return; } } }
  switch(a.st){
  case 'park': a.v=0; if(a.t<=0&&!alPlayerTaxiing()){ a.st='spin'; a.t=0; } break;
  case 'spin': /* turned to face the taxiway (towed round) */ { const want=Math.PI, d=Math.atan2(Math.sin(want-a.h),Math.cos(want-a.h)); if(Math.abs(d)<0.02){ a.h=want; a.st='pull'; a.wi=0; } else a.h+=clamp(d,-0.3*dt,0.3*dt); } break;
  case 'pull': { if(alWp(a,alOut(AL_SPOTS[a.spot]),dt)){ a.st='join'; } } break;
  case 'join': { const p=P[a.ti]; const r=alTurnTo(a,p.x,p.z,0.8,dt); a.v=Math.abs(r.d)>0.5?2:5; alMove(a,dt); if(Math.hypot(p.x-a.x,p.z-a.z)<4){ a.i=a.ti; a.st='taxiOut'; alSay(a.cs+', taksi yolu A üzerinden pist 36 başına taksi edin.'); } } break;
  case 'taxiOut': { if(alPlayerTaxiing()&&a.i<P.length-40){ a.v=Math.max(0,a.v-4*dt); break; }
    const hold=alHold(); if(a.i>=hold&&!a.cleared){ if(alRunwayBusy(a)){ a.v=Math.max(0,a.v-4*dt); alMove(a,dt); break; } a.cleared=true; alSay(a.cs+', rüzgâr '+windTxt()+', pist 36 kalkış serbest.'); }
    const p=P[Math.min(a.i+3,P.length-1)], r=alTurnTo(a,p.x,p.z,0.9,dt); a.v+=clamp((Math.abs(r.d)>0.5?2.5:9)-a.v,-5*dt,2*dt); alMove(a,dt); while(a.i<P.length-1&&alPassed(a,P[a.i])) a.i++;
    if(a.i>=P.length-1){ a.st='line'; a.cleared=false; } } break;
  case 'line': { a.v=Math.max(3,a.v-2*dt); const d=alTurnTo(a,0,-1200,0.7,dt).d; a.x+=(0-a.x)*Math.min(1,dt*0.8); alMove(a,dt); if(Math.abs(d)<0.03){ a.h=0; a.x=0; a.st='roll'; } } break;
  case 'roll': a.v+=8.5*dt; a.x*=0.98; alMove(a,dt); if(a.v>68){ a.st='climb'; } break;
  case 'climb': a.v=Math.min(110,a.v+5*dt); a.pitch=Math.min(0.2,a.pitch+0.15*dt); a.y+=a.v*Math.sin(a.pitch)*dt; alMove(a,dt); if(a.z<-2600){ a.st='circuit'; a.wp=0; } break;
  case 'circuit': case 'final': {
    const W=a.st==='final'?[0,1100,a.gy+1]:AL_CIRCUIT[a.wp], spd=a.st==='final'?72:105; a.v+=clamp(spd-a.v,-4*dt,3*dt);
    const r=alTurnTo(a,W[0],W[1],a.st==='final'?0.25:0.32,dt); a.bank+=(clamp(r.turn*1.8,-0.7,0.7)-a.bank)*Math.min(1,dt*2);
    const ty=a.st==='final'?a.gy+Math.max(0,(a.z-1100))*0.055:AIRFIELD_Y+W[2], vy=clamp((ty-a.y)*0.6,-8,10); a.y+=vy*dt; a.pitch+=(clamp(vy/a.v,-0.12,0.18)-a.pitch)*Math.min(1,dt*2); alMove(a,dt);
    if(a.st==='circuit'&&Math.hypot(W[0]-a.x,W[1]-a.z)<260){ a.wp++; if(a.wp>=AL_CIRCUIT.length){ if(alRunwayBusy(a)){ a.wp=1; alSay(a.cs+', pist dolu, pas geçin, sağ trafiğe devam.'); } else { a.st='final'; alSay(a.cs+', pist 36 iniş serbest.'); } } }
    if(a.st==='final'){ if(a.z>3500&&alRunwayBusy(a)){ a.st='circuit'; a.wp=1; break; } if(a.y<=a.gy+0.4&&a.z<1250){ a.y=a.gy; a.st='rollout'; a.bank=0; } }
  } break;
  case 'rollout': a.pitch*=Math.exp(-dt*3); a.bank*=Math.exp(-dt*3); a.v=Math.max(12,a.v-4.2*dt); a.x*=0.98; alMove(a,dt); if(a.z<-900){ a.st='uturn'; a.t=0; } break;
  case 'uturn': a.v=Math.max(4,a.v-6*dt); a.h+=0.35*dt; alMove(a,dt); if(a.h>=Math.PI-0.02){ a.h=Math.PI; a.st='back'; } break;
  case 'back': a.v+=clamp(13-a.v,-3*dt,2*dt); a.x+=(0-a.x)*Math.min(1,dt); alMove(a,dt); if(a.z>1080){ a.st='exit'; a.i=P.length-1; } break;
  case 'exit': case 'taxiIn': { const p=P[Math.max(a.i-3,a.ti)], r=alTurnTo(a,p.x,p.z,0.9,dt); a.v+=clamp((Math.abs(r.d)>0.5?2.5:9)-a.v,-5*dt,2*dt); alMove(a,dt); while(a.i>a.ti&&alPassed(a,P[a.i])) a.i--;
    if(a.i<=a.ti+1){ a.st='in'; a.wi=0; } } break;
  case 'in': { const s=AL_SPOTS[a.spot]; if(alWp(a,alIn(s),dt)){ a.x=s[0]; a.z=s[1]; a.v=0; a.wi=0; a.st='park'; a.t=90+Math.random()*120; } } break;
  }
  if(a.st!=='climb'&&a.st!=='circuit'&&a.st!=='final'){ a.y=a.gy; if(a.st!=='rollout') { a.pitch=0; a.bank=0; } }
  alPlace(a);
}
/* ---- pedestrians */
const AL_SHIRTS=[0xd8dde4,0x3b6ea8,0xa83b3b,0x4a7a4a,0xd9a441,0x5a4a7a];
function alWalkers(){
  const r=mulberry32(4242), N=DEV.mobile?60:120, paths=TRAFFIC.paths.filter(function(P){ return P.len>300; }); if(!paths.length) return;
  const tot=paths.reduce(function(s,P){ return s+P.len; },0), geos=AL_SHIRTS.map(function(c){ return alPersonGeo(c,r()<0.5?0x2a3240:0x5a4a3a); });
  for(let i=0;i<N;i++){ let u=r()*tot, P=paths[0]; for(let k=0;k<paths.length;k++){ if(u<paths[k].len){ P=paths[k]; break; } u-=paths[k].len; }
    AL.walkers.push({P:P,s:r()*P.len,dir:r()<0.5?1:-1,v:1.1+r()*0.6,side:r()<0.5?-1:1,off:5.2+r()*1.2,i:0,c:i%geos.length,ph:r()*6}); }
  geos.forEach(function(g,ci){ const n=AL.walkers.filter(function(w){ return w.c===ci; }).length; const im=new THREE.InstancedMesh(g,AL_MAT,Math.max(1,n)); im.frustumCulled=false; im.userData.noCull=true; im.userData.noChunk=true; im.castShadow=false; scene.add(im); AL.wmesh.push(im); }); }
const alM=new THREE.Matrix4(), alQ=new THREE.Quaternion(), alS=new THREE.Vector3(1,1,1), alP=new THREE.Vector3(), alU=new THREE.Vector3(0,1,0);
function alWalkStep(dt){ if(!AL.wmesh.length) return; const idx=AL.wmesh.map(function(){ return 0; }), cp=camera.position;
  for(let k=0;k<AL.walkers.length;k++){ const w=AL.walkers[k], P=w.P; w.s+=w.dir*w.v*dt; if(w.s>P.len-2){ w.s=P.len-2; w.dir=-1; } else if(w.s<2){ w.s=2; w.dir=1; }
    while(w.i<P.L.length-2&&P.L[w.i+1]<w.s) w.i++; while(w.i>0&&P.L[w.i]>w.s) w.i--;
    const a=P.pts[w.i], b=P.pts[w.i+1], seg=P.L[w.i+1]-P.L[w.i]||1, u=(w.s-P.L[w.i])/seg, cx=a[0]+(b[0]-a[0])*u, cz=a[1]+(b[1]-a[1])*u, fx=(b[0]-a[0])/seg, fz=(b[1]-a[1])/seg;
    const x=cx-fz*w.off*w.side, z=cz+fx*w.off*w.side, far=Math.abs(x-cp.x)+Math.abs(z-cp.z)>1800;
    w.ph+=dt*w.v*4.2; alP.set(x,far?-500:groundH(x,z)+Math.abs(Math.sin(w.ph))*0.05,z); alQ.setFromAxisAngle(alU,Math.atan2(-fx*w.dir,-fz*w.dir)+Math.PI); alM.compose(alP,alQ,alS);
    const im=AL.wmesh[w.c]; im.setMatrixAt(idx[w.c]++,alM); }
  AL.wmesh.forEach(function(im){ im.instanceMatrix.needsUpdate=true; }); }
/* ---- marshaller */
function alCrewStep(dt){ const mar=AL.mar; if(!mar) return; let busy=AL.ai.some(function(a){ return (a.st==='join'||a.st==='pull'||a.st==='taxiOut'&&a.i<40)&&Math.hypot(a.x-mar.x,a.z-mar.z)<160; });
  if(state==='play'&&S.onGround&&S.taxi&&Math.hypot(S.pos.x-mar.x,S.pos.z-mar.z)<160) busy=true; mar.t+=dt;
  const k=busy?Math.sin(mar.t*4):0; mar.armL.rotation.z=busy?2.6+k*0.5:0.15; mar.armR.rotation.z=busy?-2.6+k*0.5:-0.15; }
/* ---- build and per frame */
function buildAirLife(){ if(AL.built||!SETTINGS.life) return; AL.built=true;
  try{ AL_TYPES.forEach(function(t,k){ alNew(k); }); }catch(e){ console.warn('hava trafiği',e); }
  AL.mar=alCrew(-448,812,-Math.PI/2,'mar');
  try{ alWalkers(); }catch(e){ console.warn('yayalar',e); } }
function alClear(){ AL.ai.forEach(function(a){ scene.remove(a.m.group); }); AL.crew.forEach(function(c){ scene.remove(c.g); }); AL.wmesh.forEach(function(m){ scene.remove(m); }); AL.ai=[]; AL.crew=[]; AL.walkers=[]; AL.wmesh=[]; AL.mar=null; AL.built=false; }
function airLifeStep(dt){
  if(!SETTINGS.life){ if(AL.built) alClear(); return; } if(!AL.built){ if(state!=='menu'||T>3) buildAirLife(); return; }
  if(NET.on&&NET.started) return; const d=Math.min(dt,0.05);
  for(let i=0;i<AL.ai.length;i++) alStep(AL.ai[i],d);
  alWalkStep(d); alCrewStep(d); }
/* settings + map */
(function(){ const s=$('setLife'); if(s) s.addEventListener('change',function(){ SETTINGS.life=s.checked; saveSettings(); }); })();
const _alSync=syncSettingsUI; syncSettingsUI=function(){ _alSync(); const s=$('setLife'); if(s) s.checked=!!SETTINGS.life; };
const _alMap=drawMap; drawMap=function(x,W,H,mini){ _alMap(x,W,H,mini); if(!AL.ai.length) return; x.save(); x.fillStyle='#e8f4ff'; x.strokeStyle='#08121c'; x.lineWidth=1;
  AL.ai.forEach(function(a){ const p=mapToScreen(a.x,a.z,W,H); x.beginPath(); x.arc(p[0],p[1],mini?2:3,0,6.3); x.fill(); x.stroke(); }); x.restore(); };
