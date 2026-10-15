/* ------------------------------------------------------------------ all settings reviewed (V2.23)
   • Duplicates removed: "Telsiz altyazıları" stays in Erişilebilirlik (was also in Ses), "Kumanda titreşimi" stays in
     Kontroller → Gamepad (was also in Erişilebilirlik). The two "Çubuk hassasiyeti" rows are named by device. The hidden rows
     keep their inputs so older code that fills them keeps working.
   • Every row has a description; rows that showed only a number now say what they change.
   • Search covers every tab, the three control panels and the collapsed groups (they open on a hit).
   • "Varsayılana dön" (↺) next to a row's title when its value differs from the default; it clicks the default choice of
     that row, so the row's own code applies it exactly as a player would.
   • Settings keys (V2.23 inventory): every key the game saves has a row, except the safety switches for developers
     (bake, merge, freeze, fxMerge, texShare, warm, terrainLod, shadowEvery) and bookkeeping (notesSeen, accPrompted,
     igpuTold, tierAuto, tchTut, rankLocks, startPlace, ai, voiceOpen). See docs/MIMARI.md. */
(function(){ ['setRadioSub','setRumble2'].forEach(function(id){ const el=$(id), r=el&&el.closest&&el.closest('.srow'); if(r&&r.classList) r.classList.add('dup'); }); })();
/* rows → how to put back the default: [row control id, kind, default, current value (optional)] ; kind: seg:<data attr> | chk | range | fn */
function rdPadDef(k){ const p=SETTINGS.pad; SETTINGS.pad={}; const o=padOpt(); SETTINGS.pad=p; return Math.round(o[k]*100); }
function rdTchDef(k){ const t=SETTINGS.tch; SETTINGS.tch={}; const o=touchOpt(); SETTINGS.tch=t; return Math.round(o[k]*100); }
const RD=[['setRes','seg:r','auto'],['setCap','seg:c','auto'],['setAA','seg:a','auto'],['setAuto','chk',true],['setFps','chk',false],['setSplit','chk',true],
  ['setShadow','fn',function(){ return SETTINGS.shadows!=null; },function(){ SETTINGS.shadows=null; saveSettings(); applyShadows(); }],
  ['setFx','fn',function(){ return SETTINGS.fx!=null; },function(){ SETTINGS.fx=null; saveSettings(); if(typeof FX!=='undefined') FX.failed=false; applyQuality(); }],
  ['setAssist','seg:a','help'],['setStab','chk',true],['setTurb','seg:t','soft'],['setRealP','chk',true],['setCkpHead','chk',true],['setFuel','seg:f','on'],['setBomb','seg:b','guided'],['setLock','chk',true],
  ['setGyro','chk',false],['setGyroSens','seg:f','25'],['setGyroInv','chk',false],
  ['setTod','seg:t','day'],['setWx','seg:w','clear'],['setLife','chk',true],
  ['setSens','range',100,function(){ return Math.round((SETTINGS.sens||1)*100); }],['setInv','chk',false],['padDz','range',function(){ return rdPadDef('dz'); },function(){ return Math.round(padOpt().dz*100); }],['padSens','range',function(){ return rdPadDef('sens'); },function(){ return Math.round(padOpt().sens*100); }],['padInv','chk',false,function(){ return padOpt().invY; }],['setRumble','chk',true],
  ['setTouch','seg:t','auto'],['tchSize','range',function(){ return rdTchDef('size'); },function(){ return Math.round(touchOpt().size*100); }],['tchOp','range',function(){ return rdTchDef('op'); },function(){ return Math.round(touchOpt().op*100); }],['tchStick','range',function(){ return rdTchDef('stick'); },function(){ return Math.round(touchOpt().stick*100); }],['tchLeft','chk',false,function(){ return touchOpt().left; }],['tchFloat','chk',false,function(){ return !!(SETTINGS.tch||{}).float; }],
  ['setVol','range',80,function(){ return Math.round(SETTINGS.volume*100); }],['setMusic','chk',true],['setUiSnd','chk',true],['setRadioTts','chk',true],
  ['setUiz','seg:z','1'],['setCb','seg:c','off'],['setHc','chk',false],['setRm','chk',false],['setRadioSub2','chk',true],
  ['setUi','seg:u','auto'],['setMini','chk',false],['setNotes','seg:n','30']];
function rdVal(d){ return typeof d==='function'?d():d; }
function rdDiff(r){ const el=$(r[0]); if(!el) return false; const k=r[1];
  if(k==='fn') return !!r[2]();
  if(k==='chk') return !!(r[3]?r[3]():el.checked)!==!!r[2];   /* r[3]: read the setting itself (panels not shown yet are not filled in) */
  if(k==='range') return +(r[3]?r[3]():el.value)!==+rdVal(r[2]);
  const a=k.slice(4), b=el.querySelector('[data-'+a+'="'+r[2]+'"]'); return !!b&&b.getAttribute('aria-pressed')!=='true'; }
function rdReset(r){ const el=$(r[0]); if(!el) return; const k=r[1];
  if(k==='fn'){ r[3](); }
  else if(k==='chk'){ el.checked=!!r[2]; el.dispatchEvent(new Event('change',{bubbles:true})); }
  else if(k==='range'){ el.value=String(rdVal(r[2])); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
  else { const a=k.slice(4), b=el.querySelector('[data-'+a+'="'+r[2]+'"]'); if(b) b.click(); }
  syncSettingsUI(); }
(function(){ if(!document.createElement) return; RD.forEach(function(r){ const el=$(r[0]), row=el&&el.closest&&el.closest('.srow'), t=row&&row.querySelector&&row.querySelector('.sl b'); if(!t) return;
  const b=document.createElement('button'); b.type='button'; b.className='sreset hidden'; b.textContent='↺'; b.title='Varsayılana dön'; b.setAttribute('aria-label','Varsayılana dön: '+t.textContent.replace(/(az|orta|çok) etki/,'').trim());
  b.addEventListener('click',function(e){ e.stopPropagation(); rdReset(r); }); t.appendChild(b); r.btn=b; }); })();
function rdSync(){ RD.forEach(function(r){ if(r.btn) r.btn.classList.toggle('hidden',!rdDiff(r)); }); }
syncSettingsUI=HOOK.wrap('syncSettingsUI','ekran/ayarlar-gozden-gecirme#_rdSync',function(_rdSync){ return function(){ _rdSync(); try{ rdSync(); }catch(e){} }; },syncSettingsUI);
/* search: every tab, every control panel, every collapsed group */
(function(){ const s=$('setSearch'); if(!s||!s.addEventListener) return; s.addEventListener('input',function(){ const q=s.value.trim(), st=$('settings'); if(!st||!st.querySelectorAll) return;
  Array.prototype.forEach.call(st.querySelectorAll('details'),function(d){ if(q) d.open=!!d.querySelector('.srow:not(.nomatch):not(.dup)'); });
  Array.prototype.forEach.call(st.querySelectorAll('.srow.dup'),function(r){ r.classList.add('nomatch'); }); }); })();
