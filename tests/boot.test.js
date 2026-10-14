let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* without a browser the start-up runs at once, every step once */
T_('boot finished',BOOT.done===true&&BOOT.hold===false);
T_('every step ran',BOOT.stepMs.length===BOOT_STEPS.length,BOOT.stepMs.length+'/'+BOOT_STEPS.length);
T_('marks recorded',BOOT.marks.some(function(m){ return m[0]==='modüller'; })&&BOOT.marks.some(function(m){ return m[0]==='dünya hazır'; }));
T_('world built',typeof planeGroup!=='undefined'&&!!planeGroup&&state==='menu',state);
/* a failing step does not stop the others */
let ran=0; const keepErr=console.error; console.error=function(){}; bootRun([['a',function(){ throw new Error('x'); }],['b',function(){ ran++; }]],function(){ ran+=10; }); console.error=keepErr;
T_('failing step skipped, rest runs',ran===11,ran);
/* shader warm-up: every material once, hidden objects included, nothing drawn */
THREE.Mesh.prototype.isMesh=true; WARM.seen=new Set(); const n=warmScan(); T_('warm queue built',n>0,n);
T_('hidden explosion particles included',WARM.q.indexOf(parts[0].m)>=0||WARM.seen.has(warmKey(parts[0].m)));
const n0=WARM.n; let guard=0; while(!WARM.done&&guard++<10000) warmStep(1e9); T_('warm finished',WARM.done&&WARM.n-n0===WARM.q.length,(WARM.n-n0)+'/'+WARM.q.length);
const again=warmScan(); T_('second scan finds nothing new',again===0,again);
SETTINGS.warm=false; WARM.done=false; T_('kill switch',warmStep(8)===0); delete SETTINGS.warm; WARM.done=true;
/* report */
const bi=bootInfo(); T_('boot info in report',bi&&bi.warm&&bi.slow.length>0&&bi.world!=null,JSON.stringify(bi));
/* inventory search text is built lazily */
T_('inventory search text lazy',typeof envTxt==='function'&&envTxt().length===ENV_DATA.length);
console.log('boot: pass '+ok+' fail '+bad);
