// Variables globales del sistema
let busId = "";
let client = null;
let marker = null;
let map = null;
let updateInterval = null;
let isRegistering = false;
let positionHistory = [];
let lastMovementTime = Date.now();
let stationaryNotificationSent = false;
let watchId = null;
let isBackgroundMode = false;
let wakeLock = null;
let isSendingLocation = false;
let lastRetainedUpdate = 0;
let gpsPermissionGranted = false;
let backgroundPositionInterval = null;

// Configuración MQTT
const mqttOptions = {
  username: "busTrackerUser",
  password: "311411Camil@",
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000
};

// Icono del bus para el mapa
const busIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'bus-marker'
});

// Función principal de registro
async function registrarBus() {
  if (isRegistering) return;
  isRegistering = true;
  
  const btn = document.getElementById('registerBtn');
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<div class="loading-spinner"></div><span>Verificando GPS...</span>';
  btn.disabled = true;
  
  // Detener envío anterior si existe
  if (updateInterval) clearInterval(updateInterval);
  if (watchId) navigator.geolocation.clearWatch(watchId);
  if (backgroundPositionInterval) clearInterval(backgroundPositionInterval);
  if (client) {
      client.end();
      client = null;
  }
  
  // Reiniciar variables
  positionHistory = [];
  lastMovementTime = Date.now();
  stationaryNotificationSent = false;
  
  // Obtener ID del bus
  busId = document.getElementById("busId").value.trim();
  if (!busId) {
      updateStatus("Por favor ingresa un ID de bus", "error");
      showSystemNotification("Por favor ingresa un ID de bus", "error");
      resetButton(btn, originalContent);
      isRegistering = false;
      return;
  }

  try {
    
    if (typeof AndroidApp !== "undefined") {
     
      updateStatus("Activando servicio Android...", "waiting");
      
    
      AndroidApp.iniciarServicio();
      
     
      console.log(" Modo Android - Usando GPS del WebView");
      
      if (navigator.geolocation) {
        // Obtener posición cada 2 segundos
        setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lon = position.coords.longitude.toFixed(6);
                    
                    
                    document.getElementById('lat').textContent = lat;
                    document.getElementById('lon').textContent = lon;
                    
                    // Actualizar mapa también
                    if (typeof updateMapPosition === 'function') {
                        updateMapPosition(lat, lon);
                    }
                    
                    console.log("📍 Coordenadas en UI:", lat, lon);
                },
                (error) => {
                    
                    document.getElementById('lat').textContent = 'GPS activo';
                    document.getElementById('lon').textContent = new Date().toLocaleTimeString();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }, 2000); // Cada 2 segundos
      }
      
      
      updateStatus("Servicio Android activo", "active");
      showSystemNotification("Servicio Android activado", "success");
      
      btn.innerHTML = '<i class="fas fa-check-circle"></i><span> SEGUIMIENTO ACTIVO</span>';
      btn.disabled = false;
      isRegistering = false;
      
    } else {
      
      updateStatus("Verificando estado del GPS...", "waiting");
      await checkGPSStatus();

      updateStatus("Configurando segundo plano...", "waiting");
      const swRegistered = await registerServiceWorker();
      
      if (swRegistered) {
          document.getElementById('backgroundStatus').style.display = 'flex';
          isBackgroundMode = true;
          showSystemNotification(" Modo segundo plano activado", "success");
      }
      
     
      updateStatus("Conectando a MQTT...", "waiting");
      btn.innerHTML = '<div class="loading-spinner"></div><span>Conectando...</span>';
      
      // Conexión MQTT
      await connectToMQTT();
      
      
      requestWakeLock();
      
      // Iniciar envío de ubicación
      isSendingLocation = true;
      comenzarEnvio();
      
      
      startBackgroundTracking();
      
      btn.innerHTML = '<i class="fas fa-check-circle"></i><span>Enviando datos...</span>';
      btn.disabled = false;
      isRegistering = false;
      
      
      sendStoredPositions();
    }
  } catch (error) {
    console.error("Error en registro:", error);
    updateStatus("Error: " + error, "error");
    showSystemNotification(" Error: " + error, "error");
    resetButton(btn, originalContent);
    isSendingLocation = false;
    
    
    if (error.includes("GPS") || error.includes("ubicación")) {
        showSystemNotification(" Solución: Activa el GPS en tu dispositivo y vuelve a intentar", "info");
    }
  }
}


function resetButton(btn, originalContent) {
  btn.innerHTML = originalContent;
  btn.disabled = false;
  isRegistering = false;
}


document.addEventListener('DOMContentLoaded', () => {
  initMap();
  
  document.getElementById("busId").addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registrarBus();
  });
});


window.addEventListener('beforeunload', () => {
  limpiarPosicionAlSalir();
  if (updateInterval) clearInterval(updateInterval);
  if (watchId) navigator.geolocation.clearWatch(watchId);
  if (backgroundPositionInterval) clearInterval(backgroundPositionInterval);
  if (client) client.end();
  releaseWakeLock();
});