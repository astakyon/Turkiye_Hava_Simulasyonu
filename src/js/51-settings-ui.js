/* ------------------------------------------------------------------ settings / records / photo UI */
const MODALS=['controls','settings','records','photoResult','netUI'];
function openModal(id){ $(id).classList.remove('hidden'); }
function closeModals(){ MODALS.forEach(function(id){ $(id).classList.add('hidden'); }); }
function anyModalOpen(){ return MODALS.some(function(id){ return !$(id).classList.contains('hidden'); }); }
function syncSettingsUI(){
  $('setVer').textContent='Sürüm '+GAME_VERSION;
  $('setVol').value=Math.round(SETTINGS.volume*100); $('setVolV').textContent=Math.round(SETTINGS.volume*100)+'%';
  $('setSens').value=Math.round(SETTINGS.sens*100); $('setSensV').textContent=Math.round(SETTINGS.sens*100)+'%';
  Array.prototype.forEach.call($('setQ').children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.q===SETTINGS.quality)); });
  Array.prototype.forEach.call($('setFx').children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.f===fxWanted())); });
  Array.prototype.forEach.call($('setShadow').children,function(b){ b.setAttribute('aria-pressed',String((b.dataset.s==='1')===shadowsOn())); });
  Array.prototype.forEach.call($('setUi').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.u===(SETTINGS.ui||'auto'))); });
  $('setLock').checked=SETTINGS.lockOn; $('setInv').checked=invertY; $('setRumble').checked=SETTINGS.rumble; $('setAuto').checked=SETTINGS.autoPerf; $('setFps').checked=SETTINGS.fps; $('fps').classList.toggle('hidden',!SETTINGS.fps);
  Array.prototype.forEach.call($('setBomb').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.b===SETTINGS.bombAssist)); });
  Array.prototype.forEach.call($('setTouch').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.t===SETTINGS.touch)); });
}
function renderRecords(){
  const cell=function(v){ return '<td'+(v!=null?'':' class="dim"')+'>'+(v!=null?v:'—')+'</td>'; };
  $('recBody').innerHTML=AC_ORDER.map(function(id){
    const r=RECORDS[id]||{}, mt=r.mt||{}, f=function(x){ return x!=null?fmtT(x):null; };
    return '<tr><td>'+AIRCRAFT[id].short+'</td>'+cell(f(r.best))+cell(f(mt.strike))+cell(f(mt.air))+cell(f(mt.recon))+cell(r.score>0?r.score:null)+'</tr>';
  }).join('');
  $('btnRecReset').textContent='Rekorları sıfırla';
}
$('btnSettings').addEventListener('click',function(){ syncSettingsUI(); openModal('settings'); });
$('btnPauseSettings').addEventListener('click',function(){ syncSettingsUI(); openModal('settings'); });
$('btnSetClose').addEventListener('click',closeModals);
$('setVol').addEventListener('input',function(e){ SETTINGS.volume=+e.target.value/100; $('setVolV').textContent=e.target.value+'%'; applyVolume(); saveSettings(); });
$('setSens').addEventListener('input',function(e){ SETTINGS.sens=+e.target.value/100; $('setSensV').textContent=e.target.value+'%'; saveSettings(); });
$('setQ').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.quality=+b.dataset.q; applyQuality(); saveSettings(); syncSettingsUI(); });
$('setBomb').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.bombAssist=b.dataset.b; saveSettings(); syncSettingsUI(); });
$('setTouch').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.touch=b.dataset.t; saveSettings(); syncSettingsUI(); });
$('btnFull').addEventListener('click',function(){ try{ const el=document.documentElement; (el.requestFullscreen||el.webkitRequestFullscreen).call(el); }catch(err){} });
$('setLock').addEventListener('change',function(e){ SETTINGS.lockOn=e.target.checked; saveSettings(); lockTgt=null; lockT=0; });
$('setInv').addEventListener('change',function(e){ invertY=e.target.checked; SETTINGS.invert=invertY; saveSettings(); });
$('setRumble').addEventListener('change',function(e){ SETTINGS.rumble=e.target.checked; saveSettings(); });
$('setAuto').addEventListener('change',function(e){ SETTINGS.autoPerf=e.target.checked; if(!SETTINGS.autoPerf){ PERF.scale=1; applyQuality(); } saveSettings(); });
$('setFps').addEventListener('change',function(e){ SETTINGS.fps=e.target.checked; $('fps').classList.toggle('hidden',!SETTINGS.fps); saveSettings(); });
$('btnRecords').addEventListener('click',function(){ renderRecords(); openModal('records'); });
$('btnRecClose').addEventListener('click',closeModals);
$('btnRecReset').addEventListener('click',function(){
  if($('btnRecReset').textContent!=='Emin misin? Tekrar tıkla'){ $('btnRecReset').textContent='Emin misin? Tekrar tıkla'; return; }
  RECORDS={}; saveRecords(); renderRecords(); refreshHangarUI();
});
let photoPrevCam=0;
function enterPhoto(){ if(state!=='play') return; state='photo'; photoPrevCam=camMode; camMode=0; camSnap=true; $('photoBar').classList.remove('hidden'); }
function exitPhoto(){ if(state!=='photo') return; state='play'; camMode=photoPrevCam; camSnap=true; $('photoBar').classList.add('hidden'); $('gl').focus(); }
function takePhoto(){
  renderFrame(0);
  let url=''; try{ url=renderer.domElement.toDataURL('image/png'); }catch(e){ url=''; }
  $('photoImg').src=url||'';
  $('photoNote').textContent=url?'Kaydetmek için görüntüye sağ tıkla (telefonda uzun bas) ve "Resmi kaydet"i seç.':'Bu tarayıcı ekran görüntüsüne izin vermedi.';
  openModal('photoResult');
}
$('btnShot').addEventListener('click',takePhoto);
$('btnPhotoExit').addEventListener('click',exitPhoto);
$('btnPhotoClose').addEventListener('click',closeModals);

