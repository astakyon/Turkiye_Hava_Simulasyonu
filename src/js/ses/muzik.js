/* ------------------------------------------------------------------ music: original, generated in the browser (royalty-free), adaptive
   Tracks: menu theme (D minor, war drums, a Hicaz-flavoured lead), calm flight, combat, and short victory / defeat stingers.
   A small step sequencer schedules notes ~0.2 s ahead on the audio clock. Any track can be replaced by a file in the Sound Library
   (Müzik). The game picks the track from the state: menus → theme, flying → calm, enemies near / threats → combat. */
const MUS={out:null, verb:null, cur:null, gain:null, step:0, next:0, bar:0, want:null, file:null, lastSting:-9, tr:0, sparse:false, loops:0, phT:0, phLen:0, rest:0, phName:null, phases:0};
const mtof=function(m){ return 440*Math.pow(2,(m+MUS.tr-69)/12); };
/* V2.28 — music in phrases. Player report: the music that never stops gives a headache after a while. The menu and flight
   themes looped 8 bars (21–25 s) for as long as one stayed there, always in the same key with every part playing.
   • "Ara ara" (new default): a theme plays for about a minute, fades out, and the game is silent (engine, wind, radio) for
     1½–3½ minutes before the next phrase. Every phrase gets a different key and arrangement (sometimes without the plucked line).
     Combat music still comes in at once when there is a threat, and goes 12 s after it; long fights change key every 4 loops.
   • "Sürekli": the old behaviour. "Yalnız çatışma": only combat music and the victory / defeat stingers. Kapalı: the Müzik switch.
   • The music volume default went from 60 % to 45 % of the master volume (only if the player never moved that slider). */
const MUS_REST={menu:[60,120], calm:[90,210]}, MUS_LEN={menu:[55,80], calm:[60,90]}, MUS_TR=[0,-2,3,-5,2];
function musMode(){ const m=SETTINGS.musMode; return m==='surekli'||m==='catisma'?m:'ara'; }
function musRand(a){ return a[0]+Math.random()*(a[1]-a[0]); }
function musInit(){
  if(!AC||MUS.out) return;
  MUS.out=AC.createGain(); MUS.out.gain.value=1; MUS.out.connect(sndOut('music'));
  /* small generated hall reverb */
  try{ const len=AC.sampleRate*2.4, ir=AC.createBuffer(2,len,AC.sampleRate); for(let c=0;c<2;c++){ const d=ir.getChannelData(c); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2); }
    const cv=AC.createConvolver(); cv.buffer=ir; const wet=AC.createGain(); wet.gain.value=0.32; cv.connect(wet); wet.connect(MUS.out); MUS.verb=cv; }catch(e){ MUS.verb=null; }
}
/* ---- instruments (dest = track gain) */
function mEnv(g,t,a,h,r,v){ g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+a); g.gain.setValueAtTime(v,t+a+h); g.gain.exponentialRampToValueAtTime(0.0001,t+a+h+r); }
function mSend(n,dest,wet){ n.connect(dest); if(MUS.verb&&wet){ const s=AC.createGain(); s.gain.value=wet; n.connect(s); s.connect(MUS.verb); } }
function iPad(dest,t,notes,dur,v,cut){ notes.forEach(function(m){ [-7,7].forEach(function(dt){ const o=AC.createOscillator(), f=AC.createBiquadFilter(), g=AC.createGain();
  o.type='sawtooth'; o.frequency.value=mtof(m); o.detune.value=dt; f.type='lowpass'; f.frequency.value=cut||900; f.Q.value=0.4; o.connect(f); f.connect(g); mEnv(g,t,Math.min(0.9,dur*0.3),dur*0.5,1.4,v/notes.length);
  mSend(g,dest,0.8); o.start(t); o.stop(t+dur+1.6); }); }); }
function iStr(dest,t,m,dur,v){ const o=AC.createOscillator(), o2=AC.createOscillator(), f=AC.createBiquadFilter(), g=AC.createGain(), lfo=AC.createOscillator(), lg=AC.createGain();
  o.type='sawtooth'; o2.type='sawtooth'; o.frequency.value=mtof(m); o2.frequency.value=mtof(m); o2.detune.value=9; lfo.frequency.value=5.2; lg.gain.value=4; lfo.connect(lg); lg.connect(o.detune); lg.connect(o2.detune);
  f.type='lowpass'; f.frequency.setValueAtTime(700,t); f.frequency.linearRampToValueAtTime(2200,t+Math.min(0.3,dur*0.5)); o.connect(f); o2.connect(f); f.connect(g); mEnv(g,t,0.06,dur*0.7,0.35,v);
  mSend(g,dest,0.5); [o,o2,lfo].forEach(function(x){ x.start(t); x.stop(t+dur+0.5); }); }
function iPluck(dest,t,m,v,type){ if(MUS.sparse&&Math.random()<0.6) return; const o=AC.createOscillator(), f=AC.createBiquadFilter(), g=AC.createGain(); o.type=type||'triangle'; o.frequency.value=mtof(m);
  f.type='lowpass'; f.frequency.setValueAtTime(3200,t); f.frequency.exponentialRampToValueAtTime(500,t+0.25); o.connect(f); f.connect(g); mEnv(g,t,0.005,0.02,0.32,v); mSend(g,dest,0.45); o.start(t); o.stop(t+0.5); }
function iBass(dest,t,m,dur,v){ const o=AC.createOscillator(), f=AC.createBiquadFilter(), g=AC.createGain(); o.type='sawtooth'; o.frequency.value=mtof(m); f.type='lowpass'; f.frequency.setValueAtTime(420,t); f.frequency.exponentialRampToValueAtTime(160,t+dur);
  o.connect(f); f.connect(g); mEnv(g,t,0.008,dur*0.6,dur*0.4+0.05,v); g.connect(dest); o.start(t); o.stop(t+dur+0.2); }
function iKick(dest,t,v){ const o=AC.createOscillator(), g=AC.createGain(); o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(42,t+0.22); o.connect(g); mEnv(g,t,0.003,0.02,0.3,v); g.connect(dest); o.start(t); o.stop(t+0.4); }
function iTaiko(dest,t,v){ const o=AC.createOscillator(), g=AC.createGain(); o.frequency.setValueAtTime(95,t); o.frequency.exponentialRampToValueAtTime(52,t+0.45); o.connect(g); mEnv(g,t,0.004,0.05,0.7,v); mSend(g,dest,0.6); o.start(t); o.stop(t+0.9);
  mNoise(dest,t,320,'lowpass',v*0.5,0.18); }
function mNoise(dest,t,fr,type,v,dur,wet){ if(!noiseBuf) return; const s=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain(); s.buffer=noiseBuf; f.type=type; f.frequency.value=fr; s.connect(f); f.connect(g); mEnv(g,t,0.002,0.005,dur,v); mSend(g,dest,wet||0); s.start(t,Math.random()*1.5,dur+0.1); }
function iSnare(dest,t,v){ mNoise(dest,t,1800,'bandpass',v,0.16,0.3); const o=AC.createOscillator(), g=AC.createGain(); o.frequency.value=185; o.connect(g); mEnv(g,t,0.002,0.01,0.09,v*0.4); g.connect(dest); o.start(t); o.stop(t+0.15); }
function iHat(dest,t,v,open){ mNoise(dest,t,7500,'highpass',v,open?0.22:0.045); }
/* ---- tracks: tick(dest, bar, step(0..15), t, sd = step duration) */
const MUS_T={
  menu:{n:'Ana menü teması', bpm:78, bars:8, tick:function(o,b,s,t,sd){
    const ch=[[50,53,57],[46,50,53],[53,57,60],[48,52,55],[50,53,57],[43,46,50],[45,49,52],[50,53,57]][b];   /* Dm Bb F C | Dm Gm A Dm */
    if(s===0) iPad(o,t,ch.map(function(m){ return m+12; }),sd*16,0.16,1100);
    if(s===0||s===8) iBass(o,t,ch[0]-12,sd*7,0.16);
    if(s===0||s===6||s===8) iTaiko(o,t,s===0?0.5:0.32); if(s===12&&b%2) iTaiko(o,t,0.25); if(s===14&&b===7) iTaiko(o,t,0.35);
    /* lead from bar 4: D Eb F# G A (Hicaz flavour) */
    const mel=b>=4?[[[74,0,4],[75,4,2],[78,6,2],[79,8,6]],[[81,0,6],[79,6,2],[78,8,4],[75,12,4]],[[73,0,4],[76,4,4],[79,8,4],[78,12,4]],[[74,0,12]]][b-4]:null;
    if(mel) mel.forEach(function(n){ if(n[1]===s) iStr(o,t,n[0],sd*n[2],0.09); });
    if(b<4&&(s===4||s===12)) iPluck(o,t,ch[2]+12,0.05); }},
  calm:{n:'Sakin uçuş', bpm:92, bars:8, tick:function(o,b,s,t,sd){
    const ch=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65],[57,60,64,67],[50,53,57,60],[53,57,60,64],[52,56,59,62]][b];   /* Am7 Fmaj7 Cmaj7 G7 Am7 Dm7 Fmaj7 E7 */
    if(s===0) iPad(o,t,ch,sd*16,0.13,800);
    if(s%2===0) iPluck(o,t,ch[(s/2)%4]+12,0.035,'sine');
    if(s===0) iBass(o,t,ch[0]-24,sd*14,0.09);
    if(s%4===2) iHat(o,t,0.012); }},
  combat:{n:'Çatışma', bpm:132, bars:4, tick:function(o,b,s,t,sd){
    const root=[50,50,46,48][b], ost=[0,0,12,0,0,10,0,7,0,0,12,0,3,0,5,7];
    iBass(o,t,root-12+ost[s],sd*0.9,0.13);
    if(s%4===0) iKick(o,t,0.5); if(s===4||s===12) iSnare(o,t,0.22); if(s%2===1) iHat(o,t,0.03); if(s===14) iHat(o,t,0.04,true);
    if(s===0) iPad(o,t,[root+12,root+15,root+19],sd*16,0.1,1400);
    if(s===0||s===3||s===6) iStr(o,t,root+24+(s===6?3:0),sd*2.5,0.07);
    if(b===3&&s>=12) iTaiko(o,t,0.3); }},
  victory:{n:'Zafer', bpm:100, bars:1, once:true, tick:function(o,b,s,t,sd){
    [[0,62],[2,66],[4,69],[6,74]].forEach(function(n){ if(n[0]===s) iStr(o,t,n[1],sd*(s===6?10:2),0.12); });
    if(s===6){ iPad(o,t,[62,66,69,74],sd*10,0.18,1600); iTaiko(o,t,0.5); } if(s===0) iTaiko(o,t,0.4); }},
  defeat:{n:'Yenilgi', bpm:70, bars:1, once:true, tick:function(o,b,s,t,sd){
    [[0,69],[4,65],[8,62]].forEach(function(n){ if(n[0]===s) iStr(o,t,n[1],sd*(s===8?8:4),0.09); });
    if(s===0) iPad(o,t,[50,53,57],sd*16,0.14,700); if(s===8) iTaiko(o,t,0.35); }}
};
/* Sound Library entries for music (files can replace each track) */
[['menu','Ana menü teması','Ana menü, hangar'],['calm','Sakin uçuş','Serbest uçuş, devriye'],['combat','Çatışma','Düşman yakın ya da tehdit varken'],['victory','Zafer','Görev başarıyla bitince'],['defeat','Yenilgi','Görev başarısız / kaza']].forEach(function(m){
  const d={id:'mus_'+m[0],cat:'muzik',n:m[1],d:m[2],bus:'music',music:m[0]}; SND_DEFS.push(d); SNDI[d.id]=d; });
function musWanted(){
  if(SETTINGS.music===false) return null;
  if(state==='menu'||state==='library') return musPhrase('menu');
  if(state==='play'){
    const threat=(typeof RWR!=='undefined'&&RWR.msl>0)||(typeof CUE!=='undefined'&&CUE.level>=1)||ACT.some(function(a){ return a.team==='red'&&a.alive&&a.pos.distanceToSquared(S.pos)<6500*6500; });
    if(threat){ MUS.combatT=AC.currentTime; return 'combat'; }
    if(MUS.cur==='combat'&&AC.currentTime-(MUS.combatT||0)<12) return 'combat';   /* stay a little after the fight */
    return musPhrase('calm'); }
  if(state==='walk') return musPhrase('calm');
  return MUS.cur;   /* paused, map, mission end: keep what plays */
}
/* phrase / rest cycle for the calm themes (menu, flight, walking) */
function musPhrase(w){ const mode=musMode(); if(mode==='catisma') return null; if(mode==='surekli'||!AC) return w; const now=AC.currentTime;
  if(MUS.rest>now&&MUS.phName===w) return null;                                   /* still resting */
  if(MUS.cur===w&&MUS.phName===w){ if(now-MUS.phT>MUS.phLen){ MUS.rest=now+musRand(MUS_REST[w]||[90,180]); return null; } return w; }
  /* a new phrase (first time, after a rest, or after a change of scene) */
  MUS.phName=w; MUS.phT=now; MUS.phLen=musRand(MUS_LEN[w]||[60,90]); MUS.rest=0; MUS.phases++; MUS.newPh=true; return w; }
function musStart(name){
  const t=AC.currentTime;
  if(MUS.gain){ const g=MUS.gain; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value,t); g.gain.linearRampToValueAtTime(0.0001,t+1.6); setTimeout(function(){ try{ g.disconnect(); }catch(e){} },2600); }
  if(MUS.file){ const f=MUS.file; try{ f.stop(t+1.7); }catch(e){} MUS.file=null; }
  MUS.cur=name; MUS.gain=null; if(!name) return;
  const g=AC.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(sndVol('mus_'+name),t+(MUS_T[name].once?0.05:2.2)); g.connect(MUS.out); MUS.gain=g;
  const buf=SND.buf['mus_'+name];
  if(buf){ const s=AC.createBufferSource(); s.buffer=buf; s.loop=!MUS_T[name].once; s.playbackRate.value=sndPitch('mus_'+name); s.connect(g); s.start(t); MUS.file=s; return; }
  MUS.step=0; MUS.bar=0; MUS.loops=0; MUS.next=t+0.08;
  if(!MUS_T[name].once&&musMode()!=='surekli'){ if(MUS.newPh||name==='combat'){ MUS.tr=name==='combat'?0:MUS_TR[MUS.phases%MUS_TR.length]; MUS.sparse=name!=='combat'&&MUS.phases%2===0; } MUS.newPh=false; }
  else if(MUS_T[name].once){ /* stingers keep their written key */ MUS.trKeep=MUS.tr; MUS.tr=0; MUS.sparse=false; }
  else { MUS.tr=0; MUS.sparse=false; }
}
/* one-shot stinger over the current music (ducks it) */
function musSting(name){
  if(!AC||muted||SETTINGS.music===false||AC.currentTime-MUS.lastSting<2) return; musInit(); MUS.lastSting=AC.currentTime;
  const prev=MUS.cur; musStart(name); MUS.after=prev; MUS.afterT=AC.currentTime+4.5;
}
function musStep(){
  if(!AC) return; musInit(); if(!MUS.out) return;
  let want=musWanted();
  if(MUS.after&&AC.currentTime<MUS.afterT) want=MUS.cur; else if(MUS.after){ MUS.after=null; }
  if(want!==MUS.cur) musStart(want);
  const name=MUS.cur, tr=name&&MUS_T[name]; if(!tr||MUS.file||!MUS.gain) return;
  const sd=60/(tr.bpm*(sndPitch('mus_'+name)))/4, ahead=AC.currentTime+0.22;
  if(MUS.next<AC.currentTime-0.5) MUS.next=AC.currentTime+0.05;   /* tab was hidden: resync */
  while(MUS.next<ahead){
    if(tr.once&&MUS.bar>=tr.bars){ MUS.next=1e9; break; }
    try{ tr.tick(MUS.gain,MUS.bar%tr.bars,MUS.step,MUS.next,sd); }catch(e){}
    MUS.next+=sd; MUS.step++; if(MUS.step>=16){ MUS.step=0; MUS.bar++; if(!tr.once&&MUS.bar>=tr.bars){ MUS.bar=0; MUS.loops++; if(name==='combat'&&musMode()!=='surekli'&&MUS.loops%4===0) MUS.tr=MUS.tr?0:5; } }
  }
}
/* previews in the Sound Library: a few bars on their own */
function musPreview(name){ if(!AC) return; musInit(); const prev=MUS.cur; musStart(name); MUS.after=prev; MUS.afterT=AC.currentTime+(MUS_T[name].once?5:12); }
/* keep the sequencer fed even when frames are slow (timer is clamped in background tabs, which is fine) */
setInterval(function(){ try{ if(AC&&eng) musStep(); }catch(e){} },60);
