let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
accSetProfile({lic2:{}}); const p=accProfile(); p.rank=8;
/* quick play: everything open */
playMode('quick'); T_('quick: KAAN open',!rankLocked('kaan')&&licOk('kaan')); T_('quick: tank open',licOk('altay','kara'));
/* career from zero */
playMode('career'); T_('career: KAAN needs a licence',rankLocked('kaan')&&!licOk('kaan')); T_('career: TB2 needs İHA',!licOk('tb2')&&licFor('tb2')==='iha');
T_('career: boats need kaptanlık',licFor('anadolu','deniz')==='kaptan'&&!licOk('patrol','boat'));
enterTitle(); enterHangar(); selectAircraft('tb2'); preFlight('hangar'); T_('blocked at the hangar',menuMode==='hangar',menuMode);
T_('start button shows the licence',/İHA pilotluğu/.test($('btnPlay').textContent),$('btnPlay').textContent);
/* licences screen + exam chain */
enterTitle(); titleAct('careerMenu'); T_('career menu has licences',/c_lic/.test($('cNav').innerHTML)); titleAct('c_lic'); T_('licences listed',(($('licList').innerHTML.match(/class="lic/g))||[]).length===8);
T_('tank needs ehliyet first',/Önce Araç ehliyeti/.test($('licList').innerHTML));
examStart('iha'); T_('exam step 1 = TB2 take-off lesson',EXAM.on&&SCH.on&&SCH.cur.id==='x_iha_kalkis'&&activeId==='tb2',SCH.cur&&SCH.cur.id);
schEnd(true); T_('advanced to step 2',EXAM.i===1);
for(let i=0;i<40;i++){ /* wait for the timed next step */ } examStep(); T_('step 2 = TB2 landing',SCH.cur.id==='x_iha_inis'&&activeId==='tb2');
schEnd(true); T_('licence granted',!!accProfile().lic2.iha&&!EXAM.on);
T_('TB2 now allowed (rank permitting)',licOk('tb2'));
/* failing an exam */
examStart('ehliyet'); T_('driving exam uses the course',RACE.def&&RACE.def.id==='x_car'&&WALK.mode==='car'&&WALK.car.K.id==='suv',RACE.def&&RACE.def.id);
RACE.t=999; raceFinish(); T_('too slow = fail',!EXAM.on&&!accProfile().lic2.ehliyet);
examStart('ehliyet'); RACE.t=100; raceFinish(); T_('in time = pass',!!accProfile().lic2.ehliyet);
examStart('tank'); T_('tank exam with Altay',RACE.def&&RACE.def.id==='x_tank'&&WALK.car.K.id==='altay'); RACE.t=200; raceFinish(); T_('tank licence',!!accProfile().lic2.tank);
/* boarding on foot is checked in career */
enterHangar(); startWalk(); buildBoats(); const b=BOATS[0]; WALK.near='boat'; WALK.nearBoat=b; WALK.mode='foot'; walkInteract(); T_('cannot board a boat without kaptanlık',WALK.mode==='foot');
/* exam-only items are not on the board */
T_('exam lessons hidden from the board',!boardAll().some(function(e){ return (e.L&&e.L.exam)||(e.R&&e.R.exam); }));
playMode('quick'); WALK.near='boat'; WALK.nearBoat=b; walkInteract(); T_('quick play boards freely',WALK.mode==='boat');
console.log('pass',ok,'fail',bad);
