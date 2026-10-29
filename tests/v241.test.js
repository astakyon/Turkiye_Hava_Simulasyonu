let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* KAAN: every weapon role is a real munition with data and a model; other aircraft keep the generic weapons */
T_('KAAN roles mapped',['gp','bnk','m1','m2','m3'].every(function(k){ return !!munOf('kaan',k); }));
T_('names',wOf('kaan','m2').name.indexOf('GÖKDOĞAN')===0&&wOf('kaan','m1').short==='BZD'&&wOf('kaan','m3').air===false&&wOf('kaan','m1').ground===false);
T_('TB2 generic',!munOf('tb2','m1')&&wOf('tb2','m1').name===munBase().m1.name);
T_('real data',MUNI.bozdogan.len===3.3&&MUNI.bozdogan.kg===140&&MUNI.neb84.kg===870);
/* model length from the build parts (z extent of every part) */
Object.keys(MUNI).forEach(function(mid){ T_(mid+' model',MUN_BUILD[mid]().length>=4); });
/* flight: WEAPONS follows the active aircraft */
selectedId='kaan'; setAircraft('kaan'); startGame('air'); LOADOUTS.kaan={gp:2,bnk:0,m1:2,m2:2,m3:0}; applyLoadout('kaan');
T_('active weapons real',WEAPONS.m2.short==='GKD');
T_('bay stores',model.stores.children.filter(function(s){ return s.userData.bay; }).length===4);
T_('bombs outside the bay',model.stores.children.filter(function(s){ return s.userData.w==='gp'&&!s.userData.bay; }).length===2);
T_('bay closed',BAY.open===0&&!model.stores.children.some(function(s){ return s.userData.bay&&s.visible; }));
BAY.t=10; for(let i=0;i<30;i++) munBayStep(0.05);
T_('bay opens',BAY.open===1&&model.bay.doors.every(function(d){ return Math.abs(d.p.rotation.z-d.a)<1e-6; })&&model.bay.cav.visible);
BAY.t=0; for(let i=0;i<60;i++) munBayStep(0.05); T_('bay closes',BAY.open===0);
setAircraft('tb2'); applyLoadout('tb2'); T_('generic again',WEAPONS.m1.name===munBase().m1.name);
setAircraft('kaan'); applyLoadout('kaan');
console.log('v241: pass '+ok+' fail '+bad);
