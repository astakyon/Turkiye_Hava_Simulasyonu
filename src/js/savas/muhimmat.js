/* ------------------------------------------------------------------ real Turkish munitions (V2.41, model series)
   The five weapon roles stay the same everywhere (gp, bnk = bombs; m1, m2, m3 = guided missiles): saves, loadout presets,
   missions and the network keep working. An aircraft that has been through the model series maps each role to a real munition:
   its name, real data (Defence Turk Sistem Envanteri, with attribution), game values and a 3D model at real size.
   Aircraft not yet in the series keep the old generic weapons.
   Internal carriage: roles listed in MUN_BAY[id] ride in the weapons bay (hidden in flight, the doors open for each launch);
   the rest hang on wing pylons. Ranges are scaled to the 30 km island (a real 100 km missile would cross it in one shot). */
const MUNI={
  hgk82:{ad:'HGK-82 hassas güdüm kiti',kisa:'HGK-82',uretici:'TÜBİTAK SAGE · ASELSAN',kind:'bomb',
    gercek:'500 lb (Mk-82) bomba · KKS/ANS güdüm · azami menzil 25 km · CEP 6,3 m',kg:260,len:2.45,dia:0.273,
    oyun:{name:'HGK-82 güdüm kitli bomba',short:'HGK',tip:'KKS/ANS güdümlü · 500 lb · 28 m patlama',r:28,dmg:1.5,armorDmg:0.7}},
  neb84:{ad:'NEB-84 nüfuz edici bomba',kisa:'NEB-84',uretici:'TÜBİTAK SAGE',kind:'bomb',
    gercek:'2000 lb · boy 2,6 m · çap 457 mm · 870 kg · 2,1 m betonu deler',kg:870,len:2.6,dia:0.457,
    oyun:{name:'NEB-84 nüfuz edici bomba',short:'NEB',tip:'Sığınak delici · 2000 lb · zırhlı hedeflere çok etkili',r:22,dmg:1.3,armorDmg:2.0}},
  bozdogan:{ad:'BOZDOĞAN görüş içi hava-hava füzesi',kisa:'BOZDOĞAN',uretici:'TÜBİTAK SAGE',kind:'missile',
    gercek:'boy 3,3 m · çap 160 mm · 140 kg · hız 4 Mach üstü · kızılötesi görüntülemeli arayıcı',kg:140,len:3.3,dia:0.16,
    oyun:{name:'BOZDOĞAN görüş içi füze',short:'BZD',tip:'Hava-hava · 7 km · çok çevik · at-unut',range:7000,speed:600,turn:1.9,dmg:1.3,armorDmg:0.8,r:12,air:true,ground:false}},
  gokdogan:{ad:'GÖKDOĞAN görüş ötesi hava-hava füzesi',kisa:'GÖKDOĞAN',uretici:'TÜBİTAK SAGE',kind:'missile',
    gercek:'aktif radar arayıcı · veri bağıyla hedef güncelleme · at-unut · boy ~3,65 m, çap ~178 mm (kamuya açık yaklaşık değer)',kg:190,len:3.65,dia:0.178,
    oyun:{name:'GÖKDOĞAN görüş ötesi füze',short:'GKD',tip:'Hava-hava · 16 km · hızlı · radar güdümlü',range:16000,speed:760,turn:0.9,dmg:1.6,armorDmg:1.0,r:16,air:true,ground:false}},
  somj:{ad:'SOM-J seyir füzesi',kisa:'SOM-J',uretici:'ROKETSAN · TÜBİTAK SAGE',kind:'missile',
    gercek:'iç silah yuvasına uygun · zırh delici harp başlığı · KKS/ANS + kızılötesi arayıcı · boy ~3,9 m (kamuya açık yaklaşık değer)',kg:540,len:3.9,dia:0.42,
    oyun:{name:'SOM-J seyir füzesi',short:'SOM',tip:'Sadece yer · 12 km · alçaktan süzülür · yıkıcı',range:12000,speed:300,turn:0.7,dmg:3.0,armorDmg:2.6,r:24,air:false,ground:true}}
,
  /* V2.42 — Bayraktar TB2: Roketsan mini smart munitions */
  maml:{ad:'MAM-L mini akıllı mühimmat',kisa:'MAM-L',uretici:'ROKETSAN',kind:'bomb',
    gercek:'boy 1000 mm · çap 160 mm · 22 kg · 10 kg parçacık etkili harp başlığı · yarı aktif lazer arayıcı · menzil 8 km (KKS/ANS ile 15 km)',kg:22,len:1.0,dia:0.16,
    oyun:{name:'MAM-L lazer güdümlü mühimmat',short:'MAM-L',tip:'Lazer güdümlü · hassas · 14 m etki',r:14,dmg:1.4,armorDmg:0.8}},
  mamc:{ad:'MAM-C mini akıllı mühimmat',kisa:'MAM-C',uretici:'ROKETSAN',kind:'bomb',
    gercek:'boy ~1 m · 8,5 kg (başka kaynakta 22 kg) · zırha karşı tandem harp başlığı · menzil 8 km · çap ~70 mm (kamuya açık yaklaşık değer)',kg:8.5,len:0.97,dia:0.07,
    oyun:{name:'MAM-C tanksavar mühimmat',short:'MAM-C',tip:'Tandem başlık · zırhlı araçlara çok etkili · 8 m etki',r:8,dmg:0.9,armorDmg:1.8}},
  mamt:{ad:'MAM-T mini akıllı mühimmat',kisa:'MAM-T',uretici:'ROKETSAN',kind:'missile',
    gercek:'boy 1,4 m · çap 230 mm · 94 kg · parçacık etkili · ANS+KKS+lazer güdüm · İHA\'dan menzil 30+ km',kg:94,len:1.4,dia:0.23,
    oyun:{name:'MAM-T süzülen güdümlü mühimmat',short:'MAM-T',tip:'Sadece yer · 10 km · uzun menzilli süzülme',range:10000,speed:260,turn:0.9,dmg:2.0,armorDmg:1.5,r:18,air:false,ground:true}}
,
  /* V2.44 — Bayraktar Akıncı */
  teber82:{ad:'TEBER-82 lazer güdüm kiti',kisa:'TEBER-82',uretici:'ROKETSAN',kind:'bomb',
    gercek:'Mk-82 bomba + lazer arayıcı kit · boy 2,65 m · ~270 kg · menzil 2–28 km · CEP 3 m altı · hareketli hedef (40 km/sa altı)',kg:270,len:2.65,dia:0.273,
    oyun:{name:'TEBER-82 lazer güdümlü bomba',short:'TEBER',tip:'Lazer güdümlü · 500 lb · 26 m patlama',r:26,dmg:1.5,armorDmg:0.8}},
  lumtas:{ad:'L-UMTAS tanksavar füzesi',kisa:'L-UMTAS',uretici:'ROKETSAN',kind:'missile',
    gercek:'boy 1800 mm · çap 160 mm · 37,5 kg · lazer arayıcı · reaktif zırha karşı tandem harp başlığı · menzil 0,5–8 km',kg:37.5,len:1.8,dia:0.16,
    oyun:{name:'L-UMTAS tanksavar füzesi',short:'UMTAS',tip:'Sadece yer · 8 km · zırhlı araçlara çok etkili',range:8000,speed:420,turn:1.2,dmg:1.2,armorDmg:2.2,r:10,air:false,ground:true}},
  soma:{ad:'SOM-A seyir füzesi',kisa:'SOM-A',uretici:'ROKETSAN',kind:'missile',
    gercek:'boy ~4 m · ~600 kg · ~230 kg harp başlığı · menzil 250+ km · düşük görünürlük · kızılötesi görüntülemeli arayıcı',kg:600,len:4.0,dia:0.46,
    oyun:{name:'SOM-A seyir füzesi',short:'SOM',tip:'Sadece yer · 14 km · alçaktan süzülür · çok yıkıcı',range:14000,speed:300,turn:0.7,dmg:3.2,armorDmg:2.4,r:28,air:false,ground:true}}
};
const AC_MUNI={kaan:{gp:'hgk82',bnk:'neb84',m1:'bozdogan',m2:'gokdogan',m3:'somj'}, tb2:{gp:'maml',bnk:'mamc',m3:'mamt'}, tb3:{gp:'maml',bnk:'mamc',m3:'mamt'}, akinci:{gp:'teber82',bnk:'neb84',m1:'lumtas',m2:'gokdogan',m3:'soma'}, kizilelma:{gp:'teber82',bnk:'neb84',m1:'bozdogan',m2:'gokdogan',m3:'somj'}, anka3:{gp:'teber82',bnk:'maml',m3:'somj'}};
const MUN_BAY={kaan:['m1','m2','m3'], kizilelma:['m1','m2','m3'], anka3:['gp','m3']};
const MUN_SRC='Defence Turk · Sistem Envanteri (açık kaynak bilgiler); oyundaki menzil ve hızlar adaya göre ölçeklenmiştir.';
let MUN_BASE=null;
function munBase(){ if(!MUN_BASE){ MUN_BASE={}; Object.keys(WEAPONS).forEach(function(k){ MUN_BASE[k]=Object.assign({},WEAPONS[k]); }); } return MUN_BASE; }
function munOf(id,k){ const a=AC_MUNI[id]; return a&&a[k]?MUNI[a[k]]:null; }
function munInBay(id,k){ const b=MUN_BAY[id]; return !!(b&&b.indexOf(k)>=0); }
/* the weapon as this aircraft carries it (menus, hangar, library) */
const MUN_W={};
function wOf(id,k){ const mu=munOf(id,k); if(!mu) return munBase()[k]||WEAPONS[k]; const key=id+':'+k; return MUN_W[key]||(MUN_W[key]=Object.assign({},munBase()[k],mu.oyun,{mun:mu})); }
function wKg(id,k){ const mu=munOf(id,k); return mu?mu.kg:({gp:230,bnk:900,m1:90,m2:160,m3:280})[k]||0; }
/* flight: WEAPONS[k] becomes the active aircraft's version (HUD, lock, damage all read WEAPONS) */
function munApply(id){ const B=munBase(); Object.keys(B).forEach(function(k){ const w=WEAPONS[k]; Object.keys(w).forEach(function(p){ delete w[p]; }); Object.assign(w,wOf(id,k)); }); }

/* ---------------------------------------------------------------- 3D models at real size, nose at −z; one geometry per munition (vertex colours) */
const MUN_GEO={}; let MUN_MAT=null;
function munMat(){ return MUN_MAT||(MUN_MAT=new THREE.MeshPhongMaterial({color:0xffffff,vertexColors:true,shininess:45,specular:0x333333})); }
function munMerge(parts){ let n=0; const L=parts.map(function(p){ let g=p.g; if(g.index){ if(!p.flat) g.computeVertexNormals(); g=g.toNonIndexed(); if(p.flat) g.computeVertexNormals(); } else g.computeVertexNormals();   /* bodies of revolution stay smooth */ n+=g.attributes.position.count; return {g:g,c:new THREE.Color(p.c)}; });
  const P=new Float32Array(n*3), N=new Float32Array(n*3), C=new Float32Array(n*3); let o=0;
  L.forEach(function(q){ const a=q.g.attributes; P.set(a.position.array,o*3); N.set(a.normal.array,o*3); for(let i=0;i<a.position.count;i++){ C[(o+i)*3]=q.c.r; C[(o+i)*3+1]=q.c.g; C[(o+i)*3+2]=q.c.b; } o+=a.position.count; });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(N,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.computeBoundingSphere(); return g; }
/* body of revolution: prof = [[z, r], …] from nose to tail */
function munLathe(prof,seg){ const pts=prof.map(function(p){ return new THREE.Vector2(Math.max(0.0005,p[1]),p[0]); }); const g=new THREE.LatheGeometry(pts,seg||14); g.rotateX(Math.PI/2); return g; }
/* flat fin in the x–z plane (x outward, z aft), thickness t, then turned about the body axis by ang */
function munFin(pts,t,ang,r0){ const s=new THREE.Shape(); pts.forEach(function(p,i){ if(i) s.lineTo(p[0],p[1]); else s.moveTo(p[0],p[1]); }); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false}); g.translate(r0||0,0,-t/2); g.rotateX(Math.PI/2); g.rotateZ(ang||0); return g; }
function munCross(pts,t,r0,a0){ const L=[]; for(let i=0;i<4;i++) L.push(munFin(pts,t,(a0||0)+i*Math.PI/2,r0)); return L; }
function munPylon(top,len,c){ const g=new THREE.BoxGeometry(0.07,0.16,len); g.translate(0,top+0.08,0); return {g:g,c:c}; }
const MUN_BUILD={
  gokdogan:function(){ const L=3.65, r=0.089, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0],[z0+0.12,0.04],[z0+0.3,0.07],[z0+0.5,r]],16),c:0xcfc8b8});                         /* radome */
    P.push({g:munLathe([[z0+0.5,r],[L/2-0.05,r],[L/2,0.075]],16),c:0xe3e6e9});
    munCross([[0,-0.75],[0.055,-0.55],[0.055,0.55],[0,0.75]],0.012,r-0.005,Math.PI/4).forEach(function(g){ P.push({g:g,c:0xc9cdd2}); });   /* long strakes */
    munCross([[0,L/2-0.46],[0.17,L/2-0.2],[0.17,L/2-0.06],[0,L/2-0.04]],0.014,r-0.005,Math.PI/4).forEach(function(g){ P.push({g:g,c:0xc9cdd2}); });
    P.push({g:munLathe([[L/2-0.3,r+0.003],[L/2-0.2,r+0.003]],16),c:0x2a2e33});                                      /* aft band */
    P.push({g:munLathe([[z0+0.62,r+0.003],[z0+0.66,r+0.003]],16),c:0xd8a02a});                                       /* live-round band */
    return P; },
  bozdogan:function(){ const L=3.3, r=0.08, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0],[z0+0.04,0.05],[z0+0.09,0.07]],14),c:0x2a3a44});                                       /* IIR dome */
    P.push({g:munLathe([[z0+0.09,0.07],[z0+0.3,r],[L/2-0.04,r],[L/2,0.066]],14),c:0xe6e8ea});
    munCross([[0,-0.55],[0.04,-0.4],[0.04,0.3],[0,0.4]],0.01,r-0.004,Math.PI/4).forEach(function(g){ P.push({g:g,c:0xcfd3d7}); });
    munCross([[0,L/2-0.34],[0.13,L/2-0.12],[0.13,L/2-0.03],[0,L/2-0.03]],0.012,r-0.004,Math.PI/4).forEach(function(g){ P.push({g:g,c:0xcfd3d7}); });
    P.push({g:munLathe([[z0+0.32,r+0.003],[z0+0.36,r+0.003]],14),c:0xd8a02a});
    return P; },
  somj:function(){ const L=3.9, z0=-L/2, P=[];
    /* low-observable faceted body: flat bottom, sloped sides, ridge on top; chined nose */
    const sec=function(z,w,h){ return [[w,0],[w*0.78,h*0.62],[w*0.2,h],[-w*0.2,h],[-w*0.78,h*0.62],[-w,0]].map(function(p){ return [p[0],p[1]-0.2,z]; }); };
    const rows=[[z0,0.02,0.04],[z0+0.35,0.15,0.2],[z0+0.9,0.24,0.34],[z0+1.4,0.27,0.4],[L/2-0.25,0.27,0.4],[L/2,0.2,0.3]].map(function(q){ return sec(q[0],q[1],q[2]); });
    const pos=[], idx=[]; rows.forEach(function(rw){ rw.forEach(function(p){ pos.push(p[0],p[1],p[2]); }); }); const n=rows[0].length;
    for(let i=0;i<rows.length-1;i++) for(let j=0;j<n;j++){ const a=i*n+j, b=i*n+(j+1)%n, c=(i+1)*n+j, d=(i+1)*n+(j+1)%n; idx.push(a,b,c, b,d,c); }
    const base=pos.length/3; rows[rows.length-1].forEach(function(p){ pos.push(p[0],p[1],p[2]); }); for(let j=1;j<n-1;j++) idx.push(base,base+j+1,base+j);
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setIndex(idx); P.push({g:bg,c:0x8f968e,flat:true});
    const wing=new THREE.BoxGeometry(0.34,0.02,1.5); wing.translate(0,0.21,0.2); P.push({g:wing,c:0x7f867e});          /* folded wings on top */
    munCross([[0,L/2-0.42],[0.2,L/2-0.18],[0.2,L/2-0.05],[0,L/2-0.04]],0.014,0.12,Math.PI/4).forEach(function(g){ g.translate(0,-0.03,0); P.push({g:g,c:0x7f867e}); });
    const ex=new THREE.CylinderGeometry(0.07,0.07,0.04,12); ex.rotateX(Math.PI/2); ex.translate(0,-0.04,L/2+0.01); P.push({g:ex,c:0x1c1f22});
    const sk=new THREE.BoxGeometry(0.14,0.06,0.04); sk.translate(0,-0.12,z0+0.37); P.push({g:sk,c:0x223038});           /* IR seeker window */
    return P; },
  maml:function(){ const L=1.0, r=0.08, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0.0],[z0+0.03,0.035],[z0+0.08,0.06]],14),c:0x2a3a44});                                 /* laser seeker window */
    P.push({g:munLathe([[z0+0.08,0.06],[z0+0.2,r],[L/2-0.02,r],[L/2,0.06]],14),c:0x3e4334});
    P.push({g:munLathe([[z0+0.3,r+0.002],[z0+0.33,r+0.002]],14),c:0xd8b02a});
    munCross([[0,z0+0.2],[0.06,z0+0.25],[0.06,z0+0.31],[0,z0+0.33]],0.008,r-0.004,0).forEach(function(g){ P.push({g:g,c:0x50553f}); });      /* canards */
    munCross([[0,L/2-0.22],[0.14,L/2-0.08],[0.14,L/2],[0,L/2]],0.01,r-0.004,Math.PI/4).forEach(function(g){ P.push({g:g,c:0x50553f}); });   /* tail fins */
    return P; },
  mamc:function(){ const L=0.97, r=0.035, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0.0],[z0+0.02,0.02],[z0+0.05,0.03]],12),c:0x2a3a44});
    P.push({g:munLathe([[z0+0.05,0.03],[z0+0.12,r],[L/2,r]],12),c:0xd3d6d8});
    P.push({g:munLathe([[z0+0.16,r+0.002],[z0+0.18,r+0.002]],12),c:0xd8b02a});
    munCross([[0,z0+0.12],[0.035,z0+0.15],[0.035,z0+0.2],[0,z0+0.21]],0.006,r-0.003,0).forEach(function(g){ P.push({g:g,c:0xb9bdc1}); });
    munCross([[0,L/2-0.16],[0.08,L/2-0.05],[0.08,L/2],[0,L/2]],0.007,r-0.003,Math.PI/4).forEach(function(g){ P.push({g:g,c:0xb9bdc1}); });
    return P; },
  mamt:function(){ const L=1.4, r=0.115, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0.0],[z0+0.04,0.05],[z0+0.1,0.08]],16),c:0x2a3a44});
    P.push({g:munLathe([[z0+0.1,0.08],[z0+0.3,r],[L/2-0.05,r],[L/2,0.09]],16),c:0xcfd2d4});
    P.push({g:munLathe([[z0+0.36,r+0.002],[z0+0.4,r+0.002]],16),c:0xd8b02a});
    const w=new THREE.BoxGeometry(1.3,0.016,0.2); w.translate(0,r+0.02,0.02); P.push({g:w,c:0xa9aeb3});                       /* deployed glide wing */
    const wm=new THREE.BoxGeometry(0.12,0.04,0.26); wm.translate(0,r+0.005,0.02); P.push({g:wm,c:0x9aa0a6});
    munCross([[0,L/2-0.26],[0.17,L/2-0.08],[0.17,L/2],[0,L/2]],0.012,r-0.005,Math.PI/4).forEach(function(g){ P.push({g:g,c:0xb9bdc1}); });
    return P; },
  teber82:function(){ const L=2.65, r=0.137, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0.0],[z0+0.05,0.05],[z0+0.16,0.07]],16),c:0x2a3a44});                                     /* laser seeker */
    P.push({g:munLathe([[z0+0.16,0.07],[z0+0.32,0.085],[z0+0.75,r],[L/2-0.6,r],[L/2-0.3,0.09],[L/2,0.085]],16),c:0x5d6449});
    P.push({g:munLathe([[z0+0.7,r+0.003],[z0+0.76,r+0.003]],16),c:0xd8b02a});
    munCross([[0,z0+0.2],[0.11,z0+0.28],[0.11,z0+0.4],[0,z0+0.42]],0.01,0.08,Math.PI/4).forEach(function(g){ P.push({g:g,c:0x74786c}); });   /* canards */
    munCross([[0,L/2-0.34],[0.22,L/2-0.1],[0.22,L/2],[0,L/2]],0.012,0.085,Math.PI/4).forEach(function(g){ P.push({g:g,c:0x74786c}); });
    return P; },
  lumtas:function(){ const L=1.8, r=0.08, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0.0],[z0+0.05,0.05],[z0+0.12,0.07]],14),c:0x2a3a44});
    P.push({g:munLathe([[z0+0.12,0.07],[z0+0.25,r],[L/2,r]],14),c:0x6a7058});
    P.push({g:munLathe([[z0+0.3,r+0.002],[z0+0.34,r+0.002]],14),c:0xd8b02a});
    munCross([[0,z0+0.28],[0.05,z0+0.33],[0.05,z0+0.4],[0,z0+0.42]],0.008,r-0.004,0).forEach(function(g){ P.push({g:g,c:0x585d48}); });
    munCross([[0,L/2-0.3],[0.13,L/2-0.12],[0.13,L/2-0.02],[0,L/2]],0.01,r-0.004,Math.PI/4).forEach(function(g){ P.push({g:g,c:0x585d48}); });
    return P; },
  soma:function(){ const P=MUN_BUILD.somj(); P.forEach(function(p){ p.g=p.g.clone(); p.g.scale(1.1,1.1,4.0/3.9); }); return P; },
  hgk82:function(){ const L=2.45, r=0.137, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0.02],[z0+0.22,0.08],[z0+0.6,r],[L/2-0.6,r],[L/2-0.3,0.09],[L/2,0.08]],16),c:0x5d6449});
    P.push({g:munLathe([[z0+0.5,r+0.003],[z0+0.56,r+0.003]],16),c:0xd8b02a});                                          /* yellow HE band */
    P.push({g:munLathe([[L/2-0.32,0.095],[L/2,0.095]],16),c:0x74786c});                                                 /* tail kit */
    munCross([[0,L/2-0.3],[0.2,L/2-0.08],[0.2,L/2],[0,L/2]],0.012,0.09,Math.PI/4).forEach(function(g){ P.push({g:g,c:0x74786c}); });
    munCross([[0,-0.4],[0.05,-0.3],[0.05,0.35],[0,0.4]],0.01,r-0.005,Math.PI/4).forEach(function(g){ P.push({g:g,c:0x74786c}); });   /* body strakes */
    return P; },
  neb84:function(){ const L=2.6, r=0.2285, z0=-L/2, P=[];
    P.push({g:munLathe([[z0,0.03],[z0+0.3,0.12],[z0+0.85,r],[L/2-0.55,r],[L/2-0.25,0.15],[L/2,0.14]],18),c:0x535a45});
    [z0+0.75,z0+0.85].forEach(function(z){ P.push({g:munLathe([[z,r+0.003],[z+0.04,r+0.003]],18),c:0xd8b02a}); });
    munCross([[0,L/2-0.4],[0.26,L/2-0.12],[0.26,L/2],[0,L/2]],0.016,0.14,Math.PI/4).forEach(function(g){ P.push({g:g,c:0x666b5d}); });
    return P; }
};
/* geometry of one store: pylon=true adds a short pylon on top (wing stations) */
function munGeo(mid,pylon,flip){ const key=mid+(pylon?':p':'')+(flip?':f':''); if(MUN_GEO[key]) return MUN_GEO[key]; const mu=MUNI[mid], P=MUN_BUILD[mid]();
  if(pylon) P.push(munPylon(mu.dia/2-0.02,Math.min(1.6,mu.len*0.45),0x6c747d));
  const g=munMerge(P); if(flip) g.rotateY(Math.PI);   /* released weapons are turned with lookAt (+z forward) */
  return (MUN_GEO[key]=g); }
function munMesh(mid,pylon){ return new THREE.Mesh(munGeo(mid,pylon),munMat()); }

/* ---------------------------------------------------------------- weapons bay: places inside the bay (model.bay from the model) */
function munBaySlots(m,id,list){ const B=m&&m.bay; if(!B) return null; const out=[], used=[0,0];   /* per side: 0 free, 1 one missile, 2 full */
  list.forEach(function(w){ if(!munInBay(id,w)){ out.push(null); return; } const mu=munOf(id,w), big=mu.dia>0.3; let side=-1;
    if(big){ side=used[0]===0?0:(used[1]===0?1:-1); } else { const c=[0,1].filter(function(i){ return used[i]<2; }).sort(function(i,j){ return used[i]-used[j]; }); side=c.length?c[0]:-1; }
    if(side<0){ out.push(null); return; } const s=side?1:-1;
    if(big){ used[side]=2; out.push({x:s*B.xc,y:B.y-0.22,z:B.zc,k:1,bay:true}); return; }
    const j=used[side]++; out.push({x:s*(B.xc+(j?0.2:-0.2)),y:B.y-mu.dia/2-0.03,z:B.zc+(j?0.25:-0.25),k:1,bay:true}); });
  return out; }
/* bay doors: open while BAY.t > 0 (set by a launch) or in the library weapon test */
const BAY={t:0, open:0};
function munDoors(m,f){ if(!m||!m.bay) return; m.bay.doors.forEach(function(d){ d.p.rotation.z=d.a*f; }); if(m.bay.cav) m.bay.cav.visible=f>0.04; if(m.stores) m.stores.children.forEach(function(s){ if(s.userData.bay) s.visible=f>0.6; }); }
function munBayStep(dt){ if(!model||!model.bay) return; BAY.t=Math.max(0,BAY.t-dt); const tgt=BAY.t>0?1:0; const o=BAY.open; BAY.open=tgt?Math.min(1,o+dt*3.2):Math.max(0,o-dt*2.2); if(BAY.open!==o) munDoors(model,BAY.open); }
/* a guided missile in flight shows the munition it is (generic white tube for the old weapons and the AI) */
function misLook(m,mid){ const g=m.grp, base=g.children[0]; base.visible=!mid; if(!g.userData.mun) g.userData.mun={};
  Object.keys(g.userData.mun).forEach(function(k){ g.userData.mun[k].visible=(k===mid); });
  if(mid&&!g.userData.mun[mid]){ const ms=new THREE.Mesh(munGeo(mid,false,true),munMat()); g.add(ms); g.userData.mun[mid]=ms; } }
