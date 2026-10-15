/* ------------------------------------------------------------------ phone and save (V1.90)
   • Eğerek uç (tilt flying): on phones / tablets the aircraft can be steered by tilting the device (roll + pitch),
     with a calibration button (current holding angle = neutral), sensitivity and dead zone. Works with any screen orientation.
     iOS asks for motion permission the first time it is switched on.
   • Haptics: the existing rumble events (gun, hits, landing, crash, warnings) also vibrate the phone (navigator.vibrate).
   • Kayıt yedeği: all progress on this device (profile, career, records, settings, liveries, missions…) can be exported as a
     file or a copyable code and imported on another device / browser. Accounts are saved in the cloud already. */
const GYRO={on:false, ok:false, b0:null, g0:null, beta:0, gamma:0, roll:0, pitch:0, t:0};
function gyroAngle(){ try{ if(screen.orientation&&typeof screen.orientation.angle==='number') return screen.orientation.angle; }catch(e){} return typeof window.orientation==='number'?window.orientation:0; }
/* device angles -> (roll, pitch) in the current screen orientation, in degrees */
function gyroAxes(beta,gamma){ const a=((gyroAngle()%360)+360)%360;
  if(a===90) return [beta,-gamma]; if(a===270) return [-beta,gamma]; if(a===180) return [-gamma,beta]; return [gamma,-beta]; }
function gyroCal(){ const ax=gyroAxes(GYRO.beta,GYRO.gamma); GYRO.r0=ax[0]; GYRO.p0=ax[1]; GYRO.calA=gyroAngle(); toast('Eğim sıfırlandı: telefonu böyle tutunca uçak düz uçar','#7dffb0'); }
function gyroMap(v){ const dz=SETTINGS.gyroDz!=null?SETTINGS.gyroDz:3, full=(SETTINGS.gyroFull||25), s=Math.sign(v), a=Math.abs(v); if(a<dz) return 0; return s*clamp((a-dz)/(full-dz),0,1); }
function gyroOnEvt(e){ if(e.beta==null||e.gamma==null) return; GYRO.ok=true; GYRO.beta=e.beta; GYRO.gamma=e.gamma; GYRO.t=performance.now();
  if(GYRO.r0==null||GYRO.calA!==gyroAngle()) gyroCal(); }
function gyroStart(){ const go=function(){ window.addEventListener('deviceorientation',gyroOnEvt); GYRO.on=true; GYRO.r0=null; setTimeout(function(){ if(!GYRO.ok) toast('Bu cihazda eğim sensörü bulunamadı','#ffc24a'); },1500); };
  try{ if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){ DeviceOrientationEvent.requestPermission().then(function(r){ if(r==='granted') go(); else { SETTINGS.gyro=false; saveSettings(); syncSettingsUI(); toast('Hareket sensörü izni verilmedi','#ffc24a'); } }).catch(function(){ go(); }); return; } }catch(e){}
  go(); }
function gyroStop(){ window.removeEventListener('deviceorientation',gyroOnEvt); GYRO.on=false; GYRO.roll=GYRO.pitch=0; }
function gyroStep(){ if(!GYRO.on||!GYRO.ok||GYRO.r0==null){ GYRO.roll=GYRO.pitch=0; return; } const ax=gyroAxes(GYRO.beta,GYRO.gamma);
  let dr=ax[0]-GYRO.r0, dp=ax[1]-GYRO.p0; dr=((dr+540)%360)-180; dp=((dp+540)%360)-180; GYRO.roll=gyroMap(dr); GYRO.pitch=gyroMap(dp)*(SETTINGS.gyroInv?-1:1); }
pollPad=HOOK.wrap('pollPad','98-phone#_gyPoll',function(_gyPoll){ return function(){ _gyPoll(); gyroStep(); if(GYRO.on&&state==='play'&&!(typeof TOUCH!=='undefined'&&(TOUCH.roll||TOUCH.pitch))){ PAD.roll=clamp((PAD.roll||0)+GYRO.roll,-1,1); PAD.pitch=clamp((PAD.pitch||0)+GYRO.pitch,-1,1); } }; },pollPad);
/* ---- haptics on phones */
function hapticOK(){ return SETTINGS.rumble!==false&&typeof navigator!=='undefined'&&typeof navigator.vibrate==='function'&&(typeof DEV==='undefined'||DEV.mobile||('ontouchstart' in window)); }
const HAPT={last:0};
rumble=HOOK.wrap('rumble','98-phone#_hRumble',function(_hRumble){ return function(ms,weak,strong){ _hRumble(ms,weak,strong); if(!hapticOK()) return; const now=performance.now(); if(now-HAPT.last<60) return; HAPT.last=now;
  try{ navigator.vibrate(Math.round(clamp((ms||40)*Math.max(weak||0,strong||0,0.3),8,400))); }catch(e){} }; },rumble);
/* ---- save backup */
const SAVE_KEYS=/^(ayy-|kaan-|ayyildiz|kaan_)/i;
function saveCollect(){ const d={}; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(SAVE_KEYS.test(k)) d[k]=localStorage.getItem(k); } }catch(e){} return d; }
function saveExport(){ const data=saveCollect(); return {app:'AyYildiz-HedefKizilElma', kind:'save', ver:GAME_VERSION, at:new Date().toISOString(), n:Object.keys(data).length, data:data}; }
function b64e(s){ return btoa(unescape(encodeURIComponent(s))); } function b64d(s){ return decodeURIComponent(escape(atob(s))); }
function saveCode(){ return 'AYK1.'+b64e(JSON.stringify(saveExport())); }
function saveParse(txt){ txt=String(txt||'').trim(); let o=null;
  try{ if(/^AYK1\./.test(txt)) o=JSON.parse(b64d(txt.slice(5).replace(/\s+/g,''))); else o=JSON.parse(txt); }catch(e){ return {err:'Kayıt okunamadı (bozuk kod ya da dosya)'}; }
  if(!o||o.kind!=='save'||!o.data||typeof o.data!=='object') return {err:'Bu bir oyun kaydı değil'};
  const keys=Object.keys(o.data).filter(function(k){ return SAVE_KEYS.test(k)&&typeof o.data[k]==='string'; }); if(!keys.length) return {err:'Kayıt boş'};
  return {o:o, keys:keys}; }
function saveImport(txt,noReload){ const r=saveParse(txt); if(r.err){ toast(r.err,'#ff6a5a'); return false; }
  try{ Object.keys(saveCollect()).forEach(function(k){ localStorage.removeItem(k); }); r.keys.forEach(function(k){ localStorage.setItem(k,r.o.data[k]); }); }catch(e){ toast('Kayıt yazılamadı: tarayıcı depolaması kapalı olabilir','#ff6a5a'); return false; }
  toast('Kayıt yüklendi ('+r.keys.length+' öğe, '+(r.o.ver||'')+') — oyun yeniden başlıyor','#7dffb0'); if(!noReload) setTimeout(function(){ try{ location.reload(); }catch(e){} },1200); return true; }
function saveDownload(){ const o=saveExport(), blob=new Blob([JSON.stringify(o,null,1)],{type:'application/json'}), a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='ay-yildiz-kayit-'+new Date().toISOString().slice(0,10)+'.json'; document.body.appendChild(a); a.click(); setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },2000);
  toast(o.n+' öğe dosyaya yazıldı','#7dffb0'); }
/* ---- settings UI */
(function(){ const g=$('setGyro'); if(g) g.addEventListener('change',function(){ SETTINGS.gyro=g.checked; saveSettings(); if(g.checked) gyroStart(); else gyroStop(); });
  const c=$('btnGyroCal'); if(c) c.addEventListener('click',function(){ if(!GYRO.on){ toast('Önce "Eğerek uç"u aç','#ffc24a'); return; } gyroCal(); });
  const sv=$('setGyroSens'); if(sv) sv.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.gyroFull=+b.dataset.f; saveSettings(); syncSettingsUI(); });
  const iv=$('setGyroInv'); if(iv) iv.addEventListener('change',function(){ SETTINGS.gyroInv=iv.checked; saveSettings(); });
  const ex=$('btnSaveFile'); if(ex) ex.addEventListener('click',saveDownload);
  const cp=$('btnSaveCode'); if(cp) cp.addEventListener('click',function(){ const t=$('saveTxt'); t.value=saveCode(); t.classList.remove('hidden'); try{ t.select(); navigator.clipboard&&navigator.clipboard.writeText(t.value).then(function(){ toast('Kayıt kodu panoya kopyalandı','#7dffb0'); }).catch(function(){}); }catch(e){} });
  const im=$('btnSaveLoad'); if(im) im.addEventListener('click',function(){ const t=$('saveTxt'); if(t.classList.contains('hidden')||!t.value.trim()){ t.value=''; t.classList.remove('hidden'); t.placeholder='Kayıt kodunu buraya yapıştır ve tekrar "Kodu yükle"ye bas'; t.focus(); return; } saveImport(t.value); });
  const fi=$('saveFile'); if(fi) fi.addEventListener('change',function(){ const f=fi.files&&fi.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=function(){ saveImport(String(rd.result||'')); }; rd.readAsText(f); fi.value=''; });
  const fb=$('btnSaveOpen'); if(fb) fb.addEventListener('click',function(){ $('saveFile').click(); });
  const ta=$('saveTxt'); if(ta) ta.addEventListener('keydown',function(e){ e.stopPropagation(); });
  if(SETTINGS.gyro) setTimeout(gyroStart,500); })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','98-phone#_phSync',function(_phSync){ return function(){ _phSync(); const g=$('setGyro'); if(g) g.checked=!!SETTINGS.gyro; const iv=$('setGyroInv'); if(iv) iv.checked=!!SETTINGS.gyroInv;
  const sv=$('setGyroSens'); if(sv) Array.prototype.forEach.call(sv.children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.f===(SETTINGS.gyroFull||25))); });
  const n=$('saveInfo'); if(n){ const c=Object.keys(saveCollect()).length; n.textContent='Bu cihazda '+c+' kayıt öğesi var'+(typeof ACC!=='undefined'&&ACC.user?' · hesabın bulutta da kayıtlı':' · misafir oyuncu (yalnızca bu tarayıcıda)'); } }; },syncSettingsUI);
