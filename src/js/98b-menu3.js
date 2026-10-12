/* ------------------------------------------------------------------ menu, hangar and flow fixes (V1.91)
   Quick play: HIZLI OYUN (last vehicle, instantly) · SERBEST UÇUŞ / SÜRÜŞ (→ hangar) · HIZLI GÖREV (any mission) · ÜSSÜ GEZ (pick a base).
   The "Uçuşa hazır" dialog is gone: mission options (enemies, wingman, SAM, difficulty, airfield) live on the mission screen,
   the start position (hangar / runway / air) on the loadout screen, which now always comes after the aircraft.
   Loadout: the player's own quick groups per aircraft (save the current load, one click to apply, × to delete).
   Hangar: every vehicle — aircraft, helicopters, land vehicles (Altay, Pars, Fırtına…) and ships (patrol boat, corvette,
   TCG Anadolu…) — in one cycle (‹ ›), each can be started directly. Top bar no longer overlaps; paint and real-data
   buttons are clickable again. Pause menu: Ana menü. Admin icon fixed. */
/* ---------- land and sea vehicles in the hangar */
const HV={
  kara:[['altay','Altay','Ana muharebe tankı','BMC'],['firtina','Fırtına','Kundağı motorlu obüs','MKE'],['pars','Pars 8×8','Zırhlı muharebe aracı','FNSS'],['kirpi','Kirpi','Mayına dayanıklı araç','BMC'],
    ['korkut','Korkut','Uçaksavar topu','ASELSAN'],['hisar','Hisar','Hava savunma füzesi','ASELSAN / Roketsan'],['mil','Bozkurtlar 4×4','Taktik tekerlekli araç','Ay Yıldız'],['truck','Askerî kamyon','Lojistik','BMC'],
    ['suv','Ay Yıldız SUV','Otomobil','Ay Yıldız'],['fire','İtfaiye aracı','Havalimanı kurtarma','Ay Yıldız']],
  deniz:[['patrol','Hücumbot','Karakol botu','Türk Tersaneleri'],['frigate','Ada sınıfı korvet','MİLGEM korvet','STM / İstanbul Tersanesi'],['anadolu','TCG Anadolu','Amfibi hücum gemisi','Sedef Tersanesi'],
    ['tug','Römorkör','Liman hizmeti',''],['fishing','Balıkçı teknesi','Balıkçılık',''],['sail','Yelkenli','Gezi','']]};
const HV_ENV={altay:'ld:altay',firtina:'ld:firtina',pars:'ld:pars',korkut:'ld:korkut',hisar:'ld:hisar',frigate:'sh:ada',anadolu:'sh:anadolu',patrol:'sh:patrol'};
const HV_DESC={altay:'Türkiye’nin yeni nesil ana muharebe tankı. 120 mm top, paletli; olduğu yerde döner.',firtina:'155 mm kundağı motorlu obüs. Paletli, ağır ve yavaş ama güçlü.',
  pars:'8×8 tekerlekli zırhlı muharebe aracı. Hızlı, otomatik toplu.',kirpi:'Mayına dayanıklı, korumalı personel taşıyıcı.',korkut:'35 mm namlulu kundağı motorlu uçaksavar.',hisar:'Alçak irtifa hava savunma füze sistemi.',
  mil:'Bozkurtlar taktik 4×4 aracı: arazide çevik.',truck:'Askerî yük ve personel kamyonu.',suv:'Üs içinde dolaşmak için binek araç.',fire:'Havalimanı itfaiye aracı; su topu ile yangın söndürür.',
  patrol:'Hızlı karakol botu; otomatik top.',frigate:'MİLGEM Ada sınıfı korvet: helikopter güvertesi ve top.',anadolu:'Türkiye’nin amfibi hücum gemisi. Çok büyük ve yavaş; geniş uçuş güvertesi.',
  tug:'Liman römorkörü.',fishing:'Küçük balıkçı teknesi.',sail:'Gezi yelkenlisi.'};
if(typeof BOAT_KINDS!=='undefined'&&!BOAT_KINDS.anadolu) BOAT_KINDS.anadolu={n:'TCG Anadolu',top:11,acc:0.25,turn:0.05,gun:'cannon',cam:6,build:function(){ return buildAnadolu(); }};
GROUPS.forEach(function(g){ if(g.id==='deniz'){ g.on=true; g.sub='Deniz araçları'; } if(g.id==='kara'){ g.on=true; g.sub='Kara araçları'; } });
let VSEL=null;                       /* {g:'kara'|'deniz', id} */
function hvOf(g,id){ const L=HV[g]||[]; return L.find(function(v){ return v[0]===id; }); }
function hvKind(v){ return v.g==='kara'?CAR_KINDS.find(function(k){ return k.id===v.id; }):BOAT_KINDS[v.id]; }
const ALLV=function(){ const L=AC_ORDER.map(function(id){ return {t:'ac',id:id}; }); ['t129','t625'].forEach(function(id){ L.push({t:'heli',id:id}); });
  HV.kara.forEach(function(v){ L.push({t:'kara',id:v[0]}); }); HV.deniz.forEach(function(v){ L.push({t:'deniz',id:v[0]}); }); return L; };
function curV(){ if(VSEL) return {t:VSEL.g,id:VSEL.id}; if(HSEL) return {t:'heli',id:HSEL}; return {t:'ac',id:selectedId}; }
function selectV(v){ if(v.t==='ac'){ VSEL=null; if(pickGrp!=='hava'||pickCls==='heli'){ pickGrp='hava'; pickCls='all'; } HSEL=null; buildPicker(); selectAircraft(v.id); return; }
  if(v.t==='heli'){ VSEL=null; pickGrp='hava'; pickCls='heli'; buildPicker(); selectHeli(v.id); return; }
  HSEL=null; VSEL={g:v.t,id:v.id}; pickGrp=v.t; pickCls='all'; MENUV.init=false; MENUV.idle=0; buildPicker(); }
cycleAircraft=function(d){ const L=ALLV(), c=curV(); let i=L.findIndex(function(x){ return x.t===c.t&&x.id===c.id; }); if(i<0) i=0; selectV(L[(i+d+L.length)%L.length]); };
const _m3Pick=buildPicker; buildPicker=function(){ if(pickGrp==='hava'){ VSEL=null; return _m3Pick(); }
  buildGroups(); $('clsSeg').innerHTML='<button type="button" data-c="all" aria-pressed="true">Tümü</button>';
  const box=$('acChips'); box.innerHTML=''; const L=HV[pickGrp]; $('acCount').textContent=L.length+' araç';
  if(!VSEL||VSEL.g!==pickGrp) VSEL={g:pickGrp,id:L[0][0]}; HSEL=null;
  L.forEach(function(v){ const b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.v=v[0]; b.setAttribute('role','radio'); b.setAttribute('aria-checked',String(VSEL.id===v[0]));
    b.innerHTML=(pickGrp==='kara'?hvSVGk():hvSVGs())+'<span>'+v[1]+'</span><small>'+v[2]+'</small>'; b.addEventListener('click',function(){ VSEL={g:pickGrp,id:v[0]}; MENUV.init=false; MENUV.idle=0; buildPicker(); }); box.appendChild(b); });
  refreshHangarUI(); };
function hvSVGk(){ return '<svg viewBox="0 0 100 40" aria-hidden="true"><g fill="currentColor"><rect x="14" y="18" width="70" height="12" rx="3"/><rect x="34" y="11" width="26" height="8" rx="2"/><rect x="58" y="13" width="34" height="3"/><circle cx="24" cy="31" r="4"/><circle cx="40" cy="31" r="4"/><circle cx="56" cy="31" r="4"/><circle cx="72" cy="31" r="4"/></g></svg>'; }
function hvSVGs(){ return '<svg viewBox="0 0 100 40" aria-hidden="true"><g fill="currentColor"><path d="M6 22h88l-8 10H16z"/><rect x="40" y="12" width="20" height="10"/><rect x="48" y="5" width="3" height="8"/></g></svg>'; }
const _m3Ref=refreshHangarUI; refreshHangarUI=function(){ _m3Ref(); if(!VSEL) { const b=$('btnEnvAc'); if(b) b.dataset.k=''; return; } const v=hvOf(VSEL.g,VSEL.id), K=hvKind(VSEL); if(!v||!K) return;
  $('hName').textContent=v[1]; $('hKind').textContent=(v[3]?v[3]+' · ':'')+v[2]; $('hDesc').textContent=HV_DESC[VSEL.id]||'';
  const st=[['AZAMİ HIZ',Math.round(K.top*3.6)+' km/sa'],['TÜR',VSEL.g==='kara'?(K.tracked?'Paletli':'Tekerlekli'):'Deniz aracı'],['SİLAH',K.weapon==='cannon'||K.gun==='cannon'?'Top':(K.weapon==='auto'||K.gun==='auto'?'Otomatik top':(K.weapon==='water'?'Su topu':'—'))],['MÜRETTEBAT','Sürücü']];
  $('hStats').innerHTML=st.map(function(t){ return '<li><small>'+t[0]+'</small><b>'+t[1]+'</b></li>'; }).join('');
  const sp=Math.round(K.top*3.6); $('hPerf').innerHTML='<span>HIZ</span><div class="bar"><i style="width:'+Math.max(4,Math.min(100,sp/1100*100*4))+'%"></i></div><b>'+sp+' km/sa</b>';
  const L=HV[VSEL.g], i=L.findIndex(function(x){ return x[0]===VSEL.id; }); $('acPos').textContent=(i+1)+' / '+L.length;
  $('btnPlay').textContent=VSEL.g==='kara'?'▶ Sürmeye başla':'▶ Dümene geç'; $('btnPlay').classList.remove('locked');
  const pa=$('hPaint'); if(pa) pa.classList.add('hidden'); const e=$('btnEnvAc'); if(e){ e.dataset.k=HV_ENV[VSEL.id]||''; e.classList.toggle('hidden',!HV_ENV[VSEL.id]); }
  Array.prototype.forEach.call($('acChips').children,function(b){ b.setAttribute('aria-checked',String(b.dataset.v===VSEL.id)); }); hvShow(); };
/* showcase model: land vehicles on the hall floor, ships off the naval base */
const HVS={key:null,g:null,pos:new THREE.Vector3(),tv:new THREE.Vector3(),up:new THREE.Vector3(),dist:20};
const HV_SEA=[-2200,-3900];
function hvShow(){ const key=VSEL?VSEL.g+':'+VSEL.id:null; if(key===HVS.key) return; if(HVS.g){ scene.remove(HVS.g); HVS.g=null; } HVS.key=key; if(!key) return;
  try{ let g, L=6; if(VSEL.g==='kara'){ const m=carBuild(VSEL.id); g=m.g; L=m.len||6; HVS.pos.set(HANGAR.cx,AIRFIELD_Y+0.25,936); g.position.copy(HVS.pos); g.rotation.y=0.6; }
    else { const sh=BOAT_KINDS[VSEL.id].build(); g=new THREE.Group(); g.add(bakeGroup(sh.group)); L=sh.L||12; HVS.pos.set(HV_SEA[0],0,HV_SEA[1]); g.position.copy(HVS.pos); g.rotation.y=Math.PI/2; }
    g.traverse(function(o){ o.userData.noCull=true; }); g.userData.noCull=true; scene.add(g); HVS.g=g; HVS.dist=Math.max(9,L*1.5); }catch(e){ console.warn('vitrin',e); } }
const _m3Enter=enterHangar; enterHangar=function(){ _m3Enter(); if(HVS.g){ HVS.g.visible=true; } try{ buildPicker(); }catch(e){} };
const _m3Title=enterTitle; enterTitle=function(){ VSEL=null; hvShow(); return _m3Title(); };
const _m3MenuCam=menuCam; menuCam=function(dt){ if(!(VSEL&&state==='menu'&&menuMode==='hangar'&&HVS.g)) return _m3MenuCam(dt);
  const k=1-Math.exp(-3*dt); if(!MENUV.init){ MENUV.tgt.copy(HVS.pos); MENUV.dist=HVS.dist; MENUV.init=true; }
  MENUV.tgt.lerp(HVS.tv.copy(HVS.pos).add(HVS.up.set(0,VSEL.g==="kara"?1.4:6,0)),k); MENUV.dist+=(HVS.dist*MENUV.zoom-MENUV.dist)*k; MENUV.idle+=dt; if(MENUV.idle>3) MENUV.yaw+=dt*0.12;
  const cp=Math.cos(MENUV.pitch), sp=Math.sin(MENUV.pitch); camera.position.set(MENUV.tgt.x+Math.sin(MENUV.yaw)*cp*MENUV.dist, MENUV.tgt.y+Math.max(0.15,sp)*MENUV.dist, MENUV.tgt.z+Math.cos(MENUV.yaw)*cp*MENUV.dist);
  const gy=Math.max(groundH(camera.position.x,camera.position.z),0)+1.2; if(camera.position.y<gy) camera.position.y=gy; camera.lookAt(MENUV.tgt);
  if(Math.abs(50-lastFov)>0.05){ camera.fov=50; lastFov=50; camera.updateProjectionMatrix(); } camera.updateMatrixWorld(); };
/* ---------- starting with any vehicle; the last one is remembered for HIZLI OYUN */
const LASTV={v:null}; try{ const s=localStorage.getItem('ayy-lastv'); if(s) LASTV.v=JSON.parse(s); }catch(e){}
function lastSet(v){ LASTV.v=v; try{ localStorage.setItem('ayy-lastv',JSON.stringify(v)); }catch(e){} }
function lastName(v){ v=v||LASTV.v; if(!v) return AIRCRAFT.kaan.name; if(v.t==='ac') return (AIRCRAFT[v.id]||AIRCRAFT.kaan).name; if(v.t==='heli') return HELI_DEF[v.id].name; const h=hvOf(v.t,v.id); return h?h[1]:'—'; }
function vehStart(v){ if(v.g==='kara'){ startWalk(); const c=vehNew(v.id,HG.X0+9,896,Math.PI/2); c.called=true; WALK.car=c; WALK.mode='car'; c.v=0; WALK.cy=0; WALK.pos.set(c.x,groundH(c.x,c.z)+1.7,c.z); toast(c.K.n+' — W/S gaz-fren · A/D direksiyon · E in','#b8ecff'); }
  else { startWalk(); buildBoats(); let b=BOATS.find(function(x){ return x.id===v.id&&x.id!=='anadolu'; });
    if(!b){ const K=BOAT_KINDS[v.id], sh=K.build(), g=new THREE.Group(); g.add(bakeGroup(sh.group)); scene.add(g); b={id:v.id,K:K,g:g,L:sh.L||12,B:sh.B||Math.max(3,(sh.L||12)*0.18),x:HV_SEA[0],z:HV_SEA[1],h:Math.PI/2,v:0,th:0,yr:0,cd:0,bob:0,deck:sh.deck||null}; BOATS.push(b); boatPlace(b,0);
      if(b.deck){ const d=b.deck; SHIPDECKS.push({x:b.x,z:b.z,y:d.y,r:d.r,local:new THREE.Vector3(0,d.y,d.z),g:g,mover:b,name:K.n+' güvertesi'}); } }
    WALK.pos.set(b.x,2,b.z); boatBoard(b); }
  lastSet({t:v.g,id:v.id}); }
document.getElementById('btnPlay').addEventListener('click',function(e){ if(!VSEL) return; e.stopImmediatePropagation(); vehStart(VSEL); },true);
const _m3Heli=heliFromHangar; heliFromHangar=function(id){ lastSet({t:'heli',id:id}); return _m3Heli(id); };
const _m3SG=startGame; startGame=function(mode){ const r=_m3SG(mode); if(mode!=='walk'&&state==='play') lastSet({t:'ac',id:activeId}); return r; };
function quickPlay(){ playMode('quick'); const v=LASTV.v||{t:'ac',id:'kaan'};
  if(v.t==='ac'){ selectedId=AIRCRAFT[v.id]?v.id:'kaan'; setAircraft(selectedId); if(missionId!=='free') selectMission('free'); startGame(startPick==='walk'||startPick==='hangar'?'runway':startPick); return; }
  if(v.t==='heli'){ heliFromHangar(v.id); return; } vehStart({g:v.t,id:v.id}); }
/* ---------- no "Uçuşa hazır" dialog: loadout screen always, start position chosen there */
preFlight=function(from){ if(state!=='menu') return;
  if(rankLocked(selectedId)){ toast('🔒 '+AIRCRAFT[selectedId].name+' '+rankName(RANK_LOCK[selectedId])+' rütbesinde açılır','#ffc24a'); return; }
  loadFrom=(from==='missions')?'missions':'hangar'; menuMode='loadout'; MENUV.idle=99; MENUV.zoom=1.05; MENUV.pitch=0.16; if(activeId!==selectedId) setAircraft(selectedId); showScreen('setupUI'); refreshSetup(); };
openStart=function(){ m3Launch(); };
loadDone=function(){ m3Launch(); };
function m3Launch(){ if(state!=='menu') return; const s=(startPick==='walk'||!startPick)?'runway':startPick; $('startUI').classList.add('hidden'); startGame(s); }
const START3=[['hangar','Hangardan','Taksi yolundan piste'],['runway','Pistten','Kalkışa hazır'],['air','Havada','Doğrudan uçuş']];
function m3StartUI(){ const el=$('suStart'); if(!el) return; if(startPick==='walk') startPick='runway';
  el.innerHTML=START3.map(function(s){ return '<button type="button" data-s="'+s[0]+'" aria-pressed="'+(startPick===s[0])+'"><b>'+s[1]+'</b><small>'+s[2]+'</small></button>'; }).join(''); }
const _m3Setup=refreshSetup; refreshSetup=function(){ _m3Setup(); m3StartUI(); m3Groups(); const b=$('btnLoadDone'); if(b) b.textContent=loadFrom==='missions'?'▶ Göreve başla':'▶ Uçuşa başla';
  const k=document.querySelector('#setupUI .step'); if(k) k.textContent=(SLOTS[selectedId]>0?'Silah yükü':'Uçuş öncesi')+' · başlama yeri'; };
/* ---------- my quick groups (per aircraft) */
const LGRP={}; try{ Object.assign(LGRP,JSON.parse(localStorage.getItem('ayy-lgroups')||'{}')); }catch(e){}
function lgSave(){ try{ localStorage.setItem('ayy-lgroups',JSON.stringify(LGRP)); }catch(e){} }
function lgName(l){ return WORDER.filter(function(k){ return l[k]>0; }).map(function(k){ return WEAPONS[k].short+'×'+l[k]; }).join(' ')||'Boş'; }
function m3Groups(){ const el=$('suGrp'); if(!el) return; const n=SLOTS[selectedId]||0; el.classList.toggle('hidden',!(n>0)); if(!(n>0)) return; const L=LGRP[selectedId]||[];
  el.innerHTML='<span class="lgk">Gruplarım</span>'+L.map(function(g,i){ return '<span class="lg"><button type="button" data-g="'+i+'" title="'+lgName(g.l)+'">'+String(g.n).replace(/[<>&]/g,'')+'</button><button type="button" class="x" data-gx="'+i+'" aria-label="Sil">×</button></span>'; }).join('')+
    (L.length<6?'<button type="button" class="add" data-gadd="1">+ Bu yükü kaydet</button>':''); }
function lgApply(i){ const g=(LGRP[selectedId]||[])[i]; if(!g) return; const l=loadoutOf(selectedId), n=SLOTS[selectedId]||0, allowed=wpnOf(selectedId); let used=0;
  WORDER.forEach(function(k){ const c=allowed.indexOf(k)>=0?Math.min(g.l[k]||0,n-used):0; l[k]=c; used+=c; }); LOADOUTS[selectedId]=l; saveLoadouts(); applyLoadout(selectedId); refreshSetup(); toast('Yük grubu: '+g.n,'#7dffb0'); }
(function(){ const el=$('suGrp'); if(!el) return; el.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.gadd){ const L=LGRP[selectedId]=LGRP[selectedId]||[], l=loadoutOf(selectedId), c={}; WORDER.forEach(function(k){ if(l[k]>0) c[k]=l[k]; }); L.push({n:'Grup '+(L.length+1)+' · '+lgName(c),l:c}); lgSave(); m3Groups(); toast('Yük grubu kaydedildi','#7dffb0'); return; }
  if(b.dataset.gx!=null){ const L=LGRP[selectedId]||[]; L.splice(+b.dataset.gx,1); lgSave(); m3Groups(); return; }
  if(b.dataset.g!=null) lgApply(+b.dataset.g); });
  el.addEventListener('dblclick',function(e){ const b=e.target.closest('button[data-g]'); if(!b) return; const g=(LGRP[selectedId]||[])[+b.dataset.g]; if(!g) return;
    const inp=document.createElement('input'); inp.className='inp lgin'; inp.value=g.n; inp.maxLength=28; b.replaceWith(inp); inp.focus(); inp.select();
    const done=function(){ g.n=(inp.value||'').trim()||g.n; lgSave(); m3Groups(); }; inp.addEventListener('keydown',function(ev){ ev.stopPropagation(); if(ev.key==='Enter') done(); if(ev.key==='Escape') m3Groups(); }); inp.addEventListener('blur',done); }); })();
(function(){ const s=$('suStart'); if(s) s.addEventListener('click',function(e){ const b=e.target.closest('button[data-s]'); if(!b) return; selectStart(b.dataset.s); m3StartUI(); }); })();
/* move the mission options (AI, airfield) from the old dialog to the mission screen */
(function(){ const ai=document.querySelector('#startUI .airow'), sp=document.querySelector('#startUI .splace'), host=$('misOpts');
  if(host&&ai){ host.appendChild(ai); } if(host&&sp){ host.appendChild(sp); } })();
/* ---------- title menu: quick play items */
NAV_IC.bolt='<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'; NAV_IC.flag='<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>';
const _m3Nav=navRender; navRender=function(){ _m3Nav(); if(NAV.level!=='start') return; const el=$('cNav'); if(!el) return;
  const p=accProfile(), r=p.rank||0;
  el.innerHTML='<p class="mg">HIZLI OYUN <small>· her şey açık, puan kazandırmaz</small></p>'+navBtn('q_quick','Hızlı Oyun',lastName()+' ile hemen başla','bolt')+navBtn('q_free','Serbest Uçuş / Sürüş','Hangarda aracını seç','plane')+
    navBtn('q_mis','Hızlı Görev','Bütün görevler açık','target')+navBtn('q_walk','Üssü Gez','Başlayacağın üssü seç','walk')+
    '<p class="mg">KARİYER</p>'+navBtn('careerMenu','Kariyer',rankName(r)+' · '+(p.xp||0).toLocaleString('tr-TR')+' TP','star','car')+navBtn('back','Geri','','back','bk');
  tFocus=Math.min(tFocus,Math.max(0,titleItems().length-1)); titleFocus(tFocus); };
Object.assign(NAV_D,{q_quick:['HIZLI OYUN','Hızlı Oyun','En son kullandığın araçla tek tıkla oyuna gir: uçak, helikopter, tank ya da gemi.',[],'▶ Hemen başla'],
  q_free:['HIZLI OYUN','Serbest Uçuş / Sürüş','Hangara git; uçak, helikopter, kara ya da deniz aracını seç, silah yükünü ve başlama yerini belirle. Süre ve kısıt yok.',[],'Hangara git'],
  q_mis:['HIZLI OYUN','Hızlı Görev','Bütün görevler kilitsiz: uçak, helikopter, dinamik görevler ve yarışlar. Düşman, kanat adamı ve zorluk görev ekranında.',[],'Görevleri aç'],
  q_walk:['HIZLI OYUN','Üssü Gez','Hava, deniz ya da kara üssünde başla: yürü, araçlara ve helikopterlere bin.',[],'Üs seç']});
const _m3Act=titleAct; titleAct=function(act){ if(state!=='menu') return;
  if(act==='q_quick') return quickPlay();
  if(act==='q_free'){ playMode('quick'); if(missionId!=='free') selectMission('free'); VSEL=null; enterHangar(); buildPicker(); return; }
  if(act==='q_mis'){ playMode('quick'); BF.cat='all'; misSel=0; return openMissions(); }
  if(act==='q_walk'){ playMode('quick'); return basePickOpen(); }
  return _m3Act(act); };
/* base picker for ÜSSÜ GEZ */
const BASES=['base','naval','land','uav','marina','village','hilalkent','anadolukent'];
function basePickOpen(){ const el=$('baseUI'); if(!el) return; const L=BASES.map(placeById).filter(function(p){ return p&&p.g; });
  $('baseList').innerHTML=L.map(function(p){ return '<button type="button" data-b="'+p.id+'"><b>'+p.n+'</b><small>'+({air:'Hava üssü',navy:'Deniz üssü',army:'Kara üssü',sea:'Marina',town:'Köy',city:'Şehir'}[p.k]||'')+'</small></button>'; }).join('');
  el.classList.remove('hidden'); const f=$('baseList').querySelector('button'); if(f) try{ f.focus(); }catch(e){} }
function basePick(id){ const p=placeById(id); $('baseUI').classList.add('hidden'); if(!p) return; startWalk(); if(id!=='base'){ MAPV.from='walk'; teleportTo(p); } toast('📍 '+p.n+' — gezmeye başla','#7dffb0'); }
(function(){ if(!$('baseUI')) return; MODALS.push('baseUI'); $('baseList').addEventListener('click',function(e){ const b=e.target.closest('button[data-b]'); if(b) basePick(b.dataset.b); });
  $('btnBaseX').addEventListener('click',function(){ $('baseUI').classList.add('hidden'); }); })();
/* ---------- pause menu: back to the main menu */
function toMenuFromPause(){ if(state!=='paused') return; if(NET.on){ netLeave(); return; } if(typeof RP!=='undefined'&&RP.on) rpClose(); enterHangar(); enterTitle(); }
(function(){ const a=$('btnToHangar'); if(a&&a.parentNode&&!$('btnToMenu')){ const b=document.createElement('button'); b.className='btn'; b.id='btnToMenu'; b.type='button'; b.textContent='Ana menü'; a.parentNode.insertBefore(b,a.nextSibling); b.addEventListener('click',toMenuFromPause); }
  const sub=document.querySelector('#pause .sub'); if(sub) sub.textContent='Uçağı ya da aracı değiştirmek için hangara, menüye dönmek için Ana menü.'; })();
/* ---------- admin icon: no menu-item styling on the round header button */
(function(){ const b=document.querySelector('#cIbtns [data-act="admin"]'); if(b){ b.classList.remove('mc'); b.classList.remove('adm'); b.classList.add('admonly'); } })();
/* real-data button in the hangar follows the selection (aircraft, helicopter, land / sea vehicle) */
(function(){ const b=$('btnEnvAc'); if(b) b.addEventListener('click',function(e){ const k=VSEL?HV_ENV[VSEL.id]:(HSEL?'heli:'+HSEL:null); if(k){ e.stopImmediatePropagation(); envOpen(k); } },true); })();
