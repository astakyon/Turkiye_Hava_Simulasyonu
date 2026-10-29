let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* Hürjet and Hürkuş: new models with real sizes and Turkish munitions */
const j=buildHurjetV2(); T_('hurjet model',!!j.group&&j.flames.length>=1&&j.surfaces.length>=5&&j.stnMinX>1);
const k=buildHurkusV2(); T_('hurkus model',!!k.group&&k.spinners.length===1&&k.surfaces.length>=5);
T_('old models kept',typeof AIRCRAFT.hurjet.buildOld==='function'&&typeof AIRCRAFT.hurkus.buildOld==='function');
T_('size text',AIRCRAFT.hurjet.len==='13,6 m'&&AIRCRAFT.hurkus.span==='10 m');
T_('hurjet roles',munOf('hurjet','gp')===MUNI.teber82&&munOf('hurjet','bnk')===MUNI.hgk82&&munOf('hurjet','m1')===MUNI.bozdogan&&munOf('hurjet','m2')===MUNI.gokdogan&&wpnOf('hurjet').indexOf('m3')<0);
T_('hurkus roles',munOf('hurkus','gp')===MUNI.maml&&munOf('hurkus','bnk')===MUNI.mamc&&munOf('hurkus','m1')===MUNI.lumtas&&wpnOf('hurkus').indexOf('m2')<0);
selectedId='hurkus'; setAircraft('hurkus'); startGame('air'); LOADOUTS.hurkus={gp:2,bnk:2,m1:2,m2:0,m3:0}; applyLoadout('hurkus');
T_('hurkus six stores',model.stores.children.length===6);
delete LOADOUTS.hurkus; setAircraft('kaan'); applyLoadout('kaan');
console.log('v248: pass '+ok+' fail '+bad);
