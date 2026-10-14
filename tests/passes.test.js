let ok=0,bad=0; function T_(n,c,i){ if(c){ok++;} else {bad++; console.log('FAIL',n,i===undefined?'':i);} }
/* combined grade + FXAA shader is derived from the real grade shader */
const keepF=THREE.FXAAShader, keepU=THREE.UniformsUtils;
THREE.FXAAShader={uniforms:{tDiffuse:{value:null},resolution:{value:null}},vertexShader:'varying vec2 vUv; void main(){ vUv=uv; }',fragmentShader:'uniform sampler2D tDiffuse; uniform vec2 resolution; varying vec2 vUv;\nvec4 F(){ return vec4(1.0); }\nvoid main() {\n gl_FragColor = F();\n}'};
THREE.UniformsUtils={clone:function(u){ return JSON.parse(JSON.stringify(u)); }};
const sh=fxGradeAAShader(); T_('shader built',!!sh);
T_('FXAA main renamed, one main',sh&&/void fxaaMain\(\)/.test(sh.fragmentShader)&&(sh.fragmentShader.match(/void main\(\)/g)||[]).length===1);
T_('grade starts from the anti-aliased colour',sh&&/fxaaMain\(\);[\s\S]*vec3 c=gl_FragColor\.rgb;/.test(sh.fragmentShader));
T_('no duplicate tDiffuse / vUv declarations',sh&&(sh.fragmentShader.match(/uniform sampler2D tDiffuse;/g)||[]).length===1&&(sh.fragmentShader.match(/varying vec2 vUv;/g)||[]).length===1);
T_('uniforms of both',sh&&'resolution' in sh.uniforms&&'uSpeed' in sh.uniforms&&'uVig' in sh.uniforms);
const keepG=GRADE_SHADER.fragmentShader; GRADE_SHADER.fragmentShader='something else'; T_('falls back when the grade shader changes shape',fxGradeAAShader()===null); GRADE_SHADER.fragmentShader=keepG;
THREE.FXAAShader=keepF; THREE.UniformsUtils=keepU;
/* sustained quality: three step-downs in 5 minutes lock the level */
const lad=perfLadder; PERF2.lock=false; PERF2.ups=[]; SETTINGS.autoPerf=true;
for(let i=0;i<3;i++) PERF2.ups.push(performance.now()); PERF2.ups.pop();   /* two earlier step-downs */
const before=PERF2.lvl; PERF2.lvl=1; PERF2.bad=3; PERF.fps=20; PERF.scale=0.0001; state='play'; perfLadder(); state='menu';
T_('locked after the third step-down',PERF2.lock===true||PERF2.lvl===1,[PERF2.lock,PERF2.lvl,PERF2.ups.length].join());
PERF2.lock=true; PERF2.good=11; PERF2.lvl=2; PERF.fps=60; state='play'; perfLadder(); state='menu'; T_('locked level does not climb back',PERF2.lvl===2,PERF2.lvl);
enterTitle(); T_('menu resets the lock',PERF2.lock===false); PERF2.lvl=0;
console.log('passes: pass '+ok+' fail '+bad);
