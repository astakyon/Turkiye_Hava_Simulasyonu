let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* every board mission pays within 80–125 % of length × difficulty rate */
const L=boardAll(); let out=[];
L.forEach(function(e){ if(TP_SKIP[e.kind]) return; const m=bMeta(e); if(!m||!m.dur||!m.xp) return; const t=m.dur*(TPR[m.diff]||32); if(m.xp<t*0.8-5||m.xp>t*1.25+5) out.push(e.id+' '+m.xp+'/'+m.dur+'dk'); });
T_('TP within the band',out.length===0,out.join(', '));
T_('board pays the shown TP (air)',BMETA.strike.xp===bMeta(L.find(function(e){ return e.id==='strike'; })).xp);
T_('outlier raised',tpFair(220,15,1)===300); T_('outlier lowered',tpFair(300,7,2)===280); T_('fair kept',tpFair(260,8,2)===260);
/* unarmed aircraft cannot start an armed mission */
T_('ANKA unarmed',!misArmed('anka')); T_('KAAN armed',misArmed('kaan')&&misArmed('tb2'));
/* controls: every vehicle lists how to get out */
T_('sea exit listed',CTRL_DEF.sea.acts.some(function(a){ return a[0]==='exit'; })&&CTRL_DEF.heli.acts.some(function(a){ return a[0]==='exit'&&a[2].indexOf('Enter')>=0; }));
T_('no key conflicts',INPUT.conflicts().length===0,JSON.stringify(INPUT.conflicts()));
/* lessons and exams fit the aircraft they use (altitudes, speeds in the text, waypoints) */
const bad2=[]; LESSONS.forEach(function(l){ const A=l.ac&&AIRCRAFT[l.ac]; if(l.veh==='air'&&!A){ bad2.push(l.id+': uçak yok'); return; } if(!A) return;
  (String(l.d).match(/(\d+)\s*km\/sa/g)||[]).forEach(function(k){ const v=parseInt(k,10)/3.6; if(v>A.vTop*1.02||v<A.landV*0.6) bad2.push(l.id+': '+k); });
  (String(l.d).match(/(\d+)\s*metre/g)||[]).forEach(function(k){ if(parseInt(k,10)>4000) bad2.push(l.id+': '+k); });
  (l.steps||[]).forEach(function(st){ if(st.wp&&st.wp[2]>4000) bad2.push(l.id+': nokta '+st.wp[2]+' m'); }); });
T_('lessons fit their aircraft',bad2.length===0,bad2.join(', '));
console.log('v239: pass '+ok+' fail '+bad);
