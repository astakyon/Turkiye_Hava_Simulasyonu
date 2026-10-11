let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('naval base built',NAVAL.built===true);
T('pads flatten the base area',Math.abs(terrainH(-1600,-3700)-PADS[0].y)<0.01,terrainH(-1600,-3700));
T('deep water off the quay',terrainH(-2100,-3800)<-5,terrainH(-2100,-3800));
T('quay deck walkable',Math.abs(groundH(-1900,-3800)-NAVAL.y)<0.01,groundH(-1900,-3800));
T('pier deck walkable',Math.abs(groundH(-2150,NAVAL.piers[1])-NAVAL.y)<0.01,groundH(-2150,NAVAL.piers[1]));
T('water next to a pier is not walkable',groundH(-2150,NAVAL.piers[1]+30)<0.8);
T('airfield ground unchanged',Math.abs(groundH(0,0)-AIRFIELD_Y)<0.01);
T('road from village reaches the gate',NAVAL.road.length>50&&Math.abs(NAVAL.road[NAVAL.road.length-1][0]-NAVAL.gate.x)<80);
T('obstacles registered',AP.obst.filter(function(b){ return b.x1<-1400&&b.z1<-3000; }).length>20);
T('ships/cranes animate',NAVAL.radars.length>=1&&NAVAL.cranes.length===3);
navalStep(0.5); T('patrol boat moves',NAVAL.boat&&isFinite(NAVAL.boat.position.x));
T('land group renamed',GROUPS.find(function(g){ return g.id==='kara'; }).name==='Bozkurtlar');
// drive the car from the base gate onto the apron
enterHangar(); startWalk(); WALK.mode='car'; const c=WALK.car; c.x=-1470; c.z=-3330; c.h=Math.PI/2; c.v=12; keys.KeyW=true;
for(let i=0;i<120;i++) walkUpdate(0.05); keys.KeyW=false;
T('car drives through the gate into the base',c.x<-1560,c.x);
T('car stays on the ground',Math.abs(WALK.car.mesh.position.y-(groundH(c.x,c.z)+0.22))<0.01);
console.log('pass',ok,'fail',bad);
