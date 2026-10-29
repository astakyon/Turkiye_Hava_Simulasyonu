#!/usr/bin/env node
/* V2.31 parallel test runner: runs every line of run.sh (after the build step) on all CPU cores, prints each test's output in
   the original order, the total time and the slowest tests. Exit code 1 when any test prints FAIL or Error or exits non-zero.
   Usage: node tests/paralel.js [-j N]   (run.sh stays the simple, serial way) */
const fs=require('fs'), path=require('path'), os=require('os'), cp=require('child_process');
const DIR=__dirname; process.chdir(DIR);
const ji=process.argv.indexOf('-j'), J=ji>0?Math.max(1,+process.argv[ji+1]||1):Math.max(1,os.cpus().length);
cp.execSync("node -e \"const h=require('fs').readFileSync('../tek-dosya.html','utf8');const m=[...h.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];require('fs').writeFileSync('/tmp/sim.js',m[m.length-1][1])\"");
const lines=fs.readFileSync(path.join(DIR,'run.sh'),'utf8').split('\n').map(function(l){ return l.trim(); }).filter(function(l){ return /^(node \S*harness\.js \S+ \S+\.test\.js|sh \S+\.sh)$/.test(l); });
const seen={}, jobs=lines.filter(function(l){ if(seen[l]) return false; seen[l]=1; return true; });
const out=new Array(jobs.length), t0=Date.now(); let next=0, done=0, bad=0;
function run(i){ const l=jobs[i], a=l.split(' '), s=Date.now();
  const c=cp.spawn(a[0],a.slice(1),{cwd:DIR}); let txt='';
  c.stdout.on('data',function(d){ txt+=d; }); c.stderr.on('data',function(d){ txt+=d; });
  c.on('close',function(code){ const ms=Date.now()-s, fail=code!==0||/FAIL|Error/.test(txt); if(fail) bad++; out[i]={l:l,txt:txt,ms:ms,fail:fail}; done++;
    if(next<jobs.length) run(next++); else if(done===jobs.length) finish(); }); }
function finish(){ out.forEach(function(o){ process.stdout.write(o.txt.split('\n').filter(function(x){ return /FAIL|pass [0-9]+ fail|Error/.test(x); }).join('\n')+'\n'); });
  const slow=out.slice().sort(function(a,b){ return b.ms-a.ms; }).slice(0,5).map(function(o){ return o.l.split(' ').pop()+' '+(o.ms/1000).toFixed(1)+' sn'; });
  console.log('paralel: '+jobs.length+' test, '+J+' çekirdek, '+((Date.now()-t0)/1000).toFixed(0)+' sn · en yavaş: '+slow.join(', '));
  if(bad){ console.log('FAIL '+bad+' test başarısız: '+out.filter(function(o){ return o.fail; }).map(function(o){ return o.l.split(' ').pop(); }).join(', ')); process.exit(1); } }
for(let k=0;k<Math.min(J,jobs.length);k++) run(next++);
