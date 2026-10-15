/* ------------------------------------------------------------------ team communication (V2.00)
   • Ping wheel (F4 or middle mouse; tap = "Hedef burada", hold = wheel; touch: 📍 button, long press = wheel):
     Hedef burada · Tehlike · Buraya git · Yardım lazım · Savunuyorum · Anlaşıldı. The ping lands on the locked target or where
     the camera looks (terrain under the crosshair), shows as an icon with distance on screen, on the map / mini-map, and goes
     to team-mates (same team in team modes). In single player the wingman answers and turns to a pinged air target.
   • Map: right click or long press on the map drops a "Buraya git" ping.
   • Voice: who is talking is shown (push-to-talk state travels as a tiny data message). */
const PING_K=[['hedef','Hedef burada','🎯','#ff4a3a'],['tehlike','Tehlike','⚠','#ff9a2a'],['git','Buraya git','➜','#39e6ff'],['yardim','Yardım lazım','🆘','#ffd23a'],['savun','Savunuyorum','🛡','#5ab0ff'],['tamam','Anlaşıldı','✓','#7dffb0']];
const PINGS=[], PW={open:false, t0:0, sel:0, mx:0, my:0, src:null, hold:null};
const TALK={};
function pingKind(k){ return PING_K.find(function(p){ return p[0]===k; })||PING_K[0]; }
/* where the player is pointing: locked target, else terrain under the view direction */
function pingAim(){ try{ if(state==='play'&&typeof lockTgt!=='undefined'&&lockTgt&&lockTgt.alive) return lockTgt.pos.clone(); }catch(e){}
  const o=camera.position.clone(), d=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion); let p=o.clone();
  for(let s=0,step=6;s<14000;s+=step){ p.copy(o).addScaledVector(d,s); const g=Math.max(0,groundH(p.x,p.z)); if(p.y<=g){ p.y=g; return p; } step=Math.min(120,step*1.15); }
  return o.addScaledVector(d,3000); }
function pingTeam(){ try{ const me=NET.roster.find(function(r){ return r.id===NET.myId; }); return me?me.team:null; }catch(e){ return null; } }
function pingPlace(k,pos,silent){ const name=(typeof NET!=='undefined'&&NET.on)?(NET.name||callsign()):callsign(); const P={k:k,x:pos.x,y:pos.y,z:pos.z,by:(typeof NET!=='undefined'&&NET.myId)||'me',name:name,team:pingTeam()};
  pingIn(P,true); if(typeof NET!=='undefined'&&NET.on){ const m=Object.assign({t:'ping'},P); if(NET.host) netBroadcast(m); else netSend(NET.hconn,m); }
  else if(!silent) pingWing(P); }
function pingIn(P,mine){ const K=pingKind(P.k); for(let i=PINGS.length-1;i>=0;i--) if(PINGS[i].by===P.by) PINGS.splice(i,1);   /* one ping per player */
  PINGS.push({k:P.k,pos:new THREE.Vector3(P.x,P.y,P.z),by:P.by,name:String(P.name||'Pilot').slice(0,16),t:P.k==='tamam'?6:25,mine:!!mine}); if(PINGS.length>12) PINGS.shift();
  try{ sndPlay('ui_notify',{vol:0.6,pitch:mine?1.2:1}); }catch(e){}
  if(!mine) toast(K[2]+' '+String(P.name||'Pilot').slice(0,16)+': '+K[1],K[3]); }
/* single player: the wingman answers */
function pingWing(P){ if(typeof wingSpawned==='undefined'||!wingSpawned) return; const W=ACT.find(function(a){ return a.wing&&a.alive; }); if(!W) return;
  if(P.k==='hedef'){ let best=null, bd=1500; ACT.forEach(function(a){ if(!a.alive||a.team==='blue') return; const d=a.pos.distanceTo(new THREE.Vector3(P.x,P.y,P.z)); if(d<bd){ bd=d; best=a; } });
    if(best){ W.tgt=best; W.retT=8; setTimeout(function(){ radioSay({w:'kanat',t:'Hedefi gördüm, üstüne gidiyorum!'},null,{force:true}); },700); } else setTimeout(function(){ radioSay({w:'kanat',t:'Yerdeki hedefi gördüm, seni kolluyorum.'},null,{force:true}); },700); }
  else if(P.k==='yardim'||P.k==='tehlike') setTimeout(function(){ radioSay('wg_cover',null,{force:true}); },700);
  else setTimeout(function(){ radioSay('wg_ack',null,{force:true}); },700); }
function pingStep(dt){ for(let i=PINGS.length-1;i>=0;i--){ PINGS[i].t-=dt; if(PINGS[i].t<=0) PINGS.splice(i,1); } for(const k in TALK){ TALK[k].t-=dt; if(TALK[k].t<=0) delete TALK[k]; } }
/* ---- wheel */
function pwEl(){ let el=$('pingWheel'); if(el) return el; el=document.createElement('div'); el.id='pingWheel'; el.className='pwheel hidden';
  el.innerHTML=PING_K.map(function(p,i){ const a=-Math.PI/2+i*Math.PI*2/PING_K.length; return '<button type="button" data-i="'+i+'" style="left:'+(50+Math.cos(a)*36)+'%;top:'+(50+Math.sin(a)*36)+'%;--c:'+p[3]+'"><i>'+p[2]+'</i><small>'+p[1]+'</small><kbd>'+(i+1)+'</kbd></button>'; }).join('')+'<span class="pwc">İŞARET</span>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){ const b=e.target.closest('button[data-i]'); if(b){ PW.sel=+b.dataset.i; pwClose(true); } });
  el.addEventListener('pointermove',function(e){ const r=el.getBoundingClientRect(); pwPoint(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2); });
  return el; }
function pwPoint(dx,dy){ if(Math.hypot(dx,dy)<18) return; let a=Math.atan2(dy,dx)+Math.PI/2; if(a<0) a+=Math.PI*2; PW.sel=Math.round(a/(Math.PI*2/PING_K.length))%PING_K.length; pwRender(); }
function pwRender(){ const el=$('pingWheel'); if(!el) return; Array.prototype.forEach.call(el.querySelectorAll('button'),function(b){ b.classList.toggle('on',+b.dataset.i===PW.sel); }); }
function pwOpen(){ if(PW.open||(state!=='play'&&state!=='walk')) return; PW.open=true; PW.sel=0; PW.mx=PW.my=0; PW.aim=pingAim(); const el=pwEl(); el.classList.remove('hidden'); pwRender(); }
function pwClose(commit){ if(!PW.open) return; PW.open=false; const el=$('pingWheel'); if(el) el.classList.add('hidden'); if(commit) pingPlace(PING_K[PW.sel][0],PW.aim||pingAim()); }
function pwPress(src){ if(state!=='play'&&state!=='walk') return; if(PW.hold) return; PW.src=src; PW.t0=performance.now(); PW.hold=setTimeout(function(){ PW.hold=null; pwOpen(); },260); }
function pwRelease(){ if(PW.hold){ clearTimeout(PW.hold); PW.hold=null; pingPlace('hedef',pingAim()); return; } if(PW.open) pwClose(true); }
if(CTRL_DEF.gen&&!CTRL_DEF.gen.acts.some(function(a){ return a[0]==='ping'; })) CTRL_DEF.gen.acts.push(['ping','İşaret (dokun: hedef · basılı tut: çark)',['F4'],[]]);
if(CTRL.kb.gen&&!CTRL.kb.gen.ping) CTRL.kb.gen.ping=['F4']; if(CTRL.pad&&CTRL.pad.gen&&!CTRL.pad.gen.ping) CTRL.pad.gen.ping=[];
if(typeof GEN_GROUND!=='undefined'&&GEN_GROUND.indexOf('ping')<0) GEN_GROUND.push('ping');
INPUT.on('keydown',function(e){ if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if(PW.open&&/^Digit[1-6]$/.test(e.code)){ PW.sel=+e.code.slice(5)-1; pwClose(true); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if(PW.open&&e.code==='Escape'){ pwClose(false); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if(!e.repeat&&isKey(e,'gen','ping')){ e.preventDefault(); pwPress('kb'); } },true,'ag/takim-iletisimi','uçuş, yürüyüş');
INPUT.on('keyup',function(e){ if(isKey(e,'gen','ping')) pwRelease(); },true,'ag/takim-iletisimi','uçuş, yürüyüş');
window.addEventListener('mousedown',function(e){ if(e.button===1&&(state==='play'||state==='walk')){ e.preventDefault(); pwPress('mouse'); } },true);
window.addEventListener('mouseup',function(e){ if(e.button===1) pwRelease(); },true);
window.addEventListener('mousemove',function(e){ if(!PW.open||PW.src!=='mouse') return; PW.mx+=e.movementX||0; PW.my+=e.movementY||0; pwPoint(PW.mx,PW.my); });
/* touch button */
(function(){ const b=document.createElement('button'); b.id='tPing'; b.type='button'; b.className='tping hidden'; b.textContent='📍'; b.setAttribute('aria-label','İşaret'); document.body.appendChild(b);
  b.addEventListener('pointerdown',function(e){ e.preventDefault(); e.stopPropagation(); pwPress('touch'); });
  b.addEventListener('pointerup',function(e){ e.preventDefault(); e.stopPropagation(); if(PW.hold){ pwRelease(); } });
  b.addEventListener('pointercancel',function(){ if(PW.hold){ clearTimeout(PW.hold); PW.hold=null; } }); })();
updateTouchUI=HOOK.wrap('updateTouchUI','ag/takim-iletisimi#_pgTouch',function(_pgTouch){ return function(){ _pgTouch(); const b=$('tPing'); if(!b) return; const on=(state==='play'||state==='walk')&&((typeof TOUCH!=='undefined'&&TOUCH.vis)||(typeof WALK!=='undefined'&&WALK.tvis)); b.classList.toggle('hidden',!on); }; },updateTouchUI);
/* ---- HUD: icons with distance; who is talking */
const pgV=new THREE.Vector3();
function pingHUD(){ if(state!=='play'&&state!=='walk') return; const s=clamp(Math.min(HW,HH)/760,0.7,1.5), me=state==='play'?S.pos:camera.position; hx.save(); hx.textAlign='center'; hx.textBaseline='middle';
  PINGS.forEach(function(P){ const K=pingKind(P.k); pgV.copy(P.pos); pgV.y+=6; pgV.project(camera); const behind=pgV.z>1; let x=(pgV.x*0.5+0.5)*HW, y=(-pgV.y*0.5+0.5)*HH;
    const edge=behind||x<20||x>HW-20||y<20||y>HH-20; if(behind){ x=HW-x; y=HH-y; } x=clamp(x,30*s,HW-30*s); y=clamp(y,40*s,HH-40*s);
    const a=Math.min(1,P.t/2); hx.globalAlpha=a; hx.fillStyle='rgba(0,0,0,.55)'; hx.beginPath(); hx.arc(x,y,15*s,0,6.3); hx.fill(); hx.lineWidth=2.5*s; hx.strokeStyle=K[3]; hx.stroke();
    hx.font=Math.round(15*s)+'px system-ui,sans-serif'; hx.fillStyle='#fff'; hx.fillText(K[2],x,y+1);
    const d=me.distanceTo(P.pos); hx.font='700 '+Math.round(11*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle=K[3]; hx.shadowColor='rgba(0,0,0,.8)'; hx.shadowBlur=3;
    hx.fillText((d>=1000?(d/1000).toFixed(1).replace('.',',')+' km':Math.round(d)+' m')+(edge?' ◂':''),x,y+25*s); if(!P.mine){ hx.font=Math.round(10*s)+'px system-ui,sans-serif'; hx.fillStyle='#dfe9f1'; hx.fillText(P.name,x,y-24*s); } hx.shadowBlur=0; });
  hx.globalAlpha=1; const tk=Object.keys(TALK); if(tk.length){ hx.textAlign='left'; hx.font='700 '+Math.round(12*s)+'px system-ui,sans-serif'; tk.forEach(function(k,i){ const y=Math.round(150*s)+i*20*s; hx.fillStyle='rgba(0,0,0,.5)'; hx.fillRect(12*s,y-9*s,150*s,18*s); hx.fillStyle='#7dffb0'; hx.fillText('🎙 '+TALK[k].n,18*s,y); }); }
  hx.restore(); }
drawHUD=HOOK.wrap('drawHUD','ag/takim-iletisimi#_pgHUD',function(_pgHUD){ return function(){ _pgHUD(); try{ hx.setTransform(DPR,0,0,DPR,0,0); pingHUD(); }catch(e){} }; },drawHUD);
cullStep=HOOK.wrap('cullStep','ag/takim-iletisimi#_pgCull',function(_pgCull){ return function(dt){ _pgCull(dt); pingStep(dt||0); }; },cullStep);
/* map and mini-map */
drawMap=HOOK.wrap('drawMap','ag/takim-iletisimi#_pgMap',function(_pgMap){ return function(x,W,H,mini){ _pgMap(x,W,H,mini); if(!PINGS.length) return; x.save(); x.textAlign='center'; x.textBaseline='middle';
  PINGS.forEach(function(P){ const K=pingKind(P.k), p=mapToScreen(P.pos.x,P.pos.z,W,H); x.fillStyle=K[3]; x.beginPath(); x.arc(p[0],p[1],mini?4:9,0,6.3); x.fill(); if(!mini){ x.font='13px system-ui,sans-serif'; x.fillStyle='#fff'; x.fillText(K[2],p[0],p[1]-16); } }); x.restore(); }; },drawMap);
(function(){ const cv=$('mapCv'); if(!cv) return; let lp=null;
  const drop=function(cx,cy){ const r=cv.getBoundingClientRect(), w=mapToWorld(cx-r.left,cy-r.top,r.width,r.height); pingPlace('git',new THREE.Vector3(w[0],Math.max(0,groundH(w[0],w[1])),w[1])); try{ mapDraw(); }catch(e){} toast('➜ Haritaya "Buraya git" işareti kondu','#39e6ff'); };
  cv.addEventListener('contextmenu',function(e){ e.preventDefault(); if(MAPV.pick) return; drop(e.clientX,e.clientY); });
  cv.addEventListener('pointerdown',function(e){ if(e.pointerType!=='touch'||MAPV.pick) return; const sx=e.clientX, sy=e.clientY; lp=setTimeout(function(){ lp=null; drop(sx,sy); },650); cv._lps=[sx,sy]; });
  cv.addEventListener('pointermove',function(e){ if(lp&&cv._lps&&Math.hypot(e.clientX-cv._lps[0],e.clientY-cv._lps[1])>8){ clearTimeout(lp); lp=null; } });
  ['pointerup','pointercancel'].forEach(function(ev){ cv.addEventListener(ev,function(){ if(lp){ clearTimeout(lp); lp=null; } }); }); })();
/* ---- network */
netHandle=HOOK.wrap('netHandle','ag/takim-iletisimi#_pgNet',function(_pgNet){ return function(msg,from){
  if(msg.t==='ping'){ if(NET.host&&from&&from!==NET.myId) netBroadcast(msg,from); if(msg.by===NET.myId) return; const mt=pingTeam(); if(mt&&msg.team&&msg.team!==mt) return; pingIn(msg,false); return; }
  if(msg.t==='talk'){ if(NET.host&&from&&from!==NET.myId) netBroadcast(msg,from); if(msg.by===NET.myId) return; if(msg.on) TALK[msg.by]={n:String(msg.name||'Pilot').slice(0,16),t:30}; else delete TALK[msg.by]; return; }
  return _pgNet(msg,from); }; },netHandle);
voicePTT=HOOK.wrap('voicePTT','ag/takim-iletisimi#_pgPTT',function(_pgPTT){ return function(on){ const was=VOICE.talk; _pgPTT(on); if(VOICE.talk!==was&&NET.on){ const m={t:'talk',on:!!VOICE.talk,by:NET.myId,name:NET.name||callsign()}; if(NET.host) netBroadcast(m); else netSend(NET.hconn,m); if(VOICE.talk) TALK[NET.myId]={n:'Sen',t:30}; else delete TALK[NET.myId]; } }; },voicePTT);
/* bindings restored from a cloud save made before V2.00 lack the new action */
function pingBindFix(){ CTRL_ORDER.forEach(function(s){ CTRL_DEF[s].acts.forEach(function(a){ if(CTRL.kb[s]&&!CTRL.kb[s][a[0]]) CTRL.kb[s][a[0]]=a[2].slice(); if(CTRL.pad[s]&&!CTRL.pad[s][a[0]]) CTRL.pad[s][a[0]]=a[3].slice(); }); }); }
accApply=HOOK.wrap('accApply','ag/takim-iletisimi#_pgApply',function(_pgApply){ return function(d){ _pgApply(d); try{ pingBindFix(); renderCtlHelp(); }catch(e){} }; },accApply);
