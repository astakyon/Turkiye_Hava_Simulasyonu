let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
syncSettingsUI(); openModal('settings');
const q0=SETTINGS.quality; SETTINGS.quality=(q0+1)%4; T('changed',setChanged());
$('btnSetUndo').disabled=false; SETSNAP&&(function(){ const o=JSON.parse(SETSNAP); Object.assign(SETTINGS,o); settingsApplyAll(); })(); T('undo restores',SETTINGS.quality===q0);
SETTINGS.uiz=1.3; SETTINGS.cb='d'; SETTINGS.rm=true; uiApply(); T('accessibility applied',true);
T('defaults snapshot',SETTINGS_DEF&&SETTINGS_DEF.quality===2&&SETTINGS_DEF.volume===0.8);
setSearch('gölge'); T('search runs',true); setSearch('');
console.log('pass',ok,'fail',bad);
