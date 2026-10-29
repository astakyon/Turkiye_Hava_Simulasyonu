let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* Aksungur: new model with real dimensions and Roketsan munitions on six wing stations */
const m=buildAksungurV2(); T_('model',!!m.group&&m.spinners.length===2&&m.surfaces.length>=5&&m.stnMinX>3);
T_('real size text',AIRCRAFT.aksungur.len==='11,6 m'&&AIRCRAFT.aksungur.span==='24 m');
T_('old model kept',typeof AIRCRAFT.aksungur.buildOld==='function');
T_('roles',munOf('aksungur','gp')===MUNI.teber82&&munOf('aksungur','bnk')===MUNI.mamc&&munOf('aksungur','m3')===MUNI.mamt&&wpnOf('aksungur').indexOf('m1')<0);
selectedId='aksungur'; setAircraft('aksungur'); startGame('air'); LOADOUTS.aksungur={gp:2,bnk:2,m1:0,m2:0,m3:2}; applyLoadout('aksungur');
T_('six stores',model.stores.children.length===6);
delete LOADOUTS.aksungur; setAircraft('kaan'); applyLoadout('kaan');
console.log('v247: pass '+ok+' fail '+bad);
