let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
function key(code){ (listeners.keydown||[]).forEach(f=>f({code,key:code,preventDefault(){},repeat:false,target:{tagName:'X'}})); }
function sim(sec,dt){ dt=dt||0.05; for(let t=0;t<sec;t+=dt) update(dt); }
T('version',/^V\d+\.\d{2}$/.test(GAME_VERSION),GAME_VERSION);
// 1. weapon digits
SETTINGS.lockOn=true;
LOADOUTS[selectedId]={gp:4,bnk:0,m1:4,m2:0,m3:0}; applyLoadout(selectedId);
startGame('air');
T('state play',state==='play');
T('INV',INV.gp===4&&INV.m1===4,JSON.stringify(INV));
selW='gp'; pickWeaponByNumber(2); T('2->m1',selW==='m1',selW);
pickWeaponByNumber(1); T('1->gp',selW==='gp',selW);
pickWeaponByNumber(3); T('3 none keeps',selW==='gp',selW);
key('Digit2'); T('key Digit2->m1',selW==='m1',selW);
// full 5 loadout
LOADOUTS[selectedId]={gp:1,bnk:1,m1:1,m2:1,m3:1}; applyLoadout(selectedId);
for(let n=1;n<=5;n++){ pickWeaponByNumber(n); T('n'+n,selW===WORDER[n-1],selW); }
// 2. lock toggle
key('KeyK'); T('lock off',SETTINGS.lockOn===false);
updateLock(0.1); T('no lockTgt',lockTgt===null);
key('KeyK'); T('lock on',SETTINGS.lockOn===true);
// 3. safe zone
function samTest(px,pz,expectHit){
  resetFlight('air'); S.pos.set(px,900,pz); S.speed=CUR.airV; S.throttle=0.7; S.hp=100; clearThreats();
  const o={pos:new THREE.Vector3(px+2500,40,pz),alive:true,cd:0,lockT:0}; 
  T('launch',launchSam(o)); let hit=false, killed=false;
  for(let t=0;t<18;t+=0.05){ S.pos.z-=0; update(0.05); if(S.hp<100||S.crashed) hit=true; }
  return hit;
}
const hitIn=samTest(0,400,false); T('in safe zone no hit',!hitIn);
const hitOut=samTest(9000,9000,true); T('outside zone hit',hitOut);
// landing-ish slow approach inside zone
resetFlight('air'); S.pos.set(0,300,3000); S.speed=CUR.airV*0.6; clearThreats();
const o2={pos:new THREE.Vector3(800,40,3500),alive:true,cd:0,lockT:0}; launchSam(o2);
let hp2=true; for(let t=0;t<18;t+=0.05){ update(0.05); if(S.hp<100||S.crashed) hp2=false; }
T('slow approach safe',hp2, S.hp);
// 4. hangar collision
const ids=Object.keys(AIRCRAFT);
for(const id of ids){
  selectedId=id; setAircraft(id); activeId=id;
  for(const off of [-14,-6,0,7,15]) for(const yawOff of [-0.25,0,0.2]){
    resetFlight('runway'); state='play'; S.taxi=false; S.clearance=true;
    S.pos.set(-40,AIRFIELD_Y+CUR.gearOff,SERVICE.zc+off);
    S.q.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2+yawOff);
    S.speed=0; let overlapEver=false, minx=0, opened=false;
    S.throttle=0.0;
    for(let t=0;t<90;t+=0.05){
      // gentle steering toward lane centre
      const lim=S.pos.x<-150?0:(S.speed<6?1:0); keys.KeyR=lim>0&&S.speed<6; keys.KeyB=S.pos.x<-140; keys.KeyF=S.speed>=8||S.pos.x<-150;
      const zerr=S.pos.z-SERVICE.zc; keys.KeyA=false; keys.KeyD=false;
      update(0.05); if(wallOverlap()) overlapEver=true; minx=Math.min(minx,S.pos.x);
      if(state==='service'){ opened=true; break; }
    }
    keys.KeyR=keys.KeyF=false;
    T(id+' off'+off+' yaw'+yawOff+' no overlap',!overlapEver);
    if(yawOff===0&&off===0) T(id+' reaches service',opened,'minx='+minx.toFixed(1));
    if(state==='service'){ closeService(false); }
  }
}
// 5. loadout screen in menu
startGame; state='menu'; menuMode='hangar'; selectedId='kaan'; 
openLoadout(); T('modal loadout mode',svcMode==='loadout'&&state==='menu');
svcTmp={gp:2,bnk:0,m1:2,m2:0,m3:0}; closeService(true);
T('saved',LOADOUTS.kaan.gp===2&&LOADOUTS.kaan.m1===2); T('state stays menu',state==='menu',state);
T('persist',!!store['kaan-sim-loadouts']);
console.log('pass',ok,'fail',bad);
