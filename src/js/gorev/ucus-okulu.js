/* ------------------------------------------------------------------ flight school (V1.78)
   Eight lessons with step-by-step checks and an instructor on the radio: take-off, circuit, landing, crosswind landing
   (Hürkuş), hover and sling load (T625), weapons (Hürjet), landing on a ship (T625). Finishing lessons earns
   licences (pilot, helicopter, weapons) which are medals in the career. Lessons are on the board (category Okul)
   and in the main menu (Uçuş Okulu). */
if(typeof RADIO_WHO!=='undefined') RADIO_WHO.egitmen={n:'Eğitmen',p:1.0,r:1.0,c:'#7dffb0'};
MISSIONS.school={name:'Uçuş okulu',desc:'',limit:0};
BCAT.okul='Uçuş okulu';
const SCH={on:false, cur:null, i:0, t:0, hold:0, ref:0, entered:-1, mark:null};
const agl=function(){ return S.pos.y-Math.max(0,terrainH(S.pos.x,S.pos.z)); };
const hAgl=function(H){ return H.y-heliFloor(H).y; };
function hdgOf(){ fwdOf(S.q,vF); return Math.atan2(vF.x,-vF.z); }
function sQ(h){ S.q.setFromAxisAngle(UP,-h); }   /* h: 0 north, +π/2 east */
const LESSONS=[
  {id:'kalkis',n:'Kalkış',veh:'air',ac:'hurkus',lic:'pilot',xp:120,d:'Pist başından gaz aç, hızlan, havalan, iniş takımını topla ve 300 metreye tırman.',start:'runway',
   steps:[{t:'Gazı tam aç (R tuşu ya da gaz kolu)',ok:function(){ return S.throttle>0.95; }},{t:'Hızlan: 180 km/sa\'yı geç',ok:function(){ return S.speed*3.6>180; }},
     {t:'Burnu yavaşça kaldır (S) ve havalan',ok:function(){ return !S.onGround; }},{t:'İniş takımını topla (G)',ok:function(){ return !S.gear&&!S.onGround; }},{t:'300 metreye tırman',ok:function(){ return agl()>300; }}]},
  {id:'tur',n:'Trafik turu',veh:'air',ac:'hurkus',lic:'pilot',xp:150,d:'Pistin doğusunda dikdörtgen bir trafik turu at: kalkış kolu, rüzgâr altı, üs kolu ve son yaklaşma.',start:'air',
   place:function(){ S.pos.set(0,AIRFIELD_Y+420,-1800); sQ(0); S.speed=75; S.throttle=0.6; S.gear=false; },
   steps:[{t:'Sağa dön, doğudaki işarete uç',wp:[1500,-2700,650]},{t:'Güneye dön, pistin paralelinde uç (rüzgâr altı kolu)',wp:[1600,2500,650]},{t:'Sağa dön, pist uzantısındaki işarete gir (üs kolu)',wp:[300,4700,650]},
     {t:'Son yaklaşma: burnu kuzeye, pist eksenine hizala',ok:function(){ const h=hdgOf(); return Math.abs(S.pos.x)<140&&S.pos.z>1500&&S.pos.z<4600&&Math.abs(Math.atan2(Math.sin(h),Math.cos(h)))<0.3; }},
     {t:'Pistin üstünden alçaktan geç (120 m altı)',ok:function(){ return Math.abs(S.pos.x)<70&&S.pos.z<1100&&S.pos.z>-1200&&agl()<120; }}]},
  {id:'inis',n:'İniş',veh:'air',ac:'hurkus',lic:'pilot',xp:160,d:'Son yaklaşmadan başla: gazı azalt, iniş takımını indir, eksene hizalan, teker koy ve dur.',start:'air',
   place:function(){ S.pos.set(0,AIRFIELD_Y+300,5200); sQ(0); S.speed=72; S.throttle=0.55; S.gear=false; },
   steps:[{t:'Gazı %50\'nin altına indir (F)',ok:function(){ return S.throttle<0.5; }},{t:'İniş takımını indir (G)',ok:function(){ return S.gear; }},{t:'Pist eksenine hizalan',ok:function(){ return Math.abs(S.pos.x)<40&&S.pos.z<3800; }},
     {t:'Pist başında yumuşakça teker koy',ok:function(){ return S.onGround&&!!landZone(S.pos.x,S.pos.z); }},{t:'Fren yap (B) ve tamamen dur',ok:function(){ return S.onGround&&S.speed<1; }}]},
  {id:'ruzgar',n:'Rüzgârlı iniş',veh:'air',ac:'hurkus',lic:'pilot',xp:200,d:'Doğudan esen 25 knotluk yan rüzgârda in. Burnu rüzgâra doğru çevirerek (yengeç) eksende kal.',start:'air',wind:{dir:90,wind:13,turb:0.45},
   place:function(){ S.pos.set(0,AIRFIELD_Y+300,5200); sQ(0); S.speed=72; S.throttle=0.55; S.gear=false; },
   steps:[{t:'Rüzgâr seni batıya itiyor: burnu biraz doğuya çevir',ok:function(){ return SCH.t>6; }},{t:'İniş takımını indir (G) ve gazı azalt',ok:function(){ return S.gear&&S.throttle<0.6; }},
     {t:'Eksende kal (40 m içinde)',ok:function(){ return Math.abs(S.pos.x)<40&&S.pos.z<3000; }},{t:'Teker koy',ok:function(){ return S.onGround&&!!landZone(S.pos.x,S.pos.z); }},{t:'Dur',ok:function(){ return S.onGround&&S.speed<1; }}]},
  {id:'hover',n:'Havada asılı kalma',veh:'heli',ac:'t625',lic:'heli',xp:150,d:'T625 ile kalk, 10 metrede sabit dur, pedallarla dön, ileri uç ve helipada geri in.',spot:[-450,540,Math.PI/2],
   steps:[{t:'R ile kalk',ok:function(H){ return !H.ground; }},{t:'10 metre yükseklikte 5 saniye sabit dur',hold:5,ok:function(H){ return hAgl(H)>6&&hAgl(H)<15&&Math.hypot(H.vx,H.vz)<2.5; }},
     {t:'Q / E pedallarıyla 90° dön',ok:function(H){ return Math.abs(Math.atan2(Math.sin(H.h-SCH.ref),Math.cos(H.h-SCH.ref)))>1.4; },enter:function(H){ SCH.ref=H.h; }},
     {t:'İleri uç (W): 40 km/sa\'yı geç',ok:function(H){ return Math.hypot(H.vx,H.vz)>11; }},{t:'Helipada dön ve yumuşakça in',ok:function(H){ return H.ground&&Math.hypot(H.x+450,H.z-540)<20; }}]},
  {id:'sapan',n:'Askı yükü',veh:'heli',ac:'t625',lic:'heli',xp:180,d:'Sandığı kancaya al, 20 metreye kaldır, işaretli noktaya taşı ve yumuşakça bırak.',spot:[-450,540,Math.PI/2],
   setup:function(){ const s=callSpot(-410,600,3)||[-410,600]; SCH.crate=crateAdd(s[0],s[1],'sch'); SCH.mk=callSpot(-330,640,3)||[-330,640]; },
   steps:[{t:'Kalk ve sandığın 5–25 m üstünde asılı dur',ok:function(H){ const c=SCH.crate; return !H.ground&&Math.hypot(c.x-H.x,c.z-H.z)<10&&H.y-c.y>4&&H.y-c.y<26; }},
     {t:'B ile sandığı kancaya al',ok:function(H){ return H.sling&&H.sling.o===SCH.crate; }},{t:'Yükü 8 metreye kaldır',ok:function(H){ const c=SCH.crate; return c.y-groundH(c.x,c.z)>8; }},
     {t:'Turuncu işarete taşı',ok:function(H){ const c=SCH.crate; return Math.hypot(c.x-SCH.mk[0],c.z-SCH.mk[1])<20; },enter:function(){ SCH.mark=callBeacon(SCH.mk[0],SCH.mk[1]); }},
     {t:'Yere indir ve B ile bırak',ok:function(H){ const c=SCH.crate; return !H.sling&&!c.fall&&Math.abs(c.y-groundH(c.x,c.z))<0.6; }}],
   pass:function(){ return !SCH.crate.broken; }},
  {id:'silah',n:'Silah kullanımı',veh:'air',ac:'hurjet',lic:'silah',xp:180,d:'Atış poligonundaki üç kamyonu top ve seçili silahla vur, sonra flare at.',start:'air',
   place:function(){ S.pos.set(900,AIRFIELD_Y+600,-7700); sQ(Math.PI/2); S.speed=110; S.throttle=0.6; S.gear=false; },
   setup:function(){ [[2450,-7700],[2520,-7660],[2590,-7730]].forEach(function(p){ addGround('truck',p[0],p[1]); }); SCH.fl=null; },
   steps:[{t:'Topla (Boşluk) bir kamyonu vur',ok:function(){ return gtargets.filter(function(o){ return !o.alive; }).length>=1; }},{t:'Seçili silahla (X) bir hedef daha vur',ok:function(){ return gtargets.filter(function(o){ return !o.alive; }).length>=2; }},
     {t:'Son kamyonu da imha et',ok:function(){ return gtargets.every(function(o){ return !o.alive; }); }},{t:'Flare at (Z)',ok:function(){ return flaresLeft<SCH.fl; },enter:function(){ SCH.fl=flaresLeft; }}]},
  {id:'gemi',n:'Gemiye iniş',veh:'heli',ac:'t625',lic:'heli',xp:220,d:'Rıhtımdaki fırkateynin, ardından açıkta seyreden devriye korvetinin helikopter güvertesine in.',spot:[-1720,-3360,Math.PI/2],
   steps:[{t:'Rıhtımdaki fırkateynin helikopter güvertesine in',ok:function(H){ const d=H.ground&&deckAt(H.x,H.z,H.y+0.6); return !!d&&!d.mover; }},{t:'Kalk',ok:function(H){ return !H.ground; }},
     {t:'Açıktaki devriye korvetinin hareketli güvertesine in',ok:function(H){ const d=H.ground&&deckAt(H.x,H.z,H.y+0.6); return !!d&&!!d.mover&&!d.mover.K; }}]}];
const LIC={pilot:{n:'Pilot sertifikası',ids:['kalkis','tur','inis','ruzgar']},heli:{n:'Helikopter sertifikası',ids:['hover','sapan','gemi']},silah:{n:'Silah sertifikası',ids:['silah']}};
function schState(){ try{ return JSON.parse(stGet('ayy-school')||'{}'); }catch(e){ return {}; } }
function schDone(){ const s=schState(); return LESSONS.filter(function(L){ return s[L.id]; }).length; }
function schLicOk(k){ const s=schState(); return LIC[k].ids.every(function(id){ return s[id]; }); }
Object.keys(LIC).forEach(function(k){ MEDALS.push(['lic_'+k,LIC[k].n,LIC[k].ids.length>1?'Uçuş okulundaki ilgili dersleri bitir':'Uçuş okulunun silah dersini bitir',function(st){ return (st.school||[]).length&&LIC[k].ids.every(function(id){ return st.school.indexOf(id)>=0; }); }]); });
/* ---- board + menu */
boardAll=HOOK.wrap('boardAll','gorev/ucus-okulu#_schAll',function(_schAll){ return function(){ return _schAll().concat(LESSONS.map(function(L){ return {id:'sch_'+L.id,kind:'school',name:'Ders: '+L.n,desc:L.d,L:L}; })); }; },boardAll);
bMeta=HOOK.wrap('bMeta','gorev/ucus-okulu#_schMeta',function(_schMeta){ return function(e){ if(e.kind!=='school') return _schMeta(e); const L=e.L;
  return {cat:'okul',diff:L.id==='ruzgar'||L.id==='gemi'?2:1,dur:4,xp:L.xp,obj:L.steps.map(function(s){ return s.t; }),thr:[L.wind?'Yan rüzgâr 25 knot, türbülans':'Tehdit yok — eğitmen telsizde'],load:null,area:L.veh==='heli'?[L.spot[0],L.spot[1],1500]:L.id==='silah'?[2300,-7700,2500]:[600,1500,5000]}; }; },bMeta);
renderMissions=HOOK.wrap('renderMissions','gorev/ucus-okulu#_schRender',function(_schRender){ return function(){ _schRender(); const f=$('misFilt'); if(f&&!f.querySelector('[data-v="okul"]')){ const seg=f.querySelector('[data-k="cat"]'); if(seg){ const b=document.createElement('button'); b.type='button'; b.dataset.v='okul'; b.textContent='Okul'; b.setAttribute('aria-pressed',String(BF.cat==='okul')); const nw=seg.querySelector('.bnew'); seg.insertBefore(b,nw||null); } }
  const e=boardList()[misSel]; if(e&&e.kind==='school'){ const s=schState(); $('btnMisGo').textContent=s[e.L.id]?'▶ Dersi tekrarla':'▶ Derse başla'; $('btnMisAc').disabled=true; $('btnMisAc').textContent=e.L.veh==='heli'?'T625 GÖKBEY':AIRCRAFT[e.L.ac].short;
    const ch=$('misChips'); if(ch) ch.innerHTML='<span>'+(s[e.L.id]?'✓ Tamamlandı':'Tamamlanmadı')+'</span><span>'+LIC[e.L.lic].n+(schLicOk(e.L.lic)?' ✓':'')+'</span><span>'+schDone()+' / '+LESSONS.length+' ders</span>'; }
  Array.prototype.forEach.call(document.querySelectorAll('#misList .mitem'),function(b){ const en=boardList()[+b.dataset.i]; if(en&&en.kind==='school'&&schState()[en.L.id]){ const st=b.querySelector('.stars'); if(st) st.outerHTML='<span class="stars"><i class="on">✓</i></span>'; } }); }; },renderMissions);
misGo=HOOK.wrap('misGo','gorev/ucus-okulu#_schGo',function(_schGo){ return function(){ const e=boardList()[misSel]; if(!e||e.kind!=='school') return _schGo(); schStart(e.L.id); }; },misGo);
/* ---- engine */
function schStart(id){
  const L=LESSONS.find(function(x){ return x.id===id; }); if(!L) return; schStop(); closeModals();
  SCH.on=true; SCH.cur=L; SCH.i=0; SCH.t=0; SCH.hold=0; SCH.entered=-1; SCH.fail=false;
  if(L.veh==='air'){ selectedId=L.ac; setAircraft(L.ac); missionId='school'; MISSIONS.school.name='Ders: '+L.n; MISSIONS.school.desc=L.d; BMETA.school={xp:L.xp,dur:4};
    startGame(L.start); if(L.place){ L.place(); camQ.copy(S.q); camSnap=true; S.onGround=false; S.taxi=false; S.clearance=true; } if(L.setup) L.setup(); }
  else { if(HM.on) hmClean(); startWalk(); buildHelis(); let H=HELI.list.find(function(h){ return h.id===L.ac&&Math.hypot(h.home[0]-L.spot[0],h.home[1]-L.spot[1])<5; })||HELI.list.find(function(h){ return h.id===L.ac; });
    if(H.crashT>0) H.crashT=0; H.home=[L.spot[0],L.spot[1],L.spot[2]]; H.x=L.spot[0]; H.z=L.spot[1]; H.h=L.spot[2]; H.y=heliFloor(H).y; H.vx=H.vy=H.vz=0; H.ground=true; H.m.g.visible=true; heliPlace(H);
    WALK.pos.set(H.x+6,groundH(H.x,H.z)+1.7,H.z+4); heliBoard(H); SCH.H=H; if(L.setup) L.setup(); }
  if(L.wind){ SCH.wx={wx:SETTINGS.wx,dir:WX.dir}; WX.dir=L.wind.dir; }
  schSay('Merhaba {cs}. Bugünkü ders: '+L.n+'. '+L.d);
}
function schSay(t){ if(typeof radioSay==='function') radioSay({w:'egitmen',t:t},null,{force:true}); else toast(t,'#7dffb0'); }
function schStop(){ if(SCH.mark){ scene.remove(SCH.mark); SCH.mark=null; } if(SCH.crate){ const c=SCH.crate; HELI.list.forEach(function(H){ if(H.sling&&H.sling.o===c){ scene.remove(H.sling.line); H.sling=null; } }); scene.remove(c.g); const i=CRATES.indexOf(c); if(i>=0) CRATES.splice(i,1); SCH.crate=null; }
  if(SCH.wx){ WX.dir=SCH.wx.dir; SCH.wx=null; } if(typeof DYN!=='undefined') dynClear(); SCH.on=false; }
/* wind override while a crosswind lesson runs */
wxTarget=HOOK.wrap('wxTarget','gorev/ucus-okulu#_schWx',function(_schWx){ return function(){ const t=_schWx(); if(SCH.on&&SCH.cur&&SCH.cur.wind) return Object.assign({},t,{wind:SCH.cur.wind.wind,turb:SCH.cur.wind.turb}); return t; }; },wxTarget);
function schStep(dt){
  if(!SCH.on||!SCH.cur) return; const L=SCH.cur;
  if(L.veh==='air'&&(state!=='play'||M.id!=='school')){ if(state==='menu') schStop(); return; }
  if(L.veh==='heli'&&state!=='walk'){ if(state==='menu') schStop(); return; }
  SCH.t+=dt; const st=L.steps[SCH.i], H=SCH.H;
  if(L.veh==='air'&&S.crashed&&!SCH.fail){ SCH.fail=true; schSay('Kaza! Sorun değil, tekrar deneyelim.'); setTimeout(function(){ if(SCH.on&&SCH.cur===L) schEnd(false,'Kaza'); },1500); return; }
  if(L.veh==='heli'&&H&&H.crashT>0&&!SCH.fail){ SCH.fail=true; schEnd(false,'Helikopter kaza yaptı'); return; }
  if(!st) return;
  if(SCH.entered!==SCH.i){ SCH.entered=SCH.i; SCH.hold=0; if(st.enter) st.enter(H); if(st.wp){ if(typeof dynMark==='function'){ DYN.marks.forEach(function(g){ scene.remove(g); }); DYN.marks=[]; dynMark(st.wp[0],st.wp[1],st.wp[2]); } }
    if(SCH.i>0) schSay((['Güzel.','Çok iyi.','Harika.','Aynen böyle.'])[SCH.i%4]+' Şimdi: '+st.t+'.'); else setTimeout(function(){ if(SCH.on&&SCH.cur===L&&SCH.i===0) schSay('İlk adım: '+st.t+'.'); },3500); }
  let ok=st.wp?(!S.onGround&&Math.hypot(S.pos.x-st.wp[0],S.pos.z-st.wp[1])<st.wp[2]):st.ok(H);
  if(st.hold){ SCH.hold=ok?SCH.hold+dt:Math.max(0,SCH.hold-dt*2); ok=SCH.hold>=st.hold; }
  if(ok){ try{ sndPlay('ui_ok'); }catch(e){} toast('✓ '+st.t,'#7dffb0'); SCH.i++; if(SCH.i>=L.steps.length){ const pass=!L.pass||L.pass(); schEnd(pass,pass?null:'Yük hasar gördü'); } }
}
function schEnd(ok,why){
  const L=SCH.cur; if(!L) return; const S0=schState();
  if(ok){ const first=!S0[L.id]; S0[L.id]=true; try{ stSet('ayy-school',JSON.stringify(S0)); }catch(e){}
    try{ const p=accProfile(), st=p.stats||(p.stats={}); st.school=Object.keys(S0); if(typeof careerAdd==='function') careerAdd(L.veh==='air'?0:(first?L.xp:Math.round(L.xp/4)),null); }catch(e){}
    if(first&&schLicOk(L.lic)) setTimeout(function(){ toast('🎖 '+LIC[L.lic].n+' kazandın!','#ffd27a'); schSay('Tebrikler {cs}, '+LIC[L.lic].n.toLocaleLowerCase('tr-TR')+' almaya hak kazandın!'); },1200);
    else schSay('Ders tamam, tebrikler {cs}.'); }
  if(L.veh==='air'){ if(DYN.marks) { DYN.marks.forEach(function(g){ scene.remove(g); }); DYN.marks=[]; } SCH.on=false; endMission(ok); }
  else { const el=$('hmEnd'); Object.assign(HM,{on:true,id:'sch_'+L.id,M:{n:'Ders: '+L.n,lim:600,xp:L.xp,obj:[]},H:SCH.H,ended:true,i:0,t:SCH.t});
    if(el){ $('hmEndT').textContent=ok?'DERS TAMAMLANDI':'DERS BAŞARISIZ'; $('hmEndT').className=ok?'ok':'bad'; $('hmEndS').innerHTML='<b>'+L.n+'</b><span>'+(ok?(schLicOk(L.lic)?LIC[L.lic].n+' ✓ · ':'')+schDone()+' / '+LESSONS.length+' ders':why)+'</span>'; setTimeout(function(){ el.classList.remove('hidden'); },1200); }
    schStop(); }
}
hmStart=HOOK.wrap('hmStart','gorev/ucus-okulu#_schHmStart',function(_schHmStart){ return function(id){ if(String(id).indexOf('sch_')===0){ $('hmEnd').classList.add('hidden'); HM.on=false; return schStart(String(id).slice(4)); } return _schHmStart(id); }; },hmStart);
restartMission=HOOK.wrap('restartMission','gorev/ucus-okulu#_schRestart',function(_schRestart){ return function(){ if(M.id==='school'&&SCH.cur){ $('missionEnd').classList.add('hidden'); return schStart(SCH.cur.id); } return _schRestart(); }; },restartMission);
setupMission=HOOK.wrap('setupMission','gorev/ucus-okulu#_schSetup',function(_schSetup){ return function(){ if(missionId!=='school') return _schSetup(); MLOG.length=0; B_STAT.shots=0; B_STAT.minHp=100; MS.rings=MS.air=MS.ground=MS.recon=false; M={id:'school',t:0,started:false,done:false,scanIdx:0,scanT:0};
  clearAir(); clearGround(); clearRecon(); ringIdx=0; courseT=null; updateRingVisuals(); aiClear(); }; },setupMission);
updateMission=HOOK.wrap('updateMission','gorev/ucus-okulu#_schUpdM',function(_schUpdM){ return function(dt){ if(M.id==='school'){ if(!M.done&&state==='play'){ if(!M.started&&!S.onGround) M.started=true; M.t+=dt; } return; } return _schUpdM(dt); }; },updateMission);
bStarsFor=HOOK.wrap('bStarsFor','gorev/ucus-okulu#_schStars',function(_schStars){ return function(ok){ return M.id==='school'?(ok?3:0):_schStars(ok); }; },bStarsFor);
bObjective=HOOK.wrap('bObjective','gorev/ucus-okulu#_schObj',function(_schObj){ return function(){ if(state==='play'&&M&&M.id==='school') return null; return _schObj(); }; },bObjective);
/* ---- HUD: lesson checklist */
function schPanel(w,h,s){ const L=SCH.cur; if(!SCH.on||!L) return; const x=Math.round(16*s), y0=Math.round(h*(L.veh==='air'?0.36:0.3)); hx.save(); hx.textAlign='left'; hx.textBaseline='middle'; hx.shadowColor='rgba(0,0,0,.75)'; hx.shadowBlur=4;
  hx.font='500 '+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif'; let mw=0; L.steps.forEach(function(st){ mw=Math.max(mw,hx.measureText('▶ '+st.t+'  (0.0 / 5 sn)').width); });
  hx.save(); hx.shadowBlur=0; hx.fillStyle='rgba(6,12,22,.62)'; hx.fillRect(x-8*s,y0-12*s,Math.min(w*0.42,mw+18*s),(L.steps.length+1)*Math.round(17*s)+14*s); hx.restore();
  hx.font='700 '+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#7dffb0'; hx.fillText('UÇUŞ OKULU · '+L.n.toLocaleUpperCase('tr-TR'),x,y0);
  L.steps.forEach(function(st,i){ const done=i<SCH.i, cur=i===SCH.i; hx.font=(cur?'700 ':'500 ')+Math.round(12*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle=done?'rgba(125,255,176,.7)':cur?'#ffffff':'rgba(223,233,241,.45)';
    let t=(done?'✓ ':cur?'▶ ':'· ')+st.t; if(cur&&st.hold) t+='  ('+SCH.hold.toFixed(1)+' / '+st.hold+' sn)'; if(cur&&st.wp&&L.veh==='air') t+='  · '+Math.round(Math.hypot(S.pos.x-st.wp[0],S.pos.z-st.wp[1]))+' m'; hx.fillText(t,x,y0+(i+1)*Math.round(17*s)); });
  hx.restore(); }
drawHUD=HOOK.wrap('drawHUD','gorev/ucus-okulu#_schHUD',function(_schHUD){ return function(){ _schHUD(); if(state==='play'&&SCH.on&&SCH.cur&&SCH.cur.veh==='air'&&!(typeof EJ!=='undefined'&&EJ.on)) schPanel(HW,HH,clamp(Math.min(HW,HH)/760,0.7,1.5)); }; },drawHUD);
heliHUD=HOOK.wrap('heliHUD','gorev/ucus-okulu#_schHeliHUD',function(_schHeliHUD){ return function(w,h,s){ _schHeliHUD(w,h,s); if(SCH.on&&SCH.cur&&SCH.cur.veh==='heli') schPanel(w,h,s); }; },heliHUD);
