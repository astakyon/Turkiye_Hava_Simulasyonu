/* ------------------------------------------------------------------ helicopters you can board in walk mode.
   T129 ATAK and T625 GÖKBEY stand on helipads at the air base, the UAV centre, the naval and land bases and both cities.
   Walk up, press E to board; the engines spool up, then fly with the 'heli' control scheme (cyclic / collective / pedals).
   Land gently (G to get out). Arcade flight model: cyclic tilts the disc, tilt accelerates, collective sets the climb rate. */
const HELI={list:[], cur:null, built:false, snd:null, fp:false};
const HELI_SPOTS=[
  {id:'t129',x:-450,z:470,h:Math.PI/2,at:'Ay Yıldız Hava Üssü',pad:true},
  {id:'t625',x:-450,z:540,h:Math.PI/2,at:'Ay Yıldız Hava Üssü',pad:true},
  {id:'t129',x:11300,z:11950,h:0,at:'İHA ve Test Merkezi',pad:true},
  {id:'t625',x:-1720,z:-3360,h:Math.PI/2,at:'Deniz Üssü'},
  {id:'t129',x:1300,z:-7340,h:0,at:'Kara Üssü'},
  {id:'t625',x:-1450,z:6605,h:Math.PI/2,at:'Anadolukent',pad:true},
  {id:'t625',x:-8200,z:-6732,h:Math.PI/2,at:'Hilalkent',pad:true}];
function helipadMark(g,x,y,z){
  const M=apMats(), pm=new THREE.MeshLambertMaterial({color:0x5c6166,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); pm.userData.flat=true;
  const pad=new THREE.Mesh(new THREE.CircleGeometry(16,32),pm); pad.rotation.x=-Math.PI/2; pad.position.set(x,y+0.12,z); g.add(pad);
  const ring=new THREE.Mesh(new THREE.RingGeometry(12,13,40),M.markY); ring.rotation.x=-Math.PI/2; ring.position.set(x,y+0.15,z); g.add(ring);
  apBox(g,M.mark,x-3,y+0.15,z,1.2,0.02,10); apBox(g,M.mark,x+3,y+0.15,z,1.2,0.02,10); apBox(g,M.mark,x,y+0.15,z,6,0.02,1.2);
  for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; apBox(g,M.amber,x+Math.cos(a)*15.5,y+0.1,z+Math.sin(a)*15.5,0.3,0.2,0.3); }
}
function buildHelis(){
  if(HELI.built) return; const pg=new THREE.Group();
  HELI_SPOTS.forEach(function(s){ const y=groundH(s.x,s.z); if(s.pad) helipadMark(pg,s.x,y,s.z);
    const m=heliBuild(s.id), H={id:s.id, m:m, D:m.def, at:s.at, home:[s.x,s.z,s.h], x:s.x, y:y, z:s.z, h:s.h, vx:0, vy:0, vz:0, yr:0, pitch:0, roll:0, rpm:0, rot:0, ground:true, crashT:0};
    scene.add(m.g); heliPlace(H); HELI.list.push(H); });
  if(pg.children.length) scene.add(bakeGroup(pg));
  clearTreesNear(HELI_SPOTS.map(function(s){ return [s.x,s.z]; }),24);
  HELI.built=true;
}
function heliPlace(H){
  const m=H.m; m.g.position.set(H.x,H.y,H.z); m.g.rotation.set(-H.pitch,H.h,-H.roll,'YXZ');
  m.rotor.rotation.y=H.rot; m.trot.rotation.x=H.rot*4.7;
  const blur=clamp((H.rpm-0.45)*1.6,0,1); m.disc.material.opacity=blur*0.22; m.disc.visible=blur>0.01; m.tdisc.visible=blur>0.01;
}
function heliBoxes(){ const L=[]; HELI.list.forEach(function(H){ if(H===HELI.cur||H.y-groundH(H.x,H.z)>2) return; const r=2.0, l=H.D.len*0.42;
  const s=Math.abs(Math.sin(H.h)), c=Math.abs(Math.cos(H.h)), ex=r*c+l*s, ez=l*c+r*s; L.push({x0:H.x-ex,x1:H.x+ex,z0:H.z-ez,z1:H.z+ez}); }); return L; }
function heliNear(p){ let best=null, bd=8; HELI.list.forEach(function(H){ if(H.crashT>0) return; const d=Math.hypot(H.x-p.x,H.z-p.z); if(d<bd){ bd=d; best=H; } }); return best; }
function heliBoard(H){
  HELI.cur=H; WALK.mode='heli'; WALK.cy=0; WALK.pitch=0; HELI.fp=false; H.ground=true; H.vx=H.vy=H.vz=0;
  toast(H.D.name+' — motorlar çalışıyor… R/Shift yüksel · F/Ctrl alçal · WASD cyclic · Q/E pedal · C kamera · G in','#b8ecff');
}
function heliExit(){
  const H=HELI.cur; if(!H) return;
  if(!H.ground||Math.hypot(H.vx,H.vz)>2){ toast('Önce iniş yap (yerde ve dururken G ile inebilirsin)','#ffc24a'); return; }
  HELI.cur=null; WALK.mode='foot'; const s=Math.sin(H.h), c=Math.cos(H.h), d=2.8;
  WALK.pos.set(H.x-c*d-s*1.5,0,H.z+s*d-c*1.5); WALK.pos.y=groundH(WALK.pos.x,WALK.pos.z)+1.7; WALK.yaw=H.h; WALK.pitch=0; WALK.air=false;
}
function heliFloor(H){
  let f=groundH(H.x,H.z), roof=false; const ob=AP.obst;
  for(let i=0;i<ob.length;i++){ const b=ob[i]; if(H.x>b.x0&&H.x<b.x1&&H.z>b.z0&&H.z<b.z1&&b.y1>f&&H.y>=b.y1-1.5&&!(b.y0!=null&&H.y<b.y0)){ f=b.y1; roof=true; } }
  return {y:Math.max(f,0), water:f<0.3&&!roof};
}
/* inside an obstacle (below its top)? push out horizontally */
function heliObst(H,px,pz){
  const ob=AP.obst, r=H.D.R*0.55;
  for(let i=0;i<ob.length;i++){ const b=ob[i]; if(H.y>=b.y1-1.5||(b.y0!=null&&H.y+3<b.y0)) continue;
    if(H.x>b.x0-r&&H.x<b.x1+r&&H.z>b.z0-r&&H.z<b.z1+r) return true; }
  return false;
}
function heliInput(){
  const t=WALK.tvis;
  return {f:clamp(act('heli','cycF')-act('heli','cycB')+(t?-WALK.sy:0),-1,1), r:clamp(act('heli','cycR')-act('heli','cycL')+(t?WALK.sx:0),-1,1),
    c:clamp(act('heli','collUp')-act('heli','collDn')+(WALK.tcoll||0),-1,1), y:clamp(act('heli','yawR')-act('heli','yawL')+(WALK.tyaw||0),-1,1)};
}
function heliStep(dt){
  const H=HELI.cur; if(!H) return; const D=H.D;
  if(H.crashT>0){ H.crashT-=dt; if(typeof updateParts==='function') updateParts(dt); if(H.crashT<=0) heliRespawn(H); return; }
  const inp=heliInput();
  H.rpm=Math.min(1,H.rpm+dt/(H.rpm<0.6?3.5:2.2)); H.rot+=dt*(4+H.rpm*24)*H.rpm;
  const F=heliFloor(H), sp=Math.hypot(H.vx,H.vz);
  if(H.ground){
    H.y=F.y; H.vx*=Math.exp(-dt*5); H.vz*=Math.exp(-dt*5); H.vy=0; H.pitch*=Math.exp(-dt*4); H.roll*=Math.exp(-dt*4);
    if(H.rpm>0.5) H.h-=inp.y*0.6*H.rpm*dt;
    if(H.rpm>0.95&&inp.c>0.15){ H.ground=false; H.vy=2; }
  } else {
    const tp=inp.f*0.34, tr=inp.r*0.42;
    H.pitch+=(tp-H.pitch)*Math.min(1,dt*2.6); H.roll+=(tr-H.roll)*Math.min(1,dt*2.6);
    const fx=-Math.sin(H.h), fz=-Math.cos(H.h), rx=Math.cos(H.h), rz=-Math.sin(H.h);
    H.vx+=(fx*H.pitch+rx*H.roll*0.85)*D.acc*dt; H.vz+=(fz*H.pitch+rz*H.roll*0.85)*D.acc*dt;
    const k=0.05+0.0019*sp*(30/D.top*1.4); H.vx*=Math.exp(-k*dt); H.vz*=Math.exp(-k*dt);
    let tvy=inp.c>0?inp.c*D.climb:inp.c*9; if(H.rpm<0.9) tvy=-5;
    const agl=H.y-F.y; if(agl<6&&tvy<0) tvy*=0.35+0.65*agl/6;          // ground cushion: gentle final descent
    H.vy+=(tvy-H.vy)*Math.min(1,dt*1.9);
    const tyr=inp.y*D.yawR+H.roll*Math.min(sp,60)*0.018; H.yr+=(tyr-H.yr)*Math.min(1,dt*3); H.h-=H.yr*dt;
    const ox=H.x, oz=H.z; H.x+=H.vx*dt; H.z+=H.vz*dt; H.y+=H.vy*dt;
    if(heliObst(H)){ H.x=ox; H.z=oz; const s2=Math.hypot(H.vx,H.vz); if(s2>18) return heliCrash(H,'Engele çarptın'); H.vx*=-0.3; H.vz*=-0.3; }
    if(Math.abs(H.x)>14500||Math.abs(H.z)>14500){ H.x=clamp(H.x,-14500,14500); H.z=clamp(H.z,-14500,14500); H.vx*=-0.3; H.vz*=-0.3; }
    if(H.y>3500){ H.y=3500; H.vy=Math.min(H.vy,0); }
    const F2=heliFloor(H);
    if(H.y<=F2.y){ const imp=-H.vy, s3=Math.hypot(H.vx,H.vz), tilt=Math.abs(H.pitch)+Math.abs(H.roll);
      if(F2.water) return heliCrash(H,'Suya düştün');
      if(imp>7||s3>22||tilt>0.6) return heliCrash(H,imp>7?'Çok sert indin':'Yere çarptın');
      H.y=F2.y; H.ground=true; H.vy=0; H.yr=0; if(imp>3.5) toast('Sert iniş!','#ffc24a'); else toast('İniş tamam','#7dffb0'); }
  }
  heliPlace(H);
}
function heliCrash(H,why){
  explode(new THREE.Vector3(H.x,H.y+1.5,H.z),40,6); H.crashT=2.6; H.m.g.visible=false; H.vx=H.vy=H.vz=0; toast('💥 '+why,'#ff6a5a');
}
function heliRespawn(H){
  H.x=H.home[0]; H.z=H.home[1]; H.h=H.home[2]; H.y=groundH(H.x,H.z); H.pitch=H.roll=H.yr=0; H.rpm=0; H.ground=true; H.m.g.visible=true; heliPlace(H);
  HELI.cur=null; WALK.mode='foot'; const s=Math.sin(H.h), c=Math.cos(H.h);
  WALK.pos.set(H.x-c*9,0,H.z+s*9); WALK.pos.y=groundH(WALK.pos.x,WALK.pos.z)+1.7; WALK.yaw=H.h-Math.PI/2; WALK.air=false;
  toast('Helikopter '+H.at+' pistine geri getirildi','#b8ecff');
}
/* parked helicopters wind down; rotors keep turning a little after landing */
function helisIdle(dt){ HELI.list.forEach(function(H){ if(H===HELI.cur&&state==='walk') return; if(H.rpm>0){ H.rpm=Math.max(0,H.rpm-dt/9); H.rot+=dt*(4+H.rpm*24)*H.rpm; heliPlace(H); } }); }
function heliTeleport(p){
  const H=HELI.cur, gx=p.g?p.g[0]:p.x, gz=p.g?p.g[1]:p.z;
  H.x=gx; H.z=gz+60; H.y=Math.max(groundH(H.x,H.z),0)+70; H.vx=H.vz=H.vy=0; H.ground=false; H.rpm=1; heliPlace(H);
}
const hV=new THREE.Vector3(), hV2=new THREE.Vector3(), hE=new THREE.Euler(0,0,0,'YXZ');
function heliCam(dt){
  const H=HELI.cur, sp=Math.hypot(H.vx,H.vz);
  const fov=65+clamp((sp-20)*0.15,0,10); if(Math.abs(lastFov-fov)>0.05){ camera.fov=fov; lastFov=fov; camera.updateProjectionMatrix(); }
  if(HELI.fp){ const s=Math.sin(H.h), c=Math.cos(H.h), lz=H.id==='t129'?-1.9:-2.7, ly=H.id==='t129'?2.45:2.05, lx=H.id==='t129'?0:0.45;
    camera.position.set(H.x+lx*c+lz*s, H.y+ly, H.z-lx*s+lz*c); hE.set(H.pitch*-0.9+WALK.pitch-0.12,H.h+WALK.cy,-H.roll*0.9); camera.quaternion.setFromEuler(hE); camera.updateMatrixWorld(); return; }
  const a=H.h+WALK.cy, D=(19+sp*0.08)*WALK.camD;
  hV.set(H.x+Math.sin(a)*D, H.y+5.5+D*0.18+WALK.pitch*-8, H.z+Math.cos(a)*D);
  const gc=Math.max(groundH(hV.x,hV.z),0)+1.5; if(hV.y<gc) hV.y=gc;
  if(dt>0&&camera.position.distanceTo(hV)<80) camera.position.lerp(hV,1-Math.exp(-dt*5)); else camera.position.copy(hV);
  camera.lookAt(hV2.set(H.x,H.y+2.5,H.z)); camera.updateMatrixWorld();
}
function heliHUD(w,h,s){
  const H=HELI.cur, F=heliFloor(H), sp=Math.hypot(H.vx,H.vz), L=WALK.tvis?w/2:Math.round(16*s), top=Math.round(20*s);
  hx.textAlign=WALK.tvis?'center':'left'; hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#b8ecff';
  hx.fillText(H.D.name+(H.ground?' · YERDE':' · UÇUŞTA'), L, top);
  hx.font='700 '+Math.round(26*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#fff'; hx.fillText(Math.round(sp*3.6)+' km/sa', L, top+Math.round(28*s));
  hx.font='700 '+Math.round(14*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#b8ecff';
  hx.fillText('İRT '+Math.round(H.y-F.y)+' m  ·  DİKEY '+(H.vy>=0?'+':'')+H.vy.toFixed(1)+' m/s  ·  ROTOR %'+Math.round(H.rpm*100), L, top+Math.round(52*s));
  if(H.rpm<0.95&&H.ground){ hx.textAlign='center'; hx.fillStyle='#ffc24a'; hx.fillText('MOTORLAR ISINIYOR… %'+Math.round(H.rpm*100), w/2, h*0.3); }
  else if(H.ground&&H.rpm>=0.95&&WALK.hint>0){ hx.textAlign='center'; hx.fillStyle='#7dffb0'; hx.fillText(WALK.tvis?'YÜKSEL ile kalk':'R ya da Shift ile kalk', w/2, h*0.3); }
  if(!H.ground&&H.y-F.y<25&&H.vy<-4){ hx.textAlign='center'; hx.fillStyle='#ff6a5a'; hx.fillText('ALÇALMA HIZI YÜKSEK', w/2, h*0.36); }
}
function heliAudio(t,on){
  if(!AC) return;
  if(!HELI.snd){ try{ const src=AC.createBufferSource(); src.buffer=noiseBuf; src.loop=true; const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=500;
      const g=AC.createGain(); g.gain.value=0; const am=AC.createGain(); am.gain.value=0; const lfo=AC.createOscillator(); lfo.type='sine'; lfo.frequency.value=18; const lg=AC.createGain(); lg.gain.value=0;
      src.connect(lp); lp.connect(am); am.connect(g); lfo.connect(lg); lg.connect(am.gain); g.connect(sndOut('sfx')); src.start(); lfo.start(); HELI.snd={g:g,lp:lp,lfo:lfo,lg:lg,am:am}; }catch(e){ HELI.snd={g:null}; } }
  const S2=HELI.snd; if(!S2.g) return; const H=HELI.cur, r=H?H.rpm:0, live=on&&H&&H.crashT<=0;
  const file=sndLoop('rotor',live?0.3+r*0.6:0,0.4+r*0.7);
  S2.g.gain.setTargetAtTime(live&&!file?(0.15+r*0.55)*sndVol('rotor'):0,t,0.15); S2.am.gain.setTargetAtTime(0.55,t,0.1); S2.lg.gain.setTargetAtTime(0.45*r,t,0.1);
  S2.lfo.frequency.setTargetAtTime((4+r*15+(H&&!H.ground?Math.abs(H.vy)*0.3:0))*sndPitch('rotor'),t,0.2); S2.lp.frequency.setTargetAtTime(300+r*500,t,0.2);
}
