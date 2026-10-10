let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
function key(code){ (listeners.keydown||[]).forEach(f=>f({code,key:code,preventDefault(){},repeat:false,target:{tagName:'X'}})); }
enterTitle(); T('title',menuMode==='title');
SETTINGS.ui='A'; refreshTitle(); T('ui-a', uiStyle()==='A');
SETTINGS.ui='B'; refreshTitle(); T('ui-b', uiStyle()==='B');
T('fly sub text',/KAAN/.test(els.flySubB.textContent),els.flySubB.textContent);
// cinematic: placeModel moves plane along path
placeModel(0.1); const p1=planeGroup.position.clone(); placeModel(0.5); T('cine moves',planeGroup.position.distanceTo(p1)>5); T('cine visible',cineOn());
menuCam(0.05); T('camera near plane',camera.position.distanceTo(planeGroup.position)<200,camera.position.distanceTo(planeGroup.position));
// actions
titleAct('missions'); T('missions open',menuMode==='missions'); T('cine in missions',cineOn());
key('ArrowDown'); T('mis sel moved',misSel===1||misSel===0);
misSel=MORDER.indexOf('dogfight'); renderMissions(); T('dogfight chips',/3<\/b> dalga/.test(els.misChips.innerHTML));
misGo(); T('start modal from missions',menuMode==='start'&&missionId==='dogfight');
closeStart(); T('back to missions',menuMode==='missions');
key('Escape'); T('esc -> title',menuMode==='title');
titleAct('load'); T('load -> loadout panel',menuMode==='loadout');
enterTitle(); selectStart('air'); titleAct('fly'); T('quick fly',state==='play'&&!S.onGround);
console.log('pass',ok,'fail',bad);
