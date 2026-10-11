let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
ctrlDefaults();
T('six schemes',CTRL_ORDER.length===6&&CTRL_ORDER.every(function(s){ return CTRL_DEF[s].acts.length>3; }));
T('mute no longer shares N with next weapon',CTRL.kb.gen.mute.indexOf('KeyN')<0&&CTRL.kb.air.nextWpn.indexOf('KeyN')>=0);
T('map on M',CTRL.kb.gen.map[0]==='KeyM');
T('default air scheme has no conflicts',Object.keys(ctrlConflicts('kb','air')).length===0,JSON.stringify(ctrlConflicts('kb','air')));
T('default foot scheme has no conflicts',Object.keys(ctrlConflicts('kb','foot')).length===0,JSON.stringify(ctrlConflicts('kb','foot')));
T('default pad air has no conflicts',Object.keys(ctrlConflicts('pad','air')).length===0,JSON.stringify(ctrlConflicts('pad','air')));
// rebinding: noseDown to KeyI, then the old key no longer works
CUI.dev='kb'; CUI.scheme='air'; CUI.cap={a:'noseDown',i:0,dev:'kb',t:0}; ctlAssign('KeyI');
keys.KeyI=true; T('rebound key works',kb('air','noseDown')===1); keys.KeyI=false; keys.KeyW=true; T('old key replaced',kb('air','noseDown')===0); keys.KeyW=false;
// conflict detection
CUI.cap={a:'yawL',i:0,dev:'kb',t:0}; ctlAssign('KeyE'); T('conflict reported',!!ctrlConflicts('kb','air')['air.yawL']);
ctrlResetScheme('kb','air'); T('reset scheme',CTRL.kb.air.noseDown[0]==='KeyW'&&CTRL.kb.air.yawL[0]==='KeyQ');
// gamepad mapping through the action layer
PADRAW={axes:[0,-0.9,0,0],buttons:Array.from({length:17},function(){ return {pressed:false,value:0}; })}; T('pad stick up = nose down',pad('air','noseDown')>0.5&&pad('air','noseUp')===0);
PADRAW.buttons[0]={pressed:true,value:1}; T('pad edge fires once',padEdge('air','gun')===true&&padEdge('air','gun')===false); PADRAW=null;
// flight uses the bindings
selectedId='kaan'; setAircraft('kaan'); startGame('air'); const t0=S.throttle; keys.KeyR=true; update(0.5); keys.KeyR=false; T('throttle key',S.throttle>t0);
console.log('pass',ok,'fail',bad);
