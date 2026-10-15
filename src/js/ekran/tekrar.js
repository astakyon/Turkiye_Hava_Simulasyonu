/* ------------------------------------------------------------------ replay (V1.87)
   • The last 5 minutes of every flight are recorded at 10 Hz: the player aircraft (position, attitude, speed, throttle,
     gear, afterburner, gun fire, crash) and up to 12 other aircraft.
   • Tekrar izle (pause menu, mission end screen, F3): timeline with scrubbing, play / pause, 0.25×–4× speed,
     cameras: Takip, Kokpit, Sinematik (automatic shots: side, fly-by, tower, high), Serbest (drag / wheel to orbit).
   • Fotoğraf (PNG) and video recording (WebM from the game canvas) while watching.
   • Leaving the replay puts everything back exactly as it was (paused game or mission end screen). */
const RP={oh:0, buf:[], max:3000, acc:0, on:false, t:0, play:true, speed:1, cam:'chase', snap:null, cq:new THREE.Quaternion(), shot:-1, shotT:0, fix:new THREE.Vector3(), rec:null, chunks:[], hud:true};
const RP_DT=0.1;
function rpR3(v){ return Math.round(v*100)/100; } function rpR4(v){ return Math.round(v*1e4)/1e4; }
function rpSample(){ const f=(S.gear?1:0)|(S.ab?2:0)|(S.crashed?4:0)|((T-lastFireT)<0.15?8:0), r3=rpR3, r4=rpR4;
  const acts=[]; for(let i=0;i<ACT.length&&acts.length<12;i++){ const a=ACT[i]; if(!a||!a.pos||!a.q) continue; acts.push([a.id,r3(a.pos.x),r3(a.pos.y),r3(a.pos.z),r4(a.q.x),r4(a.q.y),r4(a.q.z),r4(a.q.w),a.alive?1:0]); }
  return [T, r3(S.pos.x),r3(S.pos.y),r3(S.pos.z), r4(S.q.x),r4(S.q.y),r4(S.q.z),r4(S.q.w), Math.round(S.speed*10)/10, Math.round((S.throttle||0)*100)/100, f, acts]; }
function rpRecord(dt){ if(state!=='play'||RP.on) return; RP.acc+=dt; if(RP.acc<RP_DT) return; RP.acc=0; RP.buf.push(rpSample()); if(RP.buf.length>RP.max) RP.buf.splice(0,RP.buf.length-RP.max); }
update=HOOK.wrap('update','ekran/tekrar#_rpUpd',function(_rpUpd){ return function(dt){ _rpUpd(dt); rpRecord(dt); }; },update);
startGame=HOOK.wrap('startGame','ekran/tekrar#_rpStart',function(_rpStart){ return function(mode){ RP.buf=[]; RP.acc=0; return _rpStart(mode); }; },startGame);
function rpCan(){ return RP.buf.length>=20&&!(NET.on&&NET.started)&&(state==='paused'||state==='mend'||state==='play')&&!(WALK.from==='walk'&&state==='paused'); }
function rpDur(){ const b=RP.buf; return b.length>1?b[b.length-1][0]-b[0][0]:0; }
/* ---- interpolate the recording at time t (seconds from the first sample) */
const rpQa=new THREE.Quaternion(), rpQb=new THREE.Quaternion();
function rpAt(t){ const b=RP.buf, t0=b[0][0], tt=t0+clamp(t,0,rpDur()); let lo=0, hi=b.length-1;
  while(hi-lo>1){ const m=(lo+hi)>>1; if(b[m][0]<=tt) lo=m; else hi=m; }
  const A=b[lo], B=b[hi], k=B[0]>A[0]?clamp((tt-A[0])/(B[0]-A[0]),0,1):0; return {A:A,B:B,k:k}; }
function rpApply(t){ const s=rpAt(t), A=s.A, B=s.B, k=s.k, L=function(i){ return A[i]+(B[i]-A[i])*k; };
  S.pos.set(L(1),L(2),L(3)); rpQa.set(A[4],A[5],A[6],A[7]); rpQb.set(B[4],B[5],B[6],B[7]); S.q.copy(rpQa).slerp(rpQb,k);
  S.speed=L(8); S.throttle=L(9); const f=k<0.5?A[10]:B[10]; S.gear=!!(f&1); S.ab=!!(f&2); S.crashed=!!(f&4); RP.fire=!!(f&8);
  const by={}; B[11].forEach(function(r){ by[r[0]]=r; });
  A[11].forEach(function(r){ const a=actById(r[0]); if(!a||!a.g) return; const r2=by[r[0]]||r; a.g.position.set(r[1]+(r2[1]-r[1])*k,r[2]+(r2[2]-r[2])*k,r[3]+(r2[3]-r[3])*k);
    rpQa.set(r[4],r[5],r[6],r[7]); rpQb.set(r2[4],r2[5],r2[6],r2[7]); a.g.quaternion.copy(rpQa).slerp(rpQb,k); a.g.visible=!!r[8]; }); }
/* ---- open / close */
function rpOpen(){ if(!rpCan()){ if(RP.buf.length<20) toast('Henüz izlenecek uçuş kaydı yok','#ffc24a'); return; }
  if(state==='play') pauseGame();
  const from=state;
  RP.snap={from:from, pos:S.pos.clone(), q:S.q.clone(), speed:S.speed, thr:S.throttle, gear:S.gear, ab:S.ab, crashed:S.crashed, cam:camMode, camu:[CAMU.yaw,CAMU.pitch,CAMU.zoom],
    acts:ACT.map(function(a){ return a&&a.g?[a,a.g.position.clone(),a.g.quaternion.clone(),a.g.visible]:null; }).filter(Boolean)};
  $('pause').classList.add('hidden'); $('missionEnd').classList.add('hidden');
  RP.on=true; state='replay'; RP.t=0; RP.play=true; RP.speed=1; RP.shot=-1; CAMU.yaw=0; CAMU.pitch=0; CAMU.zoom=1;
  rpApply(0); RP.cq.copy(S.q); $('rpBar').classList.remove('hidden'); rpUI(); try{ $('gl').focus(); }catch(e){} }
function rpClose(){ if(!RP.on) return; if(RP.rec) rpVidStop(); const s=RP.snap; RP.on=false; $('rpBar').classList.add('hidden');
  S.pos.copy(s.pos); S.q.copy(s.q); S.speed=s.speed; S.throttle=s.thr; S.gear=s.gear; S.ab=s.ab; S.crashed=s.crashed; camMode=s.cam; CAMU.yaw=s.camu[0]; CAMU.pitch=s.camu[1]; CAMU.zoom=s.camu[2]; camSnap=true;
  s.acts.forEach(function(e){ e[0].g.position.copy(e[1]); e[0].g.quaternion.copy(e[2]); e[0].g.visible=e[3]; });
  state=s.from; if(s.from==='mend') $('missionEnd').classList.remove('hidden'); else { state='paused'; showScreen('pause'); } }
/* ---- per frame */
function rpStep(dt){ if(!RP.on) return; const D=rpDur();
  if(RP.play){ RP.t+=dt*RP.speed; if(RP.t>=D){ RP.t=D; RP.play=false; rpUI(); } }
  rpApply(RP.t); const sl=$('rpT'); if(sl&&!RP.drag) sl.value=String(Math.round(D>0?RP.t/D*1000:0)); const tl=$('rpTime'); if(tl) tl.textContent=fmtT(RP.t)+' / '+fmtT(D); }
placeModel=HOOK.wrap('placeModel','ekran/tekrar#_rpPlace',function(_rpPlace){ return function(dt){ if(state==='replay') rpStep(dt); return _rpPlace(dt); }; },placeModel);
const rpV=new THREE.Vector3(), rpR=new THREE.Vector3(), rpF=new THREE.Vector3(), rpU=new THREE.Vector3(0,1,0), rpE=new THREE.Euler(), rpQ=new THREE.Quaternion();
const RP_SHOTS=['side','flyby','tower','high','side','chase'];
function rpCam(dt){ const D=(typeof VIEW_D!=='undefined'&&VIEW_D[activeId])||30, P=S.pos; let cam=RP.cam;
  planeGroup.visible=!S.crashed&&cam!=='cockpit';
  if(cam==='cine'){ const n=Math.floor(RP.t/6); if(n!==RP.shot){ RP.shot=n; RP.shotK=RP_SHOTS[n%RP_SHOTS.length]; fwdOf(S.q,rpF); rpR.crossVectors(rpF,rpU).normalize(); if(rpR.lengthSq()<0.01) rpR.set(1,0,0);
      if(RP.shotK==='flyby') RP.fix.copy(P).addScaledVector(rpF,Math.max(D*2,S.speed*3)).addScaledVector(rpR,D*0.7).addScaledVector(rpU,D*0.15);
      if(RP.shotK==='tower'){ RP.fix.copy(P).addScaledVector(rpR,D*5).addScaledVector(rpF,D*3); RP.fix.y=Math.max(terrainH(RP.fix.x,RP.fix.z),0)+2+Math.min(40,Math.max(0,P.y-terrainH(P.x,P.z))*0.1); } }
    cam=RP.shotK==='chase'?'chase':'cine'; }
  if(cam==='cockpit'){ camera.position.copy(rpV.set(CUR.eye[0],CUR.eye[1],CUR.eye[2]).applyQuaternion(S.q).add(P)); camera.quaternion.copy(S.q); }
  else if(cam==='chase'||cam==='orbit'){ RP.cq.slerp(S.q,cam==='orbit'?1:1-Math.exp(-6.5*dt)); rpE.set(CAMU.pitch,CAMU.yaw,0,'YXZ'); rpQ.setFromEuler(rpE);
    if(cam==='orbit'){ const a=RP.oh+CAMU.yaw, p=clamp(0.25-CAMU.pitch,-0.2,1.4), d=D*1.4*CAMU.zoom; camera.position.set(P.x+Math.sin(a)*Math.cos(p)*d,P.y+Math.sin(p)*d,P.z+Math.cos(a)*Math.cos(p)*d); camera.lookAt(P); }
    else { camera.position.copy(rpV.set(0,CUR.cam[0]*CAMU.zoom,CUR.cam[1]*CAMU.zoom).applyQuaternion(rpQ).applyQuaternion(RP.cq).add(P)); camera.quaternion.copy(RP.cq).multiply(rpQ).multiply(tiltQ); } }
  else { fwdOf(S.q,rpF); rpR.crossVectors(rpF,rpU).normalize(); if(rpR.lengthSq()<0.01) rpR.set(1,0,0);
    if(RP.shotK==='side') camera.position.copy(P).addScaledVector(rpR,D*0.9).addScaledVector(rpU,D*0.18).addScaledVector(rpF,-D*0.15);
    else if(RP.shotK==='high') camera.position.copy(P).addScaledVector(rpU,D*2.2).addScaledVector(rpF,-D*1.2);
    else camera.position.copy(RP.fix);
    camera.lookAt(P); }
  const gh=Math.max(terrainH(camera.position.x,camera.position.z),0)+2; if(camera.position.y<gh) camera.position.y=gh;
  const fov=cam==='cockpit'?78:(RP.shotK==='flyby'||RP.shotK==='tower')&&RP.cam==='cine'?40:60; if(Math.abs(fov-lastFov)>0.05){ camera.fov=fov; lastFov=fov; camera.updateProjectionMatrix(); }
  camera.updateMatrixWorld(); }
cameraUpdate=HOOK.wrap('cameraUpdate','ekran/tekrar#_rpCamUpd',function(_rpCamUpd){ return function(dt){ if(state==='replay') return rpCam(dt); return _rpCamUpd(dt); }; },cameraUpdate);
/* HUD: a small replay caption instead of the flight HUD */
drawHUD=HOOK.wrap('drawHUD','ekran/tekrar#_rpHUD',function(_rpHUD){ return function(){ if(state!=='replay') return _rpHUD(); hx.setTransform(DPR,0,0,DPR,0,0); hx.clearRect(0,0,HW,HH); if(!RP.hud||RP.rec&&RP.clean) return;
  const s=clamp(Math.min(HW,HH)/760,0.7,1.4), alt=Math.max(0,S.pos.y-Math.max(terrainH(S.pos.x,S.pos.z),0)); hx.save(); hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.textBaseline='top'; hx.textAlign='left'; hx.shadowColor='rgba(0,0,0,.7)'; hx.shadowBlur=4;
  hx.fillStyle='#ff4a3a'; hx.beginPath(); hx.arc(18*s,22*s,5*s,0,6.3); hx.fill(); hx.fillStyle='#fff'; hx.fillText('TEKRAR · '+AIRCRAFT[activeId].name,28*s,15*s);
  hx.fillStyle='#b8ecff'; hx.fillText(Math.round(S.speed*3.6)+' km/sa · '+Math.round(alt)+' m'+(RP.speed!==1?' · '+RP.speed+'×':'')+(RP.rec?'   ⏺ KAYIT':''),28*s,33*s); hx.restore(); }; },drawHUD);
/* ---- bar UI */
function rpUI(){ const b=$('rpPlay'); if(b) b.textContent=RP.play?'❚❚':'▶'; Array.prototype.forEach.call(document.querySelectorAll('#rpBar [data-cam]'),function(x){ x.setAttribute('aria-pressed',String(x.dataset.cam===RP.cam)); });
  Array.prototype.forEach.call(document.querySelectorAll('#rpBar [data-sp]'),function(x){ x.setAttribute('aria-pressed',String(+x.dataset.sp===RP.speed)); });
  const v=$('rpVid'); if(v){ v.textContent=RP.rec?'⏹ Kaydı bitir':'⏺ Video'; v.classList.toggle('rec',!!RP.rec); } }
function rpToggle(){ if(!RP.play&&RP.t>=rpDur()-0.05) RP.t=0; RP.play=!RP.play; rpUI(); }
function rpSeek(dtS){ RP.t=clamp(RP.t+dtS,0,rpDur()); RP.shot=-1; }
function rpSetCam(c){ RP.cam=c; RP.shot=-1; CAMU.yaw=0; CAMU.pitch=0; CAMU.zoom=1; RP.cq.copy(S.q); fwdOf(S.q,rpF); RP.oh=Math.atan2(-rpF.x,-rpF.z); rpUI(); }
/* ---- video (WebM via MediaRecorder on the game canvas) */
function rpVidStart(){ const cv=renderer.domElement; if(!cv.captureStream||typeof MediaRecorder==='undefined'){ toast('Bu tarayıcı video kaydını desteklemiyor','#ffc24a'); return; }
  let mime=''; ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].some(function(m){ if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m)){ mime=m; return true; } return false; });
  try{ const st=cv.captureStream(30); RP.chunks=[]; RP.rec=new MediaRecorder(st,mime?{mimeType:mime,videoBitsPerSecond:6e6}:undefined);
    RP.rec.ondataavailable=function(e){ if(e.data&&e.data.size) RP.chunks.push(e.data); }; RP.rec.onstop=rpVidDone; RP.rec.start(250); RP.recT=performance.now();
    if(!RP.play){ RP.play=true; } toast('Video kaydı başladı','#ff8a7a'); }catch(e){ RP.rec=null; toast('Video kaydı başlatılamadı','#ffc24a'); } rpUI(); }
function rpVidStop(){ if(!RP.rec) return; try{ RP.rec.stop(); }catch(e){} RP.rec=null; rpUI(); }
function rpVidDone(){ const blob=new Blob(RP.chunks,{type:'video/webm'}); RP.chunks=[]; if(!blob.size){ toast('Video boş kaldı','#ffc24a'); return; }
  const url=URL.createObjectURL(blob), v=$('rpVidOut'), a=$('rpVidDl'); if(RP.vidUrl) try{ URL.revokeObjectURL(RP.vidUrl); }catch(e){} RP.vidUrl=url;
  v.src=url; a.href=url; a.download='ay-yildiz-tekrar-'+new Date().toISOString().slice(0,16).replace(/[-:T]/g,'')+'.webm'; $('rpVidSize').textContent=Math.max(0.1,Math.round(blob.size/1e5)/10)+' MB';
  RP.play=false; rpUI(); $('rpVidUI').classList.remove('hidden'); }
function rpPhoto(){ const was=RP.play; RP.play=false; rpUI(); const h=RP.hud; RP.hud=false; drawHUD(); takePhoto(); RP.hud=h; if(was){} }
(function(){ if(!$('rpBar')) return;
  MODALS.push('rpVidUI');
  $('rpBar').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return;
    if(b.id==='rpPlay') rpToggle(); else if(b.id==='rpBack') rpSeek(-5); else if(b.id==='rpFwd') rpSeek(5); else if(b.id==='rpExit') rpClose();
    else if(b.id==='rpShot') rpPhoto(); else if(b.id==='rpVid'){ if(RP.rec) rpVidStop(); else rpVidStart(); } else if(b.id==='rpHud'){ RP.hud=!RP.hud; b.setAttribute('aria-pressed',String(RP.hud)); }
    else if(b.dataset.cam) rpSetCam(b.dataset.cam); else if(b.dataset.sp){ RP.speed=+b.dataset.sp; rpUI(); } });
  const sl=$('rpT'); sl.addEventListener('input',function(){ RP.drag=true; RP.t=+sl.value/1000*rpDur(); RP.shot=-1; }); sl.addEventListener('change',function(){ RP.drag=false; });
  $('rpVidClose').addEventListener('click',function(){ $('rpVidUI').classList.add('hidden'); });
  const add=function(anchorId,id,text,before){ const a=$(anchorId); if(!a||!a.parentNode||!document.createElement) return; const b=document.createElement('button'); b.className='btn'; b.id=id; b.type='button'; b.textContent=text; a.parentNode.insertBefore(b,before?a:a.nextSibling); b.addEventListener('click',rpOpen); return b; };
  add('btnPauseLog','btnPauseReplay','Tekrar izle',true); add('btnMHangar','btnMReplay','Tekrar izle',true);
  INPUT.on('keydown',function(e){ if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&e.target.id!=='rpT') return;
    if(RP.on){ if(anyModalOpen()) return; const c=e.code; let used=true;
      if(c==='Space'||c==='KeyK') rpToggle(); else if(c==='ArrowLeft') rpSeek(e.shiftKey?-1:-5); else if(c==='ArrowRight') rpSeek(e.shiftKey?1:5); else if(c==='Escape'||isKey(e,'gen','replay')) rpClose();
      else if(c==='Digit1') rpSetCam('chase'); else if(c==='Digit2') rpSetCam('cockpit'); else if(c==='Digit3') rpSetCam('cine'); else if(c==='Digit4') rpSetCam('orbit');
      else if(c==='Minus'||c==='NumpadSubtract'){ RP.speed=Math.max(0.25,RP.speed/2); rpUI(); } else if(c==='Equal'||c==='NumpadAdd'){ RP.speed=Math.min(4,RP.speed*2); rpUI(); }
      else used=false; if(used){ e.preventDefault(); e.stopImmediatePropagation(); } return; }
    if(!e.repeat&&isKey(e,'gen','replay')&&(state==='play'||state==='paused'||state==='mend')){ e.preventDefault(); rpOpen(); } },true,'ekran/tekrar','tekrar');
  setInterval(function(){ const can=RP.buf.length>=20&&!(NET.on&&NET.started); ['btnPauseReplay','btnMReplay'].forEach(function(id){ const b=$(id); if(b) b.classList.toggle('hidden',!can||(id==='btnPauseReplay'&&WALK.from==='walk')); }); },500); })();
