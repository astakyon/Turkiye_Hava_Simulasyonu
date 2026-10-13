let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick');
T_('7 land/sea missions on board',boardAll().filter(function(e){ return e.kind==='gv'; }).length===7);
T_('meta',bMeta({kind:'gv',M:GVMIS[0]}).cat==='kara');
/* land: tank mission */
hmStart('g_konvoy'); T_('tank started',HM.on&&WALK.mode==='car'&&WALK.car&&WALK.car.K&&/Altay/i.test(WALK.car.K.n||''),WALK.car&&WALK.car.K&&WALK.car.K.n);
T_('targets spawned',HTGT.filter(function(t){ return t.alive; }).length===4);
WALK.car.x=500; WALK.car.z=-3900; hmStep(0.016); T_('checkpoint reached',HM.i===1,HM.i);
/* shells damage targets */
const t=HTGT[2]; VFX.shells.push({p:new THREE.Vector3(t.x,groundH(t.x,t.z)+0.05,t.z),v:new THREE.Vector3(0,-5,0),life:2,big:true,m:new THREE.Mesh()}); vehWeaponsStep(0.016); T_('cannon shell hits mission target',t.hp<HT_KIND[t.kind].hp,t.hp);
HTGT.forEach(function(o){ if(o.alive) htKill(o); }); hmStep(0.016); T_('mission won',HM.ended);
hmQuit();
/* sea: boat mission */
hmStart('s_devriye'); T_('boat started',HM.on&&WALK.mode==='boat'&&BOAT.cur&&BOAT.cur.id==='patrol');
BOAT.cur.x=-2800; BOAT.cur.z=-4400; hmStep(0.016); T_('sea checkpoint by boat',HM.i===1,HM.i);
hmQuit();
hmStart('s_kacakci'); T_('smuggler spawned',HTGT.length===1&&HTGT[0].mv); const x0=HTGT[0].x; htStep(1); T_('smuggler moves',HTGT[0].x!==x0);
hmQuit();
hmStart('s_anadolu'); T_('TCG Anadolu boarded',BOAT.cur&&BOAT.cur.id==='anadolu'); hmQuit();
/* career needs the licence */
playMode('career'); const p=licProfile(); p.lic2={}; if(p.stats) delete p.stats.lic2; T_('locked without licence',misLocked({kind:'gv',M:GVMIS[3]}));
/* medal entry works with careerAdd */
let err=null; try{ careerAdd(10,null); }catch(e){ err=e.message; } T_('careerAdd ok (medals)',!err,err);
console.log('pass',ok,'fail',bad);
