/* ------------------------------------------------------------------ livery: base colour, camouflage, gloss (code-built aircraft) */
const LIV={data:{}, base:{}, mats:{}};
try{ LIV.data=JSON.parse(stGet('ayy-livery')||'{}')||{}; }catch(e){ LIV.data={}; }
function livSave(){ try{ stSet('ayy-livery',JSON.stringify(LIV.data)); }catch(e){} }
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

