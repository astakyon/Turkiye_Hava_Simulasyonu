let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* V2.52: in-game account deletion (Google Play requirement) — two presses, only while signed in */
T_('functions',typeof accDelPress==='function'&&typeof accDelSync==='function'&&!!ACCDEL);
let threw=false; try{ accRender(); }catch(e){ threw=true; } T_('render hook',!threw);
const u=ACC.user; ACC.user=null; accDelPress(); T_('guest cannot arm',ACCDEL.armT===0); ACC.user=u;
console.log('v252: pass '+ok+' fail '+bad);
