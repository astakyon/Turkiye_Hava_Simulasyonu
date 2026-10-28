let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* one troubleshooting screen with three tabs */
T_('screen built',typeof sgdOpen==='function'&&!!$('sgdUI')); T_('row in the graphics tab',!!$('btnSgd'));
let thrown=null; try{ sgdOpen('pt'); sgdTab('gt'); sgdTab('dg'); sgdClose(); }catch(e){ thrown=e.message; } T_('tabs switch',!thrown,thrown);
/* mission editor: visible button */
T_('editor button',!!$('btnMisNew')); thrown=null; try{ edOpen(null); edClose(); }catch(e){ thrown=e.message; } T_('editor opens',!thrown,thrown);
console.log('v237: pass '+ok+' fail '+bad);
