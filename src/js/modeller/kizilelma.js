/* ------------------------------------------------------------------ Bayraktar Kızılelma — detailed model (V2.45, model series)
   14,5 m long, 3,5 m tall (Baykar infographic), ~10 m span. From the player's photos: long chined nose with a nose probe, faceted
   upper body over a flat lower body, canards at the chine, swept main wing with a straight trailing edge, two large fins canted
   outward, side intakes under the chine, one engine with a round nozzle between two flat tail extensions, tricycle gear.
   Dark grey with KIZILELMA lettering, white bars and the flag on the fins. Stores: missiles in the internal bay (doors open for each launch), bombs under the wing. The old model stays as buildOld for the library comparison. */
function kzPaint(){
  return MK.planarTex(function(x,X,Z,px){
    x.fillStyle='#ffffff'; x.fillRect(0,0,16*px,24*px);
    x.strokeStyle='rgba(20,24,30,0.45)'; x.lineWidth=2;
    const L=function(a){ x.beginPath(); x.moveTo(X(a[0]),Z(a[1])); for(let i=2;i<a.length;i+=2) x.lineTo(X(a[i]),Z(a[i+1])); x.stroke(); };
    [1,-1].forEach(function(s){ L([s*0.55,-6.0, s*0.75,6.4]); L([s*1.3,-2.2, s*1.45,5.4]); L([s*2.2,4.3, s*4.9,4.4]); L([s*3.4,1.6, s*3.4,4.5]); });
    for(let z=-4.5; z<=5; z+=1.5){ L([-0.55,z,0.55,z]); }
    /* small light access-panel dots, as on the aircraft */
    x.fillStyle='rgba(235,240,245,0.85)'; const r=mulberry32(77);
    for(let i=0;i<46;i++){ const xm=(r()-0.5)*2.6, zm=-5.5+r()*11; x.fillRect(X(xm),Z(zm),0.05*px,0.05*px); }
    /* KIZILELMA on the upper side */
    x.fillStyle='rgba(235,240,245,0.9)'; x.font='700 '+Math.round(0.22*px)+'px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle';
    [1,-1].forEach(function(s){ x.save(); x.translate(X(s*0.95),Z(-3.4)); x.rotate(s>0?-Math.PI/2:Math.PI/2); x.fillText('KIZILELMA',0,0); x.restore(); });
  },40);
}
let KZ_TXT_M=null;
function KZ_TXT(){ return KZ_TXT_M||(KZ_TXT_M=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,map:apTex(512,120,function(x,W,H){ x.clearRect(0,0,W,H);
  x.fillStyle='rgba(240,243,246,0.95)'; x.fillRect(150,14,212,8); x.fillRect(170,28,172,8); x.fillRect(190,42,132,8);   /* wing-like bars of the logo */
  x.textAlign='center'; x.textBaseline='middle'; x.font='600 18px Arial, sans-serif'; x.fillText('B A Y R A K T A R',W/2,68); x.font='700 34px Arial, sans-serif'; x.fillText('KIZILELMA',W/2,98); })})); }
function buildKizilelmaV2(){
  const g=new THREE.Group(), surfaces=[];
  const top=phong(0x4a525a,0x2a3138,26,{map:kzPaint()}), body=phong(0x3c434a,0x252b31,22), dark=DARK, edge=phong(0x30363c,0x1e2328,18), lip=phong(0x555d65,0x2e353c,24);
  /* ---- fuselage: faceted upper shell over a flat lower body; the chine runs from the nose tip to the wing */
  const st=[
    {z:-7.25,w:0.02,y:-0.05,t:0.02,b:0.02,wk:0.02},
    {z:-6.6, w:0.28,y:-0.04,t:0.2, b:0.12,wk:0.26,et:1.4},
    {z:-5.6, w:0.62,y:-0.02,t:0.42,b:0.26,wk:0.58,et:1.4},
    {z:-4.4, w:0.95,y:0.0,  t:0.66,b:0.42,wk:0.88,et:1.4},
    {z:-3.2, w:1.22,y:0.02, t:0.82,b:0.6, wk:1.05,et:1.5},
    {z:-1.6, w:1.42,y:0.04, t:0.86,b:0.7, wk:1.2, et:1.6},
    {z:0.4,  w:1.52,y:0.05, t:0.8, b:0.72,wk:1.26,et:1.8},
    {z:2.6,  w:1.5, y:0.06, t:0.7, b:0.66,wk:1.22,et:2.0},
    {z:4.6,  w:1.36,y:0.08, t:0.56,b:0.56,wk:1.1, et:2.2},
    {z:6.0,  w:0.9, y:0.1,  t:0.5, b:0.46,wk:0.72,et:2.4},
    {z:6.6,  w:0.6, y:0.12, t:0.46,b:0.44,wk:0.5, et:2.4}];
  const up=[], lo=[];
  st.forEach(function(s){ up.push(MK.arc(0,s.y,s.z,s.w,s.t,s.et||1.5,0,Math.PI,16)); lo.push(kaanLower(s.z,s.w,s.y,s.b,s.wk)); });
  g.add(new THREE.Mesh(MK.outward(MK.grid(up),new THREE.Vector3(0,-1,0)),top));
  g.add(new THREE.Mesh(MK.outward(MK.grid(lo),new THREE.Vector3(0,1,0)),body));
  const rear=up[up.length-1].concat(lo[lo.length-1].slice(1,-1).reverse()); g.add(new THREE.Mesh(MK.outward(MK.cap(rear),new THREE.Vector3(0,0.1,6)),body));
  MK.at(g,new THREE.Mesh(MK.cyl(0.012,0.035,1.0,8),edge),0,-0.05,-7.7);   /* nose probe */
  /* ---- side intakes under the chine, with a lip */
  [-1,1].forEach(function(s){
    const zf=-3.0, o=[[0.6,-0.05],[1.18,-0.02],[1.02,-0.62],[0.62,-0.62]];
    const sh=new THREE.Shape(); o.forEach(function(p,i){ const X=s*p[0]; if(i===0) sh.moveTo(X,p[1]); else sh.lineTo(X,p[1]); }); sh.closePath();
    const face=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshPhongMaterial({color:0x07090b,side:THREE.DoubleSide})); face.position.z=zf; g.add(face);
    for(let i=0;i<4;i++){ const a=o[i], b=o[(i+1)%4], dx=(b[0]-a[0])*s, dy=b[1]-a[1], L=Math.hypot(dx,dy);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(L+0.06,0.06,0.14),lip); bar.position.set((s*a[0]+s*b[0])/2,(a[1]+b[1])/2,zf-0.03); bar.rotation.z=Math.atan2(dy,dx); g.add(bar); }
  });
  /* ---- canards at the chine */
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, 0.03+th, z]; }, cs=function(sp){ const t=(sp-1.05)/1.5; return {s:sp,le:-3.75+t*1.25,te:-2.3+t*0.15,t:0.05}; };
    const geo=MK.outward(MK.foil([cs(1.05),cs(2.55)],map,8,'ab'),new THREE.Vector3(s*1.8,0,-2.8));
    const H=MK.hinge(geo,top,[s>0?1.05:-2.55,0.03,-2.8],[s>0?2.55:-1.05,0.03,-2.8],'x'); g.add(H.outer);
    surfaces.push({n:H.pivot,axis:'x',input:'pitch',max:14*D2R,sign:1,base:0});
  });
  /* ---- main wing: swept leading edge, nearly straight trailing edge, flaperons */
  const LE=function(sp){ return -0.9+(sp-1.4)*1.15; }, TE=function(sp){ return 5.05-(sp-1.4)*0.05; }, WY=function(){ return 0.02; };
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:0.045,c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(1.4,0,1),wsec(2.2,0,1),wsec(2.2,0,0.8),wsec(4.98,0,0.8),wsec(5.0,0,1)],map,12,'b'),new THREE.Vector3(s*3,-1,3)),top));
    const fq=MK.outward(MK.foil([wsec(2.25,0.8,1),wsec(4.95,0.8,1)],map,5,'ab'),new THREE.Vector3(s*3.6,0,4.7));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.8]; };
    const H=MK.hinge(fq,top,s>0?hp(2.25):hp(4.95),s>0?hp(4.95):hp(2.25),'x'); g.add(H.outer); surfaces.push({n:H.pivot,axis:'x',input:'roll',max:18*D2R,sign:s>0?-1:1,base:0});
  });
  /* ---- tail extensions beside the nozzle, nozzle */
  [-1,1].forEach(function(s){ const map=function(sp,z,th){ return [s*sp,0.05+th,z]; }, ts=function(sp){ return {s:sp,le:4.9,te:6.75-(sp-0.55)*0.25,t:0.06}; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([ts(0.55),ts(1.5)],map,8,'ab'),new THREE.Vector3(s*1,0,5.9)),body)); });
  MK.at(g,new THREE.Mesh(MK.cyl(0.5,0.44,0.9,22,true),edge),0,0.12,6.95);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(0.42,20),phong(0x2a2420,0x111111,10)); disc.position.set(0,0.12,6.6); disc.rotation.y=Math.PI; g.add(disc);
  const flames=addFlames(g,[[0,0.12,7.4]],0.8);
  /* ---- twin fins canted outward (~32°), rudders, flag and the white bars */
  const barsMat=new THREE.MeshBasicMaterial({map:apTex(128,128,function(x,W,H){ x.clearRect(0,0,W,H); x.fillStyle='rgba(240,243,246,0.95)'; for(let i=0;i<3;i++) x.fillRect(8+i*8,18+i*30,100-i*16,16); }),transparent:true,depthWrite:false,side:THREE.DoubleSide});
  [-1,1].forEach(function(s){
    const holder=new THREE.Group(); holder.position.set(s*1.25,0.55,0); holder.rotation.z=-s*0.56; g.add(holder);
    const fs=function(u){ const t=u/2.35; return {le:3.7+t*1.75, te:6.1+t*0.55, t:0.05}; };
    const map=function(u,z,th){ return [th,u,z]; };
    const sec=function(u,c0,c1){ const q=fs(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    holder.add(new THREE.Mesh(MK.outward(MK.foil([sec(0,0,0.75),sec(2.35,0,0.75),sec(2.35,0.75,1),sec(2.36,0,1)],map,10,'b'),new THREE.Vector3(0,1.2,5.2)),body));
    const rud=MK.outward(MK.foil([sec(0.15,0.75,1),sec(2.3,0.75,1)],map,5,'ab'),new THREE.Vector3(0,1.2,6.4));
    const r0=fs(0.15), r1=fs(2.3), H=MK.hinge(rud,body,[0,0.15,r0.le+(r0.te-r0.le)*0.75],[0,2.3,r1.le+(r1.te-r1.le)*0.75],'y'); holder.add(H.outer);
    surfaces.push({n:H.pivot,axis:'y',input:'yaw',max:20*D2R,sign:1,base:0});
    [1,-1].forEach(function(f){ const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.0),barsMat); pl.position.set(f*0.04,1.45,fs(1.45).le+0.7); pl.rotation.y=f>0?Math.PI/2:-Math.PI/2; holder.add(pl);
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.28),FLAG_MAT); fl.position.set(f*0.04,0.6,fs(0.6).le+0.75); fl.rotation.y=f>0?Math.PI/2:-Math.PI/2; holder.add(fl); });
  });
  /* ---- lettering on both sides of the nose, crescent-star roundel */
  [-1,1].forEach(function(s){ const d=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.35),KZ_TXT()); d.position.set(s*1.1,0.12,-3.9); d.rotation.y=s>0?Math.PI/2+0.25:-Math.PI/2-0.25; g.add(d); });
  /* ---- lights */
  const n0=g.children.length, strobe=addLights(g,[5.02,0.04,4.6],[0,0.9,-0.8]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.6); });
  /* ---- gear: nose leg under the intakes, main legs from the body under the wing root */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.45,-4.7,-1.62,0.28,0.16,GM,{twin:true});
  [-1,1].forEach(function(s){ MK.leg(gear,s*1.35,-0.6,1.7,-1.55,0.35,0.22,GM,{side:s*0.4}); });
  g.add(gear);
  /* ---- internal weapons bay (Defence Turk: gövde içi taşıma): two bays side by side on the flat belly, two doors each, opening for every launch */
  const bay={xc:0.36, zc:0.3, y:-0.74, doors:[], cav:null}, dmat=phong(0x3a4148,0x252b31,20), BL=4.3;
  const cav=new THREE.Group(); [-1,1].forEach(function(s){ const c=new THREE.Mesh(new THREE.BoxGeometry(0.56,0.02,BL-0.1),phong(0x15181c,0x111111,8)); c.position.set(s*0.36,-0.715,bay.zc); cav.add(c); });
  cav.visible=false; cav.userData.noBake=true; g.add(cav); bay.cav=cav;
  [-1,1].forEach(function(s){ [[0.65,-1],[0.07,1]].forEach(function(h){ const piv=new THREE.Group(); piv.position.set(s*h[0],-0.735,bay.zc); piv.userData.noBake=true;
      const d=new THREE.Mesh(new THREE.BoxGeometry(0.285,0.02,BL),dmat); d.position.x=h[1]*s*0.1425; piv.add(d); g.add(piv);
      bay.doors.push({p:piv, a:-h[1]*s*1.62}); }); });
  return {group:g, flames:flames, strobe:strobe, gear:gear, spinners:[], surfaces:surfaces, codeSurfaces:surfaces, bay:bay};
}
