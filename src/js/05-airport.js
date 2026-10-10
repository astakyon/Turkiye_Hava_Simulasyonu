/* ------------------------------------------------------------------ airport (runway, lights, PAPI, tower, shelters, radar, fire station, fuel farm, vehicles) */
const AP={obst:[], movers:[], papi:[], radar:null, socks:[], flag:null, rabbit:null, pmats:[], road:null, roadLen:0};
function apTex(w,h,draw,rep){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c);
  try{ t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); }catch(e){} if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; }
function signTex(text,bg,fg,w,h,font){ return apTex(w||1024,h||128,function(x,W,H){ x.fillStyle=bg; x.fillRect(0,0,W,H); x.fillStyle=fg; let fs=Math.round(H*0.62); x.font=font||('bold '+fs+'px Arial, sans-serif'); if(!font){ while(fs>8&&x.measureText(text).width>W*0.93){ fs-=2; x.font='bold '+fs+'px Arial, sans-serif'; } } x.textAlign='center'; x.textBaseline='middle'; x.fillText(text,W/2,H*0.54); }); }
/* merge every mesh of a group into one mesh per material (few draw calls on phones) */
function bakeGroup(grp){
  grp.updateMatrixWorld(true); const by=new Map();
  grp.traverse(function(o){ if(!o.isMesh) return; const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
    if(!by.has(o.material)) by.set(o.material,[]); by.get(o.material).push(g); });
  const out=new THREE.Group();
  by.forEach(function(list,mat){
    let n=0; list.forEach(function(g){ n+=g.attributes.position.count; });
    const P=new Float32Array(n*3), N=new Float32Array(n*3), U=new Float32Array(n*2); let o3=0, o2=0;
    list.forEach(function(g){ const c=g.attributes.position.count; P.set(g.attributes.position.array,o3); if(g.attributes.normal) N.set(g.attributes.normal.array,o3); if(g.attributes.uv) U.set(g.attributes.uv.array,o2); o3+=c*3; o2+=c*2; g.dispose(); });
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(P,3)); bg.setAttribute('normal',new THREE.BufferAttribute(N,3)); bg.setAttribute('uv',new THREE.BufferAttribute(U,2)); bg.computeBoundingSphere();
    const m=new THREE.Mesh(bg,mat); m.userData.rs=!mat.transparent&&!mat.isMeshBasicMaterial; m.userData.cs=m.userData.rs&&!mat.userData.flat; out.add(m);
  });
  return out;
}
function apBox(p,mat,x,y0,z,w,h,d,ry){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y0+h/2,z); if(ry) m.rotation.y=ry; p.add(m); return m; }
function apCyl(p,mat,x,y0,z,rt,rb,h,seg,open){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||12,1,!!open),mat); m.position.set(x,y0+h/2,z); p.add(m); return m; }
function apFlat(p,mat,cx,cz,w,l,y,ang){ const g=new THREE.PlaneGeometry(w,l); g.rotateX(-Math.PI/2); const m=new THREE.Mesh(g,mat); m.position.set(cx,y,cz); if(ang) m.rotation.y=ang; p.add(m); return m; }
function apRect(p,mat,x0,x1,z0,z1,y){ return apFlat(p,mat,(x0+x1)/2,(z0+z1)/2,Math.abs(x1-x0),Math.abs(z1-z0),y); }
function apObst(x0,x1,z0,z1,top,airOnly){ AP.obst.push({x0:x0,x1:x1,z0:z0,z1:z1,y1:AIRFIELD_Y+top,air:!!airOnly}); }
function apWheel(p,mat,x,z,r,w){ const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,10),mat); m.rotation.z=Math.PI/2; m.position.set(x,r,z); p.add(m); }
const APM={};
function apMats(){
  if(APM.conc) return APM;
  const L=function(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})); };
  const flat=function(m){ m.userData.flat=true; return m; };
  Object.assign(APM,{conc:L(0xc9ccd0), concD:L(0x9aa0a6), sand:L(0xb4ab95), roof:L(0x6c737a), dark:L(0x2d333b), red:L(0xc0221c), white:L(0xeef0f2),
    metal:L(0x8b9298), olive:L(0x5b6340), yel:L(0xe2b02c), tire:L(0x1d2024), door:L(0x5d646c), tank:L(0xe6e8e2), green:L(0x4c6b45), fdoor:L(0xa3241d),
    glass:new THREE.MeshStandardMaterial({color:0x2b4a66, roughness:0.12, metalness:0.6, envMap:ENVMAP, envMapIntensity:1.25}),
    win:new THREE.MeshStandardMaterial({color:0x1b2733, roughness:0.15, metalness:0.5, envMap:ENVMAP, envMapIntensity:1.1}),
    blue:new THREE.MeshBasicMaterial({color:0x3a7bff}), amber:new THREE.MeshBasicMaterial({color:0xffaa22}), lamp:new THREE.MeshBasicMaterial({color:0xfff6dc}), redL:new THREE.MeshBasicMaterial({color:0xff2a1a}),
    mark:flat(L(0xe9ecef,{polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})),
    markY:flat(L(0xe2b02c,{polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})),
    shoulder:flat(L(0x6b6f72)), blast:flat(L(0x46494e,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})),
    taxi:flat(L(0x4b4f56,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})), road:flat(L(0x55595e,{side:THREE.DoubleSide})),
    pad:flat(L(0x8f9398))});
  ['blue','amber','redL'].forEach(function(k){ APM[k].userData.glow=4; }); APM.lamp.userData.glow=2.2;
  return APM;
}
/* vehicles: forward is -z, origin on the ground at the vehicle centre */
function vehTruck(kind){
  const M=apMats(), g=new THREE.Group(), body=kind==='fire'?M.red:(kind==='fuel'?M.olive:M.olive);
  apBox(g,M.dark,0,0.5,0,2.3,0.5,9.4);
  apBox(g,body,0,0.9,-3.4,2.5,2.4,2.4);                              // cab
  apBox(g,M.win,0,2.0,-4.62,2.2,1.0,0.06);                           // windscreen
  apBox(g,M.win,1.26,2.0,-3.4,0.04,0.9,1.8); apBox(g,M.win,-1.26,2.0,-3.4,0.04,0.9,1.8);
  if(kind==='fire'){
    apBox(g,body,0,0.9,1.25,2.55,2.6,6.6); apBox(g,M.white,0,1.9,1.25,2.6,0.25,6.62);
    apBox(g,M.blue,0,3.3,-3.4,1.6,0.22,0.35); apCyl(g,M.metal,0,3.5,-0.6,0.25,0.35,0.5,8); apBox(g,M.metal,0,3.95,-1.1,0.22,0.22,1.2);
    apBox(g,M.metal,1.3,1.2,1.4,0.05,1.6,5.4); apBox(g,M.metal,-1.3,1.2,1.4,0.05,1.6,5.4);
  } else {
    const t=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,6.2,14),kind==='fuel'?M.tank:M.olive); t.rotation.x=Math.PI/2; t.position.set(0,2.15,1.3); g.add(t);
    apBox(g,M.amber,0,3.3,-3.4,1.2,0.18,0.3); if(kind==='fuel'){ apBox(g,M.green,0,1.9,1.3,2.34,0.35,6.0); }
  }
  [-3.4,1.0,3.2].forEach(function(z){ apWheel(g,M.tire,1.15,z,0.55,0.45); apWheel(g,M.tire,-1.15,z,0.55,0.45); });
  return g;
}
function vehCar(kind){
  const M=apMats(), g=new THREE.Group(), col=kind==='follow'?M.yel:M.olive, pick=kind==='pickup';
  apBox(g,M.dark,0,0.28,0,1.92,0.22,4.7);                                   // chassis / sills
  apBox(g,col,0,0.42,0.05,1.9,0.62,4.55);                                   // lower body
  { const hood=new THREE.Mesh(new THREE.BoxGeometry(1.86,0.22,1.25),col); hood.position.set(0,1.08,-1.62); hood.rotation.x=0.1; g.add(hood); }
  const cz=pick?-0.55:0.25, cl=pick?1.7:2.3;
  { const cab=new THREE.Mesh(new THREE.CylinderGeometry(0.66,0.9,0.72,4,1),col); cab.rotation.y=Math.PI/4; cab.scale.set(1.36,1,cl/1.25); cab.position.set(0,1.38,cz); g.add(cab);
    const gl=new THREE.Mesh(new THREE.CylinderGeometry(0.665,0.875,0.5,4,1),M.win); gl.rotation.y=Math.PI/4; gl.scale.set(1.37,1,cl/1.25+0.02); gl.position.set(0,1.36,cz); g.add(gl); }
  if(pick){ apBox(g,M.dark,0,1.04,1.25,1.78,0.05,2.1); [-0.92,0.92].forEach(function(x){ apBox(g,col,x,1.04,1.25,0.07,0.38,2.1); }); apBox(g,col,0,1.04,2.28,1.86,0.38,0.07); }
  apBox(g,M.dark,0,0.3,-2.42,1.96,0.3,0.18); apBox(g,M.dark,0,0.3,2.42,1.96,0.3,0.18);   // bumpers
  apBox(g,M.dark,0,0.66,-2.35,1.1,0.26,0.05);                                         // grille
  [-0.72,0.72].forEach(function(x){ apBox(g,M.lamp,x,0.68,-2.34,0.36,0.18,0.04); apBox(g,M.redL,x,0.72,2.34,0.3,0.16,0.04); apBox(g,M.dark,x*1.4,1.2,-0.6,0.18,0.14,0.08); });
  [-0.96,0.96].forEach(function(x){ apBox(g,M.dark,x,0.5,-1.55,0.05,0.5,1.1); apBox(g,M.dark,x,0.5,1.55,0.05,0.5,1.1); });   // wheel arches
  if(kind==='follow'){ const s=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.42,0.1),new THREE.MeshLambertMaterial({map:signTex('BENİ İZLE','#111','#ffd21a',256,64)})); s.position.set(0,2.05,cz); g.add(s);
    apBox(g,M.amber,-0.55,1.76,cz,0.36,0.16,0.3); apBox(g,M.amber,0.55,1.76,cz,0.36,0.16,0.3); apBox(g,M.dark,0,1.74,cz,1.5,0.06,0.34);
    for(let i=0;i<6;i++) apBox(g,i%2?M.white:M.dark,-0.85+i*0.34,0.6,0.05,0.34,0.16,4.4); }
  [-1.5,1.5].forEach(function(z){ apWheel(g,M.tire,0.9,z,0.38,0.3); apWheel(g,M.tire,-0.9,z,0.38,0.3); apWheel(g,M.metal,0.92,z,0.2,0.32); apWheel(g,M.metal,-0.92,z,0.2,0.32); });
  return g;
}
function vehTug(){ const M=apMats(), g=new THREE.Group(); apBox(g,M.yel,0,0.3,0,2.2,0.9,4.2); apBox(g,M.dark,0,1.2,1.0,1.4,1.3,1.3); apBox(g,M.win,0,1.7,0.33,1.3,0.7,0.05);
  [-1.3,1.3].forEach(function(z){ apWheel(g,M.tire,1.0,z,0.45,0.4); apWheel(g,M.tire,-1.0,z,0.45,0.4); }); return g; }
function vehGPU(){ const M=apMats(), g=new THREE.Group(); apBox(g,M.yel,0,0.45,0,1.6,1.4,2.8); apBox(g,M.dark,0,1.85,0,1.4,0.1,2.4); apBox(g,M.dark,0,0.3,-1.9,0.12,0.12,1.2);
  [-0.9,0.9].forEach(function(z){ apWheel(g,M.tire,0.85,z,0.32,0.25); apWheel(g,M.tire,-0.85,z,0.32,0.25); }); return g; }
function vehBus(){ const M=apMats(), g=new THREE.Group(); apBox(g,M.olive,0,0.45,0,2.5,2.7,10); apBox(g,M.win,0,1.9,0,2.54,0.9,8.6); apBox(g,M.win,0,1.5,-5.02,2.2,1.3,0.06);
  [-3.4,3.2].forEach(function(z){ apWheel(g,M.tire,1.1,z,0.5,0.4); apWheel(g,M.tire,-1.1,z,0.5,0.4); }); return g; }
function apPlace(p,veh,x,z,head){ veh.position.set(x,AIRFIELD_Y+0.2,z); veh.rotation.y=head; p.add(veh); wbAdd(veh); return veh; }
function dotTexture(){ return apTex(32,32,function(x){ const g=x.createRadialGradient(16,16,1,16,16,15); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.55,'rgba(255,255,255,1)'); g.addColorStop(0.8,'rgba(255,255,255,0.55)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,32,32); }); }
function apPoints(list,size){ // list of [x,y,z,r,g,b]
  const P=new Float32Array(list.length*3), C=new Float32Array(list.length*3);
  list.forEach(function(l,i){ P.set([l[0],l[1],l[2]],i*3); C.set([l[3],l[4],l[5]],i*3); });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3));
  const m=new THREE.PointsMaterial({size:size, sizeAttenuation:false, vertexColors:true, map:AP.dot, transparent:true, alphaTest:0.04, depthWrite:false});
  m.userData.base=size; m.userData.glow=4; AP.pmats.push(m); const pts=new THREE.Points(g,m); pts.frustumCulled=false; scene.add(pts); return pts;
}
function buildAirport(){
  const gy=AIRFIELD_Y, M=apMats(), st=new THREE.Group(); AP.dot=dotTexture();
  /* ---- runway surface: tiled asphalt with slab joints, light shoulders, blast pads */
  const asphalt=apTex(256,256,function(x,W,H){ x.fillStyle='#3c3f44'; x.fillRect(0,0,W,H); const r=mulberry32(5);
    for(let i=0;i<2600;i++){ const v=r()<0.5?255:0; x.fillStyle='rgba('+v+','+v+','+v+','+(0.03+r()*0.05)+')'; x.fillRect(r()*W,r()*H,1+r()*2.5,1+r()*2.5); }
    x.fillStyle='rgba(0,0,0,0.18)'; x.fillRect(0,0,W,1); x.fillRect(0,0,1,H); x.fillRect(W/2,0,1,H); },[2,72]);
  const rwMat=new THREE.MeshLambertMaterial({map:asphalt,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); rwMat.userData.flat=true;
  const rw=apRect(scene,rwMat,-35,35,-1250,1250,gy+0.25); rw.userData.rs=true; rw.userData.cs=false;
  apRect(st,M.shoulder,-43,-35,-1250,1250,gy+0.23); apRect(st,M.shoulder,35,43,-1250,1250,gy+0.23);
  [-1,1].forEach(function(s){ apRect(st,M.blast,-35,35,s*1250,s*1312,gy+0.245);
    for(let k=0;k<3;k++){ const zc=s*(1268+k*16); [-1,1].forEach(function(sx){ apFlat(st,M.markY,sx*15,zc,1.6,33,gy+0.27,sx*s*1.05); }); } });
  /* ---- markings (one merged white mesh): edges, centreline, piano keys, numbers, touchdown and aiming point bars */
  const my=gy+0.29;
  [-1,1].forEach(function(s){ apRect(st,M.mark,s*33.6,s*32.5,-1250,1250,my); });
  for(let z=-1125; z<1125; z+=50) apRect(st,M.mark,-0.45,0.45,z,z+30,my);
  [-1,1].forEach(function(s){ // s=+1 south end (runway 36), -1 north end (runway 18)
    const E=s*1250;
    for(let i=0;i<8;i++) [-1,1].forEach(function(sx){ const xc=sx*(2.7+i*3.6); apRect(st,M.mark,xc-0.9,xc+0.9,E-s*6,E-s*36,my); });
    [[150,3],[300,2],[550,2],[700,1],[850,1]].forEach(function(t){ for(let b=0;b<t[1];b++) [-1,1].forEach(function(sx){ const x0=sx*(9+b*4.5); apRect(st,M.mark,x0,x0+sx*3,E-s*t[0],E-s*(t[0]+22.5),my); }); });
    [-1,1].forEach(function(sx){ apRect(st,M.mark,sx*10,sx*20,E-s*400,E-s*445,my); });
  });
  const numTex=apTex(512,256,function(x,W,H){ x.clearRect(0,0,W,H); x.fillStyle='#eef0f2'; x.font='bold 230px Arial Narrow, Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('36',W*0.25,H*0.53); x.fillText('18',W*0.75,H*0.53); });
  const numMat=new THREE.MeshLambertMaterial({map:numTex,transparent:true,alphaTest:0.3,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}); numMat.userData.flat=true;
  [[1,0],[-1,1]].forEach(function(e){ const s=e[0], g=new THREE.PlaneGeometry(22,24); g.rotateX(-Math.PI/2); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setX(i,(e[1]+uv.getX(i))*0.5);
    const m=new THREE.Mesh(g,numMat); m.position.set(0,my,s*(1250-62)); if(s<0) m.rotation.y=Math.PI; st.add(m); });
  /* rubber deposits in the touchdown zones */
  const rub=apTex(128,512,function(x,W,H){ x.clearRect(0,0,W,H); const r=mulberry32(9);
    for(let i=0;i<260;i++){ const cx=W/2+(r()-.5)*W*0.8*Math.pow(r(),0.6)*(r()<0.5?-1:1), y=r()*H, l=40+r()*160, a=0.05+r()*0.12*(1-Math.abs(cx-W/2)/(W/2));
      const fade=Math.sin(Math.PI*Math.min(1,Math.max(0,(y+l/2)/H))); x.fillStyle='rgba(12,12,14,'+(a*fade)+')'; x.fillRect(cx,y,1.5+r()*3,l); } });
  const rubMat=new THREE.MeshLambertMaterial({map:rub,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}); rubMat.userData.flat=true;
  [-1,1].forEach(function(s){ const m=apFlat(scene,rubMat,0,s*(1250-420),26,560,gy+0.27); m.userData.rs=false; m.userData.cs=false; });
  /* ---- taxiway connectors + holding position markings */
  apRect(st,M.taxi,-60,-35,548,572,gy+0.24);                       // apron -> runway (mid-field)
  apRect(st,M.taxi,-162,-138,768,832,gy+0.235);                    // apron -> taxiway A
  apRect(st,M.markY,-75,-35,559.8,560.2,gy+0.27); apRect(st,M.markY,-150.2,-149.8,770,828,gy+0.27);
  function hold(axis,c,a0,a1){ // two solid + two dashed lines across the taxiway
    [1.2,1.8].forEach(function(o){ if(axis==='x') apRect(st,M.markY,c-o-0.3,c-o,a0,a1,gy+0.28); else apRect(st,M.markY,a0,a1,c-o-0.3,c-o,gy+0.28); });
    [0,0.6].forEach(function(o){ for(let d=a0; d<a1-0.5; d+=2){ if(axis==='x') apRect(st,M.markY,c-o-0.3,c-o,d,d+1,gy+0.28); else apRect(st,M.markY,d,d+1,c-o-0.3,c-o,gy+0.28); } });
  }
  hold('x',-48.2,548,572); hold('z',1148.2,-72,-48);
  /* ---- apron (concrete slabs) with lead-in lines to the shelters */
  const slab=apTex(128,128,function(x,W,H){ x.fillStyle='#80848a'; x.fillRect(0,0,W,H); const r=mulberry32(3); for(let i=0;i<700;i++){ x.fillStyle='rgba(0,0,0,'+(r()*0.06)+')'; x.fillRect(r()*W,r()*H,2,2); } x.fillStyle='rgba(40,40,44,0.28)'; x.fillRect(0,0,W,2); x.fillRect(0,0,2,H); },[26,42]);
  const apronMat=new THREE.MeshLambertMaterial({map:slab}); apronMat.userData.flat=true; apRect(st,apronMat,-320,-60,350,770,gy+0.2);
  [430,520,610].forEach(function(z){ apRect(st,M.markY,-234,-75,z-0.2,z+0.2,gy+0.26); apRect(st,M.markY,-232,-231,z-5,z+5,gy+0.26); });
  apRect(st,M.markY,-75.2,-74.8,380,740,gy+0.26);
  /* ---- hardened aircraft shelters */
  [430,520,610].forEach(function(z){
    const sh=new THREE.CylinderGeometry(12.6,12.6,40,18,1,true,0,Math.PI); sh.rotateZ(Math.PI/2); const m=new THREE.Mesh(sh,M.sand); m.position.set(-255,gy,z); st.add(m);
    const bk=new THREE.CircleGeometry(12.6,18,0,Math.PI); bk.rotateY(-Math.PI/2); const b=new THREE.Mesh(bk,M.sand); b.position.set(-275,gy,z); st.add(b);
    const dr=new THREE.CircleGeometry(12.2,18,0,Math.PI); dr.rotateY(Math.PI/2); const d=new THREE.Mesh(dr,M.door); d.position.set(-235.6,gy,z); st.add(d);
    apBox(st,M.dark,-235.5,gy,z,0.12,11.8,0.25); apBox(st,M.concD,-234.6,gy,z,1.8,0.5,27);
    [-1,1].forEach(function(s){ apBox(st,M.concD,-235,gy,z+s*13.6,2.4,6,1.8); });
    apObst(-276,-233,z-14.5,z+14.5,12.8);
  });
  /* ---- control tower */
  apBox(st,M.conc,-150,gy,300,30,8,22); apBox(st,M.glass,-150,gy+2.6,300,30.2,1.7,22.2); apBox(st,M.roof,-150,gy+8,300,31,0.6,23);
  apCyl(st,M.conc,-128,gy,300,3.6,4.3,30,8); apBox(st,M.glass,-128,gy+4,300,1.2,20,8.8);
  apCyl(st,M.concD,-128,gy+29.3,300,7.4,6.2,1.0,8); apCyl(st,M.glass,-128,gy+30.3,300,7.9,6.5,5.2,8); apCyl(st,M.roof,-128,gy+35.5,300,8.5,8.3,1.1,8);
  apCyl(st,M.metal,-128,gy+36.6,300,0.12,0.12,6,6); apCyl(st,M.metal,-125,gy+36.6,302,0.08,0.08,3.5,6); apBox(st,M.redL,-128,gy+42.5,300,0.5,0.5,0.5);
  const twSign=new THREE.Mesh(new THREE.PlaneGeometry(26,2.6),new THREE.MeshLambertMaterial({map:signTex('AY YILDIZ HAVA ÜSSÜ','#f1f2f3','#c0101a')})); twSign.rotation.y=Math.PI/2; twSign.position.set(-134.95,gy+10,300); st.add(twSign);
  apBox(st,M.conc,-135.3,gy+8.4,300,0.5,3,27);
  apObst(-134,-122,292,308,43); apObst(-166,-134,288,312,11);
  /* ---- operations building + flag */
  apBox(st,M.conc,-210,gy,255,104,10,40); apBox(st,M.glass,-210,gy+2.0,255,104.3,2.1,40.3); apBox(st,M.glass,-210,gy+6.2,255,104.3,2.1,40.3); apBox(st,M.roof,-210,gy+10,255,105,0.6,41);
  [[-240,248],[-200,262],[-170,245]].forEach(function(p){ apBox(st,M.metal,p[0],gy+10.6,p[1],6,2.4,4); });
  apBox(st,M.concD,-190,gy+4.2,279,16,0.6,8); [-1,1].forEach(function(s){ apCyl(st,M.metal,-190+s*7,gy,282.5,0.2,0.2,4.2,8); });
  const opSign=new THREE.Mesh(new THREE.PlaneGeometry(30,2.4),new THREE.MeshLambertMaterial({map:signTex('HİLAL KANATLAR · HAREKÂT MERKEZİ','#10161f','#ffffff')})); opSign.position.set(-210,gy+8.6,275.4); st.add(opSign);
  apObst(-263,-157,234,276,12);
  apCyl(st,M.white,-182,gy,300,0.14,0.2,16,8);
  { const fg=new THREE.PlaneGeometry(6,4,12,3); fg.translate(3,0,0); const fm=new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide}); const fl=new THREE.Mesh(fg,fm);
    fl.position.set(-182,gy+14,300); scene.add(fl); fl.userData.rs=true; fl.userData.cs=true; AP.flag={m:fl,base:Float32Array.from(fg.attributes.position.array)}; }
  /* ---- fire station */
  apBox(st,M.conc,121,gy,-60,20,10,48); apBox(st,M.red,121,gy+7.1,-60,20.2,0.9,48.2); apBox(st,M.roof,121,gy+10,-60,20.6,0.5,48.6);
  [-76,-60,-44].forEach(function(z){ const d=new THREE.Mesh(new THREE.PlaneGeometry(12,6.4),M.fdoor); d.rotation.y=-Math.PI/2; d.position.set(110.95,gy+3.2,z); st.add(d);
    for(let r=1;r<6;r++) apBox(st,M.dark,110.9,gy+r*1.07,z,0.05,0.06,12); });
  const fsSign=new THREE.Mesh(new THREE.PlaneGeometry(14,1.6),new THREE.MeshLambertMaterial({map:signTex('İTFAİYE','#ffffff','#c0101a',512,64)})); fsSign.rotation.y=-Math.PI/2; fsSign.position.set(110.9,gy+9.0,-60); st.add(fsSign);
  apBox(st,M.conc,128,gy,-92,5,18,5); apBox(st,M.red,128,gy+16,-92,5.2,1.2,5.2);
  apRect(st,M.pad,43,111,-86,-34,gy+0.21);
  apPlace(st,vehTruck('fire'),97,-76,Math.PI/2); apPlace(st,vehTruck('fire'),97,-60,Math.PI/2);
  apObst(110,132,-85,-35,11); apObst(125,131,-95,-89,18);
  /* ---- radar site */
  apRect(st,M.pad,165,250,155,245,gy+0.21);
  apBox(st,M.olive,178,gy,232,10,4,8); apBox(st,M.white,178,gy+4,232,10.4,0.3,8.4);
  [[-2,-2],[2,-2],[-2,2],[2,2]].forEach(function(o){ apCyl(st,M.metal,196+o[0],gy,214+o[1],0.22,0.32,18,6); });
  for(let h=4;h<18;h+=4.5){ apBox(st,M.metal,196,gy+h,212,4.2,0.18,0.18); apBox(st,M.metal,196,gy+h,216,4.2,0.18,0.18); apBox(st,M.metal,194,gy+h,214,0.18,0.18,4.2); apBox(st,M.metal,198,gy+h,214,0.18,0.18,4.2); }
  apBox(st,M.concD,196,gy+18,214,6,0.5,6);
  { const ant=new THREE.Group(); apCyl(ant,M.metal,0,0,0,0.6,0.9,1.4,10);
    const rf=new THREE.Mesh(new THREE.BoxGeometry(13,3.2,0.35),M.white); rf.position.set(0,2.6,0.4); rf.rotation.x=-0.28; ant.add(rf);
    apBox(ant,M.metal,0,1.3,-1.2,0.35,0.35,2.6); apBox(ant,M.dark,0,1.6,-2.5,0.8,0.8,0.5);
    const a=bakeGroup(ant); a.position.set(196,gy+18.5,214); scene.add(a); AP.radar=a; }
  apCyl(st,M.conc,232,gy,170,4.5,4.8,10,12); const dome=new THREE.Mesh(new THREE.SphereGeometry(6.6,20,14),M.white); dome.position.set(232,gy+14.6,170); st.add(dome);
  apObst(189,203,207,221,24); apObst(225,239,163,177,21.5); apObst(173,183,228,236,5);
  /* ---- fuel farm */
  [[-450,-370,569,571],[-450,-370,669,671],[-451,-449,569,671],[-371,-369,569,671]].forEach(function(w){ apBox(st,M.concD,(w[0]+w[1])/2,gy,(w[2]+w[3])/2,w[1]-w[0],1.4,w[3]-w[2]); });
  [[-428,596],[-428,644],[-392,620]].forEach(function(t){ apCyl(st,M.tank,t[0],gy,t[1],9,9,11,20); apCyl(st,M.green,t[0],gy+7.4,t[1],9.06,9.06,1.4,20);
    const c=new THREE.Mesh(new THREE.ConeGeometry(9.1,1.6,20),M.tank); c.position.set(t[0],gy+11.8,t[1]); st.add(c); apObst(t[0]-9.5,t[0]+9.5,t[1]-9.5,t[1]+9.5,12.8); });
  { const pp=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,52,8),M.metal); pp.rotation.z=Math.PI/2; pp.position.set(-345,gy+0.9,622); st.add(pp); }
  const fuSign=new THREE.Mesh(new THREE.PlaneGeometry(9,1.4),new THREE.MeshLambertMaterial({map:signTex('AKARYAKIT','#1d3b22','#ffffff',512,80)})); fuSign.rotation.y=Math.PI/2; fuSign.position.set(-367,gy+2.6,600); st.add(fuSign);
  [-1,1].forEach(function(s){ apCyl(st,M.metal,-367.2,gy,600+s*4,0.08,0.08,2,6); });
  /* ---- apron flood-light masts */
  [[-110,360],[-110,762],[-300,360],[-300,762]].forEach(function(p){ apCyl(st,M.metal,p[0],gy,p[1],0.3,0.5,24,8); apBox(st,M.dark,p[0],gy+23.4,p[1],3.4,1.2,1.0); apBox(st,M.lamp,p[0],gy+23.5,p[1]+(p[1]<500?0.52:-0.52),3.0,0.8,0.05); apObst(p[0]-1.5,p[0]+1.5,p[1]-1.5,p[1]+1.5,25); });
  /* ---- parked ground vehicles */
  apPlace(st,vehTruck('fuel'),-172,470,0.35); apPlace(st,vehTug(),-224,432,-Math.PI/2); apPlace(st,vehGPU(),-226,606,-Math.PI/2); apPlace(st,vehTug(),-226,520,-Math.PI/2+0.3);
  apPlace(st,vehBus(),-226,300,Math.PI/2); apPlace(st,vehCar('pickup'),-160,322,Math.PI/2); apPlace(st,vehTruck('fuel'),-358,640,0);
  /* ---- distance-remaining boards (thousands of feet) */
  const dist=apTex(512,64,function(x,W,H){ x.fillStyle='#111316'; x.fillRect(0,0,W,H); x.fillStyle='#fff'; x.font='bold 50px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; for(let n=1;n<=8;n++) x.fillText(String(n),(n-0.5)*64,35); });
  const distMat=new THREE.MeshLambertMaterial({map:dist});
  for(let n=1;n<=7;n++) [1,-1].forEach(function(s){ const z=s>0?-1250+n*304.8:1250-n*304.8, x=s*44.5;
    apBox(st,M.dark,x,gy+0.5,z,2.4,1.6,0.3); [-0.9,0.9].forEach(function(o){ apBox(st,M.metal,x+o,gy,z,0.12,0.5,0.12); });
    const g=new THREE.PlaneGeometry(2.2,1.4); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setX(i,(n-1+uv.getX(i))/8);
    const m=new THREE.Mesh(g,distMat); if(s<0) m.rotation.y=Math.PI; m.position.set(x,gy+1.3,z+s*0.16); st.add(m); });
  /* ---- PAPI housings */
  [[-1,800,1],[1,-800,-1]].forEach(function(p){ const units=[];
    for(let i=0;i<4;i++){ const x=p[0]*(50+i*7); apBox(st,M.dark,x,gy+0.2,p[1],1.5,0.8,0.9); apBox(st,M.yel,x,gy,p[1],1.2,0.2,0.6); units.push({x:x,z:p[1]}); }
    AP.papi.push({units:units,dir:p[2],pts:null}); });
  /* ---- windsocks */
  const sockTex=apTex(8,64,function(x,W,H){ for(let i=0;i<5;i++){ x.fillStyle=i%2?'#f4f4f4':'#e8401f'; x.fillRect(0,i*H/5,W,H/5+1); } });
  [[52,1080],[-52,-1080]].forEach(function(p){ apCyl(st,M.metal,p[0],gy,p[1],0.08,0.14,7,8);
    const sg=new THREE.CylinderGeometry(0.22,0.58,3.6,12,1,true); sg.translate(0,1.8,0); sg.rotateZ(-Math.PI/2);
    const s=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({map:sockTex,side:THREE.DoubleSide})); s.position.set(p[0],gy+6.9,p[1]); s.userData.rs=true; s.userData.cs=true; scene.add(s); AP.socks.push(s); });
  /* ---- perimeter road + service roads, with two vehicles driving around */
  const rr=[], x0=-540, x1=260, z0=-1640, z1=1640, R=80;
  function arc(cx,cz,a0,a1){ for(let k=0;k<=10;k++){ const a=a0+(a1-a0)*k/10; rr.push([cx+R*Math.cos(a),cz+R*Math.sin(a)]); } }
  rr.push([x0+R,z0]); arc(x1-R,z0+R,-Math.PI/2,0); arc(x1-R,z1-R,0,Math.PI/2); arc(x0+R,z1-R,Math.PI/2,Math.PI); arc(x0+R,z0+R,Math.PI,Math.PI*1.5);
  const cum=[0]; for(let i=1;i<rr.length;i++) cum.push(cum[i-1]+Math.hypot(rr[i][0]-rr[i-1][0],rr[i][1]-rr[i-1][1]));
  const tot=cum[cum.length-1], road=[]; let j=0;
  for(let d=0; d<tot; d+=4){ while(j<rr.length-2&&cum[j+1]<d) j++; const u=(d-cum[j])/((cum[j+1]-cum[j])||1); road.push(new THREE.Vector3(rr[j][0]+(rr[j+1][0]-rr[j][0])*u,0,rr[j][1]+(rr[j+1][1]-rr[j][1])*u)); }
  AP.road=road; AP.roadLen=road.length*4;
  const rmesh=ribbon(road.concat([road[0]]),0,9,gy+0.21,M.road); rmesh.userData.rs=true; rmesh.userData.cs=false;
  const rl=ribbon(road.concat([road[0]]),0,0.25,gy+0.24,new THREE.MeshBasicMaterial({color:0xd8d8d0,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})); rl.userData.rs=false; rl.userData.cs=false;
  [[[60,-29],[260,-29]],[[250,200],[260,200]],[[-535,222],[-262,222]],[[-210,222],[-210,235]]].forEach(function(s){ const m=ribbon([new THREE.Vector3(s[0][0],0,s[0][1]),new THREE.Vector3(s[1][0],0,s[1][1])],0,8,gy+0.205,M.road); m.userData.rs=true; m.userData.cs=false; });
  [[vehCar('follow'),0,11,1],[vehCar('pickup'),AP.roadLen*0.45,13,-1],[vehTruck('fuel'),AP.roadLen*0.72,9,1]].forEach(function(v){ const g=bakeGroup(v[0]); scene.add(g); AP.movers.push({g:g,s:v[1],v:v[2],dir:v[3]}); });
  /* ---- lights (screen-sized points so they read from far away) */
  const L=[], W=[1,1,0.92], G=[0.25,1,0.45], Y=[1,0.78,0.25];
  for(let z=-1240; z<=1240; z+=60) [-1,1].forEach(function(s){ L.push([s*37.6,gy+0.6,z].concat(W)); });
  [-1,1].forEach(function(s){ for(let x=-33; x<=33; x+=3) L.push([x,gy+0.5,s*1253].concat(G));
    [-1,1].forEach(function(sx){ for(let x=38; x<=50; x+=3) L.push([sx*x,gy+0.5,s*1253].concat(G)); });
    for(let k=1;k<=12;k++){ for(let x=-4;x<=4;x+=2) L.push([x,gy+1.0,s*(1250+k*30)].concat(W)); }
    for(let x=-15;x<=15;x+=3) if(Math.abs(x)>4) L.push([x,gy+1.0,s*(1250+300)].concat(W));
  });
  apPoints(L,6.5);
  AP.papi.forEach(function(p){ p.pts=apPoints(p.units.map(function(u){ return [u.x,gy+0.62,u.z+p.dir*0.5,1,1,1]; }),10); });
  AP.rabbit=apPoints([[0,gy+1.2,1280,1,1,1],[0,gy+1.2,-1280,1,1,1]],12);
  /* obstacles for the waiting hangar (air only above its roof) and the maintenance hangar */
  apObst(-203,-99,1032,1088,17.6,true);
  const baked=bakeGroup(st); baked.children.slice().forEach(function(m){ scene.add(m); }); st.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); });
}
const PAPI_SET=[3.5,3.17,2.83,2.5];
function airportStep(dt){
  if(!AP.road) return;
  const gy=AIRFIELD_Y, pr=renderer.getPixelRatio();
  AP.pmats.forEach(function(m){ m.size=m.userData.base*pr; });
  const road=AP.road, n=road.length;
  AP.movers.forEach(function(m){
    m.s=((m.s+m.v*m.dir*dt)%AP.roadLen+AP.roadLen)%AP.roadLen; const f=m.s/4, i=Math.floor(f)%n, a=road[i], b=road[(i+1)%n], u=f-Math.floor(f);
    let dx=(b.x-a.x)*m.dir, dz=(b.z-a.z)*m.dir; const l=Math.hypot(dx,dz)||1; dx/=l; dz/=l;
    m.g.position.set(a.x+(b.x-a.x)*u-dz*2.2, gy+0.21, a.z+(b.z-a.z)*u+dx*2.2); const h=Math.atan2(-dx,-dz);
    let dh=h-m.g.rotation.y; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); m.g.rotation.y+=dh*Math.min(1,dt*4);
  });
  if(AP.radar) AP.radar.rotation.y+=dt*1.5;
  blobStep();
  AP.socks.forEach(function(s,i){ s.rotation.y=0.22*Math.sin(T*0.5+i*2)+0.08*Math.sin(T*1.9+i); s.rotation.z=-0.1+0.05*Math.sin(T*2.3+i); });
  if(AP.rabbit){ const k=12-Math.floor((T*24)%12), p=AP.rabbit.geometry.attributes.position; p.setZ(0,1250+k*30); p.setZ(1,-(1250+k*30)); p.needsUpdate=true; }
  if(AP.flag&&camera.position.distanceToSquared(AP.flag.m.position)<1440000){
    const g=AP.flag.m.geometry, p=g.attributes.position, B=AP.flag.base;
    for(let i=0;i<p.count;i++){ const x=B[i*3]; p.setZ(i,Math.sin(x*1.15-T*5.5)*0.38*(x/6)+Math.sin(x*0.6-T*3.1)*0.12*(x/6)); }
    p.needsUpdate=true; g.computeVertexNormals();
  }
  const eye=(state==='play'||state==='paused'||state==='service')?S.pos:camera.position;
  AP.papi.forEach(function(P){ const c=P.pts.geometry.attributes.color;
    for(let i=0;i<4;i++){ const u=P.units[i], d=(eye.z-u.z)*P.dir;
      if(d<40||d>12000){ c.setXYZ(i,0.3,0.3,0.3); continue; }
      const ang=Math.atan2(eye.y-gy-0.6,Math.hypot(d,eye.x-u.x))*57.2958;
      if(ang>PAPI_SET[i]) c.setXYZ(i,1,1,1); else c.setXYZ(i,1,0.12,0.1); }
    c.needsUpdate=true; });
}
/* buildings are solid: in the air they end the flight, on the ground they stop the aircraft */
function obstacleStep(){
  if(S.crashed||!AP.obst.length) return;
  const p=S.pos; if(p.y>AIRFIELD_Y+60||Math.abs(p.x)>700||Math.abs(p.z)>1300) return;
  for(let k=0;k<AP.obst.length;k++){ const b=AP.obst[k]; if(p.y>b.y1+1) continue;
    if(S.onGround){ if(b.air) continue; if(pushOut([b])) S.speed*=0.5;
    } else if(p.x>b.x0-2&&p.x<b.x1+2&&p.z>b.z0-2&&p.z<b.z1+2){ crash('Binaya çarptın'); return; }
  }
}

