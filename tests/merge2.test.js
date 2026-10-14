let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* cell keys: size class, leftover cells 4x larger */
const v={x:1000,y:0,z:-300}; T_('normal cell',mrgCellKey(1,v)==='S1,-1',mrgCellKey(1,v)); T_('leftover cell (3.2 km, own prefix)',mrgCellKey(1,v,true)==='Sx0,-1',mrgCellKey(1,v,true));
/* frozen matrices: a fake object that the game moves later is thawed by the watchdog */
function V(x,y,z){ return {x:x,y:y,z:z,equals:function(o){ return o.x===this.x&&o.y===this.y&&o.z===this.z; },clone:function(){ return V(this.x,this.y,this.z); }}; }
function Q(){ return {x:0,y:0,z:0,w:1,equals:function(o){ return o.x===this.x&&o.y===this.y&&o.z===this.z&&o.w===this.w; },clone:function(){ const q=Q(); q.x=this.x; q.y=this.y; q.z=this.z; q.w=this.w; return q; }}; }
function obj(){ return {position:V(1,2,3),quaternion:Q(),scale:V(1,1,1),matrixAutoUpdate:true,parent:{},updated:0,updateMatrix:function(){ this.updated++; }}; }
const still=obj(), door=obj(), gone=obj(); gone.parent=null;
MFZ.list=[]; MFZ.i=0; MFZ.thawed=0; MFZ.cand=[still,door,gone].map(function(o){ return {o:o,p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()}; });
mfzFreeze(); T_('freezes still objects, skips removed ones',still.matrixAutoUpdate===false&&door.matrixAutoUpdate===false&&MFZ.list.length===2&&still.updated===1);
door.position.x=5; for(let i=0;i<3;i++) mfzStep(); T_('moved object thawed',door.matrixAutoUpdate===true&&MFZ.thawed===1&&MFZ.list.length===1);
T_('still object stays frozen',still.matrixAutoUpdate===false);
const moved=obj(); MFZ.cand=[{o:moved,p:V(0,0,0),q:moved.quaternion.clone(),s:moved.scale.clone()}]; mfzFreeze(); T_('object that moved during the 1.5 s wait is not frozen',moved.matrixAutoUpdate===true);
/* merged cell with several meshes: distance cull toggles all of them */
function M(){ return {layers:{on:true,enable:function(){ this.on=true; },disable:function(){ this.on=false; }}}; }
const a=M(), b=M(); const cell={key:'k',mesh:a,meshes:[a,b],rMax:2,c:{distanceTo:function(){ return 9000; }},R:300};
mrgShow([cell]); T_('far cell: all meshes hidden',!a.layers.on&&!b.layers.on); cell.c.distanceTo=function(){ return 10; }; mrgShow([cell]); T_('near cell: all shown',a.layers.on&&b.layers.on);
console.log('merge2: pass '+ok+' fail '+bad);
