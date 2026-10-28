/* ------------------------------------------------------------------ staged start-up (V2.19)
   Before: every module and then all ~30 world builders ran in one go (2.6–3 s of blocked page on a test machine, plus the first
   frame compiling ~40 shaders); the page showed the frozen menu with no sign of progress.
   Now the modules still run first (one script), then the builders run in separate steps with a loading screen and a real
   progress bar between them, and the frame loop starts after the last step. Timers that modules set up while loading (texture
   sharing, merging, baking…) wait until the world is built instead of firing half way through it, in the order they were due.
   Without a browser (headless tests) everything runs at once as before. BOOT.marks keeps the timings for the performance report. */
const BOOT={t0:performance.now(), hold:false, after:[], marks:[], stepMs:[], steps:0, done:false, first:null, ready:null};
function bootMark(n){ BOOT.marks.push([n,Math.round(performance.now())]); }   /* ms since the page started loading */
bootMark('betik');
(function(){ if(typeof window==='undefined'||typeof MessageChannel==='undefined'||!window.setTimeout||window.__bootSync) return;
  BOOT.hold=true; const st=window.setTimeout.bind(window), ct=window.clearTimeout.bind(window), si=window.setInterval.bind(window), recs=new Map();
  BOOT.st=st;
  window.setTimeout=function(fn,ms){ const a=Array.prototype.slice.call(arguments,2); if(typeof fn!=='function') return st.apply(window,arguments); let id=0;
    const run=function(){ recs.delete(id); fn.apply(window,a); };
    id=st(function(){ if(BOOT.hold){ BOOT.after.push(id); return; } run(); },ms); recs.set(id,run); return id; };
  window.clearTimeout=function(id){ recs.delete(id); ct(id); };
  window.setInterval=function(fn,ms){ const a=Array.prototype.slice.call(arguments,2); if(typeof fn!=='function') return si.apply(window,arguments); return si(function(){ if(!BOOT.hold) fn.apply(window,a); },ms); };
  BOOT.release=function(){ BOOT.hold=false; const q=BOOT.after; BOOT.after=[]; q.forEach(function(id){ const r=recs.get(id); if(r){ try{ r(); }catch(e){ console.error(e); } } });
    window.setTimeout=st; window.clearTimeout=ct; window.setInterval=si; };
  /* keys and clicks wait until the world exists */
  const block=function(e){ if(BOOT.hold){ if(e.type==='pointerdown'||e.type==='keydown') try{ bootSndStart(); }catch(x){}   /* V2.38: the first touch starts the loading sound */
    e.stopImmediatePropagation(); if(e.cancelable&&e.type!=='keyup') e.preventDefault(); } };
  ['keydown','keyup','pointerdown','mousedown','touchstart','click','wheel'].forEach(function(t){ window.addEventListener(t,block,{capture:true,passive:false}); });
})();
/* progress: world steps and the finishing steps share one bar */
const BOOTP={total:1, done:0};
function bootShow(label){ const p=Math.max(0,Math.min(1,BOOTP.done/BOOTP.total)); if(typeof bootBar==='function') bootBar(p); const t=document.getElementById('bootTxt'); if(t&&label) t.textContent=label; }
function bootStep(s){ const t=performance.now(); let r; try{ r=s[1](); }catch(e){ console.error('açılış: '+s[0],e); } const ms=performance.now()-t; const L=BOOT.stepMs, last=L[L.length-1];
  if(last&&last[0]===s[0]) last[1]+=Math.round(ms); else L.push([s[0],Math.round(ms)]); return r; }
/* world steps: one task apart (MessageChannel: no 4 ms timer clamp), several small ones per task, the bar moves in between */
function bootRun(steps,finish){ let i=0; BOOTP.total+=steps.reduce(function(a,s){ return a+(s[2]||1); },0);
  const one=function(){ bootStep(steps[i]); BOOTP.done+=steps[i][2]||1; i++; BOOT.steps++; };
  if(!BOOT.hold){ while(i<steps.length) one(); finish(); return; }
  const ch=new MessageChannel(); let started=false; const go=function(){ if(started) return; started=true; bootMark('ilk boya'); ch.port2.postMessage(0); };
  ch.port1.onmessage=function(){ const t0=performance.now(); do{ one(); }while(i<steps.length&&performance.now()-t0<50); bootShow(steps[i]&&steps[i][0]);
    if(i<steps.length) ch.port2.postMessage(0); else { ch.port1.onmessage=null; finish(); } };
  bootShow(steps[0][0]); requestAnimationFrame(function(){ requestAnimationFrame(go); }); BOOT.st(go,250); }   /* after the loading screen is on screen (or at once in a hidden tab) */
/* finishing steps (V2.20): run between the first frames, still under the loading screen — texture sharing, merging, baking,
   shader warm-up and the account — so the title appears complete and smooth instead of finishing in front of the player.
   A step may return true (run again next frame) or a promise (wait for it, at most 3 s). */
function bootPost(steps,finish){ let i=0; BOOTP.total+=steps.reduce(function(a,s){ return a+(s[2]||1); },0);
  if(!BOOT.hold){ finish(); return; }   /* headless tests: these jobs never ran there (their timers do not fire) */
  let wait=null, frames=0; const T0=performance.now();
  const tick=function(){ const late=performance.now()-T0>6000;   /* a very slow device: finish now, the menu warms the rest */
    if(wait&&!late){ requestAnimationFrame(tick); return; } if(late) wait=null;
    if(++frames<3&&!late){ requestAnimationFrame(tick); return; }   /* let a couple of normal frames run first (lights, levels of detail) */
    const t0=performance.now();
    while(i<steps.length&&!wait){ const s=steps[i]; const r=bootStep(s);
      if(r===true&&!late) break;   /* again next frame */
      if(r&&typeof r.then==='function'&&!late){ wait=r; const to=BOOT.st(function(){ wait=null; },3000); r.then(function(){ wait=null; clearTimeout(to); },function(){ wait=null; }); }
      BOOTP.done+=s[2]||1; i++; bootMark('✓ '+s[0]); if(performance.now()-t0>30&&!late) break; }
    if(i>=steps.length&&!wait){ finish(); return; }
    bootShow(steps[i]&&steps[i][0]); requestAnimationFrame(tick); };
  requestAnimationFrame(tick); }
/* hide once frames come steadily or after a short wait. V2.38: 4 frames in a row under 40 ms (was 6) and at most 1.2 s (was 2.5 s);
   the phone report showed 1.2 s spent here after everything was ready (the menu behind runs at 10 FPS while covered anyway). */
function bootWhenSmooth(cb){ if(!BOOT.hold){ cb(); return; } let last=0, ok=0; const t0=performance.now();
  const f=function(t){ if(last&&t-last<40) ok++; else if(last) ok=0; last=t; if(ok>=4||performance.now()-t0>1200){ cb(); return; } requestAnimationFrame(f); }; requestAnimationFrame(f); }
function bootHide(){ try{ bootTipStop(); bootSndStop(); }catch(e){} const el=document.getElementById('boot'); if(!el) return; el.classList.add('out'); (BOOT.st||setTimeout)(function(){ if(el.parentNode) el.parentNode.removeChild(el); },450); }
/* aircraft progress bar: KAAN, HÜRJET, KIZILELMA, AKINCI, TB2 fill one after another (tail to nose) */
function bootBar(p){ const el=document.getElementById('bootPlanes'); if(!el||!el.children) return; const B=el.children, n=B.length;
  for(let i=0;i<n;i++){ const b=B[i], f=Math.max(0,Math.min(1,p*n-i)), fl=b.querySelector('.f'); if(!fl) continue;
    if(!b.dataset.w){ const w=b.getBoundingClientRect().width; if(w>0){ b.dataset.w='1'; b.style.setProperty('--w',w+'px'); } }
    fl.style.width=(f*100).toFixed(1)+'%'; b.classList.toggle('on',f>0&&f<1); b.classList.toggle('full',f>=1); }
  el.setAttribute('aria-valuenow',String(Math.round(p*100))); }

/* ------------------------------------------------------------------ loading screen 3.0 (V2.38, player decision 29 Oct)
   • Tip cards under the progress bar: a game tip, a control reminder or a short aircraft note, a new one every 3.5 s, starting
     at a random card so every start shows something different.
   • A soft sound after the first touch or key (browsers only allow sound after one): wind with a distant jet engine spooling
     up, quiet, fading out when the menu appears. Off when the saved master volume is 0. */
const BOOT_TIPS=[
 ['İpucu','Taksiyi atlamak için L tuşu ya da PİSTE GEÇ düğmesi: doğrudan pistte başlarsın.'],
 ['İpucu','Füze uyarısı gelince Z ile flare at, sert dön; F7 kaçış yardımını açar.'],
 ['İpucu','Hızlı Oyun → Hızlı Savaş: botlara karşı havada başlayan dört mod.'],
 ['İpucu','Rehber (ana menü): bütün özellikler, nereden açılır, hangi tuş.'],
 ['İpucu','Telefonda FLARE\'in yanındaki TEKER düğmesi iniş takımını açar ve kapatır.'],
 ['İpucu','Yürürken G ile araç çağır: tank, helikopter, gemi bulunduğun yere gelir.'],
 ['İpucu','M haritası: bir yere dokun, oraya ışınlan ya da işaret koy.'],
 ['İpucu','Bakım hangarına girip dur: silahlar yüklenir, hasar onarılır.'],
 ['İpucu','Kariyerde rütbe yükseldikçe yeni uçaklar, görevler ve boyalar açılır.'],
 ['İpucu','Uçuş okulundaki dersler ehliyet ve sertifika verir; belgesiz araç kullanılmaz.'],
 ['İpucu','F3 son uçuşu yeniden izletir; H fotoğraf modu.'],
 ['İpucu','Oyun yavaşsa Ayarlar → Grafik → Sorun giderme → Performans testi.'],
 ['İpucu','F8 kanat adamına emir verir: saldır, koru, dağıl, toplan.'],
 ['İpucu','Görevler → ＋ Görev editörü: kendi görevini kur, dene, arkadaşınla paylaş.'],
 ['İpucu','Gece görevinde ` tuşu gece görüş ve termal kamera arasında geçer.'],
 ['Kontrol','W/S burun, A/D yatış, Q/E dümen, R/F gaz, Shift art yakıcı.'],
 ['Kontrol','Space top, X seçili silah, N sıradaki silah, K hedef kilidi.'],
 ['Kontrol','Telefonda sol tarafın neresine dokunursan çubuk orada açılır.'],
 ['Kontrol','C kamera değiştirir; kokpitte ekranlar çalışır.'],
 ['TUSAŞ KAAN','Türkiye\'nin beşinci nesil muharip uçağı: iki motor, iç silah yuvası, düşük görünürlük.'],
 ['Baykar Kızılelma','İnsansız muharip uçak: jet motoru, düşük görünürlük, gemiden kalkabilen tasarım.'],
 ['Bayraktar Akıncı','Yüksek irtifada uzun süre uçan taarruz İHA\'sı; ağır mühimmat taşır.'],
 ['Bayraktar TB2','Dünyada en çok bilinen Türk SİHA\'sı; keşif ve hassas vuruş.'],
 ['TUSAŞ Hürjet','Jet eğitim ve hafif taarruz uçağı; pilot adayları burada yetişir.'],
 ['TUSAŞ ANKA-3','Kuyruksuz, uçan kanat biçimli insansız muharip uçak.'],
 ['TUSAŞ Aksungur','İki motorlu, uzun menzilli, ağır yük taşıyan İHA.']];
const BTIP={i:0, t:null};
function bootTipShow(){ const el=document.getElementById('bootTip'); if(!el) return; const tp=BOOT_TIPS[BTIP.i%BOOT_TIPS.length]; BTIP.i++;
  el.classList.remove('in'); void el.offsetWidth; el.innerHTML='<b>'+tp[0]+'</b>'+tp[1]; el.classList.add('in'); }
function bootTipStart(){ if(typeof document==='undefined'||!document.getElementById) return; const box=document.querySelector&&document.querySelector('#boot .bootc'); if(!box||document.getElementById('bootTip')) return;
  const p=document.createElement('p'); p.id='bootTip'; p.className='boottip'; box.appendChild(p); BTIP.i=Math.floor(Math.random()*BOOT_TIPS.length); bootTipShow();
  const st=BOOT.st||setTimeout; const loop=function(){ BTIP.t=st(function(){ if(!document.getElementById('bootTip')) return; bootTipShow(); loop(); },3500); }; loop(); }
function bootTipStop(){ if(BTIP.t) try{ clearTimeout(BTIP.t); }catch(e){} BTIP.t=null; }
/* sound */
const BSND={ac:null, g:null, on:false};
function bootVol(){ try{ const r=JSON.parse(localStorage.getItem('ayy-kayit')||'null'), s=r&&r.d&&JSON.parse(r.d['kaan-sim-settings']||'null'); if(s&&(s.volume===0||s.muted)) return 0; return s&&s.volume!=null?s.volume:0.8; }catch(e){ return 0.8; } }
function bootSndStart(){ if(BSND.on||!BOOT.hold) return; const v=bootVol(); if(!v) return; BSND.on=true;
  try{ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; const ac=new AC(), t=ac.currentTime, g=ac.createGain(); BSND.ac=ac; BSND.g=g; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.11*v,t+1.5); g.connect(ac.destination);
    const len=ac.sampleRate*2, b=ac.createBuffer(1,len,ac.sampleRate), d=b.getChannelData(0); let l=0; for(let i=0;i<len;i++){ l=(l+0.02*(Math.random()*2-1))/1.02; d[i]=l*3.5; }
    const n=ac.createBufferSource(); n.buffer=b; n.loop=true; const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=520; const lfo=ac.createOscillator(), lg=ac.createGain(); lfo.frequency.value=0.13; lg.gain.value=220; lfo.connect(lg); lg.connect(f.frequency); n.connect(f); f.connect(g); n.start(t); lfo.start(t);
    const o=ac.createOscillator(), og=ac.createGain(), of=ac.createBiquadFilter(); o.type='sawtooth'; o.frequency.setValueAtTime(70,t); o.frequency.exponentialRampToValueAtTime(190,t+9); of.type='lowpass'; of.frequency.value=600; og.gain.setValueAtTime(0.0001,t); og.gain.linearRampToValueAtTime(0.18,t+4);
    o.connect(of); of.connect(og); og.connect(g); o.start(t); }catch(e){ BSND.ac=null; } }
function bootSndStop(){ const ac=BSND.ac, g=BSND.g; if(!ac||!g) return; try{ const t=ac.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value,t); g.gain.linearRampToValueAtTime(0.0001,t+0.8); (BOOT.st||setTimeout)(function(){ try{ ac.close(); }catch(e){} },1000); }catch(e){} BSND.ac=null; }
(function(){ if(typeof window==='undefined'||!window.addEventListener) return; try{ bootTipStart(); }catch(e){}
})();
