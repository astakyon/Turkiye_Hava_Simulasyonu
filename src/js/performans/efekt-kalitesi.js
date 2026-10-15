/* ------------------------------------------------------------------ effect chain and smart quality (V2.13)
   First real-device report (MSI Katana 15, game running on the Intel UHD instead of the laptop's NVIDIA card, quality Ultra):
   43 ms per frame, 38 ms of it on the GPU, and the post-effect chain alone took 28.7 ms (61 %): at Ultra the scene went into a
   half-float (HDR) target with 8× MSAA and bloom started at full resolution. Logarithmic depth cost only 1.5 ms.
   • GPU class from the WebGL renderer name: integrated (Intel, AMD APU), discrete, Apple, phone, software.
   • Integrated GPUs: no HDR target, no automatic MSAA (FXAA instead; an explicit 8× choice is capped at 4×), bloom from
     quarter resolution, bloom only at Ultra. Everywhere else bloom starts at half resolution except Ultra on a discrete GPU.
   • Frame pacing: with the FPS limit on "Otomatik", a device that cannot hold 60 on a 60 Hz screen is locked to an even 30
     (frames were alternating 33 / 50 ms = visible judder); every 20 s it tries without the lock and keeps whichever is better.
   • Performance test: "Önerilen ayarları uygula" turns the measured feature costs into a settings set that reaches the target,
     and a tip tells laptop owners how to move the browser to the discrete GPU (Windows graphics settings). */
function gpuClass(name){ const g=String(name==null?DEV.gpu:name||'').toLowerCase();
  if(/swiftshader|llvmpipe|softpipe|microsoft basic/.test(g)) return 'soft';
  if(name==null&&DEV.mobile) return 'mobile';
  if(/adreno|mali|powervr|xclipse|immortalis|videocore/.test(g)) return 'mobile';
  if(/apple (m\d|gpu)/.test(g)) return 'apple';
  if(/nvidia|geforce|quadro|rtx|gtx|radeon rx|radeon pro|radeon\(tm\) rx|arc\(tm\) a\d|arc a\d|firepro/.test(g)) return 'dgpu';
  if(/intel|uhd|iris|hd graphics|radeon\(tm\) graphics|radeon graphics|vega \d+ graphics|radeon\(tm\) \d{3}m/.test(g)) return 'igpu';
  return 'dgpu'; }
const GPUC_TXT={igpu:'tümleşik ekran kartı', dgpu:'ayrı ekran kartı', apple:'Apple ekran kartı', mobile:'telefon/tablet ekran kartı', soft:'yazılım (ekran kartı yok)'};
/* ---- effect chain */
fxDefault=HOOK.wrap('fxDefault','performans/efekt-kalitesi#_q13Def',function(_q13Def){ return function(){ if(!DEV.mobile&&gpuClass()==='igpu'){ const q=SETTINGS.quality||0; return q>=3?2:q>=2?1:0; } return _q13Def(); }; },fxDefault);
function fxBloomScale(){ const c=gpuClass(); if(c==='igpu'||c==='mobile'||c==='soft') return 0.5; return (SETTINGS.quality>=3&&(c==='dgpu'||c==='apple'))?1:0.5; }   /* the pass itself starts at half of this */
function fxAAChoice(){ const c=gpuClass(), set=SETTINGS.aa&&SETTINGS.aa!=='auto'?SETTINGS.aa:null;
  if(set) return (c==='igpu'&&set==='msaa8')?'msaa4':set;
  if(DEV.mobile) return (SETTINGS.quality>=2&&!DEV.safe)?'msaa4':'auto';   /* V2.28: phones at Yüksek/Ultra get 4× MSAA in the effect target instead of FXAA (sharper edges; cheap on phone GPUs) */ if(c==='igpu'||c==='soft') return 'fxaa'; return SETTINGS.quality>=3?'msaa8':'auto'; }
fxBuild=function(){
  const gl=renderer.getContext(), w2=!!renderer.capabilities.isWebGL2, cls=gpuClass();
  const halfOK=w2?!!(gl.getExtension('EXT_color_buffer_float')||gl.getExtension('EXT_color_buffer_half_float')):!!(gl.getExtension('OES_texture_half_float')&&gl.getExtension('EXT_color_buffer_half_float'));
  FX.hdr=halfOK&&FX.level>=2&&!DEV.mobile&&!DEV.safe&&cls!=='igpu'&&cls!=='soft';
  const pr=renderer.getPixelRatio(), W=Math.max(1,Math.round(HW*pr)), H=Math.max(1,Math.round(HH*pr));
  const opts={minFilter:THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat, type:FX.hdr?THREE.HalfFloatType:THREE.UnsignedByteType, depthBuffer:true, stencilBuffer:true /* r128: without stencil the depth buffer is 16 bit */};
  const aa=fxAAChoice(); let rt; FX.msaa=w2&&!!THREE.WebGLMultisampleRenderTarget&&(aa==='msaa4'||aa==='msaa8'||(aa==='auto'&&!DEV.mobile));
  if(FX.msaa){ rt=new THREE.WebGLMultisampleRenderTarget(W,H,opts); let mx=4; try{ mx=gl.getParameter(gl.MAX_SAMPLES)||4; }catch(e){} rt.samples=Math.min(aa==='msaa8'?8:4,mx); FX.samples=rt.samples; } else { rt=new THREE.WebGLRenderTarget(W,H,opts); FX.samples=0; }
  if(FX.composer){ try{ FX.composer.renderTarget1.dispose(); FX.composer.renderTarget2.dispose(); }catch(e){} }
  const c=new THREE.EffectComposer(renderer,rt); c.setPixelRatio(pr); c.setSize(HW,HH);
  c.addPass(new THREE.RenderPass(scene,camera));
  FX.bloom=null;
  if(FX.level>=2){ const f=fxBloomScale(); FX.bloomScale=f; FX.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(Math.round(HW*f),Math.round(HH*f)),FX.hdr?0.75:0.25,0.42,FX.hdr?1.9:0.94);
    const bs=FX.bloom.setSize.bind(FX.bloom); FX.bloom.setSize=function(w,h){ bs(Math.max(1,Math.round(w*f)),Math.max(1,Math.round(h*f))); }; c.addPass(FX.bloom); }
  FX.grade=new THREE.ShaderPass(GRADE_SHADER); FX.grade.uniforms.uHdr.value=FX.hdr?1:0; c.addPass(FX.grade);
  FX.fxaa=null; if(!FX.msaa&&aa!=='off'){ FX.fxaa=new THREE.ShaderPass(THREE.FXAAShader); c.addPass(FX.fxaa); }
  FX.composer=c; fxResize(); FX.cls=cls; FX.aa=FX.msaa?'msaa'+FX.samples:(FX.fxaa?'fxaa':'kapalı');
};
/* ---- frame pacing: even 30 instead of 33/50 judder (FPS limit "Otomatik") */
const PACE={cap:0, low:0, t:0, hold:0, probe:0, told:false};
fpsCap=HOOK.wrap('fpsCap','performans/efekt-kalitesi#_q13Cap',function(_q13Cap){ return function(){ if(SETTINGS.fpsCap==null&&!(typeof PT!=='undefined'&&PT.run)&&PACE.cap) return PACE.cap; return _q13Cap(); }; },fpsCap);
function paceStep(){ if(SETTINGS.fpsCap!=null||(typeof PT!=='undefined'&&PT.run)||(state!=='play'&&state!=='walk')){ PACE.cap=0; PACE.low=0; PACE.probe=0; return; }
  const fps=PERF.fps;
  if(PACE.probe>0){ PACE.probe--; if(PACE.probe===0){ if(fps>=55){ PACE.cap=0; PACE.low=0; } else { PACE.cap=30; PACE.hold=0; } } return; }
  if(!PACE.cap){ const ladderBusy=SETTINGS.autoPerf&&PERF2.lvl===0&&fps<38&&(!SETTINGS.res||SETTINGS.res==='auto')&&PERF.scale>perfMin()+0.001;   /* let resolution drop first */
    if(fps>=22&&fps<50&&!ladderBusy) PACE.low++; else PACE.low=0;
    if(PACE.low>=6){ PACE.cap=30; PACE.hold=0; PACE.low=0; PERF2.capLast=0; if(!PACE.told){ PACE.told=true; toast('Daha akıcı görüntü için kareler eşit aralıklı 30 FPS\'e sabitlendi (Ayarlar → Grafik → FPS sınırı)','#b8ecff'); } } }
  else { PACE.hold++; if(PACE.hold>=20){ PACE.hold=0; PACE.cap=0; PACE.probe=3; } } }
perfStep=HOOK.wrap('perfStep','performans/efekt-kalitesi#_q13PS',function(_q13PS){ return function(dt){ const n0=PERF.n; _q13PS(dt); if(PERF.n===0&&n0>0){ try{ paceStep(); }catch(e){} } }; },perfStep);
/* the ladder must not read a locked 30 as "too slow" */
perfLadder=HOOK.wrap('perfLadder','performans/efekt-kalitesi#_q13Lad',function(_q13Lad){ return function(){ if(PACE.cap&&PERF.fps>=26){ PERF2.bad=0; return; } return _q13Lad(); }; },perfLadder);
/* FPS limit row: "Otomatik" */
(function(){ const c=$('setCap'); if(!c||!document.createElement||c.querySelector('[data-c="auto"]')) return; const b=document.createElement('button'); b.type='button'; b.dataset.c='auto'; b.textContent='Otomatik'; c.insertBefore(b,c.firstChild);
  c.addEventListener('click',function(e){ const t=e.target.closest('button[data-c="auto"]'); if(!t) return; e.stopImmediatePropagation(); SETTINGS.fpsCap=null; PACE.cap=0; PERF2.capLast=0; saveSettings(); syncSettingsUI(); },true);
  const sm=c.closest&&c.closest('.srow'); const s=sm&&sm.querySelector('small'); if(s) s.textContent='Otomatik: telefonda 60; 60\'ı tutamayan cihazda titreme olmasın diye eşit aralıklı 30 · 30: pil tasarrufu · Sınırsız: yüksek yenileme hızlı ekranlar'; })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','performans/efekt-kalitesi#_q13Sync',function(_q13Sync){ return function(){ _q13Sync(); const c=$('setCap'); if(c) Array.prototype.forEach.call(c.children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.c==='auto'?SETTINGS.fpsCap==null:(SETTINGS.fpsCap!=null&&+b.dataset.c===+SETTINGS.fpsCap))); }); }; },syncSettingsUI);
/* ---- performance test: recommended settings */
function ptRecommend(r){ const b=r&&r.base; if(!b||!r.feats) return null; const hz=Math.min(60,r.refresh||60), tgt=1000/hz*0.92;
  const cost=function(id){ const f=r.feats.find(function(x){ return x.id===id; }); if(!f) return 0; return Math.max(0,f.gpu!=null?Math.max(f.gpu,f.ms):f.ms); };
  let est=b.gpu!=null?Math.max(b.ms,b.gpu):b.ms; const set={}, ch=[];
  if(est<=tgt) return {set:set, ch:ch, est:est, ok:true};
  const opts=[['efekt',function(){ set.fx=0; ch.push('Görsel efektler: Kapalı'); }],['golge',function(){ set.shadows=false; ch.push('Gölgeler: Kapalı'); }],['logderinlik',function(){ set.depth='std'; ch.push('Derinlik hassasiyeti: Standart (sayfa yenilenince)'); }]].map(function(o){ return [o[0],o[1],cost(o[0])]; }).sort(function(a,b){ return b[2]-a[2]; });
  opts.forEach(function(o){ if(est>tgt&&o[2]>0.8){ o[1](); est-=o[2]; } });
  const rc=cost('cozunurluk'), d=r.dev||{}; if(est>tgt&&rc>0.8&&(d.dpr||1)*0.75<(d.pr||1)-0.05){ set.res='0.75'; ch.push('Çözünürlük: %75'); est-=rc*0.55; }   /* res is relative to the screen: only when it really lowers the pixel count */
  if(est>tgt&&(r.set&&r.set.quality>1)){ set.quality=Math.max(1,(r.set.quality||1)-1); ch.push('Grafik kalitesi: '+['Düşük','Orta','Yüksek','Ultra'][set.quality]); est*=0.85; }
  if(est>tgt&&est<=1000/30*0.92&&hz>=60&&r.set&&r.set.fpsCap!=null){ set.fpsCap=null; ch.push('FPS sınırı: Otomatik (60 tutmazsa eşit aralıklı 30)'); }
  const cpuBound=b.cpu>=b.ms*0.55; return {set:set, ch:ch, est:Math.max(4,est), ok:false, cpu:cpuBound}; }
function ptApplyRec(rec){ if(!rec||!rec.ch.length) return; const s=rec.set; Object.keys(s).forEach(function(k){ SETTINGS[k]=s[k]; }); if(s.fx!=null) SETTINGS.fx=s.fx; PERF.scale=1; PERF2.lvl=0;
  saveSettings(); applyQuality(); try{ syncSettingsUI(); }catch(e){} toast('Önerilen ayarlar uygulandı'+(s.depth?' — derinlik değişikliği için sayfayı yenile':''),'#7dffb0'); }
/* tips: integrated GPU on a laptop that may have a discrete one */
ptTips=HOOK.wrap('ptTips','performans/efekt-kalitesi#_q13Tips',function(_q13Tips){ return function(r){ const T=_q13Tips(r).filter(function(t){ return !/Logaritmik derinlik bu bilgisayarda pahalı/.test(t); }), d=r.dev||{};
  const lg=(r.feats||[]).find(function(f){ return f.id==='logderinlik'; }); if(lg&&(lg.gpu!=null?lg.gpu:lg.ms90)>3) T.push('Logaritmik derinlik bu bilgisayarda '+String(lg.gpu!=null?lg.gpu:lg.ms90).replace('.',',')+' ms tutuyor; V2.17\'de kaldırılacak.');
  if(!d.mobile&&gpuClass(d.gpu)==='igpu') T.unshift('Oyun tümleşik ekran kartında ('+String(d.gpu).replace(/^ANGLE \(|\)$/g,'').split(',').slice(0,2).join(',')+') çalışıyor. Bilgisayarında ayrı bir NVIDIA ya da AMD kart varsa: Windows Ayarlar → Sistem → Ekran → Grafik → tarayıcını seç → Seçenekler → Yüksek performans → tarayıcıyı yeniden başlat. Fark çok büyük olur.');
  return T.map(function(t){ return t.replace(/V2\.16'da kaldırılacak/,'V2.17\'de kaldırılacak').replace(/V2\.17'de küçültülecek/,'V2.18\'de küçültülecek').replace(/shader ön derleme \(V2\.18\)/,'shader ön derleme (V2.19)'); }); }; },ptTips);
ptResults=HOOK.wrap('ptResults','performans/efekt-kalitesi#_q13Res',function(_q13Res){ return function(rep,list){ try{ if(rep&&rep.dev) rep.tips=ptTips(rep); }catch(e){} _q13Res(rep,list); const el=$('ptResUI'); if(!el) return; const rec=ptRecommend(rep); const tips=el.querySelector('.pttips'); if(!rec||!tips) return;
  const box=document.createElement('div'); box.className='ptrec';
  if(rec.ok) box.innerHTML='<b>Ayarların bu cihaz için uygun.</b> <small>Ölçülen kare süresi hedefin içinde.</small>';
  else if(!rec.ch.length) box.innerHTML=rec.cpu?'<b>Ayar değiştirmek yetmiyor.</b> <small>Bu cihazda darboğaz işlemci (nesne ve çizim sayısı). Birleştirme ve sadeleştirme sürümleri (V2.14–V2.16) bunu doğrudan hedefliyor.</small>':'<b>Önerilecek ayar bulunamadı.</b> <small>Kalite ayarlarıyla hedefe inilemiyor.</small>';
  else { box.innerHTML='<div><b>Önerilen ayarlar</b> <small>(tahmini kare '+String(Math.round(rec.est*10)/10).replace('.',',')+' ms ≈ '+Math.round(1000/rec.est)+' FPS)</small><ul>'+rec.ch.map(function(c){ return '<li>'+c+'</li>'; }).join('')+'</ul></div><button class="btn primary sm" type="button" data-pt="rec">Önerilen ayarları uygula</button>';
    box.querySelector('[data-pt="rec"]').addEventListener('click',function(e){ e.stopPropagation(); ptApplyRec(rec); this.disabled=true; this.textContent='Uygulandı ✓'; }); }
  tips.parentNode.insertBefore(box,tips.nextSibling); }; },ptResults);
/* first start on an integrated GPU of a strong laptop: one hint (a discrete card may be sitting idle) */
setTimeout(function(){ try{ if(DEV.mobile||SETTINGS.igpuTold||gpuClass()!=='igpu') return; const cores=navigator.hardwareConcurrency||0, mem=navigator.deviceMemory||0; if(cores<8&&mem<16) return;
  SETTINGS.igpuTold=true; saveSettings(); toast('Oyun tümleşik ekran kartında çalışıyor. Bilgisayarında NVIDIA/AMD kart varsa Windows → Ayarlar → Sistem → Ekran → Grafik bölümünden tarayıcını "Yüksek performans" yap.','#ffc24a'); }catch(e){} },9000);
