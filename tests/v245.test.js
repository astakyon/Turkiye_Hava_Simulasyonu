let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* Kızılelma: new model from the player's photos, internal bay, real munitions */
const m=buildKizilelmaV2(); T_('model',!!m.group&&m.flames.length===1&&m.surfaces.length>=6&&m.bay&&m.bay.doors.length===4);
T_('old model kept',typeof AIRCRAFT.kizilelma.buildOld==='function'&&AIRCRAFT.kizilelma.len==='14,5 m');
T_('roles',munOf('kizilelma','m1')===MUNI.bozdogan&&munOf('kizilelma','m2')===MUNI.gokdogan&&munOf('kizilelma','m3')===MUNI.somj&&munOf('kizilelma','gp')===MUNI.teber82);
T_('bay roles',munInBay('kizilelma','m2')&&!munInBay('kizilelma','gp'));
selectedId='kizilelma'; setAircraft('kizilelma'); startGame('air'); LOADOUTS.kizilelma={gp:2,bnk:0,m1:2,m2:2,m3:0}; applyLoadout('kizilelma');
T_('missiles in the bay',model.stores.children.filter(function(s){ return s.userData.bay; }).length===4);
T_('bombs on the wing',model.stores.children.filter(function(s){ return s.userData.w==='gp'&&!s.userData.bay; }).length===2);
BAY.t=10; for(let i=0;i<30;i++) munBayStep(0.05); T_('bay opens',BAY.open===1&&model.bay.cav.visible);
BAY.t=0; for(let i=0;i<60;i++) munBayStep(0.05); T_('bay closes',BAY.open===0);
delete LOADOUTS.kizilelma; setAircraft('kaan'); applyLoadout('kaan');
console.log('v245: pass '+ok+' fail '+bad);
