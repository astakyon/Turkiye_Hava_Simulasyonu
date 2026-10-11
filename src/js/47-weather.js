/* ------------------------------------------------------------------ weather (V1.74)
   SETTINGS.wx: clear / cloudy / rain / storm / snow / fog / auto (changes every few minutes).
   Parameters blend smoothly: rain, snow, fog, darkness, wind (m/s, direction), turbulence, lightning.
   Rain streaks / snow flakes live in a box around the camera; fog, sky and light are pulled towards grey on top of the
   time of day; wind drifts aircraft and helicopters, turbulence shakes them; storms flash and thunder.
   NVG / FLIR (") : night-vision green and thermal white-hot / black-hot through a canvas filter. */
SETTINGS.wx=SETTINGS.wx||'clear'; if(typeof SETTINGS_DEF!=='undefined') SETTINGS_DEF.wx='clear';
const WX_P={
  clear: {rain:0,snow:0,fog:0,dark:0,wind:4,turb:0.05,storm:0,n:'Açık'},
  cloudy:{rain:0,snow:0,fog:0.25,dark:0.25,wind:7,turb:0.2,storm:0,n:'Bulutlu'},
  rain:  {rain:0.75,snow:0,fog:0.5,dark:0.45,wind:9,turb:0.35,storm:0,n:'Yağmurlu'},
  storm: {rain:1,snow:0,fog:0.65,dark:0.7,wind:17,turb:0.9,storm:1,n:'Fırtınalı'},
  snow:  {rain:0,snow:0.85,fog:0.55,dark:0.35,wind:6,turb:0.25,storm:0,n:'Karlı'},
  fog:   {rain:0,snow:0,fog:1,dark:0.3,wind:2,turb:0.05,storm:0,n:'Sisli'}};
const WX={cur:{rain:0,snow:0,fog:0,dark:0,wind:4,turb:0.05,storm:0}, kind:'clear', dir:270, autoT:0, pts:null, lines:null, N:0, flash:0, nextBolt:8, thunder:[], snd:null, vis:'off', last:-1};
function wxKind(){ const k=SETTINGS.wx||'clear'; return k==='auto'?WX.kind:k; }
function wxTarget(){ return WX_P[wxKind()]||WX_P.clear; }
function wxSet(k){ SETTINGS.wx=k; if(typeof saveSettings==='function') saveSettings(); if(k==='auto'){ WX.autoT=0; } else WX.kind=k; }
/* ---- precipitation */
function wxBuild(){
  const N=DEV.mobile?1200:3600; WX.N=N;
  const lp=new Float32Array(N*6), lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.BufferAttribute(lp,3));
  WX.lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xe6eef7,transparent:true,opacity:0.7,depthWrite:false,fog:false})); WX.lines.frustumCulled=false; WX.lines.userData.noCull=true; WX.lines.visible=false; scene.add(WX.lines);
  const sp=new Float32Array(N*3), sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const fc=document.createElement('canvas'); fc.width=fc.height=32; const fx=fc.getContext('2d'); if(fx){ const gr=fx.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.5,'rgba(255,255,255,.8)'); gr.addColorStop(1,'rgba(255,255,255,0)'); fx.fillStyle=gr; fx.fillRect(0,0,32,32); }
  WX.pts=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:DEV.mobile?0.3:0.24,map:fx?new THREE.CanvasTexture(fc):null,transparent:true,opacity:0.95,depthWrite:false})); WX.pts.frustumCulled=false; WX.pts.userData.noCull=true; WX.pts.visible=false; scene.add(WX.pts);
  WX.d=new Float32Array(N*3); for(let i=0;i<N;i++){ WX.d[i*3]=(Math.random()-0.5)*60; WX.d[i*3+1]=(Math.random()-0.5)*40; WX.d[i*3+2]=(Math.random()-0.5)*60; }
}
function wxPrecip(dt){
  const c=WX.cur, rain=c.rain, snow=c.snow; if(!WX.lines) wxBuild();
  const under=camera.position.y>Math.max(groundH(camera.position.x,camera.position.z),0)+1600;   /* above the cloud deck: no precipitation */
  WX.rainOn=rain>0.02&&!under; WX.snowOn=snow>0.02&&!under; WX.lines.visible=WX.rainOn; WX.pts.visible=WX.snowOn;
  if(!WX.rainOn&&!WX.snowOn) return;
  const cp=camera.position, wr=WX.dir*Math.PI/180, wx=-Math.sin(wr)*c.wind, wz=-Math.cos(wr)*c.wind, D=WX.d, N=WX.N;
  const nR=Math.floor(N*rain*(state==='play'&&mv>60?0.5:1)), nS=Math.floor(N*snow), fall=rain>0?24:2.2, mv=(state==='play'?S.speed:0), fv=new THREE.Vector3(); if(state==='play') fwdOf(S.q,fv);
  /* rain: streaks stretched along the relative wind (fast flight → near horizontal) */
  if(WX.rainOn){ const P=WX.lines.geometry.attributes.position.array;
    const rx=wx-fv.x*mv, ry=-fall-fv.y*mv, rz=wz-fv.z*mv, rl=Math.hypot(rx,ry,rz)||1, L=Math.min(state==='play'?3.2:6,1.6+rl*0.02);
    for(let i=0;i<N;i++){ const o=i*3; if(i>=nR){ P[i*6+1]=P[i*6+4]=-1e5; continue; }
      D[o]+=wx*dt; D[o+1]-=fall*dt; D[o+2]+=wz*dt;
      if(D[o+1]<-20) D[o+1]+=40; if(D[o]>30) D[o]-=60; else if(D[o]<-30) D[o]+=60; if(D[o+2]>30) D[o+2]-=60; else if(D[o+2]<-30) D[o+2]+=60;
      const x=cp.x+D[o], y=cp.y+D[o+1], z=cp.z+D[o+2]; P[i*6]=x; P[i*6+1]=y; P[i*6+2]=z; P[i*6+3]=x-rx/rl*L; P[i*6+4]=y-ry/rl*L; P[i*6+5]=z-rz/rl*L; }
    WX.lines.geometry.attributes.position.needsUpdate=true; WX.lines.material.opacity=0.35+0.45*rain*(1-(TOD.nightK||0)*0.5); }
  if(WX.snowOn){ const P=WX.pts.geometry.attributes.position.array;
    for(let i=0;i<N;i++){ const o=i*3; if(i>=nS){ P[o+1]=-1e5; continue; } D[o]+=(wx*0.6+Math.sin(T*0.7+i)*0.6)*dt; D[o+1]-=fall*dt; D[o+2]+=(wz*0.6+Math.cos(T*0.6+i*1.3)*0.6)*dt;
      if(D[o+1]<-20) D[o+1]+=40; if(D[o]>30) D[o]-=60; else if(D[o]<-30) D[o]+=60; if(D[o+2]>30) D[o+2]-=60; else if(D[o+2]<-30) D[o+2]+=60;
      P[o]=cp.x+D[o]; P[o+1]=cp.y+D[o+1]; P[o+2]=cp.z+D[o+2]; }
    WX.pts.geometry.attributes.position.needsUpdate=true; }
}
/* ---- sky, fog and light on top of the time of day */
const wxGrey=new THREE.Color(), wxTmp=new THREE.Color();
const _wxTod=todApply; todApply=function(h){ _wxTod(h); wxTint(); };
function wxTint(){
  const c=WX.cur, d=c.dark, f=c.fog; if(d<0.01&&f<0.01&&WX.flash<=0) return;
  const nk=TOD.nightK||0, gl=0.66-d*0.32; wxGrey.setRGB(gl,gl*1.04,gl*1.1).multiplyScalar(1-nk*0.8); if(c.snow>0.2) wxGrey.lerp(wxTmp.setRGB(0.82,0.84,0.88).multiplyScalar(1-nk*0.8),c.snow*0.6);
  const u=sky.material.uniforms, sk=Math.max(d*1.1,f*0.92); u.top.value.lerp(wxGrey,Math.min(1,sk)); u.mid.value.lerp(wxGrey,Math.min(1,Math.max(d*1.05,f))); u.hor.value.lerp(wxGrey,Math.min(1,Math.max(d,f))); u.sunK.value*=1-Math.max(d,f)*0.9;
  scene.fog.color.lerp(wxGrey,Math.max(d,f)*0.9); scene.fog.near=Math.max(30,scene.fog.near*(1-f*0.97)); scene.fog.far=Math.max(scene.fog.near+400,scene.fog.far*(1-f*0.93));
  sunLight.intensity*=1-Math.max(d,f*0.6)*0.75; HEMI.intensity*=1-d*0.4;
  if(GFX.clouds) GFX.clouds.material.color.lerp(wxTmp.setRGB(0.45,0.47,0.5).multiplyScalar(1-nk*0.7),d*0.85);
  if(WX.flash>0){ const k=Math.min(1,WX.flash*4); HEMI.intensity+=k*1.4; u.top.value.lerp(wxTmp.setRGB(0.85,0.88,1),k*0.6); u.mid.value.lerp(wxTmp,k*0.6); }
}
function wxRetint(){ TOD.last=-1; todApply(todHour()); }
/* ---- lightning and thunder */
function wxThunder(dist){ if(!AC||muted||!noiseBuf) return; const t=AC.currentTime+dist/340, s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=dist<1500?420:180; const g=AC.createGain();
  const v=Math.min(0.5,0.9/(1+dist/1200)); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+0.05); g.gain.setTargetAtTime(v*0.6,t+0.3,0.4); g.gain.setTargetAtTime(0,t+1.2,0.9);
  s.connect(f); f.connect(g); g.connect(sndOut('amb')); s.start(t); s.stop(t+5); }
function wxBolt(){ const cp=camera.position, a=Math.random()*6.283, r=600+Math.random()*4000, x=cp.x+Math.cos(a)*r, z=cp.z+Math.sin(a)*r, gy=Math.max(groundH(x,z),0);
  const pts=[]; let px=x, pz=z; for(let y=gy+1700;y>gy;y-=110){ pts.push(new THREE.Vector3(px,y,pz)); px+=(Math.random()-0.5)*90; pz+=(Math.random()-0.5)*90; } pts.push(new THREE.Vector3(px,gy,pz));
  const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xeef3ff,fog:false})); m.frustumCulled=false; m.userData.noCull=true; scene.add(m); setTimeout(function(){ scene.remove(m); m.geometry.dispose(); },140);
  WX.flash=0.35; wxThunder(r); }
/* ---- audio: rain hiss */
function wxAudio(){ if(!AC||!noiseBuf) return; if(!WX.snd){ try{ const s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=2400; f.Q.value=0.4; const g=AC.createGain(); g.gain.value=0; s.connect(f); f.connect(g); g.connect(sndOut('amb')); s.start(); WX.snd={g:g,f:f}; }catch(e){ WX.snd={g:null}; } }
  if(!WX.snd.g) return; const quiet=muted||state==='menu'||state==='library', alt=Math.max(0,camera.position.y-groundH(camera.position.x,camera.position.z));
  WX.snd.g.gain.setTargetAtTime(quiet?0:WX.cur.rain*0.09*Math.max(0.15,1-alt/1500)*(state==='play'?0.55:1),AC.currentTime,0.4); }
/* ---- wind and turbulence */
function wxVec(out){ const wr=WX.dir*Math.PI/180; out.x=-Math.sin(wr)*WX.cur.wind; out.z=-Math.cos(wr)*WX.cur.wind; return out; }
const wxW={x:0,z:0}, wxQ=new THREE.Quaternion(), wxE=new THREE.Euler();
function wxGust(){ return 0.75+0.25*Math.sin(T*0.37)+0.18*Math.sin(T*1.31+1)+WX.cur.storm*0.25*Math.sin(T*2.9); }
function wxAir(dt){ if(S.crashed||S.onGround) return; wxVec(wxW); const g=wxGust(); S.pos.x+=wxW.x*g*dt; S.pos.z+=wxW.z*g*dt;
  const tb=WX.cur.turb*Math.min(1,S.speed/120)*(S.pos.y-Math.max(terrainH(S.pos.x,S.pos.z),0)<800?1:0.55); if(tb<0.01) return;
  const n1=Math.sin(T*3.1)+Math.sin(T*7.3+2)*0.6+Math.sin(T*13.7)*0.3, n2=Math.sin(T*2.7+1)+Math.sin(T*8.9)*0.5, n3=Math.sin(T*4.3+3)*0.7+Math.sin(T*11.1)*0.4;
  wxE.set(n1*tb*0.12*dt,n3*tb*0.04*dt,n2*tb*0.18*dt,'YXZ'); wxQ.setFromEuler(wxE); S.q.multiply(wxQ).normalize(); S.pos.y+=(n2+n3)*tb*0.9*dt; }
function wxHeli(dt){ const H=HELI.cur; if(!H||H.ground||H.crashT>0) return; wxVec(wxW); const g=wxGust(); H.x+=wxW.x*g*0.7*dt; H.z+=wxW.z*g*0.7*dt;
  const tb=WX.cur.turb; if(tb>0.02){ H.roll+=Math.sin(T*5.3)*tb*0.05*dt*10; H.pitch+=Math.sin(T*4.1+1)*tb*0.04*dt*10; H.y+=Math.sin(T*3.7)*tb*0.6*dt; } }
const _wxUpd=update; update=function(dt){ _wxUpd(dt); if(state==='play'&&!(typeof EJ!=='undefined'&&EJ.on)) wxAir(dt); };
const _wxHeli=heliStep; heliStep=function(dt){ _wxHeli(dt); wxHeli(dt); };
/* radio wind call follows the weather */
windTxt=function(){ const k=Math.round(WX.cur.wind*1.944*wxGust()); return String(Math.round(WX.dir/10)*10||360).padStart(3,'0')+' derece, '+k+' knot'; };
/* ---- per frame */
const WX_AUTO=['clear','clear','cloudy','cloudy','rain','storm','fog','snow'];
function wxStep(dt){
  if((SETTINGS.wx||'clear')==='auto'){ WX.autoT-=dt; if(WX.autoT<=0){ WX.autoT=240+Math.random()*240; const k=WX_AUTO[Math.floor(Math.random()*WX_AUTO.length)]; if(k!==WX.kind){ WX.kind=k; if(state==='play'||state==='walk') toast('Hava değişiyor: '+WX_P[k].n,'#b8ecff'); } WX.dir=(WX.dir+(Math.random()-0.5)*90+360)%360; } }
  const tg=wxTarget(), c=WX.cur, k=Math.min(1,dt/(state==='menu'?0.5:6)); let ch=0;
  ['rain','snow','fog','dark','wind','turb','storm'].forEach(function(p){ const d=(tg[p]-c[p])*k; if(Math.abs(d)>1e-5){ c[p]+=d; ch+=Math.abs(d); } });
  if(ch>0.0005||WX.flash>0||WX.last<0){ WX.last=1; wxRetint(); }
  if(WX.flash>0){ WX.flash-=dt; if(WX.flash<=0) wxRetint(); }
  if(c.storm>0.5&&state!=='menu'){ WX.nextBolt-=dt; if(WX.nextBolt<=0){ WX.nextBolt=4+Math.random()*12; wxBolt(); } }
  wxPrecip(dt); wxAudio(); visStep();
}
/* ---- NVG / FLIR */
const VIS_MODES=['off','nvg','flir','flirb'], VIS_N={off:'Normal görüş',nvg:'Gece görüş (NVG)',flir:'Termal · beyaz sıcak',flirb:'Termal · siyah sıcak'};
function visCycle(){ const i=VIS_MODES.indexOf(WX.vis); WX.vis=VIS_MODES[(i+1)%VIS_MODES.length]; toast('👁 '+VIS_N[WX.vis],'#b8ecff'); visApply(); }
function visApply(){ const el=$('gl'), ov=$('visOv'); const m=(state==='play'||state==='walk'||state==='paused'||state==='map')?WX.vis:'off';
  const night=TOD.nightK||0, b=(1.3+night*2.2).toFixed(2);
  const f=m==='nvg'?'grayscale(1) brightness('+b+') contrast(1.35) sepia(1) hue-rotate(58deg) saturate(4)':m==='flir'?'grayscale(1) contrast(1.55) brightness(0.92)':m==='flirb'?'grayscale(1) invert(1) contrast(1.55) brightness(1.05)':'';
  if(el&&el.style) el.style.filter=f; if(ov){ ov.className='visov '+m; ov.classList.toggle('hidden',m==='off'); } WX.visOn=m; }
function visStep(){ const m=(state==='play'||state==='walk'||state==='paused'||state==='map')?WX.vis:'off'; if(m!==WX.visOn||(m==='nvg'&&Math.abs((TOD.nightK||0)-(WX.visNk||0))>0.05)){ WX.visNk=TOD.nightK||0; visApply(); } }
window.addEventListener('keydown',function(e){ if(e.repeat||(state!=='play'&&state!=='walk')||(typeof anyModalOpen==='function'&&anyModalOpen())) return; if(isKey(e,'gen','vision')){ e.preventDefault(); visCycle(); } });
(function(){ const b=$('tVis'); if(b) b.addEventListener('pointerdown',function(e){ e.preventDefault(); visCycle(); }); const w=$('wVis'); if(w) w.addEventListener('pointerdown',function(e){ e.preventDefault(); visCycle(); });
  const s=$('setWx'); if(s) s.addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; wxSet(b.dataset.w); syncSettingsUI(); }); })();
const _wxSync=syncSettingsUI; syncSettingsUI=function(){ _wxSync(); const s=$('setWx'); if(s) Array.prototype.forEach.call(s.children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.w===(SETTINGS.wx||'clear'))); }); };
/* HUD: wind line under the fuel gauge (flight) */
const _wxHealth=hudHealth; hudHealth=function(x,y){ _wxHealth(x,y); if(WX.cur.wind<5&&WX.cur.turb<0.2&&WX.vis==='off') return;
  const k=Math.round(WX.cur.wind*1.944*wxGust()), by=y+10*sc+13*sc+24*sc+7*sc+26*sc;
  tx('RÜZGÂR '+String(Math.round(WX.dir/10)*10||360).padStart(3,'0')+'° / '+k+' kt'+(WX.cur.turb>0.3?' · TÜRBÜLANS':'')+(WX.vis!=='off'?' · '+(WX.vis==='nvg'?'NVG':'FLIR'):''),x,TOUCH.vis?by:by+(typeof S!=='undefined'&&(S.efire>0||S.leak>0||S.eng>0||S.wingL>0||S.wingR>0||S.fuel<0.2)?80*sc:0),11,'left',CD); };
