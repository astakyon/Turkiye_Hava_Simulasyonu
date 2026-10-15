/* ------------------------------------------------------------------ one save record (V2.26)
   Before: 28 separate browser keys under two prefixes (kaan-sim-* and ayy-*), each written on its own; a broken one could
   stop a module from starting and nothing was kept as a backup.
   Now everything the game saves lives in one versioned record, 'ayy-kayit' = {v, t, d:{key: text}}. The game reads and
   writes it through stGet / stSet / stDel / stKeys with the same keys and the same text values as before, so no module had
   to change its data. Writes are gathered for a quarter second (and on leaving the page) into one write.
   • First start after the update: the old keys are copied in, checked, then removed (28 → 1, plus the backup).
   • Backup: once per session the last good record is copied to 'ayy-kayit-yedek'. If the main record cannot be read, the
     game starts from the backup and says so; if neither can be read it starts fresh and keeps the broken text aside
     ('ayy-kayit-bozuk') instead of overwriting it.
   • Graphics settings stay per device: the cloud sync (ag/hesap) never copies them to another device. */
const DEPO={key:'ayy-kayit', bak:'ayy-kayit-yedek', bad:'ayy-kayit-bozuk', v:1, d:{}, from:'yeni', moved:0, dirty:false, t:0, saves:0, err:null,
  legacy:/^(ayy-|kaan-|ayyildiz|kaan_)/i};
function depoLS(){ try{ return (typeof localStorage!=='undefined'&&localStorage)?localStorage:null; }catch(e){ return null; } }
function depoParse(txt){ if(!txt) return null; try{ const o=JSON.parse(txt); if(o&&typeof o==='object'&&o.d&&typeof o.d==='object'&&o.v>=1){ const d={}; Object.keys(o.d).forEach(function(k){ if(typeof o.d[k]==='string') d[k]=o.d[k]; }); return d; } }catch(e){} return null; }
function depoText(){ return JSON.stringify({v:DEPO.v, t:Date.now(), d:DEPO.d}); }
function depoLoad(){ const ls=depoLS(); DEPO.d={}; if(!ls) { DEPO.from='bellek'; return; }
  let main=null, bak=null; try{ main=ls.getItem(DEPO.key); bak=ls.getItem(DEPO.bak); }catch(e){}
  const d=depoParse(main);
  if(d){ DEPO.d=d; DEPO.from='kayıt'; if(main!==bak) try{ ls.setItem(DEPO.bak,main); }catch(e){} }   /* last good record → backup, once per session */
  else if(main!=null){ const b=depoParse(bak); try{ ls.setItem(DEPO.bad,main); }catch(e){}
    if(b){ DEPO.d=b; DEPO.from='yedek'; } else DEPO.from='bozuk'; depoWrite(); }
  else { /* first start with the new record: bring the old keys in */
    const keys=[]; try{ for(let i=0;i<ls.length;i++){ const k=ls.key(i); if(k&&DEPO.legacy.test(k)&&k.indexOf(DEPO.key)!==0) keys.push(k); } }catch(e){}
    keys.forEach(function(k){ try{ const v=ls.getItem(k); if(v!=null) DEPO.d[k]=v; }catch(e){} });
    DEPO.moved=keys.length; DEPO.from=keys.length?'taşındı':'yeni';
    if(depoWrite()&&depoParse(ls.getItem(DEPO.key))) keys.forEach(function(k){ try{ ls.removeItem(k); }catch(e){} });   /* old keys go only once the record reads back */
  } }
function depoWrite(){ const ls=depoLS(); DEPO.dirty=false; if(!ls) return false; try{ ls.setItem(DEPO.key,depoText()); DEPO.saves++; DEPO.err=null; return true; }
  catch(e){ DEPO.err=String(e&&e.name||e); if(!DEPO.warned){ DEPO.warned=true; try{ setTimeout(function(){ if(typeof toast==='function') toast('Kayıt yazılamadı: tarayıcı depolaması dolu ya da kapalı','#ff5a4a'); },0); }catch(x){} } return false; } }
function depoDirty(){ if(DEPO.dirty) return; DEPO.dirty=true; try{ setTimeout(function(){ if(DEPO.dirty) depoWrite(); },250); }catch(e){ depoWrite(); } }
function stGet(k){ return Object.prototype.hasOwnProperty.call(DEPO.d,k)?DEPO.d[k]:null; }
function stSet(k,v){ const s=String(v); if(DEPO.d[k]===s) return; DEPO.d[k]=s; depoDirty(); }
function stDel(k){ if(!Object.prototype.hasOwnProperty.call(DEPO.d,k)) return; delete DEPO.d[k]; depoDirty(); }
function stKeys(){ return Object.keys(DEPO.d); }
function depoFlush(){ if(DEPO.dirty) depoWrite(); }
depoLoad();
try{ window.addEventListener('pagehide',depoFlush); document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden') depoFlush(); }); }catch(e){}
if(DEPO.from==='yedek'||DEPO.from==='bozuk') try{ setTimeout(function(){ if(typeof toast==='function') toast(DEPO.from==='yedek'?'Kayıt okunamadı — son yedekten geri yüklendi':'Kayıt okunamadı — oyun yeni kayıtla açıldı (eskisi ayrı saklandı)','#ffc24a'); },3000); }catch(e){}
