/* ------------------------------------------------------------------ input + menu */
let menuMode='title';
function showScreen(name){ $('startUI').classList.add('hidden'); ['title','hangarUI','setupUI','pause','missionsUI'].forEach(function(id){ $(id).classList.toggle('hidden',id!==name); }); }
function openControls(){ $('controls').classList.remove('hidden'); $('btnCtlClose').focus(); }
function closeControls(){ $('controls').classList.add('hidden'); }
function controlsOpen(){ return !$('controls').classList.contains('hidden'); }
function enterTitle(){ if(!NET.on) aiClear(); state='menu'; menuMode='title'; if(activeId!==selectedId) setAircraft(selectedId); showScreen('title'); setPrep(false,[],''); refreshTitle(); }
/* ---------- main menu (A: Komuta, B: Sinematik) */
let tFocus=0, startFrom='hangar', misSel=0;
const START_TXT={hangar:'hangardan',runway:'pistten',air:'havada',walk:'üssü gezerek'};
function uiStyle(){ const s=SETTINGS.ui||'auto'; if(s==='A'||s==='B') return s; let coarse=false; try{ coarse=window.matchMedia('(pointer:coarse)').matches; }catch(e){} return (coarse||Math.min(window.innerWidth,window.innerHeight)<500)?'B':'A'; }
function titleItems(){ return Array.prototype.slice.call(document.querySelectorAll(uiStyle()==='A'?'#titleA .mitem':'#titleB .mitem')); }
function titleFocus(i){ const L=titleItems(); if(!L.length) return; tFocus=(i+L.length)%L.length; L.forEach(function(b,j){ b.classList.toggle('kf',j===tFocus); }); }
function refreshTitle(){
  const st=uiStyle(), a=AIRCRAFT[selectedId], r=regOf(selectedId);
  $('title').classList.toggle('ui-a',st==='A'); $('title').classList.toggle('ui-b',st==='B');
  const sub=a.short+' · '+MISSIONS[missionId==='net'?'free':missionId].name+' · '+START_TXT[startPick];
  $('flySubA').textContent=sub; $('flySubB').textContent=sub;
  $('mAac').textContent=AC_ORDER.length+' ARAÇ'; $('mAmis').textContent=MORDER.length+' GÖREV'; $('mAload').textContent=(uiStyle()==='A'?'ARAYÜZ · KOMUTA':'');
  $('tCap').querySelector('b').textContent=a.name; $('tCap').querySelector('small').textContent='Hilal Kanatlar · '+(CLASSES[r.cls]||'').toUpperCase();
  const sb='<b>'+a.name+'</b> · '+loadSummary(selectedId); $('sbAc').innerHTML=sb; $('sbAc2').innerHTML=sb;
  const on=(typeof navigator.onLine==='boolean')?navigator.onLine:true; $('sbNet').textContent=on?'İnternet var · çok oyunculu hazır':'Çevrimdışı'; $('sbNet').className=on?'on':'';
  titleFocus(tFocus);
}
function titleAct(act){
  if(state!=='menu') return;
  if(act==='fly'){ startGame(startPick); return; }
  if(act==='hangar'){ enterHangar(); return; }
  if(act==='missions'){ openMissions(); return; }
  if(act==='net'){ openNet(); return; }
  if(act==='settings'){ syncSettingsUI(); openModal('settings'); return; }
}
$('title').addEventListener('click',function(e){ const b=e.target.closest('.mitem'); if(b){ titleAct(b.dataset.act); } });
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
$('btnMisGo').addEventListener('click',misGo);
$('btnMisAc').addEventListener('click',enterHangar);
$('btnMisBack').addEventListener('click',enterTitle);
/* cinematic flight behind the main menu */
const CINE={shot:0,shotT:0,fix:new THREE.Vector3(),off:new THREE.Vector3(),ang:0.6,pos:new THREE.Vector3(),fwd:new THREE.Vector3(),q:new THREE.Quaternion(),bank:0,init:false};
const cV1=new THREE.Vector3(), cV2=new THREE.Vector3(), cV3=new THREE.Vector3(), cM=new THREE.Matrix4(), cUP=new THREE.Vector3(0,1,0);
/* camera shots around the flying aircraft: f = along the nose, r = to the side, u = up (in aircraft lengths); fly = fixed camera the aircraft flies past */
const CINE_SHOTS=[{f:-0.8,r:0.75,u:0.12,dur:8},{f:1.25,r:0.7,u:0.18,dur:6},{f:-0.25,r:0.35,u:1.15,dur:6},{f:0,r:0.9,u:0.2,dur:4,fly:true},{f:0.25,r:0.95,u:-0.35,dur:6},{f:-1.3,r:0.12,u:0.22,dur:6}];
function cineOn(){ return state==='menu'&&(menuMode==='title'||menuMode==='missions'||(menuMode==='start'&&startFrom==='missions')); }
function cineStep(dt){
  const R=3300; CINE.spd=Math.max(40,AIRCRAFT[selectedId].airV*0.55); CINE.ang+=dt*CINE.spd/R;
  const a=CINE.ang; CINE.pos.set(700+Math.cos(a)*R,1350+Math.sin(a*2.3)*60,-1600+Math.sin(a)*R);
  CINE.fwd.set(-Math.sin(a),Math.cos(a*2.3)*60*2.3/R,Math.cos(a)).normalize(); CINE.bank=-0.42;
  cV1.crossVectors(CINE.fwd,cUP).normalize(); cV2.crossVectors(cV1,CINE.fwd).normalize();
  const cb=Math.cos(CINE.bank), sb=Math.sin(CINE.bank);
  cV3.copy(cV1).multiplyScalar(cb).addScaledVector(cV2,-sb); cV2.multiplyScalar(cb).addScaledVector(cV1,sb); cV1.copy(CINE.fwd).negate();
  cM.makeBasis(cV3,cV2,cV1); CINE.q.setFromRotationMatrix(cM);
}
$('setFx').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.fx=+b.dataset.f; FX.failed=false; saveSettings(); applyFX(); syncSettingsUI(); });
$('btnModelPick').addEventListener('click',function(){ $('modelFile').click(); });
$('modelFile').addEventListener('change',function(e){ const f=e.target.files&&e.target.files[0]; if(f) previewModelFile(f); e.target.value=''; });
$('btnModelRot').addEventListener('click',previewRotate); $('btnModelClr').addEventListener('click',previewClear);
$('setShadow').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.shadows=b.dataset.s==='1'; saveSettings(); applyShadows(); syncSettingsUI(); });
$('setTabs').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; setTab(b.dataset.tab); });
function setTab(t){ Array.prototype.forEach.call($('setTabs').children,function(x){ x.setAttribute('aria-selected',String(x.dataset.tab===t)); }); Array.prototype.forEach.call(document.querySelectorAll('#settings section'),function(s){ s.classList.toggle('hidden',s.dataset.tab!==t); }); }
$('setUi').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.ui=b.dataset.u; saveSettings(); syncSettingsUI(); refreshTitle(); });
function enterHangar(){
  walkLeave(); WALK.from='play';
  if(!NET.on) aiClear();
  setPrep(false,[],''); state='menu'; menuMode='hangar'; MENUV.idle=0; MENUV.zoom=1; MENUV.pitch=0.2;
  setAircraft(selectedId); resetFlight('runway'); showScreen('hangarUI'); refreshHangarUI();
}
let startPick='hangar'; try{ const sp=localStorage.getItem('kaan-sim-start'); if(sp==='hangar'||sp==='runway'||sp==='air') startPick=sp; }catch(e){}
const START_ORDER=['hangar','runway','air','walk'];
function loadSummary(id){ const n=SLOTS[id]||0; if(n<=0) return 'silah taşımaz'; const l=loadoutOf(id), parts=WORDER.filter(function(k){ return l[k]>0; }).map(function(k){ return WEAPONS[k].short+'×'+l[k]; }); return parts.join(' · ')||'boş'; }
let loadFrom='hangar';
function preFlight(from){            // after picking the aircraft: weapons first (if it carries any), then the start dialog
  if(state!=='menu') return; loadFrom=(from==='missions')?'missions':'hangar';
  if(SLOTS[selectedId]>0) openLoadPanel(loadFrom); else openStart(loadFrom);
}
function loadDone(){ const f=loadFrom; if(f==='missions'){ menuMode='missions'; showScreen('missionsUI'); renderMissions(); } else { menuMode='hangar'; MENUV.idle=0; MENUV.zoom=1; MENUV.pitch=0.2; showScreen('hangarUI'); refreshHangarUI(); } openStart(f); }
function openLoadPanel(from){
  if(state!=='menu'||!(SLOTS[selectedId]>0)) return; if(from) loadFrom=from;
  menuMode='loadout'; MENUV.idle=99; MENUV.zoom=1.05; MENUV.pitch=0.16;
  if(activeId!==selectedId) setAircraft(selectedId); showScreen('setupUI'); refreshSetup();
}
function closeLoadPanel(){ if(loadFrom==='missions'){ openMissions(); return; } menuMode='hangar'; MENUV.idle=0; MENUV.zoom=1; MENUV.pitch=0.2; showScreen('hangarUI'); refreshHangarUI(); }
function openStart(from){ if(state!=='menu') return; startFrom=(from==='missions')?'missions':'hangar'; menuMode='start'; $('startUI').classList.remove('hidden'); refreshStart(); }
function closeStart(){ $('startUI').classList.add('hidden'); menuMode=startFrom==='missions'?'missions':'hangar'; }
function refreshStart(){
  $('stSub').textContent=AIRCRAFT[selectedId].name+' · '+loadSummary(selectedId);
  Array.prototype.forEach.call($('startSeg').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.s===startPick)); });
  refreshMission();
}
function selectStart(s){ startPick=s; try{ localStorage.setItem('kaan-sim-start',s); }catch(e){} refreshStart(); }
function cycleStart(d){ const n=START_ORDER.length; selectStart(START_ORDER[(START_ORDER.indexOf(startPick)+d+n)%n]); }
function launchFrom(s){ selectStart(s); $('startUI').classList.add('hidden'); startGame(s); }
function setupAdjust(k,d){
  const n=SLOTS[selectedId]||0, l=Object.assign({},loadoutOf(selectedId)), used=WORDER.reduce(function(a,x){ return a+(l[x]||0); },0);
  if(d>0&&used>=n) return; if(d<0&&(l[k]||0)<=0) return;
  l[k]=(l[k]||0)+d; LOADOUTS[selectedId]=l; saveLoadouts(); applyLoadout(selectedId); refreshSetup();
}
function refreshSetup(){
  const a=AIRCRAFT[selectedId], n=SLOTS[selectedId]||0, l=loadoutOf(selectedId), used=WORDER.reduce(function(s,k){ return s+(l[k]||0); },0);
  $('suName').textContent=a.name; $('suKind').textContent=a.kind;
  $('suSlots').textContent=n>0?('yer '+used+' / '+n+' · flare '+(FLARES[selectedId]||0)):'';
  $('suLoad').innerHTML=n>0?wpnOf(selectedId).map(function(k){
    const W=WEAPONS[k], c=l[k]||0;
    return '<tr><td><b>'+W.name+'</b><small>'+W.tip+'</small></td><td class="cnt"><button type="button" aria-label="'+W.short+' azalt" data-k="'+k+'" data-d="-1"'+(c<=0?' disabled':'')+'>−</button><span>'+c+'</span><button type="button" aria-label="'+W.short+' artır" data-k="'+k+'" data-d="1"'+(used>=n?' disabled':'')+'>+</button></td></tr>';
  }).join(''):'<tr><td>Bu uçak silah taşımıyor.</td></tr>';
}
$('suLoad').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled) setupAdjust(b.dataset.k,+b.dataset.d); });
function aiSave(){ SETTINGS.ai={enemies:+$('aiEnemy').value,wing:$('aiWing').value==='1',skill:+$('aiSkill').value}; saveSettings(); }
['aiEnemy','aiWing','aiSkill'].forEach(function(id){ $(id).addEventListener('change',aiSave); });
$('startSeg').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b) launchFrom(b.dataset.s); });
$('btnLoadDone').addEventListener('click',loadDone);
$('btnLoadBack').addEventListener('click',closeLoadPanel);
$('btnPlay').addEventListener('click',function(){ preFlight('hangar'); });
$('btnStartX').addEventListener('click',closeStart);
$('startUI').addEventListener('click',function(e){ if(e.target===$('startUI')) closeStart(); });
$('acPrev').addEventListener('click',function(){ cycleAircraft(-1); });
$('acNext').addEventListener('click',function(){ cycleAircraft(1); });
function startGame(mode){
  if(typeof fxReset==='function') fxReset();
  if(mode==='walk'){ startWalk(); return; }
  walkLeave(); WALK.from='play';
  initAudio(); padFireLock=true; startMode=mode; CAMU.yaw=0; CAMU.pitch=0; CAMU.zoom=1;
  if(activeId!==selectedId) setAircraft(selectedId);
  resetFlight(mode); score=0; msgs.length=0; camMode=0; setupMission();
  state='play'; showScreen(''); $('gl').focus();
  toast(mode==='hangar'?'Yeşil ışıkları takip ederek taksi yolundan piste git. Pist girişine gelince uçak otomatik duracak ve hazırlıklar başlayacak (T: baştan otomatik taksi, L: taksiyi atla)':(mode==='runway'?'Gazı aç (R), hızlan ve '+Math.round(CUR.vr*3.6)+' km/sa üzerinde burnu kaldır':CUR.name+(MS.rings?' — halkalar seni bekliyor, ilk halka kuzeyde':' — havadasın, iyi uçuşlar')),'#b8ecff');
}
function pauseGame(){ if(state!=='play'&&state!=='walk') return; WALK.from=state; state='paused'; showScreen('pause'); $('btnWalk').classList.toggle('hidden',WALK.from==='walk'||NET.on); }
function resumeGame(){ if(state!=='paused') return; padFireLock=true; state=WALK.from==='walk'?'walk':'play'; showScreen(''); $('gl').focus(); }
function toHangarFromPause(){ if(state!=='paused') return; if(NET.on){ netLeave(); return; } enterHangar(); }
function refreshHangarUI(){
  const a=AIRCRAFT[selectedId];
  $('hName').textContent=a.name; $('hKind').textContent=regOf(selectedId).maker+' · '+a.kind; $('hDesc').textContent=a.desc;
  const st=[['UZUNLUK',a.len],['AÇIKLIK',a.span],['SİLAH YERİ',SLOTS[selectedId]>0?String(SLOTS[selectedId]):'—'],['FLARE',String(FLARES[selectedId]||0)],['MÜRETTEBAT',a.uav?'İnsansız':'Pilotlu']]; if(a.hasAB) st.push(['MOTOR','Art yakıcı']);
  $('hStats').innerHTML=st.map(function(t){ return '<li><small>'+t[0]+'</small><b>'+t[1]+'</b></li>'; }).join('');
  const L=pickList(); $('acPos').textContent=(Math.max(0,L.indexOf(selectedId))+1)+' / '+L.length;
  Array.prototype.forEach.call($('acChips').children,function(b){
    const on=b.dataset.id===selectedId; b.setAttribute('aria-checked',on?'true':'false');
    if(on&&b.scrollIntoView) b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
  });
}
/* top-view silhouettes per airframe type (aircraft points right) */
const SIL={fighter:'96,20 72,16.5 60,5 54,5 57,16 32,17 24,9 18,9 21,17.5 5,18.5 5,21.5 21,22.5 18,31 24,31 32,23 57,24 54,35 60,35 72,23.5',
  jet:'96,20 76,17.5 58,6 53,6 56,17 30,17.5 22,10 17,10 20,18 6,19 6,21 20,22 17,30 22,30 30,22.5 56,23 53,34 58,34 76,22.5',
  wing:'94,20 42,2 34,6 50,18 26,20 50,22 34,34 42,38',
  prop:'92,20 86,18 84,18 84,17 54,18 52,3 47,3 47,18 22,18.5 15,12 11,12 14,19 6,19.5 6,20.5 14,21 11,28 15,28 22,21.5 47,22 47,37 52,37 54,22 84,23 84,22 86,22',
  uav:'94,20 82,18.6 53,18.6 51,1 47,1 47,18.6 20,18.8 12,13 8,13 11,19.3 6,19.6 6,20.4 11,20.7 8,27 12,27 20,21.2 47,21.4 47,39 51,39 53,21.4 82,21.4'};
const SIL_OF={kaan:'fighter',kizilelma:'fighter',hurjet:'jet',anka3:'wing',hurkus:'prop'};
function silSVG(id){ return '<svg viewBox="0 0 100 40" aria-hidden="true"><polygon fill="currentColor" points="'+SIL[SIL_OF[id]||'uav']+'"/></svg>'; }
function buildGroups(){
  $('grpTabs').innerHTML=GROUPS.map(function(g){ return '<button type="button" role="tab" data-g="'+g.id+'" aria-selected="'+(g.id===pickGrp)+'"'+(g.on?'':' disabled')+'>'+g.name+'<small>'+g.sub+'</small></button>'; }).join('');
  const used=Object.keys(CLASSES).filter(function(c){ return AC_ORDER.some(function(id){ const r=regOf(id); return r.grp===pickGrp&&r.cls===c; }); });
  $('clsSeg').innerHTML='<button type="button" data-c="all" aria-pressed="'+(pickCls==='all')+'">Tümü</button>'+used.map(function(c){ return '<button type="button" data-c="'+c+'" aria-pressed="'+(pickCls===c)+'">'+CLASSES[c]+'</button>'; }).join('');
}
function setCls(c){ pickCls=c; buildPicker(); const L=pickList(); if(L.length&&L.indexOf(selectedId)<0) selectAircraft(L[0]); }
$('clsSeg').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b) setCls(b.dataset.c); });
$('grpTabs').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled){ pickGrp=b.dataset.g; pickCls='all'; buildPicker(); } });
function buildPicker(){
  buildGroups();
  const box=$('acChips'); box.innerHTML='';
  const L=pickList(); $('acCount').textContent=L.length+' araç';
  L.forEach(function(id){
    const a=AIRCRAFT[id], b=document.createElement('button');
    b.type='button'; b.className='chip'; b.dataset.id=id; b.setAttribute('role','radio');
    b.innerHTML=silSVG(id)+'<span>'+a.short+'</span><small>'+regOf(id).maker+'</small>';
    b.addEventListener('click',function(){ selectAircraft(id); });
    box.appendChild(b);
  });
  refreshHangarUI();
}
function selectAircraft(id){
  selectedId=id; try{ localStorage.setItem('kaan-sim-aircraft',id); }catch(e){}
  if(state==='menu'){ setAircraft(id); resetFlight('runway'); }
  refreshHangarUI();
}
function cycleAircraft(d){ const L=pickList().length?pickList():AC_ORDER; const i=Math.max(0,L.indexOf(selectedId)); selectAircraft(L[(i+d+L.length)%L.length]); }
$('btnControls').addEventListener('click',openControls);
$('btnPauseControls').addEventListener('click',openControls);
$('btnCtlClose').addEventListener('click',closeControls);
$('btnBack').addEventListener('click',enterTitle);
$('btnResume').addEventListener('click',resumeGame);
$('btnToHangar').addEventListener('click',toHangarFromPause);
$('btnWalk').addEventListener('click',function(){ if(state==='paused') startWalk(); });
$('gl').addEventListener('click',()=>$('gl').focus());

