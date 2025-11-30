const CACHE_NAME = "bustracker-v1";
const urlsToCache = [
  "index.html",
  "login.html",
  "registro.html",
  "manifest.json",
  "icono.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
// sw.js - Service Worker para funcionamiento en segundo plano
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'gps-sync') {
    console.log('Sincronización de GPS en segundo plano');
    event.waitUntil(sendPendingPositions());
  }
});

async function sendPendingPositions() {
  // Esta función se ejecutará cuando el dispositivo recupere conexión
  // y pueda enviar las posiciones almacenadas
  const clients = await self.clients.matchAll();
  if (clients && clients.length) {
    clients[0].postMessage({
      type: 'SYNC_POSITIONS'
    });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STORE_POSITION') {
    // Almacenar posición para enviar después
    const position = event.data.position;
    storePosition(position);
  }
});

function storePosition(position) {
  // Almacenar en IndexedDB para persistencia
  // Implementación simplificada - en producción usar una librería como localForage
  const request = indexedDB.open('BusTrackerDB', 1);
  
  request.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('positions')) {
      db.createObjectStore('positions', { keyPath: 'timestamp' });
    }
  };
  
  request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction(['positions'], 'readwrite');
    const store = transaction.objectStore('positions');
    store.add(position);
  };
}