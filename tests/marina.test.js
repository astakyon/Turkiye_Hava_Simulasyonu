let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('marina built',MARINA.built===true);
const q=frWorld(MARINA.fr,-150,0); T('marina pad flat',Math.abs(terrainH(q[0],q[1])-2.7)<0.01,terrainH(q[0],q[1]));
const sea=frWorld(MARINA.fr,120,-150); T('harbour basin is water',terrainH(sea[0],sea[1])<-1,terrainH(sea[0],sea[1]));
const pon=frWorld(MARINA.fr,100,-10); T('pontoon walkable',Math.abs(groundH(pon[0],pon[1])-1.0)<0.01,groundH(pon[0],pon[1]));
const quay=frWorld(MARINA.fr,0,0); T('quay walkable',Math.abs(groundH(quay[0],quay[1])-3.1)<0.01);
T('ships at sea',MARINA.movers.length>=9,MARINA.movers.length);
const f=MARINA.movers[0]; const s0=f.s; marinaStep(2); T('ferry or ships move',MARINA.movers.some(function(m){ return m.s!==0; }));
let dry=0; for(let i=0;i<3000;i++){ marinaStep(1); MARINA.movers.forEach(function(m){ if(m.pause<=0&&terrainH(m.g.position.x,m.g.position.z)>1.5) dry++; }); }
T('ships stay in water',dry<40,dry);
T('gulls flying',MARINA.gullD.length>=50);
T('marina road in traffic',TRAFFIC.paths.length>=5);
enterHangar(); startWalk(); WALK.warp=9; walkWarp(); T('warp to marina',Math.abs(WALK.pos.x-2190)<1,WALK.pos.x);
console.log('pass',ok,'fail',bad);
