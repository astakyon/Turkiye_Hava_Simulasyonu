let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* main menu: no BAŞLA, Hızlı Oyun and Kariyer side by side */
enterTitle(); let h=$('cNav').innerHTML; T_('root items',/data-act="start"[\s\S]*Hızlı Oyun/.test(h)&&/data-act="careerMenu"/.test(h)&&!/<b>Başla<\/b>/.test(h));
/* Hızlı Oyun: everything but Kariyer and Harekât */
titleAct('start'); h=$('cNav').innerHTML; T_('quick items',['q_quick','q_battle','q_free','q_mis','q_walk'].every(function(a){ return h.indexOf('data-act="'+a+'"')>=0; }));
T_('no career, no campaign in quick play',h.indexOf('careerMenu')<0&&h.indexOf('q_camp')<0&&h.indexOf('c_camp')<0);
/* Harekât only under Kariyer */
titleAct('back'); titleAct('careerMenu'); T_('campaign under career',$('cNav').innerHTML.indexOf('c_camp')>=0); titleAct('back');
/* Hızlı Savaş level */
titleAct('start'); titleAct('q_battle'); h=$('cNav').innerHTML; T_('battle level',NAV.level==='battle'&&QB_MODES.every(function(m){ return h.indexOf('data-act="'+m.act+'"')>=0; }));
titleAct('back'); T_('battle back to quick play',NAV.level==='start'); titleAct('q_battle');
/* a quick dogfight starts in the air, in quick mode, with a jet */
LASTV.v={t:'ac',id:'tb2'}; titleAct('qb_dog'); T_('dogfight in the air',state==='play'&&missionId==='dogfight'&&!S.onGround,state+' '+missionId);
T_('quick mode',PLAY.mode==='quick'); T_('slow drone replaced by a jet',activeId!=='tb2',activeId);
pauseGame(); toMenuFromPause(); T_('back in the menu clears the battle',!QB.on);
/* free brawl: enemies and SAM forced on, without touching the saved setting */
SETTINGS.ai={enemies:0,wing:false,skill:1,sam:false}; titleAct('start'); titleAct('q_battle'); titleAct('qb_brawl');
T_('brawl enemies',aiCfg().enemies===4&&aiCfg().sam===true,JSON.stringify(aiCfg())); T_('saved setting untouched',SETTINGS.ai.enemies===0&&SETTINGS.ai.sam===false);
pauseGame(); toMenuFromPause(); T_('override gone',aiCfg().enemies===0);
console.log('v229: pass '+ok+' fail '+bad);
