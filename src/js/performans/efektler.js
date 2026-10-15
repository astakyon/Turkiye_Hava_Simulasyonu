/* ------------------------------------------------------------------ post-processing: bloom, colour grade, vignette, speed blur, anti-aliasing
   Levels (Ayarlar → Grafik → Görsel efektler): 0 off (plain render), 1 grade + speed blur, 2 + bloom.
   Bloom is selective: the scene is rendered into a high-precision buffer and only lights, flames and the sun are pushed
   above the bloom threshold (see GLOW), so white paint and clouds do not smear. */
var FX={level:0, on:false, composer:null, bloom:null, grade:null, fxaa:null, hdr:false, msaa:false, failed:false, loading:null, glowOn:false, scanT:0};
var GLOW=new Map();   /* material -> {base colour, factor} */
function fxDefault(){ const q=SETTINGS.quality; return DEV.mobile?(q>=2?1:0):(q>=1?2:0); }
function fxWanted(){ return SETTINGS.fx==null?fxDefault():SETTINGS.fx; }
const GRADE_SHADER={
  uniforms:{tDiffuse:{value:null}, uSpeed:{value:0}, uVig:{value:0.24}, uHdr:{value:0}, uSat:{value:1.1}, uCon:{value:1.06}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:[
    'uniform sampler2D tDiffuse; uniform float uSpeed; uniform float uVig; uniform float uHdr; uniform float uSat; uniform float uCon; varying vec2 vUv;',
    'vec3 tone(vec3 c){ vec3 k=0.82+(1.0-exp(-max(c-0.82,0.0)/0.18))*0.18; return mix(c,k,step(0.82,c)*uHdr); }',
    'void main(){',
    '  vec2 d=vUv-0.5; float r=length(d); vec3 c=texture2D(tDiffuse,vUv).rgb;',
    '  if(uSpeed>0.001){ float k=uSpeed*0.011*smoothstep(0.32,0.85,r); vec3 a=c; for(int i=1;i<6;i++){ a+=texture2D(tDiffuse,vUv-d*k*float(i)).rgb; } c=a/6.0; }',
    '  c=tone(c);',
    '  float l=dot(c,vec3(0.2126,0.7152,0.0722)); c=mix(vec3(l),c,uSat); c=(c-0.5)*uCon+0.5;',
    '  c+=vec3(0.014,0.005,-0.012)*smoothstep(0.45,1.0,l)+vec3(-0.008,0.0,0.012)*(1.0-smoothstep(0.0,0.4,l));',
    '  c*=1.0-uVig*smoothstep(0.42,1.05,r*1.3);',
    '  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);',
    '}'].join('\n')
};
function applyFX(){
  const lv=fxWanted(); FX.level=lv;
  if(lv===0||FX.failed){ FX.on=false; glowApply(false); return; }
  if(FX.loading) return;
  FX.loading=needLibs(['CopyShader','LuminosityHighPassShader','FXAAShader','EffectComposer','ShaderPass','RenderPass','UnrealBloomPass']).then(function(){
    FX.loading=null; try{ fxBuild(); FX.on=FX.level>0; glowApply(FX.on&&FX.hdr&&FX.level>=2); }catch(e){ console.warn('efektler kapatıldı',e); FX.failed=true; FX.on=false; glowApply(false); }
  }).catch(function(e){ FX.loading=null; FX.failed=true; FX.on=false; console.warn('efekt kitaplıkları yüklenemedi',e); toast('Görsel efektler yüklenemedi (internet?) — normal görüntüyle devam','#ffc24a'); });
}
function fxBuild(){
  const gl=renderer.getContext(), w2=!!renderer.capabilities.isWebGL2;
  const halfOK=w2?!!(gl.getExtension('EXT_color_buffer_float')||gl.getExtension('EXT_color_buffer_half_float')):!!(gl.getExtension('OES_texture_half_float')&&gl.getExtension('EXT_color_buffer_half_float'));
  FX.hdr=halfOK&&FX.level>=2&&!DEV.mobile&&!DEV.safe;   /* half-float targets misbehave on some phone GPUs */
  const pr=renderer.getPixelRatio(), W=Math.max(1,Math.round(HW*pr)), H=Math.max(1,Math.round(HH*pr));
  const opts={minFilter:THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat, type:FX.hdr?THREE.HalfFloatType:THREE.UnsignedByteType, depthBuffer:true, stencilBuffer:true /* r128: stencil yoksa derinlik 16 bit → uzakta z-fighting çizgileri; DEPTH24_STENCIL8 */};
  const aa=(SETTINGS.aa&&SETTINGS.aa!=='auto')?SETTINGS.aa:(SETTINGS.quality>=3&&!DEV.mobile?'msaa8':'auto'); let rt; FX.msaa=w2&&!!THREE.WebGLMultisampleRenderTarget&&(aa==='msaa4'||aa==='msaa8'||(aa==='auto'&&!DEV.mobile));
  if(FX.msaa){ rt=new THREE.WebGLMultisampleRenderTarget(W,H,opts); let mx=4; try{ mx=gl.getParameter(gl.MAX_SAMPLES)||4; }catch(e){} rt.samples=Math.min(aa==='msaa8'?8:4,mx); FX.samples=rt.samples; } else rt=new THREE.WebGLRenderTarget(W,H,opts);
  if(FX.composer){ FX.composer.renderTarget1.dispose(); FX.composer.renderTarget2.dispose(); }
  const c=new THREE.EffectComposer(renderer,rt); c.setPixelRatio(pr); c.setSize(HW,HH);
  c.addPass(new THREE.RenderPass(scene,camera));
  FX.bloom=null;
  if(FX.level>=2){ FX.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(HW,HH),FX.hdr?0.75:0.25,0.42,FX.hdr?1.9:0.94); c.addPass(FX.bloom); }
  FX.grade=new THREE.ShaderPass(GRADE_SHADER); FX.grade.uniforms.uHdr.value=FX.hdr?1:0; c.addPass(FX.grade);
  FX.fxaa=null; if(!FX.msaa&&aa!=='off'){ FX.fxaa=new THREE.ShaderPass(THREE.FXAAShader); c.addPass(FX.fxaa); }
  FX.composer=c; fxResize();
}
function fxResize(){
  if(!FX||!FX.composer) return; const pr=renderer.getPixelRatio();
  FX.composer.setPixelRatio(pr); FX.composer.setSize(HW,HH);
  if(FX.fxaa) FX.fxaa.uniforms.resolution.value.set(1/Math.max(1,HW*pr),1/Math.max(1,HH*pr));
}
/* lights, flames, tracers and the sun get extra intensity only while HDR bloom is on (otherwise colours stay exactly as designed) */
function glowScan(){
  scene.traverse(function(o){ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):null; if(!ms) return;
    ms.forEach(function(m){ if(!m||GLOW.has(m)||!m.color) return; const f=m.userData.glow||(m.blending===THREE.AdditiveBlending?4:0); if(!f) return;
      GLOW.set(m,{base:m.color.clone(),f:f}); if(FX.glowOn) m.color.copy(m.color).multiplyScalar(f); }); });
}
function glowApply(on){
  if(on) glowScan();
  if(on===FX.glowOn) return; FX.glowOn=on;
  GLOW.forEach(function(g,m){ m.color.copy(g.base); if(on) m.color.multiplyScalar(g.f); });
  if(sky.material.uniforms.sunK) sky.material.uniforms.sunK.value=on?3.2:1;
}
function fxUniforms(dt){
  if(FX.glowOn){ FX.scanT-=dt; if(FX.scanT<=0){ FX.scanT=2; glowScan(); } }
  let sp=0; if(state==='play'&&!S.crashed&&!S.onGround){ sp=clamp((S.speed/Math.max(1,CUR.vTop)-0.5)/0.5,0,1)*0.8+(S.ab?0.25:0); }
  else if(state==='walk'&&WALK.mode==='car') sp=clamp((Math.abs(WALK.car.v)-14)/16,0,1)*0.5;
  if(SETTINGS.rm) sp=0;
  const u=FX.grade.uniforms.uSpeed; u.value+=(sp-u.value)*Math.min(1,dt*(sp<u.value?6:2));
}
/* without a logarithmic depth buffer, move the near plane out as the camera climbs (depth precision follows near/far) */
let nearFocus=null;
function nearPlane(){
  if(DEV.logDepth) return;
  const cp=camera.position, agl=Math.max(0.5,cp.y-Math.max(0,groundH(cp.x,cp.z)));
  let focusD=1e9;
  if(state==='walk'||((state==='paused'||state==='map')&&WALK.from==='walk')){ if(WALK.mode==='foot') focusD=0.6; else if(WALK.mode==='car') focusD=WALK.fp?0.6:camera.position.distanceTo(nearV.set(WALK.car.x,WALK.car.y||cp.y,WALK.car.z)); else if(WALK.mode==='boat'&&BOAT.cur) focusD=WALK.fp?0.6:camera.position.distanceTo(nearV.set(BOAT.cur.x,2,BOAT.cur.z))*0.5; else if(HELI.cur) focusD=HELI.fp?0.6:camera.position.distanceTo(nearV.set(HELI.cur.x,HELI.cur.y,HELI.cur.z)); }
  else if(state==='play'||state==='paused'||state==='map'||state==='mend') focusD=camera.position.distanceTo(S.pos);
  else if(state==='library') return;
  else focusD=Math.max(2,agl*0.6);
  const n=clamp(Math.min(agl*0.06,focusD*0.35),0.25,9);
  if(Math.abs(n-camera.near)>camera.near*0.12){ camera.near=n; camera.updateProjectionMatrix(); }
}
const nearV=new THREE.Vector3();
function renderFrame(dt){
  nearPlane();
  if(FX.on&&FX.composer){ fxUniforms(dt||0); FX.composer.render(dt||0); }
  else renderer.render(scene,camera);
}
function fxReset(){ if(FX.grade) FX.grade.uniforms.uSpeed.value=0; }
