/* ------------------------------------------------------------------ Kızıl Bölge: hostile territory on the west end of the south island.
   Enemy airfield (runway, hardened shelters, fuel, barracks, radar), bunkers and trenches; ground targets (SAM, radar, depots,
   convoys) spawn here first (33-ground-targets). Crossing the border shows a warning. */
const KZB={x0:-14200,x1:-8200,z0:8400,z1:13800, inside:false, built:false};
function inKZB(x,z){ return x>KZB.x0&&x<KZB.x1&&z>KZB.z0&&z<KZB.z1&&terrainH(x,z)>-30; }
function buildEnemy(){
  const M=apMats(), P=PADS.find(function(p){ return p.id==='enemy'; }), Y=P.y, g=new THREE.Group(), r=mulberry32(666);
  const dk=new THREE.MeshLambertMaterial({color:0x4a4f45}), rust=new THREE.MeshLambertMaterial({color:0x7a3a2a}), ban=new THREE.MeshLambertMaterial({map:apTex(128,80,function(x,w,h){ x.fillStyle='#8a1010'; x.fillRect(0,0,w,h); x.fillStyle='#111'; x.beginPath(); x.moveTo(0,h); x.lineTo(w*0.45,0); x.lineTo(w*0.7,0); x.lineTo(w*0.25,h); x.fill(); }),side:THREE.DoubleSide});
  /* runway E-W */
  const rz=(P.z0+P.z1)/2, rx0=P.x0+120, rx1=P.x1-120, rm=new THREE.MeshLambertMaterial({color:0x3e4146,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); rm.userData.flat=true;
  apRect(g,rm,rx0,rx1,rz-20,rz+20,Y+0.08); for(let x=rx0+20;x<rx1-20;x+=40) apBox(g,M.mark,x,Y+0.1,rz,18,0.02,0.6);
  [rx0+10,rx1-10].forEach(function(x){ for(let k=-6;k<=6;k++) if(k) apBox(g,M.mark,x,Y+0.1,rz+k*2.6,18,0.02,1.2); });
  const tw=new THREE.MeshLambertMaterial({color:0x55595e,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); tw.userData.flat=true; apRect(g,tw,rx0+100,rx1-100,rz-140,rz-110,Y+0.06);
  /* hardened aircraft shelters (dark arched bunkers) along the taxiway */
  for(let k=0;k<8;k++){ const x=rx0+180+k*160, z=rz-175; const m=new THREE.Mesh(new THREE.CylinderGeometry(14,14,34,14,1,false,-Math.PI/2,Math.PI),dk); m.rotation.x=-Math.PI/2; m.scale.set(1,1,0.6); m.position.set(x,Y,z); g.add(m);
    apBox(g,M.door,x,Y,z+17.2,22,7.5,0.4); apBox(g,dk,x,Y,z-17,30,8,2); navObst(x-14,x+14,z-17,z+17,Y+9); WALKBOX.push({x0:x-14,x1:x+14,z0:z-17,z1:z+17}); }
  /* fuel tanks, barracks, a radar and a tower */
  for(let k=0;k<4;k++){ const x=P.x1-200+(k%2)*28, z=P.z1-60+Math.floor(k/2)*26; apCyl(g,rust,x,Y,z,10,10,10,18); navObst(x-10,x+10,z-10,z+10,Y+10); }
  for(let k=0;k<5;k++) bldg(g,P.x0+200+k*70,Y,P.z1-70,50,6,14,{floors:2,wall:'#8d8a80'});
  { const x=P.x0+120, z=rz-90; apCyl(g,M.conc,x,Y,z,2.5,3,18,10); apBox(g,dk,x,Y+18,z,7,3,7); navObst(x-4,x+4,z-4,z+4,Y+21); }
  { const x=P.x1-80, z=rz-110; apCyl(g,dk,x,Y,z,1.2,1.6,14,8); apBox(g,rust,x,Y+14,z,10,3,0.5); }
  /* banners and floodlights */
  for(let k=0;k<6;k++){ const x=P.x0+150+k*300, z=P.z1-20; apCyl(g,M.metal,x,Y,z,0.1,0.14,12,6); const b=new THREE.Mesh(new THREE.PlaneGeometry(4,2.5),ban); b.position.set(x+2,Y+10.5,z); g.add(b); }
  /* bunkers, trenches and dragon's teeth across the region */
  for(let k=0,n=0;k<400&&n<40;k++){ const x=KZB.x0+600+r()*(KZB.x1-KZB.x0-1200), z=KZB.z0+600+r()*(KZB.z1-KZB.z0-1200), h=terrainH(x,z); if(h<8||h>400||inPad('enemy',x,z,60)) continue;
    if(Math.abs(terrainH(x+10,z)-h)>3) continue; n++; const a=r()*6.28;
    if(n%3===0){ const b=apBox(g,M.concD,x,h-0.5,z,8,2.4,8); b.rotation.y=a; apBox(g,M.dark,x+Math.cos(a)*4.05,h+0.6,z-Math.sin(a)*4.05,0.1,0.5,4).rotation.y=a; navObst(x-5,x+5,z-5,z+5,h+2.5); }
    else for(let t=0;t<8;t++){ const tx=x+Math.cos(a)*t*3, tz=z-Math.sin(a)*t*3; const c=new THREE.Mesh(new THREE.ConeGeometry(0.9,1.6,4),M.conc); c.position.set(tx,terrainH(tx,tz)+0.6,tz); g.add(c); } }
  /* border markers along the land boundary: red-white striped posts */
  for(let z=KZB.z0;z<=KZB.z1;z+=180){ const x=KZB.x1, h=terrainH(x,z); if(h<2) continue; for(let s=0;s<3;s++) apCyl(g,s%2?M.white:M.red,x,h+s*1.5,z,0.25,0.25,1.5,8); }
  bakeInto(g);
  const pts=[]; for(let x=P.x0;x<=P.x1;x+=25) for(let z=P.z0;z<=P.z1;z+=25) pts.push([x,z]); clearTreesNear(pts,14);
  KZB.built=true;
}
function enemyStep(dt){
  if(!KZB.built||state!=='play'||!S||!S.pos) return; const now=inKZB(S.pos.x,S.pos.z);
  if(now!==KZB.inside){ KZB.inside=now; toast(now?'⚠ KIZIL BÖLGE — düşman hava sahasına girdin':'Kızıl Bölge\'den çıktın',now?'#ff5a4a':'#7dffb0'); }
}
