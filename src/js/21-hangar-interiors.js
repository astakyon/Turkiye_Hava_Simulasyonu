/* ------------------------------------------------------------------ hangar interiors (waiting hall + maintenance hangar) */
const HG={parts:null};
function hgMats(){
  const M=apMats(); if(M.floor) return M;
  const corr=function(rep){ return apTex(64,64,function(x,W,H){ x.fillStyle='#b7c0c7'; x.fillRect(0,0,W,H); for(let i=0;i<8;i++){ const g=x.createLinearGradient(i*8,0,i*8+8,0); g.addColorStop(0,'rgba(0,0,0,0.12)'); g.addColorStop(0.5,'rgba(255,255,255,0.12)'); g.addColorStop(1,'rgba(0,0,0,0.12)'); x.fillStyle=g; x.fillRect(i*8,0,8,H); } },[rep,1]); };
  const flat=function(m){ m.userData.flat=true; return m; };
  Object.assign(M,{
    floor:flat(new THREE.MeshStandardMaterial({color:0x8d9497, roughness:0.45, metalness:0.0, envMap:ENVMAP, envMapIntensity:0.35, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2,
      map:apTex(128,128,function(x,W,H){ x.fillStyle='#d8dcdd'; x.fillRect(0,0,W,H); const r=mulberry32(17); for(let i=0;i<900;i++){ x.fillStyle='rgba(0,0,0,'+(r()*0.05)+')'; x.fillRect(r()*W,r()*H,1+r()*3,1+r()*3); } x.fillStyle='rgba(60,60,60,0.25)'; x.fillRect(0,0,W,1); x.fillRect(0,0,1,H); },[38,10])})),
    corrSide:new THREE.MeshLambertMaterial({map:corr(52)}), corrBack:new THREE.MeshLambertMaterial({map:corr(190)}),
    hazard:flat(new THREE.MeshLambertMaterial({polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,map:apTex(64,16,function(x,W,H){ x.fillStyle='#f0c020'; x.fillRect(0,0,W,H); x.fillStyle='#1b1b1b'; for(let i=-2;i<6;i++){ x.beginPath(); x.moveTo(i*16,H); x.lineTo(i*16+8,H); x.lineTo(i*16+16,0); x.lineTo(i*16+8,0); x.fill(); } },[90,1])})),
    redLine:flat(new THREE.MeshLambertMaterial({color:0xc8261e,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})),
    pool:new THREE.MeshBasicMaterial({map:apTex(64,64,function(x){ const g=x.createRadialGradient(32,32,2,32,32,31); g.addColorStop(0,'rgba(255,250,232,0.55)'); g.addColorStop(1,'rgba(255,250,232,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); }),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5}),
    steel:new THREE.MeshLambertMaterial({color:0x5f6b75}), truss:flat(new THREE.MeshLambertMaterial({color:0x6d7882})), ceil:flat(new THREE.MeshLambertMaterial({color:0x9aa3ab,emissive:0x30353a})), card:new THREE.MeshLambertMaterial({color:0xb08a5a}), blueM:new THREE.MeshLambertMaterial({color:0x2f5d8c}),
    orange:new THREE.MeshLambertMaterial({color:0xf26a1b}), bomb:new THREE.MeshLambertMaterial({color:0x5c6648}), missile:new THREE.MeshLambertMaterial({color:0xe8eaec}), black:new THREE.MeshLambertMaterial({color:0x202326})
  });
  M.floor.userData.indoor=0xd2d7da;
  return M;
}
/* props: front faces -z, origin on the floor */
function prWorkbench(){ const M=hgMats(), g=new THREE.Group(); apBox(g,M.metal,0,0.88,0,2.6,0.07,0.9);
  [[-1.2,-0.38],[1.2,-0.38],[-1.2,0.38],[1.2,0.38]].forEach(function(o){ apBox(g,M.steel,o[0],0,o[1],0.07,0.88,0.07); });
  apBox(g,M.steel,0,0.2,0,2.5,0.04,0.8); apBox(g,M.dark,0,1.0,0.43,2.6,1.3,0.05); apBox(g,M.black,-0.9,0.95,-0.2,0.25,0.18,0.3);
  [[-0.6,1.6],[-0.2,1.3],[0.3,1.7],[0.8,1.4]].forEach(function(t){ apBox(g,M.metal,t[0],t[1],0.39,0.08,0.4,0.03); });
  apBox(g,M.card,0.7,0.95,0.05,0.5,0.3,0.4); return g; }
function prToolChest(){ const M=hgMats(), g=new THREE.Group(); apBox(g,M.red,0,0.12,0,1.4,1.0,0.65);
  for(let i=0;i<5;i++) apBox(g,M.dark,0,0.2+i*0.19,-0.33,1.3,0.025,0.02); apBox(g,M.red,0,1.13,0.04,1.4,0.42,0.55); apBox(g,M.metal,0,1.12,-0.33,1.0,0.03,0.04);
  [[-0.6,-0.25],[0.6,-0.25],[-0.6,0.25],[0.6,0.25]].forEach(function(o){ apBox(g,M.black,o[0],0,o[1],0.1,0.12,0.1); }); return g; }
function prShelf(seed){ const M=hgMats(), g=new THREE.Group(), r=mulberry32(seed||1);
  [[-1.2,-0.3],[1.2,-0.3],[-1.2,0.3],[1.2,0.3]].forEach(function(o){ apBox(g,M.blueM,o[0],0,o[1],0.07,2.3,0.07); });
  [0.25,0.95,1.65].forEach(function(y){ apBox(g,M.metal,0,y,0,2.45,0.04,0.62);
    for(let x=-1.0;x<1.0;){ const w=0.35+r()*0.4, h=0.25+r()*0.35; apBox(g,[M.card,M.olive,M.card,M.bomb][Math.floor(r()*4)],x+w/2,y+0.04,0,w-0.05,h,0.5); x+=w; } });
  return g; }
function prDrums(seed){ const M=hgMats(), g=new THREE.Group(), r=mulberry32(seed||2);
  [[-0.35,-0.3],[0.35,-0.3],[0,0.32]].forEach(function(o){ const m=[M.blueM,M.olive,M.red][Math.floor(r()*3)]; apCyl(g,m,o[0],0,o[1],0.3,0.3,0.9,12); apCyl(g,M.dark,o[0],0.45,o[1],0.31,0.31,0.05,12); });
  return g; }
function prExt(){ const M=hgMats(), g=new THREE.Group(); apCyl(g,M.red,0,0.05,0,0.12,0.12,0.6,10); apBox(g,M.black,0,0.62,0,0.08,0.12,0.08); apBox(g,M.red,0,1.4,0.04,0.35,0.45,0.03); apBox(g,M.white,0,1.45,0.02,0.2,0.12,0.02); return g; }
function prStand(){ const M=hgMats(), g=new THREE.Group();
  [-0.55,0.55].forEach(function(x){ const s=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.08,3.2),M.yel); s.position.set(x,1.1,-0.2); s.rotation.x=-0.62; g.add(s); apBox(g,M.yel,x,0,1.25,0.08,2.3,0.08); apBox(g,M.yel,x,2.3,0.9,0.05,1.0,0.05); });
  for(let i=0;i<5;i++) apBox(g,M.metal,0,0.35+i*0.4,-1.1+i*0.38,1.1,0.05,0.3);
  apBox(g,M.metal,0,2.3,0.9,1.2,0.07,0.9); apBox(g,M.yel,0,3.25,0.9,1.2,0.05,0.05); apBox(g,M.yel,0,3.25,1.35,1.2,0.05,0.05); return g; }
function prCart(kind){ const M=hgMats(), g=new THREE.Group(); apBox(g,M.olive,0,0.32,0,1.2,0.22,2.8); apBox(g,M.olive,0,0.25,-1.9,0.08,0.08,1.2);
  [-1.0,1.0].forEach(function(z){ apWheel(g,M.tire,0.62,z,0.26,0.18); apWheel(g,M.tire,-0.62,z,0.26,0.18); });
  if(kind==='bomb'){ [-0.3,0.3].forEach(function(x){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.23,0.23,1.8,12),M.bomb); b.rotation.x=Math.PI/2; b.position.set(x,0.8,0); g.add(b);
      const n=new THREE.Mesh(new THREE.ConeGeometry(0.23,0.6,12),M.bomb); n.rotation.x=-Math.PI/2; n.position.set(x,0.8,-1.2); g.add(n);
      const bd=new THREE.Mesh(new THREE.CylinderGeometry(0.235,0.235,0.12,12),M.yel); bd.rotation.x=Math.PI/2; bd.position.set(x,0.8,-0.6); g.add(bd);
      apBox(g,M.bomb,x,0.62,1.05,0.04,0.36,0.4); apBox(g,M.bomb,x,0.8,1.05,0.36,0.04,0.4); }); }
  else { [-0.36,0,0.36].forEach(function(x){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,2.8,8),M.missile); b.rotation.x=Math.PI/2; b.position.set(x,0.62,0); g.add(b);
      const n=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.35,8),M.missile); n.rotation.x=-Math.PI/2; n.position.set(x,0.62,-1.57); g.add(n);
      apBox(g,M.missile,x,0.5,1.2,0.02,0.24,0.3); apBox(g,M.red,x,0.62,-0.9,0.19,0.03,0.1); }); }
  return g; }
function prCone(){ const M=hgMats(), g=new THREE.Group(); apBox(g,M.orange,0,0,0,0.4,0.04,0.4); const c=new THREE.Mesh(new THREE.ConeGeometry(0.17,0.7,10),M.orange); c.position.set(0,0.39,0); g.add(c); apCyl(g,M.white,0,0.32,0,0.11,0.13,0.09,10); return g; }
/* indoor look: flat, even light from the ceiling (no sun inside), baked into vertex colours */
const INDOOR=new Map();
function indoorMat(m){ if(INDOOR.has(m)) return INDOOR.get(m);
  const n=new THREE.MeshBasicMaterial({color:m.userData.indoor!=null?m.userData.indoor:(m.color?m.color.getHex():0xffffff), map:m.map||null, vertexColors:true, transparent:m.transparent, opacity:m.opacity, alphaTest:m.alphaTest||0, side:m.side,
    depthWrite:m.depthWrite, polygonOffset:m.polygonOffset, polygonOffsetFactor:m.polygonOffsetFactor, polygonOffsetUnits:m.polygonOffsetUnits});
  n.userData.flat=m.userData.flat; INDOOR.set(m,n); return n; }
function indoorize(grp){
  grp.children.forEach(function(mesh){ const m=mesh.material; if(!mesh.isMesh||m.isMeshBasicMaterial) return;
    const N=mesh.geometry.attributes.normal, C=new Float32Array(N.count*3);
    for(let i=0;i<N.count;i++){ const ny=N.getY(i), nx=N.getX(i), nz=N.getZ(i);
      const f=ny>0.5?0.97:(ny<-0.5?0.74:0.80+0.06*nx+0.04*nz); C[i*3]=C[i*3+1]=C[i*3+2]=f; }
    mesh.geometry.setAttribute('color',new THREE.BufferAttribute(C,3)); mesh.material=indoorMat(m); mesh.userData.rs=false; });
  return grp;
}
function hgAt(p,obj,x,z,rot){ obj.position.set(x,AIRFIELD_Y+0.25,z); obj.rotation.y=rot||0; p.add(obj); wbAdd(obj); return obj; }
function hgSign(p,text,bg,fg,w,h,x,y,z,rot,tw,th){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:signTex(text,bg,fg,tw||1024,th||128)})); m.position.set(x,y,z); m.rotation.y=rot||0; p.add(m); return m; }
/* truss along z (from z0 to z1) at x, bottom chord at yb */
function hgTruss(p,mat,x,z0,z1,yb,h){
  const L=z1-z0, n=Math.max(2,Math.round(L/8)), st=L/n;
  apBox(p,mat,x,yb,(z0+z1)/2,0.35,0.35,L); apBox(p,mat,x,yb+h,(z0+z1)/2,0.4,0.45,L);
  for(let i=0;i<=n;i++) apBox(p,mat,x,yb,z0+i*st,0.22,h,0.22);
  const dl=Math.hypot(st,h), ang=Math.atan2(h,st);
  for(let i=0;i<n;i++){ const d=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.18,dl),mat); d.position.set(x,yb+h/2,z0+(i+0.5)*st); d.rotation.x=(i%2?1:-1)*ang; p.add(d); }
}
function hgLamp(p,pools,x,y,z){ const M=hgMats(); apBox(p,M.dark,x,y,z,1.0,0.28,2.6); apBox(p,M.lamp,x,y-0.03,z,0.8,0.04,2.3); apBox(p,M.steel,x,y+0.28,z,0.04,1.0,0.04);
  if(!pools) return; const g=new THREE.PlaneGeometry(15,15); g.rotateX(-Math.PI/2); const m=new THREE.Mesh(g,M.pool); m.position.set(x,AIRFIELD_Y+0.3,z); pools.add(m); }
function buildHangarHall(){
  const gy=AIRFIELD_Y, M=hgMats(), X0=-466, X1=-100, Z0=856, Z1=958, H=22, cx=(X0+X1)/2, W=X1-X0, D=Z1-Z0;
  const inner=new THREE.Group(), pools=new THREE.Group(); HG.X0=X0; HG.X1=X1;
  apRect(inner,M.floor,X0,X1,Z0,Z1,gy+0.245);
  apRect(inner,M.hazard,X0,X1,Z0+0.4,Z0+1.6,gy+0.27); apRect(inner,M.redLine,X0,X1,945,945.4,gy+0.27); apRect(inner,M.redLine,X0,X1,948.6,949,gy+0.27);
  const top=new THREE.Group();
  for(let x=X0+9.4; x<X1; x+=18.8) hgTruss(top,M.truss,x,Z0+1,Z1,gy+18.8,2.5);
  for(let z=Z0+8; z<Z1; z+=15) apBox(top,M.truss,cx,gy+21.3,z,W,0.3,0.25);
  [878,905,932].forEach(function(z){ for(let x=X0+18.8; x<X1-5; x+=18.8) hgLamp(top,null,x,gy+17.6,z); });
  { const cg=new THREE.PlaneGeometry(W,D); cg.rotateX(Math.PI/2); const cm=new THREE.Mesh(cg,M.ceil); cm.position.set(cx,gy+21.25,(Z0+Z1)/2); top.add(cm); }
  /* back wall: flag and banners */
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(21,14),new THREE.MeshLambertMaterial({map:flagTexture()})); fl.rotation.y=Math.PI; fl.position.set(HANGAR.cx,gy+11,Z1-0.95); inner.add(fl);
  hgSign(inner,'HİLAL KANATLAR','#b3121c','#ffffff',40,5,HANGAR.cx+62,gy+14,Z1-0.95,Math.PI);
  hgSign(inner,'HEDEF KIZIL ELMA','#b3121c','#ffffff',40,5,HANGAR.cx-62,gy+14,Z1-0.95,Math.PI);
  hgSign(inner,'FOD KONTROLÜ · YERDE YABANCI MADDE BIRAKMA','#f0c020','#1b1b1b',24,2,X0+0.15,gy+5,905,Math.PI/2,1024,86);
  hgSign(inner,'SİGARA İÇMEK YASAKTIR','#c8261e','#ffffff',16,2,X1-0.15,gy+5,905,-Math.PI/2,1024,128);
  [[X0+0.02,(Z0+Z1)/2,D,Math.PI/2,M.corrSide],[X1-0.02,(Z0+Z1)/2,D,-Math.PI/2,M.corrSide],[cx,Z1-0.02,W,Math.PI,M.corrBack]].forEach(function(w){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w[2],17.4),w[4]); m.position.set(w[0],gy+8.7,w[1]); m.rotation.y=w[3]; inner.add(m); });
  /* equipment per bay along the back wall, weapon carts behind armed aircraft */
  AC_ORDER.forEach(function(id,i){ const x=HANGAR.cx+(i-(AC_ORDER.length-1)/2)*HANGAR.step;
    hgAt(inner,prWorkbench(),x-7,955.8); hgAt(inner,prToolChest(),x+4.5,956.2);
    if(i%2) hgAt(inner,prShelf(i+3),x+10.5,956.4); else hgAt(inner,prDrums(i+5),x+10.5,955.6);
    hgAt(inner,prExt(),x+17,956.8);
    if((SLOTS[id]||0)>0) hgAt(inner,prCart(i%2?'bomb':'missile'),x-9,938,Math.PI/2+0.1);
    if(i%3===1) hgAt(inner,vehGPU(),x+9,932,Math.PI);
    hgAt(inner,prCone(),x-12,884); hgAt(inner,prCone(),x+12,884);
  });
  hgAt(inner,vehTug(),X0+8,925,-Math.PI/2); hgAt(inner,prStand(),X1-6,938,Math.PI/2); hgAt(inner,prStand(),X1-6,926,Math.PI/2);
  indoorize(bakeGroup(inner)).children.slice().forEach(function(m){ scene.add(m); }); inner.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); });
  const pb=bakeGroup(pools); pb.children.forEach(function(m){ m.userData.rs=false; m.userData.cs=false; m.renderOrder=1; }); scene.add(pb);
  /* shell: separate parts so the menu camera can see through the side it is outside of */
  function part(build){ const g=new THREE.Group(); build(g); const b=bakeGroup(g); g.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); }); scene.add(b); return b; }
  HG.parts={
    top:indoorize(part(function(g){ g.add(top); })),
    roof:part(function(g){ apBox(g,M.roof,cx,gy+H-0.6,(Z0+Z1+2)/2,W+4,0.8,D+4); apBox(g,M.red,cx,gy+H+0.2,Z0-1.5,W+4,0.6,0.6); }),
    west:part(function(g){ apBox(g,M.corrSide,X0-1,gy,(Z0+Z1+2)/2,2,H,D+2); apBox(g,M.glass,X0-1,gy+H-4.2,(Z0+Z1)/2,2.2,2,D-8); }),
    east:part(function(g){ apBox(g,M.corrSide,X1+1,gy,(Z0+Z1+2)/2,2,H,D+2); apBox(g,M.glass,X1+1,gy+H-4.2,(Z0+Z1)/2,2.2,2,D-8); }),
    back:part(function(g){ apBox(g,M.corrBack,cx,gy,Z1+1,W+4,H,2); apBox(g,M.glass,cx,gy+H-4.2,Z1+1,W-6,2,2.2); }),
    header:part(function(g){ apBox(g,M.conc,cx,gy+H-4.4,Z0-0.8,W+4,4.4,1.6); apBox(g,M.red,cx,gy+H-4.6,Z0-1.65,W+4,0.5,0.1);
      hgSign(g,'HANGAR 1 · HİLAL KANATLAR','#10161f','#ffffff',56,3.2,cx,gy+H-2.2,Z0-1.65,Math.PI);
      [X0-1,X1+1].forEach(function(x){ apBox(g,M.concD,x,gy,Z0-0.8,2.6,H-4.4,1.8); }); })
  };
  ['top','roof','west','east','back','header'].forEach(function(k){ HG.parts[k].children.forEach(function(m){ m.userData.cs=false; }); });   /* inside is lit evenly; the sun never shows through */
  /* solid walls on the ground, whole building in the air */
  apObst(X0-2,X0,Z0,Z1+2,H); apObst(X1,X1+2,Z0,Z1+2,H); apObst(X0-2,X1+2,Z1,Z1+2,H); apObst(X0-2,X1+2,Z0-2,Z1+2,H,true);
}
let BLOBTEX=null;
function blobMesh(){ if(!BLOBTEX) BLOBTEX=apTex(64,64,function(x){ const g=x.createRadialGradient(32,32,4,32,32,31); g.addColorStop(0,'rgba(0,0,0,0.55)'); g.addColorStop(0.6,'rgba(0,0,0,0.3)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); });
  const g=new THREE.PlaneGeometry(1,1); g.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:BLOBTEX,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6})); m.renderOrder=2; m.userData.rs=false; m.userData.cs=false; return m; }
function inHall(x,z){ return HG.X0!=null&&x>HG.X0&&x<HG.X1&&z>856&&z<958; }
function inService(x,z){ return x>-199&&x<-99&&Math.abs(z-SERVICE.zc)<SERVICE.hw; }
let pBlob=null;
function blobStep(){
  if(!pBlob){ pBlob=blobMesh(); scene.add(pBlob); }
  const on=state!=='menu'&&!S.crashed&&S.onGround&&planeGroup.visible&&(inHall(S.pos.x,S.pos.z)||inService(S.pos.x,S.pos.z)||!renderer.shadowMap.enabled);
  pBlob.visible=on; if(!on) return;
  const e=model.ext||[7,10], t=model.tip||[e[0]]; fwdOf(S.q,vF);
  pBlob.position.set(S.pos.x,AIRFIELD_Y+0.32,S.pos.z); pBlob.rotation.y=Math.atan2(-vF.x,-vF.z); pBlob.scale.set(Math.max(t[0],e[0])*1.5,1,e[1]*1.9);
}
function hangarCull(){
  if(!HG.parts) return; const c=camera.position, P=HG.parts, gy=AIRFIELD_Y;
  const near=state==='menu'&&Math.abs(c.x+278)<520&&Math.abs(c.z-907)<420&&c.y<gy+400;
  P.roof.visible=!(near&&c.y>gy+21); P.top.visible=P.roof.visible; P.west.visible=!(near&&c.x<HG.X0-1); P.east.visible=!(near&&c.x>HG.X1+1);
  P.back.visible=!(near&&c.z>959); P.header.visible=!(near&&c.z<855&&c.y>gy+16);
}
function buildServiceInterior(){
  const gy=AIRFIELD_Y, M=hgMats(), g=new THREE.Group(), pools=new THREE.Group(), zc=SERVICE.zc, hw=SERVICE.hw;
  apRect(g,M.floor,-199,-99,zc-hw,zc+hw,gy+0.24);
  apRect(g,M.hazard,-100.6,-99.4,zc-hw,zc+hw,gy+0.27);
  const top=new THREE.Group();
  for(let x=-190; x<-100; x+=13) hgTruss(top,M.truss,x,zc-hw,zc+hw,gy+13.2,2.4);
  [zc-12,zc+12].forEach(function(z){ for(let x=-183; x<-102; x+=13) hgLamp(top,null,x,gy+12.4,z); });
  { const cg=new THREE.PlaneGeometry(100,2*hw); cg.rotateX(Math.PI/2); const cm=new THREE.Mesh(cg,M.ceil); cm.position.set(-149,gy+15.95,zc); top.add(cm); }
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(12,8),new THREE.MeshLambertMaterial({map:flagTexture()})); fl.rotation.y=Math.PI/2; fl.position.set(-198.85,gy+8.5,zc); g.add(fl);
  hgSign(g,'BAKIM · ONARIM · SİLAH YÜKLEME','#10161f','#ffffff',24,2,-198.85,gy+4,zc,Math.PI/2,1024,96);
  hgSign(g,'DİKKAT · SİLAH YÜKLEME ALANI','#f0c020','#1b1b1b',16,1.8,-160,gy+5,zc-hw+0.12,0,1024,112);
  hgSign(g,'HİLAL KANATLAR · TEKNİK BAKIM','#b3121c','#ffffff',18,2,-150,gy+6,zc+hw-0.12,Math.PI,1024,112);
  [[-198.98,zc,2*hw,Math.PI/2],[-149,zc-hw+0.02,100,0],[-149,zc+hw-0.02,100,Math.PI]].forEach(function(w){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w[2],15.9),M.conc); m.position.set(w[0],gy+7.95,w[1]); m.rotation.y=w[3]; g.add(m); });
  /* back wall */
  hgAt(g,prWorkbench(),-198.2,zc-18,-Math.PI/2); hgAt(g,prToolChest(),-198.4,zc-13,-Math.PI/2); hgAt(g,prShelf(7),-198.4,zc+14,-Math.PI/2); hgAt(g,prToolChest(),-198.4,zc+18.5,-Math.PI/2);
  hgAt(g,prDrums(9),-197.5,zc-23,0); hgAt(g,prExt(),-198.6,zc-8,-Math.PI/2); hgAt(g,prExt(),-198.6,zc+8,-Math.PI/2);
  /* side walls: weapon carts, stands, ground power */
  hgAt(g,prCart('bomb'),-178,zc-hw+3.2,Math.PI/2); hgAt(g,prCart('missile'),-166,zc-hw+3.2,Math.PI/2); hgAt(g,prCart('bomb'),-154,zc-hw+3.2,Math.PI/2);
  hgAt(g,prStand(),-138,zc-hw+3,Math.PI); hgAt(g,prWorkbench(),-122,zc-hw+0.6,Math.PI); hgAt(g,prExt(),-112,zc-hw+0.4,Math.PI);
  hgAt(g,prCart('missile'),-178,zc+hw-3.2,Math.PI/2); hgAt(g,vehGPU(),-164,zc+hw-3,0); hgAt(g,prStand(),-148,zc+hw-3,0);
  hgAt(g,prShelf(11),-132,zc+hw-0.5,0); hgAt(g,prToolChest(),-124,zc+hw-0.5,0); hgAt(g,prDrums(13),-116,zc+hw-1.2,0); hgAt(g,prExt(),-108,zc+hw-0.4,0);
  [-1,1].forEach(function(s){ hgAt(g,prCone(),-104,zc+s*14); });
  indoorize(bakeGroup(g)).children.slice().forEach(function(m){ scene.add(m); }); g.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); });
  indoorize(bakeGroup(top)).children.slice().forEach(function(m){ m.userData.cs=false; scene.add(m); }); top.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); });
  const pb=bakeGroup(pools); pb.children.forEach(function(m){ m.userData.rs=false; m.userData.cs=false; m.renderOrder=1; }); scene.add(pb);
}

function buildHangar(){
  const gy=AIRFIELD_Y;
  const ag=new THREE.PlaneGeometry(420,110); ag.rotateX(-Math.PI/2);
  const apron=new THREE.Mesh(ag,new THREE.MeshLambertMaterial({color:0x686c72})); apron.position.set(HANGAR.cx,gy+0.22,HANGAR.z+2); scene.add(apron);
  buildHangarHall();
  const lineMat=new THREE.MeshBasicMaterial({color:0xe8c547,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  const lg=new THREE.PlaneGeometry(0.6,18); lg.rotateX(-Math.PI/2); const cg=new THREE.PlaneGeometry(10,0.6); cg.rotateX(-Math.PI/2);
  AC_ORDER.forEach(function(id,i){
    const def=AIRCRAFT[id], x=HANGAR.cx+(i-(AC_ORDER.length-1)/2)*HANGAR.step;
    const l1=new THREE.Mesh(lg,lineMat); l1.position.set(x,gy+0.27,HANGAR.z-18); scene.add(l1);
    const l2=new THREE.Mesh(cg,lineMat); l2.position.set(x,gy+0.27,HANGAR.z-27); scene.add(l2);
    const model=buildModel(id), g=model.group;
    g.position.set(x,gy+def.gearOff,HANGAR.z); g.userData.id=id; scene.add(g);
    const label=makeLabel(def.short); label.position.set(x,gy+def.gearOff+def.cam[0]*1.1+1.5,HANGAR.z); scene.add(label);
    const bb=new THREE.Box3().setFromObject(g); displays[id]={model:model,g:g,label:label,x:x,ox:(bb.min.x+bb.max.x)/2-x,oz:(bb.min.z+bb.max.z)/2-HANGAR.z,len:bb.max.z-bb.min.z};
    const bl=blobMesh(); bl.scale.set((bb.max.x-bb.min.x)*0.75,1,(bb.max.z-bb.min.z)*0.95); bl.position.set((bb.min.x+bb.max.x)/2-x,0.32-def.gearOff,(bb.min.z+bb.max.z)/2-HANGAR.z); bl.userData.keep=true; g.add(bl);
  });
}
function updateHangar(dt){
  hangarCull();
  AC_ORDER.forEach(function(id){
    const d=displays[id], sel=(id===selectedId), hide=(state!=='menu'&&state!=='walk'&&!(state==='paused'&&WALK.from==='walk')&&id===activeId)||(state==='menu'&&menuMode!=='title'&&sel&&id===activeId);
    d.g.visible=!hide; d.label.visible=!hide&&state==='menu'&&menuMode==='hangar'&&sel;
    if(hide) return;
    const m=d.model;
    m.strobe.visible=Math.sin(T*9+d.x)>0.8; m.gear.visible=true;
    m.flames.forEach(function(f){ f.outer.scale.set(1,1,0.05); f.inner.scale.set(1,1,0.05); });
    m.spinners.forEach(function(sp){ sp.obj.rotation.z+=dt*(sel&&state==='menu'&&menuMode!=='title'?2.5:0.4); sp.disc.material.opacity=0.04; });
  });
}

