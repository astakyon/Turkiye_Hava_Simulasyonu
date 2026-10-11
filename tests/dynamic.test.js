let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('six missions generated',DYN.list.length===6,DYN.list.length);
T('3 air, 2 heli, 1 convoy',DYN.list.filter(function(e){ return e.sub==='air'; }).length===3&&DYN.list.filter(function(e){ return e.sub==='heli'; }).length===2&&DYN.list.filter(function(e){ return e.sub==='car'; }).length===1);
const a1=DYN.list.map(function(e){ return e.name; }).join('|'); dynGen(DYN.seed+99); const a2=DYN.list.map(function(e){ return e.name; }).join('|'); T('different set on regenerate',a1!==a2);
/* every template generates */
const r=mulberry32(5); ['patrol','intercept','cas','escort','uav','sea'].forEach(function(t,i){ const e=dynAir(t,r,i); T('air '+t,e&&e.obj.length>0&&e.lim>0); });
['sar','cargo','clear'].forEach(function(t,i){ const e=dynHeli(t,r,i); T('heli '+t,e&&e.M&&e.M.obj.length>0); });
T('convoy',!!dynConvoy(r));
/* run each air type through the engine */
function runAir(t){ const e=dynAir(t,mulberry32(11),0); DYN.cur=e; MISSIONS.dyn.name=e.name; MISSIONS.dyn.limit=e.lim; BMETA.dyn={xp:e.xp,dur:e.dur}; missionId='dyn'; SETTINGS.ai={enemies:0,wing:false,skill:1};
  selectedId=e.uav?'aksungur':'kaan'; setAircraft(selectedId); startGame('air'); return e; }
let e=runAir('patrol'); T('patrol starts',M.id==='dyn'&&DYN.st.i===0&&bObjective()&&/devriye/.test(bObjective().txt),bObjective()&&bObjective().txt);
e.obj.forEach(function(o){ S.pos.set(o.x,Math.max(0,terrainH(o.x,o.z))+600,o.z); S.onGround=false; update(0.05); }); T('patrol completes',M.done&&$('mendTitle').textContent==='Görev tamamlandı',DYN.st.i);
e=runAir('cas'); T('cas spawns enemies',gtargets.length>=4,gtargets.length); gtargets.forEach(function(g){ if(!g.bonus) killGround(g); }); S.onGround=false; update(0.05); T('cas completes',M.done);
e=runAir('intercept'); T('intercept targets',targets.length===e.obj[0].count); const d0=targets[0].c.length(); S.onGround=false; S.pos.set(5000,1500,5000); for(let i=0;i<40;i++) update(0.05); T('drones fly towards base',targets[0].c.length()<d0);
targets.forEach(function(t){ t.alive=false; }); update(0.05); T('intercept completes',M.done);
e=runAir('intercept'); targets.forEach(function(t){ t.c.set(100,400,100); }); S.onGround=false; S.pos.set(5000,1500,5000); update(0.05); T('intercept fails when one reaches base',M.done&&$('mendTitle').textContent==='Görev başarısız');
e=runAir('uav'); T('uav mission uses a UAV',UAVS.indexOf(activeId)>=0); e.obj.forEach(function(o){ S.pos.set(o.x,Math.max(0,terrainH(o.x,o.z))+800,o.z); S.onGround=false; for(let i=0;i<140;i++) update(0.05); }); T('uav scan completes',M.done,DYN.st.i);
e=runAir('escort'); T('escort transport',!!DYN.tr); S.onGround=false; S.pos.set(DYN.tr.p.x+200,DYN.tr.p.y,DYN.tr.p.z); for(let i=0;i<500;i++){ update(0.05); } T('enemy fighters attack',(typeof ACT!=='undefined')&&ACT.some(function(a){ return a.team==='red'; }));
e=runAir('sea'); T('sea ships picked',DYN.st.ships.length===2); e.obj.slice(0,2).forEach(function(o){ S.pos.set(o.x,500,o.z); S.onGround=false; update(0.05); }); DYN.st.ships.forEach(function(s){ const p=s.m.g.position; S.pos.set(p.x+100,300,p.z); for(let i=0;i<80;i++) update(0.05); }); T('sea patrol completes',M.done,DYN.st.i);
/* mid-mission event */
e=runAir('cas'); e.ev='sam'; DYN.cur=e; const g0=gtargets.length; S.onGround=false; M.started=true; M.t=e.lim*0.4; update(0.05); T('mid-mission SAM appears',gtargets.length===g0+1,gtargets.length-g0);
e=runAir('patrol'); e.ev='weather'; DYN.cur=e; const wx0=SETTINGS.wx; S.onGround=false; M.started=true; M.t=e.lim*0.4; update(0.05); T('weather event',SETTINGS.wx==='storm'||SETTINGS.wx==='fog'); endMission(false); T('weather restored',SETTINGS.wx===wx0);
/* heli + convoy via the board */
dynGen(1234); const sar=DYN.list.find(function(e){ return e.sub==='heli'; }); hmStart(sar.M.id); T('dyn heli mission starts',HM.on&&HM.id===sar.M.id&&WALK.mode==='heli'); hmQuit();
const cv=DYN.list.find(function(e){ return e.sub==='car'; }); hmStart(cv.M.id); T('convoy starts in a truck',HM.on&&WALK.mode==='car'&&WALK.car.K.id==='truck');
cv.M.obj.forEach(function(o){ WALK.car.x=o.x; WALK.car.z=o.z; hmStep(0.05); }); T('convoy completes',HM.ended&&/TAMAMLANDI/.test($('hmEndT').textContent)); hmQuit();
console.log('pass',ok,'fail',bad);
