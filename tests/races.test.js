let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
try{ stDel('ayy-race'); }catch(e){}
BF.cat='yaris'; T('4 races on the board',boardList().length===4); BF.cat='all';
RACES.filter(function(R){ return !R.exam; }).forEach(function(R){ const G=R.gates(); T(R.id+' gates',G.length>=8,G.length);
  if(R.veh==='boat') T('buoys on water',G.every(function(g){ return terrainH(g[0],g[2])<-4; }),G.map(function(g){ return Math.round(terrainH(g[0],g[2])); }).join(','));
  if(R.veh==='car') T('rally on land',G.every(function(g){ return groundH(g[0],g[2])>1; })); });
function drive(R){ raceStart(R.id); RACE.gates.forEach(function(g,i){ const p=racePlayerPos(); if(R.veh==='air'){ S.pos.set(g[0],g[1],g[2]); } else if(R.veh==='heli'){ const H=HELI.cur; H.x=g[0]; H.y=g[1]-1.5; H.z=g[2]; H.ground=false; } else if(R.veh==='car'){ WALK.car.x=g[0]; WALK.car.z=g[2]; WALK.car.y=g[1]-1; } else { BOAT.cur.x=g[0]; BOAT.cur.z=g[2]; } raceStep(1.5); }); }
RACES.filter(function(R){ return !R.exam; }).forEach(function(R){ drive(R); T(R.id+' finishes',!RACE.def&&raceBest(R.id)>0,RACE.i+' '+raceBest(R.id)); T(R.id+' ghost saved',(raceStore()[R.id].ghost||[]).length>5); $('hmEnd').classList.add('hidden'); HM.on=false; });
/* second run: ghost appears, board keeps top 5 */
drive(RACES[2]); T('second run on the board',raceStore().r_car.board.length===2); $('hmEnd').classList.add('hidden'); HM.on=false;
raceStart('r_car'); T('ghost model loaded',!!RACE.gm&&!!RACE.ghost); raceStop();
openMissions(); BF.cat='yaris'; misSel=0; renderMissions(); T('board shows best time',/En iyi/.test($('misChips').innerHTML)); BF.cat='all';
console.log('pass',ok,'fail',bad);
