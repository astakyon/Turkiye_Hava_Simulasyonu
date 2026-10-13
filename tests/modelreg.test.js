let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('number parse',mrNum('12,3 m')===12.3&&mrNum('—')===null);
const n0=AC_ORDER.length;
const d=defineAircraft('deneme1',{like:'tb2',name:'Deneme İHA',len:'9,5 m',span:'14 m',maker:'Test',cls:'iha',flight:{vTop:90}});
T_('registered',AIRCRAFT.deneme1===d&&AC_ORDER.length===n0+1&&REG.deneme1&&REG.deneme1.maker==='Test');
T_('copied from base, overridden',d.vTop===90&&d.build===AIRCRAFT.tb2.build&&d.kind===AIRCRAFT.tb2.kind);
defineAircraft('deneme1',{like:'tb2',name:'Deneme İHA'}); T_('no duplicate in order',AC_ORDER.filter(function(x){ return x==='deneme1'; }).length===1);
let R=null; try{ R=modelAudit(); }catch(e){ R=e.message; } T_('audit runs over every model',Array.isArray(R)&&R.length===AC_ORDER.length,typeof R==='string'?R:'');
/* the new aircraft can be flown */
playMode('quick'); missionId='free'; selectedId='deneme1'; let err=null; try{ setAircraft('deneme1'); startGame('air'); }catch(e){ err=e.message; } T_('flyable',err===null&&state==='play',err);
console.log('modelreg: pass '+ok+' fail '+bad);
