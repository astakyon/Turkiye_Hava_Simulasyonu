/* ------------------------------------------------------------------ KAAN model */
const planarUV=(x,z)=>[(x+8)/16, 1-(z+12)/24];
function loft(stations, seg, upperOnly){
  const v=[], uv=[], idx=[];
  stations.forEach(s=>{ for(let j=0;j<seg;j++){
    const a=j/seg*Math.PI*2, cx=Math.cos(a), sy=Math.sin(a), hh=sy>0?s.ht:s.hb;
    const px=cx*s.hw, py=s.yc+sy*hh; v.push(px,py,s.z); const t=planarUV(px,s.z); uv.push(t[0],t[1]);
  } });
  const jmax=upperOnly?seg/2:seg;
  for(let i=0;i<stations.length-1;i++) for(let j=0;j<jmax;j++){
    const a=i*seg+j, b=i*seg+(j+1)%seg, c=(i+1)*seg+j, d=(i+1)*seg+(j+1)%seg; idx.push(a,b,c, b,d,c);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
function shapeOf(pts){ // pts: [x, z]
  const s=new THREE.Shape(); s.moveTo(pts[0][0],-pts[0][1]); for(let i=1;i<pts.length;i++) s.lineTo(pts[i][0],-pts[i][1]); s.closePath(); return s;
}
function flatPart(pts, thick){
  const g=new THREE.ExtrudeGeometry(shapeOf(pts),{depth:thick,bevelEnabled:false}); g.rotateX(-Math.PI/2); return g;
}
function topOverlay(pts){
  const g=new THREE.ShapeGeometry(shapeOf(pts)); g.rotateX(-Math.PI/2);
  const p=g.attributes.position, uv=[]; for(let i=0;i<p.count;i++){ const t=planarUV(p.getX(i),p.getZ(i)); uv.push(t[0],t[1]); }
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2)); return g;
}
function flagTexture(){
  const c=document.createElement('canvas'); c.width=256; c.height=170; const x=c.getContext('2d');
  x.fillStyle='#e30a17'; x.fillRect(0,0,256,170);
  x.fillStyle='#fff'; x.beginPath(); x.arc(98,85,42,0,Math.PI*2); x.fill();
  x.fillStyle='#e30a17'; x.beginPath(); x.arc(110,85,34,0,Math.PI*2); x.fill();
  x.fillStyle='#fff'; x.beginPath();
  for(let i=0;i<10;i++){ const r=i%2?8:21, a=-Math.PI/2+i*Math.PI/5+0.3; const px=150+Math.cos(a)*r, py=85+Math.sin(a)*r; if(i===0) x.moveTo(px,py); else x.lineTo(px,py); }
  x.closePath(); x.fill();
  return new THREE.CanvasTexture(c);
}
// Top-view paint: the fading column of dark dashes over the spine and inner wings, plus KAAN lettering (64 px per metre)
function paintTexture(){
  const W=1024, H=1536, PX=64, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  const X=m=>(m+8)*PX, Z=m=>(m+12)*PX, r=mulberry32(21);
  x.fillStyle='rgba(66,82,99,0.9)';
  for(let z=-4.6; z<8.6; z+=0.34){
    const t=(z+4.6)/13.2, hw=0.45+Math.pow(t,0.8)*5.2;
    for(let xm=-hw; xm<=hw; xm+=0.3){
      if(z<-2.8 && Math.abs(xm)<0.95) continue;
      const f=1-Math.abs(xm)/hw;
      if(r() > Math.pow(f,0.7)*(1-0.55*smooth(0.7,1,t))+0.04) continue;
      const len=0.18+r()*0.34, jx=(r()-.5)*0.12, jz=(r()-.5)*0.2;
      x.fillRect(X(xm+jx)-3, Z(z+jz), 6, len*PX);
    }
  }
  x.fillStyle='rgba(58,74,92,0.95)'; x.font='bold 40px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle';
  [1,-1].forEach(s=>{ x.save(); x.translate(X(s*1.12),Z(-2.0)); x.rotate(s>0?Math.PI/2:-Math.PI/2); x.fillText('KAAN',0,0); x.restore(); });
  const t=new THREE.CanvasTexture(c); t.anisotropy=8; return t;
}

function buildKaan(){
  const g=new THREE.Group();
  const hull=new THREE.MeshPhongMaterial({color:0xaebccb, specular:0x4a5866, shininess:28, side:THREE.DoubleSide});
  const wing=new THREE.MeshPhongMaterial({color:0xa6b5c4, specular:0x3d4a58, shininess:22});
  const dark=new THREE.MeshPhongMaterial({color:0x12161b, specular:0x222222, shininess:20, side:THREE.DoubleSide});
  const radMat=new THREE.MeshPhongMaterial({color:0xeef2f6, specular:0x667788, shininess:50, side:THREE.DoubleSide});
  const dashMat=new THREE.MeshPhongMaterial({map:paintTexture(), transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2, shininess:15, specular:0x222222, side:THREE.DoubleSide});

  // long, pointed forebody blending into a wide, flat body
  const stations=[
    {z:-10.9,hw:.03,ht:.03,hb:.03,yc:0},{z:-9.6,hw:.30,ht:.24,hb:.20,yc:0},{z:-8.9,hw:.52,ht:.36,hb:.30,yc:0},
    {z:-8,hw:.78,ht:.52,hb:.42,yc:0},{z:-6,hw:1.2,ht:.8,hb:.6,yc:.05},{z:-3,hw:1.6,ht:1.0,hb:.7,yc:.1},
    {z:0,hw:1.9,ht:.95,hb:.75,yc:.05},{z:4,hw:1.95,ht:.8,hb:.7,yc:0},{z:8,hw:1.7,ht:.7,hb:.6,yc:0},{z:10.4,hw:1.45,ht:.6,hb:.55,yc:0}
  ];
  g.add(new THREE.Mesh(loft(stations,22,false),hull));
  g.add(new THREE.Mesh(loft(stations,22,true),dashMat));
  const rad=stations.slice(0,3).map(s=>({z:s.z,hw:s.hw*1.05+0.01,ht:s.ht*1.05+0.01,hb:s.hb*1.05+0.01,yc:s.yc}));
  g.add(new THREE.Mesh(loft(rad,22,false),radMat)); // white radome

  // wings, LERX and large swept stabilizers
  const parts=[
    {pts:[[1.6,-3.2],[7.0,1.6],[7.0,3.8],[1.6,7.4]], th:0.2,  y:-0.12, paint:true},
    {pts:[[1.0,-6.8],[1.9,-3.6],[1.7,-3.0],[1.0,-1.0]], th:0.12, y:-0.06, paint:true},
    {pts:[[1.5,6.4],[4.8,8.6],[4.8,10.1],[1.5,10.2]], th:0.12, y:-0.06, paint:false}
  ];
  parts.forEach(pt=>{
    const geo=flatPart(pt.pts,pt.th), ov=pt.paint?topOverlay(pt.pts):null;
    [1,-1].forEach(s=>{
      const m=new THREE.Mesh(geo,wing); m.position.y=pt.y; m.scale.x=s; g.add(m);
      if(ov){ const o=new THREE.Mesh(ov,dashMat); o.position.y=pt.y+pt.th+0.006; o.scale.x=s; g.add(o); }
    });
  });

  // canopy + big side inlets
  const canopy=new THREE.Mesh(new THREE.SphereGeometry(1,24,16), new THREE.MeshPhongMaterial({color:0x1b2733, specular:0xffffff, shininess:150, transparent:true, opacity:0.92}));
  canopy.scale.set(0.7,0.5,2.4); canopy.position.set(0,0.88,-5.4); g.add(canopy);
  [-1,1].forEach(s=>{ const inl=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.85,2.6),dark); inl.position.set(s*1.3,-0.4,-2.6); inl.rotation.z=-s*0.2; g.add(inl); });

  // tall twin canted fins with flag
  const finShape=new THREE.Shape(); finShape.moveTo(0,0); finShape.lineTo(4.6,0); finShape.lineTo(4.2,3.4); finShape.lineTo(2.3,3.4); finShape.closePath();
  const finGeo=new THREE.ExtrudeGeometry(finShape,{depth:0.1,bevelEnabled:false}); finGeo.rotateY(-Math.PI/2);
  const flagMat=new THREE.MeshBasicMaterial({map:flagTexture(), side:THREE.DoubleSide});
  const decalGeo=new THREE.PlaneGeometry(1.6,1.07);
  [-1,1].forEach(s=>{
    const holder=new THREE.Group(); holder.position.set(s*1.25,0.3,5.6); if(s<0) holder.scale.x=-1;
    const fin=new THREE.Mesh(finGeo,wing); fin.rotation.z=-0.42; holder.add(fin);
    const dec=new THREE.Mesh(decalGeo,flagMat); dec.rotation.y=Math.PI/2; dec.position.set(0.012,1.5,2.7); fin.add(dec);
    g.add(holder);
  });

  // weapon-bay doors on the belly + pitot boom
  [-1,1].forEach(s=>{ const bay=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.04,4.6),dark); bay.position.set(s*0.62,-0.67,-0.2); g.add(bay); });
  const pg=new THREE.CylinderGeometry(0.02,0.035,1.5,8); pg.rotateX(Math.PI/2); const pit=new THREE.Mesh(pg,dark); pit.position.set(0,0,-11.6); g.add(pit);
  // nozzles + afterburner flames
  const nozGeo=new THREE.CylinderGeometry(0.62,0.5,1.5,16,1,true); nozGeo.rotateX(Math.PI/2);
  const flameGeoO=new THREE.ConeGeometry(0.55,1,14,1,true); flameGeoO.translate(0,0.5,0); flameGeoO.rotateX(Math.PI/2);
  const flameGeoI=new THREE.ConeGeometry(0.32,1,12,1,true); flameGeoI.translate(0,0.5,0); flameGeoI.rotateX(Math.PI/2);
  const fMatO=new THREE.MeshBasicMaterial({color:0xff8a2a, transparent:true, opacity:0.72, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  const fMatI=new THREE.MeshBasicMaterial({color:0xcfeaff, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  const flames=[];
  [-1,1].forEach(s=>{
    const n=new THREE.Mesh(nozGeo,dark); n.position.set(s*0.78,0.05,10.3); g.add(n);
    const fo=new THREE.Mesh(flameGeoO,fMatO); fo.position.set(s*0.78,0.05,10.95); g.add(fo);
    const fi=new THREE.Mesh(flameGeoI,fMatI); fi.position.set(s*0.78,0.05,10.95); g.add(fi);
    flames.push({outer:fo,inner:fi,base:[s*0.78,0.05,10.95],ds:makeDiamonds(g,1)});
  });

  // nav lights
  const lampGeo=new THREE.SphereGeometry(0.14,8,8);
  const redL=new THREE.Mesh(lampGeo,new THREE.MeshBasicMaterial({color:0xff2222})); redL.position.set(-7.0,0.05,2.7); g.add(redL);
  const grnL=new THREE.Mesh(lampGeo,new THREE.MeshBasicMaterial({color:0x22ff66})); grnL.position.set(7.0,0.05,2.7); g.add(grnL);
  const strobe=new THREE.Mesh(lampGeo,new THREE.MeshBasicMaterial({color:0xffffff})); strobe.position.set(0,0.8,9.6); strobe.scale.setScalar(1.6); g.add(strobe);

  // landing gear (yellow struts)
  const gear=new THREE.Group();
  const strutMat=new THREE.MeshPhongMaterial({color:0xd6b02a}), wheelMat=new THREE.MeshPhongMaterial({color:0x1f2227});
  const strutGeo=new THREE.CylinderGeometry(0.07,0.07,1.6,8), wheelGeo=new THREE.CylinderGeometry(0.4,0.4,0.28,14); wheelGeo.rotateZ(Math.PI/2);
  function leg(x,y,z,len,rad){
    const st=new THREE.Mesh(strutGeo,strutMat); st.scale.y=len/1.6; st.position.set(x,y-len/2,z); gear.add(st);
    const w=new THREE.Mesh(wheelGeo,wheelMat); w.scale.set(1,rad/0.4,rad/0.4); w.position.set(x,y-len,z); gear.add(w);
  }
  leg(0,-0.55,-6.0,1.55,0.3); leg(-1.5,-0.7,2.2,1.3,0.4); leg(1.5,-0.7,2.2,1.3,0.4);
  g.add(gear);

  return {group:g, flames, strobe, gear};
}
