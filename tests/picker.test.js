let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
enterHangar();
T('all 10 hava',pickList().length===10);
setCls('egitim'); T('egitim list',pickList().join()==='hurjet,hurkus',pickList().join()); T('selected moved',['hurjet','hurkus'].includes(selectedId),selectedId);
cycleAircraft(1); T('cycle within',['hurjet','hurkus'].includes(selectedId));
setCls('savas'); T('savas',pickList().join()==='kaan'&&selectedId==='kaan');
setCls('all'); T('count text',els.acCount.textContent==='10 araç',els.acCount.textContent);
T('group tabs',/Hilal Kanatlar/.test(els.grpTabs.innerHTML)&&/disabled/.test(els.grpTabs.innerHTML));
T('maker in kind',/TUSAŞ/.test(els.hKind.textContent),els.hKind.textContent);
for(let i=0;i<5;i++) perfStep(1/20); SETTINGS.autoPerf=true; state='play'; for(let i=0;i<5*25;i++) perfStep(1/25); T('auto perf lowers scale',PERF.scale<1,PERF.scale);
console.log('pass',ok,'fail',bad);
