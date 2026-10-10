let bad=0;
for(const id of Object.keys(AIRCRAFT)){
  selectedId=id; setAircraft(id); activeId=id; startGame('hangar'); startAutoTaxi(true);
  let t=0, done=false;
  for(;t<400;t+=0.05){ update(0.05); if(S.clearance && !S.taxi && S.speed<0.3){ done=true; break; } }
  const r=Math.hypot(S.pos.x,S.pos.z-1150);
  console.log(id,'t=',t.toFixed(0),'pos',S.pos.x.toFixed(0),S.pos.z.toFixed(0),'clr',S.clearance,'taxi',S.taxi,'state',state);
  if(!(Math.abs(S.pos.x)<30&&S.pos.z>900)) bad++;
}
// free flight smoke
startGame('air'); for(let t=0;t<120;t+=0.05) update(0.05); console.log('air ok hp',S.hp,state);
console.log('bad',bad);
