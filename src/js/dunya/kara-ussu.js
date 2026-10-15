/* ------------------------------------------------------------------ land base (Bozkurtlar garrison) on the northern plateau
   Pads 'land' and 'range' (04-terrain). HQ and parade ground at the south gate, barracks, mess hall and sports field to the west,
   motor pool with Altay/Fırtına/Pars/MRAP/trucks under carports, workshop and fuel point, ammunition igloos, a driving course
   with a tank lapping it, helipad, watchtowers, fence; firing range to the east. Road south to the village. */
const LAND={x0:400,x1:1900,z0:-7950,z1:-7250,y:34, gate:{x:900,z:-7250}, road:null, tank:null, tankT:0, course:null, built:false};
LAND.road=smoothPath([[900,-7250],[900,-7170],[760,-6900],[470,-6580],[220,-6000],[70,-5100],[-60,-4300],[-250,-3650],[-390,-3150],[-390,-3030]],6);
EXTRA_ROADS.push(LAND.road);
function carport(g,M,x,y,z,len,dep){ const roof=new THREE.MeshLambertMaterial({color:0x6d7560});
  for(let k=0;k<=Math.round(len/10);k++){ const px=x-len/2+k*len/Math.round(len/10); apBox(g,M.metal,px,y,z-dep/2+0.3,0.3,4.4,0.3); apBox(g,M.metal,px,y,z+dep/2-0.3,0.3,5.2,0.3); }
  const r=apBox(g,roof,x,y+4.4,z,len+1,0.25,dep+1); r.rotation.x=-0.06; apBox(g,M.conc,x,y+0.02,z,len,0.06,dep); apBox(g,M.concD,x,y,z-dep/2+0.1,len,2.2,0.2);
  navObst(x-len/2,x+len/2,z-dep/2,z+dep/2,y+5.4,true); }
function watchTower(g,M,x,y,z){ [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(p){ apBox(g,M.metal,x+p[0]*1.4,y,z+p[1]*1.4,0.25,8,0.25); });
  apBox(g,M.olive,x,y+8,z,3.6,0.3,3.6); apBox(g,M.olive,x,y+8.3,z,3.6,1.1,3.6); apBox(g,M.glass,x,y+9.4,z,3.4,1.0,3.4); apBox(g,M.roof,x,y+10.4,z,4.2,0.3,4.2);
  navObst(x-2,x+2,z-2,z+2,y+11); WALKBOX.push({x0:x-1.6,x1:x+1.6,z0:z-1.6,z1:z+1.6}); }
function igloo(g,M,x,y,z,len){ const gm=new THREE.MeshLambertMaterial({color:0x5f8a3e}); const c=new THREE.Mesh(new THREE.CylinderGeometry(6,6,len,16,1,false,-Math.PI/2,Math.PI),gm);
  c.rotation.x=-Math.PI/2; c.rotation.y=0; c.scale.set(1,1,0.7); c.position.set(x,y,z); g.add(c);
  apBox(g,M.conc,x,y,z-len/2,13,4.8,0.8); apBox(g,M.door,x,y,z-len/2-0.45,4,3.4,0.1); apBox(g,M.yel,x,y+4.2,z-len/2-0.45,4.5,0.3,0.1);
  WALKBOX.push({x0:x-6.5,x1:x+6.5,z0:z-len/2-0.5,z1:z+len/2}); navObst(x-6.5,x+6.5,z-len/2,z+len/2,y+4.5); }
function buildLand(){
  const M=apMats(), V=landMats(), L=LAND, Y=L.y, r=mulberry32(1071), g=new THREE.Group(), park=new THREE.Group(), mt=new THREE.Matrix4();
  const asph=new THREE.MeshLambertMaterial({color:0x4d5156,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); asph.userData.flat=true;
  const gravel=new THREE.MeshLambertMaterial({color:0x7a7466,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); gravel.userData.flat=true;
  const dirt=new THREE.MeshLambertMaterial({color:0x8a6d4b,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); dirt.userData.flat=true;
  /* roads and hardstands */
  [[L.gate.x-5,L.gate.x+5,L.z0+20,L.z1],[L.x0+20,L.x1-20,-7425,-7415],[L.x0+20,L.x1-20,-7885,-7875],[1445,1455,L.z0+20,-7420],[1088,1312,-7862,-7482]].forEach(function(q){ apRect(g,q[2]===-7862?gravel:asph,q[0],q[1],q[2],q[3],Y+0.05); });
  for(let z=L.z0+26;z<L.z1-6;z+=12) apBox(g,M.mark,L.gate.x,Y+0.06,z,0.25,0.02,6);
  /* HQ, parade ground, flag, sign */
  bldg(g,770,Y,-7330,56,11,15,{floors:3,wall:'#e6dfcc'}); apBox(g,M.white,770,Y,-7320,10,4.5,3); apBox(g,M.white,770,Y+4.5,-7320,12,0.5,4.5);
  { const s=new THREE.Mesh(new THREE.PlaneGeometry(26,2.6),new THREE.MeshLambertMaterial({map:signTex('BOZKURTLAR KOMUTANLIĞI','#3b4a2a','#ffffff',1024,104)})); s.position.set(770,Y+13.2,-7322.4); g.add(s);
    const s2=s.clone(); s2.rotation.y=Math.PI; s2.position.z=-7337.6; g.add(s2); }
  apRect(g,new THREE.MeshLambertMaterial({color:0x6c7278,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),960,1120,-7400,-7300,Y+0.04);
  for(let k=0;k<5;k++) apBox(g,M.mark,980+k*35,Y+0.06,-7350,0.3,0.02,80);
  apCyl(g,M.white,1040,Y,-7300,0.15,0.22,22,10);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(7.5,5),new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide})); fl.position.set(1043.8,Y+19,-7300); g.add(fl);
  apBox(g,M.conc,1040,Y,-7392,30,1.2,5); apBox(g,M.roof,1040,Y+3.4,-7392,30,0.3,5.5); [-14,-5,5,14].forEach(function(dx){ apCyl(g,M.white,1040+dx,Y+1.2,-7392,0.18,0.18,2.2,8); });   // review stand
  /* barracks, mess hall, clinic, sports field, water tower */
  [[530,-7480],[680,-7480],[530,-7560],[680,-7560],[530,-7640],[680,-7640]].forEach(function(p){ bldg(g,p[0],Y,p[1],48,9.5,13,{floors:3,wall:'#e8e0c8'}); });
  bldg(g,820,Y,-7520,32,6.5,22,{floors:1,wall:'#e2dccb'}); bldg(g,820,Y,-7610,22,7,16,{floors:2,wall:'#f2f2f2'});
  { const fx=610, fz=-7800, fm=new THREE.MeshLambertMaterial({color:0x4f8f37,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); fm.userData.flat=true;
    apRect(g,fm,fx-50,fx+50,fz-32,fz+32,Y+0.05);
    [[0,-30,96,0.2],[0,30,96,0.2],[-48,0,0.2,60],[48,0,0.2,60],[0,0,0.2,60]].forEach(function(l){ apBox(g,M.mark,fx+l[0],Y+0.06,fz+l[1],l[2]||0.2,0.02,l[3]); });
    const cr=new THREE.Mesh(new THREE.RingGeometry(8.6,9,32),M.mark); cr.rotation.x=-Math.PI/2; cr.position.set(fx,Y+0.07,fz); g.add(cr);
    [-1,1].forEach(function(s){ apBox(g,M.white,fx+s*48,Y,fz-3.7,0.15,2.4,0.15); apBox(g,M.white,fx+s*48,Y,fz+3.7,0.15,2.4,0.15); apBox(g,M.white,fx+s*48,Y+2.4,fz,0.15,0.15,7.5); }); }
  apCyl(g,M.conc,470,Y,-7310,1.6,2.2,20,12); apCyl(g,M.white,470,Y+20,-7310,6,3,4,16); apCyl(g,M.white,470,Y+24,-7310,6,6,3,16); apCyl(g,M.roof,470,Y+27,-7310,0.5,6.2,1.8,16);
  navObst(464,476,-7316,-7304,Y+29); WALKBOX.push({x0:467.8,x1:472.2,z0:-7312.2,z1:-7307.8});
  /* motor pool: four carports with vehicles parked under them */
  const rows=[[-7500,'altay'],[-7590,'altay'],[-7680,'firtina'],[-7770,'pars'],[-7850,'mix']];
  rows.forEach(function(row){ carport(g,M,1200,Y,row[0],200,15);
    for(let k=0;k<12;k++){ const x=1200-92+k*16.7; let v;
      if(row[1]==='altay') v=buildAltay(); else if(row[1]==='firtina') v=buildFirtina(); else if(row[1]==='pars') v=buildPars(); else v=(k%3===0?buildArmyTruck():buildKirpi());
      v.group.position.set(x,Y+0.06,row[0]); v.group.rotation.y=Math.PI; park.add(v.group); } });
  /* workshop, fuel point, ammunition igloos */
  bldg(g,1650,Y,-7330,60,13,30,{floors:2,wall:'#c9cfc2'}); { const s=new THREE.Mesh(new THREE.PlaneGeometry(22,2.6),new THREE.MeshLambertMaterial({map:signTex('BAKIM ATÖLYESİ','#c9cfc2','#2d3b20',1024,128)})); s.position.set(1650,Y+10,-7314.9); g.add(s); }
  { const fx=1650, fz=-7440; apBox(g,M.white,fx,Y+5,fz,30,0.6,14); [-12,12].forEach(function(dx){ [-5,5].forEach(function(dz){ apCyl(g,M.metal,fx+dx,Y,fz+dz,0.25,0.25,5,8); }); });
    [-6,0,6].forEach(function(dx){ apBox(g,M.red,fx+dx,Y,fz,1,1.8,0.8); }); apBox(g,M.green,fx,Y+5.6,fz,30.2,0.6,0.2);
    [-10,10].forEach(function(dx){ apCyl(g,M.tank,fx+dx+40,Y,fz,3,3,8,16); }); navObst(fx+27,fx+53,fz-3,fz+3,Y+8); WALKBOX.push({x0:fx+27,x1:fx+53,z0:fz-3,z1:fz+3}); }
  [1660,1710,1760,1810].forEach(function(x){ igloo(g,M,x,Y,-7560,22); });
  /* helipad */
  { const hx=1300, hz=-7340, pm=new THREE.MeshLambertMaterial({color:0x5c6166,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); pm.userData.flat=true;
    const pad=new THREE.Mesh(new THREE.CircleGeometry(16,32),pm); pad.rotation.x=-Math.PI/2; pad.position.set(hx,Y+0.04,hz); g.add(pad);
    const ring=new THREE.Mesh(new THREE.RingGeometry(12,13,40),M.markY); ring.rotation.x=-Math.PI/2; ring.position.set(hx,Y+0.06,hz); g.add(ring);
    apBox(g,M.mark,hx-3,Y+0.05,hz,1.2,0.02,10); apBox(g,M.mark,hx+3,Y+0.05,hz,1.2,0.02,10); apBox(g,M.mark,hx,Y+0.05,hz,6,0.02,1.2); }
  /* driving course: dirt loop with ramps and a ditch crossing; a tank laps it */
  { const cx=1660, cz=-7790, rx=190, rz=110, pts=[]; for(let i=0;i<=64;i++){ const a=i/64*Math.PI*2; pts.push([cx+Math.cos(a)*rx*(1+0.12*Math.sin(3*a)),cz+Math.sin(a)*rz]); }
    L.course={cx:cx,cz:cz,rx:rx,rz:rz};
    for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], m=new THREE.Mesh(new THREE.PlaneGeometry(9,Math.hypot(b[0]-a[0],b[1]-a[1])+1),dirt);
      m.rotation.x=-Math.PI/2; m.rotation.z=Math.atan2(b[0]-a[0],b[1]-a[1]); m.position.set((a[0]+b[0])/2,Y+0.07,(a[1]+b[1])/2); g.add(m); }
    [[cx,cz-rz],[cx-rx,cz]].forEach(function(p){ const ramp=new THREE.Mesh(taperBoxZ(10,1.6,14,0.3),new THREE.MeshLambertMaterial({color:0x7a6040})); ramp.rotation.y=p[1]===cz?0:Math.PI/2; ramp.position.set(p[0],Y+0.8,p[1]); g.add(ramp); });
    for(let k=0;k<6;k++) apBox(g,M.yel,cx+rx-6+k*0.1,Y,cz-24+k*9,0.6,0.9,0.6);
    const tk=buildAltay(); const tg=new THREE.Group(); tg.add(bakeGroup(tk.group)); scene.add(tg); L.tank=tg; }
  /* watchtowers and lamp posts */
  [[L.x0+12,L.z0+12],[L.x1-12,L.z0+12],[L.x0+12,L.z1-12],[L.x1-12,L.z1-12]].forEach(function(p){ watchTower(g,M,p[0],Y,p[1]); });
  for(let x=L.x0+80;x<L.x1-40;x+=160){ lampPost(g,M,x,Y,-7428,10); lampPost(g,M,x,Y,-7888,10); }
  /* fence, main gate on the south, a barrier gap east to the range */
  const G=L.gate;
  fenceLine([[L.x0+2,L.z1-2],[L.x0+2,L.z0+2],[L.x1-2,L.z0+2],[L.x1-2,L.z1-2],[L.x0+2,L.z1-2]],function(x,z){ return (Math.abs(z-(L.z1-2))<1&&Math.abs(x-G.x)<9)||(Math.abs(x-(L.x1-2))<1&&Math.abs(z+7660)<6); });
  bakeInto(baseGate(G.x,G.z+6,Math.PI,Y,'AY YILDIZ KARA ÜSSÜ'));
  apBox(g,M.red,L.x1-2,Y+1,-7660,0.15,0.15,10); apBox(g,M.conc,L.x1-2,Y,-7666,0.8,1,0.8);
  /* ---- firing range */
  { const rx0=2150, Y2=34, rz0=-7790, rz1=-7530;
    apRect(g,gravel,L.x1-2,rx0+20,-7665,-7655,Y2+0.05);
    apBox(g,M.conc,rx0+15,Y2,(rz0+rz1)/2,10,0.4,rz1-rz0-40); apBox(g,M.roof,rx0+13,Y2+4,(rz0+rz1)/2,14,0.3,rz1-rz0-40);
    for(let z=rz0+25;z<rz1-20;z+=12){ apCyl(g,M.metal,rx0+9,Y2,z,0.12,0.12,4,6); apCyl(g,M.metal,rx0+19,Y2,z,0.12,0.12,4,6); apBox(g,M.markY,rx0+40,Y2+0.06,z+6,40,0.02,0.2); }
    [300,600,900].forEach(function(d,j){ for(let z=rz0+30;z<rz1-25;z+=24){ const x=rx0+15+d; apBox(g,M.door,x,Y2,z,0.2,0.6+j*0.2,2.6); const tg=apBox(g,M.white,x,Y2+0.6+j*0.2,z,0.1,1.8,1.4);
      const c=new THREE.Mesh(new THREE.CircleGeometry(0.45,16),M.red); c.position.set(x-0.06,Y2+1.5+j*0.2,z); c.rotation.y=-Math.PI/2; g.add(c); } });
    const berm=new THREE.Mesh(taperBoxZ(rz1-rz0+60,12,40,0.25),new THREE.MeshLambertMaterial({color:0x6f6a4f})); berm.rotation.y=Math.PI/2; berm.position.set(3290,Y2+6,(rz0+rz1)/2); g.add(berm);
    navObst(3270,3310,rz0-30,rz1+30,Y2+12);
    [[2870,-7600],[3020,-7700],[3120,-7580]].forEach(function(p,i){ const h=buildAltay(); h.turret.rotation.y=0.6*i-0.4; h.group.position.set(p[0],Y2,p[1]); h.group.rotation.y=-Math.PI/2+0.3*i; park.add(h.group); });
    const ft=new THREE.Group(); watchTower(ft,M,rx0+5,Y2,rz0-10); g.add(ft); apCyl(g,M.white,rx0+5,Y2+10.7,rz0-10,0.06,0.06,4,6);
    const rf=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),new THREE.MeshLambertMaterial({color:0xd01818,side:THREE.DoubleSide})); rf.position.set(rx0+6.1,Y2+14,rz0-10); g.add(rf);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(14,2),new THREE.MeshLambertMaterial({map:signTex('ATIŞ POLİGONU — DİKKAT','#c01818','#ffffff',1024,128)})); sg.position.set(rx0-2,Y2+3,-7672); g.add(sg); }
  bakeInto(park); bakeInto(g);
  /* road to the village, trees along it */
  const roadMat=new THREE.MeshLambertMaterial({map:apTex(32,64,function(x,W,H){ x.fillStyle='#55595e'; x.fillRect(0,0,W,H); x.fillStyle='rgba(235,235,225,0.9)'; x.fillRect(W/2-1,0,2,H*0.5); x.fillRect(0,0,1,H); x.fillRect(W-1,0,1,H); })});
  roadMat.map.wrapT=THREE.RepeatWrapping; roadMat.userData.flat=true;
  terrainRibbon(L.road.filter(function(p){ return p[1]>L.z1+2; }),8,0.3,roadMat);
  L.road.forEach(function(p,i){ if(i%6||i<6||p[1]>-3200) return; [-1,1].forEach(function(s){ if(r()<0.4) return; const x=p[0]+s*11, z=p[1]; TREE_EXTRA.push([x,terrainH(x,z),z,0.8+r()*0.3,r()<0.5?0:1]); }); });
  for(let k=0;k<70;k++){ const x=L.x0+30+r()*(L.x1-L.x0-60), z=L.z1-6-r()*14; if(Math.abs(x-L.gate.x)<20) continue; TREE_EXTRA.push([x,Y,z,0.7+r()*0.3,1]); }
  clearTreesNear(L.road,14); L.built=true;
}
function landStep(dt){
  if(!LAND.built||!LAND.tank) return; const c=LAND.course; LAND.tankT+=dt*6/1000; const a=LAND.tankT*Math.PI*2, sp=c.rx*(1+0.12*Math.sin(3*a));
  const x=c.cx+Math.cos(a)*sp, z=c.cz+Math.sin(a)*c.rz, a2=a+0.01, x2=c.cx+Math.cos(a2)*c.rx*(1+0.12*Math.sin(3*a2)), z2=c.cz+Math.sin(a2)*c.rz;
  LAND.tank.position.set(x,LAND.y+0.07+Math.abs(Math.sin(T*6))*0.03,z); LAND.tank.rotation.y=Math.atan2(-(x2-x),-(z2-z));
}
