let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('registry',SND_DEFS.length>=20&&SND_DEFS.every(function(d){ return d.id&&d.cat&&d.n&&(d.gen||d.loop||d.music||d.phrase)&&SND_CATS.some(function(c){ return c[0]===d.cat; }); }));
T('ids unique',new Set(SND_DEFS.map(function(d){ return d.id; })).size===SND_DEFS.length);
T('every bus known',SND_DEFS.every(function(d){ return SND_BUSES.some(function(b){ return b[0]===d.bus; }); }));
SND.cat='silah'; syncSoundLib(); T('library lists category',/Top atışı/.test($('sndList').innerHTML)&&/Müzik/.test($('sndMix').innerHTML));
SND.user.gun={vol:1.5,pitch:0.8}; T('per-sound volume',sndVol('gun')===1.5&&sndPitch('gun')===0.8); delete SND.user.gun;
sndPlay('gun'); sndMixStep(); T('no audio context is harmless',true);
openSoundLib(); T('open from menu',true);
T('music tracks',['menu','calm','combat','victory','defeat'].every(function(k){ return MUS_T[k]&&SNDI['mus_'+k]; }));
musStep(); musSting('victory'); T('music safe without audio',true);
SND.cat='muzik'; syncSoundLib(); T('music in library',/Çatışma/.test($('sndList').innerHTML));
console.log('pass',ok,'fail',bad);
