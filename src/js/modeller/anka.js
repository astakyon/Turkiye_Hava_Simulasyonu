/* ------------------------------------------------------------------ TUSAŞ ANKA and ANKA-3 — detailed models (V2.46, model series)
   ANKA (ANKA-S): 8,6 m long, 17,5 m span, 3,25 m tall, V-tail, rear pusher piston engine (Defence Turk). Slender fuselage with the
   SATCOM radome over the nose, EO/IR turret under it, long high straight wing, three-blade pusher propeller, tricycle gear.
   ANKA-3: tailless flying wing (no horizontal or vertical tail, Defence Turk / TUSAŞ), jet engine, weapons inside the body:
   two body stations and two inner wing stations of 650 kg, two outer wing stations of 100 kg. Triangle planform with a deep centre body (see buildAnka3V2). Its size is not published; the game keeps ~9 m × 13 m.
   The old models stay as buildOld for the library comparison. */
function ankaPaint(c){
  return MK.planarTex(function(x,X,Z,px){
    x.fillStyle=c||'#eef0f2'; x.fillRect(0,0,16*px,24*px);
    x.strokeStyle='rgba(60,70,82,0.45)'; x.lineWidth=2;
    const L=function(a){ x.beginPath(); x.moveTo(X(a[0]),Z(a[1])); for(let i=2;i<a.length;i+=2) x.lineTo(X(a[i]),Z(a[i+1])); x.stroke(); };
    [1,-1].forEach(function(s){ L([s*2.0,0.25, s*7.2,0.05]); L([s*4.6,-0.4, s*4.6,0.4]); L([s*1.5,2.6, s*1.5,4.0]); L([s*4.2,2.9, s*6.3,3.4]); });
    for(let z=-3.2; z<=3.2; z+=1.6) L([-0.35,z,0.35,z]);
  },32);
}
function ankaTxt(t,col){ return new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide,
  map:apTex(512,96,function(x,W,H){ x.clearRect(0,0,W,H); x.fillStyle=col||'#1d232a'; x.font='700 60px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(t,W/2,H/2+3); })}); }
function buildAnkaV2(){
  const g=new THREE.Group(), surfaces=[];
  const skin=phong(0x9aa2aa,0x5d6874,26,{map:ankaPaint()}), hull=phong(0x949ca4,0x5d6874,26), dark=DARK, edge=phong(0x8a929a,0x555f6a,24), glass=phong(0x22272d,0xffffff,120);
  /* ---- fuselage: SATCOM radome over the nose, tapering to the engine and the propeller hub */
  const st=[[-4.3,0.04,0.04,0.04,-0.05],[-4.12,0.22,0.26,0.2,-0.04],[-3.8,0.36,0.46,0.32,-0.02],[-3.2,0.44,0.62,0.38,0.0],[-2.4,0.46,0.64,0.4,0.0],[-1.5,0.46,0.52,0.42,0.0],
    [-0.4,0.45,0.46,0.42,0.02],[0.8,0.4,0.4,0.36,0.04],[2.0,0.3,0.3,0.26,0.08],[3.1,0.2,0.2,0.17,0.12],[3.85,0.13,0.13,0.11,0.15]];
  g.add(new THREE.Mesh(loft(st.map(function(s){ return {z:s[0],hw:s[1],ht:s[2],hb:s[3],yc:s[4]}; }),20,false),skin));
  [[0,0.46,0.3,0.22],[0,0.38,1.6,0.16]].forEach(function(a){ const b=MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.02,a[3],0.12),dark),a[0],a[1]+a[3]/2,a[2]); b.rotation.x=-0.35; });
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.2,0.08,0.4),hull),0,0.33,2.4);   /* engine air scoop */
  /* ---- EO/IR turret under the nose */
  MK.at(g,new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,0.12,14),hull),0,-0.42,-2.9);
  const tur=new THREE.Group(); tur.position.set(0,-0.62,-2.9); g.add(tur);
  tur.add(new THREE.Mesh(new THREE.SphereGeometry(0.22,18,14),phong(0x8e959c,0x666666,40)));
  const win=new THREE.Mesh(new THREE.CircleGeometry(0.09,16),glass); win.position.set(0,-0.02,-0.218); win.rotation.y=Math.PI; tur.add(win);
  /* ---- wing: high, long, straight tapered, 2° dihedral, ailerons outboard */
  const LE=function(sp){ return -0.85+sp*0.03; }, TE=function(sp){ return 0.45-sp*0.055; }, WY=function(sp){ return 0.5+sp*0.035; };
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:0.15,c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, WY(sp)+th, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0,0,1),wsec(4.8,0,1),wsec(4.8,0,0.74),wsec(8.73,0,0.74),wsec(8.75,0,1)],map,12,'b'),new THREE.Vector3(s*4,-1,0)),skin));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,WY(sp),q.le+(q.te-q.le)*0.74]; };
    const al=MK.outward(MK.foil([wsec(4.85,0.74,1),wsec(8.7,0.74,1)],map,5,'ab'),new THREE.Vector3(s*6.8,0,0.2));
    const A=MK.hinge(al,skin,s>0?hp(4.85):hp(8.7),s>0?hp(8.7):hp(4.85),'x'); g.add(A.outer); surfaces.push({n:A.pivot,axis:'x',input:'roll',max:20*D2R,sign:s>0?-1:1,base:0});
    const dg=new THREE.PlaneGeometry(1.4,0.26); dg.rotateX(-Math.PI/2); dg.rotateZ(s*Math.atan(0.035)); const dec=new THREE.Mesh(dg,ANKA_TXT()); dec.position.set(s*6.4,WY(6.4)+MK.thick(0.3,0.15)*(TE(6.4)-LE(6.4))+0.015,LE(6.4)+(TE(6.4)-LE(6.4))*0.32); g.add(dec);
  });
  /* ---- V-tail: two surfaces at 38° from the rear fuselage, ruddervators */
  [-1,1].forEach(function(s){
    const holder=new THREE.Group(); holder.position.set(s*0.12,0.28,0); holder.rotation.z=-s*(Math.PI/2-0.66); g.add(holder);
    const fs=function(u){ const t=u/2.0; return {le:2.55+t*0.75, te:3.7+t*0.2, t:0.09}; };
    const map=function(u,z,th){ return [th,u,z]; };
    const sec=function(u,c0,c1){ const q=fs(u); return {s:u,le:q.le,te:q.te,t:q.t,c0:c0,c1:c1}; };
    holder.add(new THREE.Mesh(MK.outward(MK.foil([sec(0,0,0.7),sec(2.0,0,0.7),sec(2.0,0.7,1),sec(2.01,0,1)],map,10,'b'),new THREE.Vector3(0,1,3.1)),hull));
    const rv=MK.outward(MK.foil([sec(0.08,0.7,1),sec(1.95,0.7,1)],map,5,'ab'),new THREE.Vector3(0,1,3.7));
    const q0=fs(0.08), q1=fs(1.95), R=MK.hinge(rv,hull,[0,0.08,q0.le+(q0.te-q0.le)*0.7],[0,1.95,q1.le+(q1.te-q1.le)*0.7],'y'); holder.add(R.outer);
    surfaces.push({n:R.pivot,axis:'y',input:'pitch',max:18*D2R,sign:s,base:0});
    [1,-1].forEach(function(f){ const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.28),FLAG_MAT); fl.position.set(f*0.05,1.1,fs(1.1).le+0.42); fl.rotation.y=f>0?Math.PI/2:-Math.PI/2; holder.add(fl); });
  });
  /* ---- pusher propeller (three blades) */
  const pr=addProp(g,3.95,0.92,3,1,0x2a2e33,0,0.15);
  /* ---- lights */
  const n0=g.children.length, strobe=addLights(g,[8.77,WY(8.75),-0.2],[0,0.55,-1.2]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.5); });
  /* ---- gear: nose leg behind the turret, main legs from the lower fuselage */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.38,-2.2,-1.25,0.2,0.12,GM,{});
  [-1,1].forEach(function(s){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.95,0.16),GM.strut); leg.position.set(s*0.66,-0.78,0.35); leg.rotation.z=s*0.55; gear.add(leg);
    const t=new THREE.Mesh(new THREE.CylinderGeometry(0.23,0.23,0.14,18),GM.tire); t.rotation.z=Math.PI/2; t.position.set(s*1.0,-1.22,0.35); gear.add(t);
    const h=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.15,12),GM.hub); h.rotation.z=Math.PI/2; h.position.set(s*1.0,-1.22,0.35); gear.add(h); });
  g.add(gear);
  return {group:g, flames:[], strobe:strobe, gear:gear, spinners:[pr], surfaces:surfaces, codeSurfaces:surfaces};
}
let ANKA_TXT_M=null; function ANKA_TXT(){ return ANKA_TXT_M||(ANKA_TXT_M=ankaTxt('ANKA')); }
/* ---------------------------------------------------------------- ANKA-3 flying wing (V2.46, rebuilt from the player's photos)
   Front and flight photos: one blended body, thick in the middle (about 1,1 m) and thin outboard;
   the wide arched intake sits at the front of the dome; the thin wing blends into the body at mid height and runs to small upright
   tip tabs; the exhaust opens at the back of the body; the weapons bay is under the body. */
function buildAnka3V2(){
  const g=new THREE.Group(), surfaces=[];
  const skin=phong(0x434d58,0x263039,22,{map:ankaPaint('#ffffff')}), dkg=phong(0x3e4852,0x232b33,20), dark=DARK, edge=phong(0x3c434a,0x22282d,18);
  /* ---- thin wing: swept leading edge, near-straight trailing edge, elevons outboard */
  /* planform (aerial photo, X-47B-like): a delta with a slight crank at 2,4 m;
     shallow W trailing edge: the centre runs back to the nozzle, a small notch at the crank, back again to broad tips */
  const pw=function(P){ return function(sp){ for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1]; if(sp<=b[0]) return a[1]+(b[1]-a[1])*(sp-a[0])/(b[0]-a[0]); } return P[P.length-1][1]; }; };
  const LE=pw([[0,-4.5],[6.5,3.1]]), TE=pw([[0,3.6],[2.2,2.4],[4.0,3.3],[6.5,3.9]]);   /* V2.46 review: the player chose the first draft's wing — straight ~49° leading edge, W trailing edge */
  const TH=function(sp){ return sp<0.8?0.16-sp*0.0125:(sp<2.8?0.15-(sp-0.8)*0.045:Math.max(0.045,0.06-(sp-2.8)*0.004)); };   /* V2.46 review: one blended body — thick in the middle, thin outboard */
  const wsec=function(sp,c0,c1){ return {s:sp,le:LE(sp),te:TE(sp),t:TH(sp),c0:c0,c1:c1}; };
  [-1,1].forEach(function(s){
    const map=function(sp,z,th){ return [s*sp, (th<0?th*0.6:th)-sp*0.008, z]; };
    g.add(new THREE.Mesh(MK.outward(MK.foil([wsec(0,0,1),wsec(0.4,0,1),wsec(1.0,0,1),wsec(1.4,0,1),wsec(2.2,0,1),wsec(1.7,0,1),wsec(2.4,0,1),wsec(3.0,0,1),wsec(4.0,0,1),wsec(4.2,0,1),wsec(4.2,0,0.78),wsec(6.3,0,0.78),wsec(6.3,0,1),wsec(6.5,0,1)],map,12,'b'),new THREE.Vector3(s*3.5,-0.5,1)),skin));
    const hp=function(sp){ const q=wsec(sp); return [s*sp,-sp*0.008,q.le+(q.te-q.le)*0.78]; };
    const el=MK.outward(MK.foil([wsec(4.25,0.78,1),wsec(6.25,0.78,1)],map,5,'ab'),new THREE.Vector3(s*5.2,0,3.5));
    const E=MK.hinge(el,skin,s>0?hp(4.25):hp(6.25),s>0?hp(6.25):hp(4.25),'x'); g.add(E.outer);
    surfaces.push({n:E.pivot,axis:'x',input:'roll',max:18*D2R,sign:s>0?-1:1,base:0});
    /* small upright tab at the tip, at the trailing edge */
    const t=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.34,0.45),dkg); t.position.set(s*6.42,0.12,TE(6.4)-0.35); t.rotation.z=-s*0.12; g.add(t);
  });
  /* wide arched intake at the front of the dome: a hood that stands out of the dome, dark mouth facing forward */
  { const arch=function(w,h){ const sh=new THREE.Shape(); sh.moveTo(-w,0); for(let i=0;i<=18;i++){ const a=Math.PI-i/18*Math.PI; sh.lineTo(Math.cos(a)*w,Math.sin(a)*h); } sh.closePath(); return sh; };
    const outer=arch(0.78,0.52); outer.holes.push(arch(0.68,0.42));
    const hood=new THREE.Mesh(new THREE.ExtrudeGeometry(outer,{depth:0.5,bevelEnabled:false}),skin); hood.position.set(0,0.46,-3.05); g.add(hood);
    const hs=[[-3.05,0.85,0.5],[-2.6,1.05,0.44],[-1.8,1.25,0.3],[-0.8,1.3,0.16],[0.4,1.1,0.06],[1.2,0.8,0.02]];   /* highest at the intake, fading back into the flat top (photos) */
    const hump=new THREE.Mesh(loft(hs.map(function(q){ return {z:q[0],hw:q[1],ht:q[2],hb:0.02,yc:0.42}; }),24,true),skin); g.add(hump);   /* the intake hump blends back into the body */
    const mouth=new THREE.Mesh(new THREE.ShapeGeometry(arch(0.68,0.42)),new THREE.MeshPhongMaterial({color:0x07090b,side:THREE.DoubleSide})); mouth.position.set(0,0.46,-2.95); g.add(mouth);
    const lip=new THREE.Mesh(new THREE.ExtrudeGeometry(outer,{depth:0.06,bevelEnabled:false}),dkg); lip.position.set(0,0.46,-3.1); g.add(lip); }
  /* engine nozzle at the back, set low into a rounded fairing under the tail (flight and taxi photos) */
  { const fr=new THREE.Mesh(new THREE.SphereGeometry(0.5,20,12),skin); fr.scale.set(1.3,0.5,2.6); fr.position.set(0,-0.02,2.5); g.add(fr); MK.at(g,new THREE.Mesh(MK.cyl(0.36,0.32,0.6,24),dkg),0,-0.02,3.4);
    MK.at(g,new THREE.Mesh(MK.cyl(0.29,0.27,0.3,22,true),dark),0,-0.02,3.7);
    const d=new THREE.Mesh(new THREE.CircleGeometry(0.3,22),phong(0x241e1a,0x111111,10)); d.position.set(0,-0.02,3.6); d.rotation.y=Math.PI; g.add(d); }
  const flames=addFlames(g,[[0,-0.02,3.85]],0.5);
  addPitot(g,-4.5,0.9);
  /* dorsal antennas, a dark panel on top */
  MK.at(g,new THREE.Mesh(new THREE.BoxGeometry(0.03,0.22,0.14),dark),0,0.68,-1.0).rotation.x=-0.35;
  { const pg=new THREE.PlaneGeometry(1.9,2.6); pg.rotateX(-Math.PI/2); const pn=new THREE.Mesh(pg,phong(0x2a3036,0x1a1e22,30,{polygonOffset:true,polygonOffsetFactor:-2})); pn.position.set(0,0.6,0.3); pn.rotation.x=0.07; g.add(pn); }
  /* ---- marking */
  [-1,1].forEach(function(s){ const dg=new THREE.PlaneGeometry(1.3,0.24); dg.rotateX(-Math.PI/2); const d=new THREE.Mesh(dg,ANKA3_TXT()); d.position.set(s*3.6,0.06,LE(3.6)+(TE(3.6)-LE(3.6))*0.45); g.add(d); });
  /* ---- lights */
  const n0=g.children.length, strobe=addLights(g,[6.52,0.0,LE(6.5)+0.5],[0,0.56,0.3]); g.children.slice(n0).forEach(function(m){ m.scale.multiplyScalar(0.55); });
  /* ---- gear: long legs (photos) */
  const gear=new THREE.Group(), GM=MK.mats();
  MK.leg(gear,0,-0.3,-2.9,-1.25,0.25,0.15,GM,{twin:true});
  [-1,1].forEach(function(s){ MK.leg(gear,s*1.55,-0.2,0.7,-1.2,0.3,0.2,GM,{side:s*0.4}); });
  g.add(gear);
  /* ---- internal weapons bay under the body: two stations side by side, two doors each */
  const bay={xc:0.35, zc:-0.4, y:-0.4, doors:[], cav:null}, dmat=phong(0x3e4852,0x232b33,20), BL=4.1;
  const cav=new THREE.Group(); [-1,1].forEach(function(s){ const c=new THREE.Mesh(new THREE.BoxGeometry(0.54,0.02,BL-0.1),phong(0x15181c,0x111111,8)); c.position.set(s*0.35,-0.385,bay.zc); cav.add(c); });
  cav.visible=false; cav.userData.noBake=true; g.add(cav); bay.cav=cav;
  [-1,1].forEach(function(s){ [[0.63,-1],[0.07,1]].forEach(function(h){ const piv=new THREE.Group(); piv.position.set(s*h[0],-0.395,bay.zc); piv.userData.noBake=true;
      const d=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.02,BL),dmat); d.position.x=h[1]*s*0.14; piv.add(d); g.add(piv);
      bay.doors.push({p:piv, a:-h[1]*s*1.62}); }); });
  return {group:g, flames:flames, strobe:strobe, gear:gear, spinners:[], surfaces:surfaces, codeSurfaces:surfaces, bay:bay};
}
let ANKA3_TXT_M=null; function ANKA3_TXT(){ return ANKA3_TXT_M||(ANKA3_TXT_M=ankaTxt('ANKA-3','rgba(235,240,245,0.9)')); }
