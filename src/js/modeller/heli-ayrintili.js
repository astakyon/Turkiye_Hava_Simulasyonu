/* ------------------------------------------------------------------ helicopters — detailed models (V2.49, model series)
   Builds on the V1 bodies and adds what the real aircraft show: T129 ATAK with Roketsan CİRİT launchers (inner) and four L-UMTAS
   (outer) on the stub wings, engine intakes and exhausts, wire cutters, canopy frames, IR jammer and the flag on the fin;
   T625 GÖKBEY with the windscreen frame, sliding cabin door, steps, engine intakes and the GÖKBEY lettering.
   Same return shape as before; the V1 model stays as heliModelV1 for the library comparison. */
function heliTxt(t,c){ const k='t'+t; return HLM[k]||(HLM[k]=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide,
  map:apTex(512,96,function(x,W,H){ x.clearRect(0,0,W,H); x.fillStyle=c||'#1d2125'; x.font='800 60px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(t,W/2,H/2+3); })})); }
function heliSide(p,mat,x,y,z,w,h){ [-1,1].forEach(function(s){ const d=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); d.position.set(s*x,y,z); d.rotation.y=s>0?Math.PI/2:-Math.PI/2; p.add(d); }); }
/* CİRİT 2.75" laser-guided rocket launcher (4 tubes, rocket noses visible) */
function heliCirit(p,M,x,y,z){ hCylZ(p,M.dark,x,y,z,0.22,0.22,1.45,12); hCylZ(p,M.metal,x,y,z-0.74,0.22,0.2,0.04,12);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ const n=new THREE.Mesh(new THREE.SphereGeometry(0.055,8,6),M.white); n.position.set(x+q[0]*0.09,y+q[1]*0.09,z-0.75); n.scale.z=1.8; p.add(n); }); }
/* L-UMTAS: four missiles with seeker domes and cruciform fins on a rack */
function heliUmtas(p,M,x,y,z){ hBox(p,M.dark,x,y+0.17,z,0.2,0.1,1.3);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ const mx=x+q[0]*0.13, my=y-0.02+q[1]*0.13;
    hCylZ(p,M.white,mx,my,z,0.08,0.08,1.6,10); const d=new THREE.Mesh(new THREE.SphereGeometry(0.08,10,8,0,Math.PI*2,0,Math.PI/2),M.glassD||M.dark); d.rotation.x=-Math.PI/2; d.position.set(mx,my,z-0.8); p.add(d);
    for(let f=0;f<4;f++){ const fin=hBox(p,M.white,mx,my,z+0.62,0.01,0.2,0.22); fin.rotation.z=f*Math.PI/4+Math.PI/4; } }); }
function heliModel(id){
  const m=heliModelV1(id), M=heliMats(), D=m.def, body=m.body, P=heliPaint(D.paint);
  if(id==='t129'){
    /* replace the generic stores with CİRİT and L-UMTAS */
    body.children.slice().forEach(function(c){ const ax=Math.abs(c.position.x); if(ax>1.0&&ax<2.3&&c.position.y>0.8&&c.position.y<1.3) body.remove(c); });
    [-1,1].forEach(function(s){ hBox(body,M.dark,s*1.15,1.28,0.05,0.12,0.22,0.7); heliCirit(body,M,s*1.15,0.94,0.05);
      hBox(body,M.dark,s*2.0,1.28,0.05,0.12,0.22,0.7); heliUmtas(body,M,s*2.0,0.95,0.05);
      /* engine intakes (front of the nacelles) */
      const ia=new THREE.Mesh(new THREE.CircleGeometry(0.22,14),M.dark); ia.position.set(s*0.62,2.35,-0.76); ia.rotation.y=Math.PI; body.add(ia);
      /* canopy frame and windscreen wipers */
      hBox(body,M.dark,s*0.36,2.1,-2.55,0.03,0.5,0.05).rotation.z=-s*0.35; });
    hBox(body,M.dark,0,2.75,-2.55,0.04,0.04,1.2).rotation.x=0.25;   /* canopy spine */
    hBox(body,M.dark,0,2.63,-3.6,0.04,0.35,0.05).rotation.x=0.5; hBox(body,M.dark,0,0.7,-3.6,0.04,0.35,0.05).rotation.x=-0.5;   /* wire cutters */
    hBox(body,M.dark,0,2.95,1.25,0.32,0.35,0.32); hCylZ(body,M.dark,0,3.0,1.0,0.1,0.1,0.06,10);   /* IR jammer */
    [-1,1].forEach(function(s){ hBox(body,M.dark,s*0.3,1.0,-5.1,0.1,0.1,0.1); hBox(body,M.dark,s*0.14,1.95,6.9,0.03,0.25,0.25); });   /* RWR sensors */
    hBox(body,M.dark,0,0.62,-2.5,0.02,0.02,1.2); hBox(body,M.dark,0,0.52,0.5,0.02,0.25,0.02);   /* antennas */
    heliSide(body,FLAG_MAT,0.08,2.6,6.55,0.5,0.33);
    heliSide(body,heliTxt('ATAK','#1d2125'),0.5,1.55,2.4,1.1,0.2);
  } else {
    [-1,1].forEach(function(s){
      hBox(body,M.dark,s*0.93,1.6,-2.45,0.04,0.95,0.05).rotation.z=s*0.25;   /* windscreen pillars */
      hBox(body,M.dark,s*1.005,1.45,0.2,0.02,0.04,2.3); hBox(body,M.metal,s*1.0,2.0,0.4,0.03,0.05,2.6);   /* sliding door rails */
      hBox(body,M.dark,s*1.12,0.62,-1.6,0.35,0.05,0.5);   /* step */
      const ia=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.3),M.dark); ia.position.set(s*0.64,2.55,-0.4); ia.rotation.y=s>0?Math.PI/2+0.3:-Math.PI/2-0.3; body.add(ia);   /* engine intakes */
      for(let k=0;k<4;k++) hBox(body,M.metal,s*0.66,2.44+k*0.07,-0.38,0.02,0.02,0.45);
      hBox(body,M.dark,s*0.5,0.95,-3.3,0.04,0.04,0.6); });
    hBox(body,M.dark,0,2.6,-3.0,0.04,0.35,0.05).rotation.x=0.4; hBox(body,M.dark,0,0.5,-3.0,0.04,0.35,0.05).rotation.x=-0.4;   /* wire cutters */
    hBox(body,M.dark,0,0.48,1.0,0.02,0.3,0.02); hBox(body,M.dark,0,3.0,2.2,0.02,0.3,0.02);
    heliSide(body,FLAG_MAT,0.09,2.75,8.1,0.5,0.33);
    heliSide(body,heliTxt('GÖKBEY','#1d2125'),0.42,1.95,5.0,1.5,0.26);
  }
  return m;
}
