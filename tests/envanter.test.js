let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
T_('418 systems loaded',ENV_DATA.length===418,ENV_DATA.length);
T_('source attribution present',/defenceturk\.tr/.test(ENV_SRC.url)&&/Defence Turk/.test(ENV_SRC.name));
T_('no description / image fields',ENV_DATA.every(function(r){ return r.length===8&&!/https?:\/\/.*\.(jpg|png|webp)/i.test(JSON.stringify(r)); }));
T_('every game system mapped',Object.keys(ENV_GAME).every(function(k){ return ENV_IDX[ENV_GAME[k]]!=null; }),Object.keys(ENV_GAME).filter(function(k){ return ENV_IDX[ENV_GAME[k]]==null; }).join());
T_('all game aircraft covered',AC_ORDER.every(function(id){ return ENV_GAME['ac:'+id]; }));
ENVI.cat='all'; ENVI.sub=''; ENVI.game=false; ENVI.q='tb2'; T_('search finds TB2',envFilter().some(function(i){ return ENV_DATA[i][0]==='Bayraktar TB2'; }));
ENVI.q='kizilelma'; T_('search ignores Turkish letters',envFilter().some(function(i){ return /KIZILELMA/.test(ENV_DATA[i][0]); }));
ENVI.q='baykar'; T_('search by maker',envFilter().length>=5,envFilter().length);
ENVI.q=''; ENVI.cat='hava'; T_('category filter',envFilter().every(function(i){ return ENV_DATA[i][1]==='hava'; })&&envFilter().length>40);
ENVI.cat='all'; ENVI.game=true; T_('in-game filter',envFilter().length===Object.keys(ENV_GAME).length,envFilter().length); ENVI.game=false;
envOpen('ac:kaan'); T_('open on KAAN',ENV_DATA[ENVI.sel][0]==='KAAN');
T_('detail shows specs and source',/İtki Gücü|Motor/.test($('envDet').innerHTML)&&/defenceturk/.test($('envDet').innerHTML),$('envDet').innerHTML.slice(0,200));
T_('html escaped',envEsc('<b>&')==='&lt;b&gt;&amp;');
const b=envBrief('ac:tb2'); T_('library brief has real figures',b&&b.rows.length>=3,b&&JSON.stringify(b.rows));
envClose();
console.log('pass',ok,'fail',bad);
