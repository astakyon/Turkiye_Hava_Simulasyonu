/* ------------------------------------------------------------------ shared toggles + gamepad */
function toggleCam(){ camMode^=1; camSnap=true; CAMU.yaw=0; CAMU.pitch=0; }
function toggleInvert(){ invertY=!invertY; SETTINGS.invert=invertY; saveSettings(); if($('setInv')) $('setInv').checked=invertY; toast(invertY?'Pitch kontrolü: ters':'Pitch kontrolü: normal'); }
function toggleMute(){ muted=!muted; toast(muted?'Ses kapalı':'Ses açık'); }
function toggleGear(){
  if(S.onGround && S.gear){ toast('Yerde iniş takımı kaldırılamaz','#ffc24a'); }
  else { S.gear=!S.gear; toast(S.gear?'İniş takımı indi':'İniş takımı kalktı'); }
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
  const g=getPad();
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
  else if(state==='play'){ if(eR3) fireWeapon(); if(eL3) dropFlares(); if(eStart) pauseGame(); if(eB) toggleGear(); if(eX) toggleCam(); if(eY){ if(S.onGround&&S.taxi&&!S.clearance) skipTaxi(); else toggleInvert(); } if(eBack) cycleWeapon(1); }
  PAD.pitch=padCurve(ax(1),0.12);
  PAD.roll=padCurve(ax(0),0.12);
  PAD.yaw=padCurve(ax(2),0.15)+((b(15)?1:0)-(b(14)?1:0));
  PAD.thr=(bv(7)-bv(6))+padCurve(-ax(3),0.2)+((b(12)?1:0)-(b(13)?1:0));
  PAD.ab=b(5); PAD.brake=b(4); PAD.fire=b(0)&&!padFireLock;
}
window.addEventListener('gamepadconnected',()=>pollPad());

