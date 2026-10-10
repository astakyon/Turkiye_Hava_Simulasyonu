/* ------------------------------------------------------------------ HUD */
const hud=$('hud'), hx=hud.getContext('2d');
let HW=1,HH=1,DPR=1,sc=1;
const C='#b8ecff', CD='rgba(184,236,255,0.5)', RED='#ff4a4a', AMB='#ffc24a';
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2); HW=window.innerWidth; HH=window.innerHeight;
  hud.width=Math.round(HW*DPR); hud.height=Math.round(HH*DPR);
  renderer.setSize(HW,HH,false); camera.aspect=HW/HH; camera.updateProjectionMatrix();
  if(typeof fxResize==='function') fxResize();
}
window.addEventListener('resize',function(){ resize(); if(typeof refreshTitle==='function'&&state==='menu'&&menuMode==='title') refreshTitle(); }); resize();

function ln(x1,y1,x2,y2){ hx.beginPath(); hx.moveTo(x1,y1); hx.lineTo(x2,y2); hx.stroke(); }
function tx(s,x,y,size,align,color){ hx.font='600 '+(size*sc)+'px '+FONT; hx.textAlign=align||'center'; hx.fillStyle=color||C; hx.fillText(s,x,y); }
const sv=new THREE.Vector3(), sv2=new THREE.Vector3(), fpV=new THREE.Vector3();
function toScreen(p){
  sv.copy(p).sub(camera.position); const front=sv.dot(camFwd)>0;
  sv2.copy(p).project(camera);
  return {x:(sv2.x*.5+.5)*HW, y:(-sv2.y*.5+.5)*HH, front, loc:sv.applyQuaternion(camInv)};
}
function vTape(x,cy,value,pxu,minor,major,side,box,label){
  const half=140*sc;
  hx.save(); hx.beginPath(); hx.rect(x-70*sc,cy-half,140*sc,half*2); hx.clip();
  const vmin=value-half/pxu, vmax=value+half/pxu;
  for(let v=Math.ceil(vmin/minor)*minor; v<=vmax; v+=minor){
    const y=cy-(v-value)*pxu, isMaj=Math.abs(v%major)<1e-6; const len=(isMaj?14:8)*sc;
    ln(x,y,x+side*len,y);
    if(isMaj) tx(String(Math.round(v)),x+side*(len+6*sc),y,12,side<0?'right':'left',CD);
  }
  hx.restore();
  ln(x,cy-half,x,cy+half);
  const bw=76*sc, bh=26*sc, bx=x+side*(bw/2+4*sc);
  hx.fillStyle='rgba(4,14,26,0.72)'; hx.fillRect(bx-bw/2,cy-bh/2,bw,bh); hx.strokeRect(bx-bw/2,cy-bh/2,bw,bh);
  tx(box,bx,cy+1*sc,16,'center',C);
  tx(label,x+side*(bw/2+4*sc),cy-half-12*sc,11,'center',CD);
}
function hudHealth(x,y){
  const hp=clamp(S.hp,0,100)/100, col=hp>0.6?'#5dff8a':(hp>0.3?AMB:RED), bw=176*sc, bh=13*sc, by=y+10*sc;
  tx(CUR.name+'  ·  '+CUR.weapon,x,y,14,'left',CD);
  hx.save(); hx.shadowBlur=0; hx.fillStyle='rgba(4,12,22,0.62)'; hx.fillRect(x,by,bw,bh);
  const flick=(hp<0.3)?(0.65+0.35*Math.sin(T*12)):1; hx.globalAlpha=flick; hx.fillStyle=col; hx.fillRect(x,by,bw*hp,bh); hx.globalAlpha=1;
  hx.strokeStyle=C; hx.lineWidth=1.3*sc; hx.strokeRect(x,by,bw,bh);
  for(let i=1;i<4;i++){ hx.strokeStyle='rgba(184,236,255,0.35)'; ln(x+bw*i/4,by,x+bw*i/4,by+bh); }
  hx.restore();
  tx('CAN',x,by+bh+13*sc,12,'left',CD); tx('%'+Math.round(hp*100),x+bw,by+bh+14*sc,16,'right',col);
}
function hudWeapons(cx,h,tch){
  const items=WORDER.filter(function(k){ return INV[k]>0; });
  const list=tch?['gun'].concat(items):items;
  let bw=tch?Math.max(60*sc,56):60*sc, bh=tch?Math.max(44*sc,42):44*sc, gap=6*sc; const fw=tch?0:72*sc;
  let ccx=cx, y=h-(tch?14+bh/sc:62)*sc;
  if(tch&&TLAY.ok){ ccx=(TLAY.L+TLAY.R)/2; const avail=TLAY.R-TLAY.L; const need=list.length*(bw+gap)-gap; if(need>avail){ const f=avail/need; bw*=f; gap*=f; } y=h-bh-12; }
  const total=list.length*(bw+gap)-(fw?0:gap)+fw;
  let x=ccx-total/2; WBOX=[];
  const armK=tch?TOUCH.arm:selW;
  if(items.length||tch){ const nm=armK==='gun'?(CUR.weapon==='TOP'?'TOP (MAKİNELİ)':'MÜHİMMAT'):WEAPONS[armK].name; tx(nm,ccx,y-9*sc,11,'center','#ffb25a'); }
  list.forEach(function(k,i){
    const sel=(k===armK), col=sel?'#ff9a2e':CD;
    hx.save(); hx.shadowBlur=0; hx.fillStyle=sel?'rgba(255,154,46,0.30)':'rgba(4,12,22,0.6)'; hx.fillRect(x,y,bw,bh);
    hx.strokeStyle=col; hx.lineWidth=(sel?2.4:1.2)*sc; hx.strokeRect(x,y,bw,bh); hx.restore();
    if(k==='gun'){ tx(CUR.weapon==='TOP'?'TOP':'MÜH.',x+bw/2,y+14*sc,13,'center',sel?'#ffd9a8':C); tx('∞',x+bw/2,y+31*sc,19,'center',sel?'#ffffff':C); }
    else { if(!tch) tx(String(i+1),x+7*sc,y+10*sc,10,'left',CD); tx(WEAPONS[k].short,x+bw/2,y+14*sc,13,'center',sel?'#ffd9a8':C); tx(String(INV[k]),x+bw/2,y+31*sc,19,'center',sel?'#ffffff':C); }
    WBOX.push({k:k,x:x,y:y,w:bw,h:bh}); x+=bw+gap;
  });
  WPANEL=(tch&&WBOX.length)?{x:WBOX[0].x-4,y:y,w:total+8,h:bh}:null;
  if(fw){ hx.save(); hx.shadowBlur=0; hx.fillStyle='rgba(4,12,22,0.6)'; hx.fillRect(x,y,fw,bh); hx.strokeStyle=CD; hx.lineWidth=1.2*sc; hx.strokeRect(x,y,fw,bh); hx.restore();
    tx('FLARE',x+fw/2,y+14*sc,12,'center',CD); tx(String(flaresLeft),x+fw/2,y+31*sc,19,'center',flaresLeft>0?C:RED); }
  if(!items.length&&SLOTS[activeId]>0&&!tch) tx('SİLAH YOK — BAKIM HANGARI',cx,y-9*sc,12,'center',AMB);
}
function hudPipper(w,h){
  if(WEAPONS[selW].kind!=='bomb'||INV[selW]<=0||S.onGround||S.crashed) return;
  const ip=ccipPoint(); if(!ip) return; const cs=toScreen(ip);
  if(!(cs.front&&cs.x>20&&cs.x<w-20&&cs.y>20&&cs.y<h-20)) return;
  const W=WEAPONS[selW], rr=W.r*assistMul();
  const near=SETTINGS.bombAssist!=='off'&&gtargets.some(function(o){ return o.alive&&Math.hypot(o.pos.x-ip.x,o.pos.z-ip.z)<=rr*0.85; });
  const cc=near?'#5dff8a':'#ff9a2e', pulse=0.5+0.5*Math.sin(T*10), r0=(near?16+5*pulse:14)*sc;
  hx.save(); hx.strokeStyle=cc; hx.lineWidth=(near?3:2.2)*sc; hx.shadowColor=cc; hx.shadowBlur=near?16:6;
  hx.beginPath(); hx.arc(cs.x,cs.y,r0,0,6.283); hx.stroke();
  ln(cs.x-24*sc,cs.y,cs.x-8*sc,cs.y); ln(cs.x+8*sc,cs.y,cs.x+24*sc,cs.y); ln(cs.x,cs.y-24*sc,cs.x,cs.y-8*sc); ln(cs.x,cs.y+8*sc,cs.x,cs.y+24*sc);
  hx.restore(); tx('CCIP',cs.x,cs.y+36*sc,11,'center',cc);
}
function hudCue(cx,cy,w,h){
  if(CUE.level<=0||S.onGround||!lockTgt||!lockTgt.alive) return;
  const lvl=CUE.level, pulse=0.5+0.5*Math.sin(T*(lvl===2?14:6)), col=lvl===2?'#ffd23d':'#5dff8a';
  const s2=toScreen(lockTgt.pos);
  if(s2.front&&s2.x>10&&s2.x<w-10&&s2.y>10&&s2.y<h-10){
    const r=(lvl===2?17:14+3*pulse)*sc, q=7*sc;
    hx.save(); hx.strokeStyle=col; hx.lineWidth=2*sc; hx.shadowColor=col; hx.shadowBlur=8;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c4){ hx.beginPath(); hx.moveTo(s2.x+c4[0]*r,s2.y+c4[1]*(r-q)); hx.lineTo(s2.x+c4[0]*r,s2.y+c4[1]*r); hx.lineTo(s2.x+c4[0]*(r-q),s2.y+c4[1]*r); hx.stroke(); });
    hx.restore();
  }
  const bw=Math.min(236*sc,w*0.5), bh=38*sc, x0=cx-bw/2, y0=cy+h*0.25;
  hx.save();
  hx.fillStyle=lvl===2?'rgba('+Math.round(50+70*pulse)+',26,0,0.86)':'rgba(4,30,16,0.8)';
  hx.shadowColor=col; hx.shadowBlur=(lvl===2?14:6)*(0.6+0.4*pulse);
  hx.strokeStyle=col; hx.lineWidth=2*sc; hx.beginPath(); hx.rect(x0,y0,bw,bh); hx.fill(); hx.stroke();
  hx.shadowBlur=0; hx.fillStyle=col;
  const k=(lvl===2?1:0.6)*(0.7+0.3*pulse);
  [[-1],[1]].forEach(function(sd){ const ax=cx+sd[0]*(bw/2-24*sc); hx.beginPath(); hx.moveTo(ax+sd[0]*5*sc,y0+bh/2-7*sc*k); hx.lineTo(ax-sd[0]*5*sc,y0+bh/2); hx.lineTo(ax+sd[0]*5*sc,y0+bh/2+7*sc*k); hx.closePath(); hx.fill(); });
  hx.restore();
  tx(CUE.txt,cx,y0+14*sc,lvl===2?20:15,'center',(lvl===2&&pulse>0.55)?'#ffffff':col);
  tx(CUE.sub,cx,y0+bh-8*sc,10,'center','#e8fff0');
}
function svcPointerOn(){ return S.onGround&&S.clearance&&!S.taxi&&needsService()&&!svcInZone()&&!S.crashed; }
function drawHUD(){
  hx.setTransform(DPR,0,0,DPR,0,0); hx.clearRect(0,0,HW,HH);
  if(state==='menu'||state==='photo'||state==='library') return;
  if(state==='walk'||(state==='paused'&&WALK.from==='walk')){ drawWalkHUD(); return; }
  const w=HW, h=HH; sc=clamp(Math.min(w,h)/760,0.7,1.5);
  const cx=w/2, cy=h/2, tch=TOUCH.vis;
  hx.lineWidth=1.6*sc; hx.strokeStyle=C; hx.fillStyle=C; hx.shadowColor='rgba(0,16,32,0.8)'; hx.shadowBlur=4; hx.textBaseline='middle';
  camera.getWorldDirection(camFwd); camInv.copy(camera.quaternion).invert();

  // cockpit frame
  if(camMode===1 && !CUR.uav){
    hx.save(); hx.shadowBlur=0; hx.fillStyle='rgba(7,11,17,0.94)';
    hx.beginPath(); hx.moveTo(0,0); hx.lineTo(w*0.16,0); hx.lineTo(w*0.045,h); hx.lineTo(0,h); hx.fill();
    hx.beginPath(); hx.moveTo(w,0); hx.lineTo(w*0.84,0); hx.lineTo(w*0.955,h); hx.lineTo(w,h); hx.fill();
    const gr=hx.createLinearGradient(0,h*0.9,0,h); gr.addColorStop(0,'rgba(7,11,17,0)'); gr.addColorStop(1,'rgba(7,11,17,0.95)');
    hx.fillStyle=gr; hx.fillRect(0,h*0.9,w,h*0.1); hx.restore();
  }

  if(camMode===1 && CUR.uav){
    hx.save(); hx.shadowBlur=0; hx.strokeStyle='rgba(184,236,255,0.55)'; hx.lineWidth=2*sc;
    const mg=36*sc, Ln=28*sc;
    [[mg,mg,1,1],[w-mg,mg,-1,1],[mg,h-mg,1,-1],[w-mg,h-mg,-1,-1]].forEach(function(c4){ hx.beginPath(); hx.moveTo(c4[0],c4[1]+c4[3]*Ln); hx.lineTo(c4[0],c4[1]); hx.lineTo(c4[0]+c4[2]*Ln,c4[1]); hx.stroke(); });
    const rg=hx.createRadialGradient(cx,cy,Math.min(w,h)*0.35,cx,cy,Math.max(w,h)*0.75); rg.addColorStop(0,'rgba(0,0,0,0)'); rg.addColorStop(1,'rgba(0,10,20,0.55)');
    hx.fillStyle=rg; hx.fillRect(0,0,w,h); hx.restore();
    tx('EO/IR SENSÖR',cx,h-30*sc,13,'center',CD);
  }
  fwdOf(S.q,vF); vR.set(1,0,0).applyQuaternion(S.q); vU.set(0,1,0).applyQuaternion(S.q);
  const heading=Math.atan2(vF.x,-vF.z), hdDeg=((heading*R2D)%360+360)%360, pitchA=Math.asin(clamp(vF.y,-1,1))*R2D;

  // pitch ladder (camera-referenced, so it lines up with the horizon you see)
  {
    vU.set(0,1,0).applyQuaternion(camera.quaternion); vR.set(1,0,0).applyQuaternion(camera.quaternion);
    const camPitch=Math.asin(clamp(camFwd.y,-1,1))*R2D, camBank=Math.atan2(-vR.y,vU.y);
    const ppd=(h/2)/Math.tan(camera.fov*D2R/2)*D2R;
    hx.save(); hx.beginPath(); hx.rect(cx-Math.min(w*0.3,300*sc),cy-h*0.34,Math.min(w*0.6,600*sc),h*0.68); hx.clip();
    hx.translate(cx,cy); hx.rotate(-camBank);
    for(let a=-90;a<=90;a+=5){
      const y=(camPitch-a)*ppd; if(Math.abs(y)>h*0.7) continue;
      if(a===0){ hx.lineWidth=2*sc; ln(-300*sc,y,-46*sc,y); ln(46*sc,y,300*sc,y); hx.lineWidth=1.6*sc; }
      else if(a%10===0){
        const wd=62*sc, dir=a>0?1:-1; hx.save(); if(a<0) hx.setLineDash([7*sc,6*sc]);
        ln(-wd-24*sc,y,-24*sc,y); ln(24*sc,y,wd+24*sc,y);
        hx.setLineDash([]); ln(-wd-24*sc,y,-wd-24*sc,y+dir*8*sc); ln(wd+24*sc,y,wd+24*sc,y+dir*8*sc); hx.restore();
        tx(String(Math.abs(a)),-wd-40*sc,y,12,'center',CD); tx(String(Math.abs(a)),wd+40*sc,y,12,'center',CD);
      } else ln(-14*sc,y,14*sc,y);
    }
    hx.restore();
  }

  // flight path marker + nose caret
  {
    vel.copy(vF).multiplyScalar(Math.max(S.speed,1)); vel.y-=S.sink;
    const fp=toScreen(fpV.copy(camera.position).addScaledVector(vel.normalize(),600));
    if(fp.front){
      hx.beginPath(); hx.arc(fp.x,fp.y,9*sc,0,6.283); hx.stroke();
      ln(fp.x-9*sc,fp.y,fp.x-22*sc,fp.y); ln(fp.x+9*sc,fp.y,fp.x+22*sc,fp.y); ln(fp.x,fp.y-9*sc,fp.x,fp.y-18*sc);
    }
    const nz=toScreen(fpV.copy(camera.position).addScaledVector(vF,600));
    if(nz.front){ hx.beginPath(); hx.moveTo(nz.x-8*sc,nz.y+6*sc); hx.lineTo(nz.x,nz.y-3*sc); hx.lineTo(nz.x+8*sc,nz.y+6*sc); hx.stroke(); }
  }

  hudPipper(w,h);
  hudCue(cx,cy,w,h);
  // tapes
  const off=Math.min(280*sc,w*0.34);
  const kmh=S.speed*3.6, agl=S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z))-(S.gear?CUR.gearOff:CUR.belly);
  vTape(cx-off,cy,kmh,1.0*sc,10,50,-1,String(Math.round(kmh)),'km/sa');
  vTape(cx+off,cy,S.pos.y,0.45*sc,20,100,1,String(Math.round(S.pos.y)),'irtifa m');
  tx('M '+(S.speed/340).toFixed(2),cx-off-42*sc,cy+160*sc,13,'center');
  tx('YER '+Math.max(0,Math.round(agl)),cx+off+42*sc,cy+160*sc,13,'center');
  tx('DH '+(S.vy>=0?'+':'')+Math.round(S.vy),cx+off+42*sc,cy+180*sc,13,'center',CD);

  // heading tape
  {
    const tw=Math.min(360*sc,w*0.5), ppdH=4.2*sc, y0=46*sc;
    hx.save(); hx.beginPath(); hx.rect(cx-tw/2,y0-34*sc,tw,40*sc); hx.clip();
    for(let d=Math.floor((hdDeg-60)/5)*5; d<=hdDeg+60; d+=5){
      const x=cx+(d-hdDeg)*ppdH, dd=((d%360)+360)%360, maj=dd%10===0;
      ln(x,y0,x,y0-(maj?10:5)*sc);
      if(maj){ const card={0:'K',90:'D',180:'G',270:'B'}[dd]; tx(card||String(dd/10).padStart(2,'0'),x,y0-21*sc,card?15:12,'center',card?C:CD); }
    }
    hx.restore();
    hx.beginPath(); hx.moveTo(cx-6*sc,y0+10*sc); hx.lineTo(cx,y0+2*sc); hx.lineTo(cx+6*sc,y0+10*sc); hx.stroke();
    tx(String(Math.round(hdDeg)%360).padStart(3,'0'),cx,y0+24*sc,15,'center');
  }

  // throttle / G / gear (flight data only)
  {
    const bx=(tch?14:26)*sc, by=tch?(114+110)*sc:h-34*sc, bh=110*sc, thr=S.ab?1:S.throttle;
    if(!tch){ hx.strokeRect(bx,by-bh,12*sc,bh); hx.fillStyle=S.ab?AMB:C; hx.fillRect(bx,by-bh*thr,12*sc,bh*thr);
    tx('GAZ '+Math.round(S.throttle*100)+'%',bx+20*sc,by-bh+6*sc,13,'left'); }
    if(S.ab) tx('ART YAKICI',bx+20*sc,by-bh+24*sc,13,'left',AMB);
    if(S.brake) tx('FREN',bx+20*sc,by-38*sc,13,'left',AMB);
    tx('G '+S.g.toFixed(1),bx+20*sc,by-20*sc,15,'left');
    tx(S.gear?'İNİŞ TAKIMI İNDİ':'İNİŞ TAKIMI KALKTI',bx+20*sc,by-2*sc,12,'left',S.gear?AMB:CD);
  }
  hudHealth((tch?14:26)*sc,tch?60:28*sc);
  hudWeapons(cx,h,tch);

  // score panel
  {
    const px=w-24*sc; let y=28*sc;
    if(M.id!=='free'){ tx('GÖREV · '+MISSIONS[M.id].name,px,y,14,'right','#7dffb0'); y+=20*sc; }
    tx('PUAN  '+score,px,y,17,'right'); y+=22*sc;
    y=hudNetLines(px,y);
    if(MS.rings){ tx('HALKA  '+ringIdx+'/'+rings.length,px,y,14,'right',CD); y+=19*sc; }
    if(MS.air){ tx('HEDEF  '+kills+'/'+targets.length,px,y,14,'right',CD); y+=19*sc; }
    if(MS.ground){ tx('YER  '+gtargets.filter(function(o){ return !o.alive; }).length+'/'+gtargets.length,px,y,14,'right',CD); y+=19*sc; }
    if(MS.recon){ tx('NOKTA  '+Math.min(M.scanIdx,reconPts.length)+'/'+reconPts.length,px,y,14,'right',CD); y+=19*sc; }
    if(MS.rings){ tx('SÜRE  '+(courseT===null?'—':fmtT(courseT)),px,y,14,'right',CD); y+=19*sc; }
    else if(MISSIONS[M.id].limit){ const left=Math.max(0,MISSIONS[M.id].limit-M.t); tx('KALAN  '+fmtT(left),px,y,14,'right',left<60?AMB:CD); y+=19*sc; }
    const rr0=rec(activeId), bst=(M.id==='rings'||M.id==='free')?rr0.best:(rr0.mt||{})[M.id]; if(bst!=null){ tx('REKOR  '+fmtT(bst),px,y,14,'right',CD); y+=19*sc; }
    hudScoreBottom=y+4*sc;
  }

  // ring pointer
  if(!S.crashed && rings.length && ((S.onGround&&S.taxi)||svcPointerOn()||MS.rings||MS.recon)){
    const taxiing=S.onGround&&S.taxi, svcP=svcPointerOn(), tp=taxiing?TAXI_PT:(svcP?SVC_PT:(MS.recon?reconPos():rings[ringIdx].pos)), s=toScreen(tp), dist=tp.distanceTo(S.pos), dlabel=taxiing?Math.round(S.taxiRemain||dist)+' m · PİST':(svcP?Math.round(dist)+' m · BAKIM HANGARI':(dist/1000).toFixed(1)+' km');
    const inView=s.front&&s.x>50&&s.x<w-50&&s.y>90&&s.y<h-50;
    hx.strokeStyle='#39e6ff'; hx.fillStyle='#39e6ff';
    if(inView){
      const b=22*sc, c=8*sc;
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,d])=>{ hx.beginPath(); hx.moveTo(s.x+a*b,s.y+d*(b-c)); hx.lineTo(s.x+a*b,s.y+d*b); hx.lineTo(s.x+a*(b-c),s.y+d*b); hx.stroke(); });
      tx(dlabel,s.x,s.y+b+14*sc,13,'center','#39e6ff');
    } else {
      const ang=Math.atan2(-s.loc.y,s.loc.x), R=Math.min(w,h)*0.36, ax=cx+Math.cos(ang)*R, ay=cy+Math.sin(ang)*R;
      hx.save(); hx.translate(ax,ay); hx.rotate(ang);
      hx.beginPath(); hx.moveTo(14*sc,0); hx.lineTo(-8*sc,-9*sc); hx.lineTo(-3*sc,0); hx.lineTo(-8*sc,9*sc); hx.closePath(); hx.fill(); hx.restore();
      tx(dlabel,ax-Math.cos(ang)*28*sc,ay-Math.sin(ang)*28*sc,12,'center','#39e6ff');
    }
    hx.strokeStyle=C; hx.fillStyle=C;
  }
  // target brackets
  targets.forEach(t=>{
    if(!t.alive) return; const d=t.pos.distanceTo(S.pos); if(d>5000&&t!==lockTgt) return;
    const s=toScreen(t.pos); if(!s.front||s.x<20||s.x>w-20||s.y<20||s.y>h-20) return;
    hx.strokeStyle=RED; hx.lineWidth=1.4*sc; const b=11*sc;
    hx.beginPath(); hx.moveTo(s.x,s.y-b); hx.lineTo(s.x+b,s.y); hx.lineTo(s.x,s.y+b); hx.lineTo(s.x-b,s.y); hx.closePath(); hx.stroke();
    tx((d/1000).toFixed(1),s.x,s.y+b+10*sc,11,'center',RED);
  });
  gtargets.forEach(function(o){
    if(!o.alive) return; const d=o.pos.distanceTo(S.pos); if(d>9500) return;
    const s=toScreen(o.pos); if(!s.front||s.x<20||s.x>w-20||s.y<20||s.y>h-20) return;
    hx.strokeStyle='#ff9a2e'; hx.lineWidth=1.4*sc; const b=9*sc; hx.strokeRect(s.x-b,s.y-b,b*2,b*2);
    tx((d/1000).toFixed(1),s.x,s.y+b+10*sc,11,'center','#ff9a2e');
  });
  hudActors(w,h);
  missiles.forEach(function(m){
    if(!m.on||m.tgt||m.lost||m.vic) return; const s2=toScreen(m.p), d2=m.p.distanceTo(S.pos);
    if(s2.front&&s2.x>20&&s2.x<w-20&&s2.y>20&&s2.y<h-20){ hx.strokeStyle=RED; hx.lineWidth=2*sc; hx.beginPath(); hx.arc(s2.x,s2.y,14*sc,0,6.283); hx.stroke(); tx(Math.round(d2)+' m',s2.x,s2.y+26*sc,12,'center',RED); }
    else{ const ang=Math.atan2(-s2.loc.y,s2.loc.x), R2=Math.min(w,h)*0.33, ax=cx+Math.cos(ang)*R2, ay=cy+Math.sin(ang)*R2;
      hx.fillStyle=RED; hx.save(); hx.translate(ax,ay); hx.rotate(ang); hx.beginPath(); hx.moveTo(14*sc,0); hx.lineTo(-8*sc,-9*sc); hx.lineTo(-8*sc,9*sc); hx.closePath(); hx.fill(); hx.restore(); hx.fillStyle=C; }
    hx.strokeStyle=C;
  });
  hx.strokeStyle=C; hx.lineWidth=1.6*sc;

  // radar
  {
    const R=(tch?46:58)*sc, rx=w-R-(tch?14:20)*sc, ry=tch?hudScoreBottom+R+6*sc:h-R-22*sc, RANGE=7000, sn=Math.sin(heading), cs=Math.cos(heading);
    hx.save(); hx.fillStyle='rgba(4,12,22,0.5)'; hx.beginPath(); hx.arc(rx,ry,R,0,6.283); hx.fill();
    hx.lineWidth=1.2*sc; hx.strokeStyle=CD; hx.stroke();
    hx.beginPath(); hx.arc(rx,ry,R*0.5,0,6.283); hx.strokeStyle='rgba(184,236,255,0.2)'; hx.stroke();
    hx.beginPath(); hx.arc(rx,ry,R,0,6.283); hx.clip();
    const to=(x,z)=>{ const dx=x-S.pos.x, dz=z-S.pos.z; return [rx+(dx*cs+dz*sn)/RANGE*R, ry-(dx*sn-dz*cs)/RANGE*R]; };
    const a=to(0,-1250), b=to(0,1250); hx.strokeStyle='rgba(200,200,200,0.7)'; hx.lineWidth=2*sc; ln(a[0],a[1],b[0],b[1]);
    hx.fillStyle=RED; targets.forEach(t=>{ if(!t.alive) return; const p=to(t.pos.x,t.pos.z); hx.beginPath(); hx.arc(p[0],p[1],2.6*sc,0,6.283); hx.fill(); });
    hx.fillStyle='#ff9a2e'; gtargets.forEach(function(o){ if(!o.alive) return; const p=to(o.pos.x,o.pos.z); hx.fillRect(p[0]-2.2*sc,p[1]-2.2*sc,4.4*sc,4.4*sc); });
    radarActors(to,sc);
    if(rings.length){ const r=rings[ringIdx], p=to(r.pos.x,r.pos.z); let dx=p[0]-rx, dy=p[1]-ry; const dl=Math.hypot(dx,dy); if(dl>R-6*sc){ dx*=(R-6*sc)/dl; dy*=(R-6*sc)/dl; }
      hx.fillStyle='#39e6ff'; hx.beginPath(); hx.moveTo(rx+dx,ry+dy-5*sc); hx.lineTo(rx+dx+4*sc,ry+dy); hx.lineTo(rx+dx,ry+dy+5*sc); hx.lineTo(rx+dx-4*sc,ry+dy); hx.fill(); }
    hx.fillStyle=C; hx.beginPath(); hx.moveTo(rx,ry-6*sc); hx.lineTo(rx+4*sc,ry+5*sc); hx.lineTo(rx-4*sc,ry+5*sc); hx.fill();
    hx.restore();
  }

  // warnings
  {
    const blink=Math.sin(T*10)>0; let wy=cy+h*0.2;
    if(S.crashed){ tx('KAZA',cx,cy-20*sc,54,'center',RED); tx(S.crashReason+' — yeniden başlatılıyor',cx,cy+22*sc,18,'center',C); }
    else{
      if(S.onGround&&S.taxi){ tx(S.taxiMsg||'TAKSİ',cx,wy,20,'center',AMB); wy+=24*sc; tx('T otomatik taksi · L taksiyi atla',cx,wy,13,'center',CD); wy+=22*sc; }
      if(svcInZone()&&state==='play'&&!svcBlock){ tx(S.speed>0?'BAKIM HANGARI — otomatik duruluyor':'BAKIM HANGARI — bakım başlıyor',cx,wy,20,'center','#7dffb0'); wy+=26*sc; }
      if(RWR.msl>0){ if(blink) tx('FÜZE GELİYOR!  '+Math.round(RWR.msl)+' m',cx,wy,26,'center',RED); wy+=32*sc; }
      else if(RWR.lock){ tx('RADAR KİLİDİ',cx,wy,20,'center',AMB); wy+=26*sc; }
      const tti=S.vy<-5?agl/(-S.vy):99;
      if(!S.onGround && tti<7 && agl<900){ if(blink) tx('YÜKSEL  YÜKSEL',cx,wy,34,'center',RED); wy+=36*sc; }
      if(!S.onGround && S.speed<(CUR.stall[0]+(CUR.stall[1]-CUR.stall[0])*0.55)){ if(blink) tx('STOL',cx,wy,28,'center',AMB); wy+=32*sc; }
      if(!S.onGround && S.gear && S.speed>CUR.gearV){ tx('İNİŞ TAKIMI HIZI AŞTI',cx,wy,16,'center',AMB); wy+=22*sc; }
      const lim=Math.max(Math.abs(S.pos.x),Math.abs(S.pos.z));
      if(lim>13500){ if(blink) tx('ALAN SINIRI — ADAYA DÖN',cx,wy,22,'center',AMB); wy+=28*sc; }
    }
  }
  if(MS.recon && M.scanT>0 && !M.done){
    tx('TARAMA  '+Math.round(M.scanT/4*100)+'%',cx,h-124*sc,20,'center','#7dffb0');
    const bw=170*sc; hx.strokeStyle='#7dffb0'; hx.strokeRect(cx-bw/2,h-108*sc,bw,8*sc); hx.fillStyle='#7dffb0'; hx.fillRect(cx-bw/2,h-108*sc,bw*Math.min(1,M.scanT/4),8*sc); hx.fillStyle=C; hx.strokeStyle=C;
  }
  // toasts
  for(let i=0;i<msgs.length;i++){ const m=msgs[msgs.length-1-i]; hx.globalAlpha=clamp(m.t/0.6,0,1); tx(m.text,cx,h-(tch?172:132)*sc-i*22*sc,16,'center',m.color); }
  hx.globalAlpha=1;
  if(hitFlash>0){ hx.fillStyle='rgba(255,40,40,'+(0.35*hitFlash)+')'; hx.fillRect(0,0,w,h); }
  if(state==='paused'){ hx.fillStyle='rgba(4,9,18,0.45)'; hx.fillRect(0,0,w,h); }
}

