/* ------------------------------------------------------------------ settings / records / photo UI */
const MODALS=['controls','settings','records','photoResult','netUI','sndLib','acctUI','adminUI','callUI','hmEnd','edUI'];
function openModal(id){ $(id).classList.remove('hidden'); if(id==='settings') setSnapshot(); }
function closeModals(){ MODALS.forEach(function(id){ $(id).classList.add('hidden'); }); }
function anyModalOpen(){ return MODALS.some(function(id){ return !$(id).classList.contains('hidden'); }); }
function syncSettingsUI(){
  if(typeof ctlUI==='function') ctlUI();
  $('setVer').textContent='Sürüm '+GAME_VERSION;
  $('setVol').value=Math.round(SETTINGS.volume*100); $('setVolV').textContent=Math.round(SETTINGS.volume*100)+'%';
  $('setSens').value=Math.round(SETTINGS.sens*100); $('setSensV').textContent=Math.round(SETTINGS.sens*100)+'%';
  Array.prototype.forEach.call($('setQ').children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.q===SETTINGS.quality)); });
  Array.prototype.forEach.call($('setTod').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.t===(SETTINGS.tod||'day'))); });
  Array.prototype.forEach.call($('setFx').children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.f===fxWanted())); });
  { const custom=SETTINGS.fx!=null||SETTINGS.shadows!=null||(SETTINGS.aa&&SETTINGS.aa!=='auto')||(SETTINGS.res&&SETTINGS.res!=='auto');
    $('setQInfo').textContent=custom?'Özel: hazır ayarın üstüne kendi seçimlerin uygulanıyor (bir hazır ayara dokununca sıfırlanır)':['Düşük: en akıcı, telefonlar için','Orta: dengeli','Yüksek: gölge ve efektler açık','Ultra: güçlü bilgisayarlar için, 4096 gölge, MSAA 8x, en uzak ayrıntı'][SETTINGS.quality]; }
  Array.prototype.forEach.call($('setRes').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.r===String(SETTINGS.res||'auto'))); });
  Array.prototype.forEach.call($('setAA').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.a===(SETTINGS.aa||'auto'))); });
  Array.prototype.forEach.call($('setDepth').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.d===(SETTINGS.depth||'auto'))); });
  $('btnSafe').textContent=SETTINGS.safeMode?'Güvenli modu kapat':'Güvenli mod';
  Array.prototype.forEach.call($('setShadow').children,function(b){ b.setAttribute('aria-pressed',String((b.dataset.s==='1')===shadowsOn())); });
  Array.prototype.forEach.call($('setUiz').children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.z===(SETTINGS.uiz||1))); });
  Array.prototype.forEach.call($('setCb').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.c===(SETTINGS.cb||'off'))); });
  $('setHc').checked=!!SETTINGS.hc; $('setRm').checked=!!SETTINGS.rm; $('setRadioSub2').checked=SETTINGS.radioSub!==false; $('setRumble2').checked=SETTINGS.rumble;
  $('setAdv').checked=!!SETTINGS.advUi; $('settings').classList.toggle('basic',!SETTINGS.advUi); $('btnSetUndo').disabled=!setChanged();
  { const c=(typeof accCfg==='function')&&accCfg(); $('setSupaUrl').value=c?c.url:''; $('setSupaKey').value=c&&!ACCOUNT_CFG.key?c.key:''; }
  if(typeof sndMixHTML==='function') $('setMix').innerHTML=sndMixHTML();
  $('setRadioTts').checked=SETTINGS.radioTts!==false; $('setRadioSub').checked=SETTINGS.radioSub!==false; $('setCallsign').value=SETTINGS.callsign||'';
  $('setMusic').checked=SETTINGS.music!==false; Array.prototype.forEach.call($('setMusMode').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.m===musMode())); }); $('setUiSnd').checked=SETTINGS.uiSnd!==false;
  $('setMini').checked=!!SETTINGS.minimap; $('setLock').checked=SETTINGS.lockOn; $('setInv').checked=invertY; $('setRumble').checked=SETTINGS.rumble; $('setAuto').checked=SETTINGS.autoPerf; $('setFps').checked=SETTINGS.fps; $('fps').classList.toggle('hidden',!SETTINGS.fps);
  if($('setFuel')) Array.prototype.forEach.call($('setFuel').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.f===(SETTINGS.fuel||'on'))); });
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
$('setQ').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.quality=+b.dataset.q;
  /* a preset clears the individual overrides so its own defaults apply */
  SETTINGS.fx=null; SETTINGS.shadows=null; SETTINGS.aa='auto'; SETTINGS.res='auto'; PERF.scale=1; FX.failed=false; applyQuality(); saveSettings(); syncSettingsUI(); });
if($('setFuel')) $('setFuel').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.fuel=b.dataset.f; saveSettings(); syncSettingsUI(); });
$('setBomb').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.bombAssist=b.dataset.b; saveSettings(); syncSettingsUI(); });
$('setTouch').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.touch=b.dataset.t; saveSettings(); syncSettingsUI(); });
$('btnFull').addEventListener('click',function(){ try{ const el=document.documentElement; (el.requestFullscreen||el.webkitRequestFullscreen).call(el); }catch(err){} });
$('setMini').addEventListener('change',function(e){ SETTINGS.minimap=e.target.checked; saveSettings(); });
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


/* ---- graphics diagnostics */
function gfxDiag(){
  const i=renderer.info, on=function(b){ return b?'açık':'kapalı'; }, sc=Math.round(renderer.getPixelRatio()*100)/100;
  const rows=[['Cihaz',DEV.kind+(DEV.ios?' · iOS':DEV.android?' · Android':'')],['Ekran kartı',DEV.gpu],['WebGL',DEV.webgl+' · hassasiyet '+(DEV.hp||'?')+' · derinlik '+(DEV.depthBits||'?')+' bit'],
    ['Ekran',innerWidth+'×'+innerHeight+' · cihaz oranı '+(window.devicePixelRatio||1)],['Çizim ölçeği',sc+'x'+(PERF.scale<1?' (otomatik düşürüldü)':'')],
    ['FPS',Math.round(PERF.fps)],['Çizim çağrısı',i.render.calls+' · gizlenen uzak nesne '+(CULL.list.filter(function(o){ return !o.layers.test(camera.layers); }).length)+'/'+CULL.list.length],['Üçgen',i.render.triangles.toLocaleString('tr-TR')],['Doku / geometri',i.memory.textures+' / '+i.memory.geometries],
    ['Derinlik',DEV.logDepth?'logaritmik':'standart (yakın düzlem '+(camera.near||0).toFixed(2)+' m)'],['Gölgeler',on(renderer.shadowMap.enabled)+(renderer.shadowMap.enabled?' · '+sunLight.shadow.mapSize.x+' px':'')],
    ['Efektler',FX.on?('seviye '+FX.level+(FX.hdr?' · HDR':'')+(FX.msaa?' · MSAA '+(FX.samples||4)+'x':FX.fxaa?' · FXAA':'')):'kapalı'],['Kenar yumuşatma',on(!DEV.safe)],['Güvenli mod',on(DEV.safe)]];
  $('gdiag').innerHTML=rows.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'; }).join('');
}
let gdiagT=null;
$('btnDiag').addEventListener('click',function(){ const el=$('gdiag'), show=el.classList.contains('hidden'); el.classList.toggle('hidden',!show); this.textContent=show?'Gizle':'Göster';
  clearInterval(gdiagT); if(show){ gfxDiag(); gdiagT=setInterval(function(){ if(el.classList.contains('hidden')||$('settings').classList.contains('hidden')){ clearInterval(gdiagT); return; } gfxDiag(); },700); } });
$('setDepth').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; const v=b.dataset.d; if(v===(SETTINGS.depth||'auto')) return;
  SETTINGS.depth=v; saveSettings(); syncSettingsUI(); toast('Derinlik ayarı sayfa yenilenince uygulanacak','#ffc24a'); if(confirmReload('Derinlik ayarı için sayfa şimdi yenilensin mi?')) location.reload(); });
$('btnSafe').addEventListener('click',function(){
  if(SETTINGS.safeMode){ SETTINGS.safeMode=false; delete SETTINGS.depth; SETTINGS.fx=null; SETTINGS.shadows=null; }
  else { SETTINGS.safeMode=true; SETTINGS.depth='std'; SETTINGS.fx=0; SETTINGS.shadows=false; SETTINGS.quality=0; }
  saveSettings(); location.reload(); });
function confirmReload(q){ try{ return window.confirm(q); }catch(e){ return false; } }
$('setRes').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.res=b.dataset.r; PERF.scale=1; saveSettings(); applyQuality(); syncSettingsUI(); });
$('setAA').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.aa=b.dataset.a; saveSettings(); if(FX.on){ try{ fxBuild(); }catch(err){} } syncSettingsUI(); });
$('btnSndOpen').addEventListener('click',function(){ openSoundLib(); });
$('setMusic').addEventListener('change',function(e){ SETTINGS.music=e.target.checked; saveSettings(); });
$('setMusMode').addEventListener('click',function(e){ const b=e.target.closest('button[data-m]'); if(!b) return; SETTINGS.musMode=b.dataset.m; MUS.rest=0; MUS.phName=null; saveSettings(); syncSettingsUI(); });
$('setUiSnd').addEventListener('change',function(e){ SETTINGS.uiSnd=e.target.checked; saveSettings(); });
/* interface sounds: clicks, back, confirm, hover (mouse only) */
(function(){ let last=null, lastT=0;
  document.addEventListener('click',function(e){ if(SETTINGS.uiSnd===false||typeof sndPlay!=='function') return; const b=e.target.closest('button,.btn,[role=tab],label.tgl'); if(!b||b.disabled) return;
    if(b.closest('#wtouch,#touch,.touch')) return;   /* game controls on the touch screen */
    sndPlay(b.classList.contains('back')||/^(←|Geri)/.test((b.textContent||'').trim())?'ui_back':(b.classList.contains('primary')?'ui_ok':'ui_click')); },true);
  document.addEventListener('pointerover',function(e){ if(e.pointerType!=='mouse'||SETTINGS.uiSnd===false||typeof sndPlay!=='function') return; const b=e.target.closest('button,.btn'); if(!b||b===last||b.disabled) return;
    last=b; const now=performance.now(); if(now-lastT<70) return; lastT=now; sndPlay('ui_hover'); },true); })();
$('setRadioTts').addEventListener('change',function(e){ SETTINGS.radioTts=e.target.checked; saveSettings(); });
$('setRadioSub').addEventListener('change',function(e){ SETTINGS.radioSub=e.target.checked; saveSettings(); });
$('setCallsign').addEventListener('change',function(e){ SETTINGS.callsign=String(e.target.value||'').trim().slice(0,20); saveSettings(); });
['netVoice','netVoice2'].forEach(function(id){ const el=$(id); if(!el) return; el.checked=!!SETTINGS.voice; el.addEventListener('change',function(e){ const on=e.target.checked; ['netVoice','netVoice2'].forEach(function(k){ $(k).checked=on; }); voiceEnable(on).then(function(ok){ if(on&&!ok){ ['netVoice','netVoice2'].forEach(function(k){ $(k).checked=false; }); } }); }); });

/* ---- settings: undo since opening, defaults, search, basic/advanced, accessibility (V1.65) */
let SETSNAP=null;
function setSnapshot(){ SETSNAP=JSON.stringify(SETTINGS); $('setSearch').value=''; setSearch(''); $('btnSetUndo').disabled=true; }
function setChanged(){ return SETSNAP!=null&&SETSNAP!==JSON.stringify(SETTINGS); }
function settingsApplyAll(){ invertY=SETTINGS.invert; PERF.scale=1; FX.failed=false; applyQuality(); applyVolume(); if(typeof applyTouchOpt==='function') applyTouchOpt(); uiApply(); if(typeof todApply==='function') try{ todApply(); }catch(e){} saveSettings(); syncSettingsUI(); }
$('btnSetUndo').addEventListener('click',function(){ if(!SETSNAP) return; const o=JSON.parse(SETSNAP); Object.keys(SETTINGS).forEach(function(k){ if(!(k in o)) delete SETTINGS[k]; }); Object.assign(SETTINGS,o); settingsApplyAll(); toast('Değişiklikler geri alındı','#b8ecff'); });
$('btnSetDef').addEventListener('click',function(){ const b=this; if(!b.dataset.sure){ b.dataset.sure='1'; b.textContent='Emin misin? Tekrar bas'; setTimeout(function(){ delete b.dataset.sure; b.textContent='Varsayılanlar'; },3500); return; }
  delete b.dataset.sure; b.textContent='Varsayılanlar'; const keep={callsign:SETTINGS.callsign,startPlace:SETTINGS.startPlace,ai:SETTINGS.ai};
  Object.keys(SETTINGS).forEach(function(k){ delete SETTINGS[k]; }); Object.assign(SETTINGS,JSON.parse(JSON.stringify(SETTINGS_DEF)),keep); if(DEV.mobile) SETTINGS.quality=1; settingsApplyAll(); toast('Ayarlar varsayılana döndü','#7dffb0'); });
function setSearch(q){ q=(q||'').trim().toLocaleLowerCase('tr-TR'); const st=$('settings'); st.classList.toggle('searching',!!q); let n=0;
  Array.prototype.forEach.call(st.querySelectorAll('.srow'),function(r){ const hit=!q||r.textContent.toLocaleLowerCase('tr-TR').indexOf(q)>=0; r.classList.toggle('nomatch',!hit); if(hit&&q) n++; });
  Array.prototype.forEach.call(st.querySelectorAll('.spanel section'),function(sec){ const k=sec.querySelectorAll('.srow:not(.nomatch)').length; sec.classList.toggle('nomatchsec',!!q&&k===0&&!(sec.dataset.tab==='k'&&/kontrol|tuş|tus|gamepad|klavye|dokun|kumanda/.test(q))); });
  $('setNoRes').classList.toggle('hidden',!q||n>0); if(q&&n>0&&!SETTINGS.advUi) st.classList.remove('basic'); else if(!SETTINGS.advUi) st.classList.add('basic'); }
$('setSearch').addEventListener('input',function(e){ setSearch(e.target.value); });
$('setAdv').addEventListener('change',function(e){ SETTINGS.advUi=e.target.checked; saveSettings(); syncSettingsUI(); });
/* rows only shown in the advanced view */
['setDepth','btnSafe','btnDiag','setAA','setRes','setAuto','setFps','btnLibOpen','btnSupa'].forEach(function(id){ const el=$(id), r=el&&el.closest&&el.closest('.srow'); if(r&&r.classList) r.classList.add('adv'); });
function uiApply(){ const h=document.documentElement; if(!h||!h.classList) return; try{ h.style.setProperty('--uiz',String(SETTINGS.uiz||1)); }catch(e){} h.classList.toggle('hc',!!SETTINGS.hc); h.classList.toggle('rm',!!SETTINGS.rm);
  ['p','d','t'].forEach(function(c){ h.classList.toggle('cb-'+c,SETTINGS.cb===c); }); }
$('setUiz').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.uiz=+b.dataset.z; uiApply(); saveSettings(); syncSettingsUI(); });
$('setCb').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.cb=b.dataset.c; uiApply(); saveSettings(); syncSettingsUI(); });
$('setHc').addEventListener('change',function(e){ SETTINGS.hc=e.target.checked; uiApply(); saveSettings(); syncSettingsUI(); });
$('setRm').addEventListener('change',function(e){ SETTINGS.rm=e.target.checked; uiApply(); saveSettings(); syncSettingsUI(); });
$('setRadioSub2').addEventListener('change',function(e){ SETTINGS.radioSub=e.target.checked; saveSettings(); syncSettingsUI(); });
$('setRumble2').addEventListener('change',function(e){ SETTINGS.rumble=e.target.checked; saveSettings(); syncSettingsUI(); });
/* any change inside the dialog enables "Geri al" */
$('settings').addEventListener('change',function(){ setTimeout(function(){ $('btnSetUndo').disabled=!setChanged(); },0); });
$('settings').addEventListener('click',function(){ setTimeout(function(){ $('btnSetUndo').disabled=!setChanged(); },0); });
uiApply();
['btnLibOpen','btnSndOpen'].forEach(function(id){ const el=$(id), r=el&&el.closest&&el.closest('.srow'); if(r&&r.classList) r.classList.add('libonly'); });
