let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('tip cards',BOOT_TIPS.length>=20&&BOOT_TIPS.every(function(t){ return t[0]&&t[1]&&t[1].length<140; }));
T_('tips mention three kinds',['İpucu','Kontrol'].every(function(k){ return BOOT_TIPS.some(function(t){ return t[0]===k; }); })&&BOOT_TIPS.some(function(t){ return /KAAN|Akıncı|TB2/.test(t[0]); }));
T_('stage names in game language',BOOT_STEPS.some(function(s){ return s[0]==='Motorlar ısınıyor'; })&&!BOOT_STEPS.some(function(s){ return /kuruluyor$/.test(s[0])&&/Havalimanı|Deniz üssü/.test(s[0]); }));
T_('sound needs a gesture and stops',typeof bootSndStart==='function'&&typeof bootSndStop==='function');
console.log('v238: pass '+ok+' fail '+bad);
