/* ------------------------------------------------------------------ input + menu */
let menuMode='title';
function showScreen(name){ $('startUI').classList.add('hidden'); ['title','hangarUI','setupUI','pause','missionsUI'].forEach(function(id){ $(id).classList.toggle('hidden',id!==name); }); }
function openControls(){ $('controls').classList.remove('hidden'); $('btnCtlClose').focus(); }
function closeControls(){ $('controls').classList.add('hidden'); }
function enterTitle(){ if(!NET.on) aiClear(); state='menu'; menuMode='title'; if(activeId!==selectedId) setAircraft(selectedId); showScreen('title'); setPrep(false,[],''); refreshTitle(); }
/* ---------- main menu (A: Komuta, B: Sinematik) */
let tFocus=0, startFrom='hangar', misSel=0;
const START_TXT={hangar:'hangardan',runway:'pistten',air:'havada',walk:'üssü gezerek'};
/* V2.26: only the current main menu is kept (the older 'Komuta' and 'Sinematik' designs were removed at the player's request) */
function uiStyle(){ return 'C'; }
function titleItems(){ const adm=typeof accIsAdmin==='function'&&accIsAdmin(); return Array.prototype.slice.call(document.querySelectorAll('#titleC .mitem:not([disabled])')).filter(function(b){ return adm||['library','sounds','admin'].indexOf(b.dataset.act)<0; }); }
function titleFocus(i){ const L=titleItems(); if(!L.length) return; tFocus=(i+L.length)%L.length; L.forEach(function(b,j){ b.classList.toggle('kf',j===tFocus); });
  if(uiStyle()==='C'){ titleDetail(L[tFocus].dataset.act); try{ L[tFocus].scrollIntoView({block:'nearest'}); }catch(e){} } }
/* detail panel of the new menu: what the focused item does, live facts, one big action */
function titleDetail(act){
  const a=AIRCRAFT[selectedId], chip=function(k,v){ return '<span>'+k+(v!=null?' <b>'+v+'</b>':'')+'</span>'; }, pl=(SETTINGS.startPlace&&typeof placeById==='function'&&placeById(SETTINGS.startPlace))||null;
  const D={
    free:['OYNA','Serbest Uçuş','Adayı dilediğin gibi keşfet: üsler, şehirler, köprüler, adalar. Süre ve düşman yok (Ayarlar → Oynanış ile açabilirsin).',[chip('Uçak',a.short),chip('Başlangıç',START_TXT[startPick]),chip('Yer',pl?pl.n:'Ay Yıldız Hava Üssü')],'▶ Uç'],
    missions:['OYNA','Görevler',MORDER.length+' görev: halka parkuru, it dalaşı, yer hedefleri, keşif ve daha fazlası. Brifingi okuyup uçağını seç.',[chip('Seçili',MISSIONS[missionId==='net'?'free':missionId].name),chip('Uçak',a.short)],'Görevleri aç'],
    school:['OYNA','Uçuş Okulu','8 ders: kalkış, trafik turu, iniş, rüzgârlı iniş, helikopterde asılı kalma, askı yükü, silah kullanımı, gemiye iniş. Eğitmen telsizden anlatır; dersleri bitirince lisans ve madalya kazanırsın.',[chip('Ders',(typeof schDone==='function'?schDone():0)+' / 8'),chip('Lisans','Pilot · Helikopter · Silah')],'Okula git'],
    career:['OYNA','Kariyer','Er’den Orgeneral’e: uçtukça tecrübe puanı kazan, terfi et, madalya topla, yeni uçakların kilidini aç.',[chip('Rütbe',rankName(accProfile().rank||0)),chip('TP',(accProfile().xp||0).toLocaleString('tr-TR'))],'Kariyerimi aç'],
    net:['OYNA','Çok Oyunculu','Arkadaşlarınla 4 kişiye kadar: işbirliği, takım ya da herkes herkese. Oda kodu ile katıl, sesli sohbet et.',[chip(navigator.onLine===false?'Çevrimdışı':'İnternet var'),chip('Oyuncu','2–4')],'Oda kur / katıl'],
    walk:['OYNA','Üssü Gez','Yürü, zıpla, araçlara ve helikopterlere bin. Haritadan istediğin yere ışınlan.',[chip('Araç','SUV, 4×4'),chip('Helikopter','T129, T625')],'▶ Gezmeye başla'],
    hangar:['ÜS','Hangar','Uçağını seç, boyasını ve mühimmatını ayarla, hangarda 3B incele.',[chip('Uçak',a.name),chip('Yük',loadSummary(selectedId))],'Hangara git'],
    library:['ÜS','Model Kütüphanesi','Bütün uçak, helikopter, gemi, kara ve sivil araçları 3B incele; boyut ve parça bilgilerine bak.',[chip('Kategori','5')],'Kütüphaneyi aç'],
    sounds:['ÜS','Ses Kütüphanesi','Motor, silah, çevre, arayüz, telsiz sesleri ve müzikler. Dinle, ayarla ya da kendi dosyanla değiştir.',[chip('Ses',SND_DEFS.length)],'Kütüphaneyi aç'],
    settings:['SİSTEM','Ayarlar','Grafik, kontroller (klavye, gamepad, dokunmatik), ses, oynanış ve arayüz.',[chip('Kalite',['Düşük','Orta','Yüksek','Ultra'][SETTINGS.quality]),chip('Cihaz',DEV.kind)],'Ayarları aç'],
    records:['SİSTEM','Rekorlar','Uçak ve görev bazında en iyi süreler ve puanlar.',[],'Rekorları aç'],
    admin:['SİSTEM','Yönetim','Oyuncular ve rütbeleri, duyurular, model / ses / müzik yayınlama, uzaktan oyun ayarları ve işlem kaydı. Yalnız yöneticiye görünür.',[chip('Rol','Yönetici')],'Paneli aç']};
  const d=D[act]; if(!d) return; const el=$('cDet');
  $('cdK').textContent=d[0]; $('cdT').textContent=d[1]; $('cdD').textContent=d[2]; $('cdC').innerHTML=d[3].join(''); $('cdGo').textContent=d[4]; $('cdGo').dataset.act=act; $('cdGo').disabled=false;
  el.classList.remove('anim'); void el.offsetWidth; el.classList.add('anim');
}
/* input hints follow the last device used */
let lastIn=DEV.mobile?'touch':'kb';
function titleHints(){ const h=$('cHint'); if(!h) return; const v='<span class="v">'+GAME_VERSION+'</span>';
  h.innerHTML=(lastIn==='pad'?'<span><kbd>✛</kbd>Seç</span><span><kbd>A</kbd>Aç</span><span><kbd>B</kbd>Geri</span>':lastIn==='touch'?'<span>Bir bölüme dokun, sonra sağdaki düğmeyle başlat</span>':'<span><kbd>↑</kbd><kbd>↓</kbd>Seç</span><span><kbd>Enter</kbd>Aç</span><span><kbd>Esc</kbd>Geri</span><span><kbd>M</kbd>Harita (oyunda)</span>')+v; }
function setLastIn(k){ if(lastIn===k) return; lastIn=k; if(menuMode==='title') titleHints(); }
window.addEventListener('keydown',function(){ setLastIn('kb'); },true);
window.addEventListener('pointerdown',function(e){ setLastIn(e.pointerType==='touch'?'touch':'kb'); },true);
function refreshTitle(){
  const st=uiStyle(), a=AIRCRAFT[selectedId], r=regOf(selectedId);
  $('title').classList.add('ui-c');
  if(st==='C'){ $('mc_missions').textContent=MORDER.length+' görev'; $('cName').textContent=SETTINGS.callsign||'Misafir pilot'; titleHints(); }
  $('tCap').querySelector('b').textContent=a.name; $('tCap').querySelector('small').textContent='Hilal Kanatlar · '+(CLASSES[r.cls]||'').toUpperCase();
  const sb='<b>'+a.name+'</b> · '+loadSummary(selectedId); $('sbAc').innerHTML=sb; $('sbAc2').innerHTML=sb;
  const on=(typeof navigator.onLine==='boolean')?navigator.onLine:true; $('sbNet').textContent=on?'İnternet var · çok oyunculu hazır':'Çevrimdışı'; $('sbNet').className=on?'on':'';
  titleFocus(tFocus);
}
function titleAct(act){
  if(state!=='menu') return;
  if((act==='fly'||act==='free')&&rankLocked(selectedId)){ toast('🔒 '+AIRCRAFT[selectedId].name+' '+rankName(RANK_LOCK[selectedId])+' rütbesinde açılır — hangardan başka uçak seç','#ffc24a'); enterHangar(); return; }
  if(act==='fly'){ startGame(startPick); return; }
  if(act==='free'){ if(missionId!=='free') selectMission('free'); startGame(startPick==='walk'?'hangar':startPick); return; }
  if(act==='walk'){ startGame('walk'); return; }
  if((act==='sounds'||act==='library')&&!accIsAdmin()) return;
  if(act==='sounds'){ openSoundLib(); return; }
  if(act==='records'){ renderRecords(); openModal('records'); return; }
  if(act==='career'){ accOpen('career'); return; }
  if(act==='admin'){ admOpen(); return; }
  if(act==='hangar'){ enterHangar(); return; }
  if(act==='missions'){ openMissions(); return; }
  if(act==='school'){ BF.cat='okul'; misSel=0; openMissions(); return; }
  if(act==='net'){ openNet(); return; }
  if(act==='settings'){ syncSettingsUI(); openModal('settings'); return; }
  if(act==='library'){ openLibrary(); return; }
}
$('title').addEventListener('click',function(e){ const b=e.target.closest('.mitem'); if(!b||b.disabled) return;
  /* new menu: a tap/click on a section first shows its details (touch), a second one (or the big button) opens it */
  if(uiStyle()==='C'&&lastIn==='touch'&&!b.classList.contains('kf')){ const L=titleItems(); titleFocus(L.indexOf(b)); return; }
  titleAct(b.dataset.act); });
$('cdGo').addEventListener('click',function(){ titleAct(this.dataset.act); });
$('cNav').addEventListener('pointerover',function(e){ if(e.pointerType!=='mouse') return; const b=e.target.closest('.mitem'); if(!b||b.disabled) return; const L=titleItems(), i=L.indexOf(b); if(i>=0&&i!==tFocus) titleFocus(i); });
$('cProf').addEventListener('click',function(){ syncSettingsUI(); openModal('settings'); const t=document.querySelector('#setTabs [data-tab="s"]'); if(t) t.click(); toast('Profil ve rütbe sistemi V1.66–V1.67 ile geliyor; çağrı adını Ses sekmesinden değiştirebilirsin','#b8ecff'); });
window.addEventListener('online',function(){ if(menuMode==='title') refreshTitle(); }); window.addEventListener('offline',function(){ if(menuMode==='title') refreshTitle(); });
/* missions screen */
function openMissions(){ state='menu'; menuMode='missions'; showScreen('missionsUI'); misSel=Math.max(0,MORDER.indexOf(missionId)); renderMissions(); }
function renderMissions(){
  const r=rec(selectedId);
  $('misList').innerHTML=MORDER.map(function(id,i){ const M0=MISSIONS[id], best=(id==='rings'||id==='free')?r.best:(r.mt||{})[id];
    const right=best!=null?'<small class="rec">REKOR '+fmtT(best)+'</small>':'<small>'+(M0.limit?Math.round(M0.limit/60)+' DK':(id==='rings'?'13 HALKA':(id==='dogfight'?'3 DALGA':'SÜRESİZ')))+'</small>';
    return '<li><button type="button" class="mitem'+(i===misSel?' kf':'')+'" data-i="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+M0.name.toUpperCase()+right+'</button></li>'; }).join('');
  const id=MORDER[misSel], M0=MISSIONS[id], c=aiCfg();
  $('misK').textContent='GÖREV '+String(misSel+1).padStart(2,'0')+(M0.limit?' · SÜRE '+Math.round(M0.limit/60)+' DK':'');
  $('misName').textContent=M0.name; $('misDesc').textContent=M0.desc;
  const ch=[];
  if(id==='dogfight') ch.push('<span><b>3</b> dalga</span>','<span><b>2–4</b> düşman uçağı</span>');
  else if(c.enemies) ch.push('<span><b>'+c.enemies+'</b> düşman uçağı</span>');
  ch.push('<span>Kanat adamı: '+(c.wing?'açık':'kapalı')+'</span>','<span>Zorluk: '+SKILL[c.skill].name+'</span>');
  $('misChips').innerHTML=ch.join('');
  $('btnMisAc').textContent='Uçak: '+AIRCRAFT[selectedId].short;
}
function misGo(){ selectMission(MORDER[misSel]); preFlight('missions'); }
$('misList').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; const i=+b.dataset.i; if(i===misSel) misGo(); else { misSel=i; renderMissions(); } });
$('btnMisGo').addEventListener('click',function(){ misGo(); });
$('btnMisAc').addEventListener('click',enterHangar);
$('btnMisBack').addEventListener('click',enterTitle);
