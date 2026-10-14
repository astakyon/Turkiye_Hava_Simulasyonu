let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:1,wing:true,skill:1}; startGame('air');
const G=bkGroups(); T_('player aircraft is a bake group',G.has(planeGroup));
let nested=false; G.forEach(function(g){ let p=g.parent; while(p&&p!==scene){ if(G.has(p)) nested=true; p=p.parent; } }); T_('only outermost groups',!nested);
/* part filter */
const g={}; const mk=function(vis,ud){ return {isMesh:true,geometry:{attributes:{position:{count:3}}},material:{type:'MeshLambertMaterial'},visible:vis,userData:ud||{},parent:g}; };
T_('plain part is bakeable',bkPart(mk(true),g)); T_('hidden part is not',!bkPart(mk(false),g)); T_('noBake part is not',!bkPart(mk(true,{noBake:true}),g)); T_('already baked mesh is not',!bkPart(mk(true,{bakedMesh:true}),g));
const inst=mk(true); inst.isInstancedMesh=true; T_('instanced is not',!bkPart(inst,g)); const sh=mk(true); sh.material={isShaderMaterial:true}; T_('shader material is not',!bkPart(sh,g));
/* kill switch */
SETTINGS.bake=false; T_('kill switch',bkBake(planeGroup)===null); delete SETTINGS.bake;
/* size cull ignores the player's aircraft and hides far small-part meshes */
const far={layers:{on:true,enable:function(){ this.on=true; },disable:function(){ this.on=false; }},geometry:{boundingSphere:{center:{x:0,y:0,z:0},radius:5}},matrixWorld:null,userData:{bkR:0.3}};
camera.position.set(0,0,0); BK.v={copy:function(){ return this; },applyMatrix4:function(){ return this; },distanceTo:function(){ return 5000; }};
bkShow([{meshes:[far]}],null); T_('far mesh of small parts hidden',far.layers.on===false); BK.v.distanceTo=function(){ return 20; }; bkShow([{meshes:[far]}],null); T_('near: shown',far.layers.on===true);
BK.v=null;
console.log('bake: pass '+ok+' fail '+bad);
