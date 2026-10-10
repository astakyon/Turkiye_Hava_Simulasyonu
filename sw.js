/* Ay Yıldız: Hedef Kızıl Elma — çevrimdışı önbellek. Sürüm değişince önbellek yenilenir. */
const CACHE='ayyildiz-V1.20';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(e.request.method!=='GET'||/peerjs|0\.peerjs\.com/.test(u)) return;
  // sayfa: önce ağ (güncel sürüm), ağ yoksa önbellek; diğer dosyalar: önce önbellek
  if(e.request.mode==='navigate'){ e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return r; }).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html')))); return; }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ if(res.ok&&(u.startsWith(self.location.origin)||/cdnjs|fonts\.g/.test(u))){ const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); } return res; })));
});
