let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('uav centre built',UAV.built===true);
T('runway flat',Math.abs(terrainH(UAV.rw.x,11000)-UAV.y)<0.01&&Math.abs(terrainH(UAV.rw.x,12200)-UAV.y)<0.01);
T('orbiting akinci',!!UAV.orbit); const p0=UAV.orbit.group.position.clone(); uavStep(5); T('orbit moves',UAV.orbit.group.position.distanceTo(p0)>50);
T('orbit above terrain',UAV.orbit.group.position.y>terrainH(UAV.orbit.group.position.x,UAV.orbit.group.position.z)+300);
T('hangars are obstacles',AP.obst.filter(function(b){ return b.x0>11600&&b.x1<11760; }).length>=4);
console.log('pass',ok,'fail',bad);
