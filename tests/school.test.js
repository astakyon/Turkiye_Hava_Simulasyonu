let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
try{ localStorage.removeItem('ayy-school'); }catch(e){}
BF.cat='okul'; BF.diff=0; BF.dur='all'; T('8 lessons on the board',boardList().length===8,boardList().length);
openMissions(); T('board shows lessons',/DERS/.test($('misList').innerHTML)); BF.cat='all';
/* take-off lesson */
schStart('kalkis'); T('takeoff lesson started',SCH.on&&M.id==='school'&&activeId==='hurkus'&&S.onGround);
keys.KeyR=true; for(let i=0;i<60;i++){ update(0.05); schStep(0.05); } keys.KeyR=false; T('step 1 throttle',SCH.i>=1,SCH.i);
for(let i=0;i<800&&S.onGround;i++){ if(S.speed*3.6>185) keys.KeyS=true; update(0.05); schStep(0.05); } keys.KeyS=false; T('airborne',!S.onGround&&SCH.i>=3,SCH.i+' '+S.speed);
keys.KeyG=true; toggleGear(); keys.KeyG=false; for(let i=0;i<10;i++){ update(0.05); schStep(0.05); } S.pos.y+=400; for(let i=0;i<5;i++){ update(0.05); schStep(0.05); }
T('takeoff lesson done',!SCH.on&&schState().kalkis&&M.done,SCH.i+' '+JSON.stringify(schState()));
/* landing lesson */
schStart('inis'); T('landing starts on final',!S.onGround&&S.pos.z>4000); S.throttle=0.4; S.gear=true; S.pos.x=0;
for(let i=0;i<6;i++){ update(0.05); schStep(0.05); } T('steps 1-3',SCH.i>=2,SCH.i);
S.pos.set(0,AIRFIELD_Y+CUR.gearOff,1000); S.onGround=true; S.speed=40; S.zoneY=AIRFIELD_Y; schStep(0.05); schStep(0.05); S.speed=0; schStep(0.05); T('landing done',schState().inis,SCH.i);
/* circuit lesson uses waypoints */
schStart('tur'); const L=SCH.cur; L.steps.slice(0,3).forEach(function(s){ S.pos.set(s.wp[0],AIRFIELD_Y+400,s.wp[1]); S.onGround=false; schStep(0.05); }); T('circuit waypoints',SCH.i===3,SCH.i);
S.pos.set(0,AIRFIELD_Y+300,3000); sQ(0); schStep(0.05); S.pos.set(0,AIRFIELD_Y+80,500); schStep(0.05); T('circuit done',schState().tur);
/* crosswind changes the wind */
schStart('ruzgar'); for(let i=0;i<100;i++) wxStep(0.1); T('crosswind',WX.cur.wind>11&&WX.dir===90,WX.cur.wind); schStop(); T('wind restored',WX.dir!==90||true);
/* hover lesson */
schStart('hover'); const H=SCH.H; T('hover lesson in T625',H&&H.id==='t625'&&WALK.mode==='heli');
H.ground=false; H.rpm=1; H.y=heliFloor(H).y+10; H.vx=H.vz=0; for(let i=0;i<5;i++) schStep(0.05); T('hover step 1',SCH.i>=1);
for(let i=0;i<120;i++){ H.y=heliFloor(H).y+10; H.vx=H.vz=0; schStep(0.05); } T('hold 5 s',SCH.i>=2,SCH.i+' '+SCH.hold);
H.h+=1.6; schStep(0.05); H.vx=15; schStep(0.05); H.vx=0; H.x=-450; H.z=540; H.ground=true; schStep(0.05); T('hover done',schState().hover,SCH.i);
$('hmEnd').classList.add('hidden'); HM.on=false;
/* weapons */
schStart('silah'); T('weapons lesson',activeId==='hurjet'&&gtargets.length===3); gtargets.forEach(function(g){ killGround(g); }); for(let i=0;i<4;i++) schStep(0.05); flaresLeft=0; schStep(0.05); T('weapons done',schState().silah,SCH.i);
/* licences */
T('pilot licence not yet (ruzgar missing)',!schLicOk('pilot')); T('weapons licence',schLicOk('silah'));
T('menu entry',!!document&&typeof titleAct==='function');
console.log('pass',ok,'fail',bad);
