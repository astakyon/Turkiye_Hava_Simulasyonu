let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
BF.cat='all'; BF.diff=0; BF.dur='all'; BF.sort='def';
T('board has aircraft and helicopter missions',boardList().length===MORDER.length+HMIS.length,boardList().length);
BF.cat='heli'; T('category filter',boardList().length===HMIS.length&&boardList().every(function(e){ return e.kind==='heli'; }));
BF.cat='all'; BF.diff=3; T('difficulty filter',boardList().length>=1&&boardList().every(function(e){ return bMeta(e).diff===3; }));
BF.diff=0; BF.dur='short'; T('duration filter',boardList().every(function(e){ const m=bMeta(e); return m.dur>0&&m.dur<=7; }));
BF.dur='all'; BF.sort='xp'; const L=boardList(); T('reward sort',L.every(function(e,i){ return i===0||bMeta(L[i-1]).xp>=bMeta(e).xp; }));
BF.sort='def';
openMissions(); T('board renders',/mitem/.test($('misList').innerHTML)&&/Hedefler/.test($('misBrief').innerHTML),$('misBrief').innerHTML.slice(0,80));
misSel=boardList().findIndex(function(e){ return e.id==='strike'; }); renderMissions(); T('briefing shows threats and loadout',/SAM/.test($('misBrief').innerHTML)&&/Önerilen yük/.test($('misBrief').innerHTML));
/* helicopter mission from the board */
misSel=boardList().findIndex(function(e){ return e.id==='h_asker'; }); misGo(); T('heli mission starts from board',HM.on&&HM.id==='h_asker'&&state==='walk'); hmQuit();
/* free flight with a helicopter */
enterHangar(); openMissions(); BVEH.v='t129'; misSel=boardList().findIndex(function(e){ return e.id==='free'; }); misGo(); T('free flight in a helicopter',state==='walk'&&WALK.mode==='heli'&&HELI.cur&&HELI.cur.id==='t129'); BVEH.v='plane';
/* aircraft mission: objective line, log, report */
heliExit&&HELI.cur&&(HELI.cur.ground=true); enterHangar();
selectedId='kaan'; setAircraft('kaan'); selectMission('strike'); SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air');
const o=bObjective(); T('objective tracking',o&&/yer hedefi/.test(o.txt)&&o.tgt,o&&o.txt);
toast('Test olayı'); T('log records events',MLOG.some(function(l){ return l.text==='Test olayı'; }));
bLogToggle(true); T('log panel',BLOG.open&&/GÖREV GÜNLÜĞÜ/.test($('mlog').innerHTML)); bLogToggle(false);
M.started=true; M.t=100; B_STAT.minHp=90; gtargets.forEach(function(g){ g.alive=false; }); endMission(true);
T('report has stars',/stars/.test($('mendStats').innerHTML)&&bStars('strike')===3,bStars('strike'));
T('report has stats',/PUAN/.test($('mendStats').innerHTML)&&/ÖDÜL/.test($('mendStats').innerHTML));
/* door gun */
startWalk(); buildHelis(); const G=HELI.list.find(function(h){ return h.id==='t625'; }); heliBoard(G); G.rpm=1; G.ground=false; G.y=groundH(G.x,G.z)+40; G.h=0; G.vx=G.vz=G.vy=0;
const n0=hoAmmo(G).door; keys.Space=true; for(let i=0;i<10;i++){ G.y=groundH(G.x,G.z)+40; heliOpsStep(0.05); } keys.Space=false; T('T625 door gun fires',hoAmmo(G).door<n0&&HO.pj.length>0,hoAmmo(G).door);
T('door gun fires to the right',HO.pj.length&&HO.pj[0].v.x-G.vx>100,HO.pj.length&&HO.pj[0].v.x);
console.log('pass',ok,'fail',bad);
