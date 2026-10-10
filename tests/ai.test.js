let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
function sim(sec,dt,fn){ dt=dt||0.05; for(let t=0;t<sec;t+=dt){ update(dt); actorsStep(dt); netHostLogic(dt); if(fn) fn(t); } }
const finite=v=>isFinite(v.x)&&isFinite(v.y)&&isFinite(v.z);
// --- 1. dogfight waves, enemies attack a player outside the base zone
SETTINGS.ai={enemies:2,wing:false,skill:1};
selectedId='kaan'; setAircraft('kaan'); missionId='dogfight'; startGame('air');
S.pos.set(7000,1500,7000); S.q.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI*0.75);
let minD=1e9, hpMin=100, okPos=true, sawMsl=false;
sim(160,0.05,function(){ ACT.forEach(a=>{ if(a.alive){ minD=Math.min(minD,a.pos.distanceTo(S.pos)); if(!finite(a.pos)) okPos=false; if(a.pos.y<Math.max(0,terrainH(a.pos.x,a.pos.z))) okPos=false; } }); hpMin=Math.min(hpMin,S.hp); if(missiles.some(m=>m.on&&m.by)) sawMsl=true; if(S.crashed){ S.hp=100; } });
T('wave1 spawned',DF.wave>=1,DF.wave); T('enemies approached',minD<5500,minD.toFixed(0)); T('ai positions sane',okPos);
T('player took fire',hpMin<100||sawMsl,'hpMin '+hpMin+' msl '+sawMsl);
console.log('  dogfight: minD',minD.toFixed(0),'hpMin',hpMin,'sawMsl',sawMsl);
// kill waves by hand
for(let w=0;w<5&&!M.done;w++){ ACT.filter(a=>a.team==='red'&&a.alive).forEach(a=>damageActor(a,999,NET.myId)); sim(8,0.1); }
T('dogfight completes',M.done&&state==='mend',DF.wave+' '+M.done+' '+state);
// --- 2. wingman
$('missionEnd').classList.add('hidden');
SETTINGS.ai={enemies:0,wing:true,skill:1}; missionId='free'; startGame('air');
sim(1,0.05); T('wing spawned',ACT.some(a=>a.wing),ACT.length);
const w=ACT.find(a=>a.wing); let farW=0;
sim(40,0.05,function(t){ if(t>15) farW=Math.max(farW,w.pos.distanceTo(S.pos)); });
T('wing keeps formation',farW<700,farW.toFixed(0));
console.log('  wing max dist after 15s',farW.toFixed(0));
// wing engages an enemy near the player
S.pos.set(6000,1500,6000);
const e=spawnEnemy(1); e.pos.set(6000,1500,4800); placeActor(e,e.pos,new THREE.Vector3(0,0,1));
let wingT=null; sim(40,0.05,function(){ if(w.tgt===e&&wingT==null) wingT=1; });
T('wing targets enemy',wingT===1);
console.log('  enemy alive after 40s with wingman:',e.alive,'hp',e.hp);
// --- 3. player missile lock on enemy actor
aiClear(); SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); S.pos.set(6000,1500,6000); S.q.identity(); S.throttle=0.8;
LOADOUTS.kaan={gp:0,bnk:0,m1:4,m2:0,m3:0}; applyLoadout('kaan'); selW='m1';
const e2=spawnEnemy(2); placeActor(e2,new THREE.Vector3(6000,1500,3500),new THREE.Vector3(0,0,-1));
updateLock(0.1); sim(1.0,0.05);
T('lock on actor',lockTgt===e2,lockTgt&&lockTgt.name);
const before=INV.m1; launchMissile(); T('missile launched',INV.m1===before-1);
let hitOrDecoy=false; sim(12,0.05,function(){ if(!e2.alive||e2.hp<100) hitOrDecoy='hit'; });
console.log('  missile result:',hitOrDecoy||('decoyed/flares '+e2.flares));
T('missile resolved',hitOrDecoy==='hit'||e2.flares<6);
// --- 4. gun kill of actor
const e3=spawnEnemy(3); placeActor(e3,new THREE.Vector3(S.pos.x,S.pos.y,S.pos.z-400),new THREE.Vector3(0,0,-1)); e3.speed=S.speed; 
fwdOf(S.q,vF); for(let i=0;i<40;i++){ e3.pos.copy(S.pos).addScaledVector(vF,300); fire(); update(0.05); }
T('guns damage actor',e3.hp<100||!e3.alive,e3.hp);
console.log('pass',ok,'fail',bad);
