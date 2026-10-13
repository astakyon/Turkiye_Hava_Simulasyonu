/* ------------------------------------------------------------------ board every vehicle (V2.04)
   Every aircraft model standing in the world (İHA ve Test Merkezi, Deniz Üssü, Kızıl Bölge, apron, the towed trainer…) is
   boardable: walk up to it, "E / UÇAĞA BİN" starts the flight from that exact spot and heading, the parked model hides while
   you fly and comes back when you leave. The list is read from the model registry (MODELS.inst), so any model added later
   is boardable without extra code. Hangar showcase and library previews keep their own behaviour; moving air traffic is
   excluded. */
const PK={cur:null, hid:null, v:new THREE.Vector3(), q:new THREE.Quaternion(), box:new THREE.Box3()};
function pkSkip(m){ const g=m&&m.group; if(!g||!g.parent||!g.visible) return true; if(typeof planeGroup!=='undefined'&&(g===planeGroup||g.parent===planeGroup)) return true;
  if(typeof AL!=='undefined'&&AL.ai&&AL.ai.some(function(a){ return a.m===m||a.g===g; })) return true;           /* moving air traffic */
  if(typeof UAV!=='undefined'&&UAV.orbit===m) return true;
  if(typeof displays!=='undefined'){ for(const k in displays){ const d=displays[k]; if(d&&(d.model===m||d.g===g)) return true; } }
  let p=g.parent; while(p){ if(p.userData&&(p.userData.lib||p.userData.noBoard)) return true; if(p===scene) return false; p=p.parent; } return true; }
function pkSize(m){ if(m._pkR) return m._pkR; try{ PK.box.setFromObject(m.group); const s=PK.box.getSize(PK.v); m._pkR=Math.max(4,Math.min(30,Math.max(s.x,s.z)*0.6)); }catch(e){ m._pkR=8; } return m._pkR; }
function pkNear(p){ if(typeof MODELS==='undefined'||!MODELS.inst) return null; let best=null, bd=1e9;
  for(const id in MODELS.inst){ if(!AIRCRAFT[id]) continue; const L=MODELS.inst[id]; for(let i=0;i<L.length;i++){ const m=L[i]; if(pkSkip(m)) continue; m.group.getWorldPosition(PK.v);
      const d=Math.hypot(PK.v.x-p.x,PK.v.z-p.z), R=pkSize(m)+2.5; if(d<R&&Math.abs(PK.v.y-p.y)<12&&d/R<bd){ bd=d/R; best={id:id,m:m}; } } }
  return best; }
const _pkWalk=walkUpdate; walkUpdate=function(dt){ _pkWalk(dt); PK.cur=null;
  if(WALK.mode==='foot'&&!WALK.near){ const n=pkNear(WALK.pos); if(n){ PK.cur=n; WALK.near='plane'; WALK.nearId=n.id; } } };
function pkBoard(n){ const g=n.m.group; g.getWorldPosition(PK.v); g.getWorldQuaternion(PK.q); const id=n.id, pos=PK.v.clone(), q=PK.q.clone();
  walkLeave(); selectedId=id; if(activeId!==id) setAircraft(id); if(missionId!=='free') selectMission('free'); startGame('runway');
  const gy=Math.max(groundH(pos.x,pos.z),pos.y-0.5); S.pos.set(pos.x,gy+CUR.gearOff,pos.z);
  /* heading only (parked models may sit slightly pitched) */
  const f=new THREE.Vector3(0,0,-1).applyQuaternion(q); S.q.setFromAxisAngle(UP,Math.atan2(-f.x,-f.z));
  S.speed=0; S.throttle=0; S.onGround=true; S.taxi=false; S.auto=false; S.clearance=true; S.gear=true; camSnap=true; try{ camQ.copy(S.q); }catch(e){}
  g.visible=false; PK.hid=g; toast(AIRCRAFT[id].name+' hazır — gazı aç, pistte hızlan ve kalk','#7dffb0'); }
const _pkAct=walkInteract; walkInteract=function(){ if(state==='walk'&&WALK.mode==='foot'&&WALK.near==='plane'&&PK.cur&&PK.cur.id===WALK.nearId){ if(typeof licOk==='function'&&!licExempt()&&!licOk(PK.cur.id)){ toast(licMsg(PK.cur.id),'#ffc24a'); return; } pkBoard(PK.cur); return; } return _pkAct(); };
/* bring the parked model back when the flight is over */
const _pkCull=cullStep; cullStep=function(dt){ _pkCull(dt); if(PK.hid&&state!=='play'&&state!=='paused'&&state!=='map'&&state!=='mend'){ PK.hid.visible=true; PK.hid=null; } };
