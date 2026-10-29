/* ------------------------------------------------------------------ TUSAŞ Aksungur — detailed model (V2.47, model series)
   11,6 m long, 24 m span, 3,1 m tall, two PD-170 engines, six wing stations (Defence Turk). Pod fuselage with the SATCOM radome over
   the nose and the EO/IR turret under it, long high straight wing, two engine nacelles with three-blade tractor propellers, tail booms
   from the nacelles to twin fins joined by a horizontal tail (H-tail), tricycle gear with the main legs under the nacelles.
   The old model stays as buildOld for the library comparison. */
function buildAksungurV2(){
  const g=new THREE.Group(), surfaces=[], spinners=[];
  const skin=phong(0x9aa2aa,0x5d6874,26,{map:ankaPaint()}), hull=phong(0x949ca4,0x5d6874,26), dark=DARK, edge=phong(0x8a929a,0x555f6a,24), glass=phong(0x22272d,0xffffff,120);
  /* ---- pod fuselage: SATCOM radome over the nose, ends behind the wing */
  const st=[[-5.8,0.05,0.05,0.05,-0.05],[-5.6,0.3,0.34,0.26,-0.04],[-5.2,0.5,0.62,0.42,-0.02],[-4.5,0.62,0.84,0.52,0.0],[-3.6,0.66,0.88,0.56,0.0],[-2.6,0.66,0.74,0.58,0.0],
    [-1.4,0.64,0.66,0.58,0.02],[0.0,0.58,0.58,0.52,0.04],[1.2,0.44,0.44,0.38,0.08],[2.2,0.26,0.28,0.22,0.12],[2.8,0.1,0.12,0.08,0.15]];
  g.add(new THREE.Mesh(loft(st.map(function(s){ return {z:s[0],hw:s[1],ht:s[2],hb:s[3],yc:s[4]}; }),20,false),skin));
  [[0,0.7,-0.6,0.24],[0,0.6,1.0,0.18],[0,-0.6,-1.8,0.18]].forEach(function(a){ const b=MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.03,a[3],0.14),dark),a[0],a[1]+(a[1]>0?a[3]/2:-a[3]/2),a[2]); b.rotation.x=a[1]>0?-0.35:0.35; });
  /* ---- EO/IR turret under the nose */
  MK.at(g,new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.18,0.14,14),hull),0,-0.55,-4.3);
  const tur=new THREE.Group(); tur.position.set(0,-0.78,-4.3); g.add(tur);
  tur.add(new THREE.Mesh(new THREE.SphereGeometry(0.26,18,14),phong(0x8e959c,0x666666,40)));
  const win=new THREE.Mesh(new THREE.CircleGeometry(0.11,16),glass); win.position.set(0,-0.03,-0.255); win.rotation.y=Math.PI; tur.add(win);
  /* ---- wing: high, very long, straight tapered, 2° dihedral; flaps inboard, ailerons outboard */
  const LE=function(sp){ return -1.15+sp*0.03; }, TE=function(sp){ return 0.6-sp*0.045; }, WY=function(sp){ return 0.66+sp*0.035; };
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:0.15,c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0,0,1),wsec(6.5,0,1),wsec(6.5,0,0.74),wsec(11.97,0,0.74),wsec(12,0,1)],map,12,'b'),new THREE.Vector3(s*6,-1,0)),skin));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.74]; };
    const al=MK.outward(MK.foil([wsec(6.55,0.74,1),wsec(11.9,0.74,1)],map,5,'ab'),new THREE.Vector3(s*9,0,0.2));
    const A=MK.hinge(al,skin,s>0?hp(6.55):hp(11.9),s>0?hp(11.9):hp(6.55),'x'); g.add(A.outer); surfaces.push({n:A.pivot,axis:'x',input:'roll',max:20*D2R,sign:s>0?-1:1,base:0});
    const dg=new THREE.PlaneGeometry(1.9,0.3); dg.rotateX(-Math.PI/2); dg.rotateZ(s*Math.atan(0.035)); const dec=new THREE.Mesh(dg,AKS_TXT()); dec.position.set(s*8.8,WY(8.8)+MK.thick(0.3,0.15)*(TE(8.8)-LE(8.8))+0.015,LE(8.8)+(TE(8.8)-LE(8.8))*0.32); g.add(dec);
    /* nacelle under the wing with the engine, intake and exhaust; tractor propeller in front */
    const NX=2.8, NY=WY(NX)-0.22;
    const nst=[[-2.0,0.16,0.16,0.16,0],[-1.8,0.3,0.3,0.32,0],[-1.0,0.36,0.36,0.4,0.0],[0.4,0.34,0.32,0.36,0.0],[1.4,0.22,0.22,0.24,0.02]];
    const nac=new THREE.Mesh(loft(nst.map(function(q){ return {z:q[0],hw:q[1],ht:q[2],hb:q[3],yc:q[4]}; }),16,false),hull); nac.position.set(s*NX,NY,0); g.add(nac);
    MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.26,0.09,0.06),dark),s*NX,NY-0.3,-1.7);
    spinners.push(addProp(g,-2.08,1.15,3,-1,0x2a2e33,s*NX,NY));
    /* tail boom from the nacelle to the fin */
    boom(g,s*NX,NY+0.02,1.3,6.0,0.17,0.1,hull);
  });
  /* ---- H-tail: twin fins on the boom ends joined by the horizontal tail, rudders and elevator */
  { const BX=2.8, BY=WY(2.8)-0.2;
    const smap=function(sp,z,th){ return [sp, BY+0.05+th, z]; }, ss=function(sp,c0,c1){ return {s:sp,le:4.9,te:6.05,t:0.1,c0:c0,c1:c1}; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([ss(-BX,0,0.7),ss(BX,0,0.7)],smap,8,'ab'),new THREE.Vector3(0,0,5.3)),hull));
    const el=MK.outward(MK.foil([ss(-BX+0.1,0.7,1),ss(BX-0.1,0.7,1)],smap,5,'ab'),new THREE.Vector3(0,0,6.0));
    const E=MK.hinge(el,hull,[-BX+0.1,BY+0.05,4.9+1.15*0.7],[BX-0.1,BY+0.05,4.9+1.15*0.7],'x'); g.add(E.outer); surfaces.push({n:E.pivot,axis:'x',input:'pitch',max:16*D2R,sign:-1,base:0});
    [-1,1].forEach(function(s){
      const fmap=function(u,z,th){ return [s*BX+th, BY+u, z]; }, ff=function(u,c0,c1){ const t=u/1.9; return {s:u,le:4.55+t*0.75,te:6.1+t*0.1,t:0.09,c0:c0,c1:c1}; };
      g.add(new THREE.Mesh(MK.outward(MK.foil([ff(-0.3,0,0.7),ff(1.9,0,0.7),ff(1.9,0.7,1),ff(1.91,0,1)],fmap,10,'b'),new THREE.Vector3(s*BX,BY+1,5.3)),hull));
      const rd=MK.outward(MK.foil([ff(0.15,0.7,1),ff(1.85,0.7,1)],fmap,5,'ab'),new THREE.Vector3(s*BX,BY+1,6.0));
      const r0=ff(0.15), r1=ff(1.85), R=MK.hinge(rd,hull,[s*BX,BY+0.15,r0.le+(r0.te-r0.le)*0.7],[s*BX,BY+1.85,r1.le+(r1.te-r1.le)*0.7],'y'); g.add(R.outer);
      surfaces.push({n:R.pivot,axis:'y',input:'yaw',max:20*D2R,sign:1,base:0});
      [1,-1].forEach(function(f){ const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.33),FLAG_MAT); fl.position.set(s*BX+f*0.06,BY+1.2,ff(1.2).le+0.5); fl.rotation.y=f>0?Math.PI/2:-Math.PI/2; g.add(fl); });
    }); }
  /* ---- lights */
  const n0=g.children.length, strobe=addLights(g,[12.02,WY(12),-0.4],[0,0.82,-1.5]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.55); });
  /* ---- gear: nose leg under the turret, main legs from the nacelles */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.5,-3.6,-1.45,0.25,0.15,GM,{});
  [-1,1].forEach(function(s){ MK.leg(gear,s*2.8,0.18,0.1,-1.38,0.32,0.2,GM,{twin:true,axle:true}); });
  g.add(gear);
  return {group:g, flames:[], strobe:strobe, gear:gear, spinners:spinners, surfaces:surfaces, codeSurfaces:surfaces, stnMinX:3.4};
}
let AKS_TXT_M=null; function AKS_TXT(){ return AKS_TXT_M||(AKS_TXT_M=ankaTxt('AKSUNGUR')); }
