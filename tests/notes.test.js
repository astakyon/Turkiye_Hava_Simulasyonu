let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('release notes generated',typeof RELNOTES!=='undefined'&&RELNOTES.length>0&&/^V\d+\.\d+$/.test(RELNOTES[0].v));
T_('several versions, one-line titles',RELNOTES.length>=2&&RELNOTES.every(function(r){ return String(r.t).indexOf('\n')<0; }),RELNOTES.length);
const h=relMd('- **Bir:** iki\n  - alt <b>\n- `kod` *x*'); T_('markdown → html',h==='<ul><li><b>Bir:</b> iki<ul><li>alt &lt;b></li></ul></li><li><code>kod</code> <i>x</i></li></ul>',h);
T_('summary skips heading bullets',relFirstLine('- **Başlık:**\n  - ilk gerçek madde\n')==='ilk gerçek madde',relFirstLine('- **Başlık:**\n  - ilk gerçek madde\n'));
SETTINGS.notesDur=undefined; T_('default 30 s',relDur()===30);
/* shown once per version, with the chosen duration */
RELNOTES[0].v=GAME_VERSION; SETTINGS.notesSeen=''; SETTINGS.notesDur=10; let shown=null; const _a=annShow; annShow=function(o){ shown=o; };
relShow(); T_('shown after update',shown&&shown.sec===10&&shown.id==='rel-'+GAME_VERSION,JSON.stringify(shown));
shown=null; relShow(); T_('only once',shown===null);
SETTINGS.notesSeen=''; SETTINGS.notesDur=0; relShow(); T_('off = not shown',shown===null&&SETTINGS.notesSeen===GAME_VERSION);
annShow=_a;
/* settings layout: graphics tab has only graphics */
const g=document.querySelector?document.querySelector('#settings section[data-tab="g"]'):null;
if(g&&g.innerHTML!=null){ T_('no flight settings in Grafik',!/setAssist|setTurb|setFuel|setTod|setWx/.test(g.innerHTML)); }
console.log('notes: pass '+ok+' fail '+bad);
