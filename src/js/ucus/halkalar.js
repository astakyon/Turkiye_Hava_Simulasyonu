/* ------------------------------------------------------------------ rings */
const RING_PTS=[[0,350,-3000],[1800,520,-5200],[4200,700,-5600],[6200,900,-3600],[6400,600,-600],[5000,450,2200],[2400,380,4200],
  [-800,420,5600],[-3800,650,4600],[-6000,1000,2000],[-5600,700,-1800],[-3400,520,-4600],[-1000,420,-1500]];
const rings=[];
const ringGeo=new THREE.TorusGeometry(120,6,14,56);
const ringActiveMat=new THREE.MeshBasicMaterial({color:0x39e6ff});
const ringNextMat=new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.35});
RING_PTS.forEach(p=>{
  const y=Math.max(p[1], terrainH(p[0],p[2])+150);
  const mesh=new THREE.Mesh(ringGeo,ringNextMat); mesh.position.set(p[0],y,p[2]); mesh.visible=false; scene.add(mesh);
  rings.push({pos:mesh.position, n:new THREE.Vector3(), r:120, mesh});
});
rings.forEach((r,i)=>{ r.n.copy(rings[(i+1)%rings.length].pos).sub(r.pos).normalize(); r.mesh.lookAt(r.pos.clone().add(r.n)); });
function updateRingVisuals(){
  rings.forEach((r,i)=>{
    r.mesh.visible = MS.rings && (i===ringIdx || i===(ringIdx+1)%rings.length);
    r.mesh.material = (i===ringIdx)? ringActiveMat : ringNextMat;
  });
}
function passRing(){
  if(ringIdx===0) courseT=0;
  ringIdx++; score+=50;
  if(ringIdx>=rings.length){
    if(M.id==='rings'){ ringIdx=0; const ct=courseT; courseT=null; updateRingVisuals(); endMission(true,ct); return; }
    score+=250; const r=rec(activeId), isRec=(r.best===null||courseT<r.best); if(isRec){ r.best=courseT; saveRecords(); }
    toast((isRec?'Yeni rekor! ':'Parkur tamamlandı  ')+fmtT(courseT),'#7dffb0'); ringIdx=0; courseT=null;
  } else toast('Halka '+ringIdx+'/'+rings.length+'  +50');
  noteScore(); updateRingVisuals();
}
const tA=new THREE.Vector3(), tB=new THREE.Vector3(), tC=new THREE.Vector3(), tD=new THREE.Vector3();
function checkRing(prev,cur){
  const r=rings[ringIdx];
  const d0=tA.copy(prev).sub(r.pos).dot(r.n), d1=tB.copy(cur).sub(r.pos).dot(r.n);
  if((d0<0&&d1>=0)||(d0>0&&d1<=0)){
    const t=d0/(d0-d1); tC.copy(prev).lerp(cur,t);
    if(tC.distanceTo(r.pos) < r.r+8) passRing();
  }
}

