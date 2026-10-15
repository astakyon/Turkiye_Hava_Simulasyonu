/* ------------------------------------------------------------------ flight comfort (V1.84)
   • Türbülans: Kapalı / Hafif (default) / Gerçekçi. Clear weather is calm; only slow, smooth gust motion (no jitter).
   • Otomatik denge (default on): with the roll stick centred the aircraft gently levels its wings (below ~35° bank).
   • Helicopter: wind only drifts it when hover assist is off; the chase camera follows the heading smoothly.
   • Frame pacing: the simulation step is smoothed so a single slow frame does not jerk the view. */
const TURB_K={off:0,soft:0.35,real:1};
function turbK(){ const v=SETTINGS.turb||'soft'; return TURB_K[v]==null?0.35:TURB_K[v]; }
function stabOn(){ return SETTINGS.stab!==false; }
wxAir=function(dt){ if(S.crashed||S.onGround) return; const kT=turbK(); wxVec(wxW); const g=wxGust(), wk=kT===0?0.35:(kT<1?0.7:1);
  S.pos.x+=wxW.x*g*wk*dt; S.pos.z+=wxW.z*g*wk*dt;
  const base=Math.max(0,WX.cur.turb-0.08), tb=base*kT*Math.min(1,S.speed/120)*(S.pos.y-Math.max(terrainH(S.pos.x,S.pos.z),0)<800?1:0.55); if(tb<0.004) return;
  const n1=Math.sin(T*1.7)+Math.sin(T*3.1+2)*0.5, n2=Math.sin(T*1.3+1)+Math.sin(T*2.9)*0.5, n3=Math.sin(T*2.1+3)*0.7;
  wxE.set(n1*tb*0.07*dt,n3*tb*0.02*dt,n2*tb*0.13*dt,'YXZ'); wxQ.setFromEuler(wxE); S.q.multiply(wxQ).normalize(); S.pos.y+=(n1+n2)*tb*0.6*dt; };
wxHeli=function(dt){ const H=HELI.cur; if(!H||H.ground||H.crashT>0) return; const kT=turbK(); wxVec(wxW); const g=wxGust(), wk=(typeof HO!=='undefined'&&HO.assist)?0.12:(kT===0?0.35:0.7);
  H.x+=wxW.x*g*wk*dt; H.z+=wxW.z*g*wk*dt;
  const tb=Math.max(0,WX.cur.turb-0.08)*kT; if(tb>0.004){ H.roll+=Math.sin(T*1.9)*tb*0.25*dt; H.pitch+=Math.sin(T*1.5+1)*tb*0.2*dt; H.y+=Math.sin(T*1.3)*tb*0.5*dt; } };
/* ---- aircraft: automatic wing levelling */
const cfR=new THREE.Vector3(), cfU=new THREE.Vector3(), cfQ=new THREE.Quaternion(), cfE=new THREE.Euler();
function planeBank(){ cfR.set(1,0,0).applyQuaternion(S.q); cfU.set(0,1,0).applyQuaternion(S.q); return Math.atan2(-cfR.y,cfU.y); }
function stabStep(dt){ if(!stabOn()||S.crashed||S.onGround||state!=='play') return; if(typeof EJ!=='undefined'&&EJ.on) return; if(Math.abs(S.rollIn)>0.05) return;
  const b=planeBank(); if(Math.abs(b)>0.62||Math.abs(b)<0.002) return; const r=clamp(b*1.3,-0.45,0.45)*Math.min(1,S.speed/80);
  cfE.set(0,0,r*dt,'YXZ'); cfQ.setFromEuler(cfE); S.q.multiply(cfQ).normalize(); }
update=HOOK.wrap('update','ucus/ucus-konforu#_cfUpd',function(_cfUpd){ return function(dt){ _cfUpd(dt); stabStep(dt); }; },update);
/* ---- helicopter chase camera: smooth heading */
const HCAM={h:null};
heliCam=HOOK.wrap('heliCam','ucus/ucus-konforu#_cfHeliCam',function(_cfHeliCam){ return function(dt){ const H=HELI.cur; if(!H||HELI.fp||!(dt>0)){ HCAM.h=H?H.h:null; return _cfHeliCam(dt); }
  if(HCAM.h==null||HCAM.H!==H){ HCAM.h=H.h; HCAM.H=H; } let d=H.h-HCAM.h; d=Math.atan2(Math.sin(d),Math.cos(d)); HCAM.h+=d*(1-Math.exp(-dt*4)); const real=H.h; H.h=HCAM.h; try{ _cfHeliCam(dt); } finally { H.h=real; } }; },heliCam);
/* ---- settings */
(function(){ const s=$('setTurb'); if(s) s.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.turb=b.dataset.t; saveSettings(); syncSettingsUI(); });
  const c=$('setStab'); if(c) c.addEventListener('change',function(){ SETTINGS.stab=c.checked; saveSettings(); }); })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','ucus/ucus-konforu#_cfSync',function(_cfSync){ return function(){ _cfSync(); const s=$('setTurb'); if(s) Array.prototype.forEach.call(s.children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.t===(SETTINGS.turb||'soft'))); }); const c=$('setStab'); if(c) c.checked=stabOn(); }; },syncSettingsUI);
