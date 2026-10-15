/* ------------------------------------------------------------------ landmarks: a dam and reservoir in the southern mountains, a ski
   resort with a gondola on the eastern summit, an ancient city on the south island's shore, a castle on the islet, an oil
   platform with a burning flare, an offshore wind farm and a mountain-top observatory. */
const LMK={dam:{x:-3000,z:12400,R:400}, gondola:null, cabins:[], flare:null, rotors:null, rotorD:[], domes:[], built:false};
function windGeos(){
  const towerG=MK.merge([(function(){ const c=new THREE.CylinderGeometry(2.0,3.4,80,14); c.translate(0,40,0); return c; })(),(function(){ const b=new THREE.BoxGeometry(3,3.2,9); b.translate(0,81.6,1.8); return b; })()]);
  const blade=function(a){ const b=new THREE.BoxGeometry(0.6,44,3.2), p=b.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i); p.setZ(i,p.getZ(i)*(1-0.75*(y+22)/44)); } b.translate(0,23,0); b.rotateZ(a); return b; };
  const hub=new THREE.SphereGeometry(1.6,12,8); hub.scale(1,1,1.5); const rotorG=MK.merge([blade(0),blade(2.094),blade(4.189),hub]); rotorG.computeVertexNormals(); return {towerG:towerG, rotorG:rotorG}; }
function buildLandmarks(){
  const M=apMats(), L=LMK, g=new THREE.Group(), r=mulberry32(1453), mt=new THREE.Matrix4(), q=new THREE.Quaternion(), s3=new THREE.Vector3(1,1,1), p3=new THREE.Vector3();
  const stone=new THREE.MeshLambertMaterial({color:0xd8cfb8}), stoneD=new THREE.MeshLambertMaterial({color:0xb9ae94}), conc=M.conc;
  /* ---- dam and reservoir: an arch dam closes the outlet of a mountain valley */
  { const D=L.dam, h0=terrainH(D.x,D.z), lvl=h0+35, ring=[]; for(let a=0;a<72;a++){ const t=a/72*Math.PI*2; ring.push([t,terrainH(D.x+Math.cos(t)*D.R,D.z+Math.sin(t)*D.R)]); }
    const low=ring.filter(function(e){ return e[1]<lvl+3; }); D.level=lvl;
    const w=new THREE.Mesh(new THREE.CircleGeometry(D.R,64),new THREE.MeshPhongMaterial({color:0x2a6d8a,specular:0x99aabb,shininess:60})); w.rotation.x=-Math.PI/2; w.position.set(D.x,lvl,D.z); scene.add(w);
    if(low.length){ let s=Math.atan2(low.reduce(function(a,e){ return a+Math.sin(e[0]); },0),low.reduce(function(a,e){ return a+Math.cos(e[0]); },0)), span=Math.min(1.6,(low.length+4)/72*Math.PI*2);
      let base=lvl; low.forEach(function(e){ base=Math.min(base,e[1]); }); base-=6; const H=lvl+5-base;
      const arch=new THREE.Mesh(new THREE.CylinderGeometry(D.R+2,D.R+8,H,40,1,true,0,span),new THREE.MeshLambertMaterial({color:0xcfd1cc,side:THREE.DoubleSide}));
      arch.position.set(D.x,base+H/2,D.z); arch.rotation.y=Math.PI/2-s-span/2+Math.PI; scene.add(arch);
      const crest=new THREE.Mesh(new THREE.CylinderGeometry(D.R+9,D.R+9,1.2,40,1,true,0,span),new THREE.MeshLambertMaterial({color:0xb0b3ae,side:THREE.DoubleSide})); crest.position.set(D.x,lvl+5,D.z); crest.rotation.y=arch.rotation.y; scene.add(crest);
      const ox=D.x+Math.cos(s)*(D.R+30), oz=D.z+Math.sin(s)*(D.R+30); const spill=new THREE.Mesh(new THREE.PlaneGeometry(14,H),new THREE.MeshBasicMaterial({color:0xe8f4f8,transparent:true,opacity:0.7,side:THREE.DoubleSide}));
      spill.position.set(D.x+Math.cos(s)*(D.R+6),base+H/2,D.z+Math.sin(s)*(D.R+6)); spill.lookAt(D.x,base+H/2,D.z); scene.add(spill);
      navObst(Math.min(D.x+Math.cos(s-span/2)*D.R,D.x+Math.cos(s+span/2)*D.R,D.x+Math.cos(s)*D.R)-10,Math.max(D.x+Math.cos(s-span/2)*D.R,D.x+Math.cos(s+span/2)*D.R,D.x+Math.cos(s)*D.R)+10,
        Math.min(D.z+Math.sin(s-span/2)*D.R,D.z+Math.sin(s+span/2)*D.R,D.z+Math.sin(s)*D.R)-10,Math.max(D.z+Math.sin(s-span/2)*D.R,D.z+Math.sin(s+span/2)*D.R,D.z+Math.sin(s)*D.R)+10,lvl+6,true);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(22,3),new THREE.MeshLambertMaterial({map:signTex('HİLAL BARAJI','#cfd1cc','#1d3557',1024,128),side:THREE.DoubleSide})); sg.position.set(ox,lvl+1,oz); sg.lookAt(D.x,lvl+1,D.z); scene.add(sg); D.outlet=[ox,oz]; } }
  /* ---- ski resort: hotel and lift station at the base, gondola to the summit station */
  { const b=[4340,-5465], t=[6700,-5050], yb=486, yt=1858; L.gondola={b:b,t:t,yb:yb+14,yt:yt+14};
    bldg(g,b[0]-40,yb,b[1],46,12,18,{floors:4,wall:'#d9c6a8'}); const rf=new THREE.Mesh(new THREE.ConeGeometry(34,9,4),new THREE.MeshLambertMaterial({color:0x7a3a2a})); rf.rotation.y=Math.PI/4; rf.scale.set(1,1,0.42); rf.position.set(b[0]-40,yb+16.5,b[1]); g.add(rf);
    const hs=new THREE.Mesh(new THREE.PlaneGeometry(18,2.4),new THREE.MeshLambertMaterial({map:signTex('KAYAK MERKEZİ','#7a3a2a','#ffffff',1024,128)})); hs.position.set(b[0]-40,yb+10,b[1]+9.1); g.add(hs);
    [b,t].forEach(function(p,i){ const y=i?yt:yb; apBox(g,M.concD,p[0],y,p[1],14,12,10); apBox(g,M.red,p[0],y+12,p[1],16,1,12); apBox(g,M.dark,p[0],y+13,p[1],6,2,3); });
    const n=14; for(let k=1;k<n;k++){ const u=k/n, x=b[0]+(t[0]-b[0])*u, z=b[1]+(t[1]-b[1])*u, ground=terrainH(x,z), cy=yb+14+(yt-yb)*u; if(cy-ground<6) continue;
      apCyl(g,M.metal,x,ground,z,0.8,1.2,cy-ground+2,8); apBox(g,M.metal,x,cy+1,z,8,0.8,1.2); }
    const cab=[]; [-3,3].forEach(function(off){ const dx=-(t[1]-b[1]), dz=(t[0]-b[0]), dl=Math.hypot(dx,dz); cab.push(b[0]+dx/dl*off,yb+14,b[1]+dz/dl*off, t[0]+dx/dl*off,yt+14,t[1]+dz/dl*off); });
    const cg=new THREE.BufferGeometry(); cg.setAttribute('position',new THREE.Float32BufferAttribute(cab,3)); scene.add(new THREE.LineSegments(cg,new THREE.LineBasicMaterial({color:0x30343a})));
    const cbG=new THREE.BoxGeometry(2.6,2.4,2.6); cbG.translate(0,-3,0); const cbM=new THREE.InstancedMesh(MK.merge([cbG,(function(){ const h=new THREE.CylinderGeometry(0.06,0.06,3,4); h.translate(0,-0.6,0); return h; })()]),new THREE.MeshLambertMaterial({color:0xc0392b}),24); cbM.frustumCulled=false; scene.add(cbM);
    for(let k=0;k<24;k++) L.cabins.push({u:k/24,side:k%2?3:-3}); L.cabM=cbM;
    for(let k=0;k<5;k++){ const a=r()*0.6-0.3; const run=[]; for(let u=0.15;u<0.95;u+=0.02){ const x=b[0]+(t[0]-b[0])*u+Math.sin(u*9+k)*120+(k-2)*90, z=b[1]+(t[1]-b[1])*u+Math.cos(u*7+k)*80; run.push([x,z]); }
      terrainRibbon(run,22,0.4,new THREE.MeshLambertMaterial({color:0xf6f8fb,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})); }
    navObst(b[0]-63,b[0]+7,b[1]-9,b[1]+9,yb+21); }
  /* ---- ancient city: amphitheatre, temple colonnade, broken columns and walls */
  { const cx=-6080, cz=5720, y=terrainH(cx,cz);
    for(let k=0;k<12;k++){ const rr=14+k*2.6, seat=new THREE.Mesh(new THREE.CylinderGeometry(rr+2.6,rr+2.6,0.9,40,1,false,0,Math.PI),stone); seat.position.set(cx,y+k*0.9,cz-30); seat.rotation.y=Math.PI; g.add(seat); }
    apBox(g,stoneD,cx,y,cz-30+4,30,4,3);
    const tx=cx+70, tz=cz; apBox(g,stoneD,tx,y,tz,30,1.4,48);
    for(let i=0;i<6;i++) for(let j=0;j<2;j++){ if(r()<0.25) continue; const hh=r()<0.3?3+r()*4:9; apCyl(g,stone,tx-12+i*4.8,y+1.4,tz+(j?20:-20),0.75,0.85,hh,12); }
    for(let i=0;i<10;i++){ if(r()<0.3) continue; apCyl(g,stone,tx+(i%2?14:-14),y+1.4,tz-18+i*4,0.75,0.85,r()<0.4?2+r()*3:9,12); }
    apBox(g,stone,tx-6,y+10.4,tz-20,16,1.4,2); apBox(g,stone,tx+6,y+10.4,tz+20,10,1.4,2);
    for(let k=0;k<14;k++){ const a=r()*6.28, d=40+r()*70, x=cx+Math.cos(a)*d, z=cz+Math.sin(a)*d; const wl=apBox(g,stoneD,x,terrainH(x,z)-0.3,z,6+r()*10,1+r()*2.5,1.2); wl.rotation.y=r()*3; }
    for(let k=0;k<8;k++){ const x=cx+r()*80-40, z=cz+30+r()*40; const c=apCyl(g,stone,x,terrainH(x,z)+0.8,z,0.8,0.8,4+r()*3,12); c.rotation.z=Math.PI/2; c.rotation.y=r()*3; }
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(9,1.6),new THREE.MeshLambertMaterial({map:signTex('ANTİK KENT — ÖREN YERİ','#7a5a2a','#ffffff',1024,128),side:THREE.DoubleSide})); sg.position.set(cx+20,y+2,cz+60); g.add(sg);
    navObst(cx-50,cx+90,cz-70,cz+30,y+12); }
  /* ---- castle on the islet */
  { const cx=9310, cz=8002, y=9, wl=new THREE.MeshLambertMaterial({color:0xb7ab92});
    [[0,-30,64,3],[0,30,64,3],[-32,0,3,60],[32,0,3,60]].forEach(function(w){ apBox(g,wl,cx+w[0],y,cz+w[1],w[2],10,w[3]);
      const n=Math.floor(Math.max(w[2],w[3])/3.2); for(let k=0;k<n;k++){ if(k%2) continue; const along=w[2]>w[3]; apBox(g,wl,cx+w[0]+(along?-w[2]/2+1.6+k*3.2:0),y+10,cz+w[1]+(along?0:-w[3]/2+1.6+k*3.2),along?1.6:3.2,1.4,along?3.2:1.6); } });
    [[-32,-30],[32,-30],[32,30],[-32,30]].forEach(function(c){ apCyl(g,wl,cx+c[0],y,cz+c[1],5,5.5,15,16); const cn=new THREE.Mesh(new THREE.ConeGeometry(6,7,16),M.roof); cn.position.set(cx+c[0],y+18.5,cz+c[1]); g.add(cn); });
    apBox(g,wl,cx,y,cz,16,22,16); for(let k=0;k<4;k++) apBox(g,wl,cx-6+k*4,y+22,cz-8,2,1.6,0.8);
    apCyl(g,M.white,cx,y+22,cz,0.12,0.15,10,8); const f=new THREE.Mesh(new THREE.PlaneGeometry(4,2.7),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); f.position.set(cx+2,y+30,cz); g.add(f);
    apBox(g,M.door,cx,y,cz+31.6,5,6,0.4); navObst(cx-38,cx+38,cz-36,cz+36,y+32); }
  /* ---- oil platform with a flare */
  { const px=-6500, pz=1500, yel=new THREE.MeshLambertMaterial({color:0xe2b02c}), gr=new THREE.MeshLambertMaterial({color:0x7d858c});
    [[-14,-14],[14,-14],[14,14],[-14,14]].forEach(function(c){ apCyl(g,yel,px+c[0],-50,pz+c[1],1.6,2.2,74,10); });
    for(let y=0;y<20;y+=8) [[-14,-14,14,-14],[14,-14,14,14],[14,14,-14,14],[-14,14,-14,-14]].forEach(function(e){ beam(g,yel,[px+e[0],y,pz+e[1]],[px+e[2],y+8,pz+e[3]],0.3); });
    apBox(g,gr,px,24,pz,40,2,40); apBox(g,M.white,px-8,26,pz-8,18,10,18); apBox(g,M.red,px+10,26,pz+10,14,6,12); apBox(g,gr,px+10,32,pz-10,10,8,10);
    const dk=new THREE.Group(); [[-3,-3],[3,-3],[3,3],[-3,3]].forEach(function(c){ beam(dk,M.white,[px+c[0]-8,36,pz+c[1]+10],[px+c[0]*0.2-8,72,pz+c[1]*0.2+10],0.25); }); g.add(dk);
    const hp=new THREE.Mesh(new THREE.CylinderGeometry(11,11,0.8,24),new THREE.MeshLambertMaterial({color:0x2e7d4a})); hp.position.set(px+20,37,pz-20); g.add(hp); const hr=new THREE.Mesh(new THREE.RingGeometry(7,8,24),M.markY); hr.rotation.x=-Math.PI/2; hr.position.set(px+20,37.45,pz-20); g.add(hr);
    beam(g,gr,[px-20,26,pz+20],[px-46,64,pz+46],0.9); const fl=new THREE.Mesh(new THREE.SphereGeometry(3,10,8),new THREE.MeshBasicMaterial({color:0xffa030})); fl.material.userData.glow=4; fl.position.set(px-47,66,pz+47); scene.add(fl); L.flare=fl;
    navObst(px-25,px+25,pz-25,pz+25,74); navObst(px-50,px-40,pz+40,pz+50,70,true); }
  /* ---- offshore wind farm */
  { const G=windGeos(), pts=[]; for(let i=0;i<4;i++) for(let j=0;j<3;j++) pts.push([-13200+i*520,1300+j*620]);
    const pile=new THREE.CylinderGeometry(3.4,3.4,8,12); pile.translate(0,-2,0); const pm=new THREE.InstancedMesh(MK.merge([pile,G.towerG]),new THREE.MeshLambertMaterial({color:0xf0f2f4}),pts.length), rm=new THREE.InstancedMesh(G.rotorG,new THREE.MeshLambertMaterial({color:0xf6f7f8}),pts.length);
    const yel=new THREE.InstancedMesh(new THREE.CylinderGeometry(3.6,3.6,6,12),new THREE.MeshLambertMaterial({color:0xe2b02c}),pts.length);
    pts.forEach(function(p,i){ mt.compose(p3.set(p[0],0,p[1]),q.setFromAxisAngle(UP,1.2),s3); pm.setMatrixAt(i,mt); mt.compose(p3.set(p[0],1,p[1]),q.set(0,0,0,1),s3); yel.setMatrixAt(i,mt); L.rotorD.push({x:p[0],y:81.6,z:p[1],a:r()*6,w:1+r()*0.4}); navObst(p[0]-24,p[0]+24,p[1]-24,p[1]+24,126,true); });
    [pm,rm,yel].forEach(function(m){ m.instanceMatrix.needsUpdate=true; m.frustumCulled=false; scene.add(m); }); L.rotors=rm; L.yaw=1.2; }
  /* ---- observatory on the north-east summit */
  { const ox=10700, oz=-10500, y=895, wh=new THREE.MeshLambertMaterial({color:0xf2f2ee});
    [[0,0,9],[-24,10,6],[22,12,5]].forEach(function(d,i){ apCyl(g,wh,ox+d[0],y,oz+d[1],d[2],d[2],d[2]*0.9,24); const dm=new THREE.Mesh(new THREE.SphereGeometry(d[2],24,12,0,Math.PI*2,0,Math.PI/2),wh); dm.position.set(ox+d[0],y+d[2]*0.9,oz+d[1]); g.add(dm);
      const sl=new THREE.Mesh(new THREE.BoxGeometry(d[2]*0.35,d[2]*1.02,d[2]*2.02),M.dark); sl.position.set(ox+d[0],y+d[2]*0.9+d[2]*0.5,oz+d[1]); g.add(sl); });
    bldg(g,ox,y,oz+30,30,6,12,{floors:2,wall:'#e8eaec'});
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(14,1.8),new THREE.MeshLambertMaterial({map:signTex('YILDIZTEPE RASATHANESİ','#1d3557','#ffffff',1024,128)})); sg.position.set(ox,y+7,oz+36.1); g.add(sg);
    navObst(ox-32,ox+30,oz-12,oz+40,y+18); }
  bakeInto(g);
  [[-6080,5720,140],[9310,8002,80],[10700,-10500,80],[4300,-5465,120],[6700,-5050,60]].forEach(function(c){ const pts=[]; for(let x=c[0]-c[2];x<=c[0]+c[2];x+=20) for(let z=c[1]-c[2];z<=c[1]+c[2];z+=20) pts.push([x,z]); clearTreesNear(pts,12); });
  L.built=true; landmarksStep(0);
}
const LMK_T={mt:new THREE.Matrix4(), q:new THREE.Quaternion(), qa:new THREE.Quaternion(), s1:new THREE.Vector3(1,1,1), p:new THREE.Vector3(), Z:new THREE.Vector3(0,0,1)};   /* V2.24: temporaries reused every frame */
function landmarksStep(dt){
  const L=LMK; if(!L.built) return; const mt=LMK_T.mt, q=LMK_T.q, qa=LMK_T.qa, s1=LMK_T.s1, p=LMK_T.p, Z=LMK_T.Z;
  if(L.rotors){ L.rotorD.forEach(function(t,i){ t.a+=t.w*dt; q.setFromAxisAngle(UP,L.yaw); qa.setFromAxisAngle(Z,t.a); q.multiply(qa); mt.compose(p.set(t.x-3.6*Math.sin(L.yaw),t.y,t.z-3.6*Math.cos(L.yaw)),q,s1); L.rotors.setMatrixAt(i,mt); }); L.rotors.instanceMatrix.needsUpdate=true; }
  if(L.gondola&&L.cabM){ const G=L.gondola, dx=-(G.t[1]-G.b[1]), dz=(G.t[0]-G.b[0]), dl=Math.hypot(dx,dz), hd=Math.atan2(G.t[0]-G.b[0],G.t[1]-G.b[1]);
    L.cabins.forEach(function(c,i){ c.u=(c.u+dt*0.004*(c.side>0?1:-1)+1)%1; const x=G.b[0]+(G.t[0]-G.b[0])*c.u+dx/dl*c.side, z=G.b[1]+(G.t[1]-G.b[1])*c.u+dz/dl*c.side, y=G.yb+(G.yt-G.yb)*c.u;
      mt.compose(p.set(x,y,z),q.setFromAxisAngle(UP,hd),s1); L.cabM.setMatrixAt(i,mt); }); L.cabM.instanceMatrix.needsUpdate=true; }
  if(L.flare){ const k=1+Math.sin(T*13)*0.15+Math.sin(T*7.3)*0.1; L.flare.scale.set(k,k*1.4,k); }
}
