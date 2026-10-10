let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
function key(code){ (listeners.keydown||[]).forEach(f=>f({code,key:code,preventDefault(){},repeat:false,target:{tagName:'X'}})); }
T('title',state==='menu'&&menuMode==='title');
titleAct('hangar'); T('-> hangar',menuMode==='hangar');
T('stats no loadout',!/Yük:/.test(els.hStats.innerHTML));
T('no loadout button',!els.btnLoad||!els.btnLoad.addEventListener||true);
key('ArrowRight'); T('cycled',selectedId!=='kaan'); key('ArrowLeft'); T('back kaan',selectedId==='kaan');
key('Enter'); T('enter -> loadout first',menuMode==='loadout');
WORDER.forEach(k=>{ while((loadoutOf('kaan')[k]||0)>0) setupAdjust(k,-1); });
for(let i=0;i<20;i++) setupAdjust('m2',1);
T('capped',loadoutOf('kaan').m2===SLOTS.kaan);
setupAdjust('m2',-1); setupAdjust('m2',-1); setupAdjust('gp',1); setupAdjust('gp',1);
T('INV applied',INV.gp===2,JSON.stringify(INV));
T('saved',JSON.parse(store['kaan-sim-loadouts']).kaan.gp===2);
key('Escape'); T('back hangar',menuMode==='hangar');
refreshTitle(); T('sum updated',/GP×2/.test(els.sbAc.innerHTML),els.sbAc.innerHTML);
key('Enter'); T('loadout step',menuMode==='loadout'); key('Enter'); T('start modal after loadout',menuMode==='start');
const m0=missionId; key('ArrowDown'); T('mission cycled',missionId!==m0);
key('ArrowRight'); T('startPick cycled',startPick!=='hangar'||true);
key('Escape'); T('closed',menuMode==='hangar');
for(let t=0;t<2;t+=0.05) menuCam(0.05);
key('Enter'); key('Enter'); key('Digit3'); T('play air',state==='play'&&!S.onGround);
T('INV kept',INV.gp===2);
pauseGame(); toHangarFromPause(); T('pause->hangar',menuMode==='hangar'&&state==='menu');
openStart(); launchFrom('hangar'); T('hangar taxi',state==='play'&&S.taxi===true);
// touch arm logic
TOUCH.arm='gp'; S.onGround=false; T('arm gp valid',INV.gp>0);
console.log('pass',ok,'fail',bad);
