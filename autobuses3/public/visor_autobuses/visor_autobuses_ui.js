// Configurar menú de usuario
document.addEventListener('DOMContentLoaded', function() {
  userButton.addEventListener('click', function(e) {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });

  // Cerrar menús al hacer clic fuera 
  document.addEventListener('click', function(event) {
    if (!bellIcon.contains(event.target) && !notificationPanel.contains(event.target)) {
      notificationPanel.style.display = 'none';
    }
    
    // Cerrar menú de usuario al hacer clic 
    if (!userMenu.contains(event.target)) {
      userDropdown.classList.remove('show');
    }
  });

  // Gestión de notificaciones
  bellIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    notificationPanel.style.display = notificationPanel.style.display === 'block' ? 'none' : 'block';
    updateTrackingInfo();
  });

  
  locateMeBtn.addEventListener('click', function() {
    if (userCoords) {
      map.setView(userCoords, config.userZoom);
      if (userMarker) {
        userMarker.openPopup();
      } else {
        showAlert('info', 'Tu ubicación se está cargando. Por favor espera un momento.');
      }
    } else {
      showAlert('error', 'No se pudo obtener tu ubicación. Verifica que tengas los permisos de ubicación activados.');
    }
  });

  // Botones de zoom
  zoomInBtn.addEventListener('click', function() {
    map.zoomIn();
  });

  zoomOutBtn.addEventListener('click', function() {
    map.zoomOut();
  });

  // Botón para centrar en bus activo manualmente
  centerActiveBusBtn.addEventListener('click', centrarEnBusActivo);

  // Event listeners para los botones de navegación
  verBusesBtn.addEventListener('click', function() {
    if (mostrarRuta) {
      toggleRuta();
    }
  });

  verTrazadoBtn.addEventListener('click', function() {
    if (!mostrarRuta) {
      toggleRuta();
    }
  });
});

// Función para actualizar la información de seguimiento en el panel de notificaciones
function updateTrackingInfo() {
  const activeBuses = Object.keys(notificacionesActivas);
  
  if (activeBuses.length === 0) {
    trackingInfo.style.display = 'none';
  } else {
    trackingInfo.style.display = 'block';
    trackingBuses.innerHTML = '';
    
    activeBuses.forEach(busId => {
      const busElement = document.createElement('div');
      busElement.className = 'tracking-bus';
      busElement.innerHTML = `
        ${busId}
        <button onclick="desactivarNotificacionDesdePanel('${busId}')" title="Cancelar notificación">
          <i class="fas fa-times"></i>
        </button>
      `;
      trackingBuses.appendChild(busElement);
    });
  }
}