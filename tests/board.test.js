let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); startWalk();
let L=[]; for(const id in MODELS.inst) MODELS.inst[id].forEach(function(m){ if(!pkSkip(m)) L.push(id); });
T_('parked aircraft registered',L.length>=5,L.join(','));
T_('orbiting UAV excluded',!(UAV.orbit&&!pkSkip(UAV.orbit))===true);
console.log('pass',ok,'fail',bad);
