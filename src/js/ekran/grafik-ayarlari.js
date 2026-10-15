/* ------------------------------------------------------------------ graphics settings 2.0 (V2.22)
   • One preset row: Otomatik (chosen from the device, smart performance on) · Düşük · Orta · Yüksek · Ultra. It replaces the
     three rows that did the same job ("Cihaza göre ayarla", "Performans modu", "Akıllı performans"); any own choice on top of a
     preset shows it as "Özel".
   • Detailed settings (collapsed): view distance, object detail, vegetation, clouds, texture quality and effect quality each
     follow the preset ("Hazır") or take their own level — SETTINGS.gd = {view, detail, trees, clouds, tex, fx}; gq(k) is the
     level in use. Plus anti-aliasing, smart performance and the FPS counter.
   • Every row carries its cost (az · orta · çok etki), from the V2.12–V2.21 measurements.
   • Live difference: after a change the scene is drawn once before and once after, and a line under that row shows the
     change in draw calls and triangles (FPS cannot be measured while the full-screen settings cover the game).
   • Troubleshooting rows (depth, two-layer depth, safe mode, picture test, diagnostics) moved into their own collapsed group. */
const GD_KEYS=['view','detail','trees','clouds','tex','fx'], GD_IDS={view:'gdView',detail:'gdDetail',trees:'gdTrees',clouds:'gdClouds',tex:'gdTex',fx:'gdFx'};
function gq(k){ const g=SETTINGS.gd; const v=g&&g[k]; return (v!=null&&v>=0&&v<=3)?v:Math.max(0,Math.min(3,SETTINGS.quality||0)); }
function gdCustom(){ const g=SETTINGS.gd||{}; return GD_KEYS.some(function(k){ return g[k]!=null; })||SETTINGS.fx!=null||SETTINGS.shadows!=null||(SETTINGS.aa&&SETTINGS.aa!=='auto')||(SETTINGS.res&&SETTINGS.res!=='auto'); }
/* the groups read their own level */
terLodDist=function(){ const T=[[2500,5500,10000],[3200,7000,12000],[4000,8500,15000],[4500,10000,18000]][gq('view')], k=DEV.mobile?0.85:1; return [T[0]*k,T[1]*k,T[2]*k]; };
trafficRadius=function(){ return (DEV.mobile?[1200,1800,2500,3200]:[2000,3200,4500,6000])[gq('view')]*(PERF2.lvl>=2?0.6:1); };
treeDensity=function(){ return [0.35,0.7,1,1][gq('trees')]*(PERF2.lvl>=2?0.6:1); };
perfLvlApply=function(){ if(typeof CULL!=='undefined') CULL.t=99; if(GFX.clouds&&GFX.cloudN) GFX.clouds.count=Math.floor(GFX.cloudN*[0.4,0.7,1,1][gq('clouds')]*(PERF2.lvl>=3?0.5:1)); };
txsLimit=function(){ const t=gq('tex'); if(DEV.mobile) return [512,1024,1024,1024][t];   /* phones keep the V2.18 limit; only Düşük goes lower */ return [1024,2048,1e9,1e9][t]; };
applyQuality=HOOK.wrap('applyQuality','ekran/grafik-ayarlari#_gdAQ',function(_gdAQ){ return function(){ _gdAQ.apply(this,arguments);
  if(typeof CULL!=='undefined'){ CULL.px=CULL_PX[gq('detail')]*(DEV.mobile?1.3:1)*(PERF2.lvl>=2?1.6:1); CULL.t=99; }
  const td=treeDensity(); if(GFX.trees) GFX.trees.count=Math.floor(GFX.treeN*td); if(GFX.treeChunks) GFX.treeChunks.forEach(function(m){ m.count=Math.max(0,Math.floor(m.userData.full*td)); });
  perfLvlApply(); try{ gdTexApply(); }catch(e){} }; },applyQuality);
/* texture quality can go both ways: when the limit changes, give the shrunk textures their full picture back, then shrink to the new limit */
function gdTexApply(){ if(typeof TXS==='undefined'||!TXS.done||SETTINGS.texShare===false) return 0; const lim=txsLimit(); if(gdTexApply.lim===lim) return 0; gdTexApply.lim=lim; let back=0;
  for(let i=TXS.shrunk.length-1;i>=0;i--){ const s=TXS.shrunk[i]; s.t.image=s.full; s.t.needsUpdate=true; TXS.links.forEach(function(l){ if(l.canon===s.t) l.cv=s.t.version; }); TXS.shrunk.splice(i,1); back++; }
  TXS.halved=0; txsShrink(); return back; }
/* fewer particles at lower effect quality */
explode=HOOK.wrap('explode','ekran/grafik-ayarlari#_gdExp',function(_gdExp){ return function(pos,n,size){ return _gdExp(pos,Math.max(3,Math.round((n||0)*[0.4,0.7,1,1][gq('fx')])),size); }; },explode);
/* ---- live difference */
function gdProbe(){ if(typeof renderer==='undefined'||!camera) return null; try{ if(typeof cullCollect==='function'){ cullCollect(); cullAll(); } }catch(e){} try{ terLodStep(true); }catch(e){}
  const sh=renderer.shadowMap.enabled; if(sh) renderer.shadowMap.needsUpdate=true; renderer.info.autoReset=false; renderer.info.reset(); const t=performance.now();
  try{ renderer.render(scene,camera); }catch(e){} const ms=performance.now()-t, r={calls:renderer.info.render.calls, tris:renderer.info.render.triangles, ms:ms}; renderer.info.autoReset=true; return r; }
function gdLiveShow(a,b,row){ const el=$('gdLive'); if(!el||!a||!b) return; if(row&&row.parentNode&&row.nextSibling!==el) row.parentNode.insertBefore(el,row.nextSibling);   /* right under the row that changed */ const k=function(v){ return v>=1000?Math.round(v/1000)+' bin':String(v); }, d=function(x,y){ const z=y-x; return (z>0?'+':'')+z; };
  el.innerHTML='Bu değişiklik: çizim <b>'+a.calls+' → '+b.calls+'</b> ('+d(a.calls,b.calls)+') · üçgen <b>'+k(a.tris)+' → '+k(b.tris)+'</b>';
  el.classList.remove('hidden'); clearTimeout(gdLiveShow.t); gdLiveShow.t=setTimeout(function(){ el.classList.add('hidden'); },6000); }
let GD_PRE=null;
(function(){ const sec=document.querySelector&&document.querySelector('#settings section[data-tab="g"]'); if(!sec||!sec.addEventListener) return;
  sec.addEventListener('pointerdown',function(e){ if(e.target.closest&&e.target.closest('button,input,label')) GD_PRE=gdProbe(); },true);
  sec.addEventListener('click',function(e){ const b=e.target.closest&&e.target.closest('button,input'); if(!b||!GD_PRE||b.closest('#gdFix')||b.id==='btnPerfTest'||b.id==='btnFull') return; const pre=GD_PRE; GD_PRE=null;
    const row=b.closest('.srow'); requestAnimationFrame(function(){ requestAnimationFrame(function(){ gdLiveShow(pre,gdProbe(),row); }); }); });
  /* the rows that used to be advanced-only now live in the collapsed groups */
  Array.prototype.forEach.call(sec.querySelectorAll('.srow.adv'),function(r){ r.classList.remove('adv'); }); })();
/* ---- preset row: Otomatik + the four levels */
(function(){ const c=$('setQ'); if(!c||!c.addEventListener) return;
  c.addEventListener('click',function(e){ const b=e.target.closest('button[data-q]'); if(!b) return; e.stopImmediatePropagation();
    SETTINGS.gd={}; SETTINGS.fx=null; SETTINGS.shadows=null; SETTINGS.aa='auto'; SETTINGS.res='auto'; PERF.scale=1; if(typeof FX!=='undefined') FX.failed=false;
    if(b.dataset.q==='auto'){ SETTINGS.tierAuto=true; devTierApply(false); return; }
    SETTINGS.tierAuto=false; SETTINGS.quality=+b.dataset.q; applyQuality(); saveSettings(); syncSettingsUI(); },true); })();
/* ---- detailed rows */
GD_KEYS.forEach(function(k){ const c=$(GD_IDS[k]); if(!c||!c.addEventListener) return;
  c.addEventListener('click',function(e){ const b=e.target.closest('button[data-v]'); if(!b) return; const v=+b.dataset.v; SETTINGS.gd=SETTINGS.gd||{};
    if(v<0) delete SETTINGS.gd[k]; else SETTINGS.gd[k]=v; saveSettings(); applyQuality(); syncSettingsUI(); }); });
const GD_INFO=['Düşük: en akıcı, zayıf telefonlar için','Orta: dengeli, çoğu telefon için','Yüksek: gölge ve efektler açık','Ultra: güçlü bilgisayarlar için, en uzak ayrıntı'];
syncSettingsUI=HOOK.wrap('syncSettingsUI','ekran/grafik-ayarlari#_gdSync',function(_gdSync){ return function(){ _gdSync(); const c=$('setQ'); if(!c) return; const auto=!!SETTINGS.tierAuto, q=SETTINGS.quality||0, cu=gdCustom();
  Array.prototype.forEach.call(c.children,function(b){ b.setAttribute('aria-pressed',String(auto?b.dataset.q==='auto':b.dataset.q===String(q))); });
  const i=$('setQInfo'); if(i) i.textContent=(cu?'Özel — ':'')+(auto?'Otomatik ('+['Düşük','Orta','Yüksek','Ultra'][q]+'): cihazına göre seçildi, FPS düşerse ayarlar kendiliğinden hafifler':GD_INFO[q])+(cu?' · kendi seçimlerin üstte; bir hazır ayara dokununca sıfırlanır':'');
  const g=SETTINGS.gd||{}; GD_KEYS.forEach(function(k){ const el=$(GD_IDS[k]); if(!el) return; const v=g[k]!=null?g[k]:-1; Array.prototype.forEach.call(el.children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.v===v)); });
    const h=el.querySelector('[data-v="-1"]'); if(h) h.textContent='Hazır ('+['D','O','Y','U'][q]+')'; }); }; },syncSettingsUI);
/* a search hit inside a closed group opens it */
(function(){ const s=$('setSearch'); if(!s||!s.addEventListener) return; s.addEventListener('input',function(){ const q=s.value.trim(); ['gdMore','gdFix'].forEach(function(id){ const d=$(id); if(!d) return; if(q) d.open=!!d.querySelector('.srow:not(.nomatch)'); }); }); })();
