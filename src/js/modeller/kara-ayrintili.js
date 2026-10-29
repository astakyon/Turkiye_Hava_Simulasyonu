/* ------------------------------------------------------------------ land vehicles — detailed models (V2.49, model series)
   Altay (MBT, 7 road wheels, 120 mm L/55, wedge turret), T-155 Fırtına (155 mm/52 howitzer, 6 road wheels), FNSS Pars III 8×8,
   Otokar Kirpi 4×4 MRAP, Aselsan Korkut (twin 35 mm, search radar, ACV-30 chassis), Aselsan Hisar-A (tracked, four missiles, EO).
   Faceted hulls (fHull) give the flat armour plates; road wheels, idlers, sprockets and textured track belts replace the boxes.
   Same return shape as the old builders ({group, turret, elev, radar, len}); the old models stay as buildXV1 for the library comparison. */
function landMats2(){
  const M=landMats(); if(M.trk) return M;
  const L=function(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})); };
  M.camo.map.wrapS=M.camo.map.wrapT=THREE.RepeatWrapping; M.camo.map.needsUpdate=true;
  const sandT=apTex(128,128,function(x,W,H){ x.fillStyle='#b9a77e'; x.fillRect(0,0,W,H); const q=mulberry32(7);
    [['#a8956b',22],['#c7b78f',18]].forEach(function(c){ x.fillStyle=c[0]; for(let i=0;i<c[1];i++){ x.beginPath(); x.ellipse(q()*W,q()*H,6+q()*14,4+q()*9,q()*3,0,6.3); x.fill(); } }); });
  sandT.wrapS=sandT.wrapT=THREE.RepeatWrapping;
  const trkT=apTex(16,64,function(x,W,H){ x.fillStyle='#2a2c2e'; x.fillRect(0,0,W,H); x.fillStyle='#17181a'; for(let i=0;i<8;i++) x.fillRect(0,i*8,W,3); x.fillStyle='#45484b'; x.fillRect(6,0,4,H); });
  trkT.wrapS=trkT.wrapT=THREE.RepeatWrapping;
  Object.assign(M,{trk:L(0xffffff,{map:trkT}), sand2:L(0xffffff,{map:sandT}), rim:L(0x6a7050), rimS:L(0xa8977a), gun:L(0x535a3c), black:L(0x15171a),
    lens:new THREE.MeshLambertMaterial({color:0x2a4a5a, emissive:0x0b1a22}), red:L(0xb3241b), white:L(0xe8e8e2)});
  return M;
}
/* closed faceted solid from rings [{z, p:[[x,y]…]}] (same point count). Flat normals, outward by centroid, planar camo uv. */
function fHull(rings,mat,uvk){
  const P=[], U=[], k=uvk||0.22; let cx=0,cy=0,cz=0,n=0;
  rings.forEach(function(r){ r.p.forEach(function(q){ cx+=q[0]; cy+=q[1]; cz+=r.z; n++; }); }); cx/=n; cy/=n; cz/=n;
  const tri=function(a,b,c){ const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; if(nx*nx+ny*ny+nz*nz<1e-10) return;
    if(nx*((a[0]+b[0]+c[0])/3-cx)+ny*((a[1]+b[1]+c[1])/3-cy)+nz*((a[2]+b[2]+c[2])/3-cz)<0){ const t=b; b=c; c=t; }
    [a,b,c].forEach(function(p){ P.push(p[0],p[1],p[2]); U.push((p[0]+p[2])*k,(p[1]+p[2]*0.37)*k); }); };
  const R=rings.map(function(r){ return r.p.map(function(q){ return [q[0],q[1],r.z]; }); }), m=R[0].length;
  for(let i=0;i<R.length-1;i++) for(let j=0;j<m;j++){ const a=R[i][j], b=R[i][(j+1)%m], c=R[i+1][j], d=R[i+1][(j+1)%m]; tri(a,b,c); tri(b,d,c); }
  [R[0],R[R.length-1]].forEach(function(ring){ const c=[0,0,0]; ring.forEach(function(p){ c[0]+=p[0]/m; c[1]+=p[1]/m; c[2]+=p[2]/m; }); for(let j=0;j<m;j++) tri(c,ring[j],ring[(j+1)%m]); });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.computeVertexNormals();
  return new THREE.Mesh(g,mat);
}
/* hull cross-section: lower hull ±wl between the tracks, guards ±wg; yb bottom, yg guard height, yt top */
function lSec(z,yb,yg,yt,wl,wg){ return {z:z,p:[[wl,yb],[wl,yg],[wg,yg+0.03],[wg,yt],[-wg,yt],[-wg,yg+0.03],[-wl,yg],[-wl,yb]]}; }
/* turret / armour box section: half width w, bottom y0, shoulder at ys, top yt (top narrowed by kt) */
function tSec(z,w,y0,ys,yt,kt,kb){ return {z:z,p:[[w*(kb||0.94),y0],[w,ys],[w*(kt||0.9),yt],[-w*(kt||0.9),yt],[-w,ys],[-w*(kb||0.94),y0]]}; }
function lCyl(g,mat,x,y,z,r0,r1,len,seg){ return lPart(g,MK.cyl(r0,r1,len,Math.min(seg||8,8)),mat,x,y,z); }
function lBox(g,mat,x,y,z,w,h,d){ return lPart(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z); }
/* road wheel with rim and hub */
function rWheel(g,M,x,y,z,r,w,rim){ const s=Math.sign(x)||1;
  lPart(g,new THREE.CylinderGeometry(r,r,w,10),M.wheel,x,y,z).rotation.z=Math.PI/2;
  if(r<0.15) return;
  lPart(g,new THREE.CircleGeometry(r*0.68,8),rim||M.rim,x+s*(w/2+0.005),y,z).rotation.y=s*Math.PI/2;
  lPart(g,new THREE.CircleGeometry(r*0.22,6),M.dark,x+s*(w/2+0.012),y,z).rotation.y=s*Math.PI/2; }
/* textured box (track belt): uv along its length repeats the links */
function trkBox(g,M,x,y,z,w,h,len){ const geo=new THREE.BoxGeometry(w,h,len), uv=geo.attributes.uv; for(let i=0;i<uv.count;i++) uv.setY(i,uv.getY(i)*len*1.6); const m=lPart(g,geo,M.trk,x,y,z); return m; }
/* running gear on both sides: n road wheels between z0 (front) and z1 (rear), idler in front, sprocket at the rear, return rollers */
function trackRun(g,M,xo,z0,z1,n,r,tw,o){ o=o||{};
  const len=z1-z0, zc=(z0+z1)/2, yi=r*1.55;
  [-1,1].forEach(function(s){ const x=s*xo;
    trkBox(g,M,x,0.05,zc,tw,0.1,len-2*r*0.3);
    trkBox(g,M,x,2*r+0.28,zc,tw,0.08,len-0.2);
    [[z0,yi,r*0.8],[z1,yi,r*0.85]].forEach(function(e,k){ const c=lPart(g,new THREE.CylinderGeometry(e[2]+0.06,e[2]+0.06,tw,6,1,true,k?-Math.PI/2:Math.PI/2,Math.PI),M.trk,x,e[1],e[0]); c.rotation.z=Math.PI/2;
      rWheel(g,M,x,e[1],e[0],e[2],tw*0.7,o.rim);  });
    /* belt runs between the bottom and the idler/sprocket */
    [[z0,-1],[z1,1]].forEach(function(e){ const a=new THREE.Vector3(0,0.05,e[0]-e[1]*(r*0.3)), b=new THREE.Vector3(0,yi-r*0.8-0.03,e[0]), d=b.clone().sub(a);
      const m=trkBox(g,M,x,(a.y+b.y)/2,(a.z+b.z)/2,tw,0.08,d.length()); m.rotation.x=Math.atan2(-d.y,d.z); });
    for(let i=0;i<n;i++){ const z=z0+r*1.4+i*(len-r*2.8)/(n-1); rWheel(g,M,x,r+0.06,z,r,tw*0.78,o.rim); }
    for(let i=0;i<(o.ret||3);i++){ const z=z0+len*(0.22+i*0.56/((o.ret||3)-1)); rWheel(g,M,x,2*r+0.14,z,0.1,tw*0.4,o.rim); }
  });
}
function smokeLaunchers(g,M,x,y,z,n,dir){ for(let i=0;i<n;i++){ const c=lCyl(g,M.dark,x,y+0.02*i,z+i*0.16,0.055,0.055,0.32,5); c.rotation.x=-0.7; c.rotation.y=dir*0.5; } }
function antenna(g,M,x,y,z,h){ lCyl(g,M.dark,x,y+0.05,z,0.06,0.06,0.1,8).rotation.x=Math.PI/2; lPart(g,new THREE.CylinderGeometry(0.012,0.02,h,5),M.black,x,y+h/2,z); }
function lHatch(g,M,x,y,z,r){ lPart(g,new THREE.CylinderGeometry(r,r*1.04,0.08,14),M.olive,x,y+0.04,z); lPart(g,new THREE.CylinderGeometry(r*0.2,r*0.2,0.04,8),M.dark,x,y+0.1,z+r*0.5); }
/* periscope / sight head with a lens */
function lSight(g,M,x,y,z,w,h,d){ lBox(g,M.dark,x,y+h/2,z,w,h,d); lBox(g,M.lens,x,y+h*0.55,z-d/2-0.005,w*0.7,h*0.45,0.02); }
function lLights(g,M,x,y,z){ [-1,1].forEach(function(s){ lBox(g,M.dark,s*x,y,z+0.03,0.3,0.16,0.12); lBox(g,M.lamp,s*x,y,z-0.035,0.24,0.1,0.02); }); }
/* side skirt made of separate armour panels */
function skirts(g,M,mat,x,z0,z1,y0,y1,n){ const d=(z1-z0)/n; [-1,1].forEach(function(s){ for(let i=0;i<n;i++) lBox(g,mat,s*x,(y0+y1)/2,z0+d*(i+0.5),0.08,y1-y0,d-0.04);
  lBox(g,M.dark,s*(x+0.01),y0+0.05,(z0+z1)/2,0.09,0.06,z1-z0); }); }
/* ---------------------------------------------------------------- Altay main battle tank */
function buildAltay(){
  const M=landMats2(), g=new THREE.Group();
  trackRun(g,M,1.55,-3.45,3.45,7,0.36,0.62,{ret:3});
  g.add(fHull([lSec(-3.78,0.82,0.95,1.04,1.18,1.94),lSec(-3.15,0.42,0.95,1.3,1.18,1.94),lSec(-2.3,0.4,0.95,1.62,1.2,1.94),lSec(3.35,0.42,0.95,1.62,1.2,1.94),lSec(3.66,0.62,0.95,1.56,1.2,1.94)],M.camo));
  skirts(g,M,M.camo,1.98,-3.2,2.6,0.48,1.0,6);
  lLights(g,M,1.45,1.12,-3.62); lBox(g,M.dark,0,0.62,-3.5,0.5,0.2,0.2);
  [-0.35,0.35].forEach(function(x){ lBox(g,M.lens,x,1.66,-2.05,0.2,0.08,0.1); });   /* driver periscopes */
  for(let i=0;i<5;i++) lBox(g,M.dark,0,1.63,1.8+i*0.32,2.6,0.03,0.12);   /* engine deck grille */
  [-1,1].forEach(function(s){ lBox(g,M.dark,s*0.9,1.25,3.67,0.6,0.35,0.04); lBox(g,M.dark,s*1.6,0.75,3.65,0.18,0.18,0.18); });   /* exhaust, tow hooks */
  /* turret: wedge front, long bustle */
  const t=new THREE.Group(); t.position.set(0,1.62,0.3); g.add(t);
  t.add(fHull([tSec(-2.35,0.5,0.02,0.32,0.6,0.9),tSec(-1.55,1.42,0,0.36,0.78,0.92),tSec(0.6,1.62,0,0.4,0.84,0.92),tSec(2.2,1.56,0.02,0.4,0.82,0.92),tSec(3.35,1.18,0.12,0.4,0.74,0.9)],M.camo));
  lBox(t,M.camo,0,0.42,-2.3,0.95,0.6,0.55);   /* mantlet */
  const gun=new THREE.Group(); gun.position.set(0,0.42,-2.55); t.add(gun);
  lCyl(gun,M.gun,0,0,-0.6,0.2,0.18,1.2,12); lCyl(gun,M.gun,0,0,-2.8,0.12,0.12,3.4,12); lCyl(gun,M.gun,0,0,-2.2,0.19,0.19,0.8,12);   /* thermal sleeve, fume extractor */
  [-1.6,-3.4,-4.4].forEach(function(z){ lCyl(gun,M.dark,0,0,z,0.135,0.135,0.06,12); });
  lCyl(gun,M.gun,0,0,-5.0,0.12,0.1,1.2,12); lCyl(gun,M.dark,0,0,-5.6,0.11,0.11,0.06,12); lBox(gun,M.dark,0,0.14,-5.45,0.08,0.08,0.12);   /* muzzle reference sensor */
  lCyl(t,M.dark,0.55,0.42,-2.65,0.04,0.04,0.6,8);   /* coaxial MG */
  lPart(t,new THREE.CylinderGeometry(0.2,0.22,0.3,12),M.olive,-0.85,0.95,-0.8); lSight(t,M,-0.85,1.1,-0.8,0.46,0.34,0.4);   /* commander panoramic sight */
  lSight(t,M,0.95,0.84,-1.55,0.46,0.36,0.5);   /* gunner sight */
  lHatch(t,M,-0.6,0.84,0.4,0.38); lHatch(t,M,0.6,0.84,0.1,0.34);
  /* remote weapon station on the turret roof */
  const rw=new THREE.Group(); rw.position.set(0.35,0.84,1.05); t.add(rw); lPart(rw,new THREE.CylinderGeometry(0.22,0.25,0.12,10),M.dark,0,0.06,0); lBox(rw,M.olive,0,0.3,0,0.42,0.32,0.5); lBox(rw,M.lens,0.12,0.34,-0.26,0.12,0.12,0.02); lCyl(rw,M.dark,-0.08,0.32,-0.75,0.03,0.035,1.0,8);
  [-1,1].forEach(function(s){ smokeLaunchers(t,M,s*1.42,0.58,-1.1,4,s); });
  antenna(t,M,-1.05,0.8,2.7,2.4); antenna(t,M,1.05,0.8,2.7,2.0);
  lBox(t,M.dark,0,0.45,3.5,2.3,0.5,0.3); for(let i=0;i<4;i++) lBox(t,M.olive,-0.9+i*0.6,0.45,3.66,0.03,0.48,0.04);   /* bustle stowage basket */
  [-1,1].forEach(function(s){ lBox(t,M.dark,s*1.55,0.55,1.8,0.06,0.3,1.6); });   /* side stowage */
  return {group:g, turret:t, len:10.3};
}
/* ---------------------------------------------------------------- T-155 Fırtına self-propelled howitzer */
function buildFirtina(){
  const M=landMats2(), g=new THREE.Group();
  trackRun(g,M,1.45,-3.25,3.3,6,0.36,0.58,{ret:3});
  g.add(fHull([lSec(-3.58,0.78,0.92,1.05,1.08,1.82),lSec(-2.9,0.4,0.92,1.5,1.1,1.82),lSec(3.4,0.42,0.92,1.5,1.1,1.82)],M.camo));
  skirts(g,M,M.camo,1.86,-3.0,2.9,0.5,0.98,5); lLights(g,M,1.3,1.1,-3.5);
  lBox(g,M.lens,-0.85,1.55,-2.6,0.3,0.1,0.12);
  /* travel lock on the glacis */
  [-1,1].forEach(function(s){ const a=lBox(g,M.dark,s*0.25,1.65,-3.1,0.08,0.6,0.08); a.rotation.z=s*0.3; }); lBox(g,M.dark,0,1.95,-3.1,0.5,0.12,0.2);
  lBox(g,M.dark,0,1.0,3.42,1.2,0.7,0.06);   /* rear door */
  const t=new THREE.Group(); t.position.set(0,1.5,0.85); g.add(t);
  t.add(fHull([tSec(-2.3,1.2,0.02,0.6,0.95,0.86),tSec(-1.7,1.5,0,0.7,1.42,0.92),tSec(2.3,1.55,0,0.7,1.48,0.92),tSec(2.55,1.5,0.1,0.7,1.4,0.9)],M.camo));
  lBox(t,M.camo,0,0.7,-2.3,0.9,0.75,0.5);
  const gun=new THREE.Group(); gun.position.set(0,0.72,-2.55); t.add(gun);
  lCyl(gun,M.gun,0,0,-0.5,0.26,0.24,1.0,12); lCyl(gun,M.gun,0,0,-4.2,0.13,0.12,6.6,12); lCyl(gun,M.gun,0,0,-3.2,0.19,0.19,0.9,12);   /* barrel, bore evacuator */
  lBox(gun,M.gun,0,0,-7.75,0.4,0.3,0.55); [-1,1].forEach(function(s){ for(let i=0;i<3;i++) lBox(gun,M.black,s*0.2,0,-7.6-i*0.15,0.02,0.18,0.08); });   /* muzzle brake */
  lHatch(t,M,-0.8,1.46,0.2,0.36); lHatch(t,M,0.7,1.46,0.6,0.32);
  { const mg=new THREE.Group(); mg.position.set(-0.8,1.55,0.2); t.add(mg); lBox(mg,M.dark,0,0.12,0,0.12,0.22,0.12); lCyl(mg,M.dark,0,0.25,-0.5,0.03,0.035,0.95,8); }
  lSight(t,M,0.95,1.46,-1.2,0.4,0.35,0.4);
  [-1,1].forEach(function(s){ lBox(t,M.dark,s*1.56,0.75,0.3,0.04,0.9,0.8); smokeLaunchers(t,M,s*1.4,1.15,-1.6,3,s); });
  antenna(t,M,-1.2,1.46,2.2,2.2); antenna(t,M,1.2,1.46,2.2,1.8);
  lBox(t,M.dark,0,0.9,2.57,1.6,0.7,0.05);   /* rear ammunition door */
  return {group:g, turret:t, len:11.7};
}
/* ---------------------------------------------------------------- FNSS Pars III 8×8 */
function buildPars(){
  const M=landMats2(), g=new THREE.Group();
  [-2.75,-1.45,0.85,2.15].forEach(function(z){ [-1,1].forEach(function(s){ rWheel(g,M,s*1.2,0.6,z,0.6,0.42); lBox(g,M.dark,s*0.75,0.62,z,0.5,0.14,0.18); }); });
  const S=function(z,yb,yt,k){ k=k||1; return {z:z,p:[[0.55*k,yb],[1.25*k,yb+(yt-yb)*0.24],[1.36*k,yb+(yt-yb)*0.64],[1.16*k,yt],[-1.16*k,yt],[-1.36*k,yb+(yt-yb)*0.64],[-1.25*k,yb+(yt-yb)*0.24],[-0.55*k,yb]]}; };
  g.add(fHull([S(-3.95,0.95,1.45,0.94),S(-3.35,0.5,1.95),S(-2.55,0.46,2.2),S(3.6,0.5,2.2),S(3.85,0.62,2.12,0.98)],M.camo));
  [-1,1].forEach(function(s){ [-2.1,1.5].forEach(function(z){ lBox(g,M.dark,s*1.3,1.25,z,0.1,0.06,2.0); }); });   /* wheel arch lips */
  lBox(g,M.glass,-0.55,1.85,-3.6,0.6,0.32,0.04).rotation.x=-0.7; lBox(g,M.glass,0.25,1.85,-3.6,0.6,0.32,0.04).rotation.x=-0.7;   /* driver/commander vision blocks */
  lLights(g,M,1.0,1.25,-3.95); lBox(g,M.dark,0,0.9,-3.97,1.8,0.12,0.06);
  [-1,1].forEach(function(s){ lBox(g,M.dark,s*1.37,1.4,0.0,0.04,0.9,0.75); lBox(g,M.dark,s*1.0,2.1,-3.1,0.06,0.25,0.06); });   /* side doors, mirrors */
  lBox(g,M.dark,0,1.35,3.87,1.7,1.25,0.05);   /* rear ramp */
  lHatch(g,M,-0.6,2.2,2.3,0.32); lHatch(g,M,0.6,2.2,2.3,0.32);
  /* two-man 30 mm turret */
  const r=new THREE.Group(); r.position.set(0,2.2,0.0); g.add(r);
  lPart(r,new THREE.CylinderGeometry(0.9,0.95,0.14,16),M.dark,0,0.07,0);
  r.add(fHull([tSec(-0.95,0.5,0.12,0.3,0.55,0.75),tSec(-0.45,0.95,0.12,0.35,0.72,0.88),tSec(0.9,0.95,0.12,0.35,0.72,0.88),tSec(1.2,0.8,0.14,0.32,0.66,0.85)],M.camo));
  lBox(r,M.camo,0,0.38,-1.0,0.5,0.34,0.3); lCyl(r,M.gun,0,0.38,-1.85,0.06,0.05,1.7,10); lCyl(r,M.gun,0,0.38,-1.5,0.09,0.09,0.4,10); lCyl(r,M.dark,0,0.38,-2.7,0.065,0.065,0.12,10);
  lSight(r,M,0.55,0.72,-0.2,0.34,0.3,0.34); lSight(r,M,-0.55,0.72,0.3,0.3,0.36,0.3);
  [-1,1].forEach(function(s){ smokeLaunchers(r,M,s*0.95,0.45,-0.4,3,s); });
  antenna(g,M,-1.0,2.2,3.3,2.2); antenna(g,M,1.0,2.2,3.3,2.0);
  return {group:g, turret:r, len:7.9};
}
/* ---------------------------------------------------------------- Otokar Kirpi 4×4 MRAP */
function buildKirpi(){
  const M=landMats2(), g=new THREE.Group();
  [-1.95,1.85].forEach(function(z){ [-1,1].forEach(function(s){ rWheel(g,M,s*1.08,0.58,z,0.58,0.42,M.rimS); }); });
  lBox(g,M.dark,0,0.62,0,1.0,0.25,5.6);   /* chassis */
  const S=function(z,yb,yt,w){ const a=yb+(yt-yb)*0.22, b=yb+(yt-yb)*0.34; return {z:z,p:[[0.5*w,yb],[1.05*w,a],[1.25*w,b],[1.2*w,yt],[-1.2*w,yt],[-1.25*w,b],[-1.05*w,a],[-0.5*w,yb]]}; };
  /* V-hull body with the tall crew cabin */
  g.add(fHull([S(-1.0,0.7,2.25,1),S(-0.6,0.62,2.85,1),S(3.0,0.62,2.85,1),S(3.2,0.75,2.75,0.98)],M.sand2));
  /* engine compartment and sloped bonnet */
  g.add(fHull([S(-3.25,0.85,1.5,0.86),S(-2.8,0.72,1.75,0.92),S(-1.0,0.7,2.25,1)],M.sand2));
  lBox(g,M.dark,0,1.1,-3.27,1.6,0.5,0.05); for(let i=0;i<5;i++) lBox(g,M.black,0,0.95+i*0.09,-3.29,1.4,0.03,0.02);   /* grille */
  lBox(g,M.dark,0,0.75,-3.35,2.3,0.22,0.15);   /* bumper */
  lLights(g,M,0.85,1.45,-3.0);
  /* windscreen and thick side windows */
  [-1,1].forEach(function(s){ const w=lBox(g,M.glass,s*0.55,2.5,-0.82,1.0,0.65,0.05); w.rotation.x=-0.45;
    for(let k=0;k<3;k++) lBox(g,M.glass,s*1.21,2.35,-0.1+k*1.15,0.05,0.42,0.55);
    lBox(g,M.dark,s*1.3,2.45,-0.95,0.12,0.25,0.06); lBox(g,M.dark,s*1.24,1.6,0.25,0.04,1.0,0.9);   /* mirrors, crew doors */
    lBox(g,M.dark,s*1.2,0.95,-0.4,0.25,0.06,0.5); });   /* steps */
  lBox(g,M.dark,0,1.7,3.22,1.3,1.6,0.05);   /* rear door */
  { const sp=new THREE.Group(); sp.position.set(0.45,1.85,3.42); sp.rotation.y=-Math.PI/2; g.add(sp); rWheel(sp,M,0.01,0,0,0.5,0.3,M.rimS); }   /* spare wheel */
  /* roof hatch with the remote weapon station */
  const rw=new THREE.Group(); rw.position.set(0,2.85,0.6); g.add(rw);
  lPart(rw,new THREE.CylinderGeometry(0.45,0.5,0.14,14),M.dark,0,0.07,0); lBox(rw,M.sand2,0,0.35,0,0.5,0.38,0.6); lBox(rw,M.lens,0.15,0.38,-0.31,0.14,0.14,0.02);
  lCyl(rw,M.dark,-0.1,0.38,-0.85,0.035,0.04,1.1,8);
  antenna(g,M,-1.0,2.85,2.8,2.0);
  return {group:g, len:6.6};
}
/* ---------------------------------------------------------------- Aselsan Korkut (twin 35 mm, ACV-30 chassis) */
function buildKorkut(){
  const M=landMats2(), g=new THREE.Group();
  trackRun(g,M,1.3,-3.0,3.0,6,0.33,0.52,{ret:2});
  g.add(fHull([lSec(-3.35,0.72,0.85,0.95,1.0,1.62),lSec(-2.6,0.38,0.85,1.5,1.0,1.62),lSec(3.2,0.4,0.85,1.5,1.0,1.62)],M.camo));
  lLights(g,M,1.1,1.0,-3.3); lBox(g,M.lens,-0.7,1.53,-2.4,0.3,0.1,0.1);
  for(let i=0;i<4;i++) lBox(g,M.dark,0.5,1.51,-1.8+i*0.25,0.9,0.03,0.12);   /* engine grille (front engine) */
  lBox(g,M.dark,0,0.95,3.22,1.2,0.8,0.05);
  const t=new THREE.Group(); t.position.set(0,1.5,0.6); g.add(t);
  lPart(t,new THREE.CylinderGeometry(0.95,1.0,0.12,16),M.dark,0,0.06,0);
  t.add(fHull([tSec(-1.35,0.75,0.1,0.45,0.85,0.85),tSec(-0.8,1.05,0.1,0.5,1.0,0.9),tSec(1.2,1.05,0.1,0.5,1.0,0.9),tSec(1.5,0.9,0.12,0.45,0.92,0.88)],M.camo));
  [-1,1].forEach(function(s){ const pod=new THREE.Group(); pod.position.set(s*1.3,0.6,-0.3); t.add(pod);
    lBox(pod,M.camo,0,0,0,0.42,0.55,1.5); lCyl(pod,M.gun,0,0,-1.3,0.09,0.09,1.1,10); lCyl(pod,M.gun,0,0,-2.6,0.06,0.055,1.6,10); lCyl(pod,M.dark,0,0,-3.5,0.075,0.075,0.25,10); });
  lSight(t,M,0.0,1.0,-0.8,0.4,0.36,0.4);
  /* fire-control radar on the front, search radar on the mast at the back */
  lBox(t,M.dark,-0.55,1.15,-0.6,0.5,0.4,0.15).rotation.x=-0.15;
  lPart(t,new THREE.CylinderGeometry(0.08,0.1,0.6,8),M.olive,0,1.3,0.95);
  const rd=new THREE.Group(); rd.position.set(0,1.62,0.95); t.add(rd); const ant=lBox(rd,M.dark,0,0.1,0,1.3,0.55,0.1); ant.rotation.x=-0.2; lBox(rd,M.olive,0,-0.2,0.05,0.2,0.15,0.2);
  antenna(t,M,-0.85,1.0,1.3,1.8);
  return {group:g, turret:t, radar:rd, len:6.6};
}
/* ---------------------------------------------------------------- Aselsan/Roketsan Hisar-A (tracked, four missiles, EO sensor) */
function buildHisar(){
  const M=landMats2(), g=new THREE.Group();
  trackRun(g,M,1.3,-3.0,3.0,6,0.33,0.52,{ret:2});
  g.add(fHull([lSec(-3.35,0.72,0.85,0.95,1.0,1.62),lSec(-2.6,0.38,0.85,1.5,1.0,1.62),lSec(3.2,0.4,0.85,1.5,1.0,1.62)],M.camo));
  lLights(g,M,1.1,1.0,-3.3); lBox(g,M.lens,-0.7,1.53,-2.4,0.3,0.1,0.1);
  { const cab=fHull([tSec(-2.4,0.95,0,0.4,0.75,0.9),tSec(-0.5,0.95,0,0.4,0.75,0.9)],M.camo); cab.position.set(0,1.5,0); g.add(cab); }   /* crew cabin */
  lBox(g,M.glass,0,2.05,-2.55,1.4,0.3,0.04).rotation.x=-0.5;
  const t=new THREE.Group(); t.position.set(0,1.5,1.45); g.add(t);
  lPart(t,new THREE.CylinderGeometry(0.8,0.85,0.25,16),M.olive,0,0.12,0); lBox(t,M.camo,0,0.55,0,0.7,0.7,0.8);
  lSight(t,M,0,0.9,-0.1,0.3,0.36,0.34);   /* EO sensor */
  const el=new THREE.Group(); el.position.set(0,0.65,0); t.add(el);
  [-1,1].forEach(function(s){ lBox(el,M.olive,s*0.5,0,0,0.12,0.2,0.4);
    for(let j=0;j<2;j++){ const c=lCyl(el,M.camo,s*0.98,-0.2+j*0.45,0.2,0.2,0.2,3.2,12); lCyl(el,M.white,s*0.98,-0.2+j*0.45,-1.41,0.18,0.18,0.03,12); lCyl(el,M.dark,s*0.98,-0.2+j*0.45,1.81,0.21,0.21,0.04,12); } });
  lBox(el,M.dark,0,0.03,0.2,1.95,0.12,0.5);
  el.rotation.x=0.55;
  antenna(g,M,-1.0,1.5,2.9,2.2);
  return {group:g, turret:t, elev:el, len:6.6};
}
