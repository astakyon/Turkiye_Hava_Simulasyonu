/* ------------------------------------------------------------------ wingman commands (V2.10)
   F8 (or the TELSİZ menu on touch) gives Kılıç 2 an order:
     1 Saldır — attacks your locked target (or the enemy nearest to you) and stays on it
     2 Kolla — default: keeps formation and engages threats near you
     3 Düzene gir — tight formation (for aerobatics and fly-bys): close on your wing, ignores targets
     4 Üsse dön — leaves, flies home and lands (comes back on the next sortie)
   The order is answered on the radio and shown under the wingman marker. */
const WCMD={menu:false};
const WCMD_L=[['attack','Saldır','Hedefe saldırıyorum!'],['cover','Kolla','Arkanı kolluyorum.'],['form','Düzene gir','Düzene giriyorum, sağ kanadındayım.'],['rtb','Üsse dön','Anlaşıldı, üsse dönüyorum.']];
function wingActor(){ return (typeof ACT!=='undefined')?ACT.find(function(a){ return a.wing&&a.alive; }):null; }
function wingCmd(k){ const W=wingActor(); wingMenu(false); if(!W){ toast('Kanat adamı yok (görev ayarlarında aç)','#ffc24a'); return; } const C=WCMD_L.find(function(c){ return c[0]===k; }); if(!C) return;
  W.cmd=k; W.cmdT=0; if(k==='attack'){ let t=null; try{ if(typeof lockTgt!=='undefined'&&lockTgt&&lockTgt.alive&&lockTgt.team&&lockTgt.team!==W.team) t=lockTgt; }catch(e){} if(!t){ let bd=1e12; ACT.forEach(function(a){ if(a.alive&&a.team!==W.team){ const d=a.pos.distanceToSquared(S.pos); if(d<bd){ bd=d; t=a; } } }); }
    if(!t){ toast('Saldırılacak hava hedefi yok','#ffc24a'); W.cmd='cover'; return; } W.tgt=t; W.retT=6; }
  if(k==='form'||k==='rtb') W.tgt=null;
  try{ radioSay({w:'sen',t:'Kılıç 2, '+C[1].toLocaleLowerCase('tr-TR')+'.'},null,{force:true}); setTimeout(function(){ radioSay({w:'kanat',t:C[2]},null,{force:true}); },900); }catch(e){} }
aiBrain=HOOK.wrap('aiBrain','savas/kanat-adami#_wcBrain',function(_wcBrain){ return function(a,dt){ if(!a.wing||!a.cmd||a.cmd==='cover') return _wcBrain(a,dt); a.cmdT=(a.cmdT||0)+dt;
  if(a.cmd==='attack'){ if(a.tgt&&a.tgt.alive){ a.retT=Math.max(a.retT,1); } else { a.cmd='cover'; try{ radioSay({w:'kanat',t:'Hedef düştü, yanına dönüyorum.'},null,{force:true}); }catch(e){} } return _wcBrain(a,dt); }
  if(a.cmd==='form'){ if(!PLY.alive) return _wcBrain(a,dt); a.gunCd-=dt; a.mslCd-=dt; a.tgt=null;
    fwdOf(S.q,aV2); aV1.set(1,0,0).applyQuaternion(S.q); vU.set(0,1,0).applyQuaternion(S.q);
    aV3.copy(S.pos).addScaledVector(aV1,22*(a.slot||1)).addScaledVector(aV2,-16*(a.slot||1)).addScaledVector(vU,-3);
    aV4.copy(aV3).addScaledVector(aV2,Math.max(S.speed,60)*0.8); a.dir.copy(aV4).sub(a.pos).normalize();
    const along=aV1.copy(aV3).sub(a.pos).dot(aV2), spdT=clamp(S.speed+along*0.8,(a.def.minV||50)+5,(a.def.vTop||300)*1.05);
    steerSafe(a,a.dir); aiFly(a,dt,spdT); return; }
  if(a.cmd==='rtb'){ a.tgt=null; aV3.set(0,AIRFIELD_Y+500,0); a.dir.copy(aV3).sub(a.pos).normalize(); steerSafe(a,a.dir); aiFly(a,dt,a.def.airV);
    if(a.pos.distanceTo(aV3)<900){ a.alive=false; a.g.visible=false; a.cmd=null; toast('Kılıç 2 üsse indi','#b8ecff'); } return; }
  return _wcBrain(a,dt); }; },aiBrain);
/* menu */
function wingMenu(open){ WCMD.menu=open==null?!WCMD.menu:open; let el=$('wingMenu'); if(!el&&document.createElement){ el=document.createElement('div'); el.id='wingMenu'; el.className='radiomenu wingmenu hidden'; document.body.appendChild(el);
    el.addEventListener('click',function(e){ const b=e.target.closest('button[data-w]'); if(b) wingCmd(b.dataset.w); }); }
  if(!el) return; const W=wingActor(); el.innerHTML='<b>KANAT ADAMI · KILIÇ 2</b>'+WCMD_L.map(function(c,i){ return '<button type="button" data-w="'+c[0]+'"'+(W&&(W.cmd||'cover')===c[0]?' class="on"':'')+'><kbd>'+(i+1)+'</kbd>'+c[1]+'</button>'; }).join('')+(W?'':'<small>Kanat adamı yok</small>');
  el.classList.toggle('hidden',!WCMD.menu); }
if(CTRL_DEF.gen&&!CTRL_DEF.gen.acts.some(function(a){ return a[0]==='wing'; })) CTRL_DEF.gen.acts.push(['wing','Kanat adamına emir',['F8'],[]]);
if(CTRL.kb.gen&&!CTRL.kb.gen.wing) CTRL.kb.gen.wing=['F8']; if(CTRL.pad&&CTRL.pad.gen&&!CTRL.pad.gen.wing) CTRL.pad.gen.wing=[];
INPUT.on('keydown',function(e){ if(state!=='play') return; if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if(!e.repeat&&isKey(e,'gen','wing')){ e.preventDefault(); wingMenu(); return; }
  if(WCMD.menu&&/^Digit[1-4]$/.test(e.code)){ wingCmd(WCMD_L[+e.code.slice(5)-1][0]); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if(WCMD.menu&&e.code==='Escape'){ wingMenu(false); e.stopImmediatePropagation(); } },true,'savas/kanat-adami','uçuş');
/* touch: the radio menu also lists the wingman orders */
radioMenu=HOOK.wrap('radioMenu','savas/kanat-adami#_wcRadio',function(_wcRadio){ return function(open){ _wcRadio(open); const el=$('radioMenu'); if(!el||!RADIO.menu||!wingActor()) return; el.insertAdjacentHTML('beforeend','<b class="wsub">KANAT ADAMI</b><div class="wrow">'+WCMD_L.map(function(c){ return '<button type="button" data-w="'+c[0]+'">'+c[1]+'</button>'; }).join('')+'</div>'); }; },radioMenu);
(function(){ const el=$('radioMenu'); if(el) el.addEventListener('click',function(e){ const b=e.target.closest('button[data-w]'); if(b){ radioMenu(false); wingCmd(b.dataset.w); } }); })();
/* the order under the wingman marker */
drawHUD=HOOK.wrap('drawHUD','savas/kanat-adami#_wcHUD',function(_wcHUD){ return function(){ _wcHUD(); try{ const W=wingActor(); if(!W||state!=='play'||!W.cmd||W.cmd==='cover') return; hx.setTransform(DPR,0,0,DPR,0,0); const p=W.pos.clone(); p.y+=10; p.project(camera); if(p.z>1) return;
  const s=clamp(Math.min(HW,HH)/760,0.7,1.5); hx.save(); hx.textAlign='center'; hx.font='700 '+Math.round(11*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#7dffb0'; hx.shadowColor='rgba(0,0,0,.8)'; hx.shadowBlur=3;
  hx.fillText({attack:'SALDIRIYOR',form:'DÜZENDE',rtb:'ÜSSE DÖNÜYOR'}[W.cmd]||'',(p.x*0.5+0.5)*HW,(-p.y*0.5+0.5)*HH-14*s); hx.restore(); }catch(e){} }; },drawHUD);
