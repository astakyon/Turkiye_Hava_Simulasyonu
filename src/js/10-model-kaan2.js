/* ------------------------------------------------------------------ KAAN — detailed model (V1.37)
   21 m long, 14 m span, ~6 m tall. Chined stealth forebody blending into the LERX, trapezoidal side intakes with raked lips,
   trapezoidal wing with forward-swept trailing edge, flaperons, all-moving tailplanes, twin outward-canted fins with rudders,
   twin F110-class nozzles with serrated petals, bubble canopy with pilot, internal bay doors, tricycle gear. */
function kaanPaint(){
  return MK.planarTex(function(x,X,Z,px){
    const r=mulberry32(21);
    /* the prototype's dark "dash" pattern: dense along the spine and inner wing, fading outwards and aft */
    x.fillStyle='rgba(70,86,104,0.88)';
    for(let z=-5.2; z<9.4; z+=0.3){
      const t=(z+5.2)/14.6, hw=0.5+Math.pow(t,0.75)*5.4;
      for(let xm=-hw; xm<=hw; xm+=0.28){
        if(z<-3.4&&Math.abs(xm)<0.75) continue;                       /* canopy */
        const f=1-Math.abs(xm)/hw; if(r()>Math.pow(f,0.65)*(1-0.5*smooth(0.75,1,t))+0.03) continue;
        const len=0.16+r()*0.36, jx=(r()-.5)*0.1, jz=(r()-.5)*0.18; x.fillRect(X(xm+jx)-3,Z(z+jz),6,len*px);
      }
    }
    /* panel lines */
    x.strokeStyle='rgba(40,52,64,0.45)'; x.lineWidth=2;
    const L=function(a){ x.beginPath(); x.moveTo(X(a[0]),Z(a[1])); for(let i=2;i<a.length;i+=2) x.lineTo(X(a[i]),Z(a[i+1])); x.stroke(); };
    [1,-1].forEach(function(s){
      L([s*2.0,-2.0, s*2.0,9.0]); L([s*0.95,-3.3, s*0.95,9.4]);                                      /* fuselage longitudinals */
      L([s*2.05,4.25, s*4.25,4.15]); L([s*4.25,4.15, s*6.6,3.35]);                                   /* flap / flaperon hinge lines */
      L([s*4.25,4.15, s*4.25,5.35]); L([s*6.6,3.35, s*6.6,4.15]);
      L([s*3.2,-0.9, s*3.3,4.6]);                                                                    /* wing spar panel */
      L([s*1.15,-6.6, s*1.15,-3.4]);                                                                 /* canopy sill */
    });
    for(let z=-2; z<=9; z+=2.2) L([-0.95,z, 0.95,z]);
    x.fillStyle='rgba(52,66,82,0.95)'; x.font='bold 42px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle';
    [1,-1].forEach(function(s){ x.save(); x.translate(X(s*1.45),Z(-1.4)); x.rotate(s>0?Math.PI/2:-Math.PI/2); x.fillText('KAAN',0,0); x.restore(); });
    /* walkway / no-step outline behind the canopy */
    x.strokeStyle='rgba(40,52,64,0.35)'; x.setLineDash([6,6]); L([-0.6,-3.2, 0.6,-3.2, 0.6,-1.6, -0.6,-1.6, -0.6,-3.2]); x.setLineDash([]);
  });
}
function kaanBelly(){
  return MK.planarTex(function(x,X,Z){
    x.strokeStyle='rgba(40,52,64,0.5)'; x.lineWidth=2;
    const R=function(x0,z0,x1,z1){ x.strokeRect(X(x0),Z(z0),X(x1)-X(x0),Z(z1)-Z(z0)); };
    R(-1.05,-3.0,-0.12,3.6); R(0.12,-3.0,1.05,3.6);            /* weapon bay doors */
    R(-0.3,-8.4,0.3,-6.9);                                    /* nose gear doors */
    R(-2.15,0.6,-1.25,3.0); R(1.25,0.6,2.15,3.0);              /* main gear doors */
    x.beginPath(); x.moveTo(X(0),Z(-3)); x.lineTo(X(0),Z(3.6)); x.stroke();
    for(let z=-3.0; z<3.6; z+=0.8){ x.beginPath(); x.moveTo(X(-1.0),Z(z)); x.lineTo(X(-0.9),Z(z)); x.moveTo(X(0.9),Z(z)); x.lineTo(X(1.0),Z(z)); x.stroke(); }
  },32);
}
function buildKaan(){
  const g=new THREE.Group(), PAINT=0xb6c2cd;
  const top=phong(PAINT,0x4a5866,28,{map:kaanPaint()}), belly=phong(PAINT,0x3d4a58,24,{map:kaanBelly()}), plain=phong(PAINT,0x4a5866,26);
  const radome=phong(0xc9d1d8,0x667788,40), dark=DARK, edge=phong(0x6d7a87,0x333a44,20);
  const glass=new THREE.MeshPhongMaterial({color:0x2c2a1c, specular:0xffffff, shininess:140, transparent:true, opacity:0.78});
  const surfaces=[];
  /* ---- fuselage: upper and lower shells meet at a sharp chine line */
  const st=[
    {z:-10.5,w:0.02,y:-0.05,t:0.02,b:0.02},
    {z:-10.1,w:0.20,y:-0.05,t:0.17,b:0.13},
    {z:-9.4, w:0.42,y:-0.04,t:0.32,b:0.24},
    {z:-8.5, w:0.66,y:-0.03,t:0.50,b:0.36,et:2.1},
    {z:-7.4, w:0.90,y:-0.02,t:0.66,b:0.46,et:2.2},
    {z:-6.0, w:1.12,y:0.00, t:0.74,b:0.56,et:2.4},
    {z:-4.6, w:1.42,y:0.00, t:0.76,b:0.64,et:2.6,eb:2.8},
    {z:-3.0, w:1.86,y:0.00, t:0.74,b:0.72,et:2.9,eb:3.2},
    {z:-1.2, w:2.06,y:0.00, t:0.70,b:0.76,et:3.0,eb:3.4},
    {z:1.2,  w:2.08,y:0.00, t:0.68,b:0.76,et:3.0,eb:3.4},
    {z:3.8,  w:2.02,y:0.00, t:0.62,b:0.72,et:3.0,eb:3.2},
    {z:6.2,  w:1.88,y:0.00, t:0.55,b:0.66,et:2.9,eb:3.0},
    {z:8.2,  w:1.68,y:0.00, t:0.46,b:0.58,et:2.8,eb:2.8},
    {z:9.4,  w:1.50,y:0.00, t:0.40,b:0.52,et:2.7,eb:2.6}];
  const F=MK.fuselage(st,18);
  g.add(new THREE.Mesh(MK.outward(F.top,new THREE.Vector3(0,-1,0)),top));
  g.add(new THREE.Mesh(MK.outward(F.bot,new THREE.Vector3(0,1,0)),belly));
  g.add(new THREE.Mesh(MK.outward(MK.cap(F.rings[F.rings.length-1]),new THREE.Vector3(0,0,0)),plain));
  /* radome: slightly lighter nose cone over the first stations */
  const rs=st.slice(0,4).map(function(s){ return Object.assign({},s,{w:s.w*1.02+0.004,t:s.t*1.02+0.004,b:s.b*1.02+0.004}); }); const RF=MK.fuselage(rs,18);
  g.add(new THREE.Mesh(MK.outward(RF.top,new THREE.Vector3(0,-1,0)),radome)); g.add(new THREE.Mesh(MK.outward(RF.bot,new THREE.Vector3(0,1,0)),radome));
  /* ---- engine housings + nozzles with serrated petals */
  const flamesAt=[];
  [-1,1].forEach(function(s){
    const ex=s*0.78;
    g.add(MK.at(g,new THREE.Mesh(MK.cyl(0.74,0.66,3.6,20),plain),ex,-0.05,8.0));
    const rows=[]; const N=24;
    [[9.4,0.66],[10.0,0.62],[10.55,0.58]].forEach(function(q,k){ const row=[]; for(let i=0;i<=N;i++){ const a=i/N*Math.PI*2, rr=q[1]*(k===2?(i%2?1.06:0.94):1); row.push([ex+Math.cos(a)*rr,-0.05+Math.sin(a)*rr,q[0]]); } rows.push(row); });
    const noz=new THREE.Mesh(MK.outward(MK.grid(rows),new THREE.Vector3(ex,-0.05,10)),edge); g.add(noz);
    const inner=new THREE.Mesh(MK.cyl(0.6,0.5,1.4,20,true),dark); inner.material=dark; MK.at(g,inner,ex,-0.05,9.9); inner.scale.set(0.95,0.95,1);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(0.5,20),phong(0x3a2c22,0x221a14,10)); disc.position.set(ex,-0.05,9.3); disc.rotation.y=Math.PI; g.add(disc);
    flamesAt.push([ex,-0.05,10.6]);
  });
  /* ---- side intakes: trapezoidal ducts with raked lips */
  [-1,1].forEach(function(s){
    const rows=[], ring=function(z,w,h,yc,xo){ const pts=[]; const c=[[xo-w*0.5,yc+h*0.5],[xo+w*0.5,yc+h*0.42],[xo+w*0.62,yc-h*0.5],[xo-w*0.45,yc-h*0.5]]; for(let i=0;i<4;i++){ const a=c[i], b=c[(i+1)%4]; for(let k=0;k<3;k++){ const u=k/3; pts.push([s*(a[0]+(b[0]-a[0])*u), a[1]+(b[1]-a[1])*u, z]); } } return pts; };
    const secs=[[-4.9,1.0,1.02,-0.42,1.62],[-4.2,1.0,1.0,-0.42,1.66],[-2.6,0.95,0.92,-0.44,1.62],[-0.8,0.8,0.8,-0.46,1.5],[0.8,0.6,0.62,-0.48,1.36]];
    secs.forEach(function(q,k){ const R=ring(q[0],q[1],q[2],q[3],q[4]); if(k===0) R.forEach(function(p){ p[2]+= (p[1]-q[3])*-0.55+0.05; }); rows.push(R); });
    g.add(new THREE.Mesh(MK.outward(MK.grid(rows,true),new THREE.Vector3(s*1.55,-0.45,-2)),plain));
    const lip=rows[0], innerR=lip.map(function(p){ return [s*(Math.abs(p[0])+(1.62-Math.abs(p[0]))*0.16), p[1]+(-0.42-p[1])*0.16, p[2]+0.05]; });
    const lipGeo=MK.grid([lip,innerR],true); g.add(new THREE.Mesh(lipGeo,edge));
    const duct=innerR.map(function(p){ return [p[0]*0.98,p[1],p[2]+1.4]; });
    const dg=MK.grid([innerR,duct],true); const dm=new THREE.Mesh(dg,new THREE.MeshPhongMaterial({color:0x0e1114,side:THREE.DoubleSide})); g.add(dm);
    g.add(new THREE.Mesh(MK.cap(duct),dark));
  });
  /* ---- wings (airfoil), flaperons as hinged parts */
  const wingSec=function(sp){ const t=(sp-1.9)/(7.0-1.9); return {le:-2.4+t*5.0, te:5.6-t*1.45, y:-0.06-t*0.12, t:0.046-t*0.012}; };
  [-1,1].forEach(function(s){
    const sec=function(sp,c0,c1){ const q=wingSec(sp); return {s:sp,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1,y:q.y}; };
    const map=function(sp,z,th){ return [s*sp, wingSec(sp).y+th, z]; };
    const parts=[MK.foil([sec(1.7,0,1),sec(2.05,0,1),sec(2.05,0,0.80),sec(4.24,0,0.80),sec(4.26,0,0.80),sec(6.6,0,0.80),sec(6.62,0,1),sec(7.0,0,1)],map,14,'b')];
    g.add(new THREE.Mesh(MK.outward(parts[0],new THREE.Vector3(s*4.3,-0.1,1.4)),top));
    /* inner flap (fixed) and flaperon (moving) */
    const flap=MK.outward(MK.foil([sec(2.05,0.8,1),sec(4.24,0.8,1)],map,6,'ab'),new THREE.Vector3(s*3.1,-0.1,4.9)); g.add(new THREE.Mesh(flap,top));
    const fq=MK.outward(MK.foil([sec(4.26,0.8,1),sec(6.6,0.8,1)],map,6,'ab'),new THREE.Vector3(s*5.4,-0.15,4.3));
    const a0=wingSec(4.26), a1=wingSec(6.6), h0=[s*4.26,a0.y,a0.le+(a0.te-a0.le)*0.8], h1=[s*6.6,a1.y,a1.le+(a1.te-a1.le)*0.8];
    const H=MK.hinge(fq,top,s>0?h0:h1,s>0?h1:h0,'x'); g.add(H.outer); surfaces.push({n:H.pivot,axis:'x',input:'roll',max:18*D2R,sign:s>0?-1:1,base:0});
    /* leading-edge tint (radar absorbing edge) */
    const le=[]; for(let i=0;i<=8;i++){ const sp=2.05+(6.98-2.05)*i/8, q=wingSec(sp); le.push([s*sp,q.y+0.012,q.le+0.02]); }
    const le2=le.map(function(p){ const sp=Math.abs(p[0]), q=wingSec(sp); return [p[0],q.y+MK.thick(0.06,q.t)*(q.te-q.le)+0.006,q.le+(q.te-q.le)*0.06]; });
    g.add(new THREE.Mesh(MK.outward(MK.grid([le,le2]),new THREE.Vector3(s*4,-5,0)),edge));
  });
  /* ---- all-moving tailplanes */
  [-1,1].forEach(function(s){
    const ts=function(sp){ const t=(sp-1.55)/(5.1-1.55); return {le:7.1+t*2.7, te:10.8+t*0.35, y:-0.08-t*0.2, t:0.04}; };
    const map=function(sp,z,th){ return [s*sp, ts(sp).y+th, z]; };
    const sec=function(sp){ const q=ts(sp); return {s:sp,le:q.le,te:q.te,t:q.t}; };
    const geo=MK.outward(MK.foil([sec(1.55),sec(5.1)],map,12,'ab'),new THREE.Vector3(s*3.3,-0.18,9.4));
    const pz=8.6, H=MK.hinge(geo,top,[s>0?s*1.55:s*5.1,-0.1,pz],[s>0?s*5.1:s*1.55,-0.1,pz],'x'); g.add(H.outer);
    surfaces.push({n:H.pivot,axis:'x',input:'pitch',max:16*D2R,sign:-1,base:0});
  });
  /* ---- twin fins canted outward, rudders, flags */
  const flagMat=new THREE.MeshBasicMaterial({map:flagTexture(), side:THREE.DoubleSide});
  [-1,1].forEach(function(s){
    const holder=new THREE.Group(); holder.position.set(s*1.42,0.42,0); holder.rotation.z=-s*0.44; g.add(holder);
    const fs=function(u){ const t=u/3.15; return {le:5.0+t*2.5, te:9.2-t*0.25, t:0.05-t*0.012}; };
    const map=function(u,z,th){ return [th,u,z]; };
    const sec=function(u,c0,c1){ const q=fs(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    const fin=MK.outward(MK.foil([sec(0,0,1),sec(0.5,0,1),sec(0.5,0,0.72),sec(2.6,0,0.72),sec(2.6,0,1),sec(3.15,0,1)],map,12,'b'),new THREE.Vector3(0,1.6,7));
    holder.add(new THREE.Mesh(fin,plain));
    const rud=MK.outward(MK.foil([sec(0.5,0.72,1),sec(2.6,0.72,1)],map,6,'ab'),new THREE.Vector3(0,1.5,8.8));
    const r0=fs(0.5), r1=fs(2.6), H=MK.hinge(rud,plain,[0,0.5,r0.le+(r0.te-r0.le)*0.72],[0,2.6,r1.le+(r1.te-r1.le)*0.72],'y'); holder.add(H.outer);
    surfaces.push({n:H.pivot,axis:'y',input:'yaw',max:20*D2R,sign:1,base:0});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.25,0.84),flagMat); fl.position.set(s*0.06,1.85,7.25); fl.rotation.y=s>0?Math.PI/2:-Math.PI/2; holder.add(fl);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.05,1.0),edge); tip.position.set(0,3.16,fs(3.15).le+0.55); holder.add(tip);
  });
  /* ---- canopy, pilot, cockpit */
  const cRows=[]; for(let i=0;i<=10;i++){ const z=-7.05+i*0.36, t=i/10, w=0.08+0.56*Math.sin(Math.min(1,t*1.35)*Math.PI*0.5)*(1-0.2*smooth(0.6,1,t)), h=0.05+0.7*Math.sin(Math.min(1,t*1.15)*Math.PI*0.5)*(1-0.42*smooth(0.55,1,t)), yb=0.62+0.12*smooth(0,0.5,t);
    cRows.push(MK.arc(0,yb,z,w,h,2.2,0.02,Math.PI-0.02,12)); }
  g.add(new THREE.Mesh(MK.outward(MK.grid(cRows),new THREE.Vector3(0,0.4,-5.3)),glass));
  const sill=[]; [-1,1].forEach(function(s){ sill.push(MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,3.5),dark),s*0.52,0.72,-5.25)); sill[sill.length-1].rotation.y=s*0.04; });
  MK.at(g,new THREE.Mesh(new THREE.TorusGeometry(0.48,0.04,6,20,Math.PI),dark),0,0.74,-3.5);
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.62,0.6,0.45),phong(0x2a2f36,0x222222,10)),0,0.86,-4.3);            /* seat */
  MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.15,14,10),phong(0x6b7178,0x444444,40)),0,1.17,-4.62);            /* helmet */
  const visor=MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.145,14,8,0,Math.PI*2,0,Math.PI*0.42),phong(0x111418,0xffffff,120)),0,1.15,-4.68); visor.rotation.x=-1.25;
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.8,0.16,0.5),dark),0,0.86,-6.05);                                 /* glare shield */
  MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.17,12,8,0,Math.PI*2,0,Math.PI/2),glass),0,0.47,-7.85);        /* EOTS window */
  /* ---- small details: antennas, gun port, bay/door seams (texture), air data probes */
  [[0,0.72,0.6,0.32],[0,-0.78,2.2,0.28],[0,-0.7,-5.2,0.22]].forEach(function(a){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.03,a[3],0.4),edge); b.position.set(a[0],a[1]+(a[1]>0?a[3]/2:-a[3]/2),a[2]); b.rotation.x=a[1]>0?-0.3:0.3; g.add(b); });
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.05,0.12,0.5),dark),1.05,0.18,-5.6);
  [-1,1].forEach(function(s){ const pr=MK.at(g,new THREE.Mesh(MK.cyl(0.012,0.025,0.42,6),edge),s*0.42,-0.08,-9.3); pr.rotation.y=s*0.2; });
  /* ---- lights, flames */
  const strobe=addLights(g,[7.0,-0.2,3.3],[0,0.62,9.2]);
  const flames=addFlames(g,flamesAt,1.05);
  /* ---- landing gear (retracts as one group) */
  const gear=new THREE.Group(), GM=MK.mats(); const gy=-2.4;
  MK.leg(gear,0,-0.62,-7.5,gy+0.34,0.34,0.24,GM,{twin:false});
  [-1,1].forEach(function(s){ MK.leg(gear,s*1.72,-0.45,2.0,gy+0.43,0.43,0.32,GM,{side:s*0.4});
    const door=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.78,1.55),plain); door.position.set(s*2.16,-1.02,1.95); door.rotation.z=s*0.32; gear.add(door); });
  [-1,1].forEach(function(s){ const d=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.5,1.1),plain); d.position.set(s*0.36,-0.78,-7.6); d.rotation.z=s*0.2; gear.add(d); });
  const nl=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),new THREE.MeshBasicMaterial({color:0xfff6dc})); nl.position.set(0,-1.5,-7.75); nl.material.userData.glow=2.5; gear.add(nl);
  g.add(gear);
  return {group:g, flames:flames, strobe:strobe, gear:gear, spinners:[], surfaces:surfaces, codeSurfaces:surfaces};
}
