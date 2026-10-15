let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const keepPad=SETTINGS.pad, keepT=SETTINGS.tch; SETTINGS.pad={dz:0.3}; SETTINGS.tch={size:1.3};
T_('pad default dead zone',rdPadDef('dz')===12,rdPadDef('dz')); T_('settings untouched by the default lookup',SETTINGS.pad.dz===0.3);
T_('touch default size',rdTchDef('size')===100); T_('touch untouched',SETTINGS.tch.size===1.3);
SETTINGS.pad=keepPad; SETTINGS.tch=keepT;
T_('every row has a kind',RD.every(function(r){ return /^(seg:\w+|chk|range|fn)$/.test(r[1]); }));
T_('no row twice',new Set(RD.map(function(r){ return r[0]; })).size===RD.length);
const keepS=SETTINGS.shadows; SETTINGS.shadows=2; const sh=RD.find(function(r){ return r[0]==='setShadow'; }); T_('shadow override seen',rdDiff(sh)===true); SETTINGS.shadows=null; T_('shadow default',rdDiff(sh)===false); SETTINGS.shadows=keepS;
const v=RD.find(function(r){ return r[0]==='setVol'; }), kv=SETTINGS.volume; SETTINGS.volume=0.5; T_('volume differs',rdDiff(v)===true); SETTINGS.volume=0.8; T_('volume default',rdDiff(v)===false); SETTINGS.volume=kv;
console.log('settings2: pass '+ok+' fail '+bad);
