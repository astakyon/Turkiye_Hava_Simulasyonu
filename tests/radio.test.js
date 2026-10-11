let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T('phrases in sound library',Object.keys(PHR).every(function(k){ return SNDI['r_'+k]&&SNDI['r_'+k].cat==='telsiz'; }));
SETTINGS.callsign='Bozkurt 3'; T('callsign fill',radioFill('{cs}, Kule','')==='Bozkurt 3, Kule');
startGame('runway'); aiClear(); RADIO.q.length=0; RADIO.busy=false; RADIO.last={};
radioSay('tw_low'); T('queued',RADIO.q.length===1&&/Bozkurt 3/.test(RADIO.q[0].text));
radioSay('tw_low'); T('rate limited',RADIO.q.length===1);
radioStep(0.016); T('speaking shows subtitle',RADIO.busy&&/Kule/.test($('radioSub').innerHTML),$('radioSub').innerHTML);
RADIO.busy=false; RADIO.q.length=0;
radioQuick(2); T('quick message',RADIO.q.some(function(m){ return /Arkamda/.test(m.text); }));
RADIO.q.length=0; netHandle({t:'radio',text:'Selam',name:'Ali',from:'P1'},'P1'); T('net radio received',RADIO.q.some(function(m){ return m.text==='Selam'&&m.name==='Ali'; }));
T('controls',CTRL_DEF.gen.acts.some(function(a){ return a[0]==='radio'; })&&CTRL_DEF.gen.acts.some(function(a){ return a[0]==='ptt'; }));
radioMenu(true); T('radio menu',/TELSİZ/.test($('radioMenu').innerHTML)); radioMenu(false);
/* AWACS call when enemies appear */
RADIO.q.length=0; RADIO.last={}; RADIO.st.prev='play'; RADIO.st.reds=0; spawnEnemy&&spawnEnemy(0); radioStep(0.016); radioStep(0.016);
T('awacs contact',RADIO.q.concat(RADIO.busy?[{text:$('radioSub').innerHTML}]:[]).some(function(m){ return /Kartal Gözü|düşman/.test(m.text); })||ACT.filter(function(a){ return a.team==='red'; }).length===0);
console.log('pass',ok,'fail',bad);
