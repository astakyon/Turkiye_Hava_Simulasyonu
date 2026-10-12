let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('hangar');
const gy=AIRFIELD_Y;
T_('hall is covered',coveredAt(-278,gy+5,900)==='hall'); T_('service hangar covered',coveredAt(-150,gy+5,1060)==='svc'); T_('runway not covered',!coveredAt(0,gy+5,0)); T_('above roof not covered',!coveredAt(-278,gy+30,900));
/* rain inside the hangar is masked (line pairs: x,y,z,x2,y2,z2) */
const P=new Float32Array([-278,gy+5,900,-278,gy+7,900,  -278,gy+5,820,-278,gy+7,820,  -150,gy+3,1060,-150,gy+5,1060,  -278,gy+30,900,-278,gy+32,900]);
const hid=coverMask(P,6); T_('streaks under the roofs hidden',hid===2&&P[1]<-9e4&&P[13]<-9e4,hid); T_('streaks outside / above kept',P[7]>0&&P[19]>0);
const Q=new Float32Array([-278,gy+5,900, 0,gy+5,0]); coverMask(Q,3); T_('snow flake inside hidden, outside kept',Q[1]<-9e4&&Q[4]>0);
/* night: lamp light indoors */
SETTINGS.tod='night'; wxSet('clear'); WX.cur=Object.assign({},WX_P.clear); TOD.last=-1; todApply(todHour()); const outI=HEMI.intensity;
camera.position.set(-278,gy+3,900); for(let i=0;i<120;i++) indoorStep(0.05);
T_('hangar lamps on at night',INL.on>0.9,INL.on);
camera.position.set(0,gy+300,0); for(let i=0;i<200;i++) indoorStep(0.05); T_('lamps off far away',INL.on===0,INL.on);
SETTINGS.tod='day'; TOD.last=-1; todApply(todHour()); const dayI=HEMI.intensity; camera.position.set(-278,gy+3,900); for(let i=0;i<120;i++) indoorStep(0.05); T_('daytime: lamps off',INL.on<0.05,INL.on);
console.log('pass',ok,'fail',bad);
