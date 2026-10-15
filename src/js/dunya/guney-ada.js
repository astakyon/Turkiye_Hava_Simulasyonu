/* ------------------------------------------------------------------ the strait bridge and Anadolukent (south island)
   A suspension bridge (Çanakkale-style red towers, ~1.85 km main span, deck ≈ 62 m above the sea, you can fly under it)
   joins the base peninsula to the south island, where the city of Anadolukent stands on a terrace above the shore. */
const SOUTH={bx:-600, zN:2330, zS:5960, t1:3300, t2:5150, deckY:62, towerH:250, road:null, cityRoad:null, streets:[], lights:[], built:false};
SOUTH.deckAt=function(z){ const S=SOUTH, yN=Math.max(AIRFIELD_Y-10,terrainH(S.bx,S.zN))+0.4, yS=32.4;
  if(z<3000) return yN+(S.deckY-yN)*smooth(S.zN,3000,z);
  if(z>5500) return S.deckY+(yS-S.deckY)*smooth(5500,S.zS,z);
  return S.deckY+6*Math.sin(Math.PI*(z-3000)/2500); };
/* road: marina road → south of the base → bridge; the bridge itself; then into the city */
SOUTH.road=smoothPath([[1960,560],[1650,1350],[1100,1950],[300,2250],[SOUTH.bx,2290],[SOUTH.bx,SOUTH.zN]],6);
EXTRA_ROADS.push(SOUTH.road);
function buildSouth(){
  const M=apMats(), S=SOUTH, r=mulberry32(1915), g=new THREE.Group(), red=new THREE.MeshLambertMaterial({color:0xb3261e}), steel=new THREE.MeshLambertMaterial({color:0x8a9096}), W=30;
  /* ---- deck: road surface + box girder, sampled along z */
  const pos=[], uv=[], idx=[], gp=[], gidx=[]; let k=0;
  for(let z=S.zN;z<=S.zS+0.1;z+=10){ const y=S.deckAt(z); [-1,1].forEach(function(s){ pos.push(S.bx+s*W/2,y,z); uv.push(s<0?0:1,(z-S.zN)/14); });
    gp.push(S.bx-W/2-0.6,y-0.25,z, S.bx+W/2+0.6,y-0.25,z, S.bx+W/2,y-3.2,z, S.bx-W/2,y-3.2,z);
    if(k>0){ const a=2*(k-1); idx.push(a,a+2,a+1, a+1,a+2,a+3); const b=4*(k-1); [[0,1],[1,2],[2,3],[3,0]].forEach(function(e){ gidx.push(b+e[0],b+4+e[0],b+e[1], b+e[1],b+4+e[0],b+4+e[1]); }); } k++; }
  const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); dg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); dg.setIndex(idx); dg.computeVertexNormals();
  const roadTex=apTex(64,64,function(x,w,h){ x.fillStyle='#4f5358'; x.fillRect(0,0,w,h); x.fillStyle='#e8e8e0'; x.fillRect(w/2-1,0,2,h); [w/6,w/3,w*2/3,w*5/6].forEach(function(px){ x.fillRect(px-0.5,0,1,h*0.45); }); x.fillStyle='#d9d9d0'; x.fillRect(0,0,2,h); x.fillRect(w-2,0,2,h); });
  roadTex.wrapT=THREE.RepeatWrapping; const deck=new THREE.Mesh(dg,new THREE.MeshLambertMaterial({map:roadTex,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})); deck.userData.rs=true; deck.userData.cs=false; scene.add(deck);
  const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3)); gg.setIndex(gidx); gg.computeVertexNormals();
  const gird=new THREE.Mesh(gg,new THREE.MeshLambertMaterial({color:0x9aa0a6,side:THREE.DoubleSide})); scene.add(gird);
  DECKS.push({x0:S.bx-W/2,x1:S.bx+W/2,z0:S.zN,z1:S.zS,yf:function(x,z){ return S.deckAt(z); }});
  /* railings, lamp posts (they light up at night), approach piers */
  for(let z=S.zN+10;z<S.zS;z+=40){ const y=S.deckAt(z); [-1,1].forEach(function(s){ apCyl(g,steel,S.bx+s*(W/2+0.2),y,z,0.12,0.15,10,6); const l=apBox(g,M.lamp,S.bx+s*(W/2-1),y+10,z,1.6,0.2,0.5); }); }
  for(let z=S.zN+60;z<S.zS-30;z+=60){ if(z>3060&&z<5440) continue; const y=S.deckAt(z), gb=Math.min(terrainH(S.bx,z),0)-4; [-1,1].forEach(function(s){ apBox(g,M.conc,S.bx+s*9,gb,z,4,y-3.2-gb,4); }); }
  /* ---- towers: two tapered legs, cross beams, caissons */
  const legG=function(h){ const b=new THREE.BoxGeometry(7,h,9), p=b.attributes.position; for(let i=0;i<p.count;i++){ if(p.getY(i)>0){ p.setX(i,p.getX(i)*0.62); p.setZ(i,p.getZ(i)*0.7); } } b.computeVertexNormals(); b.translate(0,h/2,0); return b; };
  [S.t1,S.t2].forEach(function(tz){ apCyl(g,M.conc,S.bx,-30,tz,26,28,36,24);
    [-1,1].forEach(function(s){ const leg=new THREE.Mesh(legG(S.towerH),red); leg.position.set(S.bx+s*20,6,tz); leg.rotation.z=-s*0.022; g.add(leg); });
    [S.deckY-8,S.deckY+70,S.deckY+150,S.towerH-8].forEach(function(y,i){ apBox(g,i===0?M.conc:red,S.bx,y,tz,40-y*0.03,i===3?10:6,7); });
    apBox(g,M.white,S.bx,S.towerH+2,tz,30,4,6);
    [-1,1].forEach(function(s){ const lt=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),M.redL); lt.position.set(S.bx+s*15,S.towerH+5,tz); scene.add(lt); S.lights.push(lt); });
    navObst(S.bx-26,S.bx+26,tz-8,tz+8,S.towerH+6); });
  /* ---- main cables (parabolic between tower tops, straight back-stays to the anchorages) and hangers */
  const top=S.towerH-4, sagY=S.deckY+12, mid=(S.t1+S.t2)/2, half=(S.t2-S.t1)/2, cab=[], hang=[], anchN=S.zN+260, anchS=S.zS-180;
  const cableY=function(z){ if(z<S.t1) return S.deckAt(anchN)+(top-S.deckAt(anchN))*(z-anchN)/(S.t1-anchN); if(z>S.t2) return top+(S.deckAt(anchS)-top)*(z-S.t2)/(anchS-S.t2); const u=(z-mid)/half; return sagY+(top-sagY)*u*u; };
  [-1,1].forEach(function(s){ const x=S.bx+s*17; let prev=null; for(let z=anchN;z<=anchS;z+=20){ const p=[x,cableY(z),z]; if(prev) cab.push(prev[0],prev[1],prev[2],p[0],p[1],p[2]); prev=p;
      if(z>S.t1+10&&z<S.t2-10||(z<S.t1-10&&z>anchN+30)||(z>S.t2+10&&z<anchS-30)) hang.push(x,cableY(z),z, x,S.deckAt(z)+0.5,z); } });
  [-1,1].forEach(function(s){ for(let z=anchN;z<anchS;z+=20){ const a=[S.bx+s*17,cableY(z),z], b=[S.bx+s*17,cableY(z+20),z+20]; beam(g,steel,a,b,0.7); } });
  const hg=new THREE.BufferGeometry(); hg.setAttribute('position',new THREE.Float32BufferAttribute(hang,3)); scene.add(new THREE.LineSegments(hg,new THREE.LineBasicMaterial({color:0x8a9096,transparent:true,opacity:0.8})));
  [anchN,anchS].forEach(function(z){ const y=S.deckAt(z); apBox(g,M.conc,S.bx,Math.min(terrainH(S.bx,z),y)-6,z,52,y-Math.min(terrainH(S.bx,z),y)+8,30); });
  /* deck as a thin slab obstacle (you can fly under it) */
  for(let z=S.zN;z<S.zS;z+=100){ const y=Math.max(S.deckAt(z),S.deckAt(z+100)); AP.obst.push({x0:S.bx-W/2-1,x1:S.bx+W/2+1,z0:z,z1:z+100,y0:Math.min(S.deckAt(z),S.deckAt(z+100))-4,y1:y+3,air:true}); }
  AP.topY=null;
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(18,2.6),new THREE.MeshLambertMaterial({map:signTex('HİLAL KÖPRÜSÜ','#b3261e','#ffffff',1024,128),side:THREE.DoubleSide}));
  sg.position.set(S.bx,S.deckY+78,S.t1); g.add(sg); const sg2=sg.clone(); sg2.position.z=S.t2; g.add(sg2);
  bakeInto(g);
  /* approach road on the base peninsula */
  const roadMat=new THREE.MeshLambertMaterial({map:apTex(32,64,function(x,W2,H){ x.fillStyle='#55595e'; x.fillRect(0,0,W2,H); x.fillStyle='rgba(235,235,225,0.9)'; x.fillRect(W2/2-1,0,2,H*0.5); x.fillRect(0,0,1,H); x.fillRect(W2-1,0,1,H); })});
  roadMat.map.wrapT=THREE.RepeatWrapping; roadMat.userData.flat=true; terrainRibbon(S.road,10,0.3,roadMat); clearTreesNear(S.road,16);
  buildCity();
  S.built=true;
}
/* ---- Anadolukent: downtown towers, apartment blocks on a grid, a stadium, a park with a pond, a mosque, a seafront */
function buildCity(){
  const M=apMats(), S=SOUTH, P=PADS.find(function(p){ return p.id==='city'; }), Y=P.y, r=mulberry32(2023), g=new THREE.Group();
  const asph=new THREE.MeshLambertMaterial({color:0x4d5156,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); asph.userData.flat=true;
  const walk=new THREE.MeshLambertMaterial({color:0xb4b0a6,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); walk.userData.flat=true;
  const xs=[], zs=[]; for(let x=P.x0+40;x<=P.x1-20;x+=180) xs.push(x); for(let z=P.z0+30;z<=P.z1-20;z+=140) zs.push(z);
  zs.forEach(function(z){ apRect(g,walk,xs[0]-8,xs[xs.length-1]+8,z-10,z+10,Y+0.04); apRect(g,asph,xs[0]-6,xs[xs.length-1]+6,z-7,z+7,Y+0.06); S.streets.push([[xs[0],z],[xs[xs.length-1],z]]); });
  xs.forEach(function(x){ apRect(g,walk,x-8,x+8,zs[0]-10,zs[zs.length-1]+10,Y+0.045); apRect(g,asph,x-6,x+6,zs[0],zs[zs.length-1],Y+0.065); });
  S.streets.push([[S.bx,zs[0]],[S.bx,zs[zs.length-1]]]);
  apRect(g,asph,S.bx-15,S.bx+15,S.zS-5,zs[0]+7,Y+0.06);    /* boulevard from the bridge */
  const walls=['#e9e4da','#dfe6ea','#efe3cf','#d9dde2','#f1e9d8','#e3d9e8'], glass=['#9fb8cc','#7d9bb4','#a8c4d6','#6f8ea8'];
  const cx0=(P.x0+P.x1)/2;
  for(let i=0;i<xs.length-1;i++) for(let j=0;j<zs.length-1;j++){
    const cx=(xs[i]+xs[i+1])/2, cz=(zs[j]+zs[j+1])/2, bw=180-20, bd=140-24, dc=Math.abs(cx-(-1300))/1200;
    if(i===3&&j===2){ /* stadium */ const st=new THREE.MeshLambertMaterial({color:0xd8dde2}); const ring=new THREE.Mesh(new THREE.CylinderGeometry(70,62,18,40,1,true),st); ring.scale.set(1,1,0.72); ring.position.set(cx,Y+9,cz); g.add(ring);
      const pitch=new THREE.Mesh(new THREE.CircleGeometry(60,40),new THREE.MeshLambertMaterial({color:0x4f8f37})); pitch.rotation.x=-Math.PI/2; pitch.scale.set(1,0.72,1); pitch.position.set(cx,Y+0.3,cz); g.add(pitch);
      const rf=new THREE.Mesh(new THREE.TorusGeometry(66,6,6,40),new THREE.MeshLambertMaterial({color:0xb3261e})); rf.rotation.x=Math.PI/2; rf.scale.set(1,0.72,1); rf.position.set(cx,Y+18,cz); g.add(rf);
      for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4; apCyl(g,M.metal,cx+Math.cos(a)*72,Y,cz+Math.sin(a)*52,0.6,0.8,40,8); apBox(g,M.lamp,cx+Math.cos(a)*72,Y+40,cz+Math.sin(a)*52,5,3,0.6); }
      navObst(cx-72,cx+72,cz-52,cz+52,Y+20); continue; }
    if(i===1&&j===1){ /* park with a pond */ const pond=new THREE.Mesh(new THREE.CircleGeometry(32,24),new THREE.MeshPhongMaterial({color:0x2f7d9a,shininess:60})); pond.rotation.x=-Math.PI/2; pond.position.set(cx,Y+0.15,cz); g.add(pond);
      for(let k=0;k<45;k++){ const a=r()*6.28, d=40+r()*36; TREE_EXTRA.push([cx+Math.cos(a)*d*1.3,Y,cz+Math.sin(a)*d*0.8,0.6+r()*0.5,r()<0.3?0:1]); } continue; }
    if(i===5&&j===1){ bigMosque(g,M,cx,Y,cz); continue; }
    const tall=dc<0.35&&j>=1, n=tall?2:4;
    for(let q=0;q<n;q++){ const ox=(n===2?(q?40:-40):(q%2?45:-45)), oz=(n===2?0:(q<2?-32:32)), x=cx+ox, z=cz+oz;
      if(tall){ const fl=[20,26,32,38][Math.floor(r()*4)], h=fl*3.4; bldg(g,x,Y,z,30,h,30,{floors:fl,wall:glass[Math.floor(r()*glass.length)],win:'#1f2c3a'});
        if(r()<0.5){ apCyl(g,M.metal,x,Y+h+0.5,z,0.12,0.12,14,6); apBox(g,M.redL,x,Y+h+14.5,z,0.5,0.5,0.5); } }
      else { const fl=[5,7,9][Math.floor(r()*3)]; bldg(g,x,Y,z,36,fl*3.1,18,{floors:fl,wall:walls[Math.floor(r()*walls.length)]}); } }
  }
  /* seafront: promenade, railing, trees; city sign at the bridge */
  for(let x=P.x0+20;x<P.x1-20;x+=24){ TREE_EXTRA.push([x,Y,P.z0+8,0.7,1]); lampPost(g,M,x+12,Y,P.z0+10,7); }
  for(let z=zs[0];z<zs[zs.length-1];z+=40) lampPost(g,M,S.bx+12,Y,z,9);
  { const s=new THREE.Mesh(new THREE.PlaneGeometry(12,2.4),new THREE.MeshLambertMaterial({map:signTex('ANADOLUKENT','#1d5aa8','#ffffff',1024,128),side:THREE.DoubleSide})); s.position.set(S.bx+20,Y+3.2,S.zS+14); g.add(s);
    apCyl(g,M.metal,S.bx+14.5,Y,S.zS+14,0.08,0.08,3,6); apCyl(g,M.metal,S.bx+25.5,Y,S.zS+14,0.08,0.08,3,6); }
  /* parked cars */
  const park=[]; zs.forEach(function(z){ for(let x=xs[0]+10;x<xs[xs.length-1]-10;x+=7){ if(xs.some(function(sx){ return Math.abs(sx-x)<12; })) continue; [-1,1].forEach(function(s){ if(r()<0.35) park.push({x:x,y:Y+0.06,z:z+s*5,h:s<0?Math.PI/2:-Math.PI/2}); }); } });
  carInstances(park,r);
  bakeInto(g);
  const pts=[]; for(let x=P.x0;x<=P.x1;x+=25) for(let z=P.z0-40;z<=P.z1;z+=25) pts.push([x,z]); clearTreesNear(pts,14);
}
function southStep(dt){ if(!SOUTH.built) return; const on=Math.sin(T*3)>0.3; SOUTH.lights.forEach(function(l){ l.visible=on; }); }
