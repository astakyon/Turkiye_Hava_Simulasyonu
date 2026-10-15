/* ------------------------------------------------------------------ Android / install (V2.01)
   • New adaptive app icon (any + maskable + monochrome), launcher shortcuts (Hızlı Oyun · Harekât · Görevler) read from ?act=.
   • "Uygulamayı yükle" button on the title screen when the browser offers installation (Android Chrome, desktop Chrome/Edge);
     on iPhone it explains Paylaş → Ana Ekrana Ekle. Hidden when already running as an installed app. */
const INST={evt:null, standalone:false};
try{ INST.standalone=(window.matchMedia&&window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches)||navigator.standalone===true; }catch(e){}
function instIOS(){ return DEV.ios&&!INST.standalone; }
function instBtn(){ let b=$('cInstall'); const host=$('cIbtns'); if(!b&&host&&document.createElement){ b=document.createElement('button'); b.type='button'; b.id='cInstall'; b.className='cinst'; b.title='Uygulamayı yükle'; b.setAttribute('aria-label','Uygulamayı yükle');
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>'; host.insertBefore(b,host.firstChild); b.addEventListener('click',instGo); }
  if(b) b.classList.toggle('hidden',INST.standalone||!(INST.evt||instIOS())); return b; }
function instGo(){ if(INST.evt){ const e=INST.evt; INST.evt=null; try{ e.prompt(); e.userChoice.then(function(c){ if(c&&c.outcome==='accepted') toast('Yükleniyor — ana ekranında "Ay Yıldız" simgesi çıkacak','#7dffb0'); instBtn(); }); }catch(err){} return; }
  if(instIOS()) toast('iPhone: alttaki Paylaş düğmesine dokun → "Ana Ekrana Ekle"','#b8ecff'); }
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); INST.evt=e; instBtn(); });
window.addEventListener('appinstalled',function(){ INST.evt=null; INST.standalone=true; instBtn(); });
setTimeout(instBtn,800);
/* launcher shortcuts: index.html?act=q_quick / q_camp / q_mis */
(function(){ let act=null; try{ act=new URLSearchParams(location.search).get('act'); }catch(e){} if(!act||!/^q_(quick|camp|mis|free|walk)$/.test(act)) return;
  setTimeout(function(){ try{ if(state==='menu'){ if(typeof loginClose==='function') loginClose(); titleAct(act); } }catch(e){} try{ history.replaceState(null,'',location.pathname); }catch(e){} },1600); })();
