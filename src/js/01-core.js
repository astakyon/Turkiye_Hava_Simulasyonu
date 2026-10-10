const GAME_VERSION='V1.36', GAME_DATE='2026-10-10';
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.min(b, Math.max(a,v));
const D2R = Math.PI/180, R2D = 180/Math.PI;
function smooth(a,b,x){ const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const FONT = '"Chakra Petch","Arial Narrow",system-ui,sans-serif';

