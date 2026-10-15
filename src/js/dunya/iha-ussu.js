/* ------------------------------------------------------------------ AY YILDIZ UAV & test centre on the south-east island (pad 'uav'):
   1.8 km runway with markings and edge lights, apron with TB2/TB3/Akıncı/Kızılelma on display, UAV hangars, ground control
   stations with satellite dishes, a control tower, a missile test pad with a rocket on its rail, telemetry dishes;
   an Akıncı orbits the island. */
const UAV={x0:10900,x1:11800,z0:10150,z1:12650,y:45, rw:{x:11150,z0:10500,z1:12300,w:30}, orbit:null, orbitT:0, dishes:[], built:false};
function dish(g,M,x,y,z,r,tilt){ const d=new THREE.Group(); d.position.set(x,y,z); g.add(d); apCyl(d,M.metal,0,0,0,0.25,0.35,r*1.2,8);
  const b=new THREE.Mesh(new THREE.SphereGeometry(r,18,8,0,Math.PI*2,0,Math.PI*0.32),new THREE.MeshLambertMaterial({color:0xf2f2ee,side:THREE.DoubleSide})); b.rotation.x=-Math.PI/2+(tilt||0.6); b.position.y=r*1.25; d.add(b);
  apCyl(d,M.metal,0,r*1.25,0,0.06,0.06,r*0.9,6).rotation.x=-Math.PI/2+(tilt||0.6); return d; }
function buildUAV(){
  const M=apMats(), U=UAV, Y=U.y, R=U.rw, g=new THREE.Group(), r=mulberry32(2014);
  /* ---- runway */
  const len=R.z1-R.z0, rt=apTex(64,512,function(x,w,h){ x.fillStyle='#45494e'; x.fillRect(0,0,w,h); x.fillStyle='#e8e8e0'; for(let y=0;y<h;y+=16) x.fillRect(w/2-1,y,2,8); x.fillRect(1,0,1.5,h); x.fillRect(w-2.5,0,1.5,h); });
  const rm=new THREE.MeshLambertMaterial({map:rt,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); rm.userData.flat=true; rt.wrapT=THREE.RepeatWrapping; rt.repeat.set(1,len/400);
  apRect(g,rm,R.x-R.w/2,R.x+R.w/2,R.z0,R.z1,Y+0.08);
  apRect(g,M.shoulder,R.x-R.w/2-6,R.x+R.w/2+6,R.z0-60,R.z1+60,Y+0.05);
  [R.z0+12,R.z1-12].forEach(function(z,i){ for(let k=-5;k<=5;k++) if(k) apBox(g,M.mark,R.x+k*2.4,Y+0.1,z,1.2,0.02,22);
    const n=new THREE.Mesh(new THREE.PlaneGeometry(12,14),new THREE.MeshLambertMaterial({map:signTex(i?'36':'18','rgba(0,0,0,0)','#e8e8e0',256,256,'bold 200px Arial'),transparent:true,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    n.rotation.x=-Math.PI/2; n.rotation.z=i?0:Math.PI; n.position.set(R.x,Y+0.11,z+(i?-34:34)); g.add(n); });
  for(let z=R.z0;z<=R.z1;z+=60){ [-1,1].forEach(function(s){ apBox(g,(z===R.z0||z>=R.z1-1)?(z===R.z0?M.redL:M.redL):M.lamp,R.x+s*(R.w/2+1.5),Y+0.1,z,0.5,0.4,0.5); }); }
  for(let k=-6;k<=6;k++){ apBox(g,M.redL,R.x+k*2.5,Y+0.1,R.z0-4,0.5,0.4,0.5); apBox(g,M.redL,R.x+k*2.5,Y+0.1,R.z1+4,0.5,0.4,0.5); }
  /* taxiway and apron */
  const ap=new THREE.MeshLambertMaterial({color:0x6a6e73,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); ap.userData.flat=true;
  apRect(g,ap,R.x+R.w/2+6,11600,11250,11550,Y+0.06); apRect(g,ap,R.x+R.w/2,R.x+R.w/2+80,11380,11420,Y+0.07);
  for(let z=11270;z<11540;z+=45) apBox(g,M.markY,11450,Y+0.08,z,60,0.02,0.25);
  /* hangars, tower, operations, ground control stations */
  [11280,11360,11440,11520].forEach(function(z,i){ shed(g,11680,Y,z,40,30,10,[0xd8dde2,0xc9d0d6,0xd8dde2,0xc9d0d6][i]); });
  bldg(g,11700,Y,11180,30,8,16,{floors:2,wall:'#e8eaec'});
  { const s=new THREE.Mesh(new THREE.PlaneGeometry(26,2.6),new THREE.MeshLambertMaterial({map:signTex('AY YILDIZ İHA VE TEST MERKEZİ','#1d3557','#ffffff',1024,104)})); s.position.set(11684.9,Y+10,11180); s.rotation.y=-Math.PI/2; g.add(s); }
  { const tx=11620, tz=11650; apCyl(g,M.conc,tx,Y,tz,3,3.6,22,12); apCyl(g,M.glass,tx,Y+22,tz,4.6,4.2,3.4,12); apCyl(g,M.roof,tx,Y+25.4,tz,4.9,4.9,0.6,12); apCyl(g,M.metal,tx,Y+26,tz,0.1,0.1,5,6); navObst(tx-5,tx+5,tz-5,tz+5,Y+31); }
  for(let k=0;k<4;k++){ const x=11520+k*22, z=11700; apBox(g,M.white,x,Y,z,12,3,3); apBox(g,M.white,x,Y+3,z,12.4,0.2,3.4); U.dishes.push(dish(g,M,x,Y+3.2,z+4,2.2,0.7)); apCyl(g,M.metal,x+5,Y+3,z-1,0.05,0.05,9,6); }
  U.dishes.push(dish(g,M,11740,Y,11800,7,0.9)); U.dishes.push(dish(g,M,11500,Y,11850,5,0.8));
  /* missile test pad at the south end, aiming out to sea */
  { const px=11400, pz=12520, y=Y; apRect(g,new THREE.MeshLambertMaterial({color:0x9a9ea2}),px-30,px+30,pz-30,pz+30,y+0.06);
    apBox(g,M.conc,px-24,y,pz,10,6,14); apBox(g,M.yel,px-24,y+6,pz,10.4,0.3,14.4);
    const rail=new THREE.Group(); rail.position.set(px,y,pz); g.add(rail); apBox(rail,M.metal,0,0,0,3,2,3);
    const arm=new THREE.Group(); arm.position.y=2; arm.rotation.x=0.95; rail.add(arm); apBox(arm,M.metal,0,0,0,0.8,0.6,14);
    const rk=new THREE.Mesh(MK.cyl(0.35,0.35,9,12),M.white); rk.position.set(0,0.8,-1); arm.add(rk); const nose=new THREE.Mesh(new THREE.ConeGeometry(0.35,1.6,12),M.white); nose.rotation.x=-Math.PI/2; nose.position.set(0,0.8,-6.3); arm.add(nose);
    [0,1,2,3].forEach(function(k){ const f=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.8,1.2),M.red); f.position.set(Math.cos(k*Math.PI/2)*0.5,0.8+Math.sin(k*Math.PI/2)*0.5,3); f.rotation.z=k*Math.PI/2; arm.add(f); });
    rail.rotation.y=Math.PI;
    const gantry=[[px+12,pz-8],[px+12,pz+8]]; gantry.forEach(function(p){ beam(g,M.red,[p[0],y,p[1]],[p[0],y+18,p[1]],0.35); }); apBox(g,M.red,px+12,y+18,pz,1,1,17);
    dish(g,M,px+40,y,pz-20,4,0.5); dish(g,M,px-40,y,pz+20,4,0.5);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(10,1.6),new THREE.MeshLambertMaterial({map:signTex('FÜZE TEST ALANI — DİKKAT','#c01818','#ffffff',1024,128),side:THREE.DoubleSide})); sg.position.set(px,y+2.4,pz-34); g.add(sg); }
  /* fence */
  fenceLine([[U.x0+5,U.z0+5],[U.x1-5,U.z0+5],[U.x1-5,U.z1-5],[U.x0+5,U.z1-5],[U.x0+5,U.z0+5]],function(){ return false; });
  bakeInto(g);
  /* UAVs on the apron (real models, so liveries and imported models apply) */
  [['tb2',11420,11300],['tb3',11420,11360],['akinci',11420,11440],['kizilelma',11420,11510],['anka',11530,11300]].forEach(function(a){ try{ const m=buildModel(a[0]); const def=AIRCRAFT[a[0]]||{};
    if(m.flames) m.flames.forEach(function(f){ f.visible=false; }); m.group.position.set(a[1],Y+(def.gearOff||1.2),a[2]); m.group.rotation.y=-Math.PI/2; scene.add(m.group); }catch(e){} });
  /* an Akıncı orbiting the island */
  try{ const m=buildModel('akinci'); if(m.flames) m.flames.forEach(function(f){ f.visible=false; }); if(m.gear) m.gear.visible=false; scene.add(m.group); U.orbit=m; }catch(e){}
  const pts=[]; for(let x=U.x0;x<=U.x1;x+=25) for(let z=U.z0;z<=U.z1;z+=25) pts.push([x,z]); clearTreesNear(pts,14);
  U.built=true;
}
function uavStep(dt){
  const U=UAV; if(!U.built) return;
  U.dishes.forEach(function(d,i){ d.rotation.y=Math.sin(T*0.1+i)*0.8; });
  const o=U.orbit; if(o){ U.orbitT+=dt*45/2400; const a=U.orbitT*Math.PI*2, cx=12100, cz=11400, R=2400/(Math.PI*2)*2.6;
    o.group.position.set(cx+Math.cos(a)*R,820,cz+Math.sin(a)*R); o.group.rotation.set(0,Math.PI-a,0); o.group.rotateZ(0.3);
    if(o.spinners) o.spinners.forEach(function(s){ if(s.obj) s.obj.rotation.z+=dt*40; }); }
}
