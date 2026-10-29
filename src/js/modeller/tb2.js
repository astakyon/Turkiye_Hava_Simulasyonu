/* ------------------------------------------------------------------ Bayraktar TB2 — detailed model (V2.42, model series)
   6,5 m long, 12 m span, ~2,2 m tall (Defence Turk / Baykar). Slender fuselage with a rounded nose and the EO/IR turret under it,
   straight high wing on top of the fuselage (taper on the trailing edge, ailerons and flaps), two tail booms from the wing,
   inverted-V (Λ) tail on the boom ends with ruddervators, rear engine with a two-blade pusher propeller between the booms,
   tricycle gear with sprung main legs, four hardpoints under the wing outside the booms. Light grey; flag on the tail.
   The old shared TB2/TB3 model stays as buildOld for the library comparison. */
function tb2Paint(){
  return MK.planarTex(function(x,X,Z,px){
    x.fillStyle='#eef0f2'; x.fillRect(0,0,16*px,24*px);
    x.strokeStyle='rgba(70,80,92,0.5)'; x.lineWidth=2;
    const L=function(a){ x.beginPath(); x.moveTo(X(a[0]),Z(a[1])); for(let i=2;i<a.length;i+=2) x.lineTo(X(a[i]),Z(a[i+1])); x.stroke(); };
    L([-0.3,-2.2, 0.3,-2.2]); L([-0.34,-1.1, 0.34,-1.1]); L([-0.3,1.0, 0.3,1.0]);                 /* fuselage panel joints */
    L([-0.18,-1.0, -0.18,-0.4, 0.18,-0.4, 0.18,-1.0, -0.18,-1.0]);                                 /* avionics hatch */
    [1,-1].forEach(function(s){ L([s*1.6,0.42, s*5.9,0.12]); L([s*4.2,0.2, s*4.2,0.5]); L([s*2.6,-0.3, s*2.6,0.55]); });   /* aileron / flap hinges, wing joint */
  },48);
}
let TB2_TXT_M=null;
function TB2_TXT(){ return TB2_TXT_M||(TB2_TXT_M=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,map:apTex(512,84,function(x,W,H){ x.clearRect(0,0,W,H); x.fillStyle='#1d232a'; x.font='700 60px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('BAYRAKTAR',W/2,H/2+2); })})); }
const TB2_BOOM_M={};
function TB2_BOOM(nm){ nm=nm||'BAYRAKTAR TB2'; return TB2_BOOM_M[nm]||(TB2_BOOM_M[nm]=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide,map:apTex(512,44,function(x,W,H){ x.clearRect(0,0,W,H);
  x.fillStyle='#1d232a'; x.font='700 30px Arial, sans-serif'; x.textAlign='left'; x.textBaseline='middle'; x.fillText(nm,40,H/2+1);
  x.fillStyle='#c8102e'; x.fillRect(300,4,8,H-8); x.fillRect(420,4,8,H-8); x.fillStyle='#1d232a'; x.font='600 13px Arial, sans-serif'; x.fillText('DİKKAT · PERVANE',318,H/2+1); })})); }
function buildTB2(o){ o=o||{};   /* o (V2.43, TB3): k=[sx,sy,sz] size, blades, fold (fold span), hook, bigNose, cowl, boomGear, turZ, stnX, name */
  const g=new THREE.Group(), surfaces=[], folds=[], tips={}, FS=o.fold||0;
  const skin=phong(0x9aa2aa,0x5d6874,26,{map:tb2Paint()}), hull=phong(0x949ca4,0x5d6874,26), dark=DARK;   /* light grey (V2.42 review: was nearly white) */
  const edge=phong(0xb0b6bc,0x555f6a,24), glass=phong(0x22272d,0xffffff,120);
  /* ---- fuselage: rounded nose, deepest under the wing, tapering to the engine and the propeller hub */
  const st=[[-3.02,0.03,0.03,0.03,-0.08],[-2.92,0.16,0.15,0.14,-0.07],[-2.7,0.27,0.26,0.25,-0.05],[-2.35,0.36,0.34,0.33,-0.02],[-1.8,0.42,0.40,0.38,0.0],
    [-1.0,0.45,0.44,0.40,0.02],[0.0,0.45,0.45,0.39,0.04],[0.8,0.42,0.40,0.34,0.06],[1.45,0.33,0.31,0.26,0.08],[1.9,0.22,0.21,0.18,0.1],[2.12,0.14,0.13,0.12,0.11]];
  g.add(new THREE.Mesh(loft(st.map(function(s){ const n=o.bigNose&&s[0]<-0.4?1+0.22*Math.min(1,(-0.4-s[0])/1.4):1; return {z:s[0],hw:s[1]*(o.bigNose&&s[0]<-0.4?1.05:1),ht:s[2]*n,hb:s[3],yc:s[4]}; }),20,false),skin));   /* TB3: fuller upper nose (SATCOM inside) */
  /* engine air scoop and exhaust */
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.2,0.07,0.36),hull),0,0.45,1.15).rotation.x=-0.12;   /* small grey scoop, dark mouth only */
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.16,0.05,0.02),dark),0,0.46,0.97);
  [-1,1].forEach(function(s){ const ex=MK.at(g,new THREE.Mesh(MK.cyl(0.035,0.04,0.3,8),dark),s*0.2,-0.12,1.75); ex.rotation.y=s*0.25; });
  /* dorsal antennas, pitot */
  [[0,0.47,-1.5,0.22],[0,0.43,0.55,0.16]].forEach(function(a){ const b=MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.02,a[3],0.12),dark),a[0],a[1]+a[3]/2,a[2]); b.rotation.x=-0.35; });
  const pit=MK.at(g,new THREE.Mesh(MK.cyl(0.008,0.016,0.5,6),edge),0.22,-0.05,-2.75); pit.rotation.y=0.08;
  /* ---- EO/IR turret under the nose: mount, gimbal ball, window */
  MK.at(g,new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,0.12,14),hull),0,-0.38,o.turZ||-2.15);
  const tur=new THREE.Group(); tur.position.set(0,-0.55,o.turZ||-2.15); g.add(tur);
  tur.add(new THREE.Mesh(new THREE.SphereGeometry(0.19,18,14),phong(0x8e959c,0x666666,40)));
  const win=new THREE.Mesh(new THREE.CircleGeometry(0.085,16),glass); win.position.set(0,-0.02,-0.188); win.rotation.y=Math.PI; tur.add(win);
  /* ---- wing: straight leading edge, taper on the trailing edge, 2° dihedral; ailerons outboard, flaps inboard */
  const LE=function(sp){ return -0.42+sp*0.012; }, TE=function(sp){ return 0.58-Math.max(0,sp-0.4)*0.062; }, WY=function(sp){ return 0.5+sp*0.035; };
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:0.13,c0:c0,c1:c1}; };   /* ~13 % thick airfoil */
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    /* folding wing (TB3): the outer panel hangs from a hinge group at the fold line */
    let W=g; if(FS){ const fp=new THREE.Group(); fp.position.set(s*FS,WY(FS)+0.08,0); fp.userData.noBake=true; g.add(fp); const sub=new THREE.Group(); sub.position.set(-s*FS,-WY(FS)-0.08,0); fp.add(sub); W=sub; tips[s]=sub; folds.push({p:fp,a:s*(s>0?2.98:2.86)}); }   /* folded: the outer panels lie over the fuselage, one above the other (photos) */
    if(FS){ g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0,0,1),wsec(FS,0,1)],map,12,'b'),new THREE.Vector3(s*FS/2,-1,0)),skin));
      W.add(new THREE.Mesh(MK.outward(MK.foil([wsec(FS+0.01,0,1),wsec(1.55,0,1),wsec(1.55,0,0.74),wsec(5.98,0,0.74),wsec(6.0,0,1)],map,10,'ab'),new THREE.Vector3(s*4,-1,0)),skin));
      const hg=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.03,TE(FS)-LE(FS)),dark); hg.position.set(s*FS,WY(FS)+0.07,(LE(FS)+TE(FS))/2); g.add(hg); }   /* hinge line */
    else g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0,0,1),wsec(1.55,0,1),wsec(1.55,0,0.74),wsec(5.98,0,0.74),wsec(6.0,0,1)],map,12,'b'),new THREE.Vector3(s*3,-1,0)),skin));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.74]; };
    const FE=4.15, fl=MK.outward(MK.foil([wsec(1.6,0.74,1),wsec(FE,0.74,1)],map,5,'ab'),new THREE.Vector3(s*2.8,0,0.5));
    const F=MK.hinge(fl,skin,s>0?hp(1.6):hp(FE),s>0?hp(FE):hp(1.6),'x'); W.add(F.outer);   /* flaps stay still (no flap input) */
    const al=MK.outward(MK.foil([wsec(4.2,0.74,1),wsec(5.95,0.74,1)],map,5,'ab'),new THREE.Vector3(s*5,0,0.3));
    const A=MK.hinge(al,skin,s>0?hp(4.2):hp(5.95),s>0?hp(5.95):hp(4.2),'x'); W.add(A.outer); surfaces.push({n:A.pivot,axis:'x',input:'roll',max:20*0.01745,sign:s>0?-1:1,base:0});
    /* BAYRAKTAR on the upper side only (a decal, so it does not show mirrored from below) */
    const dz=LE(4.6)+(TE(4.6)-LE(4.6))*0.3, dy=WY(4.6)+MK.thick(0.3,0.13)*(TE(4.6)-LE(4.6))+0.006;
    const dg=new THREE.PlaneGeometry(1.7,0.28); dg.rotateX(-Math.PI/2); dg.rotateZ(s*Math.atan(0.035)); const dec=new THREE.Mesh(dg,TB2_TXT()); dec.position.set(s*4.6,dy+0.012,dz); W.add(dec);
    /* wing tip cap */
    MK.at(W,new THREE.Mesh(new THREE.BoxGeometry(0.03,0.07,TE(6)-LE(6)-0.05),edge),s*6.0,WY(6),(LE(6)+TE(6))/2);
  });
  /* wing-root fairing: blends the wing into the top of the fuselage */
  { const f=new THREE.Mesh(new THREE.SphereGeometry(0.5,20,10,0,Math.PI*2,0,Math.PI/2),hull); f.scale.set(0.82,0.22,1.25); f.position.set(0,0.42,0.1); g.add(f); }
  /* ---- tail booms: from the wing, slightly under it, to the tail */
  const BX=1.32, BY=0.47;
  [-1,1].forEach(function(s){ boom(g,s*BX,BY,-0.75,3.05,0.065,0.055,hull); ball(g,0.06,s*BX,BY,-0.75,hull).scale.set(1,1,1.6);
    const fr=MK.at(g,new THREE.Mesh(new THREE.SphereGeometry(0.1,12,8),hull),s*BX,BY+0.06,0.05); fr.scale.set(0.8,0.9,5); });   /* boom-to-wing fairing */
  /* ---- inverted-V tail: the two surfaces rise from the boom ends and meet at the apex (V2.42 review, from a photo) */
  const TH=1.2, TL=Math.atan2(BX,TH), TU=Math.hypot(BX,TH);
  const flagMat=FLAG_MAT;
  [-1,1].forEach(function(s){
    const holder=new THREE.Group(); holder.position.set(s*BX,BY,0); holder.rotation.z=s*TL; g.add(holder);
    const fs=function(u){ const t=u/TU; return {le:2.5+t*0.42, te:3.12+t*0.34, t:0.09}; };   /* narrow chord, raked back toward the apex (photo) */
    const map=function(u,z,th){ return [th,u,z]; };
    const sec=function(u,c0,c1){ const q=fs(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    holder.add(new THREE.Mesh(MK.outward(MK.foil([sec(0,0,0.68),sec(TU,0,0.68),sec(TU,0.68,1),sec(TU+0.01,0,1)],map,10,'b'),new THREE.Vector3(0,0.8,2.7)),hull));
    const rv=MK.outward(MK.foil([sec(0.04,0.68,1),sec(TU-0.08,0.68,1)],map,5,'ab'),new THREE.Vector3(0,0.8,3.2));
    const q0=fs(0.04), q1=fs(TU-0.08), R=MK.hinge(rv,hull,[0,0.04,q0.le+(q0.te-q0.le)*0.68],[0,TU-0.08,q1.le+(q1.te-q1.le)*0.68],'y'); holder.add(R.outer);
    surfaces.push({n:R.pivot,axis:'y',input:'yaw',max:20*0.01745,sign:s,base:0});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.22),flagMat); fl.position.set(s*0.055,TU*0.62,fs(TU*0.62).le+0.3); fl.rotation.y=s>0?Math.PI/2:-Math.PI/2; holder.add(fl);
  });
  /* apex fairing where the two surfaces meet, and small fairings under the boom ends */
  { const ap=new THREE.Mesh(new THREE.SphereGeometry(0.07,12,8),hull); ap.scale.set(1.2,1,5.2); ap.position.set(0,BY+TH,2.95+0.38*0.5); g.add(ap); }
  [-1,1].forEach(function(s){ const f=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),hull); f.scale.set(1,1,4.2); f.position.set(s*BX,BY-0.02,2.9); g.add(f);
    /* BAYRAKTAR TB2 lettering and red stripes on the outer side of each boom */
    const d=new THREE.Mesh(new THREE.PlaneGeometry(1.3,0.11),TB2_BOOM(o.name)); d.position.set(s*(BX+0.062),BY,1.25); d.rotation.y=s>0?Math.PI/2:-Math.PI/2; g.add(d); });
  /* ---- pusher propeller (two blades) on the engine */
  const pr=addProp(g,2.2,0.86,o.blades||2,1,0x2a2e33,0,0.11);
  /* ---- lights */
  const n0=g.children.length, strobe=addLights(g,[6.02,WY(6),0.05],[0,0.5,-0.9]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.4); });   /* small aircraft: smaller lamps */
  if(FS){ const L=g.children.slice(n0,n0+2); g.remove(L[0]); g.remove(L[1]); tips[-1].add(L[0]); tips[1].add(L[1]); }   /* tip lights fold with the panel */
  /* TB3 extras: SATCOM radome on the nose, arresting hook under the tail */
  if(o.cowl){ const cw=new THREE.Mesh(new THREE.SphereGeometry(0.5,18,10,0,Math.PI*2,0,Math.PI/2),hull); cw.scale.set(0.5,0.34,1.05); cw.position.set(0,0.36,1.25); g.add(cw);   /* engine cowling hump behind the wing */
    [-1,1].forEach(function(s){ const sc=new THREE.Mesh(new THREE.SphereGeometry(0.09,12,8),hull); sc.scale.set(1,0.8,2.6); sc.position.set(s*0.2,0.48,1.0); g.add(sc);
      MK.at(g,new THREE.Mesh(new THREE.CircleGeometry(0.06,12),dark),s*0.2,0.48,0.77).rotation.y=Math.PI; }); }
  if(o.hook){ const hk=new THREE.Group(); hk.position.set(0,-0.2,1.55); hk.rotation.x=0.5; g.add(hk); const bar=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.75),dark); bar.position.z=0.37; hk.add(bar);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.05,0.06),phong(0xd6b02a,0x444444,20)); tip.position.z=0.74; hk.add(tip); }
  /* ---- gear: nose leg under the turret, sprung main legs from the belly */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.33,-1.85,-0.86,0.14,0.1,GM,{});
  if(o.boomGear) [-1,1].forEach(function(s){ MK.leg(gear,s*BX,BY-0.05,0.42,-0.83,0.17,0.12,GM,{}); });   /* TB3: main legs under the booms (photos) */
  else [-1,1].forEach(function(s){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.62,0.12),GM.strut); leg.position.set(s*0.48,-0.6,0.35); leg.rotation.z=s*0.62; gear.add(leg);
    const t=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.1,18),GM.tire); t.rotation.z=Math.PI/2; t.position.set(s*0.75,-0.83,0.35); gear.add(t);
    const h=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.11,12),GM.hub); h.rotation.z=Math.PI/2; h.position.set(s*0.75,-0.83,0.35); gear.add(h); });
  g.add(gear);
  const out={group:g, flames:[], strobe:strobe, gear:gear, spinners:[pr], surfaces:surfaces, codeSurfaces:surfaces, stnMinX:o.stnX?o.stnX[0]:1.75, stnMaxX:o.stnX?o.stnX[1]:0, folds:folds};
  if(o.k){ const O=new THREE.Group(); g.scale.set(o.k[0],o.k[1],o.k[2]); O.add(g); out.group=O; out.stnMinX*=o.k[0]; out.stnMaxX*=o.k[0]; }   /* size in an inner group: stores hang at real size */
  return out;
}
/* Bayraktar TB3 (V2.43): TB2's layout at TB3 size — 8,35 m long, 14 m span, 2,6 m tall (Defence Turk / Baykar) — with wings that fold
   at the root, just outboard of the booms, and lie over the fuselage on the ship (photos from the player); fuller nose with the SATCOM inside,
   engine cowling hump, main gear under the booms, turret under the fuselage, stores on the fixed centre wing, three-blade propeller, arresting hook. */
function buildTB3(){ return buildTB2({k:[14/12, 1.22, 8.35/6.5], blades:3, fold:1.45, hook:true, bigNose:true, cowl:true, boomGear:true, turZ:-1.25, stnX:[0.6,1.36], name:'BAYRAKTAR TB3'}); }
/* fold or unfold the outer wing panels (0 = flight, 1 = folded) */
function tbFold(m,f){ if(m&&m.folds) m.folds.forEach(function(d){ d.p.rotation.z=d.a*f; }); }
