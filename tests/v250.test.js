let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* V2.50: ANKA-3 redone from the player's photos — camouflage, raised nozzle with the tail plate; bay and munitions unchanged */
const m=buildAnka3V2(); T_('model',!!m.group&&m.flames.length===1&&!!m.bay&&m.bay.doors.length===4);
T_('camo texture shared',anka3Camo()===anka3Camo());
T_('old model kept',typeof AIRCRAFT.anka3.buildOld==='function');
T_('munitions',munOf('anka3','gp')===MUNI.teber82&&munOf('anka3','m3')===MUNI.somj);
console.log('v250: pass '+ok+' fail '+bad);
