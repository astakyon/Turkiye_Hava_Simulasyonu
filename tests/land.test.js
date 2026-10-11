let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('land base built',LAND.built===true);
T('land pad flat',Math.abs(terrainH(1200,-7600)-LAND.y)<0.01,terrainH(1200,-7600));
T('range pad flat',Math.abs(terrainH(2600,-7660)-34)<0.01,terrainH(2600,-7660));
T('road reaches the village',LAND.road.length>100&&Math.hypot(LAND.road[LAND.road.length-1][0]+390,LAND.road[LAND.road.length-1][1]+3030)<5);
const nOb=AP.obst.filter(function(b){ return b.x0>380&&b.x1<3400&&b.z0>-8000&&b.z1<-7200; }).length; T('buildings are obstacles',nOb>20,nOb);
T('no enemy ground targets inside the bases',gtargets.every(function(o){ return !inAnyPad(o.pos.x,o.pos.z,300); }));
landStep(1); const p0=LAND.tank.position.clone(); landStep(2); T('course tank moves',LAND.tank.position.distanceTo(p0)>5);
T('tank on the ground',Math.abs(LAND.tank.position.y-LAND.y)<0.5);
enterHangar(); startWalk(); WALK.mode='car'; WALK.warp=4; walkWarp(); T('warp to land base',Math.abs(WALK.car.x-900)<1&&Math.abs(WALK.car.z+7290)<1,WALK.car.x+','+WALK.car.z);
const c=WALK.car; c.h=0; c.v=12; keys.KeyW=true; for(let i=0;i<60;i++) walkUpdate(0.05); keys.KeyW=false;
T('drive north into the base',c.z<-7330,c.z);
T('car height follows the pad',Math.abs(c.mesh.position.y-(LAND.y+0.22))<0.05,c.mesh.position.y);
console.log('pass',ok,'fail',bad);
