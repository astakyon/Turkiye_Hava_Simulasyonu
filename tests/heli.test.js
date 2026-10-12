let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode("quick");
T('helis built',HELI.list.length===7&&HELI.list.every(function(H){ return H.m&&H.m.rotor; }));
T('both types',HELI.list.some(function(H){ return H.id==='t129'; })&&HELI.list.some(function(H){ return H.id==='t625'; }));
HELI.list.forEach(function(H){ T('on ground '+H.at,Math.abs(H.y-groundH(H.x,H.z))<0.01&&groundH(H.x,H.z)>1,H.y); });
AC_ORDER.forEach(function(id){ displays[id].ox=0; displays[id].oz=0; displays[id].len=12; });
enterHangar(); startWalk();
const H=HELI.list[0]; WALK.pos.set(H.x+5,groundH(H.x,H.z)+1.7,H.z+3); walkUpdate(0.016); T('near heli',WALK.near==='heli'&&WALK.nearHeli===H,WALK.near);
walkInteract(); T('boarded heli',WALK.mode==='heli'&&HELI.cur===H);
keys.KeyR=true; for(let i=0;i<40;i++) walkUpdate(0.05); T('cannot lift while spooling',H.ground,H.rpm);
for(let i=0;i<120;i++) walkUpdate(0.05); T('lifts off after spool-up',!H.ground&&H.y-groundH(H.x,H.z)>20,H.y);
keys.KeyR=false; const y0=H.y; for(let i=0;i<60;i++) walkUpdate(0.05); T('hover holds height',Math.abs(H.y-y0)<9,H.y-y0);
const x0=H.x, z0=H.z; keys.KeyW=true; for(let i=0;i<500;i++) walkUpdate(0.05); keys.KeyW=false; const sp=Math.hypot(H.vx,H.vz);
T('flies forward',Math.hypot(H.x-x0,H.z-z0)>300,Math.hypot(H.x-x0,H.z-z0)); T('top speed ~250-290 km/h',sp*3.6>230&&sp*3.6<300,sp*3.6);
const h0=H.h; keys.KeyE=true; for(let i=0;i<20;i++) walkUpdate(0.05); keys.KeyE=false; T('pedal turns right',H.h<h0-0.5,H.h-h0);
heliExit(); T('cannot exit in the air',WALK.mode==='heli');
for(let i=0;i<120;i++) walkUpdate(0.05); keys.KeyF=true; for(let i=0;i<600&&!H.ground;i++) walkUpdate(0.05); keys.KeyF=false;
T('lands with collective down',H.ground&&H.crashT<=0,H.y+' '+H.crashT);
for(let i=0;i<40;i++) walkUpdate(0.05); heliExit(); T('exit on ground',WALK.mode==='foot'&&!HELI.cur);
// crash: dive into the ground fast
heliBoard(H); H.rpm=1; H.ground=false; H.y=groundH(H.x,H.z)+0.5; H.vy=-12; H.vx=30; keys.KeyF=true; for(let i=0;i<40&&H.crashT<=0;i++) walkUpdate(0.05); keys.KeyF=false;
T('hard impact crashes',H.crashT>0); for(let i=0;i<80;i++) walkUpdate(0.05); T('respawn at home',WALK.mode==='foot'&&H.ground&&Math.hypot(H.x-H.home[0],H.z-H.home[1])<1);
// teleport while flying
heliBoard(H); H.rpm=1; keys.KeyR=true; for(let i=0;i<30;i++) walkUpdate(0.05); keys.KeyR=false; MAPV.from='walk'; teleportTo(placeById('kale')); T('heli teleport',Math.hypot(HELI.cur.x-9310,HELI.cur.z-8105)<5&&!HELI.cur.ground,HELI.cur.x+','+HELI.cur.z);
T('map pos heli',playerPos()[0]===HELI.cur.x);
startWalk(); T('restart walk resets heli',!HELI.cur&&WALK.mode==='foot'&&H.ground);
T('heli controls in scheme',CTRL_DEF.heli.acts.length>=10&&ctrlConflicts('kb','heli')&&Object.keys(ctrlConflicts('kb','heli')).length===0,JSON.stringify(ctrlConflicts('kb','heli')));
console.log('pass',ok,'fail',bad);
