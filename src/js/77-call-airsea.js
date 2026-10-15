/* ------------------------------------------------------------------ calling helicopters and boats (V1.72)
   'Hava · Deniz' tab of the call menu: a T625 / T129 flies in and lands next to you (or on the map point);
   a patrol boat comes in from the sea to the nearest water. The Bozkurtlar 4×4 is brought hanging under a T625. */
const CALL_X={t625:{id:'t625',n:'T625 GÖKBEY',air:true},t129:{id:'t129',n:'T129 ATAK',air:true},patrol:{id:'patrol',n:'Hücumbot',sea:true}};
CALL_TABS.push({id:'hava',n:'Hava · Deniz',ids:['t625','t129','patrol']});
const CALL_SLING={mil:1};
const CALLX={jobs:[], helis:[], boats:[]};
callKind=HOOK.wrap('callKind','77-call-airsea#_cxKind',function(_cxKind){ return function(id){ return _cxKind(id)||CALL_X[id]; }; },callKind);
callHow=HOOK.wrap('callHow','77-call-airsea#_cxHow',function(_cxHow){ return function(id){ if(CALL_X[id]) return CALL_X[id].air?'Uçarak gelir, yanına iner':'Denizden gelir, kıyıya yanaşır'; if(CALL_SLING[id]) return 'T625 askıda getirir'; return _cxHow(id); }; },callHow);
callIcon=HOOK.wrap('callIcon','77-call-airsea#_cxIcon',function(_cxIcon){ return function(id){ const X=CALL_X[id]; if(!X) return _cxIcon(id);
  const p=X.sea?'<path d="M2 15h20l-3 4H5z"/><path d="M6 15v-3h8l2 3M9 12V9h3"/><path d="M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1"/>':
    '<path d="M3 7h18M12 7v3"/><path d="M5 13c0-2 2-3 5-3h4l4 3v2H7c-1 0-2-1-2-2z"/><path d="M18 13h4M8 18h8M10 15v3M14 15v3"/>'+(id==='t129'?'<path d="M7 15l-2 2"/>':'');
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">'+p+'</svg>'; }; },callIcon);
callOrder=HOOK.wrap('callOrder','77-call-airsea#_cxOrder',function(_cxOrder){ return function(id,x,z,o){ o=o||{};
  if(CALL_X[id]||CALL_SLING[id]){ if(CALL.cd>0&&!o.force){ toast('Lojistik meşgul — '+Math.ceil(CALL.cd)+' sn bekle','#ffc24a'); return null; }
    const r=CALL_X[id]&&CALL_X[id].sea?cxBoat(id,x,z):cxAir(id,x,z); if(r) CALL.cd=o.force?0:6; return r; }
  return _cxOrder(id,x,z,o); }; },callOrder);
function cxSay(t){ if(typeof radioSay==='function') radioSay({w:'loj',t:t},null,{force:true}); else toast(t,'#b8ecff'); }
/* ---- helicopters */
function cxHeliNew(id,x,z,h){ const m=heliBuild(id), y=Math.max(groundH(x,z),0)+90;
  const H={id:id, m:m, D:m.def, at:'Çağrılan', home:[x,z,h], x:x, y:y, z:z, h:h, vx:0, vy:0, vz:0, yr:0, pitch:0, roll:0, rpm:1, rot:0, ground:false, crashT:0, called:true};
  scene.add(m.g); heliPlace(H); HELI.list.push(H); return H; }
function cxHeliRemove(H){ const i=HELI.list.indexOf(H); if(i>=0) HELI.list.splice(i,1); scene.remove(H.m.g); if(H.sling){ scene.remove(H.sling.line); H.sling=null; } CALLX.helis=CALLX.helis.filter(function(x){ return x!==H; }); CALLX.jobs=CALLX.jobs.filter(function(J){ if(J.H===H){ if(J.beacon) scene.remove(J.beacon); return false; } return true; }); }
function cxAir(id,x,z){
  const sling=!!CALL_SLING[id], sp=callSpot(x,z,sling?4:9); if(!sp){ toast('Buraya iniş yapılamaz (su, bina ya da dik yamaç)','#ff8a7a'); return null; }
  if(!sling){ const heliNow=CALLX.helis.filter(function(H){ return H!==HELI.cur; }); while(CALLX.helis.length>=2&&heliNow.length){ cxHeliRemove(heliNow.shift()); } }
  const a=Math.random()*Math.PI*2, D=sling?700:900, sx=sp[0]+Math.cos(a)*D, sz=sp[1]+Math.sin(a)*D, H=cxHeliNew(sling?'t625':id,sx,sz,Math.atan2(sx-sp[0],sz-sp[1]));
  const J={mode:sling?'sling':'heli', H:H, tx:sp[0], tz:sp[1], ph:'in', t:0, beacon:callBeacon(sp[0],sp[1]), name:sling?callKind(id).n:H.D.name};
  if(sling){ /* the vehicle hangs under the helicopter */
    const c=vehNew(id,sx,sz,0); c.called=true; CALL.list.push(c); while(CALL.list.length>CALL_MAX){ const i=CALL.list.findIndex(function(v){ return v!==c&&!(WALK.mode==='car'&&WALK.car===v); }); if(i<0) break; callRemove(CALL.list[i]); }
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0x222222})); line.frustumCulled=false; line.userData.noCull=true; scene.add(line);
    H.sling={o:c,p:new THREE.Vector3(sx,H.y-13,sz),v:new THREE.Vector3(),L:12,line:line}; J.c=c; }
  else CALLX.helis.push(H);
  CALLX.jobs.push(J); cxSay(J.name+(sling?' T625 ile askıda yola çıktı':' kalkış yaptı')+', tahmini varış '+Math.round(D/45+12)+' saniye.'); return H; }
/* simple autopilot: cruise, slow down, settle over the point (hover height h above the floor) */
function cxFly(H,tx,tz,hov,dt){
  const dx=tx-H.x, dz=tz-H.z, d=Math.hypot(dx,dz), F=heliFloor(H), gy=Math.max(F.y,groundH(tx,tz),0);
  const vt=d>320?48:Math.max(d>4?2.5:0,d*0.15), ux=d>0.01?dx/d:0, uz=d>0.01?dz/d:0, k=Math.min(1,dt*0.9);
  const ax=(ux*vt-H.vx)*k, az=(uz*vt-H.vz)*k; H.vx+=ax; H.vz+=az;
  const look=Math.max(groundH(H.x+H.vx*4,H.z+H.vz*4),0), ty=d>260?Math.max(gy,look)+80:d>40?Math.max(gy,look)+hov+18+d*0.15:gy+hov, vy=clamp((ty-H.y)*0.8,-6,9);
  H.vy+=(vy-H.vy)*Math.min(1,dt*2); H.x+=H.vx*dt; H.z+=H.vz*dt; H.y+=H.vy*dt;
  const sp=Math.hypot(H.vx,H.vz); if(sp>4){ const want=Math.atan2(-H.vx,-H.vz); H.h+=clamp(Math.atan2(Math.sin(want-H.h),Math.cos(want-H.h)),-0.7*dt,0.7*dt); }
  const fx=-Math.sin(H.h), fz=-Math.cos(H.h), vf=H.vx*fx+H.vz*fz, af=(ax*fx+az*fz)/Math.max(dt,1e-3);
  H.pitch+=(clamp(vf/220+af*0.03,-0.22,0.25)-H.pitch)*Math.min(1,dt*2); H.roll*=Math.exp(-dt*2);
  H.rpm=1; H.rot+=dt*28; heliPlace(H); return d; }
function cxHeliStep(J,dt){ const H=J.H; J.t+=dt;
  if(H===HELI.cur){ cxEnd(J); return; }                              /* the player took it over */
  if(J.ph==='in'){ const hov=J.mode==='sling'?(H.sling?H.sling.L+1.6:12):0, d=cxFly(H,J.tx,J.tz,hov,dt), F=heliFloor(H);
    if(J.mode==='heli'&&d<2.5&&H.y-F.y<1.2){ H.y=F.y; H.ground=true; H.vx=H.vy=H.vz=0; H.pitch=H.roll=0; H.home=[H.x,H.z,H.h]; heliPlace(H); cxSay(H.D.name+' indi. Rotor durunca binebilirsin.'); cxEnd(J); }
    if(J.mode==='sling'&&d<3&&H.sling&&H.sling.p.y-groundH(H.sling.p.x,H.sling.p.z)<1.2){ const c=H.sling.o; slingRelease(H); cxSay(c.K.n+' teslim edildi. İyi yolculuklar.'); if(J.beacon){ scene.remove(J.beacon); J.beacon=null; } J.ph='out'; J.ox=H.x+(H.x-WALK.pos.x)*30; J.oz=H.z+(H.z-WALK.pos.z)*30; J.t=0; }
    if(J.t>90){ H.x=J.tx; H.z=J.tz; H.y=heliFloor(H).y+(J.mode==='sling'?14:0); } }
  else { cxFly(H,J.ox,J.oz,90,dt); H.vy=Math.max(H.vy,4); if(J.t>25) cxHeliRemove(H); } }
function cxEnd(J){ if(J.beacon){ scene.remove(J.beacon); J.beacon=null; } CALLX.jobs=CALLX.jobs.filter(function(x){ return x!==J; }); }
/* ---- boats */
function cxBoatNew(kind,x,z,h){ const K=BOAT_KINDS[kind], sh=K.build(), g=new THREE.Group(); g.add(bakeGroup(sh.group)); scene.add(g);
  const b={id:kind,K:K,g:g,L:sh.L||12,B:sh.B||Math.max(3,(sh.L||12)*0.18),x:x,z:z,h:h,v:0,th:0,yr:0,cd:0,bob:Math.random()*6,deck:null,called:true}; BOATS.push(b); boatPlace(b,0); return b; }
function cxBoatRemove(b){ const i=BOATS.indexOf(b); if(i>=0) BOATS.splice(i,1); scene.remove(b.g); CALLX.boats=CALLX.boats.filter(function(x){ return x!==b; }); CALLX.jobs=CALLX.jobs.filter(function(J){ if(J.b===b){ if(J.beacon) scene.remove(J.beacon); return false; } return true; }); }
function cxWater(x,z){ const ok=function(px,pz){ if(terrainH(px,pz)>-2.2) return false; for(let k=0;k<8;k++){ const a=k/8*6.283; if(terrainH(px+Math.cos(a)*7,pz+Math.sin(a)*7)>-1.2) return false; }
    return !BOATS.some(function(b){ return Math.hypot(b.x-px,b.z-pz)<b.L/2+12; }); };
  for(let r=0;r<=320;r+=10){ const n=Math.max(1,Math.round(r/5)); for(let i=0;i<n;i++){ const a=i/n*6.283, px=x+Math.cos(a)*r, pz=z+Math.sin(a)*r; if(ok(px,pz)) return [px,pz]; } } return null; }
function cxBoat(id,x,z){
  if(!BOATS_BUILT) buildBoats(); BOATS.forEach(function(b){ b.g.visible=true; });
  const w=cxWater(x,z); if(!w){ toast('Yakında tekne yanaşabilecek deniz yok (320 m)','#ff8a7a'); return null; }
  const mine=CALLX.boats.filter(function(b){ return b!==BOAT.cur; }); while(CALLX.boats.length>=2&&mine.length) cxBoatRemove(mine.shift());
  /* come in from the open sea: step away from the shore until deep water */
  let dx=w[0]-x, dz=w[1]-z, l=Math.hypot(dx,dz)||1; dx/=l; dz/=l; let sx=w[0], sz=w[1];
  for(let s=20;s<=220;s+=20){ const px=w[0]+dx*s, pz=w[1]+dz*s; if(terrainH(px,pz)<-3) { sx=px; sz=pz; } else break; }
  const b=cxBoatNew(id,sx,sz,Math.atan2(sx-w[0],sz-w[1])); CALLX.boats.push(b);
  const J={mode:'boat',b:b,tx:w[0],tz:w[1],t:0,beacon:callBeacon(w[0],w[1]),name:b.K.n}; CALLX.jobs.push(J);
  cxSay(b.K.n+' kıyıya yönlendirildi, tahmini varış '+Math.round(Math.hypot(sx-w[0],sz-w[1])/8+3)+' saniye.'); return b; }
function cxBoatStep(J,dt){ const b=J.b; J.t+=dt; if(b===BOAT.cur){ cxEnd(J); return; }
  const dx=J.tx-b.x, dz=J.tz-b.z, d=Math.hypot(dx,dz), want=Math.atan2(-dx,-dz); b.h+=clamp(Math.atan2(Math.sin(want-b.h),Math.cos(want-b.h)),-0.5*dt,0.5*dt);
  const vt=Math.min(b.K.top*0.6,Math.max(0.8,d*0.25)); b.v+=clamp(vt-b.v,-3*dt,2*dt); b.x+=-Math.sin(b.h)*b.v*dt; b.z+=-Math.cos(b.h)*b.v*dt; boatPlace(b,dt);
  if(d<3||J.t>60){ b.v=0; b.th=0; boatPlace(b,0); cxSay(b.K.n+' yanaştı. Kıyıdan binebilirsin.'); cxEnd(J); } }
/* ---- per frame, HUD, map */
callStep=HOOK.wrap('callStep','77-call-airsea#_cxStep',function(_cxStep){ return function(dt){ _cxStep(dt); for(let i=CALLX.jobs.length-1;i>=0;i--){ const J=CALLX.jobs[i]; if(!J) continue; if(J.beacon) J.beacon.material.opacity=0.16+0.1*Math.sin((J.t||0)*5);
    if(J.mode==='boat') cxBoatStep(J,dt); else cxHeliStep(J,dt); }
  CALLX.boats.forEach(function(b){ if(b!==BOAT.cur&&!CALLX.jobs.some(function(J){ return J.b===b; })) boatPlace(b,dt); }); }; },callStep);
drawWalkHUD=HOOK.wrap('drawWalkHUD','77-call-airsea#_cxHUD',function(_cxHUD){ return function(){ _cxHUD(); const L=CALLX.jobs.filter(function(J){ return J.ph!=='out'; }); if(!L.length) return;
  const s=clamp(Math.min(HW,HH)/760,0.7,1.5), off=CALL.jobs.filter(function(J){ return !J.done; }).length; hx.save(); hx.textAlign='right'; hx.textBaseline='middle'; hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.shadowColor='rgba(0,0,0,.7)'; hx.shadowBlur=4; hx.fillStyle='#ffb25a';
  L.forEach(function(J,i){ const o=J.H||J.b, d=Math.round(Math.hypot(J.tx-o.x,J.tz-o.z)); hx.fillText('LOJİSTİK · '+J.name.toLocaleUpperCase('tr-TR')+' · '+(J.mode==='boat'?'DENİZDE ':'HAVADA ')+(d>1000?(d/1000).toFixed(1)+' km':d+' m'), HW-Math.round(16*s), Math.round((WALK.tvis?64:22)*s)+(off+i)*Math.round(18*s)); });
  hx.restore(); }; },drawWalkHUD);
drawMap=HOOK.wrap('drawMap','77-call-airsea#_cxMap',function(_cxMap){ return function(x,W,H,mini){ _cxMap(x,W,H,mini); x.save(); x.fillStyle='#ffb25a'; x.strokeStyle='#08121c'; x.lineWidth=1.5;
  CALLX.helis.concat(CALLX.boats).forEach(function(o){ const p=mapToScreen(o.x,o.z,W,H); x.beginPath(); x.arc(p[0],p[1],mini?2.8:4.5,0,6.3); x.fill(); x.stroke(); }); x.restore(); }; },drawMap);
