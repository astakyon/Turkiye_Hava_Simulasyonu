/* ------------------------------------------------------------------ settings tab wiring, hangar → loadout → start → pause flow (from giris-menu, V2.25) */
$('setTod').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.tod=b.dataset.t; saveSettings(); todReset(); syncSettingsUI(); });
$('setFx').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; SETTINGS.fx=+b.dataset.f; FX.failed=false; saveSettings(); applyFX(); syncSettingsUI(); });
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
  if(state!=='menu') return;
  if(rankLocked(selectedId)){ toast('🔒 '+AIRCRAFT[selectedId].name+' '+rankName(RANK_LOCK[selectedId])+' rütbesinde açılır','#ffc24a'); return; } loadFrom=(from==='missions')?'missions':'hangar';
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
  $('suPre').innerHTML=n>0?LPRESETS.filter(function(p){ return p.f(selectedId); }).map(function(p){ return '<button type="button" data-p="'+p.id+'">'+p.n+'</button>'; }).join(''):'';
  /* pylon diagram: stations spread symmetric along the wing, coloured by weapon */
  const order=[]; WORDER.forEach(function(k){ for(let i=0;i<(l[k]||0);i++) order.push(k); }); while(order.length<n) order.push(null);
  const pos=[]; for(let i=0;i<n;i++){ const side=i%2?1:-1, j=Math.floor(i/2), span=n<=2?1:Math.floor((n-1)/2)+1; pos.push(50+side*(10+38*(j+0.5)/span)); }
  const sorted=order.slice().sort(function(a,b){ return (a?WORDER.indexOf(a):9)-(b?WORDER.indexOf(b):9); });
  const col={gp:'#7d8a5a',bnk:'#4f6a9a',m1:'#e8e8e8',m2:'#9fd0ff',m3:'#ffc24a'};
  $('suPyl').innerHTML=n>0?'<svg class="ac" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><g transform="rotate(-90 50 20) translate(30 -30) scale(0.4 2.5)"><polygon fill="currentColor" points="'+SIL[SIL_OF[selectedId]||'uav']+'"/></g></svg>'+
    pos.map(function(x,i){ const k=sorted[i]; return '<span class="pd" style="left:'+x+'%;top:62%;'+(k?'background:'+col[k]+';border-color:#fff;color:#08101c':'')+'" title="'+(k?WEAPONS[k].name:'boş')+'">'+(k?WEAPONS[k].short:'')+'</span>'; }).join(''):'';
  const kg=WORDER.reduce(function(s,k){ return s+(l[k]||0)*WKG[k]; },0), mxkg=n*560, f=Math.min(1,kg/(mxkg||1));
  $('suWtBar').style.width=Math.round(f*100)+'%'; $('suWt').textContent=n>0?('Toplam yük '+kg.toLocaleString('tr-TR')+' kg · sürükleme '+(f<0.35?'düşük':f<0.7?'orta':'yüksek')+(f>0.7?' — hız ve manevra azalır':'')):'';
}
const WKG={gp:230,bnk:900,m1:90,m2:160,m3:280};
/* ready-made loads: fill the stations with what the aircraft may carry */
const LPRESETS=[
  {id:'aa',n:'Hava-hava',f:function(id){ return wpnOf(id).some(function(k){ return WEAPONS[k].air; }); },mix:function(id,n){ const w=wpnOf(id); return w.indexOf('m2')>=0&&w.indexOf('m1')>=0?{m2:Math.ceil(n/2),m1:Math.floor(n/2)}:{[w.find(function(k){ return WEAPONS[k].air; })]:n}; }},
  {id:'ag',n:'Kara taarruzu',f:function(){ return true; },mix:function(id,n){ const w=wpnOf(id), o={}; const b=w.indexOf('gp')>=0?'gp':w[0]; o[b]=Math.ceil(n/2); const r=w.indexOf('m3')>=0?'m3':(w.indexOf('bnk')>=0?'bnk':b); o[r]=(o[r]||0)+Math.floor(n/2); return o; }},
  {id:'sead',n:'Sığınak / zırh',f:function(id){ const w=wpnOf(id); return w.indexOf('bnk')>=0||w.indexOf('m3')>=0; },mix:function(id,n){ const w=wpnOf(id), o={}; const a=w.indexOf('bnk')>=0?'bnk':'m3', b=w.indexOf('m3')>=0?'m3':a; o[a]=Math.ceil(n/2); o[b]=(o[b]||0)+Math.floor(n/2); return o; }},
  {id:'rec',n:'Keşif (hafif)',f:function(id){ return wpnOf(id).indexOf('m1')>=0; },mix:function(id,n){ return {m1:Math.min(2,n)}; }},
  {id:'clr',n:'Boşalt',f:function(){ return true; },mix:function(){ return {}; }}];
$('suPre').addEventListener('click',function(e){ const b=e.target.closest('button[data-p]'); if(!b) return; const P=LPRESETS.find(function(p){ return p.id===b.dataset.p; }), n=SLOTS[selectedId]||0, m=P.mix(selectedId,n), l=loadoutOf(selectedId);
  WORDER.forEach(function(k){ l[k]=m[k]||0; }); try{ localStorage.setItem('kaan-sim-loadouts',JSON.stringify(LOADOUTS)); }catch(err){} if(typeof refreshStoresVisual==='function'&&activeId===selectedId){ applyLoadout(selectedId); } refreshSetup(); });
$('suLoad').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled) setupAdjust(b.dataset.k,+b.dataset.d); });
function aiSave(){ SETTINGS.ai={enemies:+$('aiEnemy').value,wing:$('aiWing').value==='1',skill:+$('aiSkill').value,sam:$('aiSam').value==='1'}; saveSettings(); }
['aiEnemy','aiWing','aiSkill','aiSam'].forEach(function(id){ $(id).addEventListener('change',aiSave); });
$('startSeg').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b) launchFrom(b.dataset.s); });
$('btnLoadDone').addEventListener('click',loadDone);
$('btnLoadBack').addEventListener('click',closeLoadPanel);
$('btnPlay').addEventListener('click',function(){ if(HSEL) heliFromHangar(HSEL); else preFlight('hangar'); });
$('btnStartX').addEventListener('click',closeStart);
$('startUI').addEventListener('click',function(e){ if(e.target===$('startUI')) closeStart(); });
$('acPrev').addEventListener('click',function(){ cycleAircraft(-1); });
$('acNext').addEventListener('click',function(){ cycleAircraft(1); });
function startGame(mode){
  if(typeof fxReset==='function') fxReset();
  if(mode==='walk'){ startWalk(); const sp=SETTINGS.startPlace&&placeById(SETTINGS.startPlace); if(sp&&sp.g){ MAPV.from='walk'; teleportTo(sp); } return; }
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
  $('btnCmp').setAttribute('aria-pressed',String(!!CMP));
  if(HSEL){ const D=HELI_DEF[HSEL];
    $('hName').textContent=D.name; $('hKind').textContent='TUSAŞ · Helikopter'; $('hDesc').textContent=HSEL==='t129'?'Çift motorlu taarruz ve taktik keşif helikopteri. Tandem kokpit, 20 mm burun topu, roket ve UMTAS füzesi taşır. Hava Üssü helipadinden kalkar.':'Genel maksat helikopteri: geniş kabin, 2 pilot ve 12 yolcuya kadar. Arama-kurtarma ve yük taşıma. Hava Üssü helipadinden kalkar.';
    const st=[['UZUNLUK',D.len+' m'],['ROTOR ÇAPI',(D.R*2).toFixed(1).replace('.',',')+' m'],['AZAMİ HIZ',Math.round(D.top*3.6)+' km/sa'],['TIRMANMA',D.climb+' m/s'],['MÜRETTEBAT',HSEL==='t129'?'2 pilot':'2 + 12']];
    $('hStats').innerHTML=st.map(function(t){ return '<li><small>'+t[0]+'</small><b>'+t[1]+'</b></li>'; }).join(''); $('hPerf').innerHTML=perfHTML(HSEL);
    $('acPos').textContent=(HSEL==='t129'?1:2)+' / 2'; $('btnPlay').textContent='▶ Helikopterle uç';
    Array.prototype.forEach.call($('acChips').children,function(b){ b.setAttribute('aria-checked',String(b.dataset.heli===HSEL)); }); return; }
  $('btnPlay').textContent=rankLocked(selectedId)?'🔒 '+rankName(RANK_LOCK[selectedId])+' rütbesinde açılır':'▶ Oyuna başla'; $('btnPlay').classList.toggle('locked',rankLocked(selectedId));
  const a=AIRCRAFT[selectedId];
  $('hName').textContent=a.name; $('hKind').textContent=regOf(selectedId).maker+' · '+a.kind; $('hDesc').textContent=a.desc;
  const st=[['UZUNLUK',a.len],['AÇIKLIK',a.span],['SİLAH YERİ',SLOTS[selectedId]>0?String(SLOTS[selectedId]):'—'],['FLARE',String(FLARES[selectedId]||0)],['MÜRETTEBAT',a.uav?'İnsansız':'Pilotlu']]; if(a.hasAB) st.push(['MOTOR','Art yakıcı']);
  $('hStats').innerHTML=st.map(function(t){ return '<li><small>'+t[0]+'</small><b>'+t[1]+'</b></li>'; }).join(''); $('hPerf').innerHTML=perfHTML(selectedId);
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
  $('clsSeg').innerHTML='<button type="button" data-c="all" aria-pressed="'+(pickCls==='all')+'">Tümü</button>'+used.map(function(c){ return '<button type="button" data-c="'+c+'" aria-pressed="'+(pickCls===c)+'">'+CLASSES[c]+'</button>'; }).join('')+
    (pickGrp==='hava'?'<button type="button" data-c="heli" aria-pressed="'+(pickCls==='heli')+'">Helikopter</button>':'');
}
function setCls(c){ pickCls=c; if(c==='heli'){ buildPicker(); selectHeli(HSEL||'t129'); return; } HSEL=null; buildPicker(); const L=pickList(); if(L.length&&L.indexOf(selectedId)<0) selectAircraft(L[0]); else refreshHangarUI(); }
$('clsSeg').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b) setCls(b.dataset.c); });
$('grpTabs').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled){ pickGrp=b.dataset.g; pickCls='all'; buildPicker(); } });
function buildPicker(){
  buildGroups();
  const box=$('acChips'); box.innerHTML='';
  if(pickCls==='heli'){ $('acCount').textContent='2 helikopter';
    ['t129','t625'].forEach(function(id){ const b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.heli=id; b.setAttribute('role','radio');
      b.innerHTML=heliSVG()+'<span>'+HELI_DEF[id].name.replace('T129 ','').replace('T625 ','')+'</span><small>'+(id==='t129'?'T129 · Taarruz':'T625 · Genel maksat')+'</small>'; b.addEventListener('click',function(){ selectHeli(id); }); box.appendChild(b); });
    refreshHangarUI(); return; }
  const L=pickList(); $('acCount').textContent=L.length+' araç';
  L.forEach(function(id){
    const a=AIRCRAFT[id], b=document.createElement('button');
    b.type='button'; b.className='chip'; b.dataset.id=id; b.setAttribute('role','radio');
    b.innerHTML=silSVG(id)+'<span>'+a.short+'</span><small>'+(rankLocked(id)?'🔒 '+rankName(RANK_LOCK[id]):regOf(id).maker)+'</small>';
    b.addEventListener('click',function(){ selectAircraft(id); });
    box.appendChild(b);
  });
  refreshHangarUI();
}
function heliSVG(){ return '<svg viewBox="0 0 100 40" aria-hidden="true"><g fill="currentColor"><rect x="4" y="19" width="92" height="2" rx="1"/><ellipse cx="58" cy="25" rx="18" ry="6"/><rect x="18" y="23.5" width="34" height="3" rx="1.5"/><rect x="12" y="18" width="3" height="10"/><rect x="56" y="18" width="3" height="5"/></g></svg>'; }
/* helicopters in the hangar: shown on the air base helipad, flown from there (walk mode heli) */
let HSEL=null, CMP=null;
function selectHeli(id){ HSEL=id; MENUV.init=false; MENUV.idle=0; refreshHangarUI(); }
function heliFromHangar(id){
  startWalk(); const H=HELI.list.find(function(h){ return h.id===id&&h.at==='Ay Yıldız Hava Üssü'; })||HELI.list.find(function(h){ return h.id===id; }); if(!H) return;
  if(H.crashT>0){ H.crashT=0; heliRespawn(H); } WALK.pos.set(H.x+6,groundH(H.x,H.z)+1.7,H.z+4); heliBoard(H); WALK.hint=10;
}
function perfOf(id){ if(HELI_DEF[id]){ const D=HELI_DEF[id]; return {v:D.top*3.6, man:D.yawR*0.55, thr:D.climb/14, load:id==='t129'?6:4}; }
  const a=AIRCRAFT[id]; return {v:a.vTop*3.6, man:(a.roll||1)*(a.pitchMax||1)/4.2, thr:(a.abT||a.thrust||1)/14, load:SLOTS[id]||0}; }
function perfHTML(id){
  const P=perfOf(id), C=CMP&&CMP!==id?perfOf(CMP):null, mx={v:1100,man:1,thr:1,load:8};
  const row=function(n,k,txt,ct){ const w=Math.max(4,Math.min(100,P[k]/mx[k]*100)), cw=C?Math.max(4,Math.min(100,C[k]/mx[k]*100)):0;
    return '<span>'+n+'</span><div class="bar"><i style="width:'+w+'%"></i>'+(C?'<i class="c" style="width:'+cw+'%"></i>':'')+'</div><b>'+txt+(C?' / '+ct:'')+'</b>'; };
  return row('HIZ','v',Math.round(P.v)+' km/sa',C&&Math.round(C.v))+row('MANEVRA','man',Math.round(P.man*100)+'',C&&Math.round(C.man*100))+row('İTKİ','thr',Math.round(P.thr*100)+'',C&&Math.round(C.thr*100))+row('SİLAH YERİ','load',String(P.load||'—'),C&&(C.load||'—'))+
    (C?'<span class="cmpl">Sarı çizgi: '+(HELI_DEF[CMP]?HELI_DEF[CMP].name:AIRCRAFT[CMP].name)+'</span>':'');
}
$('btnCmp').addEventListener('click',function(){ const cur=HSEL||selectedId; CMP=(CMP===cur)?null:cur; this.setAttribute('aria-pressed',String(!!CMP)); if(CMP) toast('Sabitlendi — şimdi karşılaştırmak için başka bir araç seç','#ffc24a'); refreshHangarUI(); });
function selectAircraft(id){
  HSEL=null; if(pickCls==='heli'){ pickCls='all'; buildPicker(); }
  selectedId=id; try{ localStorage.setItem('kaan-sim-aircraft',id); }catch(e){}
  if(state==='menu'){ setAircraft(id); resetFlight('runway'); }
  refreshHangarUI();
}
function cycleAircraft(d){ if(HSEL){ selectHeli(HSEL==='t129'?'t625':'t129'); return; } const L=pickList().length?pickList():AC_ORDER; const i=Math.max(0,L.indexOf(selectedId)); selectAircraft(L[(i+d+L.length)%L.length]); }
$('btnControls').addEventListener('click',openControls);
$('btnPauseControls').addEventListener('click',openControls);
$('btnCtlClose').addEventListener('click',closeControls);
$('btnBack').addEventListener('click',enterTitle);
$('btnResume').addEventListener('click',resumeGame);
$('btnToHangar').addEventListener('click',toHangarFromPause);
$('btnWalk').addEventListener('click',function(){ if(state==='paused') startWalk(); });
$('gl').addEventListener('click',()=>$('gl').focus());


/* start screen: where to start */
function refreshStartPlace(){ const el=$('startPlace'); if(!el) return; if(!el.dataset.ok){ el.dataset.ok='1'; el.innerHTML=PLACES.map(function(p){ return '<option value="'+p.id+'">'+p.n+(p.rw||p.id==='base'?'':' (havada)')+'</option>'; }).join(''); }
  el.value=SETTINGS.startPlace||'base'; }
$('startPlace').addEventListener('change',function(e){ const p=placeById(e.target.value); if(p){ SETTINGS.startPlace=p.id==='base'?null:p.id; saveSettings(); } });
refreshStartPlace();
