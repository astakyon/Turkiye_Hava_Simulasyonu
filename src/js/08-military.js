/* ------------------------------------------------------------------ military sites: air-defence positions around the air base
   (revetments, HİSAR-O launchers, KORKUT guns, radars), an ammunition depot west of the base, and an early-warning radar
   station on the peak of the eastern mountains. */
const MIL={turrets:[], radars:[], depot:{x:-1150,z:-300}, peak:{x:5360,z:-2680}, built:false};
function berm(g,x,z,y,ang,w,d,h){ const gm=new THREE.MeshLambertMaterial({color:0x6f8a4a}), b=new THREE.Group(); b.position.set(x,y,z); b.rotation.y=ang; g.add(b);
  [[0,-d/2,w+8,0],[-w/2,0,d,Math.PI/2],[w/2,0,d,Math.PI/2]].forEach(function(s){ const m=new THREE.Mesh(taperBoxZ(s[2],h,6,0.25),gm); m.position.set(s[0],h/2,s[1]); m.rotation.y=s[3]; b.add(m); }); }
function buildMilitary(){
  const M=apMats(), gy=AIRFIELD_Y, g=new THREE.Group(), live=new THREE.Group(), r=mulberry32(5555);
  /* ---- air defence: revetments around each existing battery, plus launchers, guns and radars */
  const sites=[[640,-500,0.3],[-850,620,Math.PI+0.3],[640,1150,0.1],[-900,-1050,Math.PI-0.2]];
  sites.forEach(function(s,i){ const x=s[0], z=s[1], a=s[2];
    berm(g,x,z,gy,a,26,18,3.4);
    const v=i%2?buildKorkut():buildHisar(); v.group.position.set(x,gy,z); v.group.rotation.y=a+Math.PI; live.add(v.group); MIL.turrets.push({t:v.turret,base:r()*6,sp:0.15+r()*0.1,el:v.elev||null});
    const rt=buildRadarTruck(); const rx=x+Math.cos(a)*22, rz=z-Math.sin(a)*22; rt.group.position.set(rx,gy,rz); rt.group.rotation.y=a; live.add(rt.group); MIL.radars.push(rt.turret);
    apBox(g,M.olive,x-Math.cos(a)*20,gy,z+Math.sin(a)*20,6,2.6,2.5); navObst(x-16,x+16,z-16,z+16,gy+5); });
  /* ---- ammunition depot: fenced compound with earth-covered igloos and a guard tower */
  { const c=MIL.depot, y=terrainH(c.x,c.z), x0=c.x-110, x1=c.x+110, z0=c.z-80, z1=c.z+80;
    for(let k=0;k<4;k++){ igloo(g,M,x0+30+k*52,y,c.z-30,24); igloo(g,M,x0+30+k*52,y,c.z+40,24); }
    fenceLine([[x0,z0],[x1,z0],[x1,z1],[x0,z1],[x0,z0]],function(x,z){ return Math.abs(x-x1)<1&&Math.abs(z-c.z)<6; });
    watchTower(g,M,x0+6,y,z0+6); watchTower(g,M,x1-6,y,z1-6);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(8,1.6),new THREE.MeshLambertMaterial({map:signTex('MÜHİMMAT DEPOSU — YASAK BÖLGE','#c01818','#ffffff',1024,128),side:THREE.DoubleSide}));
    sg.position.set(x1+2,y+2,c.z+12); sg.rotation.y=Math.PI/2; g.add(sg); apCyl(g,M.metal,x1+2,y,c.z+8.2,0.06,0.06,2.2,6); apCyl(g,M.metal,x1+2,y,c.z+15.8,0.06,0.06,2.2,6);
    const asp=new THREE.MeshLambertMaterial({color:0x7a7466,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); asp.userData.flat=true; apRect(g,asp,x0+10,x1,c.z-4,c.z+4,y+0.05); }
  /* ---- early-warning radar station on the eastern peak */
  { const c=MIL.peak, y=terrainH(c.x,c.z), wm=new THREE.MeshLambertMaterial({color:0xf2f2ee});
    [[-35,-10,9],[0,-28,11],[32,-8,8]].forEach(function(d){ const x=c.x+d[0], z=c.z+d[1]; apCyl(g,M.conc,x,y,z,d[2]*0.8,d[2]*0.9,d[2]*0.9,16);
      const dm=new THREE.Mesh(new THREE.SphereGeometry(d[2],24,16),wm); dm.position.set(x,y+d[2]*0.9+d[2]*0.8,z); g.add(dm); navObst(x-d[2],x+d[2],z-d[2],z+d[2],y+d[2]*2.7); });
    bldg(g,c.x+10,y,c.z+25,34,7,14,{floors:2,wall:'#e8eaec'});
    const H=28, mx=c.x-20, mz=c.z+28; [[-2,-2],[2,-2],[2,2],[-2,2]].forEach(function(p){ beam(g,M.metal,[mx+p[0],y,mz+p[1]],[mx+p[0]*0.4,y+H,mz+p[1]*0.4],0.15); });
    for(let h=0;h<H;h+=5) beam(g,M.metal,[mx-2+h*0.04,y+h,mz],[mx+2-h*0.04,y+h,mz],0.06);
    apBox(g,M.white,mx,y+H,mz,2.4,0.4,2.4); const rd=new THREE.Group(); rd.position.set(mx,y+H+0.4,mz); apBox(rd,M.dark,0,0.6,0,9,2.2,0.4); apCyl(rd,M.metal,0,0,0,0.3,0.3,0.6,8); scene.add(rd); MIL.radars.push(rd);
    for(let k=0;k<2;k++){ const ax=c.x+30+k*14, az=c.z+30; apCyl(g,k?M.red:M.white,ax,y,az,0.18,0.3,36,8); apBox(g,M.redL,ax,y+36,az,0.5,0.5,0.5); navObst(ax-1,ax+1,az-1,az+1,y+37); }
    const pad=new THREE.Mesh(new THREE.CircleGeometry(12,32),new THREE.MeshLambertMaterial({color:0x5c6166,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})); pad.rotation.x=-Math.PI/2; pad.position.set(c.x-30,y+0.06,c.z+52); g.add(pad);
    const hr=new THREE.Mesh(new THREE.RingGeometry(9,9.8,32),M.markY); hr.rotation.x=-Math.PI/2; hr.position.set(c.x-30,y+0.08,c.z+52); g.add(hr);
    fenceLine([[c.x-60,c.z-50],[c.x+60,c.z-50],[c.x+60,c.z+70],[c.x-60,c.z+70],[c.x-60,c.z-50]],function(){ return false; });
    navObst(mx-3,mx+3,mz-3,mz+3,y+H+3); }
  bakeInto(g); scene.add(live); MIL.live=live; MIL.built=true;
  const pts=[]; for(let x=MIL.depot.x-130;x<=MIL.depot.x+130;x+=20) for(let z=MIL.depot.z-100;z<=MIL.depot.z+100;z+=20) pts.push([x,z]); clearTreesNear(pts,12);
  const pk=[]; for(let x=MIL.peak.x-80;x<=MIL.peak.x+80;x+=20) for(let z=MIL.peak.z-70;z<=MIL.peak.z+90;z+=20) pk.push([x,z]); clearTreesNear(pk,12);
}
function militaryStep(dt){
  if(!MIL.built) return;
  MIL.turrets.forEach(function(t){ t.t.rotation.y=Math.sin(T*t.sp+t.base)*1.2; if(t.el) t.el.rotation.x=0.45+Math.sin(T*0.2+t.base)*0.15; });
  MIL.radars.forEach(function(r){ r.rotation.y+=dt*1.6; });
}
