let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const G=[A,B,C];
function step(sec,dt){ dt=dt||0.05; for(let t=0;t<sec;t+=dt){ G.forEach(g=>g.eval("if(NET.on||true){ if(state==='play') update("+dt+"); if(state==='play'||(NET.on&&NET.started&&state!=='menu')){ actorsStep("+dt+"); netHostLogic("+dt+"); } netStep("+dt+"); T+="+dt+"; }")); pump(); } }
A.eval("$('netName').value='Ali'; netHost()"); pump();
const room=A.eval("NET.room"); T('room code',/^[A-Z0-9]{5}$/.test(room),room);
T('host roster',A.eval("NET.roster.length")===1);
B.eval("$('netName').value='Berk'; $('netCode').value='"+room.toLowerCase()+"'; netJoin()"); pump();
C.eval("$('netName').value='Cem'; $('netCode').value='"+room+"'; netJoin()"); pump();
T('3 in roster',A.eval("NET.roster.length")===3,A.eval("NET.roster.length"));
T('B id',B.eval("NET.myId")==='P1'); T('C sees roster',C.eval("NET.roster.map(r=>r.name).join(',')")==='Ali,Berk,Cem',C.eval("NET.roster.map(r=>r.name).join(',')"));
// wrong code
const D=C; 
// change aircraft from lobby
B.eval("netPick('hurjet',null)"); pump(); T('pick relayed',A.eval("NET.roster.find(r=>r.id==='P1').ac")==='hurjet');
// team match with bots
A.eval("NET.mode='team'; NET.bots=true; netRoster()"); pump();
A.eval("netStartMatch()"); pump();
T('all playing',G.every(g=>g.eval("state")==='play'),G.map(g=>g.eval("state")).join());
T('A actors 3',A.eval("ACT.length")===3,A.eval("ACT.map(a=>a.id+':'+a.team+':'+(a.remote?'R':'L')).join(' ')"));
T('B actors 3 remote',B.eval("ACT.length===3&&ACT.every(a=>a.remote)"),B.eval("ACT.map(a=>a.id+(a.remote?'R':'L')).join(' ')"));
T('B flies hurjet',B.eval("activeId")==='hurjet');
console.log('  teams:',A.eval("NET.roster.map(r=>r.name+':'+r.team).join(' ')"));
T('spawns differ',A.eval("S.pos.distanceTo(new THREE.Vector3())")>3000&&B.eval("S.pos.x")!==A.eval("S.pos.x"));
step(3);
const dSync=B.eval("(function(){ const a=actById('H'); return a.pos.distanceTo(new THREE.Vector3("+A.eval("S.pos.x")+","+A.eval("S.pos.y")+","+A.eval("S.pos.z")+")); })()");
T('host position synced on B',dSync<120,dSync);
const dBot=C.eval("(function(){ const a=actById('B1'); return a?a.pos.distanceTo(new THREE.Vector3("+A.eval("actById('B1').pos.x")+","+A.eval("actById('B1').pos.y")+","+A.eval("actById('B1').pos.z")+")):-1; })()");
T('bot synced on C',dBot>=0&&dBot<150,dBot);
// hit routing: B shoots host
const hp0=A.eval("S.hp"); B.eval("registerHit(actById('H'),30,NET.myId)"); pump();
T('hit reaches host',A.eval("S.hp")===hp0-30,A.eval("S.hp"));
// C (P2) shoots B (P1)
const hpB=B.eval("S.hp"); C.eval("registerHit(actById('P1'),20,NET.myId)"); pump();
T('hit relayed client->client',B.eval("S.hp")===hpB-20,B.eval("S.hp"));
// kill + score (Berk red vs Ali blue?)
const tA=A.eval("myTeam()"), tB=B.eval("myTeam()");
A.eval("S.hp=10"); B.eval("registerHit(actById('H'),30,NET.myId)"); pump();
T('host crashed',A.eval("S.crashed")===true);
T('score to killer (enemy team)',tA!==tB?B.eval("NET.score.P1.k")===1:true,B.eval("JSON.stringify(NET.score)"));
T('death counted',C.eval("NET.score.H.d")===1);
step(4); A.eval("S.hp=10"); C.eval("registerHit(actById('H'),30,NET.myId)"); pump(); T('enemy kill scored',B.eval("NET.score.P2.k")===1,B.eval("JSON.stringify(NET.score)")); T('teamkill not scored',B.eval("NET.score.P1.k")===0);
step(4); T('host respawned',A.eval("S.crashed")===false&&A.eval("S.hp")===100);
// missile to remote human
A.eval("LOADOUTS[activeId]={gp:0,bnk:0,m1:4,m2:0,m3:0}; applyLoadout(activeId); selW='m1'; lockTgt=actById('P1'); lockT=2; bombCd=0;");
const ok1=A.eval("launchMissile()"); pump();
T('A launched ghost missile',ok1&&A.eval("amis.some(m=>m.on&&m.ghost)"));
T('B got real incoming missile',B.eval("missiles.some(m=>m.on&&!m.vic&&m.by==='H')"));
// bot gets damaged by a client
const bhp=A.eval("actById('B1').hp"); C.eval("registerHit(actById('B1'),8,NET.myId)"); pump();
T('client hit on host bot',A.eval("actById('B1').hp")===bhp-8);
// leaving
C.eval("netLeave()"); pump();
T('C removed from host roster',!A.eval("NET.roster.some(r=>r.id==='P2')")); T('C actor removed',!A.eval("!!actById('P2')"));
// end + back to lobby + coop waves
A.eval("netFinish('test')"); pump(); T('B sees end',B.eval("state")==='mend'&&B.eval("NET.ended"));
A.eval("netBackToLobby()"); pump(); T('B back in lobby',B.eval("state")==='menu'&&!B.eval("NET.started"));
A.eval("NET.mode='coop'; NET.bots=false; netRoster(); netStartMatch()"); pump();
T('coop started',B.eval("state")==='play'&&B.eval("NET.mode")==='coop');
step(6);
T('wave 1 spawned on host',A.eval("NET.wave")===1&&A.eval("ACT.filter(a=>a.team==='red').length")>0,A.eval("NET.wave"));
T('client knows reds',B.eval("ACT.filter(a=>a.team==='red').length")===A.eval("ACT.filter(a=>a.team==='red').length"));
step(30);
const near=B.eval("ACT.filter(a=>a.team==='red'&&a.alive).length"); T('reds alive on client view',near>0,near);
// host quits -> client returns
A.eval("netLeave()"); pump(); T('client notified host left',B.eval("NET.on")===false&&B.eval("state")==='menu',B.eval("NET.on")+' '+B.eval("state"));
T('mission restored',B.eval("missionId")!=='net',B.eval("missionId"));
console.log('pass',ok,'fail',bad);
