let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
AC_ORDER.forEach(function(id){ displays[id].ox=0; displays[id].oz=0; displays[id].len=12; });
enterHangar(); startWalk(); buildHelis();
/* hover assist brakes to a hover */
const H=HELI.list.find(function(h){ return h.id==='t129'; }); heliBoard(H); H.rpm=1; H.ground=false; H.y=groundH(H.x,H.z)+60; H.vx=30; H.vz=0; HO.assist=true;
for(let i=0;i<300;i++) walkUpdate(0.05); T('assist brings it to a hover',Math.hypot(H.vx,H.vz)<2&&H.crashT<=0,Math.hypot(H.vx,H.vz));
HO.assist=false; H.vx=30; for(let i=0;i<60;i++) walkUpdate(0.05); T('without assist it keeps drifting',Math.hypot(H.vx,H.vz)>10,Math.hypot(H.vx,H.vz)); HO.assist=true;
/* weapons on a target */
H.x=2300; H.z=-7700; H.y=groundH(2300,-7700)+60; H.h=-Math.PI/2; H.vx=H.vz=H.vy=0; H.pitch=0.25; heliPlace(H);
const tg=htAdd('truck',2600,-7700,0); for(let i=0;i<10;i++){ heliOpsStep(0.05); }
T('target in the sight',HO.cand===tg,HO.cand&&HO.cand.n);
keys.Space=true; for(let i=0;i<20;i++){ H.vx=H.vy=H.vz=0; H.y=groundH(2300,-7700)+60; heliOpsStep(0.05); } keys.Space=false; T('gun fires',hoAmmo(H).gun<500&&HO.pj.length>0,hoAmmo(H).gun);
for(let i=0;i<80;i++) heliOpsStep(0.05); T('gun damages / kills the truck',tg.hp<0.8,tg.hp);
const tk=htAdd('tank',2600,-7720,0); H.sel='umtas'; HO.lock=null; for(let i=0;i<40;i++){ hoAimStep(0.05); } HO.cand=tk; HO.lock=tk; HO.lockT=2; hoFire(); T('umtas launched',hoAmmo(H).umtas===3&&HO.pj.some(function(p){ return p.type==='umtas'; }));
for(let i=0;i<400&&tk.alive;i++) heliOpsStep(0.05); T('umtas kills the tank',!tk.alive,tk.hp);
H.sel='cirit'; const n0=hoAmmo(H).cirit; H.mcd=0; hoFire(); T('cirit fired',hoAmmo(H).cirit===n0-1);
htClear(); HO.pj.forEach(function(p){ scene.remove(p.m); }); HO.pj.length=0;
/* rearm on a helipad */
H.x=-450; H.z=470; H.y=groundH(-450,470); H.ground=true; H.vx=H.vz=0; for(let i=0;i<100;i++) hoRearm(0.05); T('re-armed on the pad',hoAmmo(H).umtas===4&&hoAmmo(H).cirit===12);
heliExit();
/* T625: troops */
const G=HELI.list.find(function(h){ return h.id==='t625'&&h.at==='Ay Yıldız Hava Üssü'; }); WALK.pos.set(G.x+5,groundH(G.x,G.z)+1.7,G.z); heliBoard(G); G.rpm=1;
trSpawn(G.x+15,G.z+10,6,'t'); hoTroops(); for(let i=0;i<200;i++) heliOpsStep(0.05); T('troops boarded',G.troops===6&&!TROOPS.some(function(t){ return t.tag==='t'; }),G.troops+' '+TROOPS.length);
hoTroops(); T('troops unloaded',G.troops===0&&TROOPS.length===6); for(let i=0;i<100;i++) heliOpsStep(0.05); T('they walk away from the door',TROOPS.every(function(t){ return Math.hypot(t.x-G.x,t.z-G.z)>6; }));
/* T625: sling a crate */
const cr=crateAdd(G.x+40,G.z,'t'); G.ground=false; G.x=cr.x; G.z=cr.z; G.y=cr.y+14; G.vx=G.vz=G.vy=0; slingHook(); T('crate hooked',G.sling&&G.sling.o===cr);
keys.KeyR=true; for(let i=0;i<60;i++) walkUpdate(0.05); keys.KeyR=false; for(let i=0;i<20;i++) heliOpsStep(0.05); T('crate lifted',cr.y>groundH(cr.x,cr.z)+3,cr.y-groundH(cr.x,cr.z));
keys.KeyW=true; for(let i=0;i<80;i++){ walkUpdate(0.05); heliOpsStep(0.05); } keys.KeyW=false; T('crate follows',Math.hypot(cr.x-G.x,cr.z-G.z)<16&&Math.hypot(cr.x-(G.x),cr.z)>0,Math.hypot(cr.x-G.x,cr.z-G.z));
keys.KeyF=true; for(let i=0;i<200&&cr.y-groundH(cr.x,cr.z)>0.5;i++){ walkUpdate(0.05); heliOpsStep(0.05); } keys.KeyF=false; for(let i=0;i<20;i++){ walkUpdate(0.05); heliOpsStep(0.05); } slingRelease(G); T('crate set down',!G.sling&&Math.abs(cr.y-groundH(cr.x,cr.z))<0.6&&!cr.broken,cr.y-groundH(cr.x,cr.z));
/* missions */
['h_poligon','h_konvoy','h_asker','h_yuk'].forEach(function(id){ hmStart(id); T(id+' starts',HM.on&&HM.H===HELI.cur&&HELI.cur.id===HM.M.heli); });
hmStart('h_poligon'); T('poligon targets',HTGT.length===6); HTGT.forEach(htKill); hmStep(0.1); T('poligon complete',HM.ended); hmQuit(); T('cleaned',HTGT.length===0&&!HM.on);
hmStart('h_konvoy'); const c0=HTGT[0].x; htStep(5); T('convoy moves',HTGT[0].x!==c0); T('convoy on land',HTGT.every(function(t){ return groundH(t.x,t.z)>1; }));
hmStart('h_asker'); const A=HM.H; A.rpm=1; hoTroops(); for(let i=0;i<200;i++) heliOpsStep(0.05); T('asker: boarded objective',HM.i===1,HM.i);
A.x=1150; A.z=-7450; A.y=heliFloor(A).y; A.ground=true; hoTroops(); hmStep(0.1); T('asker: complete',HM.ended); hmQuit();
hmStart('h_yuk'); const Y=HM.H, C=HM.crate; T('yuk crate on land',groundH(C.x,C.z)>0.8); Y.ground=false; Y.x=C.x; Y.z=C.z; Y.y=C.y+14; slingHook(); hmEvent('hooked'); hmStep(0.1); T('yuk: hooked objective',HM.i===1,HM.i);
Y.x=5320; Y.z=-2660; Y.y=groundH(5320,-2660)+14; G.sling; for(let i=0;i<60;i++) heliOpsStep(0.05); Y.y=groundH(Y.x,Y.z)+12.5; for(let i=0;i<60;i++) heliOpsStep(0.05); slingRelease(Y); T('yuk: delivered',HM.ended,C.y-groundH(C.x,C.z)); hmQuit();
/* crash fails a mission */
hmStart('h_poligon'); heliCrash(HM.H,'test'); hmStep(0.1); T('crash fails mission',HM.ended&&/BAŞARISIZ/.test($('hmEndT').textContent)); hmQuit();
/* call air & sea */
heliExit(); HELI.cur&&(HELI.cur.ground=true); if(WALK.mode!=='foot'){ WALK.mode='foot'; HELI.cur=null; }
WALK.pos.set(900,groundH(900,-7380)+1.7,-7380);
const ch=callOrder('t625',900,-7420,{force:true}); T('heli called',ch&&CALLX.jobs.length===1);
for(let i=0;i<2400&&CALLX.jobs.length;i++) callStep(0.05); T('called heli landed near the point',ch.ground&&Math.hypot(ch.x-900,ch.z+7420)<40,ch.x+' '+ch.z+' '+ch.ground);
const sv=callOrder('mil',920,-7400,{force:true}); T('4x4 sling delivery started',sv&&CALLX.jobs.some(function(J){ return J.mode==='sling'; }));
const vj=CALLX.jobs.find(function(J){ return J.mode==='sling'; }), car=vj.c;
for(let i=0;i<3000&&vj.ph==='in';i++){ callStep(0.05); heliOpsStep(0.05); } T('4x4 set down',vj.ph==='out'&&Math.hypot(car.x-vj.tx,car.z-vj.tz)<8&&Math.abs((car.y==null?groundH(car.x,car.z):car.y)-groundH(car.x,car.z))<1,car.x+' '+car.z+' '+vj.tx+' '+vj.tz);
for(let i=0;i<700;i++){ callStep(0.05); heliOpsStep(0.05); } T('delivery heli gone',HELI.list.indexOf(vj.H)<0);
WALK.pos.set(-1990,groundH(-1990,-3440)+1.7,-3440); const bt=callOrder('patrol',-1990,-3440,{force:true}); T('boat called',!!bt,BOATS.length);
if(bt){ const bj=CALLX.jobs.find(function(J){ return J.b===bt; }); for(let i=0;i<1400&&CALLX.jobs.indexOf(bj)>=0;i++) callStep(0.05); T('boat arrived on water',terrainH(bt.x,bt.z)<-1&&CALLX.jobs.indexOf(bj)<0,terrainH(bt.x,bt.z)); WALK.pos.set(bt.x,0,bt.z); }
T('land far from sea refuses boat',callOrder('patrol',900,-7380,{force:true})===null);
drawWalkHUD(); T('hud ok',true);
console.log('pass',ok,'fail',bad);
