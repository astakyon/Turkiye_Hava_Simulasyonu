/* ------------------------------------------------------------------ touch controls (phone / tablet) */
const TOUCH={pitch:0,roll:0,yaw:0,yawL:false,yawR:false,fire:false,ab:false,brake:false,sx:0,sy:0,seen:false,vis:false,arm:'gun'};
let WBOX=[], WPANEL=null, TLAY={L:0,R:0,ok:false};
let hudScoreBottom=150;
function touchWanted(){
  if(SETTINGS.touch==='on') return true; if(SETTINGS.touch==='off') return false;
  return TOUCH.seen || !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
}
window.addEventListener('pointerdown',function(e){ if(e.pointerType==='touch') TOUCH.seen=true; },true);
(function(){
  const stick=$('tStick'); let sid=null;
  function sMove(e){ const r=stick.getBoundingClientRect(), R=r.width/2*0.85; let dx=(e.clientX-(r.left+r.width/2))/R, dy=(e.clientY-(r.top+r.height/2))/R; const l=Math.hypot(dx,dy); if(l>1){ dx/=l; dy/=l; } TOUCH.sx=dx; TOUCH.sy=dy; TOUCH.roll=padCurve(dx,0.06); TOUCH.pitch=padCurve(dy,0.06); }
  function sEnd(e){ if(e.pointerId!==sid) return; sid=null; TOUCH.sx=TOUCH.sy=TOUCH.roll=TOUCH.pitch=0; }
  stick.addEventListener('pointerdown',function(e){ e.preventDefault(); try{ stick.setPointerCapture(e.pointerId); }catch(err){} sid=e.pointerId; sMove(e); });
  stick.addEventListener('pointermove',function(e){ if(e.pointerId===sid) sMove(e); });
  stick.addEventListener('pointerup',sEnd); stick.addEventListener('pointercancel',sEnd);
  const thr=$('tThr'); let tid=null;
  function tSet(e){ const r=thr.getBoundingClientRect(); const f=(e.clientY-r.top)/r.height, abz=CUR.hasAB?0.18:0; if(CUR.hasAB&&f<abz){ TOUCH.ab=true; if(!S.auto&&state==='play') S.throttle=1; return; } TOUCH.ab=false; const v=clamp(1-(f-abz)/(1-abz),0,1); if(!S.auto&&state==='play') S.throttle=Math.round(v*50)/50; }
  thr.addEventListener('pointerdown',function(e){ e.preventDefault(); try{ thr.setPointerCapture(e.pointerId); }catch(err){} tid=e.pointerId; tSet(e); });
  thr.addEventListener('pointermove',function(e){ if(e.pointerId===tid) tSet(e); });
  const tEnd=function(e){ if(e.pointerId===tid) tid=null; }; thr.addEventListener('pointerup',tEnd); thr.addEventListener('pointercancel',tEnd);
  function hold(id,fn){ const el=$(id);
    el.addEventListener('pointerdown',function(e){ e.preventDefault(); try{ el.setPointerCapture(e.pointerId); }catch(err){} fn(true); el.classList.add('on'); });
    const up=function(){ fn(false); el.classList.remove('on'); }; el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up); }
  function tap(id,fn){ const el=$(id);
    el.addEventListener('pointerdown',function(e){ e.preventDefault(); fn(); el.classList.add('on'); setTimeout(function(){ el.classList.remove('on'); },130); }); }
  hold('tFire',function(v){ if(TOUCH.arm==='gun'||!WEAPONS[TOUCH.arm]) TOUCH.fire=v; else { TOUCH.fire=false; if(v){ if(selW!==TOUCH.arm&&INV[TOUCH.arm]>0) selW=TOUCH.arm; fireWeapon(); } } });
  hold('tBrake',function(v){ TOUCH.brake=v; });
  const wp=$('tWpn');
  wp.addEventListener('pointerdown',function(e){ e.preventDefault(); const x=e.clientX, y=e.clientY;
    const b=WBOX.find(function(r){ return x>=r.x-4&&x<=r.x+r.w+4&&y>=r.y-6&&y<=r.y+r.h+6; }); if(!b) return;
    if(b.k==='gun'){ TOUCH.arm='gun'; toast('Seçili: '+(CUR.weapon==='TOP'?'Top':'Mühimmat'),'#ffb25a'); }
    else if(INV[b.k]>0){ selectWeapon(b.k); TOUCH.arm=b.k; } });
  hold('tYawL',function(v){ TOUCH.yawL=v; TOUCH.yaw=(TOUCH.yawR?1:0)-(TOUCH.yawL?1:0); });
  hold('tYawR',function(v){ TOUCH.yawR=v; TOUCH.yaw=(TOUCH.yawR?1:0)-(TOUCH.yawL?1:0); });
  tap('tFlare',function(){ dropFlares(); }); tap('tGear',function(){ toggleGear(); }); tap('tCam',function(){ toggleCam(); });
  tap('tPause',function(){ pauseGame(); }); tap('tAuto',function(){ toggleAutoTaxi(); }); tap('tSkip',function(){ skipTaxi(); });
  ['touch'].forEach(function(id){ $(id).addEventListener('contextmenu',function(e){ e.preventDefault(); }); });
})();
function updateTouchUI(){
  const vis=touchWanted() && state==='play' && !S.crashed;
  if(vis!==TOUCH.vis){ TOUCH.vis=vis; document.body.classList.toggle('touch-on',vis); $('touch').classList.toggle('hidden',!vis); }
  $('rotate').classList.toggle('hidden',!(touchWanted() && state==='play' && window.innerHeight>window.innerWidth));
  if(!vis){ WPANEL=null; if(TOUCH.pitch||TOUCH.roll||TOUCH.yaw||TOUCH.fire||TOUCH.ab||TOUCH.brake){ TOUCH.pitch=TOUCH.roll=TOUCH.yaw=TOUCH.sx=TOUCH.sy=0; TOUCH.yawL=TOUCH.yawR=TOUCH.fire=TOUCH.ab=TOUCH.brake=false; } return; }
  $('tKnob').style.transform='translate('+(TOUCH.sx*60)+'%,'+(TOUCH.sy*60)+'%)';
  const th=S.ab?1:S.throttle; $('tThrFill').style.height=Math.round(th*100)+'%'; $('tThr').classList.toggle('ab',!!S.ab);
  $('tThrLbl').innerHTML='GAZ<br>'+Math.round(S.throttle*100)+'%';
  const taxiing=S.onGround&&S.taxi&&!S.clearance;
  $('tAuto').classList.toggle('hidden',!taxiing); $('tSkip').classList.toggle('hidden',!taxiing);
  $('tAuto').textContent=S.auto?'OTO TAKSİ: AÇIK':'OTO TAKSİ';
  $('tThr').classList.toggle('noab',!CUR.hasAB); if(!CUR.hasAB) TOUCH.ab=false;
  if(TOUCH.arm!=='gun'&&!(INV[TOUCH.arm]>0)) TOUCH.arm=(INV[selW]>0&&TOUCH.arm!==selW)?selW:'gun';
  else if(TOUCH.arm!=='gun'&&TOUCH.arm!==selW&&INV[selW]>0) TOUCH.arm=selW;
  const armLbl=TOUCH.arm==='gun'?(CUR.weapon==='TOP'?'TOP':'MÜHİMMAT'):(WEAPONS[TOUCH.arm].short+' · '+INV[TOUCH.arm]);
  if($('tFire').dataset.l!==armLbl){ $('tFire').dataset.l=armLbl; $('tFire').innerHTML='ATEŞ<small>'+armLbl+'</small>'; $('tFire').classList.toggle('wpn',TOUCH.arm!=='gun'); }
  $('tFlare').innerHTML='FLARE<br>'+flaresLeft; $('tFlare').classList.toggle('off',flaresLeft<=0);
  const air=!S.onGround; $('tGear').classList.toggle('hidden',!air); $('tBrake').classList.toggle('hidden',air);
  $('tGear').textContent=S.gear?'TAKIM ▲':'TAKIM ▼';
  const sr=$('tStick').getBoundingClientRect(), rr=$('tRight').getBoundingClientRect(); TLAY.L=sr.right+10; TLAY.R=rr.left-10; TLAY.ok=TLAY.R>TLAY.L;
  const wpn=$('tWpn'); if(WPANEL){ wpn.style.left=WPANEL.x+'px'; wpn.style.top=(WPANEL.y-8)+'px'; wpn.style.width=WPANEL.w+'px'; wpn.style.height=(WPANEL.h+12)+'px'; wpn.style.display=''; } else wpn.style.display='none';
}

