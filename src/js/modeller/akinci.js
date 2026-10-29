/* ------------------------------------------------------------------ Bayraktar Akıncı — detailed model (V2.44, model series)
   12,2 m long, 20 m span, 4,1 m tall (Baykar). Long fuselage with the SATCOM radome in a bulged upper nose and the EO/IR turret
   under the nose, high straight tapered wing with dihedral and canted winglets, two turboprops in wing nacelles with five-blade
   tractor propellers, conventional tail (swept fin, low tailplanes, small ventral fin), tricycle gear (mains in the nacelles), 8 wing hardpoints
   outboard of the nacelles. Mid wing with growing dihedral, curved winglets, turret under the rear fuselage (from the player's photos).
   The old model stays as buildOld for the library comparison. Shapes the sources do not describe (tail, winglets) are marked
   in the review notes and checked against the player's photos. */
function akPaint(){
  return MK.planarTex(function(x,X,Z,px){
    x.fillStyle='#eef0f2'; x.fillRect(0,0,16*px,24*px);
    x.strokeStyle='rgba(70,80,92,0.5)'; x.lineWidth=2;
    const L=function(a){ x.beginPath(); x.moveTo(X(a[0]),Z(a[1])); for(let i=2;i<a.length;i+=2) x.lineTo(X(a[i]),Z(a[i+1])); x.stroke(); };
    L([-0.5,-4.4, 0.5,-4.4]); L([-0.6,-2.0, 0.6,-2.0]); L([-0.5,2.4, 0.5,2.4]); L([-0.25,-1.6, -0.25,-0.6, 0.25,-0.6, 0.25,-1.6, -0.25,-1.6]);
    [1,-1].forEach(function(s){ L([s*3.6,0.75, s*9.6,0.35]); L([s*6.6,0.55, s*6.6,0.95]); });
  },32);
}
let AK_TXT_M=null;
function AK_TXT(){ return AK_TXT_M||(AK_TXT_M=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,map:apTex(512,124,function(x,W,H){ x.clearRect(0,0,W,H);
  x.fillStyle='#1d232a'; x.textAlign='center'; x.textBaseline='middle'; x.font='600 30px Arial, sans-serif'; x.fillText('BAYRAKTAR',W/2,30); x.font='700 58px Arial, sans-serif'; x.fillText('AKINCI',W/2,84); })})); }
function buildAkinciV2(){
  const g=new THREE.Group(), surfaces=[], spinners=[];
  const skin=phong(0x9aa2aa,0x5d6874,26,{map:akPaint()}), hull=phong(0x949ca4,0x5d6874,26), dark=DARK, edge=phong(0x8a929a,0x555f6a,24), glass=phong(0x22272d,0xffffff,120);
  /* ---- fuselage: bulged upper nose (SATCOM), deepest at the wing, long tail cone */
  const st=[[-6.1,0.05,0.05,0.05,-0.1],[-5.9,0.3,0.32,0.24,-0.08],[-5.5,0.52,0.62,0.4,-0.04],[-4.9,0.68,0.86,0.5,0.0],[-4.0,0.76,0.98,0.56,0.02],[-3.0,0.78,0.9,0.6,0.02],
    [-1.6,0.78,0.78,0.62,0.02],[0.0,0.74,0.72,0.6,0.04],[1.6,0.6,0.58,0.5,0.08],[3.2,0.42,0.42,0.36,0.14],[4.8,0.26,0.28,0.22,0.22],[6.0,0.12,0.14,0.1,0.3]];
  g.add(new THREE.Mesh(loft(st.map(function(s){ return {z:s[0],hw:s[1],ht:s[2],hb:s[3],yc:s[4]}; }),22,false),skin));
  /* antennas, air data probe */
  [[0,0.8,-0.4,0.3],[0,0.72,1.4,0.22],[0,-0.62,0.8,0.2]].forEach(function(a){ const b=MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.03,a[3],0.16),dark),a[0],a[1]+(a[1]>0?a[3]/2:-a[3]/2),a[2]); b.rotation.x=a[1]>0?-0.35:0.35; });
  const pit=MK.at(g,new THREE.Mesh(MK.cyl(0.01,0.02,0.7,6),edge),0.3,-0.1,-5.75);
  /* ---- EO/IR turret */
  MK.at(g,new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.18,0.14,16),hull),0,-0.36,2.7);
  const tur=new THREE.Group(); tur.position.set(0,-0.58,2.7); g.add(tur);   /* photos: turret under the rear fuselage */
  tur.add(new THREE.Mesh(new THREE.SphereGeometry(0.28,20,14),phong(0x8e959c,0x666666,40)));
  const win=new THREE.Mesh(new THREE.CircleGeometry(0.12,16),glass); win.position.set(0,-0.03,-0.275); win.rotation.y=Math.PI; tur.add(win);
  /* ---- wing: high, straight tapered, 3° dihedral; flaps and ailerons; canted winglets */
  const LE=function(sp){ return -1.15+sp*0.04; }, TE=function(sp){ return 1.0-sp*0.085; }, WY=function(sp){ return 0.16+sp*0.045+Math.max(0,sp-6)*0.03; };   /* mid wing, dihedral growing outboard (photos) */
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:0.14,c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0,0,1),wsec(3.3,0,1),wsec(3.3,0,0.75),wsec(9.95,0,0.75),wsec(10,0,1)],map,12,'b'),new THREE.Vector3(s*5,-1,0)),skin));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.75]; };
    const fl=MK.outward(MK.foil([wsec(3.35,0.75,1),wsec(6.5,0.75,1)],map,5,'ab'),new THREE.Vector3(s*5,0,0.6));
    const F=MK.hinge(fl,skin,s>0?hp(3.35):hp(6.5),s>0?hp(6.5):hp(3.35),'x'); g.add(F.outer);
    const al=MK.outward(MK.foil([wsec(6.55,0.75,1),wsec(9.9,0.75,1)],map,5,'ab'),new THREE.Vector3(s*8,0,0.4));
    const A=MK.hinge(al,skin,s>0?hp(6.55):hp(9.9),s>0?hp(9.9):hp(6.55),'x'); g.add(A.outer); surfaces.push({n:A.pivot,axis:'x',input:'roll',max:18*D2R,sign:s>0?-1:1,base:0});
    /* winglet: rises from the tip, canted outward, swept back */
    /* curved winglet: a short outward-leaning root, then nearly upright and swept back (photos) */
    const wmap=function(u,z,th){ return [th,u,z]; };
    const wl=new THREE.Group(); wl.position.set(s*10,WY(10),0); wl.rotation.z=-s*0.95; g.add(wl);
    const w1=function(u){ const t=u/0.38; return {s:u,le:LE(10)+0.02+t*0.12,te:TE(10)-0.01+t*0.02,t:0.09}; };
    wl.add(new THREE.Mesh(MK.outward(MK.foil([w1(0),w1(0.4)],wmap,8,'ab'),new THREE.Vector3(0,0.2,0.4)),skin));
    const wl2=new THREE.Group(); wl2.position.set(0,0.38,0); wl2.rotation.z=s*0.68; wl.add(wl2);
    const w2=function(u){ const t=u/1.3; return {s:u,le:LE(10)+0.14+t*0.62,te:TE(10)+0.01+t*0.2-t*t*0.08,t:0.08}; };
    wl2.add(new THREE.Mesh(MK.outward(MK.foil([w2(0),w2(0.65),w2(1.3)],wmap,8,'ab'),new THREE.Vector3(0,0.7,0.6)),skin));
    /* nacelle: engine, intake under the spinner, exhaust; propeller in front of the wing */
    const NX=2.75, NY=WY(NX)-0.2;   /* nacelle hangs under the wing */
    const nst=[[-2.25,0.18,0.18,0.18,0],[-2.0,0.32,0.34,0.36,0],[-1.2,0.38,0.38,0.44,0.02],[0.2,0.34,0.3,0.42,0.0],[1.4,0.2,0.16,0.26,0.02],[1.9,0.06,0.05,0.08,0.04]];
    const nac=new THREE.Mesh(loft(nst.map(function(q){ return {z:q[0],hw:q[1],ht:q[2],hb:q[3],yc:q[4]}; }),16,false),hull); nac.position.set(s*NX,NY,0); g.add(nac);
    MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.3,0.1,0.06),dark),s*NX,NY-0.32,-1.95);
    [-1,1].forEach(function(e){ const ex=MK.at(g,new THREE.Mesh(MK.cyl(0.06,0.07,0.35,8),dark),s*NX+e*0.3,NY+0.05,-0.6); ex.rotation.y=e*0.5; });
    spinners.push(addProp(g,-2.32,1.15,5,-1,0x2a2e33,s*NX,NY));
  });
  /* ---- conventional tail (photos): swept fin on top with rudder, low tailplanes with elevators, small ventral fin */
  { const fmap=function(u,z,th){ return [th,0.3+u,z]; }, ff=function(u){ const t=u/2.15; return {s:u,le:3.85+t*1.55,te:5.75+t*0.45,t:0.09}; };
    const fsec=function(u,c0,c1){ const q=ff(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([fsec(0,0,0.7),fsec(2.15,0,0.7),fsec(2.15,0.7,1),fsec(2.16,0,1)],fmap,10,'b'),new THREE.Vector3(0,1.4,5)),hull));
    const rd=MK.outward(MK.foil([fsec(0.15,0.7,1),fsec(2.1,0.7,1)],fmap,5,'ab'),new THREE.Vector3(0,1.4,6));
    const r0=ff(0.15), r1=ff(2.1), R=MK.hinge(rd,hull,[0,0.45,r0.le+(r0.te-r0.le)*0.7],[0,2.4,r1.le+(r1.te-r1.le)*0.7],'y'); g.add(R.outer);
    surfaces.push({n:R.pivot,axis:'y',input:'yaw',max:20*D2R,sign:1,base:0});
    [-1,1].forEach(function(s){ const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.3),FLAG_MAT); fl.position.set(s*0.075,1.75,ff(1.45).le+0.55); fl.rotation.y=s>0?Math.PI/2:-Math.PI/2; g.add(fl); });
    const vmap=function(u,z,th){ return [th,0.05-u,z]; }, vf=function(u){ const t=u/0.45; return {s:u,le:4.6+t*0.5,te:5.6+t*0.2,t:0.08}; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([vf(0),vf(0.45)],vmap,6,'ab'),new THREE.Vector3(0,-0.4,5.2)),hull));
    [-1,1].forEach(function(s){ const map=function(sp,z,th){ return [s*sp,0.16+sp*0.03+th,z]; }, ts=function(sp,c0,c1){ const t=(sp-0.15)/2.35; return {s:sp,le:4.55+t*0.55,te:5.85+t*0.05,t:0.09,c0:c0,c1:c1}; };
      g.add(new THREE.Mesh(MK.outward(MK.foil([ts(0.15,0,0.68),ts(2.5,0,0.68),ts(2.5,0.68,1),ts(2.51,0,1)],map,10,'b'),new THREE.Vector3(s*1.3,0,5.2)),hull));
      const el=MK.outward(MK.foil([ts(0.2,0.68,1),ts(2.45,0.68,1)],map,5,'ab'),new THREE.Vector3(s*1.3,0,5.8));
      const a=ts(0.2), b=ts(2.45), hA=[s*0.2,0.166,a.le+(a.te-a.le)*0.68], hB=[s*2.45,0.234,b.le+(b.te-b.le)*0.68];
      const E=MK.hinge(el,hull,s>0?hA:hB,s>0?hB:hA,'x'); g.add(E.outer); surfaces.push({n:E.pivot,axis:'x',input:'pitch',max:16*D2R,sign:-1,base:0}); }); }
  /* ---- lettering: BAYRAKTAR AKINCI on both sides of the rear fuselage */
  [-1,1].forEach(function(s){ const d=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.36),AK_TXT()); d.position.set(s*0.52,0.36,2.0); d.rotation.y=s>0?Math.PI/2:-Math.PI/2; g.add(d); });
  /* ---- lights */
  const n0=g.children.length, strobe=addLights(g,[10.02,WY(10),0.1],[0,0.95,-0.6]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.6); });
  /* ---- gear: nose leg under the turret's rear, main legs from the nacelles */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.55,-3.6,-1.3,0.25,0.16,GM,{twin:true});
  [-1,1].forEach(function(s){ MK.leg(gear,s*2.75,0.25,0.35,-1.25,0.3,0.2,GM,{twin:true,axle:true}); });
  g.add(gear);
  return {group:g, flames:[], strobe:strobe, gear:gear, spinners:spinners, surfaces:surfaces, codeSurfaces:surfaces, stnMinX:3.4};   /* photos: four stations under each wing, outboard of the nacelle */
}
