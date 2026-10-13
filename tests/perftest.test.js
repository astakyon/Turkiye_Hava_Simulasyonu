let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* statistics */
const A=[]; for(let i=0;i<100;i++) A.push(i<90?16:i<99?33:100);
T_('percentiles',ptPct(A,50)===16&&ptPct(A,90)===16&&ptPct(A,95)===33&&ptPct(A,99)===33&&ptPct(A,100)===100,[ptPct(A,90),ptPct(A,99)].join());
PT.refresh=60;
const sg={ft:A,cpu:A.map(function(){ return 3; }),gpu:[],calls:[300],tris:[500000],alloc:0,gcN:0,dur:2};
const s=ptSummary(sg); T_('summary: avg / P90 / P99 / slow / hitch',s.p90===62.5&&s.p99===30.3&&s.slow===1&&s.hitch>=1&&s.calls===300,JSON.stringify(s));
T_('smooth at 60 Hz = screen-bound',s.bound==='ekran',s.bound); const s2=ptSummary({ft:A.map(function(x){ return x+10; }),cpu:[3],gpu:[],calls:[1],tris:[1],alloc:0,gcN:0,dur:1}); T_('GPU-bound guess when CPU time is small',/gpu/.test(s2.bound),s2.bound);
T_('screen-bound when smooth',ptBound({n:10,ms:16.6,ms90:16.9,cpu:4,gpu:null})==='ekran');
T_('CPU-bound',ptBound({n:10,ms:30,ms90:34,cpu:27,gpu:null})==='cpu');
T_('GPU-bound with timer',ptBound({n:10,ms:30,ms90:34,cpu:8,gpu:26})==='gpu');
/* refresh rate from idle frame intervals */
T_('refresh 60',ptRefresh([16.6,16.7,16.8,16.7,33])===60); T_('refresh 120',ptRefresh([8.3,8.4,8.3,8.3,16.6])===120); T_('refresh 90',ptRefresh([11.1,11.2,11.1,11.0])===90);
/* scripted camera poses */
const p0=ptAirPose(PT_AIR.ucus,0), p1=ptAirPose(PT_AIR.ucus,1); T_('flight path moves at ~245 m/s',Math.abs(Math.hypot(p1.x-p0.x,p1.z-p0.z)-245)<10&&p0.y===700,Math.hypot(p1.x-p0.x,p1.z-p0.z));
const lp=ptAirPose(PT_AIR.alcak,3); T_('low path stays above ground',lp.y>=terrainH(lp.x,lp.z)+150,lp.y);
/* full script with fake frames (time scaled down), then restore */
SETTINGS.autoPerf=true; SETTINGS.fpsCap=30; const ai0=JSON.stringify(SETTINGS.ai);
ptStart({k:0.2}); T_('test running, adaptive quality and FPS limit off',PT.run&&SETTINGS.autoPerf===false&&SETTINGS.fpsCap===0);
let guard=0, sawFly=false, sawWalk=false, sawStress=false;
while(PT.run&&guard++<20000){ const st=PT.steps[PT.si]; const ft=st&&st.idle?16.7:(st&&st.stress?25:18+(guard%7));
  update(ft/1000); if(state==='play') sawFly=true; if(state==='walk'){ sawWalk=true; walkUpdate(ft/1000); } if(st&&st.stress&&PT.spawned.length===8) sawStress=true;
  ptTick(guard*ft,ft,4); }
T_('script finished',!PT.run&&guard<20000,guard);
T_('visited flight, walk and stress',sawFly&&sawWalk&&sawStress,[sawFly,sawWalk,sawStress].join());
const R=PT.rep; T_('report has scenes, baseline, features',R&&R.scenes.length===6&&R.base&&R.feats.length>=2,R&&[R.scenes.length,!!R.base,R.feats.length].join());
T_('refresh measured',R.refresh===60,R.refresh);
T_('first-use effects measured',R.fx.length===2&&R.fx[0].k==='patlama',JSON.stringify(R.fx));
T_('summary + tips',R.sum.avg>0&&R.sum.p90>0&&R.tips.length>0,JSON.stringify(R.sum));
T_('settings restored',SETTINGS.autoPerf===true&&SETTINGS.fpsCap===30&&JSON.stringify(SETTINGS.ai)===ai0);
T_('stress aircraft removed',PT.spawned.length===0&&!ACT.some(function(a){ return /^PT/.test(a.id); }));
T_('back in the menu',state==='menu');
const J=JSON.stringify(R); T_('report is small (< 120 KB)',J.length<120000,J.length);
T_('report has no account data',!/@|callsign|email/i.test(J.replace(/"ua":"[^"]*"/,'')));
/* stored locally, newest first, at most 5 */
for(let i=0;i<6;i++) ptStore({at:'x'+i}); T_('local store keeps 5',ptLocal().length===5&&ptLocal()[0].at==='x5');
/* abort with Esc-like state change */
ptStart({k:0.2}); for(let i=0;i<400&&PT.run;i++){ ptTick(i*18,18,3); if(i===200) state='paused'; } T_('stops when the game is paused',!PT.run&&PT.rep.aborted===true);
console.log('perftest: pass '+ok+' fail '+bad);
