/* ------------------------------------------------------------------ account deletion (V2.52, Google Play requirement)
   Profil → Hesap: "Hesabımı sil" (shown while signed in). The first press arms the button for 6 s ("Emin misin? Tekrar bas"),
   the second calls the Supabase function delete_my_account() (supabase/hesap_silme.sql), which removes the sign-in and, by
   cascade, the profile and the cloud save. The local guest profiles on this device stay. If the function is not installed yet,
   the player is pointed to the web page (privacy.html#hesap-silme) that explains how to ask for deletion. No browser dialogs. */
const ACCDEL={armT:0, busy:false};
function accDelMsg(t,err){ const el=$('pcMsg'); if(!el) return; el.textContent=t||''; el.classList.toggle('err',!!err); }
function accDelSync(){ const b=$('accDel'); if(!b) return; b.classList.toggle('hidden',!ACC.user); if(!ACC.user){ ACCDEL.armT=0; b.textContent='Hesabımı sil'; b.classList.remove('danger'); } }
function accDelPress(){ const b=$('accDel'); if(!b||!ACC.user||!ACC.sb||ACCDEL.busy) return;
  const now=Date.now(); if(now>ACCDEL.armT){ ACCDEL.armT=now+6000; b.textContent='Emin misin? Hesabın, profilin ve bulut kaydın silinir — tekrar bas'; b.classList.add('danger');
    setTimeout(function(){ if(Date.now()>=ACCDEL.armT&&!ACCDEL.busy){ b.textContent='Hesabımı sil'; b.classList.remove('danger'); } },6100); return; }
  ACCDEL.busy=true; ACCDEL.armT=0; b.textContent='Siliniyor…';
  ACC.sb.rpc('delete_my_account').then(function(r){
    if(r&&r.error) throw r.error;
    return ACC.sb.auth.signOut().catch(function(){}).then(function(){ ACC.user=null; ACC.prof=null; ACC.role='player'; ACC.status='guest'; accChip(); accRoleApply(); accRender();
      toast('Hesabın ve bulut kayıtların silindi — misafir profiline geçildi','#b8ecff'); accDelMsg('Hesap silindi. Bu cihazdaki misafir profilleri duruyor.'); });
  }).catch(function(e){ accDelMsg('Hesap şu an buradan silinemedi'+(e&&e.message?' ('+e.message+')':'')+'. Silme talebi için: gizlilik sayfası → Hesap silme.',true);
    const a=$('accDelLink'); if(a) a.classList.remove('hidden'); })
  .finally(function(){ ACCDEL.busy=false; const bb=$('accDel'); if(bb){ bb.textContent='Hesabımı sil'; bb.classList.remove('danger'); } accDelSync(); });
}
(function(){ const out=$('accOut'); if(!out||$('accDel')) return; const row=out.parentNode;
  const b=document.createElement('button'); b.className='btn'; b.id='accDel'; b.type='button'; b.textContent='Hesabımı sil'; row.appendChild(b);
  const a=document.createElement('a'); a.id='accDelLink'; a.className='btn hidden'; a.href='privacy.html#hesap-silme'; a.target='_blank'; a.rel='noopener'; a.textContent='Silme talebi sayfası'; row.appendChild(a);
  b.addEventListener('click',accDelPress); accDelSync(); })();
accRender=HOOK.wrap('accRender','ag/hesap-silme#accDelSync',function(next){ return function(){ next(); accDelSync(); }; },accRender);
