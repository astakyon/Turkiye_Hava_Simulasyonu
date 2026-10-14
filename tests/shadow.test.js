let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const dv=DEV.mobile;
DEV.mobile=false; SETTINGS.shadows=null; SETTINGS.quality=3; T_('PC Ultra default: Yüksek',shadowLevel()===3); SETTINGS.quality=1; T_('PC Orta default: Düşük',shadowLevel()===1); SETTINGS.quality=0; T_('PC Düşük: off',shadowLevel()===0&&!shadowsOn());
DEV.mobile=true; SETTINGS.quality=3; T_('phone Ultra default: Orta',shadowLevel()===2); SETTINGS.quality=2; T_('phone Yüksek: off',shadowLevel()===0);
SETTINGS.shadows=true; T_('old "Açık" maps to a level',shadowLevel()===2); SETTINGS.shadows=false; T_('old "Kapalı"',shadowLevel()===0); SETTINGS.shadows=3; T_('explicit level',shadowLevel()===3);
DEV.mobile=dv; SETTINGS.shadows=null;
/* when to redraw */
state='play'; S.onGround=false; S.pos.set(0,5000,0); SHU.sun.copy(SUN); SHU.n=0; let k=0; for(let i=0;i<8;i++) if(shNeed()) k++; T_('high up: every 4th frame',k===2,k);
S.pos.set(0,groundH(0,0)+50,0); k=0; for(let i=0;i<8;i++) if(shNeed()) k++; T_('low: every frame',k===8,k);
state='walk'; T_('on foot: every frame',shNeed()===true); state='play'; S.pos.set(0,5000,0); SUN.x+=0.01; T_('sun moved: redraw',shNeed()===true); SUN.x-=0.01;
console.log('shadow: pass '+ok+' fail '+bad);
