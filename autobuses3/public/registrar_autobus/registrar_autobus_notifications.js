// Función para mostrar notificación del sistema
function showSystemNotification(message, type = 'warning') {
  const notificationContainer = document.getElementById('systemNotificationContainer');
  
  const notification = document.createElement('div');
  notification.className = `system-notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <p>${message}</p>
  `;
  
  notificationContainer.appendChild(notification);
  
  // Eliminar la notificación después de 5 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOutNotification 0.3s forwards';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Actualizar estado de conexión
function updateStatus(message, type) {
  const status = document.getElementById("status");
  status.className = `status-container status-${type}`;
  
  let icon = 'clock';
  if (type === "active") icon = 'check-circle';
  if (type === "error") icon = 'exclamation-circle';
  
  status.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
}