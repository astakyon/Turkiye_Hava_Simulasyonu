/* ------------------------------------------------------------------ mixed multiplayer (V1.83)
   • Players can leave the aircraft during a match (Pause → Yürüyerek gez) and walk, drive, fly helicopters or sail;
     everybody sees them as a person / car / helicopter / boat.
   • Üs ele geçirme (base capture): two teams fight for the Air, Naval and Land bases. Stay inside a zone (on foot, in a
     vehicle, helicopter or low aircraft) to take it; every owned base scores 1 point per 5 s, first to 100 wins.
   • Kule görevlisi (tower controller): a player can take the tower role in the lobby — a radar map of the island with
     every player, quick radio instructions and map markers instead of an aircraft.
   • Text chat (/ key, SOHBET on touch) for everybody, in the lobby and in the match; the host can kick players
     (lobby button or "/at <ad>" in chat). */
NET_MODES.base={name:'Üs ele geçirme',desc:'Hava, Deniz ve Kara üslerinde kal, ele geçir. 100 puan kazanır.'};
const NB_ZONES=[{id:'air',n:'Hava Üssü',x:0,z:0,r:900},{id:'naval',n:'Deniz Üssü',x:-1750,z:-3800,r:800},{id:'land',n:'Kara Üssü',x:1150,z:-7550,r:800}];
const NB={zones:NB_ZONES.map(function(z){ return {id:z.id,o:null,p:0}; }),sc:{blue:0,red:0},tick:0,sendT:0,marks:[],chat:[],proxies:{}};
function teamTag(t){ return t==='blue'?'MAVİ':t==='red'?'KIRMIZI':'—'; }
/* ---- lobby: base mode button, team switch, tower role, kick */
(function(){ const seg=$('netMode'); if(seg&&!seg.querySelector('[data-m="base"]')&&document.createElement){ const b=document.createElement('button'); b.type='button'; b.dataset.m='base'; b.setAttribute('aria-pressed','false'); b.textContent='Üs ele geçirme'; seg.appendChild(b); }
  const row=$('netAc'); if(row&&row.parentNode&&!$('netRole')&&document.createElement){ const s=document.createElement('select'); s.id='netRole'; s.className='inp'; s.innerHTML='<option value="pilot">Rol: Pilot</option><option value="atc">Rol: Kule görevlisi</option>'; row.parentNode.insertBefore(s,row.nextSibling);
    s.addEventListener('change',function(){ netPickRole(s.value); }); } })();
function netPickRole(role){ if(NET.host){ const r=NET.roster.find(function(x){ return x.id===NET.myId; }); if(r){ r.role=role==='atc'?'atc':'pilot'; } netRoster(); } else netSend(NET.hconn,{t:'role',role:role}); }
netAutoTeam=HOOK.wrap('netAutoTeam','ag/karma-cok-oyunculu#_nbAuto',function(_nbAuto){ return function(){ if(NET.mode==='base'){ const b=NET.roster.filter(function(r){ return r.team==='blue'; }).length, r=NET.roster.length-b; return b<=r?'blue':'red'; } return _nbAuto(); }; },netAutoTeam);
netRenderLobby=HOOK.wrap('netRenderLobby','ag/karma-cok-oyunculu#_nbLobby',function(_nbLobby){ return function(){ _nbLobby(); if(!$('netList')) return;
  if(NET.mode==='base'){ $('btnNetTeam').classList.remove('hidden'); $('netList').innerHTML=NET.roster.map(function(r){ return '<li><span class="tm '+r.team+'">'+teamTag(r.team)+'</span><b>'+String(r.name).replace(/[<>&]/g,'')+(r.id===NET.myId?' (sen)':'')+'</b><small>'+(r.role==='atc'?'Kule görevlisi':(AIRCRAFT[r.ac]?AIRCRAFT[r.ac].short:''))+'</small></li>'; }).join('')+$('netList').innerHTML.split('</li>').filter(function(x){ return /class="empty"/.test(x); }).map(function(x){ return x+'</li>'; }).join(''); }
  Array.prototype.forEach.call(document.querySelectorAll('#netList li'),function(li,i){ const r=NET.roster[i]; if(!r) return;
    if(r.role==='atc'){ const sm=li.querySelector('small'); if(sm) sm.textContent='Kule görevlisi'; }
    if(NET.host&&r.human&&r.id!==NET.myId&&!li.querySelector('.kick')&&document.createElement){ const b=document.createElement('button'); b.type='button'; b.className='btn sm kick'; b.textContent='Çıkar'; b.dataset.kick=r.id; li.appendChild(b); } });
  const rs=$('netRole'), me=NET.roster.find(function(r){ return r.id===NET.myId; }); if(rs&&me) rs.value=me.role==='atc'?'atc':'pilot'; }; },netRenderLobby);
(function(){ const L=$('netList'); if(L) L.addEventListener('click',function(e){ const b=e.target.closest('[data-kick]'); if(b) netKick(b.dataset.kick); }); })();
function netKick(id){ if(!NET.host) return; const c=NET.conns[id], r=NET.roster.find(function(x){ return x.id===id; }); if(!c) return;
  netSend(c,{t:'deny',why:'Ev sahibi seni odadan çıkardı'}); setTimeout(function(){ try{ c.close(); }catch(e){} },300); netDrop(c); toast((r?r.name:'Oyuncu')+' odadan çıkarıldı','#ffc24a'); if(typeof admLog==='function') admLog('kick','net',{name:r&&r.name}); }
/* base mode reuses the team match setup, then switches the mode back */
netStartMatch=HOOK.wrap('netStartMatch','ag/karma-cok-oyunculu#_nbStart',function(_nbStart){ return function(){ if(!NET.host) return; const base=NET.mode==='base'; if(base){ NET.mode='team'; const H=NET.roster.filter(function(r){ return r.role!=='atc'; }); if(H.length>1&&H.every(function(r){ return r.team===H[0].team; })) H.forEach(function(r,i){ r.team=i%2?'red':'blue'; }); } let nb0=null; if(base){ nb0=netBroadcast; netBroadcast=function(m,ex){ if(m&&m.t==='start'){ m.mode='base'; m.dur=900; } return nb0(m,ex); }; }
  try{ _nbStart(); } finally{ if(nb0) netBroadcast=nb0; } if(base&&NET.mode!=='base'){ NET.mode='base'; netBroadcast({t:'mode',mode:'base'}); } }; },netStartMatch);
function nbReset(){ NB.zones.forEach(function(z){ z.o=null; z.p=0; }); NB.sc={blue:0,red:0}; NB.tick=0; nbMarks(); }
netBeginMatch=HOOK.wrap('netBeginMatch','ag/karma-cok-oyunculu#_nbBegin',function(_nbBegin){ return function(msg){ _nbBegin(msg); if(NET.mode==='base') nbReset(); const me=msg.roster.find(function(r){ return r.id===NET.myId; }); if(me&&me.role==='atc') atcStart(); else atcStop(); }; },netBeginMatch);
/* ---- my state: aircraft or walk-mode vehicle */
const nbQ=new THREE.Quaternion();
function nbWalkState(){ let m='foot', k='', x=WALK.pos.x, y=WALK.pos.y-1.7, z=WALK.pos.z, h=WALK.yaw, v=0;
  if(WALK.mode==='car'&&WALK.car){ const c=WALK.car; m='car'; k=c.K.id; x=c.x; z=c.z; y=c.y==null?groundH(x,z):c.y; h=c.h; v=Math.abs(c.v||0); }
  else if(WALK.mode==='heli'&&HELI.cur){ const H=HELI.cur; m='heli'; k=H.id; x=H.x; y=H.y; z=H.z; h=H.h; v=Math.hypot(H.vx,H.vz); }
  else if(WALK.mode==='boat'&&BOAT.cur){ const b=BOAT.cur; m='boat'; k=b.id; x=b.x; y=0; z=b.z; h=b.h; v=Math.abs(b.v||0); }
  nbQ.setFromAxisAngle(UP,h); return {t:'s',id:NET.myId,p:[Math.round(x*10)/10,Math.round(y*10)/10,Math.round(z*10)/10],q:[nbQ.x,nbQ.y,nbQ.z,nbQ.w].map(function(n){ return Math.round(n*1e4)/1e4; }),v:Math.round(v*10)/10,hp:100,al:1,f:0,m:m,k:k,h:Math.round(h*100)/100}; }
myState=HOOK.wrap('myState','ag/karma-cok-oyunculu#_nbMy',function(_nbMy){ return function(){ if(NB.atc) return {t:'s',id:NET.myId,p:[0,-500,0],q:[0,0,0,1],v:0,hp:100,al:0,f:0,m:'atc'};
  const walk=state==='walk'||((state==='paused'||state==='map')&&(WALK.from==='walk'||MAPV.from==='walk')); return walk?nbWalkState():Object.assign(_nbMy(),{m:'air'}); }; },myState);
netApplyState=HOOK.wrap('netApplyState','ag/karma-cok-oyunculu#_nbApply',function(_nbApply){ return function(st){ _nbApply(st); const a=actById(st.id); if(!a) return; a.m=st.m||'air'; a.mk=st.k||''; a.nh=st.h||0; if(a.m!=='air'&&a.remote&&a.nT>=0){ a.np.fromArray(st.p); } }; },netApplyState);
/* walking in a match must not clear the other players */
aiSetup=HOOK.wrap('aiSetup','ag/karma-cok-oyunculu#_nbAiSetup',function(_nbAiSetup){ return function(){ if(NET.on&&NET.started&&ACT.length) return; return _nbAiSetup(); }; },aiSetup);
/* ---- remote players outside aircraft: proxies */
function nbProxy(a){ const key=a.m+':'+a.mk; if(a.px&&a.pxKey===key) return a.px; if(a.px) scene.remove(a.px); let g=null;
  try{ if(a.m==='foot'){ g=new THREE.Mesh(alPersonGeo(a.team==='red'?0xb3121c:0x2f6aa5,0x2a2f36,null),AL_MAT); }
    else if(a.m==='car'){ g=carBuild(a.mk||'suv').g; } else if(a.m==='heli'){ g=heliBuild(a.mk||'t625').g; } else if(a.m==='boat'){ const K=BOAT_KINDS[a.mk]||BOAT_KINDS.patrol; g=bakeGroup(K.build().group); } }catch(e){ g=new THREE.Mesh(new THREE.BoxGeometry(2,2,4),new THREE.MeshLambertMaterial({color:0x888888})); }
  g.userData.noCull=true; scene.add(g); a.px=g; a.pxKey=key; return g; }
function netMixStep(dt){ if(!NET.on||!NET.started) return;
  ACT.forEach(function(a){ if(!a.remote) return; const ground=a.m&&a.m!=='air'&&a.m!=='atc';
    if(ground&&a.alive){ a.g.visible=false; const g=nbProxy(a); g.visible=true; const k=1-Math.exp(-9*dt); a.pos.lerp(a.np,k); g.position.copy(a.pos); g.rotation.set(0,a.nh||0,0); if(a.m==='heli'&&g.children) g.traverse(function(o){ if(o.name==='rotor') o.rotation.y+=dt*30; }); }
    else if(a.px){ a.px.visible=false; if(a.m==='atc') a.g.visible=false; } });
  if(NET.mode==='base') nbStep(dt); nbMarkStep(dt); }
/* ---- base capture */
function nbPresence(){ const L=[], add=function(team,x,y,z,m){ L.push({team:team,x:x,y:y,z:z,m:m}); };
  const me=nbMeNow(); if(me) add(myTeam(),me.x,me.y,me.z,me.m);
  ACT.forEach(function(a){ if(!a.alive||a.m==='atc') return; const r=NET.roster.find(function(x){ return x.id===a.id; }); add(r?r.team:a.team,a.pos.x,a.pos.y,a.pos.z,a.m||'air'); }); return L; }
function nbMeNow(){ if(NB.atc) return null; const s=myState(); if(!s.al) return null; return {x:s.p[0],y:s.p[1],z:s.p[2],m:s.m}; }
function nbStep(dt){
  if(!NET.host||NET.ended) return; const P=nbPresence();
  NB_ZONES.forEach(function(Z,i){ const z=NB.zones[i]; let b=0,r=0;
    P.forEach(function(p){ if(Math.hypot(p.x-Z.x,p.z-Z.z)>Z.r) return; if(p.m==='air'&&p.y-Math.max(0,terrainH(p.x,p.z))>450) return; if(p.team==='blue') b++; else if(p.team==='red') r++; });
    const dir=b>0&&r===0?1:r>0&&b===0?-1:0; if(dir){ z.p=clamp(z.p+dir*dt/10,-1,1); if(z.p>=1&&z.o!=='blue'){ z.o='blue'; netBroadcast({t:'chat',from:'H',name:'Kule',text:Z.n+' MAVİ takımın eline geçti!',sys:1}); nbChatIn({name:'Kule',text:Z.n+' MAVİ takımın eline geçti!',sys:1}); } if(z.p<=-1&&z.o!=='red'){ z.o='red'; netBroadcast({t:'chat',from:'H',name:'Kule',text:Z.n+' KIRMIZI takımın eline geçti!',sys:1}); nbChatIn({name:'Kule',text:Z.n+' KIRMIZI takımın eline geçti!',sys:1}); } } });
  NB.tick+=dt; if(NB.tick>=5){ NB.tick-=5; NB.zones.forEach(function(z){ if(z.o) NB.sc[z.o]++; }); if(NB.sc.blue>=100||NB.sc.red>=100) netFinish(netLeaderText()); }
  NB.sendT-=dt; if(NB.sendT<=0){ NB.sendT=0.5; netBroadcast({t:'zones',z:NB.zones,sc:NB.sc}); } }
netLeaderText=HOOK.wrap('netLeaderText','ag/karma-cok-oyunculu#_nbLeader',function(_nbLeader){ return function(){ if(NET.mode!=='base') return _nbLeader(); const s=NB.sc; return s.blue===s.red?'Berabere '+s.blue+'–'+s.red:((s.blue>s.red?'Mavi':'Kırmızı')+' takım üsleri tuttu: '+Math.max(s.blue,s.red)+'–'+Math.min(s.blue,s.red)); }; },netLeaderText);
function nbMarks(){ NB.zm=NB.zm||[]; NB.zm.forEach(function(g){ scene.remove(g); }); NB.zm=[]; if(NET.mode!=='base') return;
  NB_ZONES.forEach(function(Z){ const g=new THREE.Group(), h=Math.max(0,terrainH(Z.x,Z.z)); const rg=new THREE.TorusGeometry(Z.r,8,6,64); rg.rotateX(Math.PI/2); const mt=new THREE.MeshBasicMaterial({color:0xdddddd,transparent:true,opacity:0.7});
    const m1=new THREE.Mesh(rg,mt); m1.position.y=h+12; g.add(m1); const cm=new THREE.MeshBasicMaterial({color:0xdddddd,transparent:true,opacity:0.08,side:THREE.DoubleSide,depthWrite:false}); const c=new THREE.Mesh(new THREE.CylinderGeometry(Z.r,Z.r,500,48,1,true),cm); c.position.y=h+250; g.add(c);
    g.position.set(Z.x,0,Z.z); g.userData={mt:mt,cm:cm,noCull:true}; scene.add(g); NB.zm.push(g); }); }
function nbMarkStep(){ if(!NB.zm) return; NB.zm.forEach(function(g,i){ const z=NB.zones[i], col=z.o==='blue'?0x3a8cff:z.o==='red'?0xff3a2a:0xdddddd; g.userData.mt.color.setHex(col); g.userData.cm.color.setHex(col); g.visible=NET.mode==='base'&&NET.started; }); }
/* ---- tower controller */
function atcStart(){ NB.atc=true; state='atc'; planeGroup.visible=false; const el=$('atcUI'); if(el){ el.classList.remove('hidden'); atcRender(); } toast('Kule görevlisisin: oyuncuları haritada izle, telsizle yönlendir','#7dffb0'); }
function atcStop(){ NB.atc=false; const el=$('atcUI'); if(el) el.classList.add('hidden'); }
const ATC_Q=['{n}, kalkış serbest.','{n}, iniş serbest, pist 36.','{n}, beklemede kal.','{n}, pist dolu, pas geç.','{n}, rüzgâr {w}.','{n}, düşman uçakları bölgende, dikkat!','{n}, üsse dön.','{n}, işaretlediğim noktaya git.'];
NB.atcSel='all';
function atcRender(){ const L=$('atcPl'); if(!L) return; const P=NET.roster.filter(function(r){ return r.id!==NET.myId&&r.team!=='red'||NET.mode==='ffa'; });
  L.innerHTML='<button type="button" data-p="all" class="'+(NB.atcSel==='all'?'on':'')+'">Herkes</button>'+NET.roster.filter(function(r){ return r.id!==NET.myId; }).map(function(r){ return '<button type="button" data-p="'+r.id+'" class="'+(NB.atcSel===r.id?'on':'')+'"><i class="'+r.team+'"></i>'+String(r.name).replace(/[<>&]/g,'')+'</button>'; }).join('');
  $('atcQ').innerHTML=ATC_Q.map(function(q,i){ return '<button type="button" data-q="'+i+'">'+q.replace('{n}, ','').replace('{w}','…')+'</button>'; }).join(''); atcDraw(); }
function atcSay(text){ const msg={t:'radio',from:NET.myId,name:'Kule',text:text}; if(NET.host) netBroadcast(msg); else netSend(NET.hconn,msg); radioSay({w:'kule',t:text},null,{force:true}); }
function atcDraw(){ const cv=$('atcMap'); if(!cv||!cv.getContext) return; const r=cv.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1), W=Math.max(10,r.width||300), H=Math.max(10,r.height||300); if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){ cv.width=Math.round(W*d); cv.height=Math.round(H*d); }
  const x=cv.getContext('2d'); if(!x||!x.setTransform) return; x.setTransform(d,0,0,d,0,0); const keep=[MAPV.cx,MAPV.cz,MAPV.scale]; MAPV.cx=NB.acx||0; MAPV.cz=NB.acz||0; MAPV.scale=NB.asc||Math.min(W,H)/26000;
  try{ drawMap(x,W,H,false); }catch(e){}
  if(NET.mode==='base') NB_ZONES.forEach(function(Z,i){ const p=mapToScreen(Z.x,Z.z,W,H), z=NB.zones[i]; x.strokeStyle=z.o==='blue'?'#3a8cff':z.o==='red'?'#ff3a2a':'#dddddd'; x.lineWidth=3; x.beginPath(); x.arc(p[0],p[1],Z.r*MAPV.scale,0,6.3); x.stroke(); });
  ACT.forEach(function(a){ if(!a.alive||a.m==='atc') return; const p=mapToScreen(a.pos.x,a.pos.z,W,H), r=NET.roster.find(function(q){ return q.id===a.id; }); x.fillStyle=(r&&r.team==='red')?'#ff5a4a':'#5ab0ff'; x.beginPath(); x.arc(p[0],p[1],5,0,6.3); x.fill();
    x.font='700 11px "Chakra Petch",sans-serif'; x.fillStyle='#fff'; x.fillText((r?r.name:a.name)+' '+({air:'✈',foot:'🚶',car:'🚙',heli:'🚁',boat:'⛴'}[a.m||'air']||'')+' '+Math.round(a.pos.y)+'m',p[0]+8,p[1]+4); });
  NB.marks.forEach(function(m){ const p=mapToScreen(m.x,m.z,W,H); x.strokeStyle='#ffb25a'; x.lineWidth=2; x.beginPath(); x.arc(p[0],p[1],9,0,6.3); x.moveTo(p[0]-13,p[1]); x.lineTo(p[0]+13,p[1]); x.moveTo(p[0],p[1]-13); x.lineTo(p[0],p[1]+13); x.stroke(); });
  MAPV.cx=keep[0]; MAPV.cz=keep[1]; MAPV.scale=keep[2]; }
(function(){ const ui=$('atcUI'); if(!ui) return;
  ui.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.p){ NB.atcSel=b.dataset.p; atcRender(); return; }
    if(b.dataset.q!=null){ const r=NET.roster.find(function(x){ return x.id===NB.atcSel; }); atcSay(ATC_Q[+b.dataset.q].replace('{n}',r?r.name:'Tüm birlikler').replace('{w}',windTxt())); return; }
    if(b.id==='atcSend'){ const t=($('atcTxt').value||'').trim().slice(0,100); if(t){ const r=NET.roster.find(function(x){ return x.id===NB.atcSel; }); atcSay((r?r.name+', ':'')+t); $('atcTxt').value=''; } return; }
    if(b.id==='atcLeave'){ atcStop(); netLeave(); } });
  const cv=$('atcMap'); if(cv){ cv.addEventListener('click',function(e){ const r=cv.getBoundingClientRect(), keep=[MAPV.cx,MAPV.cz,MAPV.scale]; MAPV.cx=NB.acx||0; MAPV.cz=NB.acz||0; MAPV.scale=NB.asc||Math.min(r.width,r.height)/26000; const w=mapToWorld(e.clientX-r.left,e.clientY-r.top,r.width,r.height); MAPV.cx=keep[0]; MAPV.cz=keep[1]; MAPV.scale=keep[2]; nbMarkSend(w[0],w[1]); });
    cv.addEventListener('wheel',function(e){ e.preventDefault(); const r=cv.getBoundingClientRect(); NB.asc=clamp((NB.asc||Math.min(r.width,r.height)/26000)*Math.exp(-clamp(e.deltaY,-120,120)*0.0015),0.004,0.2); atcDraw(); },{passive:false}); } })();
function nbMarkSend(x,z){ const m={t:'mark',x:Math.round(x),z:Math.round(z),by:NET.myId}; if(NET.host) netBroadcast(m); else netSend(NET.hconn,m); nbMarkIn(m); }
function nbMarkIn(m){ NB.marks.push({x:m.x,z:m.z,t:60,b:callBeacon(m.x,m.z)}); if(NB.marks.length>4){ const o=NB.marks.shift(); if(o.b) scene.remove(o.b); } if(m.by!==NET.myId) toast('📍 Kule haritaya işaret koydu ('+Math.round(Math.hypot(m.x-S.pos.x,m.z-S.pos.z)/100)/10+' km)','#ffb25a'); }
function nbMarkUpd(dt){ for(let i=NB.marks.length-1;i>=0;i--){ const m=NB.marks[i]; m.t-=dt; if(m.t<=0){ if(m.b) scene.remove(m.b); NB.marks.splice(i,1); } } }
drawMap=HOOK.wrap('drawMap','ag/karma-cok-oyunculu#_nbMap',function(_nbMap){ return function(x,W,H,mini){ _nbMap(x,W,H,mini); if(!NET.on||!NET.started) return; x.save();
  if(NET.mode==='base') NB_ZONES.forEach(function(Z,i){ const p=mapToScreen(Z.x,Z.z,W,H), z=NB.zones[i]; x.strokeStyle=z.o==='blue'?'#3a8cff':z.o==='red'?'#ff3a2a':'#dddddd'; x.lineWidth=mini?1.5:3; x.beginPath(); x.arc(p[0],p[1],Math.max(4,Z.r*MAPV.scale),0,6.3); x.stroke(); });
  NB.marks.forEach(function(m){ const p=mapToScreen(m.x,m.z,W,H); x.strokeStyle='#ffb25a'; x.lineWidth=2; x.beginPath(); x.arc(p[0],p[1],mini?4:8,0,6.3); x.stroke(); }); x.restore(); }; },drawMap);
/* ---- chat */
function nbChatIn(m){ NB.chat.push({n:String(m.name||'?').slice(0,20),t:String(m.text||'').slice(0,120),sys:!!m.sys,team:m.team||null,at:performance.now()/1000}); if(NB.chat.length>30) NB.chat.shift(); nbChatRender(); if(!m.sys&&typeof sndPlay==='function') try{ sndPlay('ui_notify',{vol:0.5}); }catch(e){} }
function nbChatRender(){ const el=$('chatLog'); if(!el) return; const now=performance.now()/1000, open=NB.chatOpen; el.innerHTML=NB.chat.filter(function(c){ return open||now-c.at<14; }).slice(-8).map(function(c){ return '<li class="'+(c.sys?'sys':'')+'"><b>'+c.n.replace(/[<>&]/g,'')+':</b> '+c.t.replace(/[<>&]/g,'')+'</li>'; }).join(''); }
function nbChatOpen(){ if(!NET.on) return; NB.chatOpen=true; $('chatBox').classList.add('open'); const i=$('chatIn'); i.classList.remove('hidden'); try{ i.focus(); }catch(e){} nbChatRender(); }
function nbChatClose(){ NB.chatOpen=false; $('chatBox').classList.remove('open'); const i=$('chatIn'); i.value=''; i.classList.add('hidden'); try{ i.blur(); $('gl').focus(); }catch(e){} nbChatRender(); }
function nbChatSend(text){ text=String(text||'').trim().slice(0,120); if(!text) return;
  if(NET.host&&/^\/at\s+/i.test(text)){ const q=text.replace(/^\/at\s+/i,'').toLocaleLowerCase('tr-TR'), r=NET.roster.find(function(x){ return x.human&&x.id!==NET.myId&&String(x.name).toLocaleLowerCase('tr-TR').indexOf(q)>=0; }); if(r) netKick(r.id); else toast('Oyuncu bulunamadı','#ffc24a'); return; }
  const me=NET.roster.find(function(r){ return r.id===NET.myId; }), m={t:'chat',from:NET.myId,name:(me?me.name:'Pilot'),text:text,team:me?me.team:null};
  if(NET.host) netBroadcast(m); else netSend(NET.hconn,m); nbChatIn(m); }
(function(){ const i=$('chatIn'); if(!i) return;
  i.addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Enter'){ nbChatSend(i.value); nbChatClose(); e.preventDefault(); } else if(e.key==='Escape'){ nbChatClose(); e.preventDefault(); } });
  INPUT.on('keydown',function(e){ if(NB.chatOpen&&e.target===i) return; if(!NET.on||e.repeat||NB.chatOpen) return; if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if(isKey(e,'gen','chat')){ e.preventDefault(); e.stopImmediatePropagation(); for(const k in keys) keys[k]=false; nbChatOpen(); } },true,'ag/karma-cok-oyunculu','çok oyunculu');
  const tb=$('tChat'); if(tb) tb.addEventListener('pointerdown',function(e){ e.preventDefault(); nbChatOpen(); }); })();
setInterval(function(){ if(NB.chat.length&&!NB.chatOpen) nbChatRender(); },2000);
/* ---- messages */
netHandle=HOOK.wrap('netHandle','ag/karma-cok-oyunculu#_nbHandle',function(_nbHandle){ return function(msg,from){
  switch(msg.t){
    case 'chat': if(NET.host&&from&&from!==NET.myId&&from!=='H') netBroadcast(msg,from); if(msg.from!==NET.myId) nbChatIn(msg); return;
    case 'welcome': { const rs=$('netRole'); if(rs&&rs.value==='atc') setTimeout(function(){ netPickRole('atc'); },0); } break;
    case 'zones': NB.zones=msg.z; NB.sc=msg.sc; return;
    case 'mode': NET.mode=msg.mode; if(msg.mode==='base') nbReset(); return;
    case 'mark': if(NET.host&&from&&from!==NET.myId) netBroadcast(msg,from); if(msg.by!==NET.myId) nbMarkIn(msg); return;
    case 'role': if(NET.host){ const r=NET.roster.find(function(x){ return x.id===from; }); if(r){ r.role=msg.role==='atc'?'atc':'pilot'; netRoster(); } } return;
    case 'pick': if(NET.host&&NET.mode==='base'&&msg.team){ const r=NET.roster.find(function(x){ return x.id===from; }); if(r){ r.team=msg.team; if(msg.ac&&AIRCRAFT[msg.ac]) r.ac=msg.ac; netRoster(); } return; } break;
  }
  return _nbHandle(msg,from); }; },netHandle);
netPick=HOOK.wrap('netPick','ag/karma-cok-oyunculu#_nbPick',function(_nbPick){ return function(ac,team){ if(NET.mode==='base'&&NET.host&&team){ const r=NET.roster.find(function(x){ return x.id===NET.myId; }); if(r) r.team=team; netRoster(); return; } return _nbPick(ac,team); }; },netPick);
/* pause menu: leaving the aircraft is allowed in a match now */
pauseGame=HOOK.wrap('pauseGame','ag/karma-cok-oyunculu#_nbPause',function(_nbPause){ return function(){ _nbPause(); if(NET.on&&NET.started) $('btnWalk').classList.toggle('hidden',WALK.from==='walk'); }; },pauseGame);
/* ---- HUD: score line in base mode, tower overlay keeps its own screen */
drawHUD=HOOK.wrap('drawHUD','ag/karma-cok-oyunculu#_nbHUD',function(_nbHUD){ return function(){ if(state==='atc'){ hx.setTransform(DPR,0,0,DPR,0,0); hx.clearRect(0,0,HW,HH); atcDraw(); return; } _nbHUD(); nbScoreHUD(); }; },drawHUD);
function nbScoreHUD(){ if(!NET.on||!NET.started||NET.mode!=='base'||state!=='walk') return; const s=clamp(Math.min(HW,HH)/760,0.7,1.5); hx.save(); hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,.7)'; hx.shadowBlur=4;
  const y=Math.round((state==='walk'?(WALK.tvis?120:84):(TOUCH.vis?124:114))*s); hx.font='700 '+Math.round(14*s)+'px "Chakra Petch",system-ui,sans-serif';
  hx.fillStyle='#5ab0ff'; hx.fillText('MAVİ '+NB.sc.blue,HW/2-70*s,y); hx.fillStyle='#ff6a5a'; hx.fillText(NB.sc.red+' KIRMIZI',HW/2+70*s,y);
  NB_ZONES.forEach(function(Z,i){ const z=NB.zones[i], x=HW/2+(i-1)*34*s; hx.fillStyle=z.o==='blue'?'#3a8cff':z.o==='red'?'#ff3a2a':'rgba(220,220,220,.8)'; hx.beginPath(); hx.arc(x,y+22*s,10*s,0,6.3); hx.fill();
    if(Math.abs(z.p)<1&&z.p!==0){ hx.strokeStyle=z.p>0?'#3a8cff':'#ff3a2a'; hx.lineWidth=3*s; hx.beginPath(); hx.arc(x,y+22*s,13*s,-Math.PI/2,-Math.PI/2+Math.abs(z.p)*6.283); hx.stroke(); }
    hx.fillStyle='#08121c'; hx.font='700 '+Math.round(10*s)+'px "Chakra Petch",sans-serif'; hx.fillText(['H','D','K'][i],x,y+22*s); }); hx.restore(); }
drawWalkHUD=HOOK.wrap('drawWalkHUD','ag/karma-cok-oyunculu#_nbWalkHUD',function(_nbWalkHUD){ return function(){ _nbWalkHUD(); }; },drawWalkHUD);
netEnd=HOOK.wrap('netEnd','ag/karma-cok-oyunculu#_nbEnd',function(_nbEnd){ return function(text){ atcStop(); return _nbEnd(text); }; },netEnd);
netLeave=HOOK.wrap('netLeave','ag/karma-cok-oyunculu#_nbLeave',function(_nbLeave){ return function(s){ atcStop(); NB.chat=[]; nbChatRender(); NB.marks.forEach(function(m){ if(m.b) scene.remove(m.b); }); NB.marks=[]; if(NB.zm) NB.zm.forEach(function(g){ scene.remove(g); }); ACT.forEach(function(a){ if(a.px){ scene.remove(a.px); a.px=null; } }); return _nbLeave(s); }; },netLeave);
function netMix(dt){ netMixStep(dt); nbMarkUpd(dt); }
(function(){ const w=$('wChat'); if(w) w.addEventListener('pointerdown',function(e){ e.preventDefault(); nbChatOpen(); }); })();
setInterval(function(){ const on=NET.on&&NET.started; ['tChat','wChat'].forEach(function(id){ const b=$(id); if(b) b.classList.toggle('hidden',!on); }); },1000);
