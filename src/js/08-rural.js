/* ------------------------------------------------------------------ countryside: wind farm on the eastern ridge, solar farm, greenhouses,
   olive grove, a small lake with an earth dam, and village life (tea garden, school, tractor, sheep, chimney smoke). */
const RURAL={rotors:null, rotorD:[], tractor:null, tractorT:0, sheep:null, sheepD:[], smoke:null, smokeD:[], built:false,
  ges:{x:500,z:-3900}, gh:{x:-760,z:-2620}, olive:{x:-950,z:-3330}, lake:{x:1700,z:-3750,level:90.5}, school:{x:-80,z:-2900},
  clear:[[260,740,-4020,-3780],[-900,-620,-2720,-2520],[-1100,-800,-3440,-3220],[1430,1970,-4020,-3480],[-170,10,-2960,-2820]]};
function ruralClear(x,z,m){ m=m||0; return RURAL.clear.some(function(c){ return x>c[0]-m&&x<c[1]+m&&z>c[2]-m&&z<c[3]+m; }); }
function buildRural(){
  const M=apMats(), R=RURAL, r=mulberry32(4401), g=new THREE.Group(), mt=new THREE.Matrix4(), q=new THREE.Quaternion(), s3=new THREE.Vector3(), p3=new THREE.Vector3();
  /* ---- wind farm: turbines along the crest of the eastern ridge */
  const tw=[]; for(let z=-2300;z<=100;z+=220){ let bx=3300, bh=-1; for(let x=3250;x<=4100;x+=20){ const h=terrainH(x,z); if(h>bh&&h<560){ bh=h; bx=x; } } if(bh>120) tw.push([bx,bh-1,z]); }
  const towerG=MK.merge([(function(){ const c=new THREE.CylinderGeometry(2.0,3.4,80,14); c.translate(0,40,0); return c; })(),(function(){ const b=new THREE.BoxGeometry(3,3.2,9); b.translate(0,81.6,1.8); return b; })(),(function(){ const b=new THREE.CylinderGeometry(4,4,1,16); b.translate(0,0.5,0); return b; })()]);
  const towers=new THREE.InstancedMesh(towerG,new THREE.MeshLambertMaterial({color:0xf0f2f4}),tw.length);
  const blade=function(a){ const b=new THREE.BoxGeometry(0.6,44,3.2), p=b.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i); p.setZ(i,p.getZ(i)*(1-0.75*(y+22)/44)); } b.translate(0,23,0); b.rotateZ(a); return b; };
  const hub=new THREE.SphereGeometry(1.6,12,8); hub.scale(1,1,1.5);
  const rotorG=MK.merge([blade(0),blade(2.094),blade(4.189),hub]); rotorG.computeVertexNormals();
  const rotors=new THREE.InstancedMesh(rotorG,new THREE.MeshLambertMaterial({color:0xf6f7f8}),tw.length); rotors.frustumCulled=false; towers.frustumCulled=false;
  const yawFace=Math.atan2(-(-1),-(0.4));   // rotors face roughly west-south-west, towards the prevailing wind
  tw.forEach(function(t,i){ mt.compose(p3.set(t[0],t[1],t[2]),q.setFromAxisAngle(UP,yawFace),s3.set(1,1,1)); towers.setMatrixAt(i,mt);
    R.rotorD.push({x:t[0],y:t[1]+81.6,z:t[2],a:r()*6.28,w:1.1+r()*0.4}); navObst(t[0]-24,t[0]+24,t[2]-24,t[2]+24,t[1]+126,true); });
  towers.instanceMatrix.needsUpdate=true; scene.add(towers); scene.add(rotors); R.rotors=rotors; R.yaw=yawFace;
  /* ---- solar farm (GES) */
  { const c=R.ges, rows=[], panelG=new THREE.BoxGeometry(18,0.12,3.6); const pm=new THREE.MeshLambertMaterial({color:0x1d3557}), fm=new THREE.MeshLambertMaterial({color:0x9aa3aa});
    for(let i=0;i<20;i++) for(let j=0;j<12;j++){ const x=c.x-210+j*36, z=c.z-95+i*9.5, y=terrainH(x,z)+1.3; rows.push([x,y,z]); }
    const pi=new THREE.InstancedMesh(panelG,pm,rows.length), legs=new THREE.InstancedMesh(new THREE.BoxGeometry(17,1.2,0.2),fm,rows.length);
    rows.forEach(function(p,i){ mt.compose(p3.set(p[0],p[1],p[2]),q.setFromEuler(new THREE.Euler(-0.5,0,0)),s3.set(1,1,1)); pi.setMatrixAt(i,mt); mt.compose(p3.set(p[0],p[1]-0.7,p[2]+0.6),q.set(0,0,0,1),s3.set(1,1,1)); legs.setMatrixAt(i,mt); });
    pi.instanceMatrix.needsUpdate=true; legs.instanceMatrix.needsUpdate=true; scene.add(pi); scene.add(legs);
    [[c.x-230,c.z-115],[c.x+230,c.z-115],[c.x+230,c.z+110],[c.x-230,c.z+110],[c.x-230,c.z-115]].reduce(function(a,b){ fenceSeg(a,b); return b; });
    for(let k=0;k<3;k++){ const x=c.x-200+k*200, z=c.z+108; apBox(g,M.white,x,terrainH(x,z),z,4,2.6,2.4); }
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(10,1.8),new THREE.MeshLambertMaterial({map:signTex('GÜNEŞ ENERJİSİ SANTRALİ','#1d3557','#ffffff',1024,128)})); sg.position.set(c.x,terrainH(c.x,c.z+125)+2.2,c.z+125); g.add(sg);
    navObst(c.x-230,c.x+230,c.z-115,c.z+110,terrainH(c.x,c.z)+4,true); }
  function fenceSeg(a,b){ fenceLine([a,b],function(){ return false; }); }
  /* ---- greenhouses (polytunnels) */
  { const c=R.gh, film=new THREE.MeshLambertMaterial({color:0xe9f0ee,transparent:true,opacity:0.72,side:THREE.DoubleSide}), dk=new THREE.MeshLambertMaterial({color:0x4f7a35});
    for(let i=0;i<10;i++){ const x=c.x-100+i*11, z=c.z, y=terrainH(x,z);
      const t=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.2,60,14,1,true,-Math.PI/2,Math.PI),film); t.rotation.x=-Math.PI/2; t.scale.set(1,1,0.75); t.position.set(x,y,z); g.add(t);
      apBox(g,dk,x,y,z,6,0.8,58); WALKBOX.push({x0:x-4.2,x1:x+4.2,z0:z-30,z1:z+30}); }
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.4),new THREE.MeshLambertMaterial({map:signTex('KÖY SERALARI','#3d6b3a','#ffffff',512,128)})); sg.position.set(c.x-45,terrainH(c.x-45,c.z+36)+1.8,c.z+36); g.add(sg); }
  /* ---- olive grove */
  { const c=R.olive, trees=[]; for(let i=0;i<14;i++) for(let j=0;j<12;j++){ const x=c.x-130+j*22+(r()-0.5)*3, z=c.z-100+i*15+(r()-0.5)*3; trees.push([x,terrainH(x,z),z,0.8+r()*0.4]); }
    const cg=new THREE.IcosahedronGeometry(2.4,1); cg.scale(1,0.7,1); cg.translate(0,3.3,0); const tg=new THREE.CylinderGeometry(0.25,0.4,2.4,6); tg.translate(0,1.2,0);
    const ci=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:0x7d8c5a,flatShading:true}),trees.length), ti=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:0x5c4a36}),trees.length);
    trees.forEach(function(t,i){ mt.compose(p3.set(t[0],t[1],t[2]),q.setFromAxisAngle(UP,i),s3.set(t[3],t[3],t[3])); ci.setMatrixAt(i,mt); ti.setMatrixAt(i,mt); });
    ci.instanceMatrix.needsUpdate=true; ti.instanceMatrix.needsUpdate=true; scene.add(ci); scene.add(ti); }
  /* ---- lake (gölet) with an earth dam, a jetty and benches */
  { const c=R.lake, w=new THREE.Mesh(new THREE.CircleGeometry(250,48),new THREE.MeshPhongMaterial({color:0x2f7d9a,specular:0x99aabb,shininess:60,transparent:true,opacity:0.88}));
    w.rotation.x=-Math.PI/2; w.position.set(c.x,c.level,c.z); w.userData.rs=true; w.userData.cs=false; scene.add(w);
    let sx=c.x; while(sx>c.x-260&&terrainH(sx,c.z)<c.level) sx-=4;
    const j=apBox(g,new THREE.MeshLambertMaterial({color:0x8a6a48}),sx+16,c.level+0.4,c.z,34,0.3,3); DECKS.push({x0:sx-2,x1:sx+33,z0:c.z-1.5,z1:c.z+1.5,y:c.level+0.7});
    for(let k=0;k<4;k++) apBox(g,M.door,sx-6,terrainH(sx-6,c.z-12+k*8),c.z-12+k*8,0.6,0.5,2.2);
    const rb=buildSailboat(false); rb.group.scale.set(0.45,0.45,0.45); rb.group.position.set(sx+36,c.level,c.z+5); rb.group.rotation.y=1.2; g.add(rb.group); }
  /* ---- village life */
  const V=ENV.village;
  /* tea garden beside the mosque */
  { const tx=V.x-12, tz=V.z+50, wood=new THREE.MeshLambertMaterial({color:0x8a5a34}), cloth=new THREE.MeshLambertMaterial({color:0xc0392b});
    for(let k=0;k<12;k++){ const x=tx+(k%4)*7, z=tz+Math.floor(k/4)*5.5, y=terrainH(x,z); apCyl(g,wood,x,y,z,0.5,0.5,0.75,8); apCyl(g,cloth,x,y+0.75,z,0.55,0.55,0.03,10);
      [-1,1].forEach(function(s){ apBox(g,wood,x+s*0.9,y,z,0.45,0.45,0.45); }); }
    const tr=new THREE.Mesh(new THREE.IcosahedronGeometry(5,1),new THREE.MeshLambertMaterial({color:0x4f7a35,flatShading:true})); tr.position.set(tx+10,terrainH(tx+10,tz+5)+8,tz+5); g.add(tr); apCyl(g,wood,tx+10,terrainH(tx+10,tz+5),tz+5,0.5,0.7,6,8);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(5,1),new THREE.MeshLambertMaterial({map:signTex('ÇAY BAHÇESİ','#7a2a1a','#ffffff',512,104)})); sg.position.set(tx+10,terrainH(tx,tz)+2.6,tz+15); g.add(sg); }
  /* village school with a pitch */
  { const c=R.school, y=terrainH(c.x,c.z); bldg(g,c.x,y,c.z-30,40,7,12,{floors:2,wall:'#f3d9b1'});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(14,1.8),new THREE.MeshLambertMaterial({map:signTex('KÖY İLKOKULU','#f3d9b1','#7a2a1a',1024,128)})); s.position.set(c.x,y+8,c.z-23.9); g.add(s);
    const fm=new THREE.MeshLambertMaterial({color:0x4f8f37,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); fm.userData.flat=true;
    const pg=new THREE.PlaneGeometry(60,36,6,4); pg.rotateX(-Math.PI/2); const pp=pg.attributes.position; for(let i=0;i<pp.count;i++){ const x=pp.getX(i)+c.x, z=pp.getZ(i)+c.z+20; pp.setXYZ(i,x,terrainH(x,z)+0.12,z); } pg.computeVertexNormals();
    g.add(new THREE.Mesh(pg,fm)); [-1,1].forEach(function(sd){ const x=c.x+sd*29, z=c.z+20, yy=terrainH(x,z); apBox(g,M.white,x,yy,z-2.5,0.12,2,0.12); apBox(g,M.white,x,yy,z+2.5,0.12,2,0.12); apBox(g,M.white,x,yy+2,z,0.12,0.12,5); });
    apCyl(g,M.white,c.x-22,y,c.z-22,0.08,0.12,9,8); const f=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); f.position.set(c.x-20.8,y+8,c.z-22); g.add(f); }
  bakeInto(g);
  /* tractor ploughing a field (back and forth) */
  { const tg=new THREE.Group(), red=new THREE.MeshLambertMaterial({color:0xc0392b}), blk=new THREE.MeshLambertMaterial({color:0x1c1e20});
    apBox(tg,red,0,0.9,0.4,1.4,1.0,2.6); apBox(tg,red,0,1.2,-1.2,1.1,0.8,1.4); apBox(tg,M.glass,0,1.9,0.8,1.3,1.3,1.2); apBox(tg,red,0,3.2,0.8,1.5,0.1,1.4);
    [[-0.95,1.0,0.95],[0.95,1.0,0.95]].forEach(function(w){ const m=new THREE.Mesh(new THREE.CylinderGeometry(w[1],w[1],0.5,14),blk); m.rotation.z=Math.PI/2; m.position.set(w[0],w[1],w[2]); tg.add(m); });
    [[-0.8,0.5,-1.4],[0.8,0.5,-1.4]].forEach(function(w){ const m=new THREE.Mesh(new THREE.CylinderGeometry(w[1],w[1],0.35,12),blk); m.rotation.z=Math.PI/2; m.position.set(w[0],w[1],w[2]); tg.add(m); });
    apBox(tg,M.metal,0,0.3,3.4,2.4,0.4,1.2); const t=new THREE.Group(); t.add(bakeGroup(tg)); scene.add(t); R.tractor=t; }
  /* sheep flock grazing on the pasture west of the village */
  { const bodyG=MK.merge([(function(){ const b=new THREE.SphereGeometry(0.55,8,6); b.scale(0.8,0.75,1.25); b.translate(0,0.75,0); return b; })()]), headG=new THREE.BoxGeometry(0.3,0.32,0.4); headG.translate(0,0.95,-0.75);
    const n=34, bi=new THREE.InstancedMesh(bodyG,new THREE.MeshLambertMaterial({color:0xf0ece0}),n), hi=new THREE.InstancedMesh(headG,new THREE.MeshLambertMaterial({color:0x2a2622}),n);
    for(let k=0;k<n;k++) R.sheepD.push({ox:(r()-0.5)*40,oz:(r()-0.5)*30,ph:r()*6.3,sp:0.2+r()*0.4}); bi.frustumCulled=false; hi.frustumCulled=false; scene.add(bi); scene.add(hi); R.sheep=[bi,hi]; R.flock={x:-1180,z:-2560}; }
  /* chimney smoke from a few village houses */
  { const hs=ENV.houses.filter(function(h,i){ return i%3===0; }).slice(0,10), n=hs.length*8, pos=new Float32Array(n*3);
    const tex=apTex(64,64,function(x,W,H){ const gr=x.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(235,235,235,0.75)'); gr.addColorStop(1,'rgba(235,235,235,0)'); x.fillStyle=gr; x.fillRect(0,0,W,H); });
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=new THREE.Points(pg,new THREE.PointsMaterial({map:tex,size:9,transparent:true,depthWrite:false,sizeAttenuation:true,opacity:0.7})); pts.frustumCulled=false; scene.add(pts);
    hs.forEach(function(h){ for(let k=0;k<8;k++) R.smokeD.push({x:h[0]+h[3]*0.2,y:h[1]+1,z:h[2],t:k/8}); }); R.smoke=pts; }
  /* clear island trees over the new areas */
  RURAL.clear.forEach(function(c){ const pts=[]; for(let x=c[0];x<=c[1];x+=20) for(let z=c[2];z<=c[3];z+=20) pts.push([x,z]); clearTreesNear(pts,14); });
  R.built=true; ruralStep(0);
}
function ruralStep(dt){
  const R=RURAL; if(!R.built) return; const mt=new THREE.Matrix4(), q=new THREE.Quaternion(), qa=new THREE.Quaternion(), s1=new THREE.Vector3(1,1,1), p=new THREE.Vector3(), Z=new THREE.Vector3(0,0,1);
  R.rotorD.forEach(function(t,i){ t.a+=t.w*dt; q.setFromAxisAngle(UP,R.yaw); qa.setFromAxisAngle(Z,t.a); q.multiply(qa);
    mt.compose(p.set(t.x-3.6*Math.sin(R.yaw),t.y,t.z-3.6*Math.cos(R.yaw)),q,s1); R.rotors.setMatrixAt(i,mt); });
  R.rotors.instanceMatrix.needsUpdate=true;
  if(R.tractor){ R.tractorT+=dt; const lane=Math.floor(R.tractorT/22)%8, u=(R.tractorT%22)/22, dir=lane%2?-1:1, x=150+lane*6, z=-3400+(dir>0?u:1-u)*150;
    R.tractor.position.set(x,terrainH(x,z),z); R.tractor.rotation.y=dir>0?Math.PI:0; }
  if(R.sheep){ const f=R.flock; f.x=-1180+Math.cos(T*0.01)*40; f.z=-2560+Math.sin(T*0.013)*30;
    R.sheepD.forEach(function(d,i){ const x=f.x+d.ox+Math.sin(T*d.sp*0.2+d.ph)*3, z=f.z+d.oz+Math.cos(T*d.sp*0.15+d.ph)*3, hd=d.ph+Math.sin(T*0.05+d.ph);
      mt.compose(p.set(x,terrainH(x,z),z),q.setFromAxisAngle(UP,hd),s1); R.sheep[0].setMatrixAt(i,mt); R.sheep[1].setMatrixAt(i,mt); });
    R.sheep[0].instanceMatrix.needsUpdate=true; R.sheep[1].instanceMatrix.needsUpdate=true; }
  if(R.smoke){ const a=R.smoke.geometry.attributes.position; R.smokeD.forEach(function(d,i){ d.t=(d.t+dt*0.12)%1; a.setXYZ(i,d.x+d.t*10,d.y+d.t*18,d.z+d.t*4); }); a.needsUpdate=true; }
}
