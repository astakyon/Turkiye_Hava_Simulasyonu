let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* V2.49: helicopters, land vehicles and warships renewed; the old models stay for the library comparison */
['Altay','Firtina','Pars','Kirpi','Korkut','Hisar'].forEach(function(n){ const f=eval('build'+n), o=eval('build'+n+'V1'); T_('land '+n,typeof f==='function'&&typeof o==='function'); const m=f(); T_('land group '+n,!!m.group&&m.group.children.length>20&&m.len>5); });
T_('tank turret',!!buildAltay().turret); T_('korkut radar',!!buildKorkut().radar); T_('hisar elev',!!buildHisar().elev);
['t129','t625'].forEach(function(id){ const m=heliModel(id), o=heliModelV1(id); T_('heli '+id,!!m.rotor&&!!m.trot&&m.body.children.length>o.body.children.length); });
const fr=buildFrigate('ada','F-511'); T_('corvette',!!fr.radar&&!!fr.deck&&fr.L>90&&fr.group.children.length>buildFrigateV1('ada','F-511').group.children.length);
const an=buildAnadolu(); T_('anadolu',an.deckY>20&&an.group.children.length>buildAnadoluV1().group.children.length);
const pb=buildPatrol('P-1200'); T_('patrol',!!pb.radar&&pb.group.children.length>buildPatrolV1('P-1200').group.children.length);
T_('library old',libItems().filter(function(i){ return i.buildOld; }).length>=12);
console.log('v249: pass '+ok+' fail '+bad);
