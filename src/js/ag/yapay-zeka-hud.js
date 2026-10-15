/* ------------------------------------------------------------------ AI and online players on the HUD: markers, radar dots, scoreboard (from yapay-zeka-ag, V2.25) */
// ---------- HUD: markers + radar dots + net scoreboard
function hudActors(w,h){
  const my=myTeam();
  ACT.forEach(function(a){
    if(!a.alive) return; const d=a.pos.distanceTo(S.pos); if(d>14000) return;
    const hostile=a.team!==my, col=hostile?'#ff4a4a':'#39e6ff', s=toScreen(a.pos);
    if(s.front&&s.x>20&&s.x<w-20&&s.y>20&&s.y<h-20){
      hx.save(); hx.strokeStyle=col; hx.lineWidth=1.6*sc; const b=(hostile?13:10)*sc;
      if(hostile){ hx.beginPath(); hx.moveTo(s.x,s.y-b); hx.lineTo(s.x+b,s.y+b*0.8); hx.lineTo(s.x-b,s.y+b*0.8); hx.closePath(); hx.stroke(); }
      else { hx.beginPath(); hx.arc(s.x,s.y,b,0,6.283); hx.stroke(); }
      hx.restore();
      tx(a.name+'  '+(d/1000).toFixed(1),s.x,s.y+b+11*sc,11,'center',col);
      if(a.hp<100){ hx.save(); hx.shadowBlur=0; hx.fillStyle='rgba(0,0,0,0.5)'; hx.fillRect(s.x-16*sc,s.y-b-8*sc,32*sc,3.5*sc); hx.fillStyle=col; hx.fillRect(s.x-16*sc,s.y-b-8*sc,32*sc*a.hp/100,3.5*sc); hx.restore(); }
    } else if(hostile&&d<6000){
      const ang=Math.atan2(-s.loc.y,s.loc.x), R=Math.min(w,h)*0.30, ax=w/2+Math.cos(ang)*R, ay=h/2+Math.sin(ang)*R;
      hx.save(); hx.fillStyle=col; hx.translate(ax,ay); hx.rotate(ang); hx.beginPath(); hx.moveTo(12*sc,0); hx.lineTo(-6*sc,-7*sc); hx.lineTo(-6*sc,7*sc); hx.closePath(); hx.fill(); hx.restore();
    }
  });
}
function radarActors(to,sc2){
  const my=myTeam();
  ACT.forEach(function(a){ if(!a.alive) return; const p=to(a.pos.x,a.pos.z); hx.fillStyle=a.team!==my?'#ff4a4a':'#39e6ff';
    hx.beginPath(); hx.moveTo(p[0],p[1]-4*sc2); hx.lineTo(p[0]+3.4*sc2,p[1]+3*sc2); hx.lineTo(p[0]-3.4*sc2,p[1]+3*sc2); hx.closePath(); hx.fill(); });
}
function hudNetLines(px,y){
  if(M.id==='dogfight'&&!NET.on){ const n=ACT.filter(function(a){ return a.team==='red'&&a.alive; }).length; tx('DALGA  '+Math.max(DF.wave,0)+'/'+DF.waves,px,y,14,'right',CD); y+=19*sc; tx('DÜŞMAN  '+n,px,y,14,'right',n?'#ff6a6a':CD); y+=19*sc; return y; }
  if(!NET.on) { const n=ACT.filter(function(a){ return a.team==='red'&&a.alive; }).length; if(n){ tx('DÜŞMAN UÇAK  '+n,px,y,14,'right','#ff6a6a'); y+=19*sc; } return y; }
  tx(NET_MODES[NET.mode].name+' · '+fmtT(Math.max(0,NET.timeLeft)),px,y,13,'right','#7dffb0'); y+=19*sc;
  if(NET.mode==='coop'){ tx('DALGA  '+NET.wave+'/5',px,y,14,'right',CD); y+=19*sc; }
  if(NET.mode==='team'||NET.mode==='base'){ const sc0=NET.mode==='base'?NB.sc:netTeamScore(); tx('MAVİ '+sc0.blue+'  —  '+sc0.red+' KIRMIZI',px,y,14,'right',C); y+=19*sc; }
  if(NET.mode==='base'){ NB_ZONES.forEach(function(Z,i){ const z=NB.zones[i], cap=z.p&&Math.abs(z.p)<1?' %'+Math.round(Math.abs(z.p)*100):''; tx(Z.n+'  '+(z.o==='blue'?'MAVİ':z.o==='red'?'KIRMIZI':'boş')+cap,px,y,12,'right',z.o==='blue'?'#5ab0ff':z.o==='red'?'#ff6a5a':CD); y+=16*sc; }); }
  NET.roster.filter(function(r){ return NET.mode!=='coop'||r.team==='blue'; }).forEach(function(r){ const s=NET.score[r.id]||{k:0,d:0};
    tx((r.id===NET.myId?'▶ ':'')+r.name+'  '+(r.role==='atc'?'KULE':s.k+'/'+s.d),px,y,12,'right',r.team==='red'?'#ff8a8a':(r.team==='blue'?'#8adfff':C)); y+=16*sc; });
  return y;
}

