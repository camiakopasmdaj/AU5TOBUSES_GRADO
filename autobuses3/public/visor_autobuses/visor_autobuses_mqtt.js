// Conexión MQTT con mensajes retenidos
const mqttOptions = {
  username: "busTrackerUser",
  password: "311411Camil@",
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  keepalive: 60
};

const client = mqtt.connect("wss://8d9a31655be84e56b5601620210f24ac.s1.eu.hivemq.cloud:8884/mqtt", mqttOptions);

client.on("connect", () => {
  console.log("Conectado al broker MQTT");
  connectionStatus.textContent = "Conectado";
  connectionIcon.textContent = "🟢";
  
  client.subscribe("buses/#", { qos: 1 }, (err) => {
    if (!err) {
      console.log("Suscripción exitosa a buses/#");
    }
  });
});

client.on("error", (err) => {
  console.error("Error MQTT:", err);
  connectionStatus.textContent = "Error de conexión";
  connectionIcon.textContent = "🔴";
  showAlert('error', 'Error de conexión con el servidor');
});

client.on("reconnect", () => {
  connectionStatus.textContent = "Reconectando...";
  connectionIcon.textContent = "🟡";
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    
    if (topic === "buses/retrasos") {
      const notificationMsg = `<b>${data.busId}</b>: ${data.motivo}`;
      addNotification(notificationMsg, 'warning');
      return;
    }
    
    const { busId, lat, lon, timestamp } = data;
    if (!busId || !lat || !lon) return;

   
    const messageTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const messageAge = currentTime - messageTime;
    
    if (messageAge > 120000) {
      console.log(`Ignorando mensaje antiguo del bus ${busId} (${Math.round(messageAge/1000)} segundos)`);
      return;
    }

    
    lastUpdateTime = new Date().toLocaleTimeString();
    updateStatus.textContent = lastUpdateTime;

    
    processBusData(busId, parseFloat(lat), parseFloat(lon), timestamp);

    
    checkNotifications(busId, lat, lon);
    
    
    if (!busesNotificados.has(busId)) {
      addNotification(` <b>${busId}</b> está disponible en la ruta`, 'bus', busId);
      busesNotificados.add(busId);
      
      activeBusId = busId;
      centerActiveBusBtn.style.display = 'block';
      centerActiveBusBtn.innerHTML = `<i class="fas fa-bus"></i> ${busId}`;
    }
  } catch (err) {
    console.error('Error procesando mensaje:', err);
  }
});

function processBusData(busId, lat, lon, timestamp) {
  createOrUpdateBusMarker(busId, lat, lon, timestamp, false);
  updateBusPopup(busId);
  
  
  crearOActualizarTrazado(busId, lat, lon);
}


function createOrUpdateBusMarker(busId, lat, lon, timestamp, isHistorical = false) {
  const newPos = [lat, lon];
  
  if (!buses[busId]) {
    buses[busId] = {
      marker: L.marker(newPos, { 
        icon: busIcon,
        title: `Bus ${busId}`
      }).addTo(map),
      positions: [],
      lastUpdated: timestamp || Date.now(),
      isHistorical: isHistorical,
      notifiedStopped: false,
      notifiedAvailable: false
    };
    
    busPositionHistory[busId] = [];
  } else {
    if (buses[busId].isHistorical && !isHistorical) {
      buses[busId].isHistorical = false;
    }
    
    buses[busId].lastUpdated = timestamp || Date.now();
    
    if (!busPositionHistory[busId]) {
      busPositionHistory[busId] = [];
    }
    
    const currentPositionKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    busPositionHistory[busId].push({
      positionKey: currentPositionKey,
      timestamp: Date.now()
    });
    
    // Mantener solo últimos 10 segundos de historial
    busPositionHistory[busId] = busPositionHistory[busId].filter(
      pos => Date.now() - pos.timestamp <= 10000
    );
    
    if (shouldUpdatePosition(buses[busId].positions, newPos)) {
      buses[busId].positions.push({
        position: newPos,
        timestamp: Date.now()
      });
      
      if (buses[busId].positions.length > config.maxHistoryPoints) {
        buses[busId].positions.shift();
      }
      
      updateBusPosition(busId, newPos);
    }
  }
  
  saveLastKnownPosition(busId, lat, lon, timestamp);
}

// Determinar si se debe actualizar la posición
function shouldUpdatePosition(history, newPos) {
  if (history.length === 0) return true;
  
  const lastPos = history[history.length - 1].position;
  const latDiff = Math.abs(lastPos[0] - newPos[0]);
  const lonDiff = Math.abs(lastPos[1] - newPos[1]);
  
  return latDiff > config.movementThreshold || lonDiff > config.movementThreshold;
}


function updateBusPosition(busId, newPos) {
  if (config.smoothMovement && buses[busId].positions.length > 1) {
    if (notificacionesActivas[busId]) {
      buses[busId].marker.setIcon(L.icon({
        iconUrl: 'imagenes/BUSICONO.jpg?v=1' + Date.now(),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        className: 'bus-marker-notification'
      }));
    } else {
      buses[busId].marker.setIcon(busIcon);
    }
  }
  
  buses[busId].marker.setLatLng(newPos);
}

// Guardar última posición conocida de un bus
function saveLastKnownPosition(busId, lat, lon, timestamp) {
  lastKnownPositions[busId] = {
    lat: lat,
    lon: lon,
    timestamp: timestamp || Date.now()
  };
  
  localStorage.setItem('lastKnownBusPositions', JSON.stringify(lastKnownPositions));
}