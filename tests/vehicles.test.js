let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode("quick");
AC_ORDER.forEach(function(id){ displays[id].ox=0; displays[id].oz=0; displays[id].len=12; });
enterHangar(); startWalk(); T('fleet built',VEHS.length>=VEH_SPOTS.length,VEHS.length);
T('every kind builds',CAR_KINDS.every(function(k){ const m=carBuild(k.id); return m&&m.g&&m.wb>0; }));
const tank=VEHS.find(function(c){ return c.K.id==='altay'; }); WALK.pos.set(tank.x+3,groundH(tank.x,tank.z)+1.7,tank.z); walkUpdate(0.016);
T('near tank',WALK.near==='car'&&WALK.nearCar===tank); walkInteract(); T('boarded tank',WALK.mode==='car'&&WALK.car===tank);
const h0=tank.h; keys.KeyD=true; for(let i=0;i<20;i++) walkUpdate(0.05); keys.KeyD=false; T('tank turns on the spot',Math.abs(tank.h-h0)>0.4&&Math.abs(tank.v)<0.5,tank.h-h0);
keys.KeyW=true; for(let i=0;i<200;i++) walkUpdate(0.05); keys.KeyW=false; T('tank top speed ~70 km/h',tank.v*3.6>50&&tank.v*3.6<75,tank.v*3.6);
WALK.cy=0.8; for(let i=0;i<30;i++) walkUpdate(0.05); T('turret follows aim',Math.abs(tank.ty-0.8)<0.05,tank.ty);
const n0=VFX.shells.length; vehFire(); T('cannon fires',VFX.shells.length===n0+1); vehFire(); T('reload time',VFX.shells.length===n0+1);
for(let i=0;i<200;i++) vehWeaponsStep(0.05); T('shell lands',VFX.shells.length===n0);
walkInteract(); T('out of tank',WALK.mode==='foot');
/* tug tows the jet */
const tug=VEHS.find(function(c){ return c.K.id==='tug'; }); WALK.car=tug; WALK.mode='car'; tug.h=TOW.h; const s=Math.sin(tug.h), co=Math.cos(tug.h);
const nx=TOW.x-Math.sin(TOW.h)*TOW.L, nz=TOW.z-Math.cos(TOW.h)*TOW.L, b=(tug.m.len||4.2)/2+0.4; tug.x=nx-s*b; tug.z=nz-co*b; placeCar(0);
vehFire(); T('jet hitched',TOW.on); const tx=TOW.x; tug.h=0; for(let i=0;i<40;i++){ tug.v=4; walkUpdate(0.05); vehWeaponsStep(0.05); } T('jet towed',Math.hypot(TOW.x-tx,0)>0.5||TOW.z!==0,TOW.x+','+TOW.z); vehFire(); T('jet released',!TOW.on);
/* water */
const fire=VEHS.find(function(c){ return c.K.id==='fire'; }); WALK.car=fire; vehFire(); vehWeaponsStep(0.05); T('water spray',!!VFX.water);
T('swap only cars',(WALK.car=tank,carSwap(),tank.K.id==='altay'));
console.log('pass',ok,'fail',bad);
