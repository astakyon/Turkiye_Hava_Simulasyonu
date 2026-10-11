/* ------------------------------------------------------------------ shared toggles + gamepad */
function toggleCam(){ camMode^=1; camSnap=true; CAMU.yaw=0; CAMU.pitch=0; }
function toggleInvert(){ invertY=!invertY; SETTINGS.invert=invertY; saveSettings(); if($('setInv')) $('setInv').checked=invertY; toast(invertY?'Pitch kontrolü: ters':'Pitch kontrolü: normal'); }
function toggleMute(){ muted=!muted; toast(muted?'Ses kapalı':'Ses açık'); }
function toggleGear(){
  if(S.onGround && S.gear){ toast('Yerde iniş takımı kaldırılamaz','#ffc24a'); }
  else { S.gear=!S.gear; sndPlay('gear'); toast(S.gear?'İniş takımı indi':'İniş takımı kalktı'); }
}
const PAD={on:false,id:'',pitch:0,roll:0,yaw:0,thr:0,ab:false,brake:false,fire:false};
const padPrev=[]; let padFireLock=false, padBuzzT=-1;
const padStatus=$('padStatus');
function padCurve(v,d){ const a=Math.abs(v); if(a<d) return 0; const n=(a-d)/(1-d); return Math.sign(v)*(0.6*n+0.4*n*n*n); }
function getPad(){
  const list=navigator.getGamepads?navigator.getGamepads():[];
  for(let i=0;i<list.length;i++){ const g=list[i]; if(g&&g.connected) return g; }
  return null;
}
function rumble(ms,weak,strong){
  if(!SETTINGS.rumble) return; const g=getPad(); if(!g||!g.vibrationActuator) return;
  try{ g.vibrationActuator.playEffect('dual-rumble',{duration:ms,weakMagnitude:weak,strongMagnitude:strong}); }catch(e){}
}
function pollPad(){
  const g=getPad(); PADRAW=g; ctlPadCapture(); if(CUI.cap&&CUI.cap.dev==='pad') return;
  if(!g){
    if(PAD.on){ PAD.on=false; PAD.id=''; padStatus.textContent='Kumanda bağlı değil — bağlayıp bir tuşa bas'; }
    PAD.pitch=PAD.roll=PAD.yaw=PAD.thr=0; PAD.ab=PAD.brake=PAD.fire=false; return;
  }
  if(!PAD.on || PAD.id!==g.id){
    PAD.on=true; PAD.id=g.id;
    const nm=g.id.replace(/\(.*?\)/g,'').trim().slice(0,40)||'Kumanda';
    padStatus.textContent='Kumanda bağlı: '+nm;
    if(state==='play') toast('Kumanda bağlandı','#7dffb0');
  }
  const b=i=>!!(g.buttons[i]&&g.buttons[i].pressed), bv=i=>g.buttons[i]?g.buttons[i].value:0, ax=i=>g.axes[i]||0;
  const press=i=>{ const now=b(i), was=!!padPrev[i]; padPrev[i]=now; return now&&!was; };
  const eA=press(0), eB=press(1), eX=press(2), eY=press(3), eBack=press(8), eStart=press(9), eL=press(14), eR=press(15), eR3=press(11), eL3=press(10), eLB=press(4), eRB=press(5);
  if(!b(0)) padFireLock=false;
  if(typeof setLastIn==='function'&&g.buttons.some(function(x){ return x&&x.pressed; })) setLastIn('pad');
  /* any open dialog: spatial focus navigation with the d-pad / stick, A = press, B = back */
  if(typeof anyModalOpen==='function'&&anyModalOpen()){ const eU=press(12), eD=press(13), sx=ax(0), sy=ax(1); PADNAV.cd-=1;
    let dir=eU?'u':eD?'d':eL?'l':eR?'r':null; if(!dir&&PADNAV.cd<=0&&(Math.abs(sx)>0.6||Math.abs(sy)>0.6)){ dir=Math.abs(sx)>Math.abs(sy)?(sx>0?'r':'l'):(sy>0?'d':'u'); PADNAV.cd=12; }
    if(dir) uiNavMove(dir); else if(eA){ const f=document.activeElement; if(f&&f!==document.body&&f.click) f.click(); } else if(eB){ const m=uiTopModal(), bk=m&&m.querySelector('.back,[id$="Close"],[id$="Back"]'); if(bk) bk.click(); else closeModals(); }
    return; }
  if(state==='menu'){
    if(menuMode==='title'){ const eU=press(12), eD=press(13); if(eD||eR) titleFocus(tFocus+1); else if(eU||eL) titleFocus(tFocus-1); else if(eA){ const L=titleItems(); if(L[tFocus]) titleAct(L[tFocus].dataset.act); } }
    else if(menuMode==='missions'){ const eU=press(12), eD=press(13); if(eD||eU){ misSel=(misSel+(eD?1:-1)+MORDER.length)%MORDER.length; renderMissions(); } else if(eA) misGo(); else if(eB) enterTitle(); }
    else if(menuMode==='loadout'){ if(eA) loadDone(); else if(eB) closeLoadPanel(); }
    else if(menuMode==='start'){ if(eA) launchFrom(startPick); else if(eB) closeStart(); else if(eLB) cycleMission(-1); else if(eRB) cycleMission(1); else if(eL||eX) cycleStart(-1); else if(eR||eY) cycleStart(1); }
    else{ if(eL) cycleAircraft(-1); else if(eR) cycleAircraft(1); else if(eA) preFlight('hangar'); else if(eB) enterTitle(); }
  }
  else if(state==='paused'){ if(eA||eStart) resumeGame(); else if(eB) toHangarFromPause(); }
  else if(state==='mend'){ if(eA) restartMission(); else if(eB) endToHangar(); }
  else if(state==='service'){ if(eA) closeService(true); else if(eB) closeService(false); }
  const P=function(s,a){ return padEdge(s,a); };
  const E={weapon:P('air','weapon'),flares:P('air','flares'),gear:P('air','gear'),skip:P('air','skipTaxi'),next:P('air','nextWpn'),lock:P('air','lock'),tgt:P('air','nextTarget'),auto:P('air','autoTaxi'),
    pause:P('gen','pause'),cam:P('gen','camera'),inv:P('gen','invert'),photo:P('gen','photo'),map:P('gen','map'),mute:P('gen','mute'),view:P('gen','resetView'),
    use:P('foot','use'),jump:P('foot','jump'),runT:P('foot','runToggle'),exit:P('land','exit'),ccam:P('land','cam'),swap:P('land','swap'),hexit:P('heli','exit')};
  if(state==='play'){ if(E.weapon) fireWeapon(); if(E.flares) dropFlares(); if(E.pause) pauseGame(); if(E.gear) toggleGear(); if(E.cam) toggleCam(); if(E.skip&&S.onGround&&S.taxi&&!S.clearance) skipTaxi(); if(E.inv) toggleInvert();
    if(E.next) cycleWeapon(1); if(E.lock) toggleLock(); if(E.tgt) cycleLock(); if(E.auto) toggleAutoTaxi(); if(E.photo) enterPhoto(); if(E.mute) toggleMute(); if(E.view){ CAMU.yaw=0; CAMU.pitch=0; CAMU.zoom=1; } if(E.map&&typeof openMap==='function') openMap(); }
  else if(state==='walk'){ if(E.pause){ walkLeave(); pauseGame(); }
    if(WALK.mode==='heli'){ if(E.hexit) heliExit(); if(E.cam){ HELI.fp=!HELI.fp; WALK.pitch=0; } if(E.map) openMap(); }
    else if(WALK.mode==='foot'){ if(E.use) walkInteract(); if(E.jump) WALK.jumpQ=true; if(E.runT) WALK.run=!WALK.run; }
    else { if(E.exit) walkInteract(); if(E.ccam){ WALK.fp=!WALK.fp; WALK.pitch=0; } if(E.swap) carSwap(); }
    const lx=pad('foot','lookR')-pad('foot','lookL'), ly=pad('foot','lookD')-pad('foot','lookU'); if(lx||ly) walkLook(lx*9,ly*7); }
  PAD.pitch=pad('air','noseUp')-pad('air','noseDown');
  PAD.roll=pad('air','rollR')-pad('air','rollL');
  PAD.yaw=pad('air','yawR')-pad('air','yawL');
  PAD.thr=pad('air','thrUp')-pad('air','thrDown');
  if(pad('air','gun')<0.5) padFireLock=false;
  PAD.ab=pad('air','ab')>0.5; PAD.brake=pad('air','brake')>0.5; PAD.fire=pad('air','gun')>0.5&&!padFireLock;
}
window.addEventListener('gamepadconnected',()=>pollPad());


/* ---- spatial navigation inside dialogs (gamepad) */
const PADNAV={cd:0};
function uiTopModal(){ const L=Array.prototype.slice.call(document.querySelectorAll('.modal:not(.hidden)')); return L[L.length-1]||null; }
function uiFocusables(root){ return Array.prototype.slice.call(root.querySelectorAll('button:not([disabled]),input:not([disabled]):not([type=hidden]),select,label.tgl,[tabindex="0"]')).filter(function(e){ const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&!e.closest('.hidden'); }); }
function uiNavMove(dir){
  const m=uiTopModal(); if(!m) return; const L=uiFocusables(m); if(!L.length) return; let cur=document.activeElement; if(!m.contains(cur)||L.indexOf(cur)<0){ L[0].focus(); return; }
  const a=cur.getBoundingClientRect(), ax0=a.left+a.width/2, ay0=a.top+a.height/2; let best=null, bs=1e9;
  L.forEach(function(e){ if(e===cur) return; const r=e.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2, dx=x-ax0, dy=y-ay0;
    const ok=dir==='r'?dx>4:dir==='l'?dx<-4:dir==='d'?dy>4:dy<-4; if(!ok) return; const main=dir==='r'||dir==='l'?Math.abs(dx):Math.abs(dy), off=dir==='r'||dir==='l'?Math.abs(dy):Math.abs(dx), sc=main+off*2.2; if(sc<bs){ bs=sc; best=e; } });
  if(best){ best.focus(); try{ best.scrollIntoView({block:'nearest'}); }catch(e){} if(typeof sndPlay==='function') sndPlay('ui_hover'); }
}
