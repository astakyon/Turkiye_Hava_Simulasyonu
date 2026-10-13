/* ------------------------------------------------------------------ review fixes (V2.06)
   • Voice chat: open-microphone option (no push-to-talk; the talk indicator still shows) and an overall voice volume.
   • Layout fixes on phones in landscape (hangar class filter row, paint swatches, two-column pause menu, opaque map panel)
     are in the stylesheet. */
voicePlay=function(id,stream){ const a=document.createElement('audio'); a.muted=true; a.autoplay=true; a.srcObject=stream; a.style.display='none'; document.body.appendChild(a); VOICE.els.push(a);
  if(!AC) return null; const src=AC.createMediaStreamSource(stream), f=AC.createBiquadFilter(), f2=AC.createBiquadFilter(), g=AC.createGain(); f.type='highpass'; f.frequency.value=300; f2.type='lowpass'; f2.frequency.value=3400;
  g.gain.value=1.4*(SETTINGS.voiceVol==null?1:SETTINGS.voiceVol); src.connect(f); f.connect(f2); f2.connect(g); g.connect(sndOut('radio')); VOICE.inc[id]=src; (VOICE.gains||(VOICE.gains=[])).push(g); return src; };
function voiceVolSet(v){ SETTINGS.voiceVol=v; saveSettings(); (VOICE.gains||[]).forEach(function(g){ try{ g.gain.value=1.4*v; }catch(e){} }); }
function voiceOpenApply(){ if(!VOICE.on||!VOICE.mic) return; if(SETTINGS.voiceOpen){ voicePTT(true); } else if(VOICE.talk){ voicePTT(false); } }
const _rvVoiceEn=voiceEnable; voiceEnable=function(on){ const r=_rvVoiceEn(on); if(on&&r&&r.then) r.then(function(ok){ if(ok) voiceOpenApply(); }); return r; };
/* push-to-talk release does nothing while the open microphone is on */
const _rvPTT=voicePTT; voicePTT=function(on){ if(SETTINGS.voiceOpen&&!on) return; return _rvPTT(on); };
(function(){ Array.prototype.forEach.call(document.querySelectorAll?document.querySelectorAll('.netOpen'):[],function(el){ el.checked=!!SETTINGS.voiceOpen; el.addEventListener('change',function(){ SETTINGS.voiceOpen=el.checked; saveSettings(); Array.prototype.forEach.call(document.querySelectorAll('.netOpen'),function(o){ o.checked=el.checked; }); if(!el.checked&&VOICE.talk) _rvPTT(false); voiceOpenApply(); }); });
  Array.prototype.forEach.call(document.querySelectorAll?document.querySelectorAll('.netVol'):[],function(el){ el.value=Math.round((SETTINGS.voiceVol==null?1:SETTINGS.voiceVol)*100); el.addEventListener('input',function(){ voiceVolSet(+el.value/100); Array.prototype.forEach.call(document.querySelectorAll('.netVol'),function(o){ o.value=el.value; }); }); }); })();
