/* ------------------------------------------------------------------ mouse: orbit, zoom, pick */
const glc=$('gl'), ptrs=new Map(), ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
let dragMoved=0, lastPinch=0, lastTap=0;
function pinchDist(){ const v=Array.from(ptrs.values()); return v.length<2?0:Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y); }
function orbitBy(dx,dy){
  dx*=SETTINGS.sens; dy*=SETTINGS.sens;
  if(state==='walk'){ walkLook(dx,dy); return; }
  if(state==='library'){ libOrbit(dx,dy); return; }
  if(state==='menu'){ if(menuMode==='title') return; MENUV.yaw-=dx*0.006; MENUV.pitch=clamp(MENUV.pitch+dy*0.005,-0.1,1.35); MENUV.idle=0; }
  else{ CAMU.yaw-=dx*0.006; CAMU.pitch=clamp(CAMU.pitch-dy*0.005,-1.3,1.2); }
}
function zoomBy(f){
  if(state==='walk'){ WALK.camD=clamp(WALK.camD*f,0.5,2.5); return; }
  if(state==='library'){ libZoom(f); return; }
  if(state==='menu'){ if(menuMode==='title') return; MENUV.zoom=clamp(MENUV.zoom*f,0.3,2.4); MENUV.idle=0; }
  else if(camMode===0){ CAMU.zoom=clamp(CAMU.zoom*f,0.35,4); }
}
function clickPick(e){
  if(state!=='menu'||menuMode!=='hangar') return;
  ndc.set(e.clientX/window.innerWidth*2-1, -(e.clientY/window.innerHeight)*2+1);
  ray.setFromCamera(ndc,camera);
  const hits=ray.intersectObjects(AC_ORDER.map(function(id){ return displays[id].g; }),true);
  for(let i=0;i<hits.length;i++){ let o=hits[i].object; while(o && !(o.userData&&o.userData.id)) o=o.parent; if(o){ selectAircraft(o.userData.id); break; } }
}
glc.addEventListener('pointerdown',function(e){
  try{ glc.setPointerCapture(e.pointerId); }catch(err){}
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); dragMoved=0; if(ptrs.size===2) lastPinch=pinchDist(); glc.classList.add('drag');
});
glc.addEventListener('pointermove',function(e){
  const p=ptrs.get(e.pointerId); if(!p) return;
  const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; dragMoved+=Math.abs(dx)+Math.abs(dy);
  if(ptrs.size===1) orbitBy(dx,dy);
  else if(ptrs.size===2){ const d=pinchDist(); if(lastPinch>0&&d>0) zoomBy(lastPinch/d); lastPinch=d; }
});
function endPtr(e){
  if(!ptrs.has(e.pointerId)) return;
  if(e.type==='pointerup' && ptrs.size===1 && dragMoved<6){ clickPick(e); const nw=performance.now(); if((state==='play'||state==='photo')&&nw-lastTap<350){ CAMU.yaw=0; CAMU.pitch=0; CAMU.zoom=1; } lastTap=nw; }
  ptrs.delete(e.pointerId); lastPinch=0; if(!ptrs.size) glc.classList.remove('drag');
}
glc.addEventListener('pointerup',endPtr); glc.addEventListener('pointercancel',endPtr);
window.addEventListener('wheel',function(e){
  const ui=e.target.closest && e.target.closest('.ui,.modal');
  if(ui){ const ch=e.target.closest('.chips'); if(ch){ ch.scrollLeft+=e.deltaY+e.deltaX; e.preventDefault(); } return; }
  if(state==='paused') return;
  e.preventDefault(); zoomBy(Math.exp(clamp(e.deltaY,-120,120)*0.0012));
},{passive:false});
window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].indexOf(e.code)>=0 && (state==='play'||state==='walk')) e.preventDefault();
  keys[e.code]=true;
  if(e.repeat) return;
  if(!$('service').classList.contains('hidden')&&state==='menu'){ if(e.code==='Escape') closeService(false); else if(e.code==='Enter'&&!(e.target&&e.target.tagName==='BUTTON')) closeService(true); return; }
  if(anyModalOpen()){ if(e.code==='Escape') closeModals(); return; }
  if(state==='walk'){ walkKey(e); return; }
  if(state==='library'){ if(e.code==='Escape') closeLibrary(); return; }
  const onBtn=!!(e.target&&e.target.tagName==='BUTTON');
  if(state==='service'){
    if(e.code==='Enter'&&!onBtn){ e.preventDefault(); closeService(true); } else if(e.code==='Escape') closeService(false);
    return;
  }
  if(state==='mend'){
    if((e.code==='Enter'||e.code==='Space')&&!onBtn){ e.preventDefault(); restartMission(); } else if(e.code==='Escape') endToHangar();
    return;
  }
  if(state==='photo'){
    if(e.code==='Escape'||e.code==='KeyH') exitPhoto();
    else if((e.code==='Enter'||e.code==='Space')&&!onBtn){ e.preventDefault(); takePhoto(); }
    else if(e.code==='KeyV'){ CAMU.yaw=0; CAMU.pitch=0; CAMU.zoom=1; }
    return;
  }
  if(state==='menu'){
    if(menuMode==='title'){
      if(e.code==='ArrowDown'||e.code==='ArrowRight'){ e.preventDefault(); titleFocus(tFocus+1); return; }
      if(e.code==='ArrowUp'||e.code==='ArrowLeft'){ e.preventDefault(); titleFocus(tFocus-1); return; }
      if((e.code==='Enter'||e.code==='Space')&&!onBtn){ e.preventDefault(); const L=titleItems(); if(L[tFocus]) titleAct(L[tFocus].dataset.act); }
      return; }
    if(menuMode==='missions'){
      if(e.code==='ArrowDown'||e.code==='ArrowUp'){ e.preventDefault(); misSel=(misSel+(e.code==='ArrowDown'?1:-1)+MORDER.length)%MORDER.length; renderMissions(); return; }
      if((e.code==='Enter'||e.code==='Space')&&!onBtn){ e.preventDefault(); misGo(); return; }
      if(e.code==='Escape'){ enterTitle(); }
      return; }
    if(menuMode==='loadout'){ if(e.code==='Escape'){ e.preventDefault(); closeLoadPanel(); } else if(e.code==='Enter'&&!onBtn){ e.preventDefault(); loadDone(); } return; }
    if(menuMode==='start'){
      if(e.code==='Escape'){ closeStart(); return; }
      if(e.code==='ArrowLeft'||e.code==='ArrowRight'){ e.preventDefault(); cycleStart(e.code==='ArrowLeft'?-1:1); return; }
      if(e.code==='ArrowUp'||e.code==='ArrowDown'){ e.preventDefault(); cycleMission(e.code==='ArrowUp'?-1:1); return; }
      if(e.code==='Digit1'||e.code==='Digit2'||e.code==='Digit3'||e.code==='Digit4'){ launchFrom(START_ORDER[+e.code[5]-1]); return; }
      if(e.code==='Enter'&&!onBtn){ e.preventDefault(); launchFrom(startPick); }
      return;
    }
    if(e.code==='ArrowLeft'||e.code==='ArrowRight'){ e.preventDefault(); cycleAircraft(e.code==='ArrowLeft'?-1:1); return; }
    if(e.code==='Enter'&&!onBtn){ e.preventDefault(); preFlight('hangar'); return; }
    if(e.code==='Escape'){ enterTitle(); return; }
    if(e.code==='KeyV'){ MENUV.zoom=1; MENUV.pitch=0.2; MENUV.idle=0; return; }
    return;
  }
  if(e.code==='KeyV'){ CAMU.yaw=0; CAMU.pitch=0; CAMU.zoom=1; return; }
  if(e.code==='Escape'||e.code==='KeyP'){ if(state==='play') pauseGame(); else if(state==='paused') resumeGame(); return; }
  if(state!=='play') return;
  if(e.code==='KeyC') toggleCam();
  if(e.code==='KeyY') toggleInvert();
  if(e.code==='KeyM') toggleMute();
  if(e.code==='KeyG') toggleGear();
  if(e.code==='KeyT') toggleAutoTaxi();
  if(e.code==='KeyL') skipTaxi();
  if(e.code==='KeyH') enterPhoto();
  if(e.code==='KeyX') fireWeapon();
  if(e.code==='KeyN') cycleWeapon(1);
  if(e.code==='KeyK') toggleLock();
  if(e.code.indexOf('Digit')===0&&+e.code[5]>=1&&+e.code[5]<=5) pickWeaponByNumber(+e.code[5]);
  if(e.code==='KeyZ') dropFlares();
  if(e.code==='Tab'){ e.preventDefault(); cycleLock(); }
});
window.addEventListener('keyup',e=>{ keys[e.code]=false; });
window.addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; if(state==='play') pauseGame(); });
document.addEventListener('visibilitychange',()=>{ if(document.hidden && state==='play') pauseGame(); });

