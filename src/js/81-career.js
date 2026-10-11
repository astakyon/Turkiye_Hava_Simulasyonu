/* ------------------------------------------------------------------ career: ranks (Er → Orgeneral), experience, statistics, medals, flight log
   XP comes from the score earned in flight (targets, aircraft, rings), landings, mission completions and time in the air.
   Promotions show a ceremony; some aircraft unlock with rank (players only — the administrator / development device flies all).
   Everything lives in the profile (local guest profile or the cloud profile row). */
const RANKS=[
  ['Er','ER',0],['Onbaşı','OBŞ',100],['Çavuş','ÇVŞ',300],['Uzman Çavuş','UZÇ',600],['Astsubay','ASB',1000],['Asteğmen','ASĞ',1500],['Teğmen','TĞM',2200],['Üsteğmen','ÜTĞ',3000],
  ['Yüzbaşı','YZB',4000],['Binbaşı','BNB',5500],['Yarbay','YBY',7500],['Albay','ALB',10000],['Tuğgeneral','TUĞ',13500],['Tümgeneral','TÜM',18000],['Korgeneral','KOR',24000],['Orgeneral','ORG',32000]];
const RANK_LOCK={tb3:5,akinci:6,kizilelma:7,kaan:8,anka3:9};    /* aircraft id → rank index needed */
const MEDALS=[
  ['first','İlk uçuş','Bir kez havalan',function(s){ return (s.takeoffs||0)>=1; }],
  ['land1','Pilot kanadı','İlk başarılı iniş',function(s){ return (s.landings||0)>=1; }],
  ['land25','Usta pilot','25 iniş',function(s){ return (s.landings||0)>=25; }],
  ['hour','Bir saat havada','Toplam 60 dakika uçuş',function(s){ return (s.flightSec||0)>=3600; }],
  ['kill1','İlk zafer','İlk düşman uçağını düşür',function(s){ return (s.kills||0)>=1; }],
  ['ace','As pilot','5 düşman uçağı',function(s){ return (s.kills||0)>=5; }],
  ['strike','Hedef uzmanı','25 yer hedefi',function(s){ return (s.ground||0)>=25; }],
  ['mis5','Görev adamı','5 görev tamamla',function(s){ return (s.missions||0)>=5; }],
  ['heli','Döner kanat','Helikopterle 5 dakika uç',function(s){ return (s.heliSec||0)>=300; }],
  ['explorer','Kâşif','Haritada 10 farklı yere git',function(s){ return (s.places||[]).length>=10; }]];
const CAR={prevState:null, prevGround:true, lastScore:0, airT:0, sess:null, ceremony:[], pushT:0};
function rankOf(xp){ let r=0; for(let i=0;i<RANKS.length;i++) if(xp>=RANKS[i][2]) r=i; return r; }
function rankShort(i){ return (RANKS[i]||RANKS[0])[1]; }
function rankName(i){ return (RANKS[i]||RANKS[0])[0]; }
function rankLocked(id){ if(typeof accIsAdmin==='function'&&accIsAdmin()) return false; if(SETTINGS.rankLocks===false) return false; const need=RANK_LOCK[id]; return need!=null&&(accProfile().rank||0)<need; }
/* insignia: chevrons for enlisted, bar for NCO, stars for officers, crescent-star for field grade, wreath for generals */
function rankSVG(i,size){
  const s=size||40, gold='#ffd27a', sil='#e6edf3'; let g='';
  if(i===0) g='<rect x="10" y="18" width="20" height="4" rx="2" fill="'+sil+'" opacity=".5"/>';
  else if(i<=3) for(let k=0;k<i;k++) g+='<path d="M8 '+(14+k*7)+' L20 '+(8+k*7)+' L32 '+(14+k*7)+'" fill="none" stroke="'+gold+'" stroke-width="3.2" stroke-linejoin="round"/>';
  else if(i===4) g='<rect x="8" y="17" width="24" height="6" rx="1.5" fill="'+gold+'"/><rect x="8" y="17" width="24" height="2" fill="#fff" opacity=".4"/>';
  else if(i<=8){ const n=i===5?1:i-5, star=function(x,y,o){ return '<polygon transform="translate('+x+' '+y+') scale(.55)" points="0,-9 2.6,-2.8 9,-2.8 3.9,1.1 5.8,7.6 0,3.7 -5.8,7.6 -3.9,1.1 -9,-2.8 -2.6,-2.8" fill="'+(o?'none':gold)+'" stroke="'+gold+'" stroke-width="1.6"/>'; };
    const xs=n===1?[20]:n===2?[13,27]:[9,20,31]; xs.forEach(function(x){ g+=star(x,20,i===5); }); }
  else if(i<=11){ const n=i-8; g='<circle cx="13" cy="20" r="7" fill="none" stroke="'+gold+'" stroke-width="2.6"/><circle cx="15.5" cy="20" r="5.6" fill="#0b1626"/>';
    for(let k=0;k<n;k++) g+='<polygon transform="translate('+(24+k*6.5)+' 20) scale(.36)" points="0,-9 2.6,-2.8 9,-2.8 3.9,1.1 5.8,7.6 0,3.7 -5.8,7.6 -3.9,1.1 -9,-2.8 -2.6,-2.8" fill="'+gold+'"/>'; }
  else { const n=i-11; g='<path d="M6 30 Q4 18 12 10 M34 30 Q36 18 28 10" fill="none" stroke="'+gold+'" stroke-width="2.4"/>';
    const xs=n===1?[20]:n===2?[15,25]:n===3?[11,20,29]:[9,16,24,31]; xs.forEach(function(x){ g+='<polygon transform="translate('+x+' 20) scale(.42)" points="0,-9 2.6,-2.8 9,-2.8 3.9,1.1 5.8,7.6 0,3.7 -5.8,7.6 -3.9,1.1 -9,-2.8 -2.6,-2.8" fill="'+gold+'"/>'; }); }
  return '<svg viewBox="0 0 40 40" width="'+s+'" height="'+s+'" aria-hidden="true">'+g+'</svg>';
}
/* add XP / stats to the current profile, promote when a threshold is crossed */
function careerAdd(xp,statPatch,why){
  const p=accProfile(), st=p.stats||(p.stats={});
  if(statPatch) Object.keys(statPatch).forEach(function(k){ st[k]=(st[k]||0)+statPatch[k]; });
  if(xp>0){ p.xp=Math.round((p.xp||0)+xp); if(CAR.sess) CAR.sess.xp+=xp; }
  const r=rankOf(p.xp||0); if(r>(p.rank||0)){ p.rank=r; CAR.ceremony.push(r); }
  MEDALS.forEach(function(m){ const got=st.medals||(st.medals=[]); if(got.indexOf(m[0])<0&&m[3](st)){ got.push(m[0]); toast('🎖 Madalya: '+m[1],'#ffd27a'); } });
  careerSave();
}
function careerSave(){ const p=accProfile();
  if(ACC.prof){ if(!CAR.pushT) CAR.pushT=setTimeout(function(){ CAR.pushT=0; accPushProfile(); },5000); }
  else { const L=lpAll(), i=Math.max(0,L.findIndex(function(x){ return x.id===p.id; })); L[i]=p; lpSave(L); }
  accChip(); }
/* watch the flight: time aloft, takeoffs, landings, score → XP, sessions for the log */
function careerStep(dt){
  const st=state, inPlay=st==='play', p=accProfile();
  if(inPlay&&CAR.prevState!=='play'&&CAR.prevState!=='paused'&&CAR.prevState!=='map'){ CAR.sess={t:Date.now(),ac:activeId,m:missionId,dur:0,xp:0,res:'—'}; CAR.lastScore=score; CAR.prevGround=S.onGround; }
  if(inPlay&&!S.crashed){
    if(CAR.sess) CAR.sess.dur+=dt;
    if(!S.onGround){ CAR.airT+=dt; (p.stats||(p.stats={})).flightSec=((p.stats.flightSec)||0)+dt; if(CAR.airT>=60){ CAR.airT-=60; careerAdd(10,null); } }
    if(CAR.prevGround&&!S.onGround&&S.speed>40) careerAdd(5,{takeoffs:1});
    if(!CAR.prevGround&&S.onGround) careerAdd(30,{landings:1});
    CAR.prevGround=S.onGround;
    if(score>CAR.lastScore){ careerAdd(Math.round((score-CAR.lastScore)*0.25),null); CAR.lastScore=score; } else if(score<CAR.lastScore) CAR.lastScore=score;
  }
  if(st==='walk'&&WALK.mode==='heli'&&HELI.cur&&!HELI.cur.ground){ const s2=p.stats||(p.stats={}); s2.heliSec=(s2.heliSec||0)+dt; CAR.heliT=(CAR.heliT||0)+dt; if(CAR.heliT>=60){ CAR.heliT-=60; careerAdd(10,null); } }
  /* a flight ended: write it to the log */
  if(CAR.sess&&!inPlay&&st!=='paused'&&st!=='map'){ const s=CAR.sess; CAR.sess=null; if(s.dur>15){ const log=(p.stats.log||(p.stats.log=[])); log.unshift({t:s.t,ac:s.ac,m:s.m,dur:Math.round(s.dur),xp:Math.round(s.xp),res:s.res}); if(log.length>12) log.length=12; careerSave(); } }
  if(CAR.ceremony.length&&(st==='menu'||st==='mend')&&!anyModalOpen()) careerCeremony(CAR.ceremony.shift());
  CAR.prevState=st;
}
/* hooks: mission results, kills, ground targets, crashes, places visited */
(function(){
  const E=endMission; endMission=function(ok){ const r=E.apply(this,arguments); if(CAR.sess) CAR.sess.res=ok?'Başarılı':'Başarısız'; if(ok) careerAdd(150,{missions:1}); return r; };
  const D=actorDown; actorDown=function(a,byId){ const r=D.apply(this,arguments); if(byId===NET.myId&&a.team!==myTeam()) careerAdd(0,{kills:1}); return r; };
  const K=killGround; killGround=function(o){ const r=K.apply(this,arguments); careerAdd(0,{ground:1}); return r; };
  const C=crash; crash=function(){ const r=C.apply(this,arguments); if(CAR.sess) CAR.sess.res='Kaza'; careerAdd(0,{crashes:1}); return r; };
  const TP=teleportTo; teleportTo=function(pl){ const r=TP.apply(this,arguments); if(pl&&pl.id){ const s=accProfile().stats||(accProfile().stats={}), L=s.places||(s.places=[]); if(L.indexOf(pl.id)<0){ L.push(pl.id); careerAdd(15,null); } } return r; };
})();
/* promotion ceremony */
function careerCeremony(r){
  const el=$('rankUp'); if(!el) return; const unl=Object.keys(RANK_LOCK).filter(function(id){ return RANK_LOCK[id]===r&&AIRCRAFT[id]; }).map(function(id){ return AIRCRAFT[id].name; });
  el.innerHTML='<div class="ru">'+rankSVG(r,120)+'<p class="k">TERFİ</p><h2>'+rankName(r).toLocaleUpperCase('tr-TR')+'</h2><p>'+(accProfile().callsign||'Pilot')+', yeni rütben hayırlı olsun.</p>'+(unl.length?'<p class="un">Açılan: <b>'+unl.join(', ')+'</b></p>':'')+'<button class="btn primary" type="button" id="btnRankOk">Devam</button></div>';
  el.classList.remove('hidden'); if(typeof musSting==='function') musSting('victory'); sndPlay('ui_ok');
  $('btnRankOk').addEventListener('click',function(){ el.classList.add('hidden'); });
}
/* profile page (career) inside the account screen */
function careerRender(){
  const p=accProfile(), st=p.stats||{}, r=p.rank||0, nx=RANKS[r+1], cur=RANKS[r][2], f=nx?Math.min(1,((p.xp||0)-cur)/(nx[2]-cur)):1;
  const mins=Math.round((st.flightSec||0)/60), got=st.medals||[];
  const box=function(k,v){ return '<div><b>'+v+'</b><small>'+k+'</small></div>'; };
  $('carHead').innerHTML='<div class="rk">'+rankSVG(r,64)+'</div><div><p class="k">'+(UNITS[p.unit]||'Hilal Kanatlar').toLocaleUpperCase('tr-TR')+'</p><h2>'+rankName(r)+' '+(p.callsign||'')+'</h2>'+
    '<div class="xpb"><i style="width:'+Math.round(f*100)+'%"></i></div><small>'+(p.xp||0).toLocaleString('tr-TR')+' TP'+(nx?' · '+nx[0]+' için '+(nx[2]-(p.xp||0)).toLocaleString('tr-TR')+' TP':' · en yüksek rütbe')+'</small></div>';
  $('carStats').innerHTML=box('Uçuş süresi',mins>=60?Math.floor(mins/60)+' sa '+(mins%60)+' dk':mins+' dk')+box('Kalkış',st.takeoffs||0)+box('İniş',st.landings||0)+box('Görev',st.missions||0)+box('Düşürülen uçak',st.kills||0)+box('Yer hedefi',st.ground||0)+box('Helikopter',Math.round((st.heliSec||0)/60)+' dk')+box('Kaza',st.crashes||0);
  $('carMedals').innerHTML=MEDALS.map(function(m){ const on=got.indexOf(m[0])>=0; return '<div class="md'+(on?' on':'')+'" title="'+m[2]+'"><span>🎖</span><b>'+m[1]+'</b><small>'+m[2]+'</small></div>'; }).join('');
  const log=st.log||[];
  $('carLog').innerHTML=log.length?'<table><thead><tr><th>Tarih</th><th>Araç</th><th>Görev</th><th>Süre</th><th>Sonuç</th><th>TP</th></tr></thead><tbody>'+log.map(function(l){ const d=new Date(l.t);
    return '<tr><td>'+d.toLocaleDateString('tr-TR')+' '+d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})+'</td><td>'+((AIRCRAFT[l.ac]||{}).short||l.ac)+'</td><td>'+((MISSIONS[l.m]||{}).name||l.m)+'</td><td>'+Math.floor(l.dur/60)+':'+String(l.dur%60).padStart(2,'0')+'</td><td>'+l.res+'</td><td>+'+l.xp+'</td></tr>'; }).join('')+'</tbody></table>':'<p class="ninfo">Henüz uçuş kaydı yok. Bir uçuş yap, burada görünsün.</p>';
  $('carRanks').innerHTML=RANKS.map(function(R,i){ return '<div class="rr'+(i===r?' cur':'')+(i<r?' past':'')+'">'+rankSVG(i,28)+'<b>'+R[0]+'</b><small>'+R[2].toLocaleString('tr-TR')+' TP</small></div>'; }).join('');
}
