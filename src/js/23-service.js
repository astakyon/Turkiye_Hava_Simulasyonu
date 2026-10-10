/* ------------------------------------------------------------------ maintenance hangar: drive in, stop, repair + choose loadout */
const SERVICE={zc:1060,hw:28}; const SVC_PT=new THREE.Vector3(-92,AIRFIELD_Y+8,1060);
let svcT=0, svcBlock=false, svcTmp=null, svcMode='service';
function buildService(){
  const gy=AIRFIELD_Y, hw=SERVICE.hw, zc=SERVICE.zc, conc=new THREE.MeshLambertMaterial({color:0xc2c7cc}), roofM=new THREE.MeshLambertMaterial({color:0x8e959c});
  const pg=new THREE.PlaneGeometry(150,2*hw+16); pg.rotateX(-Math.PI/2); const pad=new THREE.Mesh(pg,new THREE.MeshLambertMaterial({color:0x7b8088,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})); pad.position.set(-135,gy+0.23,zc); scene.add(pad);
  const yel=new THREE.MeshBasicMaterial({color:0xe6b92e,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const lg=new THREE.PlaneGeometry(100,0.6); lg.rotateX(-Math.PI/2); const line=new THREE.Mesh(lg,yel); line.position.set(-112,gy+0.28,zc); scene.add(line);
  const tg=new THREE.PlaneGeometry(0.8,14); tg.rotateX(-Math.PI/2); const stop=new THREE.Mesh(tg,yel); stop.position.set(-160,gy+0.28,zc); scene.add(stop);
  const back=new THREE.Mesh(new THREE.BoxGeometry(4,16,2*hw+4),conc); back.position.set(-201,gy+8,zc); scene.add(back);
  [-1,1].forEach(function(sd){ const w=new THREE.Mesh(new THREE.BoxGeometry(104,16,2),conc); w.position.set(-151,gy+8,zc+sd*(hw+1)); scene.add(w); });
  const roof=new THREE.Mesh(new THREE.BoxGeometry(108,1.6,2*hw+4),roofM); roof.position.set(-150,gy+16.8,zc); scene.add(roof);
  const lintel=new THREE.Mesh(new THREE.BoxGeometry(1.6,3.2,2*hw),conc); lintel.position.set(-99,gy+14.6,zc); scene.add(lintel);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,2*hw+0.4),new THREE.MeshBasicMaterial({color:0xe30a17})); stripe.position.set(-98.6,gy+12.4,zc); scene.add(stripe);
  const lb=makeLabel('BAKIM HANGARI'); lb.scale.set(15,3.75,1); lb.position.set(-96,gy+21,zc); scene.add(lb);
  buildServiceInterior();
}
function svcInZone(){ return S.onGround&&S.pos.x<-120&&S.pos.x>-192&&Math.abs(S.pos.z-SERVICE.zc)<14; }
function needsService(){ const l=loadoutOf(activeId); return S.hp<100||flaresLeft<(FLARES[activeId]||0)||WORDER.some(function(k){ return INV[k]<(l[k]||0); }); }
function acExtent(){ const e=model.ext||[7,10]; fwdOf(S.q,vF); const l=Math.hypot(vF.x,vF.z)||1, c=Math.abs(vF.z)/l, sn=Math.abs(vF.x)/l; return {ex:(e[1]*sn+e[0]*c)*0.92, ez:(e[1]*c+e[0]*sn)*0.92}; }
function svcWallBoxes(){ const zc=SERVICE.zc, hw=SERVICE.hw; return [{x0:-203,x1:-199,z0:zc-hw-2,z1:zc+hw+2},{x0:-203,x1:-99,z0:zc-hw-2,z1:zc-hw},{x0:-203,x1:-99,z0:zc+hw,z1:zc+hw+2}]; }
/* footprint points of the aircraft seen from above: nose, tail, centre, wing tips and mid-wings */
const ACS=[]; for(let i=0;i<11;i++) ACS.push({x:0,z:0});
function acSamples(){
  const e=model.ext||[7,10], t=model.tip||[e[0],0,0]; fwdOf(S.q,vF); let fx=vF.x, fz=vF.z; const l=Math.hypot(fx,fz)||1; fx/=l; fz/=l;
  const rx=-fz, rz=fx, hl=e[1]*0.94, hs=Math.max(1,t[0])*0.94, wa=-(t[2]||0)+(model.ext?0:0);
  const P=[[0,0],[hl,0],[-hl,0],[hl*0.5,0],[-hl*0.5,0],[wa,hs],[wa,-hs],[wa,hs*0.5],[wa,-hs*0.5],[-hl*0.9,e[0]*0.3],[-hl*0.9,-e[0]*0.3]];
  for(let i=0;i<P.length;i++){ ACS[i].x=S.pos.x+fx*P[i][0]+rx*P[i][1]; ACS[i].z=S.pos.z+fz*P[i][0]+rz*P[i][1]; }
  return ACS;
}
function boxesHit(boxes){ const P=acSamples(); return boxes.some(function(b){ return P.some(function(p){ return p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1; }); }); }
/* push the aircraft out of solid boxes along the shortest way; returns true if it touched one */
function pushOut(boxes){
  let any=false;
  for(let pass=0;pass<4;pass++){
    const P=acSamples(); let best=null;
    for(let k=0;k<boxes.length;k++){ const b=boxes[k];
      for(let i=0;i<P.length;i++){ const p=P[i]; if(!(p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1)) continue;
        const c=[[p.x-b.x0,-1,0],[b.x1-p.x,1,0],[p.z-b.z0,0,-1],[b.z1-p.z,0,1]].reduce(function(a,v){ return v[0]<a[0]?v:a; });
        if(!best||c[0]>best[0]) best=c; } }
    if(!best) break; any=true; S.pos.x+=best[1]*(best[0]+0.02); S.pos.z+=best[2]*(best[0]+0.02);
  }
  return any;
}
function wallOverlap(){ return boxesHit(svcWallBoxes()); }
function serviceWalls(){          // slide along walls: push out along the axis of least penetration (no teleporting, no sticking)
  if(S.pos.x>-75||S.pos.x<-230||Math.abs(S.pos.z-SERVICE.zc)>SERVICE.hw+40) return;
  if(pushOut(svcWallBoxes())) S.speed*=0.5;
}
function serviceStep(dt){
  const inZ=svcInZone();
  if(!inZ){ svcT=0; svcBlock=false; return; }
  if(svcBlock){ svcT=0; return; }
  // auto-stop inside the maintenance hangar: cut throttle, brake hard enough to stop before the back wall, ease onto the centre line
  S.throttle=0; S.ab=false;
  const room=Math.max(4,S.pos.x+185), dec=Math.max(14,S.speed*S.speed/(2*room)+4);
  S.speed=Math.max(0,S.speed-dec*dt); if(S.speed<1.2) S.speed=0;
  S.pos.z+=(SERVICE.zc-S.pos.z)*Math.min(1,1.5*dt);
  if(S.speed>0){ svcT=0; return; }
  svcT+=dt; if(svcT>0.6) openService();
}
function saveLoadouts(){ try{ localStorage.setItem('kaan-sim-loadouts',JSON.stringify(LOADOUTS)); }catch(e){} }
function renderService(){
  const n=SLOTS[activeId]||0, used=WORDER.reduce(function(a,k){ return a+svcTmp[k]; },0);
  $('svcSub').textContent=CUR.name+' · '+(n>0?('silah yeri: '+n):'bu uçak silah taşımıyor');
  $('svcHpRow').classList.toggle('hidden',svcMode==='loadout'); $('svcTitle').textContent=svcMode==='loadout'?'Silah yükü':'Bakım hangarı'; $('btnSvcOk').textContent=svcMode==='loadout'?'Yükü kaydet':'Bakımı yap ve yükle';
  $('svcHpTxt').textContent='CAN %'+Math.round(S.hp)+' → %100'; $('svcHpBar').style.width=Math.round(S.hp)+'%';
  $('svcBody').innerHTML=n>0?wpnOf(activeId).map(function(k){
    const W=WEAPONS[k];
    return '<tr><td><b>'+W.name+'</b><small>'+W.tip+'</small></td><td class="cnt"><button type="button" data-k="'+k+'" data-d="-1"'+(svcTmp[k]<=0?' disabled':'')+'>−</button><span>'+svcTmp[k]+'</span><button type="button" data-k="'+k+'" data-d="1"'+(used>=n?' disabled':'')+'>+</button></td></tr>';
  }).join(''):'<tr><td>Bakım ve flare yenilemesi yapılacak.</td></tr>';
  $('svcSlots').textContent=n>0?('Silah yeri: '+used+' / '+n+' · flare: '+(FLARES[activeId]||0)+' (otomatik yenilenir)'):'';
}
function svcAdjust(k,d){
  const n=SLOTS[activeId]||0, used=WORDER.reduce(function(a,x){ return a+svcTmp[x]; },0);
  if(d>0&&used>=n) return; if(d<0&&svcTmp[k]<=0) return; svcTmp[k]+=d; renderService();
}
function openLoadout(){ svcMode='loadout'; svcTmp=Object.assign({},loadoutOf(selectedId)); renderService(); $('service').classList.remove('hidden'); }
function openService(){ svcMode='service'; state='service'; S.speed=0; svcTmp=Object.assign({},loadoutOf(activeId)); renderService(); $('service').classList.remove('hidden'); }
function closeService(ok){
  if(svcMode==='loadout'){ if(ok){ LOADOUTS[selectedId]=Object.assign({},svcTmp); saveLoadouts(); applyLoadout(selectedId); refreshHangarUI(); } $('service').classList.add('hidden'); return; }
  if(ok&&svcTmp){ LOADOUTS[activeId]=Object.assign({},svcTmp); saveLoadouts(); applyLoadout(activeId); S.hp=100; flaresLeft=FLARES[activeId]||0; clearThreats(); toast('Bakım tamamlandı — silahlar yüklendi','#7dffb0'); }
  svcBlock=true; svcT=0; $('service').classList.add('hidden'); state='play'; padFireLock=true;
  // turn the aircraft around so it faces the hangar door (east) and can taxi straight out
  S.pos.set(-165,AIRFIELD_Y+CUR.gearOff,SERVICE.zc); S.q.setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.PI/2); S.speed=0; S.throttle=0;
  camQ.copy(S.q); camSnap=true; toast('Uçak çıkış yönüne çevrildi — gazı aç, hangardan çık','#b8ecff');
}
$('svcBody').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b) svcAdjust(b.dataset.k,+b.dataset.d); });
$('btnSvcOk').addEventListener('click',function(){ closeService(true); });
$('btnSvcCancel').addEventListener('click',function(){ closeService(false); });

