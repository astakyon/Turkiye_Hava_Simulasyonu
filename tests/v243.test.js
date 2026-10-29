let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* TB3: own model with folding wings, TB2's munitions, fold button in the hangar */
const m=buildTB3(); T_('model',!!m.group&&m.folds.length===2&&m.spinners.length===1&&m.stnMaxX>m.stnMinX);
T_('old model kept',typeof AIRCRAFT.tb3.buildOld==='function');
tbFold(m,1); T_('folds',Math.abs(m.folds[0].p.rotation.z-m.folds[0].a)<1e-6); tbFold(m,0); T_('unfolds',m.folds.every(function(d){ return d.p.rotation.z===0; }));
T_('munitions',munOf('tb3','gp')===MUNI.maml&&munOf('tb3','m3')===MUNI.mamt&&wpnOf('tb3').indexOf('m1')<0);
selectedId='tb3'; enterHangar(); T_('fold button shown',foldCan());
foldSet(1); for(let i=1;i<80;i++) foldStep(i*50); T_('folded in hangar',FOLD.t===1&&FOLD.f===1&&Math.abs(model.folds[1].p.rotation.z-model.folds[1].a)<1e-6);
startGame('runway'); T_('flight starts unfolded',FOLD.f===0&&model.folds.every(function(d){ return d.p.rotation.z===0; }));
selectedId='kaan'; enterHangar(); T_('no button for KAAN',!foldCan());
console.log('v243: pass '+ok+' fail '+bad);
