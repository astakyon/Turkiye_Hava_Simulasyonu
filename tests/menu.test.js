let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick');
function key(code){ (listeners.keydown||[]).forEach(f=>f({code,key:code,preventDefault(){},repeat:false,target:{tagName:'X'}})); }
enterTitle(); T('title',menuMode==='title');
SETTINGS.ui='A'; refreshTitle(); T('old designs removed: always the current menu (V2.26)', uiStyle()==='C');
// cinematic: placeModel moves plane along path
placeModel(0.1); const p1=planeGroup.position.clone(); placeModel(0.5); T('cine moves',planeGroup.position.distanceTo(p1)>5); T('cine visible',cineOn());
menuCam(0.05); T('camera near plane',camera.position.distanceTo(planeGroup.position)<200,camera.position.distanceTo(planeGroup.position));
// actions
titleAct('missions'); T('missions open',menuMode==='missions'); T('cine in missions',cineOn());
key('ArrowDown'); T('mis sel moved',misSel===1||misSel===0);
misSel=MORDER.indexOf('dogfight'); renderMissions(); T('dogfight chips',/3<\/b> dalga/.test(els.misChips.innerHTML));
misGo(); T('loadout before start (missions)',menuMode==='loadout'&&missionId==='dogfight'); selectStart('air'); loadDone(); T('mission starts from the loadout screen',state==='play'&&missionId==='dogfight');
pauseGame(); toMenuFromPause(); T('pause -> title',menuMode==='title'&&state==='menu');
titleAct('settings'); T('settings item',true); closeModals(); enterHangar(); selectAircraft('anka'); preFlight('hangar'); T('unarmed: loadout screen with start options',menuMode==='loadout'); closeLoadPanel(); selectAircraft('kaan'); enterTitle(); titleAct('missions'); misGo(); T('missions -> loadout',menuMode==='loadout'); closeLoadPanel(); T('back missions',menuMode==='missions'); enterTitle();
enterTitle(); selectStart('air'); titleAct('fly'); T('quick fly',state==='play'&&!S.onGround);
// V1.63 new main menu
enterTitle(); SETTINGS.ui='auto'; refreshTitle(); T('new menu default',uiStyle()==='C');
titleDetail('free'); T('detail panel',/Serbest/.test($('cdT').textContent),$('cdT').textContent);
titleDetail('hangar'); T('detail hangar',$('cdGo').dataset.act==='hangar');
titleAct('sounds'); T('sound library from menu',true); closeModals();
enterTitle(); titleAct('walk'); T('walk from menu',state==='walk');
enterTitle(); titleAct('free'); T('free flight from menu',state==='play'&&missionId==='free');
// V1.64 hangar: helicopters, compare, loadout presets
enterHangar(); setCls('heli'); T('heli tab',HSEL==='t129'&&/T129/.test($('hName').textContent)); cycleAircraft(1); T('heli cycle',HSEL==='t625');
T('perf bars',/HIZ/.test($('hPerf').innerHTML));
heliFromHangar(HSEL); T('fly heli from hangar',state==='walk'&&WALK.mode==='heli'&&HELI.cur&&HELI.cur.id==='t625');
enterHangar(); setCls('all'); selectAircraft('kaan'); T('back to aircraft',HSEL===null&&selectedId==='kaan');
CMP='hurjet'; refreshHangarUI(); T('compare line',/Sarı çizgi/.test($('hPerf').innerHTML)); CMP=null;
openLoadPanel('hangar'); const P=LPRESETS.find(function(p){ return p.id==='aa'; }), m=P.mix('kaan',8); T('air-air preset',(m.m1||0)+(m.m2||0)===8,JSON.stringify(m));
T('weight text',/kg/.test($('suWt').textContent));
console.log('pass',ok,'fail',bad);
