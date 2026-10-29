/* ------------------------------------------------------------------ model library: inspect every model in 3D, test parts, repaint, import / export
   Opens from the main menu or Ayarlar → Grafik. Renders its own small studio scene (the game world is not drawn meanwhile).
   Livery and imported models are kept on this device (localStorage / IndexedDB) and used in the game right away. */
const LIB={on:false, scene:null, cam:null, holder:null, item:null, inst:null, obj:null, yaw:0.9, pitch:0.28, dist:24, dist0:24, tgt:new THREE.Vector3(), auto:true, idle:0,
  bg:0, tab:'info', tests:{gear:true, ab:false, wpn:false, spin:true, lights:true, wire:false, surf:false}, guides:false, helpers:null, floor:null, blob:null,
  raw:{}, wireMats:[], flash:null, msgT:0, vw:1, vh:1};
const LIB_BGS=[{n:'Hangar', top:'#2a323c', bot:'#12171d', floor:0x4c535b},{n:'Gündüz', top:'#4f8fd0', bot:'#d6e6f2', floor:0x7d9a5c},{n:'Gün batımı', top:'#2b3f6e', bot:'#f2a35e', floor:0x5a4a44},{n:'Stüdyo', top:'#eef1f4', bot:'#c9cfd5', floor:0xd6dade}];
const LIB_CATS=[['hava','Hava'],['heli','Helikopter'],['deniz','Deniz'],['kara','Kara'],['sivil','Sivil']];
function libItems(){
  const L=[], add=function(cat,key,kind,name,sub,build,x){ L.push(Object.assign({cat:cat,key:key,kind:kind,name:name,sub:sub,build:build},x||{})); }, head=function(cat,h,sub,off){ L.push({cat:cat,head:h,sub:sub,off:off}); };
  const G=function(f){ return function(){ return f().group; }; };
  GROUPS.forEach(function(g){ head('hava',g.name,g.sub,!g.on); if(!g.on) return;
    AC_ORDER.filter(function(id){ return regOf(id).grp===g.id; }).forEach(function(id){ L.push({cat:'hava', key:'ac:'+id, kind:'ac', id:id, name:AIRCRAFT[id].name, sub:regOf(id).maker+' · '+(CLASSES[regOf(id).cls]||'')}); }); });
  head('hava','Mühimmat','Gerçek Türk mühimmatı · model serisi');   /* V2.41 */
  Object.keys(MUNI).forEach(function(mid){ const mu=MUNI[mid]; add('hava','mun:'+mid,'mun',mu.ad,mu.uretici,function(){ const g=new THREE.Group(), ms=munMesh(mid,false); ms.position.y=mu.dia/2+0.25; g.add(ms); return g; },{mid:mid}); });
  head('hava','Ekipman','Hangar');
  [['eq:bomb','Bomba arabası','Mühimmat',function(){ return prCart('bomb'); }],['eq:missile','Füze arabası','Mühimmat',function(){ return prCart('missile'); }],
   ['eq:stand','Bakım merdiveni','Bakım',function(){ return prStand(); }],['eq:bench','İş tezgâhı','Atölye',function(){ return prWorkbench(); }],['eq:chest','Takım dolabı','Atölye',function(){ return prToolChest(); }]]
    .forEach(function(v){ add('hava',v[0],'eq',v[1],v[2],v[3]); });
  head('heli','Helikopterler','Gezintide binilebilir');
  [['t129','Taarruz · TUSAŞ'],['t625','Genel maksat · TUSAŞ']].forEach(function(h){ add('heli','heli:'+h[0],'heli',HELI_DEF[h[0]].name,h[1],function(){ const m=heliModel(h[0]); LIB.heli=m; return m.g; },{buildOld:function(){ const m=heliModelV1(h[0]); LIB.heli=m; return m.g; }}); });
  head('deniz','Savaş gemileri','Hilal Deniz Üssü');
  add('deniz','sh:istif','ship','İstif sınıfı fırkateyn','F-515 · Fırkateyn',G(function(){ return buildFrigate('istif','F-515'); }),{buildOld:G(function(){ return buildFrigateV1('istif','F-515'); })});
  add('deniz','sh:ada','ship','Ada sınıfı korvet','F-511 · Korvet',G(function(){ return buildFrigate('ada','F-511'); }),{buildOld:G(function(){ return buildFrigateV1('ada','F-511'); })});
  add('deniz','sh:anadolu','ship','TCG Anadolu','L-400 · Amfibi hücum gemisi',G(buildAnadolu),{buildOld:G(buildAnadoluV1)});
  add('deniz','sh:sub','ship','Denizaltı','Reis sınıfı',G(buildSub));
  add('deniz','sh:patrol','ship','Hücumbot','Karakol',G(function(){ return buildPatrol('P-1200'); }),{buildOld:G(function(){ return buildPatrolV1('P-1200'); })});
  add('deniz','sh:tug','ship','Römorkör','Liman hizmeti',G(buildTug));
  head('deniz','Sivil gemiler','Marina ve açık deniz');
  add('deniz','sh:ferry','ship','Feribot','Yolcu',G(buildFerry)); add('deniz','sh:cargo','ship','Konteyner gemisi','Yük',G(function(){ return buildCargo('#1d5aa8'); }));
  add('deniz','sh:tanker','ship','Tanker','Yük',G(buildTanker)); add('deniz','sh:fishing','ship','Balıkçı teknesi','Balıkçılık',G(function(){ return buildFishing('#2f6aa5'); }));
  add('deniz','sh:sail','ship','Yelkenli','Gezi',G(function(){ return buildSailboat(true); }));
  head('kara','Zırhlı araçlar','Bozkurtlar');
  add('kara','ld:altay','land','Altay','Ana muharebe tankı',G(buildAltay),{buildOld:G(buildAltayV1)}); add('kara','ld:firtina','land','Fırtına','Kundağı motorlu obüs',G(buildFirtina),{buildOld:G(buildFirtinaV1)});
  add('kara','ld:pars','land','Pars','Zırhlı muharebe aracı',G(buildPars),{buildOld:G(buildParsV1)}); add('kara','ld:kirpi','land','Kirpi','Mayına dayanıklı araç',G(buildKirpi),{buildOld:G(buildKirpiV1)});
  head('kara','Hava savunma ve destek','Bozkurtlar');
  add('kara','ld:hisar','land','Hisar','Hava savunma füzesi',G(buildHisar),{buildOld:G(buildHisarV1)}); add('kara','ld:korkut','land','Korkut','Uçaksavar topu',G(buildKorkut),{buildOld:G(buildKorkutV1)});
  add('kara','ld:radar','land','Radar aracı','Erken ihbar',G(buildRadarTruck)); add('kara','ld:truck','land','Askerî kamyon','Lojistik',G(buildArmyTruck));
  add('kara','car:mil','car','Bozkurtlar 4×4','Gezintide sürülebilir',function(){ return carModel('mil').g; });
  add('kara','veh:pickup','veh','Arazi kamyoneti','Devriye',function(){ return vehCar('pickup'); });
  head('sivil','Otomobiller','Gezintide sürülebilir');
  add('sivil','car:suv','car','Ay Yıldız SUV','Beyaz',function(){ return carModel('suv').g; }); add('sivil','car:suvR','car','Ay Yıldız SUV','Kırmızı',function(){ return carModel('suvR').g; });
  add('sivil','car:follow','car','BENİ İZLE aracı','Havalimanı',function(){ return carModel('follow').g; });
  head('sivil','Havalimanı araçları','Yer hizmetleri');
  [['veh:fuel','Yakıt tankeri','İkmal',function(){ return vehTruck('fuel'); }],['veh:fire','İtfaiye aracı','Kurtarma',function(){ return vehTruck('fire'); }],
   ['veh:tug','Uçak çekici','Yer hizmeti',function(){ return vehTug(); }],['veh:gpu','Yer güç ünitesi','Yer hizmeti',function(){ return vehGPU(); }],['veh:bus','Personel otobüsü','Ulaşım',function(){ return vehBus(); }]]
    .forEach(function(v){ add('sivil',v[0],'veh',v[1],v[2],v[3]); });
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
  const cur=LIB.item&&LIB.item.cat; if(!LIB.cat) LIB.cat=cur||'hava';
  $('libList').innerHTML='<div class="lcats">'+LIB_CATS.map(function(c){ return '<button type="button" data-cat="'+c[0]+'"'+(LIB.cat===c[0]?' aria-pressed="true"':'')+'>'+c[1]+'</button>'; }).join('')+'</div>'+libItems().filter(function(it){ return it.cat===LIB.cat; }).map(function(it){
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
  libWire(false); libClear(); if(!LIB.item||LIB.item.key!==key) LIB.tests.old=false; LIB.item=it; LIB.cat=it.cat; LIB.heli=null; LIB.tests.wpn=false; LIB.tests.fold=false; LIB.tests.ab=false; LIB.tests.gear=true; LIB.tests.surf=false;
  let obj;
  if(it.kind==='ac'){ const def=AIRCRAFT[it.id], old=LIB.tests.old&&def.buildOld; let m; if(old){ m=def.buildOld(); upgradeModel(m.group); m.acId=it.id; } else m=buildModel(it.id); LIB.inst=m; obj=m.group; obj.position.set(0,AIRFIELD_Y*0+AIRCRAFT[it.id].gearOff,0); m.flames.forEach(function(f){ f.outer.scale.set(1,1,0.05); f.inner.scale.set(1,1,0.05); }); }
  else { obj=(LIB.tests.old&&it.buildOld?it.buildOld:it.build)(); obj.traverse(function(o){ if(o.isMesh&&o.material&&o.material.isMeshPhongMaterial) o.material=stdOf(o.material); }); }
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
  $('libKind').textContent=ac?(GROUPS.find(function(g){ return g.id===regOf(it.id).grp; }).name.toUpperCase()+' · '+regOf(it.id).maker):({mun:'MÜHİMMAT',veh:'YER ARACI',eq:'EKİPMAN',heli:'HELİKOPTER',ship:'DENİZ ARACI',land:'KARA ARACI',car:'OTOMOBİL'}[it.kind]||'MODEL');
  $('libName').textContent=it.name; const sr=$('libSrc'); sr.textContent=src.t; sr.classList.toggle('glb',src.glb);
  const bb=libBox(), sz=bb.getSize(new THREE.Vector3()), st=libStats(), f=function(v){ return v.toFixed(1).replace('.',',')+' m'; };
  const rows=[['Uzunluk',f(sz.z)],[ac?'Kanat açıklığı':'Genişlik',f(sz.x)],['Yükseklik',f(sz.y)],['Üçgen',st.tri.toLocaleString('tr-TR')],['Parça',String(st.meshes)],['Malzeme',String(st.mats)]];
  if(ac) rows.unshift(['Sınıf',CLASSES[regOf(it.id).cls]||'—']), rows.push(['Silah yeri',SLOTS[it.id]>0?String(SLOTS[it.id]):'—'],['Mürettebat',def.uav?'İnsansız':'Pilotlu']);
  if(it.kind==='mun'){ const mu=MUNI[it.mid], car=Object.keys(AC_MUNI).filter(function(id){ return Object.keys(AC_MUNI[id]).some(function(k){ return AC_MUNI[id][k]===it.mid; }); }).map(function(id){ return AIRCRAFT[id].short; });
    rows.length=0; rows.push(['Tür',mu.kind==='bomb'?'Bomba':'Güdümlü füze'],['Üretici',mu.uretici],['Uzunluk',f(mu.len)],['Çap',Math.round(mu.dia*1000)+' mm'],['Ağırlık',mu.kg+' kg'],['Taşıyan',car.join(', ')||'—']); }
  const mun=ac&&AC_MUNI[it.id]?wpnOf(it.id).map(function(k){ const mu=munOf(it.id,k); return mu?'<dt>'+mu.kisa+'</dt><dd>'+mu.ad+(munInBay(it.id,k)?' · iç silah yuvası':' · kanat altı')+'<small>'+mu.gercek+'</small></dd>':''; }).join(''):'';
  $('libInfo').innerHTML=rows.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'; }).join('')+(mun?'<dt class="lmh">Mühimmat</dt><dd class="lmh">gerçek Türk mühimmatı</dd>'+mun+'<dd class="lmsrc">Kaynak: '+MUN_SRC+'</dd>':'')+(it.kind==='mun'?'<dd class="lmsrc">'+MUNI[it.mid].gercek+'<br>Kaynak: '+MUN_SRC+'</dd>':'');
  ['look','model'].forEach(function(t){ $('libTabs').querySelector('[data-t="'+t+'"]').disabled=!ac; });
  if(!ac&&(LIB.tab==='look'||LIB.tab==='model')) libTab('info'); else libTab(LIB.tab);
  libRefreshTests(); libRefreshLook(); libRefreshModel();
}
function libTab(t){ LIB.tab=t; Array.prototype.forEach.call($('libTabs').children,function(b){ b.setAttribute('aria-selected',String(b.dataset.t===t)); });
  Array.prototype.forEach.call(document.querySelectorAll('#libUI .lpanel section'),function(s){ s.hidden=s.dataset.t!==t; }); }
/* ---- test tab */
const LIB_TESTS=[['old','Eski modelle karşılaştır'],['gear','İniş takımı'],['ab','Motor / art yakıcı'],['wpn','Silahlar'],['spin','Pervane'],['lights','Seyir ışıkları'],['surf','Kumanda yüzeyleri'],['fold','Kanatları katla'],['wire','Tel kafes']];
function libRefreshTests(){
  const it=LIB.item, m=LIB.inst, ac=it.kind==='ac';
  const can={old:ac?!!AIRCRAFT[it.id].buildOld:!!it.buildOld, gear:ac&&!!m.gear, ab:ac&&m.flames.length>0, wpn:ac&&SLOTS[it.id]>0, spin:ac&&m.spinners&&m.spinners.length>0, lights:ac&&!!m.strobe, surf:ac&&!!(m.surfaces&&m.surfaces.length), fold:ac&&!!(m.folds&&m.folds.length), wire:true};
  $('libTests').innerHTML=LIB_TESTS.map(function(t){ return '<button type="button" data-x="'+t[0]+'" aria-pressed="'+(!!LIB.tests[t[0]]&&can[t[0]])+'"'+(can[t[0]]?'':' disabled')+'>'+t[1]+'</button>'; }).join('');
  $('libTestNote').textContent=ac?(can.surf?'Kumanda yüzeyleri modeldeki işaretli parçalarla oynar.':'Kumanda yüzeyi testi için içe aktarılmış modelde parçaları işaretle (Model sekmesi).'):'Yer araçları ve ekipman için yalnızca tel kafes görünümü.';
}
function libToggle(k){ LIB.tests[k]=!LIB.tests[k]; if(k==='old'){ libSelectKeep(); return; } if(k==='wire') libWire(LIB.tests.wire); if(k==='wpn') libStores(); if(k==='gear') libApplyTests(); if(k==='fold') tbFold(LIB.inst,LIB.tests.fold?1:0); libRefreshTests(); if(k==='gear'||k==='wpn') libFrame(); }
function libApplyTests(){ const m=LIB.inst; if(!m) return; if(m.gear) m.gear.visible=!!LIB.tests.gear; }
function libStores(){
  const m=LIB.inst; if(!m) return;
  if(!m.stores){ m.stores=new THREE.Group(); m.group.add(m.stores); } const g=m.stores; while(g.children.length) g.remove(g.children[0]);
  munDoors(m,LIB.tests.wpn?1:0); if(!LIB.tests.wpn) return;
  const id=LIB.item.id; m.group.updateMatrixWorld(true);
  const l=loadoutOf(id), list=[]; WORDER.forEach(function(w){ for(let i=0;i<(l[w]||0);i++) list.push(w); });
  const P=storeLayout(m,id,list,'lib:'+id);   /* V2.30: the same stations as in flight (measured under the wing, clear of the gear) */
  list.forEach(function(w,i){ g.add(storeMesh(id,w,P[i],true)); }); munDoors(m,1);   /* V2.41: real munitions, bay doors open */
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
    m.flames.forEach(function(f){ const fl=1+(ab?(Math.random()-.5)*0.2:0); f.outer.visible=f.inner.visible=ab; f.outer.scale.set(wd,wd,len*fl); f.inner.scale.set(wd,wd,len*0.55*fl); });
    (m.spinners||[]).forEach(function(sp){ if(LIB.tests.spin){ sp.obj.rotation.z+=dt*(ab?40:14); if(sp.disc&&sp.disc.material) sp.disc.material.opacity=ab?0.18:0.08; } });
    if(m.strobe) m.strobe.visible=LIB.tests.lights&&Math.sin(T*9)>0.6;
    if(m.surfaces&&m.surfaces.length) m.surfaces.forEach(function(s,i){ const v=LIB.tests.surf?Math.sin(T*2.2+i*0.7):0; s.n.rotation[s.axis]=s.base+v*s.max*s.sign; });
  }
  if(LIB.flash){ LIB.flash.t-=dt; const on=LIB.flash.t>0&&Math.sin(LIB.flash.t*18)>0; LIB.flash.mats.forEach(function(x){ if(x.m.emissive) x.m.emissive.setHex(on?0xff3030:x.e); }); if(LIB.flash.t<=0) LIB.flash=null; }
  if(LIB.heli&&LIB.tests.spin){ LIB.heli.rotor.rotation.y+=dt*9; LIB.heli.trot.rotation.x+=dt*40; }
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

