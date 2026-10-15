/* ------------------------------------------------------------------ career progress (V1.79)
   Paint schemes unlocked by rank (hangar), achievements with progress bars and XP rewards, daily (3) and weekly (2)
   tasks generated from the date, more statistics (distance, night flying, deck landings, storm landings…) and a page in
   the career screen that lists everything that rank unlocks. Rank locks follow RANK_LOCK rules (cloud accounts). */
const PSCHEMES=[
  {id:'std',n:'Standart',r:0,liv:null,sw:'#c3c9ce'},
  {id:'gri',n:'Deniz grisi',r:1,liv:{color:'#8e979f',gloss:0.3},sw:'#8e979f'},
  {id:'col',n:'Çöl kamuflajı',r:2,liv:{color:'#c9b48a',camo:1,camo2:'#8a7350',camoS:1.4},sw:'#c9b48a'},
  {id:'orman',n:'Orman kamuflajı',r:3,liv:{color:'#6f7a52',camo:1,camo2:'#3f4a2e'},sw:'#6f7a52'},
  {id:'dijital',n:'Dijital kamuflaj',r:4,liv:{color:'#8e979f',camo:2,camo2:'#5d6670'},sw:'#7a838b'},
  {id:'gece',n:'Gece',r:6,liv:{color:'#2f363d',gloss:0.2,camo:3,camo2:'#1d2228'},sw:'#2f363d'},
  {id:'kizil',n:'Kızıl Elma',r:8,liv:{color:'#e9ecef',camo:3,camo2:'#c8102e',camoS:1.6,gloss:0.6},sw:'#c8102e'},
  {id:'altin',n:'Altın',r:11,liv:{color:'#c9a24a',gloss:0.9},sw:'#c9a24a'}];
const PAINT={}; try{ Object.assign(PAINT,JSON.parse(localStorage.getItem('ayy-paint')||'{}')); }catch(e){}
function lockedAt(need){ if(typeof accIsAdmin==='function'&&accIsAdmin()) return false; if(SETTINGS.rankLocks===false) return false; return (accProfile().rank||0)<need; }
applyLivery=HOOK.wrap('applyLivery','ag/kariyer-ilerleme#_pLiv',function(_pLiv){ return function(m){ const id=m&&m.acId, P=id&&PAINT[id]&&PSCHEMES.find(function(s){ return s.id===PAINT[id]; }); if(P&&P.liv){ LIV.data[id]=P.liv; } return _pLiv(m); }; },applyLivery);
function paintSet(id,sid){ const P=PSCHEMES.find(function(s){ return s.id===sid; }); if(!P) return; if(lockedAt(P.r)){ toast('🔒 '+P.n+' boyası '+rankName(P.r)+' rütbesinde açılır','#ffc24a'); return; }
  if(sid==='std'){ delete PAINT[id]; delete LIV.data[id]; } else { PAINT[id]=sid; LIV.data[id]=P.liv; }
  try{ localStorage.setItem('ayy-paint',JSON.stringify(PAINT)); }catch(e){} liveryRefresh(id); paintUI(); toast('Boya: '+P.n,'#7dffb0'); }
function paintUI(){ const el=$('hPaint'); if(!el) return; if(HSEL||!AIRCRAFT[selectedId]){ el.classList.add('hidden'); return; } el.classList.remove('hidden');
  const cur=PAINT[selectedId]||'std', skin=!!(MODELS.skins&&MODELS.skins[selectedId]);
  el.innerHTML='<p class="hmh">BOYA'+(skin?' <small>(içe aktarılmış modelde geçerli değil)</small>':'')+'</p><div class="pchips">'+PSCHEMES.map(function(P){ const lk=lockedAt(P.r);
    return '<button type="button" data-p="'+P.id+'" class="'+(cur===P.id?'on':'')+(lk?' lock':'')+'" title="'+P.n+(lk?' · '+rankName(P.r):'')+'"><i style="background:'+P.sw+(P.liv&&P.liv.camo2?';box-shadow:inset -6px -6px 0 '+P.liv.camo2:'')+'"></i><span>'+P.n+(lk?' 🔒':'')+'</span></button>'; }).join('')+'</div>'; }
(function(){ const el=$('hPaint'); if(el) el.addEventListener('click',function(e){ const b=e.target.closest('button[data-p]'); if(b) paintSet(selectedId,b.dataset.p); }); })();
refreshHangarUI=HOOK.wrap('refreshHangarUI','ag/kariyer-ilerleme#_pRefresh',function(_pRefresh){ return function(){ _pRefresh(); paintUI(); }; },refreshHangarUI);
/* ---- achievements */
const ACH=[
  ['fly10','Gökyüzü sakini','10 saat uç','flightSec',36000,500,function(v){ return Math.floor(v/3600)+' / 10 sa'; }],
  ['land100','İniş ustası','100 iniş','landings',100,400],
  ['kills25','Gökyüzü hâkimi','25 düşman uçağı düşür','kills',25,500],
  ['ground100','Kara gücü','100 yer hedefi vur','ground',100,400],
  ['mis25','Görev gazisi','25 görev tamamla','missions',25,500],
  ['dyn10','Dinamik komutan','10 dinamik görev bitir','dyn',10,400],
  ['stars30','Yıldız avcısı','Görevlerde 30 yıldız topla','starsN',30,400],
  ['school','Okul birincisi','Uçuş okulunun 8 dersini bitir','schoolN',8,300],
  ['heli1h','Rotor kurdu','Helikopterle 1 saat uç','heliSec',3600,300,function(v){ return Math.floor(v/60)+' / 60 dk'; }],
  ['deck10','Gemi pilotu','10 kez gemi güvertesine in','deck',10,300],
  ['night','Gece kuşu','Gece 30 dakika uç','nightSec',1800,250,function(v){ return Math.floor(v/60)+' / 30 dk'; }],
  ['storm','Fırtına pilotu','Fırtınada 5 iniş yap','stormLand',5,300],
  ['km','Uzun yol','Toplam 1000 km uç','dist',1000000,400,function(v){ return Math.floor(v/1000)+' / 1000 km'; }],
  ['places','Gezgin','Haritada 20 farklı yere git','placesN',20,250],
  ['eject','Paraşütçü','3 kez fırlat ve sağ kurtul','ejectOk',3,150],
  ['daily','Disiplinli','7 günlük görev tamamla','dailyDone',7,300]];
function progStats(){ const st=accProfile().stats||{}, o=Object.assign({},st); let stars=0; try{ const s=JSON.parse(localStorage.getItem('ayy-stars')||'{}'); for(const k in s) stars+=s[k]||0; }catch(e){}
  o.starsN=stars; o.schoolN=typeof schDone==='function'?schDone():0; o.placesN=(st.places||[]).length; return o; }
const PG={busy:false};
function achCheck(){ if(PG.busy) return; PG.busy=true; try{ const p=accProfile(), st=p.stats||(p.stats={}), got=st.ach||(st.ach=[]), v=progStats();
    ACH.forEach(function(a){ if(got.indexOf(a[0])<0&&(v[a[3]]||0)>=a[4]){ got.push(a[0]); toast('🏆 Başarım: '+a[1]+'  +'+a[5]+' TP','#ffd27a'); careerAdd(a[5],null); } }); taskCheck(); } finally { PG.busy=false; } }
const _pAdd=careerAdd; careerAdd=function(xp,patch,why){ const r=_pAdd(xp,patch,why); if(!PG.busy) achCheck(); return r; };
/* ---- daily and weekly tasks */
const TASK_POOL=[
  {k:'landings',n:'{n} iniş yap',d:[2,4],w:[10,15],xp:60},{k:'takeoffs',n:'{n} kez kalkış yap',d:[2,4],w:[10,15],xp:40},
  {k:'missions',n:'{n} görev tamamla',d:[1,2],w:[5,8],xp:100},{k:'ground',n:'{n} yer hedefi vur',d:[3,8],w:[20,30],xp:80},
  {k:'kills',n:'{n} düşman uçağı düşür',d:[1,3],w:[6,10],xp:100},{k:'flightSec',n:'{n} dakika uç',d:[5,15],w:[45,90],mul:60,xp:60},
  {k:'heliSec',n:'Helikopterle {n} dakika uç',d:[2,6],w:[15,30],mul:60,xp:60},{k:'dyn',n:'{n} dinamik görev bitir',d:[1,1],w:[3,5],xp:120},
  {k:'deck',n:'{n} kez gemi güvertesine in',d:[1,2],w:[4,6],xp:90},{k:'dist',n:'{n} km uç',d:[50,120],w:[400,700],mul:1000,xp:60}];
function dayKey(d){ d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function weekKey(d){ d=d||new Date(); const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())), n=(t.getUTCDay()+6)%7; t.setUTCDate(t.getUTCDate()-n+3); const y0=new Date(Date.UTC(t.getUTCFullYear(),0,4)); return t.getUTCFullYear()+'-H'+String(1+Math.round(((t-y0)/864e5-3+((y0.getUTCDay()+6)%7))/7)).padStart(2,'0'); }
function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function taskGen(key,n,weekly){ const r=mulberry32(hashStr(key)), L=TASK_POOL.slice(); for(let i=L.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=L[i]; L[i]=L[j]; L[j]=t; }
  return L.slice(0,n).map(function(t,i){ const R=weekly?t.w:t.d; let v=R[0]+Math.floor(r()*(R[1]-R[0]+1)); if(t.k==='dist') v=Math.max(10,Math.round(v/10)*10); return {id:(weekly?'w':'d')+i+'_'+t.k,k:t.k,need:v*(t.mul||1),txt:t.n.replace('{n}',v),xp:t.xp*(weekly?4:1)*(weekly?1:1)}; }); }
function tasksNow(){ const p=accProfile(), st=p.stats||(p.stats={}), T0=p.tasks||(p.tasks={}), dk=dayKey(), wk=weekKey(), snap=function(){ const o={}; TASK_POOL.forEach(function(t){ o[t.k]=st[t.k]||0; }); return o; };
  if(T0.day!==dk){ T0.day=dk; T0.dBase=snap(); T0.dDone=[]; } if(T0.week!==wk){ T0.week=wk; T0.wBase=snap(); T0.wDone=[]; }
  const mk=function(L,base,done){ return L.map(function(t){ const v=Math.max(0,(st[t.k]||0)-(base[t.k]||0)); return Object.assign({},t,{v:Math.min(v,t.need),done:done.indexOf(t.id)>=0}); }); };
  return {daily:mk(taskGen(dk,3,false),T0.dBase,T0.dDone),weekly:mk(taskGen(wk,2,true),T0.wBase,T0.wDone),T0:T0}; }
function taskCheck(){ const X=tasksNow(); [['daily','dDone','Günlük'],['weekly','wDone','Haftalık']].forEach(function(q){ X[q[0]].forEach(function(t){ if(!t.done&&t.v>=t.need){ X.T0[q[1]].push(t.id); toast('✅ '+q[2]+' görev: '+t.txt+'  +'+t.xp+' TP','#7dffb0'); _pAdd(t.xp,q[0]==='daily'?{dailyDone:1}:{weeklyDone:1}); } }); }); }
/* ---- extra statistics */
const PS={prevG:true, acc:0, hprev:true};
function progStep(dt){
  const p=accProfile(), st=p.stats||(p.stats={});
  if(state==='play'&&!S.crashed&&!(typeof EJ!=='undefined'&&EJ.on)){
    if(!S.onGround){ st.dist=(st.dist||0)+S.speed*dt; if((TOD.nightK||0)>0.5) st.nightSec=(st.nightSec||0)+dt; }
    if(!PS.prevG&&S.onGround&&typeof WX!=='undefined'&&WX.cur.storm>0.5) careerAdd(40,{stormLand:1});
    PS.prevG=S.onGround; }
  else PS.prevG=true;
  if(state==='walk'&&WALK.mode==='heli'&&HELI.cur){ const H=HELI.cur; if(!PS.hprev&&H.ground&&H.crashT<=0&&typeof deckAt==='function'&&deckAt(H.x,H.z,H.y+0.6)) careerAdd(25,{deck:1}); PS.hprev=H.ground; } else PS.hprev=true;
  PS.acc+=dt; if(PS.acc>20){ PS.acc=0; achCheck(); } }
endMission=HOOK.wrap('endMission','ag/kariyer-ilerleme#_pEnd',function(_pEnd){ return function(ok,tm){ const was=M.done, r=_pEnd.apply(this,arguments); if(!was&&ok&&M.id==='dyn') careerAdd(0,{dyn:1}); return r; }; },endMission);
if(typeof hmEnd==='function'){ hmEnd=HOOK.wrap('hmEnd','ag/kariyer-ilerleme#_pHm',function(_pHm){ return function(win,why){ const was=HM.ended; _pHm(win,why); if(!was&&win&&String(HM.id).indexOf('d_')===0) careerAdd(0,{dyn:1}); }; },hmEnd); }
if(typeof ejLand==='function'){ ejLand=HOOK.wrap('ejLand','ag/kariyer-ilerleme#_pEj',function(_pEj){ return function(w){ _pEj(w); careerAdd(20,{ejectOk:1}); }; },ejLand); }
/* ---- career page sections */
careerRender=HOOK.wrap('careerRender','ag/kariyer-ilerleme#_pRender',function(_pRender){ return function(){ _pRender(); const p=accProfile(), st=p.stats||{}, v=progStats(), got=st.ach||[], X=tasksNow();
  const bar=function(f){ return '<div class="pbar"><i style="width:'+Math.round(Math.min(1,f)*100)+'%"></i></div>'; };
  const tk=function(t){ return '<div class="tk'+(t.done?' on':'')+'"><b>'+(t.done?'✓ ':'')+t.txt+'</b>'+bar(t.v/t.need)+'<small>'+(t.k==='flightSec'||t.k==='heliSec'?Math.floor(t.v/60)+' / '+t.need/60+' dk':t.k==='dist'?Math.floor(t.v/1000)+' / '+t.need/1000+' km':t.v+' / '+t.need)+' · +'+t.xp+' TP</small></div>'; };
  if($('carTasks')) $('carTasks').innerHTML='<div class="tcol"><p>BUGÜN</p>'+X.daily.map(tk).join('')+'</div><div class="tcol"><p>BU HAFTA</p>'+X.weekly.map(tk).join('')+'</div>';
  if($('carAch')) $('carAch').innerHTML=ACH.map(function(a){ const val=v[a[3]]||0, on=got.indexOf(a[0])>=0; return '<div class="ach'+(on?' on':'')+'"><span>'+(on?'🏆':'◇')+'</span><div><b>'+a[1]+'</b><small>'+a[2]+' · +'+a[5]+' TP</small>'+bar(val/a[4])+'<small>'+(a[6]?a[6](val):Math.min(val,a[4])+' / '+a[4])+'</small></div></div>'; }).join('');
  const hm=function(s){ s=Math.round(s||0); const m=Math.floor(s/60); return m>=60?Math.floor(m/60)+' sa '+(m%60)+' dk':m+' dk'; };
  const rows=[['Uçuş süresi',hm(st.flightSec)],['Helikopter süresi',hm(st.heliSec)],['Uçulan mesafe',Math.round((st.dist||0)/1000).toLocaleString('tr-TR')+' km'],['Gece uçuşu',hm(st.nightSec)],['Kalkış',st.takeoffs||0],['İniş',st.landings||0],['Fırtınada iniş',st.stormLand||0],['Gemi güvertesine iniş',st.deck||0],
    ['Görev',st.missions||0],['Dinamik görev',st.dyn||0],['Toplam yıldız',v.starsN],['Uçuş okulu',v.schoolN+' / 8 ders'],['Düşürülen uçak',st.kills||0],['Yer hedefi',st.ground||0],['Kaza',st.crashes||0],['Fırlatma',(st.eject||0)+' ('+(st.ejectOk||0)+' sağ)'],['Gezilen yer',v.placesN],['Günlük görev',st.dailyDone||0],['Başarım',got.length+' / '+ACH.length],['Madalya',(st.medals||[]).length+' / '+MEDALS.length]];
  if($('carStat2')) $('carStat2').innerHTML='<table>'+rows.map(function(r){ return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>'; }).join('')+'</table>';
  const R=p.rank||0, un=[]; Object.keys(RANK_LOCK).forEach(function(id){ if(AIRCRAFT[id]) un.push([RANK_LOCK[id],'Uçak',AIRCRAFT[id].name]); });
  if(typeof VEH_RANK!=='undefined') Object.keys(VEH_RANK).forEach(function(id){ const K=CAR_KINDS.find(function(k){ return k.id===id; }); if(K) un.push([VEH_RANK[id],'Araç',K.n]); });
  PSCHEMES.forEach(function(P){ if(P.r>0) un.push([P.r,'Boya',P.n]); }); un.sort(function(a,b){ return a[0]-b[0]; });
  if($('carUnl')) $('carUnl').innerHTML=(lockedAt(99)?'':'<p class="note">Kilitler bulut hesaplarda geçerlidir; şu an hepsi açık.</p>')+un.map(function(u){ const ok=R>=u[0]||!lockedAt(u[0]); return '<div class="ul'+(ok?' on':'')+'">'+rankSVG(u[0],20)+'<b>'+u[2]+'</b><small>'+u[1]+' · '+RANKS[u[0]][0]+(ok?' ✓':' 🔒')+'</small></div>'; }).join(''); }; },careerRender);
