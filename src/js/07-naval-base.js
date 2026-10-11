/* ------------------------------------------------------------------ naval base (Mavi Kanatlar home port), in the bay west of the village
   Concrete apron cut into the coast (PADS 'naval' in 04-terrain), three piers, breakwater with entrance lights, a mole with
   TCG Anadolu alongside, frigates/corvettes/patrol boats/tug at the piers, a submarine pen, a floating dock with a corvette
   in it, portal cranes, warehouses, workshop, HQ, barracks, fuel farm, helipad, radar mast, fence and gate, road to the village. */
const NAVAL={x0:-1990,x1:-1500,qx1:-1760,z0:-4300,z1:-3150,y:3.1, gate:{x:-1500,z:-3330}, piers:[-4100,-3880,-3660], mole:-3450,
  road:null, cranes:[], radars:[], boat:null, boatT:0, built:false};
NAVAL.road=smoothPath([[-490,-2910],[-760,-2955],[-1050,-3065],[-1290,-3235],[-1420,-3322],[-1500,-3330],[-1560,-3330]],6);
const EXTRA_ROADS=[];
function nearNavalRoad(x,z,d){ for(let k=0;k<EXTRA_ROADS.length;k++){ const R=EXTRA_ROADS[k]; for(let i=0;i<R.length;i+=2){ if(Math.abs(R[i][0]-x)<d&&Math.abs(R[i][1]-z)<d) return true; } } return false; }
EXTRA_ROADS.push(NAVAL.road);
/* obstacle with an absolute top height (aircraft crash into it; on foot it blocks unless `air`) */
function navObst(x0,x1,z0,z1,y1,air){ AP.obst.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y1:y1,air:!!air}); AP.topY=Math.max(AP.topY||0,y1); }
/* box whose top is narrowed across z (rubble-mound breakwater, quay wall batter) */
function taperBoxZ(w,h,d,ratio){ const g=new THREE.BoxGeometry(w,h,d), p=g.attributes.position; for(let i=0;i<p.count;i++) if(p.getY(i)>0) p.setZ(i,p.getZ(i)*ratio); g.computeVertexNormals(); return g; }
function beam(g,mat,a,b,r){ const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,5),mat);
  m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); m.quaternion.setFromUnitVectors(UP,d.normalize()); g.add(m); return m; }
/* world AABB of a w×d rectangle centred at (x,z) in group g's frame */
function rectWorld(g,x,z,w,d){ const xs=[], zs=[], v=new THREE.Vector3();
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ v.set(x+c[0]*w/2,0,z+c[1]*d/2); if(g.matrixWorld) v.applyMatrix4(g.matrixWorld); xs.push(v.x); zs.push(v.z); });
  return [Math.min.apply(null,xs),Math.max.apply(null,xs),Math.min.apply(null,zs),Math.max.apply(null,zs)]; }
/* building with window facades (texture per floors × bays, cached) */
const FACADE={};
function facadeMat(floors,bays,wall,win){ const k=floors+'|'+bays+'|'+wall; if(FACADE[k]) return FACADE[k];
  const W=Math.min(512,bays*16), H=Math.min(256,floors*24);
  const t=apTex(W,H,function(x,w,h){ x.fillStyle=wall; x.fillRect(0,0,w,h); const bw=w/bays, fh=h/floors;
    for(let f=0;f<floors;f++){ x.fillStyle='rgba(0,0,0,0.08)'; x.fillRect(0,f*fh+fh-3,w,3);
      for(let b=0;b<bays;b++){ x.fillStyle=win||'#2a3642'; x.fillRect(b*bw+bw*0.2,f*fh+fh*0.25,bw*0.6,fh*0.48); x.fillStyle='rgba(255,255,255,0.18)'; x.fillRect(b*bw+bw*0.2,f*fh+fh*0.25,bw*0.6,fh*0.08); } } });
  const q=mulberry32(floors*31+bays*7), em=apTex(W,H,function(x,w,h){ x.fillStyle='#000'; x.fillRect(0,0,w,h); const bw=w/bays, fh=h/floors;
    for(let f=0;f<floors;f++) for(let b=0;b<bays;b++){ if(q()<0.45) continue; x.fillStyle=q()<0.8?'#ffd894':'#cfe3ff'; x.fillRect(b*bw+bw*0.2,f*fh+fh*0.25,bw*0.6,fh*0.48); } });
  const m=new THREE.MeshLambertMaterial({map:t,emissiveMap:em,emissive:0x000000}); NIGHTMATS.push([m,0.85]); return (FACADE[k]=m); }
const NIGHTMATS=[];   /* [material, emissive strength at night] — lit windows after dark (47-daynight) */
function bldg(g,x,y,z,w,h,d,o){ o=o||{}; const M=apMats(), fl=o.floors||Math.max(1,Math.round(h/3.4)), wall=o.wall||'#e8e4da';
  const core=apBox(g,o.roof||M.roof,x,y-1,z,w,h+1,d);
  const fx=facadeMat(fl,Math.max(2,Math.round(w/4)),wall,o.win), fz=facadeMat(fl,Math.max(2,Math.round(d/4)),wall,o.win);
  [[0,d/2+0.05,0,w,fx],[0,-d/2-0.05,Math.PI,w,fx],[w/2+0.05,0,Math.PI/2,d,fz],[-w/2-0.05,0,-Math.PI/2,d,fz]].forEach(function(f){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(f[3],h),f[4]); p.position.set(x+f[0],y+h/2,z+f[1]); p.rotation.y=f[2]; g.add(p); });
  apBox(g,M.concD,x,y+h,z,w+0.4,0.5,d+0.4);
  wbAdd(core); const bb=rectWorld(g,x,z,w,d); navObst(bb[0],bb[1],bb[2],bb[3],y+h+0.5); return core; }
/* arched-roof warehouse along x */
function shed(g,x,y,z,len,wid,h,col){ const M=apMats(), mat=new THREE.MeshLambertMaterial({color:col||0x7d8b96});
  const wall=apBox(g,M.conc,x,y,z,len,h,wid); const rg=new THREE.CylinderGeometry(wid/2,wid/2,len,18,1,true,0,Math.PI); rg.rotateZ(Math.PI/2); rg.scale(1,0.45,1);
  const r=new THREE.Mesh(rg,mat); r.position.set(x,y+h,z); g.add(r);
  [-1,1].forEach(function(s){ const e=new THREE.Mesh(new THREE.CircleGeometry(wid/2,18,0,Math.PI),mat); e.scale.set(1,0.45,1); e.rotation.y=s*Math.PI/2; e.position.set(x+s*len/2,y+h,z); g.add(e);
    apBox(g,M.door,x+s*(len/2+0.05),y,z,0.1,h*0.8,wid*0.45); });
  for(let k=0;k<Math.floor(len/8);k++) apBox(g,M.dark,x-len/2+4+k*8,y+h*0.62,z+wid/2+0.05,3,1,0.1);
  wbAdd(wall); const bb=rectWorld(g,x,z,len,wid); navObst(bb[0],bb[1],bb[2],bb[3],y+h+wid*0.22); }
/* generic base gate in local frame: road along local z, outside towards local −z */
function baseGate(x,z,ang,y,text){
  const M=apMats(), st=new THREE.Group(), g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ang; st.add(g);
  apBox(g,M.conc,11,0,0,6,3.2,5); apBox(g,M.roof,11,3.2,0,6.6,0.35,5.6); apBox(g,M.glass,11,1.2,0,6.1,1.2,5.1);
  apBox(g,M.white,0,5.6,0,26,0.6,10); [-1,1].forEach(function(s){ [-1,1].forEach(function(t){ apCyl(g,M.white,s*12,0,t*4,0.25,0.25,5.6,10); }); });
  apBox(g,M.white,0,6.2,0,18.6,2.4,10.4);
  const sm=new THREE.MeshLambertMaterial({map:signTex(text,'#ffffff','#14365f',1024,128)});
  [[0,-5.25,Math.PI],[0,5.25,0]].forEach(function(p){ const s=new THREE.Mesh(new THREE.PlaneGeometry(18,2.2),sm); s.position.set(p[0],7.3,p[1]); s.rotation.y=p[2]; g.add(s); });
  [-1,1].forEach(function(s){ apBox(g,M.conc,s*7.2,0,0,0.8,0.9,9); const arm=new THREE.Mesh(new THREE.BoxGeometry(5.5,0.12,0.12),M.red); arm.position.set(s*4.2,1.0,s*2.5); arm.rotation.z=s*1.1; g.add(arm); });
  [-14,14].forEach(function(px){ apCyl(g,M.white,px,0,-8,0.1,0.14,11,8); const f=new THREE.Mesh(new THREE.PlaneGeometry(3,2),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); f.position.set(px+1.5,10,-8); g.add(f); });
  for(let k=-2;k<=2;k++) apBox(g,M.yel,k*2.4,0.05,-14,2.0,0.12,0.5);
  const box=new THREE.Box3(); const gh=g.children[0]; gh.updateMatrixWorld(true); box.setFromObject(gh); WALKBOX.push({x0:box.min.x,x1:box.max.x,z0:box.min.z,z1:box.max.z});
  navObst(box.min.x,box.max.x,box.min.z,box.max.z,y+4);
  return st;
}
/* chain-link fence along a polyline (posts on the ground), skipping points where skip(x,z) is true */
function fenceLine(pts,skip){
  const M=apMats(), path=[]; for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(L/4); for(let k=0;k<n;k++) path.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]); }
  path.push(pts[pts.length-1]);
  const keep=path.filter(function(p){ return !skip(p[0],p[1]); });
  const postG=new THREE.CylinderGeometry(0.06,0.06,2.9,6); postG.translate(0,1.45,0);
  const posts=new THREE.InstancedMesh(postG,M.metal,keep.length), mt=new THREE.Matrix4();
  keep.forEach(function(p,i){ mt.makeTranslation(p[0],groundH(p[0],p[1]),p[1]); posts.setMatrixAt(i,mt); }); posts.instanceMatrix.needsUpdate=true; scene.add(posts);
  if(!FENCE_MAT.m){ const link=apTex(64,64,function(x,W,H){ x.clearRect(0,0,W,H); x.strokeStyle='rgba(185,195,200,0.85)'; x.lineWidth=2; for(let i=-W;i<W*2;i+=8){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+H,H); x.stroke(); x.beginPath(); x.moveTo(i,H); x.lineTo(i+H,0); x.stroke(); } });
    link.wrapS=link.wrapT=THREE.RepeatWrapping; FENCE_MAT.m=new THREE.MeshLambertMaterial({map:link,transparent:true,alphaTest:0.3,side:THREE.DoubleSide}); FENCE_MAT.m.userData.flat=true; }
  const fp=[], fu=[], fi=[];
  for(let i=0;i<path.length-1;i++){ const a=path[i], b=path[i+1]; if(skip(a[0],a[1])||skip(b[0],b[1])) continue;
    const ya=groundH(a[0],a[1]), yb=groundH(b[0],b[1]), o=fp.length/3;
    fp.push(a[0],ya+0.15,a[1], b[0],yb+0.15,b[1], a[0],ya+2.5,a[1], b[0],yb+2.5,b[1]); fu.push(0,0, 1.6,0, 0,1, 1.6,1); fi.push(o,o+1,o+2, o+1,o+3,o+2);
    WALKBOX.push({x0:Math.min(a[0],b[0])-0.25,x1:Math.max(a[0],b[0])+0.25,z0:Math.min(a[1],b[1])-0.25,z1:Math.max(a[1],b[1])+0.25}); }
  const fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3)); fg.setAttribute('uv',new THREE.Float32BufferAttribute(fu,2)); fg.setIndex(fi); fg.computeVertexNormals();
  const fence=new THREE.Mesh(fg,FENCE_MAT.m); fence.userData.rs=false; fence.userData.cs=false; scene.add(fence);
}
const FENCE_MAT={};
function lampPost(g,M,x,y,z,h){ apCyl(g,M.metal,x,y,z,0.12,0.18,h||12,8); apBox(g,M.dark,x,y+(h||12),z,1.4,0.3,0.6); apBox(g,M.lamp,x,y+(h||12)-0.05,z,1.2,0.06,0.45); }
function placeShip(ship,x,z,ang,y){ const g=ship.group; g.position.set(x,y||0,z); g.rotation.y=ang; g.updateMatrixWorld(true); return g; }
function shipObst(g,top){ const b=new THREE.Box3().setFromObject(g); navObst(b.min.x,b.max.x,b.min.z,b.max.z,top==null?b.max.y:top,true); }

function buildNaval(){
  const M=apMats(), N=NAVAL, Y=N.y, r=mulberry32(515), st=new THREE.Group(), mt=new THREE.Matrix4(), q4=new THREE.Quaternion(), s3=new THREE.Vector3(), p3=new THREE.Vector3();
  const quayX=N.x0, cx=(N.x0+N.x1)/2, cz=(N.z0+N.z1)/2, fleet=new THREE.Group();
  /* ---- apron: concrete slab, its sea face is the quay wall */
  const qcx=(N.x0+N.qx1)/2, PY=PADS[0].y;
  apBox(st,M.concD,qcx,-8,cz,N.qx1-N.x0,Y+8,N.z1-N.z0);
  const apronTex=apTex(128,128,function(x,W,H){ x.fillStyle='#8a8e92'; x.fillRect(0,0,W,H); const q=mulberry32(12);
    for(let i=0;i<500;i++){ x.fillStyle='rgba(0,0,0,'+(q()*0.025)+')'; x.fillRect(q()*W,q()*H,2+q()*8,2+q()*8); }
    x.fillStyle='rgba(60,60,60,0.35)'; x.fillRect(0,0,W,1.5); x.fillRect(0,0,1.5,H); },[(N.qx1-N.x0)/8,(N.z1-N.z0)/8]);
  const apronMat=new THREE.MeshLambertMaterial({map:apronTex}); apronMat.userData.flat=true;
  const apronFor=function(w,l){ const t=apronTex.clone(); t.needsUpdate=true; t.repeat.set(w/8,l/8); const m=new THREE.MeshLambertMaterial({map:t}); m.userData.flat=true; return m; };
  const pierMat=apronFor(220,16), moleMat=apronFor(330,20);
  apRect(st,apronMat,N.x0,N.qx1,N.z0,N.z1,Y+0.02);
  DECKS.push({x0:N.x0,x1:N.qx1,z0:N.z0,z1:N.z1,y:Y});
  apBox(st,M.markY,quayX+3,Y+0.03,cz,0.3,0.02,N.z1-N.z0);                                                    // quay safety line
  /* inland: grass with asphalt roads, car park and the parade ground */
  const asph=new THREE.MeshLambertMaterial({color:0x4d5156,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); asph.userData.flat=true;
  [[N.qx1,N.x1,N.gate.z-5,N.gate.z+5],[-1695,-1685,N.z0+10,N.z1-10],[N.qx1,N.x1,-3705,-3695],[N.qx1,N.x1,-4085,-4075],[N.qx1,-1695,-3205,-3195],
   [-1680,-1612,-3635,-3605]].forEach(function(q){ apRect(st,asph,q[0],q[1],q[2],q[3],PY+0.05); });
  for(let x=N.qx1+6;x<N.x1-6;x+=12){ apBox(st,M.mark,x,PY+0.06,N.gate.z,6,0.02,0.25); apBox(st,M.mark,x,PY+0.06,-3700,6,0.02,0.25); apBox(st,M.mark,x,PY+0.06,-4080,6,0.02,0.25); }
  for(let z=N.z0+16;z<N.z1-16;z+=12) apBox(st,M.mark,-1690,PY+0.06,z,0.25,0.02,6);
  for(let x=-1676;x<-1614;x+=4) apBox(st,M.mark,x,PY+0.06,-3620,0.15,0.02,5);
  /* ---- piers on piles */
  const piles=[];
  N.piers.forEach(function(pz,i){ const x0=quayX-220, x1=quayX, w=16;
    apBox(st,M.conc,(x0+x1)/2,Y-1.3,pz,x1-x0,1.3,w); apRect(st,pierMat,x0,x1,pz-w/2,pz+w/2,Y+0.02);
    DECKS.push({x0:x0,x1:x1+1,z0:pz-w/2,z1:pz+w/2,y:Y});
    for(let x=x0+4;x<x1;x+=12) [-w/2+1.5,0,w/2-1.5].forEach(function(dz){ piles.push([x,pz+dz]); });
    for(let x=x0+6;x<x1;x+=15) [-1,1].forEach(function(s){ apCyl(st,M.dark,x,Y,pz+s*(w/2-0.7),0.3,0.38,0.8,8);
      const f=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,3.2,10),M.tire); f.position.set(x+3,Y-1.6,pz+s*(w/2+0.4)); st.add(f); });
    for(let x=x0+10;x<x1;x+=45) lampPost(st,M,x,Y,pz,10);
    apBox(st,M.markY,(x0+x1)/2,Y+0.03,pz-w/2+0.6,x1-x0,0.02,0.2); apBox(st,M.markY,(x0+x1)/2,Y+0.03,pz+w/2-0.6,x1-x0,0.02,0.2);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.2),new THREE.MeshLambertMaterial({map:signTex((i+1)+'. İSKELE','#14365f','#ffffff',512,96)}));
    sg.position.set(x1+0.3,Y+3,pz); sg.rotation.y=Math.PI/2; st.add(sg); apCyl(st,M.metal,x1+0.4,Y,pz-2.6,0.08,0.08,3.6,6); apCyl(st,M.metal,x1+0.4,Y,pz+2.6,0.08,0.08,3.6,6); });
  const pileG=new THREE.CylinderGeometry(0.55,0.55,10,8); pileG.translate(0,-4,0); const pi=new THREE.InstancedMesh(pileG,M.concD,piles.length);
  piles.forEach(function(p,i){ mt.makeTranslation(p[0],0,p[1]); pi.setMatrixAt(i,mt); }); pi.instanceMatrix.needsUpdate=true; scene.add(pi);
  /* quay fenders and bollards along the wall */
  for(let z=N.z0+10;z<N.z1-5;z+=15){ if(N.piers.some(function(pz){ return Math.abs(z-pz)<10; })) continue;
    const f=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,3.2,10),M.tire); f.position.set(quayX-0.5,Y-1.7,z); st.add(f); apCyl(st,M.dark,quayX+1.2,Y,z+5,0.3,0.38,0.8,8); }
  /* ---- mole (solid quay) to the south, with TCG Anadolu alongside */
  { const x0=quayX-330, x1=quayX, w=20; apBox(st,M.concD,(x0+x1)/2,-8,N.mole,x1-x0,Y+8,w); apRect(st,moleMat,x0,x1,N.mole-w/2,N.mole+w/2,Y+0.02);
    DECKS.push({x0:x0,x1:x1+1,z0:N.mole-w/2,z1:N.mole+w/2,y:Y});
    for(let x=x0+6;x<x1;x+=18){ apCyl(st,M.dark,x,Y,N.mole+w/2-0.8,0.32,0.4,0.8,8); apCyl(st,M.dark,x,Y,N.mole-w/2+0.8,0.32,0.4,0.8,8); }
    for(let x=x0+15;x<x1;x+=50) lampPost(st,M,x,Y,N.mole,12);
    apBox(st,M.markY,(x0+x1)/2,Y+0.03,N.mole+w/2-0.6,x1-x0,0.02,0.2); }
  /* ---- breakwater: rubble mound with a crown wall; entrance between its south tip and the mole head */
  const rockArm=[], arms=[[quayX,N.z0+10,quayX-470,N.z0+10],[quayX-470,N.z0+10,quayX-470,N.mole-150]];
  arms.forEach(function(a){ const len=Math.hypot(a[2]-a[0],a[3]-a[1]), along=Math.abs(a[2]-a[0])>1;
    const geo=taperBoxZ(len+30,13,34,0.3), m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0x8d8a83})); m.position.set((a[0]+a[2])/2,-8.5,(a[1]+a[3])/2); if(!along) m.rotation.y=Math.PI/2; st.add(m);
    apBox(st,M.conc,(a[0]+a[2])/2,4.4,(a[1]+a[3])/2,along?len+20:5,1.6,along?5:len+20);
    for(let d=0;d<len;d+=3.2){ for(let k=0;k<4;k++){ const s=k<2?-1:1, off=7+r()*7, t=d+r()*3; const x=a[0]+(a[2]-a[0])*t/len, z=a[1]+(a[3]-a[1])*t/len;
      rockArm.push([along?x:x+s*off,1.5+(14-off)*0.32+r()*0.6,along?z+s*off:z,1.4+r()*1.2]); } } });
  const ri=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xa09b90,flatShading:true}),rockArm.length);
  rockArm.forEach(function(t,i){ mt.compose(p3.set(t[0],t[1],t[2]),q4.setFromEuler(new THREE.Euler(i*0.7,i*1.3,i*0.4)),s3.set(t[3],t[3]*0.75,t[3])); ri.setMatrixAt(i,mt); });
  ri.instanceMatrix.needsUpdate=true; scene.add(ri);
  const entrance=[[quayX-470,N.mole-150,M.redL],[quayX-330,N.mole,new THREE.MeshBasicMaterial({color:0x22ff66})]]; entrance[1][2].userData.glow=4;
  entrance.forEach(function(e){ apCyl(st,M.white,e[0],Y+1,e[1],1.4,1.6,8,12); apCyl(st,e[2]===M.redL?M.red:new THREE.MeshLambertMaterial({color:0x1f9a48}),e[0],Y+3,e[1],1.45,1.65,2.4,12);
    const l=new THREE.Mesh(new THREE.SphereGeometry(0.5,10,8),e[2]); l.position.set(e[0],Y+9.5,e[1]); scene.add(l); navObst(e[0]-2,e[0]+2,e[1]-2,e[1]+2,Y+10); });
  /* ---- submarine pen at the north end of the quay */
  { const x0=quayX-140, x1=quayX, z0=N.z0+30, z1=N.z0+110, pm=M.concD;
    [z0,z1].forEach(function(z){ apBox(st,pm,(x0+x1)/2,-4,z,x1-x0,22,4); }); apBox(st,pm,(x0+x1)/2,16,(z0+z1)/2,x1-x0+4,3,z1-z0+4);
    apBox(st,M.dark,(x0+x1)/2,-4,(z0+z1)/2,x1-x0,0.2,z1-z0-4).position.y=13.5;
    apBox(st,pm,x0+1,10,(z0+z1)/2,2,6,z1-z0);
    navObst(x0,x1,z0-2,z1+2,19,true);
    const sub=buildSub(); fleet.add(placeShip(sub,(x0+x1)/2+6,(z0+z1)/2,Math.PI/2)); }
  /* ---- ships at the piers */
  const P=N.piers, fl=[];
  fl.push([buildFrigate('istif','F-515'),quayX-108,P[0]-8-7.2-2]);
  fl.push([buildFrigate('ada','F-511'),quayX-100,P[0]+8+7.2+2]);
  fl.push([buildFrigate('ada','F-512'),quayX-100,P[1]-8-7.2-2]);
  fl.push([buildPatrol('P-1200'),quayX-160,P[1]+8+4.5+1.5]);
  fl.push([buildPatrol('P-1201'),quayX-90,P[1]+8+4.5+1.5]);
  fl.push([buildTug(),quayX-60,P[2]-8-5-1.5]);
  fl.push([buildFrigate('ada','F-513'),quayX-100,P[2]+8+7.2+2]);
  fl.forEach(function(f){ fleet.add(placeShip(f[0],f[1],f[2],Math.PI/2)); shipObst(f[0].group); });
  const an=buildAnadolu(); placeShip(an,quayX-175,N.mole+10+16+2,Math.PI/2);
  const deckG=new THREE.Group(); deckG.position.copy(an.group.position); deckG.rotation.copy(an.group.rotation); const tbs=[];
  ['tb3','tb3','tb3'].forEach(function(id,k){ try{ const m=buildModel(id); if(m.flames) m.flames.forEach(function(f){ f.visible=false; }); if(m.strobe) m.strobe.visible=false;
    m.group.position.set(-9+k*0.5,an.deckY+1.22,-40+k*22); m.group.rotation.y=0.4; deckG.add(m.group); tbs.push(m); }catch(e){} });
  deckG.updateMatrixWorld(true); scene.add(bakeGroup(deckG)); tbs.forEach(function(m){ untrackModel(m); });
  fleet.add(an.group); shipObst(an.group,an.deckY);
  navObst(an.group.position.x-15,an.group.position.x+20,an.group.position.z-16,an.group.position.z-6,an.deckY+30,true);
  /* ---- floating dock with a corvette on blocks */
  { const dx=quayX-410, dz0=N.z0+90, dz1=dz0+170, w=40, g=new THREE.Group(), dm=new THREE.MeshLambertMaterial({color:0x6f7a84});
    apBox(g,dm,dx,-6,(dz0+dz1)/2,w,7.5,dz1-dz0);
    [-1,1].forEach(function(s){ apBox(g,dm,dx+s*(w/2-2.5),1.5,(dz0+dz1)/2,5,11,dz1-dz0); apBox(g,M.red,dx+s*(w/2-2.5),12.5,(dz0+dz1)/2,5.2,0.6,dz1-dz0);
      for(let z=dz0+10;z<dz1;z+=30) lampPost(g,M,dx+s*(w/2-2.5),13.1,z,6); });
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(26,3),new THREE.MeshLambertMaterial({map:signTex('YÜZER HAVUZ','#6f7a84','#ffffff',1024,128)})); sg.position.set(dx-w/2-0.05,8,(dz0+dz1)/2); sg.rotation.y=-Math.PI/2; g.add(sg);
    for(let z=dz0+25;z<dz1-25;z+=8) apBox(g,M.door,dx,1.5,z,2,1.2,1.2);
    /* jib cranes on the walls */
    [[-1,dz0+40],[1,dz1-50]].forEach(function(c){ const x=dx+c[0]*(w/2-2.5); apBox(g,M.yel,x,13,c[1],3,14,3); apBox(g,M.yel,x-c[0]*9,27,c[1],26,1.6,1.6); apBox(g,M.dark,x+c[0]*4,25,c[1],4,3,3);
      beam(g,M.dark,[x-c[0]*20,27,c[1]],[x-c[0]*20,16,c[1]],0.05); });
    bakeInto(g); navObst(dx-w/2,dx+w/2,dz0,dz1,41,true);
    const cv=buildFrigate('ada','F-514'); placeShip(cv,dx,(dz0+dz1)/2,0,2.7+3.9); fleet.add(cv.group); }
  bakeInto(fleet);
  /* ---- portal cranes on the quay (jibs slew slowly) */
  [N.z0+200,N.z0+430,N.z0+640].forEach(function(z,k){ const g=new THREE.Group(), x=quayX+10; g.position.set(x,Y,z);
    [[-8,-5],[-8,5],[8,-5],[8,5]].forEach(function(p){ apBox(g,M.yel,p[0],0,p[1],1.2,12,1.2); }); apBox(g,M.yel,0,12,0,18,1.6,12);
    apCyl(g,M.yel,0,13.6,0,1.8,2.2,9,12);
    const rot=new THREE.Group(); rot.position.y=22.6; g.add(rot);
    apBox(rot,M.white,2,0,0,9,5,6); apBox(rot,M.dark,7,0,0,3,3.5,5); apBox(rot,M.glass,-2.6,1.2,2.5,2.2,2,1.6);
    const jib=new THREE.Mesh(new THREE.BoxGeometry(34,1.2,1.4),M.yel); jib.geometry.translate(-17,0,0); jib.position.set(-1,3,0); jib.rotation.z=-0.32; rot.add(jib);
    beam(rot,M.dark,[-33,13.5,0],[-33,-6,0],0.06); apBox(rot,M.dark,-33,-7.2,0,1.2,1,1.2);
    g.remove(rot); scene.add(bakeGroup(g)); rot.position.set(0,0,0); const rb=bakeGroup(rot); rb.position.set(x,Y+22.6,z); rb.rotation.y=k*0.6; scene.add(rb); N.cranes.push({g:rb,a:k*0.6,ph:k*1.7});
    navObst(x-9,x+9,z-6,z+6,Y+28,true); });
  /* ---- buildings */
  const bg=new THREE.Group(), by=PY;
  /* HQ */
  bldg(bg,-1590,by,-3560,64,11,16,{floors:3,wall:'#efe9dc'}); bldg(bg,-1614,by,-3530,16,11,44,{floors:3,wall:'#efe9dc'});
  apBox(bg,M.white,-1590,by,-3548,10,4.5,3); apBox(bg,M.white,-1590,by+4.5,-3548,12,0.5,4.5);
  { const hs=new THREE.Mesh(new THREE.PlaneGeometry(30,2.4),new THREE.MeshLambertMaterial({map:signTex('DENİZ ÜSSÜ KOMUTANLIĞI','#14365f','#ffffff',1024,96)})); hs.position.set(-1590,by+13.1,-3551.7); bg.add(hs);
    const hs2=hs.clone(); hs2.rotation.y=Math.PI; hs2.position.z=-3568.3; bg.add(hs2); }
  /* parade ground, flag and anchor monument */
  apRect(bg,new THREE.MeshLambertMaterial({color:0x6c7278,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),-1640,-1580,-3512,-3480,by+0.04);
  apCyl(bg,M.white,-1590,by,-3495,0.15,0.22,22,10);
  const bigFlag=new THREE.Mesh(new THREE.PlaneGeometry(7.5,5),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); bigFlag.position.set(-1586.2,by+19,-3495); bg.add(bigFlag);
  { const ax=-1630, az=-3495, am=M.dark; apBox(bg,M.conc,ax,by,az,6,1.2,6); apBox(bg,am,ax,by+1.2,az,0.7,9,0.7); apBox(bg,am,ax,by+9,az,4,0.6,0.7);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.22,8,16),am); ring.position.set(ax,by+11,az); bg.add(ring);
    const arc=new THREE.Mesh(new THREE.TorusGeometry(3.4,0.35,8,20,Math.PI),am); arc.rotation.z=Math.PI; arc.position.set(ax,by+4.4,az); bg.add(arc);
    [-1,1].forEach(function(s){ const f=new THREE.Mesh(new THREE.ConeGeometry(0.7,1.6,4),am); f.position.set(ax+s*3.4,by+5,az); f.rotation.z=s*0.6; bg.add(f); }); }
  /* barracks */
  [-3900,-3965,-4030].forEach(function(z){ bldg(bg,-1565,by,z,52,9.5,14,{floors:3,wall:'#e9e2d0'}); });
  /* mess hall, clinic */
  bldg(bg,-1650,by,-3760,30,6,22,{floors:1,wall:'#e4e0d6'}); bldg(bg,-1560,by,-3760,24,7,18,{floors:2,wall:'#f2f2f2'});
  { const cr=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshLambertMaterial({map:apTex(64,64,function(x,W,H){ x.fillStyle='#fff'; x.fillRect(0,0,W,H); x.fillStyle='#d01818'; x.beginPath(); x.arc(W*0.5,H*0.5,W*0.33,0.6,5.7); x.arc(W*0.6,H*0.5,W*0.26,5.4,0.9,true); x.fill(); })}));
    cr.position.set(-1560,by+5.5,-3750.9); bg.add(cr); }
  /* warehouses between the piers, containers, workshop */
  [N.z0+105,N.z0+330,N.z0+530,N.z0+750].forEach(function(z,k){ shed(bg,-1870,Y,z,44,24,9,[0x7d8b96,0x6f8796,0x7d8b96,0x8a96a0][k]); });
  const cc=[0xb5432f,0x2f6aa5,0x3f8a4a,0xd4a12c,0x8a8f96,0xe2e2e2], cg=new THREE.BoxGeometry(12.2,2.6,2.45), boxes=[];
  for(let k=0;k<54;k++){ const col=k%9, row=Math.floor(k/9)%3, lay=Math.floor(k/27); if(r()<0.25) continue; boxes.push([-1810+row*2.7,Y+1.3+lay*2.6,N.z0+280+col*13.5,cc[Math.floor(r()*cc.length)]]); }
  cc.forEach(function(c){ const L=boxes.filter(function(b){ return b[3]===c; }); if(!L.length) return; const im=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:c}),L.length);
    L.forEach(function(b,i){ mt.compose(p3.set(b[0],b[1],b[2]),q4.setFromAxisAngle(UP,Math.PI/2),s3.set(1,1,1)); im.setMatrixAt(i,mt); }); im.instanceMatrix.needsUpdate=true; scene.add(im); });
  WALKBOX.push({x0:-1813,x1:-1801,z0:N.z0+272,z1:N.z0+394}); navObst(-1813,-1801,N.z0+272,N.z0+394,Y+5.2);
  { const wx=-1790, wz=N.z0+40; bldg(bg,wx,Y,wz,60,15,32,{floors:2,wall:'#cfd6db'});
    const ms=new THREE.Mesh(new THREE.PlaneGeometry(26,3.4),new THREE.MeshLambertMaterial({map:signTex('MAVİ KANATLAR TERSANESİ','#cfd6db','#14365f',1024,128)})); ms.position.set(wx-30.1,Y+11,wz); ms.rotation.y=-Math.PI/2; bg.add(ms); }
  /* fuel farm with bund wall */
  { const fx=-1630, fz=-3215; apBox(bg,M.concD,fx,by,fz-34,90,1.2,0.6); apBox(bg,M.concD,fx,by,fz+34,90,1.2,0.6); apBox(bg,M.concD,fx-45,by,fz,0.6,1.2,68); apBox(bg,M.concD,fx+45,by,fz,0.6,1.2,68);
    [[-24,-14],[0,-14],[24,-14],[-24,14],[0,14],[24,14]].forEach(function(p){ apCyl(bg,M.tank,fx+p[0],by,fz+p[1],8.5,8.5,11,22); apCyl(bg,M.metal,fx+p[0],by+11,fz+p[1],1.5,8.6,1.2,22); });
    WALKBOX.push({x0:fx-45,x1:fx+45,z0:fz-34,z1:fz+34}); navObst(fx-45,fx+45,fz-34,fz+34,by+12.2); }
  /* helipad with a small hangar */
  { const hx=-1720, hz=-3360, pm=new THREE.MeshLambertMaterial({color:0x5c6166,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); pm.userData.flat=true;
    const pad=new THREE.Mesh(new THREE.CircleGeometry(16,32),pm); pad.rotation.x=-Math.PI/2; pad.position.set(hx,by+0.04,hz); bg.add(pad);
    const ring=new THREE.Mesh(new THREE.RingGeometry(12,13,40),M.markY); ring.rotation.x=-Math.PI/2; ring.position.set(hx,by+0.06,hz); bg.add(ring);
    apBox(bg,M.mark,hx-3,by+0.05,hz,1.2,0.02,10); apBox(bg,M.mark,hx+3,by+0.05,hz,1.2,0.02,10); apBox(bg,M.mark,hx,by+0.05,hz,6,0.02,1.2);
    shed(bg,hx+38,by,hz,30,22,8,0x6f7a84); }
  /* radar / communications mast and water tower */
  { const mx=-1540, mz=N.z0+45, g=new THREE.Group(), H=42;
    const pts=[[-3,-3],[3,-3],[3,3],[-3,3]];
    pts.forEach(function(p){ beam(g,M.red,[mx+p[0],PY,mz+p[1]],[mx+p[0]*0.25,PY+H,mz+p[1]*0.25],0.2); });
    for(let h=0;h<H;h+=6){ const a=1-h/H*0.75, b=1-(h+6)/H*0.75;
      for(let i=0;i<4;i++){ const p=pts[i], q=pts[(i+1)%4]; beam(g,(Math.floor(h/6)%2)?M.white:M.red,[mx+p[0]*a,PY+h,mz+p[1]*a],[mx+q[0]*b,PY+h+6,mz+q[1]*b],0.07); beam(g,M.metal,[mx+p[0]*b,PY+h+6,mz+p[1]*b],[mx+q[0]*b,PY+h+6,mz+q[1]*b],0.07); } }
    apBox(g,M.white,mx,PY+H,mz,2.4,0.5,2.4); bakeInto(g);
    const rd=new THREE.Group(); rd.position.set(mx,PY+H+0.5,mz); apBox(rd,M.dark,0,0.4,0,7,1.4,0.5); apCyl(rd,M.metal,0,0,0,0.3,0.3,0.6,8); scene.add(rd); N.radars.push(rd);
    navObst(mx-4,mx+4,mz-4,mz+4,PY+H+2); WALKBOX.push({x0:mx-3.2,x1:mx+3.2,z0:mz-3.2,z1:mz+3.2});
    const tx=-1530, tz=N.z0+130; apCyl(bg,M.conc,tx,by,tz,1.6,2.2,20,12); apCyl(bg,M.white,tx,by+20,tz,6,3,4,16); apCyl(bg,M.white,tx,by+24,tz,6,6,3,16); apCyl(bg,M.roof,tx,by+27,tz,0.5,6.2,1.8,16);
    navObst(tx-6,tx+6,tz-6,tz+6,by+29); WALKBOX.push({x0:tx-2.2,x1:tx+2.2,z0:tz-2.2,z1:tz+2.2}); }
  /* apron light masts */
  for(let z=N.z0+60;z<N.z1-30;z+=140){ lampPost(bg,M,-1930,Y,z,18); lampPost(bg,M,-1700,PY,z+60,12); }
  /* vehicles: trucks, cars, a bus at the HQ car park */
  [[vehTruck('cargo'),-1785,-3600,0],[vehTruck('cargo'),-1800,-3600,0],[vehTruck('fuel'),-1940,P[0]+30,Math.PI/2],[vehBus(),-1660,-3620,Math.PI/2],
   [vehCar('pickup'),-1630,-3620,0],[vehCar(),-1625,-3620,0],[vehCar(),-1620,-3620,0],[vehCar('pickup'),-1640,-3622,0],[vehTug(),-1930,N.mole-20,0.4]].forEach(function(v){
    v[0].position.set(v[1],(v[1]<N.qx1?Y:PY)+0.02,v[2]); v[0].rotation.y=v[3]; bg.add(v[0]); wbAdd(v[0]); });
  bakeInto(bg);
  /* ---- fence around the land side, gate on the east with the road from the village */
  const G=N.gate, gateGap=function(x,z){ return Math.abs(x-G.x)<1&&Math.abs(z-G.z)<9; };
  fenceLine([[N.x0+2,N.z0+2],[N.x1-1,N.z0+2],[N.x1-1,N.z1-2],[N.x0+2,N.z1-2]],function(x,z){ return gateGap(x,z)||(Math.abs(x-(N.x1-1))<1&&Math.abs(z-G.z)<9); });
  bakeInto(baseGate(G.x+6,G.z,-Math.PI/2,PY,'AY YILDIZ DENİZ ÜSSÜ'));
  const roadMat=new THREE.MeshLambertMaterial({map:apTex(32,64,function(x,W,H){ x.fillStyle='#55595e'; x.fillRect(0,0,W,H); x.fillStyle='rgba(235,235,225,0.9)'; x.fillRect(W/2-1,0,2,H*0.5); x.fillRect(0,0,1,H); x.fillRect(W-1,0,1,H); })});
  roadMat.map.wrapT=THREE.RepeatWrapping; roadMat.userData.flat=true;
  terrainRibbon(N.road.filter(function(p){ return p[0]>N.x1-2; }),8,0.3,roadMat);
  for(let z=N.z0+20;z<N.z1-15;z+=22){ if([N.gate.z,-3700,-4080,-3200].some(function(c){ return Math.abs(z-c)<14; })) continue; [-1,1].forEach(function(s){ TREE_EXTRA.push([-1690+s*10,PY,z,0.7+r()*0.3,1]); }); }
  for(let x=N.qx1+20;x<N.x1-10;x+=20){ if(Math.abs(x+1690)<14) continue; [-1,1].forEach(function(s){ TREE_EXTRA.push([x,PY,N.gate.z+s*10,0.7+r()*0.3,1]); }); }
  N.road.forEach(function(p,i){ if(i%6||i<4||p[0]<N.x1+20) return; [-1,1].forEach(function(s){ const x=p[0], z=p[1]+s*11; if(r()<0.35) return; TREE_EXTRA.push([x,terrainH(x,z),z,0.8+r()*0.3,1]); }); });
  bakeInto(st); clearTreesNear(N.road,14);
  /* ---- patrol boat sailing in the bay */
  const pb=buildPatrol('P-1203'); const pg=bakeGroup(pb.group); const boat=new THREE.Group(); boat.add(pg);
  const wake=new THREE.Mesh(new THREE.PlaneGeometry(14,90),new THREE.MeshBasicMaterial({map:apTex(32,128,function(x,W,H){ x.clearRect(0,0,W,H); const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(255,255,255,0.75)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g;
    x.beginPath(); x.moveTo(W*0.4,0); x.lineTo(W*0.6,0); x.lineTo(W,H); x.lineTo(0,H); x.closePath(); x.fill(); }),transparent:true,depthWrite:false}));
  wake.rotation.x=-Math.PI/2; wake.position.set(0,0.2,28+45); wake.userData.rs=false; wake.userData.cs=false; boat.add(wake);
  scene.add(boat); N.boat=boat; N.built=true;
}
/* bake a group into a few meshes per material and add them to the scene */
function bakeInto(g){ g.updateMatrixWorld(true); const b=bakeGroup(g); b.children.slice().forEach(function(m){ scene.add(m); }); g.traverse(function(o){ if(o.isMesh&&o.geometry) o.geometry.dispose(); }); return b; }
const TREE_EXTRA=[];
/* hide island trees (04-terrain instanced cones) standing on a road */
function clearTreesNear(path,d){ const T0=GFX.trees; if(!T0) return; const m=new THREE.Matrix4(), p=new THREE.Vector3(), z0=new THREE.Matrix4().makeScale(0,0,0);
  let x0=1e9,x1=-1e9,zA=1e9,zB=-1e9; path.forEach(function(q){ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); zA=Math.min(zA,q[1]); zB=Math.max(zB,q[1]); });
  for(let i=0;i<GFX.treeN;i++){ T0.getMatrixAt(i,m); p.setFromMatrixPosition(m); if(p.x<x0-d||p.x>x1+d||p.z<zA-d||p.z>zB+d) continue;
    for(let k=0;k<path.length;k+=2){ if(Math.abs(path[k][0]-p.x)<d&&Math.abs(path[k][1]-p.z)<d){ T0.setMatrixAt(i,z0); break; } } }
  T0.instanceMatrix.needsUpdate=true; }
function navalStep(dt){
  if(!NAVAL.built) return;
  NAVAL.cranes.forEach(function(c){ c.g.rotation.y=c.a+Math.sin(T*0.05+c.ph)*0.9; });
  NAVAL.radars.forEach(function(r){ if(r) r.rotation.y+=dt*2.2; });
  const b=NAVAL.boat; if(b){ NAVAL.boatT+=dt*7/2300; const a=NAVAL.boatT*Math.PI*2, cx=-3150, cz=-3600, rx=500, rz=1050;
    const x=cx+Math.cos(a)*rx, z=cz+Math.sin(a)*rz, vx=-Math.sin(a)*rx, vz=Math.cos(a)*rz; b.position.set(x,Math.sin(T*1.3)*0.15,z); b.rotation.set(Math.sin(T*0.9)*0.02,Math.atan2(-vx,-vz),Math.sin(T*1.1)*0.03); }
}
