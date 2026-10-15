/* ------------------------------------------------------------------ aerobatics (V2.07)
   A maneuver recogniser watches the flight 10 times a second (body-axis rotation from quaternion differences, heading,
   pitch, bank, altitude, speed) and names the figure when it is completed: Tonoz, Fıçı tonoz, Looping, Immelmann, Split-S,
   Cuban 8, Hammerhead, Sırtüstü uçuş, Bıçak sırtı. Each figure scores points with a quality grade (altitude / heading kept).
   Smoke: F6 (or the DUMAN touch button) toggles a red / white smoke trail. Mission "Akrobasi gösterisi": fly a set sequence;
   the judges score each figure. The detector is generic so formation flying (V2.09) can reuse it. */
const ACRO={on:true, buf:[], t:0, last:{}, flash:null, flashT:0, smoke:false, seq:null, si:0, score:0, q0:new THREE.Quaternion(), dq:new THREE.Quaternion(), rv:new THREE.Vector3(), f:new THREE.Vector3(), u:new THREE.Vector3(), r:new THREE.Vector3()};
const ACRO_FIG={tonoz:['Tonoz',150],fici:['Fıçı tonoz',200],loop:['Looping',250],immel:['Immelmann',300],splits:['Split-S',300],cuban:['Cuban 8',450],hammer:['Hammerhead',400],inv:['Sırtüstü uçuş',150],knife:['Bıçak sırtı',200]};
function acroAngles(){ const q=S.q; ACRO.f.set(0,0,-1).applyQuaternion(q); ACRO.u.set(0,1,0).applyQuaternion(q); ACRO.r.set(1,0,0).applyQuaternion(q);
  return {hd:Math.atan2(ACRO.f.x,-ACRO.f.z), pitch:Math.asin(clamp(ACRO.f.y,-1,1)), bank:Math.atan2(-ACRO.r.y,ACRO.u.y)}; }
function angDiff(a,b){ let d=a-b; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI; return d; }
/* sample: body rotation since the previous sample (x pitch, y yaw, z roll) */
function acroSample(){ const a=acroAngles(); ACRO.dq.copy(ACRO.q0).invert().multiply(S.q); const w=2*Math.acos(clamp(ACRO.dq.w,-1,1)), s=Math.sqrt(Math.max(1e-9,1-ACRO.dq.w*ACRO.dq.w));
  let rx=0,ry=0,rz=0; if(w>1e-5){ const k=(ACRO.dq.w<0?-1:1)*(w>Math.PI?(w-2*Math.PI):w)/s; rx=ACRO.dq.x*k; ry=ACRO.dq.y*k; rz=ACRO.dq.z*k; } ACRO.q0.copy(S.q);
  return {t:ACRO.t, hd:a.hd, pitch:a.pitch, bank:a.bank, y:S.pos.y, v:S.speed, rx:rx, ry:ry, rz:rz}; }
/* sums over the last `sec` seconds */
/* V2.24: no arrays per call — this runs 10 times a second for six window lengths; one result object is reused */
const ACRO_W={a:null,b:null,roll:0,pit:0,yaw:0,dh:0,dy:0,pmax:0,pmin:0,yrange:0,vmin:0,bmin:0,kmax:0,n:0};
function acroWin(sec){ const B=ACRO.buf, t1=ACRO.t, W=ACRO_W; let i0=B.length; while(i0>0&&t1-B[i0-1].t<=sec) i0--; const n=B.length-i0; if(n<3) return null;
  let roll=0,pit=0,yaw=0,pmax=-9,pmin=9,ymax=-1e9,ymin=1e9,vmin=1e9,bmin=9,kmax=0;
  for(let i=i0;i<B.length;i++){ const s=B[i]; roll+=s.rz; pit+=s.rx; yaw+=s.ry; if(s.pitch>pmax) pmax=s.pitch; if(s.pitch<pmin) pmin=s.pitch; if(s.y>ymax) ymax=s.y; if(s.y<ymin) ymin=s.y; if(s.v<vmin) vmin=s.v;
    const ab=Math.abs(s.bank); if(ab<bmin) bmin=ab; const kd=Math.abs(ab-Math.PI/2); if(kd>kmax) kmax=kd; }
  const a=B[i0], b=B[B.length-1]; W.a=a; W.b=b; W.n=n; W.roll=roll; W.pit=pit; W.yaw=yaw; W.dh=Math.abs(angDiff(b.hd,a.hd)); W.dy=b.y-a.y; W.pmax=pmax; W.pmin=pmin; W.yrange=ymax-ymin; W.vmin=vmin; W.bmin=bmin; W.kmax=kmax; return W; }

function acroDetect(){ const W=acroWin; let w;
  /* order matters: larger figures first so their parts are not reported separately */
  if((w=W(26))&&Math.abs(w.pit)>600*D2R&&Math.abs(w.roll)>300*D2R&&w.dh<45*D2R) return ['cuban',1-Math.min(1,Math.abs(w.dy)/400)];
  if((w=W(14))&&Math.abs(w.pit)>320*D2R&&Math.abs(w.roll)<100*D2R&&w.dh<35*D2R&&w.pmax>60*D2R&&w.pmin<-30*D2R) return ['loop',1-Math.min(1,Math.abs(w.dy)/250)];
  if((w=W(12))&&w.dh>140*D2R&&w.dy>80&&Math.abs(w.pit)>150*D2R&&Math.abs(w.roll)>140*D2R&&Math.abs(w.b.bank)<40*D2R&&Math.abs(w.b.pitch)<30*D2R) return ['immel',1-Math.min(1,Math.abs(w.dh-Math.PI)/(40*D2R))];
  if((w=W(12))&&w.dh>140*D2R&&w.dy<-80&&Math.abs(w.pit)>150*D2R&&Math.abs(w.roll)>140*D2R&&Math.abs(w.b.bank)<40*D2R&&Math.abs(w.b.pitch)<30*D2R) return ['splits',1-Math.min(1,Math.abs(w.dh-Math.PI)/(40*D2R))];
  if((w=W(14))&&w.pmax>70*D2R&&w.pmin<-60*D2R&&w.dh>140*D2R&&w.vmin<CUR.stall[1]*1.4&&Math.abs(w.yaw)>120*D2R) return ['hammer',1];
  if((w=W(8))&&Math.abs(w.roll)>330*D2R&&w.dh<45*D2R&&(w.pmax-w.pmin)>20*D2R) return ['fici',1-Math.min(1,Math.abs(w.dy)/200)];
  if((w=W(6))&&Math.abs(w.roll)>330*D2R&&w.dh<30*D2R&&(w.pmax-w.pmin)<25*D2R) return ['tonoz',1-Math.min(1,w.yrange/120)];
  if((w=W(4))&&w.bmin>150*D2R&&w.yrange<60) return ['inv',1-w.yrange/60];
  if((w=W(3))&&w.kmax<12*D2R&&w.dy>-80) return ['knife',1-Math.max(0,-w.dy)/80];
  return null; }
function acroStep(dt){ if(state!=='play'||S.onGround||S.crashed){ ACRO.buf.length=0; ACRO.q0.copy(S.q); if(ACRO.flashT>0) ACRO.flashT-=dt; return; }
  ACRO.t+=dt; ACRO.acc=(ACRO.acc||0)+dt; if(ACRO.flashT>0) ACRO.flashT-=dt; smokeStep(dt);
  if(ACRO.acc<0.1) return; ACRO.acc=0; ACRO.buf.push(acroSample()); while(ACRO.buf.length&&ACRO.t-ACRO.buf[0].t>28) ACRO.buf.shift();
  const d=acroDetect(); if(!d) return; const k=d[0]; if(ACRO.t-(ACRO.last[k]||-99)<4) return;
  ACRO.last[k]=ACRO.t; ACRO.buf.length=0; acroScore(k,clamp(d[1],0,1)); }
function acroScore(k,q){ const F=ACRO_FIG[k], grade=q>0.8?'Mükemmel':q>0.5?'İyi':'Geçer', pts=Math.round(F[1]*(0.5+0.5*q));
  ACRO.flash={n:F[0],g:grade,p:pts}; ACRO.flashT=3; try{ score+=pts; noteScore(); }catch(e){} try{ sndPlay('ui_ok'); }catch(e){}
  if(ACRO.seq){ const want=ACRO.seq[ACRO.si]; if(want===k){ ACRO.si++; ACRO.score+=pts; if(ACRO.si>=ACRO.seq.length) acroSeqDone(); else toast('Sıradaki figür: '+ACRO_FIG[ACRO.seq[ACRO.si]][0],'#ffd27a'); } } }
/* ---- smoke trail */
const SMK={n:900, i:0, pts:null, col:null, life:null};
function smokeBuild(){ const g=new THREE.BufferGeometry(), P=new Float32Array(SMK.n*3), C=new Float32Array(SMK.n*3); for(let i=0;i<SMK.n;i++) P[i*3+1]=-9999;
  g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); SMK.life=new Float32Array(SMK.n);
  let tex=null; try{ const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'), gr=x.createRadialGradient(32,32,2,32,32,31); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.5,'rgba(255,255,255,.55)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); tex=new THREE.CanvasTexture(cv); }catch(e){}
  SMK.pts=new THREE.Points(g,new THREE.PointsMaterial({size:5,map:tex,vertexColors:true,transparent:true,opacity:0.55,depthWrite:false,sizeAttenuation:true})); SMK.pts.frustumCulled=false; scene.add(SMK.pts); }
function smokeStep(dt){ if(!ACRO.smoke&&!SMK.pts) return; if(!SMK.pts) smokeBuild(); const P=SMK.pts.geometry.attributes.position, C=SMK.pts.geometry.attributes.color;
  if(ACRO.smoke&&state==='play'&&!S.onGround){ ACRO.f.set(0,0,-1).applyQuaternion(S.q); for(let k=0;k<2;k++){ const i=SMK.i=(SMK.i+1)%SMK.n, back=(model&&model.tail?model.tail:6)+3+k*3;
      P.setXYZ(i,S.pos.x-ACRO.f.x*back+(Math.random()-0.5),S.pos.y-ACRO.f.y*back+(Math.random()-0.5),S.pos.z-ACRO.f.z*back+(Math.random()-0.5)); const red=Math.floor(ACRO.t*2)%2===0; C.setXYZ(i,red?0.9:1,red?0.1:1,red?0.15:1); SMK.life[i]=25; } }
  for(let i=0;i<SMK.n;i++){ if(SMK.life[i]>0){ SMK.life[i]-=dt; if(SMK.life[i]<=0) P.setY(i,-9999); else P.setY(i,P.getY(i)+dt*0.6); } }
  P.needsUpdate=true; C.needsUpdate=true; }
function smokeToggle(){ ACRO.smoke=!ACRO.smoke; toast(ACRO.smoke?'Duman açık (F6)':'Duman kapalı','#ffd27a'); }
if(CTRL_DEF.gen&&!CTRL_DEF.gen.acts.some(function(a){ return a[0]==='smoke'; })) CTRL_DEF.gen.acts.push(['smoke','Akrobasi dumanı aç / kapat',['F6'],[]]);
if(CTRL.kb.gen&&!CTRL.kb.gen.smoke) CTRL.kb.gen.smoke=['F6']; if(CTRL.pad&&CTRL.pad.gen&&!CTRL.pad.gen.smoke) CTRL.pad.gen.smoke=[];
window.addEventListener('keydown',function(e){ if(e.repeat||state!=='play') return; if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if(isKey(e,'gen','smoke')){ e.preventDefault(); smokeToggle(); } });
/* ---- HUD */
function acroHUD(){ if(state!=='play') return; const s=clamp(Math.min(HW,HH)/760,0.7,1.5); hx.save(); hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,.8)'; hx.shadowBlur=6;
  if(ACRO.flashT>0&&ACRO.flash){ const a=Math.min(1,ACRO.flashT); hx.globalAlpha=a; hx.font='800 '+Math.round(30*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#ffd27a'; hx.fillText(ACRO.flash.n.toLocaleUpperCase('tr-TR'),HW/2,HH*0.3);
    hx.font='700 '+Math.round(15*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#fff'; hx.fillText(ACRO.flash.g+'  +'+ACRO.flash.p,HW/2,HH*0.3+28*s); hx.globalAlpha=1; }
  hx.restore(); }
drawHUD=HOOK.wrap('drawHUD','ucus/akrobasi#_acHUD',function(_acHUD){ return function(){ _acHUD(); try{ hx.setTransform(DPR,0,0,DPR,0,0); acroHUD(); }catch(e){} }; },drawHUD);
update=HOOK.wrap('update','ucus/akrobasi#_acUpd',function(_acUpd){ return function(dt){ _acUpd(dt); try{ acroStep(dt); }catch(e){} }; },update);
/* ---- "Akrobasi gösterisi" mission */
const ACRO_SEQ=['tonoz','loop','immel','splits','fici'];
const ACRO_TIPS={tonoz:'Burnu ufukta tut, çubuğu tam sağa (ya da sola) yatır, 360° dön',loop:'Hızlan (en az 600 km/s), çubuğu sürekli geri çek, tam bir daire çiz',immel:'Yarım looping ile tırman, ters dönünce yarım tonozla düzel: ters yöne uçarsın',splits:'Sırtüstü dön, çubuğu geri çekerek yarım looping ile aşağı dal',fici:'Burnu hafif kaldırırken tonoz at: geniş bir sarmal çiz'};
MISSIONS.acro={name:'Akrobasi gösterisi',desc:'Türk Yıldızları tarzı gösteri: tonoz, looping, Immelmann, Split-S ve fıçı tonozu sırayla uç; hakemler her figürü puanlar.',limit:900};
BMETA.acro={cat:'egitim',diff:2,dur:10,xp:300,obj:ACRO_SEQ.map(function(k){ return ACRO_FIG[k][0]+' — '+ACRO_TIPS[k]; }),thr:['Alçakta figür yapma: en az 800 m irtifa önerilir'],load:'clr',area:[0,0,6000]};
if(typeof MORDER!=='undefined'&&MORDER.indexOf('acro')<0) MORDER.push('acro');
setupMission=HOOK.wrap('setupMission','ucus/akrobasi#_acSetup',function(_acSetup){ return function(){ const r=_acSetup(); if(missionId==='acro'){ ACRO.seq=ACRO_SEQ.slice(); ACRO.si=0; ACRO.score=0; ACRO.smoke=true; S.pos.y=Math.max(S.pos.y,AIRFIELD_Y+900); setTimeout(function(){ toast('İlk figür: '+ACRO_FIG[ACRO.seq[0]][0]+' — '+ACRO_TIPS[ACRO.seq[0]],'#ffd27a'); },1500); } else ACRO.seq=null; return r; }; },setupMission);
function acroSeqDone(){ const sc=ACRO.score; ACRO.seq=null; toast('Gösteri tamam! Hakem puanı: '+sc,'#7dffb0'); try{ M.acroScore=sc; endMission(true); }catch(e){} }
bStarsFor=HOOK.wrap('bStarsFor','ucus/akrobasi#_acStars',function(_acStars){ return function(ok){ if(M&&M.id==='acro'){ if(!ok) return 0; const sc=M.acroScore||0; return sc>=1250?3:sc>=950?2:1; } return _acStars(ok); }; },bStarsFor);
updateMission=HOOK.wrap('updateMission','ucus/akrobasi#_acUpdM',function(_acUpdM){ return function(dt){ if(M&&M.id==='acro'){ if(!M.done&&state==='play'){ if(!M.started&&!S.onGround) M.started=true; if(M.started) M.t+=dt; if(M.t>MISSIONS.acro.limit) endMission(false); } return; } return _acUpdM(dt); }; },updateMission);
bObjective=HOOK.wrap('bObjective','ucus/akrobasi#_acObj',function(_acObj){ return function(){ if(state==='play'&&M&&M.id==='acro'&&!M.done&&ACRO.seq){ const k=ACRO.seq[ACRO.si]; return {name:'Akrobasi',txt:(ACRO.si+1)+'/'+ACRO.seq.length+' · '+ACRO_FIG[k][0]+' — '+ACRO_TIPS[k],rem:Math.max(0,MISSIONS.acro.limit-M.t),tgt:null}; } return _acObj(); }; },bObjective);
/* touch: DUMAN button in the flight top bar */
(function(){ const bar=document.querySelector?document.querySelector('#touch .ttop'):null; if(!bar||!document.createElement||typeof bar.appendChild!=='function') return; const b=document.createElement('button'); b.type='button'; b.id='tSmoke'; b.textContent='DUMAN'; bar.appendChild(b);
  b.addEventListener('pointerdown',function(e){ e.preventDefault(); smokeToggle(); b.classList.toggle('on',ACRO.smoke); }); })();
