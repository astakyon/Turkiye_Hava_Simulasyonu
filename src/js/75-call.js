/* ------------------------------------------------------------------ vehicle calling (V1.71)
   On foot: G (pad Y, touch ÇAĞIR) opens a radial menu. Pick a vehicle and where it should come: next to you, or a point
   picked on the map. Civilian vehicles drive in from ~110 m away along a clear line; military vehicles (and anything
   without a clear approach) are air-dropped by parachute. At most CALL_MAX called vehicles live at once (oldest go). */
const CALL_TABS=[
  {id:'sivil', n:'Sivil · Hizmet', ids:['suv','suvR','mil','truck','fuel','fire','bus','tug']},
  {id:'askeri',n:'Askerî',         ids:['kirpi','pars','korkut','hisar','firtina','altay']}];
const CALL_DROP={kirpi:1,pars:1,korkut:1,hisar:1,firtina:1,altay:1};
const VEH_RANK={kirpi:2,pars:3,korkut:3,hisar:4,firtina:5,altay:6};   /* rank index needed (cloud accounts only) */
const CALL_MAX=3;
const CALL={tab:0, sel:0, where:'me', list:[], jobs:[], cd:0, pickPt:null, pickKind:null};
if(typeof RADIO_WHO!=='undefined') RADIO_WHO.loj={n:'Lojistik',p:0.95,r:1.08,c:'#ffb25a'};
function callKind(id){ return CAR_KINDS.find(function(k){ return k.id===id; }); }
function callLocked(id){ if(typeof accIsAdmin==='function'&&accIsAdmin()) return false; if(SETTINGS.rankLocks===false) return false; const need=VEH_RANK[id]; return need!=null&&typeof accProfile==='function'&&(accProfile().rank||0)<need; }
function callHow(id){ return CALL_DROP[id]?'Paraşütle indirilir':'Sürerek gelir'; }
function callIsOpen(){ return !!CALL.open; }
/* ---- free ground for a vehicle */
function callFree(x,z,r){
  if(Math.abs(x)>14400||Math.abs(z)>14400) return false; const g=groundH(x,z); if(g<0.8) return false;
  for(let k=0;k<4;k++){ const a=k*Math.PI/2; if(Math.abs(groundH(x+Math.cos(a)*r,z+Math.sin(a)*r)-g)>r*0.35) return false; }
  const inB=function(L){ for(let i=0;i<L.length;i++){ const b=L[i]; if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r) return true; } return false; };
  if(inB(WALK.boxes||[])) return false; if(inB(vehBoxes(null))) return false; if(typeof heliBoxes==='function'&&inB(heliBoxes())) return false;
  return true;
}
function callSpot(x,z,r){ r=r||3.2; if(callFree(x,z,r)) return [x,z];
  for(let d=4;d<=70;d+=4){ const n=Math.max(8,Math.round(d*0.8)); for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d; if(callFree(px,pz,r)) return [px,pz]; } }
  return null; }
/* a straight approach the vehicle can drive: clear and not too steep every 5 m */
function callRoute(tx,tz,D){
  D=D||110; const base=Math.random()*Math.PI*2;
  for(let i=0;i<16;i++){ const a=base+i*Math.PI/8, sx=tx+Math.cos(a)*D, sz=tz+Math.sin(a)*D; let ok=true, ph=groundH(sx,sz);
    for(let s=0;s<=D-6&&ok;s+=5){ const f=s/D, x=sx+(tx-sx)*f, z=sz+(tz-sz)*f, h=groundH(x,z); if(!callFree(x,z,2.4)||Math.abs(h-ph)>2.6) ok=false; ph=h; }
    if(ok) return {x:sx,z:sz}; }
  return null; }
/* ---- parachute */
function callChute(){
  const g=new THREE.Group(), cm=new THREE.MeshLambertMaterial({color:0xd8dccf,side:THREE.DoubleSide}), sm=new THREE.MeshLambertMaterial({color:0xe2352a,side:THREE.DoubleSide});
  const can=new THREE.Group(); can.position.y=16; g.add(can);
  for(let i=0;i<8;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(8,6,5,i*Math.PI/4,Math.PI/4,0,Math.PI/2.3),i%2?cm:sm); p.scale.y=0.55; can.add(p); }
  const lm=new THREE.LineBasicMaterial({color:0x333333}), pts=[];
  for(let i=0;i<8;i++){ const a=i*Math.PI/4; pts.push(new THREE.Vector3(0,2.6,0), new THREE.Vector3(Math.cos(a)*6.8,16,Math.sin(a)*6.8)); }
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),lm)); g.can=can; return g; }
function callBeacon(x,z){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.9,90,10,1,true),new THREE.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:0.3,depthWrite:false,side:THREE.DoubleSide}));
  m.position.set(x,groundH(x,z)+45,z); m.renderOrder=5; scene.add(m); return m; }
/* ---- ordering */
function callOrder(id,x,z,o){
  o=o||{}; const K=callKind(id); if(!K){ toast('Bilinmeyen araç','#ff8a7a'); return null; }
  if(callLocked(id)){ toast(K.n+' için rütbe gerekli: '+(typeof rankName==='function'?rankName(VEH_RANK[id]):VEH_RANK[id]),'#ffc24a'); return null; }
  if(CALL.cd>0&&!o.force){ toast('Lojistik meşgul — '+Math.ceil(CALL.cd)+' sn bekle','#ffc24a'); return null; }
  const sp=callSpot(x,z,K.heavy?4.2:3.2); if(!sp){ toast('Buraya araç gönderilemez (su, bina ya da dik yamaç)','#ff8a7a'); return null; }
  /* fleet cap: the oldest called vehicle that nobody is driving goes back */
  while(CALL.list.length>=CALL_MAX){ const i=CALL.list.findIndex(function(c){ return !(WALK.mode==='car'&&WALK.car===c); }); if(i<0) break; callRemove(CALL.list[i]); }
  const toMe=Math.atan2(WALK.pos.x-sp[0],WALK.pos.z-sp[1]);
  let route=null; if(!CALL_DROP[id]&&!o.drop) route=callRoute(sp[0],sp[1]);
  const c=vehNew(id,route?route.x:sp[0],route?route.z:sp[1],route?Math.atan2(route.x-sp[0],route.z-sp[1]):toMe+Math.PI);
  c.called=true; CALL.list.push(c);
  const J={c:c, tx:sp[0], tz:sp[1], mode:route?'drive':'drop', t:0, beacon:callBeacon(sp[0],sp[1]), last:1e9, stuck:0, done:false};
  if(J.mode==='drop'){ J.alt=260; J.chute=callChute(); scene.add(J.chute); c.y=groundH(sp[0],sp[1])+J.alt; c.mesh.position.y=c.y; }
  CALL.jobs.push(J); CALL.cd=o.force?0:6;
  const eta=J.mode==='drop'?Math.round(J.alt/9+4):Math.round(110/12+4);
  if(typeof radioSay==='function') radioSay({w:'loj',t:K.n+(J.mode==='drop'?' paraşütle indiriliyor':' yola çıktı')+', tahmini varış '+eta+' saniye.'},null,{force:true});
  else toast(K.n+' yolda','#b8ecff');
  return c;
}
function callRemove(c){
  const i=VEHS.indexOf(c); if(i>=0) VEHS.splice(i,1); if(c.mesh) scene.remove(c.mesh);
  CALL.list=CALL.list.filter(function(x){ return x!==c; });
  CALL.jobs=CALL.jobs.filter(function(J){ if(J.c===c){ callJobEnd(J); return false; } return true; });
}
function callJobEnd(J){ if(J.beacon){ scene.remove(J.beacon); J.beacon=null; } if(J.chute&&!J.chuteT){ scene.remove(J.chute); J.chute=null; } }
function callArrive(J){
  J.done=true; const c=J.c; c.v=c._v=0; c.vx=c.vz=0; if(J.beacon){ scene.remove(J.beacon); J.beacon=null; }
  if(typeof sndPlay==='function'&&Math.hypot(c.x-WALK.pos.x,c.z-WALK.pos.z)<250) try{ sndPlay(J.mode==='drop'?'touch':'ui_ok'); }catch(e){}
  if(typeof radioSay==='function') radioSay({w:'loj',t:c.K.n+' teslim edildi. İyi yolculuklar.'},null,{force:true}); else toast(c.K.n+' teslim edildi','#7dffb0');
}
/* ---- per-frame delivery */
function callStep(dt){
  if(CALL.cd>0) CALL.cd-=dt; if(!CALL.jobs.length) return;
  for(let i=CALL.jobs.length-1;i>=0;i--){ const J=CALL.jobs[i], c=J.c; J.t+=dt;
    if(J.beacon) J.beacon.material.opacity=0.16+0.1*Math.sin(J.t*5);
    if(J.done){ /* collapsing canopy */
      if(J.chute){ J.chuteT=(J.chuteT||0)+dt; const k=Math.min(1,J.chuteT/2.5); J.chute.can.scale.set(1+k*0.3,1-k*0.95,1+k*0.3); J.chute.can.position.y=16-k*14; J.chute.position.x+=dt*3; if(k>=1){ scene.remove(J.chute); J.chute=null; } }
      if(!J.chute) CALL.jobs.splice(i,1); continue; }
    if(WALK.mode==='car'&&WALK.car===c){ J.done=true; callJobEnd(J); continue; }   /* boarded mid-delivery: hand over */
    if(J.mode==='drop'){
      const g=groundH(J.tx,J.tz), h=c.y-g, vs=h>25?9:Math.max(2.2,h*0.36); c.y-=vs*dt; c.x=J.tx; c.z=J.tz;
      const sw=Math.sin(J.t*1.3)*0.05*Math.min(1,h/40);
      if(c.y<=g+0.05){ vehPlace(c,0); J.chute.position.set(c.x,g,c.z); callArrive(J); continue; }
      c.mesh.position.set(c.x,c.y,c.z); c.mesh.rotation.set(sw,c.h,sw*0.6,'YXZ'); J.chute.position.set(c.x,c.y,c.z); J.chute.rotation.set(sw,0,sw*0.6);
      continue; }
    /* drive in: pursue the target, slow down for the stop, give up and snap after a while */
    const dx=J.tx-c.x, dz=J.tz-c.z, d=Math.hypot(dx,dz), want=Math.atan2(-dx,-dz);
    let dh=Math.atan2(Math.sin(want-c.h),Math.cos(want-c.h)); c.h+=clamp(dh,-1.1*dt,1.1*dt);
    const top=Math.min(c.K.top||20,15), vt=Math.min(top,Math.max(1.2,d*0.45))*(Math.abs(dh)>0.8?0.35:1);
    c.v+=clamp(vt-c.v,-6*dt,(c.K.acc||4)*dt); c._v=c.v; c.steer=clamp(dh,-0.5,0.5);
    c.x+=-Math.sin(c.h)*c.v*dt; c.z+=-Math.cos(c.h)*c.v*dt; c.vx=-Math.sin(c.h)*c.v; c.vz=-Math.cos(c.h)*c.v;
    vehPlace(c,dt);
    if(d<J.last-0.5){ J.last=d; J.stuck=0; } else J.stuck+=dt;
    if(d<1.6){ vehPlace(c,0); callArrive(J); continue; }
    if(J.stuck>5||J.t>40){ c.x=J.tx; c.z=J.tz; c.y=null; vehPlace(c,0); callArrive(J); continue; }
  }
}
/* ---- radial menu */
function callIcon(id){
  const K=callKind(id)||{}, w=K.tracked?'<rect x="3" y="14" width="18" height="5" rx="2.5"/><circle cx="7" cy="16.5" r="1"/><circle cx="12" cy="16.5" r="1"/><circle cx="17" cy="16.5" r="1"/>':'<circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>';
  const body=K.weapon==='cannon'?'<path d="M5 14V11h10l1-2h3v5"/><path d="M12 10l9-2"/>':K.weapon==='auto'?'<path d="M4 14v-3l3-2h9l2 3v2"/><path d="M11 9V7h4M15 8h6"/>':id==='bus'?'<rect x="3" y="6" width="18" height="9" rx="1.5"/><path d="M6 9h3M11 9h3M16 9h3"/>':
    id==='fire'?'<path d="M3 15V9h9v6M12 15V7h6l3 4v4"/><path d="M4 7l10-3"/>':id==='fuel'?'<rect x="3" y="8" width="11" height="7" rx="3"/><path d="M14 15V9h4l3 3v3"/>':id==='tug'?'<path d="M3 15v-4h12l3-3h3v7"/><path d="M1 13h2"/>':
    id==='truck'?'<path d="M3 15V7h11v8M14 15V10h4l3 3v2"/>':'<path d="M3 15v-3l3-4h10l3 4h2v3"/><path d="M7 9.5h9"/>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">'+body+w+'</svg>'; }
function callRender(){
  const T=CALL_TABS[CALL.tab], ring=$('callRing'); if(!ring) return; const n=T.ids.length;
  $('callTabs').innerHTML=CALL_TABS.map(function(t,i){ return '<button type="button" data-tab="'+i+'" class="'+(i===CALL.tab?'on':'')+'">'+t.n+'</button>'; }).join('');
  ring.innerHTML=T.ids.map(function(id,i){ const K=callKind(id)||{n:id}, a=-Math.PI/2+i/n*Math.PI*2, lk=callLocked(id);
    return '<button type="button" class="citem'+(i===CALL.sel?' sel':'')+(lk?' lock':'')+'" data-i="'+i+'" style="left:'+(50+Math.cos(a)*39).toFixed(2)+'%;top:'+(50+Math.sin(a)*39).toFixed(2)+'%">'+callIcon(id)+'<b>'+K.n+'</b><small>'+(i+1)+(lk?' · 🔒':'')+'</small></button>'; }).join('');
  callHub(); }
function callHub(){
  const T=CALL_TABS[CALL.tab], id=T.ids[CALL.sel], K=callKind(id)||{n:id}, lk=callLocked(id);
  $('callHub').innerHTML='<b>'+K.n+'</b><small>'+(lk?'Rütbe gerekli: '+(typeof rankName==='function'?rankName(VEH_RANK[id]):''):callHow(id)+(K.weapon?' · silahlı':''))+'</small>'+
    '<div class="cwhere"><button type="button" data-w="me" class="'+(CALL.where==='me'?'on':'')+'">Yanıma</button><button type="button" data-w="map" class="'+(CALL.where==='map'?'on':'')+'">Haritadan</button></div>'+
    '<button type="button" class="btn primary" id="callGo"'+(lk?' disabled':'')+'>Çağır</button>'; }
function callOpen(){
  if(state!=='walk'||WALK.mode!=='foot'){ toast('Araç çağırmak için yürüyor olmalısın','#ffc24a'); return; }
  if(document.pointerLockElement) try{ document.exitPointerLock(); }catch(e){}
  $('callUI').classList.remove('hidden'); CALL.open=true; callRender(); WALK.sx=WALK.sy=0;
  setTimeout(function(){ const b=$('callGo'); if(b) try{ b.focus(); }catch(e){} },0); }
function callClose(){ const el=$('callUI'); if(el) el.classList.add('hidden'); CALL.open=false; }
const _callCloseModals=closeModals; closeModals=function(){ _callCloseModals(); CALL.open=false; };
function callGo(){
  const id=CALL_TABS[CALL.tab].ids[CALL.sel]; if(callLocked(id)){ callHub(); return; }
  callClose();
  if(CALL.where==='map'){ CALL.pickKind=id; CALL.pickPt=null; MAPV.pick=true; openMap(); return; }
  const sy=Math.sin(WALK.yaw), cy=Math.cos(WALK.yaw); callOrder(id,WALK.pos.x-sy*10,WALK.pos.z-cy*10);
}
/* map pick (49-map routes taps here while MAPV.pick is set) */
function callPickAt(x,z){ CALL.pickPt=[x,z]; mapPanel(); mapDraw(); }
function callPickPanel(){ const K=callKind(CALL.pickKind)||{n:''}, p=CALL.pickPt;
  return '<b>Teslimat noktası · '+K.n+'</b><small>'+(p?Math.round(Math.hypot(p[0]-WALK.pos.x,p[1]-WALK.pos.z))+' m uzakta. Araç oraya gönderilir.':'Haritada aracın gönderileceği yere dokun.')+'</small>'+
    (p?'<button type="button" class="btn primary" id="mapDeliver">Oraya gönder</button><button type="button" class="btn" id="mapDeliverGo">Gönder ve oraya git</button>':'')+'<button type="button" class="btn" id="mapPickCancel">Vazgeç</button>'; }
function callPickDone(go){
  const p=CALL.pickPt, id=CALL.pickKind; MAPV.pick=false; CALL.pickKind=null; CALL.pickPt=null; if(!p||!id){ closeMap(); return; }
  closeMap(); const c=callOrder(id,p[0],p[1]); if(!c||!go) return;
  const J=CALL.jobs.find(function(j){ return j.c===c; }); const tx=J?J.tx:c.x, tz=J?J.tz:c.z, a=Math.random()*6.28;
  const s=callSpot(tx+Math.cos(a)*14,tz+Math.sin(a)*14,0.8)||[tx+8,tz]; WALK.pos.set(s[0],groundH(s[0],s[1])+1.7,s[1]); WALK.yaw=Math.atan2(s[0]-tx,s[1]-tz); WALK.air=false; toast('📍 Teslimat noktası','#b8ecff'); }
function callPickCancel(){ MAPV.pick=false; CALL.pickKind=null; CALL.pickPt=null; mapPanel(); mapDraw(); }
(function(){
  const ui=$('callUI'); if(!ui) return;
  ui.addEventListener('click',function(e){ const t=e.target.closest('button');
    if(!t){ if(e.target===ui) callClose(); return; }
    if(t.dataset.tab!=null){ CALL.tab=+t.dataset.tab; CALL.sel=0; callRender(); return; }
    if(t.dataset.i!=null){ const i=+t.dataset.i; if(CALL.sel===i&&!callLocked(CALL_TABS[CALL.tab].ids[i])){ callGo(); return; } CALL.sel=i; callRender(); return; }
    if(t.dataset.w){ CALL.where=t.dataset.w; callHub(); return; }
    if(t.id==='callGo') callGo(); else if(t.id==='callClose') callClose(); });
  ui.addEventListener('mouseover',function(e){ const t=e.target.closest('.citem'); if(!t) return; const i=+t.dataset.i; if(i!==CALL.sel){ CALL.sel=i; ui.querySelectorAll('.citem').forEach(function(b,j){ b.classList.toggle('sel',j===i); }); callHub(); } });
  window.addEventListener('keydown',function(e){
    if(callIsOpen()){ const n=CALL_TABS[CALL.tab].ids.length;
      if(/^Digit[1-9]$/.test(e.code)){ const i=+e.code.slice(5)-1; if(i<n){ CALL.sel=i; callRender(); } e.preventDefault(); e.stopImmediatePropagation(); return; }
      if(e.code==='Tab'||e.code==='KeyQ'||e.code==='KeyE'){ CALL.tab=(CALL.tab+(e.code==='KeyQ'?CALL_TABS.length-1:1))%CALL_TABS.length; CALL.sel=0; callRender(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if(e.code==='ArrowRight'||e.code==='ArrowLeft'||e.code==='KeyA'||e.code==='KeyD'){ CALL.sel=(CALL.sel+(e.code==='ArrowRight'||e.code==='KeyD'?1:n-1))%n; callRender(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if(e.code==='KeyW'||e.code==='KeyS'){ CALL.where=CALL.where==='me'?'map':'me'; callHub(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if(e.code==='Enter'&&!(e.target&&e.target.tagName==='BUTTON'&&e.target.id!=='callGo')){ callGo(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if(e.code==='Escape'||isKey(e,'foot','call')){ callClose(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      return; }
    if(state==='walk'&&WALK.mode==='foot'&&!e.repeat&&!(typeof anyModalOpen==='function'&&anyModalOpen())&&isKey(e,'foot','call')){ e.preventDefault(); e.stopImmediatePropagation(); callOpen(); }
  },true);
  const tb=$('wCall'); if(tb) tb.addEventListener('pointerdown',function(e){ e.preventDefault(); callOpen(); });
})();
/* no walking while the menu is up */
const _callWalkInput=walkInput; walkInput=function(){ if(callIsOpen()) return {f:0,r:0}; return _callWalkInput(); };
/* touch button visibility, HUD line for deliveries in progress, map markers */
const _callTouch=updateWalkTouch; updateWalkTouch=function(){ _callTouch(); const b=$('wCall'); if(b) b.classList.toggle('hidden',WALK.mode!=='foot'); };
const _callHUD=drawWalkHUD; drawWalkHUD=function(){ _callHUD(); const L=CALL.jobs.filter(function(J){ return !J.done; }); if(!L.length) return;
  const s=clamp(Math.min(HW,HH)/760,0.7,1.5); hx.save(); hx.textAlign='right'; hx.textBaseline='middle'; hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.shadowColor='rgba(0,0,0,.7)'; hx.shadowBlur=4;
  L.forEach(function(J,i){ const c=J.c, d=Math.round(Math.hypot(J.tx-WALK.pos.x,J.tz-WALK.pos.z)); hx.fillStyle='#ffb25a';
    hx.fillText('LOJİSTİK · '+c.K.n.toLocaleUpperCase('tr-TR')+' · '+(J.mode==='drop'?'PARAŞÜT '+Math.max(0,Math.round(c.y-groundH(J.tx,J.tz)))+' m':'YOLDA '+Math.round(Math.hypot(J.tx-c.x,J.tz-c.z))+' m')+(d>60?' · '+d+' m uzakta':''), HW-Math.round(16*s), Math.round((WALK.tvis?64:22)*s)+i*Math.round(18*s)); });
  hx.restore(); };
const _callDrawMap=drawMap; drawMap=function(x,W,H,mini){ _callDrawMap(x,W,H,mini);
  x.save(); CALL.list.forEach(function(c){ const p=mapToScreen(c.x,c.z,W,H); x.fillStyle='#ffb25a'; x.strokeStyle='#08121c'; x.lineWidth=1.5; x.beginPath(); x.rect(p[0]-(mini?2.5:4),p[1]-(mini?2.5:4),mini?5:8,mini?5:8); x.fill(); x.stroke(); });
  if(!mini&&MAPV.pick&&CALL.pickPt){ const p=mapToScreen(CALL.pickPt[0],CALL.pickPt[1],W,H); x.strokeStyle='#ffb25a'; x.lineWidth=2.5; x.beginPath(); x.arc(p[0],p[1],11,0,6.3); x.moveTo(p[0]-16,p[1]); x.lineTo(p[0]+16,p[1]); x.moveTo(p[0],p[1]-16); x.lineTo(p[0],p[1]+16); x.stroke(); }
  x.restore(); };
const _callCloseMap=closeMap; closeMap=function(){ if(MAPV.pick){ MAPV.pick=false; CALL.pickKind=null; CALL.pickPt=null; } _callCloseMap(); };
