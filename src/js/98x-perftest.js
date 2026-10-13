/* ------------------------------------------------------------------ performance test and device report (V2.12)
   Ayarlar → Grafik → Performans testi. The game plays a fixed script on its own (same views on every device):
     1. screen refresh rate (a second without drawing, only requestAnimationFrame intervals)
     2. first-use hitches: the first explosion and flares (shader compile / upload stalls)
     3. six scenes: high flight, low flight over the city, city on foot, UAV base (parked aircraft), naval base, forest
     4. feature costs on the same flight path: shadows, post effects, half resolution, trees, depth split, logarithmic depth
     5. stress: 8 extra aircraft and explosions every 0.25 s
     6. optional 5 min heat test (frame time trend: phones slow down when they get warm)
   Per segment: average / P90 / P99 FPS (Android "game performance" guidance), share of frames slower than 20 FPS ("slow
   session"), hitches, CPU time of the frame (JS + WebGL calls), GPU time when the browser offers EXT_disjoint_timer_query,
   draw calls, triangles, garbage (heap growth per second, collections). The verdict says what limits the device (screen
   refresh, CPU or GPU) and which feature costs most. The report is anonymous (device, GPU, settings, numbers) and goes to the
   perf_reports table (supabase/perf_reports.sql) only when the player presses "Gönder"; it is also kept on this device and can
   be copied. The admin panel lists reports (Yönetim → Performans). While the test runs, the adaptive quality, the FPS limit
   and the player's input are switched off; everything is restored at the end (or on Esc). */
const PT={run:false, k:1, steps:[], si:-1, st:0, seg:null, segs:[], last:0, ring:new Float32Array(240), ri:0, heap:0, saved:null, warm:false,
  gq:null, path:null, pathT:0, spawned:[], fxT:0, ui:null, rep:null, reports:[], v:new THREE.Vector3()};
/* ---- statistics */
function ptPct(arr,p){ if(!arr.length) return 0; const a=Array.prototype.slice.call(arr).sort(function(x,y){ return x-y; }); const i=Math.min(a.length-1,Math.max(0,Math.ceil(p/100*a.length)-1)); return a[i]; }
function ptMean(arr){ if(!arr.length) return 0; let s=0; for(let i=0;i<arr.length;i++) s+=arr[i]; return s/arr.length; }
function ptR1(x){ return Math.round(x*10)/10; }
function ptSummary(sg){ const ft=sg.ft, n=ft.length, mean=ptMean(ft), med=ptPct(ft,50);
  let slow=0, hitch=0; for(let i=0;i<n;i++){ if(ft[i]>50) slow++; if(ft[i]>Math.max(34,med*2.5)) hitch++; }
  const r={id:sg.id, name:sg.name, n:n, avg:n?ptR1(1000/mean):0, p90:n?ptR1(1000/ptPct(ft,90)):0, p99:n?ptR1(1000/ptPct(ft,99)):0, ms:ptR1(mean), ms90:ptR1(ptPct(ft,90)),
    slow:n?Math.round(slow/n*1000)/10:0, hitch:hitch, max:ptR1(n?Math.max.apply(null,ft):0), cpu:ptR1(ptMean(sg.cpu)), gpu:sg.gpu.length?ptR1(ptMean(sg.gpu)):null,
    calls:Math.round(ptMean(sg.calls)), tris:Math.round(ptMean(sg.tris)), alloc:sg.dur>0?ptR1(sg.alloc/1048576/sg.dur):null, gc:sg.gcN};
  r.bound=ptBound(r); return r; }
/* what limits this segment: the screen (smooth at its refresh rate), the CPU or the GPU */
function ptBound(r){ const rf=PT.refresh?1000/PT.refresh:16.7; if(!r.n) return '?';
  if(r.ms90<=rf*1.2) return 'ekran';
  if(r.gpu!=null&&r.gpu>r.ms*0.75) return 'gpu';
  if(r.cpu>=r.ms*0.75) return 'cpu';
  if(r.gpu!=null&&r.cpu<r.ms*0.5) return 'gpu';
  if(r.cpu<r.ms*0.45) return 'gpu?';
  return 'karma'; }
const PT_BOUND={ekran:'ekranın yenileme hızı (akıcı)', gpu:'ekran kartı', 'gpu?':'ekran kartı (tahmin)', cpu:'işlemci', karma:'işlemci + ekran kartı', '?':'—'};
/* refresh rate from frame intervals while nothing is drawn: the 25th percentile snapped to common rates */
function ptRefresh(iv){ if(!iv.length) return 60; const m=ptPct(iv,25), hz=1000/m; const R=[30,48,50,60,72,75,90,100,120,144,165,240]; let b=60, bd=1e9; R.forEach(function(x){ const d=Math.abs(x-hz); if(d<bd){ bd=d; b=x; } }); return b; }
/* ---- device info */
function ptTexMem(){ const T=new Map(); try{ scene.traverse(function(o){ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; ms.forEach(function(m){ ['map','emissiveMap','normalMap','alphaMap','envMap','aoMap','lightMap','bumpMap','roughnessMap','metalnessMap'].forEach(function(k){ const t=m[k]; if(t&&t.image) T.set(t.uuid,t); }); }); }); }catch(e){}
  let b=0; T.forEach(function(t){ const im=t.image, w=im.width||0, h=im.height||0; b+=w*h*4*(t.generateMipmaps!==false&&t.minFilter!==THREE.LinearFilter&&t.minFilter!==THREE.NearestFilter?1.33:1); }); return {n:T.size, mb:Math.round(b/1048576)}; }
function ptDevice(){ const d={kind:DEV.kind, mobile:!!DEV.mobile, gpu:String(DEV.gpu||'?').slice(0,120), webgl:DEV.webgl, ua:String((typeof navigator!=='undefined'&&navigator.userAgent)||'').slice(0,200), cores:(typeof navigator!=='undefined'&&navigator.hardwareConcurrency)||null, mem:(typeof navigator!=='undefined'&&navigator.deviceMemory)||null,
    sw:(typeof screen!=='undefined'&&screen.width)||0, sh:(typeof screen!=='undefined'&&screen.height)||0, dpr:(typeof window!=='undefined'&&window.devicePixelRatio)||1, pr:ptR1(renderer.getPixelRatio()*100)/100, logDepth:!!DEV.logDepth, tier:(typeof devTier==='function'?devTier():null),
    standalone:!!(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches), maxTex:(renderer.capabilities&&renderer.capabilities.maxTextureSize)||null, gpuTimer:!!(PT.gq&&PT.gq.ext) };
  try{ const v=renderer.getDrawingBufferSize(new THREE.Vector2()); d.bw=v.x; d.bh=v.y; }catch(e){}
  return d; }
function ptSettings(){ const s={}; ['quality','shadows','fx','res','aa','fpsCap','autoPerf','depth','split','safeMode','merge'].forEach(function(k){ s[k]=SETTINGS[k]==null?null:SETTINGS[k]; }); s.lvl=PERF2.lvl; return s; }
/* ---- GPU timer (EXT_disjoint_timer_query_webgl2; many browsers hide it, then GPU time stays empty) */
function ptGpuInit(){ if(PT.gq) return PT.gq; PT.gq={ext:null, gl:null, pool:[], pend:[]}; try{ const gl=renderer.getContext(); const ext=gl.getExtension&&gl.getExtension('EXT_disjoint_timer_query_webgl2'); if(ext&&gl.createQuery){ PT.gq.ext=ext; PT.gq.gl=gl; } }catch(e){} return PT.gq; }
function ptGpuPoll(){ const G=PT.gq; if(!G||!G.ext) return; const gl=G.gl; let dis=false; try{ dis=gl.getParameter(G.ext.GPU_DISJOINT_EXT); }catch(e){}
  while(G.pend.length){ const p=G.pend[0]; let ok=false; try{ ok=gl.getQueryParameter(p.q,gl.QUERY_RESULT_AVAILABLE); }catch(e){ ok=true; p.bad=true; } if(!ok) break; G.pend.shift();
    if(!dis&&!p.bad&&p.seg){ try{ const ns=gl.getQueryParameter(p.q,gl.QUERY_RESULT); if(ns>0) p.seg.gpu.push(ns/1e6); }catch(e){} } G.pool.push(p.q); }
  if(G.pend.length>12){ G.pend.splice(0,G.pend.length-12).forEach(function(p){ G.pool.push(p.q); }); } }
const _ptRF=renderFrame; renderFrame=function(dt){ const G=PT.gq;
  if(!PT.run||!G||!G.ext||!PT.seg||PT.seg.noGpu){ return _ptRF(dt); }
  const gl=G.gl, q=G.pool.pop()||gl.createQuery(); let begun=false; try{ gl.beginQuery(G.ext.TIME_ELAPSED_EXT,q); begun=true; }catch(e){}
  try{ _ptRF(dt); } finally { if(begun){ try{ gl.endQuery(G.ext.TIME_ELAPSED_EXT); G.pend.push({q:q,seg:PT.seg}); }catch(e){ G.pool.push(q); } } else G.pool.push(q); } };
/* ---- scripted camera paths: the same views on every device */
const PT_AIR={ucus:{c:[0,0],R:3500,alt:700,w:0.07,a0:0.6}, alcak:{c:[-1450,6300],R:1100,agl:160,w:0.12,a0:2.2}};
function ptAirPose(sc,t){ const a=sc.a0+t*sc.w, x=sc.c[0]+Math.cos(a)*sc.R, z=sc.c[1]+Math.sin(a)*sc.R; let y=sc.alt||0;
  if(sc.agl){ let h=0; for(let k=0;k<5;k++){ const b=a+k*0.06; h=Math.max(h,terrainH(sc.c[0]+Math.cos(b)*sc.R,sc.c[1]+Math.sin(b)*sc.R)); } y=Math.max(h,0)+sc.agl; }
  const dx=-Math.sin(a)*sc.w, dz=Math.cos(a)*sc.w; return {x:x,y:y,z:z,yaw:Math.atan2(-dx,-dz)}; }
function ptApplyAir(t){ const sc=PT.path; if(!sc||state!=='play') return; const p=ptAirPose(sc,t);
  S.pos.set(p.x,p.y,p.z); S.q.setFromAxisAngle(UP,p.yaw); S.speed=200; S.onGround=false; S.crashed=false; S.taxi=false; S.auto=false; S.sink=0; S.gear=false; if(S.hp!=null) S.hp=100; S.throttle=0.7; }
function ptApplyWalk(t){ const w=PT.path; if(!w||state!=='walk'||WALK.mode!=='foot') return; const yaw=w.yaw+Math.sin(t*0.35)*1.1, d=Math.min(t,12)*1.2;
  const x=w.x-Math.sin(w.yaw)*d, z=w.z-Math.cos(w.yaw)*d; WALK.pos.set(x,groundH(x,z)+1.7,z); WALK.yaw=yaw; WALK.pitch=0.02; }
const _ptUpd=update; update=function(dt){ _ptUpd(dt); if(PT.run&&PT.path&&PT.path.air) ptApplyAir(PT.pathT); };
const _ptWalk=walkUpdate; walkUpdate=function(dt){ _ptWalk(dt); if(PT.run&&PT.path&&PT.path.walk) ptApplyWalk(PT.pathT); };
/* ---- scene setup helpers */
function ptFly(id){ const sc=Object.assign({air:true},PT_AIR[id]);
  if(state!=='play'){ playMode('quick'); missionId='free'; selectedId='kaan'; setAircraft('kaan'); SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); }
  camMode=0; PT.path=sc; PT.pathT=0; ptApplyAir(0); try{ camQ.copy(S.q); camSnap=true; }catch(e){} }
function ptWalkAt(g){ if(state!=='walk') startWalk(); WALK.mode='foot'; PT.path={walk:true,x:g[0],z:g[1],yaw:g[2]}; PT.pathT=0; ptApplyWalk(0); }
function ptForestSpot(){ try{ const L=GFX.treeChunks||[]; const c=L[Math.min(5,L.length-1)]; if(c&&c.count){ const m=new THREE.Matrix4(); c.getMatrixAt(0,m); PT.v.setFromMatrixPosition(m); return [PT.v.x+40,PT.v.z,Math.PI/2]; } }catch(e){} return [-3000,-1500,0]; }
function ptPlace(id){ const p=placeById(id); return p&&p.g?p.g:[p?p.x:0,p?p.z:0,0]; }
/* ---- feature toggles (each returns an undo function) */
function ptNoLogDepth(){ const mats=new Set(); scene.traverse(function(o){ if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){ mats.add(m); }); });
  const undo=[]; mats.forEach(function(m){ const ob=m.onBeforeCompile, ck=m.customProgramCacheKey; undo.push([m,ob,ck]);
    m.onBeforeCompile=function(sh,r){ if(ob) ob.call(this,sh,r); sh.vertexShader='#undef USE_LOGDEPTHBUF\n#undef USE_LOGDEPTHBUF_EXT\n'+sh.vertexShader; sh.fragmentShader='#undef USE_LOGDEPTHBUF\n#undef USE_LOGDEPTHBUF_EXT\n'+sh.fragmentShader; };
    m.customProgramCacheKey=function(){ return (ck?ck.call(this):'')+'|ptnolog'; }; m.needsUpdate=true; });
  return function(){ undo.forEach(function(u){ u[0].onBeforeCompile=u[1]; u[0].customProgramCacheKey=u[2]; u[0].needsUpdate=true; }); }; }
function ptSetPR(f){ const pr=renderer.getPixelRatio(); renderer.setPixelRatio(pr*f); try{ resize(); }catch(e){} try{ fxResize(); }catch(e){} return function(){ renderer.setPixelRatio(pr); try{ resize(); }catch(e){} try{ fxResize(); }catch(e){} }; }
function ptFeatures(){ const F=[];
  if(renderer.shadowMap.enabled&&sunLight.castShadow) F.push(['golge','Gölgeler',function(){ sunLight.castShadow=false; return function(){ sunLight.castShadow=true; }; }]);
  if(FX&&FX.on&&FX.composer) F.push(['efekt','Görsel efektler',function(){ FX.on=false; return function(){ FX.on=true; }; }]);
  F.push(['cozunurluk','Çözünürlük (yarıya)',function(){ return ptSetPR(0.5); }]);
  if(GFX.treeChunks&&GFX.treeChunks.length) F.push(['agac','Ağaçlar',function(){ const v=GFX.treeChunks.map(function(m){ return m.visible; }); GFX.treeChunks.forEach(function(m){ m.visible=false; }); return function(){ GFX.treeChunks.forEach(function(m,i){ m.visible=v[i]; }); }; }]);
  if(typeof splitWanted==='function'&&splitWanted()) F.push(['bolme','İki katmanlı derinlik',function(){ const s=SETTINGS.split; SETTINGS.split=false; return function(){ SETTINGS.split=s; }; }]);
  if(DEV.logDepth) F.push(['logderinlik','Logaritmik derinlik',ptNoLogDepth]);
  return F; }
/* ---- stress: 8 friendly aircraft around you and explosions in front */
function ptStressOn(){ for(let i=0;i<8;i++){ try{ const a=makeActor({id:'PT'+(++NET.seq),name:'Test '+(i+1),team:'blue',ac:ENEMY_AC[i%ENEMY_AC.length],ai:true,msl:0,flares:0});
      const ang=i/8*6.283; PT.v.set(S.pos.x+Math.cos(ang)*700,S.pos.y+((i%3)-1)*80,S.pos.z+Math.sin(ang)*700); placeActor(a,PT.v,new THREE.Vector3(-Math.sin(ang),0,Math.cos(ang))); PT.spawned.push(a); }catch(e){} } }
function ptStressStep(dt){ PT.fxT-=dt; if(PT.fxT>0) return; PT.fxT=0.25; try{ fwdOf(S.q,PT.v); const p=S.pos.clone().addScaledVector(PT.v,260+Math.random()*200); p.x+=(Math.random()-.5)*160; p.y+=(Math.random()-.5)*60; explode(p,25,6); }catch(e){} }
function ptStressOff(){ PT.spawned.forEach(function(a){ try{ removeActor(a); }catch(e){} }); PT.spawned=[]; }
/* ---- the script */
function ptBuild(opts){ const k=opts.k||1, L=[], m=function(s){ return s*k; };
  L.push({id:'yenileme', name:'Ekran yenileme hızı', idle:true, settle:m(0.4), dur:m(1.2), noGpu:true});
  L.push({id:'ilk', name:'İlk patlama ve flare', enter:function(){ ptFly('ucus'); }, settle:m(2.5), dur:m(2.5), fx:true});
  L.push({id:'ucus', name:'Uçuş (700 m)', scene:true, enter:function(){ ptFly('ucus'); }, settle:m(2), dur:m(8)});
  L.push({id:'alcak', name:'Alçak uçuş (şehir üstü)', scene:true, enter:function(){ ptFly('alcak'); }, settle:m(2), dur:m(8)});
  L.push({id:'sehir', name:'Şehirde yürüyüş', scene:true, enter:function(){ ptWalkAt(ptPlace('anadolukent')); }, settle:m(2.5), dur:m(8)});
  L.push({id:'iha', name:'İHA üssü (park uçaklar)', scene:true, enter:function(){ ptWalkAt(ptPlace('uav')); }, settle:m(2), dur:m(8)});
  L.push({id:'liman', name:'Deniz üssü', scene:true, enter:function(){ ptWalkAt(ptPlace('naval')); }, settle:m(2), dur:m(8)});
  L.push({id:'orman', name:'Orman', scene:true, enter:function(){ ptWalkAt(ptForestSpot()); }, settle:m(2), dur:m(8)});
  L.push({id:'temel', name:'Karşılaştırma: hepsi açık', base:true, enter:function(){ ptFly('ucus'); }, settle:m(2), dur:m(5)});
  ptFeatures().forEach(function(f){ L.push({id:'f_'+f[0], name:f[1]+' kapalı', feat:f[0], featName:f[1], enter:function(){ ptFly('ucus'); this.undo=f[2](); }, exit:function(){ if(this.undo) this.undo(); this.undo=null; }, settle:m(f[0]==='logderinlik'?4:1.5), dur:m(5)}); });
  L.push({id:'stres', name:'Kalabalık savaş (8 uçak, patlamalar)', stress:true, enter:function(){ ptFly('ucus'); ptStressOn(); }, exit:ptStressOff, settle:m(1.5), dur:m(8)});
  if(opts.warm) for(let i=0;i<10;i++) L.push({id:'isi'+i, name:'Isınma testi '+(i+1)+'/10', warm:i, enter:i===0?function(){ ptFly('ucus'); }:null, keepPath:i>0, settle:i===0?m(1):0, dur:m(30)});
  return L; }
function ptNewSeg(s){ return {id:s.id, name:s.name, ft:[], cpu:[], gpu:[], calls:[], tris:[], alloc:0, gcN:0, dur:0, noGpu:!!s.noGpu}; }
function ptStart(opts){ if(PT.run) return; opts=opts||{}; if(NET.on){ toast('Performans testi çok oyunculu maçta çalışmaz','#ffc24a'); return; }
  closeModals(); ptGpuInit();
  PT.saved={set:['autoPerf','fpsCap','ai','split'].map(function(k){ return [k,Object.prototype.hasOwnProperty.call(SETTINGS,k),SETTINGS[k]==null?SETTINGS[k]:JSON.parse(JSON.stringify(SETTINGS[k]))]; }), camMode:camMode, flares:flaresLeft, perfScale:PERF.scale, lvl:PERF2.lvl, sel:selectedId, mis:missionId};
  SETTINGS.autoPerf=false; SETTINGS.fpsCap=0; PERF2.lvl=0; try{ applyQuality(); }catch(e){}
  PT.steps=ptBuild(opts); PT.si=-1; PT.segs=[]; PT.seg=null; PT.last=0; PT.run=true; PT.warm=!!opts.warm; PT.k=opts.k||1; PT.iv=[]; PT.fxRes=[]; PT.t0=performance.now();
  try{ PT.heap=performance.memory?performance.memory.usedJSHeapSize:0; }catch(e){ PT.heap=0; }
  ptOverlay(true); ptNext(); }
function ptNext(){ const prev=PT.steps[PT.si]; if(prev){ try{ if(prev.exit) prev.exit(); }catch(e){} if(PT.seg&&!prev.idle&&!prev.fx) PT.segs.push(ptSummaryFull(prev,PT.seg)); }
  PT.si++; const s=PT.steps[PT.si]; PT.seg=null; if(!s){ ptFinish(false); return; }
  PT.st=0; PT.phase='settle'; if(!s.keepPath) PT.pathT=0;
  try{ if(s.enter) s.enter(); }catch(e){ console.warn('performans testi',s.id,e); }
  if(s.fx){ const kk=PT.k; PT.fxPlan=[[0.6*kk,'patlama',function(){ fwdOf(S.q,PT.v); explode(S.pos.clone().addScaledVector(PT.v,220),40,8); }],[1.6*kk,'flare',function(){ flareCd=0; if(flaresLeft<4) flaresLeft=4; dropFlares(); }]]; PT.fxSeen=[]; }
  ptOverlay(true); }
function ptSummaryFull(s,sg){ const r=ptSummary(sg); if(s.scene) r.scene=true; if(s.base) r.base=true; if(s.feat){ r.feat=s.feat; r.featName=s.featName; } if(s.stress) r.stress=true; if(s.warm!=null) r.warm=s.warm;
  r.q=sg.ft.map(function(x){ return Math.round(x); }); if(r.q.length>720) r.q=r.q.filter(function(x,i){ return i%Math.ceil(r.q.length/720)===0; }); return r; }
/* called once per animation frame with the frame interval and the frame's CPU time */
function ptTick(now,ftMs,cpuMs){ if(!PT.run) return; const s=PT.steps[PT.si]; if(!s){ ptFinish(false); return; }
  if(!(ftMs>0)) ftMs=16.7; const dt=Math.min(ftMs,250)/1000; PT.st+=dt; PT.pathT+=dt;
  if(state!=='play'&&state!=='walk'&&!s.idle&&PT.si>1&&PT.phase!=='settle'){ ptFinish(true); return; }   /* paused / left the game: stop */
  ptGpuPoll();
  if(PT.phase==='settle'){ if(PT.st>=s.settle){ PT.phase='measure'; PT.st=0; PT.seg=ptNewSeg(s); } return; }
  const sg=PT.seg; if(!sg) return;
  if(s.idle){ PT.iv.push(ftMs); }
  else { sg.ft.push(ftMs); sg.cpu.push(cpuMs); sg.dur+=dt; try{ sg.calls.push(PERF2.calls||0); sg.tris.push(PERF2.tris||0); }catch(e){}
    try{ if(performance.memory){ const h=performance.memory.usedJSHeapSize, d=h-PT.heap; if(d>0) sg.alloc+=d; else if(d<-1048576) sg.gcN++; PT.heap=h; } }catch(e){} }
  if(s.stress) ptStressStep(dt);
  if(s.fx&&PT.fxPlan){ PT.fxPlan.forEach(function(f){ if(!f.done&&PT.st>=f[0]){ f.done=true; const med=ptPct(sg.ft,50)||16.7; try{ f[2](); }catch(e){} PT.fxSeen.push({k:f[1],t:PT.st,med:med,max:0}); } });
    PT.fxSeen.forEach(function(x){ if(PT.st-x.t<0.9*PT.k&&PT.st>x.t) x.max=Math.max(x.max,ftMs); }); }
  if(PT.st>=s.dur){ if(s.idle) PT.refresh=ptRefresh(PT.iv); if(s.fx) PT.fxRes=PT.fxSeen.map(function(x){ return {k:x.k, spike:ptR1(x.max), med:ptR1(x.med)}; }); ptNext(); }
  if(PT.ui&&(PT.ui.n=(PT.ui.n||0)+1)%10===0) ptOverlay(false); }
/* outermost frame wrapper: frame interval + CPU time; the idle step skips drawing */
const _ptFrame=frame; frame=function(now){ const iv=PT.last?now-PT.last:0; PT.last=now; if(iv>0&&iv<1000){ PT.ring[PT.ri]=iv; PT.ri=(PT.ri+1)%PT.ring.length; }
  if(PT.run){ const s=PT.steps[PT.si]; if(s&&s.idle){ requestAnimationFrame(frame); ptTick(now,iv,0); return; }
    const t0=performance.now(); _ptFrame(now); const cpu=performance.now()-t0; ptTick(now,iv,cpu); return; }
  _ptFrame(now); };
/* ---- results */
function ptReport(aborted){ const S2=PT.segs, base=S2.find(function(r){ return r.base; });
  const scenes=S2.filter(function(r){ return r.scene; }), feats=S2.filter(function(r){ return r.feat; }), warm=S2.filter(function(r){ return r.warm!=null; }), stress=S2.find(function(r){ return r.stress; });
  const featCost=feats.map(function(f){ const b=base||f; const gainMs=ptR1(b.ms-f.ms), gain90=ptR1(b.ms90-f.ms90), gpuGain=(b.gpu!=null&&f.gpu!=null)?ptR1(b.gpu-f.gpu):null, cpuGain=ptR1(b.cpu-f.cpu);
    return {id:f.feat, name:f.featName, ms:gainMs, ms90:gain90, gpu:gpuGain, cpu:cpuGain, pct:b.ms>0?Math.round((b.ms-f.ms)/b.ms*100):0, fps90:f.p90, base90:b.p90, calls:b.calls-f.calls}; }).sort(function(a,b){ return (b.gpu!=null?b.gpu:b.ms90)-(a.gpu!=null?a.gpu:a.ms90); });
  const all=scenes.length?scenes:S2; const worst=all.slice().sort(function(a,b){ return a.p90-b.p90; })[0];
  const bounds={}; all.forEach(function(r){ bounds[r.bound]=(bounds[r.bound]||0)+1; }); const mainBound=Object.keys(bounds).sort(function(a,b){ return bounds[b]-bounds[a]; })[0]||'?';
  const rep={v:GAME_VERSION, at:new Date().toISOString(), aborted:!!aborted, dur:Math.round((performance.now()-PT.t0)/1000), refresh:PT.refresh||null, dev:ptDevice(), set:ptSettings(),
    mem:Object.assign({heapMB:(performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null), geo:renderer.info.memory.geometries, prog:(renderer.info.programs||[]).length},{tex:ptTexMem()}),
    scenes:scenes, base:base||null, feats:featCost, stress:stress||null, fx:PT.fxRes||[], warm:warm.map(function(w){ return {i:w.warm, avg:w.avg, p90:w.p90, p99:w.p99, ms90:w.ms90}; }),
    sum:{avg:ptR1(ptMean(all.map(function(r){ return r.avg; }))), p90:worst?worst.p90:0, worst:worst?worst.name:'', bound:mainBound, slow:ptR1(ptMean(all.map(function(r){ return r.slow; }))), hitch:all.reduce(function(a,r){ return a+r.hitch; },0)},
    model:'', note:''};
  rep.tips=ptTips(rep); return rep; }
function ptTips(r){ const T=[], rf=r.refresh||60;
  const top=r.feats.filter(function(f){ return (f.gpu!=null?f.gpu:f.ms90)>0.8; });
  if(r.sum.bound==='ekran') T.push('Cihazın bu ayarlarla ekranının yenileme hızında ('+rf+' Hz) akıcı çalışıyor; darboğaz yok.');
  else if(/gpu/.test(r.sum.bound)) T.push('Asıl darboğaz ekran kartı. Çizilen piksel ve nesne sayısını azaltan ayarlar en çok kazandırır.');
  else if(r.sum.bound==='cpu') T.push('Asıl darboğaz işlemci (oyun mantığı ve çizim komutları). Görüş mesafesi ve kalabalık azaltılmalı.');
  top.slice(0,3).forEach(function(f){ T.push(f.name+' kapatılınca kare '+(f.gpu!=null?f.gpu+' ms (ekran kartı)':f.ms90+' ms (P90)')+' kısalıyor'+(f.pct>0?' (%'+f.pct+')':'')+'.'); });
  const lg=r.feats.find(function(f){ return f.id==='logderinlik'; }); if(lg&&((lg.gpu!=null?lg.gpu:lg.ms90)>1)) T.push('Logaritmik derinlik bu bilgisayarda pahalı; V2.16\'da kaldırılacak.');
  const fx=r.fx.filter(function(x){ return x.spike>Math.max(50,x.med*3); }); if(fx.length) T.push('İlk '+fx.map(function(x){ return x.k; }).join(' ve ')+' anında takılma var ('+fx.map(function(x){ return Math.round(x.spike)+' ms'; }).join(', ')+'); shader ön derleme (V2.18) bunu giderecek.');
  if(r.stress&&r.base&&r.stress.p90<r.base.p90*0.7) T.push('Kalabalık savaşta P90 '+r.base.p90+' → '+r.stress.p90+' FPS düşüyor.');
  if(r.warm.length>=4){ const a=r.warm[0].p90, b=r.warm[r.warm.length-1].p90; if(b<a*0.85) T.push('Isınma: 5 dakikada P90 '+a+' → '+b+' FPS (%'+Math.round((1-b/a)*100)+' düşüş). Cihaz ısınınca yavaşlıyor.'); else T.push('Isınma testinde belirgin yavaşlama yok ('+a+' → '+b+' FPS).'); }
  if(r.sum.slow>25) T.push('Karelerin %'+r.sum.slow+'\'i 20 FPS\'in altında: Google Play ölçütüne göre bu bir "yavaş oturum" (sınır %25).'); else if(r.sum.slow>5) T.push('Karelerin %'+r.sum.slow+'\'i 20 FPS\'in altında: Google Play\'in "yavaş oturum" sınırına (%25) yaklaşıyor.');
  if(r.mem&&r.mem.tex&&r.mem.tex.mb>(r.dev.mobile?60:150)) T.push('Doku belleği yüksek (~'+r.mem.tex.mb+' MB); V2.17\'de küçültülecek.');
  return T.map(function(t){ return t.replace(/(^|[^V\d.])(\d+)\.(\d)/g,'$1$2,$3'); }); }   /* Turkish decimals; keeps version numbers like V2.16 */
function ptFinish(aborted){ if(!PT.run) return; const prev=PT.steps[PT.si]; try{ if(prev&&prev.exit) prev.exit(); }catch(e){} if(PT.seg&&prev&&!prev.idle&&!prev.fx&&PT.seg.ft.length>20) PT.segs.push(ptSummaryFull(prev,PT.seg));
  PT.run=false; PT.path=null; PT.seg=null; ptStressOff();
  const sv=PT.saved||{}; try{ (sv.set||[]).forEach(function(x){ if(x[1]) SETTINGS[x[0]]=x[2]; else delete SETTINGS[x[0]]; }); camMode=sv.camMode||0; flaresLeft=sv.flares||0; PERF2.lvl=sv.lvl||0; selectedId=sv.sel||selectedId; missionId=sv.mis||missionId; saveSettings(); applyQuality(); }catch(e){}
  const rep=ptReport(aborted); PT.rep=rep; ptStore(rep); ptOverlay(false,true);
  try{ if(state==='play'||state==='walk'||state==='paused'||state==='map') enterTitle(); }catch(e){}
  setTimeout(function(){ ptResults(rep); },60); }
/* ---- storage, sending */
function ptStore(rep){ try{ const L=JSON.parse(localStorage.getItem('ayy-perf')||'[]'); L.unshift(rep); localStorage.setItem('ayy-perf',JSON.stringify(L.slice(0,5))); }catch(e){} }
function ptLocal(){ try{ return JSON.parse(localStorage.getItem('ayy-perf')||'[]'); }catch(e){ return []; } }
function ptSend(rep){ const c=(typeof ACCOUNT_CFG!=='undefined'?ACCOUNT_CFG:null)||(typeof ACC!=='undefined'&&ACC.cfg)||null;
  if(!c||!c.url||!c.key) return Promise.reject(new Error('bulut yok'));
  const body={version:rep.v, device:(rep.model||'')+' · '+rep.dev.kind, gpu:rep.dev.gpu, summary:rep.sum, data:rep};
  return fetch(c.url.replace(/\/$/,'')+'/rest/v1/perf_reports',{method:'POST',headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(body)})
    .then(function(r){ if(!r.ok) return r.text().then(function(t){ throw new Error(r.status+' '+t.slice(0,160)); }); return true; }); }
/* ---- UI */
function ptEsc(t){ return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
function ptModal(id,html){ let el=$(id); if(!el&&document.createElement){ el=document.createElement('div'); el.id=id; el.className='modal hidden'; document.body.appendChild(el); MODALS.push(id); } if(!el) return null; el.innerHTML=html; closeModals(); el.classList.remove('hidden'); return el; }
function ptOpen(){ const el=ptModal('ptStartUI','<div class="card wide ptcard"><button class="xbtn" type="button" data-pt="x" aria-label="Kapat">✕</button><h2>Performans testi</h2>'+
  '<p class="sub">Oyun kendi kendine sabit bir rota oynar: yüksek ve alçak uçuş, şehir, İHA üssü, deniz üssü, orman, ardından gölge, efekt, çözünürlük gibi özellikleri tek tek kapatıp ölçer ve kalabalık bir savaş sahnesi çizer. Her cihaz aynı sahneyi gördüğü için sonuçlar karşılaştırılabilir.</p>'+
  '<ul class="ptlist"><li>Yaklaşık <b>2 dakika</b> sürer. Bu sürede ekrana dokunma.</li><li>Telefonda en gerçekçi sonuç için şarjdan çıkar ve oyunu ana ekrandan açılan uygulama olarak çalıştır.</li><li>Test senin şu anki grafik ayarlarınla yapılır; otomatik kalite ve FPS sınırı test süresince kapalıdır, sonra geri gelir.</li><li>Esc ya da duraklat testi durdurur.</li></ul>'+
  '<label class="ptchk"><input type="checkbox" id="ptWarm"> Isınma testini de yap (+5 dakika: cihaz ısınınca yavaşlıyor mu?)</label>'+
  '<div class="btnrow"><button class="btn primary" type="button" data-pt="go">Testi başlat</button><button class="btn" type="button" data-pt="old">Önceki sonuçlar</button></div></div>');
  if(!el) return; el.onclick=function(e){ const b=e.target.closest('[data-pt]'); if(!b) return; const k=b.dataset.pt;
    if(k==='x') el.classList.add('hidden'); if(k==='go'){ const w=$('ptWarm'); el.classList.add('hidden'); ptStart({warm:!!(w&&w.checked)}); } if(k==='old'){ const L=ptLocal(); if(L.length) ptResults(L[0],L); else toast('Bu cihazda kayıtlı test yok','#ffc24a'); } }; }
function ptOverlay(show,hide){ let el=$('ptBar'); if(hide||!PT.run){ if(el) el.classList.add('hidden'); PT.ui=null; return; }
  if(!el&&document.createElement){ el=document.createElement('div'); el.id='ptBar'; el.className='ptbar'; document.body.appendChild(el); el.addEventListener('click',function(e){ if(e.target.closest('[data-pt="stop"]')) ptFinish(true); }); }
  if(!el) return; PT.ui=PT.ui||{}; el.classList.remove('hidden'); const s=PT.steps[PT.si]; const n=PT.steps.length, i=Math.max(0,PT.si);
  const tot=PT.steps.reduce(function(a,x){ return a+x.settle+x.dur; },0), done=PT.steps.slice(0,i).reduce(function(a,x){ return a+x.settle+x.dur; },0)+(s?(PT.phase==='measure'?s.settle:0)+PT.st:0);
  const ring=PT.seg&&PT.seg.ft.length?ptR1(1000/ptMean(PT.seg.ft.slice(-30))):null;
  el.innerHTML='<b>PERFORMANS TESTİ</b><span>'+(i+1)+'/'+n+' · '+ptEsc(s?s.name:'')+(PT.phase==='settle'?' · hazırlanıyor':'')+(ring?' · '+ring+' FPS':'')+'</span><i><em style="width:'+Math.min(100,Math.round(done/tot*100))+'%"></em></i><button type="button" class="btn sm" data-pt="stop">Durdur</button>'; }
function ptBoundTxt(b){ return PT_BOUND[b]||b; }
function ptChart(rep){ const c=document.createElement('canvas'); const W=640, H=120; c.width=W*2; c.height=H*2; c.className='ptchart'; const g=c.getContext&&c.getContext('2d'); if(!g) return c; g.scale(2,2);
  const segs=(rep.scenes||[]).concat(rep.base?[rep.base]:[],rep.stress?[rep.stress]:[]); let all=[]; segs.forEach(function(s){ all=all.concat(s.q||[]); }); if(!all.length) return c;
  const mx=Math.max(50,ptPct(all,99)*1.15); g.fillStyle='rgba(255,255,255,.04)'; g.fillRect(0,0,W,H);
  [16.7,33.3,50].forEach(function(v){ if(v>mx) return; const y=H-v/mx*H; g.strokeStyle=v===50?'rgba(255,107,116,.5)':'rgba(255,255,255,.18)'; g.setLineDash([4,4]); g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); g.setLineDash([]); g.fillStyle='rgba(255,255,255,.55)'; g.font='10px system-ui'; g.fillText(Math.round(1000/v)+' fps',4,y-3); });
  let x=0; const sx=W/all.length; segs.forEach(function(s,si){ const q=s.q||[]; g.strokeStyle=si%2?'#7dd3fc':'#ffd166'; g.lineWidth=1; g.beginPath(); q.forEach(function(v,i){ const X=x+i*sx, Y=H-Math.min(v,mx)/mx*H; if(i) g.lineTo(X,Y); else g.moveTo(X,Y); }); g.stroke();
    g.fillStyle='rgba(255,255,255,.7)'; g.font='9px system-ui'; g.save(); g.translate(x+3,H-4); g.fillText(String(s.name).split(' (')[0].slice(0,14),0,0); g.restore(); x+=q.length*sx; });
  return c; }
function ptResults(rep,list){ const r=rep, d=r.dev||{}, f=function(v){ return v==null?'—':String(v).replace('.',','); };
  const devLine=[d.gpu, d.sw+'×'+d.sh+' · piksel oranı '+f(d.pr)+(d.bw?' ('+d.bw+'×'+d.bh+')':''), (d.cores?d.cores+' çekirdek':'')+(d.mem?' · '+d.mem+' GB':''), (r.refresh?r.refresh+' Hz':''), (d.mobile?'telefon/tablet':'bilgisayar')+(d.standalone?' · uygulama':' · tarayıcı')].filter(Boolean).map(ptEsc).join(' · ');
  const q=r.set||{}; const setLine='Kalite '+(['Düşük','Orta','Yüksek','Ultra'][q.quality]||q.quality)+' · gölge '+(q.shadows===false?'kapalı':q.shadows?'açık':'oto')+' · efekt '+(q.fx==null?'oto':q.fx)+' · derinlik '+(d.logDepth?'logaritmik':'standart'+(q.split===false?'':' + iki katman'));
  const row=function(s){ return '<tr><td>'+ptEsc(s.name)+'</td><td>'+f(s.avg)+'</td><td><b>'+f(s.p90)+'</b></td><td>'+f(s.p99)+'</td><td>'+f(s.slow)+'%</td><td>'+f(s.cpu)+(s.gpu!=null?' / '+f(s.gpu):'')+'</td><td>'+s.calls+'</td><td>'+Math.round(s.tris/1000)+'k</td><td><small>'+ptEsc(ptBoundTxt(s.bound))+'</small></td></tr>'; };
  const sc=(r.scenes||[]).map(row).join('')+(r.stress?row(r.stress):'');
  const ft=(r.feats||[]).map(function(x){ return '<tr><td>'+ptEsc(x.name)+'</td><td>'+(x.gpu!=null?f(x.gpu)+' ms':'—')+'</td><td>'+f(x.ms90)+' ms</td><td>'+f(x.cpu)+' ms</td><td>'+f(x.base90)+' → <b>'+f(x.fps90)+'</b></td><td>'+(x.calls>0?'−'+x.calls:'')+'</td></tr>'; }).join('');
  const html='<div class="card wide ptcard"><button class="xbtn" type="button" data-pt="x" aria-label="Kapat">✕</button><h2>Performans testi sonucu'+(r.aborted?' <small class="ptwarn">(yarıda kaldı)</small>':'')+'</h2>'+
    '<p class="ptdev">'+devLine+'<br><small>'+ptEsc(setLine)+' · '+ptEsc(r.v)+' · '+new Date(r.at).toLocaleString('tr-TR')+'</small></p>'+
    '<div class="ptsum"><div><b>'+f(r.sum.avg)+'</b><small>ortalama FPS</small></div><div><b>'+f(r.sum.p90)+'</b><small>en zayıf sahnede P90<br>'+ptEsc(r.sum.worst)+'</small></div><div><b>'+f(r.sum.slow)+'%</b><small>20 FPS altı kare</small></div><div><b class="t">'+ptEsc(ptBoundTxt(r.sum.bound))+'</b><small>darboğaz</small></div></div>'+
    '<div class="ptscroll">'+
    '<ul class="pttips">'+(r.tips||[]).map(function(t){ return '<li>'+ptEsc(t)+'</li>'; }).join('')+'</ul>'+
    '<h3>Sahneler</h3><div class="pttbl"><table><thead><tr><th>Sahne</th><th>Ort.</th><th>P90</th><th>P99</th><th>Yavaş</th><th>İşlemci / GPU ms</th><th>Çizim</th><th>Üçgen</th><th>Sınır</th></tr></thead><tbody>'+sc+'</tbody></table></div>'+
    (ft?'<h3>Özellik maliyetleri <small>(aynı uçuş rotası; kapatınca kazanılan süre)</small></h3><div class="pttbl"><table><thead><tr><th>Kapatılan</th><th>GPU</th><th>Kare (P90)</th><th>İşlemci</th><th>P90 FPS</th><th>Çizim</th></tr></thead><tbody>'+ft+'</tbody></table></div>':'')+
    '<h3>Kare süreleri</h3><div class="ptch" id="ptCh"></div>'+
    '<p class="ptmeta">'+(r.fx&&r.fx.length?'İlk efekt takılması: '+r.fx.map(function(x){ return x.k+' '+f(x.spike)+' ms'; }).join(', ')+' · ':'')+'Bellek: JS '+f(r.mem.heapMB)+' MB · doku ~'+f(r.mem.tex.mb)+' MB ('+r.mem.tex.n+') · geometri '+r.mem.geo+' · shader '+r.mem.prog+(d.gpuTimer?'':' · GPU süresi bu tarayıcıda ölçülemiyor')+'</p>'+
    (r.warm&&r.warm.length?'<p class="ptmeta">Isınma (P90, 30 sn aralıklar): '+r.warm.map(function(w){ return f(w.p90); }).join(' → ')+'</p>':'')+
    '<div class="ptsend"><input class="inp" id="ptModel" maxlength="60" placeholder="Cihaz modeli (ör. Samsung A54, Lenovo dizüstü)" value="'+ptEsc(r.model)+'"><input class="inp" id="ptNote" maxlength="200" placeholder="Not (isteğe bağlı)" value="'+ptEsc(r.note)+'"></div>'+
    '<p class="ptpriv">Rapor anonimdir: cihaz ve ekran kartı bilgisi, grafik ayarları ve ölçümler. Ad, e-posta ya da hesap bilgisi içermez.</p>'+
    '</div>'+
    '<div class="btnrow"><button class="btn primary" type="button" data-pt="send">Raporu gönder</button><button class="btn" type="button" data-pt="copy">Kopyala</button>'+(list&&list.length>1?'<button class="btn" type="button" data-pt="prev">Önceki test</button>':'')+'<button class="btn" type="button" data-pt="again">Yeniden test et</button></div><p class="accmsg" id="ptMsg"></p></div>';
  const el=ptModal('ptResUI',html); if(!el) return; const ch=$('ptCh'); if(ch) ch.appendChild(ptChart(r));
  const msg=function(t,bad){ const m=$('ptMsg'); if(m){ m.textContent=t; m.classList.toggle('err',!!bad); } };
  const meta=function(){ r.model=(($('ptModel')||{}).value||'').trim(); r.note=(($('ptNote')||{}).value||'').trim(); };
  el.onclick=function(e){ const b=e.target.closest('[data-pt]'); if(!b) return; const k=b.dataset.pt;
    if(k==='x'){ el.classList.add('hidden'); if(state==='menu'&&typeof refreshTitle==='function') refreshTitle(); }
    if(k==='copy'){ meta(); const t=JSON.stringify(r); const done=function(){ msg('Rapor panoya kopyalandı ('+Math.round(t.length/1024)+' KB). Sohbete yapıştırabilirsin.'); };
      try{ navigator.clipboard.writeText(t).then(done,function(){ ptCopyFallback(t); done(); }); }catch(_){ ptCopyFallback(t); done(); } }
    if(k==='send'){ meta(); b.disabled=true; msg('Gönderiliyor…'); ptSend(r).then(function(){ r.sent=true; msg('Rapor gönderildi. Teşekkürler!'); try{ const L=ptLocal(); if(L[0]&&L[0].at===r.at){ L[0]=r; localStorage.setItem('ayy-perf',JSON.stringify(L)); } }catch(_){} })
      .catch(function(err){ b.disabled=false; msg('Gönderilemedi ('+String(err.message||err).slice(0,90)+'). Rapor bu cihazda saklandı; "Kopyala" ile paylaşabilirsin.',true); }); }
    if(k==='prev'){ const i=list.indexOf(rep); ptResults(list[(i+1)%list.length],list); }
    if(k==='again'){ el.classList.add('hidden'); ptOpen(); } }; }
function ptCopyFallback(t){ try{ const a=document.createElement('textarea'); a.value=t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }catch(e){} }
/* ---- settings row, admin tab */
(function(){ const b=$('btnPerfTest'); if(b) b.addEventListener('click',ptOpen); })();
(function(){ const tabs=$('admTabs'); if(!tabs||!document.createElement||tabs.querySelector('[data-t="perf"]')) return;
  const b=document.createElement('button'); b.type='button'; b.dataset.t='perf'; b.textContent='Performans'; tabs.insertBefore(b,tabs.lastChild);
  const sec=document.createElement('section'); sec.className='admsec hidden'; sec.dataset.t='perf'; sec.innerHTML='<p class="ninfo">Oyuncuların gönderdiği performans testi raporları (en yeni 100). Bulut tablosu yoksa yalnız bu cihazdaki testler görünür: supabase/perf_reports.sql dosyasını Supabase SQL düzenleyicisinde bir kez çalıştır.</p><div class="admtbl"><table><thead><tr><th>Zaman</th><th>Cihaz</th><th>Ekran kartı</th><th>Ort.</th><th>P90</th><th>Darboğaz</th><th>Sürüm</th></tr></thead><tbody id="admPerf"></tbody></table></div>';
  const wrap=tabs.parentNode; if(wrap) wrap.appendChild(sec);
  sec.addEventListener('click',function(e){ const tr=e.target.closest('tr[data-i]'); if(!tr) return; const r=(PT.reports||[])[+tr.dataset.i]; if(r) ptResults(r,PT.reports); }); })();
function ptAdmRender(L,src){ PT.reports=L; const el=$('admPerf'); if(!el) return; const f=function(v){ return v==null?'—':String(v).replace('.',','); };
  el.innerHTML=L.map(function(r,i){ const s=r.sum||{}, d=r.dev||{}; return '<tr data-i="'+i+'" class="ptrow"><td>'+new Date(r.at).toLocaleString('tr-TR')+'</td><td>'+ptEsc(r.model||d.kind||'')+(src==='yerel'?' <small>(bu cihaz)</small>':'')+'</td><td><small>'+ptEsc(String(d.gpu||'').slice(0,48))+'</small></td><td>'+f(s.avg)+'</td><td>'+f(s.p90)+'</td><td><small>'+ptEsc(ptBoundTxt(s.bound))+'</small></td><td>'+ptEsc(r.v)+'</td></tr>'; }).join('')||'<tr><td colspan="7">Rapor yok</td></tr>'; }
if(typeof admLoad==='function'){ const _ptAdm=admLoad; admLoad=function(t){ if(t!=='perf') return _ptAdm(t); try{ $('admNoCloud').classList.add('hidden'); }catch(e){}
  const local=ptLocal(); const cloud=!!(typeof ACC!=='undefined'&&ACC.sb&&ACC.user);
  if(!cloud){ ptAdmRender(local,'yerel'); return Promise.resolve(); }
  return ACC.sb.from('perf_reports').select('data,created_at').order('created_at',{ascending:false}).limit(100).then(function(r){ if(r.error){ ptAdmRender(local,'yerel'); admMsg('Bulut raporları okunamadı: '+r.error.message+' (supabase/perf_reports.sql çalıştırıldı mı?)',true); return; }
    ptAdmRender((r.data||[]).map(function(x){ return x.data; }).filter(Boolean),'bulut'); }); }; }
/* ---- live FPS display: frame time line and P90 (Ayarlar → Grafik → FPS göstergesi) */
function ptLive(){ const el=$('fps'); if(!el||!SETTINGS.fps) return; const n=PT.ring.length, L=[]; for(let i=0;i<n;i++){ const v=PT.ring[(PT.ri+i)%n]; if(v>0) L.push(v); } if(!L.length) return;
  const p90=ptPct(L.slice(-120),90);
  el.textContent=Math.round(PERF.fps)+' FPS · P90 '+Math.round(1000/p90)+' ('+ptR1(p90).toString().replace('.',',')+' ms) · '+(PERF2.calls||0)+' çizim · '+Math.round((PERF2.tris||0)/1000)+'k üçgen · '+Math.round(renderer.getPixelRatio()*100)/100+'x'+(PERF2.lvl?' · hafif '+PERF2.lvl:'')+(PERF2.split?' · derinlik 2 kat':'');
  let c=$('fpsGraph'); if(!c&&document.createElement){ c=document.createElement('canvas'); c.id='fpsGraph'; c.className='fpsgraph'; c.width=240; c.height=48; }
  if(!c||!c.getContext) return; el.appendChild(c); const g=c.getContext('2d'); g.clearRect(0,0,240,48); const mx=50;
  g.fillStyle='rgba(4,9,18,.6)'; g.fillRect(0,0,240,48); g.strokeStyle='rgba(255,255,255,.25)'; g.beginPath(); const y60=48-16.7/mx*48; g.moveTo(0,y60); g.lineTo(240,y60); g.stroke();
  const M=L.slice(-120); g.strokeStyle='#7dffb0'; g.beginPath(); M.forEach(function(v,i){ const x=i*2, y=48-Math.min(v,mx)/mx*48; if(i) g.lineTo(x,y); else g.moveTo(x,y); }); g.stroke();
  M.forEach(function(v,i){ if(v>50){ g.fillStyle='#ff6b74'; g.fillRect(i*2,0,2,48); } }); }
const _ptPS=perfStep; perfStep=function(dt){ const n0=PERF.n; _ptPS(dt); PT.lt=(PT.lt||0)+dt; if(PT.lt>=0.5||(PERF.n===0&&n0>0)){ PT.lt=0; try{ ptLive(); }catch(e){} } };   /* also right after the 1 s text update in 98d, so the line is never wiped */
