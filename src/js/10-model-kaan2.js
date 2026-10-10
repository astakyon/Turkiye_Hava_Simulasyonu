/* ------------------------------------------------------------------ KAAN — detailed model (V1.37)
   21 m long, 14 m span, ~6 m tall. Chined stealth forebody blending into the LERX, trapezoidal side intakes with raked lips,
   trapezoidal wing with forward-swept trailing edge, flaperons, all-moving tailplanes, twin outward-canted fins with rudders,
   twin F110-class nozzles with serrated petals, bubble canopy with pilot, internal bay doors, tricycle gear. */
function kaanPaint(){
  return MK.planarTex(function(x,X,Z,px){
    x.fillStyle='#b9c5d0'; x.fillRect(0,0,16*px,24*px);                                      /* base tone (× material colour) */
    const r=mulberry32(21);
    /* prototype pattern: light longitudinal dashes behind the cockpit, front edge an arc, thinning out aft */
    x.fillStyle='#ffffff';
    for(let xm=-1.95; xm<=1.96; xm+=0.17){
      const a=Math.abs(xm)/2.0, zf=-3.05+0.55*a*a, ze=1.7-1.5*a; let z=zf+r()*0.12;
      while(z<ze){ const k=(z-zf)/Math.max(0.5,ze-zf), len=(0.55-0.3*k)*(0.7+r()*0.6); if(r()>k*0.75){ x.fillRect(X(xm)-0.045*px,Z(z),0.09*px,len*px); } z+=len+0.1+r()*0.18+k*0.25; }
    }
    /* panel lines */
    x.strokeStyle='rgba(60,72,86,0.55)'; x.lineWidth=2;
    const L=function(a){ x.beginPath(); x.moveTo(X(a[0]),Z(a[1])); for(let i=2;i<a.length;i+=2) x.lineTo(X(a[i]),Z(a[i+1])); x.stroke(); };
    [1,-1].forEach(function(s){
      L([s*1.05,-4.7, s*1.05,3.0]); L([s*0.5,3.2, s*0.5,8.3]);                                    /* spine / engine bay lines */
      L([s*2.08,-4.4, s*2.12,2.0]);                                                              /* chine / wing root */
      L([s*2.6,4.95, s*5.0,4.1]); L([s*5.0,4.1, s*7.0,3.42]);                                     /* flap / flaperon hinges */
      L([s*5.0,4.1, s*5.0,5.25]);
      L([s*3.6,0.6, s*3.6,5.4]);                                                                 /* wing panel */
      L([s*0.62,-7.4, s*0.66,-4.85]);                                                            /* canopy sill */
      L([s*1.7,7.2, s*4.6,9.0]);                                                                 /* tailplane pivot line */
    });
    for(let z=-2.2; z<=2.6; z+=1.6){ L([-1.05,z,-0.35,z]); L([0.35,z,1.05,z]); }
    /* KAAN lettering on both upper sides, reading nose→tail on the left and tail→nose on the right (as on the aircraft) */
    x.fillStyle='#14171b'; x.font='900 '+Math.round(0.5*px)+'px Arial Black, Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle';
    [1,-1].forEach(function(s){ x.save(); x.translate(X(s*1.72),Z(-3.65)); x.rotate(s>0?-Math.PI/2:Math.PI/2); x.scale(1.25,1); x.fillText('KAAN',0,0); x.restore(); });
    /* small stencils */
    x.fillStyle='rgba(230,180,40,0.9)'; [[2.9,1.4],[3.4,2.2],[-2.9,1.4],[-3.4,2.2]].forEach(function(p){ x.fillRect(X(p[0]),Z(p[1]),0.18*px,0.12*px); });
  });
}
function kaanBelly(){
  return MK.planarTex(function(x,X,Z){
    x.fillStyle='#d6dade'; x.fillRect(0,0,16*32,24*32);
    x.strokeStyle='rgba(30,36,44,0.55)'; x.lineWidth=2;
    const R=function(x0,z0,x1,z1){ x.strokeRect(X(x0),Z(z0),X(x1)-X(x0),Z(z1)-Z(z0)); };
    R(-0.95,-3.6,-0.12,2.6); R(0.12,-3.6,0.95,2.6);            /* weapon bay doors */
    R(-0.3,-5.6,0.3,-4.0);                                    /* nose gear doors */
    R(-1.9,0.8,-1.1,3.0); R(1.1,0.8,1.9,3.0);                  /* main gear doors */
    x.beginPath(); x.moveTo(X(0),Z(-3.6)); x.lineTo(X(0),Z(2.6)); x.stroke();
    /* light dashes on the dark lower sides */
    x.fillStyle='rgba(235,240,245,0.85)'; const r=mulberry32(5);
    [1,-1].forEach(function(s){ for(let i=0;i<14;i++){ const z=-2.2+i*0.32, w=0.3+r()*0.9; x.fillRect(X(s*(1.72+r()*0.18))-2,Z(z),4,w*32); } });
  },32);
}
/* lower body ring (right chine → under the body → left chine): flat shelf, faceted sides, keel; wk = shelf/keel half-width */
function kaanLower(z,w,y,b,wk){
  const P=[[w,y],[wk,y-0.04],[wk*0.97,y-b*0.55],[wk*0.84,y-b*0.9],[wk*0.5,y-b],[0,y-b-0.03]], out=[];
  P.forEach(function(p){ out.push([p[0],p[1],z]); }); for(let i=P.length-2;i>=0;i--) out.push([-P[i][0],P[i][1],z]); return out;
}
function buildKaan(){
  const g=new THREE.Group();
  const top=phong(0x8e9aa6,0x56677a,30,{map:kaanPaint()}), belly=phong(0x6c747d,0x3d4650,22,{map:kaanBelly()});
  const radome=phong(0xb0b8bf,0x667788,40), dark=DARK, edge=phong(0x7e8994,0x333a44,20), lip=phong(0x86919c,0x445060,26);
  const glass=new THREE.MeshPhongMaterial({color:0x6a6040, specular:0xffffff, shininess:140, transparent:true, opacity:0.5});
  const surfaces=[];
  /* ---- fuselage: upper shell (light) and lower shell (dark) meet along the chine; the chine rises from the nose to the wing */
  const st=[
    {z:-10.5,w:0.02,y:-0.10,t:0.02,b:0.02,wk:0.02},
    {z:-10.0,w:0.22,y:-0.09,t:0.20,b:0.17,wk:0.21},
    {z:-9.2, w:0.48,y:-0.07,t:0.42,b:0.34,wk:0.46},
    {z:-8.3, w:0.72,y:-0.03,t:0.62,b:0.50,wk:0.69,et:1.8},
    {z:-7.4, w:0.96,y:0.03, t:0.82,b:0.68,wk:0.90,et:1.7},
    {z:-6.5, w:1.44,y:0.13, t:0.98,b:0.84,wk:0.96,et:1.6},
    {z:-5.6, w:1.92,y:0.24, t:1.02,b:1.02,wk:0.98,et:1.65},
    {z:-5.47,w:1.94,y:0.25, t:1.02,b:1.04,wk:0.98,et:1.65},
    {z:-5.45,w:1.94,y:0.25, t:1.02,b:1.04,wk:1.88,et:1.65},
    {z:-4.4, w:2.02,y:0.31, t:1.00,b:1.22,wk:1.96,et:1.7},
    {z:-2.6, w:2.08,y:0.35, t:0.96,b:1.31,wk:2.02,et:1.8},
    {z:-0.6, w:2.12,y:0.37, t:0.91,b:1.35,wk:2.06,et:2.0},
    {z:1.6,  w:2.05,y:0.38, t:0.83,b:1.34,wk:1.99,et:2.3},
    {z:3.6,  w:1.92,y:0.38, t:0.73,b:1.20,wk:1.86,et:2.5},
    {z:5.6,  w:1.72,y:0.38, t:0.62,b:0.98,wk:1.66,et:2.5},
    {z:7.2,  w:1.56,y:0.38, t:0.52,b:0.80,wk:1.50,et:2.4},
    {z:8.2,  w:1.45,y:0.38, t:0.45,b:0.68,wk:1.40,et:2.3}];
  const up=[], lo=[];
  st.forEach(function(s){ up.push(MK.arc(0,s.y,s.z,s.w,s.t,s.et||2,0,Math.PI,18)); lo.push(kaanLower(s.z,s.w,s.y,s.b,s.wk)); });
  /* radome: first stations get the light nose colour */
  const nR=4, upN=up.slice(0,nR), loN=lo.slice(0,nR);
  g.add(new THREE.Mesh(MK.outward(MK.grid(upN),new THREE.Vector3(0,-1,-9)),radome)); g.add(new THREE.Mesh(MK.outward(MK.grid(loN),new THREE.Vector3(0,1,-9)),radome));
  g.add(new THREE.Mesh(MK.outward(MK.grid(up.slice(nR-1)),new THREE.Vector3(0,-1.5,0)),top));
  g.add(new THREE.Mesh(MK.outward(MK.grid(lo.slice(nR-1)),new THREE.Vector3(0,1.5,0)),belly));
  const rear=up[up.length-1].concat(lo[lo.length-1].slice(1,-1).reverse());
  g.add(new THREE.Mesh(MK.outward(MK.cap(rear),new THREE.Vector3(0,0.3,6)),belly));
  /* nose test boom */
  MK.at(g,new THREE.Mesh(MK.cyl(0.012,0.04,1.3,8),edge),0,-0.1,-11.1);
  /* ---- intakes: dark openings framed by a lip, under the chine shelf */
  [-1,1].forEach(function(s){
    const zf=-5.52, o=[[1.02,0.18],[1.86,0.22],[1.62,-0.9],[1.04,-0.9]];
    const sh=new THREE.Shape(); o.forEach(function(p,i){ const X=s*p[0]; if(i===0) sh.moveTo(X,p[1]); else sh.lineTo(X,p[1]); }); sh.closePath();
    const face=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshPhongMaterial({color:0x07090b,side:THREE.DoubleSide})); face.position.z=zf; g.add(face);
    for(let i=0;i<4;i++){ const a=o[i], b=o[(i+1)%4], dx=(b[0]-a[0])*s, dy=b[1]-a[1], L=Math.hypot(dx,dy);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(L+0.08,0.07,0.16),lip); bar.position.set((s*a[0]+s*b[0])/2,(a[1]+b[1])/2,zf-0.03); bar.rotation.z=Math.atan2(dy,dx); g.add(bar); }
    const fan=new THREE.Mesh(new THREE.CircleGeometry(0.42,18),phong(0x2b3036,0x222222,20)); fan.position.set(s*1.38,-0.35,zf+0.9); fan.rotation.y=Math.PI; g.add(fan);
  });
  /* ---- engine housings, nozzles with serrated petals, centre stinger */
  const flamesAt=[];
  [-1,1].forEach(function(s){
    const ex=s*1.0, ey=0.42;
    MK.at(g,new THREE.Mesh(MK.cyl(0.6,0.62,3.4,22),top),ex,ey,6.6);
    const rows=[], N=24;
    [[8.25,0.62],[8.8,0.58],[9.25,0.54]].forEach(function(q,k){ const row=[]; for(let i=0;i<=N;i++){ const a=i/N*Math.PI*2, rr=q[1]*(k===2?(i%2?1.07:0.93):1); row.push([ex+Math.cos(a)*rr,ey+Math.sin(a)*rr,q[0]]); } rows.push(row); });
    g.add(new THREE.Mesh(MK.outward(MK.grid(rows),new THREE.Vector3(ex,ey,8.7)),edge));
    MK.at(g,new THREE.Mesh(MK.cyl(0.52,0.46,1.1,20,true),dark),ex,ey,8.75);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(0.47,20),phong(0x3a2c22,0x221a14,10)); disc.position.set(ex,ey,8.25); disc.rotation.y=Math.PI; g.add(disc);
    flamesAt.push([ex,ey,9.25]);
  });
  { const sg=new THREE.BoxGeometry(0.5,0.32,1.4); const sm=MK.at(g,new THREE.Mesh(sg,top),0,0.42,8.8); sm.scale.set(1,1,1); }
  /* ---- wings: high, slight anhedral; trailing edge swept back; fixed inner flap, moving outer flaperon */
  const LE=function(sp){ return -0.48+(sp-2.55)*0.883; }, TE=function(sp){ return 6.05-(sp-3.0)*0.3575; }, WY=function(sp){ return 0.34-(sp-1.8)*0.05; };
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:0.042-(sp-1.8)*0.0025,c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(1.8,0,1),wsec(2.6,0,1),wsec(2.6,0,0.76),wsec(6.98,0,0.76),wsec(7.0,0,1)],map,14,'b'),new THREE.Vector3(s*4.4,-1,2)),top));
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(2.6,0.76,1),wsec(5.0,0.76,1)],map,6,'ab'),new THREE.Vector3(s*3.8,0,5.4)),top));
    const fq=MK.outward(MK.foil([wsec(5.0,0.76,1),wsec(6.98,0.76,1)],map,6,'ab'),new THREE.Vector3(s*6,0,4.6));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.76]; };
    const H=MK.hinge(fq,top,s>0?hp(5.0):hp(6.98),s>0?hp(6.98):hp(5.0),'x'); g.add(H.outer); surfaces.push({n:H.pivot,axis:'x',input:'roll',max:18*D2R,sign:s>0?-1:1,base:0});
    const le=[], le2=[]; for(let i=0;i<=8;i++){ const sp=2.55+(6.98-2.55)*i/8, q=wsec(sp); le.push([s*sp,WY(sp)+0.01,q.le+0.015]); le2.push([s*sp,WY(sp)+MK.thick(0.05,q.t)*(q.te-q.le)+0.006,q.le+(q.te-q.le)*0.05]); }
    g.add(new THREE.Mesh(MK.outward(MK.grid([le,le2]),new THREE.Vector3(s*4,-5,0)),edge));
  });
  /* ---- all-moving tailplanes */
  [-1,1].forEach(function(s){
    const ts=function(sp){ const t=(sp-1.5)/(5.3-1.5); return {le:6.7+t*1.95, te:9.95+t*0.45, y:0.24-t*0.16, t:0.038}; };
    const map=function(sp,z,th){ return [s*sp, ts(sp).y+th, z]; };
    const sec=function(sp){ const q=ts(sp); return {s:sp,le:q.le,te:q.te,t:q.t}; };
    const geo=MK.outward(MK.foil([sec(1.5),sec(5.3)],map,12,'ab'),new THREE.Vector3(s*3.4,0,8.6));
    const H=MK.hinge(geo,top,[s>0?1.5:-5.3,0.2,8.0],[s>0?5.3:-1.5,0.2,8.0],'x'); g.add(H.outer);
    surfaces.push({n:H.pivot,axis:'x',input:'pitch',max:16*D2R,sign:-1,base:0});
  });
  /* ---- twin fins canted 27° outward, full-height rudders, flag */
  const flagMat=new THREE.MeshBasicMaterial({map:flagTexture(), side:THREE.DoubleSide});
  const logoMat=new THREE.MeshBasicMaterial({map:apTex(256,48,function(x,W,H){ x.clearRect(0,0,W,H); x.fillStyle='#1d232a'; x.font='bold 22px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('TÜRK HAVACILIK',W/2,14); x.fillText('UZAY SANAYİİ',W/2,36); }),transparent:true,side:THREE.DoubleSide});
  [-1,1].forEach(function(s){
    const holder=new THREE.Group(); holder.position.set(s*1.3,0.84,0); holder.rotation.z=-s*0.47; g.add(holder);
    const fs=function(u){ const t=u/3.45; return {le:4.1+t*2.55, te:7.85+t*0.85, t:0.05-t*0.015}; };
    const map=function(u,z,th){ return [th,u,z]; };
    const sec=function(u,c0,c1){ const q=fs(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    holder.add(new THREE.Mesh(MK.outward(MK.foil([sec(0,0,1),sec(0.2,0,1),sec(0.2,0,0.7),sec(3.35,0,0.7),sec(3.35,0,1),sec(3.45,0,1)],map,12,'b'),new THREE.Vector3(0,1.5,6.2)),top));
    const rud=MK.outward(MK.foil([sec(0.2,0.7,1),sec(3.35,0.7,1)],map,6,'ab'),new THREE.Vector3(0,1.6,8.0));
    const r0=fs(0.2), r1=fs(3.35), H=MK.hinge(rud,top,[0,0.2,r0.le+(r0.te-r0.le)*0.7],[0,3.35,r1.le+(r1.te-r1.le)*0.7],'y'); holder.add(H.outer);
    surfaces.push({n:H.pivot,axis:'y',input:'yaw',max:20*D2R,sign:1,base:0});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.75,0.5),flagMat); fl.position.set(s*0.07,2.85,7.2); fl.rotation.y=s>0?Math.PI/2:-Math.PI/2; holder.add(fl);
    const lg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.2),logoMat); lg.position.set(s*0.07,2.2,7.05); lg.rotation.y=s>0?Math.PI/2:-Math.PI/2; holder.add(lg);
  });
  /* ---- canopy (tall bubble, gold tint), rear frame, pilot */
  const yb=function(z){ return 0.84+0.46*smooth(-7.4,-4.6,z); };
  const cRows=[]; for(let i=0;i<=12;i++){ const z=-7.42+i*0.24, t=i/12, w=0.06+0.6*Math.sin(Math.min(1,t*1.5)*Math.PI*0.5)*(1-0.35*smooth(0.65,1,t)), h=0.04+0.66*Math.sin(Math.min(1,t*1.3)*Math.PI*0.5)*(1-0.55*smooth(0.6,1,t));
    cRows.push(MK.arc(0,yb(z),z,w,h,2.3,0.03,Math.PI-0.03,14)); }
  g.add(new THREE.Mesh(MK.outward(MK.grid(cRows),new THREE.Vector3(0,0.9,-5.9)),glass));
  const bow=MK.at(g,new THREE.Mesh(new THREE.TorusGeometry(0.5,0.04,6,24,Math.PI),phong(0xd2b24a,0x554400,30)),0,yb(-4.95),-4.95);
  [-1,1].forEach(function(s){ const b=MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,2.6),dark),s*0.6,yb(-6.1)+0.02,-6.1); b.rotation.x=0.17; });
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.6,0.62,0.42),phong(0x2a2f36,0x222222,10)),0,1.28,-5.15);
  MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.15,14,10),phong(0x5b6168,0x444444,40)),0,1.62,-5.55);
  const visor=MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.145,14,8,0,Math.PI*2,0,Math.PI*0.42),phong(0x111418,0xffffff,120)),0,1.6,-5.62); visor.rotation.x=-1.25;
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.8,0.14,0.45),dark),0,1.18,-6.75);
  const eots=MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.3,0.16,0.04),phong(0xd09030,0xffffff,120)),0,0.9,-7.55); eots.rotation.x=-0.5;
  /* ---- small details */
  [[0,1.27,0.6,0.32],[0,-1.0,2.0,0.26],[0,-0.98,-6.4,0.2]].forEach(function(a){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.03,a[3],0.4),edge); b.position.set(a[0],a[1]+(a[1]>0?a[3]/2:-a[3]/2),a[2]); b.rotation.x=a[1]>0?-0.3:0.3; g.add(b); });
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.06,0.14,0.5),dark),1.62,0.72,-4.4);
  /* ---- lights, flames */
  const strobe=addLights(g,[7.0,0.09,4.0],[0,1.02,7.6]);
  const flames=addFlames(g,flamesAt,0.98);
  /* ---- landing gear: single nose wheel behind the intakes, main legs under the ducts */
  const gear=new THREE.Group(), GM=MK.mats(); const gy=-2.4;
  MK.leg(gear,0,-0.92,-4.85,gy+0.32,0.32,0.22,GM,{});
  [-1,1].forEach(function(s){ MK.leg(gear,s*1.45,-0.95,1.9,gy+0.43,0.43,0.32,GM,{side:s*0.4});
    const door=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.7,1.6),belly); door.position.set(s*1.95,-1.25,1.95); door.rotation.z=s*0.28; gear.add(door); });
  [-1,1].forEach(function(s){ const d=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.45,1.2),belly); d.position.set(s*0.33,-1.18,-4.75); d.rotation.z=s*0.18; gear.add(d); });
  const nl=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),new THREE.MeshBasicMaterial({color:0xfff6dc})); nl.position.set(0,-1.62,-5.05); nl.material.userData.glow=2.5; gear.add(nl);
  g.add(gear);
  return {group:g, flames:flames, strobe:strobe, gear:gear, spinners:[], surfaces:surfaces, codeSurfaces:surfaces};
}
