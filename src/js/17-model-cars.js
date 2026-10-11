/* ------------------------------------------------------------------ drivable cars (walk mode): a modern crossover SUV and a military 4×4.
   Bodies are extruded side profiles (smooth silhouettes instead of boxes); wheels are separate groups so they can spin and steer.
   carModel(kind) -> {g, body, wheels:[{pivot,spin,front,r}], wb (wheelbase), tw (track), r (wheel radius), ride}
   Forward is -z, origin on the ground at the vehicle centre (same convention as the airport vehicles). */
const CAR_KINDS=[
  {id:'suv',   n:'Ay Yıldız SUV',          paint:0xeef1f4, top:50, acc:9.5, grip:9,  slope:1.0, sign:null},
  {id:'suvR',  n:'Ay Yıldız SUV · Kırmızı', paint:0xb3121c, top:50, acc:9.5, grip:9,  slope:1.0, sign:null},
  {id:'mil',   n:'Bozkurtlar 4×4',          paint:0x5a6142, top:40, acc:7.5, grip:10, slope:0.55, mil:true},
  {id:'follow',n:'Beni İzle aracı',         paint:0xe7b21f, top:45, acc:8.5, grip:9,  slope:1.0, sign:'BENİ İZLE'}
];
const CARM={};
function carPaint(c){ const k='p'+c; if(CARM[k]) return CARM[k];
  return (CARM[k]=new THREE.MeshStandardMaterial({color:c, roughness:0.32, metalness:0.35, envMap:ENVMAP, envMapIntensity:0.9})); }
function carMats(){
  if(CARM.trim) return CARM; const L=function(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})); };
  Object.assign(CARM,{trim:L(0x1a1d21), plastic:L(0x262a2f), chrome:new THREE.MeshStandardMaterial({color:0xd6dade,roughness:0.18,metalness:0.9,envMap:ENVMAP}),
    rim:new THREE.MeshStandardMaterial({color:0xaab0b6,roughness:0.3,metalness:0.8,envMap:ENVMAP}), rimD:L(0x2f3338), tire:L(0x15171a), tread:L(0x22262a),
    glass:new THREE.MeshStandardMaterial({color:0x0f1820, roughness:0.08, metalness:0.7, envMap:ENVMAP, envMapIntensity:1.3}),
    head:new THREE.MeshBasicMaterial({color:0xf4f8ff}), drl:new THREE.MeshBasicMaterial({color:0xdfeaff}), tail:new THREE.MeshBasicMaterial({color:0xd0141a}),
    amber:new THREE.MeshBasicMaterial({color:0xffa31a}), blue:new THREE.MeshBasicMaterial({color:0x2f6bff}), canvas:L(0x4d5236), camo:L(0x3f4530)});
  CARM.head.userData.glow=2.4; CARM.drl.userData.glow=2; CARM.tail.userData.glow=3; CARM.amber.userData.glow=4; CARM.blue.userData.glow=4;
  CARM.plate=new THREE.MeshLambertMaterial({map:signTex('TR  AY YILDIZ','#f4f4f0','#111',512,112)});
  CARM.plateM=new THREE.MeshLambertMaterial({map:signTex('BOZKURTLAR 04','#f4f4f0','#111',512,112)});
  return CARM;
}
/* side profile (u = length, +u is the front; v = height) extruded across the width w, centred */
function carExtrude(pts,w,mat,bevel,holes){
  const s=new THREE.Shape(); pts.forEach(function(p,i){ if(p.arc){ s.absarc(p.arc[0],p.arc[1],p.arc[2],p.arc[3],p.arc[4],true); } else if(i===0) s.moveTo(p[0],p[1]); else s.lineTo(p[0],p[1]); });
  const b=bevel||0, geo=new THREE.ExtrudeGeometry(s,{depth:w-b*2, bevelEnabled:b>0, bevelThickness:b, bevelSize:b, bevelSegments:2, steps:1, curveSegments:10});
  geo.translate(0,0,-(w-b*2)/2); const m=new THREE.Mesh(geo,mat); m.rotation.y=Math.PI/2; return m;
}
function carBox(g,mat,x,y,z,w,h,d,rx){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); if(rx) m.rotation.x=rx; g.add(m); return m; }
function carWheel(r,w,mil){
  const C=carMats(), spin=new THREE.Group(), pivot=new THREE.Group(); pivot.add(spin);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,22),C.tire); t.rotation.z=Math.PI/2; spin.add(t);
  const sw=new THREE.Mesh(new THREE.TorusGeometry(r*0.86,r*0.12,6,22),C.tread); sw.rotation.y=Math.PI/2; [-1,1].forEach(function(s){ const q=sw.clone(); q.position.x=s*w*0.44; spin.add(q); });
  const rr=r*(mil?0.55:0.66), rim=new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,w+0.02,18),mil?C.rimD:C.rim); rim.rotation.z=Math.PI/2; spin.add(rim);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(rr*0.3,rr*0.3,w+0.05,10),C.trim); hub.rotation.z=Math.PI/2; spin.add(hub);
  if(mil){ for(let k=0;k<8;k++){ const a=k*Math.PI/4, b=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,w+0.06,6),C.chrome); b.rotation.z=Math.PI/2; b.position.set(0,Math.cos(a)*rr*0.7,Math.sin(a)*rr*0.7); spin.add(b); } }
  else for(let k=0;k<5;k++){ const a=k*Math.PI*2/5; [-1,1].forEach(function(s){ const sp=carBox(spin,C.rimD,s*(w/2+0.004),0,0,0.02,rr*0.95,0.05); sp.rotation.x=a; sp.position.set(s*(w/2+0.004),Math.cos(a)*rr*0.47,Math.sin(a)*rr*0.47); }); }
  return {pivot:pivot, spin:spin};
}
function carModel(kind){
  const K=CAR_KINDS.find(function(k){ return k.id===kind; })||CAR_KINDS[0], C=carMats(), P=carPaint(K.paint);
  const g=new THREE.Group(), body=new THREE.Group(); g.add(body);
  let wb, tw, r, ride;
  if(!K.mil){
    /* ---- modern crossover SUV: 4.62 m long, 1.88 m wide, wheels 19" */
    wb=2.76; tw=1.62; r=0.37; ride=0;
    const ax=wb/2, ar=0.47, y0=0.36;
    const low=[[-2.24,y0],{arc:[-ax,y0,ar,Math.PI,0]},{arc:[ax,y0,ar,Math.PI,0]},[2.18,y0],[2.3,0.46],[2.33,0.66],[2.31,0.82],[2.18,0.95],[1.6,1.02],[1.1,1.07],
      [-1.0,1.08],[-1.95,1.06],[-2.24,1.0],[-2.31,0.84],[-2.3,0.52]];
    body.add(carExtrude(low,1.88,P,0.07));
    /* glasshouse with tumblehome, roof and pillars */
    const gl=[[1.12,1.06],[0.3,1.57],[-0.4,1.6],[-1.55,1.58],[-1.98,1.44],[-2.14,1.08],[-1.0,1.06]];
    body.add(carExtrude(gl,1.6,C.glass,0.04));
    const roof=[[0.33,1.575],[-0.4,1.607],[-1.56,1.587],[-1.9,1.48],[-1.86,1.6],[-1.56,1.665],[-0.4,1.675],[0.12,1.63]];
    body.add(carExtrude(roof,1.62,P,0.02));
    [-1,1].forEach(function(s){
      const a=carExtrude([[1.12,1.07],[1.03,1.07],[0.24,1.58],[0.31,1.59]],0.03,C.plastic); a.position.x=s*0.79; body.add(a);         // A pillar
      const b=carExtrude([[-0.42,1.07],[-0.52,1.07],[-0.5,1.6],[-0.4,1.6]],0.03,C.plastic); b.position.x=s*0.8; body.add(b);           // B pillar
      const c=carExtrude([[-1.55,1.07],[-2.12,1.08],[-1.97,1.44],[-1.62,1.57],[-1.42,1.57]],0.03,P); c.position.x=s*0.805; body.add(c);   // D pillar (body colour)
      carBox(body,C.chrome,s*0.79,1.06,0.5,0.03,0.03,3.0);                                                               // window line
      carBox(body,C.trim,s*0.95,0.62,0,0.03,0.12,2.1);                                                                   // door rubbing strip
      [0.2,1.3].forEach(function(z){ carBox(body,C.chrome,s*0.95,0.97,z,0.03,0.04,0.2); });                            // handles
      carBox(body,C.plastic,s*0.98,0.42,0,0.06,0.16,1.6);                                                                // sill cladding
      [-ax,ax].forEach(function(z){ const f=new THREE.Mesh(new THREE.TorusGeometry(ar+0.02,0.05,4,14,Math.PI),C.plastic); f.rotation.y=Math.PI/2; f.position.set(s*0.95,y0,z); body.add(f); });
      const mir=new THREE.Group(); mir.position.set(s*0.98,1.12,-0.92); body.add(mir); carBox(mir,P,s*0.06,0,0,0.16,0.13,0.24); carBox(mir,C.amber,s*0.06,-0.05,-0.12,0.14,0.02,0.02);
      carBox(body,C.chrome,s*0.62,1.69,0.6,0.05,0.04,2.0);                                                              // roof rails
    });
    /* front: LED headlights, DRL strip, grille, skid plate */
    carBox(body,C.trim,0,0.82,-2.4,1.1,0.14,0.06); carBox(body,C.plastic,0,0.62,-2.42,1.25,0.26,0.05);
    for(let i=0;i<5;i++) carBox(body,C.chrome,0,0.53+i*0.05,-2.44,1.15,0.012,0.02);
    carBox(body,C.drl,0,0.93,-2.27,1.72,0.025,0.03,0.6);
    [-1,1].forEach(function(s){ carBox(body,C.head,s*0.68,0.84,-2.37,0.42,0.08,0.05); carBox(body,C.amber,s*0.86,0.84,-2.34,0.08,0.06,0.05); carBox(body,C.trim,s*0.75,0.48,-2.4,0.24,0.08,0.06); });
    carBox(body,C.chrome,0,0.42,-2.4,0.9,0.05,0.08);
    carBox(body,C.plate,0,0.62,-2.455,0.52,0.11,0.01);
    /* rear: full-width light bar, plate, diffuser, spoiler */
    carBox(body,C.tail,0,0.96,2.38,1.7,0.05,0.04); [-1,1].forEach(function(s){ carBox(body,C.tail,s*0.74,0.9,2.36,0.32,0.14,0.05); });
    carBox(body,C.plate,0,0.68,2.42,0.52,0.11,0.01); carBox(body,C.plastic,0,0.45,2.37,1.5,0.14,0.06); carBox(body,C.chrome,0,0.42,2.4,0.5,0.04,0.04);
    carBox(body,C.glass,0,1.27,2.1,1.42,0.28,0.02,-0.45);
    { const sp=carExtrude([[-1.85,1.6],[-2.02,1.5],[-2.05,1.53],[-1.88,1.66]],1.4,P,0.02); body.add(sp); }
    if(K.sign){ const s=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.32,0.06),new THREE.MeshLambertMaterial({map:signTex(K.sign,'#111','#ffd21a',256,64)})); s.position.set(0,1.98,0.5); body.add(s);
      carBox(body,C.trim,0,1.74,0.5,1.36,0.06,0.3); carBox(body,C.amber,-0.45,1.82,0.5,0.3,0.14,0.26); carBox(body,C.amber,0.45,1.82,0.5,0.3,0.14,0.26);
      [-1,1].forEach(function(s2){ for(let i=0;i<7;i++) carBox(body,i%2?C.trim:carPaint(0xf2f2f2),s2*0.952,0.78,-1.6+i*0.47,0.02,0.09,0.47); }); }
  } else {
    /* ---- military 4×4 (light tactical vehicle): 5.0 m long, 2.2 m wide, high clearance, 37" tyres */
    wb=3.1; tw=1.86; r=0.48; ride=0.08;
    const ax=wb/2, ar=0.6, y0=0.6;
    const low=[[-2.45,y0],{arc:[-ax,y0,ar,Math.PI,0]},{arc:[ax,y0,ar,Math.PI,0]},[2.35,y0],[2.5,0.75],[2.52,1.22],[2.38,1.32],[0.95,1.38],
      [-2.4,1.38],[-2.5,1.3],[-2.5,0.75]];
    body.add(carExtrude(low,2.18,P,0.04));
    const cab=[[0.95,1.36],[0.62,2.02],[-1.15,2.05],[-1.25,1.36]];
    body.add(carExtrude(cab,2.0,P,0.03));
    /* armoured glass: narrow windscreen and side windows set into the cab */
    [-0.45,0.45].forEach(function(x){ carBox(body,C.glass,x,1.7,-0.8,0.8,0.56,0.04,0.46); }); carBox(body,P,0,1.7,-0.8,0.1,0.6,0.06,0.46);
    [-1,1].forEach(function(s){ [-0.28,0.62].forEach(function(z){ carBox(body,C.glass,s*1.002,1.72,z,0.02,0.42,0.68); }); });
    /* camo blotches */
    const rr=mulberry32(77); for(let i=0;i<16;i++){ const s=i%2?1:-1; carBox(body,C.camo,s*1.1,0.8+rr()*0.45,-2.1+rr()*4.2,0.012,0.18+rr()*0.18,0.3+rr()*0.5); }
    /* rear bed with canvas bows and a roof hatch ring */
    [-1,1].forEach(function(s){ carBox(body,P,s*1.05,1.62,1.85,0.08,0.5,1.25); });
    carBox(body,C.canvas,0,1.95,1.85,2.1,0.12,1.3); carBox(body,P,0,1.6,2.48,2.18,0.45,0.06); [1.35,1.85,2.35].forEach(function(z){ carBox(body,C.plastic,0,1.9,z,2.12,0.05,0.05); });
    { const ring=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.07,6,16),C.plastic); ring.rotation.x=Math.PI/2; ring.position.set(0,2.1,-0.3); body.add(ring);
      carBox(body,C.plastic,0,2.32,-0.05,0.08,0.08,0.7); carBox(body,C.plastic,0,2.2,-0.4,0.6,0.3,0.06); }
    /* bull bar, lights, winch, spare wheel, mirrors, antenna */
    carBox(body,C.plastic,0,0.9,-2.67,1.9,0.08,0.08); [-0.8,0,0.8].forEach(function(x){ carBox(body,C.plastic,x,0.95,-2.65,0.08,0.6,0.08); }); carBox(body,C.plastic,0,1.25,-2.65,1.6,0.08,0.08);
    carBox(body,C.trim,0,0.82,-2.59,0.5,0.22,0.14);
    [-1,1].forEach(function(s){ carBox(body,C.head,s*0.78,1.2,-2.6,0.22,0.14,0.04); carBox(body,C.amber,s*0.98,1.2,-2.59,0.08,0.08,0.04); carBox(body,C.tail,s*0.9,1.1,2.59,0.14,0.18,0.04);
      carBox(body,C.plastic,s*1.15,1.82,-0.85,0.06,0.3,0.2); carBox(body,C.plastic,s*1.12,1.6,-0.85,0.2,0.04,0.04); carBox(body,P,s*1.0,1.32,-1.6,0.12,0.06,1.6); });
    for(let i=0;i<7;i++) carBox(body,C.trim,0,1.1+i*0.03,-2.58,1.0,0.012,0.02);
    { const sw=carWheel(0.44,0.32,true); sw.pivot.rotation.y=Math.PI/2; sw.pivot.position.set(0,1.18,2.62); body.add(sw.pivot); }
    carBox(body,C.plastic,-0.95,2.2,1.0,0.03,1.2,0.03);
    carBox(body,C.plateM,0,0.85,2.59,0.52,0.11,0.01); carBox(body,C.plateM,0,0.65,-2.62,0.52,0.11,0.01);
  }
  /* wheels */
  const wheels=[]; [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(function(p){ const w=carWheel(r,K.mil?0.38:0.26,K.mil);
    w.pivot.position.set(p[0]*tw/2,r,p[1]>0?-wb/2:wb/2); g.add(w.pivot); wheels.push({pivot:w.pivot, spin:w.spin, front:p[1]>0, r:r}); });
  /* underbody shadow-ish dark plate */
  carBox(body,C.trim,0,r*0.75,0,tw-0.1,0.08,wb+0.8);
  body.position.y=ride;
  return {g:g, body:body, wheels:wheels, wb:wb, tw:tw, r:r, ride:ride, kind:K};
}
/* bake the static body into a few meshes (phones); wheels stay separate for animation */
function carBuild(kind){
  const m=carModel(kind); m.body.position.y=0; const b=bakeGroup(m.body); m.g.remove(m.body); b.position.y=m.ride; m.g.add(b); m.body=b; return m;
}
