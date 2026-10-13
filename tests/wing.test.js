let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
function sim(sec,dt,fn){ dt=dt||0.05; for(let t=0;t<sec;t+=dt){ update(dt); actorsStep(dt); netHostLogic(dt); if(fn) fn(t); } }
playMode('quick'); SETTINGS.ai={enemies:0,wing:true,skill:1}; missionId='free'; selectedId='kaan'; setAircraft('kaan'); startGame('air'); S.pos.set(0,1500,6000); S.onGround=false; S.speed=200;
sim(2); const W=wingActor(); T_('wing spawned',!!W);
wingCmd('form'); T_('order set',W.cmd==='form');
sim(30); fwdOf(S.q,aV2); aV1.set(1,0,0).applyQuaternion(S.q); const slot=S.pos.clone().addScaledVector(aV1,22).addScaledVector(aV2,-16); const d=W.pos.distanceTo(slot);
T_('tight formation (<120 m from slot)',d<120,d.toFixed(0));
const e=spawnEnemy(1); e.pos.set(S.pos.x,1500,S.pos.z-3000); wingCmd('attack'); T_('attack target set',W.tgt===e&&W.cmd==='attack');
wingCmd('rtb'); T_('rtb',W.cmd==='rtb'&&!W.tgt); W.pos.set(100,AIRFIELD_Y+500,100); sim(1); T_('landed at base',!W.alive);
console.log('pass',ok,'fail',bad);
