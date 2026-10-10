/* ------------------------------------------------------------------ taxiway: hangar apron -> parallel taxiway A -> runway line-up */
const TAXI={pts:[],grp:[],idx:0,chkP:false,chkR:false,hold:0,last:''};
const TAXI_MSG=['Taksi yolu A — doğuya ilerle','Güneye devam et — pist başına git','Pist başında kuzeye dön, eksene gir','Pist ekseninde hizalan ve dur'];
const PREP_ITEMS=['İniş takımı aşağıda','Kumanda kontrolü (pitch ve yatış)','Pist eksenine hizalı','Dur ve bekle'];
const PREP_HINTS=['G ile iniş takımını indir','W/S ve A/D ile kumandaları hareket ettir','Pist ortasında burnu kuzeye hizala','Hızı sıfırla ve bir an bekle'];
const guide=[];
function ribbon(P,off,width,y,mat,poly){
  const pos=[], idx=[];
  for(let i=0;i<P.length;i++){
    const a=P[Math.max(i-1,0)], b=P[Math.min(i+1,P.length-1)];
    let tx=b.x-a.x, tz=b.z-a.z; const l=Math.hypot(tx,tz)||1; tx/=l; tz/=l;
    const nx=-tz, nz=tx, o1=off-width/2, o2=off+width/2;
    pos.push(P[i].x+nx*o1,y,P[i].z+nz*o1, P[i].x+nx*o2,y,P[i].z+nz*o2);
  }
  for(let i=0;i<P.length-1;i++){ const a=2*i; idx.push(a,a+1,a+2, a+1,a+3,a+2); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat); scene.add(m); return m;
}
function buildTaxiway(){
  const gy=AIRFIELD_Y, HW=12;
  const V=[[-470,840,0],[-60,840,55],[-60,1195,30],[0,1195,30],[0,1100,0]];
  const poly=[], pg=[];
  poly.push([V[0][0],V[0][1]]); pg.push(0);
  for(let i=1;i<V.length-1;i++){
    const p0=V[i-1], p1=V[i], p2=V[i+1], R=p1[2];
    let d1x=p1[0]-p0[0], d1z=p1[1]-p0[1], l1=Math.hypot(d1x,d1z); d1x/=l1; d1z/=l1;
    let d2x=p2[0]-p1[0], d2z=p2[1]-p1[1], l2=Math.hypot(d2x,d2z); d2x/=l2; d2z/=l2;
    const t=R*Math.tan(Math.acos(clamp(d1x*d2x+d1z*d2z,-1,1))/2);
    const ax=p1[0]-d1x*t, az=p1[1]-d1z*t, bx=p1[0]+d2x*t, bz=p1[1]+d2z*t;
    poly.push([ax,az]); pg.push(i-1);
    for(let k=1;k<=12;k++){ const u=k/12, w=1-u; poly.push([w*w*ax+2*w*u*p1[0]+u*u*bx, w*w*az+2*w*u*p1[1]+u*u*bz]); pg.push(k===12?i:i-1); }
  }
  poly.push([V[V.length-1][0],V[V.length-1][1]]); pg.push(V.length-2);
  // resample every 4 m
  const cum=[0]; for(let i=1;i<poly.length;i++) cum.push(cum[i-1]+Math.hypot(poly[i][0]-poly[i-1][0],poly[i][1]-poly[i-1][1]));
  const total=cum[cum.length-1]; let j=0;
  for(let d=0; d<=total; d+=4){
    while(j<poly.length-2 && cum[j+1]<d) j++;
    const seg=cum[j+1]-cum[j]||1, u=clamp((d-cum[j])/seg,0,1);
    TAXI.pts.push(new THREE.Vector3(poly[j][0]+(poly[j+1][0]-poly[j][0])*u, gy, poly[j][1]+(poly[j+1][1]-poly[j][1])*u));
    TAXI.grp.push(pg[j]);
  }
  const P=TAXI.pts;
  const po={polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1};
  const asphalt=new THREE.MeshLambertMaterial(Object.assign({color:0x4b4f56,side:THREE.DoubleSide},po));
  const yel=new THREE.MeshBasicMaterial(Object.assign({color:0xe6b92e,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  ribbon(P,0,HW*2,gy+0.24,asphalt);
  ribbon(P,0,0.5,gy+0.27,yel);
  ribbon(P,HW-1.4,0.35,gy+0.27,yel); ribbon(P,-(HW-1.4),0.35,gy+0.27,yel);
  // blue edge lights
  const lg=new THREE.SphereGeometry(0.4,6,4), lm=new THREE.MeshBasicMaterial({color:0x2f80ff});
  const lights=new THREE.InstancedMesh(lg,lm,Math.ceil(P.length/6)*2+2), mt=new THREE.Matrix4(); let n=0;
  for(let i=0;i<P.length;i+=6){
    const a=P[Math.max(i-1,0)], b=P[Math.min(i+1,P.length-1)]; let tx=b.x-a.x, tz=b.z-a.z; const l=Math.hypot(tx,tz)||1; tx/=l; tz/=l;
    [1,-1].forEach(function(sd){ mt.makeTranslation(P[i].x+(-tz)*(HW+1.2)*sd,gy+0.45,P[i].z+tx*(HW+1.2)*sd); lights.setMatrixAt(n++,mt); });
  }
  lights.count=n; lights.instanceMatrix.needsUpdate=true; lights.frustumCulled=false; scene.add(lights);
  // signs
  [['TAKSİ YOLU A',-300,822],['PİST 36',-80,1010],['PİST BAŞI',-80,1170]].forEach(function(sg){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,3.6,6),new THREE.MeshLambertMaterial({color:0x555b63})); pole.position.set(sg[1],gy+1.8,sg[2]); scene.add(pole);
    const lb=makeLabel(sg[0]); lb.scale.set(8,2,1); lb.position.set(sg[1],gy+4.6,sg[2]); scene.add(lb);
  });
  // guidance lights (follow the greens)
  const gg=new THREE.SphereGeometry(0.6,8,6);
  for(let i=0;i<14;i++){ const m=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:0x3dff8a})); m.visible=false; scene.add(m); guide.push(m); }
}
function startTaxi(){
  const dd=displays[activeId], P=TAXI.pts; let best=0, bd=1e12;
  for(let i=0;i<P.length;i++){ const dx=P[i].x-dd.x, dz=P[i].z-840, d=dx*dx+dz*dz; if(d<bd){ bd=d; best=i; } }
  TAXI.idx=best; TAXI.chkP=false; TAXI.chkR=false; TAXI.hold=0; TAXI.last=''; TAXI.autoDone=false; TAXI.stopT=0; TAXI.leftApron=false; TAXI.endTrig=false; TAXI_PT.set(dd.x,AIRFIELD_Y+6,845);
  S.auto=false; S.taxiX=dd.x; S.taxiRemain=0; S.taxiMsg=TAXI_MSG[0]; setPrep(false,[],'');
}
function setPrep(on,items,hint){
  const el=$('prep'); el.classList.toggle('hidden',!on); if(!on) return;
  const key=items.join(',')+'|'+hint; if(key===TAXI.last) return; TAXI.last=key;
  $('prepList').innerHTML=PREP_ITEMS.map(function(t,i){ return '<li class="'+(items[i]?'ok':'')+'"><span class="tick">'+(items[i]?'✓':'')+'</span>'+t+'</li>'; }).join('');
  $('prepHint').textContent=hint;
  $('prepVr').textContent='Kalkış hızı: '+Math.round(CUR.vr*3.6)+' km/sa';
}
function updateTaxi(dt){
  const P=TAXI.pts, n=P.length;
  let best=TAXI.idx, bd=1e12; const inHall=!TAXI.leftApron&&S.pos.z>860&&S.pos.x<-80, lo=Math.max(0,TAXI.idx-10), hi=inHall?TAXI.idx:Math.min(n-1,TAXI.idx+60);   // still inside the hangar: roll straight out of the door first
  for(let i=lo;i<=hi;i++){ const dx=P[i].x-S.pos.x, dz=P[i].z-S.pos.z, d=dx*dx+dz*dz; if(d<bd){ bd=d; best=i; } }
  if(bd>3600&&!inHall){ bd=1e12; for(let i=0;i<n;i++){ const dx=P[i].x-S.pos.x, dz=P[i].z-S.pos.z, d=dx*dx+dz*dz; if(d<bd){ bd=d; best=i; } } TAXI.idx=best; }
  else TAXI.idx=Math.max(TAXI.idx,best);
  const g=TAXI.grp[TAXI.idx];
  const tgt=P[Math.min(n-1,TAXI.idx+8)];
  if(S.pos.z<=849) TAXI.leftApron=true;          // clear of the hangar door before turning
  if(!TAXI.leftApron && g===0) TAXI_PT.set(S.taxiX,AIRFIELD_Y+6,836); else TAXI_PT.set(tgt.x,AIRFIELD_Y+6,tgt.z);
  S.taxiRemain=(TAXI.idx>=n-1&&S.pos.z<=P[n-1].z+3)?0:(n-1-TAXI.idx)*4+Math.sqrt(bd);
  S.taxiMsg=TAXI_MSG[g];
  const onStrip=Math.abs(S.pos.x)<35&&Math.abs(S.pos.z)<1250;
  const prepOn=S.taxiRemain<=45||onStrip;
  if(!S.auto && prepOn && !TAXI.autoDone){ startAutoTaxi(false); }
  if(S.auto){ autoSequence(dt); return; }
  if(!prepOn){ setPrep(false,[],''); TAXI.hold=0; return; }
  // manual fallback (auto taxi cancelled with T): player completes the checks
  if(Math.abs(S.pitchIn)>0.6) TAXI.chkP=true;
  if(Math.abs(S.rollIn)>0.6) TAXI.chkR=true;
  fwdOf(S.q,vF);
  const hdErr=Math.abs(Math.atan2(vF.x,-vF.z))*R2D;
  const gearOk=S.gear, ctlOk=TAXI.chkP&&TAXI.chkR, alignOk=Math.abs(S.pos.x)<10&&hdErr<6;
  if(gearOk&&ctlOk&&alignOk&&S.speed<1.5) TAXI.hold+=dt; else TAXI.hold=0;
  const holdOk=TAXI.hold>=1.5, items=[gearOk,ctlOk,alignOk,holdOk], first=items.indexOf(false);
  setPrep(true,items,first<0?'Kalkış izni alınıyor…':PREP_HINTS[first]);
  S.taxiMsg=alignOk?'Hazırlıkları tamamla':TAXI_MSG[3];
  if(holdOk) grantClearance();
}
function grantClearance(){
  S.auto=false; S.clearance=true; S.taxi=false; S.brake=false; S.throttle=0; S.pitchIn=S.rollIn=S.yawIn=0; setPrep(false,[],'');
  toast('Kalkış izni verildi — kontrol sende. Gazı aç, '+Math.round(CUR.vr*3.6)+' km/sa üzerinde burnu kaldır','#7dffb0');
}
function startAutoTaxi(manual){
  S.auto=true; TAXI.autoDone=true; TAXI.stopT=0; TAXI.endTrig=!manual;
  toast(manual?'Otomatik taksi açık':'Taksi sonu (pist girişi) — uçak otomatik duruyor, hazırlıklar başlıyor','#b8ecff');
}
function skipTaxi(){
  if(!(state==='play'&&S.onGround&&S.taxi&&!S.clearance&&!S.crashed)) return;
  resetFlight('runway'); setPrep(false,[],''); toast('Taksi atlandı — pist başındasın, kalkışa hazır','#7dffb0');
}
function toggleAutoTaxi(){
  if(!(S.onGround&&S.taxi&&!S.clearance&&!S.crashed)) return;
  if(S.auto){ S.auto=false; TAXI.autoDone=true; S.brake=false; toast('Otomatik taksi kapalı — kontrol sende'); }
  else startAutoTaxi(true);
}
function autoTaxi(dt){ // virtual taxi pilot: follows the guide path, stops on the runway centreline
  fwdOf(S.q,vF);
  const hd=Math.atan2(vF.x,-vF.z), rem=(S.taxiRemain==null)?999:S.taxiRemain;
  let err=Math.atan2(TAXI_PT.x-S.pos.x,-(TAXI_PT.z-S.pos.z))-hd; err=Math.atan2(Math.sin(err),Math.cos(err));
  let steer=err;
  if(rem<14){ steer=Math.atan2(Math.sin(-hd),Math.cos(-hd))-clamp(S.pos.x*0.03,-0.2,0.2)*clamp(S.speed/3,0,1); }   // final metres: align with runway heading
  const vc=Math.min(12,CUR.vr*0.4);
  let vt=Math.min(vc*(1-0.55*Math.min(1,Math.abs(err)/0.7)), Math.sqrt(2*Math.min(2.5,CUR.brake*0.5)*Math.max(rem-3,0)));
  if(rem<3) vt=0;
  if(rem<14 && Math.abs(S.pos.x)>5){            // entered the runway off-centre: creep back to the centreline first
    let ce=Math.atan2(-S.pos.x,18)-hd; ce=Math.atan2(Math.sin(ce),Math.cos(ce)); steer=ce; vt=3;
  }
  S.throttle=clamp(S.throttle+(vt-S.speed)*0.3*dt,0,0.8);
  if(vt===0&&S.speed<0.4) S.throttle=0;
  S.brake=(S.speed>vt+0.8)||(rem<3&&S.speed>0.2)||TAXI.stopT>0;
  S.pitchIn=0; S.rollIn=0; S.yawIn=clamp(steer*2.2,-1,1); S.ab=false;
}
function autoSequence(dt){
  const rem=S.taxiRemain;
  if(rem>45 && !TAXI.endTrig){ setPrep(false,[],''); S.taxiMsg='Otomatik taksi — pist başına'; return; }
  if(S.speed<0.4 && rem<8) TAXI.stopT+=dt; else if(S.speed>1) TAXI.stopT=0;
  const t=TAXI.stopT;
  fwdOf(S.q,vF);
  const hdErr=Math.abs(Math.atan2(vF.x,-vF.z))*R2D, alignOk=Math.abs(S.pos.x)<10&&hdErr<3;
  if(t>0.5 && !S.gear) S.gear=true;
  const it=[t>0.5, t>1.3, t>2.1&&alignOk, t>3.0&&alignOk];
  setPrep(true,it,t===0?'Taksi sonu — uçak duruyor ve hizalanıyor…':(it[3]?'Kalkış izni alınıyor…':'Kalkış öncesi kontroller yapılıyor…'));
  S.taxiMsg=t===0?'Taksi sonu — uçak duruyor':'Pistte hizalandı — kontroller';
  if(it[3] && S.speed<0.6) grantClearance();
}
function updateTaxiVisuals(){
  const on=state==='play'&&S.onGround&&!S.clearance&&!S.crashed&&TAXI.pts.length>0;
  for(let k=0;k<guide.length;k++){
    const m=guide[k]; if(!on){ m.visible=false; continue; }
    const p=TAXI.pts[Math.min(TAXI.pts.length-1,TAXI.idx+(k+1)*4)];
    m.position.set(p.x,AIRFIELD_Y+0.6,p.z); m.visible=true; m.scale.setScalar(0.8+0.25*Math.sin(T*6-k*0.8));
  }
}

