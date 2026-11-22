/* सरपंच स्मैश — service worker: ऐप-शेल ऑफ़लाइन चलता है (CPU मोड). नया वर्ज़न डालो तो V बदल दो. */
const V='sarpanch-smash-v3';
const SHELL=['./','index.html','style.css','game.js','lib/peerjs.min.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const fonts=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(u.origin!==location.origin&&!fonts)return; // PeerJS सिग्नलिंग वगैरह को छूना नहीं
  const keep=res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res};
  if(fonts)e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(keep)));
  else e.respondWith(fetch(r,{cache:'no-cache'}).then(keep).catch(()=>caches.match(r)));
});
