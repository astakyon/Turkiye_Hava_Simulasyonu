/* ------------------------------------------------------------------ aircraft registry */
const SND_JET={n:1,lp0:220,lpK:800,f0:70,f1:180,o:1,type:'sawtooth'};
const SND_PROP={n:0.4,lp0:160,lpK:300,f0:58,f1:118,o:4,type:'sawtooth'};
const AIRCRAFT={
  kaan:{name:'TUSAŞ KAAN',short:'KAAN',kind:'Savaş uçağı',len:'21 m',span:'14 m',uav:false,hasAB:true,
    desc:'Çift motorlu beşinci nesil savaş uçağı. Art yakıcı, yüksek manevra ve top ateşi.',
    build:function(){ const m=buildKaan(); m.spinners=[]; return m; },
    gearOff:2.4,belly:1.2,cam:[5.4,23],eye:[0,1.02,-4.2],muzzle:[0.9,-0.1,-7],
    idle:0.4,thrust:10.5,abT:14,kD:0.000125,stall:[52,84],authV:110,gLim:14,pitchMax:1.25,roll:3.3,yaw:0.45,stallNose:0.9,minV:60,vTop:300,
    vr:78,landV:150,sinkMax:8,gearV:150,brake:8,rollFric:1.1,airV:210,fireInt:0.05,bulletV:850,blife:1.5,weapon:'TOP',snd:SND_JET},
  anka3:{name:'TUSAŞ ANKA-3',short:'ANKA-3',kind:'Muharip İHA · uçan kanat',len:'~9 m',span:'~13 m',uav:true,hasAB:false,
    desc:'Kuyruksuz, ok başı biçimli uçan kanat; jet motorlu, gizlilik odaklı muharip İHA. Hızlı ve kararlı, dönüşlerde biraz ağır.',
    build:buildAnka3,gearOff:1.5,belly:0.8,cam:[3.0,12],eye:[0,0.1,-5.0],muzzle:[0,-0.2,-3.5],
    idle:0.3,thrust:7.0,abT:0,kD:0.000165,stall:[50,76],authV:100,gLim:8,pitchMax:0.95,roll:2.4,yaw:0.3,stallNose:0.8,minV:55,vTop:215,
    vr:65,landV:110,sinkMax:6,gearV:120,brake:6,rollFric:1.0,airV:175,fireInt:0.12,bulletV:600,blife:2,weapon:'MÜHİMMAT',snd:SND_JET},
  hurjet:{name:'TUSAŞ Hürjet',short:'HÜRJET',kind:'Jet eğitim / hafif muharebe',len:'13,6 m',span:'9,5 m',uav:false,hasAB:true,
    desc:'Tandem koltuklu süpersonik jet eğitim ve hafif muharebe uçağı. Tek motor, tek dikey kuyruk, art yakıcı, çevik.',
    build:buildHurjet,gearOff:1.95,belly:1.0,cam:[3.6,15],eye:[0,0.8,-3.6],muzzle:[0.6,-0.1,-5],
    idle:0.4,thrust:7.5,abT:11,kD:0.00011,stall:[48,72],authV:100,gLim:11,pitchMax:1.2,roll:3.2,yaw:0.4,stallNose:0.9,minV:55,vTop:260,
    vr:66,landV:130,sinkMax:7.5,gearV:140,brake:8,rollFric:1.1,airV:190,fireInt:0.05,bulletV:850,blife:1.5,weapon:'TOP',snd:SND_JET},
  hurkus:{name:'TUSAŞ Hürkuş',short:'HÜRKUŞ',kind:'Eğitim / hafif taarruz',len:'11,2 m',span:'10 m',uav:false,hasAB:false,
    desc:'Turboprop, tandem koltuklu eğitim ve hafif taarruz uçağı. Pervaneli, çevik ve affedici.',
    build:buildHurkus,gearOff:1.6,belly:0.8,cam:[3.4,14],eye:[0,0.95,-1.0],muzzle:[0.8,-0.2,-2.0],
    idle:0.2,thrust:5.0,abT:0,kD:0.000213,stall:[38,56],authV:70,gLim:7,pitchMax:1.1,roll:2.8,yaw:0.4,stallNose:0.8,minV:45,vTop:160,
    vr:48,landV:90,sinkMax:5,gearV:100,brake:6,rollFric:0.8,airV:100,fireInt:0.08,bulletV:700,blife:1.8,weapon:'TOP',snd:SND_PROP},
  anka:{name:'TUSAŞ ANKA',short:'ANKA',kind:'Keşif / gözetleme İHA',len:'8,6 m',span:'17,3 m',uav:true,hasAB:false,
    desc:'Pervaneli, V kuyruklu orta irtifa, uzun havada kalış (MALE) İHA\'sı. Çok yavaş, sabırlı ve çok kararlı.',
    build:buildAnka,gearOff:1.45,belly:0.7,cam:[2.2,9.5],eye:[0,-0.3,-4.5],muzzle:[0,-0.5,-2.5],
    idle:0.1,thrust:2.4,abT:0,kD:0.0006,stall:[21,33],authV:42,gLim:3,pitchMax:0.6,roll:1.2,yaw:0.25,stallNose:0.5,minV:25,vTop:63,
    vr:29,landV:44,sinkMax:3.5,gearV:50,brake:3,rollFric:0.35,airV:50,fireInt:0.4,bulletV:300,blife:3,weapon:'MÜHİMMAT',snd:SND_PROP},
  aksungur:{name:'TUSAŞ Aksungur',short:'AKSUNGUR',kind:'Uzun havada kalış İHA · çift motor',len:'~12 m',span:'~24 m',uav:true,hasAB:false,
    desc:'Çift bomlu, iki pervaneli, çok geniş kanatlı orta irtifa uzun havada kalış İHA\'sı. Ağır, yavaş ve dengeli.',
    build:buildAksungur,gearOff:1.7,belly:0.85,cam:[2.8,12.5],eye:[0,-0.6,-6.0],muzzle:[0,-0.6,-3.5],
    idle:0.15,thrust:3.2,abT:0,kD:0.000587,stall:[24,36],authV:50,gLim:3,pitchMax:0.55,roll:1.1,yaw:0.22,stallNose:0.5,minV:28,vTop:75,
    vr:34,landV:52,sinkMax:3.5,gearV:58,brake:3.5,rollFric:0.35,airV:55,fireInt:0.4,bulletV:320,blife:3,weapon:'MÜHİMMAT',snd:SND_PROP},
  kizilelma:{name:'Baykar Kızılelma',short:'KIZILELMA',kind:'Muharip İHA · jet',len:'14,7 m',span:'10 m',uav:true,hasAB:false,
    desc:'Kanardlı, çift dikey kuyruklu, tek jet motorlu muharip İHA (alt-sonik). Art yakıcısı yok, ama çevik.',
    build:buildKizilelma,gearOff:1.9,belly:1.0,cam:[4.2,17],eye:[0,0.2,-7.7],muzzle:[0,-0.4,-6.5],
    idle:0.4,thrust:8.5,abT:0,kD:0.00014,stall:[50,78],authV:100,gLim:12,pitchMax:1.15,roll:3.0,yaw:0.4,stallNose:0.9,minV:55,vTop:250,
    vr:70,landV:120,sinkMax:7,gearV:130,brake:7,rollFric:1.0,airV:190,fireInt:0.06,bulletV:800,blife:1.5,weapon:'TOP',snd:SND_JET},
  tb2:{name:'Bayraktar TB2',short:'TB2',kind:'Silahlı İHA',len:'6,5 m',span:'12 m',uav:true,hasAB:false,
    desc:'Çift bomlu, ters V (Λ) kuyruklu, arkada itici pervaneli taktik silahlı İHA. Yavaş, sabırlı ve dengeli.',
    build:function(){ return buildBayraktar(1,2,false); },gearOff:1.0,belly:0.5,cam:[1.7,7.2],eye:[0,-0.2,-3.4],muzzle:[0,-0.45,-2.4],
    idle:0.1,thrust:2.1,abT:0,kD:0.00057,stall:[20,32],authV:40,gLim:3,pitchMax:0.6,roll:1.2,yaw:0.25,stallNose:0.5,minV:25,vTop:62,
    vr:28,landV:42,sinkMax:3.5,gearV:50,brake:3,rollFric:0.35,airV:48,fireInt:0.4,bulletV:300,blife:3,weapon:'MAM',snd:SND_PROP},
  tb3:{name:'Bayraktar TB3',short:'TB3',kind:'Silahlı İHA · gemi uyumlu',len:'8,35 m',span:'14 m',uav:true,hasAB:false,
    desc:'TB2\'nin büyütülmüş, katlanır kanatlı, gemiden kalkışa uygun versiyonu. Biraz daha hızlı ve güçlü.',
    build:function(){ return buildBayraktar(1.22,3,true); },gearOff:1.22,belly:0.6,cam:[2.1,9],eye:[0,-0.25,-4.2],muzzle:[0,-0.5,-2.8],
    idle:0.12,thrust:3.0,abT:0,kD:0.000465,stall:[23,36],authV:45,gLim:3.5,pitchMax:0.65,roll:1.3,yaw:0.28,stallNose:0.5,minV:28,vTop:83,
    vr:32,landV:50,sinkMax:3.5,gearV:60,brake:3.5,rollFric:0.35,airV:55,fireInt:0.35,bulletV:350,blife:3,weapon:'MAM',snd:SND_PROP},
  akinci:{name:'Bayraktar Akıncı',short:'AKINCI',kind:'Taarruz İHA · çift turboprop',len:'12,2 m',span:'20 m',uav:true,hasAB:false,
    desc:'İki turboprop motorlu, ağır yük taşıyan taarruz İHA\'sı. Geniş kanat, güçlü ama hâlâ yavaş.',
    build:buildAkinci,gearOff:1.55,belly:0.8,cam:[2.7,12],eye:[0,-0.5,-6.2],muzzle:[0,-0.6,-3.6],
    idle:0.15,thrust:4.5,abT:0,kD:0.00046,stall:[27,40],authV:55,gLim:3.5,pitchMax:0.65,roll:1.4,yaw:0.25,stallNose:0.5,minV:30,vTop:100,
    vr:36,landV:55,sinkMax:3.5,gearV:65,brake:4,rollFric:0.4,airV:60,fireInt:0.3,bulletV:380,blife:3,weapon:'MAM',snd:SND_PROP}
};
const AC_ORDER=['kaan','anka3','hurjet','hurkus','anka','aksungur','kizilelma','tb2','tb3','akinci'];
/* system registry: groups (hava / deniz / kara), classes and makers; new vehicles only need an AIRCRAFT entry + a REG line */
const GROUPS=[{id:'hava',name:'Hilal Kanatlar',sub:'Hava sistemleri',on:true},{id:'deniz',name:'Mavi Kanatlar',sub:'Deniz · yakında',on:false},{id:'kara',name:'Kara Sistemleri',sub:'Kara · yakında',on:false}];
const CLASSES={savas:'Savaş uçağı',iha:'İHA / SİHA',egitim:'Eğitim / hafif taarruz'};
const REG={kaan:{grp:'hava',cls:'savas',maker:'TUSAŞ'},anka3:{grp:'hava',cls:'iha',maker:'TUSAŞ'},hurjet:{grp:'hava',cls:'egitim',maker:'TUSAŞ'},hurkus:{grp:'hava',cls:'egitim',maker:'TUSAŞ'},
  anka:{grp:'hava',cls:'iha',maker:'TUSAŞ'},aksungur:{grp:'hava',cls:'iha',maker:'TUSAŞ'},kizilelma:{grp:'hava',cls:'iha',maker:'Baykar'},tb2:{grp:'hava',cls:'iha',maker:'Baykar'},
  tb3:{grp:'hava',cls:'iha',maker:'Baykar'},akinci:{grp:'hava',cls:'iha',maker:'Baykar'}};
let pickGrp='hava', pickCls='all';
function regOf(id){ return REG[id]||{grp:'hava',cls:'iha',maker:''}; }
function pickList(){ return AC_ORDER.filter(function(id){ const r=regOf(id); return r.grp===pickGrp&&(pickCls==='all'||r.cls===pickCls); }); }
const modelCache={};
let CUR=AIRCRAFT.kaan, activeId='kaan', model=null, planeGroup=null, selectedId='kaan';
try{ const sv0=localStorage.getItem('kaan-sim-aircraft'); if(sv0&&AIRCRAFT[sv0]) selectedId=sv0; }catch(e){}
function setAircraft(id){
  const def=AIRCRAFT[id]; if(!def) return;
  if(planeGroup) scene.remove(planeGroup);
  if(!modelCache[id]) modelCache[id]=buildModel(id);
  model=modelCache[id]; planeGroup=model.group; scene.add(planeGroup);
  if(!model.tip){ const bb=new THREE.Box3().setFromObject(model.group); model.tip=[bb.max.x,(bb.min.y+bb.max.y)/2,bb.min.z+(bb.max.z-bb.min.z)*0.62]; model.tail=bb.max.z*0.85; model.ext=[(bb.max.x-bb.min.x)/2,(bb.max.z-bb.min.z)/2]; }
  CUR=def; activeId=id; lastFov=0;
}


