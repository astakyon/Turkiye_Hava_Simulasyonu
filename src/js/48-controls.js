/* ------------------------------------------------------------------ control schemes and bindings
   Every input goes through named actions grouped by scheme (vehicle type). Keyboard keys and gamepad buttons/axes are
   bound per action and can be rebound in Settings → Controls; touch has its own layout options.
   Gamepad specs: 'b7' = button 7 (value 0..1), 'a1-' / 'a1+' = axis 1 negative / positive half (dead zone + curve applied). */
const CTRL_DEF={
  gen:{name:'Genel', acts:[
    ['pause','Duraklat / menü',['Escape','KeyP'],['b9']], ['map','Harita',['KeyM'],[]], ['camera','Kamera değiştir',['KeyC'],['b2']],
    ['resetView','Kamerayı sıfırla',['KeyV'],[]], ['photo','Fotoğraf modu',['KeyH'],[]], ['invert','Yukarı-aşağı ters çevir',['KeyY'],[]], ['mute','Sesi aç / kapat',['KeyU'],[]], ['radio','Telsiz menüsü (hazır mesajlar)',['KeyO'],[]], ['ptt','Bas-konuş (çok oyunculu)',['KeyI'],[]], ['vision','Gece görüş / termal (NVG · FLIR)',['Backquote'],[]], ['log','Görev günlüğü',['F2'],[]], ['chat','Sohbet (çok oyunculu)',['Slash'],[]]]},
  air:{name:'Hava aracı', acts:[
    ['noseDown','Burun aşağı',['KeyW','ArrowUp'],['a1-']], ['noseUp','Burun yukarı',['KeyS','ArrowDown'],['a1+']],
    ['rollL','Sola yat / yerde sola dön',['KeyA','ArrowLeft'],['a0-']], ['rollR','Sağa yat / yerde sağa dön',['KeyD','ArrowRight'],['a0+']],
    ['yawL','Sola yaw',['KeyQ'],['a2-','b14']], ['yawR','Sağa yaw',['KeyE'],['a2+','b15']],
    ['thrUp','Gaz artır',['KeyR'],['b7','a3-','b12']], ['thrDown','Gaz azalt',['KeyF'],['b6','a3+','b13']],
    ['ab','Art yakıcı',['ShiftLeft','ShiftRight'],['b5']], ['brake','Fren / hava freni',['KeyB'],['b4']],
    ['gun','Top / mühimmat ateşi',['Space'],['b0']], ['weapon','Seçili silahı kullan',['KeyX'],['b11']], ['nextWpn','Sıradaki silah',['KeyN'],['b8']],
    ['lock','Hedef kilidi aç / kapat',['KeyK'],[]], ['nextTarget','Hedef kilidini değiştir',['Tab'],[]], ['flares','Flare bırak',['KeyZ'],['b10']],
    ['gear','İniş takımı',['KeyG'],['b1']], ['autoTaxi','Otomatik taksi',['KeyT'],[]], ['skipTaxi','Taksiyi atla',['KeyL'],['b3']], ['eject','Fırlatma koltuğu (iki kez bas)',['KeyJ'],[]]]},
  heli:{name:'Helikopter', acts:[
    ['cycF','İleri (cyclic)',['KeyW','ArrowUp'],['a1-']], ['cycB','Geri (cyclic)',['KeyS','ArrowDown'],['a1+']],
    ['cycL','Sola kay (cyclic)',['KeyA','ArrowLeft'],['a0-']], ['cycR','Sağa kay (cyclic)',['KeyD','ArrowRight'],['a0+']],
    ['collUp','Yüksel (collective)',['KeyR','ShiftLeft'],['b7','a3-']], ['collDn','Alçal (collective)',['KeyF','ControlLeft'],['b6','a3+']],
    ['yawL','Sola dön (pedal)',['KeyQ'],['a2-','b14']], ['yawR','Sağa dön (pedal)',['KeyE'],['a2+','b15']],
    ['gun','Top ateşi',['Space'],['b0']], ['weapon','Seçili silahı kullan',['KeyX'],['b11']], ['flares','Flare bırak',['KeyZ'],['b10']], ['nextWpn','Silah değiştir (CİRİT / UMTAS)',['Tab'],['b3']], ['hook','Yük kancası / asker bindir-indir',['KeyB'],['b4']], ['assist','Askı yardımı (hover assist) aç/kapat',['KeyJ'],['b5']], ['exit','İn',['KeyG'],['b1']]]},
  land:{name:'Kara aracı', acts:[
    ['gas','Gaz',['KeyW','ArrowUp'],['b7','a1-']], ['brake','Fren / geri',['KeyS','ArrowDown'],['b6','a1+']],
    ['left','Sola dön',['KeyA','ArrowLeft'],['a0-']], ['right','Sağa dön',['KeyD','ArrowRight'],['a0+']],
    ['handbrake','El freni',['Space'],['b0']], ['turbo','Turbo',['ShiftLeft','ShiftRight'],['b5']], ['cam','Araç kamerası',['KeyC'],['b2']], ['swap','Aracı değiştir',['KeyT'],['b3']], ['fire','Ateş / su topu / uçak çek',['KeyX'],['b4']], ['exit','Araçtan in',['KeyE','KeyF','Enter'],['b1']]]},
  sea:{name:'Deniz aracı', acts:[
    ['thrUp','Hız artır',['KeyW','ArrowUp'],['b7','a1-']], ['thrDown','Hız azalt / geri',['KeyS','ArrowDown'],['b6','a1+']],
    ['rudL','Dümen sola',['KeyA','ArrowLeft'],['a0-']], ['rudR','Dümen sağa',['KeyD','ArrowRight'],['a0+']],
    ['gun','Top ateşi',['Space'],['b0']], ['weapon','Seçili silahı kullan',['KeyX'],['b11']], ['cam','Kamera',['KeyC'],['b2']]]},
  foot:{name:'Yaya', acts:[
    ['fwd','İleri',['KeyW','ArrowUp'],['a1-']], ['back','Geri',['KeyS','ArrowDown'],['a1+']], ['left','Sola',['KeyA','ArrowLeft'],['a0-']], ['right','Sağa',['KeyD','ArrowRight'],['a0+']],
    ['run','Koş (basılı tut)',['ShiftLeft','ShiftRight'],['b10']], ['runToggle','Sürekli koş aç / kapat',['CapsLock'],[]], ['jump','Zıpla',['Space'],['b0']], ['use','Araca / uçağa bin',['KeyE','KeyF','Enter'],['b2']], ['call','Araç çağır',['KeyG'],['b3']],
    ['lookL','Sola bak',[],['a2-']], ['lookR','Sağa bak',[],['a2+']], ['lookU','Yukarı bak',[],['a3-']], ['lookD','Aşağı bak',[],['a3+']]]}
};
const CTRL_ORDER=['air','heli','land','sea','foot','gen'];
const CTRL={kb:{}, pad:{}};
function ctrlDefaults(){ CTRL_ORDER.forEach(function(s){ CTRL.kb[s]={}; CTRL.pad[s]={}; CTRL_DEF[s].acts.forEach(function(a){ CTRL.kb[s][a[0]]=a[2].slice(); CTRL.pad[s][a[0]]=a[3].slice(); }); }); }
function ctrlLoad(){ ctrlDefaults(); try{ const o=JSON.parse(localStorage.getItem('ayy-controls')||'null'); if(o) ['kb','pad'].forEach(function(d){ for(const s in (o[d]||{})) for(const a in o[d][s]) if(CTRL[d][s]&&CTRL[d][s][a]) CTRL[d][s][a]=o[d][s][a].slice(0,3); }); }catch(e){} }
function ctrlSave(){ try{ localStorage.setItem('ayy-controls',JSON.stringify(CTRL)); }catch(e){} }
function ctrlResetScheme(dev,s){ CTRL_DEF[s].acts.forEach(function(a){ CTRL[dev][s][a[0]]=(dev==='kb'?a[2]:a[3]).slice(); }); ctrlSave(); }
ctrlLoad();
/* keyboard: held / pressed-this-event */
function kb(s,a){ const L=CTRL.kb[s]&&CTRL.kb[s][a]; if(!L) return 0; for(let i=0;i<L.length;i++) if(keys[L[i]]) return 1; return 0; }
function isKey(e,s,a){ const L=CTRL.kb[s]&&CTRL.kb[s][a]; return !!L&&L.indexOf(e.code)>=0; }
/* gamepad: analog value of an action, and its rising edge */
let PADRAW=null; const padWas={};
function padOpt(){ const p=SETTINGS.pad||{}; return {dz:p.dz==null?0.12:p.dz, sens:p.sens==null?1:p.sens, invY:!!p.invY}; }
function padSpec(sp){ const g=PADRAW; if(!g) return 0;
  if(sp[0]==='b'){ const b=g.buttons[+sp.slice(1)]; return b?(b.value||(b.pressed?1:0)):0; }
  const i=+sp.slice(1,-1), sg=sp.slice(-1)==='+'?1:-1, o=padOpt(); let v=g.axes[i]||0; if(o.invY&&(i===1||i===3)) v=-v;
  return Math.min(1,Math.max(0,padCurve(v*sg,o.dz)*o.sens)); }
function pad(s,a){ const L=CTRL.pad[s]&&CTRL.pad[s][a]; if(!L||!PADRAW) return 0; let m=0; for(let i=0;i<L.length;i++) m=Math.max(m,padSpec(L[i])); return m; }
function padEdge(s,a){ const k=s+'.'+a, v=pad(s,a)>0.55, w=!!padWas[k]; padWas[k]=v; return v&&!w; }
/* combined analog value (keyboard + gamepad) */
function act(s,a){ return Math.max(kb(s,a),pad(s,a)); }
/* ---- labels */
const KEYNAME={Space:'Boşluk',Escape:'Esc',Enter:'Enter',Tab:'Tab',ShiftLeft:'Sol Shift',ShiftRight:'Sağ Shift',ControlLeft:'Sol Ctrl',ControlRight:'Sağ Ctrl',AltLeft:'Sol Alt',AltRight:'Sağ Alt',
  CapsLock:'Caps Lock',Backspace:'Geri sil',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Comma:',',Period:'.',Slash:'/',Semicolon:'Ş',Quote:'İ',BracketLeft:'Ğ',BracketRight:'Ü',Backquote:'"',Minus:'*',Equal:'-',Backslash:',',IntlBackslash:'<'};
function keyName(c){ return KEYNAME[c]||c.replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'Num ').replace(/^F(\d+)$/,'F$1'); }
const PADNAME={b0:'A / ✕',b1:'B / ○',b2:'X / □',b3:'Y / △',b4:'LB',b5:'RB',b6:'LT',b7:'RT',b8:'Geri',b9:'Start',b10:'L3',b11:'R3',b12:'Yön ↑',b13:'Yön ↓',b14:'Yön ←',b15:'Yön →',b16:'Ana tuş',
  'a0-':'Sol çubuk ←','a0+':'Sol çubuk →','a1-':'Sol çubuk ↑','a1+':'Sol çubuk ↓','a2-':'Sağ çubuk ←','a2+':'Sağ çubuk →','a3-':'Sağ çubuk ↑','a3+':'Sağ çubuk ↓'};
function padName(sp){ return PADNAME[sp]||(sp[0]==='b'?'Tuş '+sp.slice(1):'Eksen '+sp.slice(1)); }
/* conflicts: the same key / button on two actions of one scheme (or a scheme and Genel) */
const GEN_GROUND=['pause','map','mute','radio','ptt'];   /* on foot / in a car only these general actions are live */
function ctrlConflicts(dev,s){ const seen={}, out={}; [s].concat(s==='gen'?[]:['gen']).forEach(function(sc){ CTRL_DEF[sc].acts.forEach(function(a){ if(sc==='gen'&&(s==='land'||s==='foot')&&GEN_GROUND.indexOf(a[0])<0) return; (CTRL[dev][sc][a[0]]||[]).forEach(function(c){ (seen[c]=seen[c]||[]).push(sc+'.'+a[0]); }); }); });
  for(const c in seen) if(seen[c].length>1) seen[c].forEach(function(k){ (out[k]=out[k]||[]).push(c); }); return out; }
/* ---- help modal: generated from the current bindings */
function renderCtlHelp(){ const el=$('ctlHelp'); if(!el) return;
  const col=function(dev,title){ let h='<div><h3>'+title+'</h3>';
    ['air','land','foot','gen'].forEach(function(s){ h+='<h4>'+CTRL_DEF[s].name+'</h4><ul class="keys">'; CTRL_DEF[s].acts.forEach(function(a){ const L=CTRL[dev][s][a[0]]; if(!L.length) return;
      h+='<li><span class="k">'+L.map(function(c){ return '<kbd>'+(dev==='kb'?keyName(c):padName(c))+'</kbd>'; }).join('')+'</span>'+a[1]+'</li>'; }); h+='</ul>'; });
    if(dev==='kb') h+='<ul class="keys"><li><span class="k"><kbd>1</kbd>–<kbd>5</kbd></span>Silah seç</li><li><span class="k"><kbd>Fare</kbd></span>Sürükle: kamerayı döndür · tekerlek: yakınlaş</li></ul>';
    return h+'</div>'; };
  el.innerHTML=col('kb','Klavye ve fare')+col('pad','Kumanda (Xbox / PlayStation)')+'<p class="lnote" style="grid-column:1/-1">Tuşları <b>Ayarlar → Kontroller</b> bölümünden değiştirebilirsin.</p>'; }
/* ---- settings UI (Settings → Controls): device tabs, scheme chips, rebinding by pressing a key / button */
const CUI={dev:'kb', scheme:'air', cap:null};
function ctlUI(){ const host=$('ctlUI'); if(!host) return;
  ['kb','pad','touch'].forEach(function(d){ const b=host.querySelector('[data-dev="'+d+'"]'); if(b){ b.setAttribute('aria-selected',String(CUI.dev===d)); b.setAttribute('aria-pressed',String(CUI.dev===d)); } });
  ['kb','pad','touch'].forEach(function(d){ const p=$('ctlP_'+d); if(p) p.classList.toggle('hidden',CUI.dev!==d); });
  if(CUI.dev==='touch'){ touchUISync(); return; }
  const list=$('ctlList_'+CUI.dev), chips=$('ctlSch_'+CUI.dev); if(!list) return;
  chips.innerHTML=CTRL_ORDER.map(function(s){ return '<button type="button" data-s="'+s+'" aria-pressed="'+(CUI.scheme===s)+'">'+CTRL_DEF[s].name+'</button>'; }).join('');
  const conf=ctrlConflicts(CUI.dev,CUI.scheme), dev=CUI.dev, nm=dev==='kb'?keyName:padName;
  list.innerHTML=CTRL_DEF[CUI.scheme].acts.map(function(a){ const L=CTRL[dev][CUI.scheme][a[0]], k=CUI.scheme+'.'+a[0], bad=conf[k];
    const capHere=CUI.cap&&CUI.cap.a===a[0];
    return '<div class="crow'+(bad?' conf':'')+'"><span class="cl">'+a[1]+(bad?'<small>Çakışma: '+bad.map(nm).join(', ')+'</small>':'')+'</span><span class="cb">'+
      L.map(function(c,i){ return '<button type="button" class="kchip'+(capHere&&CUI.cap.i===i?' cap':'')+'" data-a="'+a[0]+'" data-i="'+i+'">'+(capHere&&CUI.cap.i===i?'Bas…':nm(c))+'</button>'; }).join('')+
      (L.length<3?'<button type="button" class="kchip add'+(capHere&&CUI.cap.i===L.length?' cap':'')+'" data-a="'+a[0]+'" data-i="'+L.length+'">'+(capHere&&CUI.cap.i===L.length?'Bas…':'+')+'</button>':'')+'</span></div>'; }).join('');
  if(dev==='pad'){ const o=padOpt(); $('padDz').value=Math.round(o.dz*100); $('padDzV').textContent=Math.round(o.dz*100)+'%'; $('padSens').value=Math.round(o.sens*100); $('padSensV').textContent=Math.round(o.sens*100)+'%'; $('padInv').checked=o.invY;
    $('padState').textContent=PAD.on?('Bağlı: '+PAD.id.replace(/\(.*?\)/g,'').trim().slice(0,40)):'Kumanda bağlı değil — bağlayıp bir tuşa bas'; }
}
function ctlCapture(a,i){ CUI.cap={a:a,i:i,dev:CUI.dev,t:performance.now()}; ctlUI(); }
function ctlAssign(code){ const c=CUI.cap; if(!c) return; const L=CTRL[c.dev][CUI.scheme][c.a]; if(code===null){ if(c.i<L.length) L.splice(c.i,1); } else { const j=L.indexOf(code); if(j>=0&&j!==c.i) L.splice(j,1); L[Math.min(c.i,L.length)]=code; }
  CUI.cap=null; ctrlSave(); ctlUI(); renderCtlHelp(); }
/* key capture runs before every other key handler */
window.addEventListener('keydown',function(e){ if(!CUI.cap||CUI.cap.dev!=='kb') return; e.preventDefault(); e.stopImmediatePropagation();
  if(e.code==='Escape'){ CUI.cap=null; ctlUI(); return; } if(e.code==='Backspace'||e.code==='Delete'){ ctlAssign(null); return; } ctlAssign(e.code); },true);
/* gamepad capture: polled from the frame loop while the settings are open */
function ctlPadCapture(){ if(!CUI.cap||CUI.cap.dev!=='pad') return; const g=getPad(); if(!g) return; if(performance.now()-CUI.cap.t<300) return;
  for(let i=0;i<g.buttons.length;i++) if(g.buttons[i]&&g.buttons[i].pressed){ ctlAssign('b'+i); return; }
  for(let i=0;i<g.axes.length;i++){ const v=g.axes[i]||0; if(Math.abs(v)>0.7){ ctlAssign('a'+i+(v>0?'+':'-')); return; } } }
/* touch layout */
function touchOpt(){ const t=SETTINGS.tch||{}; return {size:t.size==null?1:t.size, op:t.op==null?1:t.op, left:!!t.left, stick:t.stick==null?1:t.stick}; }
function applyTouchOpt(){ const o=touchOpt(); ['touch','wtouch'].forEach(function(id){ const el=$(id); if(!el) return; if(el.style.setProperty) el.style.setProperty('--tscale',o.size); el.style.opacity=o.op; el.classList.toggle('lefty',o.left); }); }
function touchUISync(){ const o=touchOpt(); $('tchSize').value=Math.round(o.size*100); $('tchSizeV').textContent=Math.round(o.size*100)+'%'; $('tchOp').value=Math.round(o.op*100); $('tchOpV').textContent=Math.round(o.op*100)+'%';
  $('tchStick').value=Math.round(o.stick*100); $('tchStickV').textContent=Math.round(o.stick*100)+'%'; $('tchLeft').checked=o.left; }
function ctlBindUI(){
  const host=$('ctlUI'); if(!host) return;
  host.addEventListener('click',function(e){ const t=e.target.closest('button'); if(!t) return;
    if(t.dataset.dev){ CUI.dev=t.dataset.dev; CUI.cap=null; ctlUI(); return; }
    if(t.dataset.s&&t.parentElement.classList.contains('cschemes')){ CUI.scheme=t.dataset.s; CUI.cap=null; ctlUI(); return; }
    if(t.classList.contains('kchip')){ ctlCapture(t.dataset.a,+t.dataset.i); return; }
    if(t.id==='ctlReset_kb'||t.id==='ctlReset_pad'){ ctrlResetScheme(CUI.dev,CUI.scheme); ctlUI(); renderCtlHelp(); toast(CTRL_DEF[CUI.scheme].name+' şeması varsayılana döndü'); return; }
    if(t.id==='ctlResetAll'){ ctrlDefaults(); ctrlSave(); ctlUI(); renderCtlHelp(); toast('Tüm tuşlar varsayılana döndü'); } });
  const sl=function(id,key,obj,div){ $(id).addEventListener('input',function(e){ SETTINGS[obj]=SETTINGS[obj]||{}; SETTINGS[obj][key]=+e.target.value/div; saveSettings(); if(obj==='tch') applyTouchOpt(); ctlUI(); }); };
  sl('padDz','dz','pad',100); sl('padSens','sens','pad',100); sl('tchSize','size','tch',100); sl('tchOp','op','tch',100); sl('tchStick','stick','tch',100);
  $('padInv').addEventListener('change',function(e){ SETTINGS.pad=SETTINGS.pad||{}; SETTINGS.pad.invY=e.target.checked; saveSettings(); });
  $('tchLeft').addEventListener('change',function(e){ SETTINGS.tch=SETTINGS.tch||{}; SETTINGS.tch.left=e.target.checked; saveSettings(); applyTouchOpt(); });
}
