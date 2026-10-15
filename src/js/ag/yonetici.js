/* ------------------------------------------------------------------ administrator mode and shared content
   Admin (role set in the database): player list (rank, ban), announcements, publishing this device's models / sounds /
   music / liveries to every player (storage bucket 'content' + table 'content'), remote game settings, action log.
   Players: the Model and Sound libraries are hidden; content the admin published is downloaded and used automatically. */
const ADM={tab:'players', content:[], cfg:{}, sndCloud:{}};
function admLog(action,target,detail){ if(!ACC.sb||!ACC.user) return; ACC.sb.from('admin_log').insert({admin:ACC.user.id,action:action,target:target||null,detail:detail||null}).then(function(){}); }
/* ---- players receive published content */
function accContent(){
  if(!ACC.sb) return Promise.resolve();
  return ACC.sb.from('content').select('*').then(function(r){ if(r.error) throw r.error; ADM.content=r.data||[];
    ADM.content.forEach(function(c){
      const url=c.path?ACC.sb.storage.from('content').getPublicUrl(c.path).data.publicUrl:null, m=c.meta||{};
      if(c.kind==='config'){ ADM.cfg=m; if(m.rankLocks===false) SETTINGS.rankLocks=false; else if(m.rankLocks===true&&SETTINGS.rankLocks===false&&!accIsAdmin()) SETTINGS.rankLocks=true; }
      else if(c.kind==='livery'&&m.ac&&AIRCRAFT[m.ac]){ if(!accIsAdmin()||!LIV.data[m.ac]){ LIV.data[m.ac]=m.liv||{}; try{ liveryRefresh(m.ac); }catch(e){} } }
      else if(c.kind==='model'&&url&&m.ac&&AIRCRAFT[m.ac]){ if(!(MODELS.skins[m.ac]&&MODELS.skins[m.ac].spec&&MODELS.skins[m.ac].spec.local)) loadModelFile(m.ac,Object.assign({},m.spec||{},{file:url})); }
      else if((c.kind==='sound'||c.kind==='music')&&url&&m.sid&&SNDI[m.sid]){ if(!(SND.user[m.sid]&&SND.user[m.sid].file)){ ADM.sndCloud[m.sid]={url:url,vol:m.vol,pitch:m.pitch}; } }
    });
    admDecodeCloud();
  }).catch(function(e){ console.warn('içerik',e); });
}
/* cloud sounds are decoded once the audio context exists */
function admDecodeCloud(){ if(!AC) return; Object.keys(ADM.sndCloud).forEach(function(id){ const c=ADM.sndCloud[id]; if(c.done) return; c.done=true;
  fetch(c.url).then(function(r){ return r.arrayBuffer(); }).then(function(b){ return sndDecode(id,b); }).then(function(){ if(c.vol!=null||c.pitch!=null){ const u=SND.user[id]||(SND.user[id]={}); if(u.vol==null&&c.vol!=null) u.vol=c.vol; if(u.pitch==null&&c.pitch!=null) u.pitch=c.pitch; } }).catch(function(){ c.done=false; }); }); }
(function(){ const I=initAudio; initAudio=function(){ const r=I.apply(this,arguments); try{ admDecodeCloud(); }catch(e){} return r; }; })();
/* ---- admin: publish this device's content */
function admUpload(path,blob,type){ return ACC.sb.storage.from('content').upload(path,blob,{upsert:true,contentType:type||'application/octet-stream'}).then(function(r){ if(r.error) throw r.error; return path; }); }
function admPublishAll(){
  if(!ACC.sb||!accIsAdmin()) return Promise.resolve(); const jobs=[], done={m:0,s:0,l:0}, row=function(o){ return ACC.sb.from('content').upsert(Object.assign({updated_at:new Date().toISOString(),updated_by:ACC.user.id},o)).then(function(r){ if(r.error) throw r.error; }); };
  admMsg('Yayınlanıyor…');
  jobs.push(mdbAll().then(function(L){ return Promise.all((L||[]).map(function(rec){ if(!rec||!rec.glb||!AIRCRAFT[rec.id]) return;
    return admUpload('model/'+rec.id+'.glb',new Blob([rec.glb],{type:'model/gltf-binary'}),'model/gltf-binary').then(function(p){ done.m++; return row({id:'model_'+rec.id,kind:'model',path:p,meta:{ac:rec.id,spec:rec.spec||{},name:rec.name||''}}); }); })); }).catch(function(){}));
  jobs.push(sdbOp('readonly',function(st){ return st.getAllKeys(); }).then(function(keys){ return Promise.all((keys||[]).map(function(id){ return sdbOp('readonly',function(st){ return st.get(id); }).then(function(rec){ if(!rec||!rec.data||!SNDI[id]) return;
    const ext=(rec.name||'').split('.').pop().toLowerCase(), type={mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav',m4a:'audio/mp4'}[ext]||'audio/mpeg', u=SND.user[id]||{};
    return admUpload('sound/'+id+'.'+(ext||'mp3'),new Blob([rec.data],{type:type}),type).then(function(p){ done.s++; return row({id:'snd_'+id,kind:SNDI[id].music?'music':'sound',path:p,meta:{sid:id,vol:u.vol,pitch:u.pitch,name:rec.name}}); }); }); })); }).catch(function(){}));
  Object.keys(LIV.data||{}).forEach(function(ac){ if(!AIRCRAFT[ac]) return; done.l++; jobs.push(row({id:'liv_'+ac,kind:'livery',path:null,meta:{ac:ac,liv:LIV.data[ac]}})); });
  return Promise.all(jobs).then(function(){ admLog('publish','content',done); admMsg('Yayınlandı: '+done.m+' model, '+done.s+' ses/müzik, '+done.l+' boya'); return admLoad('content'); })
    .catch(function(e){ admMsg('Yayınlanamadı: '+(e&&e.message||e),true); });
}
/* ---- admin panel */
function admMsg(t,err){ const el=$('admMsg'); el.textContent=t||''; el.classList.toggle('err',!!err); }
function admOpen(tab){ if(!accIsAdmin()) return; closeModals(); $('adminUI').classList.remove('hidden'); admTab(tab||ADM.tab); }
function admTab(t){ ADM.tab=t; Array.prototype.forEach.call($('admTabs').children,function(b){ b.setAttribute('aria-selected',String(b.dataset.t===t)); });
  Array.prototype.forEach.call(document.querySelectorAll('#adminUI .admsec'),function(s){ s.classList.toggle('hidden',s.dataset.t!==t); }); admMsg(''); admLoad(t); }
function admLoad(t){
  const cloud=!!(ACC.sb&&ACC.user);
  $('admNoCloud').classList.toggle('hidden',cloud); if(!cloud) return Promise.resolve();
  if(t==='players'){ const q=($('admQ').value||'').trim(); let Q=ACC.sb.from('profiles').select('id,callsign,unit,rank,xp,role,banned,updated_at').order('xp',{ascending:false}).limit(100); if(q) Q=Q.ilike('callsign','%'+q+'%');
    return Q.then(function(r){ if(r.error){ admMsg(r.error.message,true); return; } $('admPlayers').innerHTML=(r.data||[]).map(function(p){
      return '<tr data-id="'+p.id+'"><td>'+rankSVG(p.rank||0,22)+'</td><td><b>'+String(p.callsign).replace(/</g,'&lt;')+'</b><small>'+(UNITS[p.unit]||'')+'</small></td><td>'+(p.xp||0).toLocaleString('tr-TR')+'</td>'+
        '<td><select data-k="rank">'+RANKS.map(function(R,i){ return '<option value="'+i+'"'+(i===(p.rank||0)?' selected':'')+'>'+R[0]+'</option>'; }).join('')+'</select></td>'+
        '<td>'+(p.role==='admin'?'<span class="tagm">YÖNETİCİ</span>':'Oyuncu')+'</td><td><button type="button" class="btn sm" data-k="ban">'+(p.banned?'Yasağı kaldır':'Uzaklaştır')+'</button></td></tr>'; }).join('')||'<tr><td colspan="6">Oyuncu yok</td></tr>'; }); }
  if(t==='news') return ACC.sb.from('announcements').select('*').order('created_at',{ascending:false}).limit(20).then(function(r){ $('admNews').innerHTML=(r.data||[]).map(function(a){
    return '<li data-id="'+a.id+'"'+(a.active?'':' class="off"')+'><span>'+String(a.text).replace(/</g,'&lt;')+'</span><small>'+new Date(a.created_at).toLocaleString('tr-TR')+'</small><button type="button" class="btn sm" data-k="toggle">'+(a.active?'Kaldır':'Yeniden yayınla')+'</button></li>'; }).join('')||'<li>Duyuru yok</li>'; });
  if(t==='content') return Promise.all([ACC.sb.from('content').select('id,kind,path,updated_at,meta').order('updated_at',{ascending:false}),mdbAll().catch(function(){ return []; }),sdbOp('readonly',function(st){ return st.getAllKeys(); }).catch(function(){ return []; })]).then(function(R){
    const L=(R[0].data||[]).filter(function(c){ return c.kind!=='config'; }); $('admLocal').textContent='Bu cihazda: '+(R[1]||[]).length+' model, '+(R[2]||[]).length+' ses/müzik, '+Object.keys(LIV.data||{}).length+' boya';
    $('admContent').innerHTML=L.map(function(c){ return '<li data-id="'+c.id+'"><span class="tagm">'+{model:'MODEL',sound:'SES',music:'MÜZİK',livery:'BOYA'}[c.kind]+'</span><b>'+c.id+'</b><small>'+new Date(c.updated_at).toLocaleString('tr-TR')+'</small><button type="button" class="btn sm" data-k="del">Yayından kaldır</button></li>'; }).join('')||'<li>Yayınlanmış içerik yok</li>'; });
  if(t==='game') return ACC.sb.from('content').select('meta').eq('id','config').maybeSingle().then(function(r){ const m=(r.data&&r.data.meta)||{}; $('admLocks').checked=m.rankLocks!==false; $('admXp').value=String(m.xpMul||1); });
  if(t==='log') return ACC.sb.from('admin_log').select('*').order('at',{ascending:false}).limit(60).then(function(r){ $('admLog').innerHTML=(r.data||[]).map(function(l){ return '<tr><td>'+new Date(l.at).toLocaleString('tr-TR')+'</td><td>'+l.action+'</td><td>'+(l.target||'')+'</td><td><small>'+(l.detail?JSON.stringify(l.detail).slice(0,80):'')+'</small></td></tr>'; }).join('')||'<tr><td colspan="4">Kayıt yok</td></tr>'; });
  return Promise.resolve();
}
(function(){
  $('btnAdmBack').addEventListener('click',function(){ $('adminUI').classList.add('hidden'); if(state==='menu') refreshTitle(); });
  $('admTabs').addEventListener('click',function(e){ const b=e.target.closest('button[data-t]'); if(b) admTab(b.dataset.t); });
  $('admQ').addEventListener('input',function(){ clearTimeout(ADM.qt); ADM.qt=setTimeout(function(){ admLoad('players'); },300); });
  $('admPlayers').addEventListener('change',function(e){ const s=e.target; if(s.dataset.k!=='rank') return; const id=s.closest('tr').dataset.id, r=+s.value;
    ACC.sb.from('profiles').update({rank:r,xp:RANKS[r][2]}).eq('id',id).then(function(x){ if(x.error) admMsg(x.error.message,true); else { admMsg('Rütbe: '+RANKS[r][0]); admLog('rank',id,{rank:r}); admLoad('players'); } }); });
  $('admPlayers').addEventListener('click',function(e){ const b=e.target.closest('button[data-k="ban"]'); if(!b) return; const id=b.closest('tr').dataset.id, ban=/Uzaklaştır/.test(b.textContent);
    if(ACC.user&&id===ACC.user.id){ admMsg('Kendini uzaklaştıramazsın',true); return; }
    ACC.sb.from('profiles').update({banned:ban}).eq('id',id).then(function(x){ if(x.error) admMsg(x.error.message,true); else { admMsg(ban?'Oyuncu uzaklaştırıldı':'Yasak kaldırıldı'); admLog(ban?'ban':'unban',id); admLoad('players'); } }); });
  $('admNewsGo').addEventListener('click',function(){ const t=($('admNewsTxt').value||'').trim().slice(0,240); if(!t) return;
    ACC.sb.from('announcements').insert({text:t,active:true,created_by:ACC.user.id}).then(function(x){ if(x.error) admMsg(x.error.message,true); else { $('admNewsTxt').value=''; admMsg('Duyuru yayınlandı'); admLog('news',null,{text:t}); admLoad('news'); accAnnouncements(); } }); });
  $('admNews').addEventListener('click',function(e){ const b=e.target.closest('button[data-k="toggle"]'); if(!b) return; const li=b.closest('li'), id=+li.dataset.id, on=li.classList.contains('off');
    ACC.sb.from('announcements').update({active:on}).eq('id',id).then(function(){ admLog(on?'news-on':'news-off',String(id)); admLoad('news'); accAnnouncements(); }); });
  $('admPublish').addEventListener('click',admPublishAll);
  $('admContent').addEventListener('click',function(e){ const b=e.target.closest('button[data-k="del"]'); if(!b) return; const id=b.closest('li').dataset.id, c=ADM.content.find(function(x){ return x.id===id; });
    ACC.sb.from('content').delete().eq('id',id).then(function(){ if(c&&c.path) ACC.sb.storage.from('content').remove([c.path]); admLog('unpublish',id); admMsg('Kaldırıldı: '+id); admLoad('content'); }); });
  $('admGameSave').addEventListener('click',function(){ const m={rankLocks:$('admLocks').checked,xpMul:+$('admXp').value||1};
    ACC.sb.from('content').upsert({id:'config',kind:'config',path:null,meta:m,updated_at:new Date().toISOString(),updated_by:ACC.user.id}).then(function(x){ if(x.error) admMsg(x.error.message,true); else { ADM.cfg=m; admMsg('Oyun ayarları kaydedildi — oyuncular bir sonraki açılışta alır'); admLog('config',null,m); } }); });
})();
/* XP multiplier from the remote config */
(function(){ const A=careerAdd; careerAdd=function(xp,st,why){ return A.call(this,xp*((ADM.cfg&&ADM.cfg.xpMul)||1),st,why); }; })();
/* content download after the cloud connection (players and admin) */
(function(){ const I=accInit; accInit=function(){ return I.apply(this,arguments).then(function(r){ accRoleApply(); accContent(); return r; }); }; })();
