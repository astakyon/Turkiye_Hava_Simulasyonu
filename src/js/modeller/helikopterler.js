/* ------------------------------------------------------------------ helicopters: T129 ATAK (tandem-seat attack) and T625 GÖKBEY (utility).
   Fuselages are lathe bodies (smooth round sections) squashed to the right width/height; rotors are separate groups for spinning.
   heliModel(id) -> {g, rotor, trot, disc, tdisc, def}. Forward is -z, origin on the ground under the rotor mast, wheels touch y=0. */
const HELI_DEF={
  t129:{name:'T129 ATAK', paint:0x4f5a4b, R:5.95, tr:1.1, blades:4, mastY:3.45, top:76, acc:30, climb:13, yawR:1.25, len:14},
  t625:{name:'T625 GÖKBEY', paint:0x6c767e, R:6.1, tr:1.15, blades:4, mastY:3.35, top:72, acc:27, climb:11, yawR:1.1, len:13.5}
};
const HLM={};
function heliMats(){
  if(HLM.dark) return HLM; const L=function(c){ return new THREE.MeshLambertMaterial({color:c}); };
  Object.assign(HLM,{dark:L(0x23272b), metal:L(0x7c838a), blade:L(0x1d2125), tire:L(0x16181a), white:L(0xeef0f2), red:L(0xc8141c),
    glass:new THREE.MeshStandardMaterial({color:0x1a2a36, roughness:0.06, metalness:0.75, envMap:ENVMAP, envMapIntensity:1.4, transparent:true, opacity:0.88}),
    disc:new THREE.MeshBasicMaterial({color:0x111418, transparent:true, opacity:0, depthWrite:false, side:THREE.DoubleSide}),
    nav:new THREE.MeshBasicMaterial({color:0xff2a1a}), navG:new THREE.MeshBasicMaterial({color:0x22ff66}), strobe:new THREE.MeshBasicMaterial({color:0xffffff})});
  HLM.nav.userData.glow=4; HLM.navG.userData.glow=4; HLM.strobe.userData.glow=3;
  return HLM;
}
function heliPaint(c){ const k='p'+c; return HLM[k]||(HLM[k]=new THREE.MeshStandardMaterial({color:c, roughness:0.55, metalness:0.25, envMap:ENVMAP, envMapIntensity:0.6})); }
/* lathe body along z: profile [[r, a]] with a = distance forward (+a -> -z); sx/sy squash width/height */
function hLathe(prof,sx,sy,mat,seg){
  const pts=prof.map(function(p){ return new THREE.Vector2(Math.max(0.001,p[0]),p[1]); });
  const geo=new THREE.LatheGeometry(pts,seg||20); geo.scale(sx,1,sy); geo.rotateX(-Math.PI/2); return new THREE.Mesh(geo,mat);
}
function hBox(p,mat,x,y,z,w,h,d){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); p.add(m); return m; }
function hCylZ(p,mat,x,y,z,r0,r1,len,seg){ const g=new THREE.CylinderGeometry(r1,r0,len,seg||14); g.rotateX(Math.PI/2); const m=new THREE.Mesh(g,mat); m.position.set(x,y,z); p.add(m); return m; }   // r0 front (-z), r1 back
function hWheel(p,x,y,z,r,w){ const M=heliMats(), t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,14),M.tire); t.rotation.z=Math.PI/2; t.position.set(x,y,z); p.add(t);
  const h=new THREE.Mesh(new THREE.CylinderGeometry(r*0.5,r*0.5,w+0.02,10),M.metal); h.rotation.z=Math.PI/2; h.position.set(x,y,z); p.add(h); }
function hRoundel(p,x,y,z,r,side){ const M=heliMats(), a=new THREE.Mesh(new THREE.CircleGeometry(r,20),M.red), b=new THREE.Mesh(new THREE.CircleGeometry(r*0.55,20),M.white);
  [a,b].forEach(function(m,i){ m.position.set(x+side*(0.003+i*0.003),y,z); m.rotation.y=side*Math.PI/2; p.add(m); }); }
function heliRotor(R,n,chord,hubR){
  const M=heliMats(), g=new THREE.Group();
  for(let i=0;i<n;i++){ const b=new THREE.Group(); b.rotation.y=i*Math.PI*2/n; g.add(b);
    const bl=hBox(b,M.blade,0,0,-R/2-hubR*0.6,chord,0.06,R-hubR*1.2); bl.rotation.z=0.06; hBox(b,M.white,0,0.002,-R+0.35,chord+0.01,0.065,0.5); }
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(hubR,hubR*1.2,0.35,12),M.metal); g.add(hub);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(hubR*0.8,12,8,0,Math.PI*2,0,Math.PI/2),M.dark); cap.position.y=0.17; g.add(cap);
  return g;
}
function heliModel(id){
  const D=HELI_DEF[id], M=heliMats(), P=heliPaint(D.paint), g=new THREE.Group(), body=new THREE.Group(); g.add(body);
  if(id==='t129'){
    /* narrow fuselage, tandem stepped canopy (gunner front, pilot behind and higher) */
    const pod=hLathe([[0,-2.6],[0.5,-2.5],[0.68,-1.2],[0.74,0.4],[0.72,2.2],[0.62,3.6],[0.48,4.7],[0.3,5.5],[0.12,5.85],[0,5.9]],0.72,1.28,P,22); pod.position.set(0,1.5,0); body.add(pod);
    const fair=hLathe([[0,-1.6],[0.42,-1.3],[0.55,0],[0.5,1.4],[0.3,2.1],[0,2.3]],1.25,0.75,P); fair.position.set(0,2.35,0.2); body.add(fair);     // engine/gearbox fairing
    [-1,1].forEach(function(s){ const n=hLathe([[0,-1.4],[0.24,-1.3],[0.33,-0.4],[0.33,0.7],[0.28,1.2],[0,1.3]],1,1.05,P,14); n.position.set(s*0.62,2.35,0.6); body.add(n);
      const ex=hCylZ(body,M.dark,s*0.86,2.45,1.9,0.18,0.22,0.6,10); ex.rotation.y=s*0.5; });
    const c1=new THREE.Mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*0.5),M.glass); c1.scale.set(0.5,0.62,1.05); c1.position.set(0,2.02,-3.25); body.add(c1);
    const c2=new THREE.Mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*0.5),M.glass); c2.scale.set(0.52,0.7,1.05); c2.position.set(0,2.2,-1.85); body.add(c2);
    /* nose sensor ball, chin turret with 20 mm cannon */
    const sb=new THREE.Mesh(new THREE.SphereGeometry(0.34,14,10),M.dark); sb.position.set(0,1.42,-5.55); body.add(sb);
    const sw=new THREE.Mesh(new THREE.CircleGeometry(0.16,12),M.glass); sw.position.set(0,1.42,-5.9); sw.rotation.y=Math.PI; body.add(sw);
    const tu=new THREE.Mesh(new THREE.SphereGeometry(0.3,12,8),M.dark); tu.position.set(0,0.88,-4.3); body.add(tu); hCylZ(body,M.dark,0,0.84,-5.1,0.05,0.07,1.5,8);
    /* stub wings with rocket pods (inner) and 4-round missile racks (outer) */
    [-1,1].forEach(function(s){ const w=hBox(body,P,s*1.45,1.45,0.05,1.9,0.12,1.05); w.rotation.z=-s*0.06;
      hBox(body,M.dark,s*1.15,1.2,0.05,0.12,0.35,0.6); hCylZ(body,M.dark,s*1.15,0.92,0.05,0.24,0.24,1.5,12); hCylZ(body,M.metal,s*1.15,0.92,-0.71,0.24,0.22,0.03,12);
      hBox(body,M.dark,s*2.05,1.18,0.05,0.12,0.3,0.6); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ hCylZ(body,M.metal,s*2.05+q[0]*0.13,0.92+q[1]*0.13,0.05,0.09,0.09,1.6,8); });
      hBox(body,M.dark,s*2.38,1.42,0.05,0.04,0.3,0.6); });
    /* tail boom, fin with tail rotor on the left, stabiliser, tail wheel */
    hCylZ(body,P,0,1.85,4.6,0.48,0.2,4.6,14);
    { const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(1.0,0); sh.lineTo(1.6,1.75); sh.lineTo(1.05,1.8); sh.lineTo(0.2,0.5); sh.lineTo(-0.1,0.25);
      const fg=new THREE.ExtrudeGeometry(sh,{depth:0.14,bevelEnabled:false}); fg.translate(0,0,-0.07); const fin=new THREE.Mesh(fg,P); fin.rotation.y=-Math.PI/2; fin.position.set(0,1.85,6.4); body.add(fin); }
    hBox(body,P,0,1.92,6.0,2.3,0.08,0.55); [-1,1].forEach(function(s){ hBox(body,P,s*1.15,1.92,6.0,0.05,0.4,0.5); });
    hBox(body,P,0,1.3,6.9,0.1,0.8,0.4); hWheel(body,0,0.17,7.0,0.17,0.12); hBox(body,M.dark,0,0.6,6.95,0.06,0.9,0.08);
    hRoundel(body,0.31,1.9,4.0,0.22,1); hRoundel(body,-0.31,1.9,4.0,0.22,-1);
    /* main gear (fixed, trailing arm) */
    [-1,1].forEach(function(s){ hBox(body,M.dark,s*0.75,0.6,-1.4,0.9,0.08,0.12).rotation.z=s*0.5; hWheel(body,s*1.12,0.3,-1.4,0.3,0.2); });
    /* nav lights */
    hBox(body,M.nav,-2.42,1.45,0.05,0.06,0.06,0.1); hBox(body,M.navG,2.42,1.45,0.05,0.06,0.06,0.1); hBox(body,M.strobe,0,3.6,7.6,0.08,0.08,0.08);
  } else {
    /* T625: roomy cabin, smooth nose with a big wrap-around windscreen, sponsons with the main wheels */
    const pod=hLathe([[0,-3.2],[0.55,-3.05],[0.9,-2.0],[1.0,-0.6],[1.02,1.0],[0.98,2.4],[0.82,3.35],[0.6,4.0],[0.32,4.4],[0,4.55]],0.95,0.98,P,24); pod.position.set(0,1.45,0); body.add(pod);
    const ws=new THREE.Mesh(new THREE.SphereGeometry(1,22,12,0,Math.PI*2,0,Math.PI*0.42),M.glass); ws.scale.set(0.9,0.72,1.25); ws.position.set(0,1.6,-2.95); body.add(ws);
    const top=hLathe([[0,-2.2],[0.45,-1.9],[0.6,-0.6],[0.6,1.2],[0.45,2.2],[0,2.5]],1.2,0.62,P,18); top.position.set(0,2.42,0.4); body.add(top);
    [-1,1].forEach(function(s){ const ex=hCylZ(body,M.dark,s*0.62,2.55,2.6,0.16,0.2,0.6,10); ex.rotation.y=s*0.45;
      [-1.55,-0.35,0.75].forEach(function(z,i){ hBox(body,M.glass,s*0.985,1.85,z,0.03,0.55,i===0?0.7:0.85); });
      hBox(body,M.dark,s*0.99,2.25,-0.1,0.02,0.04,2.5); hBox(body,M.dark,s*0.995,1.3,0.2,0.02,1.25,0.03); hBox(body,M.dark,s*0.995,1.3,-1.0,0.02,1.25,0.03);
      const sp=hLathe([[0,-1.0],[0.22,-0.85],[0.3,0],[0.26,0.8],[0,1.0]],1,0.9,P,12); sp.position.set(s*1.05,0.72,0.6); body.add(sp);
      hWheel(body,s*1.12,0.3,0.7,0.3,0.2); hRoundel(body,s*0.96,1.6,2.6,0.25,s); });
    hWheel(body,0,0.22,-2.6,0.22,0.16); hBox(body,M.dark,0,0.5,-2.6,0.08,0.5,0.08);
    hCylZ(body,P,0,1.9,5.8,0.55,0.22,5.6,14);
    { const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(1.1,0); sh.lineTo(1.7,1.9); sh.lineTo(1.1,1.95); sh.lineTo(0.15,0.55); sh.lineTo(-0.1,0.25);
      const fg=new THREE.ExtrudeGeometry(sh,{depth:0.16,bevelEnabled:false}); fg.translate(0,0,-0.08); const fin=new THREE.Mesh(fg,P); fin.rotation.y=-Math.PI/2; fin.position.set(0,1.95,7.9); body.add(fin); }
    hBox(body,P,0,1.95,7.4,2.6,0.08,0.6); [-1,1].forEach(function(s){ hBox(body,P,s*1.3,1.95,7.4,0.05,0.45,0.55); });
    hBox(body,M.red,0,1.92,8.62,0.1,0.25,0.05);
    hBox(body,M.nav,-1.05,1.0,0.6,0.06,0.06,0.1); hBox(body,M.navG,1.05,1.0,0.6,0.06,0.06,0.1); hBox(body,M.strobe,0,3.75,9.1,0.08,0.08,0.08);
  }
  /* main rotor (with a faint blur disc that fades in as the rotor spins up), tail rotor on the left of the fin */
  hCylZ(body,M.metal,0,D.mastY-0.3,id==='t129'?0.2:0.4,0.1,0.1,0.01); { const m=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,0.7,10),M.metal); m.position.set(0,D.mastY-0.3,id==='t129'?0.2:0.4); body.add(m); }
  const rotor=heliRotor(D.R,D.blades,0.5,0.35); rotor.position.set(0,D.mastY,id==='t129'?0.2:0.4); g.add(rotor);
  const dm=M.disc.clone(), disc=new THREE.Mesh(new THREE.CircleGeometry(D.R,40),dm); disc.rotation.x=-Math.PI/2; disc.position.copy(rotor.position); disc.position.y+=0.02; g.add(disc);
  const tz=id==='t129'?7.65:9.15, ty=id==='t129'?3.05:3.25, trot=new THREE.Group(); trot.position.set(-0.18,ty,tz); g.add(trot);
  const tr=heliRotor(D.tr,4,0.2,0.1); tr.rotation.z=Math.PI/2; trot.add(tr);
  const tdisc=new THREE.Mesh(new THREE.CircleGeometry(D.tr,24),dm); tdisc.rotation.y=Math.PI/2; tdisc.position.set(-0.22,ty,tz); g.add(tdisc);
  return {g:g, body:body, rotor:rotor, trot:trot, disc:disc, tdisc:tdisc, def:D, id:id};
}
function heliBuild(id){ const m=heliModel(id); const b=bakeGroup(m.body); m.g.remove(m.body); m.g.add(b); m.body=b; return m; }
