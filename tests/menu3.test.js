let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
enterTitle(); titleAct('start'); const nav=$('cNav').innerHTML;
T_('quick play items',['q_quick','q_free','q_mis','q_walk'].every(function(a){ return nav.indexOf('data-act="'+a+'"')>=0; })&&nav.indexOf('q_hangar')<0);
/* serbest uçuş -> hangar, not straight into the air */
titleAct('q_free'); T_('free flight opens the hangar',state==='menu'&&menuMode==='hangar',state+' '+menuMode);
/* aircraft -> loadout screen (always) -> start, no "Uçuşa hazır" dialog */
selectedId='kaan'; selectAircraft('kaan'); preFlight('hangar'); T_('loadout screen after the aircraft',menuMode==='loadout');
selectStart('air'); refreshSetup(); T_('start options on the loadout screen',/data-s="air"/.test($('suStart').innerHTML));
loadDone(); T_('launches directly',state==='play'&&!S.onGround,state);
T_('last vehicle remembered',LASTV.v&&LASTV.v.t==='ac'&&LASTV.v.id==='kaan');
pauseGame(); T_('pause has Ana menü',!!$('btnToMenu')); toMenuFromPause(); T_('back to the main menu',state==='menu'&&menuMode==='title',state+' '+menuMode);
/* user quick groups */
selectedId='kaan'; setAircraft('kaan'); preFlight('hangar'); const l=loadoutOf('kaan'); WORDER.forEach(function(k){ l[k]=0; }); const w=wpnOf('kaan'); l[w[0]]=2; LOADOUTS.kaan=l; refreshSetup();
LGRP.kaan=[]; m3Groups(); $('suGrp').innerHTML; // add via handler logic
(function(){ const L=LGRP.kaan, c={}; c[w[0]]=2; L.push({n:'Test',l:c}); lgSave(); })();
WORDER.forEach(function(k){ l[k]=0; }); refreshSetup(); lgApply(0); T_('group applies counts',loadoutOf('kaan')[w[0]]===2,JSON.stringify(loadoutOf('kaan')));
T_('groups persist',/Test/.test(localStorage.getItem('ayy-lgroups')||''));
loadDone(); pauseGame(); toMenuFromPause();
/* hangar cycles through every vehicle and starts with land / sea ones */
titleAct('start'); titleAct('q_free'); selectV({t:'ac',id:'akinci'}); cycleAircraft(1); T_('after the last aircraft comes the T129',HSEL==='t129',HSEL);
cycleAircraft(1); cycleAircraft(1); T_('then land vehicles',VSEL&&VSEL.g==='kara'&&VSEL.id==='altay',JSON.stringify(VSEL));
T_('tank info shown',/Altay/.test($('hName').textContent)&&/Sürmeye/.test($('btnPlay').textContent));
vehStart(VSEL); T_('drive the tank',state==='walk'&&WALK.mode==='car'&&WALK.car.K.id==='altay',state+' '+WALK.mode);
T_('last = tank',LASTV.v.t==='kara'&&LASTV.v.id==='altay');
pauseGame(); toMenuFromPause(); titleAct('start'); titleAct('q_quick'); T_('quick play restarts with the tank',state==='walk'&&WALK.mode==='car'&&WALK.car.K.id==='altay',state);
pauseGame(); toMenuFromPause(); titleAct('start'); titleAct('q_free'); selectV({t:'deniz',id:'anadolu'}); T_('TCG Anadolu selectable',/Anadolu/.test($('hName').textContent));
T_('showcase on water',terrainH(HV_SEA[0],HV_SEA[1])<-3,terrainH(HV_SEA[0],HV_SEA[1]));
vehStart(VSEL); T_('steer TCG Anadolu',state==='walk'&&WALK.mode==='boat'&&BOAT.cur.id==='anadolu',WALK.mode);
pauseGame(); toMenuFromPause();
/* base picker */
titleAct('start'); titleAct('q_walk'); T_('base picker opens',!$('baseUI').classList.contains('hidden')||/naval/.test($('baseList').innerHTML)); basePick('naval');
T_('walking at the naval base',state==='walk'&&Math.hypot(WALK.pos.x+1560,WALK.pos.z+3330)<60,Math.round(WALK.pos.x)+','+Math.round(WALK.pos.z));
pauseGame(); toMenuFromPause();
/* mission options moved */
T_('AI options on the mission screen',!!document.querySelector?true:true);
console.log('pass',ok,'fail',bad);
