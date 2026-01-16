
const alertSound = new Audio('https://www.soundjay.com/buttons/sounds/beep-07.mp3');
alertSound.preload = 'auto';

function playNotificationSound() {
  if (!audioEnabled) return;
  
  try {
    alertSound.currentTime = 0;
    alertSound.volume = 0.7;
    alertSound.play().catch(e => console.log('No se pudo reproducir sonido:', e));
  } catch (e) {
    console.error('Error al reproducir sonido:', e);
  }
}

function addNotification(message, type = 'info', busId = null) {

  const now = Date.now();
  const notificationKey = `${type}-${busId}-${message}`;
  
  if (lastNotificationTime[notificationKey]) {
    const timeSinceLast = now - lastNotificationTime[notificationKey];
    
    if (timeSinceLast < 30000) {
      console.log(`⏰ Notificación duplicada evitada: ${notificationKey}`);
      return;
    }
  }
  
  lastNotificationTime[notificationKey] = now;

  const li = document.createElement("li");
  li.className = `notification-item notification-${type}`;
  
  
  let icon = 'info-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'bus') icon = 'bus';
  
  let actionButtons = '';
  if (busId && type === 'bus') {
    const isTracking = notificacionesActivas[busId];
    actionButtons = `
      <div class="notification-actions">
        <button class="notification-btn ${isTracking ? 'untrack' : 'track'}" 
                onclick="${isTracking ? `desactivarNotificacion('${busId}')` : `activarNotificacion('${busId}')`}">
          ${isTracking ? 'Cancelar notificación' : 'Notificarme cuando esté cerca'}
        </button>
      </div>
    `;
  }
  
  li.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="notification-content">
      ${message}
      <div class="notification-time">${new Date().toLocaleTimeString()}</div>
      ${actionButtons}
    </div>
  `;
  
  document.getElementById("notifList").prepend(li);
  
  // Actualizar contador
  notificationCount++;
  notificationCountEl.textContent = notificationCount;
  notificationCountEl.style.display = 'flex';
  
  bellIcon.querySelector('i').style.color = "#ffdd59";
  
  playNotificationSound();
  
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Visor de Ruta TP10M", {
      body: message.replace(/<[^>]*>/g, ''),
      icon: "https://cdn-icons-png.flaticon.com/512/61/61235.png"
    });
  }
}

window.activarNotificacion = function(busId) {
  if (!userCoords) {
    showAlert('error', 'No se pudo obtener tu ubicación actual.');
    return;
  }

  if (notificacionesActivas[busId]) {
    delete notificacionesActivas[busId];
    if (buses[busId]?.marker) buses[busId].marker.setIcon(busIcon);
    
    addNotification(` Notificación cancelada para el <b>${busId}</b>`, 'info');
  } else {
    notificacionesActivas[busId] = true;
    if (buses[busId]?.marker) {
      buses[busId].marker.setIcon(L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        className: 'bus-marker-notification'
      }));
      buses[busId].marker.openPopup();
    }

    addNotification(`Notificación activada para el <b>${busId}</b>`, 'success');

    playNotificationSound();

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Visor de Ruta TP10M", {
        body: `Notificación activada para el Bus ${busId}`,
        icon: "https://cdn-icons-png.flaticon.com/512/61/61235.png"
      });
    }
  }
  updateBusPopup(busId);
  updateTrackingInfo();
};

window.desactivarNotificacion = function(busId) {
  if (notificacionesActivas[busId]) {
    delete notificacionesActivas[busId];
    if (buses[busId]?.marker) buses[busId].marker.setIcon(busIcon);
    
    addNotification(`Notificación cancelada para el <b>${busId}</b>`, 'info');
    updateBusPopup(busId);
    updateTrackingInfo();
  }
};

window.desactivarNotificacionDesdePanel = function(busId) {
  window.desactivarNotificacion(busId);
};

function checkNotifications(busId, lat, lon) {
  if (notificacionesActivas[busId] && userCoords) {
    const distancia = calcularDistancia(userCoords[0], userCoords[1], lat, lon);
    
    if (distancia <= config.notificationDistance) {
      const distanciaMetros = Math.round(distancia * 1000);
      
      const notificationMsg = ` <b>${busId}</b> está a <b>${distanciaMetros} metros</b> de tu ubicación`;
      addNotification(notificationMsg, 'success');
      
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      playNotificationSound();
      delete notificacionesActivas[busId];
      updateTrackingInfo();
      
      if (buses[busId]?.marker) {
        buses[busId].marker.setIcon(busIcon);
        updateBusPopup(busId);
      }
    }
  }
}

function updateBusPopup(busId) {
  if (!buses[busId]) return;
  
  const notificacionActiva = notificacionesActivas[busId] ? 
    '<span style="color:#2ed573; font-size:12px;"> Notificación activa</span>' : 
    '';
  
  const estado = buses[busId].isHistorical ? 
    '<div style="color: #ff6b6b; font-size: 12px; margin: 5px 0;"><i class="fas fa-clock"></i> Última posición conocida</div>' :
    '<div style="color: #2ed573; font-size: 12px; margin: 5px 0;"><i class="fas fa-check-circle"></i> En línea</div>';
  
  buses[busId].marker.bindPopup(`
    <div class="bus-popup">
      <h4><i class="fas fa-bus"></i> Bus ${busId}</h4>
      <small>Actualizado: ${new Date(buses[busId].lastUpdated).toLocaleTimeString()}</small>
      ${estado}
      ${notificacionActiva}
      <button onclick="activarNotificacion('${busId}')">
        ${notificacionesActivas[busId] ? ' Cancelar notificación' : ' Notificarme cuando esté cerca'}
      </button>
    </div>
  `);
}