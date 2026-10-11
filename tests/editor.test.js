let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
try{ localStorage.removeItem('ayy-cmis'); }catch(e){} CUS.local=[];
BF.cat='ozel'; T('new mission entry on board',boardList().some(function(e){ return e.kind==='cnew'; }));
edOpen(null); T('editor opens',ED.open&&ED.m.items.length===1);
const m=ED.m; m.n='Test görevi'; m.lim=600;
m.items.push({id:2,t:'gt',type:'truck',x:3000,z:-2000,stage:1},{id:3,t:'gt',type:'radar',x:3100,z:-2050,stage:1},{id:4,t:'wp',x:1000,z:-1000,r:600,stage:2},{id:5,t:'at',x:2000,z:-2500,alt:700,stage:3},{id:6,t:'sc',x:-2000,z:-1500,r:500,stage:4});
edRender(); T('summary',/aşama/.test($('edSum').textContent));
/* code round trip */
const code=cusEncode(m); T('share code',/^AYG1\./.test(code)&&code.length<1200,code.length); const back=cusDecode(code); T('decode',back&&back.items.length===6&&back.n==='Test görevi'&&back.items.find(function(i){ return i.t==='at'; }).alt===700);
T('decode json',!!cusDecode(JSON.stringify(m))); T('bad code rejected',cusDecode('AYG1.@@@')===null);
/* save */
CUS.local.unshift(JSON.parse(JSON.stringify(m))); cusSave(); BF.cat='ozel'; T('saved mission on board',boardList().some(function(e){ return e.kind==='cus'&&e.C.n==='Test görevi'; }));
/* play */
SETTINGS.ai={enemies:0,wing:false,skill:1}; selectedId='kaan'; setAircraft('kaan'); cusPlay(m);
T('custom mission starts in the air at start',M.id==='cus'&&!S.onGround&&Math.abs(S.pos.x)<1&&Math.abs(S.pos.z-2500)<1);
T('stage 1 spawned only',gtargets.length===2&&targets.length===0,gtargets.length+' '+targets.length);
T('objective',/Aşama 1\/4/.test(bObjective().txt),bObjective().txt);
gtargets.forEach(function(g){ killGround(g); }); update(0.05); T('stage 2 begins',CUS.st.stage===2);
S.pos.set(1000,800,-1000); update(0.05); update(0.05); T('waypoint -> stage 3 (air target)',CUS.st.stage===3&&targets.length===1,CUS.st.stage);
targets[0].alive=false; update(0.05); T('stage 4 scan',CUS.st.stage===4);
for(let i=0;i<120&&!M.done;i++){ S.pos.set(-2000,900,-1500); update(0.05); } T('mission complete',M.done&&$('mendTitle').textContent==='Görev tamamlandı');
/* weather/time restored */
T('weather restored',(SETTINGS.wx||'clear')==='clear');
edClose(); BF.cat='all';
console.log('pass',ok,'fail',bad);
