let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick');
function att(){ const f=new THREE.Vector3(0,0,-1).applyQuaternion(S.q), r=new THREE.Vector3(1,0,0).applyQuaternion(S.q), u=new THREE.Vector3(0,1,0).applyQuaternion(S.q); return [Math.atan2(-r.y,u.y),Math.asin(Math.max(-1,Math.min(1,f.y)))]; }
function fly(w,turb,sec,bank){ SETTINGS.turb=turb; selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); wxSet(w); WX.cur=Object.assign({},WX_P[w]); S.speed=180; S.throttle=0.7;
  if(bank) S.q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-bank));
  const a0=att(); let mx=[-9,-9], mn=[9,9]; const dt=1/60; for(let i=0;i<60*sec;i++){ T+=dt; update(dt); const a=att(); for(let k=0;k<2;k++){ mx[k]=Math.max(mx[k],a[k]); mn[k]=Math.min(mn[k],a[k]); } } return {pp:(mx[0]-mn[0])*57.3, pitch:(mx[1]-mn[1])*57.3, bank0:a0[0]*57.3, bank:att()[0]*57.3}; }
T_('clear weather is calm',fly('clear','soft',10).pp<0.3);
const sS=fly('storm','soft',20), sR=fly('storm','real',20), sO=fly('storm','off',20);
console.log('  storm bank p-p soft/real/off', sS.pp.toFixed(2), sR.pp.toFixed(2), sO.pp.toFixed(2));
T_('soft storm under 2°',sS.pp<2,sS.pp); T_('real stronger than soft',sR.pp>sS.pp); T_('off: no wobble',sO.pp<0.3,sO.pp);
const lv=fly('clear','soft',8,0.4); T_('auto level from 23° bank',Math.abs(lv.bank)<3,lv.bank0.toFixed(1)+' -> '+lv.bank.toFixed(1));
const lvn=fly('clear','soft',8,-0.4); T_('auto level left too',Math.abs(lvn.bank)<3,lvn.bank.toFixed(1));
SETTINGS.stab=false; const nl=fly('clear','soft',4,0.4); T_('no levelling when off',Math.abs(nl.bank)>20,nl.bank); delete SETTINGS.stab;
const steep=fly('clear','soft',4,1.2); T_('steep bank left alone',Math.abs(steep.bank)>60,steep.bank);
/* helicopter hover in wind with hover assist: barely drifts */
startWalk(); const H=HELI.list[0]; heliBoard(H); H.rpm=1; H.ground=false; H.y+=40; H.vx=H.vz=0; wxSet('storm'); WX.cur=Object.assign({},WX_P.storm); SETTINGS.turb='soft'; HO.assist=true;
const x0=H.x, z0=H.z; for(let i=0;i<60*10;i++){ T+=1/60; heliStep(1/60); }
const drift=Math.hypot(H.x-x0,H.z-z0); T_('heli hover assist holds in storm (<25 m / 10 s)',drift<25,drift.toFixed(1));
T_('heli stays level',Math.abs(H.roll)<0.05&&Math.abs(H.pitch)<0.05,H.roll+' '+H.pitch);
wxSet('clear');
console.log('pass',ok,'fail',bad);
