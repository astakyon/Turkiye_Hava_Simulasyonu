/* ------------------------------------------------------------------ mission screen 2 (V2.03)
   One clean two-column screen: category tabs in one scrollable row (Tümü · Harekât · Eğitim · Hava · … · Kara · Deniz),
   difficulty / duration / sort hidden behind a "Filtre" button, missions as cards with a colour per category, and the
   enemy / wingman / difficulty / start-place options folded under "Gelişmiş ayarlar". The detail panel keeps the map,
   objectives and threats with the start button always visible at the bottom. */
const MIS2={filt:false, adv:false};
const MIS2_COL={serbest:'#9fb0c2',egitim:'#39e6ff',hava:'#ff6a5a',taarruz:'#ffb25a',kesif:'#ffd27a',heli:'#7dffb0',dinamik:'#c78bff',kara:'#a8c66c',deniz:'#4aa8ff',yaris:'#ff8ad8',okul:'#39e6ff',ozel:'#dddddd'};
function mis2Decorate(){ const ui=$('missionsUI'); if(!ui||!ui.classList) return; ui.classList.add('mis2');
  const f=$('misFilt'); if(f&&f.querySelector&&!f.querySelector('.bftg')&&document.createElement){ const b=document.createElement('button'); b.type='button'; b.className='bftg'; f.appendChild(b); }
  if(f&&f.classList){ f.classList.toggle('open',MIS2.filt); const b=f.querySelector('.bftg'); if(b){ const n=(BF.diff?1:0)+(BF.dur!=='all'?1:0)+(BF.sort!=='def'?1:0); b.textContent='⚙ Filtre'+(n?' ('+n+')':''); b.setAttribute('aria-pressed',String(MIS2.filt)); } }
  const cs=f&&f.querySelector('[data-k="cat"]'); if(cs&&!cs.querySelector('[data-v="__camp"]')&&typeof campOpen==='function'){ const b=document.createElement('button'); b.type='button'; b.dataset.v='__camp'; b.className='bcamp'; b.textContent='★ Harekât'; cs.insertBefore(b,cs.children[1]||null); }
  const L=boardList(); Array.prototype.forEach.call(document.querySelectorAll('#misList .mitem'),function(btn){ const e=L[+btn.dataset.i]; if(!e) return; let c='serbest'; try{ c=bMeta(e).cat||'serbest'; }catch(err){} btn.style.setProperty('--cc',MIS2_COL[c]||'#9fb0c2'); });
  const o=$('misOpts'); if(o&&o.classList){ o.classList.toggle('collapsed',!MIS2.adv); const k=o.querySelector('.k'); if(k){ k.textContent='GELİŞMİŞ AYARLAR · düşman, kanat adamı, zorluk, başlangıç '+(MIS2.adv?'▾':'▸'); k.setAttribute('role','button'); k.tabIndex=0; } } }
const _ms2Render=renderMissions; renderMissions=function(){ _ms2Render(); try{ mis2Decorate(); }catch(e){} };
(function(){ const f=$('misFilt'); if(f) f.addEventListener('click',function(e){ const c=e.target.closest('[data-v="__camp"]'); if(c){ e.stopImmediatePropagation(); try{ enterTitle(); }catch(err){} setTimeout(function(){ campOpen(); },60); return; } const b=e.target.closest('.bftg'); if(!b) return; e.stopImmediatePropagation(); MIS2.filt=!MIS2.filt; mis2Decorate(); },true);
  const o=$('misOpts'); if(o) o.addEventListener('click',function(e){ if(!e.target.closest('.k')) return; MIS2.adv=!MIS2.adv; mis2Decorate(); }); })();
