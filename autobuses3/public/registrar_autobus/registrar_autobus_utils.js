// Función para verificar si el bus está parado
function checkIfBusIsStopped(currentLat, currentLon) {
  const now = Date.now();
  const stationaryThreshold = 600000;
  const positionChangeThreshold = 0.0001;
  
  positionHistory.push({
    lat: currentLat,
    lon: currentLon,
    timestamp: now
  });
  
  positionHistory = positionHistory.filter(pos => now - pos.timestamp <= 300000);
  
  let hasMoved = false;
  if (positionHistory.length > 1) {
    const firstPos = positionHistory[0];
    const distance = calculateDistance(
      firstPos.lat, firstPos.lon,
      currentLat, currentLon
    );
    
    if (distance > positionChangeThreshold) {
      hasMoved = true;
      lastMovementTime = now;
      stationaryNotificationSent = false;
    }
  }
  
  if (!hasMoved && now - lastMovementTime >= stationaryThreshold && !stationaryNotificationSent) {
    const notificationMessage = ` El bus ${busId} está parado hace más de 10 minutos.`;
    
    if (client && client.connected) {
      const payload = JSON.stringify({
        busId: busId,
        motivo: "Bus parado por más de 10 minutos",
        timestamp: new Date().toISOString(),
        mensaje: notificationMessage
      });
      client.publish("buses/retrasos", payload);
    }
    
    showSystemNotification(notificationMessage);
    stationaryNotificationSent = true;
  }
}

// Calcular distancia entre dos puntos geográficos
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}