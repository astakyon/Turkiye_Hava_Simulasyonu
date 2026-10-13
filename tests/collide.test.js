let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); startWalk();
T_('parked cars in grid',COL.grid.size>0,COL.grid.size);
/* walking into a parked aircraft is blocked */
WALK.pos.set(11390,groundH(11390,11300)+1.7,11300); colRefresh(); const acB=COL.near.filter(function(b){ return b.tag==='ac'; });
T_('aircraft boxes near UAV base',acB.length>=3,acB.length);
const b=acB[0], p={x:(b.x0+b.x1)/2,z:(b.z0+b.z1)/2}; pushCircle(p,0.35,vehBoxes(null)); T_('pushed out of aircraft',!(p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1));
/* traffic stops for an obstacle ahead */
const c00=TRAFFIC.cars[0]; camera.position.set(c00.P.pts[c00.i][0],30,c00.P.pts[c00.i][1]); trafficStep(0.1); const c=TRAFFIC.cars.find(function(c){ return c.wx!=null; });
if(c){ WALK.mode='foot'; const fx=-Math.sin(c.wh), fz=-Math.cos(c.wh); camera.position.set(c.wx,30,c.wz); WALK.pos.set(c.wx+fx*8,0,c.wz+fz*8); const s0=c.s; trafficStep(0.5); T_('traffic car waits',Math.abs(c.s-s0)<1e-6,c.s-s0); } else T_('traffic present',false);
/* parked town car wakes up as a drivable car */
let pb=null; COL.grid.forEach(function(L){ L.forEach(function(x){ if(!pb&&x.pc&&!x.pc.done) pb=x; }); });
const n0=VEHS.length; WALK.mode='foot'; WALK.pos.set(pb.pc.x+2,groundH(pb.pc.x,pb.pc.z)+1.7,pb.pc.z); walkUpdate(0.016); T_('parked car became drivable',VEHS.length===n0+1&&pb.gone);
console.log('pass',ok,'fail',bad);
