/* ------------------------------------------------------------------ one troubleshooting screen (V2.37)
   Player decision (29 Oct): the three graphics troubleshooting tools lived in three places — Performans testi at the top of the
   Grafik tab, Görüntü sorunu testi and Grafik tanılama inside the collapsed "Grafik sorun giderme" group — and the player opened
   the wrong one when asked for a performance report. Now one row, "Sorun giderme", opens one screen with three tabs; the old
   rows (with their buttons and handlers) are moved into it unchanged. The live diagnostics refresh while that tab is open.
   Same release, the mission editor: a "＋ Görev editörü" button on the Görevler screen (it was the last line of the "Özel"
   tab), and its Dene / Kaydet / Yayınla buttons stay pinned at the bottom of the side panel (on a landscape phone they were
   below the fold). */
const SGD={tab:'pt', t:null};
function sgdStop(){ if(SGD.t!=null&&typeof clearInterval==='function') sgdStop(); SGD.t=null; }
function sgdBuild(){ if($('sgdUI')||!document.createElement) return;
  const el=document.createElement('div'); el.id='sgdUI'; el.className='modal hidden';
  el.innerHTML='<div class="card wide relcard sgdcard"><button class="xbtn" type="button" id="sgdX" aria-label="Kapat">✕</button><h2>Sorun giderme</h2>'+
    '<div class="rhk sgdtabs" id="sgdTabs"><button type="button" data-k="pt">Performans testi</button><button type="button" data-k="gt">Görüntü testi</button><button type="button" data-k="dg">Tanılama</button></div>'+
    '<div class="relbody sgdbody"><section data-k="pt"><p class="sgdi">Oyun yavaşsa ya da takılıyorsa: cihazının gerçek performansını 2 dakikada ölçer, neyin pahalı olduğunu söyler, istersen önerilen ayarları uygular. Raporu kopyalayıp gönderebilirsin.</p></section>'+
    '<section data-k="gt"><p class="sgdi">Görüntüde siyah dalga, titreme, bozuk renk gibi bir sorun varsa: oyun sürerken deniz, gökyüzü, gölge, efekt gibi katmanları tek tek kapat; hangisi kapanınca sorun kayboluyorsa onu bildir.</p></section>'+
    '<section data-k="dg"><p class="sgdi">Cihaz, ekran kartı ve çizim bilgileri. Sorun bildirirken bu ekranın görüntüsünü paylaş.</p></section></div></div>';
  document.body.appendChild(el); MODALS.push('sgdUI');
  const sec=function(k){ return el.querySelector('section[data-k="'+k+'"]'); }, rowOf=function(id){ const b=$(id); return b&&b.closest?b.closest('.srow'):null; };
  const rp=rowOf('btnPerfTest'), rg=rowOf('btnGtest'), rd=rowOf('btnDiag'), dl=$('gdiag');
  if(rp) sec('pt').appendChild(rp); if(rg) sec('gt').appendChild(rg); if(rd){ sec('dg').appendChild(rd); rd.classList.remove('adv'); } if(dl) sec('dg').appendChild(dl);
  /* one row in the Grafik tab instead of three */
  const host=$('setTabs')&&document.querySelector('#settings section[data-tab="g"]');
  if(host){ const r=document.createElement('div'); r.className='srow'; r.id='sgdRow'; r.innerHTML='<div class="sl"><b>Sorun giderme</b><small>Performans testi (oyun yavaşsa), görüntü testi (görüntü bozuksa) ve tanılama bilgileri tek ekranda</small></div><button class="btn" id="btnSgd" type="button">Aç</button>';
    host.insertBefore(r,host.firstChild); r.querySelector('#btnSgd').addEventListener('click',function(){ sgdOpen('pt'); }); }
  const fx=$('gdFix'); if(fx){ const s=fx.querySelector('summary small'); if(s) s.textContent='derinlik, güvenli mod'; }
  el.querySelector('#sgdX').addEventListener('click',sgdClose);
  el.querySelector('#sgdTabs').addEventListener('click',function(e){ const b=e.target.closest('button[data-k]'); if(b) sgdTab(b.dataset.k); });
  /* the tools themselves close this screen when they start */
  ['btnPerfTest','btnGtest'].forEach(function(id){ const b=$(id); if(b) b.addEventListener('click',function(){ el.classList.add('hidden'); },true); }); }
function sgdTab(k){ SGD.tab=k; const el=$('sgdUI'); if(!el) return;
  Array.prototype.forEach.call(el.querySelectorAll('section[data-k]'),function(s){ s.classList.toggle('hidden',s.dataset.k!==k); });
  Array.prototype.forEach.call(el.querySelectorAll('#sgdTabs button'),function(b){ b.setAttribute('aria-pressed',String(b.dataset.k===k)); });
  sgdStop(); if(k==='dg'){ const d=$('gdiag'); if(d) d.classList.remove('hidden'); const b=$('btnDiag'); if(b) b.textContent='Yenile'; try{ gfxDiag(); }catch(e){} if(typeof setInterval==='function') SGD.t=setInterval(function(){ if(el.classList.contains('hidden')||SGD.tab!=='dg'){ sgdStop(); return; } try{ gfxDiag(); }catch(e){} },700); } }
function sgdOpen(k){ sgdBuild(); const el=$('sgdUI'); if(!el) return; el.classList.remove('hidden'); sgdTab(k||SGD.tab||'pt'); }
function sgdClose(){ const el=$('sgdUI'); if(el) el.classList.add('hidden'); sgdStop(); }
sgdBuild();
/* the old diagnostics button toggled its list; inside the screen it only refreshes */
(function(){ const b=$('btnDiag'); if(b) b.addEventListener('click',function(e){ if(!$('sgdUI')||$('sgdUI').classList.contains('hidden')) return; e.stopImmediatePropagation(); try{ gfxDiag(); }catch(x){} },true); })();
/* ---- mission editor: a visible way in, and the action buttons always in reach */
(function(){ const ui=$('missionsUI'); if(!ui||!document.createElement||$('btnMisNew')) return; const b=document.createElement('button'); b.className='btn ui misnew'; b.id='btnMisNew'; b.type='button'; b.textContent='＋ Görev editörü';
  ui.appendChild(b); b.addEventListener('click',function(){ try{ edOpen(null); }catch(e){} }); })();
/* ---- one rule for closing (V2.37 screen review): full screens have "← Geri" top left, pop-up cards have ✕ top right, both do
   what Esc does. Five cards had only a "Kapat" / "Vazgeç" button at their bottom (on a landscape phone below the fold): they
   get the ✕, which presses that same button. The pause card's ✕ resumes the game. */
(function(){ if(!document.createElement) return;
  [['records','btnRecClose'],['controls','btnCtlClose'],['photoResult','btnPhotoClose'],['rpVidUI','rpVidClose'],['service','btnSvcCancel'],['pause',null]].forEach(function(p){
    const m=$(p[0]), c=m&&m.querySelector&&m.querySelector('.card,.box'); if(!c||c.querySelector('.xbtn')) return;
    const x=document.createElement('button'); x.type='button'; x.className='xbtn'; x.setAttribute('aria-label','Kapat'); x.textContent='✕'; c.insertBefore(x,c.firstChild); if(getComputedStyle&&c.style) c.style.position=c.style.position||'relative';
    x.addEventListener('click',function(){ if(p[1]&&$(p[1])) $(p[1]).click(); else if(p[0]==='pause'&&typeof resumeGame==='function') resumeGame(); else m.classList.add('hidden'); }); }); })();
