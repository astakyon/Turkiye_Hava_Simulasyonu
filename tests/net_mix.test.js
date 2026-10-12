let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const G=[A,B,C];
function step(sec,dt){ dt=dt||0.05; for(let t=0;t<sec;t+=dt){ G.forEach(g=>g.eval("if(state==='play') update("+dt+"); if(state==='walk') walkUpdate("+dt+"); if(state==='play'||(NET.on&&NET.started&&state!=='menu')){ actorsStep("+dt+"); netHostLogic("+dt+"); } netStep("+dt+"); netMix("+dt+"); T+="+dt+";")); pump(); } }
A.eval("$('netName').value='Ali'; netHost()"); pump();
const room=A.eval("NET.room");
B.eval("$('netName').value='Berk'; $('netCode').value='"+room+"'; netJoin()"); pump();
C.eval("$('netName').value='Cem'; $('netCode').value='"+room+"'; netJoin()"); pump();
T('3 joined',A.eval("NET.roster.length")===3);
/* tower role from the lobby */
C.eval("netPickRole('atc')"); pump(); T('C role atc on host',A.eval("NET.roster.find(r=>r.id==='P2').role")==='atc');
/* base mode */
A.eval("NET.mode='base'; NET.bots=false; netRoster()"); pump();
A.eval("NET.roster.find(r=>r.id==='H').team='blue'; NET.roster.find(r=>r.id==='P1').team='red'; netRoster()"); pump();
A.eval("netStartMatch()"); pump();
T('mode base everywhere',G.every(g=>g.eval("NET.mode")==='base'),G.map(g=>g.eval("NET.mode")).join());
T('A, B fly',A.eval("state")==='play'&&B.eval("state")==='play');
T('C is tower',C.eval("state")==='atc'&&C.eval("NB.atc")===true,C.eval("state"));
step(1);
T('tower sends not alive',A.eval("(actById('P2')||{}).m")==='atc',A.eval("(actById('P2')||{}).m"));
/* B leaves the aircraft and walks */
B.eval("pauseGame(); startWalk()");
T('B walking in the match',B.eval("state")==='walk',B.eval("state"));
T('B still sees others',B.eval("ACT.length")>=2,B.eval("ACT.length"));
step(1);
T('A sees B on foot',A.eval("actById('P1').m")==='foot',A.eval("actById('P1').m"));
T('A has proxy for B',!!A.eval("actById('P1').px"));
/* B takes a car */
/* zone capture: put host plane low over the air base (blue), B (red) far away */
A.eval("S.pos.set(100,200,100); S.speed=60");
B.eval("WALK.mode='foot'; WALK.pos.set(-1750,3,-3800)");
let caps=0; for(let i=0;i<12;i++){ A.eval("S.pos.set(100,200,100)"); step(1); }
T('air base blue',A.eval("NB.zones[0].o")==='blue',A.eval("JSON.stringify(NB.zones)"));
T('naval base red',A.eval("NB.zones[1].o")==='red',A.eval("JSON.stringify(NB.zones)"));
T('zones synced to C',C.eval("NB.zones[0].o")==='blue'&&C.eval("NB.zones[1].o")==='red');
for(let i=0;i<6;i++){ A.eval("S.pos.set(100,200,100)"); step(1); }
T('score grows',A.eval("NB.sc.blue")>=1&&A.eval("NB.sc.red")>=1,A.eval("JSON.stringify(NB.sc)"));
T('score synced',B.eval("NB.sc.blue")===A.eval("NB.sc.blue"));
/* high aircraft does not capture */
A.eval("NB.zones[2].o=null; NB.zones[2].p=0; S.pos.set(1150,2000,-7550)"); for(let i=0;i<4;i++){ A.eval("S.pos.set(1150,2000,-7550)"); step(1); }
T('high aircraft cannot capture',A.eval("NB.zones[2].p")===0,A.eval("NB.zones[2].p"));
/* B boards an aircraft again */
B.eval("walkLeave(); startGame('hangar')"); step(1);
T('B flying again',B.eval("state")==='play'&&B.eval("ACT.length")>=2,B.eval("state")+' '+B.eval("ACT.length"));
T('A sees B in the air',A.eval("actById('P1').m")==='air'&&A.eval("NET.started")===true);
/* chat */
B.eval("nbChatSend('selam kule')"); pump();
T('chat at host',A.eval("NB.chat.some(c=>c.t==='selam kule'&&c.n.indexOf('Berk')>=0)"));
T('chat relayed to C',C.eval("NB.chat.some(c=>c.t==='selam kule')"));
T('chat escapes html',(A.eval("nbChatIn({name:'x',text:'<b>y</b>'}); $('chatLog').innerHTML")||'').indexOf('<b>y</b>')<0);
/* tower: mark + radio */
C.eval("nbMarkSend(500,500)"); pump();
T('mark reached A and B',A.eval("NB.marks.length")===1&&B.eval("NB.marks.length")===1);
step(1); T('mark expires later',A.eval("NB.marks[0].t")<60&&A.eval("NB.marks[0].t")>50);
/* win */
A.eval("NB.sc.blue=99; NB.tick=4.99"); A.eval("S.pos.set(100,200,100)"); step(0.1);
T('first to 100 wins',A.eval("NET.ended")===true||A.eval("NB.sc.blue")>=100,A.eval("JSON.stringify(NB.sc)"));
/* kick (fresh lobby) */
G.forEach(g=>g.eval("netLeave(true)")); pump();
A.eval("netHost()"); pump(); const r2=A.eval("NET.room");
B.eval("$('netCode').value='"+r2+"'; netJoin()"); pump();
T('B rejoined',A.eval("NET.roster.length")===2,A.eval("NET.roster.length"));
A.eval("nbChatSend('/at berk')"); pump();
T('kicked from host roster',A.eval("NET.roster.length")===1,A.eval("NET.roster.length"));
T('B left',B.eval("NET.on")===false,B.eval("NET.on"));
console.log('pass',ok,'fail',bad);
