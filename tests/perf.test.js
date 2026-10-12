let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick');
/* FPS limit */
SETTINGS.fpsCap=null; T_('desktop default unlimited',fpsCap()===(DEV.mobile?60:0));
SETTINGS.fpsCap=30; T_('cap 30',fpsCap()===30); SETTINGS.fpsCap=0; T_('cap off',fpsCap()===0);
/* traffic: only near cars uploaded */
selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air');
T_('traffic exists',TRAFFIC.cars.length>20,TRAFFIC.cars.length);
camera.position.set(0,300,0); trafficStep(0.016); const nNear=PERF2.tr;
T_('only part of the traffic drawn',nNear<TRAFFIC.cars.length,nNear+'/'+TRAFFIC.cars.length);
T_('mesh count follows',TRAFFIC.mesh.body.count===nNear);
camera.position.set(90000,300,90000); trafficStep(0.016); T_('far away: nothing drawn',PERF2.tr===0,PERF2.tr);
/* ladder: steps up when slow at minimum resolution, down when smooth */
state='play'; SETTINGS.autoPerf=true; SETTINGS.res='auto'; PERF.scale=perfMin(); PERF2.lvl=0; PERF2.told=9;
for(let i=0;i<5;i++){ PERF.fps=20; perfLadder(); } T_('ladder level 1 after slow seconds',PERF2.lvl===1,PERF2.lvl);
T_('treeDensity reduced only at level 2+',treeDensity()===[0.35,0.7,1,1][SETTINGS.quality||0]);
for(let i=0;i<13;i++){ PERF.fps=60; perfLadder(); } T_('ladder recovers',PERF2.lvl===0,PERF2.lvl);
SETTINGS.autoPerf=false; for(let i=0;i<9;i++){ PERF.fps=10; perfLadder(); } T_('off: no ladder',PERF2.lvl===0); SETTINGS.autoPerf=true;
/* performance mode button */
$('btnPerfMode').click&&$('btnPerfMode').click(); 
T_('split toggle exists',!!$('setSplit')); T_('cap row',!!$('setCap'));
T_('split wanted when not log depth',splitWanted()===!DEV.logDepth);
console.log('pass',ok,'fail',bad);
