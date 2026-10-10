/* ------------------------------------------------------------------ audio */
let AC=null, eng=null, noiseBuf=null, master=null;
function initAudio(){
  if(AC){ if(AC.state==='suspended') AC.resume(); return; }
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createGain(); master.gain.value=SETTINGS.volume; master.connect(AC.destination);
    const len=AC.sampleRate*2, buf=AC.createBuffer(1,len,AC.sampleRate), d=buf.getChannelData(0); let l=0;
    for(let i=0;i<len;i++){ const w=Math.random()*2-1; l=(l+0.04*w)/1.04; d[i]=l*5; }
    noiseBuf=buf;
    const src=AC.createBufferSource(); src.buffer=buf; src.loop=true;
    const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=400;
    const g=AC.createGain(); g.gain.value=0; src.connect(lp); lp.connect(g); g.connect(master); src.start();
    const osc=AC.createOscillator(); osc.type='sawtooth'; osc.frequency.value=80;
    const of=AC.createBiquadFilter(); of.type='lowpass'; of.frequency.value=500;
    const og=AC.createGain(); og.gain.value=0; osc.connect(of); of.connect(og); og.connect(master); osc.start();
    eng={lp,g,osc,og};
  }catch(e){ AC=null; eng=null; }
}
function audioUpdate(){
  if(!AC||!eng) return;
  const on=state==='play'&&!S.crashed&&!muted, thr=S.ab?1:S.throttle, t=AC.currentTime;
  const sn=CUR.snd;
  if(eng.osc.type!==sn.type) eng.osc.type=sn.type;
  eng.g.gain.setTargetAtTime(on?(0.12+0.32*thr+(S.ab?0.18:0)+S.speed/900*0.1)*sn.n:0,t,0.12);
  eng.lp.frequency.setTargetAtTime(sn.lp0+thr*sn.lpK+S.speed*1.4+(S.ab?700:0),t,0.12);
  eng.osc.frequency.setTargetAtTime(sn.f0+thr*(sn.f1-sn.f0),t,0.12);
  eng.og.gain.setTargetAtTime(on?(0.012+thr*0.03)*sn.o:0,t,0.12);
}
function noiseBurst(freq,type,vol,dur){
  if(!AC||muted||!noiseBuf) return;
  const s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type=type; f.frequency.value=freq;
  const g=AC.createGain(); g.gain.setValueAtTime(vol,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(0,Math.random()*1.5,dur+0.02);
}
function gunSound(){ noiseBurst(1100,'bandpass',0.16,0.07); }
function boomSound(){ noiseBurst(220,'lowpass',0.9,0.9); }

