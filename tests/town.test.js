let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('town built',TOWN.built===true);
T('town pad flat',Math.abs(terrainH(-8200,-7050)-TOWN.y)<0.01,terrainH(-8200,-7050));
T('town road joins the land-base road',Math.hypot(TOWN.road[0][0]-70,TOWN.road[0][1]+5100)<1);
T('town buildings are obstacles',AP.obst.filter(function(b){ return b.x0>-9400&&b.x1<-7000&&b.z0>-7400&&b.z1<-6700; }).length>40);
T('traffic cars exist',TRAFFIC.cars.length>=12,TRAFFIC.cars.length);
const c0=TRAFFIC.cars[0], s0=c0.s; trafficStep(1); T('cars move',Math.abs(c0.s-s0)>5);
for(let i=0;i<2000;i++) trafficStep(0.5); T('cars stay on their roads',TRAFFIC.cars.every(function(c){ return c.s>=0&&c.s<=c.P.len; }));
enterHangar(); startWalk(); WALK.warp=7; walkWarp(); T('warp to town',Math.abs(WALK.pos.x+7300)<1,WALK.pos.x);
T('walker on town ground',Math.abs(WALK.pos.y-(TOWN.y+1.7))<0.1,WALK.pos.y);
console.log('pass',ok,'fail',bad);
