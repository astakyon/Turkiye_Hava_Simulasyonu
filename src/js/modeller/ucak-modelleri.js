/* ------------------------------------------------------------------ models (layout from the six-view drawings, real overall sizes) */
// TUSAŞ ANKA-3: tailless arrow-head flying wing, dorsal engine hump, single exhaust
function buildAnka3(){
  const g=new THREE.Group();
  const hull=phong(0x5d6873,0x3a4652,25,{side:THREE.DoubleSide}), wing=phong(0x56616c,0x34414d,22);
  const st=[{z:-4.8,hw:.05,ht:.05,hb:.05,yc:0},{z:-3.6,hw:.5,ht:.28,hb:.14,yc:.06},{z:-1.6,hw:1.1,ht:.5,hb:.16,yc:.1},
    {z:1.4,hw:1.5,ht:.56,hb:.16,yc:.12},{z:4,hw:1.2,ht:.4,hb:.12,yc:.08},{z:5,hw:.7,ht:.26,hb:.1,yc:.06}];
  g.add(new THREE.Mesh(loft(st,20,false),hull));
  addFlatD(g,[[0.4,-4.4],[6.0,3.6],[6.0,4.5],[2.4,4.9],[0.4,5.0]],0.16,-0.06,wing,0.05);
  const pn=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.2),DARK); pn.rotation.x=-Math.PI/2; pn.position.set(0,0.625,-0.3); g.add(pn);
  addNozzle(g,0,0.2,5.0,0.38,0.8);
  const flames=addFlames(g,[[0,0.2,5.45]],0.8);
  addPitot(g,-4.7,1.2);
  const strobe=addLights(g,[6.0,0.3,4.1],[0,0.75,1.5]);
  const gear=buildGear([LEG(0,-0.1,-2.8,0.25,1.5),LEG(-1.3,-0.1,1.4,0.3,1.5),LEG(1.3,-0.1,1.4,0.3,1.5)]); g.add(gear);
  return {group:g,flames:flames,strobe:strobe,gear:gear,spinners:[]};
}
// TUSAŞ HÜRJET: tandem jet trainer, single fin, side inlets, red/white scheme
function buildHurjet(){
  const g=new THREE.Group();
  const white=phong(0xe9edf0,0x556677,35,{side:THREE.DoubleSide}), redW=phong(0xc3162c,0x663333,25), dk=phong(0x15181c,0x333333,40,{side:THREE.DoubleSide});
  const st=[{z:-6.8,hw:.04,ht:.04,hb:.04,yc:0},{z:-6.0,hw:.26,ht:.22,hb:.2,yc:0},{z:-5.0,hw:.55,ht:.42,hb:.36,yc:0},{z:-3.5,hw:.74,ht:.56,hb:.5,yc:.02},
    {z:-1.5,hw:.92,ht:.62,hb:.55,yc:.04},{z:1,hw:.98,ht:.6,hb:.55,yc:.03},{z:4,hw:.8,ht:.5,hb:.5,yc:0},{z:6.4,hw:.55,ht:.42,hb:.42,yc:0},{z:6.8,hw:.5,ht:.4,hb:.4,yc:0}];
  g.add(new THREE.Mesh(loft(st,20,false),white));
  g.add(new THREE.Mesh(loft(noseCap(st,3,1.05),20,false),dk));
  addFlat(g,[[0.8,-1.4],[4.75,1.7],[4.75,2.9],[0.8,3.5]],0.16,-0.1,redW);
  addFlat(g,[[0.4,-3.8],[1.4,-1.5],[0.8,-0.6],[0.4,0.2]],0.1,-0.04,redW);        // LERX
  addFlat(g,[[0.6,4.3],[2.7,5.5],[2.7,6.5],[0.6,6.6]],0.1,-0.05,redW);           // stabilizers
  addCanopy(g,.5,.42,1.95,.62,-2.8);
  [-1,1].forEach(s=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(.55,.65,1.9),DARK); b.position.set(s*.95,-.1,-1.3); b.rotation.z=-s*0.15; g.add(b); });
  addCenterFin(g,[[0,0],[3.2,0],[2.4,2.7],[0.9,2.7]],3.5,0.3,redW,{w:1.1,h:0.74,u:1.7,v:1.0},{pts:[[0.73,2.2],[2.55,2.2],[2.4,2.7],[0.9,2.7]],mat:dk});
  addNozzle(g,0,0.02,6.7,0.45,1.2);
  const flames=addFlames(g,[[0,0.02,7.3]],0.9);
  addPitot(g,-6.7,0.9);
  const strobe=addLights(g,[4.75,-0.02,2.3],[0,3.0,5.2]);
  const gear=buildGear([LEG(0,-0.5,-4.2,0.28,1.95),LEG(-1.1,-0.5,0.4,0.34,1.95),LEG(1.1,-0.5,0.4,0.34,1.95)]); g.add(gear);
  return {group:g,flames:flames,strobe:strobe,gear:gear,spinners:[]};
}
// TUSAŞ HÜRKUŞ: turboprop tandem trainer, white with red trim
function buildHurkus(){
  const g=new THREE.Group();
  const white=phong(0xf1f3f5,0x556677,35,{side:THREE.DoubleSide}), wingM=phong(0xe8ebee,0x445566,28), dk=phong(0x15181c,0x333333,40,{side:THREE.DoubleSide}), redM=phong(0xc8102e,0x553333,30);
  const st=[{z:-5.0,hw:.2,ht:.2,hb:.2,yc:0},{z:-4.6,hw:.52,ht:.5,hb:.48,yc:0},{z:-3.6,hw:.7,ht:.66,hb:.58,yc:0},{z:-1.8,hw:.62,ht:.6,hb:.5,yc:.02},
    {z:0.4,hw:.56,ht:.56,hb:.45,yc:.02},{z:3,hw:.4,ht:.4,hb:.34,yc:.04},{z:5.5,hw:.16,ht:.2,hb:.16,yc:.08}];
  g.add(new THREE.Mesh(loft(st,20,false),white));
  g.add(new THREE.Mesh(loft(noseCap(st,3,1.03),20,false),RED_M));                // red cowling
  g.add(new THREE.Mesh(loft(noseCap(st.slice(0,4),4,1.045),20,true),dk));      // dark anti-glare top
  addFlat(g,[[0.5,-0.3],[4.98,0.5],[4.98,1.4],[0.5,1.6]],0.14,-0.42,wingM);
  addFlat(g,[[0.3,4.0],[2.1,4.5],[2.1,5.3],[0.3,5.4]],0.1,0.08,wingM);
  [-1,1].forEach(s=>{
    const t=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.16,1.0),redM); t.position.set(s*4.7,-0.35,0.95); g.add(t);
    const u=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.1,0.8),redM); u.position.set(s*2.0,0.1,4.9); g.add(u);
  });
  ball(g,0.2,2.2,-0.75,1.0,DARK); ball(g,0.2,-2.2,-0.75,1.0,DARK); ball(g,0.2,3.3,-0.66,1.0,DARK); ball(g,0.2,-3.3,-0.66,1.0,DARK);
  addCanopy(g,.52,.5,1.75,.72,-0.6);
  addCenterFin(g,[[0,0],[2.0,0],[1.4,1.9],[0.5,1.9]],3.6,0.35,wingM,{w:0.9,h:0.6,u:1.1,v:0.8},{pts:[[0.34,1.3],[1.59,1.3],[1.4,1.9],[0.5,1.9]],mat:redM});
  const pr=addProp(g,-5.0,1.35,5,-1,0xc8102e);
  const strobe=addLights(g,[4.98,-0.3,1.0],[0,2.35,4.7]);
  const gear=buildGear([LEG(0,-0.45,-3.2,0.22,1.6),LEG(-1.4,-0.45,0.5,0.28,1.6),LEG(1.4,-0.45,0.5,0.28,1.6)]); g.add(gear);
  return {group:g,flames:[],strobe:strobe,gear:gear,spinners:[pr]};
}
// BAYKAR KIZILELMA: stealth-style UCAV, canards, twin canted fins, side inlets, wing stores
function buildKizilelma(){
  const g=new THREE.Group();
  const hull=phong(0x98a2ac,0x4a5866,28,{side:THREE.DoubleSide}), wing=phong(0x8d97a2,0x3d4a58,22), radMat=phong(0xdfe5ea,0x667788,50,{side:THREE.DoubleSide}), msl=phong(0xd9dde1,0x667788,30);
  const st=[{z:-7.35,hw:.03,ht:.03,hb:.03,yc:0},{z:-6.4,hw:.34,ht:.26,hb:.22,yc:0},{z:-5,hw:.7,ht:.5,hb:.4,yc:.02},{z:-3,hw:1.0,ht:.62,hb:.5,yc:.05},
    {z:-1,hw:1.2,ht:.62,hb:.5,yc:.05},{z:1.5,hw:1.2,ht:.58,hb:.48,yc:.04},{z:4,hw:1.0,ht:.5,hb:.45,yc:.03},{z:6,hw:.85,ht:.45,hb:.42,yc:0},{z:7.35,hw:.75,ht:.4,hb:.4,yc:0}];
  g.add(new THREE.Mesh(loft(st,20,false),hull));
  g.add(new THREE.Mesh(loft(noseCap(st,3,1.05),20,false),radMat));
  addFlat(g,[[1.0,-1.5],[5.0,2.4],[5.0,3.7],[1.0,5.6]],0.18,-0.12,wing);       // swept main wing
  addFlat(g,[[0.7,-4.6],[2.1,-3.5],[2.1,-2.9],[0.7,-2.6]],0.1,0.1,wing);       // canards
  addFlat(g,[[0.9,5.2],[3.2,6.6],[3.2,7.6],[0.9,7.5]],0.1,-0.02,wing);         // stabilizers
  addCanopy(g,.5,.4,1.7,.66,-3.7);
  addTwinFins(g,[[0,0],[3.0,0],[2.5,3.0],[1.0,3.0]],0.8,0.35,3.8,0.45,wing,{w:1.1,h:0.74,u:1.7,v:1.4});
  [-1,1].forEach(s=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(.7,.6,2.0),DARK); b.position.set(s*.98,-.35,-2.6); b.rotation.z=-s*0.25; g.add(b); });
  addStores(g,[[2.5,-0.32,2.2,2.8,0.1],[3.7,-0.3,2.7,2.4,0.1]],msl);
  addNozzle(g,0,0.0,7.4,0.6,1.0);
  const flames=addFlames(g,[[0,0.0,7.85]],1.0);
  addPitot(g,-7.3,1.2);
  const strobe=addLights(g,[5.0,-0.05,3.5],[0,0.8,6.3]);
  const gear=buildGear([LEG(0,-0.5,-4.2,0.28,1.9),LEG(-1.3,-0.5,1.0,0.34,1.9),LEG(1.3,-0.5,1.0,0.34,1.9)]); g.add(gear);
  return {group:g,flames:flames,strobe:strobe,gear:gear,spinners:[]};
}
// TUSAŞ ANKA: pusher prop, bulbous nose, straight wing, upright V-tail (red/white)
function buildAnka(){
  const g=new THREE.Group();
  const white=phong(0xeef0f2,0x667788,35,{side:THREE.DoubleSide}), wingM=phong(0xe6e8ea,0x556677,28), redM=phong(0xc8102e,0x553333,30);
  const st=[{z:-4.3,hw:.08,ht:.08,hb:.08,yc:0},{z:-3.9,hw:.45,ht:.42,hb:.38,yc:0},{z:-3.0,hw:.72,ht:.7,hb:.6,yc:.05},{z:-1.8,hw:.75,ht:.72,hb:.6,yc:.05},
    {z:-0.5,hw:.6,ht:.58,hb:.5,yc:.03},{z:1.0,hw:.4,ht:.4,hb:.34,yc:.02},{z:2.6,hw:.22,ht:.24,hb:.2,yc:.02},{z:4.0,hw:.14,ht:.16,hb:.14,yc:.02},{z:4.3,hw:.12,ht:.14,hb:.12,yc:.02}];
  g.add(new THREE.Mesh(loft(st,20,false),white));
  g.add(new THREE.Mesh(loft(noseCap(st,3,1.04),20,false),RED_M));
  addFlat(g,[[0.5,-0.4],[8.65,0.2],[8.65,0.85],[0.5,1.5]],0.1,0.0,wingM);
  // upright V-tail
  const tgeo=flatPart([[0.1,2.9],[2.3,3.3],[2.3,4.0],[0.1,4.3]],0.07), dg=new THREE.PlaneGeometry(0.8,0.54);
  [1,-1].forEach(s=>{
    const h=new THREE.Group(); h.position.y=0.05; if(s<0) h.scale.x=-1;
    const m=new THREE.Mesh(tgeo,redM); m.rotation.z=0.75; h.add(m);
    const d=new THREE.Mesh(dg,FLAG_MAT); d.rotation.x=-Math.PI/2; d.position.set(1.3,0.074,3.5); m.add(d); g.add(h);
  });
  ball(g,0.3,0,-0.78,-3.1,DARK);                                                  // EO turret
  ball(g,0.2,2.6,-0.28,0.6,DARK); ball(g,0.2,-2.6,-0.28,0.6,DARK);              // wing pods
  const pr=addProp(g,4.35,1.1,3,1);
  const strobe=addLights(g,[8.65,0.0,0.5],[0,0.9,-1.0]);
  const gear=buildGear([LEG(0,-0.55,-2.6,0.2,1.45),LEG(-1.3,-0.5,0.5,0.25,1.45),LEG(1.3,-0.5,0.5,0.25,1.45)]); g.add(gear);
  return {group:g,flames:[],strobe:strobe,gear:gear,spinners:[pr]};
}
// BAYRAKTAR TB2 / TB3: swept wing, twin tail booms, inverted-V (Λ) tail, pusher prop. k scales the whole model.
function buildBayraktar(k,blades,louvres){
  const g=new THREE.Group();
  const hull=phong(0xb9bfc5,0x667788,35,{side:THREE.DoubleSide}), wingM=phong(0xb4bac0,0x556677,28), podM=phong(0x4f575e,0x333333,20);
  const zs=[-3.25,-3.0,-2.3,-1.2,0,1.0,1.8,2.15], hws=[.08,.36,.52,.55,.46,.30,.14,.10];
  g.add(new THREE.Mesh(loft(zs.map((z,i)=>({z:z,hw:hws[i],ht:hws[i]*0.95,hb:hws[i]*0.85,yc:0})),18,false),hull));
  addFlat(g,[[0.45,-0.9],[6.0,1.5],[6.0,2.15],[0.45,1.4]],0.1,0.12,wingM);
  const fg=new THREE.BoxGeometry(0.05,1.9,0.9); fg.translate(0,0.95,0);
  [1,-1].forEach(s=>{
    boom(g,s*1.45,0.12,0.6,3.15,0.07,0.06,hull);
    boom(g,s*1.45,0.12,1.2,1.32,0.085,0.085,RED_M);
    const fin=new THREE.Mesh(fg,wingM); fin.position.set(s*1.45,0.12,2.7); fin.rotation.z=s*0.7; g.add(fin);
    const d=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.34),FLAG_MAT); d.rotation.y=s*Math.PI/2; d.position.set(s*0.028,1.0,0); fin.add(d);
  });
  ball(g,0.26,0,-0.55,-2.3,DARK);                                                  // EO ball
  addStores(g,[[2.0,0.0,1.0,0.9,0.08],[3.0,0.0,1.1,0.9,0.08]],podM);
  if(louvres){ const lv=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.1,0.9),DARK); lv.position.set(0,0.55,0.2); g.add(lv);
    [-1,1].forEach(s=>{ const h=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.14,1.4),DARK); h.position.set(s*3.6,0.2,1.7); g.add(h); }); }
  const pr=addProp(g,2.25,0.85,blades,1);
  const strobe=addLights(g,[6.0,0.12,1.8],[0,0.62,-0.6]);
  const gear=buildGear([LEG(0,-0.5,-2.0,0.15,1.0),LEG(-0.7,-0.45,0.5,0.15,1.0),LEG(0.7,-0.45,0.5,0.15,1.0)]); g.add(gear);
  g.scale.setScalar(k);
  return {group:g,flames:[],strobe:strobe,gear:gear,spinners:[pr]};
}
// TUSAŞ AKSUNGUR: twin-boom, twin tractor engines, H-tail
function buildAksungur(){
  const g=new THREE.Group();
  const hull=phong(0xcfd4d8,0x667788,35,{side:THREE.DoubleSide}), wingM=phong(0xc8cdd2,0x556677,28);
  const st=[{z:-5.9,hw:.08,ht:.08,hb:.08,yc:0},{z:-5.4,hw:.5,ht:.46,hb:.42,yc:0},{z:-4.3,hw:.9,ht:.85,hb:.7,yc:.05},{z:-2.8,hw:.95,ht:.9,hb:.7,yc:.05},
    {z:-1,hw:.8,ht:.78,hb:.62,yc:.03},{z:1,hw:.5,ht:.5,hb:.4,yc:.02},{z:2.8,hw:.2,ht:.2,hb:.18,yc:.02}];
  g.add(new THREE.Mesh(loft(st,20,false),hull));
  addFlat(g,[[0.7,-0.6],[12,-0.3],[12,0.5],[0.7,1.2]],0.14,0.55,wingM);
  const hump=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),hull); hump.scale.set(0.5,0.35,1.1); hump.position.set(0,0.95,-1.2); g.add(hump);
  ball(g,0.3,0,-0.85,-4.3,DARK);
  const spinners=[];
  [-1,1].forEach(s=>{
    boom(g,s*2.8,-0.05,-2.0,1.4,0.4,0.4,hull); ball(g,0.4,s*2.8,-0.05,-2.0,hull);
    boom(g,s*2.8,0.1,1.4,5.7,0.3,0.12,hull);
    spinners.push(addProp(g,-2.4,1.15,4,-1,0x2a2e33,s*2.8,-0.05));
  });
  const stab=new THREE.Mesh(new THREE.BoxGeometry(6.4,0.1,1.0),wingM); stab.position.set(0,0.5,5.3); g.add(stab);
  addTwinFins(g,[[0,0],[1.3,0],[1.0,1.9],[0.35,1.9]],2.8,0.25,4.6,0,wingM,{w:0.7,h:0.46,u:0.7,v:1.0});
  const strobe=addLights(g,[12,0.55,0.5],[2.8,2.2,5.2]);
  const gear=buildGear([LEG(0,-0.6,-3.6,0.22,1.7),LEG(-2.8,-0.4,0.2,0.28,1.7),LEG(2.8,-0.4,0.2,0.28,1.7)]); g.add(gear);
  return {group:g,flames:[],strobe:strobe,gear:gear,spinners:spinners};
}
// BAYRAKTAR AKINCI: twin turboprops on a tapered swept wing, conventional tail, winglets
function buildAkinci(){
  const g=new THREE.Group();
  const hull=phong(0xcfd5da,0x667788,35,{side:THREE.DoubleSide}), wingM=phong(0xc8ced3,0x556677,28), podM=phong(0x50585f,0x333333,20);
  const st=[{z:-6.1,hw:.08,ht:.08,hb:.08,yc:0},{z:-5.6,hw:.5,ht:.46,hb:.42,yc:0},{z:-4.4,hw:.78,ht:.74,hb:.62,yc:.04},{z:-2.6,hw:.8,ht:.78,hb:.62,yc:.04},
    {z:-0.5,hw:.7,ht:.68,hb:.55,yc:.04},{z:1.8,hw:.5,ht:.5,hb:.42,yc:.08},{z:4,hw:.3,ht:.34,hb:.28,yc:.15},{z:6.0,hw:.16,ht:.3,hb:.14,yc:.25}];
  g.add(new THREE.Mesh(loft(st,20,false),hull));
  addFlat(g,[[0.6,-1.6],[10,1.0],[10,1.9],[0.6,1.6]],0.14,0.1,wingM);
  const hump=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),hull); hump.scale.set(0.55,0.45,1.4); hump.position.set(0,0.95,-1.4); g.add(hump);
  ball(g,0.32,0,-0.8,-4.2,DARK);
  const spinners=[];
  [-1,1].forEach(s=>{
    boom(g,s*3.0,-0.1,-2.4,1.2,0.38,0.3,hull); ball(g,0.38,s*3.0,-0.1,-2.4,hull);
    spinners.push(addProp(g,-2.75,1.1,4,-1,0x2a2e33,s*3.0,-0.1));
    const wl=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.8,0.8),wingM); wl.position.set(s*10.0,0.45,1.4); wl.rotation.z=-s*0.2; g.add(wl);
  });
  addCenterFin(g,[[0,0],[2.0,0],[1.3,2.2],[0.5,2.2]],4.2,0.4,wingM,{w:0.9,h:0.6,u:1.1,v:1.0});
  addFlat(g,[[0.3,4.7],[3.0,5.5],[3.0,6.1],[0.3,6.1]],0.1,0.4,wingM);
  addStores(g,[[4.8,-0.1,0.9,1.2,0.1],[6.2,-0.1,1.1,1.2,0.1],[7.6,-0.1,1.3,1.2,0.1]],podM);
  const strobe=addLights(g,[10,0.7,1.6],[0,2.7,5.6]);
  const gear=buildGear([LEG(0,-0.6,-3.6,0.25,1.55),LEG(-2.0,-0.4,0.4,0.3,1.55),LEG(2.0,-0.4,0.4,0.3,1.55)]); g.add(gear);
  return {group:g,flames:[],strobe:strobe,gear:gear,spinners:spinners};
}

