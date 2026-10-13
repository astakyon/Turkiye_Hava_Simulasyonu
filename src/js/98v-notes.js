/* ------------------------------------------------------------------ release notes in the game (V2.10)
   The release script writes the newest CHANGELOG entries into RELNOTES (98w-relnotes-data.js). After an update the first
   start shows the new version's notes as an announcement strip ("V2.10 yenilikleri … Tümünü gör"); how long it stays is
   chosen in Ayarlar → Arayüz → Sürüm notları (Kapalı · 10 sn · 30 sn · Kapatana kadar). "Yenilikler" (Arayüz tab and the
   ★ button on the title screen) opens the full notes of the last versions. */
function relDur(){ const d=SETTINGS.notesDur; return d==null?30:d; }   /* seconds; 0 = off, -1 = until closed */
function relMd(md){ const esc=function(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>').replace(/`(.+?)`/g,'<code>$1</code>'); };
  const L=String(md||'').split('\n'); let h='', depth=0; const close=function(to){ while(depth>to){ h+='</li></ul>'; depth--; } };
  L.forEach(function(l){ const m=/^(\s*)- (.*)$/.exec(l); if(!m){ if(l.trim()){ close(0); h+='<p>'+esc(l.trim())+'</p>'; } return; }
    const d=Math.min(Math.floor(m[1].length/2)+1,depth+1); if(d>depth){ h+='<ul>'; depth=d; } else { close(d); h+='</li>'; } h+='<li>'+esc(m[2]); });
  close(0); return h; }
function relFirstLine(md){ /* first bullet that says something (not a bare "**Heading:**" line); "**Name:** text" → "Name: text" */
  const L=String(md||'').split('\n').map(function(l){ const m=/^\s*- (.+)$/.exec(l); return m?m[1].replace(/\*\*/g,'').replace(/\*/g,'').replace(/`/g,'').trim():''; }).filter(function(x){ return x&&!/:$/.test(x); });
  const t=L[0]||''; return t.length>150?t.slice(0,147)+'…':t; }
function relOpen(){ let el=$('relUI'); if(!el&&document.createElement){ el=document.createElement('div'); el.id='relUI'; el.className='modal hidden'; el.innerHTML='<div class="card wide relcard"><button class="xbtn" type="button" id="relX" aria-label="Kapat">✕</button><h2>Yenilikler</h2><div class="relbody" id="relBody"></div></div>'; document.body.appendChild(el); MODALS.push('relUI'); el.querySelector('#relX').addEventListener('click',function(){ el.classList.add('hidden'); }); }
  if(!el) return; const R=(typeof RELNOTES!=='undefined'?RELNOTES:[]); $('relBody').innerHTML=R.length?R.map(function(r){ return '<section><h3>'+r.v+' <small>'+(r.d||'')+'</small></h3>'+(r.t?'<p class="rt">'+r.t+'</p>':'')+relMd(r.md)+'</section>'; }).join(''):'<p>Sürüm notu bulunamadı.</p>';
  closeModals(); try{ annHide(); }catch(e){} el.classList.remove('hidden'); }
function relShow(){ const R=(typeof RELNOTES!=='undefined'?RELNOTES:[]), cur=R[0]; if(!cur||cur.v!==GAME_VERSION) return; if(SETTINGS.notesSeen===GAME_VERSION) return; const dur=relDur(); SETTINGS.notesSeen=GAME_VERSION; saveSettings(); if(dur===0) return;
  if(typeof annShow!=='function') return; annShow({id:'rel-'+cur.v,text:'🆕 '+cur.v+(cur.t?' — '+cur.t:': '+relFirstLine(cur.md)),flash:false,sec:dur>0?dur:0});
  if(typeof ANN!=='undefined'){ ANN.t=dur>0?dur:1e9; } const bar=$('annBar'); if(bar&&!bar.querySelector('.relmore')){ const b=document.createElement('button'); b.type='button'; b.className='relmore'; b.textContent='Tümünü gör'; b.addEventListener('click',function(){ relOpen(); try{ annHide(); }catch(e){} }); bar.insertBefore(b,bar.lastChild); } }
/* the "Tümünü gör" button only belongs to the release-notes strip */
if(typeof annShow==='function'){ const _rnAnn=annShow; annShow=function(o){ _rnAnn(o); const b=$('annBar'), m=b&&b.querySelector('.relmore'); if(m&&!(o&&String(o.id).indexOf('rel-')===0)) m.remove(); }; }
setTimeout(function(){ try{ relShow(); }catch(e){} },3500);
(function(){ const s=$('setNotes'); if(s) s.addEventListener('click',function(e){ const b=e.target.closest('button[data-n]'); if(!b) return; SETTINGS.notesDur=+b.dataset.n; saveSettings(); syncSettingsUI(); });
  const o=$('btnNotes'); if(o) o.addEventListener('click',relOpen); })();
const _rnSync=syncSettingsUI; syncSettingsUI=function(){ _rnSync(); const s=$('setNotes'); if(s) Array.prototype.forEach.call(s.children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.n===relDur())); }); };
/* "Yenilikler" entry on the title menu (root level, under Çok Oyunculu) */
NAV_IC.news='<path d="M4 5h13v14H6a2 2 0 01-2-2z"/><path d="M17 9h3v8a2 2 0 01-2 2M8 9h5M8 13h5"/>';
NAV_D.notes=['OYNA','Yenilikler','Son sürümlerde nelerin değiştiğini oku. Yeni sürümden sonraki ilk açılışta özet duyuru olarak da gösterilir; süresi Ayarlar → Arayüz → Sürüm notları.',[],'Notları aç'];
const _rnNav=navRender; navRender=function(){ _rnNav(); if(NAV.level!=='root') return; const el=$('cNav'); if(!el) return; const h=el.innerHTML; if(h.indexOf('data-act="notes"')>=0) return;
  const k=h.indexOf('data-act="net"'); if(k<0) return; const j=h.indexOf('</button>',k)+9; el.innerHTML=h.slice(0,j)+navBtn('notes','Yenilikler',GAME_VERSION+' sürüm notları','news')+h.slice(j); tFocus=Math.min(tFocus,Math.max(0,titleItems().length-1)); titleFocus(tFocus); };
const _rnAct=titleAct; titleAct=function(act){ if(act==='notes'&&state==='menu') return relOpen(); return _rnAct(act); };
