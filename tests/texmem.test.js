let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* size limit: phones 1024, PC 2048 only at low quality */
const keepMob=DEV.mobile, keepQ=SETTINGS.quality;
DEV.mobile=true; T_('phone limit 1024',txsLimit()===1024);
DEV.mobile=false; SETTINGS.quality=1; T_('PC low quality 2048',txsLimit()===2048);
SETTINGS.quality=3; T_('PC high quality keeps all',txsLimit()>=1e9);
DEV.mobile=keepMob; SETTINGS.quality=keepQ;
/* sharing key includes sampling settings */
const V2=function(x,y){ return {x:x,y:y}; };
const mk=function(){ return {wrapS:1,wrapT:1,magFilter:1,minFilter:1,generateMipmaps:true,flipY:true,encoding:0,format:0,type:0,premultiplyAlpha:false,repeat:V2(1,1),offset:V2(0,0),rotation:0,center:V2(0,0)}; };
const a=mk(), b=mk(); T_('same params same key',txsParams(a)===txsParams(b)); b.repeat=V2(2,1); T_('different repeat different key',txsParams(a)!==txsParams(b));
/* watchdog: a redrawn original or canon gets its own copy back */
const keepL=TXS.links, keepS=TXS.shrunk; TXS.links=[]; TXS.shrunk=[]; TXS.reverted=0;
const orig={version:3,userData:{}}, canon={version:5,userData:{}}, m1={map:canon}, m2={map:canon};
TXS.links.push({orig:orig,canon:canon,users:[[m1,'map']],ov:3,cv:5});
txsWatch(); T_('unchanged link stays',TXS.links.length===1&&m1.map===canon);
orig.version=4; txsWatch(); T_('redrawn original restored',m1.map===orig&&m2.map===canon&&TXS.links.length===0&&orig.userData.txsOwn===true,TXS.links.length);
const o2={version:1,userData:{}}, m3={map:canon}; TXS.links.push({orig:o2,canon:canon,users:[[m3,'map']],ov:1,cv:5});
canon.version=6; txsWatch(); T_('redrawn canon releases its users',m3.map===o2&&TXS.links.length===0);
/* shrunk texture: redrawn full canvas comes back at full size */
const full={width:2048,height:256}, half={width:1024,height:128}, t={version:2,image:half,userData:{}};
TXS.shrunk.push({t:t,full:full,v:2}); txsWatch(); T_('unchanged shrink stays',t.image===half&&TXS.shrunk.length===1);
t.version=3; txsWatch(); T_('redrawn shrunk texture back at full size',t.image===full&&t.userData.txsOwn===true&&TXS.shrunk.length===0);
T_('reverts counted',TXS.reverted===3,TXS.reverted);
TXS.links=keepL; TXS.shrunk=keepS;
/* kill switch */
SETTINGS.texShare=false; T_('kill switch share',txsShare()===0); T_('kill switch shrink',txsShrink()===0); delete SETTINGS.texShare;
console.log('texmem: pass '+ok+' fail '+bad);
