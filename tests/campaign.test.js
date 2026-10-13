let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); const p=accProfile(); if(p.stats) delete p.stats.camp;
T_('8 chapters',CAMP_CH.length===8);
T_('first open, second locked',campOpenIx(0)&&!campOpenIx(1));
CAMP_CH.forEach(function(c){ try{ const o=c.D?c.D():c.M?c.M():null; T_('chapter builds '+c.id,c.mis||(o&&o.obj&&o.obj.length>0)); }catch(e){ T_('chapter builds '+c.id,false,e.message); } });
/* air chapter: start and win */
campStart(0); T_('chapter 1 runs on dyn engine',CAMP.run===CAMP_CH[0]&&DYN.cur&&DYN.cur.id==='camp_k1'&&missionId==='dyn');
T_('UAV chosen',['tb2','aksungur','anka','tb3','akinci','anka3'].indexOf(selectedId)>=0,selectedId);
startGame('air'); setupMission(); M.started=true; endMission(true); T_('stars saved',campStars('k1')>=1,campStars('k1'));
T_('chapter 2 unlocked',campOpenIx(1));
/* heli chapter */
for(let i=1;i<3;i++) campSave(CAMP_CH[i].id,2);
campStart(3); T_('heli chapter runs',HM.on&&HM.M&&HM.M.id==='k4',HM.M&&HM.M.id);
hmEnd(true); T_('heli chapter saved',campStars('k4')>=2);
/* finale uses strike */
for(let i=4;i<7;i++) campSave(CAMP_CH[i].id,1); hmQuit&&hmQuit();
campStart(7); T_('finale is strike',missionId==='strike'&&CAMP.run===CAMP_CH[7]);
startGame('air'); setupMission(); endMission(true); T_('campaign complete',campDoneN()===8);
T_('medal',(accProfile().stats.medals||[]).indexOf('kizilelma')>=0);
/* another mission clears the run */
misGo(); T_('run cleared',CAMP.run===null);
console.log('pass',ok,'fail',bad);
