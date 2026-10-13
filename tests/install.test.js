let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('install helpers',typeof instGo==='function'&&typeof instBtn==='function');
INST.evt={prompt:function(){ INST.prompted=true; },userChoice:Promise.resolve({outcome:'accepted'})}; instGo(); T_('install prompt used',INST.prompted===true&&INST.evt===null);
console.log('pass',ok,'fail',bad);
