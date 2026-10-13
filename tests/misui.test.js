let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); openMissions(); T_('render ok',typeof mis2Decorate==='function');
MIS2.filt=true; mis2Decorate(); T_('filter toggles',MIS2.filt===true); MIS2.adv=true; mis2Decorate(); T_('advanced toggles',MIS2.adv===true);
console.log('pass',ok,'fail',bad);
