let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air');
T('full tank at start',S.fuel===1&&S.eng===0);
S.pos.set(3000,1500,3000); S.q.identity(); S.throttle=1; for(let i=0;i<600;i++) update(0.05); const f30=S.fuel; T('fuel burns',f30<0.97&&f30>0.6,f30);
S.ab=true; keys.ShiftLeft=true; const fa=S.fuel; for(let i=0;i<200;i++) update(0.05); keys.ShiftLeft=false; T('afterburner burns faster',(fa-S.fuel)/10>(1-f30)/30*1.8,(fa-S.fuel)+' '+(1-f30));
/* empty tank -> flame-out */
S.fuel=0.0001; S.throttle=1; const v0=S.speed; for(let i=0;i<200;i++) update(0.05); T('engine stops when empty',engineDead()&&dmgThrust()===0,S.fuel); T('glides (loses speed or height)',S.speed<v0||S.pos.y<1500);
/* hits: sub-system damage */
resetFlight('air'); S.pos.set(3000,1500,3000); let types={};
for(let i=0;i<40;i++){ S.hp=100; S.eng=0; S.leak=0; S.wingL=S.wingR=0; S.efire=0; damagePlayer(20,'test'); if(S.eng>0) types.eng=1; if(S.leak>0) types.leak=1; if(S.wingL>0||S.wingR>0) types.wing=1; }
T('hits damage engine, fuel and wings',types.eng&&types.leak&&types.wing,JSON.stringify(types));
S.hp=100; S.eng=0.5; S.efire=0; S.leak=0; S.wingL=S.wingR=0; T('damaged engine gives less thrust',dmgThrust()<0.8&&dmgThrust()>0);
S.efire=1; for(let i=0;i<40;i++) update(0.05); T('engine fire ends in engine failure',S.eng>=1&&engineDead(),S.eng);
resetFlight('air'); T('reset clears damage',S.eng===0&&!S.efire&&S.fuel===1);
S.pos.set(3000,1500,3000); S.q.identity(); S.wingL=1.2; const r0=new THREE.Vector3(1,0,0).applyQuaternion(S.q).y; for(let i=0;i<40;i++) update(0.05); S.wingL=0; T('damaged wing makes it roll',S.q.x!==0||S.q.z!==0);
/* refuel on the runway */
resetFlight('runway'); S.fuel=0.3; S.throttle=0; S.speed=0; for(let i=0;i<300;i++) update(0.05); T('refuels on the runway',S.fuel>0.9,S.fuel);
/* service hangar repairs everything */
S.eng=0.4; S.leak=0.01; S.wingR=0.6; T('needs service',needsService()); dmgReset(); T('service reset',!needsService()||S.hp<100);
/* ejection */
resetFlight('air'); S.pos.set(2500,900,-1000); S.q.identity(); S.speed=150; S.throttle=0.7; S.hp=40;
ejArm(); T('first press only arms',!EJ.on); ejArm(); T('ejected',EJ.on&&S.ejected,EJ.on);
const y0=EJ.p.y; update(0.5); T('seat goes up',EJ.p.y>y0,EJ.p.y-y0);
for(let i=0;i<40;i++) update(0.05); T('chute open',EJ.ph==='chute'&&!!EJ.chute,EJ.ph);
let n=0; while(EJ.on&&n<6000){ update(0.05); n++; } T('landed and walking',!EJ.on&&state==='walk',state+' '+EJ.ph+' '+EJ.p.y);
T('pilot-less jet crashed',S.crashed);
T('on the ground',Math.abs(WALK.pos.y-groundH(WALK.pos.x,WALK.pos.z)-1.7)<0.5);
/* uav cannot eject */
selectedId='anka'; setAircraft('anka'); startGame('air'); S.pos.set(2500,900,-1000); ejArm(); ejArm(); T('uav has no seat',!EJ.on);
/* water landing */
selectedId='kaan'; setAircraft('kaan'); startGame('air'); S.pos.set(-6000,900,0); S.q.identity(); S.speed=150; ejectNow(); n=0; while(EJ.on&&n<6000){ update(0.05); n++; }
T('rescued to shore after sea landing',state==='walk'&&groundH(WALK.pos.x,WALK.pos.z)>1,groundH(WALK.pos.x,WALK.pos.z));
/* fuel off */
startGame('air'); SETTINGS.fuel='off'; S.throttle=1; const f0=S.fuel; for(let i=0;i<200;i++) update(0.05); T('fuel off: no burn',S.fuel===f0); SETTINGS.fuel='on';

console.log('pass',ok,'fail',bad);
