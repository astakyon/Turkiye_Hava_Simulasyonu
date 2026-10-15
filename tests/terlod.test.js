let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('36 tiles, four versions each',TER.tiles.length===36&&TER.tiles.every(function(t){ return t.geos.length===4; }),TER.tiles.length);
const P=TER.tiles[14].geos[0].attributes&&TER.tiles[14].geos[0].attributes.position;
T_('every version uses whole grid steps',TER.STEPS.every(function(st){ return TER.SEG%st===0; })&&TER.N*TER.SEG===TER.grid-1);
/* the drawn heights are the grid heights = terrainH at grid points */
const H0=-TER.size/2; let maxd=0; for(let k=0;k<50;k++){ const i=(k*37)%TER.grid, j=(k*53)%TER.grid; maxd=Math.max(maxd,Math.abs(TER.H[j*TER.grid+i]-terrainH(H0+i*TER.cell,H0+j*TER.cell))); }
T_('grid equals terrainH',maxd<1e-3,maxd);
/* levels by distance, with the 10 % band when coming closer */
const D=[1000,2000,3000];
T_('near → full detail',terLevel(500,0,D)===0); T_('far → coarsest',terLevel(5000,0,D)===3); T_('between',terLevel(1500,0,D)===1&&terLevel(2500,0,D)===2);
T_('coming closer stays coarse inside the band',terLevel(950,1,D)===1,terLevel(950,1,D)); T_('then switches',terLevel(850,1,D)===0);
T_('quality widens the distances',(function(){ const k=SETTINGS.quality, m=DEV.mobile; DEV.mobile=false; SETTINGS.quality=0; const a=terLodDist()[0]; SETTINGS.quality=3; const b=terLodDist()[0]; SETTINGS.quality=k; DEV.mobile=m; return b>a; })());
const box={min:{x:0,y:0,z:0},max:{x:10,y:5,z:10}}; T_('box distance',Math.abs(terBoxDist(box,{x:13,y:5,z:14})-5)<1e-9&&terBoxDist(box,{x:5,y:1,z:5})===0);
console.log('terlod: pass '+ok+' fail '+bad);
