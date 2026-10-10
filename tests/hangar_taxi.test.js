let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
// a human-like driver: leaves the hall, follows the taxiway, then turns into the maintenance hangar (before take-off clearance)
function drive(wps,maxT){
  let w=0, jumps=0, last=S.pos.clone(), t=0;
  for(;t<maxT&&w<wps.length;t+=0.05){
    const p=wps[w]; fwdOf(S.q,vF); const hd=Math.atan2(vF.x,-vF.z); let err=Math.atan2(p[0]-S.pos.x,-(p[1]-S.pos.z))-hd; err=Math.atan2(Math.sin(err),Math.cos(err));
    keys.KeyD=err>0.04; keys.KeyA=err<-0.04; const want=Math.abs(err)>0.5?4:9; keys.KeyR=S.speed<want; keys.KeyF=S.speed>want+2;
    update(0.05); if(state==='service') break;
    if(S.pos.distanceTo(last)>3) jumps++; last.copy(S.pos);
    if(Math.hypot(p[0]-S.pos.x,p[1]-S.pos.z)<8) w++;
  }
  ['KeyD','KeyA','KeyR','KeyF'].forEach(function(k){ keys[k]=false; });
  return {w:w,jumps:jumps,t:t};
}
for(const id of AC_ORDER){
  selectedId=id; setAircraft(id); activeId=id; resetFlight('hangar'); state='play';
  const x0=S.pos.x;
  const r=drive([[x0,846],[-100,842],[-75,860],[-62,900],[-62,1000],[-64,1060],[-110,1060],[-150,1060],[-175,1060]],260);
  T(id+' reaches maintenance hangar',state==='service','wp '+r.w+' pos '+S.pos.x.toFixed(0)+','+S.pos.z.toFixed(0));
  T(id+' no teleport',r.jumps===0,r.jumps);
  if(state==='service') closeService(true);
}
console.log('pass',ok,'fail',bad);
