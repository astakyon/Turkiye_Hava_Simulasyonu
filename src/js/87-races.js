/* ------------------------------------------------------------------ races (V1.80)
   Four races: an air ring course around the island, a helicopter slalom east of the runway, an island rally on the
   land base → village road and a boat race round the buoys off the naval base. The clock starts at the first gate.
   The best run is saved with its split times and a ghost (a see-through copy flying/driving the best line); the
   top 5 times per race are kept on the device. Races are on the board (category Yarış). */
BCAT.yaris='Yarış';
const RACES=[
  {id:'r_air',n:'Ada halka yarışı',veh:'air',ac:'hurjet',d:'Adanın çevresindeki 12 halkadan sırayla geç. Dağların arasından alçak geç, en kısa çizgiyi bul.',R:48,
   gates:function(){ return [[0,-2600,260],[1600,-5200,320],[3600,-6600,380],[5600,-5200,520],[6300,-2600,700],[5200,0,420],[3400,2200,300],[900,3300,260],[-1800,2400,260],[-3000,0,240],[-2600,-2400,260],[-600,-3600,220]].map(function(p){ return [p[0],Math.max(0,terrainH(p[0],p[1]))+p[2],p[1]]; }); }},
  {id:'r_heli',n:'Helikopter slalomu',veh:'heli',ac:'t129',d:'Pistin doğusundaki 11 kapıdan zikzak çizerek geç. Kapılar alçakta: 15 metre.',R:13,
   gates:function(){ const L=[]; for(let i=0;i<11;i++){ const x=i%2?480:300, z=700-i*140; L.push([x,groundH(x,z)+15,z]); } return L; }},
  {id:'r_car',n:'Ada rallisi',veh:'car',ac:'suv',d:'Kara Üssü\'nden köye giden dağ yolunda kontrol noktalarından geç. Virajlarda el freniyle kaydır.',R:16,
   gates:function(){ const R=EXTRA_ROADS[1]||ENV.road, L=[]; let acc=0; for(let i=1;i<R.length;i++){ acc+=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]); if(i===1||acc>420||i===R.length-1){ L.push([R[i][0],groundH(R[i][0],R[i][1])+2.5,R[i][1]]); acc=0; } } return L; }},
  {id:'r_boat',n:'Körfez tekne yarışı',veh:'boat',ac:'patrol',d:'Deniz Üssü açığındaki şamandıraların arasından Hücumbotla iki tur at.',R:22,
   gates:function(){ const L=[]; for(let lap=0;lap<2;lap++) for(let k=0;k<8;k++){ const a=-Math.PI/2+k/8*Math.PI*2, x=-2700+Math.cos(a)*520, z=-4600+Math.sin(a)*360; L.push([x,2.5,z]); } L.push(L[0].slice()); return L; }}];
const RACE={on:false, def:null, gates:[], meshes:[], i:0, t:0, started:false, rec:[], recT:0, splits:[], ghost:null, gm:null, gi:0};
function raceStore(){ try{ return JSON.parse(localStorage.getItem('ayy-race')||'{}'); }catch(e){ return {}; } }
function raceSave(o){ try{ localStorage.setItem('ayy-race',JSON.stringify(o)); }catch(e){} }
function raceBest(id){ const s=raceStore()[id]; return s&&s.best||null; }
/* ---- board */
const _rAll=boardAll; boardAll=function(){ return _rAll().concat(RACES.map(function(R){ return {id:R.id,kind:'race',name:'Yarış: '+R.n,desc:R.d,R:R}; })); };
const _rMeta=bMeta; bMeta=function(e){ if(e.kind!=='race') return _rMeta(e); const R=e.R, b=raceStore()[R.id];
  return {cat:'yaris',diff:R.veh==='air'?2:R.veh==='heli'?3:1,dur:R.veh==='air'?4:3,xp:120,obj:['Kapılardan sırayla geç ('+R.gates().length+' kapı)','Süre ilk kapıda başlar'].concat(b&&b.board&&b.board.length?['SIRALAMA: '+b.board.slice(0,5).map(function(x,i){ return (i+1)+'. '+x.n+' '+fmtT(x.t); }).join(' · ')]:['Henüz derece yok']),thr:[b&&b.best?'Hayalet: en iyi derecen '+fmtT(b.best):'Hayalet yok — ilk dereceni yap'],load:null,area:(function(){ const G=R.gates(); let x=0,z=0; G.forEach(function(g){ x+=g[0]; z+=g[2]; }); return [x/G.length,z/G.length,R.veh==='air'?6500:R.veh==='car'?2600:900]; })()}; };
const _rRender=renderMissions; renderMissions=function(){ _rRender(); const f=$('misFilt'); if(f&&!f.querySelector('[data-v="yaris"]')){ const seg=f.querySelector('[data-k="cat"]'); if(seg){ const b=document.createElement('button'); b.type='button'; b.dataset.v='yaris'; b.textContent='Yarış'; b.setAttribute('aria-pressed',String(BF.cat==='yaris')); seg.insertBefore(b,seg.querySelector('.bnew')||null); } }
  const e=boardList()[misSel]; if(e&&e.kind==='race'){ const b=raceBest(e.R.id); $('btnMisGo').textContent='▶ Yarışa başla'; $('btnMisAc').disabled=true; $('btnMisAc').textContent={air:AIRCRAFT[e.R.ac].short,heli:'T129 ATAK',car:'Ay Yıldız SUV',boat:'Hücumbot'}[e.R.veh];
    $('misChips').innerHTML='<span>'+(b?'En iyi: <b>'+fmtT(b)+'</b>':'Derece yok')+'</span><span>'+e.R.gates().length+' kapı</span>'; }
  Array.prototype.forEach.call(document.querySelectorAll('#misList .mitem'),function(btn){ const en=boardList()[+btn.dataset.i]; if(en&&en.kind==='race'){ const st=btn.querySelector('.stars'), b=raceBest(en.R.id); if(st) st.outerHTML='<span class="stars"><i class="on" style="font-size:11px">'+(b?fmtT(b):'—')+'</i></span>'; } }); };
const _rGo=misGo; misGo=function(){ const e=boardList()[misSel]; if(!e||e.kind!=='race') return _rGo(); raceStart(e.R.id); };
/* ---- gates and ghost */
const RGM={next:new THREE.MeshBasicMaterial({color:0x5dff8a,transparent:true,opacity:0.85}), gate:new THREE.MeshBasicMaterial({color:0xffb25a,transparent:true,opacity:0.6}), pole:new THREE.MeshLambertMaterial({color:0xe03a2a}), ghost:new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:0.35,depthWrite:false})};
function raceGates(){ RACE.meshes.forEach(function(m){ scene.remove(m); }); RACE.meshes=[]; const R=RACE.def, G=RACE.gates;
  G.forEach(function(g,i){ const n=G[Math.min(i+1,G.length-1)], p=G[Math.max(i-1,0)], dx=(n[0]-p[0])||1, dz=n[2]-p[2], grp=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.TorusGeometry(R.R,R.veh==='air'?2.2:0.6,8,40),RGM.gate); grp.add(ring); grp.ring=ring;
    if(R.veh==='heli'||R.veh==='car'){ [-1,1].forEach(function(s){ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,g[1]-groundH(g[0],g[2])+R.R,8),RGM.pole); c.position.set(s*R.R,-(g[1]-groundH(g[0],g[2]))/2+R.R/2-R.R*0.5,0); grp.add(c); }); }
    if(R.veh==='boat'){ const b=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,3,10),RGM.pole); b.position.set(R.R,-1.5,0); grp.add(b); }
    grp.position.set(g[0],g[1],g[2]); grp.rotation.y=Math.atan2(dx,dz); grp.userData.noCull=true; ring.userData.noCull=true; scene.add(grp); RACE.meshes.push(grp); });
  raceGateVis(); }
function raceGateVis(){ RACE.meshes.forEach(function(g,i){ g.visible=i>=RACE.i&&i<RACE.i+4; g.ring.material=i===RACE.i?RGM.next:RGM.gate; }); }
function raceGhostModel(R){ let g; try{ if(R.veh==='air') g=buildModel(R.ac).group; else if(R.veh==='heli') g=heliBuild(R.ac).g; else if(R.veh==='car') g=carBuild(R.ac).g; else g=BOAT_KINDS[R.ac].build().group; }catch(e){ g=new THREE.Mesh(new THREE.ConeGeometry(2,6,8),RGM.ghost); }
  g.traverse(function(o){ if(o.isMesh) o.material=RGM.ghost; if(o.isLine||o.isPoints) o.visible=false; }); g.userData.noCull=true; g.traverse(function(o){ o.userData.noCull=true; }); scene.add(g); return g; }
/* ---- start */
function racePlayerPos(){ const R=RACE.def; if(!R) return null;
  if(R.veh==='air') return [S.pos.x,S.pos.y,S.pos.z,(function(){ fwdOf(S.q,vF); return Math.atan2(-vF.x,-vF.z); })()];
  if(R.veh==='heli'&&HELI.cur) return [HELI.cur.x,HELI.cur.y+1.5,HELI.cur.z,HELI.cur.h];
  if(R.veh==='car'&&WALK.mode==='car') return [WALK.car.x,(WALK.car.y==null?groundH(WALK.car.x,WALK.car.z):WALK.car.y)+1,WALK.car.z,WALK.car.h];
  if(R.veh==='boat'&&BOAT.cur) return [BOAT.cur.x,2,BOAT.cur.z,BOAT.cur.h]; return null; }
function raceStart(id){
  const R=RACES.find(function(r){ return r.id===id; }); if(!R) return; raceStop(); closeModals(); if(HM.on&&!HM.ended) hmClean();
  RACE.def=R; RACE.gates=R.gates(); RACE.i=0; RACE.t=0; RACE.started=false; RACE.rec=[]; RACE.recT=0; RACE.splits=[]; RACE.gi=0;
  const G=RACE.gates, g0=G[0], g1=G[1], dx=g1[0]-g0[0], dz=g1[2]-g0[2], L=Math.hypot(dx,dz)||1, ux=dx/L, uz=dz/L, h=Math.atan2(-ux,-uz);
  if(R.veh==='air'){ selectedId=R.ac; setAircraft(R.ac); missionId='race'; MISSIONS.race={name:'Yarış: '+R.n,desc:R.d,limit:0}; startGame('air');
    S.pos.set(g0[0]-ux*1600,g0[1]+40,g0[2]-uz*1600); S.q.setFromAxisAngle(UP,h); S.speed=Math.max(CUR.airV,140); S.throttle=0.85; S.gear=false; S.onGround=false; S.taxi=false; S.clearance=true; camQ.copy(S.q); camSnap=true; }
  else { startWalk();
    if(R.veh==='heli'){ buildHelis(); const H=HELI.list.find(function(x){ return x.id===R.ac&&Math.hypot(x.home[0]+450,x.home[1]-470)<5; })||HELI.list.find(function(x){ return x.id===R.ac; });
      if(H.crashT>0) H.crashT=0; H.x=g0[0]-ux*90; H.z=g0[2]-uz*90; H.h=h; H.y=heliFloor(H).y; H.home=[H.x,H.z,H.h]; H.vx=H.vy=H.vz=0; H.ground=true; H.rpm=0.95; H.m.g.visible=true; heliPlace(H); WALK.pos.set(H.x+5,groundH(H.x,H.z)+1.7,H.z); heliBoard(H); }
    else if(R.veh==='car'){ const sx=g0[0]-ux*30, sz=g0[2]-uz*30, c=vehNew(R.ac,sx,sz,h); c.called=true; WALK.car=c; WALK.mode='car'; c.v=0; RACE.car=c; }
    else { if(!BOATS_BUILT) buildBoats(); const b=cxBoatNew(R.ac,g0[0]-ux*60,g0[2]-uz*60,h); RACE.boat=b; boatBoard(b); } }
  raceGates(); const st=raceStore()[R.id]; RACE.ghost=st&&st.ghost&&st.ghost.length>4?st.ghost:null; if(RACE.ghost) RACE.gm=raceGhostModel(R);
  Object.assign(HM,{on:true,id:R.id,M:{n:'Yarış: '+R.n,lim:600,xp:120,obj:[]},H:null,ended:true,i:0,t:0});
  toast('Yarış: '+R.n+' — süre ilk kapıda başlar','#7dffb0'); if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, yarış parkuru hazır. İlk kapıdan geçince süre başlıyor. Bol şans!'},null,{force:true}); }
function raceStop(){ RACE.meshes.forEach(function(m){ scene.remove(m); }); RACE.meshes=[]; if(RACE.gm){ scene.remove(RACE.gm); RACE.gm=null; }
  if(RACE.car){ const c=RACE.car; if(!(WALK.mode==='car'&&WALK.car===c)){ const i=VEHS.indexOf(c); if(i>=0) VEHS.splice(i,1); scene.remove(c.mesh); } RACE.car=null; }
  if(RACE.boat){ const b=RACE.boat; if(BOAT.cur!==b){ const i=BOATS.indexOf(b); if(i>=0) BOATS.splice(i,1); scene.remove(b.g); } RACE.boat=null; }
  RACE.on=false; RACE.def=null; }
/* ---- per frame */
const rP=new THREE.Vector3();
function raceStep(dt){
  const R=RACE.def; if(!R) return; const inMode=R.veh==='air'?state==='play'&&M.id==='race':state==='walk'; if(!inMode){ if(state==='menu') raceStop(); return; }
  if(R.veh==='air'&&S.crashed){ toast('Yarış bitti: kaza','#ff6a5a'); raceStop(); return; }
  const p=racePlayerPos(); if(!p) return; if(RACE.started) RACE.t+=dt;
  const g=RACE.gates[RACE.i]; if(g){ const d=Math.hypot(p[0]-g[0],p[1]-g[1],p[2]-g[2]); if(d<R.R*(R.veh==='car'?1.3:1.05)){
      if(!RACE.started){ RACE.started=true; RACE.t=0; toast('Süre başladı!','#7dffb0'); }
      RACE.splits[RACE.i]=RACE.t; try{ sndPlay('ui_ok'); }catch(e){}
      RACE.i++; raceGateVis(); if(RACE.i>=RACE.gates.length){ raceFinish(); return; } } }
  /* record + ghost */
  if(RACE.started){ RACE.recT-=dt; if(RACE.recT<=0){ RACE.recT=0.2; RACE.rec.push([Math.round(p[0]*10)/10,Math.round(p[1]*10)/10,Math.round(p[2]*10)/10,Math.round(p[3]*100)/100]); } }
  if(RACE.gm&&RACE.ghost){ const G=RACE.ghost, f=RACE.started?RACE.t/0.2:0, i=Math.min(G.length-2,Math.floor(f)), u=Math.min(1,f-i), a=G[i], b=G[i+1];
    RACE.gm.position.set(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u-(R.veh==='heli'?1.5:R.veh==='car'?1:0),a[2]+(b[2]-a[2])*u); RACE.gm.rotation.set(0,a[3]+Math.atan2(Math.sin(b[3]-a[3]),Math.cos(b[3]-a[3]))*u,0); RACE.gm.visible=RACE.started||true; }
}
function raceFinish(){
  const R=RACE.def, t=RACE.t, all=raceStore(), s=all[R.id]||(all[R.id]={board:[]}), prev=s.best, isBest=!prev||t<prev;
  if(isBest){ s.best=t; s.ghost=RACE.rec.slice(0,3000); s.splits=RACE.splits.slice(); }
  const name=(SETTINGS.callsign||accProfile().callsign||'Pilot').slice(0,16); s.board=(s.board||[]).concat([{n:name,t:t,d:Date.now()}]).sort(function(a,b){ return a.t-b.t; }).slice(0,5); raceSave(all);
  const rank=s.board.findIndex(function(x){ return x.t===t; })+1;
  try{ careerAdd(isBest?120:40,{races:1}); }catch(e){}
  if(typeof radioSay==='function') radioSay({w:'kule',t:isBest?'Bitiş! Yeni rekor, tebrikler {cs}!':'Bitiş çizgisi. Süren '+fmtT(t).slice(0,5)+'.'},null,{force:true});
  const el=$('hmEnd'); if(el){ $('hmEndT').textContent=isBest?'YENİ REKOR!':'BİTİŞ'; $('hmEndT').className='ok';
    $('hmEndS').innerHTML='<b>'+R.n+' · '+fmtT(t)+'</b><span>'+(prev?(isBest?'Önceki en iyi '+fmtT(prev)+' · '+(t-prev).toFixed(1)+' sn':'En iyi '+fmtT(prev)+' · +'+(t-prev).toFixed(1)+' sn'):'İlk derecen')+' · sıralamada '+rank+'.</span><ol class="rboard">'+s.board.map(function(x){ return '<li'+(x.t===t?' class="me"':'')+'><b>'+x.n+'</b><span>'+fmtT(x.t)+'</span></li>'; }).join('')+'</ol>';
    setTimeout(function(){ el.classList.remove('hidden'); try{ document.exitPointerLock&&document.exitPointerLock(); }catch(e){} },900); }
  Object.assign(HM,{on:true,id:R.id,ended:true}); RACE.meshes.forEach(function(m){ m.visible=false; }); if(RACE.gm) RACE.gm.visible=false; RACE.def=null; RACE.keep=R;
}
const _rHm=hmStart; hmStart=function(id){ if(String(id).indexOf('r_')===0){ $('hmEnd').classList.add('hidden'); HM.on=false; return raceStart(id); } return _rHm(id); };
const _rSetup=setupMission; setupMission=function(){ if(missionId!=='race') return _rSetup(); MLOG.length=0; MS.rings=MS.air=MS.ground=MS.recon=false; M={id:'race',t:0,started:false,done:false,scanIdx:0,scanT:0}; clearAir(); clearGround(); clearRecon(); ringIdx=0; courseT=null; updateRingVisuals(); aiClear(); };
const _rUpdM=updateMission; updateMission=function(dt){ if(M.id==='race') return; return _rUpdM(dt); };
const _rObj=bObjective; bObjective=function(){ if(state==='play'&&M&&M.id==='race') return null; return _rObj(); };
/* ---- HUD */
function raceHUD(w,h,s){ const R=RACE.def; if(!R) return; const p=racePlayerPos(); if(!p) return; const g=RACE.gates[RACE.i], best=raceStore()[R.id], spl=best&&best.splits;
  hx.save(); hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,.75)'; hx.shadowBlur=4; const y=Math.round((R.veh==='air'?(TOUCH.vis?104:94):(WALK.tvis?60:22))*s);
  hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#ffd27a';
  let line='YARIŞ · KAPI '+Math.min(RACE.i+1,RACE.gates.length)+'/'+RACE.gates.length+' · '+(RACE.started?fmtT(RACE.t):'ilk kapıya git'); if(best&&best.best) line+=' · EN İYİ '+fmtT(best.best);
  hx.fillText(line,w/2,y);
  if(RACE.started&&spl&&RACE.i>0&&spl[RACE.i-1]!=null&&RACE.splits[RACE.i-1]!=null){ const dlt=RACE.splits[RACE.i-1]-spl[RACE.i-1]; hx.font='700 '+Math.round(16*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle=dlt<=0?'#7dffb0':'#ff8a5a'; hx.fillText((dlt<=0?'':'+')+dlt.toFixed(1)+' sn',w/2,y+Math.round(20*s)); }
  if(g){ const d=Math.hypot(g[0]-p[0],g[2]-p[2]), b=Math.atan2(g[0]-p[0],g[2]-p[2]), rel=Math.atan2(Math.sin(b-p[3]-Math.PI),Math.cos(b-p[3]-Math.PI)); hx.save(); hx.translate(w/2,y+Math.round(44*s)); hx.rotate(-rel); hx.fillStyle='#5dff8a'; hx.beginPath(); hx.moveTo(0,-12*s); hx.lineTo(8*s,7*s); hx.lineTo(0,3*s); hx.lineTo(-8*s,7*s); hx.closePath(); hx.fill(); hx.restore();
    hx.font='600 '+Math.round(11*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#dfe9f1'; hx.fillText(Math.round(d)+' m'+(R.veh!=='car'&&R.veh!=='boat'?' · '+(g[1]-p[1]>0?'↑':'↓')+Math.abs(Math.round(g[1]-p[1]))+' m':''),w/2,y+Math.round(64*s)); }
  hx.restore(); }
const _rHUD=drawHUD; drawHUD=function(){ _rHUD(); if(state==='play'&&RACE.def&&RACE.def.veh==='air') raceHUD(HW,HH,clamp(Math.min(HW,HH)/760,0.7,1.5)); };
const _rWalkHUD=drawWalkHUD; drawWalkHUD=function(){ _rWalkHUD(); if(RACE.def&&(RACE.def.veh==='car'||RACE.def.veh==='boat')) raceHUD(HW,HH,clamp(Math.min(HW,HH)/760,0.7,1.5)); };
const _rHeliHUD=heliHUD; heliHUD=function(w,h,s){ _rHeliHUD(w,h,s); if(RACE.def&&RACE.def.veh==='heli') raceHUD(w,h,s); };
/* no wingman or enemies during races and lessons */
const _rAiCfg=aiCfg; aiCfg=function(){ const c=_rAiCfg(); if(M&&(M.id==='race'||M.id==='school')) return Object.assign({},c,{enemies:0,wing:false,sam:false}); return c; };
