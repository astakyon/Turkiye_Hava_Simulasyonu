let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('enemy base built',KZB.built===true);
spawnGround(); const inside=gtargets.filter(function(o){ return inKZB(o.pos.x,o.pos.z); }).length;
T('ground targets spawn in Kızıl Bölge',inside>=gtargets.length*0.7,inside+'/'+gtargets.length);
T('none on friendly bases',gtargets.every(function(o){ return !inFriendlyPad(o.pos.x,o.pos.z,300); }));
T('enemy runway flat',Math.abs(terrainH(-9600,9600)-132)<0.01);
state='play'; S.pos.set(-11000,800,11000); KZB.inside=false; enemyStep(0.1); T('border warning',KZB.inside===true);
S.pos.set(0,800,0); enemyStep(0.1); T('leaving',KZB.inside===false);
console.log('pass',ok,'fail',bad);
