let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
gtOpen(); T_('panel open',GT.open);
GT.off.su=true; GT.off.sky=true; gtApply(); T_('sea hidden',GFX.water.visible===false); T_('sky hidden',sky.visible===false);
gtClose(); T_('restored',GFX.water.visible!==false&&sky.visible!==false&&!GT.open);
/* cloud save does not carry graphics between devices */
SETTINGS.quality=0; SETTINGS.shadows=false; accApply({t:1,settings:{quality:3,shadows:true,volume:0.3}}); T_('graphics kept per device',SETTINGS.quality===0&&SETTINGS.shadows===false); T_('other settings applied',SETTINGS.volume===0.3);
console.log('pass',ok,'fail',bad);
