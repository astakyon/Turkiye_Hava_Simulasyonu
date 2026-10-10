/* ------------------------------------------------------------------ loop */
loadStore(); $('verTag').textContent=GAME_VERSION; invertY=SETTINGS.invert; buildAirport(); buildHangar(); buildTaxiway(); buildService(); buildBaseDefense(); setAircraft(selectedId); resetFlight('runway'); updateRingVisuals(); buildPicker(); buildMissionUI(); enterTitle(); applyQuality(); syncSettingsUI(); modelsInit();
try{ if('serviceWorker' in navigator && location.protocol==='https:' && /github\.io$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(function(){}); }catch(e){}
let lastT=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  let dt=(now-lastT)/1000; lastT=now; if(!(dt>0)) dt=0.016; perfStep(Math.min(dt,0.5)); dt=Math.min(dt,0.05);
  T+=dt; pollPad();
  if(state==='play') update(dt);
  if(state==='walk') walkUpdate(dt);
  if(state==='play'||(NET.on&&NET.started&&state!=='menu')){ actorsStep(dt); netHostLogic(dt); }
  netStep(dt);
  for(let i=msgs.length-1;i>=0;i--){ if(state==='play') msgs[i].t-=dt; if(msgs[i].t<=0) msgs.splice(i,1); }
  placeModel(dt); skinSync(); updateHangar(dt); airportStep(dt); updateTaxiVisuals();
  if(state==='menu') menuCam(dt); else if(state==='walk'||(state==='paused'&&WALK.from==='walk')) walkCam(dt); else cameraUpdate(dt);
  sky.position.copy(camera.position); shadowFollow();
  const pulse=1+0.04*Math.sin(T*4); if(rings[ringIdx]) rings[ringIdx].mesh.scale.setScalar(pulse);
  renderFrame(dt);
  drawHUD(); audioUpdate(); updateTouchUI(); updateWalkTouch();
}
requestAnimationFrame(frame);
