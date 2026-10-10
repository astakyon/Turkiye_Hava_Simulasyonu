const vm=require('vm'),fs=require('fs');
class V3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
set(x,y,z){this.x=x;this.y=y;this.z=z;return this}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}clone(){return new V3(this.x,this.y,this.z)}
add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}
addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this}
addVectors(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;return this}subVectors(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this}
multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this}divideScalar(s){return this.multiplyScalar(1/s)}
length(){return Math.hypot(this.x,this.y,this.z)}lengthSq(){return this.x**2+this.y**2+this.z**2}
normalize(){const l=this.length()||1;return this.divideScalar(l)}setLength(l){return this.normalize().multiplyScalar(l)}
dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}
cross(v){const{x,y,z}=this;this.x=y*v.z-z*v.y;this.y=z*v.x-x*v.z;this.z=x*v.y-y*v.x;return this}
crossVectors(a,b){return this.set(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x)}
distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z)}distanceToSquared(v){return (this.x-v.x)**2+(this.y-v.y)**2+(this.z-v.z)**2}
lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this}
lerpVectors(a,b,t){return this.copy(a).lerp(b,t)}
negate(){return this.multiplyScalar(-1)}
setFromMatrixPosition(m){return this}
applyQuaternion(q){const{x,y,z}=this,qx=q.x,qy=q.y,qz=q.z,qw=q.w;
const ix=qw*x+qy*z-qz*y,iy=qw*y+qz*x-qx*z,iz=qw*z+qx*y-qy*x,iw=-qx*x-qy*y-qz*z;
this.x=ix*qw+iw*-qx+iy*-qz-iz*-qy;this.y=iy*qw+iw*-qy+iz*-qx-ix*-qz;this.z=iz*qw+iw*-qz+ix*-qy-iy*-qx;return this}
applyEuler(e){return this.applyQuaternion(new Q().setFromEuler(e))}
setScalar(s){this.x=this.y=this.z=s;return this}applyMatrix4(){return this}project(){return this}unproject(){return this}transformDirection(){return this}min(v){return this}max(v){return this}toArray(){return[this.x,this.y,this.z]}setX(x){this.x=x;return this}setY(y){this.y=y;return this}setZ(z){this.z=z;return this}multiply(v){this.x*=v.x;this.y*=v.y;this.z*=v.z;return this}equals(v){return this.x==v.x&&this.y==v.y&&this.z==v.z}
fromArray(a){this.x=a[0];this.y=a[1];this.z=a[2];return this}}
class Q{constructor(x=0,y=0,z=0,w=1){this.x=x;this.y=y;this.z=z;this.w=w}
set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this}copy(q){return this.set(q.x,q.y,q.z,q.w)}clone(){return new Q(this.x,this.y,this.z,this.w)}
setFromAxisAngle(a,ang){const s=Math.sin(ang/2);return this.set(a.x*s,a.y*s,a.z*s,Math.cos(ang/2))}
setFromEuler(e){const c1=Math.cos(e.x/2),c2=Math.cos(e.y/2),c3=Math.cos(e.z/2),s1=Math.sin(e.x/2),s2=Math.sin(e.y/2),s3=Math.sin(e.z/2);
if(e.order==='YXZ')return this.set(s1*c2*c3+c1*s2*s3,c1*s2*c3-s1*c2*s3,c1*c2*s3-s1*s2*c3,c1*c2*c3+s1*s2*s3);
return this.set(s1*c2*c3+c1*s2*s3,c1*s2*c3-s1*c2*s3,c1*c2*s3+s1*s2*c3,c1*c2*c3-s1*s2*s3)}
multiply(b){return this.multiplyQuaternions(this,b)}premultiply(b){return this.multiplyQuaternions(b,this)}
multiplyQuaternions(a,b){return this.set(a.x*b.w+a.w*b.x+a.y*b.z-a.z*b.y,a.y*b.w+a.w*b.y+a.z*b.x-a.x*b.z,a.z*b.w+a.w*b.z+a.x*b.y-a.y*b.x,a.w*b.w-a.x*b.x-a.y*b.y-a.z*b.z)}
normalize(){const l=Math.hypot(this.x,this.y,this.z,this.w)||1;return this.set(this.x/l,this.y/l,this.z/l,this.w/l)}
slerp(q,t){const a=this.clone();return this.set(a.x+(q.x-a.x)*t,a.y+(q.y-a.y)*t,a.z+(q.z-a.z)*t,a.w+(q.w-a.w)*t).normalize()}
identity(){return this.set(0,0,0,1)}fromArray(a){return this.set(a[0],a[1],a[2],a[3])}
setFromRotationMatrix(m){const te=m.elements,m11=te[0],m12=te[4],m13=te[8],m21=te[1],m22=te[5],m23=te[9],m31=te[2],m32=te[6],m33=te[10],tr=m11+m22+m33;let s;
if(tr>0){s=0.5/Math.sqrt(tr+1);this.w=0.25/s;this.x=(m32-m23)*s;this.y=(m13-m31)*s;this.z=(m21-m12)*s;}
else if(m11>m22&&m11>m33){s=2*Math.sqrt(1+m11-m22-m33);this.w=(m32-m23)/s;this.x=0.25*s;this.y=(m12+m21)/s;this.z=(m13+m31)/s;}
else if(m22>m33){s=2*Math.sqrt(1+m22-m11-m33);this.w=(m13-m31)/s;this.x=(m12+m21)/s;this.y=0.25*s;this.z=(m23+m32)/s;}
else{s=2*Math.sqrt(1+m33-m11-m22);this.w=(m21-m12)/s;this.x=(m13+m31)/s;this.y=(m23+m32)/s;this.z=0.25*s;}return this}conjugate(){return this.invert()}angleTo(){return 0}toArray(){return[this.x,this.y,this.z,this.w]}
invert(){this.x*=-1;this.y*=-1;this.z*=-1;return this}inverse(){return this.invert()}
setFromUnitVectors(a,b){const w=a.dot(b)+1;const c=new V3().crossVectors(a,b);return this.set(c.x,c.y,c.z,w).normalize()}}
class E{constructor(x=0,y=0,z=0,o='XYZ'){this.x=x;this.y=y;this.z=z;this.order=o}set(x,y,z,o){this.x=x;this.y=y;this.z=z;if(o)this.order=o;return this}copy(e){return this.set(e.x,e.y,e.z,e.order)}}
class Obj{constructor(){this.position=new V3();this.rotation=new E();this.quaternion=new Q();this.scale=new V3(1,1,1);this.children=[];this.parent=null;this.visible=true;this.userData={};this.up=new V3(0,1,0)}
add(...o){for(const c of o){c.parent=this;this.children.push(c)}return this}remove(...o){for(const c of o){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1)}return this}
rotateX(){return this}rotateY(){return this}rotateZ(){return this}traverse(f){f(this);this.children.forEach(c=>c.traverse&&c.traverse(f))}lookAt(){}updateMatrixWorld(){}getWorldPosition(v){return (v||new V3()).copy(this.position)}
localToWorld(v){return v}worldToLocal(v){return v}clone(){const o=new Obj();o.position.copy(this.position);return o}}
function mk(){return new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==='then'?undefined:(k==='length'?0:mk()),apply:()=>mk(),construct:()=>mk(),set:()=>true})}
class M4{constructor(){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}compose(){return this}multiply(){return this}makeRotationY(){return this}makeTranslation(){return this}setPosition(){return this}identity(){return this}copy(){return this}invert(){return this}makeBasis(x,y,z){this.elements=[x.x,x.y,x.z,0,y.x,y.y,y.z,0,z.x,z.y,z.z,0,0,0,0,1];return this}}
const THREE=new Proxy({Matrix4:M4,Vector3:V3,Quaternion:Q,Euler:E,Group:Obj,Scene:Obj,Object3D:Obj,
 Mesh:class extends Obj{constructor(g,m){super();this.geometry=g||mk();this.material=m||mk()}},
 Sprite:class extends Obj{constructor(m){super();this.material=m||mk()}},
 InstancedMesh:class extends Obj{constructor(g,m,n){super();this.count=n;this.instanceMatrix={needsUpdate:false};this.geometry=g;this.material=m}setMatrixAt(){}setColorAt(){}},
 Box3:class{setFromObject(){this.min=new V3(-5,-1,-8);this.max=new V3(5,1,8);return this}},
 Vector2:class{constructor(x=0,y=0){this.x=x;this.y=y}set(x,y){this.x=x;this.y=y;return this}},
 Color:class{constructor(){this.r=this.g=this.b=1}set(){return this}setHex(){return this}copy(){return this}lerp(){return this}getHex(){return 0}setRGB(){return this}multiplyScalar(){return this}clone(){return this}},
 PerspectiveCamera:class extends Obj{constructor(){super();this.fov=60;this.aspect=1}updateProjectionMatrix(){}},
 Raycaster:class{setFromCamera(){}intersectObjects(){return[]}},
},{get:(t,k)=>k in t?t[k]:(typeof k==='string'&&/^[A-Z]/.test(k)?(class{constructor(){return mk()}}):t[k])});
const els={};
function el(id){return els[id]||(els[id]=new Proxy({id,style:{},classList:{add(){},remove(){},toggle(){},contains(c){return c==='hidden'}},dataset:{},children:[],textContent:'',innerHTML:'',value:'',checked:false,
 addEventListener(){},removeEventListener(){},appendChild(c){return c},setAttribute(){},getAttribute(){return null},querySelector(){return el('q')},querySelectorAll(){return[]},
 getContext(){return ctx2d},getBoundingClientRect(){return{left:0,top:0,width:1280,height:720}},requestPointerLock(){},focus(){},blur(){},remove(){},click(){},width:1280,height:720,clientWidth:1280,clientHeight:720},{get:(t,k)=>k in t?t[k]:undefined,set:(t,k,v)=>{t[k]=v;return true}}))}
const ctx2d=new Proxy({},{get:(t,k)=>k==='measureText'?()=>({width:10}):k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true}});
const listeners={};
const store={};
const win={innerWidth:1280,innerHeight:720,devicePixelRatio:1,addEventListener(t,f){(listeners[t]=listeners[t]||[]).push(f)},removeEventListener(){},
 requestAnimationFrame(){return 0},cancelAnimationFrame(){},matchMedia:()=>({matches:false,addEventListener(){}}),navigator:{getGamepads:()=>[],maxTouchPoints:0,userAgent:'node'},
 localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}};
const doc={getElementById:el,createElement:()=>el('c'+Math.random()),body:el('body'),documentElement:el('html'),addEventListener(t,f){(listeners[t]=listeners[t]||[]).push(f)},querySelector:()=>el('q'),querySelectorAll:()=>[],hidden:false,fullscreenElement:null,exitPointerLock(){},title:''};
let src=fs.readFileSync(process.argv[2]||'/tmp/sim.js','utf8');
const tests=fs.readFileSync(process.argv[3],'utf8');
const ctx={THREE,document:doc,window:win,navigator:win.navigator,localStorage:win.localStorage,console,Math,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,
 requestAnimationFrame:()=>0,AudioContext:class{constructor(){return mk()}},Image:class{},innerWidth:1280,innerHeight:720,devicePixelRatio:1,matchMedia:win.matchMedia,Float32Array,Uint8Array,Map,Set,JSON,Date,
 fetch:()=>Promise.reject(),URL:{createObjectURL(){return''}},Blob:class{},FileReader:class{}};
ctx.window=Object.assign(ctx,{addEventListener:win.addEventListener,removeEventListener(){},cancelAnimationFrame(){}});
ctx.self=ctx;ctx.globalThis=ctx;
vm.createContext(ctx);
// strip animation loop auto-start if needed
const k=src.lastIndexOf('})();');src=src.slice(0,k)+';globalThis.__X={eval:(c)=>eval(c)};\n'+src.slice(k);
vm.runInContext(src,ctx,{filename:'sim.js'});
ctx.listeners=listeners;ctx.els=els;ctx.store=store;
ctx.__X.eval(tests);
