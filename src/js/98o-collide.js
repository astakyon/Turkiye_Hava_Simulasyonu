/* ------------------------------------------------------------------ collisions (V2.05)
   Solid for people and vehicles: every parked aircraft model (fuselage box along its heading), the airport's AI aircraft,
   traffic cars near the player, the parked cars of the towns and marina, and boats tied up at the quays.
   • Walking: you cannot pass through them. • Driving: the car is pushed back and slowed; a hard hit shakes the camera and
     makes a crash sound. Traffic cars brake and stop when something is in front of them (your car or you).
   • Taxiing aircraft: touching a parked aircraft or a vehicle stops you; above 9 m/s it is a crash.
   Only objects within 160 m of the player are tested, using a coarse grid for the static parked cars. */
const COL={grid:new Map(), cell:60, near:[], t:9, hitT:0, lastV:0, v:new THREE.Vector3(), q:new THREE.Quaternion(), f:new THREE.Vector3()};
function colBox(x,z,h,hl,hw,tag){ const s=Math.abs(Math.sin(h)), c=Math.abs(Math.cos(h)), ex=hw*c+hl*s, ez=hl*c+hw*s; return {x0:x-ex,x1:x+ex,z0:z-ez,z1:z+ez,tag:tag||null}; }
/* static parked cars (instanced) go into a grid once */
const _colCI=carInstances; carInstances=function(list,r){ const m=_colCI(list,r); try{ list.forEach(function(c,i){ if(c.y<-10) return; const k=Math.floor(c.x/COL.cell)+','+Math.floor(c.z/COL.cell); let L=COL.grid.get(k); if(!L){ L=[]; COL.grid.set(k,L); }
    const b=colBox(c.x,c.z,c.h,2.15,0.95,'car'); b.pc={x:c.x,z:c.z,h:c.h,m:m,i:i}; L.push(b); }); }catch(e){} return m; };
/* a parked (instanced) car becomes a real, drivable car when you walk up to it */
const COL_Z=new THREE.Matrix4().makeScale(0,0,0);
function colWake(b){ const P=b.pc; if(!P||P.done) return null; P.done=true; b.gone=true; try{ ['body','glass','wheel'].forEach(function(k){ const im=P.m[k]; im.setMatrixAt(P.i,COL_Z); im.instanceMatrix.needsUpdate=true; }); }catch(e){}
  const kinds=['suv','suvR','mil']; const id=kinds.find(function(k){ return CAR_KINDS.some(function(c){ return c.id===k; }); })||CAR_KINDS[0].id; const c=vehNew(id,P.x,P.z,P.h); return c; }
function colGridNear(x,z,R){ const out=[], c0=Math.floor((x-R)/COL.cell), c1=Math.floor((x+R)/COL.cell), r0=Math.floor((z-R)/COL.cell), r1=Math.floor((z+R)/COL.cell);
  for(let i=c0;i<=c1;i++) for(let j=r0;j<=r1;j++){ const L=COL.grid.get(i+','+j); if(L) for(let k=0;k<L.length;k++) if(!L[k].gone) out.push(L[k]); } return out; }
function colHead(g){ if(typeof g.getWorldQuaternion!=='function') return (g.rotation&&g.rotation.y)||0; g.getWorldQuaternion(COL.q); COL.f.set(0,0,-1).applyQuaternion(COL.q); return Math.atan2(-COL.f.x,-COL.f.z); }
/* aircraft fuselage boxes (parked models from the registry + airport AI aircraft) */
function colAcBoxes(x,z,R){ const out=[]; if(typeof MODELS!=='undefined'&&MODELS.inst) for(const id in MODELS.inst){ const D=AIRCRAFT[id]; if(!D) continue; MODELS.inst[id].forEach(function(m){ if(typeof pkSkip==='function'?pkSkip(m):!(m.group&&m.group.parent)) return; if(typeof PK!=='undefined'&&PK.hid===m.group) return;
      m.group.getWorldPosition(COL.v); if(Math.abs(COL.v.x-x)>R||Math.abs(COL.v.z-z)>R) return; const hd=colHead(m.group);
      const len=parseFloat(String(D.len||'10').replace(',','.'))||10; out.push(colBox(COL.v.x,COL.v.z,hd,len*0.45,1.3,'ac')); }); }
  if(typeof AL!=='undefined'&&AL.ai) AL.ai.forEach(function(a){ if(Math.abs(a.x-x)>R||Math.abs(a.z-z)>R||(a.y-a.gy)>3) return; const len=parseFloat(String(a.D.len||'10').replace(',','.'))||10; out.push(colBox(a.x,a.z,a.h,len*0.45,1.3,'ac')); });
  return out; }
/* traffic cars near the player: positions are stored by the traffic step */
function colTraffic(x,z,R){ const out=[]; if(typeof TRAFFIC==='undefined') return out; TRAFFIC.cars.forEach(function(c){ if(c.wx==null||Math.abs(c.wx-x)>R||Math.abs(c.wz-z)>R) return; out.push(colBox(c.wx,c.wz,c.wh,2.2,0.95,'traffic')); }); return out; }
function colBoatBoxes(x,z,R){ const out=[]; if(typeof BOATS==='undefined') return out; BOATS.forEach(function(b){ if(typeof BOAT!=='undefined'&&b===BOAT.cur) return; if(Math.abs(b.x-x)>R+b.L||Math.abs(b.z-z)>R+b.L) return; out.push(colBox(b.x,b.z,b.h,b.L*0.46,b.B*0.5,'boat')); }); return out; }
function colPlayerXZ(){ if(state==='play') return [S.pos.x,S.pos.z]; if(WALK.mode==='car'&&WALK.car) return [WALK.car.x,WALK.car.z]; return [WALK.pos.x,WALK.pos.z]; }
function colRefresh(){ const p=colPlayerXZ(), R=160; COL.near=colGridNear(p[0],p[1],R).concat(colAcBoxes(p[0],p[1],R),colBoatBoxes(p[0],p[1],R)); COL.t=0; }
/* extra boxes join the vehicle boxes used by walking and driving */
const _colVB=vehBoxes; vehBoxes=function(except){ const L=_colVB(except); const p=colPlayerXZ(); return L.concat(COL.near,colTraffic(p[0],p[1],120)); };
/* traffic: remember positions, stop for obstacles in front */
const _colTr=trafficStep; trafficStep=function(dt){ const T1=TRAFFIC; if(!T1||!T1.mesh) return _colTr(dt);
  const pp=(state==='walk')?(WALK.mode==='car'&&WALK.car?{x:WALK.car.x,z:WALK.car.z}:{x:WALK.pos.x,z:WALK.pos.z}):(state==='play'&&S.onGround?{x:S.pos.x,z:S.pos.z}:null);
  const keep=[]; if(pp) T1.cars.forEach(function(c,k){ if(c.wx==null) return; const fx=-Math.sin(c.wh), fz=-Math.cos(c.wh), dx=pp.x-c.wx, dz=pp.z-c.wz, ahead=dx*fx+dz*fz, side=Math.abs(dx*fz-dz*fx);
    if(ahead>0&&ahead<14&&side<2.6){ keep.push([c,c.v]); c.v=0; c.stopT=(c.stopT||0)+dt; if(c.stopT>1.5&&c.stopT-dt<=1.5) try{ sndPlay('horn',{vol:0.35}); }catch(e){} } else c.stopT=0; });
  _colTr(dt); keep.forEach(function(k){ k[0].v=k[1]; });
  /* positions of the cars that were drawn (same maths as the traffic step) */
  const cp=camera.position, R2=200*200; for(let k=0;k<T1.cars.length;k++){ const c=T1.cars[k], P=c.P, a=P.pts[c.i], b=P.pts[c.i+1]; if(!a||!b){ c.wx=null; continue; }
    const seg=P.L[c.i+1]-P.L[c.i]||1, u=(c.s-P.L[c.i])/seg, cx=a[0]+(b[0]-a[0])*u, cz=a[1]+(b[1]-a[1])*u; if((cx-cp.x)*(cx-cp.x)+(cz-cp.z)*(cz-cp.z)>R2){ c.wx=null; continue; }
    const fx=(b[0]-a[0])/seg*c.dir, fz=(b[1]-a[1])/seg*c.dir; c.wx=cx-fz*2.0; c.wz=cz+fx*2.0; c.wh=Math.atan2(-fx,-fz); } };
/* car impacts: sound, shake, message */
const _colWalk=walkUpdate; walkUpdate=function(dt){ COL.t+=dt; if(COL.t>0.5) colRefresh(); const car=WALK.mode==='car'?WALK.car:null, v0=car?Math.abs(car.v||0):0;
  if(WALK.mode==='foot'){ const near=colGridNear(WALK.pos.x,WALK.pos.z,6); for(let k=0;k<near.length;k++){ const b=near[k]; if(b.pc&&!b.pc.done&&Math.hypot(b.pc.x-WALK.pos.x,b.pc.z-WALK.pos.z)<4.2){ colWake(b); COL.t=9; break; } } }
  _colWalk(dt);
  if(car&&WALK.car===car){ const dv=v0-Math.abs(car.v||0); COL.hitT-=dt; if(dv>6&&v0>8&&COL.hitT<=0){ COL.hitT=1.5; try{ sndPlay('boom',{vol:Math.min(0.6,dv/30),pitch:1.8}); }catch(e){} try{ rumble(220,0.6,0.9); }catch(e){} if(v0>14) toast('Çarpışma! ('+Math.round(v0*3.6)+' km/s)','#ff8a5a'); } } };
/* taxiing aircraft */
const _colUpd=update; update=function(dt){ _colUpd(dt); if(state!=='play'||!S.onGround||S.crashed||S.speed<0.5) return; COL.t+=dt; if(COL.t>0.5) colRefresh();
  const p={x:S.pos.x,z:S.pos.z}, ox=p.x, oz=p.z, r=Math.max(2.2,(parseFloat(String(CUR.span||'10').replace(',','.'))||10)*0.18), B=COL.near.concat(colTraffic(p.x,p.z,100),typeof vehBoxes==='function'?_colVB(null):[]);
  if(pushCircle(p,r,B)){ if(S.speed>9){ crash('Yerde bir araca çarptın'); return; } S.pos.x=p.x; S.pos.z=p.z; S.speed=0; S.throttle=Math.min(S.throttle,0.2); if(COL.hitT<=0){ COL.hitT=2; toast('Önünde engel var — dur ve etrafından dolaş','#ffc24a'); } } COL.hitT-=dt; };
