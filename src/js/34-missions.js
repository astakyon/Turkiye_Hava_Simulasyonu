/* ------------------------------------------------------------------ missions */
const MISSIONS={
  free:{name:'Serbest uçuş',desc:'Halkalar, havadaki ve yerdeki hedefler bir arada. Süre sınırı yok.'},
  rings:{name:'Halka parkuru',desc:'13 halkadan sırayla geç. Süren rekor olarak kaydedilir.'},
  strike:{name:'Yer hedefleri',desc:'Hava savunma bataryaları dahil tüm yer hedeflerini imha et. 10 dakikan var.',limit:600},
  air:{name:'Hava hedefleri',desc:'Havadaki 8 hedefin hepsini vur. 7 dakikan var.',limit:420},
  recon:{name:'Keşif',desc:'5 keşif noktasının üstünde dört saniye kal; sensör tarama yapar. 9 dakikan var.',limit:540},
  dogfight:{name:'İt dalaşı',desc:'Kırmızı kuvvetin 3 dalga savaş uçağını düşür. Füze ve topla it dalaşı; flare ile kaç.'},
  net:{name:'Çevrimiçi',desc:''}
};
const MORDER=['free','dogfight','rings','strike','air','recon'];
let missionId='free', M={id:'free',t:0,started:false,done:false,scanIdx:0,scanT:0};
const MS={rings:true,air:true,ground:true,recon:false};
const reconPts=[];
function clearAir(){ while(targets.length){ scene.remove(targets.pop().g); } kills=0; }
function clearGround(){ while(gtargets.length){ scene.remove(gtargets.pop().g); } }
function clearRecon(){ while(reconPts.length){ scene.remove(reconPts.pop().g); } }
function updateReconVisuals(){
  reconPts.forEach(function(o,i){
    o.g.visible=!o.done; const cur=(i===M.scanIdx);
    o.ringMat.opacity=cur?0.95:0.3; o.colMat.opacity=cur?0.35:0.12;
  });
}
function spawnRecon(){
  clearRecon();
  const rnd=mulberry32((Date.now()&0xffff)+77), taken=[];
  for(let i=0;i<5;i++){
    let x=0,z=0;
    for(let tries=0;tries<120;tries++){ x=(rnd()-.5)*22000; z=(rnd()-.5)*22000; if(Math.hypot(x,z)<3000) continue; if(taken.every(function(q){ return Math.hypot(q[0]-x,q[1]-z)>3500; })) break; }
    taken.push([x,z]);
    const h=Math.max(0,terrainH(x,z)), g=new THREE.Group();
    const ringMat=new THREE.MeshBasicMaterial({color:0x39e6ff,transparent:true,opacity:0.3}), colMat=new THREE.MeshBasicMaterial({color:0x39e6ff,transparent:true,opacity:0.12,side:THREE.DoubleSide,depthWrite:false});
    const rg=new THREE.TorusGeometry(450,7,8,56); rg.rotateX(Math.PI/2); const ring=new THREE.Mesh(rg,ringMat); ring.position.y=8; g.add(ring);
    const col=new THREE.Mesh(new THREE.CylinderGeometry(450,450,900,32,1,true),colMat); col.position.y=450; g.add(col);
    g.position.set(x,h,z); scene.add(g);
    reconPts.push({g:g,pos:new THREE.Vector3(x,h,z),top:new THREE.Vector3(x,h+300,z),done:false,ringMat:ringMat,colMat:colMat});
  }
  updateReconVisuals();
}
function reconPos(){ const p=reconPts[Math.min(M.scanIdx,reconPts.length-1)]; return p?p.top:rings[ringIdx].pos; }
function setupMission(){
  const id=missionId;
  MS.rings=(id==='free'||id==='rings'); MS.air=(id==='free'||id==='air'); MS.ground=(id==='free'||id==='strike'); MS.recon=(id==='recon');
  M={id:id,t:0,started:false,done:false,scanIdx:0,scanT:0};
  if(MS.air) spawnTargets(); else clearAir();
  if(MS.ground) spawnGround(); else clearGround();
  if(MS.recon) spawnRecon(); else clearRecon();
  ringIdx=0; courseT=null; updateRingVisuals();
  if(id!=='free'&&id!=='net') toast('Görev: '+MISSIONS[id].name+' — '+MISSIONS[id].desc,'#7dffb0');
  aiSetup();
}
function endMission(ok,tm){
  if(M.done) return; M.done=true;
  const t=(tm!=null?tm:M.t); let isRec=false;
  if(ok){
    score+=500; noteScore();
    const r=rec(activeId), key=M.id, prev=(key==='rings'?r.best:(r.mt||{})[key]);
    isRec=(prev==null||t<prev);
    if(isRec){ if(key==='rings') r.best=t; else{ r.mt=r.mt||{}; r.mt[key]=t; } saveRecords(); }
  }
  state='mend';
  $('mendTitle').textContent=ok?'Görev tamamlandı':'Görev başarısız';
  $('mendBody').textContent=ok?(MISSIONS[M.id].name+' · süre '+fmtT(t)+' · +500 puan'+(isRec?' · Yeni rekor!':'')):('Süre doldu: '+MISSIONS[M.id].name);
  $('missionEnd').classList.remove('hidden');
}
function restartMission(){
  if(NET.on){ if(NET.host) netStartMatch(); return; }
  $('missionEnd').classList.add('hidden'); setupMission(); resetFlight('runway'); score=0; msgs.length=0; padFireLock=true; state='play';
}
function endToHangar(){ if(NET.on){ netBackToLobby(); return; } $('missionEnd').classList.add('hidden'); enterHangar(); }
function updateMission(dt){
  if(M.done||M.id==='free'||M.id==='net'||state!=='play') return;
  if(!M.started&&!S.onGround) M.started=true;
  if(M.started&&M.id!=='rings') M.t+=dt;
  if(M.id==='strike'&&gtargets.length&&gtargets.every(function(o){ return !o.alive; })){ endMission(true); return; }
  if(M.id==='air'&&targets.length&&targets.every(function(t){ return !t.alive; })){ endMission(true); return; }
  if(M.id==='recon'&&reconPts.length&&M.scanIdx<reconPts.length){
    const cur=reconPts[M.scanIdx], d=Math.hypot(S.pos.x-cur.pos.x,S.pos.z-cur.pos.z), agl=S.pos.y-cur.pos.y;
    if(!S.onGround&&d<450&&agl<2500){
      M.scanT+=dt;
      if(M.scanT>=4){ cur.done=true; M.scanIdx++; M.scanT=0; score+=100; noteScore(); toast('Keşif noktası '+M.scanIdx+'/'+reconPts.length+' tarandı  +100','#7dffb0'); updateReconVisuals(); }
    } else M.scanT=Math.max(0,M.scanT-dt*2);
    if(M.scanIdx>=reconPts.length){ endMission(true); return; }
  }
  const lim=MISSIONS[M.id].limit; if(lim&&M.t>lim) endMission(false);
}
function refreshMission(){
  Array.prototype.forEach.call($('missionSeg').children,function(b){ b.setAttribute('aria-pressed',String(b.dataset.m===missionId)); });
  $('mDesc').textContent=MISSIONS[missionId].desc;
  if($('aiEnemy')){ const c=aiCfg(); $('aiEnemy').value=String(c.enemies); $('aiWing').value=c.wing?'1':'0'; $('aiSkill').value=String(c.skill); $('aiEnemy').disabled=(missionId==='dogfight'); }
}
function selectMission(id){ missionId=id; try{ localStorage.setItem('kaan-sim-mission',id); }catch(e){} refreshMission(); }
function cycleMission(d){ selectMission(MORDER[(MORDER.indexOf(missionId)+d+MORDER.length)%MORDER.length]); }
function buildMissionUI(){
  const box=$('missionSeg'); box.innerHTML='';
  MORDER.forEach(function(id){ const b=document.createElement('button'); b.type='button'; b.dataset.m=id; b.textContent=MISSIONS[id].name; b.addEventListener('click',function(){ selectMission(id); }); box.appendChild(b); });
  refreshMission();
}
$('btnMRetry').addEventListener('click',restartMission);
$('btnMHangar').addEventListener('click',endToHangar);

