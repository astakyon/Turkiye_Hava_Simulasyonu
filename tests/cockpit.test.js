let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); S.speed=200;
camMode=0; T_('chase: no interior',ckpKind()===null);
camMode=1; T_('KAAN cockpit',ckpKind()==='kaan');
let err=null; try{ for(let i=0;i<60;i++){ T+=1/30; update(1/30); cameraUpdate(1/30); ckpMFD(); } }catch(e){ err=e.stack; } T_('cockpit runs with displays',!err,err);
T_('KAAN has one wide display',CKP.cur.scr.length===1);
renderFrame(0); T_('interior flag resets each frame',CKP.on===false);
keys['KeyW']=true; for(let i=0;i<20;i++){ T+=1/30; update(1/30); cameraUpdate(1/30); } keys['KeyW']=false; T_('stick follows input',Math.abs(CKP.cur.stick.rotation.x)>0.05,CKP.cur.stick.rotation.x);
selectedId='hurjet'; setAircraft('hurjet'); startGame('air'); camMode=1; T_('HÜRJET cockpit',ckpKind()==='jet'); cameraUpdate(1/30); T_('three MFDs',CKP.cur.scr.length===3);
selectedId='tb2'; setAircraft('tb2'); startGame('air'); camMode=1; T_('UAV: camera view, no interior',ckpKind()===null);
camMode=0; startWalk(); const H=HELI.list.find(function(h){ return h.id==='t129'; }); heliBoard(H); HELI.fp=true; T_('T129 front seat',ckpKind()==='t129');
err=null; try{ walkCam(1/30); ckpMFD(); }catch(e){ err=e.stack; } T_('heli cockpit runs',!err,err);
HELI.fp=false; T_('heli chase: none',ckpKind()===null);
console.log('pass',ok,'fail',bad);
