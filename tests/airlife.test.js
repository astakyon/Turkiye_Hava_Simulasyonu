let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
SETTINGS.life=true; state='walk'; airLifeStep(0.05); T('built',AL.built&&AL.ai.length===3&&AL.crew.length>=7&&AL.walkers.length>20,AL.ai.length+' '+AL.crew.length+' '+AL.walkers.length);
const a=AL.ai[0]; a.t=0; const seen={}; let minY=1e9, maxY=-1e9;
for(let i=0;i<60*400&&!(seen.rollout&&a.st==='park');i++){ airLifeStep(0.05); seen[a.st]=1; if(a.st==='circuit'){ minY=Math.min(minY,a.y); maxY=Math.max(maxY,a.y); } }
['spin','pull','join','taxiOut','line','roll','climb','circuit','final','rollout','uturn','back','exit','in','park'].forEach(function(s){ T('reaches '+s,!!seen[s]); });
T('circuit altitude sane',minY>AIRFIELD_Y+150&&maxY<AIRFIELD_Y+800,minY+' '+maxY);
T('parked back at its spot',Math.hypot(a.x-AL_SPOTS[0][0],a.z-AL_SPOTS[0][1])<3,a.x+','+a.z+' '+a.st);
/* holds short while the runway is busy */
AL.ai.forEach(function(o,k){ o.st='park'; o.t=999; o.x=AL_SPOTS[k][0]; o.z=AL_SPOTS[k][1]; o.y=o.gy; o.v=0; }); const b=AL.ai[1]; b.st='taxiOut'; b.i=alHold()-6; const hp=TAXI.pts[b.i]; b.x=hp.x; b.z=hp.z; b.cleared=false; b.v=5;
state='play'; S.crashed=false; S.onGround=true; S.taxi=false; S.clearance=true; S.pos.set(0,AIRFIELD_Y+2,500);
for(let i=0;i<400;i++) airLifeStep(0.05); T('holds short when player is on the runway',b.st==='taxiOut'&&b.v<0.5,b.st+' '+b.v);
S.pos.set(-3000,AIRFIELD_Y+2,-3000); for(let i=0;i<900;i++) airLifeStep(0.05); T('goes when runway clears',b.st==='line'||b.st==='roll'||b.st==='climb',b.st);
state='walk';
/* walkers move */
const w=AL.walkers[0], s0=w.s; airLifeStep(1); T('pedestrians walk',w.s!==s0);
/* marshaller waves when something taxis */
const c=AL.ai[2]; c.st='join'; c.x=-440; c.z=830; airLifeStep(0.1); T('marshaller waves',Math.abs(AL.mar.armL.rotation.z)>1);
SETTINGS.life=false; airLifeStep(0.05); T('turns off',!AL.built&&AL.ai.length===0); SETTINGS.life=true;
console.log('pass',ok,'fail',bad);
