
function requestGeolocationPermission() {
 
  gpsPermissionModal.style.display = 'flex';
  
  // Configurar evento para permitir GPS
  allowGpsBtn.addEventListener('click', function() {
    gpsPermissionModal.style.display = 'none';
    startGeolocation();
  });

  denyGpsBtn.addEventListener('click', function() {
    gpsPermissionModal.style.display = 'none';
    showAlert('warning', 'La funcionalidad de ubicación está limitada. Algunas características no estarán disponibles.');
  });
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        gpsPermissionModal.style.display = 'none';
        startGeolocation();
      },
      function(error) {
        console.log("Esperando que el usuario conceda permisos...");
      }
    );
  } else {
    gpsPermissionModal.style.display = 'none';
    showAlert('error', 'Tu navegador no soporta geolocalización.');
  }
}

// Función para iniciar la geolocalización
function startGeolocation() {
  if (navigator.geolocation) {
    geolocationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        userCoords = [lat, lon];
        console.log("Ubicación del usuario actualizada:", userCoords);
        
        updateUserLocation(lat, lon);
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        handleGeolocationError(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );
  } else {
    showAlert('error', 'La geolocalización no es compatible con tu navegador.');
  }
}

function handleGeolocationError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      showAlert('error', 'Permiso de ubicación denegado. Puedes activarlo en la configuración de tu navegador.');
      break;
    case error.POSITION_UNAVAILABLE:
      showAlert('error', 'La información de ubicación no está disponible.');
      break;
    case error.TIMEOUT:
      showAlert('error', 'La solicitud de ubicación ha expirado.');
      break;
    default:
      showAlert('error', 'Error desconocido al obtener la ubicación.');
      break;
  }
}

function updateUserLocation(lat, lon) {
  if (!userMarker) {
    userMarker = L.marker([lat, lon]).addTo(map);
    userMarker.bindPopup(`
      <div style="text-align: center;">
        <i class="fas fa-user" style="color: #2ecc71; font-size: 20px;"></i>
        <br>
        <strong>Tu ubicación</strong>
        <br>
        <small>Actualizado: ${new Date().toLocaleTimeString()}</small>
      </div>
    `);
  } else {
    userMarker.setLatLng([lat, lon]);
    userMarker.getPopup().setContent(`
      <div style="text-align: center;">
        <i class="fas fa-user" style="color: #2ecc71; font-size: 20px;"></i>
        <br>
        <strong>Tu ubicación</strong>
        <br>
        <small>Actualizado: ${new Date().toLocaleTimeString()}</small>
      </div>
    `);
  }
}