let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('float default on',t2Opt().float===true);
t2Preset('solel'); T_('left-hand preset',SETTINGS.tch.left===true&&t2Opt().preset==='solel');
t2Preset('klasik'); T_('classic preset',SETTINGS.tch.left===false);
tedOpen(); T_('editor on',TED.on); SETTINGS.tch.pos={tThr:[0.5,0.4]}; t2Apply(); tedClose(); T_('editor off, layout kept',!TED.on&&SETTINGS.tch.pos.tThr[0]===0.5);
console.log('pass',ok,'fail',bad);
