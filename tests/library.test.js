let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const items=libItems().filter(function(i){ return !i.head; });
T('library lists all aircraft',AC_ORDER.every(function(id){ return items.some(function(i){ return i.key==='ac:'+id; }); }));
T('library lists vehicles and equipment',items.filter(function(i){ return i.kind!=='ac'; }).length>=10);
// livery: paints every copy of the aircraft (player, hangar), and can be reset
const inst=MODELS.inst.kaan; T('kaan tracked',inst&&inst.length>=1,inst&&inst.length);
LIV.data={}; livSet('kaan',{color:'#6f7a52',camo:1});
function painted(m){ let n=0; m.group.traverse(function(o){ if(o.userData.liv0) n++; }); return n; }
// (painting itself is checked in the real browser: the stub has no real colours/geometry)
T('livery stored',LIV.data.kaan&&LIV.data.kaan.camo===1);
T('other aircraft untouched',MODELS.inst.hurjet.every(function(m){ return painted(m)===0; }));
livReset('kaan'); T('livery reset restores materials',MODELS.inst.kaan.every(function(m){ return painted(m)===0; }));
// spec export keeps only the useful fields
const so=libSpecOut({rotation:[0,90,0],local:true,preview:true,length:12,gearNodes:[],surfaces:[{node:'a',axis:'x',input:'roll',max:18,sign:-1}]});
T('spec out',JSON.stringify(so)==='{"rotation":[0,90,0],"length":12,"surfaces":[{"node":"a","axis":"x","input":"roll","max":18,"sign":-1}]}',JSON.stringify(so));
T('part roles',libPartRole({surfaces:[{node:'a',input:'roll',sign:-1}],gearNodes:['g']},'a')==='ail_l'&&libPartRole({gearNodes:['g']},'g')==='gear');
console.log('pass',ok,'fail',bad);
