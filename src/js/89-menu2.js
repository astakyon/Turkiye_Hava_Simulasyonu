/* ------------------------------------------------------------------ main menu v2 (V1.82)
   Left: BAŞLA and ÇOK OYUNCULU. BAŞLA → Hızlı oyun (Serbest uçuş, Üssü gez, Hangar — no XP, nothing locked)
   and KARİYER → Görevler (unlocked by rank), Eğitim, Serbest gezi and Hangar (XP counts, aircraft / vehicles / paints
   unlock with rank). Settings, records and admin are small buttons next to the profile chip; the model and sound
   libraries moved into the admin panel. */
const PLAY={mode:'career'}; try{ const v=localStorage.getItem('ayy-playmode'); if(v==='quick'||v==='career') PLAY.mode=v; }catch(e){}
function playMode(m){ PLAY.mode=m; try{ localStorage.setItem('ayy-playmode',m); }catch(e){} document.documentElement.classList.toggle('quick',m==='quick'); }
const NAV={level:'root'};
const NAV_IC={
  start:'<path d="M7 5l12 7-12 7z"/>', net:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  plane:'<path d="M2 13l8-2 4-7h2l-2 7 6 1 2-2h1l-1 4 1 4h-1l-2-2-6 1 2 7h-2l-4-7-8-2z"/>', walk:'<circle cx="13" cy="4.5" r="2"/><path d="M10 21l2-6-3-3 1-5 4 3 3 1M12 15l3 6"/>',
  hangar:'<path d="M3 20V10l9-6 9 6v10"/><path d="M7 20v-6h10v6"/>', star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>', school:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
  back:'<path d="M15 5l-7 7 7 7"/>'};
function navBtn(act,title,sub,ic,cls){ return '<button class="mitem mc'+(cls?' '+cls:'')+'" type="button" data-act="'+act+'"><svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">'+NAV_IC[ic]+'</svg><span class="mt"><b>'+title+'</b><small>'+sub+'</small></span></button>'; }
function navRender(){
  const el=$('cNav'); if(!el) return; const p=accProfile(), r=p.rank||0; let h='';
  if(NAV.level==='root') h='<p class="mg">OYNA</p>'+navBtn('start','Başla','Hızlı oyun ya da kariyer','start')+navBtn('net','Çok Oyunculu','4 kişi · sesli sohbet','net');
  else if(NAV.level==='start') h='<p class="mg">HIZLI OYUN <small>· puan kazandırmaz, her şey açık</small></p>'+navBtn('q_free','Serbest Uçuş','Süresiz, düşmansız','plane')+navBtn('q_walk','Üssü Gez','Yürü, sür, helikoptere bin','walk')+navBtn('q_hangar','Hangar','Bütün uçaklar ve boyalar','hangar')+
    '<p class="mg">KARİYER</p>'+navBtn('careerMenu','Kariyer',rankName(r)+' · '+(p.xp||0).toLocaleString('tr-TR')+' TP','star','car')+navBtn('back','Geri','','back','bk');
  else h='<p class="mg">KARİYER <small>· '+rankName(r)+' · '+(p.xp||0).toLocaleString('tr-TR')+' TP</small></p>'+navBtn('c_missions','Görevler',navMisSub(),'target')+navBtn('c_school','Eğitim',(typeof schDone==='function'?schDone():0)+' / 8 ders · lisans','school')+
    navBtn('c_walk','Serbest Gezi','Kariyer modunda gez · TP kazandırır','walk')+navBtn('c_hangar','Hangar','TP kazandıkça uçak, araç, boya açılır','hangar')+navBtn('back','Geri','','back','bk');
  el.innerHTML=h; tFocus=Math.min(tFocus,Math.max(0,titleItems().length-1)); titleFocus(tFocus); }
function navMisSub(){ const L=boardAll().filter(function(e){ return e.kind!=='school'&&e.kind!=='cnew'; }), open=L.filter(function(e){ return !misLocked(e); }).length; return open+' / '+L.length+' görev açık'; }
function navGo(level){ NAV.level=level; tFocus=0; navRender(); }
/* ---- mission requirements by rank (career) */
const MREQ={free:0,rings:0,air:1,recon:2,strike:3,dogfight:4,h_asker:1,h_poligon:2,h_yuk:3,h_konvoy:4};
function misReq(e){ if(!e) return 0; if(MREQ[e.id]!=null) return MREQ[e.id]; if(e.kind==='dyn'&&e.D) return [0,1,2,4][e.D.diff||1]; if(e.kind==='race') return 1; return 0; }
function misLocked(e){ if(PLAY.mode!=='career'||SETTINGS.rankLocks===false) return false; return (accProfile().rank||0)<misReq(e); }
/* ---- locks only in career mode (no admin exemption: the owner sees the same progression) */
rankLocked=function(id){ if(PLAY.mode!=='career'||SETTINGS.rankLocks===false) return false; const need=RANK_LOCK[id]; return need!=null&&(accProfile().rank||0)<need; };
lockedAt=function(need){ if(PLAY.mode!=='career'||SETTINGS.rankLocks===false) return false; return (accProfile().rank||0)<need; };
callLocked=function(id){ if(PLAY.mode!=='career'||SETTINGS.rankLocks===false) return false; const need=VEH_RANK[id]; return need!=null&&(accProfile().rank||0)<need; };
/* quick play earns nothing */
careerAdd=HOOK.wrap('careerAdd','89-menu2#_m2Add',function(_m2Add){ return function(xp,patch,why){ if(PLAY.mode==='quick') return; return _m2Add(xp,patch,why); }; },careerAdd);
/* ---- detail panel and actions */
const NAV_D={
  start:['OYNA','Başla','Hızlı oyun: hemen uç, gez ya da hangarı incele — puan kazandırmaz, her şey açık. Kariyer: görevler, eğitim ve ilerleme.',[],'Seç'],
  q_free:['HIZLI OYUN','Serbest Uçuş','Adayı dilediğin gibi keşfet. Bu modda tecrübe puanı kazanılmaz, bütün uçaklar açık.',[],'▶ Uçuşa başla'],
  q_walk:['HIZLI OYUN','Üssü Gez','Yürü, araçlara ve helikopterlere bin, araç çağır. Puan kazandırmaz.',[],'▶ Gezmeye başla'],
  q_hangar:['HIZLI OYUN','Hangar','Bütün uçakları, helikopterleri ve boyaları dene. Kilit yok.',[],'Hangara git'],
  careerMenu:['KARİYER','Kariyer','Er’den Orgeneral’e: görev yap, eğitim al, tecrübe puanı kazan. Rütbe yükseldikçe yeni görevler, uçaklar, araçlar ve boyalar açılır.',[],'Kariyere gir'],
  c_missions:['KARİYER','Görevler','Rütbene göre açılan görevler: uçak, helikopter, dinamik görevler ve yarışlar. Kilitli görevlerin yanında gereken rütbe yazar.',[],'Görev panosu'],
  c_school:['KARİYER','Eğitim','Uçuş okulu: kalkış, iniş, rüzgârlı iniş, helikopter, askı yükü, silah, gemiye iniş. Lisans ve madalya kazandırır.',[],'Eğitime git'],
  c_walk:['KARİYER','Serbest Gezi','Adayı kariyer modunda gez: uçuş, iniş, gemi inişi ve keşif tecrübe puanı kazandırır.',[],'▶ Gezmeye başla'],
  c_hangar:['KARİYER','Hangar','Kariyer hangarı: rütbene göre açılmış uçaklar ve boyalar. Kilitli olanların yanında gereken rütbe yazar.',[],'Hangara git'],
  back:['MENÜ','Geri','Bir önceki menüye dön.',[],'Geri']};
titleDetail=HOOK.wrap('titleDetail','89-menu2#_m2Detail',function(_m2Detail){ return function(act){ const d=NAV_D[act]; if(!d) return _m2Detail(act); const el=$('cDet'); if(!el) return; const p=accProfile();
  const chips=act==='careerMenu'||act.indexOf('c_')===0?['<span>Rütbe <b>'+rankName(p.rank||0)+'</b></span>','<span>TP <b>'+(p.xp||0).toLocaleString('tr-TR')+'</b></span>']:(act.indexOf('q_')===0?['<span>Puan <b>kazanılmaz</b></span>','<span>Kilit <b>yok</b></span>']:[]);
  $('cdK').textContent=d[0]; $('cdT').textContent=d[1]; $('cdD').textContent=d[2]; $('cdC').innerHTML=chips.join(''); $('cdGo').textContent=d[4]; $('cdGo').dataset.act=act; $('cdGo').disabled=false; el.classList.remove('anim'); void el.offsetWidth; el.classList.add('anim'); }; },titleDetail);
const _m2Act=titleAct; titleAct=function(act){ if(state!=='menu') return;
  if(act==='start') return navGo('start'); if(act==='careerMenu') return navGo('career'); if(act==='back') return navGo(NAV.level==='career'?'start':'root');
  if(act==='q_free'){ playMode('quick'); return _m2Act('free'); } if(act==='q_walk'){ playMode('quick'); return _m2Act('walk'); } if(act==='q_hangar'){ playMode('quick'); return _m2Act('hangar'); }
  if(act==='c_missions'){ playMode('career'); BF.cat='all'; misSel=0; return openMissions(); } if(act==='c_school'){ playMode('career'); return _m2Act('school'); }
  if(act==='c_walk'){ playMode('career'); return _m2Act('walk'); } if(act==='c_hangar'){ playMode('career'); return _m2Act('hangar'); }
  if(act==='net'||act==='free'||act==='walk'||act==='hangar'||act==='missions'||act==='school'){ if(act==='net') playMode('career'); }
  return _m2Act(act); };
refreshTitle=HOOK.wrap('refreshTitle','89-menu2#_m2Refresh',function(_m2Refresh){ return function(){ if(!$('mc_missions')){ const s=document.createElement('span'); s.id='mc_missions'; s.hidden=true; document.body.appendChild(s); } _m2Refresh(); navRender(); }; },refreshTitle);
/* Esc goes up one level in the menu */
window.addEventListener('keydown',function(e){ if(state==='menu'&&menuMode==='title'&&e.code==='Escape'&&NAV.level!=='root'&&!(typeof anyModalOpen==='function'&&anyModalOpen())){ e.preventDefault(); e.stopImmediatePropagation(); navGo(NAV.level==='career'?'start':'root'); } },true);
/* header buttons + admin library row (built here so the page skeleton stays small) */
(function(){ const ic=function(d){ return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">'+d+'</svg>'; };
  const pr=$('cProf'); if(pr&&pr.parentNode&&!$('cIbtns')&&document.createElement){ const d=document.createElement('div'); d.className='c-ibtns ui'; d.id='cIbtns';
    d.innerHTML='<button type="button" data-act="settings" title="Ayarlar" aria-label="Ayarlar">'+ic('<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>')+'</button><button type="button" data-act="records" title="Rekorlar" aria-label="Rekorlar">'+ic('<path d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4M12 14v4M8 21h8"/>')+'</button><button type="button" data-act="admin" class="mc adm" title="Yönetim" aria-label="Yönetim">'+ic('<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>')+'</button>';
    if(pr.parentNode.insertBefore) pr.parentNode.insertBefore(d,pr); }
  const am=$('admMsg'); if(am&&am.parentNode&&!$('admLibs')&&document.createElement){ const d=document.createElement('div'); d.className='admlibs'; d.id='admLibs'; d.innerHTML='<b>Kütüphaneler</b><button type="button" class="btn sm" data-l="models">Model kütüphanesi</button><button type="button" class="btn sm" data-l="sounds">Ses kütüphanesi</button>'; if(am.parentNode.insertBefore) am.parentNode.insertBefore(d,am); } })();
(function(){ const h=$('cIbtns'); if(h) h.addEventListener('click',function(e){ const b=e.target.closest('button[data-act]'); if(b) _m2Act(b.dataset.act); }); })();
/* ---- board: rank requirements in career */
renderMissions=HOOK.wrap('renderMissions','89-menu2#_m2Render',function(_m2Render){ return function(){ _m2Render(); const L=boardList();
  Array.prototype.forEach.call(document.querySelectorAll('#misList .mitem'),function(b){ const e=L[+b.dataset.i]; if(e&&misLocked(e)){ b.classList.add('lock'); const bc=b.querySelector('.bc'); if(bc) bc.textContent='🔒 '+rankName(misReq(e))+' rütbesinde açılır'; } });
  const e=L[misSel]; if(e&&misLocked(e)){ $('btnMisGo').textContent='🔒 '+rankName(misReq(e))+' rütbesi gerekli'; } }; },renderMissions);
misGo=HOOK.wrap('misGo','89-menu2#_m2Go',function(_m2Go){ return function(){ const e=boardList()[misSel]; if(e&&misLocked(e)){ toast('🔒 Bu görev '+rankName(misReq(e))+' rütbesinde açılır — eğitim ve açık görevlerle TP kazan','#ffc24a'); return; } return _m2Go(); }; },misGo);
/* ---- admin panel: libraries */
(function(){ const a=$('admLibs'); if(a) a.addEventListener('click',function(e){ const b=e.target.closest('button[data-l]'); if(!b) return; $('adminUI').classList.add('hidden'); if(b.dataset.l==='models') openLibrary(); else openSoundLib(); }); })();
playMode(PLAY.mode);
