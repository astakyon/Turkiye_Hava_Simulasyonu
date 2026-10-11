let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('stars and moon',!!TOD.stars&&!!TOD.moon);
SETTINGS.tod='day'; todReset(); T('day keeps the original sun',Math.abs(SUN.y-TOD.sun0.y)<1e-6&&TOD.nightK===0&&TOD.lit<0.05,TOD.lit);
SETTINGS.tod='night'; todReset(); T('night',TOD.nightK>0.9,TOD.nightK);
T('windows lit at night',NIGHTMATS.length>5&&TOD.lit>0.8,TOD.lit);
SETTINGS.tod='dusk'; todReset(); T('dusk is twilight',TOD.nightK<0.9&&SUN.y<0.4,SUN.y);
SETTINGS.tod='dawn'; todReset(); T('morning light',TOD.nightK<0.5&&SUN.y>0&&SUN.y<0.3,SUN.y);
SETTINGS.tod='cycle'; TOD.h=11.9; todReset(); todStep(60); T('cycle advances time',TOD.h>12.5&&TOD.h<13.5,TOD.h);
SETTINGS.tod='day'; todReset(); T('back to day',TOD.lit<0.05&&TOD.nightK===0,TOD.lit);
console.log('pass',ok,'fail',bad);
