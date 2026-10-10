/* ------------------------------------------------------------------ sky + light */
const SUN = new THREE.Vector3(0.55,0.5,-0.55).normalize();
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(40000,24,16),
  new THREE.ShaderMaterial({
    side:THREE.BackSide, depthWrite:false, fog:false,
    uniforms:{ top:{value:new THREE.Color(0x2c68a8)}, mid:{value:new THREE.Color(0x87b6de)}, hor:{value:HORIZON}, sun:{value:SUN}, sunK:{value:1} },
    vertexShader:'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform float sunK; uniform vec3 top; uniform vec3 mid; uniform vec3 hor; uniform vec3 sun; varying vec3 vP;'+
      'void main(){ vec3 d=normalize(vP); float h=clamp(d.y,0.0,1.0); vec3 c=mix(hor,mid,smoothstep(0.0,0.2,h)); c=mix(c,top,smoothstep(0.16,0.9,h));'+
      'float s=max(dot(d,sun),0.0); c=mix(c,vec3(1.0,0.95,0.86),pow(1.0-h,6.0)*0.35);'+          /* bright haze band at the horizon */
      'c+=vec3(1.0,0.86,0.62)*(pow(s,6.0)*0.18*(1.0-h*0.6)) + vec3(1.0,0.96,0.85)*(pow(s,48.0)*0.45+pow(s,900.0)*2.2*sunK+pow(s,160.0)*0.5*(sunK-1.0));'+   /* sun glow + disc */
      'if(d.y<0.0) c=hor; gl_FragColor=vec4(c,1.0); }'
  })
);
scene.add(sky);
const sunLight = new THREE.DirectionalLight(0xfff0d6, 1.25);
sunLight.position.copy(SUN).multiplyScalar(1000);
scene.add(sunLight); scene.add(sunLight.target);
scene.add(new THREE.HemisphereLight(0xc4e0ff, 0x56653f, 0.72));
/* sun shadows that follow the camera's subject (quality setting) */
renderer.toneMapping=THREE.NoToneMapping;   /* filmic curves washed out the stylized palette; keep colours vivid */
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
(function(){ const c=sunLight.shadow.camera; c.left=-75; c.right=75; c.top=75; c.bottom=-75; c.near=10; c.far=4200; sunLight.shadow.bias=-0.0006; if('normalBias' in sunLight.shadow) sunLight.shadow.normalBias=0.04; })();
/* image-based reflections for aircraft paint, metal and canopies, rendered from a small copy of the sky */
let ENVMAP=null;
try{ /* small hand-painted sky/ground cube (no PMREM: cheaper and safe on every mobile GPU) */
  const faces=[], sz=64;
  function face(kind){ const c=document.createElement('canvas'); c.width=c.height=sz; const x=c.getContext('2d');
    if(kind==='top'){ x.fillStyle='#3d78b6'; x.fillRect(0,0,sz,sz); }
    else if(kind==='bot'){ x.fillStyle='#4f5d3d'; x.fillRect(0,0,sz,sz); }
    else { const g=x.createLinearGradient(0,0,0,sz); g.addColorStop(0,'#3f7cba'); g.addColorStop(0.42,'#9cc3e2'); g.addColorStop(0.5,'#e6eef2'); g.addColorStop(0.53,'#7f8d6a'); g.addColorStop(1,'#4b5a3a'); x.fillStyle=g; x.fillRect(0,0,sz,sz);
      if(kind==='sun'){ const r=x.createRadialGradient(sz*0.5,sz*0.3,1,sz*0.5,sz*0.3,sz*0.35); r.addColorStop(0,'rgba(255,248,225,1)'); r.addColorStop(1,'rgba(255,248,225,0)'); x.fillStyle=r; x.fillRect(0,0,sz,sz); } }
    return c; }
  ENVMAP=new THREE.CubeTexture([face('sun'),face('side'),face('top'),face('bot'),face('side'),face('sun')]); ENVMAP.needsUpdate=true;
}catch(e){ ENVMAP=null; }
/* aircraft: turn the classic shiny materials into physically based ones (paint, metal, glass) */
const MCONV=new Map();
function stdOf(m){
  if(!m||!m.isMeshPhongMaterial) return m; if(MCONV.has(m)) return MCONV.get(m);
  const sh=m.shininess||30, glass=m.transparent&&m.opacity>0.5&&sh>=100;
  const s=new THREE.MeshStandardMaterial({color:m.color.clone(), map:m.map||null, emissive:m.emissive?m.emissive.clone():undefined, transparent:m.transparent, opacity:m.opacity, side:m.side,
    depthWrite:m.depthWrite, polygonOffset:m.polygonOffset, polygonOffsetFactor:m.polygonOffsetFactor, polygonOffsetUnits:m.polygonOffsetUnits, flatShading:!!m.flatShading,
    roughness: glass?0.06:Math.min(0.62,Math.max(0.34,1-sh/100)), metalness: glass?0.2:(m.map?0.05:0.32), envMap:ENVMAP, envMapIntensity: glass?1.5:0.9 });
  MCONV.set(m,s); return s;
}
function upgradeModel(g){
  g.traverse(function(o){ if(!o.isMesh) return;
    if(Array.isArray(o.material)) o.material=o.material.map(stdOf); else o.material=stdOf(o.material);
    const mm=Array.isArray(o.material)?o.material[0]:o.material; o.castShadow=!(mm&&(mm.isMeshBasicMaterial||mm.isSpriteMaterial||mm.blending===THREE.AdditiveBlending)); });
  return g;
}
function shadowsOn(){ return SETTINGS.shadows==null?shadowDefault():!!SETTINGS.shadows; }
function shadowDefault(){ let coarse=false; try{ coarse=window.matchMedia('(pointer:coarse)').matches; }catch(e){} return !coarse && SETTINGS.quality>=1; }
function applyShadows(){
  const on=shadowsOn(), q=SETTINGS.quality;
  renderer.shadowMap.enabled=on; sunLight.castShadow=on;
  const n=q>=2?2048:1024; if(sunLight.shadow.mapSize.x!==n){ sunLight.shadow.mapSize.set(n,n); if(sunLight.shadow.map){ sunLight.shadow.map.dispose(); sunLight.shadow.map=null; } }
  scene.traverse(function(o){ if(!o.isMesh&&!o.isInstancedMesh) return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(m) m.needsUpdate=true;
    if(o.userData.rs===undefined){ const big=o.geometry&&(o.geometry.boundingSphere||(o.geometry.computeBoundingSphere&&o.geometry.computeBoundingSphere(),o.geometry.boundingSphere));
      const basic=!m||m.isMeshBasicMaterial||m.isShaderMaterial||m.transparent; o.userData.rs=!basic; o.userData.cs=!basic&&!o.isInstancedMesh&&!(big&&big.radius>600); }
    o.receiveShadow=o.userData.rs; if(o.userData.cs) o.castShadow=true; });
}
const shFocus=new THREE.Vector3();
function shadowFollow(){
  if(!renderer.shadowMap.enabled) return;
  if(state==='menu'){ if(typeof cineOn==='function'&&cineOn()) shFocus.copy(CINE.pos); else shFocus.copy(MENUV.tgt); } else if(state==='walk'||(state==='paused'&&WALK.from==='walk')) shFocus.copy(camera.position); else shFocus.copy(S.pos);
  const tx=Math.round(shFocus.x/2)*2, ty=Math.round(shFocus.y/2)*2, tz=Math.round(shFocus.z/2)*2;       /* snap to reduce shimmering */
  sunLight.target.position.set(tx,ty,tz); sunLight.position.set(tx,ty,tz).addScaledVector(SUN,1800); sunLight.target.updateMatrixWorld();
}

