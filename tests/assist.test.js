let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* announcements */
const now=new Date().toISOString(), old=new Date(Date.now()-7200e3).toISOString();
let o=annParse({id:1,text:'⏱600|Merhaba pilotlar',created_at:now}); T_('parse timed',o.sec===600&&o.text==='Merhaba pilotlar'&&!o.flash);
o=annParse({id:2,text:'⏱f|Şimdi',created_at:now}); T_('parse flash',o.flash&&o.text==='Şimdi');
o=annParse({id:3,text:'Eski biçim',created_at:old}); T_('legacy permanent',o.exp===Infinity&&o.text==='Eski biçim');
ANN.seen={}; annApply([{id:10,text:'⏱600|Yeni',created_at:now,active:true},{id:11,text:'⏱600|Bitti',created_at:old,active:true}]);
T_('expired filtered',ANN.list.length===1&&ANN.list[0].id===10,ANN.list.length);
T_('banner shown once',ANN.cur&&ANN.cur.id===10&&!!ANN.seen[10]); annStep(30); T_('banner times out',ANN.cur===null);
annApply([{id:10,text:'⏱600|Yeni',created_at:now,active:true}]); T_('not shown again',ANN.cur===null);
/* licences: stages remembered, granted after retry outside the exam engine */
playMode('career'); const p=licProfile(); p.lic2={}; if(p.stats){ delete p.stats.lic2; delete p.stats.licp; }
EXAM.on=false; licStepDone('l:x_iha_kalkis'); T_('one stage: not yet',!licProfile().lic2.iha);
licStepDone('l:x_iha_inis'); T_('all stages: granted',!!licProfile().lic2.iha);
T_('stored in stats (cloud)',!!(accProfile().stats.lic2&&accProfile().stats.lic2.iha));
T_('iha exam target 150 m',/150/.test(LESSONS.find(function(l){ return l.id==='x_iha_kalkis'; }).steps.map(function(s){ return s.t; }).join(' ')));
licStepDone('r:x_car'); T_('single-stage race licence',!!licProfile().lic2.ehliyet);
/* autoland */
function fly(id,secs){ playMode('quick'); selectedId=id; setAircraft(id); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air');
  S.pos.set(30,AIRFIELD_Y+Math.tan(3*Math.PI/180)*4200+40,830+4200); sQ(0); S.speed=lndVapp()*1.1; S.throttle=0.4; S.gear=true; S.onGround=false; S.sink=0;
  let t=0, minV=1e9; for(; t<secs; t+=1/60){ lndStep(); pollPad(); update(1/60); if(S.crashed||S.onGround) break; }
  return {landed:S.onGround&&!S.crashed, crashed:S.crashed, why:S.crashReason, t:Math.round(t), x:Math.round(S.pos.x), z:Math.round(S.pos.z), y:Math.round(S.pos.y-AIRFIELD_Y)}; }
SETTINGS.assist='auto';
let r=fly('kaan',120); T_('KAAN autoland',r.landed&&Math.abs(r.x)<35&&Math.abs(r.z)<1250,JSON.stringify(r));
r=fly('tb2',260); T_('TB2 autoland',r.landed&&Math.abs(r.x)<35&&Math.abs(r.z)<1250,JSON.stringify(r));
r=fly('hurjet',120); T_('Hürjet autoland',r.landed&&Math.abs(r.x)<35,JSON.stringify(r));
SETTINGS.assist='help'; T_('help: tolerant touchdown',landK()>1); SETTINGS.assist='off'; T_('off: strict',landK()===1); SETTINGS.assist=null;
/* stall guard */
setAircraft('tb2'); S.onGround=false; S.speed=24; T_('UAV stall guard cuts nose-up',stallGuard(1)<0.2,stallGuard(1)); S.speed=45; T_('normal speed: full input',stallGuard(1)===1);
/* take-off is never treated as an approach */
SETTINGS.assist='auto'; playMode('quick'); selectedId='kaan'; setAircraft('kaan'); startGame('air'); resetFlight('runway'); S.throttle=1;
let air=0, minY=1e9; for(let i=0;i<60*40;i++){ TOUCH.pitch=(S.speed>CUR.vr&&S.pos.y-AIRFIELD_Y<120)?0.5:0; lndStep(); pollPad(); update(1/60); if(!S.onGround&&S.gear&&S.pos.y-AIRFIELD_Y>20) S.gear=true; if(!S.onGround){ air++; } if(S.crashed) break; }
TOUCH.pitch=0; T_('take-off with assist: climbs away',!S.crashed&&S.pos.y-AIRFIELD_Y>50,(S.pos.y-AIRFIELD_Y)+' '+S.crashReason); SETTINGS.assist=null;
console.log('pass',ok,'fail',bad);
