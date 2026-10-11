/* ------------------------------------------------------------------ mission editor (V1.81)
   Place ground targets, air targets, enemy fighters, waypoints, scan points and the start on the island map.
   Every item has a stage (1–5): stage 1 is there from the start, stage N appears when stage N−1 is cleared — that is
   the trigger. Mission settings: name, briefing, aircraft, time limit, weather, time of day.
   Missions are saved on the device, shared as a code (AYG1.…) or a .json file; the admin can publish one to everybody
   (content kind 'mission'). Custom missions are on the board (category Özel). */
BCAT.ozel='Özel';
MISSIONS.cus={name:'Özel görev',desc:'',limit:0};
const ED_T={gt:{n:'Yer hedefi',c:'#ff8a5a'},at:{n:'Hava hedefi',c:'#ff4a6a'},en:{n:'Düşman uçağı',c:'#ff3a2a'},wp:{n:'Geçiş noktası',c:'#39e6ff'},sc:{n:'Keşif noktası',c:'#ffd27a'},st:{n:'Başlangıç',c:'#7dffb0'}};
const ED_GT=['truck','radar','depot','bunker','sam'];
const ED={m:null, tool:'sel', sel:null, cx:0, cz:0, scale:0.03, drag:null, open:false};
const CUS={local:[], pub:[], cur:null, st:null, keep:null};
try{ CUS.local=JSON.parse(localStorage.getItem('ayy-cmis')||'[]')||[]; }catch(e){ CUS.local=[]; }
function cusSave(){ try{ localStorage.setItem('ayy-cmis',JSON.stringify(CUS.local)); }catch(e){} }
function edNew(){ return {v:1,id:'c'+Date.now().toString(36),n:'Yeni görev',d:'Hedefleri imha et.',ac:'any',lim:600,wx:'clear',tod:'day',items:[{id:1,t:'st',x:0,z:2500,h:0,alt:600}]}; }
function edNextId(m){ return m.items.reduce(function(a,i){ return Math.max(a,i.id||0); },0)+1; }
/* ---- share code */
function cusEncode(m){ const j=JSON.stringify({v:1,n:m.n,d:m.d,ac:m.ac,lim:m.lim,wx:m.wx,tod:m.tod,items:m.items.map(function(i){ const o={t:i.t,x:Math.round(i.x),z:Math.round(i.z)}; if(i.type) o.ty=i.type; if(i.alt!=null) o.a=Math.round(i.alt); if(i.h) o.h=Math.round(i.h*100)/100; if(i.stage>1) o.s=i.stage; if(i.r) o.r=i.r; return o; })});
  return 'AYG1.'+btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function cusDecode(code){ try{ code=String(code).trim(); if(code.charAt(0)==='{'){ const m=JSON.parse(code); return cusNorm(m); }
    const b=code.replace(/^AYG1\./,'').replace(/-/g,'+').replace(/_/g,'/'); const j=JSON.parse(decodeURIComponent(escape(atob(b+'==='.slice((b.length+3)%4))))); return cusNorm(j); }catch(e){ return null; } }
function cusNorm(j){ if(!j||!Array.isArray(j.items)) return null; let k=1; return {v:1,id:'c'+Date.now().toString(36)+Math.floor(Math.random()*99),n:String(j.n||'Görev').slice(0,60),d:String(j.d||'').slice(0,400),ac:AIRCRAFT[j.ac]?j.ac:'any',lim:Math.max(0,Math.min(3600,+j.lim||0)),wx:WX_P[j.wx]?j.wx:'clear',tod:TOD.presets[j.tod]?j.tod:'day',
  items:j.items.slice(0,80).filter(function(i){ return ED_T[i.t]; }).map(function(i){ return {id:k++,t:i.t,x:+i.x||0,z:+i.z||0,type:i.ty||i.type||(i.t==='gt'?'truck':undefined),alt:i.a!=null?+i.a:i.alt,h:+i.h||0,stage:Math.max(1,Math.min(5,+(i.s||i.stage)||1)),r:i.r}; })}; }
/* ---- editor UI */
function edOpen(m){ ED.m=m?JSON.parse(JSON.stringify(m)):edNew(); ED.sel=null; ED.tool='sel'; const st=ED.m.items.find(function(i){ return i.t==='st'; }); ED.cx=st?st.x:0; ED.cz=st?st.z:0; ED.scale=0.05; ED.open=true;
  $('edUI').classList.remove('hidden'); edRender(); setTimeout(edResize,0); }
function edClose(){ ED.open=false; $('edUI').classList.add('hidden'); if(state==='menu'&&menuMode==='missions') renderMissions(); }
function edResize(){ const c=$('edMap'); if(!c) return; const r=c.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1); c.width=Math.max(10,Math.round(r.width*d)); c.height=Math.max(10,Math.round(r.height*d)); edDraw(); }
function edW2S(x,z,W,H){ return [W/2+(x-ED.cx)*ED.scale, H/2+(z-ED.cz)*ED.scale]; }
function edS2W(px,py,W,H){ return [ED.cx+(px-W/2)/ED.scale, ED.cz+(py-H/2)/ED.scale]; }
function edDraw(){ const c=$('edMap'); if(!c||!c.getContext) return; const x=c.getContext('2d'); if(!x||!x.setTransform) return; const d=c.width/Math.max(1,c.getBoundingClientRect().width||1), W=c.width/d, H=c.height/d; x.setTransform(d,0,0,d,0,0);
  const keep=[MAPV.cx,MAPV.cz,MAPV.scale]; MAPV.cx=ED.cx; MAPV.cz=ED.cz; MAPV.scale=ED.scale; try{ drawMap(x,W,H,false); }catch(e){} MAPV.cx=keep[0]; MAPV.cz=keep[1]; MAPV.scale=keep[2];
  const m=ED.m; m.items.forEach(function(i){ const p=edW2S(i.x,i.z,W,H), T=ED_T[i.t], sel=ED.sel===i; x.save(); x.fillStyle=T.c; x.strokeStyle=sel?'#ffffff':'#08121c'; x.lineWidth=sel?3:1.5;
    if(i.t==='wp'||i.t==='sc'){ x.globalAlpha=0.25; x.beginPath(); x.arc(p[0],p[1],Math.max(6,(i.r||500)*ED.scale),0,6.3); x.fill(); x.globalAlpha=1; x.beginPath(); x.arc(p[0],p[1],Math.max(6,(i.r||500)*ED.scale),0,6.3); x.stroke(); }
    else if(i.t==='st'){ x.translate(p[0],p[1]); x.rotate(i.h||0); x.beginPath(); x.moveTo(0,-11); x.lineTo(8,8); x.lineTo(0,4); x.lineTo(-8,8); x.closePath(); x.fill(); x.stroke(); }
    else if(i.t==='at'||i.t==='en'){ x.beginPath(); x.moveTo(p[0],p[1]-8); x.lineTo(p[0]+8,p[1]+6); x.lineTo(p[0]-8,p[1]+6); x.closePath(); x.fill(); x.stroke(); }
    else { x.fillRect(p[0]-6,p[1]-6,12,12); x.strokeRect(p[0]-6,p[1]-6,12,12); }
    x.restore(); if(i.t!=='st'){ x.font='700 11px "Chakra Petch",sans-serif'; x.fillStyle='#fff'; x.strokeStyle='rgba(0,0,0,.8)'; x.lineWidth=3; const s=String(i.stage||1); x.strokeText(s,p[0]+9,p[1]-7); x.fillText(s,p[0]+9,p[1]-7); } });
  /* order line through waypoints of the same stage */
  x.save(); x.strokeStyle='rgba(57,230,255,.6)'; x.setLineDash([5,4]); x.beginPath(); m.items.filter(function(i){ return i.t==='wp'||i.t==='sc'; }).sort(function(a,b){ return (a.stage||1)-(b.stage||1)||a.id-b.id; }).forEach(function(i,k){ const p=edW2S(i.x,i.z,W,H); if(k) x.lineTo(p[0],p[1]); else x.moveTo(p[0],p[1]); }); x.stroke(); x.restore(); }
function edRender(){ const m=ED.m;
  $('edTools').innerHTML=[['sel','✥ Seç / taşı']].concat(Object.keys(ED_T).map(function(k){ return [k,ED_T[k].n]; })).map(function(t){ return '<button type="button" data-tool="'+t[0]+'" class="'+(ED.tool===t[0]?'on':'')+'"><i style="background:'+(ED_T[t[0]]?ED_T[t[0]].c:'#dfe9f1')+'"></i>'+t[1]+'</button>'; }).join('');
  const i=ED.sel; let p='';
  if(i){ p='<b>'+ED_T[i.t].n+' #'+i.id+'</b>';
    if(i.t==='gt') p+='<label>Tür <select data-f="type">'+ED_GT.map(function(k){ return '<option value="'+k+'"'+(i.type===k?' selected':'')+'>'+GTYPE[k].label+'</option>'; }).join('')+'</select></label>';
    if(i.t==='at'||i.t==='en'||i.t==='st'||i.t==='wp') p+='<label>İrtifa (m) <input type="number" data-f="alt" min="50" max="4000" step="50" value="'+(i.alt||(i.t==='wp'?0:500))+'"></label>';
    if(i.t==='wp'||i.t==='sc') p+='<label>Yarıçap (m) <input type="number" data-f="r" min="100" max="2000" step="50" value="'+(i.r||500)+'"></label>';
    if(i.t==='st') p+='<label>Yön (°) <input type="number" data-f="hdeg" min="0" max="359" step="15" value="'+Math.round(((i.h||0)*180/Math.PI+360)%360)+'"></label>';
    if(i.t!=='st') p+='<label>Aşama <select data-f="stage">'+[1,2,3,4,5].map(function(s){ return '<option value="'+s+'"'+((i.stage||1)===s?' selected':'')+'>'+s+(s>1?' (önceki bitince belirir)':' (baştan var)')+'</option>'; }).join('')+'</select></label>';
    p+='<button type="button" class="btn sm" data-a="del">Sil</button>'; }
  else p='<small>Haritaya yerleştirmek için soldan bir araç seç, sonra haritaya dokun. Seç aracıyla öğeleri sürükleyebilirsin.</small>';
  $('edProps').innerHTML=p;
  $('edSet').innerHTML='<label>Ad <input type="text" data-s="n" maxlength="60" value="'+m.n.replace(/"/g,'&quot;')+'"></label><label>Brifing <textarea data-s="d" maxlength="400" rows="2">'+m.d.replace(/</g,'&lt;')+'</textarea></label>'+
    '<label>Uçak <select data-s="ac"><option value="any">Oyuncunun seçtiği</option>'+AC_ORDER.map(function(id){ return '<option value="'+id+'"'+(m.ac===id?' selected':'')+'>'+AIRCRAFT[id].short+'</option>'; }).join('')+'</select></label>'+
    '<label>Süre (dk, 0 = sınırsız) <input type="number" data-s="lim" min="0" max="60" step="1" value="'+Math.round(m.lim/60)+'"></label>'+
    '<label>Hava <select data-s="wx">'+Object.keys(WX_P).map(function(k){ return '<option value="'+k+'"'+(m.wx===k?' selected':'')+'>'+WX_P[k].n+'</option>'; }).join('')+'</select></label>'+
    '<label>Saat <select data-s="tod">'+[['dawn','Sabah'],['day','Öğle'],['dusk','Akşam'],['night','Gece']].map(function(t){ return '<option value="'+t[0]+'"'+(m.tod===t[0]?' selected':'')+'>'+t[1]+'</option>'; }).join('')+'</select></label>';
  const cnt={}; m.items.forEach(function(i){ cnt[i.t]=(cnt[i.t]||0)+1; }); $('edSum').textContent=Object.keys(cnt).map(function(k){ return cnt[k]+' '+ED_T[k].n.toLocaleLowerCase('tr-TR'); }).join(' · ')+' · '+Math.max.apply(null,m.items.map(function(i){ return i.t==='st'?1:(i.stage||1); }).concat([1]))+' aşama';
  $('edPub').classList.toggle('hidden',!(typeof accIsAdmin==='function'&&accIsAdmin()&&ACC.sb)); edDraw(); }
function edPick(px,py,W,H){ let best=null, bd=16; ED.m.items.forEach(function(i){ const p=edW2S(i.x,i.z,W,H), d=Math.hypot(p[0]-px,p[1]-py); if(d<bd){ bd=d; best=i; } }); return best; }
(function(){
  const cv=$('edMap'); if(!cv) return; let down=null;
  cv.addEventListener('pointerdown',function(e){ const r=cv.getBoundingClientRect(), px=e.clientX-r.left, py=e.clientY-r.top, W=r.width, H=r.height; try{ cv.setPointerCapture(e.pointerId); }catch(err){}
    if(ED.tool==='sel'){ const it=edPick(px,py,W,H); ED.sel=it; down={x:e.clientX,y:e.clientY,it:it,moved:0}; edRender(); return; }
    const w=edS2W(px,py,W,H), m=ED.m; if(ED.tool==='st'){ m.items=m.items.filter(function(i){ return i.t!=='st'; }); }
    const it={id:edNextId(m),t:ED.tool,x:w[0],z:w[1],stage:1}; if(it.t==='gt') it.type='truck'; if(it.t==='at'||it.t==='en') it.alt=600; if(it.t==='wp'){ it.r=500; } if(it.t==='sc'){ it.r=450; } if(it.t==='st'){ it.alt=600; it.h=0; }
    m.items.push(it); ED.sel=it; edRender(); });
  cv.addEventListener('pointermove',function(e){ if(!down) return; const dx=e.clientX-down.x, dy=e.clientY-down.y; down.moved+=Math.abs(dx)+Math.abs(dy); down.x=e.clientX; down.y=e.clientY;
    if(down.it){ down.it.x+=dx/ED.scale; down.it.z+=dy/ED.scale; } else { ED.cx-=dx/ED.scale; ED.cz-=dy/ED.scale; } edDraw(); });
  const up=function(){ if(down&&down.it) edRender(); down=null; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',function(e){ e.preventDefault(); ED.scale=clamp(ED.scale*Math.exp(-clamp(e.deltaY,-120,120)*0.0015),0.005,0.3); edDraw(); },{passive:false});
  $('edTools').addEventListener('click',function(e){ const b=e.target.closest('button[data-tool]'); if(b){ ED.tool=b.dataset.tool; edRender(); } });
  $('edProps').addEventListener('change',function(e){ const f=e.target.dataset.f, i=ED.sel; if(!f||!i) return; const v=e.target.value; if(f==='type') i.type=v; else if(f==='hdeg') i.h=(+v||0)*Math.PI/180; else i[f]=+v; edRender(); });
  $('edProps').addEventListener('click',function(e){ const b=e.target.closest('[data-a="del"]'); if(b&&ED.sel){ ED.m.items=ED.m.items.filter(function(i){ return i!==ED.sel; }); ED.sel=null; edRender(); } });
  $('edSet').addEventListener('change',function(e){ const k=e.target.dataset.s; if(!k) return; let v=e.target.value; if(k==='lim') v=Math.max(0,+v||0)*60; ED.m[k]=v; if(k!=='n'&&k!=='d') edRender(); else $('edSum'); });
  $('edSet').addEventListener('input',function(e){ const k=e.target.dataset.s; if(k==='n'||k==='d') ED.m[k]=e.target.value; });
  $('edZin').addEventListener('click',function(){ ED.scale=Math.min(0.3,ED.scale*1.4); edDraw(); }); $('edZout').addEventListener('click',function(){ ED.scale=Math.max(0.005,ED.scale/1.4); edDraw(); });
  $('edBack').addEventListener('click',edClose);
  $('edSave').addEventListener('click',function(){ const m=ED.m, i=CUS.local.findIndex(function(x){ return x.id===m.id; }); if(i>=0) CUS.local[i]=JSON.parse(JSON.stringify(m)); else CUS.local.unshift(JSON.parse(JSON.stringify(m))); cusSave(); toast('Görev kaydedildi: '+m.n,'#7dffb0'); });
  $('edTry').addEventListener('click',function(){ $('edSave').click(); edClose(); cusPlay(ED.m); });
  $('edCode').addEventListener('click',function(){ const c=cusEncode(ED.m); $('edIO').value=c; try{ navigator.clipboard&&navigator.clipboard.writeText(c); toast('Görev kodu kopyalandı','#7dffb0'); }catch(err){} });
  $('edFile').addEventListener('click',function(){ try{ const b=new Blob([JSON.stringify(ED.m,null,1)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=(ED.m.n||'gorev').replace(/[^\wçğıöşüÇĞİÖŞÜ-]+/g,'_')+'.json'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },500); }catch(err){ toast('Dosya kaydedilemedi','#ff8a7a'); } });
  $('edImp').addEventListener('click',function(){ const m=cusDecode($('edIO').value); if(!m){ toast('Kod çözülemedi','#ff8a7a'); return; } ED.m=m; ED.sel=null; edRender(); toast('Görev içe aktarıldı: '+m.n,'#7dffb0'); });
  $('edFileIn').addEventListener('change',function(e){ const f=e.target.files&&e.target.files[0]; if(!f) return; f.text().then(function(t){ const m=cusDecode(t); if(!m){ toast('Dosya okunamadı','#ff8a7a'); return; } ED.m=m; ED.sel=null; edRender(); toast('Görev içe aktarıldı','#7dffb0'); }); e.target.value=''; });
  $('edNew').addEventListener('click',function(){ ED.m=edNew(); ED.sel=null; edRender(); });
  $('edPub').addEventListener('click',function(){ cusPublish(ED.m); });
  window.addEventListener('resize',function(){ if(ED.open) edResize(); });
})();
/* admin: publish to everybody */
function cusPublish(m){ if(!ACC.sb||!accIsAdmin()){ toast('Yayınlamak için yönetici hesabıyla giriş yap','#ffc24a'); return; }
  ACC.sb.from('content').upsert({id:'mis_'+m.id,kind:'mission',path:null,meta:{m:m},updated_at:new Date().toISOString(),updated_by:ACC.user.id}).then(function(r){ if(r.error) throw r.error; admLog('publish','mission',{n:m.n}); toast('Görev herkese yayınlandı','#7dffb0'); })
    .catch(function(e){ toast('Yayınlanamadı: '+(e&&e.message||e),'#ff8a7a'); }); }
const _cusContent=accContent; accContent=function(){ return Promise.resolve(_cusContent()).then(function(){ CUS.pub=(ADM.content||[]).filter(function(c){ return c.kind==='mission'&&c.meta&&c.meta.m; }).map(function(c){ const m=cusNorm(c.meta.m)||{}; m.id=c.id; m.pub=true; return m; }); }); };
/* ---- board */
const _cAll=boardAll; boardAll=function(){ return _cAll().concat([{id:'c_new',kind:'cnew',name:'＋ Yeni görev oluştur',desc:'Görev editörünü aç: hedefleri, düşmanları, noktaları ve aşamaları haritaya yerleştir.'}]).concat(CUS.pub.concat(CUS.local).map(function(m){ return {id:m.id,kind:'cus',name:(m.pub?'★ ':'')+m.n,desc:m.d,C:m}; })); };
const _cMeta=bMeta; bMeta=function(e){ if(e.kind==='cnew') return {cat:'ozel',diff:1,dur:0,xp:0,obj:['Haritaya hedef ve nokta koy','Aşama ver: aşama 2, aşama 1 bitince belirir','Kod ya da dosya ile paylaş'],thr:['—'],load:null,area:[0,0,12000]};
  if(e.kind!=='cus') return _cMeta(e); const m=e.C, st=m.items.find(function(i){ return i.t==='st'; }), stages=Math.max.apply(null,m.items.filter(function(i){ return i.t!=='st'; }).map(function(i){ return i.stage||1; }).concat([1]));
  const cnt={}; m.items.forEach(function(i){ if(i.t!=='st') cnt[i.t]=(cnt[i.t]||0)+1; });
  let cx=0, cz=0, n=0; m.items.forEach(function(i){ cx+=i.x; cz+=i.z; n++; }); cx/=Math.max(1,n); cz/=Math.max(1,n); let R=1500; m.items.forEach(function(i){ R=Math.max(R,Math.hypot(i.x-cx,i.z-cz)+800); });
  return {cat:'ozel',diff:Math.min(3,1+Math.floor(((cnt.en||0)*2+(cnt.gt||0)+(cnt.at||0))/6)),dur:Math.round(m.lim/60),xp:Math.min(400,100+m.items.length*15),obj:Object.keys(cnt).map(function(k){ return cnt[k]+' × '+ED_T[k].n; }).concat([stages+' aşama']),thr:[(m.pub?'Yönetici yayını · ':'')+'Hava: '+WX_P[m.wx].n],load:(cnt.en||cnt.at)?'aa':(cnt.gt?'ag':null),area:[cx,cz,Math.min(R,12000)]}; };
const _cRender=renderMissions; renderMissions=function(){ _cRender(); const f=$('misFilt'); if(f&&!f.querySelector('[data-v="ozel"]')){ const seg=f.querySelector('[data-k="cat"]'); if(seg){ const b=document.createElement('button'); b.type='button'; b.dataset.v='ozel'; b.textContent='Özel'; b.setAttribute('aria-pressed',String(BF.cat==='ozel')); seg.insertBefore(b,seg.querySelector('.bnew')||null); } }
  const e=boardList()[misSel]; if(!e) return; const ac=$('btnMisAc');
  if(e.kind==='cnew'){ $('btnMisGo').textContent='✎ Editörü aç'; ac.disabled=true; ac.textContent='Görev editörü'; }
  else if(e.kind==='cus'){ $('btnMisGo').textContent='▶ Göreve başla'; ac.disabled=false; ac.textContent=e.C.pub?'Kopyasını düzenle':'✎ Düzenle'; ac.dataset.edit='1'; }
  else delete ac.dataset.edit; };
(function(){ const ac=$('btnMisAc'); if(ac) ac.addEventListener('click',function(ev){ const e=boardList()[misSel]; if(!e||e.kind!=='cus') return; ev.stopImmediatePropagation(); const m=JSON.parse(JSON.stringify(e.C)); if(m.pub){ m.id='c'+Date.now().toString(36); delete m.pub; } edOpen(m); },true); })();
const _cGo=misGo; misGo=function(){ const e=boardList()[misSel]; if(!e) return _cGo(); if(e.kind==='cnew') return edOpen(null); if(e.kind==='cus') return cusPlay(e.C); return _cGo(); };
/* ---- running a custom mission */
function cusPlay(m){ CUS.cur=JSON.parse(JSON.stringify(m)); MISSIONS.cus.name=m.n; MISSIONS.cus.desc=m.d; MISSIONS.cus.limit=m.lim||0; BMETA.cus={xp:Math.min(400,100+m.items.length*15),dur:Math.round((m.lim||600)/60)};
  if(m.ac!=='any'&&AIRCRAFT[m.ac]){ selectedId=m.ac; setAircraft(m.ac); } selectMission('cus'); const st=m.items.find(function(i){ return i.t==='st'; });
  closeModals(); startGame(st?'air':'runway'); if(st){ S.pos.set(st.x,Math.max(0,terrainH(st.x,st.z))+(st.alt||600),st.z); S.q.setFromAxisAngle(UP,-(st.h||0)); S.speed=Math.max(CUR.airV,120); S.throttle=0.75; S.gear=false; S.onGround=false; S.taxi=false; S.clearance=true; camQ.copy(S.q); camSnap=true; } }
function cusRestore(){ if(CUS.keep){ SETTINGS.wx=CUS.keep.wx; WX.kind=CUS.keep.wx==='auto'?WX.kind:CUS.keep.wx; SETTINGS.tod=CUS.keep.tod; todReset(); CUS.keep=null; } }
function cusSpawn(stage){ const m=CUS.cur, st=CUS.st; m.items.filter(function(i){ return i.t!=='st'&&(i.stage||1)===stage; }).forEach(function(i){
    if(i.t==='gt'){ const o=addGround(GTYPE[i.type]?i.type:'truck',i.x,i.z); o.cus=stage; st.objs.push({i:i,o:o}); }
    else if(i.t==='at'){ const g=new THREE.Group(); g.add(new THREE.Mesh(tgtGeo,tgtMat)); scene.add(g); const y=Math.max(0,terrainH(i.x,i.z))+(i.alt||600), t={label:'Hava hedefi',g:g,c:new THREE.Vector3(i.x,y,i.z),rad:250,w:0.08,ph:Math.random()*6,alive:true,pos:new THREE.Vector3(i.x,y,i.z)}; targets.push(t); st.objs.push({i:i,o:t}); }
    else if(i.t==='en'){ const a=spawnEnemy(st.objs.length+1); a.pos.set(i.x,Math.max(0,terrainH(i.x,i.z))+(i.alt||900),i.z); st.objs.push({i:i,o:a}); }
    else { const mk=dynMark(i.x,i.z,i.r||500,i.t==='sc'?0xffd27a:0x39e6ff); st.objs.push({i:i,o:{alive:true,mk:mk,scan:0}}); } });
  if(stage>1){ toast('AŞAMA '+stage+' başladı','#ffd27a'); if(typeof radioSay==='function') radioSay({w:'awacs',t:'{cs}, yeni hedefler belirdi. Aşama '+stage+'.'},null,{force:true}); } }
const _cSetup=setupMission; setupMission=function(){ if(missionId!=='cus'||!CUS.cur){ cusRestore(); return _cSetup(); }
  MLOG.length=0; B_STAT.shots=0; B_STAT.minHp=100; dynClear(); cusRestore(); const m=CUS.cur;
  MS.rings=MS.air=MS.ground=MS.recon=false; M={id:'cus',t:0,started:false,done:false,scanIdx:0,scanT:0}; clearAir(); clearGround(); clearRecon(); ringIdx=0; courseT=null; updateRingVisuals(); aiClear();
  CUS.keep={wx:SETTINGS.wx||'clear',tod:SETTINGS.tod||'day'}; SETTINGS.wx=m.wx; WX.kind=m.wx; SETTINGS.tod=m.tod; todReset();
  CUS.st={stage:1,max:Math.max.apply(null,m.items.filter(function(i){ return i.t!=='st'; }).map(function(i){ return i.stage||1; }).concat([1])),objs:[]}; cusSpawn(1);
  toast('Görev: '+m.n,'#7dffb0'); };
function cusDone(x){ const i=x.i, o=x.o; if(i.t==='wp'||i.t==='sc') return !o.alive; return !o.alive; }
function cusStep(dt){ const m=CUS.cur, st=CUS.st; if(!m||!st||M.done) return;
  if(m.lim&&M.t>m.lim){ endMission(false); return; }
  st.objs.forEach(function(x){ const i=x.i, o=x.o; if(!o.alive||(i.t!=='wp'&&i.t!=='sc')) return; const d=Math.hypot(S.pos.x-i.x,S.pos.z-i.z);
    if(i.t==='wp'&&d<(i.r||500)&&!S.onGround){ o.alive=false; scene.remove(o.mk); toast('Geçiş noktası tamam','#7dffb0'); score+=50; noteScore(); }
    if(i.t==='sc'){ if(d<(i.r||450)&&!S.onGround){ o.scan+=dt; if(o.scan>=4){ o.alive=false; scene.remove(o.mk); toast('Keşif tamam','#7dffb0'); score+=100; noteScore(); } } else o.scan=Math.max(0,o.scan-dt*2); } });
  const cur=st.objs.filter(function(x){ return (x.i.stage||1)===st.stage; });
  if(!cur.length||cur.every(cusDone)){ if(st.stage>=st.max){ endMission(true); return; } st.stage++; cusSpawn(st.stage); } }
const _cUpd=updateMission; updateMission=function(dt){ if(M.id==='cus'&&!M.done&&state==='play'){ if(!M.started&&!S.onGround) M.started=true; if(M.started) M.t+=dt; cusStep(dt); return; } return _cUpd(dt); };
const _cEnd=endMission; endMission=function(ok,tm){ const r=_cEnd(ok,tm); if(M.id==='cus'){ cusRestore(); dynClear(); const b=$('btnMEdit'); if(b) b.classList.remove('hidden'); } else { const b=$('btnMEdit'); if(b) b.classList.add('hidden'); } return r; };
const _cObj=bObjective; bObjective=function(){ if(state!=='play'||!M||M.id!=='cus'||M.done||!CUS.st) return _cObj(); const st=CUS.st, cur=st.objs.filter(function(x){ return (x.i.stage||1)===st.stage; }), left=cur.filter(function(x){ return !cusDone(x); });
  const tgt=bNearest(left.map(function(x){ return x.o.pos||{x:x.i.x,z:x.i.z}; })); const m=CUS.cur;
  return {name:m.n,txt:(st.max>1?'Aşama '+st.stage+'/'+st.max+' · ':'')+(cur.length-left.length)+'/'+cur.length+' hedef',rem:m.lim?Math.max(0,m.lim-M.t):null,tgt:tgt}; };
(function(){ const b=$('btnMEdit'); if(b) b.addEventListener('click',function(){ $('missionEnd').classList.add('hidden'); enterHangar(); openMissions(); if(CUS.cur){ const L=CUS.local.find(function(x){ return x.id===CUS.cur.id; }); edOpen(L||CUS.cur); } }); })();
