/* ------------------------------------------------------------------ missiles you can beat (V2.08)
   Missile model: the rocket motor burns 8 s, after that drag slows the missile; below ~200 m/s it is spent. The seeker sees
   only ±55° around the missile's nose: a hard break turn at the right moment makes it lose you. Radar SAM missiles lose
   you in the "notch" (flying across their line of sight, low), and terrain between you and the missile breaks the lock.
   Flares are far more effective when dropped during a hard turn at 400–1 800 m.
   Warning: the RWR ring shows where the missile comes from (clock + distance) with an advice line ("SAĞA KIR + FLARE",
   "ALÇAL"); Kartal Gözü calls "Füze, saat 4!". Kaçış yardımı (F7 / KAÇ touch button, with Uçuş yardımı on): flies the
   best break turn and drops flares by itself for a few seconds. Mission "Füzeden kaçış": survive three SAM shots. */
const EV={auto:0, flareT:0, said:new WeakSet(), lastDir:0, evaded:0, v:new THREE.Vector3(), w:new THREE.Vector3(), f:new THREE.Vector3(), r:new THREE.Vector3()};
function evIncoming(){ return missiles.filter(function(m){ return m.on&&!m.vic&&!m.tgt&&!m.lost; }); }
function evClock(p){ fwdOf(S.q,EV.f); EV.v.copy(p).sub(S.pos); const a=Math.atan2(EV.v.x,-EV.v.z)-Math.atan2(EV.f.x,-EV.f.z); let deg=((a*180/Math.PI)%360+360)%360; return {clock:Math.round(deg/30)%12||12, right:deg<180, deg:deg}; }
function evLost(m,why){ if(m.lost) return; m.lost=true; if(!m.vic){ EV.evaded++; toast('Füze kaçırıldı: '+why,'#7dffb0'); try{ radioSay({w:'awacs',t:'Güzel {cs}, füze '+why+'.'},null,{gap:6}); }catch(e){} } }
function evLOS(a,b){ for(let k=1;k<8;k++){ const t=k/8, x=a.x+(b.x-a.x)*t, y=a.y+(b.y-a.y)*t, z=a.z+(b.z-a.z)*t; if(y<terrainH(x,z)-2) return false; } return true; }
function evPhysics(dt){ missiles.forEach(function(m){ if(!m.on) return; m.age=(m.age||0)+dt;
    /* the original step adds +120 m/s²; after burn-out remove it and add drag */
    if(m.age>8){ m.speed-=dt*(120+25+0.00012*m.speed*m.speed); if(m.speed<200&&!m.lost){ if(m.vic) m.lost=true; else evLost(m,'enerjisini yitirdi'); } }
    if(m.lost||m.tgt) return; const tp=m.vic?(m.vic.alive?m.vic.pos:null):S.pos; if(!tp) return;
    EV.v.copy(m.v).normalize(); EV.w.copy(tp).sub(m.p); const d=EV.w.length(); EV.w.divideScalar(d||1);
    if(m.age>1.2&&EV.v.dot(EV.w)<Math.cos(55*Math.PI/180)){ if(m.vic) m.lost=true; else evLost(m,'kilidi kaybetti (sert dönüş)'); return; }
    if(!m.vic){ if(m.age>1&&!evLOS(m.p,S.pos)){ evLost(m,'arazinin arkasında kaldın'); return; }
      if(m.src&&S.speed>40){ fwdOf(S.q,EV.f); const aspect=Math.abs(EV.f.dot(EV.w)), agl=S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z)); if(aspect<0.22&&agl<500){ m.notch=(m.notch||0)+dt; if(m.notch>1.2&&Math.random()<dt*1.5){ evLost(m,'çentikte kaybetti'); return; } } else m.notch=Math.max(0,(m.notch||0)-dt); }
      /* well-timed flares during a hard turn */
      if(d>400&&d<1800&&S.g>4){ for(let i=0;i<flares.length;i++){ const f=flares[i]; if(f.life>4.2&&!m.seen['g'+f.id]){ m.seen['g'+f.id]=true; if(Math.random()<0.45){ m.tgt=f; break; } } } } } }); }
updateThreats=HOOK.wrap('updateThreats','98r-evade#_evThr',function(_evThr){ return function(dt){ evPhysics(dt); _evThr(dt); evWarn(); }; },updateThreats);
/* reset age on launch */
launchSam=HOOK.wrap('launchSam','98r-evade#_evSam',function(_evSam){ return function(o){ const r=_evSam(o); if(r){ const m=missiles.find(function(x){ return x.on&&x.src===o; }); if(m){ m.age=0; m.notch=0; } } return r; }; },launchSam);
if(typeof aiMissile==='function'){ aiMissile=HOOK.wrap('aiMissile','98r-evade#_evAi',function(_evAi){ return function(a,t){ const r=_evAi(a,t); missiles.forEach(function(m){ if(m.on&&m.byAct===a&&m.age==null) m.age=0; }); return r; }; },aiMissile); }
/* ---- warnings */
function evWarn(){ if(state!=='play'||S.crashed) return; evIncoming().forEach(function(m){ if(EV.said.has(m)) return; EV.said.add(m); m.age=m.age||0; const c=evClock(m.p);
    try{ radioSay({w:'awacs',t:'{cs}, füze! Saat '+c.clock+', '+(Math.round(m.p.distanceTo(S.pos)/100)/10).toString().replace('.',',')+' kilometre!'},null,{force:true}); }catch(e){} }); }
function evAdvice(m){ const c=evClock(m.p), d=m.p.distanceTo(S.pos), agl=S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z)); const L=[];
  L.push(c.right?'SAĞA KIR':'SOLA KIR'); if(d<2000) L.push('FLARE'); if(m.src&&agl>300) L.push('ALÇAL'); return L.join(' + '); }
function evHUD(){ if(state!=='play'||S.crashed) return; const L=evIncoming(); if(!L.length) return; let m=L[0], md=1e9; L.forEach(function(x){ const d=x.p.distanceTo(S.pos); if(d<md){ md=d; m=x; } });
  const s=clamp(Math.min(HW,HH)/760,0.7,1.5), cx=HW/2, cy=HH*0.5, R=Math.min(HW,HH)*0.28, c=evClock(m.p), a=(c.deg-90)*Math.PI/180, blink=(T*4|0)%2===0;
  hx.save(); hx.strokeStyle='rgba(255,90,90,.35)'; hx.lineWidth=2*s; hx.beginPath(); hx.arc(cx,cy,R,0,6.3); hx.stroke();
  const px=cx+Math.cos(a)*R, py=cy+Math.sin(a)*R; hx.fillStyle=blink?'#ff3a2a':'#ffb0a0'; hx.beginPath(); hx.moveTo(px+Math.cos(a)*16*s,py+Math.sin(a)*16*s); hx.lineTo(px+Math.cos(a+2.5)*12*s,py+Math.sin(a+2.5)*12*s); hx.lineTo(px+Math.cos(a-2.5)*12*s,py+Math.sin(a-2.5)*12*s); hx.closePath(); hx.fill();
  hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,.85)'; hx.shadowBlur=5; hx.font='800 '+Math.round(15*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#ff6a5a';
  hx.fillText('FÜZE · SAAT '+c.clock+' · '+(md>=1000?(md/1000).toFixed(1).replace('.',',')+' km':Math.round(md)+' m'),cx,cy-R-44*s);
  hx.font='800 '+Math.round(18*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#ffd27a'; hx.fillText(evAdvice(m)+(EV.auto>0?'  ·  KAÇIŞ YARDIMI':''),cx,cy-R-20*s); hx.restore(); }
drawHUD=HOOK.wrap('drawHUD','98r-evade#_evHUD',function(_evHUD){ return function(){ _evHUD(); try{ hx.setTransform(DPR,0,0,DPR,0,0); evHUD(); }catch(e){} }; },drawHUD);
/* ---- automatic evasion: break turn towards the missile side to put it on the beam, full power, flares */
function evAutoGo(){ if(state!=='play'||S.onGround||!evIncoming().length){ toast('Üzerine gelen füze yok','#b8ecff'); return; } if(assistMode()==='off'){ toast('Kaçış yardımı için Ayarlar → Uçuş yardımı açık olmalı','#ffc24a'); return; } EV.auto=5; toast('Kaçış yardımı: sert dönüş + flare','#ffd27a'); }
function evAutoCtl(){ if(EV.auto<=0) return null; const L=evIncoming(); if(!L.length){ EV.auto=0; return null; } let m=L[0], md=1e9; L.forEach(function(x){ const d=x.p.distanceTo(S.pos); if(d<md){ md=d; m=x; } });
  const c=evClock(m.p); vR.set(1,0,0).applyQuaternion(S.q); vU.set(0,1,0).applyQuaternion(S.q); const bank=Math.atan2(-vR.y,vU.y), want=(c.right?1:-1)*1.3;
  const agl=S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z)); return {r:clamp((want-bank)*2,-1,1), p:agl<250?0.5:(Math.abs(bank-want)<0.4?0.9:0.2), thr:1, flare:md<1600}; }
pollPad=HOOK.wrap('pollPad','98r-evade#_evPoll',function(_evPoll){ return function(){ _evPoll(); if(state!=='play') return; const c=evAutoCtl(); if(!c) return; const sg=invertY?-1:1; PAD.roll=clamp((PAD.roll||0)+c.r,-1,1); PAD.pitch=clamp((PAD.pitch||0)+c.p*sg,-1,1); S.throttle=c.thr; if(c.flare&&EV.flareT<=0){ EV.flareT=0.8; dropFlares(); } }; },pollPad);
update=HOOK.wrap('update','98r-evade#_evUpd',function(_evUpd){ return function(dt){ _evUpd(dt); if(EV.auto>0) EV.auto-=dt; if(EV.flareT>0) EV.flareT-=dt; }; },update);
if(CTRL_DEF.gen&&!CTRL_DEF.gen.acts.some(function(a){ return a[0]==='evade'; })) CTRL_DEF.gen.acts.push(['evade','Füzeden kaçış yardımı',['F7'],[]]);
if(CTRL.kb.gen&&!CTRL.kb.gen.evade) CTRL.kb.gen.evade=['F7']; if(CTRL.pad&&CTRL.pad.gen&&!CTRL.pad.gen.evade) CTRL.pad.gen.evade=[];
window.addEventListener('keydown',function(e){ if(e.repeat||state!=='play') return; if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if(isKey(e,'gen','evade')){ e.preventDefault(); evAutoGo(); } });
(function(){ const bar=document.querySelector?document.querySelector('#touch .ttop'):null; if(!bar||!document.createElement||typeof bar.appendChild!=='function') return; const b=document.createElement('button'); b.type='button'; b.id='tEvade'; b.className='tevade hidden'; b.textContent='KAÇ!'; bar.appendChild(b);
  b.addEventListener('pointerdown',function(e){ e.preventDefault(); evAutoGo(); }); })();
updateTouchUI=HOOK.wrap('updateTouchUI','98r-evade#_evTouch',function(_evTouch){ return function(){ _evTouch(); const b=$('tEvade'); if(b&&b.classList) b.classList.toggle('hidden',!(TOUCH.vis&&evIncoming().length)); }; },updateTouchUI);
/* ---- mission "Füzeden kaçış" */
MISSIONS.kacis={name:'Füzeden kaçış',desc:'İki SAM bataryası sana füze atacak. Üç füzeden kurtul: sert dön, füzeyi yandan al, alçal, zamanında flare at.',limit:420};
BMETA.kacis={cat:'egitim',diff:2,dur:7,xp:280,obj:['Üç füzeden kurtul','Füze uyarısında: füzeyi saat 3 ya da 9 yönüne al (sert dönüş)','Füze 2 km içindeyken flare at; alçalarak arazinin arkasına geç','Zorlanırsan F7 / KAÇ!: kaçış yardımı'],thr:['İki SAM bataryası (radar güdümlü)'],load:'clr',area:[7000,-5500,6000]};
if(typeof MORDER!=='undefined'&&MORDER.indexOf('kacis')<0) MORDER.push('kacis');
const EV_SAMS=[[7600,-5200],[8600,-3400]], EV_START=[3600,-9000];
setupMission=HOOK.wrap('setupMission','98r-evade#_evSetup',function(_evSetup){ return function(){ const r=_evSetup(); if(missionId==='kacis'){ EV.evaded=0; clearGround(); EV_SAMS.forEach(function(p){ const o=addGround('sam',p[0],p[1]); if(o) o.cd=0; });
    S.pos.set(EV_START[0],AIRFIELD_Y+900,EV_START[1]); try{ sQ(Math.atan2(EV_SAMS[0][0]-EV_START[0],-(EV_SAMS[0][1]-EV_START[1]))); }catch(e){} S.onGround=false; S.speed=Math.max(S.speed,CUR.airV*0.9); S.gear=false; setTimeout(function(){ toast('Füzeden kaçış: SAM bataryalarına doğru uç; füze geldiğinde kaçış hareketlerini dene','#ffd27a'); },1200); } return r; }; },setupMission);
updateMission=HOOK.wrap('updateMission','98r-evade#_evUpdM',function(_evUpdM){ return function(dt){ if(M&&M.id==='kacis'){ if(!M.done&&state==='play'){ M.started=true; M.t+=dt; if(EV.evaded>=3) endMission(true); else if(M.t>MISSIONS.kacis.limit) endMission(false); } return; } return _evUpdM(dt); }; },updateMission);
bObjective=HOOK.wrap('bObjective','98r-evade#_evObj',function(_evObj){ return function(){ if(state==='play'&&M&&M.id==='kacis'&&!M.done) return {name:'Füzeden kaçış',txt:'Kurtulduğun füze: '+EV.evaded+' / 3',rem:Math.max(0,MISSIONS.kacis.limit-M.t),tgt:null}; return _evObj(); }; },bObjective);
bStarsFor=HOOK.wrap('bStarsFor','98r-evade#_evStars',function(_evStars){ return function(ok){ if(M&&M.id==='kacis'){ if(!ok) return 0; return S.hp>=90?3:S.hp>=50?2:1; } return _evStars(ok); }; },bStarsFor);
