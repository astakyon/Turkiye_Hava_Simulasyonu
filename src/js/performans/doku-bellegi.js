/* ------------------------------------------------------------------ texture memory (V2.18)
   Inventory before: 476 textures, ~111 MB on the GPU, all drawn on canvases at start. Only 321 different pictures: the same
   window/sign picture was drawn again for every building (one 256×170 picture 19 times, a 1024×1536 one twice), ~35 MB of
   copies — and because every copy is a separate texture, those buildings could not be merged either. Eleven 2048×256 signs
   alone took 29 MB.
   • Identical pictures with the same sampling settings now share one texture (the copies are freed). Buildings that share a
     picture can then be merged (V2.14 merge runs after this).
   • Phones: textures of 1024 px and more are halved; on PC at Düşük/Orta textures of 2048 px and more are halved.
   • Anisotropic filtering on phones is 2× (Android guidance: more is very costly there); PCs keep up to 16×.
   • Dynamic textures (a sign or screen redrawn later) are safe: a watchdog compares each texture's version; if the game redraws
     a shared or shrunk texture, that texture gets its own full-size copy back at once.
   Kill switch: SETTINGS.texShare=false. */
const TXS={done:false, links:[], shrunk:[], saved:0, shared:0, halved:0, t:0, cv:null};
/* V2.26: a 32×32 fingerprint of each picture (with its size) decides "same picture" — no full-size pixel comparison any more.
   The phone report showed the old way (full readback of every candidate pair) taking 7.3 s under the loading screen. */
function txsSig(im){ if(!TXS.cv){ TXS.cv=document.createElement('canvas'); TXS.cv.width=TXS.cv.height=32; } const cx=TXS.cx||(TXS.cx=TXS.cv.getContext('2d',{willReadFrequently:true}));
  cx.clearRect(0,0,32,32); cx.drawImage(im,0,0,32,32); const d=cx.getImageData(0,0,32,32).data; let h1=0x811c9dc5|0, h2=7;
  for(let i=0;i<d.length;i++){ h1=Math.imul(h1^d[i],16777619); h2=(h2*31+d[i])|0; } return (im.width||0)+'x'+(im.height||0)+':'+(h1>>>0).toString(36)+(h2>>>0).toString(36); }
function txsParams(t){ return [t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.generateMipmaps?1:0,t.flipY?1:0,t.encoding,t.format,t.type,t.premultiplyAlpha?1:0,t.repeat.x,t.repeat.y,t.offset.x,t.offset.y,t.rotation,t.center.x,t.center.y].join(','); }
const TXS_SLOTS=['map','emissiveMap','alphaMap','bumpMap','normalMap','roughnessMap','metalnessMap','aoMap','lightMap'];
function txsCollect(){ const uses=new Map(); scene.traverse(function(o){ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; ms.forEach(function(m){ if(!m) return; TXS_SLOTS.forEach(function(k){ const t=m[k]; if(t&&t.isTexture&&!t.isCubeTexture&&t.image&&t.image.getContext){ let L=uses.get(t); if(!L){ L=[]; uses.set(t,L); } L.push([m,k]); } }); }); }); return uses; }
/* sharing runs as a background job, a few milliseconds per frame (menus get more), after the world is built */
function txsShareStep(budget){ if(SETTINGS.texShare===false){ TXS.job=null; return true; }
  const J=TXS.job||(TXS.job={uses:txsCollect(), list:null, i:0}); if(!J.list){ J.list=[]; J.uses.forEach(function(L,t){ if(!(t.userData&&t.userData.txsOwn)) J.list.push(t); }); }
  const t0=performance.now(), S=TXS.sigs||(TXS.sigs=new Map());
  while(J.i<J.list.length){ const t=J.list[J.i++], c=S.get(t); if(!c||c.v!==t.version){ let s=null; try{ s=txsSig(t.image)+'|'+txsParams(t); }catch(e){} S.set(t,{s:s,v:t.version}); } if(performance.now()-t0>budget) return false; }
  const groups=new Map(); let n=0; J.list.forEach(function(t){ const c=S.get(t); if(!c||!c.s) return; let G=groups.get(c.s); if(!G){ G=[]; groups.set(c.s,G); } G.push(t); });
  groups.forEach(function(G){ if(G.length<2) return; const canon=G[0]; for(let i=1;i<G.length;i++){ const t=G[i];
      const L=J.uses.get(t); L.forEach(function(u){ u[0][u[1]]=canon; u[0].needsUpdate=true; }); TXS.links.push({orig:t, canon:canon, users:L, ov:t.version, cv:canon.version});
      TXS.saved+=t.image.width*t.image.height*4*1.33; try{ t.dispose(); }catch(e){} S.delete(t); n++; } });
  TXS.shared+=n; TXS.job=null; return true; }
function txsShare(){ while(!txsShareStep(1e9)){} return TXS.shared; }
/* halve big canvas textures (phones; PC at low quality only the very big ones) */
function txsLimit(){ if(DEV.mobile) return 1024; const q=SETTINGS.quality||0; return q<=1?2048:1e9; }
function txsShrink(max){ if(SETTINGS.texShare===false) return 0; const lim=txsLimit(); if(lim>=1e9) return 0; let n=0; const seen=new Set(TXS.shrunk.map(function(s){ return s.t; }));
  txsCollect().forEach(function(L,t){ if(seen.has(t)||(max&&n>=max)) return; const im=t.image; const w=im.width||0, h=im.height||0; if(Math.max(w,h)<lim) return;
    txsHalve(t); n++; });
  return n; }
function txsHalve(t){ const im=t.image, w=im.width||0, h=im.height||0;
  const c=document.createElement('canvas'); c.width=Math.max(1,w>>1); c.height=Math.max(1,h>>1); const cx=c.getContext('2d'); cx.imageSmoothingEnabled=true; try{ cx.imageSmoothingQuality='high'; }catch(e){} cx.drawImage(im,0,0,c.width,c.height);
  t.image=c; t.needsUpdate=true; TXS.shrunk.push({t:t, full:im, v:t.version}); TXS.links.forEach(function(l){ if(l.canon===t) l.cv=t.version; }); TXS.saved+=(w*h-c.width*c.height)*4*1.33; TXS.halved++; }
/* watchdog: a redrawn texture gets its own full copy back */
function txsWatch(){ for(let i=TXS.links.length-1;i>=0;i--){ const l=TXS.links[i]; if(l.orig.version!==l.ov||l.canon.version!==l.cv){ l.users.forEach(function(u){ if(u[0][u[1]]===l.canon){ u[0][u[1]]=l.orig; u[0].needsUpdate=true; } }); l.orig.userData.txsOwn=true; l.orig.needsUpdate=true; TXS.links.splice(i,1); TXS.reverted=(TXS.reverted||0)+1; } }
  for(let i=TXS.shrunk.length-1;i>=0;i--){ const s=TXS.shrunk[i]; if(s.t.version!==s.v){ if(s.t.image!==s.full&&s.t.image.width<s.full.width){ /* the game redrew the original canvas: show it at full size */ s.t.image=s.full; s.t.needsUpdate=true; } s.t.userData.txsOwn=true; TXS.shrunk.splice(i,1); TXS.reverted=(TXS.reverted||0)+1; } } }
function txsRun(){ try{ txsShare(); }catch(e){ console.warn('doku paylaşımı',e); } try{ txsShrink(); }catch(e){ console.warn('doku küçültme',e); } TXS.done=true; TXS.run=false; }
/* background: share (fingerprints a few per frame), then halve one big texture per frame; menus 6 ms, in play 2 ms */
function txsBgStep(){ if(!TXS.run) return; const menu=state==='menu'||state==='paused'||state==='map', budget=menu?6:2;
  try{ if(TXS.phase!=='shrink'){ if(txsShareStep(budget)) TXS.phase='shrink'; return; }
    if(!TXS.sq){ const lim=txsLimit(), seen=new Set(TXS.shrunk.map(function(x){ return x.t; })); TXS.sq=[]; if(lim<1e9) txsCollect().forEach(function(L,t){ const im=t.image; if(!seen.has(t)&&im&&Math.max(im.width||0,im.height||0)>=lim) TXS.sq.push(t); }); }
    const t=TXS.sq.pop(); if(t){ if(TXS.shrunk.every(function(x){ return x.t!==t; })) txsHalve(t); return; }
    TXS.sq=null; TXS.run=false; TXS.phase=null; TXS.done=true; TXS.at=Math.round(performance.now()); }catch(e){ TXS.run=false; TXS.done=true; console.warn('doku',e); } }
cullStep=HOOK.wrap('cullStep','performans/doku-bellegi#_txsCull',function(_txsCull){ return function(dt){ _txsCull(dt); txsBgStep(); TXS.t+=dt||0; if(TXS.t>1){ TXS.t=0; try{ txsWatch(); }catch(e){} } }; },cullStep);
function txsStart(){ if(SETTINGS.texShare===false) return; TXS.run=true; TXS.phase=null; TXS.job=null; TXS.sq=null; }
setTimeout(txsStart,2200);    /* after the world is built (the loading screen holds timers until then) */
setTimeout(txsStart,9000);    /* models and late props */
