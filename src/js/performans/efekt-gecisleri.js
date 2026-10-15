/* ------------------------------------------------------------------ depth, effect passes, menus, sustained quality (V2.17)
   • Colour grade + FXAA in one full-screen pass. They were two passes in a row (each reads and writes the whole screen); the
     combined shader runs FXAA and grades its result in the same pixel. The grade code is derived from GRADE_SHADER at run time
     so the two never drift apart; if that fails (or SETTINGS.fxMerge=false) the old two passes are used.
   • Full-screen menus: the 3D scene behind them is not drawn at all any more (it was 10 FPS); the game logic keeps running at
     10 FPS (lobby, voice, cloud). The canvas keeps the last picture; a resize while covered draws one frame.
   • Sustained quality: if the automatic quality steps down three times within 5 minutes (a phone that heats up keeps going up
     and down), the current level is kept until the next return to the menu instead of climbing back.
   • Depth: logarithmic depth stays on PCs. The first PC report measured it at 1.5 ms (3 %) on an Intel UHD; the alternative
     (two depth ranges, as on phones) draws the scene twice, which costs more CPU than that. */
function fxGradeAAShader(){ const F=THREE.FXAAShader, G=GRADE_SHADER; if(!F||!G) return null;
  const fs=F.fragmentShader, i=fs.lastIndexOf('void main()'); if(i<0) return null;
  const aa=fs.slice(0,i)+'void fxaaMain()'+fs.slice(i+'void main()'.length);
  const L=G.fragmentShader.split('\n'); if(L.length<5||L[2].trim()!=='void main(){') return null;
  const uni=L[0].replace('uniform sampler2D tDiffuse;','').replace('varying vec2 vUv;','');
  const first=L[3].replace('vec3 c=texture2D(tDiffuse,vUv).rgb;','vec3 c=gl_FragColor.rgb;'); if(first===L[3]) return null;
  const frag=aa+'\n'+uni+'\n'+L[1]+'\nvoid main(){ fxaaMain();\n'+first+'\n'+L.slice(4).join('\n');
  return {uniforms:Object.assign(THREE.UniformsUtils.clone(F.uniforms),THREE.UniformsUtils.clone(G.uniforms)), vertexShader:F.vertexShader, fragmentShader:frag}; }
fxBuild=HOOK.wrap('fxBuild','performans/efekt-gecisleri#_fp17Build',function(_fp17Build){ return function(){ _fp17Build(); FX.merged=false; const c=FX.composer; if(!c||!FX.fxaa||!FX.grade||FX.fxaa===FX.grade||SETTINGS.fxMerge===false) return;
  let sh=null; try{ sh=fxGradeAAShader(); }catch(e){ sh=null; } if(!sh) return;
  const P=c.passes, gi=P.indexOf(FX.grade), ai=P.indexOf(FX.fxaa); if(gi<0||ai!==gi+1) return;
  const comb=new THREE.ShaderPass(sh); comb.uniforms.uHdr.value=FX.grade.uniforms.uHdr.value; ['uVig','uSat','uCon'].forEach(function(k){ comb.uniforms[k].value=FX.grade.uniforms[k].value; });
  P.splice(gi,2,comb); comb.renderToScreen=true; FX.grade=comb; FX.fxaa=comb; FX.merged=true; fxResize(); }; },fxBuild);
/* full-screen menus: no 3D drawing behind them */
const MC17={w:0,h:0,skipped:0};
renderFrame=HOOK.wrap('renderFrame','performans/efekt-gecisleri#_mc17RF',function(_mc17RF){ return function(dt){ if(typeof menuCovered==='function'&&menuCovered()&&!(typeof PT!=='undefined'&&PT.run)){ if(MC17.w===HW&&MC17.h===HH){ MC17.skipped++; return; } } MC17.w=HW; MC17.h=HH; _mc17RF(dt); }; },renderFrame);
/* sustained quality: stop climbing back after repeated step-downs */
perfLadder=HOOK.wrap('perfLadder','performans/efekt-gecisleri#_sq17Lad',function(_sq17Lad){ return function(){ if(PERF2.lock&&PERF2.good>=11) PERF2.good=0; const b=PERF2.lvl; _sq17Lad(); const now=performance.now();
  if(PERF2.lvl>b){ PERF2.ups=(PERF2.ups||[]).filter(function(t){ return now-t<300000; }); PERF2.ups.push(now);
    if(PERF2.ups.length>=3&&!PERF2.lock){ PERF2.lock=true; toast('Cihaz ısındığı için kalite bu oturumda sabitlendi (menüye dönünce sıfırlanır)','#b8ecff'); } } }; },perfLadder);
enterTitle=HOOK.wrap('enterTitle','performans/efekt-gecisleri#_sq17Title',function(_sq17Title){ return function(){ PERF2.lock=false; PERF2.ups=[]; return _sq17Title.apply(this,arguments); }; },enterTitle);
