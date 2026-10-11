/* ------------------------------------------------------------------ map: full-screen island map (M), corner minimap, places,
   teleporting (in flight: above the place; on foot / in the car: on the ground) and choosing where a flight starts. */
const PLACES=[
  {id:'base',n:'Ay Yıldız Hava Üssü',k:'air',x:0,z:0,g:[-150,-1700,0],rw:'main'},
  {id:'uav',n:'İHA ve Test Merkezi',k:'air',x:11300,z:11400,g:[11560,11400,Math.PI/2],rw:'uav'},
  {id:'naval',n:'Deniz Üssü',k:'navy',x:-1750,z:-3800,g:[-1560,-3330,Math.PI/2]},
  {id:'land',n:'Kara Üssü',k:'army',x:1150,z:-7600,g:[900,-7290,0]},
  {id:'range',n:'Atış poligonu',k:'army',x:2700,z:-7660,g:[2160,-7660,-Math.PI/2]},
  {id:'village',n:'Köy',k:'town',x:-330,z:-2880,g:[-300,-2800,Math.PI]},
  {id:'hilalkent',n:'Hilalkent',k:'city',x:-8200,z:-7050,g:[-7300,-7000,Math.PI/2]},
  {id:'anadolukent',n:'Anadolukent',k:'city',x:-1450,z:6300,g:[-600,6100,Math.PI]},
  {id:'marina',n:'Hilal Marina',k:'sea',x:2350,z:1250,g:[2190,1180,-2.1]},
  {id:'beach',n:'Kumsal',k:'sea',x:1100,z:2500,g:[1200,2380,2.9]},
  {id:'bridge',n:'Hilal Köprüsü',k:'site',x:-600,z:4200,g:[-604,3600,Math.PI]},
  {id:'lake',n:'Gölet',k:'site',x:1700,z:-3750,g:[1440,-3750,Math.PI/2]},
  {id:'ges',n:'Güneş santrali',k:'site',x:500,z:-3900,g:[500,-3760,Math.PI]},
  {id:'wind',n:'Rüzgâr santrali',k:'site',x:3700,z:-1100,g:null},
  {id:'ad',n:'Hava savunma mevzisi',k:'army',x:640,z:-500,g:[600,-470,-0.5]},
  {id:'ammo',n:'Mühimmat deposu',k:'army',x:-1150,z:-300,g:[-1020,-290,Math.PI/2]},
  {id:'radar',n:'Radar istasyonu',k:'army',x:5360,z:-2680,g:[5340,-2600,0]},
  {id:'dam',n:'Hilal Barajı',k:'site',x:-3000,z:12400,g:[-3000,12000,0]},
  {id:'ski',n:'Kayak merkezi',k:'site',x:4340,z:-5465,g:[4360,-5420,-1.4]},
  {id:'skitop',n:'Kayak zirvesi',k:'site',x:6700,z:-5050,g:[6700,-5020,2]},
  {id:'antik',n:'Antik kent',k:'site',x:-6080,z:5720,g:[-6040,5780,Math.PI]},
  {id:'kale',n:'Kale',k:'site',x:9310,z:8002,g:[9310,8045,Math.PI]},
  {id:'obs',n:'Rasathane',k:'site',x:10700,z:-10500,g:[10700,-10470,Math.PI]},
  {id:'oil',n:'Petrol platformu',k:'sea',x:-6500,z:1500,g:null},
  {id:'owf',n:'Denizde rüzgâr santrali',k:'sea',x:-12700,z:1900,g:null},
  {id:'kzb',n:'Kızıl Bölge (düşman üssü)',k:'enemy',x:-9600,z:9600,g:null,rw:'enemy'}];
const MAPV={open:false, from:'play', cx:0, cz:0, scale:0.03, img:null, sel:null, drag:null, mini:null, miniT:0};
const MAP_W=30000;   /* world span drawn on the base image */
function placeById(id){ return PLACES.find(function(p){ return p.id===id; }); }
/* base image: terrain colour by height, generated once */
function mapImage(){
  if(MAPV.img) return MAPV.img; const N=640, c=document.createElement('canvas'); c.width=c.height=N; const x=c.getContext('2d'), im=x.createImageData(N,N), d=im.data;
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const wx=-MAP_W/2+(i+0.5)/N*MAP_W, wz=-MAP_W/2+(j+0.5)/N*MAP_W, h=terrainH(wx,wz), o=(j*N+i)*4; let r,g,b;
    if(h<0){ const t=Math.min(1,-h/45); r=40-18*t; g=110-40*t; b=150-30*t; }
    else if(h<4){ r=214; g=200; b=150; }
    else if(inAnyPad(wx,wz,0)&&h<600){ r=150; g=160; b=150; }
    else if(h<300){ const t=h/300; r=90+40*t; g=140-10*t; b=70+10*t; }
    else if(h<1050){ const t=(h-300)/750; r=130+30*t; g=128+12*t; b=110+25*t; }
    else { r=235; g=238; b=242; }
    d[o]=r; d[o+1]=g; d[o+2]=b; d[o+3]=255; }
  x.putImageData(im,0,0); MAPV.img=c; return c; }
function mapToScreen(wx,wz,W,H){ return [W/2+(wx-MAPV.cx)*MAPV.scale, H/2+(wz-MAPV.cz)*MAPV.scale]; }
function mapToWorld(px,py,W,H){ return [MAPV.cx+(px-W/2)/MAPV.scale, MAPV.cz+(py-H/2)/MAPV.scale]; }
function playerPos(){ if(state==='walk'||MAPV.from==='walk'){ if(WALK.mode==='car') return [WALK.car.x,WALK.car.z,-WALK.car.h]; if(WALK.mode==='heli'&&HELI.cur) return [HELI.cur.x,HELI.cur.z,-HELI.cur.h]; return [WALK.pos.x,WALK.pos.z,-WALK.yaw]; }
  const f=new THREE.Vector3(0,0,-1).applyQuaternion(S.q); return [S.pos.x,S.pos.z,Math.atan2(f.x,-f.z)]; }
const KCOL={air:'#7fd0ff',navy:'#5aa0ff',army:'#9fd36a',town:'#ffd27a',city:'#ffb25a',sea:'#7ff0e0',site:'#e8e8e8',enemy:'#ff5a4a'};
/* draw the map (full screen or minimap) into a 2D context */
function drawMap(x,W,H,mini){
  x.save(); x.fillStyle='#1a3d55'; x.fillRect(0,0,W,H);
  const img=mapImage(), a=mapToScreen(-MAP_W/2,-MAP_W/2,W,H), s=MAP_W*MAPV.scale; x.imageSmoothingEnabled=true; x.drawImage(img,a[0],a[1],s,s);
  const line=function(pts,col,w){ if(!pts||pts.length<2) return; x.strokeStyle=col; x.lineWidth=w; x.beginPath(); pts.forEach(function(p,i){ const q=mapToScreen(p[0],p[1],W,H); if(i) x.lineTo(q[0],q[1]); else x.moveTo(q[0],q[1]); }); x.stroke(); };
  const roads=[ENV.road].concat(EXTRA_ROADS); roads.forEach(function(r){ line(r,'rgba(60,60,60,0.85)',mini?1.5:2.5); });
  line([[SOUTH.bx,SOUTH.zN],[SOUTH.bx,SOUTH.zS]],'#d83a2a',mini?2:3.5);
  /* runways */
  const rw=function(x0,x1,z0,z1){ const p=mapToScreen(x0,z0,W,H), q=mapToScreen(x1,z1,W,H); x.fillStyle='#30343a'; x.fillRect(p[0],p[1],Math.max(2,q[0]-p[0]),Math.max(2,q[1]-p[1])); };
  rw(-35,35,-1250,1250); rw(UAV.rw.x-15,UAV.rw.x+15,UAV.rw.z0,UAV.rw.z1); const ep=PADS.find(function(p){ return p.id==='enemy'; }); if(ep) rw(ep.x0+120,ep.x1-120,(ep.z0+ep.z1)/2-20,(ep.z0+ep.z1)/2+20);
  /* Kızıl Bölge border */
  const k0=mapToScreen(KZB.x0,KZB.z0,W,H), k1=mapToScreen(KZB.x1,KZB.z1,W,H); x.setLineDash([8,6]); x.strokeStyle='rgba(255,70,60,0.9)'; x.lineWidth=2; x.strokeRect(k0[0],k0[1],k1[0]-k0[0],k1[1]-k0[1]); x.setLineDash([]);
  if(!mini){ x.fillStyle='rgba(255,90,74,0.95)'; x.font='700 13px "Chakra Petch",system-ui,sans-serif'; x.textAlign='left'; x.fillText('KIZIL BÖLGE',k0[0]+8,k0[1]+18); }
  /* ships, ground targets, aircraft */
  if(MARINA.movers) MARINA.movers.forEach(function(m){ const p=mapToScreen(m.g.position.x,m.g.position.z,W,H); x.fillStyle='#ffffff'; x.fillRect(p[0]-1.5,p[1]-1.5,3,3); });
  if(typeof gtargets!=='undefined') gtargets.forEach(function(o){ if(!o.alive) return; const p=mapToScreen(o.pos.x,o.pos.z,W,H); x.fillStyle=o.type==='sam'?'#ff3a2a':'#ff8a5a'; x.fillRect(p[0]-3,p[1]-3,6,6); });
  if(typeof ACT!=='undefined') ACT.forEach(function(a){ if(!a.alive||a.isMe) return; const p=mapToScreen(a.pos.x,a.pos.z,W,H); x.fillStyle=a.team==='red'?'#ff4a4a':'#5ab0ff'; x.beginPath(); x.arc(p[0],p[1],3.5,0,6.3); x.fill(); });
  /* places */
  PLACES.forEach(function(pl){ const p=mapToScreen(pl.x,pl.z,W,H); if(p[0]<-20||p[0]>W+20||p[1]<-20||p[1]>H+20) return; const sel=MAPV.sel===pl;
    x.fillStyle=KCOL[pl.k]||'#fff'; x.strokeStyle='#08121c'; x.lineWidth=2; x.beginPath(); x.arc(p[0],p[1],mini?3:(sel?8:5.5),0,6.3); x.fill(); x.stroke();
    if(!mini&&(MAPV.scale>0.02||pl.k==='air'||pl.k==='city'||pl.k==='navy'||pl.k==='army'&&pl.id==='land'||sel)){ x.font=(sel?'700 14px':'600 12px')+' "Chakra Petch",system-ui,sans-serif'; x.textAlign='left';
      x.lineWidth=3; x.strokeStyle='rgba(6,14,24,0.85)'; x.strokeText(pl.n,p[0]+9,p[1]+4); x.fillStyle='#fff'; x.fillText(pl.n,p[0]+9,p[1]+4); } });
  /* player arrow */
  const me=playerPos(), p=mapToScreen(me[0],me[1],W,H); x.translate(p[0],p[1]); x.rotate(me[2]); x.fillStyle='#ffd23a'; x.strokeStyle='#000'; x.lineWidth=1.5;
  x.beginPath(); x.moveTo(0,-(mini?7:11)); x.lineTo(mini?5:8,mini?6:9); x.lineTo(0,mini?3:5); x.lineTo(-(mini?5:8),mini?6:9); x.closePath(); x.fill(); x.stroke();
  x.restore();
}
/* ---- full-screen map */
function openMap(){
  if(MAPV.open) return; if(state!=='play'&&state!=='walk') return;
  MAPV.open=true; MAPV.from=state; if(!NET.on) state='map'; const me=playerPos(); MAPV.cx=me[0]; MAPV.cz=me[1]; MAPV.scale=Math.min(window.innerWidth,window.innerHeight)/9000; MAPV.sel=null;
  $('mapUI').classList.remove('hidden'); mapList(); mapPanel(); mapResize(); mapDraw(); try{ document.exitPointerLock&&document.exitPointerLock(); }catch(e){}
}
function closeMap(){ if(!MAPV.open) return; MAPV.open=false; $('mapUI').classList.add('hidden'); if(state==='map') state=MAPV.from; padFireLock=true; $('gl').focus(); }
function mapResize(){ const c=$('mapCv'), r=c.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1); c.width=Math.round(r.width*d); c.height=Math.round(r.height*d); }
function mapDraw(){ if(!MAPV.open) return; const c=$('mapCv'), x=c.getContext('2d'), d=c.width/c.getBoundingClientRect().width; x.setTransform(d,0,0,d,0,0); drawMap(x,c.width/d,c.height/d,false); }
function mapList(){ $('mapList').innerHTML=PLACES.map(function(p){ return '<button type="button" data-id="'+p.id+'"><i style="background:'+(KCOL[p.k]||'#fff')+'"></i>'+p.n+'</button>'; }).join(''); }
function mapPanel(){ const p=MAPV.sel, el=$('mapSel'); if(!p){ el.innerHTML='<b>Bir yer seç</b><small>Haritada ya da listede bir yere dokun.'+(NET.on?' Çevrimiçi oyunda ışınlanma kapalı.':'')+'</small>'; return; }
  const fly=MAPV.from==='play'||(MAPV.from==='walk'&&WALK.mode==='heli'), canTp=!NET.on&&(fly||p.g), start=SETTINGS.startPlace===p.id;
  el.innerHTML='<b>'+p.n+'</b><small>'+(fly?'Işınlanınca bu yerin üstünde, havada devam edersin.':(p.g?'Yürüyerek ya da araçla buraya geçersin.':'Bu yere yalnızca uçarken gidilebilir.'))+'</small>'+
    (canTp?'<button type="button" class="btn primary" id="mapTp">Işınlan</button>':'')+
    '<button type="button" class="btn" id="mapStart">'+(start?'✓ Başlangıç yeri':'Buradan başla')+'</button>'; }
function mapSelect(p){ MAPV.sel=p; mapPanel(); mapDraw(); }
/* teleport: flying → above the place at a safe height; walking/driving → on the ground */
function teleportTo(p){
  if(NET.on||!p) return;
  if(MAPV.from==='play'){ const top=Math.max(terrainH(p.x,p.z),0); let hi=top; for(let k=0;k<8;k++){ const a=k/8*6.28; hi=Math.max(hi,terrainH(p.x+Math.cos(a)*600,p.z+Math.sin(a)*600)); }
    S.pos.set(p.x,Math.max(hi+350,600),p.z+900); S.onGround=false; S.taxi=false; S.clearance=true; S.auto=false; S.speed=Math.max(S.speed,CUR.airV); S.sink=0; S.gear=false; if(S.throttle<0.5) S.throttle=0.75;
    S.q.identity(); camQ.copy(S.q); camSnap=true; toast('📍 '+p.n,'#b8ecff'); }
  else if(WALK.mode==='heli'&&HELI.cur){ heliTeleport(p); toast('📍 '+p.n,'#b8ecff'); }
  else if(p.g){ const g=p.g, c=WALK.car; if(WALK.mode==='car'){ c.x=g[0]; c.z=g[1]; c.h=g[2]; c.v=0; placeCar(); } else { WALK.pos.set(g[0],groundH(g[0],g[1])+1.7,g[1]); WALK.yaw=g[2]; WALK.air=false; } toast('📍 '+p.n,'#b8ecff'); }
  closeMap();
}
function setStartPlace(p){ SETTINGS.startPlace=p.id==='base'?null:p.id; saveSettings(); toast(p.id==='base'?'Başlangıç yeri: Ay Yıldız Hava Üssü':'Başlangıç yeri: '+p.n+(p.rw?'':' (havada başlarsın)'),'#7dffb0'); mapPanel(); if(typeof refreshStartPlace==='function') refreshStartPlace(); }
(function(){
  const cv=$('mapCv'); if(!cv) return; const ptr=new Map(); let pinch=0, moved=0;
  cv.addEventListener('pointerdown',function(e){ try{ cv.setPointerCapture(e.pointerId); }catch(err){} ptr.set(e.pointerId,{x:e.clientX,y:e.clientY}); moved=0; if(ptr.size===2){ const v=Array.from(ptr.values()); pinch=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y); } });
  cv.addEventListener('pointermove',function(e){ const p=ptr.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; moved+=Math.abs(dx)+Math.abs(dy);
    if(ptr.size===1){ MAPV.cx-=dx/MAPV.scale; MAPV.cz-=dy/MAPV.scale; mapDraw(); }
    else if(ptr.size===2){ const v=Array.from(ptr.values()), d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y); if(pinch>0) mapZoom(d/pinch); pinch=d; } });
  const up=function(e){ if(!ptr.has(e.pointerId)) return; if(ptr.size===1&&moved<6){ const r=cv.getBoundingClientRect(), px=e.clientX-r.left, py=e.clientY-r.top; let best=null, bd=18;
      PLACES.forEach(function(p){ const q=mapToScreen(p.x,p.z,r.width,r.height), d=Math.hypot(q[0]-px,q[1]-py); if(d<bd){ bd=d; best=p; } }); mapSelect(best); }
    ptr.delete(e.pointerId); pinch=0; };
  cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',function(e){ e.preventDefault(); mapZoom(Math.exp(-clamp(e.deltaY,-120,120)*0.0015)); },{passive:false});
  $('mapList').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; const p=placeById(b.dataset.id); MAPV.cx=p.x; MAPV.cz=p.z; mapSelect(p); });
  $('mapSel').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b||!MAPV.sel) return; if(b.id==='mapTp') teleportTo(MAPV.sel); else if(b.id==='mapStart') setStartPlace(MAPV.sel); });
  $('mapClose').addEventListener('click',closeMap); $('mapZin').addEventListener('click',function(){ mapZoom(1.4); }); $('mapZout').addEventListener('click',function(){ mapZoom(1/1.4); });
  $('mapMe').addEventListener('click',function(){ const me=playerPos(); MAPV.cx=me[0]; MAPV.cz=me[1]; mapDraw(); });
  window.addEventListener('keydown',function(e){ if(!MAPV.open) return; if(e.code==='Escape'||isKey(e,'gen','map')){ e.preventDefault(); e.stopImmediatePropagation(); closeMap(); } },true);
  window.addEventListener('resize',function(){ if(MAPV.open){ mapResize(); mapDraw(); } });
})();
function mapZoom(f){ MAPV.scale=clamp(MAPV.scale*f,0.006,0.15); mapDraw(); }
/* ---- corner minimap (Settings → Interface) */
function miniStep(dt){
  const on=!!SETTINGS.minimap&&(state==='play'||state==='walk')&&!MAPV.open, el=$('miniMap'); if(!el) return; el.classList.toggle('hidden',!on); if(!on) return;
  MAPV.miniT-=dt; if(MAPV.miniT>0) return; MAPV.miniT=0.2;
  const d=Math.min(2,window.devicePixelRatio||1), W=el.clientWidth||150; if(el.width!==Math.round(W*d)){ el.width=el.height=Math.round(W*d); }
  const x=el.getContext('2d'), keep=[MAPV.cx,MAPV.cz,MAPV.scale], me=playerPos(); MAPV.cx=me[0]; MAPV.cz=me[1]; MAPV.scale=W/3500;
  x.setTransform(d,0,0,d,0,0); drawMap(x,W,W,true); MAPV.cx=keep[0]; MAPV.cz=keep[1]; MAPV.scale=keep[2]; }
