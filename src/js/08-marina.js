/* ------------------------------------------------------------------ Hilal Marina (civil harbour, east shore of the base peninsula),
   beach on the south-east shore, ship traffic around the island (ferry to Hilalkent, cargo ships, tanker, fishing boats, yachts)
   and seagulls. The marina is built in a rotated frame (PADS 'marina'.fr): local +x points out to sea. */
const MARINA={fr:null, road:null, movers:[], gulls:null, gullD:[], built:false};
MARINA.fr=PADS.find(function(p){ return p.id==='marina'; }).fr;
MARINA.road=smoothPath([[-150,-1720],[300,-1765],[800,-1560],[1300,-960],[1700,-220],[1960,560],[2100,1000]].concat([frWorld(MARINA.fr,-250,0)]),6);
EXTRA_ROADS.push(MARINA.road);
/* a ship that follows a path: closed loop, or back and forth with a pause at each end */
function seaMover(ship,pts,speed,opt){ opt=opt||{}; const P=pathOf(pts), g=new THREE.Group(); g.add(bakeGroup(ship.group));
  if(opt.wake!==false){ const w=new THREE.Mesh(new THREE.PlaneGeometry(ship.L*0.35,ship.L*2),wakeMat()); w.rotation.x=-Math.PI/2; w.position.set(0,0.2,ship.L*0.5+ship.L); w.userData.rs=false; w.userData.cs=false; g.add(w); g.userData.wake=w; }
  scene.add(g); const m={g:g,P:P,s:(opt.s0||0)*P.len,v:speed,dir:1,loop:!!opt.loop,pause:0,wait:opt.wait||0,i:0,bob:Math.random()*6}; MARINA.movers.push(m); return m; }
let WAKEMAT=null;
function wakeMat(){ if(WAKEMAT) return WAKEMAT; WAKEMAT=new THREE.MeshBasicMaterial({map:apTex(32,128,function(x,W,H){ x.clearRect(0,0,W,H); const gr=x.createLinearGradient(0,0,0,H); gr.addColorStop(0,'rgba(255,255,255,0.7)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr;
  x.beginPath(); x.moveTo(W*0.4,0); x.lineTo(W*0.6,0); x.lineTo(W,H); x.lineTo(0,H); x.closePath(); x.fill(); }),transparent:true,depthWrite:false}); return WAKEMAT; }
function loopPts(cx,cz,rx,rz,n){ const o=[]; for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2; o.push([cx+Math.cos(a)*rx,cz+Math.sin(a)*rz]); } return o; }
function buildMarina(){
  const M=apMats(), S=shipMats(), fr=MARINA.fr, Y=3.1, PY=2.7, r=mulberry32(5150);
  const g=new THREE.Group(); g.position.set(fr.cx,0,fr.cz); g.rotation.y=-fr.a; g.updateMatrixWorld(true);
  const boats=new THREE.Group(); boats.position.copy(g.position); boats.rotation.copy(g.rotation);
  const deck=function(x0,x1,z0,z1,y){ DECKS.push({fr:fr,x0:x0,x1:x1,z0:z0,z1:z1,y:y}); };
  /* quay apron and its sea wall */
  const apronMat=new THREE.MeshLambertMaterial({map:apTex(64,64,function(x,W,H){ x.fillStyle='#8f8a82'; x.fillRect(0,0,W,H); x.fillStyle='rgba(60,50,40,0.25)'; x.fillRect(0,0,W,1.5); x.fillRect(0,0,1.5,H); },[100/4,520/4])}); apronMat.userData.flat=true;
  apBox(g,M.concD,-10,-6,-10,100,Y+6,520); apRect(g,apronMat,-60,40,-270,250,Y+0.02); deck(-60,40.5,-270,250,Y);
  for(let z=-260;z<250;z+=12){ apCyl(g,M.dark,38.6,Y,z,0.22,0.3,0.6,8); const f=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,2.4,8),M.tire); f.position.set(40.4,Y-1.4,z+6); g.add(f); }
  apBox(g,M.markY,37,Y+0.03,-10,0.25,0.02,520);
  /* floating pontoons with finger piers; boats moored between the fingers */
  const pont=new THREE.MeshLambertMaterial({color:0xb08a62}), fl=new THREE.MeshLambertMaterial({color:0xdcdcd4});
  [-190,-100,-10,80].forEach(function(pz){ apBox(g,fl,100,0.0,pz,120,0.55,3.4); apBox(g,pont,100,0.55,pz,120,0.15,3); deck(40,160,pz-1.7,pz+1.7,1.0);
    for(let x=48;x<158;x+=11){ [-1,1].forEach(function(s){ apBox(g,fl,x,0.0,pz+s*6.5,1.4,0.55,10); apBox(g,pont,x,0.55,pz+s*6.5,1.2,0.15,10);
      if(r()<0.85){ const kind=r(), b=kind<0.55?buildSailboat(false):buildFishing(['#f2f2ee','#2f6aa5','#c23a2a','#f2f2ee','#3d7a4a'][Math.floor(r()*5)]);
        b.group.position.set(x+5.5,0,pz+s*6.5); b.group.rotation.y=Math.PI/2+(r()-0.5)*0.06; boats.add(b.group); } }); }
    for(let x=60;x<160;x+=30) lampPost(g,M,x,0.7,pz,4); });
  /* breakwater: north arm then the outer arm parallel to the shore; entrance to the south */
  const rocks=[], arms=[[40,-285,262,-285],[262,-285,262,150]];
  arms.forEach(function(a){ const len=Math.hypot(a[2]-a[0],a[3]-a[1]), along=Math.abs(a[2]-a[0])>1;
    const m=new THREE.Mesh(taperBoxZ(len+24,12,28,0.3),new THREE.MeshLambertMaterial({color:0x8d8a83})); m.position.set((a[0]+a[2])/2,-8,(a[1]+a[3])/2); if(!along) m.rotation.y=Math.PI/2; g.add(m);
    apBox(g,M.conc,(a[0]+a[2])/2,3.6,(a[1]+a[3])/2,along?len+14:4,1.4,along?4:len+14);
    for(let d=0;d<len;d+=3.5) for(let k=0;k<4;k++){ const s=k<2?-1:1, off=5.5+r()*6, t=d+r()*3.5, x=a[0]+(a[2]-a[0])*t/len, z=a[1]+(a[3]-a[1])*t/len;
      rocks.push([along?x:x+s*off,1.3+(12-off)*0.3+r()*0.5,along?z+s*off:z,1.2+r()*1.1]); } });
  const lm=[[262,150,M.redL,M.red],[200,206,null,M.white]];
  { const gl=new THREE.MeshBasicMaterial({color:0x22ff66}); gl.userData.glow=4; lm[1][2]=gl; lm[1][3]=new THREE.MeshLambertMaterial({color:0x1f9a48}); }
  lm.forEach(function(e){ apCyl(g,M.white,e[0],Y+0.5,e[1],1.0,1.2,6,10); apCyl(g,e[3],e[0],Y+2.5,e[1],1.05,1.25,1.8,10); const l=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,6),e[2]); l.position.set(e[0],Y+7,e[1]); g.add(l); });
  /* ferry pier (outside the harbour, south of the entrance) */
  apBox(g,M.conc,120,Y-1.2,206,160,1.2,12); apRect(g,apronMat,40,200,200,212,Y+0.02); deck(40,200,200,212,Y);
  for(let x=44;x<200;x+=10) apCyl(g,M.concD,x,-6,206,0.5,0.5,6.8,8);
  for(let x=50;x<200;x+=18) apCyl(g,M.dark,x,Y,211.3,0.22,0.3,0.6,8);
  /* harbour buildings */
  const B=new THREE.Group(); g.add(B); B.updateMatrixWorld(true);
  bldg(B,-110,PY,-60,30,8,16,{floors:2,wall:'#f4efe4'});
  { const s=new THREE.Mesh(new THREE.PlaneGeometry(18,2.4),new THREE.MeshLambertMaterial({map:signTex('HİLAL MARİNA','#1d5aa8','#ffffff',1024,128)})); s.position.set(-94.9,PY+9.4,-60); s.rotation.y=Math.PI/2; B.add(s);
    apCyl(B,M.white,-118,PY+8.5,-60,0.08,0.08,6,6); const f=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); f.position.set(-116.8,PY+13.6,-60); B.add(f); }
  bldg(B,-100,PY,120,24,5,14,{floors:1,wall:'#f6f1e8',win:'#6f8fa8'});
  { const s=new THREE.Mesh(new THREE.PlaneGeometry(14,2),new THREE.MeshLambertMaterial({map:signTex('BALIK EVİ','#f6f1e8','#1d5aa8',512,96)})); s.position.set(-87.9,PY+4.2,120); s.rotation.y=Math.PI/2; B.add(s);
    for(let k=0;k<8;k++){ const x=-80+(k%4)*8, z=110+Math.floor(k/4)*14; apCyl(B,M.white,x,PY,z,0.05,0.05,2.4,6); const um=new THREE.Mesh(new THREE.ConeGeometry(2,0.7,8),new THREE.MeshLambertMaterial({color:[0xd8423a,0xf2f2ee][k%2]})); um.position.set(x,PY+2.6,z); B.add(um);
      apCyl(B,M.white,x,PY,z,0.6,0.6,0.75,10); } }
  bldg(B,-70,PY,200,30,6,14,{floors:1,wall:'#e8eef2',win:'#2f4f6f'});
  { const s=new THREE.Mesh(new THREE.PlaneGeometry(20,2),new THREE.MeshLambertMaterial({map:signTex('İSKELE · DENİZ OTOBÜSÜ','#1d5aa8','#ffffff',1024,104)})); s.position.set(-54.9,PY+5,200); s.rotation.y=Math.PI/2; B.add(s); }
  shed(B,-160,PY,40,36,20,8,0x5f7d96);
  { const hb=buildFishing('#2f6aa5'); hb.group.position.set(-160,PY+1.6,0); hb.group.rotation.y=Math.PI/2; boats.add(hb.group); for(let k=0;k<3;k++) apBox(B,M.yel,-166+k*6,PY,0,0.6,1.6,3); }
  { const asp=new THREE.MeshLambertMaterial({color:0x4d5156,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); asp.userData.flat=true; apRect(B,asp,-240,-130,120,230,PY+0.05);
    const cars=[]; for(let x=-232;x<-136;x+=3.2) [140,210].forEach(function(z){ if(r()<0.6) cars.push([x,z]); }); B.userData.cars=cars; }
  for(let z=-250;z<240;z+=60) lampPost(B,M,-50,Y,z,9);
  /* bake, then place the parked cars in world space */
  g.updateMatrixWorld(true); const carsL=B.userData.cars||[];
  boats.updateMatrixWorld(true); scene.add(bakeGroup(boats));
  const rk=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xa09b90,flatShading:true}),rocks.length), mt=new THREE.Matrix4(), q4=new THREE.Quaternion(), s3=new THREE.Vector3(), p3=new THREE.Vector3();
  rocks.forEach(function(t,i){ p3.set(t[0],t[1],t[2]).applyMatrix4(g.matrixWorld); mt.compose(p3,q4.setFromEuler(new THREE.Euler(i*0.7,i*1.3,i*0.4)),s3.set(t[3],t[3]*0.75,t[3])); rk.setMatrixAt(i,mt); }); rk.instanceMatrix.needsUpdate=true; scene.add(rk);
  bakeInto(g);
  carInstances(carsL.map(function(c){ const w=frWorld(fr,c[0],c[1]); return {x:w[0],y:PY+0.06,z:w[1],h:-fr.a}; }),r);
  /* the breakwater and ferry pier block aircraft */
  [[40,262,-299,-271],[248,276,-285,150],[40,200,200,212]].forEach(function(b){ const a=frWorld(fr,b[0],b[2]), c=frWorld(fr,b[1],b[3]), d=frWorld(fr,b[0],b[3]), e=frWorld(fr,b[1],b[2]);
    navObst(Math.min(a[0],c[0],d[0],e[0]),Math.max(a[0],c[0],d[0],e[0]),Math.min(a[1],c[1],d[1],e[1]),Math.max(a[1],c[1],d[1],e[1]),Y+6,true); });
  /* road from the base gate to the marina */
  const roadMat=new THREE.MeshLambertMaterial({map:apTex(32,64,function(x,W,H){ x.fillStyle='#55595e'; x.fillRect(0,0,W,H); x.fillStyle='rgba(235,235,225,0.9)'; x.fillRect(W/2-1,0,2,H*0.5); x.fillRect(0,0,1,H); x.fillRect(W-1,0,1,H); })});
  roadMat.map.wrapT=THREE.RepeatWrapping; roadMat.userData.flat=true; terrainRibbon(MARINA.road,8,0.3,roadMat); clearTreesNear(MARINA.road,14);
  /* ---- beach on the south-east shore, between the marina and the lighthouse */
  const bg=new THREE.Group(), cols=[0xd8423a,0xf2c230,0x2f8fd8,0x3fae5a,0xf2f2ee,0xe86a2a], loungers=new THREE.MeshLambertMaterial({color:0xf2f2ee}), towel=[0xd8423a,0x2f8fd8,0xf2c230].map(function(c){ return new THREE.MeshLambertMaterial({color:c}); });
  const umM=cols.map(function(c){ return new THREE.MeshLambertMaterial({color:c}); });
  for(let ang=56;ang<=82;ang+=0.28){ const a=ang*D2R; [2690,2676].forEach(function(R,row){ if(r()<0.2) return; const x=Math.cos(a)*R, z=Math.sin(a)*R, y=terrainH(x,z);
    apCyl(bg,M.white,x,y,z,0.04,0.04,2.4,5); const um=new THREE.Mesh(new THREE.ConeGeometry(1.6,0.6,8),umM[Math.floor(r()*umM.length)]); um.position.set(x,y+2.5,z); bg.add(um);
    [-1,1].forEach(function(s){ const lx=x+Math.sin(a)*s*1.5, lz=z-Math.cos(a)*s*1.5; const l=apBox(bg,loungers,lx,terrainH(lx,lz)+0.25,lz,0.7,0.15,1.9); l.rotation.y=-a+Math.PI/2; }); }); }
  for(let k=0;k<40;k++){ const a=(58+r()*22)*D2R, R=2700+r()*4, x=Math.cos(a)*R, z=Math.sin(a)*R; const t=apBox(bg,towel[k%3],x,terrainH(x,z)+0.05,z,0.9,0.03,1.8); t.rotation.y=r()*3; }
  { const a=70*D2R, x=Math.cos(a)*2665, z=Math.sin(a)*2665, y=terrainH(x,z); [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(p){ apBox(bg,M.white,x+p[0],y,z+p[1],0.15,3.4,0.15); });
    apBox(bg,M.white,x,y+3.4,z,2.6,0.2,2.6); apBox(bg,M.red,x,y+3.6,z,2.4,1,0.1); const um=new THREE.Mesh(new THREE.ConeGeometry(1.8,0.8,4),M.red); um.position.set(x,y+5.2,z); bg.add(um); }   // lifeguard tower
  { const a=63*D2R, x=Math.cos(a)*2640, z=Math.sin(a)*2640, y=terrainH(x,z); const k=apBox(bg,new THREE.MeshLambertMaterial({color:0x9a6a3a}),x,y,z,6,3,4); k.rotation.y=-a;
    const rf=apBox(bg,M.red,x,y+3,z,7,0.3,5); rf.rotation.y=-a; WALKBOX.push({x0:x-3.5,x1:x+3.5,z0:z-3.5,z1:z+3.5}); }   // kiosk
  { const a=76*D2R, x=Math.cos(a)*2672, z=Math.sin(a)*2672, y=terrainH(x,z); apCyl(bg,M.white,x-Math.sin(a)*4.5,y,z+Math.cos(a)*4.5,0.05,0.05,2.4,6); apCyl(bg,M.white,x+Math.sin(a)*4.5,y,z-Math.cos(a)*4.5,0.05,0.05,2.4,6);
    const net=new THREE.Mesh(new THREE.PlaneGeometry(9,0.9),new THREE.MeshLambertMaterial({color:0xf2f2ee,side:THREE.DoubleSide,transparent:true,opacity:0.7})); net.position.set(x,y+1.9,z); net.rotation.y=Math.PI/2-a; bg.add(net); }   // beach volleyball
  bakeInto(bg);
  /* ---- ships at sea */
  const berth=frWorld(fr,130,216), out1=frWorld(fr,300,262);
  const ferryPath=smoothPath([berth,out1,[3000,2400],[2600,3600],[0,4300],[-3500,3600],[-5800,600],[-6400,-3400],[-7300,-5700],[-7615,-6300]],40);
  seaMover(buildFerry(),ferryPath,14,{wait:25,s0:0.15});
  const outer=rrPath(-15700,15700,-15700,15700,2500,300); outer.push(outer[0]);
  seaMover(buildCargo('#2f4f6f'),outer,8,{loop:true,s0:0.05}); seaMover(buildCargo('#6f2f2f'),outer.slice().reverse(),7,{loop:true,s0:0.45}); seaMover(buildTanker(),outer,6.5,{loop:true,s0:0.72});
  [[3300,3000,300],[-5000,-5000,400],[1000,4200,350]].forEach(function(c,i){ seaMover(buildFishing(['#f2f2ee','#2f6aa5','#c23a2a'][i]),loopPts(c[0],c[1],c[2],c[2]*0.7,24),3.5,{loop:true,s0:i*0.3}); });
  [[1500,3300,400],[3600,3600,500]].forEach(function(c,i){ seaMover(buildSailboat(true),loopPts(c[0],c[1],c[2],c[2]*0.6,24),4,{loop:true,s0:0.5*i,wake:false}); });
  buildTownPier();
  /* ---- seagulls */
  buildGulls(r);
  MARINA.built=true;
}
function buildTownPier(){ const M=apMats(), px=-7600, Y=3.1; let z0=-6760; while(z0<-6350&&terrainH(px,z0)>Y-0.3) z0+=4; const z1=-6290, g=new THREE.Group();
  apBox(g,M.conc,px,Y-1.2,(z0+z1)/2,12,1.2,z1-z0); for(let z=z0+6;z<z1;z+=10) apCyl(g,M.concD,px,-6,z,0.5,0.5,6.8,8); for(let z=z0+10;z<z1;z+=18) apCyl(g,M.dark,px-5.6,Y,z,0.22,0.3,0.6,8);
  for(let z=z0+20;z<z1;z+=50) lampPost(g,M,px+5,Y,z,7);
  DECKS.push({x0:px-6,x1:px+6,z0:z0-2,z1:z1,y:Y}); bakeInto(g); navObst(px-6,px+6,z0,z1,Y+8,true); }
/* seagulls: instanced V-shaped birds circling the harbours, beach and lighthouse; wings flap by scaling y */
function buildGulls(r){
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-0.35, -0.7,0.2,0.05, 0,0,0.25, 0,0,-0.35, 0,0,0.25, 0.7,0.2,0.05, 0,0,-0.3, 0,-0.05,0.3, 0,0.06,0.0],3)); geo.computeVertexNormals();
  const spots=[[frWorld(MARINA.fr,80,0),14,120],[[-2200,-3800],14,160],[[-8000,-6650],14,140],[[1200,2500],10,180],[[0,2780],8,60],[[-1900,-3600],6,90]], list=[];
  spots.forEach(function(s){ for(let k=0;k<s[1];k++) list.push({cx:s[0][0]+(r()-0.5)*s[2]*0.6,cz:s[0][1]+(r()-0.5)*s[2]*0.6,R:s[2]*(0.3+r()*0.7),h:14+r()*28,w:(0.08+r()*0.12)*(r()<0.5?-1:1),a:r()*6.3,ph:r()*6.3}); });
  const im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xf4f4f0,side:THREE.DoubleSide}),list.length); im.frustumCulled=false; scene.add(im); MARINA.gulls=im; MARINA.gullD=list; gullStep(0);
}
function gullStep(dt){ const im=MARINA.gulls; if(!im) return; const mt=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), s=new THREE.Vector3(), p=new THREE.Vector3();
  MARINA.gullD.forEach(function(b,i){ b.a+=b.w*dt; const R=b.R*(1+0.15*Math.sin(b.a*2+b.ph)), x=b.cx+Math.cos(b.a)*R, z=b.cz+Math.sin(b.a)*R, y=b.h+Math.sin(b.a*3+b.ph)*3;
    const tx=-Math.sin(b.a)*Math.sign(b.w), tz=Math.cos(b.a)*Math.sign(b.w), flap=Math.sin(T*9+b.ph)>-0.2?Math.sin(T*9+b.ph):1;
    e.set(0,Math.atan2(-tx,-tz),-Math.sign(b.w)*0.35); mt.compose(p.set(x,y,z),q.setFromEuler(e),s.set(1.6,1.6*flap,1.6)); im.setMatrixAt(i,mt); });
  im.instanceMatrix.needsUpdate=true; }
function marinaStep(dt){
  if(!MARINA.built) return;
  MARINA.movers.forEach(function(m){ const P=m.P;
    if(m.pause>0){ m.pause-=dt; } else { m.s+=m.dir*m.v*dt;
      if(m.loop){ if(m.s>P.len) m.s-=P.len; if(m.s<0) m.s+=P.len; }
      else if(m.s>P.len){ m.s=P.len; m.dir=-1; m.pause=m.wait; } else if(m.s<0){ m.s=0; m.dir=1; m.pause=m.wait; } }
    while(m.i<P.L.length-2&&P.L[m.i+1]<m.s) m.i++; while(m.i>0&&P.L[m.i]>m.s) m.i--;
    const a=P.pts[m.i], b=P.pts[m.i+1], seg=P.L[m.i+1]-P.L[m.i]||1, u=Math.min(1,Math.max(0,(m.s-P.L[m.i])/seg));
    const fx=(b[0]-a[0])/seg*m.dir, fz=(b[1]-a[1])/seg*m.dir;
    m.g.position.set(a[0]+(b[0]-a[0])*u, Math.sin(T*0.8+m.bob)*0.25, a[1]+(b[1]-a[1])*u);
    m.g.rotation.set(Math.sin(T*0.6+m.bob)*0.012,Math.atan2(-fx,-fz),Math.sin(T*0.7+m.bob)*0.02);
    if(m.g.userData.wake) m.g.userData.wake.visible=m.pause<=0; });
  gullStep(dt);
}
