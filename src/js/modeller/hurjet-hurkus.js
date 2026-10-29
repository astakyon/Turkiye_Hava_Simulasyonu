/* ------------------------------------------------------------------ TUSAŞ Hürjet and Hürkuş — detailed models (V2.48, model series)
   Hürjet: tandem jet trainer / light fighter, one GE F404 engine (Defence Turk), long bubble canopy, D-shaped side intakes, LERX,
   mid trapezoid wing with tip rails, single swept fin, low all-moving tailplanes, one nozzle. Hürkuş: tandem turboprop trainer,
   1600 shp, five-blade propeller, seven stations on the C model (Defence Turk); low tapered wing with dihedral, conventional tail.
   Both in the white trainer scheme with red trim. The old models stay as buildOld for the library comparison. */
const HJ_PAINT={};
function hjPaint(red){
  if(HJ_PAINT[red]) return HJ_PAINT[red];
  return HJ_PAINT[red]=MK.planarTex(function(x,X,Z,px){
    x.fillStyle='#ffffff'; x.fillRect(0,0,16*px,24*px);
    x.strokeStyle='rgba(60,70,82,0.4)'; x.lineWidth=2;
    const L=function(a){ x.beginPath(); x.moveTo(X(a[0]),Z(a[1])); for(let i=2;i<a.length;i+=2) x.lineTo(X(a[i]),Z(a[i+1])); x.stroke(); };
    for(let z=-4; z<=5; z+=1.5) L([-0.6,z,0.6,z]);
    [1,-1].forEach(function(s){ L([s*1.4,1.6, s*4.6,1.9]); L([s*2.8,0.2, s*2.8,2.2]); });
    /* red trim: wing tips and a band across the tail */
    x.fillStyle=red; [1,-1].forEach(function(s){ x.fillRect(X(s>0?3.9:-5.2),Z(-1.5),1.3*px,4*px); });
    x.fillRect(X(-3),Z(4.6),6*px,0.5*px);
  },24);
}
function hjTxt(t){ return new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide,
  map:apTex(512,96,function(x,W,H){ x.clearRect(0,0,W,H); x.fillStyle='#c8102e'; x.font='800 62px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(t,W/2,H/2+3); })}); }
/* ---------------------------------------------------------------- Hürjet */
function buildHurjetV2(){
  const g=new THREE.Group(), surfaces=[];
  const skin=phong(0xe6e9ec,0x667788,34,{map:hjPaint('#c8102e')}), white=phong(0xe9ecef,0x667788,34), red=phong(0xc3162c,0x663333,26), dark=DARK, edge=phong(0xb9bfc5,0x555f6a,24);
  const glass=new THREE.MeshPhongMaterial({color:0x6a6040, specular:0xffffff, shininess:140, transparent:true, opacity:0.55});
  /* ---- fuselage */
  const st=[[-6.8,0.03,0.03,0.03,-0.05],[-6.2,0.2,0.2,0.18,-0.05],[-5.3,0.42,0.42,0.38,-0.03],[-4.2,0.55,0.55,0.5,0.0],[-3.0,0.62,0.62,0.56,0.02],[-1.8,0.78,0.6,0.6,0.02],
    [-0.4,0.96,0.6,0.62,0.02],[1.2,0.98,0.6,0.62,0.02],[3.0,0.86,0.56,0.56,0.02],[4.8,0.66,0.5,0.5,0.03],[6.2,0.5,0.46,0.46,0.04],[6.7,0.47,0.44,0.44,0.04]];
  g.add(new THREE.Mesh(loft(st.map(function(s){ return {z:s[0],hw:s[1],ht:s[2],hb:s[3],yc:s[4]}; }),22,false),white));
  g.add(new THREE.Mesh(loft(noseCap(st.map(function(s){ return {z:s[0],hw:s[1],ht:s[2],hb:s[3],yc:s[4]}; }),3,1.02),22,false),red));   /* red nose */
  /* dorsal spine behind the canopy */
  { const sp=new THREE.Mesh(new THREE.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2),white); sp.scale.set(0.45,0.3,3.2); sp.position.set(0,0.5,1.2); g.add(sp); }
  /* ---- long tandem bubble canopy with a frame between the seats */
  const yb=0.5, cRows=[]; for(let i=0;i<=14;i++){ const z=-5.0+i*0.26, t=i/14, w=0.05+0.46*Math.sin(Math.min(1,t*1.6)*Math.PI*0.5)*(1-0.6*Math.max(0,t-0.75)/0.25), h=0.05+0.5*Math.sin(Math.min(1,t*1.4)*Math.PI*0.5)*(1-0.7*Math.max(0,t-0.7)/0.3);
    cRows.push(MK.arc(0,yb,z,w,h,2.2,0.03,Math.PI-0.03,14)); }
  g.add(new THREE.Mesh(MK.outward(MK.grid(cRows),new THREE.Vector3(0,0.5,-3.2)),glass));
  const bow=MK.at(g,new THREE.Mesh(new THREE.TorusGeometry(0.44,0.035,6,22,Math.PI),dark),0,yb,-3.25);
  [-4.1,-2.5].forEach(function(z){ MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.55,0.5,0.4),phong(0x2a2f36,0x222222,10)),0,0.62,z); MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.14,12,10),phong(0x3b4450,0x444444,40)),0,1.0,z-0.2); });
  /* ---- D-shaped side intakes beside the rear seat */
  [-1,1].forEach(function(s){ const sh=new THREE.Shape(); sh.moveTo(0,-0.42); sh.lineTo(0,0.42); for(let i=0;i<=12;i++){ const a=Math.PI/2-i/12*Math.PI; sh.lineTo(Math.cos(a)*0.36,Math.sin(a)*0.42); } sh.closePath();
    const face=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshPhongMaterial({color:0x07090b,side:THREE.DoubleSide})); face.position.set(s*0.7,0.0,-2.6); face.scale.x=s; g.add(face);
    const lip=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.04,6,16,Math.PI),edge); lip.position.set(s*0.7,0.0,-2.62); lip.rotation.z=s>0?-Math.PI/2:Math.PI/2; g.add(lip);
    const duct=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),white); duct.scale.set(0.36,0.42,1.9); duct.position.set(s*0.75,0.0,-0.9); g.add(duct); });
  /* ---- LERX and wing: trapezoid, flaperons, tip rails */
  const LE=function(sp){ return sp<1.6?-2.6+(sp-0.9)*2.6:-0.78+(sp-1.6)*0.76; }, TE=function(sp){ return 2.7-(sp-0.9)*0.08; }, WY=function(sp){ return -0.05-sp*0.012; };
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:sp<1.6?0.035:0.05,c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0.9,0,1),wsec(1.6,0,1),wsec(2.4,0,1),wsec(2.4,0,0.76),wsec(4.6,0,0.76),wsec(4.62,0,1)],map,12,'b'),new THREE.Vector3(s*2.6,-1,1.2)),skin));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.76]; };
    const fq=MK.outward(MK.foil([wsec(2.45,0.76,1),wsec(4.55,0.76,1)],map,5,'ab'),new THREE.Vector3(s*3.5,0,2.4));
    const H=MK.hinge(fq,skin,s>0?hp(2.45):hp(4.55),s>0?hp(4.55):hp(2.45),'x'); g.add(H.outer); surfaces.push({n:H.pivot,axis:'x',input:'roll',max:18*D2R,sign:s>0?-1:1,base:0});
    const rail=MK.at(g,new THREE.Mesh(MK.cyl(0.05,0.05,2.0,8),edge),s*4.68,WY(4.6),(LE(4.6)+TE(4.6))/2);   /* wingtip launch rail */
  });
  /* ---- low all-moving tailplanes */
  [-1,1].forEach(function(s){ const map=function(sp,z,th){ return [s*sp, -0.06+th, z]; }, ts=function(sp){ const t=(sp-0.55)/2.2; return {s:sp,le:4.5+t*1.4,te:6.4+t*0.25,t:0.04}; };
    const geo=MK.outward(MK.foil([ts(0.55),ts(2.75)],map,10,'ab'),new THREE.Vector3(s*1.6,0,5.6));
    const H=MK.hinge(geo,white,[s>0?0.55:-2.75,-0.06,5.3],[s>0?2.75:-0.55,-0.06,5.3],'x'); g.add(H.outer); surfaces.push({n:H.pivot,axis:'x',input:'pitch',max:16*D2R,sign:-1,base:0}); });
  /* ---- single swept fin with rudder; red top, flag, HÜRJET */
  { const fmap=function(u,z,th){ return [th,0.4+u,z]; }, ff=function(u){ const t=u/2.35; return {s:u,le:3.5+t*1.85,te:6.0+t*0.45,t:0.06}; };
    const fsec=function(u,c0,c1){ const q=ff(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([fsec(0,0,0.72),fsec(1.8,0,0.72),fsec(1.8,0.72,1),fsec(1.81,0,1)],fmap,10,'b'),new THREE.Vector3(0,1.2,5)),white));
    g.add(new THREE.Mesh(MK.outward(MK.foil([fsec(1.8,0,1),fsec(2.35,0,1)],fmap,10,'ab'),new THREE.Vector3(0,2.4,6)),red));
    const rd=MK.outward(MK.foil([fsec(0.1,0.72,1),fsec(1.78,0.72,1)],fmap,5,'ab'),new THREE.Vector3(0,1.2,6.3));
    const r0=ff(0.1), r1=ff(1.78), R=MK.hinge(rd,white,[0,0.5,r0.le+(r0.te-r0.le)*0.72],[0,2.18,r1.le+(r1.te-r1.le)*0.72],'y'); g.add(R.outer);
    surfaces.push({n:R.pivot,axis:'y',input:'yaw',max:20*D2R,sign:1,base:0});
    [1,-1].forEach(function(f){ const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.33),FLAG_MAT); fl.position.set(f*0.07,1.45,ff(1.05).le+0.5); fl.rotation.y=f>0?Math.PI/2:-Math.PI/2; g.add(fl); }); }
  [-1,1].forEach(function(s){ const d=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.3),HJ_TXT()); d.position.set(s*0.9,0.05,3.2); d.rotation.y=s>0?Math.PI/2:-Math.PI/2; g.add(d); });
  /* ---- nozzle */
  MK.at(g,new THREE.Mesh(MK.cyl(0.46,0.42,0.9,22,true),edge),0,0.04,6.9);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(0.42,20),phong(0x2a2420,0x111111,10)); disc.position.set(0,0.04,6.6); disc.rotation.y=Math.PI; g.add(disc);
  const flames=addFlames(g,[[0,0.04,7.35]],0.9);
  addPitot(g,-6.8,0.9);
  const n0=g.children.length, strobe=addLights(g,[4.7,WY(4.6),2.2],[0,2.8,5.6]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.6); });
  /* ---- gear */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.45,-4.3,-1.67,0.28,0.16,GM,{});
  [-1,1].forEach(function(s){ MK.leg(gear,s*1.25,-0.5,1.3,-1.61,0.34,0.2,GM,{side:s*0.4}); });
  g.add(gear);
  return {group:g, flames:flames, strobe:strobe, gear:gear, spinners:[], surfaces:surfaces, codeSurfaces:surfaces, stnMinX:1.7};
}
let HJ_TXT_M=null; function HJ_TXT(){ return HJ_TXT_M||(HJ_TXT_M=hjTxt('HÜRJET')); }
/* ---------------------------------------------------------------- Hürkuş */
function buildHurkusV2(){
  const g=new THREE.Group(), surfaces=[];
  const skin=phong(0xe6e9ec,0x667788,34,{map:hjPaint('#c8102e')}), white=phong(0xe9ecef,0x667788,34), red=phong(0xc3162c,0x663333,26), dark=DARK, edge=phong(0xb9bfc5,0x555f6a,24);
  const glass=new THREE.MeshPhongMaterial({color:0x2a3440, specular:0xffffff, shininess:140, transparent:true, opacity:0.6});
  /* ---- fuselage: engine cowling at the front, tandem cockpit, tail cone */
  const st=[[-5.3,0.3,0.3,0.3,0.0],[-5.0,0.5,0.5,0.5,0.0],[-4.2,0.64,0.62,0.62,0.0],[-3.2,0.66,0.62,0.6,0.02],[-2.0,0.62,0.6,0.58,0.02],[-0.4,0.58,0.56,0.52,0.02],
    [1.4,0.48,0.48,0.44,0.04],[3.2,0.34,0.36,0.3,0.08],[4.8,0.2,0.24,0.16,0.12],[5.5,0.1,0.14,0.08,0.14]];
  const S=st.map(function(s){ return {z:s[0],hw:s[1],ht:s[2],hb:s[3],yc:s[4]}; });
  g.add(new THREE.Mesh(loft(S,22,false),white));
  g.add(new THREE.Mesh(loft(noseCap(S,4,1.015),22,false),red));   /* red cowling */
  [-1,1].forEach(function(s){ const ex=MK.at(g,new THREE.Mesh(MK.cyl(0.08,0.1,0.35,10),dark),s*0.62,0.1,-3.9); ex.rotation.y=s*0.6; });   /* exhaust stacks */
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.4,0.12,0.5),dark),0,-0.6,-4.6);   /* oil cooler intake under the cowling */
  /* ---- tandem canopy with a frame */
  const yb=0.5, cRows=[]; for(let i=0;i<=12;i++){ const z=-3.0+i*0.26, t=i/12, w=0.05+0.44*Math.sin(Math.min(1,t*1.6)*Math.PI*0.5)*(1-0.6*Math.max(0,t-0.75)/0.25), h=0.05+0.52*Math.sin(Math.min(1,t*1.4)*Math.PI*0.5)*(1-0.7*Math.max(0,t-0.7)/0.3);
    cRows.push(MK.arc(0,yb,z,w,h,2.2,0.03,Math.PI-0.03,14)); }
  g.add(new THREE.Mesh(MK.outward(MK.grid(cRows),new THREE.Vector3(0,0.5,-1.5)),glass));
  MK.at(g,new THREE.Mesh(new THREE.TorusGeometry(0.43,0.035,6,22,Math.PI),dark),0,yb,-1.5);
  [-2.3,-0.9].forEach(function(z){ MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.4),phong(0x2a2f36,0x222222,10)),0,0.62,z); MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.14,12,10),phong(0x3b4450,0x444444,40)),0,1.0,z-0.2); });
  /* ---- low wing: straight tapered, 6° dihedral, ailerons; red tips */
  const LE=function(sp){ return -1.3+sp*0.15; }, TE=function(sp){ return 0.75-sp*0.05; }, WY=function(sp){ return -0.38+sp*0.1; };
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:0.15,c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0,0,1),wsec(2.6,0,1),wsec(2.6,0,0.74),wsec(4.96,0,0.74),wsec(5,0,1)],map,12,'b'),new THREE.Vector3(s*2.5,-1,0)),skin));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.74]; };
    const al=MK.outward(MK.foil([wsec(2.65,0.74,1),wsec(4.9,0.74,1)],map,5,'ab'),new THREE.Vector3(s*3.8,0,0.5));
    const A=MK.hinge(al,skin,s>0?hp(2.65):hp(4.9),s>0?hp(4.9):hp(2.65),'x'); g.add(A.outer); surfaces.push({n:A.pivot,axis:'x',input:'roll',max:20*D2R,sign:s>0?-1:1,base:0});
  });
  /* ---- tailplane with elevators, fin with dorsal fillet and rudder */
  [-1,1].forEach(function(s){ const map=function(sp,z,th){ return [s*sp, 0.12+th, z]; }, ts=function(sp,c0,c1){ const t=sp/2.1; return {s:sp,le:3.95+t*0.45,te:5.25-t*0.05,t:0.08,c0:c0,c1:c1}; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([ts(0.1,0,0.7),ts(2.1,0,0.7),ts(2.1,0.7,1),ts(2.11,0,1)],map,8,'b'),new THREE.Vector3(s*1,0,4.4)),white));
    const el=MK.outward(MK.foil([ts(0.15,0.7,1),ts(2.05,0.7,1)],map,5,'ab'),new THREE.Vector3(s*1,0,5));
    const a=ts(0.15), b=ts(2.05), hA=[s*0.15,0.12,a.le+(a.te-a.le)*0.7], hB=[s*2.05,0.12,b.le+(b.te-b.le)*0.7];
    const E=MK.hinge(el,white,s>0?hA:hB,s>0?hB:hA,'x'); g.add(E.outer); surfaces.push({n:E.pivot,axis:'x',input:'pitch',max:18*D2R,sign:-1,base:0}); });
  { const fmap=function(u,z,th){ return [th,0.25+u,z]; }, ff=function(u){ const t=u/1.75; return {s:u,le:3.4+t*1.35,te:5.4+t*0.15,t:0.08}; };
    const fsec=function(u,c0,c1){ const q=ff(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([fsec(0,0,0.7),fsec(1.75,0,0.7),fsec(1.75,0.7,1),fsec(1.76,0,1)],fmap,10,'b'),new THREE.Vector3(0,1,4.6)),red));
    const fil=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.3,1.6),white); fil.position.set(0,0.35,2.9); fil.rotation.x=0.18; g.add(fil);
    const rd=MK.outward(MK.foil([fsec(0.05,0.7,1),fsec(1.72,0.7,1)],fmap,5,'ab'),new THREE.Vector3(0,1,5.4));
    const r0=ff(0.05), r1=ff(1.72), R=MK.hinge(rd,red,[0,0.3,r0.le+(r0.te-r0.le)*0.7],[0,1.97,r1.le+(r1.te-r1.le)*0.7],'y'); g.add(R.outer);
    surfaces.push({n:R.pivot,axis:'y',input:'yaw',max:20*D2R,sign:1,base:0});
    [1,-1].forEach(function(f){ const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.28),FLAG_MAT); fl.position.set(f*0.07,1.2,ff(0.95).le+0.4); fl.rotation.y=f>0?Math.PI/2:-Math.PI/2; g.add(fl); }); }
  [-1,1].forEach(function(s){ const d=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.28),HK_TXT()); d.position.set(s*0.5,0.0,1.4); d.rotation.y=s>0?Math.PI/2:-Math.PI/2; g.add(d); });
  /* ---- five-blade propeller (Defence Turk) */
  const pr=addProp(g,-5.35,1.3,5,-1,0xc8102e);
  const n0=g.children.length, strobe=addLights(g,[5.02,WY(5),0.2],[0,2.05,5.0]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.6); });
  /* ---- gear */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.5,-3.5,-1.38,0.22,0.14,GM,{});
  [-1,1].forEach(function(s){ MK.leg(gear,s*1.5,-0.3,0.4,-1.3,0.3,0.18,GM,{side:s*0.4}); });
  g.add(gear);
  return {group:g, flames:[], strobe:strobe, gear:gear, spinners:[pr], surfaces:surfaces, codeSurfaces:surfaces, stnMinX:1.3};
}
let HK_TXT_M=null; function HK_TXT(){ return HK_TXT_M||(HK_TXT_M=hjTxt('HÜRKUŞ')); }
