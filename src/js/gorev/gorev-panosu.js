/* ------------------------------------------------------------------ mission board, briefing, objective HUD, mission log, end report (V1.76)
   One board for aircraft and helicopter missions with category / difficulty / duration filters and reward sort.
   The briefing shows a map of the area, objectives, threats and the suggested loadout (one tap applies it).
   In flight: objective line under the compass, mission log (F2 or Pause → Görev günlüğü), end report with 1–3 stars. */
const BCAT={serbest:'Serbest',egitim:'Eğitim',hava:'Hava-hava',taarruz:'Taarruz',kesif:'Keşif',heli:'Helikopter'};
const BMETA={
  free:{cat:'serbest',diff:1,dur:0,xp:0,obj:['Halkalardan geç','Havadaki ve yerdeki hedefleri vur (isteğe bağlı)'],thr:['Hava savunması ve düşman uçakları ayarlara bağlı'],load:null,area:[0,0,10000]},
  rings:{cat:'egitim',diff:1,dur:5,xp:150,obj:['13 halkadan sırayla geç','Süren rekor olarak kaydedilir'],thr:['Tehdit yok'],load:'clr',area:[0,-2000,7000]},
  air:{cat:'hava',diff:2,dur:7,xp:220,obj:['Havadaki 8 hedefin hepsini vur'],thr:['Hedefler kaçış manevrası yapar'],load:'aa',area:[0,0,9000]},
  dogfight:{cat:'hava',diff:3,dur:8,xp:320,obj:['Kırmızı kuvvetin 3 dalga savaş uçağını düşür'],thr:['Düşman savaş uçakları füze atar','Flare ile füzeden kaç'],load:'aa',area:[0,0,9000]},
  strike:{cat:'taarruz',diff:2,dur:10,xp:260,obj:['Radar, depo, sığınak, SAM ve konvoyu imha et'],thr:['SAM bataryaları (radar uyarısı)','Kızıl Bölge hava savunması'],load:'ag',area:[-9600,9600,6000]},
  recon:{cat:'kesif',diff:2,dur:9,xp:230,obj:['5 keşif noktasının üstünde 4 saniye kal'],thr:['Noktalar adanın her yerine dağılır — yakıtını izle'],load:'rec',area:[0,0,11000]}};
function bMeta(e){ return e.kind==='heli'?{cat:'heli',diff:e.M.id==='h_poligon'||e.M.id==='h_asker'?1:2,dur:Math.round(e.M.lim/60),xp:e.M.xp,obj:e.M.obj.map(function(o){ return o.n; }),thr:e.M.id==='h_konvoy'?['Hareketli hedefler']:e.M.id==='h_yuk'?['Dağ rüzgârı, yük salınımı']:['Tehdit yok'],load:null,area:e.M.obj.reduce(function(a,o){ return o.x!=null?[o.x,o.z,3500]:a; },[e.M.spot[0],e.M.spot[1],3500])}:BMETA[e.id]; }
function boardAll(){ const L=MORDER.map(function(id){ return {id:id,kind:'air',name:MISSIONS[id].name,desc:MISSIONS[id].desc}; });
  if(typeof HMIS!=='undefined') HMIS.forEach(function(M){ L.push({id:M.id,kind:'heli',name:M.n,desc:M.d,M:M}); }); return L; }
const BF={cat:'all',diff:0,dur:'all',sort:'def'}; try{ Object.assign(BF,JSON.parse(localStorage.getItem('ayy-bf')||'{}')); }catch(e){}
function boardList(){ let L=boardAll().filter(function(e){ const m=bMeta(e); if(BF.cat!=='all'&&m.cat!==BF.cat) return false; if(BF.diff&&m.diff!==BF.diff) return false; if(BF.dur==='short'&&!(m.dur>0&&m.dur<=7)) return false; if(BF.dur==='long'&&!(m.dur===0||m.dur>7)) return false; return true; });
  if(BF.sort==='xp') L=L.slice().sort(function(a,b){ return bMeta(b).xp-bMeta(a).xp; }); return L; }
function misCount(){ return Math.max(1,boardList().length); }
function bStars(id){ try{ return (JSON.parse(localStorage.getItem('ayy-stars')||'{}')[id])||0; }catch(e){ return 0; } }
function bSetStars(id,n){ try{ const o=JSON.parse(localStorage.getItem('ayy-stars')||'{}'); if(n>(o[id]||0)){ o[id]=n; localStorage.setItem('ayy-stars',JSON.stringify(o)); } }catch(e){} }
function starsHTML(n,max){ let s=''; for(let i=0;i<(max||3);i++) s+='<i class="'+(i<n?'on':'')+'">★</i>'; return '<span class="stars">'+s+'</span>'; }
const BVEH={v:'plane'};
/* ---- render */
renderMissions=function(){
  const L=boardList(), r=rec(selectedId); if(misSel>=L.length) misSel=Math.max(0,L.length-1);
  const seg=function(k,opts){ return '<div class="bseg" data-k="'+k+'">'+opts.map(function(o){ return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(String(BF[k])===String(o[0]))+'">'+o[1]+'</button>'; }).join('')+'</div>'; };
  const f=$('misFilt'); if(f) f.innerHTML=seg('cat',[['all','Tümü'],['egitim','Eğitim'],['hava','Hava'],['taarruz','Taarruz'],['kesif','Keşif'],['heli','Helikopter']])+seg('diff',[[0,'Her zorluk'],[1,'Kolay'],[2,'Orta'],[3,'Zor']])+seg('dur',[['all','Her süre'],['short','≤ 7 dk'],['long','Uzun']])+seg('sort',[['def','Sıra'],['xp','Ödül ↓']]);
  $('misList').innerHTML=L.length?L.map(function(e,i){ const m=bMeta(e), best=e.kind==='air'?((e.id==='rings'||e.id==='free')?r.best:(r.mt||{})[e.id]):null;
    return '<li><button type="button" class="mitem'+(i===misSel?' kf':'')+'" data-i="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span><em class="bt">'+e.name.toLocaleUpperCase('tr-TR')+'<small class="bc">'+BCAT[m.cat]+' · '+['','Kolay','Orta','Zor'][m.diff]+(m.dur?' · '+m.dur+' dk':'')+(m.xp?' · '+m.xp+' XP':'')+'</small></em>'+(e.id==='free'?'':starsHTML(bStars(e.id)))+'</button></li>'; }).join(''):'<li class="bempty">Bu filtrelere uyan görev yok</li>';
  const e=L[misSel]; if(!e){ $('misName').textContent='—'; $('misDesc').textContent=''; $('misChips').innerHTML=''; if($('misBrief')) $('misBrief').innerHTML=''; return; }
  const m=bMeta(e), c=aiCfg();
  $('misK').textContent=BCAT[m.cat].toLocaleUpperCase('tr-TR')+' · '+['','KOLAY','ORTA','ZOR'][m.diff]+(m.dur?' · '+m.dur+' DK':' · SÜRESİZ')+(m.xp?' · '+m.xp+' XP':'');
  $('misName').textContent=e.name; $('misDesc').textContent=e.desc;
  const ch=[]; if(e.kind==='air'){ if(e.id==='dogfight') ch.push('<span><b>3</b> dalga</span>'); else if(c.enemies) ch.push('<span><b>'+c.enemies+'</b> düşman uçağı</span>'); ch.push('<span>Kanat adamı: '+(c.wing?'açık':'kapalı')+'</span>','<span>Zorluk: '+SKILL[c.skill].name+'</span>'); }
  else if(e.kind==='heli') ch.push('<span>'+HELI_DEF[e.M.heli].name+'</span>'); if(e.id!=='free') ch.push('<span>'+starsHTML(bStars(e.id))+'</span>');
  $('misChips').innerHTML=ch.join('');
  const P=m.load?LPRESETS.find(function(p){ return p.id===m.load; }):null, canLoad=P&&(SLOTS[selectedId]||0)>0&&P.f(selectedId);
  let veh=''; if(e.id==='free') veh='<div class="bveh"><b>Araç</b><div class="bseg" data-k="veh">'+[['plane','Uçak: '+AIRCRAFT[selectedId].short],['t129','T129 ATAK'],['t625','T625 GÖKBEY']].map(function(o){ return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(BVEH.v===o[0])+'">'+o[1]+'</button>'; }).join('')+'</div></div>';
  if($('misBrief')) $('misBrief').innerHTML='<canvas id="misMap" class="bmap"></canvas><div class="bcols"><div><b>Hedefler</b><ul>'+m.obj.map(function(t){ return '<li>'+t+'</li>'; }).join('')+'</ul></div><div><b>Tehditler</b><ul>'+m.thr.map(function(t){ return '<li>'+t+'</li>'; }).join('')+'</ul></div></div>'+
    (P?'<div class="bload"><b>Önerilen yük:</b> '+P.n+(canLoad?' <button type="button" class="btn sm" id="btnBLoad">Uygula</button>':(SLOTS[selectedId]?' <small>(bu uçak taşıyamaz)</small>':' <small>(silahsız uçak)</small>'))+'</div>':'')+veh;
  $('btnMisAc').textContent=e.kind==='heli'?HELI_DEF[e.M.heli].name:'Uçak: '+AIRCRAFT[selectedId].short; $('btnMisAc').disabled=e.kind==='heli';
  $('btnMisGo').textContent=e.kind==='heli'||(e.id==='free'&&BVEH.v!=='plane')?'▶ Helikopterle başla':'▶ Brifing tamam — başla';
  bMap(e,m);
};
function bMap(e,m){ const cv=$('misMap'); if(!cv||!cv.getContext) return; const r=cv.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1), W=Math.max(10,r.width||300), H=Math.max(10,r.height||140);
  cv.width=Math.round(W*d); cv.height=Math.round(H*d); const x=cv.getContext('2d'); if(!x||!x.setTransform) return; x.setTransform(d,0,0,d,0,0);
  const keep=[MAPV.cx,MAPV.cz,MAPV.scale]; MAPV.cx=m.area[0]; MAPV.cz=m.area[1]; MAPV.scale=Math.min(W,H)/(m.area[2]*2.2);
  try{ drawMap(x,W,H,true); const c=mapToScreen(m.area[0],m.area[1],W,H); x.strokeStyle='rgba(255,178,90,.9)'; x.setLineDash([6,4]); x.lineWidth=2; x.beginPath(); x.arc(c[0],c[1],m.area[2]*MAPV.scale*0.9,0,6.3); x.stroke(); x.setLineDash([]);
    if(e.kind==='heli'){ x.fillStyle='#ffb25a'; e.M.obj.forEach(function(o,i){ if(o.x==null) return; const p=mapToScreen(o.x,o.z,W,H); x.beginPath(); x.arc(p[0],p[1],5,0,6.3); x.fill(); x.fillStyle='#fff'; x.font='700 11px "Chakra Petch",sans-serif'; x.fillText(String(i+1),p[0]+7,p[1]+4); x.fillStyle='#ffb25a'; });
      const s=mapToScreen(e.M.spot[0],e.M.spot[1],W,H); x.fillStyle='#7dffb0'; x.fillRect(s[0]-4,s[1]-4,8,8); }
    if(e.id==='strike'){ const a=mapToScreen(KZB.x0,KZB.z0,W,H), b=mapToScreen(KZB.x1,KZB.z1,W,H); x.fillStyle='rgba(255,70,60,.18)'; x.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]); }
  }catch(err){} MAPV.cx=keep[0]; MAPV.cz=keep[1]; MAPV.scale=keep[2]; }
misGo=function(){ const e=boardList()[misSel]; if(!e) return;
  if(e.kind==='heli'){ if(typeof hmStart==='function') hmStart(e.id); return; }
  if(e.id==='free'&&BVEH.v!=='plane'){ selectMission('free'); heliFromHangar(BVEH.v); return; }
  selectMission(e.id); preFlight('missions'); };
openMissions=function(){ state='menu'; menuMode='missions'; showScreen('missionsUI'); const L=boardList(); misSel=Math.max(0,L.findIndex(function(e){ return e.id===missionId; })); renderMissions(); };
(function(){ const f=$('misFilt'); if(f) f.addEventListener('click',function(e){ const b=e.target.closest('button[data-v]'); if(!b) return; const k=b.parentNode.dataset.k, v=b.dataset.v; BF[k]=k==='diff'?+v:v; try{ localStorage.setItem('ayy-bf',JSON.stringify(BF)); }catch(err){} misSel=0; renderMissions(); });
  const br=$('misBrief'); if(br) br.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return;
    if(b.id==='btnBLoad'){ const en=boardList()[misSel], m=en&&bMeta(en), P=m&&LPRESETS.find(function(p){ return p.id===m.load; }); if(!P) return; const n=SLOTS[selectedId]||0, mix=P.mix(selectedId,n), l=loadoutOf(selectedId); WORDER.forEach(function(k){ l[k]=mix[k]||0; }); try{ localStorage.setItem('kaan-sim-loadouts',JSON.stringify(LOADOUTS)); }catch(err){} toast('Yük: '+P.n,'#7dffb0'); return; }
    if(b.dataset.v&&b.parentNode.dataset.k==='veh'){ BVEH.v=b.dataset.v; renderMissions(); } }); })();
/* ---- objective line under the compass */
function bObjective(){ if(state!=='play'||!M||M.id==='free'||M.id==='net'||M.done) return null; const lim=MISSIONS[M.id].limit, rem=lim?Math.max(0,lim-M.t):null; let txt='', tgt=null;
  if(M.id==='rings'){ txt='Halka '+Math.min(ringIdx+1,rings.length)+'/'+rings.length; if(rings[ringIdx]) tgt=rings[ringIdx].pos; }
  else if(M.id==='strike'){ const L=gtargets.filter(function(o){ return o.alive; }); txt=(gtargets.length-L.length)+'/'+gtargets.length+' yer hedefi'; tgt=bNearest(L.map(function(o){ return o.pos; })); }
  else if(M.id==='air'){ const L=targets.filter(function(o){ return o.alive; }); txt=(targets.length-L.length)+'/'+targets.length+' hava hedefi'; tgt=bNearest(L.map(function(o){ return o.pos; })); }
  else if(M.id==='recon'){ txt='Keşif '+M.scanIdx+'/'+reconPts.length+(M.scanT>0?' · TARANIYOR %'+Math.round(M.scanT/4*100):''); const p=reconPts[M.scanIdx]; if(p) tgt=p.pos; }
  else if(M.id==='dogfight'){ const L=(typeof ACT!=='undefined'?ACT:[]).filter(function(a){ return a.alive&&a.team==='red'; }); txt=L.length+' düşman uçağı'; tgt=bNearest(L.map(function(a){ return a.pos; })); }
  return {name:MISSIONS[M.id].name,txt:txt,rem:rem,tgt:tgt}; }
function bNearest(L){ let b=null, bd=1e12; L.forEach(function(p){ const d=(p.x-S.pos.x)*(p.x-S.pos.x)+(p.z-S.pos.z)*(p.z-S.pos.z); if(d<bd){ bd=d; b=p; } }); return b; }
drawHUD=HOOK.wrap('drawHUD','gorev/gorev-panosu#_bHUD',function(_bHUD){ return function(){ _bHUD(); if(state!=='play'||(typeof EJ!=='undefined'&&EJ.on)) return; const o=bObjective(); if(!o) return;
  const s=clamp(Math.min(HW,HH)/760,0.7,1.5); hx.save(); hx.textAlign='center'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,.7)'; hx.shadowBlur=4; hx.font='700 '+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif';
  let line='GÖREV · '+o.name.toLocaleUpperCase('tr-TR')+' · '+o.txt; if(o.rem!=null) line+=' · '+Math.floor(o.rem/60)+':'+String(Math.floor(o.rem%60)).padStart(2,'0');
  if(o.tgt){ const d=Math.hypot(o.tgt.x-S.pos.x,o.tgt.z-S.pos.z); line+=' · '+(d>1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m'); }
  hx.fillStyle=o.rem!=null&&o.rem<60?'#ff8a5a':'#ffd27a'; hx.fillText(line,HW/2,Math.round((TOUCH.vis?104:94)*s)); hx.restore(); }; },drawHUD);
/* ---- mission log */
const MLOG=[];
toast=HOOK.wrap('toast','gorev/gorev-panosu#_bToast',function(_bToast){ return function(text,color){ _bToast(text,color); if(state==='play'&&M&&M.id!=='net'){ MLOG.push({t:M.t||0,text:String(text),c:color||'#b8ecff'}); if(MLOG.length>60) MLOG.shift(); if(BLOG.open) bLogRender(); } }; },toast);
const BLOG={open:false};
function bLogRender(){ const el=$('mlog'); if(!el) return; el.innerHTML='<h3>GÖREV GÜNLÜĞÜ · '+(M&&MISSIONS[M.id]?MISSIONS[M.id].name:'')+'</h3>'+(MLOG.length?'<ul>'+MLOG.slice(-14).reverse().map(function(l){ return '<li><time>'+fmtT(l.t).slice(0,5)+'</time><span style="color:'+l.c+'">'+l.text.replace(/</g,'&lt;')+'</span></li>'; }).join('')+'</ul>':'<p>Henüz kayıt yok</p>')+'<small>F2 ile kapat</small>'; }
function bLogToggle(on){ BLOG.open=on==null?!BLOG.open:on; const el=$('mlog'); if(!el) return; el.classList.toggle('hidden',!BLOG.open); if(BLOG.open) bLogRender(); }
window.addEventListener('keydown',function(e){ if(e.repeat) return; if(isKey(e,'gen','log')&&(state==='play'||state==='paused')){ e.preventDefault(); bLogToggle(); } });
(function(){ const b=$('btnPauseLog'); if(b) b.addEventListener('click',function(){ bLogToggle(true); }); })();
setupMission=HOOK.wrap('setupMission','gorev/gorev-panosu#_bSetup',function(_bSetup){ return function(){ MLOG.length=0; bLogToggle(false); B_STAT.shots=0; B_STAT.hp0=100; B_STAT.minHp=100; return _bSetup(); }; },setupMission);
/* ---- end report */
const B_STAT={shots:0,minHp:100};
fire=HOOK.wrap('fire','gorev/gorev-panosu#_bFire',function(_bFire){ return function(){ B_STAT.shots++; return _bFire(); }; },fire);
damagePlayer=HOOK.wrap('damagePlayer','gorev/gorev-panosu#_bDmg',function(_bDmg){ return function(d,r){ _bDmg(d,r); B_STAT.minHp=Math.min(B_STAT.minHp,S.hp); }; },damagePlayer);
function bStarsFor(ok){ if(!ok) return 0; let n=1; const lim=MISSIONS[M.id].limit, bm=BMETA[M.id]||{dur:8};
  if(lim?M.t<lim*0.6:M.t<(bm.dur||8)*60*0.6) n++; if(B_STAT.minHp>=70) n++; return Math.min(3,n); }
endMission=HOOK.wrap('endMission','gorev/gorev-panosu#_bEnd',function(_bEnd){ return function(ok,tm){ const was=M.done; const r=_bEnd.apply(this,arguments); if(was) return r;
  const st=bStarsFor(ok), bm=BMETA[M.id]||{xp:150}, xp=ok?Math.max(150,(bm.xp||150)+(st-1)*40):0;
  if(ok){ bSetStars(M.id,st); if(xp>150&&typeof careerAdd==='function') try{ careerAdd(xp-150,null); }catch(e){} }
  const el=$('mendStats'); if(el){ el.innerHTML=(ok?starsHTML(st):'')+'<ul><li><small>SÜRE</small><b>'+fmtT(tm!=null?tm:M.t)+'</b></li><li><small>PUAN</small><b>'+score+'</b></li><li><small>VURULAN</small><b>'+(kills+gtargets.filter(function(o){ return !o.alive; }).length)+'</b></li><li><small>ATIŞ</small><b>'+B_STAT.shots+'</b></li><li><small>EN DÜŞÜK CAN</small><b>%'+Math.round(B_STAT.minHp)+'</b></li><li><small>ÖDÜL</small><b>'+(ok?'+'+xp+' XP':'—')+'</b></li></ul>'+(ok?'<p class="hint">'+(st<3?(st<2?'Daha hızlı bitir ve az hasar al: ':'')+(B_STAT.minHp<70?'Hasarı %30\'un altında tut.':'Süreyi %60\'ın altında bitir.'):'Kusursuz görev!')+'</p>':''); }
  return r; }; },endMission);
/* helicopter missions get stars too */
if(typeof hmEnd==='function'){ hmEnd=HOOK.wrap('hmEnd','gorev/gorev-panosu#_bHm',function(_bHm){ return function(win,why){ const was=HM.ended; _bHm(win,why); if(was||!win) return; const st=1+(HM.t<HM.M.lim*0.5?1:0)+(HM.H&&HM.H.crashT<=0&&!(HM.crate&&HM.crate.broken)?1:0); bSetStars(HM.id,Math.min(3,st)); const s=$('hmEndS'); if(s) s.innerHTML=starsHTML(Math.min(3,st))+s.innerHTML; }; },hmEnd); }
