/* ------------------------------------------------------------------ terrain */
function hash(x,y){ let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263); h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; }
function vnoise(x,y){ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi; const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  const a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
function fbm(x,y,oct){ let s=0,a=.5,f=1,n=0; for(let i=0;i<oct;i++){ s+=a*vnoise(x*f+i*17.3,y*f+i*9.1); n+=a; a*=.5; f*=2.03; } return s/n; }

const AIRFIELD_Y = 22;
/* flat pads cut into the terrain for the bases (x0..x1, z0..z1 fully flat at y; smooth falloff `f` metres; `hardWest`: no
   falloff on the sea side so the quay meets deep water). DECKS: walkable surfaces above the terrain (quays, piers). */
const PADS=[{id:'naval',x0:-1990,x1:-1500,z0:-4300,z1:-3150,y:2.7,f:380,hard:'w'},
  {id:'land',x0:400,x1:1900,z0:-7950,z1:-7250,y:34,f:320},{id:'range',x0:2120,x1:3300,z0:-7800,z1:-7520,y:34,f:260},
  {id:'town',x0:-9300,x1:-7100,z0:-7350,z1:-6760,y:16,f:350},
  {id:'radar',x0:5300,x1:5420,z0:-2730,z1:-2630,y:1148,f:160},
  {id:'kale',x0:9230,x1:9390,z0:7930,z1:8075,y:9,f:110},
  {id:'obs',x0:10650,x1:10750,z0:-10550,z1:-10450,y:895,f:130},
  {id:'skitop',x0:6660,x1:6740,z0:-5090,z1:-5010,y:1858,f:120},
  {id:'skibase',x0:4270,x1:4410,z0:-5530,z1:-5400,y:486,f:220},
  {id:'antik',x0:-6260,x1:-5900,z0:5620,z1:5820,y:20,f:220},
  {id:'enemy',enemy:true,x0:-10500,x1:-8700,z0:9300,z1:9900,y:132,f:420},
  {id:'uav',x0:10900,x1:11800,z0:10150,z1:12650,y:45,f:360},
  {id:'city',x0:-2700,x1:-200,z0:5950,z1:6650,y:32,f:380},
  {id:'hpTown',x0:-8240,x1:-8160,z0:-6770,z1:-6695,y:16,f:90},
  {id:'lake',x0:1640,x1:1760,z0:-3810,z1:-3690,y:84,f:210},
  {id:'marina',fr:{cx:2350,cz:1250,a:0.536},x0:-260,x1:40,z0:-290,z1:260,y:2.7,f:300,hard:'e'}];
const DECKS=[];
/* optional rotated frame `fr` {cx,cz,a}: local x = along (cos a, sin a), local z = along (−sin a, cos a) */
/* V2.24: returns one shared pair (every caller reads it at once) — terrainH/groundH run hundreds of times a frame */
const FR_L=[0,0];
function frLocal(fr,x,z){ if(!fr){ FR_L[0]=x; FR_L[1]=z; return FR_L; } if(fr.c==null){ fr.c=Math.cos(fr.a); fr.s=Math.sin(fr.a); } const dx=x-fr.cx, dz=z-fr.cz, c=fr.c, s=fr.s; FR_L[0]=dx*c+dz*s; FR_L[1]=-dx*s+dz*c; return FR_L; }
function frWorld(fr,lx,lz){ const c=Math.cos(fr.a), s=Math.sin(fr.a); return [fr.cx+lx*c-lz*s, fr.cz+lx*s+lz*c]; }
function padW(p,x,z){
  if(p.fr){ const l=frLocal(p.fr,x,z); x=l[0]; z=l[1]; } const hd=p.hard||'';
  let dx=0; if(x<p.x0){ if(hd.indexOf('w')>=0){ if(x<p.x0-6) return 0; } else dx=p.x0-x; } else if(x>p.x1){ if(hd.indexOf('e')>=0){ if(x>p.x1+6) return 0; } else dx=x-p.x1; }
  const dz=z<p.z0?p.z0-z:(z>p.z1?z-p.z1:0); if(dx>=p.f||dz>=p.f) return 0;
  return (1-smooth(0,p.f,dx))*(1-smooth(0,p.f,dz));
}
function inFriendlyPad(x,z,m){ return PADS.some(function(p){ if(p.enemy) return false; const l=frLocal(p.fr,x,z); return l[0]>p.x0-m&&l[0]<p.x1+m&&l[1]>p.z0-m&&l[1]<p.z1+m; }); }
function inAnyPad(x,z,m){ return PADS.some(function(p){ const l=frLocal(p.fr,x,z); return l[0]>p.x0-m&&l[0]<p.x1+m&&l[1]>p.z0-m&&l[1]<p.z1+m; }); }
function inPad(id,x,z,m){ const p=PADS.find(function(q){ return q.id===id; }); m=m||0; const l=frLocal(p.fr,x,z); return l[0]>p.x0-m&&l[0]<p.x1+m&&l[1]>p.z0-m&&l[1]<p.z1+m; }
/* walkable ground height: terrain, raised by decks (quays, piers; decks may carry a rotated frame) */
function groundH(x,z){ let h=terrainH(x,z); for(let i=0;i<DECKS.length;i++){ const d=DECKS[i], l=d.fr?frLocal(d.fr,x,z):null, lx=l?l[0]:x, lz=l?l[1]:z; if(lx>d.x0&&lx<d.x1&&lz>d.z0&&lz<d.z1){ const y=d.yf?d.yf(lx,lz):d.y; if(y>h) h=y; } } return h; }
function terrainH(x,z){
  const n = fbm(x/11000+3.1, z/11000+7.7, 4);
  const land = smooth(0.40,0.58,n);
  const ridge = Math.max(0, 1 - Math.abs(2*fbm(x/4800+11.3, z/4800+2.9, 5)-1)*2.4);
  const mount = Math.pow(ridge,1.6) * smooth(0.50,0.74,n) * 1700;
  const hills = fbm(x/1700+5.5, z/1700+1.7, 4) * 260 * land;
  let h = -45 + land*95 + hills + mount;
  const d = Math.hypot(x,z);
  const w = 1 - smooth(1800,4200,d);
  h += (AIRFIELD_Y - h)*w;
  const e = 1 - smooth(11500,14800,Math.max(Math.abs(x),Math.abs(z)));
  h = -45 + (h+45)*e;
  for(let i=0;i<PADS.length;i++){ const pw=padW(PADS[i],x,z); if(pw>0) h+=(PADS[i].y-h)*pw; }
  return h;
}

/* Terrain tiles with levels of detail (V2.21). Before: one 30 km mesh, 300×300 cells of 100 m = 180 k triangles drawn in every
   frame, also behind the camera. Now the same 100 m height grid (terrainH, sampled once) is cut into 6×6 tiles of 5 km; each
   tile has four versions (every 1st, 2nd, 5th, 10th grid point: 100/200/500/1000 m) and shows the one its distance asks for
   (98ze-terrain-lod.js). All versions use the same grid points, normals and colours, so a coarse tile is the fine one with
   points left out. Where a fine tile meets a coarse one the small gap is hidden by a skirt (a strip hanging down from the
   tile edge, in the edge colour). Heights for physics come from terrainH() as before, never from the drawn mesh. */
const TER={N:6, SEG:50, STEPS:[1,2,5,10], tiles:[], mat:null, size:30000, cell:100, grid:301, tris:0};
(function buildTerrain(){
  const SIZE=TER.size, GS=TER.grid, CELL=TER.cell, H0=-SIZE/2;
  const H=new Float32Array(GS*GS); for(let j=0;j<GS;j++) for(let i=0;i<GS;i++) H[j*GS+i]=terrainH(H0+i*CELL,H0+j*CELL);
  const NR=new Float32Array(GS*GS*3), hAt=function(i,j){ i=i<0?0:i>=GS?GS-1:i; j=j<0?0:j>=GS?GS-1:j; return H[j*GS+i]; };
  for(let j=0;j<GS;j++) for(let i=0;i<GS;i++){ const dx=(hAt(i+1,j)-hAt(i-1,j))/(2*CELL), dz=(hAt(i,j+1)-hAt(i,j-1))/(2*CELL), l=Math.hypot(dx,1,dz), k=(j*GS+i)*3; NR[k]=-dx/l; NR[k+1]=1/l; NR[k+2]=-dz/l; }
  const col = new Float32Array(GS*GS*3);
  const cDeep=new THREE.Color(0x17394d), cShallow=new THREE.Color(0x3d8a8a), cSand=new THREE.Color(0xd6c79b),
        cGA=new THREE.Color(0x4a7a38), cGB=new THREE.Color(0x7d9a4c), cDry=new THREE.Color(0x95905c),
        cRA=new THREE.Color(0x756e66), cRB=new THREE.Color(0x9a948c), cSnow=new THREE.Color(0xf1f5f9), cField=new THREE.Color(0x70a052);
  const A=new THREE.Color(), B=new THREE.Color();
  for(let v=0;v<GS*GS;v++){
    const x=H0+(v%GS)*CELL, z=H0+Math.floor(v/GS)*CELL, h=H[v], ny=NR[v*3+1];
    const n1=fbm(x/310+5, z/310+9, 3);
    let pw=0; for(let k=0;k<PADS.length;k++) pw=Math.max(pw,padW(PADS[k],x,z));
    if(pw>0.25&&h>0.5&&h<600){ A.copy(cGA).lerp(cGB,n1*0.6); }
    else if(h<1.2){ A.copy(cDeep).lerp(cShallow, smooth(-40,0,h)); }
    else if(h<9){ A.copy(cSand).lerp(cGA, smooth(5,9,h)); }
    else{
      A.copy(cGA).lerp(cGB,n1); A.lerp(cDry, smooth(250,650,h)*0.7);
      const d=Math.hypot(x,z); if(d<1900) A.lerp(cField, 0.65*(1-smooth(1500,1900,d)));
      const rock=Math.max(smooth(520,950,h+(n1-.5)*180), smooth(0.84,0.64,ny));
      B.copy(cRA).lerp(cRB,n1); A.lerp(B,rock);
      A.lerp(cSnow, smooth(1050,1300,h+(n1-.5)*220)*smooth(0.45,0.78,ny));
    }
    col[v*3]=A.r; col[v*3+1]=A.g; col[v*3+2]=A.b;
  }
  TER.mat=new THREE.MeshLambertMaterial({vertexColors:true});
  /* one tile version: grid points i0..i0+SEG, j0..j0+SEG every 'st' points, plus a skirt along the four edges */
  const tileGeo=function(i0,j0,st){ const n=TER.SEG/st, nv=(n+1)*(n+1), ns=4*(n+1); let hmin=1e9, hmax=-1e9;
    const pos=new Float32Array((nv+ns)*3), nor=new Float32Array((nv+ns)*3), cl=new Float32Array((nv+ns)*3), idx=[];
    const put=function(o,g,y){ pos[o*3]=H0+(g%GS)*CELL; pos[o*3+1]=y; pos[o*3+2]=H0+Math.floor(g/GS)*CELL; for(let c=0;c<3;c++){ nor[o*3+c]=NR[g*3+c]; cl[o*3+c]=col[g*3+c]; } };
    for(let b=0;b<=n;b++) for(let a=0;a<=n;a++){ const g=(j0+b*st)*GS+(i0+a*st), h=H[g]; if(h<hmin) hmin=h; if(h>hmax) hmax=h; put(b*(n+1)+a,g,h); }
    for(let b=0;b<n;b++) for(let a=0;a<n;a++){ const v0=b*(n+1)+a, v1=v0+n+1, v2=v0+1, v3=v1+1; idx.push(v0,v1,v2, v1,v3,v2); }
    const depth=Math.min(600,40+(hmax-hmin)*0.3); let o=nv;
    const edge=function(f){ const L=[]; for(let t=0;t<=n;t++) L.push(f(t)); return L; }, V=function(a,b){ return b*(n+1)+a; };
    [edge(function(t){ return V(t,0); }),edge(function(t){ return V(t,n); }),edge(function(t){ return V(0,t); }),edge(function(t){ return V(n,t); })].forEach(function(E){
      const base=o; E.forEach(function(v){ const a=v%(n+1), b=Math.floor(v/(n+1)), g=(j0+b*st)*GS+(i0+a*st); put(o,g,H[g]-depth); o++; });
      for(let t=0;t<n;t++){ const ea=E[t], eb=E[t+1], sa=base+t, sb=base+t+1; idx.push(ea,sa,eb, eb,sa,sb, ea,eb,sa, eb,sb,sa); } });   /* both windings: seen from either side */
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(cl,3));
    g.setIndex(idx); g.computeBoundingSphere(); g.computeBoundingBox(); g.userData.tris=n*n*2; g.userData.rng=hmax-hmin; return g; };
  for(let tj=0;tj<TER.N;tj++) for(let ti=0;ti<TER.N;ti++){ const i0=ti*TER.SEG, j0=tj*TER.SEG;
    const geos=TER.STEPS.map(function(st){ return tileGeo(i0,j0,st); });
    const m=new THREE.Mesh(geos[0],TER.mat); m.userData.terrainTile=true; m.userData.noMerge=true; m.userData.noBake=true; m.matrixAutoUpdate=false;   /* identity, never moves */
    const bb=geos[0].boundingBox; TER.tiles.push({m:m, geos:geos, lv:0, box:bb.clone(), rng:geos[0].userData.rng}); scene.add(m); }
  TER.H=H;

  const wg = new THREE.PlaneGeometry(90000,90000); wg.rotateX(-Math.PI/2);
  const water = new THREE.Mesh(wg, new THREE.MeshPhongMaterial({color:0x2a7aa8, specular:0xffffff, shininess:90, transparent:true, opacity:0.84}));
  scene.add(water); GFX.water=water;

  // trees
  const tg = new THREE.ConeGeometry(5,20,6); tg.translate(0,10,0);
  const NT = 14000;
  const trees = new THREE.InstancedMesh(tg, new THREE.MeshLambertMaterial({color:0x2d5a2f, flatShading:true}), NT);
  const m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), s3=new THREE.Vector3(), p3=new THREE.Vector3();
  const r=mulberry32(99); let k=0;
  for(let tries=0; tries<170000 && k<NT; tries++){
    const x=(r()-.5)*28000, z=(r()-.5)*28000;
    if(fbm(x/900+40,z/900+40,2)<0.52) continue;
    if(Math.hypot(x,z)<1900) continue;
    const h=terrainH(x,z); if(h<10||h>520||inAnyPad(x,z,120)) continue;
    if(Math.abs(terrainH(x+25,z)-h)+Math.abs(terrainH(x,z+25)-h)>28) continue;
    for(let c=0;c<4 && k<NT;c++){
      const tx=x+(r()-.5)*160, tz=z+(r()-.5)*160, th=terrainH(tx,tz); if(th<10||inAnyPad(tx,tz,40)) continue;
      const sc=0.8+r()*1.6;
      m4.compose(p3.set(tx,th-1,tz), q4.setFromAxisAngle(UP,r()*6.28), s3.set(sc,sc*(0.9+r()*0.5),sc));
      trees.setMatrixAt(k++, m4);
    }
  }
  trees.count=k; GFX.trees=trees; GFX.treeN=k; trees.instanceMatrix.needsUpdate=true; trees.frustumCulled=false; scene.add(trees);

  // clouds
  const NCL=520;
  const clouds = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1), new THREE.MeshLambertMaterial({color:0xffffff, flatShading:true, transparent:true, opacity:0.93}), NCL);
  const cr=mulberry32(7); let ci=0;
  while(ci<NCL){
    const cx=(cr()-.5)*36000, cz=(cr()-.5)*36000, cy=2300+cr()*1500, n=4+Math.floor(cr()*5), base=140+cr()*220;
    for(let j=0;j<n && ci<NCL;j++){
      p3.set(cx+(cr()-.5)*base*2.2, cy+(cr()-.5)*base*.35, cz+(cr()-.5)*base*1.4);
      const sc=base*(0.55+cr()*0.6);
      m4.compose(p3, q4.setFromAxisAngle(UP,cr()*6.28), s3.set(sc,sc*.45,sc*.8));
      clouds.setMatrixAt(ci++, m4);
    }
  }
  clouds.instanceMatrix.needsUpdate=true; clouds.frustumCulled=false; scene.add(clouds); GFX.clouds=clouds; GFX.cloudN=NCL;
})();

