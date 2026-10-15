/* ------------------------------------------------------------------ sound system: mixer buses, sound registry and the Sound Library
   Every sound has an id in SND_DEFS: a procedural default (synthesised here, no files needed) that can be tuned (volume, pitch)
   or replaced with a user audio file (kept on this device in IndexedDB). Buses: music, sfx, ui, radio, ambient → master.
   The mix follows the game state: no engine/flight effects in the menus, effects ducked while paused or on the map. */
const SND={bus:{}, user:{}, buf:{}, loops:{}, ready:false, prev:null, cat:'motor'};
const SND_BUSES=[['music','Müzik'],['sfx','Efekt'],['ui','Arayüz'],['radio','Telsiz'],['amb','Ortam']];
const SND_CATS=[['motor','Motor'],['silah','Silah'],['patlama','Patlama'],['cevre','Çevre'],['arayuz','Arayüz'],['telsiz','Telsiz'],['muzik','Müzik']];
function sNz(dest,freq,type,vol,dur,q,t0){ if(!AC||!noiseBuf) return; const t=AC.currentTime+(t0||0), s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq; if(q) f.Q.value=q;
  const g=AC.createGain(); g.gain.setValueAtTime(Math.max(0.0002,vol),t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t,Math.random()*1.5,dur+0.05); }
function sTn(dest,f0,f1,dur,vol,type,t0){ if(!AC) return; const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime+(t0||0); o.type=type||'sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol),t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+0.05); }
/* a few seconds of a procedural loop for previews */
function sLoopPreview(dest,v,p,kind){ if(!AC||!noiseBuf) return; const t=AC.currentTime, D=2.6, s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const f=AC.createBiquadFilter(), g=AC.createGain();
  const P={air:[600,'lowpass',0.35],car:[420,'lowpass',0.25],rotor:[500,'lowpass',0.4],wind:[700,'bandpass',0.12],surf:[520,'lowpass',0.25]}[kind];
  f.type=P[1]; f.frequency.value=P[0]*p; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(P[2]*v,t+0.3); g.gain.setValueAtTime(P[2]*v,t+D-0.4); g.gain.linearRampToValueAtTime(0.0001,t+D);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t+D+0.1);
  if(kind==='air'||kind==='car'){ const o=AC.createOscillator(), og=AC.createGain(); o.type='sawtooth'; o.frequency.value=(kind==='air'?120:70)*p; og.gain.setValueAtTime(0.0001,t); og.gain.linearRampToValueAtTime(0.05*v,t+0.3); og.gain.linearRampToValueAtTime(0.0001,t+D); const lf=AC.createBiquadFilter(); lf.type='lowpass'; lf.frequency.value=600; o.connect(lf); lf.connect(og); og.connect(dest); o.start(t); o.stop(t+D+0.1); }
  if(kind==='rotor'){ const lfo=AC.createOscillator(), lg=AC.createGain(); lfo.frequency.value=18*p; lg.gain.value=0.5*P[2]*v; lfo.connect(lg); lg.connect(g.gain); lfo.start(t); lfo.stop(t+D); }
  if(kind==='surf'){ g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(P[2]*v,t+1.1); g.gain.linearRampToValueAtTime(0.03*v,t+D); } }
const SND_DEFS=[
  /* motor (continuous; file replaces the synthesized loop, its speed follows throttle / rpm) */
  {id:'eng_air',cat:'motor',n:'Uçak motoru',d:'Jet ve pervaneli uçaklar; gaza göre hız ve parlaklık',bus:'sfx',loop:'air'},
  {id:'rotor',cat:'motor',n:'Helikopter rotoru',d:'Pal sesi; rotor devrine göre hızlanır',bus:'sfx',loop:'rotor'},
  {id:'eng_car',cat:'motor',n:'Araç motoru',d:'Kara araçları; vitese göre devir',bus:'sfx',loop:'car'},
  /* weapons */
  {id:'gun',cat:'silah',n:'Top atışı',d:'20 mm top, her mermide',bus:'sfx',gen:function(o,v,p){ sNz(o,1100*p,'bandpass',0.16*v,0.07); }},
  {id:'missile',cat:'silah',n:'Füze ateşleme',d:'Füze raydan çıkarken',bus:'sfx',gen:function(o,v,p){ sNz(o,2600*p,'highpass',0.12*v,0.5); sNz(o,320*p,'lowpass',0.3*v,1.1); }},
  {id:'bomb',cat:'silah',n:'Bomba bırakma',d:'Askıdan ayrılma sesi',bus:'sfx',gen:function(o,v,p){ sTn(o,190*p,70*p,0.14,0.25*v,'square'); sNz(o,700*p,'bandpass',0.08*v,0.2); }},
  {id:'flare',cat:'silah',n:'Flare',d:'Karşı tedbir fişeği',bus:'sfx',gen:function(o,v,p){ sNz(o,2400*p,'highpass',0.08*v,0.35); }},
  {id:'lock',cat:'silah',n:'Hedef kilidi',d:'Kilit sağlandığında',bus:'sfx',gen:function(o,v,p){ sTn(o,1300*p,1300*p,0.09,0.06*v,'square'); }},
  {id:'rwr',cat:'silah',n:'Füze uyarısı',d:'Üzerine füze gelirken',bus:'sfx',gen:function(o,v,p){ sTn(o,1700*p,1700*p,0.07,0.07*v,'square'); }},
  {id:'cue',cat:'silah',n:'Tehdit uyarısı',d:'Radar kilidi / SAM',bus:'sfx',gen:function(o,v,p){ sTn(o,1900*p,1900*p,0.12,0.07*v,'square'); }},
  /* explosions & aircraft events */
  {id:'boom',cat:'patlama',n:'Patlama',d:'Hedef ve araç patlamaları',bus:'sfx',gen:function(o,v,p){ sNz(o,220*p,'lowpass',0.9*v,0.9); sNz(o,90*p,'lowpass',0.5*v,1.6); }},
  {id:'gear',cat:'patlama',n:'İniş takımı',d:'Takım inip kalkarken',bus:'sfx',gen:function(o,v,p){ sTn(o,95*p,60*p,0.7,0.1*v,'sawtooth'); sNz(o,420*p,'lowpass',0.08*v,0.7); sTn(o,200*p,120*p,0.08,0.12*v,'square',0.65); }},
  {id:'touch',cat:'patlama',n:'Teker teması',d:'Piste değerken',bus:'sfx',gen:function(o,v,p){ sNz(o,900*p,'bandpass',0.16*v,0.3,2); sNz(o,160*p,'lowpass',0.25*v,0.25); }},
  /* environment */
  {id:'wind',cat:'cevre',n:'Rüzgâr',d:'İrtifa arttıkça güçlenir',bus:'amb',loop:'wind'},
  {id:'surf',cat:'cevre',n:'Dalga',d:'Kıyıya yakınken',bus:'amb',loop:'surf'},
  {id:'gull',cat:'cevre',n:'Martı',d:'Marina çevresi',bus:'amb',gen:function(o,v,p){ const f=1400*p; sTn(o,f,f*0.62,0.32,0.05*v,'triangle'); sTn(o,f*0.95,f*0.6,0.26,0.04*v,'triangle',0.36); }},
  {id:'cricket',cat:'cevre',n:'Cırcır böceği',d:'Gece, yürürken',bus:'amb',gen:function(o,v,p){ for(let k=0;k<3;k++) sTn(o,4300*p,4200*p,0.04,0.012*v,'square',k*0.07); }},
  /* interface */
  {id:'ui_click',cat:'arayuz',n:'Düğme',d:'Düğmeye basınca',bus:'ui',gen:function(o,v,p){ sTn(o,880*p,620*p,0.05,0.05*v,'triangle'); }},
  {id:'ui_hover',cat:'arayuz',n:'Üzerine gelme',d:'Fare veya odak düğmeye gelince',bus:'ui',gen:function(o,v,p){ sTn(o,1400*p,1500*p,0.025,0.015*v,'sine'); }},
  {id:'ui_ok',cat:'arayuz',n:'Onay',d:'Başlat, kaydet, seç',bus:'ui',gen:function(o,v,p){ sTn(o,660*p,660*p,0.08,0.05*v,'triangle'); sTn(o,990*p,990*p,0.12,0.05*v,'triangle',0.07); }},
  {id:'ui_back',cat:'arayuz',n:'Geri',d:'Menüden çıkış',bus:'ui',gen:function(o,v,p){ sTn(o,700*p,440*p,0.09,0.04*v,'triangle'); }},
  {id:'ui_alert',cat:'arayuz',n:'Uyarı',d:'Hata ve dikkat mesajları',bus:'ui',gen:function(o,v,p){ sTn(o,520*p,520*p,0.09,0.05*v,'square'); sTn(o,390*p,390*p,0.14,0.05*v,'square',0.11); }},
  {id:'ui_notify',cat:'arayuz',n:'Bildirim',d:'Görev ve bilgi mesajları',bus:'ui',gen:function(o,v,p){ sTn(o,1046*p,1046*p,0.1,0.035*v,'sine'); sTn(o,1318*p,1318*p,0.16,0.035*v,'sine',0.09); }},
  /* radio (used by the radio system) */
  {id:'radio_on',cat:'telsiz',n:'Telsiz açılış',d:'Konuşma başında (squelch)',bus:'radio',gen:function(o,v,p){ sNz(o,2500*p,'bandpass',0.09*v,0.12,1.5); sTn(o,1200*p,1200*p,0.05,0.03*v,'sine'); }},
  {id:'radio_off',cat:'telsiz',n:'Telsiz kapanış',d:'Konuşma sonunda',bus:'radio',gen:function(o,v,p){ sNz(o,2200*p,'bandpass',0.07*v,0.16,1.5); }},
  {id:'radio_static',cat:'telsiz',n:'Cızırtı',d:'Konuşma altındaki parazit',bus:'radio',gen:function(o,v,p){ sNz(o,3000*p,'bandpass',0.035*v,0.8,0.8); }}
];
const SNDI={}; SND_DEFS.forEach(function(d){ SNDI[d.id]=d; });
function sndU(id){ return SND.user[id]||{}; }
function sndVol(id){ const u=sndU(id); return u.vol==null?1:u.vol; }
function sndPitch(id){ const u=sndU(id); return u.pitch==null?1:u.pitch; }
function sndOut(b){ return SND.bus[b]||master; }
function sndLoad(){ try{ SND.user=JSON.parse(stGet('ayy-sounds')||'{}')||{}; }catch(e){ SND.user={}; } }
function sndSave(){ try{ stSet('ayy-sounds',JSON.stringify(SND.user)); }catch(e){} }
function busVol(b){ const V=SETTINGS.vol||{}; return V[b]==null?(b==='music'?0.6:1):V[b]; }
/* buses are created with the audio context */
function sndBuses(){
  if(!AC||SND.bus.sfx) return;
  SND_BUSES.forEach(function(b){ const g=AC.createGain(); g.gain.value=busVol(b[0]); g.connect(master); SND.bus[b[0]]=g; });
  SND.mix={}; SND_BUSES.forEach(function(b){ SND.mix[b[0]]=1; });
  sndDecodeAll();
}
/* state mix: the flight effects bus is silent in menus, ducked while paused / on the map */
function sndMixStep(){
  if(!AC||!SND.bus.sfx) return; const t=AC.currentTime;
  const menu=state==='menu'||state==='library', duck=state==='paused'||state==='map'||state==='service'||state==='mend';
  const m={sfx:menu?0:(duck?0.18:1), amb:menu?0.4:(duck?0.5:1), music:1, ui:1, radio:menu?0:1};
  master.gain.setTargetAtTime(muted?0:SETTINGS.volume,t,0.05);
  SND_BUSES.forEach(function(b){ SND.bus[b[0]].gain.setTargetAtTime(busVol(b[0])*m[b[0]],t,0.12); });
}
function sndPlay(id,o){
  if(!AC||muted) return; const d=SNDI[id]; if(!d) return; o=o||{};
  if(d.music){ if(typeof musPreview==='function') musPreview(d.music); return; }
  if(d.phrase&&!o.raw){ if(typeof radioSay==='function') radioSay(d.phrase,null,{force:true}); return; }
  const v=sndVol(id)*(o.vol==null?1:o.vol), p=sndPitch(id)*(o.pitch==null?1:o.pitch), dest=o.dest||sndOut(d.bus);
  if(SND.buf[id]){ const s=AC.createBufferSource(), g=AC.createGain(); s.buffer=SND.buf[id]; s.playbackRate.value=p; g.gain.value=v; s.connect(g); g.connect(dest); s.start();
    if(d.loop) s.stop(AC.currentTime+Math.min(4,s.buffer.duration/p)); return s; }
  if(d.gen) d.gen(dest,v,p); else if(d.loop) sLoopPreview(dest,v,p,d.loop);
}
/* continuous loops from user files: gain and speed driven by the game (engine, rotor, wind …) */
function sndLoop(id,gain,rate){
  if(!AC||!SND.buf[id]){ if(SND.loops[id]) sndLoopStop(id); return false; }
  let L=SND.loops[id];
  if(!L||L.buf!==SND.buf[id]){ if(L) sndLoopStop(id); const s=AC.createBufferSource(), g=AC.createGain(); s.buffer=SND.buf[id]; s.loop=true; g.gain.value=0; s.connect(g); g.connect(sndOut(SNDI[id].bus)); s.start(); L=SND.loops[id]={s:s,g:g,buf:SND.buf[id]}; }
  const t=AC.currentTime; L.g.gain.setTargetAtTime(Math.max(0,gain)*sndVol(id),t,0.12); L.s.playbackRate.setTargetAtTime(Math.max(0.25,rate*sndPitch(id)),t,0.12); return true;
}
function sndLoopStop(id){ const L=SND.loops[id]; if(!L) return; try{ L.s.stop(); }catch(e){} L.g.disconnect(); delete SND.loops[id]; }
/* ---- user files (IndexedDB) */
const SDB={db:null};
function sdbOpen(){ if(SDB.db) return Promise.resolve(SDB.db); if(typeof indexedDB==='undefined') return Promise.reject(new Error('IndexedDB yok'));
  return new Promise(function(res,rej){ const r=indexedDB.open('ayyildiz-sounds',1); r.onupgradeneeded=function(){ r.result.createObjectStore('f'); }; r.onsuccess=function(){ SDB.db=r.result; res(SDB.db); }; r.onerror=function(){ rej(r.error); }; }); }
function sdbOp(mode,fn){ return sdbOpen().then(function(db){ return new Promise(function(res,rej){ const tx=db.transaction('f',mode), st=tx.objectStore('f'), q=fn(st); tx.oncomplete=function(){ res(q&&q.result); }; tx.onerror=function(){ rej(tx.error); }; }); }); }
function sndDecode(id,data){ return new Promise(function(res,rej){ try{ const p=AC.decodeAudioData(data.slice(0),function(b){ SND.buf[id]=b; res(b); },function(e){ rej(e||new Error('çözülemedi')); }); if(p&&p.catch) p.catch(function(){}); }catch(e){ rej(e); } }); }
function sndDecodeAll(){ if(!AC) return; Object.keys(SND.user).forEach(function(id){ if(!SND.user[id].file||SND.buf[id]) return; sdbOp('readonly',function(st){ return st.get(id); }).then(function(rec){ if(rec&&rec.data) return sndDecode(id,rec.data); }).catch(function(){}); }); }
function sndSetFile(id,file){
  return file.arrayBuffer().then(function(data){ if(data.byteLength>12*1024*1024) throw new Error('Dosya 12 MB’tan büyük');
    initAudio(); return sndDecode(id,data).then(function(){ return sdbOp('readwrite',function(st){ return st.put({name:file.name,data:data},id); }); }).then(function(){ const u=SND.user[id]||(SND.user[id]={}); u.file=file.name; sndSave(); }); });
}
function sndReset(id){ delete SND.buf[id]; sndLoopStop(id); delete SND.user[id]; sndSave(); return sdbOp('readwrite',function(st){ return st.delete(id); }).catch(function(){}); }
sndLoad();
/* audio context on the first gesture anywhere (menus get sound too) */
['pointerdown','keydown'].forEach(function(ev){ window.addEventListener(ev,function first(){ try{ initAudio(); }catch(e){} window.removeEventListener(ev,first,true); },true); });

/* ---- Sound Library screen */
function openSoundLib(){ initAudio(); closeModals(); syncSoundLib(); $('sndLib').classList.remove('hidden'); }
function closeSoundLib(){ $('sndLib').classList.add('hidden'); }
function sndMixHTML(master){ return (master?'<div class="sndbus"><b>Ana</b><input type="range" min="0" max="100" data-bus="master" value="'+Math.round(SETTINGS.volume*100)+'"><output>'+Math.round(SETTINGS.volume*100)+'%</output></div>':'')+
    SND_BUSES.map(function(b){ const v=Math.round(busVol(b[0])*100); return '<div class="sndbus"><b>'+b[1]+'</b><input type="range" min="0" max="100" data-bus="'+b[0]+'" value="'+v+'"><output>'+v+'%</output></div>'; }).join(''); }
function syncSoundLib(){
  $('sndMix').innerHTML=sndMixHTML(true);
  $('sndCats').innerHTML=SND_CATS.map(function(c){ const n=SND_DEFS.filter(function(d){ return d.cat===c[0]; }).length; return '<button type="button" data-cat="'+c[0]+'"'+(SND.cat===c[0]?' aria-pressed="true"':'')+'>'+c[1]+'<small>'+n+'</small></button>'; }).join('');
  const L=SND_DEFS.filter(function(d){ return d.cat===SND.cat; });
  $('sndList').innerHTML=L.length?L.map(function(d){ const u=sndU(d.id), v=Math.round(sndVol(d.id)*100), p=Math.round(sndPitch(d.id)*100);
    return '<div class="sndcard" data-id="'+d.id+'"><div class="sndh"><b>'+d.n+(u.file?'<span class="tagm">DOSYA</span>':'')+(d.loop?'<span class="tagm loop">DÖNGÜ</span>':'')+'</b><small>'+d.d+(u.file?' · '+u.file:'')+'</small></div>'+
      '<div class="sndctl"><button type="button" class="btn" data-act="play">▶ Dinle</button>'+
      '<label>Ses <input type="range" min="0" max="200" data-k="vol" value="'+v+'"><output>'+v+'%</output></label>'+
      '<label>Ton <input type="range" min="50" max="200" data-k="pitch" value="'+p+'"><output>'+p+'%</output></label>'+
      '<label class="btn">Dosya yükle<input type="file" accept="audio/*,.mp3,.ogg,.wav,.m4a" data-act="file" hidden></label>'+
      '<button type="button" class="btn" data-act="reset"'+(u.file||u.vol!=null||u.pitch!=null?'':' disabled')+'>Varsayılan</button></div></div>'; }).join('')
    :'<p class="sndempty">Bu kategoride ses yok.</p>';
}
(function(){
  const lib=$('sndLib');
  $('btnSndBack').addEventListener('click',function(){ closeSoundLib(); if(state==='menu'||state==='paused'){ syncSettingsUI(); openModal('settings'); } });
  $('sndCats').addEventListener('click',function(e){ const b=e.target.closest('button[data-cat]'); if(!b) return; SND.cat=b.dataset.cat; syncSoundLib(); });
  const mixIn=function(e){ const r=e.target; if(!r.dataset.bus) return; const v=r.value/100; r.nextElementSibling.textContent=r.value+'%';
    if(r.dataset.bus==='master'){ SETTINGS.volume=v; applyVolume(); } else { SETTINGS.vol=SETTINGS.vol||{}; SETTINGS.vol[r.dataset.bus]=v; } saveSettings(); sndMixStep(); };
  $('sndMix').addEventListener('input',mixIn); $('setMix').addEventListener('input',mixIn);
  $('sndList').addEventListener('input',function(e){ const r=e.target, c=r.closest('.sndcard'); if(!c||!r.dataset.k) return; const id=c.dataset.id, u=SND.user[id]||(SND.user[id]={});
    u[r.dataset.k]=r.value/100; r.nextElementSibling.textContent=r.value+'%'; sndSave(); c.querySelector('[data-act="reset"]').disabled=false; });
  $('sndList').addEventListener('change',function(e){ const r=e.target, c=r.closest('.sndcard'); if(!c) return; if(r.dataset.k){ sndPlay(c.dataset.id); return; }
    if(r.dataset.act==='file'&&r.files&&r.files[0]){ const id=c.dataset.id; toast('Ses yükleniyor…','#b8ecff');
      sndSetFile(id,r.files[0]).then(function(){ toast('Yeni ses kullanılıyor: '+SNDI[id].n,'#7dffb0'); syncSoundLib(); sndPlay(id); }).catch(function(err){ toast('Ses yüklenemedi: '+(err&&err.message||'biçim desteklenmiyor'),'#ff6a5a'); }); } });
  $('sndList').addEventListener('click',function(e){ const b=e.target.closest('button[data-act]'), c=e.target.closest('.sndcard'); if(!b||!c) return; const id=c.dataset.id;
    if(b.dataset.act==='play'){ initAudio(); sndMixStep(); if(SND.prev){ try{ SND.prev.stop(); }catch(err){} } const prevState=state; SND.prev=sndPlayPreview(id); }
    else if(b.dataset.act==='reset'){ sndReset(id).then(syncSoundLib); syncSoundLib(); } });
  /* previews play on the bus but ignore the state mix (menu silences effects) */
  void lib;
})();
function sndPlayPreview(id){ if(!AC) return null; const d=SNDI[id]; const g=AC.createGain(); g.gain.value=busVol(d.bus); g.connect(master); return sndPlay(id,{dest:g}); }
