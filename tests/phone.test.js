let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick');
/* tilt mapping: landscape (90°) — tilt right (beta+) rolls right, calibration removes the holding angle */
window.orientation=90;
GYRO.on=true; GYRO.ok=true; GYRO.beta=0; GYRO.gamma=-40; GYRO.r0=null; GYRO.calA=null; gyroOnEvt({beta:0,gamma:-40});
gyroStep(); T_('neutral after calibration',GYRO.roll===0&&GYRO.pitch===0,GYRO.roll+' '+GYRO.pitch);
gyroOnEvt({beta:20,gamma:-40}); gyroStep(); T_('tilt right -> roll right',GYRO.roll>0.6,GYRO.roll);
gyroOnEvt({beta:-40,gamma:-40}); gyroStep(); T_('full left clamps',GYRO.roll===-1);
gyroOnEvt({beta:2,gamma:-40}); gyroStep(); T_('dead zone',GYRO.roll===0);
gyroOnEvt({beta:0,gamma:-55}); gyroStep(); T_('pitch axis responds',Math.abs(GYRO.pitch)>0.4,GYRO.pitch);
/* feeds the flight controls only while flying */
selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); gyroOnEvt({beta:25,gamma:-40}); pollPad(); T_('gyro -> PAD.roll in flight',PAD.roll>0.5,PAD.roll);
gyroStop(); pollPad(); T_('off: no input',PAD.roll===0);
/* save backup round trip */
stSet('ayy-test','merhaba ğüşıöç'); localStorage.setItem('other-app','x');
const code=saveCode(); T_('code prefix',/^AYK1\./.test(code));
const r=saveParse(code); T_('code parses',!r.err&&r.keys.indexOf('ayy-test')>=0&&r.keys.indexOf('other-app')<0,r.err);
stSet('ayy-test','değişti'); saveImport(code,true); T_('import restores values (Turkish chars)',stGet('ayy-test')==='merhaba ğüşıöç',stGet('ayy-test'));
T_('foreign keys untouched',localStorage.getItem('other-app')==='x');
T_('JSON file also accepted',!saveParse(JSON.stringify(saveExport())).err);
T_('garbage rejected',!!saveParse('AYK1.@@@').err&&!!saveParse('{"a":1}').err);
console.log('pass',ok,'fail',bad);
