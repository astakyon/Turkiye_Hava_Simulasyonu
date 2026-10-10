/* ------------------------------------------------------------------ model library: inspect every model in 3D, test parts, repaint, import / export
   Opens from the main menu or Ayarlar → Grafik. Renders its own small studio scene (the game world is not drawn meanwhile).
   Livery and imported models are kept on this device (localStorage / IndexedDB) and used in the game right away. */
const LIB={on:false, scene:null, cam:null, holder:null, item:null, inst:null, obj:null, yaw:0.9, pitch:0.28, dist:24, dist0:24, tgt:new THREE.Vector3(), auto:true, idle:0,
  bg:0, tab:'info', tests:{gear:true, ab:false, wpn:false, spin:true, lights:true, wire:false, surf:false}, guides:false, helpers:null, floor:null, blob:null,
  raw:{}, wireMats:[], flash:null, msgT:0, vw:1, vh:1};
const LIB_BGS=[{n:'Hangar', top:'#2a323c', bot:'#12171d', floor:0x4c535b},{n:'Gündüz', top:'#4f8fd0', bot:'#d6e6f2', floor:0x7d9a5c},{n:'Gün batımı', top:'#2b3f6e', bot:'#f2a35e', floor:0x5a4a44},{n:'Stüdyo', top:'#eef1f4', bot:'#c9cfd5', floor:0xd6dade}];
function libItems(){
  const L=[];
  GROUPS.forEach(function(g){ L.push({head:g.name, sub:g.sub, off:!g.on}); if(!g.on) return;
    AC_ORDER.filter(function(id){ return regOf(id).grp===g.id; }).forEach(function(id){ L.push({key:'ac:'+id, kind:'ac', id:id, name:AIRCRAFT[id].name, sub:regOf(id).maker+' · '+(CLASSES[regOf(id).cls]||'')}); }); });
  L.push({head:'Yer araçları', sub:'Havalimanı'});
  [['veh:follow','BENİ İZLE aracı','Sürülebilir',function(){ return vehCar('follow'); }],['veh:pickup','Arazi kamyoneti','Devriye',function(){ return vehCar('pickup'); }],
   ['veh:fuel','Yakıt tankeri','İkmal',function(){ return vehTruck('fuel'); }],['veh:fire','İtfaiye aracı','Kurtarma',function(){ return vehTruck('fire'); }],
   ['veh:tug','Uçak çekici','Yer hizmeti',function(){ return vehTug(); }],['veh:gpu','Yer güç ünitesi','Yer hizmeti',function(){ return vehGPU(); }],['veh:bus','Personel otobüsü','Ulaşım',function(){ return vehBus(); }]]
    .forEach(function(v){ L.push({key:v[0], kind:'veh', name:v[1], sub:v[2], build:v[3]}); });
  L.push({head:'Ekipman', sub:'Hangar'});
  [['eq:bomb','Bomba arabası','Mühimmat',function(){ return prCart('bomb'); }],['eq:missile','Füze arabası','Mühimmat',function(){ return prCart('missile'); }],
   ['eq:stand','Bakım merdiveni','Bakım',function(){ return prStand(); }],['eq:bench','İş tezgâhı','Atölye',function(){ return prWorkbench(); }],['eq:chest','Takım dolabı','Atölye',function(){ return prToolChest(); }]]
    .forEach(function(v){ L.push({key:v[0], kind:'eq', name:v[1], sub:v[2], build:v[3]}); });
  return L;
}
function libMsg(t,err){ const el=$('libMsg'); el.textContent=t||''; el.classList.toggle('err',!!err); LIB.msgT=t?6:0; }
function libBgTex(b){ return apTex(4,256,function(x,W,H){ const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,b.top); g.addColorStop(0.62,b.bot); g.addColorStop(1,b.bot); x.fillStyle=g; x.fillRect(0,0,W,H); }); }
function libSetup(){
  if(LIB.scene) return;
  const s=new THREE.Scene(); LIB.scene=s; LIB.cam=new THREE.PerspectiveCamera(38,1,0.1,2000);
  s.add(new THREE.HemisphereLight(0xdfeeff,0x3a3f46,0.85));
  const key=new THREE.DirectionalLight(0xffffff,1.05); key.position.set(30,42,24); s.add(key);
  const rim=new THREE.DirectionalLight(0xb8d4ff,0.45); rim.position.set(-34,18,-30); s.add(rim);
  const fl=new THREE.Mesh(new THREE.CircleGeometry(1,64).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x4c535b})); s.add(fl); LIB.floor=fl;
  LIB.blob=blobMesh(); s.add(LIB.blob);
  LIB.holder=new THREE.Group(); s.add(LIB.holder);
  LIB.bgTex=LIB_BGS.map(libBgTex);
}
function openLibrary(key){
  if(state==='play'||state==='walk') return;
  libSetup(); closeModals(); state='library'; menuMode='library'; LIB.on=true;
  showScreen(''); $('libUI').classList.remove('hidden');
  libRenderList(); libSelect(key||LIB.item&&LIB.item.key||('ac:'+selectedId)); libSetBg(LIB.bg); libLayout();
}
function closeLibrary(){
  if(!LIB.on) return; libWire(false); libClear(); LIB.on=false; $('libUI').classList.add('hidden');
  enterTitle();
}
function libRenderList(){
  $('libList').innerHTML=libItems().map(function(it){
    if(it.head) return '<h4>'+it.head+'<small>'+it.sub+'</small></h4>';
    const skin=it.kind==='ac'&&MODELS.skins[it.id], liv=it.kind==='ac'&&LIV.data[it.id];
    return '<button type="button" data-k="'+it.key+'"'+(LIB.item&&LIB.item.key===it.key?' aria-current="true"':'')+'><b>'+it.name+(skin?'<span class="tagm">GLB</span>':'')+(liv&&!skin?'<span class="tagm" style="background:#ffc24a">BOYA</span>':'')+'</b><small>'+it.sub+'</small></button>';
  }).join('');
}
function libClear(){
  if(LIB.inst){ untrackModel(LIB.inst); }
  while(LIB.holder&&LIB.holder.children.length) LIB.holder.remove(LIB.holder.children[0]);
  LIB.inst=null; LIB.obj=null; libGuides(false,true);
}
function libSelect(key){
  const it=libItems().find(function(i){ return i.key===key; }); if(!it) return;
  libWire(false); libClear(); LIB.item=it; LIB.tests.wpn=false; LIB.tests.ab=false; LIB.tests.gear=true; LIB.tests.surf=false;
  let obj;
  if(it.kind==='ac'){ const m=buildModel(it.id); LIB.inst=m; obj=m.group; obj.position.set(0,AIRFIELD_Y*0+AIRCRAFT[it.id].gearOff,0); m.flames.forEach(function(f){ f.outer.scale.set(1,1,0.05); f.inner.scale.set(1,1,0.05); }); }
  else { obj=it.build(); obj.traverse(function(o){ if(o.isMesh&&o.material&&o.material.isMeshPhongMaterial) o.material=stdOf(o.material); }); }
  LIB.obj=obj; LIB.holder.add(obj);
  libFrame(); libRenderList(); libRefreshPanel();
  if(LIB.guides) libGuides(true);
}
/* frame the camera on the model and size the floor */
function libFrame(){
  const obj=LIB.obj; if(!obj) return; obj.updateMatrixWorld(true);
  const bb=libBox(), sz=bb.getSize(new THREE.Vector3()), c=bb.getCenter(new THREE.Vector3());
  LIB.tgt.copy(c); LIB.size=sz; const R=Math.max(sz.x,sz.y,sz.z);
  LIB.dist0=LIB.dist=Math.max(4,R*1.75); LIB.floor.scale.setScalar(Math.max(8,R*2.2)); LIB.floor.position.y=bb.min.y-0.02;
  LIB.blob.position.set(c.x,bb.min.y+0.01,c.z); LIB.blob.scale.set(Math.max(1,sz.x*0.85),1,Math.max(1,sz.z*0.95));
}
function libBox(){ const bb=new THREE.Box3(), m=LIB.inst;
  LIB.obj.updateMatrixWorld(true);
  LIB.obj.traverse(function(o){ if(!o.isMesh||!o.visible) return; let p=o; while(p&&p!==LIB.obj){ if(!p.visible) return; p=p.parent; }
    if(m&&m.flames&&m.flames.some(function(f){ return f.outer===o||f.inner===o; })) return; if(m&&m.stores&&isChildOf(o,m.stores)) return;
    o.geometry.computeBoundingBox&&!o.geometry.boundingBox&&o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox; if(!b) return; bb.union(b.clone().applyMatrix4(o.matrixWorld)); });
  if(bb.isEmpty()) bb.setFromCenterAndSize(new THREE.Vector3(),new THREE.Vector3(10,3,10)); return bb; }
function isChildOf(o,p){ while(o){ if(o===p) return true; o=o.parent; } return false; }
function libStats(){
  let tri=0, meshes=0; const mats=new Set();
  LIB.obj.traverse(function(o){ if(!o.isMesh||!o.visible) return; let p=o.parent; while(p){ if(!p.visible) return; p=p.parent; } meshes++;
    const g=o.geometry; tri+=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1); (Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){ mats.add(m); }); });
  return {tri:Math.round(tri), meshes:meshes, mats:mats.size};
}
function libSrc(){ const it=LIB.item; if(!it||it.kind!=='ac') return {t:'Kod modeli', glb:false};
  const sk=MODELS.skins[it.id]; if(!sk) return {t:'Kod modeli', glb:false};
  return {t:sk.spec.local?'GLB · bu cihazda':(sk.spec.preview?'GLB · deneme':'GLB · models.json'), glb:true}; }
function libRefreshPanel(){
  const it=LIB.item; if(!it) return; const ac=it.kind==='ac', def=ac?AIRCRAFT[it.id]:null, src=libSrc();
  $('libKind').textContent=ac?(GROUPS.find(function(g){ return g.id===regOf(it.id).grp; }).name.toUpperCase()+' · '+regOf(it.id).maker):(it.kind==='veh'?'YER ARACI':'EKİPMAN');
  $('libName').textContent=it.name; const sr=$('libSrc'); sr.textContent=src.t; sr.classList.toggle('glb',src.glb);
  const bb=libBox(), sz=bb.getSize(new THREE.Vector3()), st=libStats(), f=function(v){ return v.toFixed(1).replace('.',',')+' m'; };
  const rows=[['Uzunluk',f(sz.z)],[ac?'Kanat açıklığı':'Genişlik',f(sz.x)],['Yükseklik',f(sz.y)],['Üçgen',st.tri.toLocaleString('tr-TR')],['Parça',String(st.meshes)],['Malzeme',String(st.mats)]];
  if(ac) rows.unshift(['Sınıf',CLASSES[regOf(it.id).cls]||'—']), rows.push(['Silah yeri',SLOTS[it.id]>0?String(SLOTS[it.id]):'—'],['Mürettebat',def.uav?'İnsansız':'Pilotlu']);
  $('libInfo').innerHTML=rows.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'; }).join('');
  ['look','model'].forEach(function(t){ $('libTabs').querySelector('[data-t="'+t+'"]').disabled=!ac; });
  if(!ac&&(LIB.tab==='look'||LIB.tab==='model')) libTab('info'); else libTab(LIB.tab);
  libRefreshTests(); libRefreshLook(); libRefreshModel();
}
function libTab(t){ LIB.tab=t; Array.prototype.forEach.call($('libTabs').children,function(b){ b.setAttribute('aria-selected',String(b.dataset.t===t)); });
  Array.prototype.forEach.call(document.querySelectorAll('#libUI .lpanel section'),function(s){ s.hidden=s.dataset.t!==t; }); }
/* ---- test tab */
const LIB_TESTS=[['gear','İniş takımı'],['ab','Motor / art yakıcı'],['wpn','Silahlar'],['spin','Pervane'],['lights','Seyir ışıkları'],['surf','Kumanda yüzeyleri'],['wire','Tel kafes']];
function libRefreshTests(){
  const it=LIB.item, m=LIB.inst, ac=it.kind==='ac';
  const can={gear:ac&&!!m.gear, ab:ac&&m.flames.length>0, wpn:ac&&SLOTS[it.id]>0, spin:ac&&m.spinners&&m.spinners.length>0, lights:ac&&!!m.strobe, surf:ac&&!!(m.surfaces&&m.surfaces.length), wire:true};
  $('libTests').innerHTML=LIB_TESTS.map(function(t){ return '<button type="button" data-x="'+t[0]+'" aria-pressed="'+(!!LIB.tests[t[0]]&&can[t[0]])+'"'+(can[t[0]]?'':' disabled')+'>'+t[1]+'</button>'; }).join('');
  $('libTestNote').textContent=ac?(can.surf?'Kumanda yüzeyleri modeldeki işaretli parçalarla oynar.':'Kumanda yüzeyi testi için içe aktarılmış modelde parçaları işaretle (Model sekmesi).'):'Yer araçları ve ekipman için yalnızca tel kafes görünümü.';
}
function libToggle(k){ LIB.tests[k]=!LIB.tests[k]; if(k==='wire') libWire(LIB.tests.wire); if(k==='wpn') libStores(); if(k==='gear') libApplyTests(); libRefreshTests(); if(k==='gear'||k==='wpn') libFrame(); }
function libApplyTests(){ const m=LIB.inst; if(!m) return; if(m.gear) m.gear.visible=!!LIB.tests.gear; }
function libStores(){
  const m=LIB.inst; if(!m) return;
  if(!m.stores){ m.stores=new THREE.Group(); m.group.add(m.stores); } const g=m.stores; while(g.children.length) g.remove(g.children[0]);
  if(!LIB.tests.wpn) return;
  const id=LIB.item.id; m.group.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(m.group), inv=new THREE.Matrix4().copy(m.group.matrixWorld).invert(); bb.applyMatrix4(inv);
  const tipX=bb.max.x, k=clamp(tipX/6,0.6,1.5), zc=bb.min.z+(bb.max.z-bb.min.z)*0.62-1.2*k, y=PYLON_Y[id]||-0.4, l=loadoutOf(id), list=[];
  WORDER.forEach(function(w){ for(let i=0;i<(l[w]||0);i++) list.push(w); });
  list.forEach(function(w,i){ const side=i%2?1:-1, idx=Math.floor(i/2), W=WEAPONS[w];
    const s=new THREE.Mesh(W.kind==='bomb'?bombVisGeo:misVisGeo,stdOf(W.kind==='bomb'?bombMats[w]:misVisMat)); s.position.set(side*tipX*(0.16+0.1*idx),y,zc); s.scale.setScalar(k); g.add(s); });
}
function libWire(on){
  if(!on){ LIB.wireMats.forEach(function(m){ m.wireframe=false; }); LIB.wireMats=[]; LIB.tests.wire=false; return; }
  if(!LIB.obj) return; LIB.obj.traverse(function(o){ if(!o.isMesh) return; (Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){ if(m&&!m.wireframe&&LIB.wireMats.indexOf(m)<0){ m.wireframe=true; LIB.wireMats.push(m); } }); });
}
/* ---- guides: grid, forward arrow, bounding box */
function libGuides(on,quiet){
  if(LIB.helpers){ LIB.helpers.forEach(function(h){ LIB.scene.remove(h); }); LIB.helpers=null; }
  if(!on||!LIB.obj) return;
  const bb=libBox(), sz=bb.getSize(new THREE.Vector3()), R=Math.max(sz.x,sz.z)*1.4;
  const grid=new THREE.GridHelper(Math.ceil(R/2)*2,Math.ceil(R/2),0xff4a4a,0x8a96a3); grid.position.y=bb.min.y+0.01;
  const arr=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(0,bb.min.y+0.05,bb.min.z),Math.max(2,sz.z*0.35),0xff2a38,0.8,0.5);
  const box=new THREE.Box3Helper(bb,0x7dffb0);
  LIB.helpers=[grid,arr,box]; LIB.helpers.forEach(function(h){ LIB.scene.add(h); });
}
/* ---- per frame */
function libStep(dt){
  if(LIB.msgT>0){ LIB.msgT-=dt; if(LIB.msgT<=0) libMsg(''); }
  const m=LIB.inst;
  if(m){
    if(m.gear) m.gear.visible=!!LIB.tests.gear;
    const ab=LIB.tests.ab, len=ab?(0.9+2.4+5.5):0.05, wd=ab?1.15:1;
    m.flames.forEach(function(f){ const fl=1+(ab?(Math.random()-.5)*0.2:0); f.outer.scale.set(wd,wd,len*fl); f.inner.scale.set(wd,wd,len*0.55*fl); });
    (m.spinners||[]).forEach(function(sp){ if(LIB.tests.spin){ sp.obj.rotation.z+=dt*(ab?40:14); if(sp.disc&&sp.disc.material) sp.disc.material.opacity=ab?0.18:0.08; } });
    if(m.strobe) m.strobe.visible=LIB.tests.lights&&Math.sin(T*9)>0.6;
    if(m.surfaces&&m.surfaces.length) m.surfaces.forEach(function(s,i){ const v=LIB.tests.surf?Math.sin(T*2.2+i*0.7):0; s.n.rotation[s.axis]=s.base+v*s.max*s.sign; });
  }
  if(LIB.flash){ LIB.flash.t-=dt; const on=LIB.flash.t>0&&Math.sin(LIB.flash.t*18)>0; LIB.flash.mats.forEach(function(x){ if(x.m.emissive) x.m.emissive.setHex(on?0xff3030:x.e); }); if(LIB.flash.t<=0) LIB.flash=null; }
  LIB.idle+=dt; if(LIB.auto&&LIB.idle>1.5) LIB.yaw+=dt*0.25;
  const cp=Math.cos(LIB.pitch), sp2=Math.sin(LIB.pitch), c=LIB.cam;
  c.position.set(LIB.tgt.x+Math.sin(LIB.yaw)*cp*LIB.dist, LIB.tgt.y+sp2*LIB.dist, LIB.tgt.z+Math.cos(LIB.yaw)*cp*LIB.dist);
  if(c.position.y<LIB.floor.position.y+0.3) c.position.y=LIB.floor.position.y+0.3;
  c.lookAt(LIB.tgt); c.near=Math.max(0.05,LIB.dist/200); c.far=LIB.dist*30; c.updateProjectionMatrix();
}
function libRender(){
  const W=renderer.domElement.clientWidth||window.innerWidth, H=renderer.domElement.clientHeight||window.innerHeight;
  const lv=$('libView').getBoundingClientRect(), shift=(lv.left+lv.width/2)-W/2;
  if(LIB.vw!==W||LIB.vh!==H||LIB.shift!==shift){ LIB.vw=W; LIB.vh=H; LIB.shift=shift; LIB.cam.aspect=W/H; LIB.cam.setViewOffset(W,H,-shift,0,W,H); }
  renderer.render(LIB.scene,LIB.cam);
}
function libLayout(){ LIB.shift=null; }
function libSetBg(i){ LIB.bg=i; const b=LIB_BGS[i]; LIB.scene.background=LIB.bgTex[i]; LIB.floor.material.color.setHex(b.floor); $('libBgN').textContent=b.n; }
function libOrbit(dx,dy){ LIB.yaw-=dx*0.007; LIB.pitch=clamp(LIB.pitch+dy*0.005,-0.15,1.45); LIB.idle=0; }
function libZoom(f){ LIB.dist=clamp(LIB.dist*f,LIB.dist0*0.25,LIB.dist0*3); LIB.idle=0; }

/* ------------------------------------------------------------------ livery: base colour, camouflage, gloss (code-built aircraft) */
const LIV={data:{}, base:{}, mats:{}};
try{ LIV.data=JSON.parse(localStorage.getItem('ayy-livery')||'{}')||{}; }catch(e){ LIV.data={}; }
function livSave(){ try{ localStorage.setItem('ayy-livery',JSON.stringify(LIV.data)); }catch(e){} }
const LIV_COLORS=['#c3c9ce','#8e979f','#5d6670','#2f363d','#c9b48a','#6f7a52','#3f5a78','#e9ecef'];
function meshArea(g){ const p=g.attributes.position, ix=g.index, a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(); let s=0; const n=ix?ix.count:p.count;
  for(let i=0;i<n;i+=3){ const i0=ix?ix.getX(i):i, i1=ix?ix.getX(i+1):i+1, i2=ix?ix.getX(i+2):i+2; a.fromBufferAttribute(p,i0); b.fromBufferAttribute(p,i1); c.fromBufferAttribute(p,i2); s+=b.sub(a).cross(c.sub(a)).length()*0.5; } return s; }
/* the paint colour of a code model = the opaque material colour covering the most surface */
function livBaseHex(m){
  const id=m.acId; if(LIV.base[id]!=null) return LIV.base[id];
  const area={}; m.group.traverse(function(o){ if(!o.isMesh) return; const mt=o.userData.liv0||o.material; if(!mt||Array.isArray(mt)||!mt.color||mt.transparent||mt.isMeshBasicMaterial) return;
    if(m.gear&&isChildOf(o,m.gear)) return; const k=mt.color.getHex(); o.scale; area[k]=(area[k]||0)+meshArea(o.geometry)*o.scale.x*o.scale.z; });
  let best=null, bv=0; for(const k in area) if(area[k]>bv){ bv=area[k]; best=+k; }
  LIV.base[id]=best; return best;
}
function livMaterial(id,orig){
  const key=id+'|'+orig.uuid; let mt=LIV.mats[key]; const d=LIV.data[id]||{};
  if(!mt){ mt=orig.clone(); mt.userData=Object.assign({},orig.userData);
    const U={uCamoK:{value:0}, uCamo2:{value:new THREE.Color()}, uCamoS:{value:1}}; mt.userData.livU=U;
    mt.onBeforeCompile=function(sh){ Object.assign(sh.uniforms,U);
      sh.vertexShader='varying vec3 vLivP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vLivP=position;');
      sh.fragmentShader='varying vec3 vLivP; uniform float uCamoK; uniform vec3 uCamo2; uniform float uCamoS;\n'+
        'float lvh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }\n'+
        'float lvn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(lvh(i),lvh(i+vec2(1,0)),f.x),mix(lvh(i+vec2(0,1)),lvh(i+vec2(1,1)),f.x),f.y); }\n'+
        sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+
        ' if(uCamoK>0.5){ vec2 q=(vLivP.xz+vec2(vLivP.y*0.7,-vLivP.y*0.4))/uCamoS; float k=0.0;'+
        '  if(uCamoK<1.5){ float n=lvn(q*0.42)*0.65+lvn(q*1.1)*0.35; k=smoothstep(0.5,0.54,n); }'+
        '  else if(uCamoK<2.5){ vec2 c=floor(q*2.2); float n=lvh(c)*0.5+lvn(c*0.21)*0.5; k=step(0.52,n); }'+
        '  else { float n=sin((q.x*0.9+q.y*0.55+lvn(q*0.5)*2.2)*1.6); k=smoothstep(0.15,0.25,n); }'+
        '  diffuseColor.rgb=mix(diffuseColor.rgb,uCamo2,k); }');
    };
    mt.customProgramCacheKey=function(){ return 'ayy-livery'; };
    LIV.mats[key]=mt;
  }
  mt.color.copy(d.color?new THREE.Color(d.color):orig.color);
  if('roughness' in mt) mt.roughness=d.gloss!=null?clamp(0.85-d.gloss*0.7,0.12,0.9):orig.roughness;
  if('metalness' in mt) mt.metalness=d.gloss!=null?clamp(0.1+d.gloss*0.35,0,0.5):orig.metalness;
  const U=mt.userData.livU; U.uCamoK.value=d.camo||0; U.uCamo2.value.set(d.camo2||'#5d6670'); U.uCamoS.value=d.camoS||1;
  return mt;
}
function applyLivery(m){
  if(!m||!m.group||!m.acId) return; const id=m.acId, d=LIV.data[id], base=livBaseHex(m);
  m.group.traverse(function(o){ if(!o.isMesh) return; const orig=o.userData.liv0||o.material; if(!orig||Array.isArray(orig)||!orig.color) return;
    if(m.skin&&isChildOf(o,m.skin)) return;
    if(!d||orig.color.getHex()!==base||(m.gear&&isChildOf(o,m.gear))){ if(o.userData.liv0){ o.material=o.userData.liv0; delete o.userData.liv0; } return; }
    o.userData.liv0=orig; o.material=livMaterial(id,orig); });
}
function liveryRefresh(id){ (MODELS.inst[id]||[]).forEach(applyLivery); if(LIB.inst&&LIB.inst.acId===id) applyLivery(LIB.inst); }
function livSet(id,patch){ const d=Object.assign({},LIV.data[id]||{},patch); LIV.data[id]=d; livSave(); liveryRefresh(id); libRefreshLook(); libRenderList(); }
function livReset(id){ delete LIV.data[id]; livSave(); liveryRefresh(id); libRefreshLook(); libRenderList(); }
function libRefreshLook(){
  const it=LIB.item; if(!it||it.kind!=='ac') return; const d=LIV.data[it.id]||{}, skin=!!MODELS.skins[it.id];
  $('libLookNote').textContent=skin?'Bu uçak içe aktarılmış bir model kullanıyor; boya ayarları yalnızca kod modelinde geçerli. Model sekmesinden kod modeline dönebilirsin.':'Ana boya rengini, kamuflaj desenini ve yüzey parlaklığını değiştir.';
  const base=LIB.inst?livBaseHex(LIB.inst):null, cur=d.color||null;
  $('libColors').innerHTML='<button type="button" class="orig" data-col="" aria-pressed="'+(!cur)+'">Orijinal</button>'+LIV_COLORS.map(function(c){ return '<button type="button" data-col="'+c+'" style="background:'+c+'" aria-pressed="'+(cur===c)+'" aria-label="'+c+'"></button>'; }).join('');
  $('libColor').value=cur||('#'+('000000'+(base!=null?base:0x9aa4ad).toString(16)).slice(-6));
  Array.prototype.forEach.call($('libCamo').children,function(b){ b.setAttribute('aria-pressed',String(+b.dataset.c===(d.camo||0))); });
  $('libColor2').value=d.camo2||'#5d6670'; $('libCamoS').value=d.camoS||1; $('libGloss').value=d.gloss!=null?d.gloss:0.5;
}

/* ------------------------------------------------------------------ import: many formats → .glb, kept on this device (IndexedDB) */
const MDB={db:null};
function mdbOpen(){ if(MDB.db) return Promise.resolve(MDB.db); if(typeof indexedDB==='undefined') return Promise.reject(new Error('IndexedDB yok'));
  return new Promise(function(res,rej){ const r=indexedDB.open('ayyildiz-models',1); r.onupgradeneeded=function(){ r.result.createObjectStore('skins',{keyPath:'id'}); }; r.onsuccess=function(){ MDB.db=r.result; res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
function mdbTx(mode,fn){ return mdbOpen().then(function(db){ return new Promise(function(res,rej){ const tx=db.transaction('skins',mode), st=tx.objectStore('skins'), q=fn(st); tx.oncomplete=function(){ res(q&&q.result); }; tx.onerror=function(){ rej(tx.error); }; }); }); }
function mdbPut(rec){ return mdbTx('readwrite',function(s){ return s.put(rec); }); }
function mdbDel(id){ return mdbTx('readwrite',function(s){ return s.delete(id); }); }
function mdbAll(){ return mdbTx('readonly',function(s){ return s.getAll(); }); }
/* models saved on this device win over assets/models.json */
function localModelsInit(){
  mdbAll().then(function(list){ (list||[]).forEach(function(r){ if(!AIRCRAFT[r.id]||!r.glb) return;
    gltfLoader().then(function(l){ l.parse(r.glb,'',function(g){ LIB.raw[r.id]={root:g.scene, glb:r.glb, name:r.name}; setSkin(r.id,g.scene,Object.assign({},r.spec,{local:true})); if(LIB.on) libRenderList(); },function(){}); }); }); }).catch(function(){});
}
const EXT_PRI=['glb','gltf','fbx','obj','dae','stl'];
function extOf(n){ const m=/\.([a-z0-9]+)$/i.exec(n||''); return m?m[1].toLowerCase():''; }
function importFiles(files,id){
  files=Array.prototype.slice.call(files||[]); if(!files.length) return;
  id=id||(LIB.item&&LIB.item.kind==='ac'?LIB.item.id:selectedId);
  const main=EXT_PRI.map(function(e){ return files.find(function(f){ return extOf(f.name)===e; }); }).find(Boolean);
  if(!main){ libMsg('Desteklenen model dosyası yok (.glb .gltf .fbx .obj .stl .dae)',true); return; }
  const ext=extOf(main.name), urls={}; files.forEach(function(f){ urls[f.name.toLowerCase()]=URL.createObjectURL(f); });
  const mgr=new THREE.LoadingManager(); mgr.setURLModifier(function(u){ if(/^(blob|data):/.test(u)&&!/\/[^\/]*\.[a-z0-9]{2,4}$/i.test(u)) return u; const n=decodeURIComponent(u.split(/[\\\/]/).pop().split('?')[0]).toLowerCase(); return urls[n]||u; });
  libMsg('Model okunuyor: '+main.name+' …');
  const need={glb:['GLTFLoader','DRACOLoader'],gltf:['GLTFLoader','DRACOLoader'],fbx:['fflate','NURBSUtils','NURBSCurve','TGALoader','FBXLoader'],obj:['MTLLoader','OBJLoader'],dae:['TGALoader','ColladaLoader'],stl:['STLLoader']}[ext].concat(['GLTFExporter']);
  const done=function(){ Object.keys(urls).forEach(function(k){ URL.revokeObjectURL(urls[k]); }); };
  needLibs(need).then(function(){ return readModel(ext,main,files,mgr,urls); }).then(function(root){
    if(!root) throw new Error('boş model');
    if(ext==='glb') return main.arrayBuffer().then(function(buf){ return {root:root, glb:buf}; });
    return toGLB(root).then(function(buf){ return gltfLoader().then(function(l){ return new Promise(function(res,rej){ l.parse(buf,'',function(g){ res({root:g.scene, glb:buf}); },rej); }); }); });
  }).then(function(r){
    done(); const prev=MODELS.skins[id]&&MODELS.skins[id].spec&&MODELS.skins[id].spec.local?MODELS.skins[id].spec:null;
    const spec={rotation:ext==='stl'?[-90,0,0]:[0,0,0], local:true};   /* STL files are usually Z-up */
    if(prev&&LIB.raw[id]&&LIB.raw[id].name===main.name){ spec.rotation=prev.rotation.slice(); }
    LIB.raw[id]={root:r.root, glb:r.glb, name:main.name}; setSkin(id,r.root,spec); libPersist(id);
    libMsg(AIRCRAFT[id].name+' ← '+main.name+' ('+Math.round(r.glb.byteLength/1024)+' KB). Yön yanlışsa Model sekmesinden döndür.');
    if(LIB.on){ libSelect('ac:'+id); libTab('model'); }
  }).catch(function(e){ done(); console.warn(e); libMsg('Model yüklenemedi: '+(e&&e.message||e),true); });
}
function readModel(ext,main,files,mgr,urls){
  if(ext==='glb'||ext==='gltf') return gltfLoader().then(function(l){ return new Promise(function(res,rej){
    if(ext==='glb') main.arrayBuffer().then(function(b){ l.parse(b,'',function(g){ res(g.scene); },rej); });
    else { const l2=new THREE.GLTFLoader(mgr); if(l.dracoLoader) l2.setDRACOLoader(l.dracoLoader); l2.load(urls[main.name.toLowerCase()],function(g){ res(g.scene); },undefined,rej); } }); });
  if(ext==='fbx') return main.arrayBuffer().then(function(b){ return new THREE.FBXLoader(mgr).parse(b,''); });
  if(ext==='stl') return main.arrayBuffer().then(function(b){ const g=new THREE.STLLoader().parse(b); g.computeVertexNormals();
    const col=g.hasColors?new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.5,metalness:0.2}):new THREE.MeshStandardMaterial({color:0xa9b1b8,roughness:0.5,metalness:0.25}); const m=new THREE.Mesh(g,col); m.name='stl'; const r=new THREE.Group(); r.add(m); return r; });
  if(ext==='dae') return main.text().then(function(t){ return new THREE.ColladaLoader(mgr).parse(t,'').scene; });
  if(ext==='obj'){ const mtl=files.find(function(f){ return extOf(f.name)==='mtl'; });
    return (mtl?mtl.text():Promise.resolve(null)).then(function(mt){ return main.text().then(function(t){ const ol=new THREE.OBJLoader(mgr);
      if(mt){ const mats=new THREE.MTLLoader(mgr).parse(mt,''); mats.preload(); ol.setMaterials(mats); } return ol.parse(t); }); }); }
  return Promise.reject(new Error('desteklenmeyen biçim'));
}
function toGLB(root){ return new Promise(function(res,rej){ try{ new THREE.GLTFExporter().parse(root,function(b){ res(b); },{binary:true, onlyVisible:true, embedImages:true, maxTextureSize:2048}); }catch(e){ rej(e); } }); }
function libPersist(id){ const r=LIB.raw[id], sk=MODELS.skins[id]; if(!r||!sk) return;
  const spec=libSpecOut(sk.spec); mdbPut({id:id, name:r.name, glb:r.glb, spec:spec}).catch(function(e){ libMsg('Cihaza kaydedilemedi: '+(e&&e.message||e),true); }); }
function libSpecOut(s){ const o={rotation:(s.rotation||[0,0,0]).slice()}; ['length','offset','gearNodes','propNodes','surfaces','flames'].forEach(function(k){ if(s[k]!=null&&!(Array.isArray(s[k])&&!s[k].length)) o[k]=JSON.parse(JSON.stringify(s[k])); }); return o; }
function libReskin(patch){
  const it=LIB.item; if(!it||it.kind!=='ac') return; const id=it.id, sk=MODELS.skins[id], r=LIB.raw[id]; if(!sk||!r) return;
  const spec=Object.assign({},sk.spec,patch); if(r.root.parent) r.root.parent.remove(r.root);
  setSkin(id,r.root,spec); libPersist(id); libSelectKeep();
}
function libSelectKeep(){ const yaw=LIB.yaw, pitch=LIB.pitch, d=LIB.dist/LIB.dist0, tests=Object.assign({},LIB.tests); libSelect(LIB.item.key); LIB.yaw=yaw; LIB.pitch=pitch; LIB.dist=LIB.dist0*d; Object.assign(LIB.tests,tests,{wire:false}); libApplyTests(); libStores(); libRefreshTests(); }
function libRemoveSkin(){ const it=LIB.item; if(!it||it.kind!=='ac') return; const id=it.id; clearSkin(id); delete LIB.raw[id]; mdbDel(id).catch(function(){});
  if(MODELS.manifest&&MODELS.manifest.models&&MODELS.manifest.models[id]){ MODELS.busy[id]=null; loadModelFile(id,MODELS.manifest.models[id]); }
  libMsg(AIRCRAFT[id].name+' kod modeline döndü'); libSelectKeep(); }
const PART_ROLES=[['','—'],['gear','İniş takımı'],['prop','Pervane'],['ail_l','Kanatçık sol'],['ail_r','Kanatçık sağ'],['elev','İrtifa dümeni'],['rud','İstikamet dümeni']];
function libPartRole(spec,n){
  if((spec.gearNodes||[]).indexOf(n)>=0) return 'gear'; if((spec.propNodes||[]).indexOf(n)>=0) return 'prop';
  const s=(spec.surfaces||[]).find(function(x){ return x.node===n; }); if(!s) return '';
  return s.input==='roll'?(s.sign<0?'ail_l':'ail_r'):(s.input==='pitch'?'elev':'rud');
}
function libSetPart(n,role){
  const sk=MODELS.skins[LIB.item.id]; const s=sk.spec;
  const gear=(s.gearNodes||[]).filter(function(x){ return x!==n; }), prop=(s.propNodes||[]).filter(function(x){ return x!==n; }), surf=(s.surfaces||[]).filter(function(x){ return x.node!==n; });
  if(role==='gear') gear.push(n); else if(role==='prop') prop.push(n);
  else if(role==='ail_l') surf.push({node:n,axis:'x',input:'roll',max:18,sign:-1}); else if(role==='ail_r') surf.push({node:n,axis:'x',input:'roll',max:18,sign:1});
  else if(role==='elev') surf.push({node:n,axis:'x',input:'pitch',max:20,sign:1}); else if(role==='rud') surf.push({node:n,axis:'y',input:'yaw',max:22,sign:1});
  libReskin({gearNodes:gear.length?gear:null, propNodes:prop.length?prop:null, surfaces:surf});
  if(role==='surf'||/ail|elev|rud/.test(role)){ LIB.tests.surf=true; libRefreshTests(); }
}
function libFlashPart(n){
  const m=LIB.inst; if(!m||!m.skin) return; const o=m.skin.getObjectByName(n); if(!o) return; const mats=[];
  o.traverse(function(c){ if(!c.isMesh) return; const arr=Array.isArray(c.material)?c.material:[c.material];
    const nm=arr.map(function(x){ const k=x.clone(); mats.push({m:k,e:x.emissive?x.emissive.getHex():0}); return k; }); c.material=Array.isArray(c.material)?nm:nm[0]; });
  LIB.flash={t:1.6, mats:mats};
}
function libRefreshModel(){
  const it=LIB.item; if(!it||it.kind!=='ac') return; const id=it.id, sk=MODELS.skins[id], r=LIB.raw[id];
  const editable=!!(sk&&r);
  $('libModelNote').textContent=sk?(editable?'İçe aktarılmış model: '+r.name+'. Yön, boy ve hareketli parçaları buradan ayarla; değişiklikler bu cihazda saklanır.':'Bu model assets/models.json dosyasından geliyor. Düzenlemek için aynı dosyayı buradan içe aktar.'):'Şu an kodla çizilen model kullanılıyor. Kendi modelini yükleyebilirsin; oyunda hangar, sen ve yapay zekâ kopyalarına uygulanır.';
  $('libSkinBox').hidden=!editable; $('libJsonOut').hidden=true; if(!editable) return;
  const s=sk.spec; $('libRotV').textContent='Döndürme: X '+s.rotation[0]+'°, Y '+s.rotation[1]+'°, Z '+s.rotation[2]+'° · burun kırmızı oka (Kılavuz) bakmalı';
  const bb=libBox(); $('libLen').value=(s.length||(bb.max.z-bb.min.z)).toFixed(1); $('libOffY').value=s.offset?s.offset[1]:0;
  const names=[]; r.root.traverse(function(o){ if(o!==r.root&&o.name&&names.indexOf(o.name)<0&&names.length<300) names.push(o.name); });
  $('libParts').innerHTML=names.length?names.map(function(n){ const role=libPartRole(s,n);
    return '<div class="pr"><button type="button" data-n="'+n.replace(/"/g,'&quot;')+'" title="'+n.replace(/"/g,'&quot;')+'">'+n.replace(/</g,'&lt;')+'</button><select data-n="'+n.replace(/"/g,'&quot;')+'">'+PART_ROLES.map(function(p){ return '<option value="'+p[0]+'"'+(p[0]===role?' selected':'')+'>'+p[1]+'</option>'; }).join('')+'</select></div>'; }).join(''):'<div class="pr">Modelde adlandırılmış parça yok</div>';
}
function libJsonLine(){
  const id=LIB.item.id, s=libSpecOut(MODELS.skins[id].spec), o={file:'assets/models/'+id+'.glb'}; Object.assign(o,s);
  const txt='"'+id+'": '+JSON.stringify(o);
  const el=$('libJsonOut'); el.textContent=txt+'\n\n.glb dosyasını assets/models/'+id+'.glb olarak kaydet (Bilgi → .glb olarak indir).'; el.hidden=false;
  try{ navigator.clipboard.writeText(txt).then(function(){ libMsg('models.json satırı kopyalandı'); },function(){}); }catch(e){}
}
/* export what is on screen (code model or imported one, with current paint) as .glb */
function libExport(){
  const it=LIB.item; if(!it||!LIB.obj) return; libMsg('.glb hazırlanıyor…');
  needLibs(['GLTFExporter']).then(function(){
    const m=LIB.inst, hide=[]; if(m){ m.flames.forEach(function(f){ [f.outer,f.inner].forEach(function(x){ if(x.visible){ x.visible=false; hide.push(x); } }); }); }
    if(LIB.helpers) LIB.helpers.forEach(function(h){ h.visible=false; });
    const wire=LIB.wireMats.slice(); libWire(false);
    const pos=LIB.obj.position.clone(); LIB.obj.position.set(0,0,0); LIB.obj.updateMatrixWorld(true);
    return toGLB(LIB.obj).then(function(buf){ LIB.obj.position.copy(pos); hide.forEach(function(x){ x.visible=true; }); if(LIB.helpers) LIB.helpers.forEach(function(h){ h.visible=true; }); if(wire.length) libWire(true);
      const name=(it.kind==='ac'?it.id:it.key.replace(':','-'))+'.glb', a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([buf],{type:'model/gltf-binary'})); a.download=name; document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },2000); libMsg(name+' indirildi ('+Math.round(buf.byteLength/1024)+' KB)'); LIB.lastExport=buf; });
  }).catch(function(e){ libMsg('Dışa aktarılamadı: '+(e&&e.message||e),true); });
}
/* ---- wiring */
$('libList').addEventListener('click',function(e){ const b=e.target.closest('button[data-k]'); if(b) libSelect(b.dataset.k); });
$('libTabs').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled) libTab(b.dataset.t); });
$('libTests').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b&&!b.disabled) libToggle(b.dataset.x); });
$('btnLibBack').addEventListener('click',closeLibrary);
$('libBg').addEventListener('click',function(){ libSetBg((LIB.bg+1)%LIB_BGS.length); });
$('libRot').addEventListener('click',function(){ LIB.auto=!LIB.auto; $('libRot').setAttribute('aria-pressed',String(LIB.auto)); });
$('libGuide').addEventListener('click',function(){ LIB.guides=!LIB.guides; $('libGuide').setAttribute('aria-pressed',String(LIB.guides)); libGuides(LIB.guides); });
$('libReset').addEventListener('click',function(){ LIB.yaw=0.9; LIB.pitch=0.28; LIB.dist=LIB.dist0; LIB.idle=0; });
$('libExport').addEventListener('click',libExport);
$('libColors').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; livSet(LIB.item.id,{color:b.dataset.col||null}); });
$('libColor').addEventListener('input',function(e){ livSet(LIB.item.id,{color:e.target.value}); });
$('libCamo').addEventListener('click',function(e){ const b=e.target.closest('button'); if(b) livSet(LIB.item.id,{camo:+b.dataset.c}); });
$('libColor2').addEventListener('input',function(e){ livSet(LIB.item.id,{camo2:e.target.value, camo:(LIV.data[LIB.item.id]||{}).camo||1}); });
$('libCamoS').addEventListener('input',function(e){ livSet(LIB.item.id,{camoS:+e.target.value}); });
$('libGloss').addEventListener('input',function(e){ livSet(LIB.item.id,{gloss:+e.target.value}); });
$('libLookReset').addEventListener('click',function(){ livReset(LIB.item.id); });
$('libImport').addEventListener('click',function(){ $('libFile').click(); });
$('libFile').addEventListener('change',function(e){ importFiles(e.target.files); e.target.value=''; });
document.querySelector('#libSkinBox .seg').addEventListener('click',function(e){ const b=e.target.closest('button'); if(!b) return; const sk=MODELS.skins[LIB.item.id]; const r=sk.spec.rotation.slice(); r[+b.dataset.r]=(r[+b.dataset.r]+90)%360; libReskin({rotation:r}); });
$('libLen').addEventListener('change',function(e){ const v=+e.target.value; if(v>0.5) libReskin({length:v, scale:null}); });
$('libOffY').addEventListener('change',function(e){ libReskin({offset:[0,+e.target.value,0]}); });
$('libParts').addEventListener('click',function(e){ const b=e.target.closest('button[data-n]'); if(b) libFlashPart(b.dataset.n); });
$('libParts').addEventListener('change',function(e){ const s=e.target.closest('select'); if(s) libSetPart(s.dataset.n,s.value); });
$('libJson').addEventListener('click',libJsonLine);
$('libRemove').addEventListener('click',libRemoveSkin);
$('btnLibOpen').addEventListener('click',function(){ if(state==='menu') openLibrary(); else toast('Model kütüphanesi ana menüden açılır','#ffc24a'); });
window.addEventListener('dragover',function(e){ if(e.dataTransfer&&Array.prototype.indexOf.call(e.dataTransfer.types||[],'Files')>=0) e.preventDefault(); });
window.addEventListener('drop',function(e){ const f=e.dataTransfer&&e.dataTransfer.files; if(!f||!f.length) return; e.preventDefault(); if(state==='menu'&&!LIB.on) openLibrary('ac:'+selectedId); if(LIB.on) importFiles(f); });
