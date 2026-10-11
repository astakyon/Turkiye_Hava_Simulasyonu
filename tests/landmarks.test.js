let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('landmarks built',LMK.built===true);
T('reservoir level set',LMK.dam.level>300,LMK.dam.level);
T('castle islet above sea',terrainH(9310,8002)>8);
T('observatory summit flat',Math.abs(terrainH(10700,-10500)-895)<0.5);
T('ski base and top',Math.abs(terrainH(4340,-5465)-486)<0.5&&Math.abs(terrainH(6700,-5050)-1858)<0.5);
const u0=LMK.cabins[0].u; landmarksStep(10); T('gondola moves',LMK.cabins[0].u!==u0);
T('offshore turbines',LMK.rotorD.length===12&&terrainH(LMK.rotorD[0].x,LMK.rotorD[0].z)<-20);
T('platform in deep water',terrainH(-6500,1500)<-30);
console.log('pass',ok,'fail',bad);
