/* ------------------------------------------------------------------ cinematic flight behind the main menu (from giris-menu, V2.25) */
/* cinematic flight behind the main menu */
const CINE={shot:0,shotT:0,fix:new THREE.Vector3(),off:new THREE.Vector3(),ang:0.6,pos:new THREE.Vector3(),fwd:new THREE.Vector3(),q:new THREE.Quaternion(),bank:0,init:false};
const cV1=new THREE.Vector3(), cV2=new THREE.Vector3(), cV3=new THREE.Vector3(), cM=new THREE.Matrix4(), cUP=new THREE.Vector3(0,1,0);
/* camera shots around the flying aircraft: f = along the nose, r = to the side, u = up (in aircraft lengths); fly = fixed camera the aircraft flies past */
const CINE_SHOTS=[{f:-0.8,r:0.75,u:0.12,dur:8},{f:1.25,r:0.7,u:0.18,dur:6},{f:-0.25,r:0.35,u:1.15,dur:6},{f:0,r:0.9,u:0.2,dur:4,fly:true},{f:0.25,r:0.95,u:-0.35,dur:6},{f:-1.3,r:0.12,u:0.22,dur:6}];
function cineOn(){ return state==='menu'&&(menuMode==='title'||menuMode==='missions'||(menuMode==='start'&&startFrom==='missions')); }
function cineStep(dt){
  const R=3300; CINE.spd=Math.max(40,AIRCRAFT[selectedId].airV*0.55); CINE.ang+=dt*CINE.spd/R;
  const a=CINE.ang; CINE.pos.set(700+Math.cos(a)*R,1350+Math.sin(a*2.3)*60,-1600+Math.sin(a)*R);
  CINE.fwd.set(-Math.sin(a),Math.cos(a*2.3)*60*2.3/R,Math.cos(a)).normalize(); CINE.bank=-0.42;
  cV1.crossVectors(CINE.fwd,cUP).normalize(); cV2.crossVectors(cV1,CINE.fwd).normalize();
  const cb=Math.cos(CINE.bank), sb=Math.sin(CINE.bank);
  cV3.copy(cV1).multiplyScalar(cb).addScaledVector(cV2,-sb); cV2.multiplyScalar(cb).addScaledVector(cV1,sb); cV1.copy(CINE.fwd).negate();
  cM.makeBasis(cV3,cV2,cV1); CINE.q.setFromRotationMatrix(cM);
}
