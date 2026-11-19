const CACHE='x32-touch-pro-v2';
const ROOT='/X-32-new/';
const FILES=[ROOT,ROOT+'index.html',ROOT+'manifest.json',ROOT+'icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(FILES))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  // Always try the server first, so published GitHub Pages changes arrive promptly.
  event.respondWith(
    fetch(request)
      .then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(request).then(cached=>cached || (request.mode==='navigate' ? caches.match(ROOT+'index.html') : Response.error())))
  );
});
