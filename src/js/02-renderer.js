/* ------------------------------------------------------------------ renderer */
let renderer;
try{
  if(!window.THREE) throw new Error('three');
  renderer = new THREE.WebGLRenderer({canvas:$('gl'), antialias:true, powerPreference:'high-performance'});
}catch(e){
  $('title').innerHTML = '<div class="box ui"><h1>AY YILDIZ</h1><p class="tag">Bu tarayıcıda 3B grafik başlatılamadı. Donanım hızlandırmayı açıp sayfayı yenile.</p></div>';
  return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
const GFX={trees:null,clouds:null,treeN:0,cloudN:0};
const scene = new THREE.Scene();
const HORIZON = new THREE.Color(0xc2d8e8);
scene.fog = new THREE.Fog(0xcfe0ec, 3800, 26000);
const camera = new THREE.PerspectiveCamera(70, 1, 1, 70000);
const UP = new THREE.Vector3(0,1,0);

