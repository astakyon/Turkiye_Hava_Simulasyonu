let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('rural built',RURAL.built===true);
T('wind turbines on the ridge',RURAL.rotorD.length>=8&&RURAL.rotorD.every(function(t){ return t.y>200; }),RURAL.rotorD.length);
const a0=RURAL.rotorD[0].a; ruralStep(1); T('rotors turn',RURAL.rotorD[0].a>a0);
T('lake bed below water level',terrainH(1700,-3750)<RURAL.lake.level-2,terrainH(1700,-3750));
let rim=99; for(let k=0;k<24;k++){ const a=k/24*6.283; rim=Math.min(rim,terrainH(1700+Math.cos(a)*262,-3750+Math.sin(a)*262)); }
T('lake rim holds the water',rim>RURAL.lake.level,rim);
const t0=RURAL.tractor.position.clone(); ruralStep(3); T('tractor moves',RURAL.tractor.position.distanceTo(t0)>1);
T('village houses recorded for smoke',ENV.houses.length>10&&RURAL.smokeD.length>=40);
console.log('pass',ok,'fail',bad);
