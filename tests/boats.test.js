let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
AC_ORDER.forEach(function(id){ displays[id].ox=0; displays[id].oz=0; displays[id].len=12; });
enterHangar(); startWalk(); T('boats built',BOATS.length===5,BOATS.length); T('ship decks',SHIPDECKS.length>=5,SHIPDECKS.length);
const pb=BOATS.find(function(b){ return b.id==='patrol'; }); WALK.pos.set(-2090,groundH(-2090,-3456)+1.7,-3456); walkUpdate(0.016);
T('near boat from the quay',WALK.near==='boat'&&WALK.nearBoat===pb,WALK.near+' '+groundH(-1992,-3990)); walkInteract(); T('boarded',WALK.mode==='boat'&&BOAT.cur===pb);
keys.KeyW=true; for(let i=0;i<60;i++) walkUpdate(0.05); keys.KeyW=false; for(let i=0;i<100;i++) walkUpdate(0.05); T('throttle up and moving west',pb.th>0.9&&pb.x<-2120,pb.th+' '+pb.x);
for(let i=0;i<200;i++) walkUpdate(0.05); T('stays on water',terrainH(pb.x,pb.z)<-0.8,terrainH(pb.x,pb.z));
keys.KeyD=true; const h0=pb.h; for(let i=0;i<100;i++) walkUpdate(0.05); keys.KeyD=false; T('rudder turns',Math.abs(pb.h-h0)>0.3,pb.h-h0);
const n0=VFX.shells.length; keys.Space=true; walkUpdate(0.05); keys.Space=false; T('boat gun',VFX.shells.length>n0);
pb.x=-2700; pb.z=-3800; walkInteract(); T('cannot leave at sea',WALK.mode==='boat');
pb.x=-2090; pb.z=-3466.5; pb.v=0; pb.th=0; walkInteract(); T('leave at the quay',WALK.mode==='foot'&&groundH(WALK.pos.x,WALK.pos.z)>0.8);
/* sail into land */
const fb=BOATS.find(function(b){ return b.id==='fishing'; }); boatBoard(fb); fb.h=Math.atan2(-(2350-fb.x),-(1250-fb.z)); fb.th=1; for(let i=0;i<600;i++) walkUpdate(0.05); T('blocked by the shore',terrainH(fb.x,fb.z)<0,terrainH(fb.x,fb.z)); boatExit();
/* helicopter lands on a ship helideck (synthetic deck: the test stub has no matrices) */
const d={x:-2600,z:-3800,y:6,r:7.5,local:new THREE.Vector3(),g:null,mover:null}; SHIPDECKS.push(d);
const H=HELI.list[0]; heliBoard(H); H.rpm=1; H.ground=false; H.x=d.x; H.z=d.z; H.y=d.y+4; H.vx=H.vz=0; H.vy=-1;
keys.KeyF=true; for(let i=0;i<200&&!H.ground;i++) walkUpdate(0.05); keys.KeyF=false; T('landed on the helideck',H.ground&&Math.abs(H.y-d.y)<0.3&&H.crashT<=0,H.y+' '+d.y+' '+H.crashT);
/* moving deck carries the helicopter */
const pos={x:-2600,z:-3700}, md={x:0,z:0,y:6,r:7.5,local:new THREE.Vector3(0,6,0),g:{updateMatrixWorld:function(){},localToWorld:function(v){ v.x+=pos.x; v.z+=pos.z; return v; }},mover:{}}; SHIPDECKS.push(md);
decksStep(); decksStep(); H.x=md.x; H.z=md.z; H.y=md.y; H.ground=true; const x0=H.x, z0=H.z;
for(let i=0;i<40;i++){ pos.x+=0.6; decksStep(); walkUpdate(0.1); } T('rides the moving ship',Math.hypot(H.x-x0,H.z-z0)>20&&Math.hypot(H.x-md.x,H.z-md.z)<1,Math.hypot(H.x-x0,H.z-z0)+' / '+Math.hypot(H.x-md.x,H.z-md.z));
console.log('pass',ok,'fail',bad);
