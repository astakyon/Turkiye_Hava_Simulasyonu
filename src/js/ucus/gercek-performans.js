/* ------------------------------------------------------------------ real performance (V1.88)
   Figures from the Defence Turk system inventory (see veri/envanter-veri.js) for the aircraft in the game:
   service ceiling, top / cruise speed, climb, endurance, range, payload. Where the inventory has no figure the game value is used.
   • Gerçek servis tavanı (setting, default on): engine thrust fades in the last 15 % below the real ceiling, so the aircraft
     levels off there like the real one.
   • Hangar: a "Gerçek veriler" block under the performance bars, with the source. */
const KT=0.5144, FT=0.3048;
const REALP={
  hurjet:{vmax:1.2*340, vmaxT:'1,2 Mach'},
  hurkus:{vmax:160, vmaxT:'574 km/sa', stall:40, climb:22, ceil:10577, endur:4.25, range:1478},
  anka:{cruise:75*KT, cruiseT:'75+ knot', ceil:30000*FT, endur:24},
  aksungur:{ceil:40000*FT, endur:40, load:750},
  kizilelma:{cruise:0.6*340, cruiseT:'0,6 Mach', ceil:35000*FT, endur:5, load:1500},
  tb2:{cruise:70*KT, cruiseT:'70 knot', ceil:27000*FT, endur:27, load:150},
  tb3:{ceil:33000*FT, endur:32},
  akinci:{vmax:195*KT, vmaxT:'195 knot', cruise:130*KT, cruiseT:'130 knot', ceil:40000*FT, endur:24, load:1500},
  t129:{vmax:145*KT, vmaxT:'145 knot', ceil:20000*FT, endur:3, range:561},
  t625:{ceil:6069, endur:3.8, range:740}};
function realOn(){ return SETTINGS.realp!==false; }
function realCeil(id){ const r=REALP[id]; return realOn()&&r&&r.ceil?r.ceil:0; }
function ceilK(){ const c=realCeil(activeId); if(!c||S.onGround) return 1; const y=S.pos.y; if(y<c*0.85) return 1; return clamp((c-y)/(c*0.15),0,1); }
dmgThrust=HOOK.wrap('dmgThrust','ucus/gercek-performans#_rpThrust',function(_rpThrust){ return function(){ return _rpThrust()*ceilK(); }; },dmgThrust);
const RPF={warn:false};
update=HOOK.wrap('update','ucus/gercek-performans#_rpfUpd',function(_rpfUpd){ return function(dt){ _rpfUpd(dt); const c=realCeil(activeId); if(!c||state!=='play') return;
  if(!RPF.warn&&S.pos.y>c*0.9){ RPF.warn=true; toast('Servis tavanına yaklaşıyorsun ('+Math.round(c).toLocaleString('tr-TR')+' m) — motor gücü düşüyor','#ffc24a'); }
  if(RPF.warn&&S.pos.y<c*0.8) RPF.warn=false; }; },update);
/* ---- hangar: real figures */
function realRows(id){ const r=REALP[id]; if(!r) return []; const km=function(v){ return Math.round(v*3.6).toLocaleString('tr-TR')+' km/sa'; }, m=function(v){ return Math.round(v).toLocaleString('tr-TR')+' m'; };
  const L=[]; if(r.vmax) L.push(['Azami hız',(r.vmaxT?r.vmaxT+' · ':'')+km(r.vmax)]); if(r.cruise) L.push(['Seyir hızı',(r.cruiseT?r.cruiseT+' · ':'')+km(r.cruise)]);
  if(r.climb) L.push(['Tırmanma',r.climb+' m/s']); if(r.ceil) L.push(['Servis tavanı',m(r.ceil)]); if(r.endur) L.push(['Havada kalış',(r.endur%1?String(r.endur).replace('.',','):r.endur)+' saat']);
  if(r.range) L.push(['Menzil',r.range.toLocaleString('tr-TR')+' km']); if(r.load) L.push(['Faydalı yük',r.load.toLocaleString('tr-TR')+' kg']); return L; }
perfHTML=HOOK.wrap('perfHTML','ucus/gercek-performans#_rpPerf',function(_rpPerf){ return function(id){ const h=_rpPerf(id), L=realRows(id);
  const body=L.length?L.map(function(x){ return '<span><i>'+x[0]+'</i> '+x[1]+'</span>'; }).join(''):'<span class="na">Envanterde sayısal performans verisi yok; oyun değerleri kullanılıyor.</span>';
  return h+'<div class="realp" title="Kaynak: Defence Turk · Sistem Envanteri"><b>GERÇEK'+(realCeil(id)?' · tavan uygulanıyor':'')+'</b>'+body+'<small>Kaynak: Defence Turk</small></div>'; }; },perfHTML);
(function(){ const c=$('setRealP'); if(c) c.addEventListener('change',function(){ SETTINGS.realp=c.checked; saveSettings(); if(typeof refreshHangarUI==='function'&&state==='menu') refreshHangarUI(); }); })();
syncSettingsUI=HOOK.wrap('syncSettingsUI','ucus/gercek-performans#_rpSync',function(_rpSync){ return function(){ _rpSync(); const c=$('setRealP'); if(c) c.checked=realOn(); }; },syncSettingsUI);
