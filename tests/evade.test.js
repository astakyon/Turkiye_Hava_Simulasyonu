let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('SAM sites on land',EV_SAMS.every(function(p){ return terrainH(p[0],p[1])>5; }),EV_SAMS.map(function(p){ return Math.round(terrainH(p[0],p[1])); }).join(','));
T_('start outside safe zone',Math.hypot(EV_START[0],EV_START[1])>SAFE_R+500);
playMode('quick'); selectedId='kaan'; setAircraft('kaan'); selectMission('kacis'); SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air');
T_('mission set up',M.id==='kacis'&&gtargets.filter(function(o){ return o.type==='sam'&&o.alive; }).length===2);
/* a missile fired from behind and the player breaks hard: seeker loses lock */
S.onGround=false; S.crashed=false; S.pos.set(6000,1500,-8000); S.q.set(0,0,0,1); S.speed=220;
const o=gtargets.find(function(o){ return o.type==='sam'; }); launchSam(o); const m=missiles.find(function(x){ return x.on&&x.src===o; });
T_('missile launched',!!m&&m.age===0);
m.p.set(S.pos.x,S.pos.y,S.pos.z+2500); m.v.set(0,0,-400); m.speed=400; m.age=2;
/* player flies 90° across the line of sight: put velocity along +x */
S.q.setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.PI/2); let lost=false; const e0=EV.evaded;
for(let i=0;i<120&&m.on&&!m.lost;i++){ S.pos.x+=220*0.05; evPhysics(0.05); m.p.addScaledVector(m.v,0.05); }
T_('beam / gimbal makes the missile lose you',m.lost&&EV.evaded>e0,m.lost+' '+EV.evaded);
/* energy: after burn-out a slow missile is spent */
launchSam(o); const m2=missiles.find(function(x){ return x.on&&x.src===o&&!x.lost; }); m2.age=6; m2.speed=210; m2.p.set(S.pos.x,S.pos.y,S.pos.z+3000); evPhysics(0.5); T_('spent missile',m2.lost);
/* advice text */
const adv=evAdvice({p:new THREE.Vector3(S.pos.x+500,S.pos.y,S.pos.z),src:o}); T_('advice',/KIR/.test(adv),adv);
/* mission completes after three */
EV.evaded=3; updateMission(0.1); T_('mission won',M.done);
console.log('pass',ok,'fail',bad);
