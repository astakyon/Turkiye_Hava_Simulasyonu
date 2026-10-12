let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick');
/* figures agree with the inventory text */
const txt=function(n){ const r=ENV_DATA[ENV_IDX[n]]; return JSON.stringify(r[5]); };
T_('TB2 ceiling 27.000 ft in inventory',/27\.000 Feet/.test(txt('Bayraktar TB2'))&&Math.round(REALP.tb2.ceil)===8230);
T_('Hürkuş ceiling 10577 m in inventory',/10577 m/.test(txt('Hürkuş Temel Eğitim Uçağı'))&&REALP.hurkus.ceil===10577);
T_('Akıncı 195 knot',/195 Knots/.test(txt('Bayraktar Akıncı Taarruzi İnsansız Hava Aracı')));
T_('every REALP id is a game vehicle',Object.keys(REALP).every(function(id){ return AIRCRAFT[id]||HELI_DEF[id]; }));
function climb(id,y0,sec){ selectedId=id; setAircraft(id); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); S.pos.y=y0; S.speed=CUR.vTop*0.8; S.throttle=1; S.gear=false;
  S.q.setFromAxisAngle(new THREE.Vector3(1,0,0),0.12); let top=0; for(let i=0;i<sec*30;i++){ T+=1/30; update(1/30); top=Math.max(top,S.pos.y); if(S.crashed) break; } return top; }
const c=REALP.tb2.ceil; const top=climb('tb2',c-600,240); T_('TB2 levels off at its ceiling',top<c+30&&top>c-500,Math.round(top)+' / '+Math.round(c));
SETTINGS.realp=false; const top2=climb('tb2',c-600,240); T_('without the setting it climbs past',top2>c+100,Math.round(top2)); delete SETTINGS.realp;
T_('no ceiling for KAAN (no data)',realCeil('kaan')===0);
selectedId='tb2'; setAircraft('tb2'); startGame('air'); S.pos.y=1000; T_('full thrust far below ceiling',ceilK()===1);
T_('hangar shows real data and source',/GERÇEK/.test(perfHTML('akinci'))&&/195 knot/.test(perfHTML('akinci'))&&/Defence Turk/.test(perfHTML('akinci')));
T_('no-data message',/oyun değerleri/.test(perfHTML('kaan')));
console.log('pass',ok,'fail',bad);
