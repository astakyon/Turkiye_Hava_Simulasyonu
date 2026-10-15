/* ------------------------------------------------------------------ wingtip vapour at high G */
const VAP=[]; let vapT=0; const vTip=new THREE.Vector3();
(function(){
  const c=document.createElement('canvas'); c.width=64; c.height=64; const x=c.getContext('2d');
  const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(255,255,255,0.9)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=gr; x.fillRect(0,0,64,64);
  const tex=new THREE.CanvasTexture(c);
  for(let i=0;i<260;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:0,depthWrite:false})); sp.visible=false; scene.add(sp); VAP.push({sp:sp,life:0,max:1.6,size:2}); }
})();
function emitVapor(pos,size,hex,life){ for(let i=0;i<VAP.length;i++){ const v=VAP[i]; if(v.life<=0){ v.life=v.max=life||1.6; v.size=size; v.sp.material.color.setHex(hex||0xffffff); v.sp.position.copy(pos); v.sp.visible=true; return; } } }
function vaporStep(dt){
  vapT+=dt;
  if(!S.onGround&&!S.crashed&&model.tip&&(S.g>5||S.g<-1.5)&&vapT>0.03){
    vapT=0; const amt=clamp((Math.abs(S.g)-4)/6,0.3,1.2);
    [1,-1].forEach(function(sd){ vTip.set(sd*model.tip[0],model.tip[1],model.tip[2]).applyQuaternion(S.q).add(S.pos); emitVapor(vTip,2.2*amt+0.8); });
  }
  for(let i=0;i<VAP.length;i++){ const v=VAP[i]; if(v.life<=0) continue; v.life-=dt;
    if(v.life<=0){ v.sp.visible=false; continue; }
    const t=v.life/v.max; v.sp.material.opacity=0.55*t; v.sp.scale.setScalar(v.size*(1.4-0.4*t)); }
}

