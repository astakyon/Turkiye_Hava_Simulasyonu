/* ------------------------------------------------------------------ career licences (V1.92)
   Quick play: everything open, no XP. Career: you start from zero and need a certificate / licence for every kind of
   vehicle, earned in a practical exam (Kariyer → Ehliyet ve Sertifikalar):
     Araç ehliyeti (cars, trucks, Kirpi) · Tank sürücülüğü (Altay, Fırtına, Pars, Korkut, Hisar) · Kaptanlık (all boats and ships)
     İHA pilotluğu (TB2, ANKA, AKSUNGUR, TB3, Akıncı, ANKA-3, KIZILELMA) · Temel pilotluk (Hürkuş) · Jet pilotluğu (Hürjet)
     Savaş pilotluğu (KAAN) · Helikopter pilotluğu (T129, T625)
   Exams chain existing lessons (flight school) and timed driving / sailing courses. Rank still applies to the heavy systems.
   Without the licence a vehicle cannot be flown / driven in career: hangar, mission board and boarding on foot are checked. */
const LIC2={
  ehliyet:{n:'Araç ehliyeti',ic:'🚙',d:'Kontrol noktalarından geçerek sürüş sınavı (SUV, 4 dakika).',steps:[{race:'x_car'}],xp:150},
  tank:{n:'Tank sürücülüğü',ic:'🛡',need:'ehliyet',d:'Altay ile arazi sürüş sınavı (5 dakika).',steps:[{race:'x_tank'}],xp:250},
  kaptan:{n:'Kaptanlık belgesi',ic:'⚓',d:'Hücumbotla şamandıralar arasında seyir sınavı (5 dakika).',steps:[{race:'x_boat'}],xp:200},
  iha:{n:'İHA pilotluğu',ic:'🛰',d:'TB2 ile kalkış ve iniş sınavı.',steps:[{les:'x_iha_kalkis'},{les:'x_iha_inis'}],xp:220},
  pilot:{n:'Temel pilotluk',ic:'✈',d:'Hürkuş ile kalkış, trafik turu ve iniş.',steps:[{les:'kalkis'},{les:'tur'},{les:'inis'}],xp:250},
  jet:{n:'Jet pilotluğu',ic:'🛩',need:'pilot',d:'Hürjet ile kalkış, silah kullanımı ve iniş; yan rüzgârda iniş (Hürkuş).',steps:[{les:'x_jet_kalkis'},{les:'silah'},{les:'ruzgar'}],xp:350},
  savas:{n:'Savaş pilotluğu',ic:'⚔',need:'jet',d:'KAAN ile atış ve iniş sınavı.',steps:[{les:'x_kaan_silah'},{les:'x_kaan_inis'}],xp:500},
  heli:{n:'Helikopter pilotluğu',ic:'🚁',d:'T625 ile askıda kalma, askı yükü ve gemiye iniş.',steps:[{les:'hover'},{les:'sapan'},{les:'gemi'}],xp:300}};
const LIC2_ORDER=['ehliyet','tank','kaptan','iha','pilot','jet','savas','heli'];
const LIC_OF={tb2:'iha',anka:'iha',aksungur:'iha',tb3:'iha',akinci:'iha',anka3:'iha',kizilelma:'iha',hurkus:'pilot',hurjet:'jet',kaan:'savas',t129:'heli',t625:'heli',
  suv:'ehliyet',suvR:'ehliyet',follow:'ehliyet',mil:'ehliyet',truck:'ehliyet',fuel:'ehliyet',fire:'ehliyet',bus:'ehliyet',tug:'ehliyet',kirpi:'ehliyet',
  altay:'tank',firtina:'tank',pars:'tank',korkut:'tank',hisar:'tank'};
function licFor(id,kind){ if(kind==='deniz'||kind==='boat'||(typeof BOAT_KINDS!=='undefined'&&BOAT_KINDS[id]&&!LIC_OF[id])) return 'kaptan'; return LIC_OF[id]||null; }
function licProfile(){ const p=accProfile(); if(!p.lic2) p.lic2={}; return p; }
function licGrant(k){ const p=licProfile(), o=Object.assign({},p.lic2); o[k]=o[k]||Date.now(); accSetProfile({lic2:o}); }
function licHas(k){ if(!k) return true; if(PLAY.mode!=='career'||SETTINGS.rankLocks===false) return true; return !!licProfile().lic2[k]; }
function licOk(id,kind){ return licHas(licFor(id,kind)); }
function licExempt(){ return (typeof EXAM!=='undefined'&&EXAM.on)||(typeof SCH!=='undefined'&&SCH.on)||(typeof RACE!=='undefined'&&RACE.def)||(typeof HM!=='undefined'&&HM.on&&!HM.ended); }
function licMsg(id,kind){ const k=licFor(id,kind), L=LIC2[k]; return '🔒 '+(L?L.n:'Belge')+' gerekli — Kariyer → Ehliyet ve Sertifikalar'; }
/* existing graduates keep what they earned in the flight school */
(function(){ try{ const s=schState(), p=licProfile(); if(['kalkis','tur','inis'].every(function(i){ return s[i]; })&&!p.lic2.pilot) licGrant('pilot'); if(['hover','sapan','gemi'].every(function(i){ return s[i]; })&&!licProfile().lic2.heli) licGrant('heli'); }catch(e){} })();
/* ---- exam lessons (flight school engine) and courses (race engine) */
(function(){ const base=function(id){ return LESSONS.find(function(L){ return L.id===id; }); }, clone=function(id,o){ const B=base(id), L=Object.assign({},B,o); LESSONS.push(L); return L; };
  const vr=function(){ return CUR.vr*3.6; };
  clone('kalkis',{id:'x_iha_kalkis',n:'İHA kalkışı',ac:'tb2',lic:'pilot',exam:true,d:'TB2 ile pist başından kalk ve 300 metreye tırman.',steps:[{t:'Gazı tam aç',ok:function(){ return S.throttle>0.95; }},{t:'Kalkış hızına ulaş',ok:function(){ return S.speed*3.6>vr(); }},{t:'Burnu kaldır ve havalan',ok:function(){ return !S.onGround; }},{t:'İniş takımını topla (G)',ok:function(){ return !S.gear&&!S.onGround; }},{t:'300 metreye tırman',ok:function(){ return agl()>300; }}]});
  clone('inis',{id:'x_iha_inis',n:'İHA inişi',ac:'tb2',lic:'pilot',exam:true,d:'TB2 ile son yaklaşmadan pist başına in ve dur.',place:function(){ S.pos.set(0,AIRFIELD_Y+250,4200); sQ(0); S.speed=CUR.airV*0.9; S.throttle=0.45; S.gear=false; }});
  clone('kalkis',{id:'x_jet_kalkis',n:'Jet kalkışı',ac:'hurjet',lic:'pilot',exam:true,d:'Hürjet ile kalk, takımı topla ve 300 metreye tırman.',steps:[{t:'Gazı tam aç',ok:function(){ return S.throttle>0.95; }},{t:'Kalkış hızına ulaş',ok:function(){ return S.speed*3.6>vr(); }},{t:'Havalan',ok:function(){ return !S.onGround; }},{t:'İniş takımını topla (G)',ok:function(){ return !S.gear&&!S.onGround; }},{t:'300 metreye tırman',ok:function(){ return agl()>300; }}]});
  clone('silah',{id:'x_kaan_silah',n:'KAAN atış sınavı',ac:'kaan',lic:'silah',exam:true,d:'KAAN ile poligondaki üç kamyonu vur ve flare at.'});
  clone('inis',{id:'x_kaan_inis',n:'KAAN inişi',ac:'kaan',lic:'pilot',exam:true,d:'KAAN ile son yaklaşmadan in ve dur.',place:function(){ S.pos.set(0,AIRFIELD_Y+320,5600); sQ(0); S.speed=CUR.airV*0.95; S.throttle=0.45; S.gear=false; }});
  const rc=RACES.find(function(r){ return r.id==='r_car'; }), rb=RACES.find(function(r){ return r.id==='r_boat'; });
  RACES.push({id:'x_car',n:'Sürüş sınavı',veh:'car',ac:'suv',exam:true,lim:240,d:'Kontrol noktalarından geç.',R:16,gates:function(){ return rc.gates().slice(0,7); }});
  RACES.push({id:'x_tank',n:'Tank sürüş sınavı',veh:'car',ac:'altay',exam:true,lim:300,d:'Altay ile kontrol noktalarından geç.',R:18,gates:function(){ return rc.gates().slice(0,5); }});
  RACES.push({id:'x_boat',n:'Kaptanlık sınavı',veh:'boat',ac:'patrol',exam:true,lim:300,d:'Şamandıraların arasından bir tur.',R:24,gates:function(){ const G=rb.gates(); return G.slice(0,8).concat([G[0].slice()]); }}); })();
/* exam lessons / courses are not on the mission board */
boardAll=HOOK.wrap('boardAll','ag/lisanslar#_licAll',function(_licAll){ return function(){ return _licAll().filter(function(e){ return !((e.kind==='school'&&e.L&&e.L.exam)||(e.kind==='race'&&e.R&&e.R.exam)); }); }; },boardAll);
/* ---- exam engine */
const EXAM={on:false,id:null,i:0,t0:0};
function examStart(k){ const L=LIC2[k]; if(!L) return; if(L.need&&!licProfile().lic2[L.need]){ toast('Önce: '+LIC2[L.need].n,'#ffc24a'); return; }
  playMode('career'); EXAM.on=true; EXAM.id=k; EXAM.i=0; EXAM.t0=performance.now(); closeModals(); $('licUI')&&$('licUI').classList.add('hidden'); examStep(); }
function examStep(){ const L=LIC2[EXAM.id], st=L.steps[EXAM.i]; if(!st){ examPass(); return; }
  toast('📝 '+L.n+' sınavı · aşama '+(EXAM.i+1)+' / '+L.steps.length,'#ffd27a');
  if(st.les){ if(state!=='menu'){ try{ enterHangar(); }catch(e){} } schStart(st.les); } else { if(state!=='menu'){ try{ enterHangar(); }catch(e){} } raceStart(st.race); } }
function examNext(){ EXAM.i++; const L=LIC2[EXAM.id]; ['missionEnd','hmEnd'].forEach(function(id){ const e=$(id); if(e) e.classList.add('hidden'); });
  if(EXAM.i>=L.steps.length){ examPass(); return; } setTimeout(function(){ if(EXAM.on) examStep(); },1600); }
function examFail(why){ const L=LIC2[EXAM.id]; EXAM.on=false; toast('✗ '+L.n+' sınavı başarısız'+(why?': '+why:'')+' — tekrar deneyebilirsin','#ff6a5a'); }
function examPass(){ const k=EXAM.id, L=LIC2[k], p=licProfile(); EXAM.on=false; const first=!p.lic2[k]; licGrant(k);
  if(first) try{ careerAdd(L.xp,null,L.n); }catch(e){}
  toast('🎖 '+L.n+' aldın! Yeni araçlar açıldı.','#ffd27a'); if(typeof radioSay==='function') radioSay({w:'egitmen',t:'Tebrikler {cs}, '+L.n.toLocaleLowerCase('tr-TR')+' belgen hazır.'},null,{force:true});
  setTimeout(function(){ licOpen(k); },1800); }
schEnd=HOOK.wrap('schEnd','ag/lisanslar#_licSchEnd',function(_licSchEnd){ return function(ok,why){ const L=SCH.cur, ex=EXAM.on&&L&&LIC2[EXAM.id].steps[EXAM.i]&&LIC2[EXAM.id].steps[EXAM.i].les===L.id; _licSchEnd(ok,why); if(!ex) return; if(ok) examNext(); else examFail(why||'aşama tamamlanamadı'); }; },schEnd);
raceFinish=HOOK.wrap('raceFinish','ag/lisanslar#_licRaceFin',function(_licRaceFin){ return function(){ const R=RACE.def, t=RACE.t, ex=EXAM.on&&R&&LIC2[EXAM.id].steps[EXAM.i]&&LIC2[EXAM.id].steps[EXAM.i].race===R.id; _licRaceFin(); if(!ex) return;
  if(t<=R.lim) examNext(); else examFail('süre '+fmtT(t)+' (sınır '+fmtT(R.lim)+')'); }; },raceFinish);
/* ---- career gating */
rankLocked=HOOK.wrap('rankLocked','ag/lisanslar#_licRank',function(_licRank){ return function(id){ return _licRank(id)||!licOk(id); }; },rankLocked);
preFlight=HOOK.wrap('preFlight','ag/lisanslar#_licPre',function(_licPre){ return function(from){ if(state==='menu'&&!licOk(selectedId)){ toast(licMsg(selectedId),'#ffc24a'); return; } return _licPre(from); }; },preFlight);
document.getElementById('btnPlay').addEventListener('click',function(e){ const v=VSEL?{id:VSEL.id,k:VSEL.g}:(HSEL?{id:HSEL,k:'heli'}:null); if(v&&!licOk(v.id,v.k)){ e.stopImmediatePropagation(); toast(licMsg(v.id,v.k),'#ffc24a'); } },true);
walkInteract=HOOK.wrap('walkInteract','ag/lisanslar#_licWalk',function(_licWalk){ return function(){ if(state==='walk'&&WALK.mode==='foot'&&!licExempt()){ let id=null,k=null;
    if(WALK.near==='boat'&&WALK.nearBoat){ id=WALK.nearBoat.id; k='boat'; } else if(WALK.near==='heli'&&WALK.nearHeli){ id=WALK.nearHeli.id; k='heli'; } else if(WALK.near==='car'){ const c=WALK.nearCar||WALK.car; if(c) id=c.K.id; } else if(WALK.near==='plane') id=WALK.nearId;
    if(id&&!licOk(id,k)){ toast(licMsg(id,k),'#ffc24a'); return; } } return _licWalk(); }; },walkInteract);
misLocked=HOOK.wrap('misLocked','ag/lisanslar#_licMisLock',function(_licMisLock){ return function(e){ if(_licMisLock(e)) return true; if(PLAY.mode!=='career'||!e) return false;
  if(e.kind==='heli') return !licHas('heli'); if(e.kind==='race'&&e.R) return !licOk(e.R.ac,e.R.veh==='boat'?'boat':null); if(e.kind==='dyn'&&e.D&&e.D.veh==='car') return !licHas('ehliyet'); return false; }; },misLocked);
/* hangar: chips and start button show the missing licence */
buildPicker=HOOK.wrap('buildPicker','ag/lisanslar#_licPick',function(_licPick){ return function(){ _licPick(); if(PLAY.mode!=='career') return; Array.prototype.forEach.call($('acChips').children,function(b){ const id=b.dataset.id||b.dataset.heli||b.dataset.v, k=b.dataset.v?pickGrp:(b.dataset.heli?'heli':null);
  if(id&&!licOk(id,k)){ const s=b.querySelector('small'); if(s) s.textContent='🔒 '+LIC2[licFor(id,k)].n; } }); }; },buildPicker);
refreshHangarUI=HOOK.wrap('refreshHangarUI','ag/lisanslar#_licRef',function(_licRef){ return function(){ _licRef(); if(PLAY.mode!=='career') return; const v=VSEL?{id:VSEL.id,k:VSEL.g}:(HSEL?{id:HSEL,k:'heli'}:{id:selectedId,k:null});
  if(!licOk(v.id,v.k)){ const b=$('btnPlay'); b.textContent='🔒 '+LIC2[licFor(v.id,v.k)].n+' gerekli'; b.classList.add('locked'); } }; },refreshHangarUI);
/* ---- licences screen */
function licOpen(hi){ const el=$('licUI'); if(!el) return; const p=licProfile(), have=p.lic2;
  $('licList').innerHTML=LIC2_ORDER.map(function(k){ const L=LIC2[k], got=have[k], need=L.need&&!have[L.need];
    const vs=Object.keys(LIC_OF).filter(function(id){ return LIC_OF[id]===k; }).map(function(id){ return AIRCRAFT[id]?AIRCRAFT[id].short:(HELI_DEF[id]?HELI_DEF[id].name:((typeof hvOf==='function'&&hvOf('kara',id))||[0,null])[1]); }).filter(Boolean);
    if(k==='kaptan') vs.push('Hücumbot','Korvet','TCG Anadolu','tekneler');
    return '<div class="lic'+(got?' got':'')+(hi===k?' hi':'')+'"><span class="li">'+L.ic+'</span><div class="lt"><b>'+L.n+'</b><small>'+L.d+'</small><small class="lv">Açar: '+vs.slice(0,7).join(', ')+'</small></div>'+
      (got?'<span class="ls">✓ '+new Date(got).toLocaleDateString('tr-TR')+'</span><button type="button" class="btn sm" data-ex="'+k+'">Tekrar</button>':(need?'<span class="ls lock">🔒 Önce '+LIC2[L.need].n+'</span>':'<button type="button" class="btn sm primary" data-ex="'+k+'">Sınava gir</button>'))+'</div>'; }).join('');
  $('licSum').textContent=Object.keys(have).filter(function(k){ return LIC2[k]; }).length+' / '+LIC2_ORDER.length+' belge'; el.classList.remove('hidden'); }
(function(){ if(!$('licUI')) return; MODALS.push('licUI'); $('licList').addEventListener('click',function(e){ const b=e.target.closest('[data-ex]'); if(b) examStart(b.dataset.ex); });
  $('btnLicX').addEventListener('click',function(){ $('licUI').classList.add('hidden'); }); })();
/* career menu: Eğitim → Ehliyet ve Sertifikalar */
NAV_IC.lic='<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.4"/><path d="M5.5 16.5c.6-1.6 2-2.4 3.5-2.4s2.9.8 3.5 2.4M14 10h5M14 13h4"/>';
navRender=HOOK.wrap('navRender','ag/lisanslar#_licNav',function(_licNav){ return function(){ _licNav(); if(NAV.level!=='career') return; const el=$('cNav'); if(!el) return; const h=el.innerHTML, key='data-act="c_school"', i=h.indexOf(key); if(i<0||h.indexOf('c_lic')>=0) return;
  const j=h.lastIndexOf('<button',i), n=Object.keys(licProfile().lic2).filter(function(k){ return LIC2[k]; }).length;
  el.innerHTML=h.slice(0,j)+navBtn('c_lic','Ehliyet ve Sertifikalar',n+' / '+LIC2_ORDER.length+' belge · uygulamalı sınav','lic')+h.slice(j); tFocus=Math.min(tFocus,Math.max(0,titleItems().length-1)); titleFocus(tFocus); }; },navRender);
NAV_D.c_lic=['KARİYER','Ehliyet ve Sertifikalar','Kariyerde her araç için belge gerekir: araç ehliyeti, tank sürücülüğü, kaptanlık, İHA, temel, jet ve savaş pilotluğu, helikopter pilotluğu. Uygulamalı sınavı geç, belgeyi al, aracı kullan.',[],'Belgeleri aç'];
titleAct=HOOK.wrap('titleAct','ag/lisanslar#_licAct',function(_licAct){ return function(act){ if(state!=='menu') return; if(act==='c_lic'){ playMode('career'); return licOpen(); } return _licAct(act); }; },titleAct);
Object.keys(LIC2).forEach(function(k){ MEDALS.push(['lic2_'+k,LIC2[k].n,LIC2[k].d,function(){ return !!licProfile().lic2[k]; }]); });
