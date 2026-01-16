// Inicializar mapa
function initMap() {
  map = L.map('map', {
    zoomControl: false,
    dragging: true,
    tap: false
  }).setView([2.4382, -76.6132], 15);
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: ""
  }).addTo(map);
  
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);
}

// Actualizar posición en el mapa
function updateMapPosition(lat, lon) {
  if (!marker) {
    marker = L.marker([lat, lon], {
      icon: busIcon
    }).addTo(map)
    .bindPopup(`<b>Bus:</b> ${busId}<br><b>Última actualización:</b> ${new Date().toLocaleTimeString()}`);
    map.setView([lat, lon], 17);
  } else {
    marker.setLatLng([lat, lon]);
    marker.setPopupContent(`<b>Bus:</b> ${busId}<br><b>Última actualización:</b> ${new Date().toLocaleTimeString()}`);
  }
}