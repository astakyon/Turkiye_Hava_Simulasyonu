let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* the texture job waits during play and carries on in menus */
txsStart(); state='play'; TXS.job=null; txsBgStep(); T_('no work while flying',TXS.run===true&&TXS.job===null&&TXS.phase!=='shrink');
state='walk'; txsBgStep(); T_('no work while walking',TXS.job===null);
state='menu'; let n=0; while(TXS.run&&n<5000){ txsBgStep(); n++; } T_('finishes in the menu',!TXS.run&&TXS.done,n);
/* the performance test finishes the job before measuring */
txsStart(); T_('job pending',TXS.run); const pr=PT.run; try{ ptStart({}); }catch(e){} T_('done before the test',TXS.done&&!TXS.run); try{ ptAbort&&ptAbort(); }catch(e){} PT.run=pr;
console.log('v234: pass '+ok+' fail '+bad);
