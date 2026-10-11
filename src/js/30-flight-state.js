/* ------------------------------------------------------------------ flight state */
const S = { pos:new THREE.Vector3(), q:new THREE.Quaternion(), speed:0, throttle:0, ab:false, gear:true, brake:false,
  onGround:true, sink:0, crashed:false, crashT:0, crashReason:'', pitchIn:0, rollIn:0, yawIn:0, g:1, vy:0 };
let state='menu', startMode='runway', camMode=0, invertY=false, muted=false;
let T=0, camSnap=true;
const camQ=new THREE.Quaternion(), tiltQ=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-0.06);
const keys={};

let score=0, kills=0, ringIdx=0, courseT=null, bestCourse=null, allDeadT=0;
const msgs=[];
function toast(text,color){ msgs.push({text,color:color||'#b8ecff',t:3.2}); if(msgs.length>4) msgs.shift(); }
function fmtT(t){ const m=Math.floor(t/60), s=t-m*60; return String(m).padStart(2,'0')+':'+(s<10?'0':'')+s.toFixed(1); }

function resetFlight(mode){
  S.crashed=false; S.sink=0; S.pitchIn=S.rollIn=S.yawIn=0; S.g=1; S.ab=false; S.brake=false; S.auto=false; flaresLeft=FLARES[activeId]||0; S.hp=100; clearThreats(); applyLoadout(activeId);
  S.zoneY=AIRFIELD_Y;
  if(mode==='hangar'){ const dd=displays[activeId]; S.pos.set(dd.x,AIRFIELD_Y+CUR.gearOff,HANGAR.z); S.q.identity(); S.speed=0; S.throttle=0; S.gear=true; S.onGround=true; S.taxi=true; S.clearance=false; startTaxi(); }
  else if(mode==='runway'){ S.pos.set(0,AIRFIELD_Y+CUR.gearOff,1150); S.q.identity(); S.speed=0; S.throttle=0; S.gear=true; S.onGround=true; S.taxi=false; S.clearance=true; }
  else{ S.pos.set(0,1100,900); S.q.identity(); S.speed=CUR.airV; S.throttle=0.75; S.gear=false; S.onGround=false; S.taxi=false; S.clearance=true; if(NET.on&&NET.started) netSpawnMe(); }
  applyStartPlace(mode);
  camQ.copy(S.q); camSnap=true; planeGroup.visible=true;
  ringIdx=0; courseT=null; updateRingVisuals();
}


/* start somewhere other than the main base (map → "Buradan başla"): UAV centre / enemy airfield runways, or in the air above a place */
function applyStartPlace(mode){
  const id=SETTINGS.startPlace; if(!id||NET.on) return; const p=placeById(id); if(!p) return;
  if(p.rw&&p.rw!=='main'&&mode!=='air'){ const z=LZONES.find(function(L){ return L.id===p.rw; }); if(!z) return;
    S.speed=0; S.throttle=0; S.gear=true; S.onGround=true; S.taxi=false; S.clearance=true; S.auto=false; S.zoneY=z.y;
    if(p.rw==='uav'){ S.pos.set(UAV.rw.x,z.y+CUR.gearOff,UAV.rw.z1-80); S.q.identity(); }
    else { S.pos.set(z.x0+80,z.y+CUR.gearOff,(z.z0+z.z1)/2); S.q.setFromAxisAngle(UP,-Math.PI/2); }
    if(typeof stopTaxi==='function') stopTaxi(); return; }
  let hi=Math.max(0,terrainH(p.x,p.z)); for(let k=0;k<8;k++){ const a=k/8*6.28; hi=Math.max(hi,terrainH(p.x+Math.cos(a)*700,p.z+Math.sin(a)*700)); }
  S.pos.set(p.x,Math.max(hi+400,700),p.z+1000); S.q.identity(); S.speed=CUR.airV; S.throttle=0.75; S.gear=false; S.onGround=false; S.taxi=false; S.clearance=true; S.auto=false;
}
