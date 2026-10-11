/* ------------------------------------------------------------------ audio */
let AC=null, eng=null, noiseBuf=null, master=null;
function initAudio(){
  if(AC){ if(AC.state==='suspended') AC.resume(); return; }
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createGain(); master.gain.value=SETTINGS.volume; master.connect(AC.destination); sndBuses();
    const len=AC.sampleRate*2, buf=AC.createBuffer(1,len,AC.sampleRate), d=buf.getChannelData(0); let l=0;
    for(let i=0;i<len;i++){ const w=Math.random()*2-1; l=(l+0.04*w)/1.04; d[i]=l*5; }
    noiseBuf=buf;
    const src=AC.createBufferSource(); src.buffer=buf; src.loop=true;
    const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=400;
    const g=AC.createGain(); g.gain.value=0; src.connect(lp); lp.connect(g); g.connect(sndOut('sfx')); src.start();
    const osc=AC.createOscillator(); osc.type='sawtooth'; osc.frequency.value=80;
    const of=AC.createBiquadFilter(); of.type='lowpass'; of.frequency.value=500;
    const og=AC.createGain(); og.gain.value=0; osc.connect(of); of.connect(og); og.connect(sndOut('sfx')); osc.start();
    eng={lp,g,osc,og};
  }catch(e){ AC=null; eng=null; }
}
function audioUpdate(){
  if(!AC||!eng) return;
  sndMixStep(); musStep();
  const t=AC.currentTime, heli=state==='walk'&&WALK.mode==='heli';
  heliAudio(t,heli&&!muted);
  /* procedural engine targets (noise gain, tone gain, tone freq, filter) + the matching Sound Library loop */
  let gN=0, gO=0, fO=80, fL=400, type='sawtooth', id=null, lg=0, lr=1;
  if(heli){ /* rotor has its own voice */ }
  else if(state==='walk'&&WALK.mode==='car'&&WALK.car.K){ const c=WALK.car, on=!muted, gr=carGear(c.v), rpm=Math.abs(c.v)<0.3?0.16+(c.thr||0)*0.5:gr[1], th=c.thr||0, mil=c.K.mil;
    fO=(mil?32:40)+rpm*(mil?85:120)+(c.turbo?18:0); gO=on?(0.03+th*0.05+rpm*0.02):0;
    gN=on?(0.05+th*0.08+Math.min(0.35,Math.max(0,(c.slip||0)-3)*0.05)+Math.abs(c.v)*0.002):0; fL=220+rpm*700+Math.max(0,(c.slip||0)-3)*260;
    id='eng_car'; lg=on?0.25+th*0.35:0; lr=0.55+rpm*0.95; }
  else { const on=state==='play'&&!S.crashed&&!muted, thr=S.ab?1:S.throttle, sn=CUR.snd; type=sn.type;
    gN=on?(0.12+0.32*thr+(S.ab?0.18:0)+S.speed/900*0.1)*sn.n:0; fL=sn.lp0+thr*sn.lpK+S.speed*1.4+(S.ab?700:0); fO=sn.f0+thr*(sn.f1-sn.f0); gO=on?(0.012+thr*0.03)*sn.o:0;
    id='eng_air'; lg=on?0.3+0.45*thr+(S.ab?0.25:0):0; lr=0.7+thr*0.6+(S.ab?0.25:0); }
  ['eng_air','eng_car'].forEach(function(k){ if(k!==id&&SND.loops[k]) sndLoop(k,0,1); });
  const file=id&&sndLoop(id,lg,lr), uv=id?sndVol(id):1, up=id?sndPitch(id):1;
  if(file){ gN=0; gO=0; }
  if(eng.osc.type!==type) eng.osc.type=type;
  eng.g.gain.setTargetAtTime(gN*uv,t,0.1); eng.og.gain.setTargetAtTime(gO*uv,t,0.1);
  eng.osc.frequency.setTargetAtTime(fO*up,t,0.08); eng.lp.frequency.setTargetAtTime(fL*up,t,0.1);
}
function noiseBurst(freq,type,vol,dur){
  if(!AC||muted||!noiseBuf) return;
  const s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq;
  const g=AC.createGain(); g.gain.setValueAtTime(vol,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dur);
  s.connect(f); f.connect(g); g.connect(sndOut('sfx')); s.start(0,Math.random()*1.5,dur+0.02);
}
function gunSound(){ sndPlay('gun'); }
function boomSound(){ sndPlay('boom'); }

