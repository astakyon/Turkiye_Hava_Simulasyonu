let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const p=accProfile(); p.stats={}; p.xp=0; p.rank=0; p.tasks=null;
/* tasks */
const X=tasksNow(); T('3 daily + 2 weekly tasks',X.daily.length===3&&X.weekly.length===2);
T('same tasks on the same day',JSON.stringify(taskGen(dayKey(),3,false))===JSON.stringify(taskGen(dayKey(),3,false)));
T('different next day',JSON.stringify(taskGen('2026-10-11',3,false))!==JSON.stringify(taskGen('2026-10-12',3,false)));
const t=X.daily[0], patch={}; patch[t.k]=t.need; const xp0=p.xp||0; careerAdd(0,patch); const X2=tasksNow(); T('task completes and pays',X2.daily[0].done&&(p.xp||0)>=xp0+t.xp,(p.xp||0)+' '+t.xp);
T('weekly progresses too',X2.weekly.some(function(w){ return w.k===t.k; })?X2.weekly.find(function(w){ return w.k===t.k; }).v>0:true);
/* achievements */
careerAdd(0,{landings:100}); T('achievement unlocked',(p.stats.ach||[]).indexOf('land100')>=0); const n=(p.stats.ach||[]).length; careerAdd(0,{landings:1}); T('only once',(p.stats.ach||[]).length===n);
/* paint */
selectedId='hurjet'; setAircraft('hurjet'); paintSet('hurjet','col'); T('paint saved',PAINT.hurjet==='col'&&LIV.data.hurjet&&LIV.data.hurjet.color==='#c9b48a'); paintSet('hurjet','std'); T('standard paint',!PAINT.hurjet);
/* stats from play */
selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); S.pos.set(3000,1500,3000); S.speed=200; const d0=p.stats.dist||0; for(let i=0;i<20;i++) progStep(0.1); T('distance counted',(p.stats.dist||0)-d0>300,(p.stats.dist||0)-d0);
/* render */
careerRender(); T('career page sections',/BUGÜN/.test($('carTasks').innerHTML)&&/Başarım|İniş ustası/.test($('carAch').innerHTML)&&/Uçulan mesafe/.test($('carStat2').innerHTML)&&/Altay|Boya/.test($('carUnl').innerHTML));
console.log('pass',ok,'fail',bad);
