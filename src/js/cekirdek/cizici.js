/* ------------------------------------------------------------------ renderer */
let renderer;
/* device profile: phones/tablets get the safe rendering path (no logarithmic depth: on many mobile GPUs it writes depth per pixel
   with low precision, which showed up as black waves / bands; also cheaper). The choice can be overridden in Ayarlar → Grafik. */
const DEV=(function(){ let coarse=false, ua=(navigator.userAgent||''), st={};
  try{ coarse=window.matchMedia('(pointer:coarse)').matches; }catch(e){}
  try{ st=JSON.parse(stGet('kaan-sim-settings')||'{}')||{}; }catch(e){}
  const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1), android=/Android/.test(ua);
  const mobile=ios||android||(coarse&&Math.min(screen.width,screen.height)<900), tablet=mobile&&Math.min(screen.width,screen.height)>=600;
  const depth=st.depth||'auto', safe=!!st.safeMode;
  return {mobile:mobile, tablet:tablet, ios:ios, android:android, kind:mobile?(tablet?'Tablet':'Telefon'):'Bilgisayar', depth:depth, safe:safe,
    logDepth:!safe&&(depth==='log'||(depth==='auto'&&!mobile)), gpu:'?', webgl:'?'}; })();
try{
  if(!window.THREE) throw new Error('three');
  renderer = new THREE.WebGLRenderer({canvas:$('gl'), antialias:!DEV.safe, powerPreference:'high-performance', precision:'highp', logarithmicDepthBuffer:DEV.logDepth});   /* log depth on PC: no z-fighting on distant runways; phones use a moving near plane instead */
}catch(e){
  $('title').innerHTML = '<div class="box ui"><h1>AY YILDIZ</h1><p class="tag">Bu tarayıcıda 3B grafik başlatılamadı. Donanım hızlandırmayı açıp sayfayı yenile.</p></div>';
  return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
try{ const gl=renderer.getContext(), ext=gl.getExtension('WEBGL_debug_renderer_info'); DEV.gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER); DEV.webgl=renderer.capabilities.isWebGL2?'WebGL 2':'WebGL 1';
  DEV.hp=renderer.capabilities.precision; DEV.maxTex=renderer.capabilities.maxTextureSize; DEV.depthBits=gl.getParameter(gl.DEPTH_BITS); }catch(e){}
const GFX={trees:null,clouds:null,treeN:0,cloudN:0};
const scene = new THREE.Scene();
const HORIZON = new THREE.Color(0xc2d8e8);
scene.fog = new THREE.Fog(0xcfe0ec, 3800, 26000);
const camera = new THREE.PerspectiveCamera(70, 1, 1, DEV.logDepth?70000:32000);   /* without log depth keep far near the fog end for precision */
const UP = new THREE.Vector3(0,1,0);

