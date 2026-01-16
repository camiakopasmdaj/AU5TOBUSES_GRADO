// Service Worker y funciones de background
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Primero, creamos el archivo sw.js dinámicamente si no existe
      await createServiceWorkerIfNeeded();
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log(' Service Worker registrado con éxito');
      
      // Verificar si Background Sync está disponible
      if ('sync' in registration) {
        await registration.sync.register('gps-background-sync');
        console.log('Background Sync registrado');
      }
      
      return true;
    } catch (error) {
      console.error(' Error registrando Service Worker:', error);
      return false;
    }
  }
  return false;
}

async function createServiceWorkerIfNeeded() {
  // Intentar recuperar el service worker existente
  try {
    const response = await fetch('/sw.js');
    if (response.ok) return; // Ya existe
  } catch (e) {
 
  }

  const swCode = `
    self.addEventListener('sync', (event) => {
      if (event.tag === 'gps-background-sync') {
        console.log(' Background Sync ejecutándose...');
        event.waitUntil(doBackgroundSync());
      }
    });

    async function doBackgroundSync() {
      // Enviar posiciones almacenadas localmente
      const storedPositions = await getStoredPositions();
      if (storedPositions.length > 0) {
        await sendPositionsToServer(storedPositions);
        await clearStoredPositions();
      }
    }

    async function getStoredPositions() {
      return new Promise((resolve) => {
        const request = indexedDB.open('BusTrackerDB', 1);
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['positions'], 'readonly');
          const store = transaction.objectStore('positions');
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        };
        request.onerror = () => resolve([]);
      });
    }

    async function sendPositionsToServer(positions) {
      // Aquí iría la lógica para enviar a MQTT
      // Por simplicidad, solo mostramos en consola
      console.log(' Enviando posiciones en background:', positions.length);
      return Promise.resolve();
    }

    async function clearStoredPositions() {
      return new Promise((resolve) => {
        const request = indexedDB.open('BusTrackerDB', 1);
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['positions'], 'readwrite');
          const store = transaction.objectStore('positions');
          const clearRequest = store.clear();
          clearRequest.onsuccess = () => resolve();
        };
      });
    }

    // Inicializar IndexedDB
    self.addEventListener('install', (event) => {
      const request = indexedDB.open('BusTrackerDB', 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('positions')) {
          db.createObjectStore('positions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  `;

  // Guardar el Service Worker (esto normalmente se haría en el servidor)
  // Para desarrollo, usamos Blob URL
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swURL = URL.createObjectURL(blob);
  
  // Re-registrar con el Blob URL
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register(swURL);
  }
}


function storePositionForBackground(lat, lon, timestamp) {
  if (!busId) return;

  const positionData = {
    busId: busId,
    lat: lat,
    lon: lon,
    timestamp: timestamp,
    storedAt: Date.now()
  };

  // Almacenar en localStorage como fallback
  const storedPositions = JSON.parse(localStorage.getItem('busPositions') || '[]');
  storedPositions.push(positionData);
  
  // Mantener solo las últimas 50 posiciones
  if (storedPositions.length > 50) {
    storedPositions.splice(0, storedPositions.length - 50);
  }
  
  localStorage.setItem('busPositions', JSON.stringify(storedPositions));
  
  console.log('Posición almacenada para background:', positionData);
}


function sendStoredPositions() {
  const storedPositions = JSON.parse(localStorage.getItem('busPositions') || '[]');
  
  if (storedPositions.length > 0 && client && client.connected) {
    console.log(`Enviando ${storedPositions.length} posiciones almacenadas`);
    
    storedPositions.forEach((position, index) => {
      setTimeout(() => {
        const payload = JSON.stringify({
          busId: position.busId,
          lat: position.lat,
          lon: position.lon,
          timestamp: position.timestamp,
          fromBackground: true
        });
        
        client.publish(`buses/${position.busId}`, payload);
      }, index * 100); // Espaciar envíos
    });
    
    // Limpiar posiciones enviadas
    localStorage.removeItem('busPositions');
  }
}

function startBackgroundTracking() {
  if (backgroundPositionInterval) {
    clearInterval(backgroundPositionInterval);
  }

  backgroundPositionInterval = setInterval(() => {
    if (document.hidden && isSendingLocation) {
      // La app está en segundo plano, obtener y almacenar posición
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lon = position.coords.longitude.toFixed(6);
          const timestamp = new Date().toISOString();
          
          console.log(' Posición en background:', { lat, lon });
          
          // Almacenar para enviar cuando haya conexión
          storePositionForBackground(lat, lon, timestamp);
          
          // Intentar enviar inmediatamente si hay conexión
          if (client && client.connected) {
            const payload = JSON.stringify({
              busId: busId,
              lat: lat,
              lon: lon,
              timestamp: timestamp,
              status: "online",
              fromBackground: true
            });
            
            client.publish(`buses/${busId}`, payload);
          }
        },
        (error) => {
          console.log(' Error GPS en background:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    }
  }, 1000); 
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock activado');
      
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock liberado');
      });
    }
  } catch (err) {
    console.error('Error al activar Wake Lock:', err);
  }
}

// Liberar Wake Lock
async function releaseWakeLock() {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Wake Lock liberado');
  }
}


document.addEventListener('visibilitychange', handleVisibilityChange);

function handleVisibilityChange() {
  if (document.hidden) {
    console.log('App en segundo plano - Continuando tracking...');
    showSystemNotification("La app continúa funcionando en segundo plano", "info");
  } else {
    console.log('App en primer plano');
    // Re-sincronizar posiciones almacenadas
    sendStoredPositions();
  }
}