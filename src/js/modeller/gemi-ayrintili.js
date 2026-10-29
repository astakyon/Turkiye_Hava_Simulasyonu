/* ------------------------------------------------------------------ warships — detailed models (V2.49, model series)
   Builds on the V1 ships and adds what the real ships show: deck-edge railings, the Oto Melara 76 mm gun with its rounded stealth
   shield, torpedo tubes, life-raft canisters, anchors, whip antennas; Ada corvette with ATMACA canisters; TCG Anadolu with the two
   aircraft lifts, deck-edge safety nets and the starboard crane; Tuzla-class patrol boat with two STAMP stations and a stern RHIB.
   Same return shape as before; the V1 ships stay as buildXV1 for the library comparison. */
/* deck half width at hull fraction t (same formula as shipHull) */
function shipHalfW(o,t){ const f=o.bowFine||0.4; return (o.B/2)*(t<f?Math.pow(Math.sin(Math.PI/2*t/f),0.75):1)*(1-(1-(o.sw==null?0.8:o.sw))*smooth(0.72,1,t))*(o.deckW?o.deckW(t):1); }
/* railings along both deck edges between t0 and t1: posts every ~step metres and a top rail */
function shipRails(g,o,F,t0,t1,step,mat){ const n=Math.max(2,Math.round((t1-t0)*o.L/(step||2.6)/1.6)), h=1.0, pts=[];
  for(let i=0;i<=n;i++){ const t=t0+(t1-t0)*i/n; pts.push([shipHalfW(o,t)-0.15,F(t),-o.L/2+t*o.L]); }
  [-1,1].forEach(function(s){ for(let i=0;i<=n;i++){ const p=pts[i]; sPart(g,new THREE.BoxGeometry(0.05,h,0.05),mat,s*p[0],p[1]+h/2,p[2]);
    if(i<n){ const q=pts[i+1], dx=s*(q[0]-p[0]), dy=q[1]-p[1], dz=q[2]-p[2], len=Math.sqrt(dx*dx+dy*dy+dz*dz);
      [h].forEach(function(y){ const r=sPart(g,new THREE.BoxGeometry(0.04,0.04,len),mat,s*(p[0]+q[0])/2,(p[1]+q[1])/2+y,(p[2]+q[2])/2); r.rotation.y=Math.atan2(dx,dz); r.rotation.x=-Math.atan2(dy,Math.sqrt(dx*dx+dz*dz)); }); } } }); }
function shipRafts(g,M,x,y,z,n){ for(let i=0;i<n;i++){ const c=sPart(g,MK.cyl(0.38,0.38,1.3,10),M.white,x,y,z+i*1.5); c.rotation.y=Math.PI/2; } }
function shipAnchor(g,M,x,y,z){ sPart(g,new THREE.BoxGeometry(0.15,0.9,0.7),M.black,x,y,z); sPart(g,new THREE.CylinderGeometry(0.35,0.35,0.1,10),M.black,x+Math.sign(x)*0.06,y+0.45,z).rotation.z=Math.PI/2; }
function shipWhip(g,M,x,y,z,h){ sPart(g,new THREE.CylinderGeometry(0.03,0.05,h,5),M.white,x,y+h/2,z); }
/* Oto Melara 76 mm Super Rapid: rounded stealth shield, slim barrel with a muzzle brake */
function shipGun76(g,M,z,y,s){ s=s||1; const t=new THREE.Mesh(new THREE.SphereGeometry(1.6*s,18,12,0,Math.PI*2,0,Math.PI/2),M.sup); t.scale.set(1,0.85,1.35); t.position.set(0,y,z); g.add(t);
  sPart(g,new THREE.CylinderGeometry(1.7*s,1.8*s,0.35*s,18),M.supD,0,y-0.1,z);
  sPart(g,MK.cyl(0.11*s,0.1*s,4.4*s,10),M.supD,0,y+0.75*s,z-3.6*s); sPart(g,MK.cyl(0.17*s,0.17*s,0.5*s,10),M.dark,0,y+0.75*s,z-5.7*s); }
/* Aselsan STAMP 12.7 mm remote weapon station */
function shipStamp(g,M,x,y,z){ sPart(g,new THREE.CylinderGeometry(0.3,0.34,0.3,12),M.supD,x,y+0.15,z); sPart(g,new THREE.BoxGeometry(0.5,0.45,0.6),M.sup,x,y+0.52,z);
  sPart(g,new THREE.BoxGeometry(0.16,0.16,0.04),M.glass,x+0.14,y+0.56,z-0.31); sPart(g,MK.cyl(0.035,0.04,1.3,8),M.dark,x-0.1,y+0.55,z-0.95); }
/* ---------------------------------------------------------------- İstif frigate / Ada corvette */
function buildFrigate(kind,num){
  const sh=buildFrigateV1(kind,num), M=shipMats(), g=sh.group, ada=kind==='ada', L=sh.L, o={L:L,B:sh.B,sw:0.78}, F=g.children[0].userData.F;
  const T=function(z){ return (z+L/2)/L; }, yAt=function(z){ return F(T(z)); };
  /* the V1 box gun is replaced by the 76 mm (Ada) / 127 mm style (İstif) rounded shield */
  const gz=-L/2+23; g.children.slice().forEach(function(c){ if(c!==g.children[0]&&Math.abs(c.position.z-gz)<0.01&&c.position.y<yAt(gz)+0.5) g.remove(c); });
  g.children.slice().forEach(function(c){ if(Math.abs(c.position.z-(gz-4.2))<0.6&&c.position.y<yAt(gz)+2) g.remove(c); });
  shipGun76(g,M,gz,yAt(gz)-0.05,ada?1:1.25);
  shipRails(g,o,F,0.04,0.3,2.6,M.white); shipRails(g,o,F,0.78,0.995,2.6,M.white);
  [-1,1].forEach(function(s){ shipAnchor(g,M,s*(shipHalfW(o,0.06)+0.05),F(0.06)-1.4,-L/2+0.06*L);
    shipRafts(g,M,s*5.9,yAt(0)+0.1,ada?-6:-9,3);
    for(let k=0;k<2;k++){ const tt=sPart(g,MK.cyl(0.3,0.3,2.6,10),M.supD,s*4.6,4.7+k*0.65,(ada?8:12)+5.2); tt.rotation.y=s*0.35; }   /* torpedo tubes */
  });
  shipWhip(g,M,4.8,10.3,-2,6); shipWhip(g,M,-4.8,10.3,-2,6); shipWhip(g,M,0,10.7,L/2-30,5);
  return sh;
}
/* ---------------------------------------------------------------- TCG Anadolu */
function buildAnadolu(){
  const sh=buildAnadoluV1(), M=shipMats(), g=sh.group, L=sh.L, Fd=sh.deckY, zT=function(t){ return -L/2+t*L; };
  const o={L:L,B:32,sw:0.95,bowFine:0.22,deckW:function(t){ return t<0.12?0.55+0.45*smooth(0,0.12,t):1; }}, F=function(){ return Fd; };
  /* aircraft lifts: one forward of the island on the centreline side, one aft on the starboard deck edge */
  [[-4,zT(0.3),13,15],[11,zT(0.7),12,14]].forEach(function(e){ const r=new THREE.Mesh(new THREE.PlaneGeometry(e[2],e[3]),SHIPM.liftM||(SHIPM.liftM=new THREE.MeshLambertMaterial({color:0x40464c,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));
    r.rotation.x=-Math.PI/2; r.position.set(e[0],Fd+0.03,e[1]); g.add(r);
    [[0,e[3]/2],[0,-e[3]/2]].forEach(function(q){ sPart(g,new THREE.BoxGeometry(e[2],0.02,0.25),M.markY,e[0],Fd+0.05,e[1]+q[1]); }); });
  /* safety nets along the deck edges and railings on the ski-jump */
  [-1,1].forEach(function(s){ const n=sPart(g,new THREE.BoxGeometry(1.6,0.05,L*0.74),M.dark,s*(16+0.6),Fd-0.35,zT(0.6)); n.rotation.z=s*0.35; });
  shipRails(g,o,function(t){ return t<0.12?Fd+6*Math.pow(1-t/0.12,1.7):Fd; },0.01,0.12,2.6,M.white);
  /* starboard crane, boats, life rafts, anchors, whips */
  { const cx=13.5, cz=zT(0.66); sPart(g,new THREE.CylinderGeometry(0.5,0.6,3,10),M.yel,cx,Fd+1.5,cz); const j=sPart(g,new THREE.BoxGeometry(0.5,0.5,12),M.yel,cx-1.5,Fd+4.2,cz+3); j.rotation.x=0.35; j.rotation.y=-0.4; }
  [-1,1].forEach(function(s){ shipRafts(g,M,s*15.6,Fd-4.5,zT(0.4),5); shipAnchor(g,M,s*(shipHalfW(o,0.05)+0.05),Fd-3,zT(0.05)); });
  shipWhip(g,M,10.5,Fd+20,zT(0.43),7);
  return sh;
}
/* ---------------------------------------------------------------- Tuzla-class patrol boat */
function buildPatrol(num){
  const sh=buildPatrolV1(num), M=shipMats(), g=sh.group, L=sh.L, o={L:L,B:8.9,sw:0.86}, F=g.children[0].userData.F;
  shipRails(g,o,F,0.05,0.3,2.0,M.white); shipRails(g,o,F,0.62,0.99,2.0,M.white);
  [-1,1].forEach(function(s){ shipStamp(g,M,s*3.3,8.2,-8.5); shipRafts(g,M,s*3.6,F(0.55),2,2); shipAnchor(g,M,s*(shipHalfW(o,0.07)+0.04),F(0.07)-1.0,-L/2+0.07*L); });
  sPart(g,new THREE.BoxGeometry(7.2,0.15,2.6),M.sup,0,8.1,-8.5);   /* bridge wings for the STAMP stations */
  /* rigid inflatable boat on the stern with its davit */
  { const zb=L/2-5, yb=F(0.9)+0.5; const b=new THREE.Mesh(new THREE.SphereGeometry(1,14,8),M.orange); b.scale.set(0.8,0.38,2.6); b.position.set(-1.4,yb,zb); g.add(b);
    sPart(g,new THREE.BoxGeometry(1.6,0.35,3.6),M.dark,-1.4,yb+0.2,zb); const d=sPart(g,new THREE.BoxGeometry(0.2,3,0.2),M.supD,1.2,yb+1.3,zb); d.rotation.z=0.3; sPart(g,new THREE.BoxGeometry(2.6,0.15,0.15),M.supD,-0.1,yb+2.7,zb); }
  shipWhip(g,M,2.4,8.2,-4,4); shipWhip(g,M,-2.4,8.2,-4,4);
  return sh;
}
