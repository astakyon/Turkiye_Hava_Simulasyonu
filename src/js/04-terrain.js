/* ------------------------------------------------------------------ terrain */
function hash(x,y){ let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263); h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; }
function vnoise(x,y){ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi; const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  const a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
function fbm(x,y,oct){ let s=0,a=.5,f=1,n=0; for(let i=0;i<oct;i++){ s+=a*vnoise(x*f+i*17.3,y*f+i*9.1); n+=a; a*=.5; f*=2.03; } return s/n; }

const AIRFIELD_Y = 22;
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
  return -45 + (h+45)*e;
}

(function buildTerrain(){
  const SIZE=30000, SEG=300;
  const g = new THREE.PlaneGeometry(SIZE,SIZE,SEG,SEG); g.rotateX(-Math.PI/2);
  const p = g.attributes.position;
  for(let i=0;i<p.count;i++) p.setY(i, terrainH(p.getX(i), p.getZ(i)));
  g.computeVertexNormals();
  const nrm = g.attributes.normal, col = new Float32Array(p.count*3);
  const cDeep=new THREE.Color(0x17394d), cShallow=new THREE.Color(0x3d8a8a), cSand=new THREE.Color(0xd6c79b),
        cGA=new THREE.Color(0x4a7a38), cGB=new THREE.Color(0x7d9a4c), cDry=new THREE.Color(0x95905c),
        cRA=new THREE.Color(0x756e66), cRB=new THREE.Color(0x9a948c), cSnow=new THREE.Color(0xf1f5f9), cField=new THREE.Color(0x70a052);
  const A=new THREE.Color(), B=new THREE.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i), h=p.getY(i), z=p.getZ(i), ny=nrm.getY(i);
    const n1=fbm(x/310+5, z/310+9, 3);
    if(h<1.2){ A.copy(cDeep).lerp(cShallow, smooth(-40,0,h)); }
    else if(h<9){ A.copy(cSand).lerp(cGA, smooth(5,9,h)); }
    else{
      A.copy(cGA).lerp(cGB,n1); A.lerp(cDry, smooth(250,650,h)*0.7);
      const d=Math.hypot(x,z); if(d<1900) A.lerp(cField, 0.65*(1-smooth(1500,1900,d)));
      const rock=Math.max(smooth(520,950,h+(n1-.5)*180), smooth(0.84,0.64,ny));
      B.copy(cRA).lerp(cRB,n1); A.lerp(B,rock);
      A.lerp(cSnow, smooth(1050,1300,h+(n1-.5)*220)*smooth(0.45,0.78,ny));
    }
    col[i*3]=A.r; col[i*3+1]=A.g; col[i*3+2]=A.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({vertexColors:true})));

  const wg = new THREE.PlaneGeometry(90000,90000); wg.rotateX(-Math.PI/2);
  const water = new THREE.Mesh(wg, new THREE.MeshPhongMaterial({color:0x2a7aa8, specular:0xffffff, shininess:90, transparent:true, opacity:0.84}));
  scene.add(water);

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
    const h=terrainH(x,z); if(h<10||h>520) continue;
    if(Math.abs(terrainH(x+25,z)-h)+Math.abs(terrainH(x,z+25)-h)>28) continue;
    for(let c=0;c<4 && k<NT;c++){
      const tx=x+(r()-.5)*160, tz=z+(r()-.5)*160, th=terrainH(tx,tz); if(th<10) continue;
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

