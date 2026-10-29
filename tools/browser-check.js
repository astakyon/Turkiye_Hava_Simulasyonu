#!/usr/bin/env node
/* Release gate in a real browser (Chromium, software GL): opens the built game, flies over the island and walks in a town,
   and fails when an instanced group is culled although some of its objects are in view (the V1.94–V2.08 "vanishing trees"
   bug), when a merged cell and its originals are both drawn, or when the page throws. Usage: node tools/browser-check.js
   V2.31: also a budget gate — each view has a ceiling for draw calls and triangles (about 25 % above V2.30), the texture memory
   has one, and a crowded battle (4 enemy fighters, wingman, SAM, missiles, explosions, 12 s) must not grow the JS heap by more
   than 40 MB or throw. A release that goes over stops here.
   Needs Playwright with a Chromium build (PLAYWRIGHT / /opt/pw-browsers). */
const path=require('path'), fs=require('fs'), http=require('http');
let pw; try{ pw=require('playwright'); }catch(e){ try{ pw=require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); }catch(e2){ console.log('SKIP browser-check: playwright not installed'); process.exit(0); } }
const ROOT=path.join(__dirname,'..');
/* budgets: [draw calls, k triangles] per view; raise them on purpose, in this file, when a release adds content */
const BUDGET={'uçuş':[340,700], 'uçuş-2':[340,700], 'şehir':[340,560], 'orman':[430,680], texMB:115, stressHeapMB:40};
let html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); html=html.replace(/<link[^>]*fonts[^>]*>/g,''); const k=html.lastIndexOf('})();'); html=html.slice(0,k)+'window.__E=function(c){return eval(c)};\n'+html.slice(k);
const srv=http.createServer(function(req,res){ const u=decodeURIComponent(req.url.split('?')[0]); if(u==='/'||u==='/check.html'){ res.writeHead(200,{'content-type':'text/html; charset=utf-8'}); res.end(html); return; }
  const f=path.join(ROOT,u); if(f.indexOf(ROOT)!==0||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ res.writeHead(404); res.end(); return; } res.writeHead(200); fs.createReadStream(f).pipe(res); });
srv.listen(0,'127.0.0.1',async function(){ const port=srv.address().port; let fails=[];
  const exe=fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined;
  const b=await pw.chromium.launch({executablePath:exe,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
  try{ const p=await b.newPage({viewport:{width:1280,height:720}}); const errs=[]; p.on('pageerror',function(x){ errs.push(x.message); });
    await p.addInitScript(function(Q){ try{ localStorage.setItem('kaan-sim-settings',JSON.stringify({quality:Q,accPrompted:true,notesSeen:'x',notesDur:0})); }catch(e){} },+(process.env.Q||2));
    await p.goto('http://127.0.0.1:'+port+'/check.html',{waitUntil:'domcontentloaded',timeout:300000}); await p.waitForFunction(function(){ return window.__E&&window.__E("typeof BOOT==='undefined'||BOOT.done"); },null,{timeout:300000,polling:500}); await p.waitForTimeout(4000);   /* V2.19: the world is built in steps after the script */
    const check="(function(){ const out=[]; try{ cullCollect(); cullAll(); }catch(e){} const fr=new THREE.Frustum(), M4=new THREE.Matrix4(), mt=new THREE.Matrix4(), v=new THREE.Vector3(), sp=new THREE.Sphere(); camera.updateMatrixWorld(); M4.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse); fr.setFromProjectionMatrix(M4);"+
      " scene.traverse(function(o){ if(!o.isInstancedMesh||o.frustumCulled===false||!o.visible||!o.geometry.boundingSphere) return; sp.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); if(fr.intersectsSphere(sp)) return; for(let i=0;i<o.count;i++){ o.getMatrixAt(i,mt); v.setFromMatrixPosition(mt).applyMatrix4(o.matrixWorld); if(fr.containsPoint(v)){ out.push('instanced group culled while in view ('+o.count+' objects)'); break; } } });"+
      " if(typeof MRG!=='undefined') MRG.cells.forEach(function(c){ if(c.src.some(function(s){ return s.o.layers.test(camera.layers); })) out.push('merged cell drawn twice '+c.key.slice(-12)); });"+
      " renderer.info.autoReset=false; renderer.info.reset(); renderer.render(scene,camera); const calls=renderer.info.render.calls, tris=renderer.info.render.triangles; renderer.info.autoReset=true;"+
      " return JSON.stringify({bad:out.slice(0,5),calls:calls,tris:tris}); })()";
    const views=[['uçuş',"playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; startGame('air'); S.pos.set(3000,700,3000);"],['uçuş-2',"S.pos.set(-6000,900,-2000); sQ(2.2);"],['şehir',"startWalk(); teleportTo(placeById('anadolukent'));"],['orman',"startWalk(); const m=new THREE.Matrix4(), w=new THREE.Vector3(); GFX.treeChunks[5].getMatrixAt(0,m); w.setFromMatrixPosition(m); WALK.pos.set(w.x+40,groundH(w.x+40,w.z)+1.7,w.z); WALK.yaw=Math.PI/2;"]];
    for(const v of views){ await p.evaluate(function(c){ return window.__E(c); },v[1]); await p.waitForTimeout(2500); const r=JSON.parse(await p.evaluate(function(c){ return window.__E(c); },check));
      console.log(v[0]+': '+r.calls+' çizim, '+Math.round(r.tris/1000)+'k üçgen'); r.bad.forEach(function(x){ fails.push(v[0]+': '+x); });
      const B=BUDGET[v[0]]; if(B){ if(r.calls>B[0]) fails.push(v[0]+': bütçe aşıldı, '+r.calls+' çizim > '+B[0]); if(r.tris>B[1]*1000) fails.push(v[0]+': bütçe aşıldı, '+Math.round(r.tris/1000)+'k üçgen > '+B[1]+'k'); } }
    /* texture memory, once the background texture job is done (since V2.34 it waits while flying; menus finish it) */
    const tex=await p.evaluate(function(c){ return window.__E(c); },"(function(){ try{ if(typeof TXS!=='undefined'&&TXS.run) txsRun(); return typeof ptTexMem==='function'?ptTexMem().mb:null; }catch(e){ return null; } })()");
    if(tex!=null){ console.log('doku belleği: '+tex+' MB'); if(tex>BUDGET.texMB) fails.push('bütçe aşıldı, doku belleği '+tex+' MB > '+BUDGET.texMB+' MB'); }
    /* stress: a crowded battle */
    const heap=function(){ return p.evaluate(function(){ return performance.memory?performance.memory.usedJSHeapSize/1048576:0; }); };
    await p.evaluate(function(c){ return window.__E(c); },"walkLeave(); SETTINGS.ai={enemies:4,wing:true,skill:1,sam:true}; missionId='free'; startGame('air'); S.pos.set(2000,1200,2000); 0");
    await p.waitForTimeout(3000); const h0=await heap();
    await p.evaluate(function(c){ return window.__E(c); },"(function(){ const STRESS={t:0}; const iv=setInterval(function(){ try{ STRESS.t++; S.hp=100; S.crashed=false; if(STRESS.t%3===0) explode(new THREE.Vector3(S.pos.x+(Math.random()-.5)*600,S.pos.y-200,S.pos.z-500),30,5); if(STRESS.t%5===0&&typeof fireWeapon==='function'){ INV.m1=4; selW='m1'; fireWeapon(); } }catch(e){} if(STRESS.t>=60) clearInterval(iv); },200); return 0; })()");
    await p.waitForTimeout(12500); const sr=JSON.parse(await p.evaluate(function(c){ return window.__E(c); },"JSON.stringify({act:ACT.filter(function(a){ return a.alive; }).length, st:state})")); const h1=await heap();
    console.log('stres: '+sr.act+' yapay zekâ uçağı, yığın '+h0.toFixed(0)+' → '+h1.toFixed(0)+' MB');
    if(h1-h0>BUDGET.stressHeapMB) fails.push('stres: yığın '+(h1-h0).toFixed(0)+' MB büyüdü > '+BUDGET.stressHeapMB+' MB');
    errs.forEach(function(e){ fails.push('sayfa hatası: '+e); });
  }catch(e){ fails.push('denetim çalışmadı: '+e.message); }
  await b.close(); srv.close();
  if(fails.length){ console.log('FAIL browser-check: '+fails.join(' | ')); process.exit(1); } console.log('pass browser-check'); });
