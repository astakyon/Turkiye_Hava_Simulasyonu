/* ------------------------------------------------------------------ radio: tower, wingman and AWACS calls, quick radio messages, push-to-talk
   Calls are spoken with the browser's Turkish voice (speechSynthesis) under a squelch click and static, with subtitles.
   Every phrase is also a Sound Library entry (Telsiz): a recorded file replaces the synthetic voice and is played through a
   radio band-pass filter. Multiplayer: quick messages over the data channel, voice chat through PeerJS media calls (star:
   every client calls the host; the host answers each with a personal mix of everybody else). */
const RADIO={q:[], busy:false, endT:0, sub:null, subT:0, last:{}, st:{}, voices:null, menu:false, staticG:null};
const RADIO_WHO={kule:{n:'Kule',p:0.92,r:1.06,c:'#9fe3ff'},kanat:{n:'Kılıç 2',p:1.12,r:1.12,c:'#7dffb0'},awacs:{n:'Kartal Gözü',p:0.82,r:1.02,c:'#ffd27a'},sen:{n:'Sen',p:1,r:1.1,c:'#ffffff'},oyuncu:{n:'',p:1.05,r:1.1,c:'#ffffff'}};
const PHR={
  tw_hello:{w:'kule',t:'{cs}, Ay Yıldız Kule. Pist {rw}, rüzgâr {wind}. Kalkış serbest.'},
  tw_takeoff:{w:'kule',t:'{cs}, kalkışınız görüldü. Sağ salim dönün.'},
  tw_appr:{w:'kule',t:'{cs}, pist {rw} iniş serbest. Rüzgâr {wind}.'},
  tw_landed:{w:'kule',t:'{cs}, inişiniz görüldü. Apronda park edin.'},
  tw_low:{w:'kule',t:'Dikkat {cs}, irtifanız çok düşük.'},
  aw_contact:{w:'awacs',t:'{cs}, Kartal Gözü. {n} düşman, saat {clk} yönünde, {km} kilometre.'},
  aw_clear:{w:'awacs',t:'{cs}, Kartal Gözü. Hava sahası temiz.'},
  aw_done:{w:'awacs',t:'Görev tamam {cs}. Üsse dönebilirsin.'},
  wg_join:{w:'kanat',t:'Kılıç 2 sol arkanda, emrindeyim.'},
  wg_missile:{w:'kanat',t:'Füze! Füze! Kır, kır!'},
  wg_goodkill:{w:'kanat',t:'Güzel atış! Bir düşman düştü.'},
  wg_kill:{w:'kanat',t:'Bir düşmanı indirdim!'},
  wg_ack:{w:'kanat',t:'Anlaşıldı, lider.'},
  wg_cover:{w:'kanat',t:'Geliyorum, arkanı kolluyorum!'}
};
const QUICK=[['Anlaşıldı','ack'],['Yardım lazım!','help'],['Arkamda düşman var!','six'],['Hedef vuruldu','hit'],['Beni takip et','follow'],['Füze attım','fox'],['Üsse dönüyorum','rtb'],['Teşekkürler','thx']];
/* Sound Library: each phrase can be replaced with a recording */
Object.keys(PHR).forEach(function(k){ const P=PHR[k], d={id:'r_'+k,cat:'telsiz',n:RADIO_WHO[P.w].n+': '+P.t.replace(/\{cs\}, ?/,'').replace(/\{[a-z]+\}/g,'…').slice(0,46),d:'Telsiz konuşması — kendi kaydınla değiştirebilirsin',bus:'radio',phrase:k}; SND_DEFS.push(d); SNDI[d.id]=d; });
function callsign(){ return (SETTINGS.callsign||'Hilal 1').slice(0,20); }
function rwName(){ const f=fwdOf(S.q,new THREE.Vector3()); return f.z<0?'36':'18'; }
function windTxt(){ const d=270+Math.round(Math.sin(T*0.01)*3)*10, k=6+Math.round(Math.abs(Math.sin(T*0.007))*8); return String(d).padStart(3,'0')+' derece, '+k+' knot'; }
function radioFill(t,v){ v=v||{}; return t.replace(/\{(\w+)\}/g,function(m,k){ if(k==='cs') return callsign(); if(k==='wind') return v.wind||windTxt(); if(k==='rw') return v.rw||'36'; return v[k]!=null?v[k]:m; }); }
function trVoice(){ if(RADIO.voices) return RADIO.voices; try{ const L=speechSynthesis.getVoices(); RADIO.voices=L.filter(function(v){ return /^tr/i.test(v.lang); }); if(!L.length) RADIO.voices=null; }catch(e){} return RADIO.voices||[]; }
try{ speechSynthesis.onvoiceschanged=function(){ RADIO.voices=null; trVoice(); }; }catch(e){}
/* queue a call; key = PHR id, or {who,text} for free text (quick messages, other players) */
function radioSay(key,vars,o){
  o=o||{}; const P=typeof key==='string'?PHR[key]:key; if(!P) return;
  const id=typeof key==='string'?key:null, now=performance.now()/1000;
  if(id&&!o.force&&now-(RADIO.last[id]!=null?RADIO.last[id]:-99)<(o.gap||12)) return; if(id) RADIO.last[id]=now;
  if(RADIO.q.length>=3&&!o.force) return;
  RADIO.q.push({id:id, who:P.w, name:o.name, text:radioFill(P.t,vars)});
}
function radioSub(who,name,text){ const W=RADIO_WHO[who]||RADIO_WHO.oyuncu, el=$('radioSub'); if(SETTINGS.radioSub===false){ el.classList.add('hidden'); return; }
  el.innerHTML='<b style="color:'+W.c+'">'+(name||W.n)+':</b> '+text.replace(/</g,'&lt;'); el.classList.remove('hidden'); }
function radioStatic(on){ if(!AC||!noiseBuf) return; if(!RADIO.staticG){ const s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=2600; f.Q.value=0.7; const g=AC.createGain(); g.gain.value=0; s.connect(f); f.connect(g); g.connect(sndOut('radio')); s.start(); RADIO.staticG=g; }
  RADIO.staticG.gain.setTargetAtTime(on&&!muted?0.022*sndVol('radio_static'):0,AC.currentTime,0.05); }
function radioNext(){
  if(RADIO.busy||!RADIO.q.length) return; const m=RADIO.q.shift(), W=RADIO_WHO[m.who]||RADIO_WHO.oyuncu; RADIO.busy=true;
  radioSub(m.who,m.name,m.text); sndPlay('radio_on'); radioStatic(true);
  const done=function(){ if(!RADIO.busy) return; RADIO.busy=false; radioStatic(false); sndPlay('radio_off'); RADIO.subT=performance.now()/1000+1.6; };
  const est=1.2+m.text.length*0.065; RADIO.endT=performance.now()/1000+est+4;   /* safety timeout */
  const buf=m.id&&SND.buf['r_'+m.id];
  if(buf&&AC){ const s=AC.createBufferSource(), f=AC.createBiquadFilter(), f2=AC.createBiquadFilter(), g=AC.createGain(); s.buffer=buf; f.type='highpass'; f.frequency.value=380; f2.type='lowpass'; f2.frequency.value=3200; g.gain.value=1.6*sndVol('r_'+m.id);
    s.playbackRate.value=sndPitch('r_'+m.id); s.connect(f); f.connect(f2); f2.connect(g); g.connect(sndOut('radio')); s.onended=done; s.start(AC.currentTime+0.12); RADIO.endT=performance.now()/1000+buf.duration+2; return; }
  if(SETTINGS.radioTts!==false&&!muted&&typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined'){
    try{ const u=new SpeechSynthesisUtterance(m.text), vs=trVoice(); u.lang='tr-TR'; if(vs.length) u.voice=vs[(m.who==='kanat'?1:0)%vs.length];
      u.pitch=W.p; u.rate=W.r; u.volume=clamp(SETTINGS.volume*busVol('radio'),0,1); u.onend=done; u.onerror=done; setTimeout(function(){ try{ speechSynthesis.speak(u); }catch(e){ done(); } },120); return; }catch(e){}
  }
  setTimeout(done,est*1000);
}
function radioClockOf(p){ const f=fwdOf(S.q,new THREE.Vector3()); const a=Math.atan2(p.x-S.pos.x,p.z-S.pos.z)-Math.atan2(f.x,f.z); let c=Math.round(((a*-1)/(Math.PI*2))*12); c=((c%12)+12)%12; return String(c===0?12:c); }
/* ---- automatic calls from the flight state */
function radioStep(dt){
  const now=performance.now()/1000;
  if(RADIO.busy&&now>RADIO.endT){ RADIO.busy=false; radioStatic(false); }
  if(!RADIO.busy&&RADIO.subT&&now>RADIO.subT){ RADIO.subT=0; $('radioSub').classList.add('hidden'); }
  radioNext();
  const R=RADIO.st, st=state;
  if(st!=='play'||NET.on&&!NET.started){ R.prev=st; return; }
  if(R.prev!=='play'&&R.prev!=='paused'&&R.prev!=='map'){ R.air=!S.onGround; R.appr=false; R.reds=0; R.msl=0; R.wing=wingSpawned;
    if(S.onGround&&landZone(S.pos.x,S.pos.z,50)) setTimeout(function(){ if(state==='play') radioSay('tw_hello',{rw:rwName()},{force:true}); },1500); }
  R.prev=st;
  if(S.crashed) return;
  const zone=landZone(S.pos.x,S.pos.z,0), agl=S.pos.y-Math.max(0,groundH(S.pos.x,S.pos.z));
  if(!S.onGround&&!R.air&&agl>40){ R.air=true; R.appr=false; if(landZone(S.pos.x,S.pos.z,2500)) radioSay('tw_takeoff'); }
  if(S.onGround&&R.air){ R.air=false; if(zone) radioSay('tw_landed'); }
  if(R.air&&S.gear&&!R.appr&&agl<700&&landZone(S.pos.x,S.pos.z,5000)){ R.appr=true; radioSay('tw_appr',{rw:rwName()}); }
  if(R.air&&agl<55&&S.speed>90&&!landZone(S.pos.x,S.pos.z,1500)) radioSay('tw_low',null,{gap:25});
  /* AWACS picture when new enemies appear */
  const reds=ACT.filter(function(a){ return a.team==='red'&&a.alive; });
  if(reds.length>R.reds){ let near=reds[0]; reds.forEach(function(a){ if(a.pos.distanceToSquared(S.pos)<near.pos.distanceToSquared(S.pos)) near=a; });
    radioSay('aw_contact',{n:reds.length,clk:radioClockOf(near.pos),km:Math.max(1,Math.round(near.pos.distanceTo(S.pos)/1000))},{gap:20}); }
  else if(reds.length===0&&R.reds>0) radioSay('aw_clear',null,{gap:30});
  R.reds=reds.length;
  if(RWR.msl>0&&!R.msl){ if(wingSpawned) radioSay('wg_missile',null,{gap:6,force:true}); }
  R.msl=RWR.msl>0;
  if(wingSpawned&&!R.wing) radioSay('wg_join'); R.wing=wingSpawned;
}
/* kills → wingman calls */
(function(){ const D=actorDown; actorDown=function(a,byId){ const r=D.apply(this,arguments); try{ if(a.team==='red'&&wingSpawned&&state==='play'){ if(byId===NET.myId) radioSay('wg_goodkill',null,{gap:8}); else { const k=actById(byId); if(k&&k.wing) radioSay('wg_kill',null,{gap:8}); } } }catch(e){} return r; }; })();
(function(){ const E=endMission; endMission=function(ok){ const r=E.apply(this,arguments); if(ok) radioSay('aw_done',null,{force:true}); return r; }; })();
/* ---- quick radio menu (O, then 1–8) */
function radioMenu(open){ RADIO.menu=open==null?!RADIO.menu:open; const el=$('radioMenu');
  if(RADIO.menu) el.innerHTML='<b>TELSİZ</b>'+QUICK.map(function(q,i){ return '<button type="button" data-q="'+i+'"><kbd>'+(i+1)+'</kbd>'+q[0]+'</button>'; }).join('')+(NET.on?'<small>'+(VOICE.on?'Bas-konuş: '+ctrlKeyName('gen','ptt'):'Sesli sohbet kapalı')+'</small>':'');
  el.classList.toggle('hidden',!RADIO.menu); }
function ctrlKeyName(s,a){ const k=(CTRL.kb[s]&&CTRL.kb[s][a]||[])[0]; return k?k.replace(/^Key/,'').replace(/^Digit/,''):'—'; }
function radioQuick(i){
  const q=QUICK[i]; if(!q) return; radioMenu(false);
  if(NET.on){ const msg={t:'radio',k:q[1],text:q[0],name:NET.name||'Pilot',from:NET.myId}; if(NET.host) netBroadcast(msg); else netSendTo('H',msg); radioSay({w:'sen',t:q[0]},null,{force:true}); return; }
  radioSay({w:'sen',t:q[0]},null,{force:true});
  if(wingSpawned){ const rep={ack:'wg_ack',help:'wg_cover',six:'wg_cover',follow:'wg_ack',fox:'wg_ack',rtb:'wg_ack',hit:'wg_goodkill',thx:'wg_ack'}[q[1]]; setTimeout(function(){ radioSay(rep,null,{force:true}); },900); }
}
function radioRecv(msg){ radioSay({w:'oyuncu',t:String(msg.text||'').slice(0,80)},null,{force:true,name:String(msg.name||'Pilot').slice(0,16)}); }
$('radioMenu').addEventListener('click',function(e){ const b=e.target.closest('button[data-q]'); if(b) radioQuick(+b.dataset.q); });
INPUT.on('keydown',function(e){
  if(state!=='play'&&state!=='walk') return; if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if(isKey(e,'gen','radio')){ radioMenu(); e.preventDefault(); return; }
  if(RADIO.menu&&/^Digit[1-8]$/.test(e.code)){ radioQuick(+e.code.slice(5)-1); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if(RADIO.menu&&e.code==='Escape'){ radioMenu(false); e.stopImmediatePropagation(); return; }
  if(isKey(e,'gen','ptt')&&!e.repeat) voicePTT(true);
},true,'ses/telsiz','çok oyunculu');
INPUT.on('keyup',function(e){ if(isKey(e,'gen','ptt')) voicePTT(false); },true,'ses/telsiz','çok oyunculu');

/* ---- voice chat (multiplayer) */
const VOICE={on:false, mic:null, micSrc:null, talk:false, calls:[], inc:{}, mixes:{}, els:[]};
function voiceEnable(on){
  if(!on){ voiceStop(); SETTINGS.voice=false; saveSettings(); return Promise.resolve(false); }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ toast('Bu tarayıcıda mikrofon kullanılamıyor','#ffc24a'); return Promise.resolve(false); }
  initAudio();
  return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}).then(function(s){
    VOICE.mic=s; VOICE.mic.getAudioTracks().forEach(function(t){ t.enabled=false; }); VOICE.on=true; SETTINGS.voice=true; saveSettings();
    if(AC) VOICE.micSrc=AC.createMediaStreamSource(s);
    toast('Mikrofon hazır — konuşmak için '+ctrlKeyName('gen','ptt')+' tuşunu basılı tut','#7dffb0'); voiceConnect(); return true;
  }).catch(function(){ toast('Mikrofon izni verilmedi','#ffc24a'); return false; });
}
function voiceStop(){ VOICE.calls.forEach(function(c){ try{ c.close(); }catch(e){} }); VOICE.calls=[]; if(VOICE.mic) VOICE.mic.getTracks().forEach(function(t){ t.stop(); });
  VOICE.mic=null; VOICE.micSrc=null; VOICE.on=false; VOICE.inc={}; VOICE.mixes={}; VOICE.els.forEach(function(a){ a.srcObject=null; a.remove(); }); VOICE.els=[]; }
function voicePTT(on){ if(!VOICE.on||!VOICE.mic) return; if(VOICE.talk===on) return; VOICE.talk=on; VOICE.mic.getAudioTracks().forEach(function(t){ t.enabled=on; }); sndPlay(on?'radio_on':'radio_off');
  $('pttInd').classList.toggle('hidden',!on); }
/* incoming voice → radio filter → radio bus (a muted <audio> keeps Chrome pulling the remote stream) */
function voicePlay(id,stream){
  const a=document.createElement('audio'); a.muted=true; a.autoplay=true; a.srcObject=stream; a.style.display='none'; document.body.appendChild(a); VOICE.els.push(a);
  if(!AC) return null; const src=AC.createMediaStreamSource(stream), f=AC.createBiquadFilter(), f2=AC.createBiquadFilter(), g=AC.createGain(); f.type='highpass'; f.frequency.value=300; f2.type='lowpass'; f2.frequency.value=3400; g.gain.value=1.4;
  src.connect(f); f.connect(f2); f2.connect(g); g.connect(sndOut('radio')); VOICE.inc[id]=src; return src;
}
function voiceConnect(){
  if(!VOICE.on||!NET.on||!NET.peer||!VOICE.mic) return;
  if(NET.host){ if(VOICE.hooked) return; VOICE.hooked=true;
    NET.peer.on('call',function(call){
      if(!VOICE.on){ call.close(); return; }
      /* personal mix for this caller: host mic + every other caller */
      const dst=AC.createMediaStreamDestination(); VOICE.mixes[call.peer]=dst; if(VOICE.micSrc) VOICE.micSrc.connect(dst);
      Object.keys(VOICE.inc).forEach(function(k){ if(k!==call.peer) VOICE.inc[k].connect(dst); });
      call.answer(dst.stream); VOICE.calls.push(call);
      call.on('stream',function(rs){ const src=voicePlay(call.peer,rs); if(src) Object.keys(VOICE.mixes).forEach(function(k){ if(k!==call.peer) src.connect(VOICE.mixes[k]); }); });
      call.on('close',function(){ delete VOICE.inc[call.peer]; delete VOICE.mixes[call.peer]; });
    });
  } else {
    if(VOICE.calls.length) return; const call=NET.peer.call(NET_PREFIX+NET.room,VOICE.mic); if(!call) return; VOICE.calls.push(call);
    call.on('stream',function(rs){ voicePlay('H',rs); }); call.on('close',function(){ VOICE.calls=[]; });
  }
}
/* touch push-to-talk and radio buttons */
(function(){ const p=$('tPtt'), r=$('tRadio'); if(p){ p.addEventListener('pointerdown',function(e){ e.preventDefault(); voicePTT(true); }); ['pointerup','pointercancel','pointerleave'].forEach(function(ev){ p.addEventListener(ev,function(){ voicePTT(false); }); }); }
  if(r) r.addEventListener('pointerdown',function(e){ e.preventDefault(); radioMenu(); }); })();
setInterval(function(){ const p=$('tPtt'); if(p) p.classList.toggle('hidden',!(NET.on&&VOICE.on)); },1000);
