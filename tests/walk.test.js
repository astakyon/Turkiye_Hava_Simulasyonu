let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
AC_ORDER.forEach(function(id){ displays[id].ox=0; displays[id].oz=0; displays[id].len=12; }); // stub Box3 has no real bounds
enterHangar(); startWalk();
T('walk state',state==='walk'&&WALK.mode==='foot');
T('own aircraft visible while walking',displays[selectedId].g.visible!==false);
// walk into the west wall of the hall: must stay inside
WALK.pos.set(HG.X0+3,AIRFIELD_Y+1.7,930); WALK.yaw=Math.PI/2; keys.KeyW=true; for(let i=0;i<80;i++) walkUpdate(0.05); keys.KeyW=false;
T('west wall blocks walker',WALK.pos.x>HG.X0,WALK.pos.x);
// walk out of the hall door to the north
WALK.pos.set(-300,AIRFIELD_Y+1.7,880); WALK.yaw=0; keys.KeyW=true; for(let i=0;i<200;i++) walkUpdate(0.05); keys.KeyW=false;
T('walk out through the door',WALK.pos.z<850,WALK.pos.z);
// car: get in, drive, crash into the back wall, get out
WALK.pos.set(WALK.car.x+1.5,AIRFIELD_Y+1.7,WALK.car.z+2); walkUpdate(0.016); T('near car',WALK.near==='car',WALK.near);
walkInteract(); T('in car',WALK.mode==='car');
const z0=WALK.car.z; keys.KeyW=true; for(let i=0;i<60;i++) walkUpdate(0.05); keys.KeyW=false; T('car drives forward',WALK.car.z<z0-10&&WALK.car.v>5,WALK.car.z+' v '+WALK.car.v);
WALK.car.x=-300; WALK.car.z=940; WALK.car.h=Math.PI; WALK.car.v=20; for(let i=0;i<60;i++) walkUpdate(0.05); T('back wall stops car',WALK.car.z<958,WALK.car.z);
keys.KeyD=true; WALK.car.x=-300; WALK.car.z=700; WALK.car.h=0; WALK.car.v=10; const h0=WALK.car.h; for(let i=0;i<20;i++) walkUpdate(0.05); keys.KeyD=false; fwdOf; T('D turns right',WALK.car.h<h0-0.2,WALK.car.h);
walkInteract(); T('out of car',WALK.mode==='foot'&&Math.hypot(WALK.pos.x-WALK.car.x,WALK.pos.z-WALK.car.z)<4);
// board an aircraft
const d=displays.kaan; WALK.pos.set(d.x+4,AIRFIELD_Y+1.7,HANGAR.z-5); updateHangar(0); walkUpdate(0.016); T('near plane',WALK.near==='plane'&&WALK.nearId==='kaan',WALK.near+' '+WALK.nearId);
walkInteract(); T('boarded',state==='play'&&activeId==='kaan'&&startMode==='hangar'&&S.onGround);
// pause from walk returns to walk
startWalk(); pauseGame(); T('paused',state==='paused'); resumeGame(); T('resumed walk',state==='walk');
console.log('pass',ok,'fail',bad);
