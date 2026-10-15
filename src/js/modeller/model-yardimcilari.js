/* ------------------------------------------------------------------ shared model helpers */
function phong(c,sp,sh,extra){ return new THREE.MeshPhongMaterial(Object.assign({color:c,specular:sp,shininess:sh},extra||{})); }
const DARK=phong(0x12161b,0x222222,20,{side:THREE.DoubleSide});
const FLAG_MAT=new THREE.MeshBasicMaterial({map:flagTexture(), side:THREE.DoubleSide});
function addFlat(g,pts,th,y,mat){ addFlatD(g,pts,th,y,mat,0); }
function addFlatD(g,pts,th,y,mat,dih){ const geo=flatPart(pts,th); [1,-1].forEach(s=>{ const m=new THREE.Mesh(geo,mat); m.position.y=y; m.scale.x=s; m.rotation.z=s*dih; g.add(m); }); }
function addCanopy(g,sx,sy,sz,y,z){
  const c=new THREE.Mesh(new THREE.SphereGeometry(1,24,16), new THREE.MeshPhongMaterial({color:0x1b2733, specular:0xffffff, shininess:150, transparent:true, opacity:0.92}));
  c.scale.set(sx,sy,sz); c.position.set(0,y,z); g.add(c);
}
function finGeo(pts,depth){ // pts: [u (aft), v (up)]
  const s=new THREE.Shape(); s.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) s.lineTo(pts[i][0],pts[i][1]); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:depth||0.1,bevelEnabled:false}); g.rotateY(-Math.PI/2); return g;
}
function addCenterFin(g,pts,z,y,mat,dc,cap){
  const geo=finGeo(pts,0.1); geo.translate(0.05,0,0);
  const m=new THREE.Mesh(geo,mat); m.position.set(0,y,z); g.add(m);
  if(cap){ const cg=finGeo(cap.pts,0.12); cg.translate(0.06,0,0); const cm=new THREE.Mesh(cg,cap.mat); cm.position.set(0,y,z); g.add(cm); }
  const dg=new THREE.PlaneGeometry(dc.w,dc.h);
  [1,-1].forEach(s=>{ const d=new THREE.Mesh(dg,FLAG_MAT); d.rotation.y=s*Math.PI/2; d.position.set(s*0.064,dc.v,dc.u); m.add(d); });
}
function addTwinFins(g,pts,x,y,z,cant,mat,dc){
  const geo=finGeo(pts,0.1), dg=new THREE.PlaneGeometry(dc.w,dc.h);
  [-1,1].forEach(s=>{
    const holder=new THREE.Group(); holder.position.set(s*x,y,z); if(s<0) holder.scale.x=-1;
    const fin=new THREE.Mesh(geo,mat); fin.rotation.z=-cant; holder.add(fin);
    const d=new THREE.Mesh(dg,FLAG_MAT); d.rotation.y=Math.PI/2; d.position.set(0.012,dc.v,dc.u); fin.add(d); g.add(holder);
  });
}
function boom(g,x,y,z0,z1,r0,r1,mat){ // tube along z, r0 at z0 (front) and r1 at z1 (rear)
  const geo=new THREE.CylinderGeometry(r1,r0,z1-z0,12); geo.rotateX(Math.PI/2);
  const m=new THREE.Mesh(geo,mat); m.position.set(x,y,(z0+z1)/2); g.add(m); return m;
}
function ball(g,r,x,y,z,mat){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),mat); m.position.set(x,y,z); g.add(m); return m; }
function addStores(g,list,mat){ // list: [x,y,z,len,r], mirrored left/right
  list.forEach(l=>{ const geo=new THREE.CylinderGeometry(l[4],l[4],l[3],8); geo.rotateX(Math.PI/2);
    [1,-1].forEach(s=>{ const m=new THREE.Mesh(geo,mat); m.position.set(s*l[0],l[1],l[2]); g.add(m); }); });
}
function addPitot(g,z,len){ boom(g,0,0.02,z-len,z,0.02,0.035,DARK); }
const GEAR_STRUT=new THREE.CylinderGeometry(0.07,0.07,1.6,8);
const GEAR_WHEEL=(function(){ const w=new THREE.CylinderGeometry(0.4,0.4,0.28,14); w.rotateZ(Math.PI/2); return w; })();
const GEAR_MAT_S=phong(0xd6b02a,0x444444,20), GEAR_MAT_W=phong(0x1f2227,0x222222,10);
const LEG=(x,y,z,rad,off)=>[x,y,z,off+y-rad,rad]; // wheel bottom ends exactly 'off' below the origin
function buildGear(legs){
  const gr=new THREE.Group();
  legs.forEach(l=>{ const x=l[0], y=l[1], z=l[2], len=l[3], rad=l[4], k=Math.min(1,rad/0.3);
    const st=new THREE.Mesh(GEAR_STRUT,GEAR_MAT_S); st.scale.set(k,len/1.6,k); st.position.set(x,y-len/2,z); gr.add(st);
    const w=new THREE.Mesh(GEAR_WHEEL,GEAR_MAT_W); w.scale.set(k,rad/0.4,rad/0.4); w.position.set(x,y-len,z); gr.add(w); });
  return gr;
}
const FM_O=new THREE.MeshBasicMaterial({color:0xff8a2a, transparent:true, opacity:0.72, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
const FM_I=new THREE.MeshBasicMaterial({color:0xcfeaff, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
const FM_D=new THREE.MeshBasicMaterial({color:0xfff0c8, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false});
function makeDiamonds(g,r){ const a=[]; for(let i=0;i<3;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.2*r,8,6),FM_D); m.visible=false; g.add(m); a.push(m); } return a; }
function addFlames(g,positions,r){
  const out=[];
  positions.forEach(p=>{
    const go=new THREE.ConeGeometry(0.55*r,1,14,1,true); go.translate(0,0.5,0); go.rotateX(Math.PI/2);
    const gi=new THREE.ConeGeometry(0.32*r,1,12,1,true); gi.translate(0,0.5,0); gi.rotateX(Math.PI/2);
    const fo=new THREE.Mesh(go,FM_O), fi=new THREE.Mesh(gi,FM_I); fo.position.set(p[0],p[1],p[2]); fi.position.set(p[0],p[1],p[2]); g.add(fo); g.add(fi);
    out.push({outer:fo,inner:fi,base:[p[0],p[1],p[2]],ds:makeDiamonds(g,r)});
  });
  return out;
}
function addNozzle(g,x,y,z,r,len){ const ng=new THREE.CylinderGeometry(r,r*0.82,len,16,1,true); ng.rotateX(Math.PI/2); const n=new THREE.Mesh(ng,DARK); n.position.set(x,y,z); g.add(n); }
function addLights(g,tip,strobePos){
  const lg=new THREE.SphereGeometry(0.14,8,8);
  const r=new THREE.Mesh(lg,new THREE.MeshBasicMaterial({color:0xff2222})); r.position.set(-tip[0],tip[1],tip[2]);
  const gr=new THREE.Mesh(lg,new THREE.MeshBasicMaterial({color:0x22ff66})); gr.position.set(tip[0],tip[1],tip[2]);
  const s=new THREE.Mesh(lg,new THREE.MeshBasicMaterial({color:0xffffff})); s.position.set(strobePos[0],strobePos[1],strobePos[2]); s.scale.setScalar(1.6);
  [r,gr,s].forEach(function(m){ m.material.userData.glow=4; }); g.add(r); g.add(gr); g.add(s); return s;
}
function addProp(g,z,radius,blades,dir,hubColor,px,py){ // dir +1: pusher (hub toward tail), -1: tractor (hub toward nose)
  const pg=new THREE.Group(); pg.position.set(px||0,py||0,z);
  const bm=new THREE.MeshPhongMaterial({color:0x1a1d21, side:THREE.DoubleSide}), bg=new THREE.BoxGeometry(radius*0.13,radius,0.03);
  for(let i=0;i<blades;i++){ const h=new THREE.Group(); h.rotation.z=i/blades*Math.PI*2; const b=new THREE.Mesh(bg,bm); b.position.y=radius/2; h.add(b); pg.add(h); }
  const hub=new THREE.Mesh(new THREE.ConeGeometry(radius*0.16,radius*0.5,12),phong(hubColor||0x2a2e33,0x666666,40));
  hub.rotation.x=dir>0?Math.PI/2:-Math.PI/2; hub.position.z=dir*radius*0.2; pg.add(hub);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(radius,28),new THREE.MeshBasicMaterial({color:0x8899aa, transparent:true, opacity:0.05, depthWrite:false, side:THREE.DoubleSide}));
  pg.add(disc); g.add(pg); return {obj:pg, disc:disc};
}
function noseCap(st,n,k){ return st.slice(0,n).map(s=>({z:s.z,hw:s.hw*k+.01,ht:s.ht*k+.01,hb:s.hb*k+.01,yc:s.yc})); }
const RED_M=phong(0xc8102e,0x553333,30,{side:THREE.DoubleSide});

