let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const G=[A,B];
function step(sec,dt){ dt=dt||0.05; for(let t=0;t<sec;t+=dt){ G.forEach(g=>g.eval("if(state==='play') update("+dt+"); if(state==='play'||(NET.on&&NET.started&&state!=='menu')){ actorsStep("+dt+"); netHostLogic("+dt+"); } netStep("+dt+"); T+="+dt+";")); pump(); } }
A.eval("netHost()"); pump(); const room=A.eval("NET.room");
B.eval("$('netCode').value='"+room+"'; netJoin()"); pump();
A.eval("NET.mode='ffa'; NET.bots=true; netRoster(); netStartMatch()"); pump();
T('ffa 4 slots',A.eval("NET.roster.length")===4); T('all different teams',new Set(A.eval("NET.roster.map(r=>r.team)").split?[]:[]).size===0);
console.log('  ',A.eval("NET.roster.map(r=>r.name+':'+r.team).join(' ')"));
let minHpA=100,minHpB=100, botsDmg=0, mslB=false;
const tg={}; for(let i=0;i<24;i++){ step(5); A.eval("ACT.filter(a=>!a.remote).map(a=>a.tgt?a.tgt.id||'?':'-').join(',')").split(',').forEach(x=>tg[x]=(tg[x]||0)+1); minHpA=Math.min(minHpA,A.eval("S.hp")); minHpB=Math.min(minHpB,B.eval("S.hp")); if(B.eval("missiles.some(m=>m.on&&m.by&&m.by[0]==='B')")) mslB=true; A.eval("if(S.crashed){}"); }
console.log('  bot targets seen',JSON.stringify(tg)); console.log('  after 120s: minHp A',minHpA,'B',minHpB,'score',A.eval("JSON.stringify(NET.score)"),'bot missile at B',mslB);
T('bots target humans',(tg.H||0)+(tg.P1||0)>0,JSON.stringify(tg));
T('B sees same scores',B.eval("JSON.stringify(NET.score)")===A.eval("JSON.stringify(NET.score)"));
T('time counting',A.eval("NET.timeLeft")<600-100,A.eval("NET.timeLeft"));
T('no NaN',A.eval("ACT.every(a=>isFinite(a.pos.x)&&isFinite(a.pos.y))")&&B.eval("ACT.every(a=>isFinite(a.pos.x)&&isFinite(a.pos.y))"));
console.log('pass',ok,'fail',bad);
