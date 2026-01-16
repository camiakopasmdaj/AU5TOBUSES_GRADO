class MapaDestinoService {
  constructor(containerId) {
    this.map = L.map(containerId).setView([2.4382, -76.6131], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }).addTo(this.map);
    
    this.controlRuta = null;
    this.rutaTP10M = null;
    this.markersTP10M = [];
    
    this.configurarIconos();
  }

  configurarIconos() {
    this.iconos = {
      user: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
      destino: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
      bus: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    };
  }

  agregarMarcadorUsuario(posicion, popupTexto = "📍 Tu ubicación actual") {
    return L.marker(posicion, { icon: this.iconos.user })
      .addTo(this.map)
      .bindPopup(popupTexto)
      .openPopup();
  }

  agregarMarcadorDestino(posicion, popupTexto) {
    return L.marker(posicion, { icon: this.iconos.destino })
      .addTo(this.map)
      .bindPopup(popupTexto)
      .openPopup();
  }

  limpiarRuta() {
    if (this.controlRuta) {
      this.map.removeControl(this.controlRuta);
      this.controlRuta = null;
    }
  }

  limpiarRutaTP10M() {
    if (this.rutaTP10M) {
      this.map.removeLayer(this.rutaTP10M);
      this.rutaTP10M = null;
    }
    
    this.markersTP10M.forEach(marker => this.map.removeLayer(marker));
    this.markersTP10M = [];
  }

  calcularRuta(origen, destino) {
    this.limpiarRuta();
    
    this.controlRuta = L.Routing.control({
      waypoints: [
        L.latLng(origen[0], origen[1]),
        L.latLng(destino[0], destino[1])
      ],
      lineOptions: {
        styles: [{ color: '#2196F3', weight: 5, opacity: 0.7 }]
      },
      language: 'es',
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      createMarker: () => null
    }).addTo(this.map);
    
    return this.controlRuta;
  }

  dibujarRutaTP10M(puntos) {
    this.limpiarRutaTP10M();
    
    this.rutaTP10M = L.polyline(puntos, {
      color: '#4CAF50',
      weight: 6,
      opacity: 0.8
    }).addTo(this.map).bindPopup(`<b>Ruta TP10M</b>`);
    
    return this.rutaTP10M;
  }

  ajustarVista(bounds, padding = [20, 20]) {
    this.map.fitBounds(bounds, { padding });
  }

  setView(center, zoom) {
    this.map.setView(center, zoom);
  }

  getMap() {
    return this.map;
  }

  calcularDistanciaTotal(puntos) {
    let distanciaTotal = 0;
    for (let i = 1; i < puntos.length; i++) {
      distanciaTotal += this.calcularDistancia(
        puntos[i-1][0], puntos[i-1][1],
        puntos[i][0], puntos[i][1]
      );
    }
    return distanciaTotal;
  }

  calcularDistancia(lat1, lon1, lat2, lon2) {
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
}

export default MapaDestinoService;