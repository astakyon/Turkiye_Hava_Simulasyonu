/* ------------------------------------------------------------------ covered areas (V1.85)
   • No rain or snow under a roof: particles inside the waiting hangar and the maintenance hangar are hidden,
     and the rain hiss is muffled while the camera is indoors.
   • Hangar lamps light the aircraft: indoors after dark (or under heavy cloud) the sky light becomes warm lamp light,
     so the tops of the parked aircraft are no longer black. Fades in and out smoothly at the door. */
function coveredAt(x,y,z){ const gy=AIRFIELD_Y;
  if(inHall(x,z)&&y<gy+21.2) return 'hall';
  if(inService(x,z)&&y<gy+17.6) return 'svc';
  return null; }
function camIndoor(){ const c=camera.position; return coveredAt(c.x,c.y,c.z); }
function nearCovered(){ const c=camera.position; return Math.abs(c.x+280)<420&&c.z>780&&c.z<1160&&c.y<AIRFIELD_Y+120; }
function coverMask(P,stride){ const n=P.length/stride; let h=0; for(let i=0;i<n;i++){ const o=i*stride; if(P[o+1]<-9e4) continue; if(coveredAt(P[o],P[o+1],P[o+2])||(stride===6&&coveredAt(P[o+3],P[o+4],P[o+5]))){ P[o+1]=-1e5; if(stride===6) P[o+4]=-1e5; h++; } } return h; }
wxPrecip=HOOK.wrap('wxPrecip','92-indoor#_inPrecip',function(_inPrecip){ return function(dt){ _inPrecip(dt); if(!nearCovered()) return;
  const mask=coverMask;
  if(WX.rainOn&&WX.lines){ mask(WX.lines.geometry.attributes.position.array,6); WX.lines.geometry.attributes.position.needsUpdate=true; }
  if(WX.snowOn&&WX.pts){ mask(WX.pts.geometry.attributes.position.array,3); WX.pts.geometry.attributes.position.needsUpdate=true; } }; },wxPrecip);
wxAudio=HOOK.wrap('wxAudio','92-indoor#_inAudio',function(_inAudio){ return function(){ _inAudio(); if(WX.snd&&WX.snd.g&&AC&&camIndoor()) WX.snd.g.gain.setTargetAtTime(WX.cur.rain*0.025,AC.currentTime,0.4); }; },wxAudio);
/* ---- hangar lamps: two point lights (hall follows the camera along the row of aircraft, maintenance hangar fixed).
   They are created at load with zero intensity so no shader recompiles later; range-limited so the night outside stays dark. */
const INL={k:0, hall:new THREE.PointLight(0xfff0d6,0,190,1), svc:new THREE.PointLight(0xfff0d6,0,110,1)};
INL.hall.position.set(-278,AIRFIELD_Y+19,906); INL.svc.position.set(-150,AIRFIELD_Y+15.5,1060); scene.add(INL.hall); scene.add(INL.svc);
function inDark(){ return clamp((TOD.nightK||0)+(WX.cur?WX.cur.dark*0.6:0),0,1); }
function indoorStep(dt){ const tgt=inDark(); INL.k+=(tgt-INL.k)*(1-Math.exp(-dt*2));
  const c=camera.position, near=Math.abs(c.x+280)<600&&c.z>700&&c.z<1250&&c.y<AIRFIELD_Y+300, k=near?INL.k:0;
  if(HG.X0!=null) INL.hall.position.x=clamp(c.x,HG.X0+70,HG.X1-70);
  INL.on=k; INL.hall.intensity=1.7*k; INL.svc.intensity=1.4*k; INL.hall.visible=INL.svc.visible=true; }
