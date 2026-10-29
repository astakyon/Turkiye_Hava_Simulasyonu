let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* Akıncı: new model from the player's photos and real munitions; TB3 fold joint moved out */
const m=buildAkinciV2(); T_('model',!!m.group&&m.spinners.length===2&&m.surfaces.length>=5&&m.stnMinX>3);
T_('old model kept',typeof AIRCRAFT.akinci.buildOld==='function');
T_('roles',munOf('akinci','gp')===MUNI.teber82&&munOf('akinci','bnk')===MUNI.neb84&&munOf('akinci','m1')===MUNI.lumtas&&munOf('akinci','m2')===MUNI.gokdogan&&munOf('akinci','m3')===MUNI.soma);
T_('real data',MUNI.lumtas.kg===37.5&&MUNI.lumtas.len===1.8&&MUNI.teber82.kg===270);
T_('L-UMTAS ground only',wOf('akinci','m1').air===false&&wOf('akinci','m1').ground===true);
selectedId='akinci'; setAircraft('akinci'); startGame('air'); LOADOUTS.akinci={gp:4,bnk:0,m1:4,m2:0,m3:0}; applyLoadout('akinci');
T_('stores outboard of the nacelles',model.stores.children.length===8);
T_('active names',WEAPONS.m1.short==='UMTAS'&&WEAPONS.gp.short==='TEBER');
delete LOADOUTS.akinci; setAircraft('kaan'); applyLoadout('kaan');
const t3=buildTB3(); T_('TB3 fold outside the boom',t3.folds.length===2&&Math.abs(t3.folds[1].p.position.x)>2.0);
console.log('v244: pass '+ok+' fail '+bad);
