let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* TB2: new model, real Roketsan munitions, no air-to-air weapons */
const m=buildTB2(); T_('model parts',!!m.group&&m.spinners.length===1&&m.surfaces.length===4&&m.stnMinX>1);
T_('old model kept',typeof AIRCRAFT.tb2.buildOld==='function');
T_('TB2 roles',munOf('tb2','gp')===MUNI.maml&&munOf('tb2','bnk')===MUNI.mamc&&munOf('tb2','m3')===MUNI.mamt);
T_('no air missiles',wpnOf('tb2').join()==='gp,bnk,m3',wpnOf('tb2').join());
T_('real data',MUNI.maml.kg===22&&MUNI.maml.len===1.0&&MUNI.mamt.kg===94);
const d=defaultLoadout('tb2'); T_('default loadout allowed',d.m1===0&&d.m2===0&&d.gp+d.bnk+d.m3===SLOTS.tb2,JSON.stringify(d));
LOADOUTS.tb2={gp:1,bnk:0,m1:3,m2:0,m3:0}; selectedId='tb2'; setAircraft('tb2'); startGame('air'); applyLoadout('tb2');
T_('old saved m1 dropped',INV.m1===0&&INV.gp===1,JSON.stringify(INV));
T_('active names',WEAPONS.gp.short==='MAM-L'&&WEAPONS.m3.short==='MAM-T');
delete LOADOUTS.tb2; setAircraft('kaan'); applyLoadout('kaan');
console.log('v242: pass '+ok+' fail '+bad);
