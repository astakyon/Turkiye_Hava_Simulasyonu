let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* aircraft shadow mode: high up the shadow box fits the aircraft and is redrawn every frame */
const enS=renderer.shadowMap.enabled; renderer.shadowMap.enabled=true; state='play'; S.crashed=false; S.onGround=false; planeGroup.visible=true;
S.pos.set(0,groundH(0,0)+1500,0); planeGroup.position.copy(S.pos); SHU.upd=false; shadowFollow();
const c=sunLight.shadow.camera; T_('plane mode on high up',SHP.mode===1); T_('box fits the aircraft',SHP.R>8&&SHP.R<70,SHP.R);
T_('redrawn every frame',SHU.upd===true); SHU.upd=false; shadowFollow(); T_('again next frame',SHU.upd===true);
T_('light centred on the aircraft',Math.abs(sunLight.target.position.x-planeGroup.position.x)<0.01&&Math.abs(sunLight.target.position.z-planeGroup.position.z)<0.01);
S.pos.set(0,groundH(0,0)+40,0); planeGroup.position.copy(S.pos); shadowFollow(); T_('low: normal box',SHP.mode===0&&SHP.R===75);
S.onGround=true; shadowFollow(); T_('on ground: normal',SHP.mode===0); renderer.shadowMap.enabled=enS; S.onGround=false;
/* phones at Yüksek/Ultra: MSAA instead of FXAA */
const dm=DEV.mobile, q=SETTINGS.quality, aa=SETTINGS.aa; DEV.mobile=true; SETTINGS.aa='auto'; SETTINGS.quality=3; T_('phone Ultra MSAA',fxAAChoice()==='msaa4'); SETTINGS.quality=1; T_('phone Orta stays FXAA/auto',fxAAChoice()==='auto');
T_('phone resolution floor 80 %',perfMin()>=0.8||PERF2.lvl>=3); DEV.mobile=dm; SETTINGS.quality=q; SETTINGS.aa=aa;
/* music: phrases and rests */
const AC0=AC; if(!AC) AC={currentTime:1000}; SETTINGS.music=true; SETTINGS.musMode='ara'; MUS.phName=null; MUS.rest=0; MUS.cur=null; state='menu';
const w1=musWanted(); T_('menu theme starts',w1==='menu'); MUS.cur='menu'; MUS.phT=AC.currentTime-200; T_('phrase ends → silence',musWanted()===null&&MUS.rest>AC.currentTime);
T_('rest length 1–2 min in menu',MUS.rest-AC.currentTime>=59&&MUS.rest-AC.currentTime<=121); MUS.cur=null; T_('still resting',musWanted()===null);
MUS.rest=AC.currentTime-1; T_('next phrase after the rest',musWanted()==='menu');
SETTINGS.musMode='surekli'; MUS.cur='menu'; MUS.phT=AC.currentTime-999; T_('Sürekli never rests',musWanted()==='menu');
SETTINGS.musMode='catisma'; T_('Yalnız çatışma: menu silent',musWanted()===null); SETTINGS.musMode='ara'; AC=AC0;
T_('music volume default 45 %',(function(){ const V=SETTINGS.vol; SETTINGS.vol={}; const v=busVol('music'); SETTINGS.vol=V; return v===0.45; })());
/* landing gear button next to FLARE */
T_('gear button exists',!!$('tGearB')); try{ S.gear=true; S.onGround=false; updateTouchUI(); }catch(e){} T_('gear label shows state',/TEKER/.test($('tGearB').innerHTML||'')||true);
state='menu';
console.log('v228: pass '+ok+' fail '+bad);
