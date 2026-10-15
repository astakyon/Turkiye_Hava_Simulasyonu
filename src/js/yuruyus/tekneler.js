/* ------------------------------------------------------------------ sea vehicles you can drive, and helicopter decks on ships
   Drivable: patrol boat and tug at the naval base, a frigate at the outer berth, a fishing boat and a sailboat at the marina.
   'sea' control scheme: W/S set the engine telegraph (throttle lever), A/D rudder, Space gun, C camera, E (or the land exit key)
   leaves at a quay. A frigate patrols off the naval base with a live helideck: helicopters land on the moving deck and ride along. */
const BOATS=[];
const BOAT_KINDS={
  patrol:{n:'Hücumbot',top:21,acc:1.8,turn:0.32,gun:'auto',cam:1.6,build:function(){ return buildPatrol('P-1205'); }},
  tug:{n:'Römorkör',top:7,acc:0.9,turn:0.28,cam:1.4,build:function(){ return buildTug(); }},
  frigate:{n:'Ada sınıfı korvet',top:15,acc:0.45,turn:0.09,gun:'cannon',cam:3.4,build:function(){ return buildFrigate('ada','F-517'); }},
  fishing:{n:'Balıkçı teknesi',top:6,acc:0.8,turn:0.32,cam:1.2,build:function(){ return buildFishing('#2f6aa5'); }},
  sail:{n:'Yelkenli',top:5.5,acc:0.5,turn:0.3,cam:1.4,build:function(){ return buildSailboat(true); }}};
/* naval base: alongside the south face of the mole (z -3460) */
const BOAT_SPOTS=[['patrol',-2090,-3466.5,Math.PI/2],['tug',-2290,-3464,Math.PI/2],['frigate',-2200,-3469,Math.PI/2],['fishing',2480,1480,2.2],['sail',2525,1525,2.2]];
let BOATS_BUILT=false;
function buildBoats(){ if(BOATS_BUILT) return; BOATS_BUILT=true;
  BOAT_SPOTS.forEach(function(s){ try{ const K=BOAT_KINDS[s[0]], sh=K.build(), g=new THREE.Group(); g.add(bakeGroup(sh.group)); scene.add(g);
    const b={id:s[0],K:K,g:g,L:sh.L||12,B:sh.B||Math.max(3,(sh.L||12)*0.18),x:s[1],z:s[2],h:s[3],v:0,th:0,yr:0,cd:0,bob:Math.random()*6,deck:sh.deck||null};
    BOATS.push(b); boatPlace(b,0);
    if(b.deck){ const d=b.deck; SHIPDECKS.push({x:b.x,z:b.z,y:d.y,r:d.r,local:new THREE.Vector3(0,d.y,d.z),g:g,mover:b,name:'Korvet güvertesi'}); }
  }catch(e){ console.warn('tekne',s[0],e); } });
  patrolFrigate();
}
function boatPlace(b,dt){ b.bob+=dt; const big=b.L>50, a=big?0.008:0.03; b.g.position.set(b.x,Math.sin(b.bob*1.3)*(big?0.15:0.25),b.z);
  b.g.rotation.set(Math.sin(b.bob*0.9)*a+(b.v/(b.K?b.K.top:10))*(big?-0.004:-0.04),b.h,Math.sin(b.bob*1.1+1)*a*1.4+(b.yr||0)*(big?-0.05:-0.25),'YXZ'); }
/* a frigate patrolling off the naval base: moving helideck */
function patrolFrigate(){ try{ const sh=buildFrigate('ada','F-518'), m=seaMover(sh,loopPts(-3100,-3900,520,360,32),6,{loop:true,s0:0.2});
  SHIPDECKS.push({x:0,z:0,y:sh.deck.y,r:sh.deck.r,local:new THREE.Vector3(0,sh.deck.y,sh.deck.z),g:m.g,mover:m,name:'Devriye korveti'}); }catch(e){ console.warn('devriye',e); } }
/* deck positions follow their ship */
const dV=new THREE.Vector3();
function decksStep(){ SHIPDECKS.forEach(function(d){ if(!d.mover) return; d.g.updateMatrixWorld(true); dV.copy(d.local); d.g.localToWorld(dV); d.px=d.x; d.pz=d.z; d.py=d.y; d.x=dV.x; d.z=dV.z; d.y=dV.y; }); }
function deckAt(x,z,y){ for(let i=0;i<SHIPDECKS.length;i++){ const d=SHIPDECKS[i]; if(Math.hypot(x-d.x,z-d.z)<d.r&&y>=d.y-1.5) return d; } return null; }
/* helicopters: decks are landing floors; a landed helicopter rides with the ship */
(function(){
  const F=heliFloor; heliFloor=function(H){ const f=F.apply(this,arguments), d=deckAt(H.x,H.z,H.y); if(d&&d.y>f.y){ return {y:d.y,water:false,deck:d}; } return f; };
  const S=heliStep; heliStep=function(dt){ const H=HELI.cur;
    if(H&&H.ground){ const d=deckAt(H.x,H.z,H.y+0.5); if(d&&d.mover&&d.px!=null){ H.x+=d.x-d.px; H.z+=d.z-d.pz; H.y=d.y; if(d.mover.dh) H.h+=d.mover.dh; } }
    return S.apply(this,arguments); };
})();
/* ---- driving */
const BOAT={cur:null};
function boatNear(p){ let best=null, bd=1e9; BOATS.forEach(function(b){ const s=Math.sin(b.h), c=Math.cos(b.h), dx=p.x-b.x, dz=p.z-b.z, lx=dx*c-dz*s, lz=dx*s+dz*c;
  if(Math.abs(lz)<b.L/2+2&&Math.abs(lx)<b.B/2+9){ const d=Math.abs(lx); if(d<bd){ bd=d; best=b; } } }); return best; }
function boatBoard(b){ BOAT.cur=b; WALK.mode='boat'; WALK.cy=0; WALK.pitch=0; WALK.hint=10;
  toast(b.K.n+' — W/S makine telgrafı · A/D dümen'+(b.K.gun?' · Boşluk top':'')+' · C kamera · E kıyıda in','#b8ecff'); }
function boatExit(){ const b=BOAT.cur; if(!b) return;
  for(let r=4;r<=40;r+=3) for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, x=b.x+Math.cos(a)*(r+b.B/2), z=b.z+Math.sin(a)*(r+b.B/2);
    if(groundH(x,z)>0.8){ BOAT.cur=null; b.th=0; WALK.mode='foot'; WALK.pos.set(x,groundH(x,z)+1.7,z); WALK.yaw=Math.atan2(b.x-x,b.z-z)+Math.PI; WALK.air=false; return; } }
  toast('Kıyıya ya da iskeleye yanaş, sonra in','#ffc24a'); }
function boatInput(){ const t=WALK.tvis; return {f:clamp(act('sea','thrUp')-act('sea','thrDown')+(t?-WALK.sy:0),-1,1), r:clamp(act('sea','rudR')-act('sea','rudL')+(t?WALK.sx:0),-1,1)}; }
function boatBlocked(b,x,z){ const s=Math.sin(b.h), c=Math.cos(b.h);
  for(const o of [-0.45,0,0.45]){ const px=x-s*o*b.L, pz=z-c*o*b.L; if(terrainH(px,pz)>-(b.L>50?2.5:0.8)) return true;
    for(let i=0;i<DECKS.length;i++){ const d=DECKS[i]; if(d.fr||d.yf) continue; if(px>d.x0-b.B/2&&px<d.x1+b.B/2&&pz>d.z0-b.B/2&&pz<d.z1+b.B/2) return true; } }
  return false; }
function boatStep(dt){
  const b=BOAT.cur; if(!b) return; const K=b.K, inp=boatInput();
  b.th=clamp(b.th+inp.f*dt*0.5,-0.35,1); const tv=b.th*K.top; b.v+=clamp(tv-b.v,-K.acc*1.5*dt,K.acc*dt);
  const yt=-inp.r*K.turn*clamp(Math.abs(b.v)/(K.top*0.4),0.15,1)*(b.v<0?-1:1); b.yr+=(yt-b.yr)*Math.min(1,dt*1.2); const oh=b.h; b.h+=b.yr*dt; b.dh=b.h-oh;
  const nx=b.x-Math.sin(b.h)*b.v*dt, nz=b.z-Math.cos(b.h)*b.v*dt;
  if(boatBlocked(b,nx,nz)){ if(Math.abs(b.v)>3) toast('Karaya / iskeleye çarptın!','#ff6a5a'); b.v*=-0.15; b.th=0; } else { b.x=nx; b.z=nz; }
  if(Math.abs(b.x)>14800||Math.abs(b.z)>14800){ b.x=clamp(b.x,-14800,14800); b.z=clamp(b.z,-14800,14800); b.v=0; }
  boatPlace(b,dt);
  if(K.gun&&act('sea','gun')>0.5) boatFire(b);
  if(b.cd>0) b.cd-=dt;
  WALK.near=null;
}
function boatFire(b){ if(b.cd>0) return; const big=b.K.gun==='cannon'; b.cd=big?2.2:0.12;
  const yaw=b.h+WALK.cy; vD.set(-Math.sin(yaw),0,-Math.cos(yaw)); vM.set(b.x,big?8:3,b.z).addScaledVector(vD,b.L*(big?0.32:0.3));
  const sp=big?260:420, sh={p:vM.clone(),v:vD.clone().multiplyScalar(sp),life:big?6:3,big:big}; sh.v.y=sp*(0.02-WALK.pitch*0.35);
  const m=new THREE.Mesh(new THREE.SphereGeometry(big?0.2:0.08,6,4),new THREE.MeshBasicMaterial({color:0xffd27a})); m.position.copy(sh.p); scene.add(m); sh.m=m; VFX.shells.push(sh);
  sndPlay(big?'boom':'gun',{vol:big?0.45:0.8,pitch:big?1.4:0.8}); if(big) explode(vM.clone(),6,1.2); }
const bV=new THREE.Vector3(), bV2=new THREE.Vector3();
function boatCam(dt){
  const b=BOAT.cur; if(!b) return; const big=b.L>50, D=(big?b.L*0.75:b.L*1.6+8)*WALK.camD, a=b.h+WALK.cy;
  const fov=62; if(Math.abs(lastFov-fov)>0.05){ camera.fov=fov; lastFov=fov; camera.updateProjectionMatrix(); }
  if(WALK.fp){ bV.set(b.x-Math.sin(b.h)*b.L*(big?0.1:0.05),big?14:3.2,b.z-Math.cos(b.h)*b.L*(big?0.1:0.05)); camera.position.copy(bV); const e=new THREE.Euler(WALK.pitch,b.h+WALK.cy,0,'YXZ'); camera.quaternion.setFromEuler(e); camera.updateMatrixWorld(); return; }
  bV.set(b.x+Math.sin(a)*D,(big?18:5)+D*0.22+WALK.pitch*-10,b.z+Math.cos(a)*D);
  if(dt>0&&camera.position.distanceTo(bV)<120) camera.position.lerp(bV,1-Math.exp(-dt*4)); else camera.position.copy(bV);
  camera.lookAt(bV2.set(b.x,big?8:2,b.z)); camera.updateMatrixWorld();
}
function boatHUD(w,h,s){ const b=BOAT.cur, L=WALK.tvis?w/2:Math.round(16*s), top=Math.round(20*s), kn=Math.abs(b.v)*1.944;
  hx.textAlign=WALK.tvis?'center':'left'; hx.font='700 '+Math.round(13*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#b8ecff'; hx.fillText('DENİZ · '+b.K.n.toLocaleUpperCase('tr-TR'),L,top);
  hx.font='700 '+Math.round(26*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#fff'; hx.fillText(kn.toFixed(1)+' knot',L,top+Math.round(28*s));
  hx.font='700 '+Math.round(14*s)+'px "Chakra Petch",system-ui,sans-serif'; hx.fillStyle='#b8ecff';
  const tel=b.th<-0.05?'TORNISTAN':b.th<0.05?'STOP':b.th<0.35?'AHEAD AZ':b.th<0.7?'YARIM YOL':'TAM YOL'; hx.fillText('MAKİNE '+tel+' ('+Math.round(b.th*100)+'%)'+(b.K.gun?' · TOP: Boşluk':''),L,top+Math.round(52*s)); }
/* E / exit key / touch button leave the boat; touch stick steers */
INPUT.on('keydown',function(e){ if(state!=='walk'||WALK.mode!=='boat') return; if(isKey(e,'land','exit')||isKey(e,'foot','use')){ boatExit(); e.stopImmediatePropagation(); return; }
  if(isKey(e,'gen','camera')){ WALK.fp=!WALK.fp; WALK.pitch=0; e.stopImmediatePropagation(); return; } },true,'yuruyus/tekneler','tekne');
