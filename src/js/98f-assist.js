/* ------------------------------------------------------------------ announcements, landing assist, licence fixes (V1.96)
   • Duyurular: the admin picks how long a message stays (Anlık · 10 dk · 1 saat · 1 gün · Kalıcı). Players get it within
     seconds (live channel when the database publishes it, otherwise a 20 s poll) as a banner with a close button, once.
     The duration travels at the start of the text ("⏱600|…"), so no database change is needed.
   • Uçuş yardımı (Ayarlar): Kapalı · Yardımlı (default) · Otomatik iniş.
       Yardımlı: approach guide (runway, distance, glide slope and centre-line bars, target speed), automatic flare in the last
       metres over a runway, more forgiving touchdown limits, stall protection.
       Otomatik iniş: with the gear down on final the assistant flies the glide slope, centre line and speed until touchdown;
       moving the stick takes over at once.
     UAVs always have stall protection (their flight computer does it in real life too).
   • Licences: every exam stage is remembered in the profile (cloud too); a licence is granted as soon as all its stages are
     passed, also when a stage is retried with "Tekrar" after a failure. Licences live in the profile stats so they survive
     signing in on another device. İHA exam climbs to 150 m and the instructor explains how to climb without stalling. */
/* ================= announcements ================= */
const ANN={seen:{}, list:[], cur:null, t:0, ch:null, poll:null};
try{ ANN.seen=JSON.parse(localStorage.getItem('ayy-ann-seen')||'{}')||{}; }catch(e){}
const ANN_DUR=[['f','Anlık (bir kez gösterilir)'],['600','10 dakika'],['3600','1 saat'],['86400','1 gün'],['0','Kalıcı']];
function annParse(a){ const m=/^⏱(f|\d+)\|/.exec(String(a.text||'')); const k=m?m[1]:'0', txt=m?String(a.text).slice(m[0].length):String(a.text||''), t0=new Date(a.created_at).getTime()||Date.now();
  const flash=k==='f', sec=flash?180:+k, exp=sec>0?t0+sec*1000:Infinity; return {id:a.id, text:txt, flash:flash, sec:sec, t0:t0, exp:exp, active:a.active!==false}; }
function annLabel(o){ if(o.flash) return 'Anlık'; if(!o.sec) return 'Kalıcı'; const r=o.exp-Date.now(); if(r<=0) return 'Süresi doldu'; return r>3600e3?Math.round(r/3600e3)+' sa kaldı':Math.max(1,Math.round(r/60e3))+' dk kaldı'; }
function annSeen(id){ ANN.seen[id]=Date.now(); try{ const k=Object.keys(ANN.seen); if(k.length>60) k.slice(0,k.length-60).forEach(function(x){ delete ANN.seen[x]; }); localStorage.setItem('ayy-ann-seen',JSON.stringify(ANN.seen)); }catch(e){} }
function annBar(){ let el=$('annBar'); if(el) return el; el=document.createElement('div'); el.id='annBar'; el.className='annbar hidden'; el.setAttribute('role','status');
  el.innerHTML='<b>📢 DUYURU</b><span id="annTxt"></span><button type="button" aria-label="Kapat" id="annX">✕</button>'; document.body.appendChild(el);
  el.querySelector('#annX').addEventListener('click',function(){ annHide(); }); return el; }
function annShow(o){ const el=annBar(); el.querySelector('#annTxt').textContent=o.text; el.classList.remove('hidden'); ANN.cur=o; ANN.t=o.flash?15:Math.min(25,Math.max(10,o.sec||25)); annSeen(o.id); try{ sndPlay('ui_ok'); }catch(e){} }
function annHide(){ const el=$('annBar'); if(el) el.classList.add('hidden'); ANN.cur=null; }
function annApply(rows){ const now=Date.now(); ANN.list=(rows||[]).map(annParse).filter(function(o){ return o.active&&o.exp>now; });
  const menu=ANN.list.find(function(o){ return !o.flash; }), el=$('cNews');
  if(el){ if(menu){ el.innerHTML='<b>DUYURU</b> '+menu.text.replace(/</g,'&lt;'); el.classList.remove('hidden'); } else el.classList.add('hidden'); }
  if(!ANN.cur){ const nw=ANN.list.slice().reverse().find(function(o){ return !ANN.seen[o.id]; }); if(nw) annShow(nw); } }
accAnnouncements=function(){ if(!ACC.sb) return; ACC.sb.from('announcements').select('id,text,created_at,active').eq('active',true).order('created_at',{ascending:false}).limit(10).then(function(r){ if(!r||r.error) return; annApply(r.data); });
  if(!ANN.poll) ANN.poll=setInterval(function(){ if(document.hidden===true) return; accAnnouncements(); },20000);
  if(!ANN.ch&&ACC.sb.channel){ try{ ANN.ch=ACC.sb.channel('duyurular').on('postgres_changes',{event:'*',schema:'public',table:'announcements'},function(){ accAnnouncements(); }).subscribe(); }catch(e){ ANN.ch=1; } } };
function annStep(dt){ if(!ANN.cur) return; ANN.t-=dt; if(ANN.t<=0) annHide(); }
/* admin: duration picker and labels */
(function(){ const go=$('admNewsGo'); if(!go||!go.parentNode) return;
  const sel=document.createElement('select'); sel.id='admNewsDur'; sel.className='inp'; sel.innerHTML=ANN_DUR.map(function(d){ return '<option value="'+d[0]+'">'+d[1]+'</option>'; }).join(''); sel.value='3600'; go.parentNode.insertBefore(sel,go);
  const nb=go.cloneNode(true); go.parentNode.replaceChild(nb,go);
  nb.addEventListener('click',function(){ const t=($('admNewsTxt').value||'').trim().slice(0,230); if(!t||!ACC.sb||!ACC.user) return; const d=sel.value, full='⏱'+d+'|'+t;
    ACC.sb.from('announcements').insert({text:full,active:true,created_by:ACC.user.id}).then(function(x){ if(x.error) admMsg(x.error.message,true); else { $('admNewsTxt').value=''; admMsg('Duyuru yayınlandı: '+ANN_DUR.find(function(q){ return q[0]===d; })[1]); admLog('news',null,{text:t,dur:d}); admLoad('news'); accAnnouncements(); } }); }); })();
admLoad=HOOK.wrap('admLoad','98f-assist#_annLoad',function(_annLoad){ return function(t){ if(t!=='news'||!(ACC.sb&&ACC.user)) return _annLoad(t); $('admNoCloud').classList.add('hidden');
  return ACC.sb.from('announcements').select('*').order('created_at',{ascending:false}).limit(20).then(function(r){ $('admNews').innerHTML=(r.data||[]).map(function(a){ const o=annParse(a), live=a.active&&o.exp>Date.now();
    return '<li data-id="'+a.id+'"'+(a.active?'':' class="off"')+'><span>'+o.text.replace(/</g,'&lt;')+'</span><small>'+new Date(a.created_at).toLocaleString('tr-TR')+' · '+(a.active?annLabel(o):'Kaldırıldı')+(live?' · <b class="ok">yayında</b>':'')+'</small><button type="button" class="btn sm" data-k="toggle">'+(a.active?'Kaldır':'Yeniden yayınla')+'</button></li>'; }).join('')||'<li>Duyuru yok</li>'; }); }; },admLoad);
/* ================= mission log close button ================= */
bLogRender=HOOK.wrap('bLogRender','98f-assist#_mlR',function(_mlR){ return function(){ _mlR(); const el=$('mlog'); if(!el) return; const h=el.querySelector('h3'); if(h&&!h.querySelector('.mlogx')) h.insertAdjacentHTML('beforeend','<button type="button" class="mlogx" aria-label="Kapat">✕</button>'); const sm=el.querySelector('small'); if(sm) sm.textContent='F2 ya da ✕ ile kapat'; }; },bLogRender);
(function(){ const el=$('mlog'); if(el) el.addEventListener('click',function(e){ if(e.target.closest('.mlogx')) bLogToggle(false); }); })();
/* ================= flight assist and landing ================= */
function assistMode(){ const a=SETTINGS.assist; return a==null?'help':a; }
const RWYS=[{n:'36',aimZ:830,thrZ:1250,dir:-1},{n:'18',aimZ:-830,thrZ:-1250,dir:1}];
const LND={on:false, auto:false, rw:null, D:0, x:0, dev:0, vapp:0, flare:false};
function lndVapp(){ const c=CUR; return Math.max(c.stall[1]*1.3, Math.min(c.landV*0.8, c.airV*0.7)); }
function lndGeom(){ if(state!=='play'||S.onGround||S.crashed) return null; const hd=fwdOf(S.q,lndGeom.v||(lndGeom.v=new THREE.Vector3()));
  let best=null; RWYS.forEach(function(R){ const D=(S.pos.z-R.aimZ)*(-R.dir); if(D<-400||D>12000) return; const al=hd.z*R.dir; if(al<0.55) return; if(Math.abs(S.pos.x)>D*0.35+400) return; if(!best||D<best.D) best={R:R,D:D,al:al}; });
  return best; }
function lndStep(){ const ui=$('lndUI'), m=assistMode(); LND.on=false; LND.auto=false; const now=performance.now(); if(state==='play'&&S.onGround) LND.lastGround=now;
  const g=m!=='off'?lndGeom():null;
  if(g&&(S.gear||(g.D<5000&&S.speed<CUR.landV*1.2&&S.pos.y-AIRFIELD_Y<600))&&S.pos.y-AIRFIELD_Y<1500&&!(LND.lastGround&&now-LND.lastGround<20000)){   /* not right after take-off */ LND.on=true; LND.rw=g.R; LND.D=g.D; LND.x=S.pos.x;
    const ht=AIRFIELD_Y+CUR.gearOff+Math.tan(3*Math.PI/180)*Math.max(0,g.D); LND.dev=S.pos.y-ht; LND.vapp=lndVapp(); }
  if(!ui) return; ui.classList.toggle('hidden',!LND.on); if(!LND.on) return;
  const gs=clamp(LND.dev/Math.max(15,LND.D*0.02),-1,1), lat=clamp(LND.x/Math.max(20,LND.D*0.05),-1,1);
  ui.querySelector('.lgs i').style.top=(50-gs*42)+'%'; ui.querySelector('.llat i').style.left=(50-lat*42)+'%';
  const kmh=Math.round(S.speed*3.6), tv=Math.round(LND.vapp*3.6), sk=Math.max(0,-S.vy);
  ui.querySelector('.lhd').textContent='PİST '+LND.rw.n+' · '+(LND.D>950?(LND.D/1000).toFixed(1).replace('.',',')+' km':Math.max(0,Math.round(LND.D))+' m');
  const tip=!S.gear?'İniş takımını indir (G)':Math.abs(gs)>0.45?(gs>0?'Yüksektesin — burnu hafif indir':'Alçaktasın — burnu hafif kaldır'):Math.abs(lat)>0.45?(lat>0?'Pist solunda — sola dön':'Pist sağında — sağa dön'):(kmh>tv+40?'Çok hızlısın — gazı azalt':kmh<tv-30?'Yavaşsın — gazı artır':'Süzülüşün iyi');
  ui.querySelector('.ltip').textContent=tip; ui.querySelector('.lsp').innerHTML='Hız <b class="'+(Math.abs(kmh-tv)<35?'ok':'bad')+'">'+kmh+'</b> / '+tv+' km/s · Alçalma <b class="'+(sk<=CUR.sinkMax*0.7?'ok':'bad')+'">'+sk.toFixed(1)+'</b> m/s';
  ui.classList.toggle('auto',m==='auto'&&S.gear); }
/* controller: adds stick input to fly the glide slope / flare; returns true when the assistant is flying */
const LNDC={pi:0};
function lndControl(raw){ const m=assistMode(); if(m==='off'||!LND.on||!S.gear) return null;
  const agl=S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z)), overRw=Math.abs(S.pos.x)<45&&Math.abs(S.pos.z)<1260;
  const flare=overRw&&agl<CUR.gearOff+14&&S.vy<-0.3; const full=m==='auto'&&LND.D>-300&&Math.abs(raw.p)<0.15&&Math.abs(raw.r)<0.15;
  if(!full&&!flare) return null;
  vR.set(1,0,0).applyQuaternion(S.q); vU.set(0,1,0).applyQuaternion(S.q); const hd=fwdOf(S.q,lndControl.v||(lndControl.v=new THREE.Vector3()));
  const bank=Math.atan2(-vR.y,vU.y), gam=Math.asin(clamp((S.speed*hd.y-S.sink)/Math.max(1,S.speed),-1,1));
  let gamDes, bankDes=0, out={p:0,r:0,y:0,thr:null};
  if(flare){ gamDes=-clamp(CUR.sinkMax*0.35,0.8,3)/Math.max(10,S.speed); bankDes=0; }
  else { const D=Math.max(60,LND.D); gamDes=-3*Math.PI/180-clamp(LND.dev/D*1.2,-0.05,0.05);
    const R=LND.rw, vxDes=clamp(-LND.x*0.04,-0.12,0.12), trk=Math.atan2(hd.x,hd.z*R.dir), trkDes=Math.asin(vxDes); bankDes=0; out.y=clamp((trkDes-trk)*(-R.dir)*8,-1,1);   /* heading by rudder, wings level (bank alone does not turn in this flight model) */
    out.thr=clamp(0.35+(LND.vapp-S.speed)*0.06,0.05,1); }
  out.p=clamp((gamDes-gam)*9-(S.pitchIn||0)*0.1,-0.6,0.6); out.r=clamp((bankDes-bank)*2.5,-0.7,0.7);
  if(flare){ out.r=clamp(-bank*2.5,-0.6,0.6); out.thr=0; }
  LND.auto=full; return out; }
/* stall protection */
function stallGuard(up){ const sp=S.speed, ref=CUR.uav?(CUR.stall[0]+CUR.stall[1])/2:CUR.stall[0]*1.1; if(S.onGround||up<=0) return up; const k=clamp((sp-ref)/(ref*0.3),0,1); return up*k-(sp<ref?0.25:0); }
pollPad=HOOK.wrap('pollPad','98f-assist#_asPoll',function(_asPoll){ return function(){ _asPoll(); if(state!=='play'||typeof S==='undefined'||S.crashed) return;
  let kbP=0, kbR=0; try{ kbP=kb('air','noseUp')-kb('air','noseDown'); kbR=kb('air','rollR')-kb('air','rollL'); }catch(e){}
  const raw={p:clamp(kbP+(PAD.pitch||0)+((typeof TOUCH!=='undefined'&&TOUCH.pitch)||0),-1,1), r:clamp(kbR+(PAD.roll||0)+((typeof TOUCH!=='undefined'&&TOUCH.roll)||0),-1,1)};
  const sg=sign0(invertY), up=raw.p*sg;
  const c=lndControl(raw); if(c){ PAD.pitch=(PAD.pitch||0)+c.p*sg; PAD.roll=(PAD.roll||0)+c.r; PAD.yaw=(PAD.yaw||0)+(c.y||0); if(c.thr!=null&&LND.auto) S.throttle=c.thr; else if(c.thr===0) S.throttle=Math.min(S.throttle,0.1); return; }
  if((CUR.uav||assistMode()!=='off')&&up>0){ const lim=stallGuard(up); PAD.pitch=(PAD.pitch||0)+(lim-up)*sg; } }; },pollPad);
function sign0(inv){ return inv?-1:1; }
/* forgiving touchdown */
landK=function(){ return assistMode()==='off'?1:1.5; };
/* ================= licences ================= */
licProfile=function(){ const p=accProfile(); const st=p.stats||(p.stats={}); const m=Object.assign({},st.lic2||{},p.lic2||{}); p.lic2=m; return p; };
licGrant=function(k){ const p=licProfile(), o=Object.assign({},p.lic2); o[k]=o[k]||Date.now(); accSetProfile({lic2:o, stats:Object.assign({},p.stats,{lic2:o})}); };
function licStepKey(st){ return st.les?'l:'+st.les:'r:'+st.race; }
function licProg(){ const p=licProfile(); return (p.stats&&p.stats.licp)||{}; }
function licStepDone(key){ const p=licProfile(), pr=Object.assign({},licProg()); let granted=null;
  LIC2_ORDER.forEach(function(k){ const L=LIC2[k], keys=L.steps.map(licStepKey); if(keys.indexOf(key)<0) return; const a=(pr[k]||[]).slice(); if(a.indexOf(key)<0) a.push(key); pr[k]=a;
    if(!p.lic2[k]&&keys.every(function(x){ return a.indexOf(x)>=0; })&&(!L.need||p.lic2[L.need])) granted=granted||k; });
  accSetProfile({stats:Object.assign({},licProfile().stats,{licp:pr})});
  if(granted&&!(EXAM.on&&EXAM.id===granted)){ licGrant(granted); const L=LIC2[granted]; try{ careerAdd(L.xp,null,L.n); }catch(e){} setTimeout(function(){ toast('🎖 '+L.n+' aldın! Yeni araçlar açıldı.','#ffd27a'); },1400); } }
schEnd=HOOK.wrap('schEnd','98f-assist#_lfSch',function(_lfSch){ return function(ok,why){ const L=SCH.cur; _lfSch(ok,why); if(ok&&L) try{ licStepDone('l:'+L.id); }catch(e){} }; },schEnd);
raceFinish=HOOK.wrap('raceFinish','98f-assist#_lfRace',function(_lfRace){ return function(){ const R=RACE.def, t=RACE.t; _lfRace(); if(R&&(!R.lim||t<=R.lim)) try{ licStepDone('r:'+R.id); }catch(e){} }; },raceFinish);
examStart=HOOK.wrap('examStart','98f-assist#_lfStart',function(_lfStart){ return function(k){ _lfStart(k); if(!EXAM.on||EXAM.id!==k) return; const L=LIC2[k], a=licProg()[k]||[]; if(licProfile().lic2[k]) return;
  const i=L.steps.findIndex(function(s){ return a.indexOf(licStepKey(s))<0; }); if(i>0&&i!==EXAM.i){ EXAM.i=i; schStop(); toast('Önceki aşamaları geçmiştin — aşama '+(i+1)+'den devam','#b8ecff'); setTimeout(function(){ if(EXAM.on) examStep(); },400); } }; },examStart);
licOpen=HOOK.wrap('licOpen','98f-assist#_lfOpen',function(_lfOpen){ return function(hi){ _lfOpen(hi); const pr=licProg(), have=licProfile().lic2;
  Array.prototype.forEach.call(document.querySelectorAll('#licList .lic'),function(div,ix){ const k=LIC2_ORDER[ix], L=LIC2[k]; if(!L||have[k]||L.steps.length<2) return; const n=(pr[k]||[]).length; if(!n) return;
    const s=div.querySelector('.lt'); if(s) s.insertAdjacentHTML('beforeend','<small class="lp">Aşama '+Math.min(n,L.steps.length)+' / '+L.steps.length+' geçildi</small>'); }); }; },licOpen);
/* İHA exam: realistic climb */
(function(){ const L=LESSONS.find(function(x){ return x.id==='x_iha_kalkis'; }); if(!L) return;
  L.d='TB2 ile pist başından kalk ve 150 metreye tırman. İHA yavaştır: burnu az kaldır, hızı 110 km/s üstünde tut.';
  L.steps=L.steps.map(function(s){ return /300/.test(s.t)?{t:'Hızını koruyarak 150 metreye tırman',ok:function(){ return agl()>150; }}:s; });
  LIC2.iha.d='TB2 ile kalkış (150 m) ve iniş sınavı. Uçuş bilgisayarı stolü önler.'; })();
/* settings UI + per-frame hooks */
(function(){ const a=$('setAssist'); if(a) a.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.assist=b.dataset.a; saveSettings(); syncSettingsUI(); }); })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','98f-assist#_asSync',function(_asSync){ return function(){ _asSync(); const a=$('setAssist'); if(a) Array.prototype.forEach.call(a.children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.a===assistMode())); }); }; },syncSettingsUI);
cullStep=HOOK.wrap('cullStep','98f-assist#_asCull',function(_asCull){ return function(dt){ _asCull(dt); try{ lndStep(); }catch(e){} annStep(dt||0); }; },cullStep);
