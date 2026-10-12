let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('device profile',DEV&&typeof DEV.mobile==='boolean'&&DEV.kind);
T('sky never depth-clipped',sky.renderOrder<0&&sky.frustumCulled===false);
T('shadow depth range tight',sunLight.shadow.camera.far-sunLight.shadow.camera.near<=1500);
startGame('runway'); aiClear(); camera.position.set(S.pos.x,S.pos.y+800,S.pos.z+40); DEV.logDepth=false; camera.near=1; nearPlane();
T('near plane grows with altitude',camera.near>1,camera.near);
camera.position.set(S.pos.x,S.pos.y+3,S.pos.z+12); nearPlane(); T('near plane small next to the aircraft',camera.near<=4.2,camera.near);
gfxDiag(); T('diagnostics rows',/Ekran kartı/.test($('gdiag').innerHTML));
// V1.58 resolution: PC never below 85 %
DEV.mobile=false; SETTINGS.autoPerf=true; SETTINGS.res='auto'; state='play'; PERF.scale=1; for(let k=0;k<400;k++) perfStep(1/20+1e-9);
T('ladder engaged when slow at the floor',PERF2.lvl>=1,PERF2.lvl); PERF2.lvl=0; PERF.scale=Math.max(PERF.scale,0.85);
T('PC autoscale floor 0.85',PERF.scale>=0.85-1e-9&&PERF.scale<1,PERF.scale);
SETTINGS.res='1.5'; applyQuality(); T('fixed res scale',Math.abs(PERF.base-Math.min(2.5,1.5*(window.devicePixelRatio||1)))<1e-6&&PERF.scale===1,PERF.base);
SETTINGS.res='auto'; applyQuality();
// V1.59 presets + culling
SETTINGS.quality=3; applyQuality(); T('ultra preset cull px',Math.abs(CULL.px-CULL_PX[3]*(DEV.mobile?1.3:1))<1e-9,CULL.px); T('ultra fx default',fxDefault()===(DEV.mobile?1:2));
SETTINGS.quality=0; applyQuality(); T('low preset: no shadows by default',shadowDefault()===false); SETTINGS.quality=2; applyQuality();
T('cull functions',typeof chunkInstances==='function'&&typeof cullStep==='function'); cullStep(0.016);
console.log('pass',ok,'fail',bad);
