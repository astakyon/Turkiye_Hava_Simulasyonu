let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* weather must not throw while flying (V1.82 freeze fix) */
selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); S.speed=150;
let err=null; ['rain','snow','storm'].forEach(function(k){ wxSet(k); try{ for(let i=0;i<50;i++) wxStep(0.05); }catch(e){ err=e.message; } }); wxSet('clear'); for(let i=0;i<200;i++) wxStep(0.1);
T('rain / snow in flight do not throw',!err,err);
/* menu levels */
enterTitle(); T('root: start + net',/data-act="start"/.test($('cNav').innerHTML)&&/data-act="net"/.test($('cNav').innerHTML)&&!/data-act="settings"/.test($('cNav').innerHTML));
titleAct('start'); T('start: quick play + career',/q_free/.test($('cNav').innerHTML)&&/careerMenu/.test($('cNav').innerHTML));
titleAct('careerMenu'); T('career: missions, school, walk, hangar',['c_missions','c_school','c_walk','c_hangar'].every(function(a){ return $('cNav').innerHTML.indexOf(a)>=0; }));
titleAct('back'); T('back to start',NAV.level==='start'); titleAct('back'); T('back to root',NAV.level==='root');
T('no library buttons in the menu',!/data-act="library"|data-act="sounds"|data-act="career"/.test($('cNav').innerHTML));
/* quick play: no XP, no locks */
const p=accProfile(); p.rank=0; p.xp=0;
playMode('quick'); careerAdd(500,{landings:3}); T('quick play earns nothing',(p.xp||0)===0);
T('quick play: nothing locked',!rankLocked('kaan')&&!lockedAt(11));
/* career: XP and locks */
playMode('career'); careerAdd(50,null); T('career earns XP',(p.xp||0)>=50); SETTINGS.rankLocks=true;
T('career: aircraft locked by rank',rankLocked('kaan')); T('career: paint locked',lockedAt(5));
const dog=boardAll().find(function(e){ return e.id==='dogfight'; }); T('career: missions locked by rank',misLocked(dog)); T('free flight open',!misLocked(boardAll().find(function(e){ return e.id==='free'; })));
playMode('quick'); T('quick: missions not locked',!misLocked(dog)); playMode('career'); delete SETTINGS.rankLocks;
console.log('pass',ok,'fail',bad);
