let ok=0,bad=0; function T(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* in-memory fake of the parts of supabase-js the game uses */
const DB={profiles:{},saves:{},content:{config:{id:'config',kind:'config',meta:{xpMul:2,rankLocks:true}}},admin_log:{},announcements:{1:{id:1,text:'Hoş geldiniz',active:true,created_at:'2026'}}}; let session=null, authCb=null;
function Q(tbl){ const st={tbl:tbl,f:{},op:'select',row:null};
  const api={select:function(){ return api; },eq:function(k,v){ st.f[k]=v; return api; },order:function(){ return api; },limit:function(){ return api; },
    maybeSingle:function(){ return run(true); },single:function(){ return run(true); },insert:function(r){ st.op='insert'; st.row=r; return api; },upsert:function(r){ st.op='upsert'; st.row=r; return run(); },update:function(r){ st.op='update'; st.row=r; return api; },
    then:function(a,b){ return run().then(a,b); } };
  function run(one){ const T0=DB[tbl]; let res;
    if(st.op==='insert'){ const k=st.row.id||st.row.user_id; T0[k]=Object.assign({role:'player',banned:false},st.row); res=T0[k]; }
    else if(st.op==='upsert'){ const k=st.row.user_id||st.row.id; T0[k]=Object.assign(T0[k]||{},st.row); res=T0[k]; }
    else if(st.op==='update'){ Object.keys(T0).forEach(function(k){ const r=T0[k]; if(Object.keys(st.f).every(function(f){ return r[f]===st.f[f]; })) Object.assign(r,st.row); }); res=null; }
    else { const L=Object.values(T0).filter(function(r){ return Object.keys(st.f).every(function(f){ return r[f]===st.f[f]; }); }); res=one?(L[0]||null):L; }
    return Promise.resolve({data:res,error:null}); }
  return api; }
window.supabase={createClient:function(){ return {auth:{onAuthStateChange:function(cb){ authCb=cb; },getSession:function(){ return Promise.resolve({data:{session:session}}); },
  signInWithPassword:function(c){ session={user:{id:'u1',email:c.email}}; setTimeout0(function(){ authCb('SIGNED_IN',session); }); return Promise.resolve({data:{session:session},error:null}); },
  signOut:function(){ session=null; return Promise.resolve({}); }}, from:Q, storage:{from:function(){ return {getPublicUrl:function(p){ return {data:{publicUrl:'https://x/'+p}}; }}; }}}; }};
const later=[]; function setTimeout0(f){ later.push(f); }
stSet('ayy-supa',JSON.stringify({url:'https://abc.supabase.co',key:'x'.repeat(60)}));
(async function(){
  await accInit(); T('guest after init',ACC.cfg&&!ACC.user&&ACC.status==='guest',ACC.status);
  T('no admin before login (cloud on)',!accIsAdmin());
  SETTINGS.quality=1; saveSettings();
  await accEmail('in','pilot@ornek.com','123456'); later.splice(0).forEach(function(f){ f(); }); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  T('logged in, needs profile',ACC.user&&ACC.user.id==='u1'&&!ACC.prof&&ACC.status==='newprofile',ACC.status);
  await accCreateProfile('Kartal 5','kara','kurt'); T('profile created',ACC.prof&&ACC.prof.callsign==='Kartal 5'&&DB.profiles.u1.unit==='kara');
  T('local save pushed',DB.saves.u1&&DB.saves.u1.data&&DB.saves.u1.data.settings.quality===1,JSON.stringify(DB.saves.u1&&DB.saves.u1.data&&DB.saves.u1.data.settings&&DB.saves.u1.data.settings.quality));
  /* another device saved later: pull applies it */
  DB.saves.u1.data=Object.assign({},DB.saves.u1.data,{t:Date.now()+60000,settings:Object.assign({},DB.saves.u1.data.settings,{quality:3,sens:1.7})});
  await accPull(); T('newer cloud save applied (graphics stay per device)',SETTINGS.sens===1.7&&SETTINGS.quality===1,SETTINGS.sens+' '+SETTINGS.quality);
  saveSettings(); T('change marks dirty',ACC.dirtyT>0);
  DB.profiles.u1.role='admin'; await accAfterLogin(); T('admin role from server',accIsAdmin());
  await accSignOut(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); T('signed out',!ACC.user&&ACC.status==='guest');
  /* local profiles */
  const L=lpAll(); L.push({id:'g2',callsign:'Mavi 2',unit:'deniz',emblem:'kartal',xp:0,rank:0,stats:{}}); lpSave(L); stSet('ayy-prof-cur','g2'); ACC.local=null; T('local profile switch',accProfile().callsign==='Mavi 2');
  T('remote config loaded',ADM.cfg&&ADM.cfg.xpMul===2,JSON.stringify(ADM.cfg));
  const p0=accProfile(), x0=p0.xp||0; careerAdd(10,null); T('xp multiplier',(accProfile().xp||0)-x0===20,(accProfile().xp||0)-x0);
  enterTitle(); ACC.role='player'; T('player cannot open libraries',(titleAct('library'),state==='menu'&&menuMode==='title'));
  console.log('pass',ok,'fail',bad);
})();
