// Mostrar alertas
function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

// Calcular distancia entre dos puntos
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Limpiar bus inactivos automáticamente
setInterval(() => {
  const now = Date.now();
  
  for (const busId in buses) {
    if (!buses[busId].isHistorical && now - buses[busId].lastUpdated > config.busInactivityTimeout) {
      map.removeLayer(buses[busId].marker);
      delete buses[busId];
      delete notificacionesActivas[busId];
      delete busPositionHistory[busId];
      
      busesNotificados.delete(busId);
      delete lastNotificationTime[busId];
      
      if (activeBusId === busId) {
        activeBusId = null;
        centerActiveBusBtn.style.display = 'none';
      }
    }
    
    if (buses[busId].isHistorical && now - buses[busId].lastUpdated > 300000) {
      map.removeLayer(buses[busId].marker);
      delete buses[busId];
      delete notificacionesActivas[busId];
      delete busPositionHistory[busId];
      
      busesNotificados.delete(busId);
      delete lastNotificationTime[busId];
      
      
      if (activeBusId === busId) {
        activeBusId = null;
        centerActiveBusBtn.style.display = 'none';
      }
    }
  }
  

  limpiarTrazadosInactivos();
}, 10000);


const STOPPED_THRESHOLD = 100 * 1000; 
const motivos = ["trancón", "falla mecánica", "incidente en la vía"];

setInterval(() => {
  const now = Date.now();
  
  for (const busId in buses) {
    const bus = buses[busId];
    
    if (bus && !bus.isHistorical && busPositionHistory[busId] && busPositionHistory[busId].length > 0) {
      const uniquePositions = new Set(busPositionHistory[busId].map(pos => pos.positionKey));
      const isStopped = uniquePositions.size === 1; 
      
      const stoppedTime = now - busPositionHistory[busId][0].timestamp;
      
      console.log(`Bus ${busId}: ${isStopped ? 'PARADO' : 'EN MOVIMIENTO'}, Tiempo: ${stoppedTime/1000}s`);
      
      if (isStopped && stoppedTime > STOPPED_THRESHOLD && !bus.notifiedStopped) {
        console.log(` ALERTA: Bus ${busId} parado por ${Math.round(stoppedTime/1000)} segundos`);
        
        const motivo = motivos[Math.floor(Math.random() * motivos.length)];
        const msg = ` El autobús <b>${busId}</b> está presentando inconvenientes para desplazarse (${motivo}), por favor tomar otro autobus`;
        addNotification(msg, 'warning');
        
        
        if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
        
        bus.notifiedStopped = true;
      }
      
 
      if (!isStopped && bus.notifiedStopped) {
        console.log(`✅ Bus ${busId} reanudó movimiento`);
        bus.notifiedStopped = false;
      }
    }
  }
}, 1000); // Verificar cada 1 segundo