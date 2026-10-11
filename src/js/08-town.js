/* ------------------------------------------------------------------ Hilalkent: coastal town on the north-west shore (pad 'town'),
   across the bay from the naval base; road east to the land-base road; road traffic on every island road. */
const TOWN={x0:-9300,x1:-7100,z0:-7350,z1:-6760,y:16, road:null, streets:[], built:false};
TOWN.road=smoothPath([[70,-5100],[-250,-5900],[-900,-6650],[-1800,-7120],[-3000,-7170],[-4500,-7060],[-6000,-7060],[-6800,-7070],[-7100,-7080],[-7180,-7080]],6);
EXTRA_ROADS.push(TOWN.road);
function clockTower(g,M,x,y,z){ const st=new THREE.MeshLambertMaterial({color:0xcdbb98});
  apBox(g,st,x,y,z,6,2,6); apBox(g,st,x,y+2,z,5,20,5); apBox(g,st,x,y+22,z,6,1,6);
  const face=new THREE.MeshLambertMaterial({map:apTex(128,128,function(c,W,H){ c.fillStyle='#cdbb98'; c.fillRect(0,0,W,H); c.fillStyle='#f8f4ea'; c.beginPath(); c.arc(64,64,54,0,6.3); c.fill();
    c.strokeStyle='#222'; c.lineWidth=4; c.beginPath(); c.arc(64,64,54,0,6.3); c.stroke(); for(let i=0;i<12;i++){ const a=i/12*6.283; c.fillStyle='#222'; c.fillRect(64+Math.cos(a)*44-3,64+Math.sin(a)*44-3,6,6); }
    c.lineWidth=6; c.beginPath(); c.moveTo(64,64); c.lineTo(64,26); c.stroke(); c.lineWidth=5; c.beginPath(); c.moveTo(64,64); c.lineTo(92,74); c.stroke(); })});
  [[0,2.52,0],[0,-2.52,Math.PI],[2.52,0,Math.PI/2],[-2.52,0,-Math.PI/2]].forEach(function(f){ const p=new THREE.Mesh(new THREE.PlaneGeometry(3.8,3.8),face); p.position.set(x+f[0],y+18,z+f[1]); p.rotation.y=f[2]; g.add(p); });
  const rf=new THREE.Mesh(new THREE.ConeGeometry(4.3,6,4),M.roof); rf.rotation.y=Math.PI/4; rf.position.set(x,y+26,z); g.add(rf);
  navObst(x-3,x+3,z-3,z+3,y+29); WALKBOX.push({x0:x-3,x1:x+3,z0:z-3,z1:z+3}); }
function bigMosque(g,M,x,y,z){ const w=new THREE.MeshLambertMaterial({color:0xf3efe6}), lead=new THREE.MeshLambertMaterial({color:0x8b98a3}), gold=new THREE.MeshLambertMaterial({color:0xd9b44a});
  apBox(g,w,x,y-1,z,30,13,30); apBox(g,w,x,y+12,z,22,3,22);
  const d=new THREE.Mesh(new THREE.SphereGeometry(11,28,14,0,Math.PI*2,0,Math.PI/2),lead); d.position.set(x,y+15,z); g.add(d);
  for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4, s=new THREE.Mesh(new THREE.SphereGeometry(3,14,8,0,Math.PI*2,0,Math.PI/2),lead); s.position.set(x+Math.cos(a)*14,y+12,z+Math.sin(a)*14); g.add(s); }
  apCyl(g,gold,x,y+26,z,0.1,0.1,2,6); const c=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,6,16,Math.PI*1.4),gold); c.position.set(x,y+28.6,z); g.add(c);
  [-1,1].forEach(function(s){ const mx=x+s*19, mz=z-13; apCyl(g,w,mx,y-1,mz,1.3,1.5,36,12); apCyl(g,w,mx,y+24,mz,2,1.6,0.9,12); apCyl(g,w,mx,y+31,mz,1.9,1.5,0.8,12); apCyl(g,w,mx,y+35,mz,1.1,1.1,2,12);
    const cn=new THREE.Mesh(new THREE.ConeGeometry(1.25,7,12),lead); cn.position.set(mx,y+40.5,mz); g.add(cn); apCyl(g,gold,mx,y+44,mz,0.05,0.05,1.4,6); navObst(mx-2,mx+2,mz-2,mz+2,y+45); });
  for(let k=0;k<7;k++) apBox(g,M.win,x-12+k*4,y+3,z+15.03,1.4,3.6,0.06);
  apBox(g,M.door,x,y-0.2,z+15.05,3,4.6,0.06);
  wbAdd(g.children[0]); navObst(x-15,x+15,z-15,z+15,y+27); }
function buildTown(){
  const M=apMats(), T0=TOWN, Y=T0.y, r=mulberry32(4242), g=new THREE.Group(), mt=new THREE.Matrix4();
  const asph=new THREE.MeshLambertMaterial({color:0x4d5156,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); asph.userData.flat=true;
  const walk=new THREE.MeshLambertMaterial({color:0xb4b0a6,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); walk.userData.flat=true;
  const plaza=new THREE.MeshLambertMaterial({color:0xc9b48f,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); plaza.userData.flat=true;
  const xs=[], zs=[-7320,-7160,-7000,-6840]; for(let x=-9200;x<=-7180;x+=224) xs.push(x);
  /* streets: E-W avenues, N-S streets, sidewalks; the seaside promenade is the southern avenue */
  zs.forEach(function(z,i){ apRect(g,walk,xs[0]-8,xs[xs.length-1]+8,z-9,z+9,Y+0.04); apRect(g,asph,xs[0]-6,xs[xs.length-1]+6,z-6,z+6,Y+0.06);
    for(let x=xs[0];x<xs[xs.length-1];x+=12) apBox(g,M.mark,x,Y+0.07,z,6,0.02,0.22); T0.streets.push([[xs[0],z],[xs[xs.length-1],z]]); });
  xs.forEach(function(x){ apRect(g,walk,x-7,x+7,zs[0]-9,zs[zs.length-1]+9,Y+0.045); apRect(g,asph,x-5,x+5,zs[0],zs[zs.length-1],Y+0.065); });
  T0.streets.push([[xs[4],zs[0]],[xs[4],zs[zs.length-1]]]);
  /* blocks */
  const walls=['#efe3cf','#e8d5c4','#dfe6ea','#f1e9d8','#e3d9e8','#f4e0c6'], plazaI=4, plazaJ=1, mosqueI=5, mosqueJ=1, schoolI=1, schoolJ=0, parkI=7, parkJ=1;
  for(let i=0;i<xs.length-1;i++) for(let j=0;j<zs.length-1;j++){
    const cx=(xs[i]+xs[i+1])/2, cz=(zs[j]+zs[j+1])/2, bw=224-16, bd=160-20;
    if(i===plazaI&&j===plazaJ){ apRect(g,plaza,cx-bw/2,cx+bw/2,cz-bd/2,cz+bd/2,Y+0.05); clockTower(g,M,cx,Y,cz);
      apCyl(g,M.conc,cx+40,Y,cz,6,6.5,0.8,24); apCyl(g,new THREE.MeshLambertMaterial({color:0x3a8fb8}),cx+40,Y+0.8,cz,5.4,5.4,0.05,24); apCyl(g,M.conc,cx+40,Y,cz,0.6,0.8,3,10);
      for(let k=0;k<10;k++){ const a=k/10*6.28; TREE_EXTRA.push([cx+Math.cos(a)*70,Y,cz+Math.sin(a)*48,0.7,1]); }
      const fp=new THREE.Mesh(new THREE.PlaneGeometry(3,2),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); apCyl(g,M.white,cx-40,Y,cz,0.12,0.18,16,8); fp.position.set(cx-38.5,Y+14.5,cz); g.add(fp); continue; }
    if(i===mosqueI&&j===mosqueJ){ bigMosque(g,M,cx,Y,cz+5); apRect(g,plaza,cx-40,cx+40,cz-35,cz+45,Y+0.05); continue; }
    if(i===parkI&&j===parkJ){ for(let k=0;k<40;k++) TREE_EXTRA.push([cx-bw/2+8+r()*(bw-16),Y,cz-bd/2+8+r()*(bd-16),0.6+r()*0.5,r()<0.3?0:1]);
      for(let k=0;k<8;k++) apBox(g,M.door,cx-60+k*16,Y,cz,2.2,0.5,0.6); continue; }
    if(i===schoolI&&j===schoolJ){ bldg(g,cx-40,Y,cz-30,70,10,16,{floors:3,wall:'#f3d9b1'});
      const s=new THREE.Mesh(new THREE.PlaneGeometry(24,2.4),new THREE.MeshLambertMaterial({map:signTex('HİLALKENT ORTAOKULU','#f3d9b1','#7a2a1a',1024,104)})); s.position.set(cx-40,Y+11.4,cz-21.9); g.add(s);
      const fm=new THREE.MeshLambertMaterial({color:0x4f8f37,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); fm.userData.flat=true; apRect(g,fm,cx-20,cx+90,cz+5,cz+60,Y+0.06); continue; }
    /* apartment blocks along the block edges, with shops at the avenue side */
    [[-1,-1],[0,-1],[1,-1],[-1,1],[0,1],[1,1]].forEach(function(q){ if(r()<0.1) return; const fl=4+Math.floor(r()*4), w=28+Math.floor(r()*3)*4, x=cx+q[0]*68, z=cz+q[1]*38;
      bldg(g,x,Y,z,w,fl*3.1,15,{floors:fl,wall:walls[Math.floor(r()*walls.length)]});
      if(q[1]>0){ const aw=new THREE.Mesh(new THREE.BoxGeometry(w-2,0.15,2.2),new THREE.MeshLambertMaterial({color:[0xc0392b,0x2e86c1,0x27ae60,0xd68910][Math.floor(r()*4)]})); aw.position.set(x,Y+3.2,z+8.4); aw.rotation.x=0.25; g.add(aw); }
      if(r()<0.5) apBox(g,M.tank,x+w*0.25,Y+fl*3.1+0.5,z,2.2,1.6,2.2); if(r()<0.6) apCyl(g,M.metal,x-w*0.3,Y+fl*3.1+0.5,z,0.05,0.05,3,5); });
    for(let k=0;k<4;k++) TREE_EXTRA.push([cx-80+k*53,Y,cz,0.55+r()*0.2,1]);
  }
  /* street lamps, promenade trees and benches, gas station, entrance sign */
  zs.forEach(function(z){ for(let x=xs[0]+30;x<xs[xs.length-1];x+=60) lampPost(g,M,x,Y,z-8,8); });
  for(let x=xs[0];x<xs[xs.length-1];x+=24){ TREE_EXTRA.push([x,Y,zs[3]+13,0.7,1]); apBox(g,M.door,x+12,Y,zs[3]+12,2.2,0.5,0.6); }
  apBox(g,M.white,zs[3]?xs[0]-6:0,Y,zs[3]+18,(xs[xs.length-1]-xs[0])+12,0.9,0.4).position.x=(xs[0]+xs[xs.length-1])/2;
  { const fx=-7150, fz=-7110; apBox(g,M.white,fx,Y+5,fz,22,0.6,12); apBox(g,M.red,fx,Y+5.6,fz,22.2,0.6,0.2); [-8,8].forEach(function(dx){ apCyl(g,M.metal,fx+dx,Y,fz,0.25,0.25,5,8); });
    [-4,4].forEach(function(dx){ apBox(g,M.red,fx+dx,Y,fz,1,1.8,0.8); }); bldg(g,fx+4,Y,fz-22,16,4,9,{floors:1,wall:'#f2f2f2'}); }
  { const s=new THREE.Mesh(new THREE.PlaneGeometry(8,2.4),new THREE.MeshLambertMaterial({map:signTex('HİLALKENT','#1d5aa8','#ffffff',512,128),side:THREE.DoubleSide}));
    s.position.set(-7000,terrainH(-7000,-7092)+2.8,-7092); s.rotation.y=Math.PI/2; g.add(s); apCyl(g,M.metal,-7000,terrainH(-7000,-7092),-7095.5,0.06,0.06,2.6,6); apCyl(g,M.metal,-7000,terrainH(-7000,-7092),-7088.5,0.06,0.06,2.6,6); }
  /* parked cars along the avenues (instanced) */
  const park=[]; zs.slice(0,3).forEach(function(z){ for(let x=xs[0]+8;x<xs[xs.length-1]-8;x+=7){ if(xs.some(function(sx){ return Math.abs(sx-x)<10; })) continue; [-1,1].forEach(function(s){ if(r()<0.4) park.push([x,z+s*4.6,s<0?Math.PI/2:-Math.PI/2]); }); } });
  carInstances(park.map(function(p){ return {x:p[0],y:Y+0.06,z:p[1],h:p[2]}; }),r);
  bakeInto(g);
  /* road from the land-base road to the town */
  const roadMat=new THREE.MeshLambertMaterial({map:apTex(32,64,function(x,W,H){ x.fillStyle='#55595e'; x.fillRect(0,0,W,H); x.fillStyle='rgba(235,235,225,0.9)'; x.fillRect(W/2-1,0,2,H*0.5); x.fillRect(0,0,1,H); x.fillRect(W-1,0,1,H); })});
  roadMat.map.wrapT=THREE.RepeatWrapping; roadMat.userData.flat=true;
  terrainRibbon(T0.road.filter(function(p){ return p[0]>T0.x1-4; }),8,0.3,roadMat);
  T0.road.forEach(function(p,i){ if(i%7||i<8||p[0]>-500) return; [-1,1].forEach(function(s){ if(r()<0.45) return; const x=p[0], z=p[1]+s*11; TREE_EXTRA.push([x,terrainH(x,z),z,0.8+r()*0.3,r()<0.6?0:1]); }); });
  clearTreesNear(T0.road,14); clearTreesNear([[T0.x0,T0.z0],[T0.x1,T0.z0],[T0.x1,T0.z1],[T0.x0,T0.z1]],400);
  T0.built=true;
}
/* ------------------------------------------------------------------ cars: shared instanced geometry (bodies take a per-instance colour) */
const CARGEO={};
function carGeos(){ if(CARGEO.body) return CARGEO;
  const b1=new THREE.BoxGeometry(1.8,0.7,4.3); b1.translate(0,0.6,0); const b2=new THREE.BoxGeometry(1.6,0.55,2.2); b2.translate(0,1.22,0.25);
  CARGEO.body=MK.merge([b1,b2]); const gl=new THREE.BoxGeometry(1.64,0.4,2.26); gl.translate(0,1.2,0.25); CARGEO.glass=gl;
  const ws=[]; [[-0.82,-1.35],[0.82,-1.35],[-0.82,1.35],[0.82,1.35]].forEach(function(p){ const w=new THREE.CylinderGeometry(0.32,0.32,0.24,10); w.rotateZ(Math.PI/2); w.translate(p[0],0.32,p[1]); ws.push(w); });
  CARGEO.wheel=MK.merge(ws); CARGEO.cols=[0xd8dde2,0x23272c,0xb0262a,0x2f5fa5,0xe8e8e8,0x8a8f95,0x3d6b3a,0xc79a2c,0x6a3d2a];
  return CARGEO; }
function carInstances(list,r){ const G=carGeos(), n=list.length, mt=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(1,1,1), p=new THREE.Vector3(), col=new THREE.Color();
  const body=new THREE.InstancedMesh(G.body,new THREE.MeshLambertMaterial({color:0xffffff}),n), glass=new THREE.InstancedMesh(G.glass,new THREE.MeshLambertMaterial({color:0x1d2a36}),n), wh=new THREE.InstancedMesh(G.wheel,new THREE.MeshLambertMaterial({color:0x1c1e20}),n);
  list.forEach(function(c,i){ mt.compose(p.set(c.x,c.y,c.z),q.setFromAxisAngle(UP,c.h),s); body.setMatrixAt(i,mt); glass.setMatrixAt(i,mt); wh.setMatrixAt(i,mt); col.setHex(G.cols[Math.floor((r?r():Math.random())*G.cols.length)]); body.setColorAt(i,col); });
  [body,glass,wh].forEach(function(m){ m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; m.frustumCulled=false; scene.add(m); });
  return {body:body,glass:glass,wheel:wh}; }
/* traffic: cars drive along every island road and the town streets, turning around at the ends */
const TRAFFIC={cars:[], mesh:null, paths:[]};
function pathOf(pts){ const L=[0]; for(let i=1;i<pts.length;i++) L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])); return {pts:pts,L:L,len:L[L.length-1]}; }
function buildTraffic(){
  const r=mulberry32(808), list=[ENV.road,NAVAL.road,LAND.road,TOWN.road,MARINA.road,SOUTH.road,[[SOUTH.bx,SOUTH.zN],[SOUTH.bx,SOUTH.zS],[SOUTH.bx,SOUTH.zS+30]]].concat(TOWN.streets.concat(SOUTH.streets).map(function(s){ return smoothPath(s,20); }));
  TRAFFIC.paths=list.filter(function(p){ return p&&p.length>1; }).map(pathOf);
  TRAFFIC.paths.forEach(function(P){ const n=Math.max(1,Math.min(6,Math.round(P.len/900))); for(let k=0;k<n;k++) TRAFFIC.cars.push({P:P,s:r()*P.len,dir:r()<0.5?1:-1,v:11+r()*7,i:0}); });
  TRAFFIC.mesh=carInstances(TRAFFIC.cars.map(function(){ return {x:0,y:-50,z:0,h:0}; }),r);
  trafficStep(0);
}
function trafficStep(dt){
  const T1=TRAFFIC; if(!T1.mesh) return; const mt=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(1,1,1), p=new THREE.Vector3();
  for(let k=0;k<T1.cars.length;k++){ const c=T1.cars[k], P=c.P; c.s+=c.dir*c.v*dt;
    if(c.s>P.len-3){ c.s=P.len-3; c.dir=-1; } else if(c.s<3){ c.s=3; c.dir=1; }
    while(c.i<P.L.length-2&&P.L[c.i+1]<c.s) c.i++; while(c.i>0&&P.L[c.i]>c.s) c.i--;
    const a=P.pts[c.i], b=P.pts[c.i+1], seg=P.L[c.i+1]-P.L[c.i]||1, u=(c.s-P.L[c.i])/seg, cx=a[0]+(b[0]-a[0])*u, cz=a[1]+(b[1]-a[1])*u;
    let fx=(b[0]-a[0])/seg*c.dir, fz=(b[1]-a[1])/seg*c.dir; const x=cx-fz*2.0, z=cz+fx*2.0;
    const y=Math.max(groundH(x,z),groundH(cx,cz))+0.3;
    mt.compose(p.set(x,y,z),q.setFromAxisAngle(UP,Math.atan2(-fx,-fz)),s);
    T1.mesh.body.setMatrixAt(k,mt); T1.mesh.glass.setMatrixAt(k,mt); T1.mesh.wheel.setMatrixAt(k,mt); }
  T1.mesh.body.instanceMatrix.needsUpdate=true; T1.mesh.glass.instanceMatrix.needsUpdate=true; T1.mesh.wheel.instanceMatrix.needsUpdate=true;
}
