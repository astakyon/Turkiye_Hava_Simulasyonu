/* ------------------------------------------------------------------ time of day (SETTINGS.tod: dawn / day / dusk / night / cycle)
   Moves the sun, recolours sky, fog, lights, water and clouds, shows stars and a moon at night, lights windows and
   beacons after dark; plus ambient sound (surf near the shore, wind, gulls, crickets at night). */
const TOD={h:13, last:-1, stars:null, moon:null, sun0:SUN.clone(), presets:{dawn:6.4, day:13, dusk:17.6, night:23.2}};
const TODC={
  day:  {sun:0xfff0d6, si:1.25, hs:0xc4e0ff, hg:0x56653f, hi:0.72, top:0x2c68a8, mid:0x87b6de, hor:0xc2d8e8, fog:0xcfe0ec, water:0x2a7aa8, cloud:0xffffff},
  gold: {sun:0xffb36a, si:1.05, hs:0xffd6b0, hg:0x4a4436, hi:0.52, top:0x3a5c96, mid:0xe7a477, hor:0xf3c08e, fog:0xe7c3a2, water:0x3a6e8e, cloud:0xffd2b4},
  night:{sun:0x9fb4ff, si:0.22, hs:0x34477a, hg:0x0e1218, hi:0.26, top:0x040a18, mid:0x0a1730, hor:0x17263f, fog:0x0f1828, water:0x0d2236, cloud:0x3a4558}
};
const _ca=new THREE.Color(), _cb=new THREE.Color();
function todMix(k,a,b,t){ return _ca.setHex(TODC[a][k]).lerp(_cb.setHex(TODC[b][k]),t); }
function todHour(){ const m=SETTINGS.tod||'day'; return m==='cycle'?TOD.h:TOD.presets[m]; }
function todReset(){ if((SETTINGS.tod||'day')!=='cycle') TOD.h=todHour(); TOD.last=-1; todApply(todHour()); }
function todBuild(){
  const n=1600, p=new Float32Array(n*3), r=mulberry32(77); for(let i=0;i<n;i++){ const a=r()*Math.PI*2, z=0.05+r()*0.95, s=Math.sqrt(1-z*z); p[i*3]=Math.cos(a)*s*30000; p[i*3+1]=z*30000; p[i*3+2]=Math.sin(a)*s*30000; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3));
  TOD.stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2.2,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false})); TOD.stars.frustumCulled=false; scene.add(TOD.stars);
  TOD.moon=new THREE.Mesh(new THREE.CircleGeometry(520,32),new THREE.MeshBasicMaterial({color:0xf2f0e6,fog:false,transparent:true,opacity:0})); TOD.moon.material.userData.glow=1.2; scene.add(TOD.moon);
  todReset();
}
/* h: hour 0..24 */
function todApply(h){
  const day=(SETTINGS.tod||'day')==='day';
  const az=Math.PI*(h-6)/12, el=Math.sin(Math.PI*(h-6)/12)*1.1, se=Math.sin(Math.max(-0.6,Math.min(1.2,el)));
  if(day) SUN.copy(TOD.sun0); else SUN.set(Math.cos(az)*Math.cos(el),Math.sin(el),-0.55*Math.cos(el)-0.25).normalize();
  const dayK=day?1:smooth(0.12,0.5,se), nightK=day?0:1-smooth(-0.22,0.02,se);
  const pick=function(k){ if(nightK>0) return todMix(k,'gold','night',nightK); return todMix(k,'gold','day',dayK); };
  const moonDir=new THREE.Vector3(-0.45,0.62,0.55).normalize();
  sunLight.color.copy(pick('sun')); sunLight.intensity=nightK>0?TODC.gold.si*(1-nightK)+TODC.night.si*nightK:TODC.gold.si+(TODC.day.si-TODC.gold.si)*dayK;
  HEMI.color.copy(pick('hs')); HEMI.groundColor.copy(pick('hg')); HEMI.intensity=nightK>0?TODC.gold.hi*(1-nightK)+TODC.night.hi*nightK:TODC.gold.hi+(TODC.day.hi-TODC.gold.hi)*dayK;
  if(nightK>0.5) SUN.copy(moonDir);                                     /* light (and shadows) come from the moon after dark */
  const u=sky.material.uniforms; u.top.value.copy(pick('top')); u.mid.value.copy(pick('mid')); u.hor.value.copy(pick('hor')); u.sunK.value=nightK>0.5?0.15:1;
  scene.fog.color.copy(pick('fog')); const mist=day?0:smooth(5,6.5,h)*(1-smooth(8,9.5,h)); scene.fog.near=3800-2600*mist; scene.fog.far=26000-13000*mist;
  if(GFX.water) GFX.water.material.color.copy(pick('water'));
  if(GFX.clouds) GFX.clouds.material.color.copy(pick('cloud'));
  if(TOD.stars){ TOD.stars.material.opacity=nightK*0.9; TOD.moon.material.opacity=nightK; TOD.moon.position.copy(moonDir).multiplyScalar(29000); TOD.moon.lookAt(0,0,0); }
  /* lights after dark: windows, beacons */
  const lit=smooth(0.25,0.85,nightK+(1-dayK)*0.35);
  NIGHTMATS.forEach(function(e){ e[0].emissive.setScalar(lit*e[1]); });
  if(ENV.winMat){ ENV.winMat.emissive.setRGB(lit*0.9,lit*0.72,lit*0.4); }
  const M=apMats(); if(M.win&&M.win.emissive) M.win.emissive.setRGB(lit*0.6,lit*0.5,lit*0.3); if(M.glass&&M.glass.emissive) M.glass.emissive.setRGB(lit*0.25,lit*0.25,lit*0.2);
  if(ENV.beacon) ENV.beacon.material.opacity=0.12+0.3*lit;
  TOD.lit=lit; TOD.nightK=nightK;
}
function todStep(dt){
  if(!TOD.stars) return; const m=SETTINGS.tod||'day';
  if(m==='cycle'){ TOD.h=(TOD.h+dt*24/1200)%24; if(Math.abs(TOD.h-TOD.last)>0.02){ TOD.last=TOD.h; todApply(TOD.h); } }
  if(TOD.stars) TOD.stars.position.copy(camera.position);
  if(TOD.moon&&TOD.nightK>0){ if(!TOD.moonFar) TOD.moonFar=new THREE.Vector3(-0.45,0.62,0.55).normalize().multiplyScalar(29000); TOD.moon.position.copy(TOD.moonFar).add(camera.position);   /* V2.24: no new vector per frame */ TOD.moon.lookAt(camera.position); }
  ambStep(dt);
}
/* ---- ambient sound: surf, wind, gull calls, crickets; generated with WebAudio from the shared noise buffer */
const AMBS={on:false, gullT:3, crT:1};
function ambInit(){
  if(AMBS.on||!AC||!noiseBuf) return; AMBS.on=true;
  const mk=function(type,f,q){ const s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const fl=AC.createBiquadFilter(); fl.type=type; fl.frequency.value=f; if(q) fl.Q.value=q; const g=AC.createGain(); g.gain.value=0; s.connect(fl); fl.connect(g); g.connect(sndOut('amb')); s.start(0,Math.random()*1.5); return {g:g,f:fl}; };
  AMBS.surf=mk('lowpass',520); AMBS.wind=mk('bandpass',700,0.6);
}
function chirp(f0,f1,dur,vol,type){ if(!AC||muted) return; const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime; o.type=type||'sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(sndOut('amb')); o.start(t); o.stop(t+dur+0.05); }
function ambStep(dt){
  if(!AC) return; ambInit(); if(!AMBS.on) return;
  const c=camera.position, t=AC.currentTime, quiet=muted||state==='menu'||state==='library';
  let sea=0; if(c.y<160){ const R=[0,120,-120]; for(let i=0;i<3;i++) for(let j=0;j<3;j++){ if(terrainH(c.x+R[i],c.z+R[j])<0) sea++; } }
  const shore=sea>0&&sea<9?1:(sea===9?0.35:0), alt=Math.max(0,c.y-groundH(c.x,c.z));
  const surf=quiet?0:shore*Math.max(0,1-alt/160)*0.16*(0.75+0.25*Math.sin(t*0.6)+0.15*Math.sin(t*1.7));
  AMBS.surf.g.gain.setTargetAtTime(sndLoop('surf',surf*3,1)?0:surf*sndVol('surf'),t,0.3);
  const wind=quiet?0:(state==='walk'?0.03:0.02)+Math.min(0.06,alt/4000);
  AMBS.wind.g.gain.setTargetAtTime(sndLoop('wind',wind*5,0.8+alt/6000)?0:wind*sndVol('wind'),t,0.5); AMBS.wind.f.frequency.setTargetAtTime(500+Math.sin(t*0.13)*200+alt*0.1,t,0.5);
  if(quiet) return;
  AMBS.gullT-=dt; if(AMBS.gullT<=0){ AMBS.gullT=2+Math.random()*5;
    const near=MARINA.gullD&&MARINA.gullD.some(function(b){ return Math.abs(b.cx-c.x)<260&&Math.abs(b.cz-c.z)<260; });
    if(near&&alt<120&&(TOD.nightK||0)<0.5) sndPlay('gull',{pitch:1+Math.random()*0.35}); }
  AMBS.crT-=dt; if(AMBS.crT<=0){ AMBS.crT=0.35+Math.random()*0.6;
    if((TOD.nightK||0)>0.6&&alt<40&&!sea&&state==='walk') sndPlay('cricket'); }
}
