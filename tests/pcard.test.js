let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('login screen exists',!!$('loginUI')&&!!$('accMail')&&!!$('accPass')&&!!$('lgGo'));
T_('legacy ids kept',['accIn','accUp','accGoogle','accReset','accGuest','accOut','accLogin','accState','accMsg','accCs','accUnit','accEm','accSave','accProfList','carHead','carStats','carTasks','carMedals','carAch','carStat2','carUnl','carLog','carRanks'].every(function(id){ return !!$(id); }));
accOpen(); T_('profile opens on remembered tab',PCARD_TABS.indexOf(PCARD.tab)>=0);
pcTab('madalya'); T_('tab switch',PCARD.tab==='madalya');
accOpen('career'); T_('career -> kariyer tab',PCARD.tab==='kariyer',PCARD.tab);
accOpen('profile'); T_('profile -> hesap tab',PCARD.tab==='hesap',PCARD.tab);
T_('hero unit set',['hava','deniz','kara'].indexOf($('pcHero').dataset.u)>=0);
accClose();
ACC.cfg={url:'x',key:'y'}; loginOpen('up');
T_('register mode',PCARD.lg==='up');
$('accMail').value='bad'; loginGo(); T_('mail validation',/e-posta/.test($('accMsg').textContent),$('accMsg').textContent);
$('accMail').value='a@b.co'; $('accPass').value='123'; loginGo(); T_('password validation',/6/.test($('accMsg').textContent));
loginClose(); 
ACC.cfg=null; loginOpen(); T_('no cloud: goes to profile hesap',PCARD.tab==='hesap');
console.log('pass',ok,'fail',bad);
