/* ------------------------------------------------------------------ hangar waiting area (all aircraft parked, camera flies to the selected one) */
const HANGAR={cx:-278, z:900, step:36};
const TAXI_PT=new THREE.Vector3(0,AIRFIELD_Y+6,HANGAR.z-20);
const VIEW_D={kaan:38,anka3:26,hurjet:27,hurkus:23,anka:30,aksungur:46,kizilelma:31,tb2:17,tb3:21,akinci:38};
const displays={};
function makeLabel(text){
  const c=document.createElement('canvas'); c.width=512; c.height=128; const x=c.getContext('2d');
  x.fillStyle='rgba(8,14,26,0.8)'; x.fillRect(0,18,512,92);
  x.fillStyle='#e30a17'; x.fillRect(0,18,12,92);
  x.fillStyle='#ffffff'; x.font='bold 50px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(text,262,66);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c), transparent:true, fog:false, depthWrite:false}));
  sp.scale.set(11,2.75,1); return sp;
}
