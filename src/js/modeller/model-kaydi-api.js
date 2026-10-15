/* ------------------------------------------------------------------ model registry API + size audit (V2.11)
   One call adds a new aircraft everywhere: defineAircraft('id',{...}) writes the flight data (copied from a similar aircraft
   and overridden), the hangar group / class / maker, licence, rank lock, inventory link (Defence Turk data card) and real
   performance. The hangar, model library, mission board, boarding on foot and collisions all read these lists, so nothing else
   is needed. A .glb file can be given instead of a code builder (it is loaded as the model's skin at the real length).
   Size audit (Ayarlar → Arayüz → Araçlar → Model ölçü denetimi): every model's bounding box is measured and compared with the real
   length and wingspan; differences over 8 % are flagged. See docs/MODEL-EKLEME.md. */
function mrNum(s){ const m=String(s==null?'':s).replace(',','.').match(/[\d.]+/); return m?parseFloat(m[0]):null; }
function defineAircraft(id,spec){ spec=spec||{}; const base=AIRCRAFT[spec.like||'tb2']||AIRCRAFT.tb2;
  const def=Object.assign({},base,spec.flight||{},{name:spec.name||id, short:spec.short||spec.name||id, kind:spec.kind||base.kind, len:spec.len||base.len, span:spec.span||base.span, desc:spec.desc||'', uav:spec.uav!=null?spec.uav:base.uav});
  if(spec.build) def.build=spec.build; else if(!spec.glb) def.build=base.build;
  AIRCRAFT[id]=def; REG[id]={grp:spec.grp||'hava',cls:spec.cls||(def.uav?'iha':'savas'),maker:spec.maker||''};
  if(AC_ORDER.indexOf(id)<0) AC_ORDER.push(id);
  if(spec.lic&&typeof LIC_OF!=='undefined') LIC_OF[id]=spec.lic; if(spec.rank!=null&&typeof RANK_LOCK!=='undefined') RANK_LOCK[id]=spec.rank;
  if(spec.env&&typeof ENV_GAME!=='undefined') ENV_GAME['ac:'+id]=spec.env; if(spec.realp&&typeof REALP!=='undefined') REALP[id]=spec.realp;
  if(spec.glb&&typeof loadModelFile==='function'){ try{ loadModelFile(id,{file:spec.glb,length:mrNum(def.len)||null,rotation:spec.rotation||[0,0,0]}); }catch(e){ console.warn('model',id,e); } }
  return def; }
/* ---- size audit */
function mrMeasure(id){ let m=null; try{ m=buildModel(id); const box=new THREE.Box3().setFromObject(m.group), s=box.getSize(new THREE.Vector3()); return {len:s.z, span:s.x, h:s.y}; }
  catch(e){ return null; } finally{ if(m){ try{ untrackModel(m); }catch(e){} } } }
function modelAudit(){ return AC_ORDER.map(function(id){ const D=AIRCRAFT[id], r={id:id,name:D.name,realLen:mrNum(D.len),realSpan:mrNum(D.span)}, ms=mrMeasure(id);
    if(ms){ r.len=ms.len; r.span=ms.span; r.dLen=r.realLen?Math.round((ms.len/r.realLen-1)*100):null; r.dSpan=r.realSpan?Math.round((ms.span/r.realSpan-1)*100):null; }
    r.ok=ms&&(r.dLen==null||Math.abs(r.dLen)<=8)&&(r.dSpan==null||Math.abs(r.dSpan)<=8); r.skin=!!(MODELS.skins&&MODELS.skins[id]); return r; }); }
function modelAuditOpen(){ let el=$('mrUI'); if(!el&&document.createElement){ el=document.createElement('div'); el.id='mrUI'; el.className='modal hidden'; el.innerHTML='<div class="card wide mrcard"><button class="xbtn" type="button" id="mrX" aria-label="Kapat">✕</button><h2>Model ölçü denetimi</h2><p class="sub">Her modelin ölçüsü gerçek uzunluk ve kanat açıklığıyla karşılaştırılır (±%8 içinde ✓). Gerçek ölçüler oyunun veri kartlarından.</p><div class="mrtbl" id="mrTbl">Ölçülüyor…</div></div>'; document.body.appendChild(el); MODALS.push('mrUI'); el.querySelector('#mrX').addEventListener('click',function(){ el.classList.add('hidden'); }); }
  if(!el) return; closeModals(); el.classList.remove('hidden'); setTimeout(function(){ const R=modelAudit(), f=function(v){ return v==null?'—':(Math.round(v*10)/10).toString().replace('.',','); }, d=function(v){ return v==null?'':(v>0?'+':'')+v+'%'; };
    $('mrTbl').innerHTML='<table><thead><tr><th>Model</th><th>Uzunluk (model / gerçek)</th><th>Açıklık (model / gerçek)</th><th></th></tr></thead><tbody>'+R.map(function(r){ return '<tr class="'+(r.ok?'ok':'bad')+'"><td><b>'+r.name+'</b>'+(r.skin?' <small>(.glb)</small>':'')+'</td><td>'+f(r.len)+' / '+f(r.realLen)+' m <small>'+d(r.dLen)+'</small></td><td>'+f(r.span)+' / '+f(r.realSpan)+' m <small>'+d(r.dSpan)+'</small></td><td>'+(r.ok?'✓':'⚠')+'</td></tr>'; }).join('')+'</tbody></table>'; },30); }
(function(){ const b=$('btnAudit'); if(b) b.addEventListener('click',modelAuditOpen); })();
/* imported .glb / .fbx … files are sized to the real length of the aircraft (instead of the code model's) */
setSkin=HOOK.wrap('setSkin','modeller/model-kaydi-api#_mrSetSkin',function(_mrSetSkin){ return function(id,root,spec){ if(spec&&spec.local&&spec.length==null&&AIRCRAFT[id]){ const L=mrNum(AIRCRAFT[id].len); if(L) spec=Object.assign({},spec,{length:L}); } return _mrSetSkin(id,root,spec); }; },setSkin);
