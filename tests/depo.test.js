let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
const LS=localStorage; const clear=function(){ const ks=[]; for(let i=0;i<LS.length;i++) ks.push(LS.key(i)); ks.forEach(function(k){ LS.removeItem(k); }); };
/* first start after the update: old keys move into the one record, then disappear */
clear(); LS.setItem('kaan-sim-settings','{"quality":1}'); LS.setItem('ayy-profiles','[1,2]'); LS.setItem('ayy-stars','{"a":3}'); LS.setItem('other-app','x');
depoLoad(); T_('old keys moved',DEPO.moved===3&&DEPO.from==='taşındı',DEPO.moved+' '+DEPO.from);
T_('values kept as text',stGet('kaan-sim-settings')==='{"quality":1}'&&stGet('ayy-profiles')==='[1,2]');
T_('old keys removed',LS.getItem('kaan-sim-settings')===null&&LS.getItem('ayy-stars')===null); T_('foreign key untouched',LS.getItem('other-app')==='x');
T_('one record written',!!LS.getItem('ayy-kayit')&&JSON.parse(LS.getItem('ayy-kayit')).v===1);
/* reads, writes, deletes */
stSet('ayy-race','{"best":12}'); depoFlush(); T_('write reaches the record',JSON.parse(LS.getItem('ayy-kayit')).d['ayy-race']==='{"best":12}');
stDel('ayy-race'); depoFlush(); T_('delete reaches the record',!('ayy-race' in JSON.parse(LS.getItem('ayy-kayit')).d)); T_('missing key → null',stGet('ayy-yok')===null);
/* next start: the good record becomes the backup */
depoLoad(); T_('loads the record',DEPO.from==='kayıt'&&stGet('ayy-profiles')==='[1,2]'); T_('backup kept',LS.getItem('ayy-kayit-yedek')===LS.getItem('ayy-kayit'));
/* broken record → backup, broken text kept aside */
LS.setItem('ayy-kayit','{bozuk'); depoLoad(); T_('starts from the backup',DEPO.from==='yedek'&&stGet('ayy-profiles')==='[1,2]',DEPO.from); T_('broken text kept aside',LS.getItem('ayy-kayit-bozuk')==='{bozuk');
T_('record repaired',JSON.parse(LS.getItem('ayy-kayit')).d['ayy-profiles']==='[1,2]');
/* both broken → fresh start, game keeps going */
LS.setItem('ayy-kayit','x'); LS.setItem('ayy-kayit-yedek','y'); depoLoad(); T_('fresh start when both are broken',DEPO.from==='bozuk'&&stKeys().length===0);
/* the game's modules use the record: settings round trip */
SETTINGS.callsign='Test 9'; saveSettings(); depoFlush(); T_('settings saved in the record',/Test 9/.test(JSON.parse(LS.getItem('ayy-kayit')).d['kaan-sim-settings']));
console.log('depo: pass '+ok+' fail '+bad);
