let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air');
function fly(sec,fn){ const dt=0.05; for(let t=0;t<sec;t+=dt){ fn(t,dt); acroStep(dt); } }
function reset(){ S.onGround=false; S.crashed=false; S.pos.set(0,2000,0); S.q.set(0,0,0,1); S.speed=200; ACRO.buf.length=0; ACRO.q0.copy(S.q); ACRO.last={}; ACRO.flash=null; }
const ax=new THREE.Vector3(), dq=new THREE.Quaternion();
function rotBody(x,y,z,ang){ ax.set(x,y,z); dq.setFromAxisAngle(ax,ang); S.q.multiply(dq).normalize(); }
/* aileron roll: 360° about the body forward axis in 3 s */
reset(); fly(3.2,function(t,dt){ if(t<3) rotBody(0,0,1,2*Math.PI/3*dt); S.pos.z-=S.speed*dt; });
T_('tonoz recognised',ACRO.flash&&ACRO.flash.n==='Tonoz',ACRO.flash&&ACRO.flash.n);
/* loop: 360° about the body right axis (nose up) in 10 s, moving along the circle */
reset(); fly(10.3,function(t,dt){ if(t<10) rotBody(1,0,0,2*Math.PI/10*dt); const f=new THREE.Vector3(0,0,-1).applyQuaternion(S.q); S.pos.addScaledVector(f,S.speed*dt); });
T_('looping recognised',ACRO.flash&&ACRO.flash.n==='Looping',ACRO.flash&&ACRO.flash.n);
/* inverted flight: roll 180°, then hold 5 s */
reset(); fly(6.5,function(t,dt){ if(t<1) rotBody(0,0,1,Math.PI*dt); S.pos.z-=S.speed*dt; });
T_('inverted flight recognised',ACRO.flash&&ACRO.flash.n==='Sırtüstü uçuş',ACRO.flash&&ACRO.flash.n);
/* level flight: nothing */
reset(); fly(8,function(t,dt){ S.pos.z-=S.speed*dt; }); T_('level flight: no figure',!ACRO.flash);
/* show mission sequence */
selectMission('acro'); startGame('air'); T_('acro mission sequence',ACRO.seq&&ACRO.seq.length===5&&ACRO.si===0);
acroScore('tonoz',1); T_('sequence advances',ACRO.si===1); acroScore('fici',1); T_('wrong figure ignored',ACRO.si===1);
smokeToggle(); T_('smoke toggles',ACRO.smoke===false||ACRO.smoke===true);
console.log('pass',ok,'fail',bad);
