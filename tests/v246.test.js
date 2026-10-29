let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* ANKA and ANKA-3: new models; ANKA-3 flying wing with an internal bay and real munitions */
const a=buildAnkaV2(); T_('ANKA model',!!a.group&&a.spinners.length===1&&a.surfaces.length>=4&&AIRCRAFT.anka.span==='17,5 m');
const b=buildAnka3V2(); T_('ANKA-3 model',!!b.group&&b.flames.length===1&&b.bay&&b.bay.doors.length===4&&b.surfaces.length===2);
T_('old models kept',typeof AIRCRAFT.anka.buildOld==='function'&&typeof AIRCRAFT.anka3.buildOld==='function');
T_('ANKA-3 roles',munOf('anka3','gp')===MUNI.teber82&&munOf('anka3','m3')===MUNI.somj&&munOf('anka3','bnk')===MUNI.maml&&wpnOf('anka3').join()==='gp,bnk,m3');
T_('ANKA unarmed',!misArmed('anka'));
selectedId='anka3'; setAircraft('anka3'); startGame('air'); LOADOUTS.anka3={gp:2,bnk:2,m1:0,m2:0,m3:0}; applyLoadout('anka3');
T_('bombs in the bay',model.stores.children.filter(function(s){ return s.userData.w==='gp'&&s.userData.bay; }).length===2);
T_('MAM-L on the outer wing',model.stores.children.filter(function(s){ return s.userData.w==='bnk'&&!s.userData.bay; }).length===2);
delete LOADOUTS.anka3; setAircraft('kaan'); applyLoadout('kaan');
console.log('v246: pass '+ok+' fail '+bad);
