/* ------------------------------------------------------------------ touch controls 2.0 (V2.02)
   • Floating stick: touching anywhere in the free left part of the screen puts the stick under the finger (flight and on foot /
     in vehicles). Off in Ayarlar → Kontroller → Dokunmatik if a fixed stick is preferred.
   • Layout editor: Ayarlar → Kontroller → Dokunmatik → "Düzeni düzenle": drag the stick, throttle, button cluster, top bar
     and ping button anywhere; positions are saved per device. "Sıfırla" returns to the default layout.
   • Ready-made layouts: Klasik · Sol el · Eğerek uç (tilt flying, stick hidden).
   • A short vibration on every touch button; a 4-step first-time guide the first time the touch controls appear in flight. */
const TED={on:false, drag:null};
const TED_ITEMS=[['tStick','Yön çubuğu'],['tThr','Gaz'],['tRight','Ateş · flare · dümen'],['ttopF','Üst düğmeler'],['tPing','İşaret'],['wStick','Yürüme / sürüş çubuğu'],['wRight','Eylem düğmeleri']];
function t2Opt(){ const t=SETTINGS.tch||{}; return {float:t.float!==false, pos:t.pos||{}, preset:t.preset||'klasik'}; }
function t2El(id){ if(id==='ttopF') return document.querySelector('#touch .ttop'); if(id==='wRight') return document.querySelector('#wtouch .wright'); return $(id); }
/* ---- saved positions */
function t2Apply(){ const P=t2Opt().pos; TED_ITEMS.forEach(function(it){ const el=t2El(it[0]); if(!el||!el.style) return; const p=P[it[0]];
    if(p){ el.style.left=(p[0]*100).toFixed(2)+'vw'; el.style.top=(p[1]*100).toFixed(2)+'vh'; el.style.right='auto'; el.style.bottom='auto'; el.classList.add('tmoved'); }
    else if(el.classList.contains('tmoved')){ el.style.left=el.style.top=el.style.right=el.style.bottom=''; el.classList.remove('tmoved'); } });
  const egim=t2Opt().preset==='egim'; const st=$('tStick'); if(st) st.classList.toggle('tgyro',egim); }
applyTouchOpt=HOOK.wrap('applyTouchOpt','kontrol/dokunmatik-2#_t2Opt',function(_t2Opt){ return function(){ _t2Opt(); try{ t2Apply(); }catch(e){} }; },applyTouchOpt);
/* ---- floating stick */
function t2Zone(host,stickId){ const h=$(host), st=$(stickId); if(!h||!st||!document.createElement||typeof h.insertBefore!=='function') return; const z=document.createElement('div'); z.className='tzone'; h.insertBefore(z,h.firstChild);
  z.addEventListener('pointerdown',function(e){ if(!t2Opt().float||TED.on) return; if(stickId==='tStick'&&st.classList.contains('tgyro')) return; e.preventDefault();
    const r=st.getBoundingClientRect(); st.style.left=(e.clientX-r.width/2)+'px'; st.style.top=(e.clientY-r.height/2)+'px'; st.style.right='auto'; st.style.bottom='auto'; st.classList.add('tfloat');
    try{ st.dispatchEvent(new PointerEvent('pointerdown',{pointerId:e.pointerId,clientX:e.clientX,clientY:e.clientY,bubbles:true,cancelable:true,pointerType:e.pointerType,isPrimary:true})); }catch(err){} });
  const back=function(){ if(!st.classList.contains('tfloat')) return; st.classList.remove('tfloat'); st.style.left=st.style.top=st.style.right=st.style.bottom=''; t2Apply(); };
  st.addEventListener('pointerup',back); st.addEventListener('pointercancel',back); }
t2Zone('touch','tStick'); t2Zone('wtouch','wStick');
/* ---- haptics on touch buttons */
document.addEventListener('pointerdown',function(e){ if(e.pointerType!=='touch'||TED.on) return; const b=e.target&&e.target.closest&&e.target.closest('.touch button, .tping'); if(!b) return; try{ if(typeof hapticOK==='function'&&hapticOK()) navigator.vibrate(8); }catch(err){} },true);
/* ---- layout editor */
function tedOpen(){ closeModals(); TED.on=true; document.body.classList.add('tedit'); ['touch','wtouch'].forEach(function(id){ const el=$(id); if(el) el.classList.add('hidden'); });
  const t=$('touch'); t.classList.remove('hidden'); const tp=$('tPing'); if(tp) tp.classList.remove('hidden');
  let bar=$('tedBar'); if(!bar){ bar=document.createElement('div'); bar.id='tedBar'; bar.className='tedbar'; bar.innerHTML='<b>DÜZEN DÜZENLEYİCİ</b><span>Öğeleri sürükleyip istediğin yere bırak</span><button type="button" class="btn sm" id="tedWalk">Yürüme düzeni</button><button type="button" class="btn sm" id="tedReset">Sıfırla</button><button type="button" class="btn sm primary" id="tedDone">Bitti</button>'; document.body.appendChild(bar);
    bar.querySelector('#tedReset').addEventListener('click',function(){ SETTINGS.tch=SETTINGS.tch||{}; SETTINGS.tch.pos={}; saveSettings(); t2Apply(); toast('Dokunmatik düzen varsayılana döndü','#b8ecff'); });
    bar.querySelector('#tedDone').addEventListener('click',tedClose);
    bar.querySelector('#tedWalk').addEventListener('click',function(){ const a=$('touch'), w=$('wtouch'), walk=a.classList.contains('hidden'); a.classList.toggle('hidden',!walk); w.classList.toggle('hidden',walk); this.textContent=walk?'Yürüme düzeni':'Uçuş düzeni'; }); }
  bar.classList.remove('hidden'); t2Apply(); }
function tedClose(){ TED.on=false; document.body.classList.remove('tedit'); const bar=$('tedBar'); if(bar) bar.classList.add('hidden'); ['touch','wtouch'].forEach(function(id){ const el=$(id); if(el) el.classList.add('hidden'); });
  TOUCH.vis=false; saveSettings(); toast('Dokunmatik düzen kaydedildi','#7dffb0'); }
function tedItemAt(t){ for(let i=0;i<TED_ITEMS.length;i++){ const el=t2El(TED_ITEMS[i][0]); if(el&&el.contains&&el.contains(t)) return TED_ITEMS[i][0]; } return null; }
document.addEventListener('pointerdown',function(e){ if(!TED.on) return; const id=tedItemAt(e.target); if(!id) return; e.preventDefault(); e.stopImmediatePropagation();
  const el=t2El(id), r=el.getBoundingClientRect(); TED.drag={id:id,el:el,dx:e.clientX-r.left,dy:e.clientY-r.top,pid:e.pointerId}; el.classList.add('tdrag'); },true);
document.addEventListener('pointermove',function(e){ const d=TED.drag; if(!TED.on||!d||e.pointerId!==d.pid) return; e.preventDefault(); e.stopImmediatePropagation();
  const W=window.innerWidth, H=window.innerHeight, r=d.el.getBoundingClientRect(); const x=clamp(e.clientX-d.dx,0,W-r.width), y=clamp(e.clientY-d.dy,0,H-r.height);
  d.el.style.left=x+'px'; d.el.style.top=y+'px'; d.el.style.right='auto'; d.el.style.bottom='auto'; d.x=x/W; d.y=y/H; },true);
document.addEventListener('pointerup',function(e){ const d=TED.drag; if(!TED.on||!d) return; e.stopImmediatePropagation(); d.el.classList.remove('tdrag'); TED.drag=null;
  if(d.x!=null){ SETTINGS.tch=SETTINGS.tch||{}; SETTINGS.tch.pos=Object.assign({},SETTINGS.tch.pos||{}); SETTINGS.tch.pos[d.id]=[d.x,d.y]; saveSettings(); t2Apply(); } },true);
['click','pointercancel'].forEach(function(ev){ document.addEventListener(ev,function(e){ if(TED.on&&tedItemAt(e.target)){ e.stopImmediatePropagation(); e.preventDefault(); } },true); });
/* keep the touch layers visible while editing */
updateTouchUI=HOOK.wrap('updateTouchUI','kontrol/dokunmatik-2#_t2Upd',function(_t2Upd){ return function(){ if(TED.on) return; _t2Upd(); }; },updateTouchUI);
/* ---- presets */
function t2Preset(k){ SETTINGS.tch=SETTINGS.tch||{}; SETTINGS.tch.preset=k; SETTINGS.tch.left=(k==='solel'); SETTINGS.tch.pos={};
  if(k==='egim'){ SETTINGS.gyro=true; try{ gyroStart(); }catch(e){} } else if(SETTINGS.gyro&&k!=='egim'){ SETTINGS.gyro=false; try{ gyroStop(); }catch(e){} }
  saveSettings(); applyTouchOpt(); syncSettingsUI(); toast({klasik:'Klasik düzen',solel:'Sol el düzeni: çubuk sağda, düğmeler solda',egim:'Eğerek uç: telefonu eğerek yönlendir, çubuk gizli'}[k],'#b8ecff'); }
/* ---- first-time guide */
function t2Guide(){ if(SETTINGS.tchTut||TED.on) return; const st=$('tStick'); if(!st||!TOUCH.vis) return; const g=document.createElement('div'); g.className='tguide';
  const pts=[['tStick','Yön çubuğu: sol tarafta nereye dokunursan orada açılır. Yukarı = burun aşağı'],['tThr','Gaz: yukarı kaydır. En üst bölge art yakıcı'],['tFire','Ateş: seçili silah. Silah değiştirmek için alttaki silah kutularına dokun'],['tFlare','Flare: füze uyarısında bas']];
  const W=window.innerWidth, H=window.innerHeight, used=[];
  g.innerHTML=pts.map(function(p,i){ const el=$(p[0]); if(!el) return ''; const r=el.getBoundingClientRect(), right=r.left+r.width/2>W/2;
    let left=right?r.left-232:r.right+12, top=r.top+r.height/2-34; left=clamp(left,8,W-228);
    for(let k=0;k<6;k++){ if(used.some(function(u){ return Math.abs(u[0]-left)<220&&Math.abs(u[1]-top)<74; })) top-=78; else break; } top=clamp(top,8,H-80); used.push([left,top]);
    return '<div class="tgp" style="left:'+left+'px;top:'+top+'px"><b>'+(i+1)+'</b>'+p[1]+'</div>'; }).join('')+'<button type="button" class="btn primary" id="tgOk">Anladım</button>';
  document.body.appendChild(g); g.querySelector('#tgOk').addEventListener('click',function(){ g.remove(); SETTINGS.tchTut=true; saveSettings(); }); }
updateTouchUI=HOOK.wrap('updateTouchUI','kontrol/dokunmatik-2#_t2Upd2',function(_t2Upd2){ return function(){ const was=TOUCH.vis; _t2Upd2(); if(!was&&TOUCH.vis) setTimeout(t2Guide,1200); }; },updateTouchUI);
/* ---- settings UI */
(function(){ const fl=$('tchFloat'); if(fl) fl.addEventListener('change',function(){ SETTINGS.tch=SETTINGS.tch||{}; SETTINGS.tch.float=fl.checked; saveSettings(); });
  const ed=$('btnTchEdit'); if(ed) ed.addEventListener('click',tedOpen);
  const pr=$('tchPreset'); if(pr) pr.addEventListener('click',function(e){ const b=e.target.closest('button[data-p]'); if(b) t2Preset(b.dataset.p); });
  const tg=$('btnTchTut'); if(tg) tg.addEventListener('click',function(){ SETTINGS.tchTut=false; saveSettings(); toast('Rehber bir sonraki uçuşta açılacak','#b8ecff'); }); })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','kontrol/dokunmatik-2#_t2Sync',function(_t2Sync){ return function(){ _t2Sync(); const o=t2Opt(), fl=$('tchFloat'); if(fl) fl.checked=o.float; const pr=$('tchPreset'); if(pr) Array.prototype.forEach.call(pr.children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.p===o.preset)); }); }; },syncSettingsUI);
setTimeout(function(){ try{ t2Apply(); }catch(e){} },0);
/* the ping button sits in the top bar of whichever touch layer is visible */
updateTouchUI=HOOK.wrap('updateTouchUI','kontrol/dokunmatik-2#_t2Upd3',function(_t2Upd3){ return function(){ _t2Upd3(); const b=$('tPing'); if(!b||TED.on) return; const bar=TOUCH.vis?document.querySelector('#touch .ttop'):(WALK.tvis?document.querySelector('#wtouch .ttop'):null);
  if(bar&&b.parentNode!==bar&&bar.appendChild){ bar.appendChild(b); b.classList.add('inbar'); } }; },updateTouchUI);
