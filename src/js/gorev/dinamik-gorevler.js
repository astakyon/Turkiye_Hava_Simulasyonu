/* ------------------------------------------------------------------ dynamic missions (V1.77)
   Every session (and on "Yenile") six missions are generated from the island's places:
   aircraft: patrol, intercept, close air support, escort, UAV recon, sea patrol;
   helicopter: search and rescue (T625), cargo lift (T625), area clearing (T129); ground: truck convoy.
   Aircraft missions run as missionId 'dyn' with multi-stage objectives, a time limit, an optional bonus objective
   and one mid-mission event (new SAM, weather turning, a fault). Helicopter / convoy missions use the HM engine. */
MISSIONS.dyn={name:'Dinamik görev',desc:'',limit:600};
BCAT.dinamik='Dinamik';
const DYN={seed:Date.now()&0xffffff, list:[], heli:[], cur:null, marks:[], wxKeep:null};
const DYN_T={
  patrol:{n:'Devriye',ic:'air',cat:'Devriye'}, intercept:{n:'Önleme',ic:'air'}, cas:{n:'Yakın hava desteği',ic:'air'}, escort:{n:'Refakat',ic:'air'},
  uav:{n:'İHA keşfi',ic:'air'}, sea:{n:'Deniz devriyesi',ic:'air'}, sar:{n:'Arama-kurtarma',ic:'heli'}, cargo:{n:'Yük taşıma',ic:'heli'}, clear:{n:'Bölge temizliği',ic:'heli'}, convoy:{n:'Kara konvoyu',ic:'car'}};
const UAVS=['aksungur','anka','tb3','akinci','tb2','anka3'];
function dynLand(r,cx,cz,R,minD){ for(let k=0;k<160;k++){ const a=r()*6.283, d=(minD||0)+r()*(R-(minD||0)), x=cx+Math.cos(a)*d, z=cz+Math.sin(a)*d, h=terrainH(x,z);
    if(h<6||h>900||Math.abs(x)>13500||Math.abs(z)>13500) continue; if(Math.abs(terrainH(x+15,z)-h)+Math.abs(terrainH(x,z+15)-h)>4) continue; if(inFriendlyPad&&inFriendlyPad(x,z,150)) continue; return [x,z]; } return null; }
function dynSea(r){ for(let k=0;k<200;k++){ const x=(r()-0.5)*24000, z=(r()-0.5)*24000; if(terrainH(x,z)<-20) return [x,z]; } return [-6000,0]; }
function dynPlaces(r,f){ const L=PLACES.filter(function(p){ return p.g&&p.k!=='enemy'&&(!f||f(p)); }); for(let i=L.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=L[i]; L[i]=L[j]; L[j]=t; } return L; }
/* ---- generation */
function dynGen(seed){
  const r=mulberry32(seed), out=[], heli=[];
  const air=['patrol','intercept','cas','escort','uav','sea'], hl=['sar','cargo','clear'];
  for(let i=air.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=air[i]; air[i]=air[j]; air[j]=t; }
  for(let i=hl.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=hl[i]; hl[i]=hl[j]; hl[j]=t; }
  air.slice(0,3).forEach(function(t,i){ const m=dynAir(t,r,i); if(m) out.push(m); });
  hl.slice(0,2).forEach(function(t,i){ const m=dynHeli(t,r,i); if(m){ out.push(m); heli.push(m.M); } });
  const cv=dynConvoy(r); if(cv){ out.push(cv); heli.push(cv.M); }
  DYN.list=out; DYN.heli=heli; return out; }
function dynEv(r){ return ['sam','weather','fault'][Math.floor(r()*3)]; }
function dynAir(t,r,i){ const P=dynPlaces(r), id='d_'+t+'_'+i; let e=null;
  if(t==='patrol'){ const w=P.slice(0,4).map(function(p){ return [p.x,p.z]; }), bp=dynLand(r,w[1][0],w[1][1],1500,400);
    e={tp:t,name:'Devriye: '+P[0].n+' → '+P[3].n,desc:P[0].n+', '+P[1].n+', '+P[2].n+' ve '+P[3].n+' üzerinden sırayla geç. Yolda şüpheli konvoy görülebilir.',diff:1,lim:720,xp:200,
      obj:w.map(function(p,k){ return {t:'wp',x:p[0],z:p[1],r:700,n:(k+1)+'. devriye noktası: '+P[k].n}; }),bonus:bp?{t:'killset',set:'bonus',n:'Bonus: şüpheli konvoyu imha et',pos:bp}:null,thr:['Olası hava savunması'],area:[w[1][0],w[1][1],7000]}; }
  else if(t==='intercept'){ const n=4+Math.floor(r()*3); e={tp:t,name:'Önleme: '+n+' düşman İHA\'sı',desc:'Kızıl Bölge\'den kalkan '+n+' kamikaze İHA üsse doğru geliyor. Hiçbiri üsse 2 km\'den fazla yaklaşmadan düşür.',diff:2,lim:480,xp:260,
      obj:[{t:'intercept',n:'Düşman İHA\'larını düşür',count:n}],bonus:{t:'nodamage',n:'Bonus: hasar alma (%80 üstü can)'},thr:['Hızlı alçak uçan İHA\'lar'],area:[-4500,4500,9000],load:'aa'}; }
  else if(t==='cas'){ const p=P.find(function(p){ return p.k==='town'||p.k==='site'||p.k==='army'||p.k==='city'; })||P[0];
    e={tp:t,name:'Yakın hava desteği: '+p.n,desc:p.n+' yakınındaki dost birlik saldırı altında. Mevzinin çevresindeki düşman araçlarını imha et.',diff:2,lim:600,xp:280,pos:[p.g[0],p.g[1]],
      obj:[{t:'killset',set:'cas',n:'Dost birliğe saldıran araçları imha et'}],bonus:{t:'fast',n:'Bonus: 4 dakikada bitir',sec:240},thr:['Düşman uçaksavarı','Görev ortasında yeni tehdit olabilir'],area:[p.g[0],p.g[1],2500],load:'ag'}; }
  else if(t==='escort'){ const a=P[0], b=P[1]; e={tp:t,name:'Refakat: '+a.n+' → '+b.n,desc:'Dost nakliye uçağı '+a.n+' üzerinden '+b.n+' yönüne uçuyor. Düşman avcılarını uzak tut; nakliye uçağı vurulmasın.',diff:3,lim:540,xp:340,route:[[0,0],[a.x,a.z],[b.x,b.z]],
      obj:[{t:'escort',n:'Nakliye uçağını hedefe kadar koru'}],bonus:{t:'kills',n:'Bonus: 2 düşman avcısı düşür',k:2},thr:['Düşman avcıları (füze)'],area:[a.x,a.z,9000],load:'aa'}; }
  else if(t==='uav'){ const w=P.slice(0,3); e={tp:t,name:'İHA keşfi: '+w.map(function(p){ return p.n; }).join(', '),desc:'Bir İHA ile '+w.length+' bölgenin üstünde 6 saniye kal; sensör tarama yapar. İnsanlı uçak seçiliyse Aksungur verilir.',diff:1,lim:900,xp:220,uav:true,
      obj:w.map(function(p,k){ return {t:'scan',x:p.x,z:p.z,r:600,sec:6,n:'Tara: '+p.n}; }),bonus:{t:'fuel',n:'Bonus: yakıtın %50 üstünde bitir'},thr:['Uzun mesafe'],area:[w[0].x,w[0].z,8000],load:'rec'}; }
  else if(t==='sea'){ const s1=dynSea(r), s2=dynSea(r); e={tp:t,name:'Deniz devriyesi',desc:'Kıyı açıklarında iki bölgeyi devriye et, ardından seyir hâlindeki iki gemiyi alçaktan geçerek tanımla.',diff:1,lim:720,xp:210,
      obj:[{t:'wp',x:s1[0],z:s1[1],r:900,n:'Deniz devriye noktası 1'},{t:'wp',x:s2[0],z:s2[1],r:900,n:'Deniz devriye noktası 2'},{t:'ship',n:'İki gemiyi 600 m altında yakından tanımla',count:2}],bonus:null,thr:['Açık deniz, iniş yeri yok'],area:[(s1[0]+s2[0])/2,(s1[1]+s2[1])/2,9000]}; }
  if(!e) return null; e.id=id; e.kind='dyn'; e.sub='air'; e.ev=dynEv(r); e.cat='dinamik'; e.dur=Math.round(e.lim/60); return e; }
/* helicopter missions reuse the helicopter mission engine */
const DYN_BASE=[{x:-450,z:540,n:'Ay Yıldız Hava Üssü',h:Math.PI/2,id:'t625'},{x:-1720,z:-3360,n:'Deniz Üssü',h:Math.PI/2,id:'t625'},{x:-1450,z:6605,n:'Anadolukent',h:Math.PI/2,id:'t625'},{x:-8200,z:-6732,n:'Hilalkent',h:Math.PI/2,id:'t625'}];
function dynHeli(t,r,i){ const id='d_'+t+'_'+i, B=DYN_BASE[Math.floor(r()*DYN_BASE.length)], P=dynPlaces(r,function(p){ return Math.hypot(p.x-B.x,p.z-B.z)>2500; }); let M=null;
  if(t==='sar'){ const p=P[0], s=dynLand(r,p.g[0],p.g[1],900,200)||[p.g[0],p.g[1]], n=2+Math.floor(r()*3), home=DYN_BASE.find(function(b){ return b!==B; })||B;
    M={id:id,heli:'t625',n:'Arama-kurtarma: '+p.n,d:p.n+' yakınında '+n+' yaralı var (turuncu işaret). Yanlarına in, bindir (B) ve '+home.n+' helipadine götür.',spot:[B.x,B.z,B.h],lim:600,xp:280,
      setup:function(){ trSpawn(s[0],s[1],n,'mis'); },obj:[{t:'board',n:'Yaralıların yanına in, B ile bindir',x:s[0],z:s[1]},{t:'unload',n:home.n+' helipadine in ve indir (B)',x:home.x,z:home.z+30,r:60}]}; }
  else if(t==='cargo'){ const p=P[0], s=dynLand(r,p.g[0],p.g[1],600,100)||[p.g[0]+40,p.g[1]];
    M={id:id,heli:'t625',n:'Yük taşıma: '+B.n+' → '+p.n,d:B.n+'\'ndeki erzak sandığını askıya al, '+p.n+' yakınındaki iniş bölgesine bırak.',spot:[B.x,B.z,B.h],lim:600,xp:260,
      setup:function(){ const c=callSpot(B.x+30,B.z+30,3)||[B.x+30,B.z+30]; HM.crate=crateAdd(c[0],c[1],'mis'); },obj:[{t:'hook',n:'Sandığı kancaya al (B)'},{t:'deliver',n:p.n+' iniş bölgesine indir',x:s[0],z:s[1],r:25}]}; }
  else { const p=P.find(function(p){ return p.k==='site'||p.k==='army'||p.k==='town'; })||P[0], c=dynLand(r,p.g[0],p.g[1],1200,300)||[p.g[0]+400,p.g[1]], B2={x:-450,z:470,h:Math.PI/2,n:'Ay Yıldız Hava Üssü'};
    const L=[['tank',0,0],['apc',40,25],['truck',-35,30],['truck',25,-40],['sam',-50,-30]].slice(0,3+Math.floor(r()*3));
    M={id:id,heli:'t129',n:'Bölge temizliği: '+p.n,d:p.n+' yakınına sızan '+L.length+' düşman aracını T129 ile imha et.',spot:[B2.x,B2.z,B2.h],lim:540,xp:280,
      setup:function(){ L.forEach(function(q){ htAdd(q[0],c[0]+q[1],c[1]+q[2],r()*6); }); },obj:[{t:'kill',n:'Düşman araçlarını imha et',x:c[0],z:c[1]}]}; }
  const m=M.obj.find(function(o){ return o.x!=null; });
  return {id:id,kind:'dyn',sub:'heli',tp:t,name:M.n,desc:M.d,M:M,diff:t==='cargo'?2:t==='sar'?2:2,dur:Math.round(M.lim/60),xp:M.xp,cat:'dinamik',thr:t==='clear'?['Hareketsiz zırhlı araçlar']:['Engebeli arazi, rüzgâr'],area:m?[m.x,m.z,3000]:[B.x,B.z,3000],obj:M.obj.map(function(o){ return o.n; })}; }
function dynConvoy(r){ const S0=[1300,-7300], P=dynPlaces(r,function(p){ return Math.hypot(p.x-S0[0],p.z-S0[1])>2500&&Math.hypot(p.x-S0[0],p.z-S0[1])<7000&&p.g&&groundH(p.g[0],p.g[1])>1&&groundH(p.g[0],p.g[1])<350; }).slice(0,3); if(P.length<2) return null;
  const id='d_convoy';
  const M={id:id,car:'truck',n:'Kara konvoyu: '+P.map(function(p){ return p.n; }).join(' → '),d:'Askerî kamyonla Kara Üssü\'nden çık; '+P.map(function(p){ return p.n; }).join(', ')+' kontrol noktalarından geç.',spot:[905,-7480,-Math.PI/2],lim:600,xp:220,
    setup:function(){},obj:P.map(function(p,k){ return {t:'cp',n:(k+1)+'. kontrol noktası: '+p.n,x:p.g[0],z:p.g[1],r:35}; })};
  return {id:id,kind:'dyn',sub:'car',tp:'convoy',name:M.n,desc:M.d,M:M,diff:1,dur:10,xp:220,cat:'dinamik',thr:['Yoldan çıkma, devrilme'],area:[P[0].g[0],P[0].g[1],5000],obj:M.obj.map(function(o){ return o.n; })}; }
dynGen(DYN.seed);
/* ---- board integration */
boardAll=HOOK.wrap('boardAll','gorev/dinamik-gorevler#_dynAll',function(_dynAll){ return function(){ return _dynAll().concat(DYN.list.map(function(e){ return {id:e.id,kind:'dyn',name:e.name,desc:e.desc,D:e}; })); }; },boardAll);
bMeta=HOOK.wrap('bMeta','gorev/dinamik-gorevler#_dynMeta',function(_dynMeta){ return function(e){ if(e.kind!=='dyn') return _dynMeta(e); const D=e.D;
  return {cat:'dinamik',diff:D.diff,dur:D.dur,xp:D.xp,obj:D.sub==='air'?D.obj.map(function(o){ return o.n; }).concat(D.bonus?[D.bonus.n]:[]):D.obj,thr:D.thr.concat(D.ev?[{sam:'Görev ortasında yeni tehdit çıkabilir',weather:'Hava bozabilir',fault:'Arıza çıkabilir'}[D.ev]]:[]),load:D.load||null,area:D.area}; }; },bMeta);
renderMissions=HOOK.wrap('renderMissions','gorev/dinamik-gorevler#_dynRender',function(_dynRender){ return function(){ _dynRender(); const f=$('misFilt'); if(f&&!f.querySelector('[data-v="dinamik"]')){ const seg=f.querySelector('[data-k="cat"]'); if(seg){ const b=document.createElement('button'); b.type='button'; b.dataset.v='dinamik'; b.textContent='Dinamik'; b.setAttribute('aria-pressed',String(BF.cat==='dinamik')); seg.appendChild(b); const n=document.createElement('button'); n.type='button'; n.className='bnew'; n.dataset.v='__new'; n.textContent='↻ Yeni görevler'; seg.appendChild(n); } }
  const e=boardList()[misSel]; if(e&&e.kind==='dyn'){ const bt=$('btnMisGo'); if(bt) bt.textContent=e.D.sub==='heli'?'▶ Helikopterle başla':e.D.sub==='car'?'▶ Kamyonla başla':'▶ Brifing tamam — başla'; $('btnMisAc').disabled=e.D.sub!=='air'; if(e.D.sub!=='air') $('btnMisAc').textContent=e.D.sub==='car'?'Askerî kamyon':HELI_DEF[e.D.M.heli].name; else if(e.D.uav&&UAVS.indexOf(selectedId)<0) $('btnMisAc').textContent='İHA gerekli → Aksungur'; } }; },renderMissions);
(function(){ const f=$('misFilt'); if(f) f.addEventListener('click',function(ev){ const b=ev.target.closest('button[data-v="__new"]'); if(!b) return; ev.stopImmediatePropagation(); DYN.seed=(DYN.seed*1103515245+12345)&0xffffff; dynGen(DYN.seed); BF.cat='dinamik'; misSel=0; renderMissions(); toast('Yeni dinamik görevler hazır','#7dffb0'); },true); })();
misGo=HOOK.wrap('misGo','gorev/dinamik-gorevler#_dynGo',function(_dynGo){ return function(){ const e=boardList()[misSel]; if(!e||e.kind!=='dyn') return _dynGo(); const D=e.D;
  if(D.sub==='heli') return hmStart(D.M.id); if(D.sub==='car') return dynCarStart(D.M);
  if(D.uav&&UAVS.indexOf(selectedId)<0){ selectedId='aksungur'; if(typeof setAircraft==='function') setAircraft('aksungur'); toast('İHA keşfi: Aksungur seçildi','#b8ecff'); }
  DYN.cur=D; MISSIONS.dyn.name=D.name; MISSIONS.dyn.desc=D.desc; MISSIONS.dyn.limit=D.lim; BMETA.dyn={xp:D.xp,dur:D.dur}; selectMission('dyn'); preFlight('missions'); }; },misGo);
/* convoy: start in a truck */
function dynCarStart(M){ if(HM.on) hmClean(); closeModals(); startWalk(); hmClean();
  const sp=callSpot(M.spot[0],M.spot[1],4.5)||[M.spot[0],M.spot[1]], c=vehNew(M.car,sp[0],sp[1],M.spot[2]); c.called=true; WALK.car=c; WALK.mode='car'; c.v=0; WALK.cy=0;
  Object.assign(HM,{on:true,id:M.id,M:M,H:null,i:0,t:0,score:0,kills:0,ended:false,crate:null}); M.setup(); hmBeacon();
  if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, konvoy görevi başladı. '+M.obj[0].n+'.'},null,{force:true}); }
hmStart=HOOK.wrap('hmStart','gorev/dinamik-gorevler#_dynHmStart',function(_dynHmStart){ return function(id){ const M=hmById(id); if(M&&M.car) return dynCarStart(M); return _dynHmStart(id); }; },hmStart);
drawWalkHUD=HOOK.wrap('drawWalkHUD','gorev/dinamik-gorevler#_dynWalkHUD',function(_dynWalkHUD){ return function(){ _dynWalkHUD(); if(HM.on&&!HM.ended&&WALK.mode==='car'&&WALK.car){ const s=clamp(Math.min(HW,HH)/760,0.7,1.5); hx.save(); hmDrawObj(HW,HH,s,WALK.car.x,WALK.car.z,WALK.car.h); hx.restore(); } }; },drawWalkHUD);
/* ---- aircraft mission engine */
function dynMark(x,z,r,col){ const g=new THREE.Group(), h=Math.max(0,terrainH(x,z)); const rg=new THREE.TorusGeometry(r,6,6,48); rg.rotateX(Math.PI/2);
  const m1=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:col||0x39e6ff,transparent:true,opacity:0.7})); m1.position.y=10; g.add(m1);
  const m2=new THREE.Mesh(new THREE.CylinderGeometry(r,r,700,32,1,true),new THREE.MeshBasicMaterial({color:col||0x39e6ff,transparent:true,opacity:0.1,side:THREE.DoubleSide,depthWrite:false})); m2.position.y=350; g.add(m2);
  g.position.set(x,h,z); scene.add(g); DYN.marks.push(g); return g; }
function dynClear(){ DYN.marks.forEach(function(g){ scene.remove(g); }); DYN.marks=[]; if(DYN.tr){ scene.remove(DYN.tr.g); DYN.tr=null; } if(DYN.wxKeep!=null){ SETTINGS.wx=DYN.wxKeep; WX.kind=DYN.wxKeep==='auto'?WX.kind:DYN.wxKeep; DYN.wxKeep=null; } }
setupMission=HOOK.wrap('setupMission','gorev/dinamik-gorevler#_dynSetup',function(_dynSetup){ return function(){ dynClear(); if(missionId!=='dyn'||!DYN.cur) return _dynSetup();
  MLOG.length=0; bLogToggle(false); B_STAT.shots=0; B_STAT.minHp=100;
  const D=DYN.cur; MS.rings=MS.air=MS.ground=MS.recon=false; M={id:'dyn',t:0,started:false,done:false,scanIdx:0,scanT:0};
  clearAir(); clearGround(); clearRecon(); ringIdx=0; courseT=null; updateRingVisuals(); aiClear();
  DYN.st={i:0,scan:0,evDone:false,bonus:false,ships:[],shipT:0,trHp:100,kills0:0,minHp:100,bonusSet:[]};
  if(D.tp==='cas'){ const r=mulberry32(D.id.length*77+(D.pos[0]|0)); for(let k=0;k<5;k++){ const s=dynLand(r,D.pos[0],D.pos[1],900,350); if(s) addGround(k===4?'sam':'truck',s[0],s[1]); } dynMark(D.pos[0],D.pos[1],60,0x5dff8a); }
  if(D.tp==='intercept'){ const n=D.obj[0].count; for(let k=0;k<n;k++){ const g=new THREE.Group(); g.add(new THREE.Mesh(tgtGeo,tgtMat)); scene.add(g); const sx=-9000+k*450, sz=9000-k*300, y=Math.max(0,terrainH(sx,sz))+300+k*40;
      targets.push({label:'Düşman İHA',g:g,c:new THREE.Vector3(sx,y,sz),rad:0,w:0,ph:k,alive:true,pos:new THREE.Vector3(sx,y,sz),dyn:{v:70+k*4}}); } }
  if(D.tp==='escort'){ const m=buildModel('aksungur'); m.group.scale.setScalar(1.6); scene.add(m.group); DYN.tr={g:m.group,p:new THREE.Vector3(0,AIRFIELD_Y+900,-1500),i:1,h:0}; DYN.st.waves=0; }
  if(D.tp==='sea'){ const L=(MARINA.movers||[]).slice().sort(function(a,b){ return b.g.position.distanceTo(new THREE.Vector3())-a.g.position.distanceTo(new THREE.Vector3()); }); DYN.st.ships=L.slice(0,2).map(function(m){ return {m:m,done:false}; }); }
  if(D.bonus&&D.bonus.t==='killset'&&D.bonus.pos){ for(let k=0;k<3;k++){ const p=D.bonus.pos; const o=addGround('truck',p[0]+k*14,p[1]+k*6); o.bonus=true; DYN.st.bonusSet.push(o); } }
  dynMarkCur(); toast('Görev: '+D.name,'#7dffb0'); if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, görev: '+D.obj[0].n+'.'},null,{force:true}); }; },setupMission);
function dynMarkCur(){ DYN.marks.forEach(function(g){ if(!g.userData.keep) scene.remove(g); }); DYN.marks=DYN.marks.filter(function(g){ return g.userData.keep; }); const D=DYN.cur, o=D&&D.obj[DYN.st.i]; if(!o) return;
  if(o.t==='wp'||o.t==='scan') dynMark(o.x,o.z,o.r,o.t==='scan'?0xffd27a:0x39e6ff); }
function dynNext(){ const D=DYN.cur; DYN.st.i++; score+=150; noteScore(); if(DYN.st.i>=D.obj.length){ dynFinish(true); return; } dynMarkCur(); toast('Yeni hedef: '+D.obj[DYN.st.i].n,'#b8ecff'); if(typeof radioSay==='function') radioSay({w:'kule',t:D.obj[DYN.st.i].n+'.'},null,{}); }
function dynFinish(ok){ const D=DYN.cur; if(ok&&D.bonus){ const b=D.bonus, st=DYN.st; let got=false;
    if(b.t==='killset') got=st.bonusSet.length&&st.bonusSet.every(function(o){ return !o.alive; }); else if(b.t==='nodamage') got=st.minHp>=80; else if(b.t==='fast') got=M.t<=b.sec; else if(b.t==='kills') got=(st.downs||0)>=b.k; else if(b.t==='fuel') got=S.fuel>0.5;
    if(got){ score+=300; noteScore(); toast('BONUS hedef tamamlandı  +300','#7dffb0'); DYN.st.bonus=true; try{ careerAdd(80,null); }catch(e){} } }
  endMission(ok); }
function dynEvent(){ const D=DYN.cur, st=DYN.st; if(st.evDone||M.t<D.lim*0.33) return; st.evDone=true;
  if(D.ev==='sam'){ fwdOf(S.q,vF); const x=S.pos.x+vF.x*4000, z=S.pos.z+vF.z*4000, p=dynLand(Math.random,x,z,1500)||[x,z]; addGround('sam',p[0],p[1]); toast('YENİ TEHDİT: SAM bataryası tespit edildi','#ff8a5a'); if(typeof radioSay==='function') radioSay({w:'awacs',t:'{cs}, dikkat! Önünde yeni bir SAM bataryası aktif oldu.'},null,{force:true}); }
  else if(D.ev==='weather'){ DYN.wxKeep=SETTINGS.wx||'clear'; SETTINGS.wx=Math.random()<0.5?'storm':'fog'; WX.kind=SETTINGS.wx; toast('Hava bozuyor: '+WX_P[SETTINGS.wx].n,'#ffc24a'); if(typeof radioSay==='function') radioSay({w:'kule',t:'{cs}, bölgede hava hızla bozuluyor, dikkatli ol.'},null,{force:true}); }
  else if(D.ev==='fault'&&!S.onGround){ if(Math.random()<0.5){ S.leak=0.004; toast('ARIZA: yakıt sızıntısı','#ff8a5a'); } else { S.eng=0.35; toast('ARIZA: motor gücü düştü','#ff8a5a'); } } }
function dynStep(dt){ const D=DYN.cur; if(!D||M.done) return; const st=DYN.st, o=D.obj[st.i]; st.minHp=Math.min(st.minHp,S.hp); dynEvent();
  if(M.t>D.lim){ endMission(false); return; }
  if(!o) return;
  if(o.t==='wp'){ if(!S.onGround&&Math.hypot(S.pos.x-o.x,S.pos.z-o.z)<o.r&&S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z))<1800){ toast(o.n+' geçildi','#7dffb0'); dynNext(); } }
  else if(o.t==='scan'){ if(!S.onGround&&Math.hypot(S.pos.x-o.x,S.pos.z-o.z)<o.r){ st.scan+=dt; if(st.scan>=o.sec){ st.scan=0; toast(o.n+' tamam','#7dffb0'); dynNext(); } } else st.scan=Math.max(0,st.scan-dt*2); }
  else if(o.t==='killset'){ const L=gtargets.filter(function(g){ return !g.bonus; }); if(L.length&&L.every(function(g){ return !g.alive; })) dynNext(); }
  else if(o.t==='intercept'){ let near=false; targets.forEach(function(t){ if(!t.alive||!t.dyn) return; const dx=-t.c.x, dz=-t.c.z, d=Math.hypot(dx,dz); if(d<2000){ near=true; return; } t.c.x+=dx/d*t.dyn.v*dt; t.c.z+=dz/d*t.dyn.v*dt; t.c.y=Math.max(t.c.y-2*dt,Math.max(0,terrainH(t.c.x,t.c.z))+150); });
    if(near){ toast('Bir İHA üsse ulaştı!','#ff5a4a'); endMission(false); return; } if(targets.length&&targets.every(function(t){ return !t.alive; })) dynNext(); }
  else if(o.t==='ship'){ st.ships.forEach(function(s){ if(s.done) return; const p=s.m.g.position; if(Math.hypot(S.pos.x-p.x,S.pos.z-p.z)<800&&S.pos.y<600&&!S.onGround){ s.t=(s.t||0)+dt; if(s.t>3){ s.done=true; score+=100; toast('Gemi tanımlandı','#7dffb0'); } } });
    if(st.ships.length&&st.ships.every(function(s){ return s.done; })) dynNext(); else if(!st.ships.length) dynNext(); }
  else if(o.t==='escort'){ const tr=DYN.tr; if(!tr) return; const R=D.route, w=R[Math.min(tr.i,R.length-1)], dx=w[0]-tr.p.x, dz=w[1]-tr.p.z, d=Math.hypot(dx,dz), sp=85;
    if(d<300){ tr.i++; if(tr.i>=R.length){ toast('Nakliye uçağı güvende','#7dffb0'); dynNext(); return; } } tr.h=Math.atan2(-dx,-dz); tr.p.x+=dx/d*sp*dt; tr.p.z+=dz/d*sp*dt; tr.p.y+=(Math.max(AIRFIELD_Y+700,Math.max(0,terrainH(tr.p.x,tr.p.z))+500)-tr.p.y)*Math.min(1,dt*0.3);
    tr.g.position.copy(tr.p); tr.g.rotation.set(0,tr.h,0);
    if(M.t>20&&st.waves<1||M.t>140&&st.waves<2){ st.waves++; const n=st.waves; for(let k=0;k<n+1;k++){ const a=spawnEnemy(k+1); a.pos.set(tr.p.x+3000+k*300,tr.p.y+200,tr.p.z-2500); } toast('Düşman avcıları nakliyeye yöneldi!','#ff8a5a'); }
    let thr=0; (typeof ACT!=='undefined'?ACT:[]).forEach(function(a){ if(a.alive&&a.team==='red'&&a.pos.distanceTo(tr.p)<600) thr++; }); if(thr){ st.trHp-=thr*4*dt; if(st.trHp<=0){ toast('Nakliye uçağı düştü','#ff5a4a'); explode(tr.p.clone(),60,8); endMission(false); return; } }
    st.downs=(typeof ACT!=='undefined'?ACT:[]).filter(function(a){ return a.team==='red'&&!a.alive; }).length; } }
updateMission=HOOK.wrap('updateMission','gorev/dinamik-gorevler#_dynUpd',function(_dynUpd){ return function(dt){ if(M.id==='dyn'&&!M.done&&state==='play'){ if(!M.started&&!S.onGround) M.started=true; if(M.started) M.t+=dt; dynStep(dt); return; } return _dynUpd(dt); }; },updateMission);
endMission=HOOK.wrap('endMission','gorev/dinamik-gorevler#_dynEnd',function(_dynEnd){ return function(ok,tm){ const r=_dynEnd(ok,tm); if(M.id==='dyn') dynClear(); return r; }; },endMission);
bObjective=HOOK.wrap('bObjective','gorev/dinamik-gorevler#_dynObj',function(_dynObj){ return function(){ if(state!=='play'||!M||M.id!=='dyn'||M.done||!DYN.cur) return _dynObj(); const D=DYN.cur, st=DYN.st, o=D.obj[st.i]; if(!o) return null; let txt=o.n, tgt=null;
  if(o.t==='wp'||o.t==='scan'){ tgt={x:o.x,z:o.z}; if(o.t==='scan'&&st.scan>0) txt+=' · %'+Math.round(st.scan/o.sec*100); }
  else if(o.t==='killset'){ const L=gtargets.filter(function(g){ return !g.bonus; }); txt+=' ('+L.filter(function(g){ return !g.alive; }).length+'/'+L.length+')'; tgt=bNearest(L.filter(function(g){ return g.alive; }).map(function(g){ return g.pos; })); }
  else if(o.t==='intercept'){ const L=targets.filter(function(t){ return t.alive; }); txt+=' ('+(targets.length-L.length)+'/'+targets.length+')'; tgt=bNearest(L.map(function(t){ return t.pos; })); }
  else if(o.t==='ship'){ txt+=' ('+st.ships.filter(function(s){ return s.done; }).length+'/'+st.ships.length+')'; const s=st.ships.find(function(s){ return !s.done; }); if(s) tgt=s.m.g.position; }
  else if(o.t==='escort'&&DYN.tr){ txt+=' · nakliye %'+Math.max(0,Math.round(st.trHp)); tgt=DYN.tr.p; }
  return {name:D.name.split(':')[0],txt:(D.obj.length>1?(st.i+1)+'/'+D.obj.length+' · ':'')+txt,rem:Math.max(0,D.lim-M.t),tgt:tgt}; }; },bObjective);
bStarsFor=HOOK.wrap('bStarsFor','gorev/dinamik-gorevler#_dynStars',function(_dynStars){ return function(ok){ if(M.id!=='dyn'||!DYN.cur) return _dynStars(ok); if(!ok) return 0; return Math.min(3,1+(M.t<DYN.cur.lim*0.6?1:0)+(DYN.st&&DYN.st.bonus?1:0)); }; },bStarsFor);
