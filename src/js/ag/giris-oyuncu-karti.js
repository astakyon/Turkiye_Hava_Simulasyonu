/* ------------------------------------------------------------------ login and player card (V1.95)
   Modelled on game clients (Valorant / LoL / Rocket League): the sign-in is its own short screen (Google, e-mail with
   floating labels and a single big arrow button, "Misafir olarak oyna"), and the profile is a player card — a banner in the
   unit's colours with the rank badge, call sign and level bar, then tabs (Özet · Kariyer · Madalyalar · İstatistik · Hesap)
   instead of one long page. All existing element ids stay, so career, medals, licences and cloud code keep working. */
const PCARD={tab:'ozet', lg:'in'};
if($('loginUI')) MODALS.push('loginUI');
try{ const t=localStorage.getItem('ayy-pctab'); if(t) PCARD.tab=t; }catch(e){}
function pcTab(t){ PCARD.tab=t; try{ localStorage.setItem('ayy-pctab',t); }catch(e){}
  const ui=$('acctUI'); if(!ui) return; ui.querySelectorAll('.pc-tab').forEach(function(s){ s.classList.toggle('hidden',s.dataset.t!==t); });
  const nv=$('pcTabs'); if(nv) nv.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-selected',String(b.dataset.t===t)); }); }
function pcHero(){ const p=accProfile(), h=$('pcHero'); if(!h) return; h.dataset.u=p.unit||'hava';
  const pill=$('pcPill'); if(pill){ const on=!!ACC.user; pill.className='pc-pill'+(on?' on':ACC.cfg?' guest':''); pill.textContent=on?('☁ '+(ACC_ST[ACC.status]||'Bulutta')):(ACC.cfg?'Misafir · giriş yap':'Misafir'); pill.disabled=on||!ACC.cfg; } }
/* ---- login screen */
function loginMode(m){ PCARD.lg=m; const t=$('lgTabs'); if(t) t.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.m===m)); });
  const pw=$('accPass'); if(pw) pw.setAttribute('autocomplete',m==='up'?'new-password':'current-password'); const h=$('lgHint'); if(h) h.classList.toggle('hidden',m!=='up');
  const g=$('lgGo'); if(g) g.setAttribute('aria-label',m==='up'?'Hesap oluştur':'Giriş yap'); accMsg(''); }
function loginOpen(m){ if(!ACC.cfg){ accOpen('hesap'); return; } closeModals(); const el=$('loginUI'); if(!el) return; el.classList.remove('hidden'); loginMode(m||PCARD.lg||'in');
  setTimeout(function(){ const i=$('accMail'); if(i&&!DEV.mobile) try{ i.focus(); }catch(e){} },60); }
function loginClose(){ const el=$('loginUI'); if(el) el.classList.add('hidden'); }
function loginGo(){ const mail=($('accMail').value||'').trim(), pw=$('accPass').value||'';
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)){ accMsg('Geçerli bir e-posta adresi yaz',true); return; }
  if(pw.length<6){ accMsg('Şifre en az 6 karakter olmalı',true); return; }
  const g=$('lgGo'); if(g) g.classList.add('busy'); accMsg(PCARD.lg==='up'?'Hesap oluşturuluyor…':'Giriş yapılıyor…');
  Promise.resolve(accEmail(PCARD.lg==='up'?'up':'in',mail,pw)).finally(function(){ if(g) g.classList.remove('busy'); }); }
/* ---- wrappers around the account screen */
accOpen=HOOK.wrap('accOpen','ag/giris-oyuncu-karti#_pcOpen',function(_pcOpen){ return function(tab){
  const t=tab==='profile'||tab==='hesap'?'hesap':tab==='career'?'kariyer':(tab&&PCARD_TABS.indexOf(tab)>=0?tab:null);
  loginClose(); _pcOpen(tab==='hesap'?'profile':tab);
  pcTab(ACC.user&&!ACC.prof?'hesap':(t||PCARD.tab||'ozet')); pcHero();
  if(ACC.user&&!ACC.prof){ const c=$('accCs'); if(c) setTimeout(function(){ try{ c.focus(); }catch(e){} },80); } }; },accOpen);
const PCARD_TABS=['ozet','kariyer','madalya','ist','hesap'];
accRender=HOOK.wrap('accRender','ag/giris-oyuncu-karti#_pcRender',function(_pcRender){ return function(){ _pcRender(); pcHero(); const L=$('accLocal'); if(L) L.classList.toggle('hidden',!!ACC.user);
  const eb=$('pcEditBox'); if(eb) eb.classList.toggle('new',!!(ACC.user&&!ACC.prof)); }; },accRender);
accChip=HOOK.wrap('accChip','ag/giris-oyuncu-karti#_pcChip',function(_pcChip){ return function(){ _pcChip(); if(ACC.user){ const el=$('loginUI'); if(el&&!el.classList.contains('hidden')){ loginClose(); if(!ACC.prof) accOpen('hesap'); } } try{ pcHero(); }catch(e){} }; },accChip);
accMsg=HOOK.wrap('accMsg','ag/giris-oyuncu-karti#_pcMsg',function(_pcMsg){ return function(t,err){ _pcMsg(t,err); const el=$('pcMsg'); if(el){ el.textContent=t||''; el.classList.toggle('err',!!err); } }; },accMsg);
(function(){
  const tabs=$('pcTabs'); if(tabs) tabs.addEventListener('click',function(e){ const b=e.target.closest('button[data-t]'); if(b) pcTab(b.dataset.t); });
  const ed=$('pcEdit'); if(ed) ed.addEventListener('click',function(){ pcTab('hesap'); try{ $('pcEditBox').scrollIntoView({block:'start',behavior:'smooth'}); $('accCs').focus(); }catch(e){} });
  const pl=$('pcPill'); if(pl) pl.addEventListener('click',function(){ if(!ACC.user&&ACC.cfg) loginOpen('in'); });
  const li=$('pcLogin'); if(li) li.addEventListener('click',function(){ loginOpen('in'); });
  const lc=$('pcLic'); if(lc) lc.addEventListener('click',function(){ accClose(); if(typeof licOpen==='function') licOpen(); });
  const lt=$('lgTabs'); if(lt) lt.addEventListener('click',function(e){ const b=e.target.closest('button[data-m]'); if(b) loginMode(b.dataset.m); });
  const go=$('lgGo'); if(go) go.addEventListener('click',loginGo);
  ['accMail','accPass'].forEach(function(id){ const i=$(id); if(i) i.addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Enter'){ e.preventDefault(); if(id==='accMail') $('accPass').focus(); else loginGo(); } }); });
  const eye=$('lgEye'); if(eye) eye.addEventListener('click',function(){ const p=$('accPass'); p.type=p.type==='password'?'text':'password'; eye.setAttribute('aria-pressed',String(p.type==='text')); });
  const x=$('lgClose'); if(x) x.addEventListener('click',function(){ loginClose(); SETTINGS.accPrompted=true; saveSettings(); if(state==='menu') refreshTitle(); });
  const gu=$('accGuest'); if(gu) gu.addEventListener('click',function(){ loginClose(); toast('Misafir olarak devam ediyorsun — istediğin zaman profilinden giriş yapabilirsin','#b8ecff'); });
  const cs=$('accCs'); if(cs) cs.addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Enter') $('accSave').click(); });
})();
