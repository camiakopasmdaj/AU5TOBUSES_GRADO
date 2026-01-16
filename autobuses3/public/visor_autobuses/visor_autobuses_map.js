// Cargar y mostrar la ruta TP10M desde Firebase
function cargarYMostrarRuta() {
  const rutaRef = db.ref('rutas/TP10M');
  rutaRef.once('value').then((snapshot) => {
    const puntos = snapshot.val();
    if (puntos && puntos.length > 0) {
  
      routePolyline = L.polyline(puntos, { 
        color: '#3498db', 
        weight: 6,
        opacity: 0.7
      }).addTo(map);
      
   
      const startMarker = L.marker(puntos[0], {
        icon: inicioIcon
      }).addTo(map).bindPopup(`
        <div style="text-align: center;">
          <i class="fas fa-play-circle" style="color: #2ecc71; font-size: 20px;"></i>
          <br>
          <strong>Inicio Ruta TP10M</strong>
        </div>
      `);
      
      const endMarker = L.marker(puntos[puntos.length-1], {
        icon: finIcon
      }).addTo(map).bindPopup(`
        <div style="text-align: center;">
          <i class="fas fa-flag-checkered" style="color: #e74c3c; font-size: 20px;"></i>
          <br>
          <strong>Fin Ruta TP10M</strong>
        </div>
      `);
      
      routeMarkers = [startMarker, endMarker];
      map.fitBounds(routePolyline.getBounds());
    }
  }).catch((error) => {
    console.error("Error cargando ruta:", error);
    mostrarRutaPorDefecto();
  });
}

// Ruta por defecto en caso de error
function mostrarRutaPorDefecto() {
  const puntosRuta = [
    [2.4569, -76.6331],
    [2.4519, -76.6281],
    [2.4469, -76.6231],
    [2.4419, -76.6181],
    [2.4369, -76.6131],
    [2.4319, -76.6081],
    [2.4269, -76.6031],
    [2.4219, -76.5981],
    [2.4169, -76.5931]
  ];
  
  routePolyline = L.polyline(puntosRuta, { 
    color: '#3498db', 
    weight: 6,
    opacity: 0.7
  }).addTo(map);
  
  // Marcadores con nuevos iconos
  const startMarker = L.marker(puntosRuta[0], {
    icon: inicioIcon
  }).addTo(map).bindPopup(`
    <div style="text-align: center;">
      <i class="fas fa-play-circle" style="color: #2ecc71; font-size: 20px;"></i>
      <br>
      <strong>Inicio Ruta TP10M</strong>
    </div>
  `);
  
  const endMarker = L.marker(puntosRuta[puntos.length-1], {
    icon: finIcon
  }).addTo(map).bindPopup(`
    <div style="text-align: center;">
      <i class="fas fa-flag-checkered" style="color: #e74c3c; font-size: 20px;"></i>
      <br>
      <strong>Fin Ruta TP10M</strong>
    </div>
  `);
  
  routeMarkers = [startMarker, endMarker];
  map.fitBounds(routePolyline.getBounds());
}

// Mostrar/ocultar la ruta TP10M
function toggleRuta() {
  if (mostrarRuta) {
    // Ocultar ruta
    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }
    routeMarkers.forEach(marker => map.removeLayer(marker));
    routeMarkers = [];
    mostrarRuta = false;
    verTrazadoBtn.classList.remove('active');
    verBusesBtn.classList.add('active');
  } else {
    // Mostrar ruta
    cargarYMostrarRuta();
    mostrarRuta = true;
    verTrazadoBtn.classList.add('active');
    verBusesBtn.classList.remove('active');
  }
}

function getColorParaBus(busId) {
  const colores = ['#e74c3c'];
  const index = parseInt(busId) % colores.length || 0;
  return colores[index];
}

// Función para crear o actualizar trazado del bus
function crearOActualizarTrazado(busId, lat, lon) {
  if (!busTrazados[busId]) {
    // Crear nuevo trazado para el bus
    busTrazados[busId] = {
      polyline: L.polyline([[lat, lon]], {
        color: getColorParaBus(busId),
        weight: 4,
        opacity: 0.7,
        className: `trazado-bus-${busId}`
      }).addTo(map),
      puntos: [[lat, lon]],
      ultimaActualizacion: Date.now()
    };
  } else {

    const trazado = busTrazados[busId];
    trazado.puntos.push([lat, lon]);
    trazado.polyline.setLatLngs(trazado.puntos);
    trazado.ultimaActualizacion = Date.now();
    
    if (trazado.puntos.length > 100) {
      trazado.puntos.shift();
    }
  }
}


function limpiarTrazadosInactivos() {
  const ahora = Date.now();
  const tiempoLimite = 30000;
  
  for (const busId in busTrazados) {
    const trazado = busTrazados[busId];
    const tiempoInactivo = ahora - trazado.ultimaActualizacion;
    
    if (tiempoInactivo > tiempoLimite) {
      if (trazado.polyline) {
        map.removeLayer(trazado.polyline);
      }
      delete busTrazados[busId];
      console.log(` Trazado eliminado para bus ${busId} (inactivo por ${tiempoInactivo/1000}s)`);
    }
  }
}

// Centrar en bus activo manualmente
function centrarEnBusActivo() {
  if (activeBusId && buses[activeBusId]) {
    const bus = buses[activeBusId];
    const lastPos = bus.positions[bus.positions.length - 1];
    if (lastPos) {
      map.setView(lastPos.position, config.userZoom);
      bus.marker.openPopup();
    }
  }
}