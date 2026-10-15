/* ------------------------------------------------------------------ Harekât kampanyası: "Kızıl Elma" (V1.98)
   Eight linked chapters with a story, a spoken briefing (Karargâh / Kartal Gözü / Kule), fixed places on the island and a
   debrief. Each chapter runs on an existing engine: aircraft chapters on the dynamic-mission engine (multi-stage objectives,
   bonus, mid-mission event), helicopter chapters on the helicopter mission engine, the finale on the strike mission.
   Chapters unlock one after another; stars (1–3) and progress live in the profile (cloud for accounts). In career the first
   completion of a chapter also gives a story bonus in TP. */
RADIO_WHO.karargah={n:'Karargâh',p:0.86,r:1.0,c:'#ff9a8a'};
const CAMP={run:null, sel:0, pending:false};
function campSpot(seed,x,z,R,minD){ return dynLand(mulberry32(seed),x,z,R,minD)||[x+minD,z]; }
const CAMP_CH=[
  {id:'k1',n:'Uyanış',sub:'İHA keşfi',ac:['tb2','aksungur','anka','tb3','akinci','anka3'],bonusTP:150,
    story:'Kızıl Bölge\'den üç gündür telsiz sessizliği var. Karargâh, adanın doğusundaki dağlık hatta bir şeylerin hazırlandığından şüpheleniyor. Bir İHA ile üç noktayı tara, görüntüleri karargâha aktar.',
    pre:[{w:'karargah',t:'{cs}, burası Karargâh. Kızıl Bölge sessiz; bu sessizlik hoşumuza gitmiyor.'},{w:'karargah',t:'Rüzgâr santrali, radar istasyonu ve kayak zirvesinin üstünde dur, sensörler gerisini halleder.'}],
    post:{w:'karargah',t:'Görüntüler geldi {cs}. Dağın arkasında bir İHA rampası var. Hazırlıklı ol.'},
    D:function(){ return {tp:'uav',name:'Uyanış',desc:'Üç noktayı İHA ile tara.',diff:1,lim:900,xp:220,uav:true,
      obj:[{t:'scan',x:3700,z:-1100,r:600,sec:6,n:'Tara: Rüzgâr santrali'},{t:'scan',x:5360,z:-2680,r:600,sec:6,n:'Tara: Radar istasyonu'},{t:'scan',x:6700,z:-5050,r:650,sec:6,n:'Tara: Kayak zirvesi'}],
      bonus:{t:'fuel',n:'Bonus: yakıtın %50 üstünde bitir'},thr:['Uzun mesafe, dağ rüzgârı'],area:[5000,-3000,6000],load:'rec'}; }},
  {id:'k2',n:'Sessiz Sürü',sub:'Önleme',ac:['hurjet','kaan','kizilelma','hurkus','akinci','tb3'],bonusTP:200,
    story:'Keşfin haklı çıktı: rampadan kalkan kamikaze İHA sürüsü üsse doğru alçaktan geliyor. Hiçbiri üsse 2 kilometreden fazla yaklaşmamalı.',
    pre:[{w:'awacs',t:'{cs}, Kartal Gözü. Kuzeybatıdan beş küçük iz, alçakta, üsse yöneliyor.'},{w:'karargah',t:'Hepsini düşür {cs}. Tek bir tanesi bile üsse ulaşmasın.'}],
    post:{w:'awacs',t:'Hava sahası temiz. Güzel avlandın {cs}.'},
    D:function(){ return {tp:'intercept',name:'Sessiz Sürü',desc:'Kamikaze İHA sürüsünü önle.',diff:2,lim:480,xp:260,obj:[{t:'intercept',n:'Düşman İHA\'larını düşür',count:5}],
      bonus:{t:'nodamage',n:'Bonus: hasar alma (%80 üstü can)'},thr:['Hızlı, alçak uçan İHA\'lar'],area:[-4500,4500,9000],load:'aa'}; }},
  {id:'k3',n:'Kalkan',sub:'Yakın hava desteği',ac:['hurjet','tb2','tb3','akinci','anka','aksungur','hurkus','kaan','anka3','kizilelma'],bonusTP:250,
    story:'Düşman, sürünün arkasından Anadolukent\'in güneyine bir zırhlı öncü birlik çıkardı. Kentin girişindeki dost mevzi baskı altında. Araçları ve onları koruyan hava savunmasını yok et.',
    pre:[{w:'karargah',t:'{cs}, Anadolukent\'teki birliğimiz yardım istiyor. Yerden ateş altındalar.'},{w:'karargah',t:'Yeşil işaret dost mevzi. Çevresindeki bütün araçları vur, sivil binalara dikkat.'}],
    post:{w:'karargah',t:'Mevzi rahatladı. Birlik sana teşekkür ediyor {cs}.'},
    D:function(){ return {tp:'cas',name:'Kalkan',desc:'Anadolukent\'teki dost birliğe hava desteği ver.',diff:2,lim:600,xp:280,pos:[-600,6100],ev:'sam',
      obj:[{t:'killset',set:'cas',n:'Dost birliğe saldıran araçları imha et'}],bonus:{t:'fast',n:'Bonus: 4 dakikada bitir',sec:240},thr:['Düşman uçaksavarı','Görev ortasında yeni SAM'],area:[-600,6100,2500],load:'ag'}; }},
  {id:'k4',n:'Enkaz Altında',sub:'Arama-kurtarma',heli:'t625',bonusTP:250,
    story:'Çatışmada Hilal Barajı yakınındaki gözetleme kulemiz vuruldu. Yaralı askerler barajın güneyinde bekliyor. T625 Gökbey ile in, yaralıları al ve üsse getir.',
    pre:[{w:'kule',t:'{cs}, Gökbey hazır. Baraj bölgesinde rüzgâr sert, alçak ve yavaş yaklaş.'},{w:'karargah',t:'Turuncu işaretin yanına in, yaralıları bindir, Ay Yıldız helipadine getir.'}],
    post:{w:'karargah',t:'Yaralılar revirde, hepsi iyi. Teşekkürler {cs}.'},
    M:function(){ const s=campSpot(404,-3000,11400,700,150); return {id:'k4',heli:'t625',n:'Enkaz Altında',d:'Hilal Barajı yakınındaki yaralıları üsse getir.',spot:[-450,540,Math.PI/2],lim:720,xp:300,
      setup:function(){ trSpawn(s[0],s[1],3,'mis'); },obj:[{t:'board',n:'Yaralıların yanına in, B ile bindir',x:s[0],z:s[1]},{t:'unload',n:'Ay Yıldız helipadine in ve indir (B)',x:-450,z:570,r:60}]}; }},
  {id:'k5',n:'Mavi Hat',sub:'Deniz devriyesi',ac:['tb2','aksungur','anka','hurkus','hurjet','tb3','akinci','anka3','kaan','kizilelma'],bonusTP:250,
    story:'Düşmanın ikmalini denizden yaptığı anlaşıldı. Batı kıyısı açıklarında iki noktayı devriye et, ardından seyir hâlindeki gemileri alçaktan geçerek tanımla.',
    pre:[{w:'awacs',t:'{cs}, Kartal Gözü. Batıda iki şüpheli iz var, hava da bozmak üzere.'},{w:'karargah',t:'Gemileri 600 metrenin altından tanımla, ateş açma.'}],
    post:{w:'karargah',t:'Gemilerden biri düşmana yakıt taşıyormuş. Sahil Güvenlik devraldı.'},
    D:function(){ return {tp:'sea',name:'Mavi Hat',desc:'Batı açıklarında deniz devriyesi.',diff:1,lim:780,xp:240,ev:'weather',
      obj:[{t:'wp',x:-6000,z:2600,r:900,n:'Deniz devriye noktası: Petrol platformu'},{t:'wp',x:-10500,z:2800,r:900,n:'Deniz devriye noktası: Rüzgâr santrali açığı'},{t:'ship',n:'İki gemiyi 600 m altında yakından tanımla',count:2}],
      bonus:null,thr:['Açık deniz, iniş yeri yok','Hava bozabilir'],area:[-8000,2500,8000]}; }},
  {id:'k6',n:'Gölge Avı',sub:'Bölge temizliği',heli:'t129',bonusTP:300,
    story:'Gemiden inen bir düşman birliği Antik kentin harabelerine saklandı. T129 ATAK ile bölgeye gir ve araçların hepsini etkisiz hâle getir.',
    pre:[{w:'karargah',t:'{cs}, ATAK hazır. Harabelerde zırhlı araçlar ve bir SAM görüldü.'},{w:'karargah',t:'Tepelerin arkasından yaklaş, menzil dışından vur.'}],
    post:{w:'karargah',t:'Antik kent temiz. Kızıl Bölge artık açıkta {cs}.'},
    M:function(){ const c=campSpot(606,-6040,5780,900,250), L=[['tank',0,0],['apc',40,25],['truck',-35,30],['sam',-50,-30],['truck',25,-40]];
      return {id:'k6',heli:'t129',n:'Gölge Avı',d:'Antik kentteki düşman araçlarını T129 ile imha et.',spot:[-450,470,Math.PI/2],lim:600,xp:320,
        setup:function(){ const r=mulberry32(606); L.forEach(function(q){ htAdd(q[0],c[0]+q[1],c[1]+q[2],r()*6); }); },obj:[{t:'kill',n:'Düşman araçlarını imha et',x:c[0],z:c[1]}]}; }},
  {id:'k7',n:'Hava Köprüsü',sub:'Refakat',ac:['hurjet','kaan','kizilelma','hurkus','akinci','tb3'],bonusTP:300,
    story:'Son taarruz öncesi Hilal Barajı\'ndaki ileri mevziye mühimmat taşınacak. Aksungur nakliye uçuşuna eşlik et; düşman avcıları onu durdurmaya çalışacak.',
    pre:[{w:'kule',t:'{cs}, nakliye kalkıyor. Anadolukent üzerinden baraja gidecek.'},{w:'awacs',t:'Kızıl Bölge\'den avcılar havalandı. Nakliyeden uzak tut.'}],
    post:{w:'karargah',t:'Mühimmat yerinde. Yarın şafakta Kızıl Elma başlıyor {cs}.'},
    D:function(){ return {tp:'escort',name:'Hava Köprüsü',desc:'Nakliye uçağını baraja kadar koru.',diff:3,lim:600,xp:340,route:[[0,0],[-1450,6300],[-3000,12000]],
      obj:[{t:'escort',n:'Nakliye uçağını hedefe kadar koru'}],bonus:{t:'kills',n:'Bonus: 2 düşman avcısı düşür',k:2},thr:['Düşman avcıları (füze)'],area:[-1500,6000,9000],load:'aa'}; }},
  {id:'k8',n:'Kızıl Elma',sub:'Final: taarruz',mis:'strike',ac:['kaan','hurjet','akinci','tb3','anka3','kizilelma','aksungur','anka','tb2','hurkus'],bonusTP:600,
    story:'Şafak. Bütün hazırlık bu an içindi. Kızıl Bölge\'deki radarı, depoyu, sığınağı, SAM bataryasını ve konvoyu imha et. Harekâtın adı da hedefi de aynı: Kızıl Elma.',
    pre:[{w:'karargah',t:'{cs}, Kızıl Elma harekâtı başladı. Bütün birlikler seni izliyor.'},{w:'awacs',t:'Kartal Gözü seninle. SAM radarları aktif, alçaktan gir.'},{w:'karargah',t:'Allah yar ve yardımcın olsun {cs}.'}],
    post:{w:'karargah',t:'Bütün hedefler imha edildi. Kızıl Elma\'ya ulaştık {cs}. Ada güvende.'}}];
CAMP_CH.forEach(function(c,i){ c.ix=i; });
/* ---- progress */
function campProg(){ const p=accProfile(); return Object.assign({},(p.stats&&p.stats.camp)||{}); }
function campStars(id){ return campProg()[id]||0; }
function campOpenIx(i){ return i===0||campStars(CAMP_CH[i-1].id)>0; }
function campDoneN(){ const P=campProg(); return CAMP_CH.filter(function(c){ return P[c.id]>0; }).length; }
function campSave(id,stars){ const P=campProg(), first=!P[id]; if(stars>(P[id]||0)) P[id]=stars; const p=accProfile(); accSetProfile({stats:Object.assign({},p.stats,{camp:P})}); return first; }
/* ---- choose a vehicle the player may use */
function campAc(ch){ const ok=function(id){ return AIRCRAFT[id]&&!rankLocked(id); }; if(ch.ac.indexOf(selectedId)>=0&&ok(selectedId)) return selectedId; return ch.ac.find(ok)||null; }
/* ---- start a chapter */
function campStart(i){ const ch=CAMP_CH[i]; if(!ch) return; if(!campOpenIx(i)){ toast('Önce bir önceki bölümü tamamla','#ffc24a'); return; }
  if(ch.heli&&!licHas('heli')){ toast('🔒 Helikopter pilotluğu gerekli — Kariyer → Ehliyet ve Sertifikalar','#ffc24a'); return; }
  let ac=null; if(!ch.heli){ ac=campAc(ch); if(!ac){ const need=ch.ac.map(function(id){ return LIC2[licFor(id)]; }).filter(Boolean)[0]; toast('🔒 Bu bölüm için '+(need?need.n:'uygun bir uçak')+' gerekli','#ffc24a'); return; } }
  campClose(); CAMP.run=ch;
  if(ch.heli){ const M=ch.M(); ch._M=M; hmStart(M.id); }
  else { if(ac!==selectedId){ selectedId=ac; setAircraft(ac); toast('Bu bölüm için '+AIRCRAFT[ac].short+' seçildi','#b8ecff'); }
    if(ch.mis){ selectMission(ch.mis); preFlight('missions'); }
    else { const D=ch.D(); Object.assign(D,{id:'camp_'+ch.id,kind:'dyn',sub:'air',cat:'dinamik',dur:Math.round(D.lim/60),name:'Kızıl Elma '+(i+1)+': '+D.name}); ch._D=D;
      DYN.cur=D; MISSIONS.dyn.name=D.name; MISSIONS.dyn.desc=D.desc; MISSIONS.dyn.limit=D.lim; BMETA.dyn={xp:D.xp,dur:D.dur}; selectMission('dyn'); preFlight('missions'); } }
  ch.pre.forEach(function(l,k){ setTimeout(function(){ if(CAMP.run===ch) radioSay(l,null,{force:true}); },1500+k*200); }); }
hmById=HOOK.wrap('hmById','gorev/kampanya#_cmHmById',function(_cmHmById){ return function(id){ const r=_cmHmById(id); if(r) return r; const ch=CAMP_CH.find(function(c){ return c.heli&&c.id===id; }); if(!ch) return null; if(!ch._M) ch._M=ch.M(); return ch._M; }; },hmById);
/* ---- finishing */
function campDone(ch,ok,stars){ if(!ok){ toast('Bölüm başarısız — tekrar dene','#ff8a5a'); return; }
  const first=campSave(ch.id,Math.max(1,stars)); setTimeout(function(){ radioSay(ch.post,null,{force:true}); },2600);
  if(first&&PLAY.mode==='career') try{ careerAdd(ch.bonusTP,null,'Harekât: '+ch.n); }catch(e){}
  const last=ch.ix===CAMP_CH.length-1; toast(last?'🏆 KIZIL ELMA HAREKÂTI TAMAMLANDI!':'📜 Bölüm '+(ch.ix+1)+' tamamlandı: '+ch.n+(first&&!last?' — sıradaki bölüm açıldı':''),'#ffd27a');
  if(last&&first) try{ const p=accProfile(), st=p.stats||{}, m=(st.medals||[]).slice(); if(m.indexOf('kizilelma')<0){ m.push('kizilelma'); accSetProfile({stats:Object.assign({},st,{medals:m})}); } }catch(e){}
  CAMP.pending=true; CAMP.sel=Math.min(CAMP_CH.length-1,ch.ix+(last?0:1)); }
endMission=HOOK.wrap('endMission','gorev/kampanya#_cmEnd',function(_cmEnd){ return function(ok,tm){ const ch=CAMP.run; let hit=false, st=0;
  if(ch&&!ch.heli&&M&&!M.done){ hit=(ch.mis&&M.id===ch.mis)||(ch._D&&M.id==='dyn'&&DYN.cur===ch._D); if(hit) try{ st=bStarsFor(ok); }catch(e){ st=1; } }
  const r=_cmEnd(ok,tm); if(hit){ campDone(ch,ok,st); } return r; }; },endMission);
hmEnd=HOOK.wrap('hmEnd','gorev/kampanya#_cmHmEnd',function(_cmHmEnd){ return function(win,why){ const ch=CAMP.run, hit=ch&&ch.heli&&HM.M&&HM.M===ch._M&&!HM.ended, t=HM.t; _cmHmEnd(win,why); if(hit) campDone(ch,win,win?(2+(t<HM.M.lim*0.5?1:0)):0); }; },hmEnd);
/* playing anything else ends the campaign run */
misGo=HOOK.wrap('misGo','gorev/kampanya#_cmMisGo',function(_cmMisGo){ return function(){ CAMP.run=null; return _cmMisGo(); }; },misGo);
quickPlay=HOOK.wrap('quickPlay','gorev/kampanya#_cmQuick',function(_cmQuick){ return function(){ CAMP.run=null; return _cmQuick(); }; },quickPlay);
/* back on the title screen after a chapter: show the campaign with the next chapter selected */
refreshTitle=HOOK.wrap('refreshTitle','gorev/kampanya#_cmTitle',function(_cmTitle){ return function(){ const r=_cmTitle.apply(this,arguments); if(CAMP.pending&&state==='menu'){ CAMP.pending=false; setTimeout(function(){ if(state==='menu'&&!anyModalOpen()) campOpen(CAMP.sel); },400); } return r; }; },refreshTitle);
/* ---- screen */
function campOpen(i){ const el=$('campUI'); if(!el) return; closeModals(); if(i==null){ i=CAMP_CH.findIndex(function(c,k){ return campOpenIx(k)&&!campStars(c.id); }); if(i<0) i=CAMP_CH.length-1; } CAMP.sel=i; campRender(); el.classList.remove('hidden'); }
function campClose(){ const el=$('campUI'); if(el) el.classList.add('hidden'); }
function campRender(){ const P=campProg(), n=campDoneN(); $('campSum').textContent=n+' / '+CAMP_CH.length+' bölüm · '+CAMP_CH.reduce(function(a,c){ return a+(P[c.id]||0); },0)+' / '+CAMP_CH.length*3+' ★';
  $('campBar').style.width=Math.round(n/CAMP_CH.length*100)+'%';
  $('campList').innerHTML=CAMP_CH.map(function(c,i){ const open=campOpenIx(i), s=P[c.id]||0;
    return '<button type="button" class="cch'+(i===CAMP.sel?' on':'')+(open?'':' lock')+(s?' done':'')+'" data-i="'+i+'"><span class="cn">'+(open?(s?'✓':i+1):'🔒')+'</span><span class="ct"><b>'+c.n+'</b><small>'+c.sub+'</small></span>'+(s?starsHTML(s):'')+'</button>'; }).join('');
  const c=CAMP_CH[CAMP.sel], open=campOpenIx(CAMP.sel), s=P[c.id]||0;
  let objs=[]; try{ objs=c.heli?c.M().obj.map(function(o){ return o.n; }):c.mis?(BMETA[c.mis]?BMETA[c.mis].obj:[]):c.D().obj.map(function(o){ return o.n; }); }catch(e){}
  const veh=c.heli?HELI_DEF[c.heli].name:c.ac.slice(0,4).map(function(id){ return AIRCRAFT[id].short; }).join(' · ');
  $('campDet').innerHTML='<p class="k">BÖLÜM '+(CAMP.sel+1)+' · '+c.sub.toLocaleUpperCase('tr-TR')+'</p><h3>'+c.n+'</h3>'+(s?'<div class="cst">'+starsHTML(s)+'</div>':'')+
    '<p class="cstory">'+c.story+'</p><div class="cobj"><b>Görevler</b><ul>'+objs.map(function(o){ return '<li>'+o+'</li>'; }).join('')+'</ul></div>'+
    '<p class="cveh"><b>Araç:</b> '+veh+'</p><p class="crw">'+(PLAY.mode==='career'?'Ödül: görev TP\'si + ilk tamamlamada '+c.bonusTP+' TP hikâye bonusu':'Hızlı oyunda TP kazanılmaz; ilerleme yine kaydedilir')+'</p>'+
    (open?'<button type="button" class="btn primary wide" id="campGo">'+(s?'▶ Bölümü tekrar oyna':'▶ Bölümü başlat')+'</button>':'<p class="clock">🔒 Önce "'+CAMP_CH[CAMP.sel-1].n+'" bölümünü tamamla</p>')+
    (n===CAMP_CH.length?'<p class="cfin">🏆 Harekât tamamlandı — Kızıl Elma madalyası senin.</p>':''); }
(function(){ const el=$('campUI'); if(!el) return; MODALS.push('campUI');
  $('campList').addEventListener('click',function(e){ const b=e.target.closest('button[data-i]'); if(!b) return; CAMP.sel=+b.dataset.i; campRender(); });
  $('campDet').addEventListener('click',function(e){ if(e.target.closest('#campGo')) campStart(CAMP.sel); });
  $('btnCampX').addEventListener('click',function(){ campClose(); if(state==='menu') refreshTitle(); }); })();
if(typeof MEDALS!=='undefined'&&!MEDALS.some(function(m){ return m[0]==='kizilelma'; })) MEDALS.push(['kizilelma','Kızıl Elma','Harekât kampanyasını tamamla',function(st){ return !!(st&&st.camp&&CAMP_CH.every(function(c){ return st.camp[c.id]>0; })); }]);
/* ---- title menu entries */
NAV_IC.camp='<path d="M4 20l6-14 4 8 3-5 3 11z"/>';
navRender=HOOK.wrap('navRender','gorev/kampanya#_cmNav',function(_cmNav){ return function(){ _cmNav(); const el=$('cNav'); if(!el) return; const h=el.innerHTML; if(h.indexOf('_camp"')>=0) return;
  const sub=campDoneN()+' / '+CAMP_CH.length+' bölüm · hikâyeli harekât';
  if(NAV.level==='start'){ const k='data-act="q_mis"', i=h.indexOf(k); if(i<0) return; const j=h.lastIndexOf('<button',i); el.innerHTML=h.slice(0,j)+navBtn('q_camp','Harekât: Kızıl Elma',sub,'camp')+h.slice(j); }
  else if(NAV.level==='career'){ const k='data-act="c_missions"', i=h.indexOf(k); if(i<0) return; const j=h.lastIndexOf('<button',i); el.innerHTML=h.slice(0,j)+navBtn('c_camp','Harekât: Kızıl Elma',sub,'camp')+h.slice(j); }
  else return; tFocus=Math.min(tFocus,Math.max(0,titleItems().length-1)); titleFocus(tFocus); }; },navRender);
NAV_D.q_camp=['HIZLI OYUN','Harekât: Kızıl Elma','Sekiz bölümlük hikâyeli harekât: keşif, önleme, hava desteği, arama-kurtarma, deniz devriyesi, helikopter taarruzu, refakat ve final. Bölümler sırayla açılır.',[],'Harekâtı aç'];
NAV_D.c_camp=['KARİYER','Harekât: Kızıl Elma','Sekiz bölümlük hikâyeli harekât. Her bölüm ilk tamamlamada hikâye bonusu TP verir; final Kızıl Elma madalyasını kazandırır.',[],'Harekâtı aç'];
titleAct=HOOK.wrap('titleAct','gorev/kampanya#_cmAct',function(_cmAct){ return function(act){ if(act==='q_camp'&&state==='menu'){ playMode('quick'); return campOpen(); } if(act==='c_camp'&&state==='menu'){ playMode('career'); return campOpen(); } return _cmAct(act); }; },titleAct);
