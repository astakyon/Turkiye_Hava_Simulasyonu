/* ------------------------------------------------------------------ loop */
loadStore(); $('verTag').textContent=GAME_VERSION; invertY=SETTINGS.invert; buildAirport(); buildNaval(); buildLand(); buildTown(); buildMarina(); buildSouth(); buildUAV(); buildEnemy(); buildLandmarks(); buildSurroundings(); buildRural(); buildMilitary(); buildTraffic(); buildHelis(); todBuild(); ctlBindUI(); applyTouchOpt(); renderCtlHelp(); buildHangar(); buildTaxiway(); buildService(); buildBaseDefense(); chunkInstances(); setAircraft(selectedId); resetFlight('runway'); updateRingVisuals(); buildPicker(); buildMissionUI(); enterTitle(); applyQuality(); syncSettingsUI(); modelsInit(); accInit().then(function(){ if(ACC.cfg&&!ACC.user&&!SETTINGS.accPrompted&&state==='menu') setTimeout(function(){ if(state==='menu'&&!anyModalOpen()) accOpen(); },1200); });
try{ if('serviceWorker' in navigator && location.protocol==='https:' && /github\.io$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(function(){}); }catch(e){}
let lastT=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  let dt=(now-lastT)/1000; lastT=now; if(!(dt>0)) dt=0.016; perfStep(Math.min(dt,0.5)); dt=Math.min(dt,0.05);
  T+=dt; pollPad();
  if(state==='library'){ libStep(dt); libRender(); drawHUD(); return; }
  if(state==='play') update(dt);
  if(state==='walk') walkUpdate(dt);
  if(state==='play'||(NET.on&&NET.started&&state!=='menu')){ actorsStep(dt); netHostLogic(dt); }
  netStep(dt);
  for(let i=msgs.length-1;i>=0;i--){ if(state==='play') msgs[i].t-=dt; if(msgs[i].t<=0) msgs.splice(i,1); }
  placeModel(dt); skinSync(); updateHangar(dt); airportStep(dt); surroundingsStep(dt); navalStep(dt); landStep(dt); trafficStep(dt); if(typeof airLifeStep==='function') airLifeStep(dt); marinaStep(dt); if(typeof decksStep==='function') decksStep(); ruralStep(dt); militaryStep(dt); todStep(dt); if(typeof wxStep==='function') wxStep(dt); southStep(dt); uavStep(dt); enemyStep(dt); landmarksStep(dt); helisIdle(dt); if(VEH_BUILT) vehWeaponsStep(dt); if(typeof callStep==='function') callStep(dt); if(typeof heliOpsStep==='function') heliOpsStep(dt); if(typeof schStep==='function') schStep(dt); updateTaxiVisuals();
  if(state==='menu') menuCam(dt); else if(state==='walk'||((state==='paused'||state==='map')&&WALK.from==='walk')||(state==='map'&&MAPV.from==='walk')) walkCam(dt); else cameraUpdate(dt);
  sky.position.copy(camera.position); shadowFollow(); if(state!=='library') cullStep(dt);
  const pulse=1+0.04*Math.sin(T*4); if(rings[ringIdx]) rings[ringIdx].mesh.scale.setScalar(pulse);
  renderFrame(dt);
  drawHUD(); miniStep(dt); audioUpdate(); radioStep(dt); careerStep(dt); updateTouchUI(); updateWalkTouch();
}
requestAnimationFrame(frame);
