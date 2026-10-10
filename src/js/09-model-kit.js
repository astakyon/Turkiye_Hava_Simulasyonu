/* ------------------------------------------------------------------ model kit: shared tools for the detailed code-built models
   Axes: −Z forward, +Y up, metres. Geometry is built directly in model space where possible, so paint/camouflage
   (which uses model-space position) runs continuously across parts. */
const MK={};
/* grid of rows (each row: array of [x,y,z]) → indexed surface; uv from top-view planar mapping */
MK.grid=function(rows,closeRow,uvFn){
  const n=rows[0].length, v=[], uv=[], idx=[]; uvFn=uvFn||planarUV;
  rows.forEach(function(r){ r.forEach(function(p){ v.push(p[0],p[1],p[2]); const t=uvFn(p[0],p[2],p[1]); uv.push(t[0],t[1]); }); });
  const m=closeRow?n:n-1;
  for(let i=0;i<rows.length-1;i++) for(let j=0;j<m;j++){ const a=i*n+j, b=i*n+(j+1)%n, c=(i+1)*n+j, d=(i+1)*n+(j+1)%n; idx.push(a,b,c, b,d,c); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx);
  g.computeVertexNormals(); return g;
};
/* make normals point away from the shape's centre (handles mirrored/left-side parts without negative scales) */
MK.outward=function(g,center){
  const p=g.attributes.position, n=g.attributes.normal, c=center||new THREE.Vector3(); if(!center){ for(let i=0;i<p.count;i++){ c.x+=p.getX(i); c.y+=p.getY(i); c.z+=p.getZ(i); } c.multiplyScalar(1/p.count); }
  let s=0; for(let i=0;i<p.count;i++) s+=(p.getX(i)-c.x)*n.getX(i)+(p.getY(i)-c.y)*n.getY(i)+(p.getZ(i)-c.z)*n.getZ(i);
  if(s<0){ const ix=g.index.array; for(let i=0;i<ix.length;i+=3){ const t=ix[i+1]; ix[i+1]=ix[i+2]; ix[i+2]=t; } g.index.needsUpdate=true; g.computeVertexNormals(); }
  return g;
};
/* fan cap over a closed ring of points */
MK.cap=function(ring){ const c=[0,0,0]; ring.forEach(function(p){ c[0]+=p[0]; c[1]+=p[1]; c[2]+=p[2]; }); c[0]/=ring.length; c[1]/=ring.length; c[2]/=ring.length;
  const v=[c[0],c[1],c[2]], uv=[], idx=[]; const t0=planarUV(c[0],c[2]); uv.push(t0[0],t0[1]);
  ring.forEach(function(p){ v.push(p[0],p[1],p[2]); const t=planarUV(p[0],p[2]); uv.push(t[0],t[1]); });
  for(let i=0;i<ring.length;i++) idx.push(0,1+i,1+(i+1)%ring.length);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
/* superellipse arc: a from a0 to a1 (radians), half-width w, half-height h, exponent e (2 = ellipse, higher = boxier) */
MK.arc=function(cx,cy,z,w,h,e,a0,a1,n){ const out=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n, c=Math.cos(a), s=Math.sin(a);
  out.push([cx+w*Math.sign(c)*Math.pow(Math.abs(c),2/e), cy+h*Math.sign(s)*Math.pow(Math.abs(s),2/e), z]); } return out; };
/* chined fuselage: stations {z, w (chine half-width), y (chine height), t (top), b (bottom), et, eb}. Returns {top, bot, rings} */
MK.fuselage=function(st,n){
  const top=[], bot=[], rings=[];
  st.forEach(function(s){ const T=MK.arc(0,s.y,s.z,s.w,s.t,s.et||2,0,Math.PI,n), B=MK.arc(0,s.y,s.z,s.w,s.b,s.eb||2.4,0,-Math.PI,n);
    top.push(T); bot.push(B); rings.push(T.concat(B.slice(1,-1).reverse())); });
  return {top:MK.grid(top), bot:MK.grid(bot), rings:rings};
};
/* NACA 4-digit thickness at chord fraction f (t = thickness ratio) */
MK.thick=function(f,t){ f=Math.min(1,Math.max(0,f)); return 5*t*(0.2969*Math.sqrt(f)-0.126*f-0.3516*f*f+0.2843*f*f*f-0.1036*f*f*f*f); };
/* airfoil surface between sections {s (span pos), le, te, t, c0, c1 (chord range)} ; map(s, z, thicknessOffset) → [x,y,z] */
MK.foil=function(sec,map,nc,caps){
  nc=nc||12; const rows=[];
  sec.forEach(function(q){ const up=[], lo=[], c=q.te-q.le, c0=q.c0||0, c1=q.c1==null?1:q.c1;
    for(let i=0;i<=nc;i++){ const u=(1-Math.cos(Math.PI*i/nc))/2, f=c0+(c1-c0)*u, z=q.le+c*f, th=MK.thick(f,q.t)*c; up.push(map(q.s,z,th)); lo.push(map(q.s,z,-th)); }
    rows.push(up.concat(lo.slice().reverse())); });
  const g=MK.grid(rows,true); const parts=[g];
  if(caps){ if(caps.indexOf('a')>=0) parts.push(MK.cap(rows[0])); if(caps.indexOf('b')>=0) parts.push(MK.cap(rows[rows.length-1])); }
  return parts.length>1?MK.merge(parts):g;
};
MK.merge=function(list){ const n=list.reduce(function(a,g){ return a+g.attributes.position.count; },0), P=new Float32Array(n*3), U=new Float32Array(n*2), I=[]; let o=0;
  list.forEach(function(g){ P.set(g.attributes.position.array,o*3); U.set(g.attributes.uv.array,o*2); g.index.array.forEach(function(i){ I.push(i+o); }); o+=g.attributes.position.count; });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('uv',new THREE.BufferAttribute(U,2)); g.setIndex(I); g.computeVertexNormals(); return g; };
/* hinged control surface: geometry given in model space → nested groups so the pivot turns about the hinge line.
   Returns {outer, pivot}; put `pivot` in model.surfaces. axisLocal: 'x' (wing/tail hinge) or 'y' (rudder). */
MK.hinge=function(geo,mat,h0,h1,axis){
  const d=new THREE.Vector3(h1[0]-h0[0],h1[1]-h0[1],h1[2]-h0[2]), outer=new THREE.Group(), pivot=new THREE.Group(); outer.position.set(h0[0],h0[1],h0[2]);
  const q=new THREE.Quaternion().setFromUnitVectors(axis==='y'?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0), d.normalize()); outer.quaternion.copy(q);
  const inv=new THREE.Matrix4().makeRotationFromQuaternion(q).invert(); geo.translate(-h0[0],-h0[1],-h0[2]); geo.applyMatrix4(inv);
  const m=new THREE.Mesh(geo,mat); pivot.add(m); outer.add(pivot); return {outer:outer, pivot:pivot, mesh:m};
};
MK.cyl=function(r0,r1,len,seg,open){ const g=new THREE.CylinderGeometry(r1,r0,len,seg||16,1,!!open); g.rotateX(Math.PI/2); return g; };   /* along z, r0 at front (−z) */
MK.at=function(g,mesh,x,y,z){ mesh.position.set(x,y,z); g.add(mesh); return mesh; };
/* landing-gear leg: strut from (x,yTop,z) down to the wheel centre, wheel radius r, width w; optional twin wheels */
MK.leg=function(gr,x,yTop,z,yWheel,r,w,mats,opt){ opt=opt||{};
  const len=yTop-yWheel, st=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.085,len,10),mats.strut); st.position.set(x,yWheel+len/2,z); gr.add(st);
  const pis=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,len*0.45,10),mats.chrome); pis.position.set(x,yWheel+len*0.3,z); gr.add(pis);
  const tl=new THREE.Mesh(new THREE.BoxGeometry(0.05,len*0.32,0.22),mats.strut); tl.position.set(x,yWheel+len*0.35,z+0.12); tl.rotation.x=0.35; gr.add(tl);
  const xs=opt.twin?[x-w*0.62,x+w*0.62]:[x+(opt.side||0)*w*0.5];
  xs.forEach(function(wx){ const tire=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,20),mats.tire); tire.rotation.z=Math.PI/2; tire.position.set(wx,yWheel,z); gr.add(tire);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*0.55,r*0.55,w*1.04,14),mats.hub); hub.rotation.z=Math.PI/2; hub.position.set(wx,yWheel,z); gr.add(hub); });
  if(opt.axle){ const ax=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,Math.abs(xs[xs.length-1]-x)*2+0.1,8),mats.strut); ax.rotation.z=Math.PI/2; ax.position.set(x,yWheel,z); gr.add(ax); }
};
MK.mats=function(){ return {strut:phong(0xd9dde1,0x667080,40), chrome:phong(0xbfc6cc,0xffffff,90), tire:phong(0x15181b,0x111111,6), hub:phong(0x8f979e,0x555555,30)}; };
/* canvas texture painted in the top-view planar space used by planarUV (64 px per metre over 16 × 24 m) */
MK.planarTex=function(draw,px){ px=px||64; const W=16*px, H=24*px, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  x.fillStyle='#ffffff'; x.fillRect(0,0,W,H); const X=function(m){ return (m+8)*px; }, Z=function(m){ return (m+12)*px; };
  draw(x,X,Z,px); const t=new THREE.CanvasTexture(c); t.anisotropy=8; return t; };
