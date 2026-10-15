/* ------------------------------------------------------------------ system inventory (V1.86)
   418 Turkish defence systems with factual data (maker, status, configurations, user countries, technical specs)
   from the Defence Turk "Sistem Envanteri" (open-source information), shown with attribution on every page.
   Opens from the title header (book icon), from the hangar ("Gerçek veriler") and from the model library info tab. */
const ENV_CATS=[['all','Tümü'],['hava','Hava ve uzay'],['kara','Kara'],['deniz','Deniz'],['silah','Silah'],['radar','Radar ve EH'],['muhabere','Muhabere'],['guvenlik','Güvenlik'],['simulator','Simülatör']];
/* systems that exist in the game: game key -> inventory name */
const ENV_GAME={'ac:kaan':'KAAN','ac:anka3':'ANKA-3','ac:hurjet':'HÜRJET','ac:hurkus':'Hürkuş Temel Eğitim Uçağı','ac:anka':'ANKA','ac:aksungur':'AKSUNGUR MALE İHA',
  'ac:kizilelma':'Bayraktar KIZILELMA Muharip İnsansız Uçak Sistemi','ac:tb2':'Bayraktar TB2','ac:tb3':'Bayraktar TB3','ac:akinci':'Bayraktar Akıncı Taarruzi İnsansız Hava Aracı',
  'heli:t129':'T129 ATAK Helikopteri','heli:t625':'T625 GÖKBEY Genel Maksat Helikopteri','sh:istif':'İ Sınıfı Fırkateyn','sh:ada':'Ada Sınıfı Korvet (MİLGEM)',
  'sh:anadolu':'TCG Anadolu LHD','sh:sub':'Type 214 (Reis Sınıfı) Denizaltı','ld:altay':'Altay Ana Muharebe Tankı','ld:firtina':'FIRTINA NG',
  'ld:pars':'PARS III 8x8 Taktik Tekerlekli Zırhlı Araç','ld:hisar':'HİSAR-O+','ld:korkut':'KORKUT'};
const ENVI={cat:'all', sub:'', q:'', game:false, sel:-1, from:null, list:[]};
const ENV_IDX={}; ENV_DATA.forEach(function(r,i){ ENV_IDX[r[0]]=i; });
const ENV_INGAME={}; Object.keys(ENV_GAME).forEach(function(k){ const i=ENV_IDX[ENV_GAME[k]]; if(i!=null) ENV_INGAME[i]=k; });
function envEsc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function envFold(s){ return String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[̀-ͯ]/g,''); }
let ENV_TXT=null;   /* search text, built on the first search (V2.19: was built at start-up) */
function envTxt(){ return ENV_TXT||(ENV_TXT=ENV_DATA.map(function(r){ return envFold(r[0]+' '+r[2]+' '+r[3]+' '+r[4]+' '+r[6]+' '+r[5].map(function(g){ return g[0]+' '+g[1].map(function(kv){ return kv[0]+' '+kv[1]; }).join(' '); }).join(' ')); })); }
function envCatName(c){ const e=ENV_CATS.find(function(x){ return x[0]===c; }); return e?e[1]:c; }
function envFilter(){ const q=envFold(ENVI.q).split(/\s+/).filter(Boolean);
  ENVI.list=[]; ENV_DATA.forEach(function(r,i){ if(ENVI.cat!=='all'&&r[1]!==ENVI.cat) return; if(ENVI.sub&&r[2]!==ENVI.sub) return; if(ENVI.game&&ENV_INGAME[i]==null) return;
    if(q.length&&!q.every(function(w){ return envTxt()[i].indexOf(w)>=0; })) return; ENVI.list.push(i); });
  return ENVI.list; }
function envRenderCats(){ const el=$('envCats'); if(!el) return; const n={all:ENV_DATA.length}; ENV_DATA.forEach(function(r){ n[r[1]]=(n[r[1]]||0)+1; });
  el.innerHTML=ENV_CATS.filter(function(c){ return n[c[0]]; }).map(function(c){ return '<button type="button" data-c="'+c[0]+'" aria-pressed="'+(ENVI.cat===c[0])+'">'+c[1]+'<small>'+n[c[0]]+'</small></button>'; }).join('');
  const subs=[]; ENV_DATA.forEach(function(r){ if((ENVI.cat==='all'||r[1]===ENVI.cat)&&subs.indexOf(r[2])<0) subs.push(r[2]); }); subs.sort(function(a,b){ return a.localeCompare(b,'tr'); });
  if(ENVI.sub&&subs.indexOf(ENVI.sub)<0) ENVI.sub='';
  $('envSub').innerHTML='<option value="">Tüm alt kategoriler</option>'+subs.map(function(s){ return '<option'+(s===ENVI.sub?' selected':'')+'>'+envEsc(s)+'</option>'; }).join(''); }
function envRenderList(){ const L=envFilter(), el=$('envList'); if(!el) return;
  $('envCount').textContent=L.length+' sistem'+(ENVI.q?' · “'+ENVI.q+'”':'');
  el.innerHTML=L.slice(0,500).map(function(i){ const r=ENV_DATA[i]; return '<li tabindex="0" data-i="'+i+'" class="'+(i===ENVI.sel?'on':'')+'"><b>'+envEsc(r[0])+(ENV_INGAME[i]!=null?'<span class="g">OYUNDA</span>':'')+'</b><small>'+envEsc(r[3]||'—')+' · '+envEsc(r[2])+'</small></li>'; }).join('')||'<li class="none"><small>Eşleşen sistem yok.</small></li>'; }
function envRenderDet(){ const el=$('envDet'); if(!el) return; const r=ENV_DATA[ENVI.sel];
  if(!r){ el.innerHTML='<p class="envempty">Soldaki listeden bir sistem seç.<br><small>'+ENV_DATA.length+' sistem · '+new Set(ENV_DATA.map(function(x){ return x[3]; })).size+' üretici</small></p>'; return; }
  const key=ENV_INGAME[ENVI.sel], cfg=String(r[4]||'').split(/\s*[|,]\s*/).filter(Boolean);
  let h='<button type="button" class="btn sm" id="envBack">← Liste</button><p class="k">'+envEsc(envCatName(r[1]))+' · '+envEsc(r[2])+'</p><h2>'+envEsc(r[0])+'</h2>';
  h+='<div class="envbadges"><span>Üretici: <b>'+envEsc(r[3]||'—')+'</b></span><span class="'+(r[7]?'on':'off')+'">'+(r[7]?'Aktif':'Pasif')+'</span>'+(r[6]?'<span>Kullanıcı: '+envEsc(r[6])+'</span>':'')+(key?'<span class="on">Oyunda var</span>':'')+'</div>';
  if(cfg.length) h+='<h3>Konfigürasyonlar</h3><div class="envcfg">'+cfg.map(function(c){ return '<span>'+envEsc(c)+'</span>'; }).join('')+'</div>';
  if(r[5].length) r[5].forEach(function(g){ h+='<h3>'+envEsc(g[0])+'</h3><table>'+g[1].map(function(kv){ return '<tr><td>'+envEsc(kv[0])+'</td><td>'+envEsc(kv[1])+'</td></tr>'; }).join('')+'</table>'; });
  else h+='<p class="envempty">Bu sistem için teknik veri yok.</p>';
  if(key&&state==='menu'){ h+='<div class="envact">'; if(key.indexOf('ac:')===0) h+='<button type="button" class="btn sm" data-fly="'+key.slice(3)+'">Hangarda seç</button>'; if(typeof accIsAdmin==='function'&&accIsAdmin()) h+='<button type="button" class="btn sm" data-lib="'+key+'">Modeli incele</button>'; h+='</div>'; }
  h+='<p class="envcite">Kaynak: <a href="'+ENV_SRC.url+'" target="_blank" rel="noopener">'+envEsc(ENV_SRC.name)+'</a> — açık kaynak bilgiler. Veriler bilgi amaçlıdır; oyundaki uçuş değerleri oynanış için ayarlanmıştır.</p>';
  el.innerHTML=h; el.scrollTop=0; }
function envRender(){ envRenderCats(); envRenderList(); envRenderDet(); const w=document.querySelector?document.querySelector('#envUI .envw'):null; if(w&&w.classList) w.classList.toggle('det',ENVI.sel>=0&&ENVI.det===true); }
function envOpen(nameOrKey){ let i=-1; if(nameOrKey){ if(ENV_GAME[nameOrKey]) nameOrKey=ENV_GAME[nameOrKey]; i=ENV_IDX[nameOrKey]; if(i==null) i=-1; }
  ENVI.from=state==='menu'?menuMode:state; closeModals(); $('envUI').classList.remove('hidden');
  if(i>=0){ ENVI.cat=ENV_DATA[i][1]; ENVI.sub=''; ENVI.q=''; $('envQ').value=''; ENVI.sel=i; ENVI.det=true; } else ENVI.det=false;
  envRender(); if(i<0) try{ $('envQ').focus(); }catch(e){} else try{ const li=document.querySelector('#envList li.on'); if(li&&li.scrollIntoView) li.scrollIntoView({block:'center'}); }catch(e){} }
function envClose(){ $('envUI').classList.add('hidden'); }
function envPick(i){ ENVI.sel=i; ENVI.det=true; envRenderDet(); Array.prototype.forEach.call(document.querySelectorAll('#envList li'),function(li){ li.classList.toggle('on',+li.dataset.i===i); }); const w=document.querySelector('#envUI .envw'); if(w) w.classList.add('det'); }
(function(){ if(!$('envUI')) return; MODALS.push('envUI');
  $('btnEnvClose').addEventListener('click',envClose);
  $('envQ').addEventListener('input',function(){ ENVI.q=$('envQ').value.trim(); envRenderList(); });
  $('envQ').addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Enter'&&ENVI.list.length){ envPick(ENVI.list[0]); } if(e.key==='Escape') envClose(); });
  $('envCats').addEventListener('click',function(e){ const b=e.target.closest('button[data-c]'); if(!b) return; ENVI.cat=b.dataset.c; ENVI.sub=''; envRenderCats(); envRenderList(); });
  $('envSub').addEventListener('change',function(){ ENVI.sub=$('envSub').value; envRenderList(); });
  $('envGame').addEventListener('change',function(){ ENVI.game=$('envGame').checked; envRenderList(); });
  const pick=function(e){ const li=e.target.closest('li[data-i]'); if(li) envPick(+li.dataset.i); };
  $('envList').addEventListener('click',pick); $('envList').addEventListener('keydown',function(e){ if(e.key==='Enter') pick(e); });
  $('envDet').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return;
    if(b.id==='envBack'){ ENVI.det=false; const w=document.querySelector('#envUI .envw'); if(w) w.classList.remove('det'); return; }
    if(b.dataset.fly){ envClose(); selectedId=b.dataset.fly; if(typeof enterHangar==='function'&&state==='menu') enterHangar(); return; }
    if(b.dataset.lib){ envClose(); openLibrary(b.dataset.lib); } });
  window.addEventListener('keydown',function(e){ if(e.code==='Escape'&&!$('envUI').classList.contains('hidden')){ e.preventDefault(); e.stopImmediatePropagation(); envClose(); } },true);
  /* title header: inventory button */
  const hb=$('cIbtns'); if(hb&&document.createElement){ const b=document.createElement('button'); b.type='button'; b.id='btnEnv'; b.title='Sistem envanteri'; b.setAttribute('aria-label','Sistem envanteri');
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M8 7h7M8 11h7"/></svg>';
    if(hb.insertBefore) hb.insertBefore(b,hb.firstChild); b.addEventListener('click',function(){ if(state==='menu') envOpen(); }); }
  /* hangar: real data for the selected aircraft */
  const hd=$('hDesc'); if(hd&&hd.parentNode&&document.createElement){ const b=document.createElement('button'); b.type='button'; b.className='btn sm envhb'; b.id='btnEnvAc'; b.textContent='📖 Gerçek veriler';
    if(hd.parentNode.insertBefore) hd.parentNode.insertBefore(b,hd.nextSibling); b.addEventListener('click',function(){ envOpen('ac:'+selectedId); }); } })();
/* model library info tab: a few real figures and the source */
function envBrief(key){ const i=ENV_IDX[ENV_GAME[key]]; if(i==null) return null; const r=ENV_DATA[i], out=[];
  const want=/^(hız|azami hız|maksimum hız|seyir hızı|menzil|azami menzil|tavan|uçuş irtifası|servis tavanı|havada kalış|faydalı yük|maksimum kalkış ağırlığı|kanat açıklığı|boy|uzunluk|motor tipi|model|ana top çapı|muharebe ağırlığı|mürettebat|deplasman|tam boy)/i;
  r[5].forEach(function(g){ g[1].forEach(function(kv){ if(out.length<6&&want.test(kv[0])&&!out.some(function(o){ return o[0]===kv[0]; })) out.push(kv); }); });
  return {r:r,i:i,rows:out}; }
if(typeof libRefreshPanel==='function'){ libRefreshPanel=HOOK.wrap('libRefreshPanel','94-envanter#_envLib',function(_envLib){ return function(){ _envLib(); const it=LIB.item; if(!it) return; const b=envBrief(it.key); if(!b) return;
  $('libInfo').innerHTML+='<dt class="envrow">Gerçek veriler</dt><dd class="envrow"></dd>'+b.rows.map(function(kv){ return '<dt>'+envEsc(kv[0])+'</dt><dd>'+envEsc(kv[1])+'</dd>'; }).join('')+'<dd class="envrow"><button type="button" class="btn sm" data-envk="'+it.key+'">Envanterde aç</button> <small>Kaynak: Defence Turk</small></dd>'; }; },libRefreshPanel);
  (function(){ const li=$('libInfo'); if(li) li.addEventListener('click',function(e){ const b=e.target.closest('[data-envk]'); if(b){ const k=b.dataset.envk; if(typeof closeLibrary==='function') closeLibrary(); envOpen(k); } }); })(); }
