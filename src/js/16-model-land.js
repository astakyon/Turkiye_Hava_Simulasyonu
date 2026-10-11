/* ------------------------------------------------------------------ land vehicle models (Bozkurtlar)
   Forward −Z, up +Y, ground at y=0, metres. Display/placeholder models for the land base now; playable later. */
const LANDM={};
function landMats(){
  if(LANDM.olive) return LANDM;
  const L=function(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})); };
  const camo=apTex(128,128,function(x,W,H){ x.fillStyle='#5e6640'; x.fillRect(0,0,W,H); const q=mulberry32(21);
    [['#3e4530',26],['#7a6a48',20],['#2d3226',12]].forEach(function(c){ x.fillStyle=c[0]; for(let i=0;i<c[1];i++){ x.beginPath(); const cx=q()*W, cy=q()*H, r=6+q()*16; x.ellipse(cx,cy,r,r*(0.4+q()*0.6),q()*3,0,6.3); x.fill(); } }); });
  Object.assign(LANDM,{olive:L(0x5e6640), camo:L(0xffffff,{map:camo}), dark:L(0x2c2f2a), track:L(0x26282a), wheel:L(0x1c1e20), hub:L(0x4a4f3a),
    steel:L(0x6b6f72), glass:L(0x1d2a33), canvas:L(0x6a6a4a), sand:L(0xb7a57c), lamp:L(0xfff2c8)});
  return LANDM;
}
/* angled hull: box whose top is narrower (k) and whose front/back are cut at angles (fz, bz = top inset in z) */
function hullBox(w,h,d,k,fz,bz){ const g=new THREE.BoxGeometry(w,h,d), p=g.attributes.position;
  for(let i=0;i<p.count;i++){ if(p.getY(i)>0){ p.setX(i,p.getX(i)*(k||1)); if(p.getZ(i)<0) p.setZ(i,p.getZ(i)+(fz||0)); else p.setZ(i,p.getZ(i)-(bz||0)); } }
  g.computeVertexNormals(); g.translate(0,h/2,0); return g; }
function lPart(g,geo,mat,x,y,z){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); g.add(m); return m; }
function wheelAt(g,M,x,y,z,r,w){ const t=lPart(g,new THREE.CylinderGeometry(r,r,w,12),M.wheel,x,y,z); t.rotation.z=Math.PI/2; const h=lPart(g,new THREE.CylinderGeometry(r*0.55,r*0.55,w*1.06,8),M.hub,x,y,z); h.rotation.z=Math.PI/2; }
/* tracked running gear on both sides: n road wheels between z0 and z1 */
function trackSet(g,M,xo,len,n,r,tw,y0){
  [-1,1].forEach(function(s){ const x=s*xo;
    lPart(g,new THREE.BoxGeometry(tw,0.18,len),M.track,x,y0+0.09,0); lPart(g,new THREE.BoxGeometry(tw,0.18,len*0.9),M.track,x,y0+2*r+0.1,0);
    [-1,1].forEach(function(e){ const c=lPart(g,new THREE.CylinderGeometry(r+0.09,r+0.09,tw,8,1,false,e<0?Math.PI/2:-Math.PI/2,Math.PI),M.track,x,y0+r+0.09,e*len/2); c.rotation.z=Math.PI/2; });
    for(let i=0;i<n;i++){ const z=-len/2+r+0.15+i*(len-2*r-0.3)/(n-1); wheelAt(g,M,x,y0+r,z,r*0.92,tw*0.8); } });
}
/* Altay main battle tank */
function buildAltay(){
  const M=landMats(), g=new THREE.Group();
  trackSet(g,M,1.55,7.0,7,0.36,0.66,0);
  lPart(g,hullBox(3.3,1.15,7.3,0.97,0.9,0.2),M.camo,0,0.55,0);
  [-1,1].forEach(function(s){ lPart(g,new THREE.BoxGeometry(0.08,0.62,6.2),M.camo,s*1.92,1.02,-0.2); });               // side skirts
  lPart(g,new THREE.BoxGeometry(3.9,0.08,7.0),M.camo,0,1.32,0);                                                          // track guards
  const t=new THREE.Group(); t.position.set(0,1.7,0.35); g.add(t);
  lPart(t,hullBox(3.1,0.85,4.2,0.86,1.0,0.25),M.camo,0,0,0);
  lPart(t,hullBox(2.4,0.55,1.4,0.9,0,0.3),M.camo,0,0.05,2.6);                                                            // bustle
  lPart(t,new THREE.BoxGeometry(0.5,0.45,0.5),M.dark,-0.85,0.9,-0.6); lPart(t,new THREE.BoxGeometry(0.4,0.35,0.35),M.glass,-0.85,0.95,-0.86);  // commander sight
  lPart(t,new THREE.BoxGeometry(0.42,0.38,0.42),M.dark,0.95,0.85,-1.3);
  lPart(t,new THREE.CylinderGeometry(0.42,0.42,0.18,12),M.olive,-0.4,0.92,0.4);
  const gun=lPart(t,MK.cyl(0.11,0.17,6.0,10),M.olive,0,0.45,-4.9); lPart(t,MK.cyl(0.21,0.21,1.6,10),M.olive,0,0.45,-2.4);
  lPart(t,MK.cyl(0.14,0.14,0.5,10),M.dark,0,0.45,-7.9);
  lPart(g,new THREE.BoxGeometry(0.25,0.1,0.08),M.lamp,-1.2,1.35,-3.62); lPart(g,new THREE.BoxGeometry(0.25,0.1,0.08),M.lamp,1.2,1.35,-3.62);
  return {group:g, turret:t, len:10.3};
}
/* T-155 Fırtına self-propelled howitzer */
function buildFirtina(){
  const M=landMats(), g=new THREE.Group();
  trackSet(g,M,1.45,6.6,6,0.36,0.6,0);
  lPart(g,hullBox(3.0,1.2,6.9,0.97,0.7,0.1),M.camo,0,0.55,0); lPart(g,new THREE.BoxGeometry(3.5,0.08,6.6),M.camo,0,1.32,0);
  const t=new THREE.Group(); t.position.set(0,1.75,1.0); g.add(t);
  lPart(t,hullBox(3.1,1.5,4.4,0.94,0.5,0.1),M.camo,0,0,0);
  lPart(t,MK.cyl(0.12,0.2,8.0,10),M.olive,0,0.75,-6.1); lPart(t,new THREE.BoxGeometry(0.5,0.4,0.6),M.dark,0,0.75,-10.2);
  lPart(t,new THREE.BoxGeometry(0.5,0.35,0.5),M.dark,-1.0,1.6,-0.8);
  return {group:g, turret:t, len:11.7};
}
/* FNSS Pars 8×8 armoured vehicle with a remote weapon station */
function buildPars(){
  const M=landMats(), g=new THREE.Group();
  [-2.9,-1.65,0.9,2.15].forEach(function(z){ [-1,1].forEach(function(s){ wheelAt(g,M,s*1.18,0.6,z,0.6,0.42); }); });
  lPart(g,hullBox(2.7,1.25,7.6,0.88,1.1,0.25),M.camo,0,0.75,0);
  lPart(g,hullBox(2.4,0.45,6.0,0.9,0.3,0.1),M.camo,0,2.0,0.4);
  lPart(g,new THREE.BoxGeometry(1.4,0.25,0.06),M.glass,0,2.15,-2.62).rotation.x=-0.5;
  const r=new THREE.Group(); r.position.set(0,2.45,0.2); g.add(r); lPart(r,hullBox(1.2,0.5,1.3,0.8,0.2,0.1),M.olive,0,0,0); lPart(r,MK.cyl(0.05,0.07,1.7,8),M.dark,0.15,0.28,-1.4);
  lPart(r,new THREE.BoxGeometry(0.35,0.3,0.35),M.dark,-0.4,0.55,-0.2);
  return {group:g, turret:r, len:7.9};
}
/* Otokar/Nurol style 4×4 MRAP (Kirpi-like) */
function buildKirpi(){
  const M=landMats(), g=new THREE.Group();
  [-1.95,1.85].forEach(function(z){ [-1,1].forEach(function(s){ wheelAt(g,M,s*1.08,0.58,z,0.58,0.4); }); });
  lPart(g,hullBox(2.2,0.9,6.4,0.9,0.4,0),M.sand,0,0.65,0);
  lPart(g,new THREE.BoxGeometry(2.5,1.5,4.6),M.sand,0,1.5,0.7);
  lPart(g,hullBox(2.3,0.9,1.6,0.86,0.5,0),M.sand,0,1.5,-2.2);
  lPart(g,new THREE.BoxGeometry(2.0,0.6,0.06),M.glass,0,2.25,-1.55).rotation.x=-0.25;
  [-1,1].forEach(function(s){ for(let k=0;k<3;k++) lPart(g,new THREE.BoxGeometry(0.06,0.4,0.5),M.glass,s*1.26,2.3,-0.4+k*1.3); });
  lPart(g,new THREE.CylinderGeometry(0.45,0.5,0.35,10),M.dark,0,3.0,0.4);
  return {group:g, len:6.6};
}
/* 6×6 military cargo truck with a canvas cover */
function buildArmyTruck(){
  const M=landMats(), g=new THREE.Group();
  [-2.9,1.3,2.7].forEach(function(z){ [-1,1].forEach(function(s){ wheelAt(g,M,s*1.05,0.55,z,0.55,0.38); }); });
  lPart(g,new THREE.BoxGeometry(2.0,0.4,8.6),M.dark,0,0.75,0);
  lPart(g,hullBox(2.45,1.6,2.3,0.95,0.15,0),M.olive,0,0.95,-3.0);
  lPart(g,new THREE.BoxGeometry(2.0,0.6,0.06),M.glass,0,2.1,-4.13);
  lPart(g,new THREE.BoxGeometry(2.5,0.6,5.6),M.olive,0,1.0,1.2);
  const c=lPart(g,new THREE.CylinderGeometry(1.25,1.25,5.6,14,1,false,-Math.PI/2,Math.PI),M.canvas,0,2.3,1.2); c.rotation.x=-Math.PI/2; c.scale.set(1,1,0.6);
  lPart(g,new THREE.BoxGeometry(2.5,0.75,5.6),M.canvas,0,1.95,1.2);
  return {group:g, len:8.6};
}
/* HİSAR-O style air-defence launcher on a 6×6 truck (canister box elevates and slews) */
function buildHisar(){
  const M=landMats(), g=new THREE.Group();
  [-3.2,1.2,2.6].forEach(function(z){ [-1,1].forEach(function(s){ wheelAt(g,M,s*1.1,0.55,z,0.55,0.4); }); });
  lPart(g,new THREE.BoxGeometry(2.1,0.4,9),M.dark,0,0.75,0); lPart(g,hullBox(2.5,1.7,2.4,0.95,0.2,0),M.camo,0,0.95,-3.4); lPart(g,new THREE.BoxGeometry(2.1,0.6,0.06),M.glass,0,2.2,-4.6);
  const t=new THREE.Group(); t.position.set(0,1.5,1.4); g.add(t); lPart(t,new THREE.CylinderGeometry(0.9,1.0,0.5,12),M.olive,0,0,0);
  const el=new THREE.Group(); el.position.set(0,0.6,0.6); t.add(el); const box=lPart(el,new THREE.BoxGeometry(2.0,1.4,4.6),M.camo,0,0.7,-1.8);
  for(let i=0;i<3;i++) for(let j=0;j<2;j++) lPart(el,new THREE.CylinderGeometry(0.28,0.28,0.06,10),M.dark,-0.6+i*0.6,0.38+j*0.66,-4.13).rotation.x=Math.PI/2;
  el.rotation.x=0.55; return {group:g, turret:t, elev:el, len:9};
}
/* KORKUT self-propelled 35 mm air-defence gun */
function buildKorkut(){
  const M=landMats(), g=new THREE.Group();
  trackSet(g,M,1.3,6.2,6,0.33,0.55,0); lPart(g,hullBox(2.8,1.2,6.6,0.94,0.7,0.1),M.camo,0,0.5,0);
  const t=new THREE.Group(); t.position.set(0,1.75,0.6); g.add(t); lPart(t,hullBox(2.2,1.0,2.6,0.85,0.3,0.1),M.camo,0,0,0);
  [-1,1].forEach(function(s){ lPart(t,MK.cyl(0.07,0.1,3.2,8),M.dark,s*1.25,0.55,-2.4); lPart(t,new THREE.BoxGeometry(0.4,0.5,1.0),M.olive,s*1.2,0.55,-0.6); });
  const rd=lPart(t,new THREE.BoxGeometry(1.2,0.7,0.12),M.dark,0,1.45,0.6); return {group:g, turret:t, radar:rd, len:6.6};
}
/* fire-control / search radar on a truck */
function buildRadarTruck(){
  const M=landMats(), g=new THREE.Group();
  [-2.6,1.0,2.4].forEach(function(z){ [-1,1].forEach(function(s){ wheelAt(g,M,s*1.05,0.55,z,0.55,0.4); }); });
  lPart(g,new THREE.BoxGeometry(2.1,0.4,8),M.dark,0,0.75,0); lPart(g,hullBox(2.5,1.7,2.3,0.95,0.2,0),M.camo,0,0.95,-2.8); lPart(g,new THREE.BoxGeometry(2.5,2.2,4.6),M.camo,0,1.0,1.4);
  const t=new THREE.Group(); t.position.set(0,3.3,1.4); g.add(t); lPart(t,new THREE.CylinderGeometry(0.15,0.2,1.4,8),M.olive,0,0.7,0);
  const a=lPart(t,new THREE.BoxGeometry(3.6,1.8,0.25),M.dark,0,2.0,0); a.rotation.x=-0.25; return {group:g, turret:t, len:8};
}
