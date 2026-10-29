/* ------------------------------------------------------------------ TP balance and mission sanity (V2.39)
   TP per minute of the board's missions ran from 15 (İHA keşfi, 15 min, 220 TP) to 43 (Konvoy Avı), with no link to how
   hard a mission is. Now every mission's reward sits within 80–125 % of its length × a rate for its difficulty (Kolay 25,
   Orta 32, Zor 40 TP per minute); outliers are moved to the nearest edge, rounded to 10. Lessons (first-time reward), races
   and the campaign keep their own rules. The reward is changed where it is paid from (mission data), so the board and the
   end-of-mission report show the same figure.
   Sanity: an attack or air-to-air mission cannot be started with an aircraft that carries nothing to fire (ANKA: no gun, no
   stations) — the board says which aircraft to pick instead of letting the player fly a mission that cannot be won. */
const TPR={1:25,2:32,3:40}, TP_SKIP={school:1,race:1,cnew:1,cus:1,camp:1};
function tpFair(xp,dur,diff){ if(!dur||!xp) return xp; const t=dur*(TPR[diff]||TPR[2]), lo=Math.round(t*0.8/10)*10, hi=Math.round(t*1.25/10)*10; return xp<lo?lo:xp>hi?hi:xp; }
function tpApply(e){ if(!e||TP_SKIP[e.kind]) return; let m=null; try{ m=bMeta(e); }catch(x){ return; } if(!m||!m.dur||!m.xp) return; const f=tpFair(m.xp,m.dur,m.diff||2); if(f===m.xp) return;
  if(e.kind==='air'&&BMETA[e.id]) BMETA[e.id].xp=f; if(e.M&&e.M.xp!=null) e.M.xp=f; if(e.xp!=null) e.xp=f; if(e.D&&e.D.xp!=null) e.D.xp=f; }
boardAll=HOOK.wrap('boardAll','gorev/tp-dengesi#_tpAll',function(_tpAll){ return function(){ const L=_tpAll(); try{ L.forEach(tpApply); }catch(x){} return L; }; },boardAll);
/* ---- unarmed aircraft on an armed mission */
function misArmed(id){ const A=AIRCRAFT[id]; return !!A&&((SLOTS[id]||0)>0||A.weapon==='TOP'); }
function misNeedsArms(e,m){ if(!e||e.kind!=='air'&&!(e.kind==='dyn'&&e.sub==='air')) return false; const c=m&&m.cat; return c==='hava'||c==='taarruz'||(e.kind==='dyn'&&/^(intercept|cas|escort|strike|air)/.test(e.tp||'')); }
misGo=HOOK.wrap('misGo','gorev/tp-dengesi#_tpGo',function(_tpGo){ return function(){ const e=boardList()[misSel]; let m=null; try{ m=e&&bMeta(e); }catch(x){}
  if(e&&misNeedsArms(e,m)&&!misArmed(selectedId)){ toast('✈ '+((AIRCRAFT[selectedId]||{}).name||'Bu uçak')+' silah taşımıyor — bu görev için KAAN, Hürjet, Akıncı gibi silahlı bir uçak seç (Uçak düğmesi)','#ffc24a'); return; }
  return _tpGo(); }; },misGo);
