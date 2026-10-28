let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* the guide is generated from the feature inventory */
T_('guide data',typeof REHBER!=='undefined'&&REHBER.length>=40,typeof REHBER!=='undefined'&&REHBER.length);
T_('every card complete',REHBER.every(function(f){ return f.kat&&f.ad&&f.ne&&f.nereden&&/^V\d\.\d\d$/.test(f.surum); }));
T_('no admin tools in the guide',!REHBER.some(function(f){ return f.kat==='Yönetici araçları'; }));
enterTitle(); T_('guide in the main menu',/data-act="guide"/.test($('cNav').innerHTML));
T_('opens',(function(){ try{ titleAct('guide'); return true; }catch(e){ return false; } })());
REH.q='flare'; rehRender(); T_('search finds',/FLARE|Flare|flare/.test($('rehBody').innerHTML)); REH.q=''; REH.kat='Dünya'; rehRender(); T_('category filter',/Ada ve üsler/.test($('rehBody').innerHTML)&&!/Uçuş okulu/.test($('rehBody').innerHTML)); REH.kat='';
console.log('v236: pass '+ok+' fail '+bad);
