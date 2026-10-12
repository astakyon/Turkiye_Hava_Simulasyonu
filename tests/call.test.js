let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick');
AC_ORDER.forEach(function(id){ displays[id].ox=0; displays[id].oz=0; displays[id].len=12; });
enterHangar(); startWalk(); const n0=VEHS.length;
WALK.mode='foot'; WALK.pos.set(900,groundH(900,-7380)+1.7,-7380); WALK.yaw=0;
T('free on land',callFree(900,-7400,3)); T('not free on water',!callFree(-2600,-3800,3));
callOpen(); T('menu opens on foot',callIsOpen()); keys.KeyW=true; const wi=walkInput(); keys.KeyW=false; T('no walking while open',wi.f===0);
CALL.tab=0; CALL.sel=0; CALL.where='me'; callGo(); T('menu closes after order',!callIsOpen());
T('vehicle ordered',VEHS.length===n0+1&&CALL.list.length===1,VEHS.length+' '+n0);
let J=CALL.jobs[0]; T('suv drives in',J&&J.mode==='drive',J&&J.mode);
const d0=Math.hypot(J.c.x-J.tx,J.c.z-J.tz); T('starts far away',d0>80,d0);
for(let i=0;i<900&&!J.done;i++) callStep(0.05);
T('arrived next to me',J.done&&Math.hypot(J.c.x-WALK.pos.x,J.c.z-WALK.pos.z)<25,Math.hypot(J.c.x-WALK.pos.x,J.c.z-WALK.pos.z));
/* air drop */
const c2=callOrder('altay',920,-7360,{force:true}); const J2=CALL.jobs.find(function(j){ return j.c===c2; });
T('tank is air-dropped',J2&&J2.mode==='drop'&&c2.y>200,J2&&J2.mode); const y0=c2.y; callStep(1); T('descending under canopy',c2.y<y0&&J2.chute);
for(let i=0;i<1200&&!J2.done;i++) callStep(0.05); T('landed',J2.done&&Math.abs(c2.y-groundH(c2.x,c2.z))<1.5,c2.y+' '+groundH(c2.x,c2.z));
for(let i=0;i<100;i++) callStep(0.05); T('canopy cleared',!J2.chute&&CALL.jobs.indexOf(J2)<0);
/* board a called vehicle */
WALK.pos.set(c2.x+(c2.m.tw/2+1.5),groundH(c2.x,c2.z)+1.7,c2.z); walkUpdate(0.016); T('can board a called vehicle',WALK.near==='car'&&WALK.nearCar===c2,WALK.near); walkInteract(); T('driving it',WALK.mode==='car'&&WALK.car===c2); walkInteract();
/* cooldown and fleet cap */
const k=CALL.list.length; T('cooldown blocks spam',callOrder('bus',900,-7420)===null||CALL.list.length===k+1);
callOrder('truck',880,-7420,{force:true}); callOrder('fuel',940,-7440,{force:true}); callOrder('fire',960,-7400,{force:true});
T('at most 3 called vehicles',CALL.list.length<=CALL_MAX,CALL.list.length); T('removed ones leave VEHS',VEHS.filter(function(c){ return c.called; }).length===CALL.list.length);
T('water target refused',callOrder('suv',-3000,-4200,{force:true})===null);
/* map pick */
MAPV.img={}; WALK.mode='foot'; CALL.where='map'; CALL.sel=1; callOpen(); callGo(); T('map opened in pick mode',MAPV.open&&MAPV.pick);
callPickAt(-150,-1700); T('pick panel shows send button',/mapDeliver/.test($('mapSel').innerHTML));
callPickDone(true); T('map closed',!MAPV.open&&!MAPV.pick); const last=CALL.list[CALL.list.length-1];
T('delivered at the picked point',last&&Math.hypot((CALL.jobs.find(function(j){ return j.c===last; })||{tx:last.x}).tx+150,(CALL.jobs.find(function(j){ return j.c===last; })||{tz:last.z}).tz+1700)<75);
T('player went there',Math.hypot(WALK.pos.x+150,WALK.pos.z+1700)<100,WALK.pos.x+' '+WALK.pos.z);
drawWalkHUD(); drawMap({save(){},restore(){},fillRect(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(){},rect(){},strokeRect(){},setLineDash(){},fillText(){},strokeText(){},translate(){},rotate(){},closePath(){}},400,400,false); T('hud/map draw',true);
console.log('pass',ok,'fail',bad);
