let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); S.speed=160; S.throttle=0.7;
T_('buffer cleared on start',RP.buf.length===0);
const dt=1/30; const p0=S.pos.clone(); for(let i=0;i<30*20;i++){ T+=dt; update(dt); keys['KeyD']=(i>200&&i<260); }
keys['KeyD']=false;
T_('recorded ~200 samples at 10 Hz',RP.buf.length>=190&&RP.buf.length<=205,RP.buf.length);
T_('duration ~20 s',Math.abs(rpDur()-20)<0.5,rpDur());
const endPos=S.pos.clone(), endQ=S.q.clone();
pauseGame(); T_('can open from pause',rpCan());
rpOpen(); T_('replay state',state==='replay'&&RP.on);
T_('starts at the first sample',S.pos.distanceTo(p0)<30,S.pos.distanceTo(p0));
RP.t=10; rpApply(10); const mid=S.pos.clone(); T_('mid position between start and end',mid.distanceTo(p0)>500&&mid.distanceTo(endPos)>500);
rpApply(10.05); T_('interpolates smoothly',S.pos.distanceTo(mid)<20,S.pos.distanceTo(mid));
RP.play=true; RP.speed=2; RP.t=0; for(let i=0;i<30;i++) rpStep(1/30); T_('2x speed advances 2 s per second',Math.abs(RP.t-2)<0.05,RP.t);
RP.t=rpDur()-0.1; RP.speed=1; for(let i=0;i<10;i++) rpStep(1/30); T_('stops at the end',RP.play===false&&Math.abs(RP.t-rpDur())<1e-6);
rpToggle(); T_('play from end restarts',RP.play&&RP.t===0);
['chase','cockpit','cine','orbit'].forEach(function(c){ rpSetCam(c); let err=null; try{ for(let i=0;i<200;i++){ RP.t=i*0.1; rpApply(RP.t); rpCam(1/30); } }catch(e){ err=e.message; } T_('camera '+c+' runs',!err,err); });
rpSeek(-100); T_('seek clamps at 0',RP.t===0);
rpClose(); T_('back to paused',state==='paused'&&!RP.on);
T_('aircraft restored exactly',S.pos.distanceTo(endPos)<1e-6&&Math.abs(S.q.x*endQ.x+S.q.y*endQ.y+S.q.z*endQ.z+S.q.w*endQ.w)>0.99999);
resumeGame(); T_('flight continues',state==='play'); const before=RP.buf.length; for(let i=0;i<30;i++){ T+=dt; update(dt); } T_('recording continues',RP.buf.length>=Math.min(before+2,RP.max));
/* ring buffer cap */
for(let i=0;i<RP.max+50;i++) RP.buf.push(rpSample()); for(let i=0;i<5;i++){ T+=0.11; rpRecord(0.11); } T_('buffer capped',RP.buf.length<=RP.max,RP.buf.length);
console.log('pass',ok,'fail',bad);
