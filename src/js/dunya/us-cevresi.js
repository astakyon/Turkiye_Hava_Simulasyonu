/* ------------------------------------------------------------------ base surroundings (Stage 4)
   Mowed grass, perimeter fence and the main gate, the road north to the village (houses, mosque, shops), fields,
   tree belts, rocks, surf along the shore, lighthouse on the southern tip, ILS glide-slope masts, weather station. */
const ENV={houses:[], fence:[], foam:null, beacon:null, beamT:0, gate:{x:-150,z:-1672}, road:[], village:{x:-330,z:-2880}};
/* rounded rectangle path (closed), sampled every `step` metres */
function rrPath(x0,x1,z0,z1,R,step){
  const pts=[]; function arc(cx,cz,a0,a1){ for(let k=0;k<=12;k++){ const a=a0+(a1-a0)*k/12; pts.push([cx+R*Math.cos(a),cz+R*Math.sin(a)]); } }
  pts.push([x0+R,z0]); arc(x1-R,z0+R,-Math.PI/2,0); arc(x1-R,z1-R,0,Math.PI/2); arc(x0+R,z1-R,Math.PI/2,Math.PI); arc(x0+R,z0+R,Math.PI,Math.PI*1.5);
  const out=[]; let carry=0;
  for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]); let d=carry; while(d<L){ const u=d/L; out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]); d+=step; } carry=d-L; }
  return out;
}
/* road ribbon that follows the terrain */
function terrainRibbon(P,width,lift,mat){
  const pos=[], uv=[], idx=[]; let dist=0;
  for(let i=0;i<P.length;i++){ const a=P[Math.max(i-1,0)], b=P[Math.min(i+1,P.length-1)]; let tx=b[0]-a[0], tz=b[1]-a[1]; const l=Math.hypot(tx,tz)||1; tx/=l; tz/=l;
    if(i>0) dist+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
    [-1,1].forEach(function(s){ const x=P[i][0]-tz*width/2*s, z=P[i][1]+tx*width/2*s; pos.push(x,Math.max(terrainH(x,z),terrainH(P[i][0],P[i][1]))+lift,z); uv.push(s<0?0:1,dist/width); }); }
  for(let i=0;i<P.length-1;i++){ const a=2*i; idx.push(a,a+1,a+2, a+1,a+3,a+2); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat); m.userData.rs=true; m.userData.cs=false; scene.add(m); return m;
}
function smoothPath(ctrl,step){ /* Catmull-Rom through control points */
  const out=[]; for(let i=0;i<ctrl.length-1;i++){ const p0=ctrl[Math.max(i-1,0)], p1=ctrl[i], p2=ctrl[i+1], p3=ctrl[Math.min(i+2,ctrl.length-1)], L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]), n=Math.max(2,Math.ceil(L/step));
    for(let k=0;k<n;k++){ const t=k/n, t2=t*t, t3=t2*t; out.push([0,1].map(function(j){ return 0.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3); })); } }
  out.push(ctrl[ctrl.length-1]); return out;
}
function buildSurroundings(){
  const gy=AIRFIELD_Y, M=apMats(), r=mulberry32(77);
  /* ---- mowed grass over the flat base area */
  const grass=apTex(256,256,function(x,W,H){ x.fillStyle='#6f9a4a'; x.fillRect(0,0,W,H); const q=mulberry32(4);
    for(let i=0;i<5000;i++){ const v=q(); x.fillStyle=v<0.5?'rgba(40,70,25,0.12)':'rgba(170,200,110,0.12)'; x.fillRect(q()*W,q()*H,1+q()*2,2+q()*4); }
    x.fillStyle='rgba(255,255,230,0.035)'; x.fillRect(0,0,W/2,H); },[1,1]);
  grass.repeat.set(1/24,1/24);
  const gm=new THREE.MeshLambertMaterial({map:grass}); gm.userData.flat=true;
  /* mowed only inside the fence: the edge of the cut grass follows the fence line */
  const gshape=new THREE.Shape(); rrPath(-572,292,-1672,1672,110,20).forEach(function(p,i){ if(i===0) gshape.moveTo(p[0],-p[1]); else gshape.lineTo(p[0],-p[1]); });
  const gg=new THREE.ShapeGeometry(gshape); gg.rotateX(-Math.PI/2);
  const uv=gg.attributes.uv, gp=gg.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,gp.getX(i),gp.getZ(i));
  const gmesh=new THREE.Mesh(gg,gm); gmesh.position.y=gy+0.06; gmesh.userData.rs=true; gmesh.userData.cs=false; scene.add(gmesh);
  /* ---- perimeter fence: posts, chain-link, barbed wire, with a gap at the main gate */
  const path=rrPath(-572,292,-1672,1672,110,4), keep=path.filter(function(p){ return !(Math.abs(p[0]-ENV.gate.x)<9&&Math.abs(p[1]-ENV.gate.z)<4); });
  const postG=new THREE.CylinderGeometry(0.06,0.06,2.9,6); postG.translate(0,1.45,0);
  const posts=new THREE.InstancedMesh(postG,M.metal,keep.length), mt=new THREE.Matrix4();
  keep.forEach(function(p,i){ mt.makeTranslation(p[0],gy,p[1]); posts.setMatrixAt(i,mt); }); posts.instanceMatrix.needsUpdate=true; scene.add(posts);
  const link=apTex(64,64,function(x,W,H){ x.clearRect(0,0,W,H); x.strokeStyle='rgba(185,195,200,0.85)'; x.lineWidth=2; for(let i=-W;i<W*2;i+=8){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+H,H); x.stroke(); x.beginPath(); x.moveTo(i,H); x.lineTo(i+H,0); x.stroke(); } });
  link.wrapS=link.wrapT=THREE.RepeatWrapping;
  const lm=new THREE.MeshLambertMaterial({map:link,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,depthWrite:true}); lm.userData.flat=true;
  const fp=[], fu=[], fi=[]; let seg=0;
  for(let i=0;i<path.length;i++){ const a=path[i], b=path[(i+1)%path.length]; if(Math.hypot(b[0]-a[0],b[1]-a[1])>6) continue;
    if((Math.abs(a[0]-ENV.gate.x)<9&&Math.abs(a[1]-ENV.gate.z)<4)||(Math.abs(b[0]-ENV.gate.x)<9&&Math.abs(b[1]-ENV.gate.z)<4)) continue;
    const o=fp.length/3; fp.push(a[0],gy+0.15,a[1], b[0],gy+0.15,b[1], a[0],gy+2.5,a[1], b[0],gy+2.5,b[1]); fu.push(0,0, 1.6,0, 0,1, 1.6,1); fi.push(o,o+1,o+2, o+1,o+3,o+2);
    ENV.fence.push({x0:Math.min(a[0],b[0])-0.25,x1:Math.max(a[0],b[0])+0.25,z0:Math.min(a[1],b[1])-0.25,z1:Math.max(a[1],b[1])+0.25}); seg++; }
  const fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3)); fg.setAttribute('uv',new THREE.Float32BufferAttribute(fu,2)); fg.setIndex(fi); fg.computeVertexNormals();
  const fence=new THREE.Mesh(fg,lm); fence.userData.rs=false; fence.userData.cs=false; scene.add(fence);
  const wire=[]; keep.forEach(function(p){ wire.push(p[0],gy+2.75,p[1]); }); const wg=new THREE.BufferGeometry(); wg.setAttribute('position',new THREE.Float32BufferAttribute(wire,3));
  scene.add(new THREE.Line(wg,new THREE.LineBasicMaterial({color:0x55595e})));
  /* ---- main gate (nizamiye): guard house, canopy, barriers, sign arch, flags */
  const st=new THREE.Group(), G=ENV.gate;
  apBox(st,M.conc,G.x+11,gy,G.z-6,6,3.2,5); apBox(st,M.roof,G.x+11,gy+3.2,G.z-6,6.6,0.35,5.6); apBox(st,M.glass,G.x+11,gy+1.2,G.z-6,6.1,1.2,5.1);
  apBox(st,M.white,G.x,gy+5.6,G.z-6,26,0.6,10); [-1,1].forEach(function(s){ [-1,1].forEach(function(t){ apCyl(st,M.white,G.x+s*12,gy,G.z-6+t*4,0.25,0.25,5.6,10); }); });
  apBox(st,M.red,G.x,gy+5.4,G.z-11.05,26,0.5,0.1);
  const gs=new THREE.Mesh(new THREE.PlaneGeometry(18,2.2),new THREE.MeshLambertMaterial({map:signTex('AY YILDIZ HAVA ÜSSÜ','#ffffff','#b3121c',1024,128)})); gs.position.set(G.x,gy+7.3,G.z-0.75); st.add(gs);
  const gs2=gs.clone(); gs2.rotation.y=Math.PI; gs2.position.set(G.x,gy+7.3,G.z-11.25); st.add(gs2);
  apBox(st,M.white,G.x,gy+6.2,G.z-6,18.6,2.4,10.4);
  [-1,1].forEach(function(s){ apBox(st,M.conc,G.x+s*7.2,gy,G.z-6,0.8,0.9,9); const arm=new THREE.Mesh(new THREE.BoxGeometry(5.5,0.12,0.12),M.red); arm.position.set(G.x+s*4.2,gy+1.0,G.z-6+s*2.5); arm.rotation.z=s*1.1; st.add(arm); });
  [[G.x-14,G.z+2],[G.x+14,G.z+2]].forEach(function(p){ apCyl(st,M.white,p[0],gy,p[1],0.1,0.14,11,8);
    const f=new THREE.Mesh(new THREE.PlaneGeometry(3,2),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); f.position.set(p[0]+1.5,gy+10,p[1]); st.add(f); });
  for(let k=-2;k<=2;k++) apBox(st,M.yel,G.x+k*2.4,gy+0.1,G.z-16,2.0,0.12,0.5);
  apObst(G.x+7.8,G.x+14.2,G.z-8.7,G.z-3.3,4);
  /* ---- road north to the village, lined with trees */
  const roadMat=new THREE.MeshLambertMaterial({map:apTex(32,64,function(x,W,H){ x.fillStyle='#55595e'; x.fillRect(0,0,W,H); x.fillStyle='rgba(235,235,225,0.9)'; x.fillRect(W/2-1,0,2,H*0.5); x.fillRect(0,0,1,H); x.fillRect(W-1,0,1,H); })});
  roadMat.map.wrapT=THREE.RepeatWrapping; roadMat.userData.flat=true;
  const V=ENV.village, rc=[[G.x,-1640],[G.x,-1700],[G.x-20,-1950],[-210,-2250],[-280,-2560],[V.x,V.z+90],[V.x,V.z]];
  ENV.road=smoothPath(rc,6); terrainRibbon(ENV.road,8,0.3,roadMat);
  /* ---- village: houses with tiled roofs, a mosque with minaret, shops; streets */
  const vg=new THREE.Group(), wallMats=[0xefe6d4,0xf3efe6,0xe6d2b5,0xdfe3e6].map(function(c){ return new THREE.MeshLambertMaterial({color:c}); }),
        roofMat=new THREE.MeshLambertMaterial({color:0xb2532f}), winMat=ENV.winMat=new THREE.MeshLambertMaterial({color:0x2b3540}), doorMat=new THREE.MeshLambertMaterial({color:0x6b4a32}),
        lead=new THREE.MeshLambertMaterial({color:0x8b98a3}), gold=new THREE.MeshLambertMaterial({color:0xd9b44a}), grassG=new THREE.MeshLambertMaterial({color:0x5f8f3e});
  const streets=[[[V.x-160,V.z-30],[V.x+170,V.z-30]],[[V.x-150,V.z+70],[V.x+150,V.z+70]],[[V.x-60,V.z-150],[V.x-60,V.z+150]],[[V.x+80,V.z-140],[V.x+80,V.z+150]]];
  streets.forEach(function(s){ terrainRibbon(smoothPath(s,8),6,0.28,roadMat); });
  function house(x,z,w,d,h,rot,mi){
    const y=terrainH(x,z), base=y-1.2, g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; vg.add(g);
    apBox(g,wallMats[mi%4],0,base,0,w,h+1.2,d);
    const rg=new THREE.CylinderGeometry(0.0001,Math.SQRT2*Math.max(w,d)*0.62,h*0.55,4,1); rg.rotateY(Math.PI/4); rg.scale(w/Math.max(w,d),1,d/Math.max(w,d));
    const rf=new THREE.Mesh(rg,roofMat); rf.position.set(0,y+h+h*0.275,0); g.add(rf);
    for(let k=0;k<Math.floor(w/3);k++){ [-1,1].forEach(function(s){ apBox(g,winMat,-w/2+1.5+k*3,y+h*0.45,s*(d/2+0.02),1.1,1.2,0.05); }); }
    apBox(g,doorMat,0,y,d/2+0.03,1.1,2.1,0.05);
    wbAdd(g); ENV.houses.push([x,y+h+h*0.55*0.6,z,w,d,rot]); return g;
  }
  let n=0; for(let k=0;k<160&&n<34;k++){ const x=V.x-170+r()*340, z=V.z-150+r()*300;
    if(streets.some(function(s){ const a=s[0], b=s[1]; return Math.abs(a[0]-b[0])>1?(Math.abs(z-a[1])<11&&x>a[0]-8&&x<b[0]+8):(Math.abs(x-a[0])<11&&z>a[1]-8&&z<b[1]+8); })) continue;
    if(Math.hypot(x-(V.x+10),z-(V.z+20))<34) continue;
    if(vg.children.some(function(c){ return Math.hypot(c.position.x-x,c.position.z-z)<18; })) continue;
    const near=streets.reduce(function(best,s){ const a=s[0], b=s[1]; return Math.abs(a[0]-b[0])>1?Math.min(best,Math.abs(z-a[1])):Math.min(best,Math.abs(x-a[0])); },99);
    if(near>40) continue;
    house(x,z,7+r()*6,7+r()*4,3.2+(r()<0.35?3:0),Math.round(r()*4)*Math.PI/2,n++); }
  /* mosque */
  { const mx=V.x+10, mz=V.z+20, my=terrainH(mx,mz), g=new THREE.Group(); vg.add(g);
    apBox(g,wallMats[1],mx,my-1.5,mz,16,10.5,16); apBox(g,wallMats[1],mx,my+9,mz,11,2.2,11);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(6.2,24,12,0,Math.PI*2,0,Math.PI/2),lead); dome.position.set(mx,my+11.2,mz); g.add(dome);
    apCyl(g,gold,mx,my+17.4,mz,0.08,0.08,1.6,6);
    const cres=new THREE.Mesh(new THREE.TorusGeometry(0.45,0.1,6,16,Math.PI*1.4),gold); cres.position.set(mx,my+19.4,mz); g.add(cres);
    for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4; const s=new THREE.Mesh(new THREE.SphereGeometry(1.4,12,8,0,Math.PI*2,0,Math.PI/2),lead); s.position.set(mx+Math.cos(a)*6.4,my+9,mz+Math.sin(a)*6.4); g.add(s); }
    const mnx=mx+10, mnz=mz-8; apCyl(g,wallMats[1],mnx,my-1,mnz,1.1,1.3,26,12); apCyl(g,wallMats[1],mnx,my+17,mnz,1.7,1.4,0.8,12);
    apCyl(g,wallMats[1],mnx,my+17.8,mnz,1.6,1.6,0.9,12,true); apCyl(g,wallMats[1],mnx,my+18.7,mnz,0.95,0.95,6,12);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(1.05,5,12),lead); cone.position.set(mnx,my+27.2,mnz); g.add(cone);
    apCyl(g,gold,mnx,my+29.7,mnz,0.05,0.05,1.2,6);
    for(let k=0;k<5;k++) apBox(g,winMat,mx-6+k*3,my+3,mz+8.02,1.2,2.8,0.06);
    apBox(g,doorMat,mx,my-0.2,mz+8.04,2.4,3.6,0.06);
    wbAdd(g); }
  /* shops on the main street */
  for(let k=0;k<4;k++){ const sx=V.x-130+k*26, sz=V.z-46; const g=house(sx,sz,10,8,3.4,0,k+1);
    const aw=new THREE.Mesh(new THREE.BoxGeometry(9,0.15,2),new THREE.MeshLambertMaterial({color:[0xc0392b,0x2e86c1,0x27ae60,0xd68910][k]})); aw.position.set(0,terrainH(sx,sz)+2.7,4.6); aw.rotation.x=0.25; g.add(aw); }
  const vb=bakeGroup(vg); vb.children.slice().forEach(function(m){ scene.add(m); }); vg.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); });
  /* ---- fields north of the base */
  const fieldTex=function(base,line){ return apTex(64,64,function(x,W,H){ x.fillStyle=base; x.fillRect(0,0,W,H); x.fillStyle=line; for(let i=0;i<W;i+=8) x.fillRect(i,0,3,H); },[6,6]); };
  const fmats=[['#c9b25a','rgba(150,120,40,0.5)'],['#7aa04a','rgba(60,100,40,0.5)'],['#8a6a48','rgba(70,50,30,0.6)'],['#a6b65a','rgba(110,130,50,0.5)']].map(function(c){ const m=new THREE.MeshLambertMaterial({map:fieldTex(c[0],c[1]),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}); m.userData.flat=true; return m; });
  const fieldGroups=fmats.map(function(){ return []; });
  for(let k=0,placed=0;k<400&&placed<46;k++){
    const x=-1500+r()*2400, z=-3700+r()*1700; if(Math.hypot(x-V.x,z-V.z)<230||Math.hypot(x,z)<1950) continue;
    if(ENV.road.some(function(p){ return Math.hypot(p[0]-x,p[1]-z)<70; })||nearNavalRoad(x,z,70)||ruralClear(x,z,90)) continue;
    const h=terrainH(x,z); if(h<6||h>140) continue; if(Math.abs(terrainH(x+60,z)-h)+Math.abs(terrainH(x,z+60)-h)>16) continue;
    const w=70+r()*90, l=60+r()*80, rot=r()*0.5-0.25, pg=new THREE.PlaneGeometry(w,l,8,8); pg.rotateX(-Math.PI/2); pg.rotateY(rot);
    const p=pg.attributes.position; for(let i=0;i<p.count;i++){ const wx=p.getX(i)+x, wz=p.getZ(i)+z; p.setXYZ(i,wx,terrainH(wx,wz)+1.1,wz); }
    pg.computeVertexNormals(); fieldGroups[placed%4].push(pg); placed++; }
  fieldGroups.forEach(function(list,i){ if(!list.length) return; const m=new THREE.Mesh(MK.merge(list),fmats[i]); m.userData.rs=true; m.userData.cs=false; scene.add(m); });
  /* ---- trees: conifers and broadleaf, belts around the base, along the road, in the village */
  const tPos=[];
  for(let k=0;k<9000&&tPos.length<2600;k++){ const a=r()*Math.PI*2, d=1720+r()*1100, x=Math.cos(a)*d, z=Math.sin(a)*d; const h=terrainH(x,z); if(h<4||h>300) continue;
    if(x>-600&&x<320&&z>-1700&&z<1700) continue; if(fbm(x/260+3,z/260+9,2)<0.47) continue;
    if(ENV.road.some(function(p){ return Math.abs(p[0]-x)<14&&Math.abs(p[1]-z)<14; })||nearNavalRoad(x,z,14)||inAnyPad(x,z,30)||ruralClear(x,z,10)) continue;
    if(Math.hypot(x-V.x,z-V.z)<190) continue; tPos.push([x,h,z,0.7+r()*0.8,r()<0.55?0:1]); }
  ENV.road.forEach(function(p,i){ if(i%4||i<10) return; [-1,1].forEach(function(s){ const x=p[0]+s*11, z=p[1]; tPos.push([x,terrainH(x,z),z,0.8+r()*0.3,1]); }); });
  TREE_EXTRA.forEach(function(t){ tPos.push(t); });
  for(let k=0;k<120;k++){ const x=V.x-170+r()*340, z=V.z-150+r()*300; if(vg.children.some(function(c){ return Math.hypot(c.position.x-x,c.position.z-z)<9; })) continue; tPos.push([x,terrainH(x,z),z,0.6+r()*0.4,1]); }
  const conG=MK.merge([(function(){ const g=new THREE.ConeGeometry(2.6,7,7); g.translate(0,6.5,0); return g; })(),(function(){ const g=new THREE.ConeGeometry(2.0,5.5,7); g.translate(0,9.5,0); return g; })()]);
  const leafG=(function(){ const g=new THREE.IcosahedronGeometry(3.2,1); g.scale(1,0.85,1); g.translate(0,6.4,0); return g; })();
  const trunkG=(function(){ const g=new THREE.CylinderGeometry(0.22,0.32,4,6); g.translate(0,2,0); return g; })();
  const cm=new THREE.MeshLambertMaterial({color:0x2f5a34}), lmT=new THREE.MeshLambertMaterial({color:0x4f7a35}), tm=new THREE.MeshLambertMaterial({color:0x5a4330});
  const cons=tPos.filter(function(t){ return t[4]===0; }), leafs=tPos.filter(function(t){ return t[4]===1; });
  const q4=new THREE.Quaternion(), s3=new THREE.Vector3(), p3=new THREE.Vector3();
  [[conG,cm,cons],[leafG,lmT,leafs],[trunkG,tm,tPos]].forEach(function(e){ const im=new THREE.InstancedMesh(e[0],e[1],e[2].length);
    e[2].forEach(function(t,i){ mt.compose(p3.set(t[0],t[1]-0.3,t[2]),q4.setFromAxisAngle(UP,(i*2.39)%6.28),s3.set(t[3],t[3]*(0.9+((i*7)%5)*0.06),t[3])); im.setMatrixAt(i,mt); });
    im.instanceMatrix.needsUpdate=true; im.frustumCulled=false; scene.add(im); });
  /* ---- rocks on the slopes and along the shore */
  const rockG=new THREE.DodecahedronGeometry(1,0), rockM=new THREE.MeshLambertMaterial({color:0x8a8579}), rocks=[];
  for(let k=0;k<6000&&rocks.length<700;k++){ const a=r()*Math.PI*2, d=1800+r()*3800, x=Math.cos(a)*d, z=Math.sin(a)*d, h=terrainH(x,z);
    const sl=Math.abs(terrainH(x+20,z)-h)+Math.abs(terrainH(x,z+20)-h); if(h<0.5||(sl<6&&h>6)||inAnyPad(x,z,80)) continue; rocks.push([x,h,z,1+r()*3.5]); }
  const ri=new THREE.InstancedMesh(rockG,rockM,rocks.length); rocks.forEach(function(t,i){ mt.compose(p3.set(t[0],t[1]+t[3]*0.2,t[2]),q4.setFromEuler(new THREE.Euler(i,i*1.7,i*0.3)),s3.set(t[3],t[3]*0.6,t[3]*0.9)); ri.setMatrixAt(i,mt); });
  ri.instanceMatrix.needsUpdate=true; ri.frustumCulled=false; scene.add(ri);
  /* ---- surf along the shoreline around the peninsula */
  const shore=[]; for(let ang=0;ang<360;ang+=1.2){ const a=ang*D2R, cx=Math.cos(a), cz=Math.sin(a); let found=null, prevLand=false;
    for(let d=600;d<9000;d+=15){ const h=terrainH(cx*d,cz*d); if(h>0.6) prevLand=true; else if(prevLand){ found=[cx*d,cz*d]; break; } }
    shore.push(found); }
  const fpos=[], fuv=[], fidx=[];
  for(let i=0;i<shore.length;i++){ const a=shore[i], b=shore[(i+1)%shore.length]; if(!a||!b||Math.hypot(a[0]-b[0],a[1]-b[1])>220) continue;
    const o=fpos.length/3, na=Math.hypot(a[0],a[1]), nb=Math.hypot(b[0],b[1]);
    [[a,na],[b,nb]].forEach(function(e,j){ const p=e[0], n=e[1]; fpos.push(p[0]-p[0]/n*5,0.25,p[1]-p[1]/n*5, p[0]+p[0]/n*11,0.25,p[1]+p[1]/n*11); fuv.push(j*0.35,0, j*0.35,1); });
    fidx.push(o,o+1,o+2, o+1,o+3,o+2); }
  const foamTex=apTex(64,64,function(x,W,H){ x.clearRect(0,0,W,H); const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(255,255,255,0.0)'); g.addColorStop(0.3,'rgba(255,255,255,0.75)'); g.addColorStop(0.45,'rgba(255,255,255,0.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,W,H);
    const q=mulberry32(8); x.globalCompositeOperation='destination-out'; for(let i=0;i<60;i++){ x.fillStyle='rgba(0,0,0,'+(0.2+q()*0.4)+')'; x.beginPath(); x.arc(q()*W,H*(0.25+q()*0.5),2+q()*5,0,6.3); x.fill(); } });
  foamTex.wrapS=foamTex.wrapT=THREE.RepeatWrapping;
  const fgeo=new THREE.BufferGeometry(); fgeo.setAttribute('position',new THREE.Float32BufferAttribute(fpos,3)); fgeo.setAttribute('uv',new THREE.Float32BufferAttribute(fuv,2)); fgeo.setIndex(fidx); fgeo.computeVertexNormals();
  const foam=new THREE.Mesh(fgeo,new THREE.MeshBasicMaterial({map:foamTex,transparent:true,depthWrite:false,opacity:0.85})); foam.userData.rs=false; foam.userData.cs=false; foam.renderOrder=1; scene.add(foam); ENV.foam=foam;
  /* ---- lighthouse on the southern tip */
  { let lz=1900; while(lz<4000&&terrainH(0,lz+40)>2) lz+=20; const lx=0, ly=terrainH(lx,lz), g=new THREE.Group();
    apCyl(g,M.conc,lx,ly-1,lz,3.4,3.6,1.6,16);
    for(let k=0;k<5;k++) apCyl(g,k%2?M.red:M.white,lx,ly+0.6+k*3.6,lz,2.1-k*0.12,2.2-k*0.12,3.6,16);
    apCyl(g,M.dark,lx,ly+18.6,lz,2.0,2.0,0.4,16); apCyl(g,M.glass,lx,ly+19,lz,1.3,1.3,2.2,12); apCyl(g,M.red,lx,ly+21.2,lz,0.2,1.5,1.4,12);
    apBox(g,M.white,lx+5,ly-0.5,lz,4,3.5,3); apBox(g,M.red,lx+5,ly+3,lz,4.4,0.4,3.4);
    bakeGroup(g).children.slice().forEach(function(m){ scene.add(m); });
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.7,10,8),new THREE.MeshBasicMaterial({color:0xfff2b0})); lamp.material.userData.glow=3; lamp.position.set(lx,ly+20.1,lz); scene.add(lamp);
    const beamG=new THREE.ConeGeometry(2.5,60,12,1,true); beamG.translate(0,-30,0); beamG.rotateZ(Math.PI/2);
    const beam=new THREE.Mesh(beamG,new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:0.12,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    beam.position.set(lx,ly+20.1,lz); beam.userData.rs=false; beam.userData.cs=false; scene.add(beam); ENV.beacon=beam; }
  /* ---- ILS glide-slope masts and a weather station */
  const ex=new THREE.Group();
  [[120,950],[-120,-950]].forEach(function(p){ apBox(ex,M.white,p[0]-3,gy,p[1],2.5,2.4,2); apCyl(ex,M.metal,p[0],gy,p[1],0.18,0.25,15,8);
    for(let k=0;k<3;k++){ apBox(ex,M.white,p[0]+(p[0]>0?-0.5:0.5),gy+5+k*4,p[1],1.0,0.7,1.6); } apBox(ex,M.redL,p[0],gy+15,p[1],0.3,0.3,0.3); apObst(p[0]-4.5,p[0]+1,p[1]-1.5,p[1]+1.5,16); });
  { const wx=-90, wz=212; [[-4,0,8,0.1],[4,0,8,0.1],[0,-4,0.1,8],[0,4,0.1,8]].forEach(function(f){ apBox(ex,M.metal,wx+f[0],gy,wz+f[1],f[2],1.4,f[3]); });
    apBox(ex,M.white,wx-1.5,gy,wz,1.2,1.4,0.9); apCyl(ex,M.metal,wx+1.8,gy,wz-1.8,0.06,0.06,10,6);
    for(let k=0;k<3;k++){ const a=k*2.09; apBox(ex,M.dark,wx+1.8+Math.cos(a)*0.45,gy+10,wz-1.8+Math.sin(a)*0.45,0.12,0.25,0.12); }
    apBox(ex,M.white,wx-1.5,gy+1.4,wz+2.2,0.8,0.6,0.6); }
  bakeGroup(ex).children.slice().forEach(function(m){ scene.add(m); }); ex.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); });
  bakeGroup(st).children.slice().forEach(function(m){ scene.add(m); }); st.traverse(function(o){ if(o.isMesh) o.geometry.dispose(); });
  ENV.fence.forEach(function(b){ WALKBOX.push(b); });
}
function surroundingsStep(dt){
  if(ENV.foam){ const m=ENV.foam.material; m.map.offset.x=(T*0.02)%1; m.opacity=0.55+0.25*Math.sin(T*0.9); }
  if(ENV.beacon) ENV.beacon.rotation.y+=dt*0.9;
}
