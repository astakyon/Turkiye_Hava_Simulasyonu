let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('military built',MIL.built===true);
T('air-defence turrets',MIL.turrets.length===4);
const r0=MIL.radars[0].rotation.y; militaryStep(1); T('radars turn',MIL.radars[0].rotation.y>r0);
T('peak pad flat',Math.abs(terrainH(5360,-2680)-1148)<1.0,terrainH(5360,-2680));
T('depot outside the fence and on flat ground',Math.abs(terrainH(-1150,-300)-AIRFIELD_Y)<0.5);
T('radomes are obstacles',AP.obst.some(function(b){ return b.x0>5300&&b.x1<5420&&b.y1>1160; }));
console.log('pass',ok,'fail',bad);
