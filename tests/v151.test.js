let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
// landing on the UAV centre runway
selectedId='tb2'; setAircraft('tb2'); missionId='free'; startGame('air'); aiClear();
S.pos.set(UAV.rw.x,UAV.y+CUR.gearOff+0.6,11200); S.q.identity(); S.speed=CUR.landV*0.8; S.sink=0.5; S.gear=true; S.throttle=0.1; S.onGround=false; S.crashed=false;
S.throttle=0; for(let i=0;i<400&&!S.onGround&&!S.crashed;i++) update(0.05);
T('touchdown at the UAV runway',S.onGround&&!S.crashed,'ground '+S.onGround+' crashed '+S.crashed);
T('rolls at runway height',Math.abs(S.pos.y-(UAV.y+CUR.gearOff))<0.01,S.pos.y);
S.throttle=0; for(let i=0;i<100;i++) update(0.05); T('still fine after rolling',!S.crashed);
// take off again from the UAV runway
S.pos.set(UAV.rw.x,UAV.y+CUR.gearOff,12250); S.q.identity(); S.speed=0; S.throttle=1; S.pitchIn=0.6; for(let i=0;i<600&&S.onGround&&!S.crashed;i++) update(0.05);
T('take-off roll on the UAV runway',!S.crashed&&(S.speed>CUR.vr*0.9||!S.onGround),'ground '+S.onGround+' crashed '+S.crashed+' '+S.crashReason+' z '+S.pos.z);
// leaving the paved area still ends the roll
startGame('air'); S.pos.set(5000,terrainH(5000,0)+CUR.gearOff,0); S.onGround=true; S.speed=10; S.crashed=false; update(0.05); T('off-field ground roll ends',S.crashed);
// free mode: no enemies and quiet SAMs by default
SETTINGS.ai={}; missionId='free'; startGame('air'); T('free mode has no enemy aircraft by default',!ACT.some(function(a){ return a.team==='red'; }));
T('SAM off by default in free mode',aiCfg().sam===false);
// jumping
enterHangar(); startWalk(); const y0=WALK.pos.y; WALK.jumpQ=true; walkUpdate(0.05); walkUpdate(0.05); T('jump goes up',WALK.pos.y>y0+0.3,WALK.pos.y-y0);
for(let i=0;i<40;i++) walkUpdate(0.05); T('lands again',Math.abs(WALK.pos.y-y0)<0.1&&!WALK.air);
console.log('pass',ok,'fail',bad);
