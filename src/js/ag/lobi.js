/* ------------------------------------------------------------------ online lobby UI (from yapay-zeka-ag, V2.25) */
// ---------- lobby UI
function netNameVal(){ const v=($('netName').value||'').trim().slice(0,16)||'Pilot'; try{ stSet('kaan-sim-name',v); }catch(e){} return v; }
function netModeSel(){ const b=$('netMode').querySelector('[aria-pressed="true"]'); return (b&&NET_MODES[b.dataset.m])?b.dataset.m:'coop'; }
function openNet(){ $('netUI').classList.remove('hidden'); if(NET.on&&!NET.started) netShowLobby(); else netShowHome(); }
function closeNet(){ $('netUI').classList.add('hidden'); }
function netShowHome(){ $('netHome').classList.remove('hidden'); $('netLobby').classList.add('hidden'); }
function netShowLobby(){ $('netUI').classList.remove('hidden'); $('netHome').classList.add('hidden'); $('netLobby').classList.remove('hidden'); netRenderLobby(); }
function netRenderLobby(){
  if(typeof voiceConnect==='function') voiceConnect();
  if(!$('netLobby')) return;
  $('netRoom').textContent=NET.room||'—';
  $('netModeTxt').textContent=(NET_MODES[NET.mode]||NET_MODES.coop).name+' · '+(NET.bots?'boş yerler botla dolar':'bot yok')+' · en fazla '+NET_MAX+' oyuncu';
  let rows=NET.roster.map(function(r){
    const tm=NET.mode==='team'?('<span class="tm '+r.team+'">'+(r.team==='blue'?'MAVİ':'KIRMIZI')+'</span>'):'';
    return '<li>'+tm+'<b>'+r.name.replace(/[<>&]/g,'')+(r.id===NET.myId?' (sen)':'')+'</b><small>'+(AIRCRAFT[r.ac]?AIRCRAFT[r.ac].short:'')+(r.id==='H'?' · ev sahibi':'')+'</small></li>';
  }).join('');
  for(let i=NET.roster.length;i<NET_MAX;i++) rows+='<li class="empty"><b>Boş yer</b><small>'+(NET.bots?'yapay zekâ dolduracak':'bekleniyor')+'</small></li>';
  $('netList').innerHTML=rows; $('netCount').textContent='OYUNCULAR · '+NET.roster.length+' / '+NET_MAX;
  const me=NET.roster.find(function(r){ return r.id===NET.myId; });
  if(me) $('netAc').value=me.ac;
  $('btnNetTeam').classList.toggle('hidden',NET.mode!=='team');
  $('btnNetGo').classList.toggle('hidden',!NET.host); $('netWait').classList.toggle('hidden',NET.host);
}
function netPick(ac,team){
  if(NET.host){ const r=NET.roster.find(function(x){ return x.id===NET.myId; }); if(r){ if(ac) r.ac=ac; if(team) r.team=team; } netRoster(); }
  else netSend(NET.hconn,{t:'pick',ac:ac,team:team});
}
(function(){
  try{ $('netName').value=stGet('kaan-sim-name')||''; }catch(e){}
  $('netAc').innerHTML=AC_ORDER.map(function(id){ return '<option value="'+id+'">'+AIRCRAFT[id].short+'</option>'; }).join('');
  $('btnNetClose').addEventListener('click',function(){ if(NET.on&&!NET.started){ netLeave(); } closeNet(); });
  $('btnNetHost').addEventListener('click',netHost);
  $('btnNetJoin').addEventListener('click',netJoin);
  $('btnNetLeave').addEventListener('click',function(){ netLeave(); });
  $('btnNetGo').addEventListener('click',netStartMatch);
  $('btnNetLink').addEventListener('click',function(){ const u=location.origin+location.pathname+'?oda='+NET.room; try{ navigator.clipboard.writeText(u); netStatus('Bağlantı kopyalandı: '+u); }catch(e){ netStatus(u); } });
  $('btnNetCopy').addEventListener('click',function(){ const t=NET.room; try{ navigator.clipboard.writeText(t); netStatus('Kod kopyalandı: '+t); }catch(e){ netStatus('Kod: '+t); } });
  $('btnNetTeam').addEventListener('click',function(){ const me=NET.roster.find(function(r){ return r.id===NET.myId; }); if(me) netPick(null,me.team==='blue'?'red':'blue'); });
  $('netAc').addEventListener('change',function(e){ netPick(e.target.value,null); });
  $('netMode').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; Array.prototype.forEach.call($('netMode').children,function(x){ x.setAttribute('aria-pressed',String(x===b)); }); $('netModeDesc').textContent=NET_MODES[b.dataset.m].desc; });
  $('netModeDesc').textContent=NET_MODES.coop.desc;
  try{ const q=new URLSearchParams(location.search).get('oda'); if(q){ $('netCode').value=q.toUpperCase(); setTimeout(openNet,400); } }catch(e){}
})();
// clients learn about new red waves in co-op
function netSpawnRed(r){ if(actById(r.id)) return; const a=makeActor({id:r.id,name:r.name,team:'red',ac:r.ac,ai:true,remote:true,human:false}); a.alive=false; a.g.visible=false; a.nT=-1; }

