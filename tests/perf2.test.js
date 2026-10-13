let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* the instanced bounding-sphere guard needs real three.js: covered by tools/browser-check.js */
/* merge cells: size class and cell size */
const v=new THREE.Vector3(1000,0,-300);
T_('small props get S cells',/^S1,-1$/.test(mrgCellKey(1,v)),mrgCellKey(1,v));
T_('big pieces get 4 km B cells',/^B0,-1$/.test(mrgCellKey(400,v)),mrgCellKey(400,v));
T_('classes differ',mrgCellKey(2,v)!==mrgCellKey(10,v)&&mrgCellKey(10,v)!==mrgCellKey(60,v));
/* a far cell of small props is hidden, a near one shown */
const cm={layers:{on:true,enable:function(){ this.on=true; },disable:function(){ this.on=false; }}};
const far={key:'x',mesh:cm,rMax:2,c:{x:0,d:6400,distanceTo:function(){ return this.d; }},R:400};
mrgShow([far]); T_('far small-prop cell hidden',!cm.layers.on);
far.c.d=10; mrgShow([far]); T_('near cell shown',cm.layers.on);
/* device tier */
const dv=Object.assign({},DEV); DEV.mobile=false; DEV.gpu='SwiftShader'; T_('software GL → Düşük',devTier()===0);
DEV.gpu='NVIDIA GeForce RTX 3060'; T_('RTX → Ultra',devTier()===3);
DEV.mobile=true; DEV.gpu='Mali-T720'; T_('old Mali phone → Düşük',devTier()===0); Object.assign(DEV,dv);
/* cull refresh keeps working with a Set */
let ce=null; try{ cullCollect(); cullCollect(); }catch(e){ ce=e.message; } T_('cull refresh runs',ce===null,ce);
console.log('perf2: pass '+ok+' fail '+bad);
