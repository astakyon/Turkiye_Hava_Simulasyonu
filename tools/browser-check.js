#!/usr/bin/env node
/* Release gate in a real browser (Chromium, software GL): opens the built game, flies over the island and walks in a town,
   and fails when an instanced group is culled although some of its objects are in view (the V1.94–V2.08 "vanishing trees"
   bug), when a merged cell and its originals are both drawn, or when the page throws. Usage: node tools/browser-check.js
   Needs Playwright with a Chromium build (PLAYWRIGHT / /opt/pw-browsers). */
const path=require('path'), fs=require('fs'), http=require('http');
let pw; try{ pw=require('playwright'); }catch(e){ try{ pw=require('/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright'); }catch(e2){ console.log('SKIP browser-check: playwright not installed'); process.exit(0); } }
const ROOT=path.join(__dirname,'..');
let html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); html=html.replace(/<link[^>]*fonts[^>]*>/g,''); const k=html.lastIndexOf('})();'); html=html.slice(0,k)+'window.__E=function(c){return eval(c)};\n'+html.slice(k);
const srv=http.createServer(function(req,res){ const u=decodeURIComponent(req.url.split('?')[0]); if(u==='/'||u==='/check.html'){ res.writeHead(200,{'content-type':'text/html; charset=utf-8'}); res.end(html); return; }
  const f=path.join(ROOT,u); if(f.indexOf(ROOT)!==0||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ res.writeHead(404); res.end(); return; } res.writeHead(200); fs.createReadStream(f).pipe(res); });
srv.listen(0,'127.0.0.1',async function(){ const port=srv.address().port; let fails=[];
  const exe=fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined;
  const b=await pw.chromium.launch({executablePath:exe,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  try{ const p=await b.newPage({viewport:{width:1280,height:720}}); const errs=[]; p.on('pageerror',function(x){ errs.push(x.message); });
    await p.addInitScript(function(Q){ try{ localStorage.setItem('kaan-sim-settings',JSON.stringify({quality:Q,accPrompted:true,notesSeen:'x',notesDur:0})); }catch(e){} },+(process.env.Q||2));
    await p.goto('http://127.0.0.1:'+port+'/check.html',{waitUntil:'domcontentloaded',timeout:300000}); await p.waitForFunction(function(){ return window.__E; },null,{timeout:300000}); await p.waitForTimeout(4000);
    const check="(function(){ const out=[]; try{ cullCollect(); cullAll(); }catch(e){} const fr=new THREE.Frustum(), M4=new THREE.Matrix4(), mt=new THREE.Matrix4(), v=new THREE.Vector3(), sp=new THREE.Sphere(); camera.updateMatrixWorld(); M4.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse); fr.setFromProjectionMatrix(M4);"+
      " scene.traverse(function(o){ if(!o.isInstancedMesh||o.frustumCulled===false||!o.visible||!o.geometry.boundingSphere) return; sp.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); if(fr.intersectsSphere(sp)) return; for(let i=0;i<o.count;i++){ o.getMatrixAt(i,mt); v.setFromMatrixPosition(mt).applyMatrix4(o.matrixWorld); if(fr.containsPoint(v)){ out.push('instanced group culled while in view ('+o.count+' objects)'); break; } } });"+
      " if(typeof MRG!=='undefined') MRG.cells.forEach(function(c){ if(c.src.some(function(s){ return s.o.layers.test(camera.layers); })) out.push('merged cell drawn twice '+c.key.slice(-12)); });"+
      " renderer.info.autoReset=false; renderer.info.reset(); renderer.render(scene,camera); const calls=renderer.info.render.calls, tris=renderer.info.render.triangles; renderer.info.autoReset=true;"+
      " return JSON.stringify({bad:out.slice(0,5),calls:calls,tris:tris}); })()";
    const views=[['uçuş',"playMode('quick'); selectedId='kaan'; setAircraft('kaan'); missionId='free'; startGame('air'); S.pos.set(3000,700,3000);"],['uçuş-2',"S.pos.set(-6000,900,-2000); sQ(2.2);"],['şehir',"startWalk(); teleportTo(placeById('anadolukent'));"],['orman',"startWalk(); const m=new THREE.Matrix4(), w=new THREE.Vector3(); GFX.treeChunks[5].getMatrixAt(0,m); w.setFromMatrixPosition(m); WALK.pos.set(w.x+40,groundH(w.x+40,w.z)+1.7,w.z); WALK.yaw=Math.PI/2;"]];
    for(const v of views){ await p.evaluate(function(c){ return window.__E(c); },v[1]); await p.waitForTimeout(2500); const r=JSON.parse(await p.evaluate(function(c){ return window.__E(c); },check));
      console.log(v[0]+': '+r.calls+' çizim, '+Math.round(r.tris/1000)+'k üçgen'); r.bad.forEach(function(x){ fails.push(v[0]+': '+x); }); }
    errs.forEach(function(e){ fails.push('sayfa hatası: '+e); });
  }catch(e){ fails.push('denetim çalışmadı: '+e.message); }
  await b.close(); srv.close();
  if(fails.length){ console.log('FAIL browser-check: '+fails.join(' | ')); process.exit(1); } console.log('pass browser-check'); });
