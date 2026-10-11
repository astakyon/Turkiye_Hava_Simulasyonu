let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('places listed',PLACES.length>=20&&PLACES.every(function(p){ return isFinite(p.x)&&isFinite(p.z); }));
T('ground places are on land',PLACES.filter(function(p){ return p.g; }).every(function(p){ return groundH(p.g[0],p.g[1])>0.8; }),PLACES.filter(function(p){ return p.g&&groundH(p.g[0],p.g[1])<=0.8; }).map(function(p){ return p.id; }).join());
// teleport while flying
selectedId='kaan'; setAircraft('kaan'); startGame('air'); MAPV.from='play'; teleportTo(placeById('hilalkent'));
T('flight teleport above the place',Math.hypot(S.pos.x+8200,S.pos.z+7050-900)<5&&S.pos.y>terrainH(S.pos.x,S.pos.z)+300,S.pos.x+','+S.pos.z+','+S.pos.y);
// teleport while walking / driving
enterHangar(); startWalk(); MAPV.from='walk'; teleportTo(placeById('naval')); T('walk teleport',Math.abs(WALK.pos.x+1560)<1&&Math.abs(WALK.pos.z+3330)<1);
WALK.mode='car'; teleportTo(placeById('anadolukent')); T('car teleport',Math.abs(WALK.car.x+600)<1&&WALK.car.mesh.position.y>30);
WALK.mode='foot';
// start places
SETTINGS.startPlace='uav'; startGame('runway'); T('start on the UAV runway',S.onGround&&Math.abs(S.pos.x-UAV.rw.x)<1&&Math.abs(S.pos.y-(UAV.y+CUR.gearOff))<0.01,S.pos.x+','+S.pos.y);
update(0.05); update(0.05); T('UAV start does not crash',!S.crashed);
startGame('hangar'); T('hangar start at UAV falls back to its runway',S.onGround&&Math.abs(S.pos.x-UAV.rw.x)<1);
SETTINGS.startPlace='kale'; startGame('runway'); T('non-airfield place starts in the air',!S.onGround&&S.pos.y>300);
SETTINGS.startPlace='enemy'; SETTINGS.startPlace='kzb'; startGame('runway'); T('enemy airfield start',S.onGround&&inPad('enemy',S.pos.x,S.pos.z,0),S.pos.x+','+S.pos.z);
update(0.05); T('enemy start does not crash',!S.crashed);
SETTINGS.startPlace=null; startGame('runway'); T('default start at the main base',S.onGround&&Math.abs(S.pos.z-1150)<1);
console.log('pass',ok,'fail',bad);
