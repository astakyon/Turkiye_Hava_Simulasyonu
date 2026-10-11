let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('clear by default',(SETTINGS.wx||'clear')==='clear');
wxSet('storm'); for(let i=0;i<300;i++) wxStep(0.1); T('storm blends in',WX.cur.rain>0.9&&WX.cur.wind>15,JSON.stringify(WX.cur));
T('fog thickens',WX.cur.fog>0.6);
T('rain particles on',WX.rainOn);
state='walk'; WX.nextBolt=0; wxStep(0.1); state='menu'; T('lightning flash',WX.flash>0);
wxSet('snow'); for(let i=0;i<400;i++) wxStep(0.1); T('snow',WX.cur.snow>0.8&&WX.snowOn&&!WX.rainOn);
wxSet('clear'); for(let i=0;i<500;i++) wxStep(0.1); T('back to clear',WX.cur.rain<0.01&&WX.cur.fog<0.01&&!WX.rainOn);
wxSet('auto'); WX.autoT=0; wxStep(0.1); T('auto picks a weather',!!WX_P[WX.kind]);
/* wind drifts the aircraft */
wxSet('storm'); for(let i=0;i<300;i++) wxStep(0.1);
selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:0,wing:false,skill:1}; startGame('air'); WX.dir=270;
S.pos.set(3000,1500,3000); S.q.identity(); S.speed=150; S.throttle=0.6; const x0=S.pos.x; for(let i=0;i<100;i++) update(0.05);
T('westerly wind pushes east',S.pos.x>x0+50,S.pos.x-x0);
const q0=S.q.clone(); update(0.05); T('turbulence moves the nose',Math.abs(S.q.x-q0.x)+Math.abs(S.q.z-q0.z)>1e-6);
T('radio wind matches',/derece/.test(windTxt())&&/^27/.test(windTxt()),windTxt());
/* NVG / FLIR */
WX.vis='off'; visCycle(); T('nvg on',WX.vis==='nvg'); visCycle(); T('flir',WX.vis==='flir'); visCycle(); visCycle(); T('cycles back off',WX.vis==='off');
wxSet('clear');
console.log('pass',ok,'fail',bad);
