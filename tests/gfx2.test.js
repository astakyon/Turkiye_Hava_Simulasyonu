let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const keepQ=SETTINGS.quality, keepM=DEV.mobile; SETTINGS.gd={}; SETTINGS.quality=2;
T_('groups follow the preset',GD_KEYS.every(function(k){ return gq(k)===2; }));
SETTINGS.gd.trees=0; T_('own level wins',gq('trees')===0&&gq('view')===2); T_('own level = custom',gdCustom()===true);
SETTINGS.gd={}; SETTINGS.fx=null; SETTINGS.shadows=null; SETTINGS.aa='auto'; SETTINGS.res='auto'; T_('preset only = not custom',gdCustom()===false);
/* each group drives its own thing */
DEV.mobile=false; SETTINGS.gd={view:0}; const d0=terLodDist()[0]; SETTINGS.gd={view:3}; T_('view distance',terLodDist()[0]>d0);
SETTINGS.gd={trees:0}; const t0=treeDensity(); SETTINGS.gd={trees:3}; T_('vegetation',treeDensity()>t0);
SETTINGS.gd={tex:0}; T_('texture limit PC low',txsLimit()===1024); SETTINGS.gd={tex:3}; T_('texture limit PC ultra = none',txsLimit()>=1e9);
DEV.mobile=true; SETTINGS.gd={tex:3}; T_('phones keep 1024 above Düşük',txsLimit()===1024); SETTINGS.gd={tex:0}; T_('phone Düşük 512',txsLimit()===512); DEV.mobile=false;
/* fewer particles at low effect quality */
let used=0; const keepP=parts.map(function(p){ return p.on; }); parts.forEach(function(p){ p.on=false; });
SETTINGS.gd={fx:0}; explode(new THREE.Vector3(0,0,0),40,1); used=parts.filter(function(p){ return p.on; }).length; T_('effect quality scales particles',used===16,used);
parts.forEach(function(p,i){ p.on=keepP[i]; });
/* preset row: a fixed level clears own choices, Otomatik picks the device level */
SETTINGS.gd={trees:1}; SETTINGS.fx=0; const ev=function(q){ const b=document.createElement('button'); b.dataset.q=q; return b; };
SETTINGS.quality=keepQ; DEV.mobile=keepM; SETTINGS.gd={};
console.log('gfx2: pass '+ok+' fail '+bad);
