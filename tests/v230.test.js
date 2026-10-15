let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* the ground height is the drawn surface: grid points, the shared diagonal and continuity */
const G=TERH_G; T_('grid ready',!!G&&G.GS===301);
let worst=0; for(let t=0;t<200;t++){ const i=20+((t*37)%260), j=20+((t*53)%260), x=G.H0+i*G.CELL, z=G.H0+j*G.CELL; worst=Math.max(worst,Math.abs(terrainH(x,z)-G.H[j*G.GS+i])); }
T_('grid points match the mesh',worst<1e-3,worst);
let wd=0; for(let t=0;t<200;t++){ const i=20+((t*41)%260), j=20+((t*29)%260), x=G.H0+(i+0.5)*G.CELL, z=G.H0+(j+0.5)*G.CELL, e=(G.H[(j+1)*G.GS+i]+G.H[j*G.GS+i+1])/2; wd=Math.max(wd,Math.abs(terrainH(x,z)-e)); }
T_('cell centre lies on the shared diagonal',wd<1e-3,wd);
let jump=0; for(let t=0;t<400;t++){ const x=-9000+t*45.3, z=3000+Math.sin(t)*4000; jump=Math.max(jump,Math.abs(terrainH(x+0.01,z)-terrainH(x,z))); } T_('continuous',jump<0.05,jump);
/* the formula is still there; how far it was from the drawn ground */
let diff=0; for(let t=0;t<2000;t++){ const x=-12000+(t*977)%24000, z=-12000+(t*613)%24000; diff=Math.max(diff,terrainH(x,z)-terrainHA(x,z)); } T_('formula kept',typeof terrainHA==='function'); console.log('  drawn ground above the old physics height, worst: '+diff.toFixed(2)+' m');
T_('outside the grid: formula',Math.abs(terrainH(16000,0)-terrainHA(16000,0))<1e-6);
/* weapon layout: one place per weapon, mirrored pairs, falls back safely without a ray caster */
setAircraft('kaan'); const P=storeLayout(model,'kaan',['m1','m1','gp','gp','bnk']);
T_('one place per weapon',P.length===5); T_('pairs mirrored',Math.abs(P[0].x+P[1].x)<1e-6&&Math.abs(P[2].x+P[3].x)<1e-6);
console.log('v230: pass '+ok+' fail '+bad);
