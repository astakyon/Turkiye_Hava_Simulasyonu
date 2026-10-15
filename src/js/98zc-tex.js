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
function txsSig(im){ if(!TXS.cv){ TXS.cv=document.createElement('canvas'); TXS.cv.width=TXS.cv.height=8; } const cx=TXS.cv.getContext('2d',{willReadFrequently:true}); cx.clearRect(0,0,8,8); cx.drawImage(im,0,0,8,8); const d=cx.getImageData(0,0,8,8).data; let h=0; for(let i=0;i<d.length;i++) h=(h*31+d[i])|0; return (im.width||0)+'x'+(im.height||0)+':'+h; }
function txsSame(a,b){ if(a===b) return true; if(a.width!==b.width||a.height!==b.height) return false; try{ const ca=a.getContext&&a.getContext('2d'), cb=b.getContext&&b.getContext('2d'); if(!ca||!cb) return false;
    const da=ca.getImageData(0,0,a.width,a.height).data, db=cb.getImageData(0,0,b.width,b.height).data; if(da.length!==db.length) return false; for(let i=0;i<da.length;i+=4){ if(da[i]!==db[i]||da[i+1]!==db[i+1]||da[i+2]!==db[i+2]||da[i+3]!==db[i+3]) return false; } return true; }catch(e){ return false; } }
function txsParams(t){ return [t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.generateMipmaps?1:0,t.flipY?1:0,t.encoding,t.format,t.type,t.premultiplyAlpha?1:0,t.repeat.x,t.repeat.y,t.offset.x,t.offset.y,t.rotation,t.center.x,t.center.y].join(','); }
const TXS_SLOTS=['map','emissiveMap','alphaMap','bumpMap','normalMap','roughnessMap','metalnessMap','aoMap','lightMap'];
function txsCollect(){ const uses=new Map(); scene.traverse(function(o){ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; ms.forEach(function(m){ if(!m) return; TXS_SLOTS.forEach(function(k){ const t=m[k]; if(t&&t.isTexture&&!t.isCubeTexture&&t.image&&t.image.getContext){ let L=uses.get(t); if(!L){ L=[]; uses.set(t,L); } L.push([m,k]); } }); }); }); return uses; }
function txsShare(){ if(SETTINGS.texShare===false) return 0; const uses=txsCollect(), groups=new Map(); let n=0;
  uses.forEach(function(L,t){ if(t.userData&&t.userData.txsOwn) return; let s; try{ s=txsSig(t.image)+'|'+txsParams(t); }catch(e){ return; } let G=groups.get(s); if(!G){ G=[]; groups.set(s,G); } G.push(t); });
  groups.forEach(function(G){ if(G.length<2) return; const canon=G[0]; for(let i=1;i<G.length;i++){ const t=G[i]; if(!txsSame(canon.image,t.image)) continue;
      const L=uses.get(t); L.forEach(function(u){ u[0][u[1]]=canon; u[0].needsUpdate=true; }); TXS.links.push({orig:t, canon:canon, users:L, ov:t.version, cv:canon.version});
      TXS.saved+=t.image.width*t.image.height*4*1.33; try{ t.dispose(); }catch(e){} n++; } });
  TXS.shared+=n; return n; }
/* halve big canvas textures (phones; PC at low quality only the very big ones) */
function txsLimit(){ if(DEV.mobile) return 1024; const q=SETTINGS.quality||0; return q<=1?2048:1e9; }
function txsShrink(){ if(SETTINGS.texShare===false) return 0; const lim=txsLimit(); if(lim>=1e9) return 0; let n=0; const seen=new Set(TXS.shrunk.map(function(s){ return s.t; }));
  txsCollect().forEach(function(L,t){ if(seen.has(t)) return; const im=t.image; const w=im.width||0, h=im.height||0; if(Math.max(w,h)<lim) return;
    const c=document.createElement('canvas'); c.width=Math.max(1,w>>1); c.height=Math.max(1,h>>1); const cx=c.getContext('2d'); cx.imageSmoothingEnabled=true; try{ cx.imageSmoothingQuality='high'; }catch(e){} cx.drawImage(im,0,0,c.width,c.height);
    t.image=c; t.needsUpdate=true; TXS.shrunk.push({t:t, full:im, v:t.version}); TXS.links.forEach(function(l){ if(l.canon===t) l.cv=t.version; }); TXS.saved+=(w*h-c.width*c.height)*4*1.33; n++; });
  TXS.halved+=n; return n; }
/* watchdog: a redrawn texture gets its own full copy back */
function txsWatch(){ for(let i=TXS.links.length-1;i>=0;i--){ const l=TXS.links[i]; if(l.orig.version!==l.ov||l.canon.version!==l.cv){ l.users.forEach(function(u){ if(u[0][u[1]]===l.canon){ u[0][u[1]]=l.orig; u[0].needsUpdate=true; } }); l.orig.userData.txsOwn=true; l.orig.needsUpdate=true; TXS.links.splice(i,1); TXS.reverted=(TXS.reverted||0)+1; } }
  for(let i=TXS.shrunk.length-1;i>=0;i--){ const s=TXS.shrunk[i]; if(s.t.version!==s.v){ if(s.t.image!==s.full&&s.t.image.width<s.full.width){ /* the game redrew the original canvas: show it at full size */ s.t.image=s.full; s.t.needsUpdate=true; } s.t.userData.txsOwn=true; TXS.shrunk.splice(i,1); TXS.reverted=(TXS.reverted||0)+1; } } }
function txsRun(){ try{ txsShare(); }catch(e){ console.warn('doku paylaşımı',e); } try{ txsShrink(); }catch(e){ console.warn('doku küçültme',e); } TXS.done=true; }
cullStep=HOOK.wrap('cullStep','98zc-tex#_txsCull',function(_txsCull){ return function(dt){ _txsCull(dt); TXS.t+=dt||0; if(TXS.t>1){ TXS.t=0; try{ txsWatch(); }catch(e){} } }; },cullStep);
setTimeout(function(){ if(!TXS.done) txsRun(); },2200);                                         /* before the static merge (2.5 s), so shared pictures merge */
setTimeout(function(){ try{ txsShare(); txsShrink(); }catch(e){} },9000);   /* models and late props */
