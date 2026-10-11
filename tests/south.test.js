let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('bridge and city built',SOUTH.built===true);
T('deck high over the strait',groundH(SOUTH.bx,4200)>60,groundH(SOUTH.bx,4200));
T('sea under the bridge',terrainH(SOUTH.bx,4200)<-30);
T('deck meets the city',Math.abs(SOUTH.deckAt(SOUTH.zS)-32.4)<0.5);
T('city pad flat',Math.abs(terrainH(-1300,6300)-32)<0.01);
// flying under the bridge is allowed, hitting the deck is not
const under=AP.obst.filter(function(b){ return b.y0!=null&&SOUTH.bx>b.x0&&SOUTH.bx<b.x1&&4200>b.z0&&4200<b.z1; });
T('deck obstacle has a bottom',under.length===1&&under[0].y0>50,under.length);
T('city buildings are obstacles',AP.obst.filter(function(b){ return b.x0>-2700&&b.x1<-200&&b.z0>5900&&b.z1<6700; }).length>60);
T('traffic over the bridge',TRAFFIC.paths.some(function(P){ return P.pts[0][0]===SOUTH.bx&&P.len>3000; }));
enterHangar(); startWalk(); WALK.mode='car'; WALK.warp=16; walkWarp(); T('warp onto the bridge',Math.abs(WALK.car.z-3600)<1,WALK.car.z);
T('car on the deck',WALK.car.mesh.position.y>55,WALK.car.mesh.position.y);
console.log('pass',ok,'fail',bad);
