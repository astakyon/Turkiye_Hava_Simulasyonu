/* ------------------------------------------------------------------ picture problem test (V1.97)
   For artefacts we cannot reproduce here (e.g. black waves on some Android phones): a small floating panel switches single
   layers off live — sea, sky, clouds, shadows, effects, trees, terrain, depth split, resolution — so the player can see which
   one makes the problem disappear and report it. Nothing is saved; closing the panel restores everything. */
const GT={open:false, off:{}, keep:{}};
const GT_ITEMS=[['su','Deniz'],['sky','Gökyüzü'],['bulut','Bulutlar'],['golge','Gölgeler'],['efekt','Efektler'],['agac','Ağaçlar'],['arazi','Arazi'],['bolme','İki katmanlı derinlik'],['cozu','Düşük çözünürlük']];
function gtTerrain(){ if(GT.ter) return GT.ter; let best=null, br=0; scene.children.forEach(function(o){ if(!o.isMesh||!o.material||!o.material.vertexColors||!o.geometry) return; const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); const r=g.boundingSphere?g.boundingSphere.radius:0; if(r>br){ br=r; best=o; } }); GT.ter=best; return best; }
function gtApply(){ const off=GT.off;
  if(GFX.water) GFX.water.visible=!off.su; if(typeof sky!=='undefined') sky.visible=!off.sky; if(GFX.clouds) GFX.clouds.visible=!off.bulut;
  (GFX.treeChunks||[]).forEach(function(m){ m.visible=!off.agac; }); const t=gtTerrain(); if(t) t.visible=!off.arazi;
  if(off.golge){ renderer.shadowMap.enabled=false; sunLight.castShadow=false; } else applyShadows();
  if(off.efekt){ FX.on=false; } else applyFX();
  SETTINGS.split=off.bolme?false:(GT.keep.split===undefined?SETTINGS.split:GT.keep.split);
  renderer.setPixelRatio(off.cozu?0.6:PERF.base*PERF.scale); resize(); gtRender(); }
function gtRender(){ const el=$('gtPanel'); if(!el) return; el.querySelector('.gtl').innerHTML=GT_ITEMS.map(function(it){ return '<button type="button" data-g="'+it[0]+'" aria-pressed="'+(!GT.off[it[0]])+'">'+(GT.off[it[0]]?'✕ ':'✓ ')+it[1]+'</button>'; }).join('');
  el.querySelector('.gti').textContent=DEV.kind+' · '+DEV.gpu+' · '+DEV.webgl+' · hassasiyet '+(DEV.hp||'?')+' · derinlik '+(DEV.depthBits||'?')+' bit · '+(DEV.logDepth?'logaritmik':(SETTINGS.split!==false?'2 katman':'standart'))+' · kalite '+SETTINGS.quality+' · gölge '+(renderer.shadowMap.enabled?'açık':'kapalı')+' · efekt '+(FX.on?'açık':'kapalı')+' · '+GAME_VERSION; }
function gtOpen(){ let el=$('gtPanel'); if(!el){ el=document.createElement('div'); el.id='gtPanel'; el.className='gtpanel';
    el.innerHTML='<b>Görüntü sorunu testi</b><small>Sorun görünürken katmanları tek tek kapat. Hangisi kapanınca sorun kayboluyorsa onu bildir.</small><div class="gtl"></div><p class="gti"></p><div class="gtr"><button type="button" class="btn sm" data-k="all">Hepsini aç</button><button type="button" class="btn sm primary" data-k="close">Kapat</button></div>';
    document.body.appendChild(el);
    el.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; e.stopPropagation(); if(b.dataset.g){ GT.off[b.dataset.g]=!GT.off[b.dataset.g]; gtApply(); } else if(b.dataset.k==='all'){ GT.off={}; gtApply(); } else if(b.dataset.k==='close') gtClose(); });
    ['pointerdown','touchstart','mousedown'].forEach(function(ev){ el.addEventListener(ev,function(e){ e.stopPropagation(); },{passive:true}); }); }
  GT.keep={split:SETTINGS.split}; GT.open=true; el.classList.remove('hidden'); gtRender(); }
function gtClose(){ GT.off={}; gtApply(); GT.open=false; const el=$('gtPanel'); if(el) el.classList.add('hidden'); }
(function(){ const b=$('btnGtest'); if(b) b.addEventListener('click',function(){ closeModals(); gtOpen(); if(state==='paused') resumeGame(); toast('Test paneli açık: katmanları kapatarak sorunu ara','#b8ecff'); }); })();
