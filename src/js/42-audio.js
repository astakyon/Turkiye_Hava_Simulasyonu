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
  else if(state==='walk'&&WALK.mode==='car'&&WALK.car.K){ const c=WALK.car, on=!muted, gr=carGear(c.v), rpm=Math.abs(c.v)<0.3?0.16+(c.thr||0)*0.5:gr[1], th=c.thr||0, mil=c.K.mil||c.K.heavy;
    fO=(mil?32:40)+rpm*(mil?85:120)+(c.turbo?18:0); gO=on?(0.03+th*0.05+rpm*0.02):0;
    gN=on?(0.05+th*0.08+Math.min(0.35,Math.max(0,(c.slip||0)-3)*0.05)+Math.abs(c.v)*0.002):0; fL=220+rpm*700+Math.max(0,(c.slip||0)-3)*260;
    id='eng_car'; lg=on?0.25+th*0.35:0; lr=0.55+rpm*0.95; }
  else { const on=state==='play'&&!S.crashed&&!muted, thr=S.ab?1:S.throttle, sn=CUR.snd; type=sn.type;
    gN=on?(0.12+0.32*thr+(S.ab?0.18:0)+S.speed/900*0.1)*sn.n:0; fL=sn.lp0+thr*sn.lpK+S.speed*1.4+(S.ab?700:0); fO=sn.f0+thr*(sn.f1-sn.f0); gO=on?(0.012+thr*0.03)*sn.o:0;
    id='eng_air'; lg=on?0.3+0.45*thr+(S.ab?0.25:0):0; lr=0.7+thr*0.6+(S.ab?0.25:0); }
  if(id!=='eng_air'&&SND.loops.eng_air) sndLoop('eng_air',0,1); if(id!=='eng_car'&&SND.loops.eng_car) sndLoop('eng_car',0,1);
  const file=id&&sndLoop(id,lg,lr), uv=id?sndVol(id):1, up=id?sndPitch(id):1;
  if(file){ gN=0; gO=0; }
  if(eng.osc.type!==type) eng.osc.type=type;
  /* V2.24: new targets only when they change (each call adds an event to the audio timeline), and the voice is unplugged
     after 1.5 s of silence so the audio thread stops computing it (menus, walking, helicopter) */
  const E=eng.last||(eng.last={gN:-1,gO:-1,fO:-1,fL:-1,quiet:0,off:false}), a=gN*uv, b=gO*uv, c=fO*up, d=fL*up;
  if(a===0&&b===0){ E.quiet+=1; } else { E.quiet=0; if(E.off){ E.off=false; try{ eng.g.connect(sndOut('sfx')); eng.og.connect(sndOut('sfx')); }catch(x){} } }
  if(E.quiet>90&&!E.off){ E.off=true; try{ eng.g.disconnect(); eng.og.disconnect(); }catch(x){} }
  if(!E.off){ if(Math.abs(a-E.gN)>1e-4){ eng.g.gain.setTargetAtTime(a,t,0.1); E.gN=a; } if(Math.abs(b-E.gO)>1e-4){ eng.og.gain.setTargetAtTime(b,t,0.1); E.gO=b; }
    if(Math.abs(c-E.fO)>0.5){ eng.osc.frequency.setTargetAtTime(c,t,0.08); E.fO=c; } if(Math.abs(d-E.fL)>2){ eng.lp.frequency.setTargetAtTime(d,t,0.1); E.fL=d; } }
}
function noiseBurst(freq,type,vol,dur){
  if(!AC||muted||!noiseBuf) return;
  const s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq;
  const g=AC.createGain(); g.gain.setValueAtTime(vol,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dur);
  s.connect(f); f.connect(g); g.connect(sndOut('sfx')); s.start(0,Math.random()*1.5,dur+0.02);
}
function gunSound(){ sndPlay('gun'); }
function boomSound(){ sndPlay('boom'); }

