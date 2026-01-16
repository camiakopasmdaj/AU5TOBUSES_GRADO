
function checkGeolocationPermission() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocalización no soportada");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        gpsPermissionGranted = true;
        resolve("Permiso concedido");
      },
      (error) => {
        // Manejar diferentes tipos de errores
        switch(error.code) {
          case error.PERMISSION_DENIED:
            reject("Permiso de ubicación denegado. Activa el GPS y recarga la página.");
            break;
          case error.POSITION_UNAVAILABLE:
            reject("Ubicación no disponible. Verifica que el GPS esté activado.");
            break;
          case error.TIMEOUT:
            reject("Tiempo de espera agotado. Verifica la conexión GPS.");
            break;
          default:
            reject("Error desconocido: " + error.message);
            break;
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      }
    );
  });
}

function checkGPSStatus() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocalización no soportada");
      return;
    }

    let timeoutId = setTimeout(() => {
      reject("GPS no responde. Verifica que esté activado.");
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        gpsPermissionGranted = true;
        resolve({
          coords: position.coords,
          message: "GPS activo y funcionando"
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorMessage = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de GPS denegado. Actívalo en configuración.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS no disponible. Actívalo y recarga la página.";
            break;
          case error.TIMEOUT:
            errorMessage = "GPS no responde. Verifica que esté activado.";
            break;
          default:
            errorMessage = "Error GPS: " + error.message;
        }
        reject(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}


function comenzarEnvio() {
  if (watchId) navigator.geolocation.clearWatch(watchId);
  
  let errorCount = 0;
  const maxErrors = 3;
  
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      errorCount = 0; 
      
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const latFixed = lat.toFixed(6);
      const lonFixed = lon.toFixed(6);
      const timestamp = new Date().toISOString();
      
      // Actualizar UI
      document.getElementById("lat").textContent = latFixed;
      document.getElementById("lon").textContent = lonFixed;
      
      // Verificar si el bus está parado
      checkIfBusIsStopped(lat, lon);
      
      // Publicar en MQTT
      if (client && client.connected && isSendingLocation) {
        const payload = JSON.stringify({
          busId: busId,
          lat: latFixed,
          lon: lonFixed,
          timestamp: timestamp,
          status: "online"
        });
        
        client.publish(`buses/${busId}`, payload);
        
        if (Date.now() - lastRetainedUpdate > 30000) {
          client.publish(`buses/${busId}/backup`, payload, { retain: true });
          lastRetainedUpdate = Date.now();
        }
      } else {
        //  ALMACENAR PARA BACKGROUND SI NO HAY CONEXIÓN
        storePositionForBackground(latFixed, lonFixed, timestamp);
      }
      
      // Actualizar mapa
      updateMapPosition(latFixed, lonFixed);
    },
    (err) => {
      errorCount++;
      console.error("Error GPS (#" + errorCount + "):", err);
      
      let errorMsg = "Error GPS: ";
      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMsg = "Permiso GPS denegado. Recarga la página y permite ubicación.";
          break;
        case err.POSITION_UNAVAILABLE:
          errorMsg = "GPS no disponible. Verifica que esté activado.";
          break;
        case err.TIMEOUT:
          errorMsg = "GPS no responde. Verifica la señal.";
          break;
        default:
          errorMsg = "Error GPS: " + err.message;
      }
      
      updateStatus(errorMsg, "error");
      
      // Si hay muchos errores consecutivos, sugerir reinicio
      if (errorCount >= maxErrors) {
        showSystemNotification("🔧 Problemas con GPS. Intenta recargar la página.", "warning");
      }
    },
    { 
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
}

//  NUEVA FUNCIÓN MEJORADA - USA DATOS REALES
function simularCoordenadasAndroid() {
  // En la app Android, podemos obtener coordenadas reales
  if (navigator.geolocation) {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        
        if (document.getElementById('lat') && document.getElementById('lon')) {
          document.getElementById('lat').textContent = lat;
          document.getElementById('lon').textContent = lon;
        }
        
        // También actualizar el mapa si existe
        if (window.updateMapPosition) {
          updateMapPosition(lat, lon);
        }
      },
      (error) => {
        // Si hay error, mostrar mensaje
        if (document.getElementById('lat') && document.getElementById('lon')) {
          document.getElementById('lat').textContent = 'GPS activo';
          document.getElementById('lon').textContent = 'Actualizando...';
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );
    
    // Guardar el watchId para limpiarlo después
    window.androidGpsWatchId = watchId;
  } else {
    // Fallback si no hay GPS disponible
    setInterval(() => {
      if (document.getElementById('lat') && document.getElementById('lon')) {
        document.getElementById('lat').textContent = 'GPS activo';
        document.getElementById('lon').textContent = new Date().toLocaleTimeString();
      }
    }, 2000);
  }
}

// FUNCIÓN PARA LIMPIAR EL GPS CUANDO SE DETENGA
function limpiarGPSAndroid() {
  if (window.androidGpsWatchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(window.androidGpsWatchId);
  }
}