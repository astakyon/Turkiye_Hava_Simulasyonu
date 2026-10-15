/* ------------------------------------------------------------------ land and sea missions (V1.99)
   New board categories "Kara" and "Deniz": missions for tanks, Kirpi, Pars, the patrol boat, the Ada corvette and TCG Anadolu.
   They run on the helicopter-mission engine (objectives, timer, beacon, end screen, "Tekrar"): cars already could start
   there (convoy); boats now can too, sea checkpoints count for boats, and tank / boat shells damage mission targets. */
BCAT.kara='Kara'; BCAT.deniz='Deniz';
const GV_SEA_LOOP=[[-3600,-4600],[-4600,-5600],[-5200,-4200],[-4200,-3200],[-3600,-4600]];
function gvSeaTarget(kind,x,z,h,mv){ let g; const n=kind==='smug'?'Kaçakçı teknesi':'Hedef duba';
  if(kind==='smug'){ const sh=buildFishing('#2b2d31'); g=new THREE.Group(); g.add(bakeGroup(sh.group)); }
  else { g=new THREE.Group(); const raft=new THREE.Mesh(new THREE.BoxGeometry(8,1.4,8),new THREE.MeshLambertMaterial({color:0xd8281f})); raft.position.y=0.4; g.add(raft);
    const mast=new THREE.Mesh(new THREE.BoxGeometry(0.4,5,0.4),new THREE.MeshLambertMaterial({color:0xffffff})); mast.position.y=3.2; g.add(mast); }
  g.position.set(x,0,z); g.rotation.y=h||0; scene.add(g);
  const o={kind:kind,n:n,g:g,pos:new THREE.Vector3(x,1.8,z),x:x,z:z,h:h||0,hp:kind==='smug'?2:1.2,r:kind==='smug'?7:6,pts:kind==='smug'?400:150,alive:true,mv:mv||null}; HTGT.push(o); return o; }
function gvPath(P){ let L=0; for(let i=0;i<P.length-1;i++) L+=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]); return L; }
const GVMIS=[
  {id:'g_konvoy',grp:'kara',car:'altay',lic:'tank',n:'Konvoy savunması',d:'Altay ile Kara Üssü\'nden çık, Güneş santralindeki dost konvoya ulaş ve saldıran düşman araçlarını imha et.',spot:[930,-7560,Math.PI],lim:720,xp:300,diff:2,
    setup:function(){ const loop=[[700,-3500],[300,-3450],[250,-3700],[650,-3750],[700,-3500]]; htAdd('truck',600,-3480,0,{path:loop,len:gvPath(loop),s:0,v:5}); htAdd('apc',350,-3600,0,{path:loop,len:gvPath(loop),s:400,v:5}); htAdd('truck',200,-3650,0); htAdd('apc',800,-3650,1); },
    obj:[{t:'cp',n:'Güneş santralindeki konvoya ulaş',x:500,z:-3900,r:60},{t:'kill',n:'Saldıran düşman araçlarını imha et (X / sol tık: top)',x:500,z:-3600}]},
  {id:'g_kirpi',grp:'kara',car:'kirpi',lic:'ehliyet',n:'Kirpi ile keşif',d:'Kirpi zırhlı aracıyla üç kontrol noktasından geç: Gölet, Güneş santrali ve Köy. Yoldan çıkma, devrilme.',spot:[960,-7540,Math.PI],lim:600,xp:220,diff:1,setup:function(){},
    obj:[{t:'cp',n:'1. kontrol noktası: Gölet',x:1440,z:-3750,r:45},{t:'cp',n:'2. kontrol noktası: Güneş santrali',x:500,z:-3760,r:45},{t:'cp',n:'3. kontrol noktası: Köy',x:-300,z:-2800,r:45}]},
  {id:'g_poligon',grp:'kara',car:'pars',lic:'tank',n:'Pars ile atış tatbikatı',d:'Atış poligonunda Pars ile beş hedefi vur. Taret kamerayla döner; nişan al ve ateş et.',spot:[2160,-7660,-Math.PI/2],lim:420,xp:220,diff:1,
    setup:function(){ [[2600,-7600],[2700,-7720],[2820,-7640],[2950,-7700],[3050,-7600]].forEach(function(p,i){ htAdd(i%2?'apc':'truck',p[0],p[1],Math.PI/2); }); },obj:[{t:'kill',n:'Poligondaki beş hedefi vur',x:2800,z:-7660}]},
  {id:'s_kacakci',grp:'deniz',boat:'patrol',lic:'kaptan',n:'Kaçakçı takibi',d:'Deniz Üssü açıklarında kaçak yük taşıyan bir tekne görüldü. Hücumbotla yetiş ve batır (ateş: boşluk / sol tık).',spot:[-2200,-3900,Math.PI/2],lim:480,xp:280,diff:2,
    setup:function(){ gvSeaTarget('smug',-3600,-4600,0,{path:GV_SEA_LOOP,len:gvPath(GV_SEA_LOOP),s:0,v:9}); },obj:[{t:'kill',n:'Kaçakçı teknesini batır'}]},
  {id:'s_devriye',grp:'deniz',boat:'patrol',lic:'kaptan',n:'Liman devriyesi',d:'Hücumbotla Deniz Üssü çevresindeki üç devriye noktasından geç.',spot:[-2200,-3900,Math.PI/2],lim:480,xp:200,diff:1,setup:function(){},
    obj:[{t:'cp',n:'1. devriye noktası',x:-2800,z:-4400,r:70},{t:'cp',n:'2. devriye noktası',x:-4200,z:-3200,r:70},{t:'cp',n:'3. devriye noktası',x:-3000,z:-2600,r:70}]},
  {id:'s_korvet',grp:'deniz',boat:'frigate',lic:'kaptan',n:'Korvet topçu atışı',d:'Ada sınıfı korvetin topuyla açık denizdeki üç hedef dubayı vur.',spot:[-2200,-3900,Math.PI/2],lim:540,xp:240,diff:2,
    setup:function(){ [[-4100,-3300],[-4350,-3050],[-3900,-2950]].forEach(function(p){ gvSeaTarget('raft',p[0],p[1],0); }); },obj:[{t:'kill',n:'Üç hedef dubayı topla vur'}]},
  {id:'s_anadolu',grp:'deniz',boat:'anadolu',lic:'kaptan',n:'TCG Anadolu ile çıkarma',d:'TCG Anadolu\'yu toplanma noktasına, oradan kıyıdaki çıkarma noktasına götür. Gemi büyük ve yavaş: dönüşleri erken başlat.',spot:[-2200,-3900,Math.PI/2],lim:900,xp:320,diff:2,setup:function(){},
    obj:[{t:'cp',n:'Toplanma noktası',x:-3600,z:-4600,r:120},{t:'cp',n:'Çıkarma noktası (kıyı açığı)',x:-3000,z:-2600,r:140}]}];
hmById=HOOK.wrap('hmById','98i-groundsea#_gvById',function(_gvById){ return function(id){ return _gvById(id)||GVMIS.find(function(m){ return m.id===id; })||null; }; },hmById);
/* boats start here */
function gvBoatStart(M){ if(HM.on) hmClean(); closeModals(); startWalk(); hmClean(); buildBoats();
  const K=BOAT_KINDS[M.boat], sh=K.build(), g=new THREE.Group(); g.add(bakeGroup(sh.group)); scene.add(g);
  const b={id:M.boat,K:K,g:g,L:sh.L||12,B:sh.B||Math.max(3,(sh.L||12)*0.18),x:M.spot[0],z:M.spot[1],h:M.spot[2],v:0,th:0,yr:0,cd:0,bob:0,deck:sh.deck||null,gv:true}; BOATS.push(b); boatPlace(b,0);
  if(b.deck){ const d=b.deck; SHIPDECKS.push({x:b.x,z:b.z,y:d.y,r:d.r,local:new THREE.Vector3(0,d.y,d.z),g:g,mover:b,name:K.n+' güvertesi',gv:true}); }
  GV.boat=b; WALK.pos.set(b.x,2,b.z); boatBoard(b);
  Object.assign(HM,{on:true,id:M.id,M:M,H:null,i:0,t:0,score:0,kills:0,ended:false,crate:null}); M.setup(); hmBeacon();
  if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, '+K.n+' hazır. '+M.obj[0].n+'.'},null,{force:true}); }
const GV={boat:null};
function gvBoatClean(){ const b=GV.boat; if(!b) return; if(BOAT.cur===b){ try{ boatExit(); }catch(e){} } scene.remove(b.g); const i=BOATS.indexOf(b); if(i>=0) BOATS.splice(i,1);
  for(let k=SHIPDECKS.length-1;k>=0;k--) if(SHIPDECKS[k].gv) SHIPDECKS.splice(k,1); GV.boat=null; }
hmStart=HOOK.wrap('hmStart','98i-groundsea#_gvStart',function(_gvStart){ return function(id){ const M=hmById(id); gvBoatClean(); if(M&&M.boat) return gvBoatStart(M); return _gvStart(id); }; },hmStart);
/* sea checkpoints count for boats */
hmStep=HOOK.wrap('hmStep','98i-groundsea#_gvStep',function(_gvStep){ return function(dt){ _gvStep(dt); if(!HM.on||HM.ended) return; const o=hmCur(), b=BOAT.cur;
  if(o&&o.t==='cp'&&WALK.mode==='boat'&&b&&Math.hypot(b.x-o.x,b.z-o.z)<(o.r||60)) hmNext(); }; },hmStep);
/* tank and boat shells hit mission targets */
vehWeaponsStep=HOOK.wrap('vehWeaponsStep','98i-groundsea#_gvWeap',function(_gvWeap){ return function(dt){ const before=VFX.shells.slice(); _gvWeap(dt);
  if(!HTGT.length) return; before.forEach(function(s){ if(VFX.shells.indexOf(s)>=0||s.life<=0) return; hoBlast(s.p,s.big?14:3,s.big?1.4:0.12); }); }; },vehWeaponsStep);
/* objective panel on the boat HUD */
if(typeof drawWalkHUD==='function'){ drawWalkHUD=HOOK.wrap('drawWalkHUD','98i-groundsea#_gvHUD',function(_gvHUD){ return function(){ _gvHUD(); if(HM.on&&!HM.ended&&WALK.mode==='boat'&&BOAT.cur&&typeof hmDrawObj==='function'){ const b=BOAT.cur, s=clamp(Math.min(HW,HH)/760,0.7,1.5); hx.save(); hmDrawObj(HW,HH,s,b.x,b.z,b.h); hx.restore(); } }; },drawWalkHUD); }
/* ---- mission board */
boardAll=HOOK.wrap('boardAll','98i-groundsea#_gvAll',function(_gvAll){ return function(){ return _gvAll().concat(GVMIS.map(function(M){ return {id:M.id,kind:'gv',name:M.n,desc:M.d,M:M}; })); }; },boardAll);
bMeta=HOOK.wrap('bMeta','98i-groundsea#_gvMeta',function(_gvMeta){ return function(e){ if(e.kind!=='gv') return _gvMeta(e); const M=e.M, o=M.obj.find(function(q){ return q.x!=null; });
  return {cat:M.grp,diff:M.diff,dur:Math.round(M.lim/60),xp:M.xp,obj:M.obj.map(function(q){ return q.n; }),thr:M.grp==='deniz'?['Açık deniz, dalga']:['Engebeli arazi, devrilme'],load:null,area:o?[o.x,o.z,4000]:[M.spot[0],M.spot[1],4000]}; }; },bMeta);
function gvVehName(M){ if(M.boat) return BOAT_KINDS[M.boat].n; const k=CAR_KINDS.find(function(c){ return c.id===M.car; }); return k?k.n:M.car; }
renderMissions=HOOK.wrap('renderMissions','98i-groundsea#_gvRender',function(_gvRender){ return function(){ _gvRender(); const f=$('misFilt'), seg=f&&f.querySelector('[data-k="cat"]');
  if(seg&&!seg.querySelector('[data-v="kara"]')){ [['kara','Kara'],['deniz','Deniz']].forEach(function(c){ const b=document.createElement('button'); b.type='button'; b.dataset.v=c[0]; b.textContent=c[1]; b.setAttribute('aria-pressed',String(BF.cat===c[0])); const nw=seg.querySelector('.bnew'); if(nw) seg.insertBefore(b,nw); else seg.appendChild(b); }); }
  const e=boardList()[misSel]; if(e&&e.kind==='gv'){ const bt=$('btnMisGo'); if(bt) bt.textContent=e.M.boat?'▶ Gemiyle başla':'▶ Araçla başla'; $('btnMisAc').disabled=true; $('btnMisAc').textContent=gvVehName(e.M); } }; },renderMissions);
misGo=HOOK.wrap('misGo','98i-groundsea#_gvGo',function(_gvGo){ return function(){ const e=boardList()[misSel]; if(!e||e.kind!=='gv') return _gvGo(); if(PLAY.mode==='career'&&!licHas(e.M.lic)){ toast('🔒 '+LIC2[e.M.lic].n+' gerekli — Kariyer → Ehliyet ve Sertifikalar','#ffc24a'); return; } hmStart(e.M.id); }; },misGo);
misLocked=HOOK.wrap('misLocked','98i-groundsea#_gvLock',function(_gvLock){ return function(e){ if(e&&e.kind==='gv') return PLAY.mode==='career'&&!licHas(e.M.lic); return _gvLock(e); }; },misLocked);
hmQuit=HOOK.wrap('hmQuit','98i-groundsea#_gvQuit',function(_gvQuit){ return function(){ _gvQuit(); if(WALK.mode!=='boat') gvBoatClean(); }; },hmQuit);
