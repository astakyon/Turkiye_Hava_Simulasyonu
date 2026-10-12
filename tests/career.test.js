let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('16 ranks',RANKS.length===16&&RANKS[15][0]==='Orgeneral'&&rankOf(0)===0&&rankOf(4000)===8&&rankOf(1e6)===15);
T('insignia svg',/<svg/.test(rankSVG(0))&&/<svg/.test(rankSVG(8))&&/<svg/.test(rankSVG(15)));
const p=accProfile(); p.xp=0; p.rank=0; p.stats={};
startGame('runway'); aiClear(); careerStep(0.016); T('session started',!!CAR.sess);
S.onGround=false; S.speed=120; careerStep(0.016); T('takeoff counted',p.stats.takeoffs===1&&p.xp===5,JSON.stringify(p.stats)+' '+p.xp);
for(let i=0;i<70;i++) careerStep(1); T('flight time XP',p.xp>=15&&p.stats.flightSec>=60,p.xp);
score+=400; careerStep(0.016); T('score to XP',p.xp>=115,p.xp); T('promoted',p.rank>=1&&CAR.ceremony.length>=1,p.rank);
S.onGround=true; careerStep(0.016); T('landing counted',p.stats.landings===1);
T('medals',(p.stats.medals||[]).indexOf('first')>=0&&(p.stats.medals||[]).indexOf('land1')>=0);
enterTitle(); careerStep(0.016); T('flight logged',(p.stats.log||[]).length===1,JSON.stringify(p.stats.log));
/* rank locks for players (cloud on, not admin) */
ACC.cfg={url:'x',key:'y'}; ACC.role='player'; p.rank=0; T('kaan locked for a new player',rankLocked('kaan')); T('hurjet free of rank locks',!_licRank('hurjet')); T('hurjet needs the jet licence in career',rankLocked('hurjet'));
ACC.role='admin'; playMode('quick'); T('quick play flies everything',!rankLocked('kaan')); playMode('career'); ACC.cfg=null; ACC.role='player';
careerRender(); T('career page',/Uçuş süresi/.test($('carStats').innerHTML)&&/Pilot kanadı/.test($('carMedals').innerHTML));
console.log('pass',ok,'fail',bad);
