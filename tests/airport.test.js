let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('airport built',AP.road&&AP.road.length>100&&AP.obst.length>=18,AP.obst.length);
T('papi 2 ends',AP.papi.length===2&&AP.papi[0].units.length===4);
// runway start position must be clear of every obstacle
resetFlight('runway'); state='play'; obstacleStep(); T('runway start clear',!S.crashed);
const e0=acExtent(); T('start not in obstacle',!AP.obst.some(function(b){ return !b.air&&S.pos.x+e0.ex>b.x0&&S.pos.x-e0.ex<b.x1&&S.pos.z+e0.ez>b.z0&&S.pos.z-e0.ez<b.z1; }));
// hangar line displays clear
T('hangar displays clear',Object.keys(displays).every(function(id){ const d=displays[id]; return !AP.obst.some(function(b){ return !b.air&&d.x>b.x0-8&&d.x<b.x1+8&&HANGAR.z>b.z0-8&&HANGAR.z<b.z1+8; }); }));
// taxi path clear
T('taxi path clear',TAXI.pts.every(function(p){ return !AP.obst.some(function(b){ return !b.air&&p.x>b.x0-10&&p.x<b.x1+10&&p.z>b.z0-10&&p.z<b.z1+10; }); }));
// flying into the tower crashes
resetFlight('air'); S.crashed=false; S.onGround=false; S.pos.set(-128,AIRFIELD_Y+20,300); obstacleStep(); T('tower crash in air',S.crashed&&S.crashReason==='Binaya çarptın',S.crashReason);
// above it is fine
S.crashed=false; S.pos.set(-128,AIRFIELD_Y+80,300); obstacleStep(); T('above tower ok',!S.crashed);
// taxiing into a shelter stops instead of crashing
S.crashed=false; S.onGround=true; S.pos.set(-232,AIRFIELD_Y+2,430); S.speed=10; obstacleStep(); T('ground blocked',!S.crashed&&S.pos.x>-233&&S.speed<2,S.pos.x+' '+S.speed);
// maintenance hangar is open on the ground
S.pos.set(-150,AIRFIELD_Y+2,1060); S.speed=5; obstacleStep(); T('service hangar passable',S.speed===5&&S.pos.x===-150);
// PAPI colour logic is checked in the real browser (the stub has no buffer attributes)
const s0=AP.movers[0].s; airportStep(1); T('vehicles move',AP.movers[0].s!==s0);
console.log('pass',ok,'fail',bad);
