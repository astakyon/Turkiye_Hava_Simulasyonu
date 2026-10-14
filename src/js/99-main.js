/* ------------------------------------------------------------------ loop */
bootMark('modüller');
loadStore(); $('verTag').textContent=GAME_VERSION; invertY=SETTINGS.invert;
const BOOT_STEPS=[['Havalimanı kuruluyor',buildAirport,6],['Deniz üssü kuruluyor',buildNaval,9],['Kara üssü kuruluyor',buildLand,6],['Kasaba kuruluyor',buildTown,5],['Marina kuruluyor',buildMarina,9],
  ['Güney kıyısı kuruluyor',buildSouth,4],['İHA üssü kuruluyor',buildUAV,2],['Hedefler kuruluyor',function(){ buildEnemy(); buildLandmarks(); },2],['Çevre kuruluyor',buildSurroundings,6],
  ['Köyler ve askerî alanlar',function(){ buildRural(); buildMilitary(); },2],['Trafik ve helikopterler',function(){ buildTraffic(); buildHelis(); todBuild(); },3],
  ['Kontroller hazırlanıyor',function(){ ctlBindUI(); applyTouchOpt(); renderCtlHelp(); },1],['Hangar kuruluyor',buildHangar,5],['Apron ve servis',function(){ buildTaxiway(); buildService(); buildBaseDefense(); chunkInstances(); },3],
  ['Uçak hazırlanıyor',function(){ setAircraft(selectedId); resetFlight('runway'); updateRingVisuals(); },3],['Menü hazırlanıyor',function(){ buildPicker(); buildMissionUI(); enterTitle(); applyQuality(); syncSettingsUI(); },3],
  ['Modeller ve hesap',function(){ modelsInit(); BOOT.acc=accInit().then(function(){ if(ACC.cfg&&!ACC.user&&!SETTINGS.accPrompted&&state==='menu') setTimeout(function(){ if(state==='menu'&&!anyModalOpen()) loginOpen(); },1200); }); },1]];
try{ if('serviceWorker' in navigator && location.protocol==='https:' && /github\.io$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(function(){}); }catch(e){}
let lastT=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  let dt=(now-lastT)/1000; lastT=now; if(!(dt>0)) dt=0.016; perfStep(Math.min(dt,0.5)); dt=Math.min(dt,0.05); frame.sdt=frame.sdt?frame.sdt+(dt-frame.sdt)*0.35:dt; dt=frame.sdt;
  T+=dt; pollPad();
  if(state==='library'){ libStep(dt); libRender(); drawHUD(); return; }
  if(state==='play') update(dt);
  if(state==='walk') walkUpdate(dt);
  if(state==='play'||(NET.on&&NET.started&&state!=='menu')){ actorsStep(dt); netHostLogic(dt); }
  netStep(dt); if(typeof netMix==='function') netMix(dt);
  for(let i=msgs.length-1;i>=0;i--){ if(state==='play') msgs[i].t-=dt; if(msgs[i].t<=0) msgs.splice(i,1); }
  placeModel(dt); skinSync(); updateHangar(dt); airportStep(dt); surroundingsStep(dt); navalStep(dt); landStep(dt); trafficStep(dt); if(typeof airLifeStep==='function') airLifeStep(dt); marinaStep(dt); if(typeof decksStep==='function') decksStep(); ruralStep(dt); militaryStep(dt); todStep(dt); if(typeof indoorStep==='function') indoorStep(dt); if(typeof wxStep==='function'){ try{ wxStep(dt); }catch(e){ if(!frame.wxErr){ frame.wxErr=1; console.warn('hava',e); } } } southStep(dt); uavStep(dt); enemyStep(dt); landmarksStep(dt); helisIdle(dt); if(VEH_BUILT) vehWeaponsStep(dt); if(typeof callStep==='function') callStep(dt); if(typeof heliOpsStep==='function') heliOpsStep(dt); if(typeof schStep==='function') schStep(dt); if(typeof progStep==='function') progStep(dt); if(typeof raceStep==='function') raceStep(dt); updateTaxiVisuals();
  if(state==='menu') menuCam(dt); else if(state==='walk'||((state==='paused'||state==='map')&&WALK.from==='walk')||(state==='map'&&MAPV.from==='walk')) walkCam(dt); else cameraUpdate(dt);
  sky.position.copy(camera.position); shadowFollow(); if(state!=='library') cullStep(dt);
  const pulse=1+0.04*Math.sin(T*4); if(rings[ringIdx]) rings[ringIdx].mesh.scale.setScalar(pulse);
  renderFrame(dt);
  drawHUD(); miniStep(dt); audioUpdate(); radioStep(dt); careerStep(dt); updateTouchUI(); updateWalkTouch();
}
/* finishing under the loading screen (V2.20); the same jobs also have their own timers, which then find them done */
const BOOT_POST=[['Dokular düzenleniyor',function(){ txsRun(); },2],['Nesneler birleştiriliyor',function(){ if(SETTINGS.merge!==false) mrgRun(); },4],
  ['Modeller birleştiriliyor',function(){ if(SETTINGS.bake!==false&&!BK.started){ BK.started=true; bkScan(); } },3],
  ['Grafikler hazırlanıyor',function(){ if(!WARM.started){ WARM.started=true; warmStart(); } warmStep(BOOT.hold?40:1e9); return !WARM.done&&SETTINGS.warm!==false; },5],
  ['Hesap kontrol ediliyor',function(){ return BOOT.acc; },1]];
bootRun(BOOT_STEPS,function(){ bootMark('dünya hazır'); lastT=performance.now();
  requestAnimationFrame(function(t){ const a=performance.now(); frame(t); BOOT.first=Math.round(performance.now()-a); bootMark('ilk kare'); });   /* the first frame compiles the visible shaders */
  bootPost(BOOT_POST,function(){ bootMark('hazırlık bitti'); bootShow('Hazır');
    bootWhenSmooth(function(){ BOOT.ready=Math.round(performance.now()); BOOT.done=true; if(BOOT.release) BOOT.release(); try{ CINE.shot=0; CINE.shotT=0; CINE.init=false; }catch(e){} bootHide(); }); }); });
