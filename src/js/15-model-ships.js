/* ------------------------------------------------------------------ ship models (Mavi Kanatlar)
   Axes like the aircraft: bow −Z, up +Y, metres; y=0 is the waterline. Static display ships for the naval base now,
   playable ships later. Hulls are lofted from stations (MK.grid); superstructure uses tapered "stealth" blocks. */
const SHIPM={};
function shipMats(){
  if(SHIPM.sup) return SHIPM;
  const L=function(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})); };
  Object.assign(SHIPM,{sup:L(0x8d979f), supD:L(0x76808a), deck:L(0x4d5359), dark:L(0x2c3136), black:L(0x1c2024), white:L(0xeef0f2),
    glass:L(0x1d2a36), red:L(0xb3241b), orange:L(0xe0661c), panel:L(0x3c444c), yel:L(0xe2b02c),
    mark:L(0xf2f2ee,{polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
    markY:L(0xe2b02c,{polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3})});
  SHIPM.mark.userData.flat=true; SHIPM.markY.userData.flat=true;
  return SHIPM;
}
/* tapered block (w × d footprint, top scaled by k) with flat faces: the slanted "stealth" look of modern superstructures */
function tbox(w,h,d,k){ const g=new THREE.CylinderGeometry((k==null?1:k)*Math.SQRT1_2,Math.SQRT1_2,h,4,1).toNonIndexed(); g.rotateY(Math.PI/4); g.scale(w,1,d); g.translate(0,h/2,0); g.computeVertexNormals(); return g; }
function sPart(g,geo,mat,x,y,z){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); g.add(m); return m; }
/* hull side texture: u 0..0.5 starboard (stern→bow), 0.5..1 port (bow→stern); v from keel (0) to the highest deck (1) */
function shipSideTex(o){
  const W=2048, H=256, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  const span=o.Fmax+o.T, py=function(y){ return (1-(y+o.T)/span)*H; };
  x.fillStyle=o.hull||'#7f8992'; x.fillRect(0,0,W,H);
  const q=mulberry32(o.seed||3); for(let i=0;i<60;i++){ x.fillStyle='rgba(0,0,0,'+(0.03+q()*0.04)+')'; x.fillRect(q()*W,py(o.Fmax*q()),40+q()*160,2+q()*6); }   // weathering
  x.fillStyle='rgba(0,0,0,0.18)'; for(let k=1;k<10;k++){ x.fillRect(0,py(o.Fmax*k/10),W,1); }                                            // plate seams
  x.fillStyle=o.anti||'#6e2a22'; x.fillRect(0,py(-0.35),W,H-py(-0.35));
  x.fillStyle=o.boot||'#1f2327'; x.fillRect(0,py(0.7),W,py(-0.35)-py(0.7));
  if(o.band){ x.fillStyle=o.band; x.fillRect(0,py(o.bandY+0.6),W,py(o.bandY)-py(o.bandY+0.6)); }
  if(o.num){ const vpm=H/span, hpm=(W/2)/o.L, fs=o.numH*vpm, yy=py(o.numY);
    [[0.5-o.numAt*0.5],[0.5+o.numAt*0.5]].forEach(function(u){ x.save(); x.translate(u[0]*W,yy); x.scale(hpm/vpm,1); x.font='bold '+Math.round(fs)+'px Arial, sans-serif';
      x.textAlign='center'; x.textBaseline='middle'; x.fillStyle=o.numCol||'#f4f4f0'; x.fillText(o.num,0,0); x.restore(); }); }
  const t=new THREE.CanvasTexture(c); try{ t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); }catch(e){} return t;
}
/* lofted hull. o: L, B, T (draft), Fb/Fs (bow/stern freeboard), rake, sw (transom width ratio), ww (waterline/deck width),
   bowFine (0..1 fraction of length over which the bow widens), deckF(t) optional deck height override. */
function shipHull(o){
  const N=36, half=[[],[]], deck=[], M=shipMats(), Fmax=o.Fmax||Math.max(o.Fb,o.Fs);
  const F=o.deckF||function(t){ return o.Fs+(o.Fb-o.Fs)*(1-smooth(0,0.65,t)); };
  for(let i=0;i<=N;i++){ const t=Math.pow(i/N,1.15), z=-o.L/2+t*o.L, f=o.bowFine||0.4;
    const wd=(o.B/2)*(t<f?Math.pow(Math.sin(Math.PI/2*t/f),0.75):1)*(1-(1-(o.sw==null?0.8:o.sw))*smooth(0.72,1,t))*(o.deckW?o.deckW(t):1);
    const ww=wd*(o.ww||0.94)*(t<0.3?0.8+0.2*t/0.3:1), d=o.T*(0.25+0.75*smooth(0,0.16,t))*(1-0.45*smooth(0.82,1,t)), Fy=F(t);
    const zz=function(y){ return z+(o.rake||0)*Math.pow(1-t,5)*((Fy-y)/(Fy+o.T)); };
    [1,-1].forEach(function(s,k){ const row=[[s*wd,Fy,zz(Fy)],[s*(wd*0.6+ww*0.4),Fy*0.45,zz(Fy*0.45)],[s*ww,0,zz(0)]];
      MK.arc(0,0,0,ww,d,2.6,0,-Math.PI/2,6).slice(1).forEach(function(p){ row.push([s*p[0],p[1],zz(p[1])]); }); half[k].push(row); });
    deck.push([[-wd,Fy,zz(Fy)],[wd,Fy,zz(Fy)]]); }
  const uvS=function(x,z,y){ return [(0.5-z/o.L)*0.5,(y+o.T)/(Fmax+o.T)]; }, uvP=function(x,z,y){ return [0.5+(z/o.L+0.5)*0.5,(y+o.T)/(Fmax+o.T)]; };
  const ctr=new THREE.Vector3(0,Fmax*0.3,0), sideMat=o.plain?shipPlain(o.hull||'#7f8992'):new THREE.MeshLambertMaterial({map:shipSideTex(Object.assign({Fmax:Fmax},o))});
  const g=new THREE.Group();
  g.add(new THREE.Mesh(MK.outward(MK.grid(half[0],false,uvS),ctr),sideMat));
  g.add(new THREE.Mesh(MK.outward(MK.grid(half[1],false,uvP),ctr),sideMat));
  g.add(new THREE.Mesh(MK.outward(MK.grid(deck),new THREE.Vector3(0,-50,0)),o.deckMat||M.deck));
  const last=half[0][N].slice().reverse().concat(half[1][N].slice(1));
  g.add(new THREE.Mesh(MK.outward(MK.cap(last),new THREE.Vector3(0,Fmax*0.3,-o.L)),shipPlain(o.hull||'#7f8992')));
  g.userData.F=F; g.userData.L=o.L; return g;
}
function shipPlain(c){ const k='c'+c; return SHIPM[k]||(SHIPM[k]=new THREE.MeshLambertMaterial({color:new THREE.Color(c)})); }
function shipFlag(g,x,y,z,s){ shipMats(); if(!SHIPM.flag) SHIPM.flag=new THREE.MeshLambertMaterial({map:flagTexture(),side:THREE.DoubleSide}); const f=new THREE.Mesh(new THREE.PlaneGeometry(1.5*(s||1),1*(s||1)),SHIPM.flag); f.position.set(x,y,z); f.rotation.y=Math.PI/2; g.add(f); return f; }
function shipGun(g,M,z,y,big){ const s=big||1; sPart(g,tbox(3.6*s,2.0*s,4.6*s,0.55),M.sup,0,y,z);
  const b=sPart(g,MK.cyl(0.13*s,0.2*s,5*s,10),M.supD,0,y+1.0*s,z-4.2*s); b.rotation.x=-0.06; }
function shipCIWS(g,M,x,y,z){ sPart(g,MK.cyl(0.9,0.9,0.6,14),M.supD,x,y+0.3,z).rotation.x=Math.PI/2; const d=new THREE.Mesh(new THREE.SphereGeometry(0.8,14,10),M.white); d.position.set(x,y+1.6,z); d.scale.set(1,1.4,1); g.add(d); }
function shipRadar(g,M,x,y,z){ const r=new THREE.Group(); r.position.set(x,y,z); sPart(r,new THREE.BoxGeometry(3.6,0.9,0.3),M.dark,0,0.45,0); sPart(r,new THREE.CylinderGeometry(0.12,0.12,0.6,6),M.dark,0,-0.3,0); g.add(r); return r; }
/* İstif-class frigate (kind 'istif', TCG İstanbul F-515) or Ada-class corvette (kind 'ada', F-511) */
function buildFrigate(kind,num){
  const M=shipMats(), ada=kind==='ada', L=ada?99.5:113, B=ada?14.4:14.4;
  const hull=shipHull({L:L,B:B,T:ada?3.9:4.2,Fb:7.4,Fs:4.8,rake:7,sw:0.78,num:num,numH:3.2,numY:4.5,numAt:0.14,L2:L,seed:num.length});
  const g=new THREE.Group(); g.add(hull); const F=hull.userData.F, Z=function(t){ return -L/2+t*L; }, T=function(z){ return (z+L/2)/L; }, yAt=function(z){ return F(T(z)); };
  shipGun(g,M,-L/2+23,yAt(-L/2+23)-0.2);
  sPart(g,new THREE.BoxGeometry(5.6,0.7,4.6),M.dark,0,yAt(-L/2+30),-L/2+30.5);                                         // VLS
  for(let k=0;k<4;k++) sPart(g,new THREE.BoxGeometry(5.4,0.05,0.1),M.panel,0,yAt(-L/2+30)+0.36,-L/2+28.8+k*1.1);
  const z0=-L/2+35, z1=ada?8:12, y0=4.6;
  sPart(g,tbox(12.6,3.4+yAt(z0)-y0,z1-z0,0.93),M.sup,0,y0,(z0+z1)/2);                                                   // main superstructure
  const y1=y0+3.4+yAt(z0)-y0; sPart(g,tbox(10.4,3.0,16,0.9),M.sup,0,y1,z0+9);                                         // bridge deck
  sPart(g,new THREE.BoxGeometry(9.2,0.9,0.2),M.glass,0,y1+1.7,z0+1.6).rotation.x=-0.35;                                  // bridge windows
  [-1,1].forEach(function(s){ sPart(g,new THREE.BoxGeometry(0.2,0.8,6),M.glass,s*4.95,y1+1.7,z0+5); });
  const mz=z0+10, my=y1+3, mh=ada?11:14; sPart(g,tbox(6.4,mh,6.4,0.42),M.sup,0,my,mz);                                    // integrated mast (ÇAFRAD)
  [[0,-1],[0,1],[1,0],[-1,0]].forEach(function(d){ const p=sPart(g,new THREE.BoxGeometry(d[0]?0.15:2.6,2.6,d[0]?2.6:0.15),M.panel,d[0]*2.5,my+mh*0.42,mz+d[1]*2.5);
    p.rotation[d[0]?'z':'x']=(d[0]||d[1])*-0.2; });
  sPart(g,new THREE.CylinderGeometry(0.25,0.35,5,8),M.sup,0,my+mh,mz); const dome=new THREE.Mesh(new THREE.SphereGeometry(1.1,14,10),M.white); dome.position.set(0,my+mh+5.6,mz); g.add(dome);
  const radar=shipRadar(g,M,0,my+mh+3.2,mz);
  sPart(g,tbox(4,5,7,0.72),M.sup,0,y1,z1-6); sPart(g,new THREE.BoxGeometry(2.8,0.3,4.8),M.dark,0,y1+5,z1-6);              // funnel
  [-1,1].forEach(function(s){ for(let k=0;k<4;k++){ const c=sPart(g,MK.cyl(0.32,0.32,5.2,8),M.supD,s*1.4,yAt(z1)+1.1+k*0.0,z1+3+k*0.8);    // anti-ship missile canisters
      c.rotation.set(0,s*Math.PI/2,0); c.rotateX(0.5); } });
  const hz0=z1+7, hz1=ada?L/2-24:L/2-26; sPart(g,tbox(11.2,6.2,hz1-hz0,0.95),M.sup,0,4.5,(hz0+hz1)/2);                   // hangar
  sPart(g,new THREE.BoxGeometry(7,5,0.15),M.supD,0,5.0,hz1+0.05);
  if(ada){ sPart(g,tbox(2,1.6,2.4,0.8),M.supD,0,10.7,hz0+3); for(let i=0;i<3;i++) for(let j=0;j<3;j++) sPart(g,new THREE.BoxGeometry(0.4,0.4,0.2),M.dark,-0.5+i*0.5,11.2+j*0.45,hz0+1.75); }
  else shipCIWS(g,M,0,10.7,hz0+3);
  const hy=F(1)+0.03;
  const ring=new THREE.Mesh(new THREE.RingGeometry(3.4,3.8,32),M.mark); ring.rotation.x=-Math.PI/2; ring.position.set(0,hy,(hz1+L/2)/2); g.add(ring);   // helideck markings
  sPart(g,new THREE.BoxGeometry(0.35,0.02,L/2-hz1-3),M.mark,0,hy,(hz1+L/2)/2);
  sPart(g,new THREE.BoxGeometry(8,0.02,0.3),M.markY,0,hy,hz1+3);
  [-1,1].forEach(function(s){ const b=new THREE.Mesh(new THREE.CylinderGeometry(1,1,7,10),M.orange); b.rotation.x=Math.PI/2; b.position.set(s*6.1,y0+2.3,z1-2); g.add(b);  // boats
    sPart(g,new THREE.BoxGeometry(0.2,3,0.2),M.supD,s*5.6,y0+1,z1-4); sPart(g,new THREE.BoxGeometry(0.2,3,0.2),M.supD,s*5.6,y0+1,z1); });
  sPart(g,new THREE.CylinderGeometry(0.06,0.06,4,6),M.white,0,F(1)+2,L/2-0.6); shipFlag(g,0,F(1)+3.4,L/2-0.6,1.3);
  return {group:g, radar:radar, L:L};
}
/* TCG Anadolu (L-400): amphibious assault ship / drone carrier with ski-jump and island on the starboard side */
function buildAnadolu(){
  const M=shipMats(), L=231, B=32, Fd=21;
  const deckF=function(t){ return Fd+(t<0.12?6*Math.pow(1-t/0.12,1.7):0); };
  const hull=shipHull({L:L,B:B,T:6.9,Fb:Fd,Fs:Fd,Fmax:Fd+6,deckF:deckF,rake:4,sw:0.95,ww:0.78,bowFine:0.22,
    deckW:function(t){ return t<0.12?0.55+0.45*smooth(0,0.12,t):1; },num:'L-400',numH:6,numY:15,numAt:0.1,seed:9,band:'#3a4047',bandY:10});
  const g=new THREE.Group(); g.add(hull); const zT=function(t){ return -L/2+t*L; };
  const dy=Fd+0.04;
  sPart(g,new THREE.BoxGeometry(0.5,0.02,L*0.8),M.mark,-2,dy,zT(0.56));                                                // centreline
  for(let k=0;k<6;k++){ const r=new THREE.Mesh(new THREE.RingGeometry(5,5.6,32),M.markY); r.rotation.x=-Math.PI/2; r.position.set(-7,dy,zT(0.25)+k*28); g.add(r);
    const n=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshLambertMaterial({map:signTex(String(k+1),'#4d5359','#f2f2ee',128,128),polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    n.rotation.x=-Math.PI/2; n.position.set(-14,dy,zT(0.25)+k*28); g.add(n); }
  for(let k=0;k<20;k++) sPart(g,new THREE.BoxGeometry(0.4,0.02,3),M.mark,-15,dy,zT(0.14)+k*10);                       // deck edge dashes
  /* island */
  const ix=B/2-5.5, iz0=zT(0.36), iz1=zT(0.6);
  sPart(g,tbox(9,8,iz1-iz0,0.92),M.sup,ix,Fd,(iz0+iz1)/2);
  sPart(g,tbox(7.5,7,(iz1-iz0)*0.62,0.9),M.sup,ix,Fd+8,iz0+(iz1-iz0)*0.36);
  sPart(g,new THREE.BoxGeometry(7.3,1.1,0.2),M.glass,ix,Fd+12,iz0+0.6).rotation.x=-0.25;
  sPart(g,new THREE.BoxGeometry(0.2,1.1,10),M.glass,ix-3.6,Fd+12,iz0+6);
  sPart(g,tbox(5,11,6,0.4),M.sup,ix,Fd+15,iz0+8); const dome=new THREE.Mesh(new THREE.SphereGeometry(1.4,14,10),M.white); dome.position.set(ix,Fd+27.5,iz0+8); g.add(dome);
  sPart(g,new THREE.CylinderGeometry(0.25,0.35,2.6,8),M.sup,ix,Fd+26,iz0+8);
  const radar=shipRadar(g,M,ix,Fd+23,iz0+8);
  sPart(g,tbox(5,6,9,0.8),M.supD,ix,Fd+8,iz1-12); sPart(g,new THREE.BoxGeometry(3.6,0.3,6.6),M.dark,ix,Fd+14,iz1-12);   // funnels
  sPart(g,tbox(4.4,5,8,0.8),M.supD,ix,Fd+6,iz1-3);
  shipCIWS(g,M,ix+1.5,Fd,iz0-3); shipCIWS(g,M,-B/2+2,Fd-2.4,L/2-8);
  sPart(g,new THREE.BoxGeometry(14,10,0.2),M.dark,0,4,L/2+0.02);                                                        // stern door (well deck)
  [-1,1].forEach(function(s){ sPart(g,new THREE.BoxGeometry(0.2,7,16),M.supD,s*(B/2+0.02),Fd-8,zT(0.62)); });             // side openings
  sPart(g,new THREE.CylinderGeometry(0.08,0.08,5,6),M.white,ix,Fd+29.5,iz0+8); shipFlag(g,ix,Fd+31.5,iz0+8,2.2);
  return {group:g, radar:radar, L:L, deckY:Fd};
}
/* Reis-class (Type 214) submarine */
function buildSub(){
  const M=shipMats(), g=new THREE.Group(), L=68, R=3.2, pts=[];
  for(let i=0;i<=40;i++){ const t=i/40, z=t*L; let r;
    if(t<0.1) r=R*Math.sqrt(1-Math.pow(1-t/0.1,2)); else if(t<0.72) r=R; else r=R*(1-Math.pow((t-0.72)/0.28,1.6))+0.15;
    pts.push(new THREE.Vector2(Math.max(0.02,r),z-L/2)); }
  const hg=new THREE.LatheGeometry(pts,24); hg.rotateX(Math.PI/2); hg.rotateY(Math.PI); const h=new THREE.Mesh(hg,M.black); g.add(h);
  sPart(g,tbox(1.9,4.8,8,0.85),M.black,0,R-0.4,-L/2+20);
  [-1,1].forEach(function(s){ sPart(g,new THREE.BoxGeometry(2.6,0.15,1.2),M.black,s*1.9,R+2.6,-L/2+18.5); });
  for(let k=0;k<4;k++){ const a=Math.PI/4+k*Math.PI/2; const f=sPart(g,new THREE.BoxGeometry(0.2,3.4,3.2),M.black,Math.cos(a)*2.0,Math.sin(a)*2.0,L/2-4); f.rotation.z=-a+Math.PI/2; }
  sPart(g,new THREE.CylinderGeometry(0.1,0.1,3,6),M.dark,0,R+4.4,-L/2+19); sPart(g,new THREE.CylinderGeometry(0.15,0.15,2,6),M.dark,0,R+4,-L/2+21);
  return {group:g, L:L};
}
/* Tuzla-class patrol boat */
function buildPatrol(num){
  const M=shipMats(), L=56;
  const hull=shipHull({L:L,B:8.9,T:2.4,Fb:4.4,Fs:3,rake:3,sw:0.86,num:num,numH:1.8,numY:2.6,numAt:0.13,seed:5});
  const g=new THREE.Group(); g.add(hull); const F=hull.userData.F;
  shipGun(g,M,-L/2+12,F(0.21)-0.1,0.6);
  sPart(g,tbox(7.4,3.2,20,0.9),M.sup,0,2.6,-3); sPart(g,tbox(6,2.4,8,0.85),M.sup,0,5.8,-7);
  sPart(g,new THREE.BoxGeometry(5.5,0.7,0.2),M.glass,0,7.1,-10.9).rotation.x=-0.3;
  sPart(g,tbox(2.6,6,2.6,0.4),M.sup,0,8.2,-5); const radar=shipRadar(g,M,0,14.4,-5);
  sPart(g,MK.cyl(0.08,0.12,2.4,8),M.supD,0,6,8);
  sPart(g,new THREE.CylinderGeometry(0.05,0.05,3,6),M.white,0,F(1)+1.5,L/2-0.4); shipFlag(g,0,F(1)+2.6,L/2-0.4,1);
  return {group:g, radar:radar, L:L};
}
/* harbour tug */
function buildTug(){
  const M=shipMats(), L=30;
  const hull=shipHull({L:L,B:10,T:3.6,Fb:3.6,Fs:2.0,rake:2,sw:0.85,ww:0.97,hull:'#a6322a',boot:'#1b1d20',anti:'#4a1d18',band:'#1b1d20',bandY:1.6,seed:7});
  const g=new THREE.Group(); g.add(hull);
  sPart(g,new THREE.BoxGeometry(7,2.6,9),M.white,0,3.3,-4); sPart(g,new THREE.BoxGeometry(6,2.2,4.5),M.white,0,5.9,-6);
  sPart(g,new THREE.BoxGeometry(5.8,0.8,0.2),M.glass,0,7,-8.3); sPart(g,new THREE.BoxGeometry(1.4,3.4,2),M.orange,0,5.9,0);
  sPart(g,new THREE.BoxGeometry(1.5,0.4,2.1),M.black,0,9.3,0);
  [-1,1].forEach(function(s){ for(let k=0;k<5;k++) sPart(g,MK.cyl(0.45,0.45,0.9,10),M.black,s*4.6,1.6,-10+k*4.5).rotation.z=Math.PI/2; });
  return {group:g, L:L};
}
/* ---- civilian craft */
/* fast passenger ferry ("deniz otobüsü") */
function buildFerry(){
  const M=shipMats(), L=42, g=new THREE.Group();
  g.add(shipHull({L:L,B:11,T:1.8,Fb:3.2,Fs:2.6,rake:2,sw:0.9,ww:0.9,hull:'#f2f4f6',boot:'#1f4f8f',anti:'#7a1f1a',band:'#1f4f8f',bandY:1.2,num:'HİLAL-1',numH:1.2,numY:2.2,numAt:0.2,seed:11}));
  sPart(g,tbox(9.6,2.6,28,0.95),M.white,0,2.8,0); sPart(g,new THREE.BoxGeometry(9.7,1.1,26),M.glass,0,3.6,0.6);
  sPart(g,tbox(7.4,2.2,12,0.9),M.white,0,5.4,-4); sPart(g,new THREE.BoxGeometry(7.2,0.8,0.2),M.glass,0,6.5,-10.1).rotation.x=-0.35;
  sPart(g,new THREE.BoxGeometry(9.8,0.35,27),shipPlain('#1f4f8f'),0,5.3,0.4);
  sPart(g,new THREE.CylinderGeometry(0.08,0.08,4,6),M.white,0,7.6,-2); shipFlag(g,0,9.2,-2,1.2);
  return {group:g, L:L};
}
/* container ship */
function buildCargo(col){
  const M=shipMats(), L=150, g=new THREE.Group();
  g.add(shipHull({L:L,B:24,T:8,Fb:13,Fs:11,rake:6,sw:0.92,bowFine:0.25,hull:col||'#2f4f6f',anti:'#7a2a24',boot:'#1b1d20',plain:true,seed:31}));
  const cc=['#b5432f','#2f6aa5','#3f8a4a','#d4a12c','#8a8f96','#e2e2e2','#6a3d8a'], q=mulberry32(L|0);
  for(let bay=0;bay<9;bay++) for(let row=0;row<4;row++) for(let tier=0;tier<3;tier++){ if(q()<0.12) continue;
    sPart(g,new THREE.BoxGeometry(2.4,2.5,12),shipPlain(cc[Math.floor(q()*cc.length)]),-8.6+row*5.7/1.0*0.98+ (row>1?0.6:0),11+tier*2.55,-58+bay*13.5); }
  sPart(g,tbox(20,14,12,0.94),M.white,0,11,L/2-14); sPart(g,new THREE.BoxGeometry(22,1.2,0.2),M.glass,0,23,L/2-20.1);
  sPart(g,tbox(5,8,6,0.85),shipPlain('#b3241b'),0,25,L/2-8); sPart(g,new THREE.BoxGeometry(5.2,1,6.2),M.black,0,32.5,L/2-8);
  return {group:g, L:L};
}
/* oil/product tanker */
function buildTanker(){
  const M=shipMats(), L=170, g=new THREE.Group();
  g.add(shipHull({L:L,B:28,T:10,Fb:12,Fs:11,rake:5,sw:0.95,bowFine:0.22,hull:'#2b2f33',anti:'#8a2a22',boot:'#b3241b',plain:true,deckMat:shipPlain('#8a3a2a'),seed:41}));
  sPart(g,new THREE.BoxGeometry(2,1.6,L*0.62),shipPlain('#d8d8d0'),0,11.5,-10); for(let k=0;k<12;k++) sPart(g,MK.cyl(0.35,0.35,18,8),shipPlain('#c8c8c0'),0,12.8,-60+k*9).rotation.y=Math.PI/2;
  sPart(g,tbox(22,15,14,0.94),M.white,0,11,L/2-16); sPart(g,new THREE.BoxGeometry(24,1.2,0.2),M.glass,0,24,L/2-23.1);
  sPart(g,tbox(5,8,6,0.85),M.white,0,26,L/2-8); sPart(g,new THREE.BoxGeometry(5.2,1,6.2),M.black,0,33.5,L/2-8);
  return {group:g, L:L};
}
/* fishing boat (trawler) */
function buildFishing(col){
  const M=shipMats(), L=16, g=new THREE.Group();
  g.add(shipHull({L:L,B:5.2,T:1.6,Fb:2.4,Fs:1.6,rake:1.2,sw:0.8,hull:col||'#f2f2ee',band:'#1f4f8f',bandY:1.2,plain:true}));
  sPart(g,new THREE.BoxGeometry(3.4,2.2,4),M.white,0,1.8,-2.5); sPart(g,new THREE.BoxGeometry(3.5,0.6,4.1),M.glass,0,3.1,-2.5);
  sPart(g,new THREE.BoxGeometry(3.8,0.2,4.4),shipPlain('#1f4f8f'),0,4.0,-2.5);
  sPart(g,new THREE.CylinderGeometry(0.08,0.1,6,6),M.white,0,4,-1); beamIn(g,M.dark,[0,8.5,-1],[0,2.4,6],0.04);
  const d=sPart(g,MK.cyl(0.8,0.8,2.6,12),shipPlain('#d0662a'),0,2.6,4.5); d.rotation.y=Math.PI/2;
  return {group:g, L:L};
}
/* sailing yacht; `sail` true shows the sails up */
function buildSailboat(sail){
  const M=shipMats(), L=12, g=new THREE.Group();
  g.add(shipHull({L:L,B:3.8,T:0.9,Fb:1.4,Fs:1.1,rake:1.5,sw:0.75,hull:'#f6f6f2',boot:'#1f2a44',band:'#1f2a44',bandY:0.9,plain:true}));
  sPart(g,tbox(2.2,0.6,4,0.85),M.white,0,1.2,0); sPart(g,new THREE.BoxGeometry(2.0,0.3,0.05),M.glass,0,1.6,-2);
  sPart(g,new THREE.CylinderGeometry(0.06,0.08,15,6),M.white,0,1.2,-1.2).position.y=8.7;
  if(sail){ const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute([0,2.2,-1, 0,15.5,-1, 0,2.2,4.4, 0,2.2,-1.4, 0,14.5,-1.4, 0,1.6,-6],3)); sg.computeVertexNormals();
    const sm=new THREE.Mesh(sg,shipMats().sail||(SHIPM.sail=new THREE.MeshLambertMaterial({color:0xfafaf5,side:THREE.DoubleSide}))); sm.rotation.y=0.25; g.add(sm); }
  return {group:g, L:L};
}
function beamIn(g,mat,a,b,r){ const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,4),mat);
  m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); m.quaternion.setFromUnitVectors(UP,d.normalize()); g.add(m); return m; }
