let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
for(const id of Object.keys(AIRCRAFT)) for(const spd of [10,25,40]){
  selectedId=id; setAircraft(id); activeId=id; resetFlight('runway'); state='play'; S.taxi=false; S.clearance=true;
  S.pos.set(-60,AIRFIELD_Y+CUR.gearOff,SERVICE.zc+6); S.q.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2+0.05); S.speed=spd; S.throttle=0.6;
  let opened=false, minx=0, ov=false;
  for(let t=0;t<20;t+=0.05){ keys.KeyR=true; update(0.05); minx=Math.min(minx,S.pos.x); if(wallOverlap()) ov=true; if(state==='service'){ opened=true; break; } }
  keys.KeyR=false;
  T(id+' '+spd+' auto-stop opens service',opened,'minx '+minx.toFixed(1));
  T(id+' '+spd+' no wall',!ov&&minx>-195,minx.toFixed(1));
  closeService(true); T(id+' loadout kept',SLOTS[id]>0?stockTotal()>0:true);
  fwdOf(S.q,vF); T(id+' faces exit',vF.x>0.99,vF.x.toFixed(2));
  let out=false; for(let t=0;t<40;t+=0.05){ keys.KeyR=S.speed<8; update(0.05); if(wallOverlap()) ov=true; if(S.pos.x>-80){ out=true; break; } }
  keys.KeyR=false;
  T(id+' '+spd+' drives out',out&&!ov,S.pos.x.toFixed(1)+' ov '+ov);
}
console.log('pass',ok,'fail',bad);
