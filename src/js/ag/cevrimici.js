/* ------------------------------------------------------------------ online play: PeerJS data channels, host relays, up to 4 players (from yapay-zeka-ag, V2.25) */
// ---------- online (PeerJS WebRTC data channels, host relays; up to 4 players)
function v3a(v){ return [Math.round(v.x*10)/10,Math.round(v.y*10)/10,Math.round(v.z*10)/10]; }
function netCode(){ const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<5;i++) s+=A[Math.floor(Math.random()*A.length)]; return s; }
function netStatus(t,err){ NET.status=t; const el=$('netStatus'); if(el){ el.textContent=t; el.classList.toggle('err',!!err); } }
function netLib(cb){
  if(window.Peer){ cb(); return; }
  netStatus('Bağlantı modülü yükleniyor…');
  const urls=['https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js','https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js','https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js'];
  (function next(i){
    if(i>=urls.length){ netStatus('Bağlantı modülü yüklenemedi — internet bağlantını kontrol et',true); return; }
    const s=document.createElement('script'); s.src=urls[i];
    s.onload=function(){ if(window.Peer) cb(); else next(i+1); };
    s.onerror=function(){ next(i+1); };
    document.head.appendChild(s);
  })(0);
}
function netSend(conn,msg){ try{ if(conn&&conn.open) conn.send(msg); }catch(e){} }
function netBroadcast(msg,except){ Object.keys(NET.conns).forEach(function(id){ if(id!==except) netSend(NET.conns[id],msg); }); }
function netSendTo(id,msg){
  if(!NET.on) return;
  if(NET.host){ if(id==='H'||id===NET.myId) netHandle(msg,NET.myId); else netSend(NET.conns[id],msg); }
  else netSend(NET.hconn,msg);
}
function netHost(){
  NET.name=netNameVal(); NET.mode=netModeSel(); NET.bots=$('netBots').checked;
  netLib(function(){
    netReset(); NET.on=true; NET.host=true; NET.myId='H'; NET.room=netCode(); netStatus('Oda açılıyor…');
    const peer=new window.Peer(NET_PREFIX+NET.room,{debug:0}); NET.peer=peer;
    peer.on('open',function(){ NET.roster=[{id:'H',name:NET.name,ac:selectedId,team:'blue',human:true}]; netStatus('Oda hazır. Kodu arkadaşlarına gönder.'); netShowLobby(); });
    peer.on('error',function(e){ if(e&&e.type==='unavailable-id'){ netStatus('Kod kullanımda, yenisi deneniyor…'); peer.destroy(); NET.on=false; setTimeout(netHost,300); } else netStatus('Bağlantı hatası: '+(e&&e.type||e),true); });
    peer.on('connection',function(conn){
      conn.on('data',function(msg){ netHostData(conn,msg); });
      conn.on('close',function(){ netDrop(conn); });
      conn.on('error',function(){ netDrop(conn); });
    });
  });
}
function netJoin(){
  const code=($('netCode').value||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,''); if(code.length<4){ netStatus('Geçerli bir oda kodu yaz',true); return; }
  NET.name=netNameVal();
  netLib(function(){
    netReset(); NET.on=true; NET.host=false; NET.room=code; netStatus('Odaya bağlanılıyor…');
    const peer=new window.Peer(undefined,{debug:0}); NET.peer=peer;
    peer.on('open',function(){
      const conn=peer.connect(NET_PREFIX+code,{reliable:true}); NET.hconn=conn;
      conn.on('open',function(){ netSend(conn,{t:'hello',name:NET.name,ac:selectedId,ver:GAME_VERSION}); });
      conn.on('data',function(msg){ netHandle(msg,'H'); });
      conn.on('close',function(){ if(NET.on){ netLeave(); toast('Oda kapandı','#ffc24a'); netStatus('Oda kapandı',true); } });
    });
    peer.on('error',function(e){ netStatus(e&&e.type==='peer-unavailable'?'Oda bulunamadı — kodu kontrol et':('Bağlantı hatası: '+(e&&e.type||e)),true); NET.on=false; });
  });
}
function netHostData(conn,msg){
  if(msg.t==='hello'){
    if(msg.ver!==GAME_VERSION){ netSend(conn,{t:'deny',why:'Sürüm uyuşmuyor (oda '+GAME_VERSION+', sen '+msg.ver+'). Sayfayı yenile.'}); return; }
    if(NET.started){ netSend(conn,{t:'deny',why:'Maç başlamış, bitmesini bekle'}); return; }
    if(NET.roster.filter(function(r){ return r.human; }).length>=NET_MAX){ netSend(conn,{t:'deny',why:'Oda dolu ('+NET_MAX+' oyuncu)'}); return; }
    const id='P'+(++NET.seq); conn.pid=id; NET.conns[id]=conn;
    NET.roster.push({id:id,name:String(msg.name||'Pilot').slice(0,16),ac:AIRCRAFT[msg.ac]?msg.ac:'kaan',team:netAutoTeam(),human:true});
    netSend(conn,{t:'welcome',id:id,mode:NET.mode,bots:NET.bots,room:NET.room}); netRoster(); return;
  }
  if(!conn.pid) return;
  netHandle(msg,conn.pid);
}
function netAutoTeam(){ if(NET.mode==='team'){ const b=NET.roster.filter(function(r){ return r.team==='blue'; }).length, r=NET.roster.length-b; return b<=r?'blue':'red'; } return 'blue'; }
function netRoster(){ netBroadcast({t:'roster',roster:NET.roster,mode:NET.mode,bots:NET.bots}); netRenderLobby(); }
function netDrop(conn){
  const id=conn.pid; if(!id||!NET.conns[id]) return; delete NET.conns[id];
  const r=NET.roster.find(function(x){ return x.id===id; }); NET.roster=NET.roster.filter(function(x){ return x.id!==id; });
  const a=actById(id); if(a) removeActor(a);
  if(r) toast(r.name+' oyundan ayrıldı','#ffc24a'); netRoster();
}
// messages (host gets them from clients with "from"; clients get them from the host)
function netHandle(msg,from){
  switch(msg.t){
    case 'welcome': NET.myId=msg.id; NET.mode=msg.mode; NET.bots=msg.bots; netStatus('Odaya katıldın. Ev sahibi başlatınca maç başlayacak.'); netShowLobby(); break;
    case 'deny': netStatus(msg.why,true); netLeave(true); break;
    case 'roster': NET.roster=msg.roster; NET.mode=msg.mode; NET.bots=msg.bots; netRenderLobby(); break;
    case 'pick': if(NET.host){ const r=NET.roster.find(function(x){ return x.id===from; }); if(r){ if(msg.ac&&AIRCRAFT[msg.ac]) r.ac=msg.ac; if(msg.team&&NET.mode==='team') r.team=msg.team; netRoster(); } } break;
    case 'start': netBeginMatch(msg); break;
    case 's': if(NET.host){ msg.id=from; NET.last[from]=msg; netApplyState(msg); } break;
    case 'S': msg.list.forEach(function(st){ if(st.id!==NET.myId) netApplyState(st); }); NET.timeLeft=msg.tl; NET.wave=msg.wv||0; break;
    case 'hit':
      if(msg.to===NET.myId){ hitPlayer(msg.dmg,msg.by); }
      else if(NET.host){ const a=actById(msg.to); if(a&&!a.remote) damageActor(a,msg.dmg,msg.by); else netSend(NET.conns[msg.to],msg); }
      break;
    case 'msl':
      if(msg.to===NET.myId){ aV1.fromArray(msg.p); aV2.fromArray(msg.v); spawnMissile(aV1,aV2,null,false,msg.by); const k=actById(msg.by); toast((k?k.name:'Rakip')+' füze attı!','#ff5a5a'); }
      else if(NET.host) netSend(NET.conns[msg.to],msg);
      break;
    case 'dead': if(NET.host) netKill(msg.id,msg.by); break;
    case 'score': NET.score=msg.score; break;
    case 'kill': { const v=msg.v===NET.myId?'Sen':((actById(msg.v)||{}).name||'?'), k=msg.by===NET.myId?'Sen':((actById(msg.by)||{}).name||'');
      if(msg.v!==NET.myId&&msg.by!==NET.myId) toast((k?k+' → ':'')+v+' düştü','#b8ecff'); else if(msg.v===NET.myId) toast((k?k+' seni':'Seni')+' düşürdü','#ff8a8a'); }
      break;
    case 'end': netEnd(msg.text); break;
    case 'lobby': netBackToLobby(true); break;
    case 'spawnRed': netSpawnRed(msg.r); break;
    case 'radio': if(NET.host&&from!==NET.myId) netBroadcast(msg,from); if(msg.from!==NET.myId) radioRecv(msg); break;
  }
}
function spawnPoint(sp){
  const ang=sp[0], r=sp[1]||6500, y=sp[2]||1300, jit=(Math.random()-.5)*600;
  const p=new THREE.Vector3(Math.cos(ang)*r+jit,y,Math.sin(ang)*r-jit); p.y=Math.max(p.y,Math.max(0,terrainH(p.x,p.z))+700);
  const d=new THREE.Vector3(-Math.cos(ang),0,-Math.sin(ang)); return {p:p,d:d};
}
function netStartMatch(){
  if(!NET.host) return;
  const humans=NET.roster.filter(function(r){ return r.human; });
  let roster=humans.slice();
  roster=roster.filter(function(r){ return r.human; });
  if(NET.mode==='ffa') roster.forEach(function(r,i){ r.team='t'+i; });
  if(NET.mode==='coop') roster.forEach(function(r){ r.team='blue'; });
  if(NET.mode==='team'){ roster.forEach(function(r){ if(r.team!=='blue'&&r.team!=='red') r.team='blue'; });
    const half=NET_MAX/2; ['blue','red'].forEach(function(tm){ const other=tm==='blue'?'red':'blue'; let L=roster.filter(function(r){ return r.team===tm; }); while(L.length>half){ L[L.length-1].team=other; L=roster.filter(function(r){ return r.team===tm; }); } }); }
  if(NET.bots){
    let n=0; const ac=['hurjet','kaan','kizilelma','anka3'];
    while(roster.length<NET_MAX){ n++; let team='blue';
      if(NET.mode==='team'){ const b=roster.filter(function(r){ return r.team==='blue'; }).length; team=(b<NET_MAX/2)?'blue':'red'; }
      if(NET.mode==='ffa') team='t'+roster.length;
      roster.push({id:'B'+n,name:(NET.mode==='coop'?'Kılıç ':'Bot ')+(n+1),ac:ac[n%ac.length],team:team,human:false}); }
  }
  // spawn points: teams on opposite sides, ffa around a circle
  const N=roster.length;
  roster.forEach(function(r,i){
    if(NET.mode==='team'){ const side=r.team==='blue'?Math.PI:0, idx=roster.filter(function(x,j){ return j<i&&x.team===r.team; }).length; r.spawn=[side+(idx-0.5)*0.12,6500,1300+idx*120]; }
    else if(NET.mode==='coop') r.spawn=[Math.PI/2+(i-(N-1)/2)*0.06,6000,1250+i*60];
    else r.spawn=[i/N*6.283,6500,1300];
  });
  NET.roster=roster; NET.score={}; roster.forEach(function(r){ NET.score[r.id]={k:0,d:0}; });
  const msg={t:'start',mode:NET.mode,roster:roster,dur:NET.mode==='coop'?900:600};
  netBroadcast(msg); netBeginMatch(msg);
}
function netBeginMatch(msg){
  NET.started=true; NET.ended=false; NET.mode=msg.mode; NET.roster=msg.roster; NET.timeLeft=msg.dur; NET.wave=0; NET.waveT=4; NET.last={};
  NET.score={}; msg.roster.forEach(function(r){ NET.score[r.id]={k:0,d:0}; });
  if(missionId!=='net') NET.prevMission=missionId;
  $('netUI').classList.add('hidden'); $('missionEnd').classList.add('hidden');
  aiClear();
  const me=msg.roster.find(function(r){ return r.id===NET.myId; });
  if(me&&me.ac&&AIRCRAFT[me.ac]) selectedId=me.ac;
  missionId='net'; startGame('air');
  msg.roster.forEach(function(r){
    if(r.id===NET.myId) return;
    const a=makeActor({id:r.id,name:r.name,team:r.team,ac:r.ac,ai:!r.human,remote:!(NET.host&&!r.human),human:r.human,msl:2,flares:8,spawn:r.spawn});
    const s=spawnPoint(r.spawn); placeActor(a,s.p,s.d);
  });
  toast(NET_MODES[NET.mode].name+' başladı — '+NET_MODES[NET.mode].desc,'#7dffb0');
}
function netSpawnMe(){
  const me=NET.roster.find(function(r){ return r.id===NET.myId; }); if(!me||!me.spawn) return;
  const s=spawnPoint(me.spawn); S.pos.copy(s.p); S.q.setFromAxisAngle(UPV,Math.atan2(-s.d.x,-s.d.z)); camQ.copy(S.q);
}
function netApplyState(st){
  const a=actById(st.id); if(!a) return;
  if(!a.remote) return;
  const wasAlive=a.alive; a.alive=!!st.al; a.hp=st.hp;
  a.nq.fromArray(st.q); a.nspd=st.v; a.firing=!!st.f;
  if(!wasAlive&&a.alive){ a.np.fromArray(st.p); a.pos.copy(a.np); a.q.copy(a.nq); }
  else a.np.fromArray(st.p);
  if(a.nT<0){ a.pos.copy(a.np); a.q.copy(a.nq); }
  a.nT=T;
  if(wasAlive&&!a.alive){ explode(a.pos,70,9); a.g.visible=false; if(lockTgt===a){ lockTgt=null; lockT=0; } }
}
function myState(){ return {t:'s',id:NET.myId,p:v3a(S.pos),q:[S.q.x,S.q.y,S.q.z,S.q.w].map(function(n){ return Math.round(n*1e4)/1e4; }),v:Math.round(S.speed),hp:Math.round(S.hp),al:(!S.crashed&&state!=='menu')?1:0,f:(T-lastFireT<0.15)?1:0}; }
function actState(a){ return {id:a.id,p:v3a(a.pos),q:[a.q.x,a.q.y,a.q.z,a.q.w].map(function(n){ return Math.round(n*1e4)/1e4; }),v:Math.round(a.speed),hp:Math.round(a.hp),al:a.alive?1:0,f:a.burst>0?1:0}; }
function netStep(dt){
  if(!NET.on||!NET.started) return;
  NET.sendT-=dt; if(NET.sendT>0) return; NET.sendT=1/15;
  if(!NET.host){ netSend(NET.hconn,myState()); return; }
  const list=[myState()];
  ACT.forEach(function(a){ if(!a.remote) list.push(actState(a)); else if(NET.last[a.id]) list.push(NET.last[a.id]); });
  netBroadcast({t:'S',list:list,tl:Math.round(NET.timeLeft),wv:NET.wave});
}
function netHostLogic(dt){
  if(!NET.on||!NET.host||!NET.started||NET.ended) return;
  NET.timeLeft-=dt;
  if(NET.mode==='coop'){
    const reds=ACT.filter(function(a){ return a.team==='red'; });
    if(!reds.some(function(a){ return a.alive; })){
      NET.waveT-=dt;
      if(NET.waveT<=0){
        reds.forEach(removeActor);
        if(NET.wave>=5){ netFinish('Tebrikler! 5 dalganın hepsi düşürüldü.'); return; }
        NET.wave++; const humans=NET.roster.filter(function(r){ return r.human; }).length, n=Math.min(4,NET.wave+humans-1);
        for(let i=0;i<n;i++){ const id='R'+NET.wave+'_'+i, nm='Kırmızı '+NET.wave+'-'+(i+1), ac=ENEMY_AC[i%ENEMY_AC.length];
          NET.roster.push({id:id,name:nm,ac:ac,team:'red',human:false}); NET.score[id]={k:0,d:0};
          const a=makeActor({id:id,name:nm,team:'red',ac:ac,ai:true,msl:2,flares:6}); randAirPos(aV1,9000,11000); aV2.set(-aV1.x,0,-aV1.z).normalize(); placeActor(a,aV1,aV2); }
        netBroadcast({t:'roster',roster:NET.roster,mode:NET.mode,bots:NET.bots});
        NET.roster.filter(function(r){ return r.team==='red'; }).forEach(function(r){ netBroadcast({t:'spawnRed',r:r}); });
        toast('Dalga '+NET.wave+'/5 — '+n+' düşman','#ff6a6a'); NET.waveT=5;
      }
    }
  }
  if(NET.timeLeft<=0){
    if(NET.mode==='coop') netFinish('Süre doldu. Ulaşılan dalga: '+NET.wave+'/5');
    else netFinish(netLeaderText());
  }
}
function netTeamScore(){ const o={blue:0,red:0}; NET.roster.forEach(function(r){ const s=NET.score[r.id]; if(s&&o[r.team]!=null) o[r.team]+=s.k; }); return o; }
function netLeaderText(){
  if(NET.mode==='team'){ const s=netTeamScore(); return s.blue===s.red?('Berabere '+s.blue+'–'+s.red):((s.blue>s.red?'Mavi':'Kırmızı')+' takım kazandı '+Math.max(s.blue,s.red)+'–'+Math.min(s.blue,s.red)); }
  let best=null; NET.roster.forEach(function(r){ const s=NET.score[r.id]; if(s&&(!best||s.k>NET.score[best.id].k)) best=r; });
  return best?(best.name+' kazandı ('+NET.score[best.id].k+' düşürme)'):'Maç bitti';
}
function netKill(victim,by){
  if(!NET.score[victim]) NET.score[victim]={k:0,d:0}; NET.score[victim].d++;
  const vr=NET.roster.find(function(r){ return r.id===victim; }), br=by&&NET.roster.find(function(r){ return r.id===by; });
  if(br&&vr&&br.team!==vr.team){ if(!NET.score[by]) NET.score[by]={k:0,d:0}; NET.score[by].k++; }
  netBroadcast({t:'score',score:NET.score}); netBroadcast({t:'kill',v:victim,by:by||null}); netHandle({t:'kill',v:victim,by:by||null},'H');
  if(NET.mode==='team'){ const s=netTeamScore(); if(s.blue>=10||s.red>=10) netFinish(netLeaderText()); }
  if(NET.mode==='ffa'&&br&&NET.score[by].k>=8) netFinish(netLeaderText());
}
function netFinish(text){ if(NET.ended) return; netBroadcast({t:'end',text:text}); netEnd(text); }
function netEnd(text){
  NET.ended=true; NET.started=false; state='mend';
  $('mendTitle').textContent='Maç bitti';
  const rows=NET.roster.filter(function(r){ return NET.mode!=='coop'||r.team==='blue'; }).map(function(r){ const s=NET.score[r.id]||{k:0,d:0}; return r.name+' '+s.k+'/'+s.d; });
  $('mendBody').textContent=text+'  ·  '+rows.join('  ·  ');
  $('btnMRetry').textContent=NET.host?'Yeni maç başlat':'Ev sahibini bekle'; $('btnMRetry').disabled=!NET.host; $('btnMHangar').textContent='Lobiye dön';
  $('missionEnd').classList.remove('hidden');
}
function netBackToLobby(fromHost){
  if(NET.host&&!fromHost) netBroadcast({t:'lobby'});
  NET.started=false; NET.ended=false; aiClear(); if(missionId==='net') missionId=NET.prevMission||'free';
  $('missionEnd').classList.add('hidden'); $('btnMRetry').disabled=false; $('btnMRetry').textContent='Tekrar dene'; $('btnMHangar').textContent='Hangara dön';
  NET.roster=NET.roster.filter(function(r){ return r.human; }); if(NET.host) netRoster();
  enterTitle(); netShowLobby();
}
function netReset(){ try{ if(NET.peer) NET.peer.destroy(); }catch(e){} NET.peer=null; NET.conns={}; NET.hconn=null; NET.roster=[]; NET.score={}; NET.last={}; NET.started=false; NET.ended=false; NET.myId='ME'; NET.seq=0; }
function netLeave(silent){
  if(typeof voiceStop==='function'&&VOICE.on){ voiceStop(); VOICE.hooked=false; }
  const was=NET.on; NET.on=false; netReset(); aiClear(); if(missionId==='net') missionId=NET.prevMission||'free';
  $('btnMRetry').disabled=false; $('btnMRetry').textContent='Tekrar dene'; $('btnMHangar').textContent='Hangara dön';
  if(was&&state!=='menu'){ $('missionEnd').classList.add('hidden'); enterTitle(); }
  netShowHome(); if(!silent) netStatus('');
}
