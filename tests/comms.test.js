let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; SETTINGS.ai={enemies:1,wing:true,skill:1}; startGame('air');
T_('ping action bound',CTRL.kb.gen.ping&&CTRL.kb.gen.ping[0]==='F4');
PINGS.length=0; pingPlace('tehlike',new THREE.Vector3(100,50,200)); T_('ping placed',PINGS.length===1&&PINGS[0].k==='tehlike');
pingPlace('git',new THREE.Vector3(300,0,200)); T_('one ping per player',PINGS.length===1&&PINGS[0].k==='git');
pingIn({k:'hedef',x:0,y:0,z:0,by:'X',name:'Ali'},false); T_('remote ping',PINGS.length===2);
pingStep(30); T_('pings expire',PINGS.length===0);
/* wheel */
pwOpen(); T_('wheel opens',PW.open); PW.sel=4; pwClose(true); T_('wheel commits selection',PINGS.length===1&&PINGS[0].k==='savun');
/* aim returns a point */
const a=pingAim(); T_('aim point',a&&isFinite(a.x)&&isFinite(a.z));
/* network: other team ignored, talk indicator */
NET.on=true; NET.myId='me'; NET.roster=[{id:'me',team:'blue'}]; PINGS.length=0;
netHandle({t:'ping',k:'hedef',x:0,y:0,z:0,by:'R1',name:'Kızıl',team:'red'},'H'); T_('enemy team ping ignored',PINGS.length===0);
netHandle({t:'ping',k:'hedef',x:0,y:0,z:0,by:'B1',name:'Mavi',team:'blue'},'H'); T_('team ping shown',PINGS.length===1);
netHandle({t:'talk',on:true,by:'B1',name:'Mavi'},'H'); T_('talking shown',!!TALK.B1); netHandle({t:'talk',on:false,by:'B1'},'H'); T_('talk ends',!TALK.B1);
NET.on=false;
console.log('pass',ok,'fail',bad);
