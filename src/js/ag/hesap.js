/* ------------------------------------------------------------------ accounts, profiles and cloud saves (Supabase)
   Guest mode (no account): local profiles on this device (call sign, unit, emblem, rank/XP), saves in localStorage.
   Signed in: profile row + one JSON save per user, synced both ways (newest wins), pushed a few seconds after any change,
   cached offline and pushed again when the connection comes back. The supabase-js library is loaded only when needed. */
const ACC={cfg:null, sb:null, user:null, prof:null, role:'player', status:'guest', dirtyT:0, lastPush:0, pulling:false, err:''};
const UNITS={hava:'Hilal Kanatlar',deniz:'Mavi Kanatlar',kara:'Bozkurtlar'};
const EMBLEMS=[['hilal','☾'],['kurt','🐺'],['kartal','🦅'],['yildiz','★'],['kalkan','🛡'],['simsek','⚡']];
function accCfg(){ if(ACCOUNT_CFG.url&&ACCOUNT_CFG.key) return ACCOUNT_CFG; try{ const c=JSON.parse(stGet('ayy-supa')||'null'); if(c&&c.url&&c.key) return c; }catch(e){} return null; }
/* ---- local (guest) profiles */
function lpAll(){ try{ const L=JSON.parse(stGet('ayy-profiles')||'null'); if(Array.isArray(L)&&L.length) return L; }catch(e){} return [{id:'g1',callsign:SETTINGS.callsign||'Hilal 1',unit:'hava',emblem:'hilal',xp:0,rank:0,stats:{}}]; }
function lpSave(L){ try{ stSet('ayy-profiles',JSON.stringify(L)); }catch(e){} }
function lpCurId(){ try{ return stGet('ayy-prof-cur')||'g1'; }catch(e){ return 'g1'; } }
function lpCur(){ const L=lpAll(); return L.find(function(p){ return p.id===lpCurId(); })||L[0]; }
function accProfile(){ if(ACC.prof) return ACC.prof; if(!ACC.local||ACC.local.id!==lpCurId()) ACC.local=lpCur(); return ACC.local; }
function accSetProfile(patch){
  if(ACC.prof){ Object.assign(ACC.prof,patch); accPushProfile(); }
  else { const L=lpAll(), p=L.find(function(x){ return x.id===lpCurId(); })||L[0]; Object.assign(p,patch); lpSave(L); ACC.local=null; }
  if(patch.callsign){ SETTINGS.callsign=patch.callsign; saveSettings(); }
  accChip();
}
/* ---- library loader */
function accLib(){ if(window.supabase&&window.supabase.createClient) return Promise.resolve();
  return new Promise(function(res,rej){ const urls=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js','https://unpkg.com/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'];
    (function next(i){ if(i>=urls.length){ rej(new Error('Bulut kitaplığı yüklenemedi')); return; } const s=document.createElement('script'); s.src=urls[i]; s.onload=function(){ window.supabase?res():next(i+1); }; s.onerror=function(){ next(i+1); }; document.head.appendChild(s); })(0); }); }
function accInit(){
  ACC.cfg=accCfg(); accChip(); if(!ACC.cfg) return Promise.resolve(false);
  ACC.status='connecting'; accChip();
  return accLib().then(function(){
    ACC.sb=window.supabase.createClient(ACC.cfg.url,ACC.cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    ACC.sb.auth.onAuthStateChange(function(ev,session){ const u=session&&session.user; if(u&&(!ACC.user||ACC.user.id!==u.id)){ ACC.user=u; accAfterLogin(); } else if(!u&&ACC.user){ ACC.user=null; ACC.prof=null; ACC.role='player'; ACC.status='guest'; accChip(); accRoleApply(); } });
    return ACC.sb.auth.getSession();
  }).then(function(r){ const s=r&&r.data&&r.data.session; if(s&&s.user){ ACC.user=s.user; return accAfterLogin(); } ACC.status='guest'; accChip(); accAnnouncements(); return false; })
  .catch(function(e){ ACC.status='offline'; ACC.err=e&&e.message||String(e); accChip(); return false; });
}
function accAfterLogin(){
  ACC.status='syncing'; accChip();
  return ACC.sb.from('profiles').select('*').eq('id',ACC.user.id).maybeSingle().then(function(r){
    if(r.error) throw r.error;
    if(!r.data){ ACC.prof=null; ACC.status='newprofile'; accChip(); accOpen('profile'); return false; }
    ACC.prof=r.data; ACC.role=r.data.role||'player';
    if(r.data.banned){ toast('Hesabın yönetici tarafından uzaklaştırıldı','#ff6a5a'); }
    SETTINGS.callsign=r.data.callsign; saveSettings();
    return accPull().then(function(){ ACC.status='online'; accChip(); accRoleApply(); accAnnouncements(); toast('Hoş geldin, '+r.data.callsign,'#7dffb0'); return true; });
  }).catch(function(e){ ACC.status='offline'; ACC.err=e&&e.message||String(e); accChip(); toast('Bulut bağlantısı kurulamadı: '+ACC.err,'#ffc24a'); return false; });
}
function accCreateProfile(callsign,unit,emblem){
  if(!ACC.sb||!ACC.user){ accSetProfile({callsign:callsign,unit:unit,emblem:emblem}); return Promise.resolve(true); }
  const lp=lpCur(), row={id:ACC.user.id,callsign:callsign,unit:unit,emblem:emblem,xp:lp.xp||0,rank:lp.rank||0,stats:lp.stats||{}};
  return ACC.sb.from('profiles').insert(row).select().single().then(function(r){ if(r.error) throw r.error; ACC.prof=r.data; ACC.role=r.data.role; SETTINGS.callsign=callsign; saveSettings();
    return accPush(true); }).then(function(){ ACC.status='online'; accChip(); accRoleApply(); toast('Profil oluşturuldu — bu cihazdaki kayıtların hesabına aktarıldı','#7dffb0'); return true; })
    .catch(function(e){ toast('Profil oluşturulamadı: '+(e&&e.message||e),'#ff6a5a'); return false; });
}
function accPushProfile(){ if(!ACC.sb||!ACC.prof) return; const p=ACC.prof; ACC.sb.from('profiles').update({callsign:p.callsign,unit:p.unit,emblem:p.emblem,xp:p.xp,rank:p.rank,stats:p.stats}).eq('id',p.id).then(function(r){ if(r.error) console.warn(r.error); }); }
/* ---- save payload */
function accPayload(){ return {v:1, t:Date.now(), settings:SETTINGS, ctrl:{kb:CTRL.kb,pad:CTRL.pad}, liv:(typeof LIV!=='undefined'?LIV.data:{}), load:LOADOUTS, rec:RECORDS, snd:SND.user}; }
function accApply(d){
  if(!d) return;
  if(d.settings){ const keep={}; ['safeMode','depth','quality','shadows','fx','res','aa','fpsCap','split','autoPerf','gd','tierAuto','terrainLod','warm','texShare','bake','merge','freeze','fxMerge','shadowEvery'].forEach(function(k){ keep[k]=SETTINGS[k]; }); Object.assign(SETTINGS,d.settings,keep);   /* graphics stay per device (a PC's shadows / effects must not land on a phone); V2.26: also the detailed groups (gd) and the Otomatik preset */ saveSettings(); }
  if(d.ctrl){ if(d.ctrl.kb) CTRL.kb=d.ctrl.kb; if(d.ctrl.pad) CTRL.pad=d.ctrl.pad; ctrlSave(); }
  if(d.liv&&typeof LIV!=='undefined'){ LIV.data=d.liv; livSave(); }
  if(d.load){ Object.keys(LOADOUTS).forEach(function(k){ delete LOADOUTS[k]; }); Object.assign(LOADOUTS,d.load); saveLoadouts(); }
  if(d.rec){ RECORDS=d.rec; saveRecords(); }
  if(d.snd){ SND.user=d.snd; sndSave(); }
  try{ stSet('ayy-save-t',String(d.t||Date.now())); }catch(e){}
  try{ if(typeof settingsApplyAll==='function') settingsApplyAll(); }catch(e){}
}
function accLocalT(){ try{ return +stGet('ayy-save-t')||0; }catch(e){ return 0; } }
function accPull(){
  if(!ACC.sb||!ACC.user) return Promise.resolve(); ACC.pulling=true;
  return ACC.sb.from('saves').select('data,updated_at').eq('user_id',ACC.user.id).maybeSingle().then(function(r){ ACC.pulling=false;
    if(r.error) throw r.error; const d=r.data&&r.data.data;
    if(d&&d.t>accLocalT()) accApply(d); else if(!d||d.t<accLocalT()) return accPush(true);
  }).catch(function(e){ ACC.pulling=false; console.warn('çekme',e); });
}
function accPush(now){
  if(!ACC.sb||!ACC.user||!ACC.prof) return Promise.resolve(false);
  if(!now&&typeof navigator!=='undefined'&&navigator.onLine===false) return Promise.resolve(false);
  const p=accPayload(); try{ stSet('ayy-save-t',String(p.t)); }catch(e){}
  return ACC.sb.from('saves').upsert({user_id:ACC.user.id,data:p,updated_at:new Date().toISOString()}).then(function(r){ if(r.error) throw r.error; ACC.lastPush=Date.now(); ACC.dirtyT=0; ACC.status='online'; accChip(); return true; })
    .catch(function(e){ ACC.status='offline'; ACC.err=e&&e.message||String(e); accChip(); return false; });
}
function accDirty(){ try{ stSet('ayy-save-t',String(Date.now())); }catch(e){} if(ACC.user&&ACC.prof&&!ACC.dirtyT){ ACC.dirtyT=Date.now(); ACC.status='pending'; accChip(); } }
setInterval(function(){ if(ACC.dirtyT&&Date.now()-ACC.dirtyT>4000) accPush(); },1500);
window.addEventListener('online',function(){ if(ACC.user&&ACC.prof) accPush(true); });
/* any local save marks the cloud copy dirty */
const accWrap=function(f){ return function(){ const r=f.apply(this,arguments); accDirty(); return r; }; };
saveSettings=accWrap(saveSettings); saveRecords=accWrap(saveRecords); saveLoadouts=accWrap(saveLoadouts); ctrlSave=accWrap(ctrlSave); livSave=accWrap(livSave); sndSave=accWrap(sndSave);
/* ---- sign in / out */
function accSignInGoogle(){ if(!ACC.sb) return; ACC.sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}}).then(function(r){ if(r.error) toast('Google ile giriş açılmadı: '+r.error.message,'#ff6a5a'); }); }
function accEmail(mode,email,pass){
  if(!ACC.sb) return Promise.resolve();
  const A=ACC.sb.auth, p=mode==='up'?A.signUp({email:email,password:pass}):mode==='reset'?A.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}):A.signInWithPassword({email:email,password:pass});
  return p.then(function(r){ if(r.error){ accMsg(r.error.message.replace('Invalid login credentials','E-posta ya da şifre hatalı'),true); return; }
    if(mode==='up'&&!(r.data&&r.data.session)) accMsg('Kayıt alındı. E-postana gelen bağlantıyla hesabını onayla, sonra giriş yap.');
    else if(mode==='reset') accMsg('Şifre yenileme bağlantısı e-postana gönderildi.');
    else accMsg(''); });
}
function accSignOut(){ if(!ACC.sb) return; accPush(true).finally(function(){ ACC.sb.auth.signOut().then(function(){ ACC.user=null; ACC.prof=null; ACC.role='player'; ACC.status='guest'; accChip(); accRoleApply(); accRender(); toast('Çıkış yapıldı — misafir profiline geçildi','#b8ecff'); }); }); }
/* ---- announcements (shown on the main menu) */
function accAnnouncements(){ if(!ACC.sb) return; ACC.sb.from('announcements').select('id,text,created_at').eq('active',true).order('created_at',{ascending:false}).limit(1).then(function(r){
  const a=r.data&&r.data[0], el=$('cNews'); if(!el) return; if(!a){ el.classList.add('hidden'); return; } el.innerHTML='<b>DUYURU</b> '+String(a.text).replace(/</g,'&lt;'); el.classList.remove('hidden'); }); }
/* role-dependent UI (admin section arrives in V1.68) */
function accRoleApply(){ document.documentElement.classList.toggle('is-admin',accIsAdmin()); }
function accIsAdmin(){ if(ACC.cfg) return ACC.role==='admin'&&!(ACC.prof&&ACC.prof.banned); return true; /* no cloud configured: this device owns the game (development) */ }
/* ---- UI: profile chip on the main menu and the account screen */
const ACC_ST={guest:'Misafir',connecting:'Bağlanıyor…',syncing:'Eşitleniyor…',online:'Bulutta',pending:'Kaydedilecek…',offline:'Çevrimdışı',newprofile:'Profil oluştur'};
function accChip(){ const p=accProfile(), em=(EMBLEMS.find(function(e){ return e[0]===p.emblem; })||EMBLEMS[0])[1];
  const n=$('cName'), sub=$('cSub'), rk=$('cRank'); if(!n) return; n.textContent=p.callsign||'Misafir pilot';
  sub.textContent=(UNITS[p.unit]||'Hilal Kanatlar')+' · '+(ACC.user?ACC_ST[ACC.status]||'':(ACC.cfg?'Misafir · giriş yap':'Misafir'));
  rk.textContent=typeof rankShort==='function'?rankShort(p.rank||0):em; rk.title=em; }
function accMsg(t,err){ const el=$('accMsg'); if(!el) return; el.textContent=t||''; el.classList.toggle('err',!!err); }
function accOpen(tab){ closeModals(); $('acctUI').classList.remove('hidden'); ACC.tab=tab||(ACC.user&&!ACC.prof?'profile':'acct'); accRender(); try{ const t=tab==='career'?$('carSec'):(tab==='profile'?$('accProfTitle'):null); if(t&&t.scrollIntoView) t.scrollIntoView({block:'start'}); }catch(e){} }
function accClose(){ $('acctUI').classList.add('hidden'); }
function accRender(){
  const p=accProfile(), cfg=!!ACC.cfg, L=lpAll();
  $('accState').innerHTML=ACC.user?('<b>'+(ACC.user.email||'Hesap')+'</b><small>'+(ACC_ST[ACC.status]||'')+(ACC.lastPush?' · son kayıt '+new Date(ACC.lastPush).toLocaleTimeString('tr-TR'):'')+(ACC.role==='admin'?' · YÖNETİCİ':'')+'</small>')
    :(cfg?'<b>Misafir</b><small>Giriş yaparsan kayıtların her cihazda seninle olur</small>':'<b>Misafir (çevrimdışı mod)</b><small>Bulut hesapları henüz açılmadı; kayıtlar bu cihazda kalır</small>');
  $('accLogin').classList.toggle('hidden',!cfg||!!ACC.user); $('accOut').classList.toggle('hidden',!ACC.user); $('accNoCloud').classList.toggle('hidden',cfg);
  $('accLocal').classList.toggle('hidden',!!ACC.user);
  $('accProfList').innerHTML=L.map(function(x){ const em=(EMBLEMS.find(function(e){ return e[0]===x.emblem; })||EMBLEMS[0])[1]; return '<button type="button" data-p="'+x.id+'"'+(x.id===lpCurId()?' aria-pressed="true"':'')+'><span>'+em+'</span>'+x.callsign+'<small>'+(UNITS[x.unit]||'')+'</small></button>'; }).join('')+'<button type="button" data-p="new">+ Yeni profil</button>';
  $('accCs').value=p.callsign||''; $('accUnit').querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.u===(p.unit||'hava'))); });
  $('accEm').innerHTML=EMBLEMS.map(function(e){ return '<button type="button" data-e="'+e[0]+'"'+(e[0]===(p.emblem||'hilal')?' aria-pressed="true"':'')+'>'+e[1]+'</button>'; }).join('');
  $('accProfTitle').textContent=ACC.user&&!ACC.prof?'Profilini oluştur':'Profil';
  if(typeof careerRender==='function') careerRender();
}
(function(){
  $('btnAccBack').addEventListener('click',function(){ accClose(); if(state==='menu') refreshTitle(); });
  { const o=$('cProf'); if(o.replaceWith&&o.cloneNode){ const c=o.cloneNode(true); o.replaceWith(c); } $('cProf').addEventListener('click',function(){ accOpen(); }); }
  $('accGoogle').addEventListener('click',accSignInGoogle);
  $('accIn').addEventListener('click',function(){ accEmail('in',$('accMail').value.trim(),$('accPass').value); });
  $('accUp').addEventListener('click',function(){ if(($('accPass').value||'').length<6){ accMsg('Şifre en az 6 karakter olmalı',true); return; } accEmail('up',$('accMail').value.trim(),$('accPass').value); });
  $('accReset').addEventListener('click',function(){ if(!$('accMail').value.trim()){ accMsg('Önce e-posta adresini yaz',true); return; } accEmail('reset',$('accMail').value.trim()); });
  $('accOut').addEventListener('click',accSignOut);
  $('accGuest').addEventListener('click',function(){ SETTINGS.accPrompted=true; saveSettings(); accClose(); if(state==='menu') refreshTitle(); });
  $('accUnit').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b){ $('accUnit').querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed',String(x===b)); }); } });
  $('accEm').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b){ $('accEm').querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed',String(x===b)); }); } });
  $('accSave').addEventListener('click',function(){ const cs=($('accCs').value||'').trim().slice(0,20); if(cs.length<2){ accMsg('Çağrı adı en az 2 karakter olmalı',true); return; }
    const u=($('accUnit').querySelector('[aria-pressed="true"]')||{}).dataset, e=($('accEm').querySelector('[aria-pressed="true"]')||{}).dataset, unit=u&&u.u||'hava', em=e&&e.e||'hilal';
    if(ACC.user&&!ACC.prof) accCreateProfile(cs,unit,em).then(function(ok){ if(ok) accRender(); }); else { accSetProfile({callsign:cs,unit:unit,emblem:em}); accMsg('Kaydedildi'); accRender(); } });
  $('accProfList').addEventListener('click',function(e){ const b=e.target.closest('button[data-p]'); if(!b) return; const L=lpAll();
    if(b.dataset.p==='new'){ const id='g'+Date.now().toString(36); L.push({id:id,callsign:'Pilot '+(L.length+1),unit:'hava',emblem:'hilal',xp:0,rank:0,stats:{}}); lpSave(L); try{ stSet('ayy-prof-cur',id); }catch(err){} }
    else { lpSave(L); try{ stSet('ayy-prof-cur',b.dataset.p); }catch(err){} }
    ACC.local=null; const p=lpCur(); SETTINGS.callsign=p.callsign; saveSettings(); accChip(); accRender(); toast('Profil: '+p.callsign,'#b8ecff'); });
  /* cloud connection from the settings (advanced) */
  $('btnSupa').addEventListener('click',function(){ const url=($('setSupaUrl').value||'').trim(), key=($('setSupaKey').value||'').trim();
    if(!url&&!key){ try{ stDel('ayy-supa'); }catch(e){} toast('Bulut bağlantısı kaldırıldı — sayfa yenileniyor','#ffc24a'); setTimeout(function(){ location.reload(); },900); return; }
    if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)||key.length<40){ toast('Adres https://xxxx.supabase.co biçiminde, anahtar "anon public" olmalı','#ff6a5a'); return; }
    try{ stSet('ayy-supa',JSON.stringify({url:url.replace(/\/$/,''),key:key})); }catch(e){} toast('Bağlanılıyor…','#b8ecff'); accInit().then(function(){ accOpen(); }); });
})();
