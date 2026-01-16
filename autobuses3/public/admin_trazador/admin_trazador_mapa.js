class MapaAdminService {
  constructor(containerId) {
    this.map = L.map(containerId).setView([2.44, -76.61], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }).addTo(this.map);
    
    this.marcadores = [];
    this.lineas = [];
    this.tramos = [];
  }

  limpiarMapa() {
    this.marcadores.forEach(m => this.map.removeLayer(m));
    this.marcadores = [];
    this.lineas.forEach(l => this.map.removeLayer(l));
    this.lineas = [];
  }

  dibujarTramos(tramos, modoEliminacion = false) {
    this.limpiarMapa();
    
    tramos.forEach((tramo, tIndex) => {
      if (tramo.length > 1) {
        const linea = L.polyline(tramo, { color: 'blue', weight: 5 }).addTo(this.map);
        this.lineas.push(linea);
      }

      tramo.forEach((punto, pIndex) => {
        const marcador = L.circleMarker(punto, {
          color: modoEliminacion ? 'red' : 'blue',
          fillColor: modoEliminacion ? '#ff0000' : '#3388ff',
          fillOpacity: 0.7,
          radius: modoEliminacion ? 8 : 6
        }).addTo(this.map);

        marcador.bindTooltip(`Tramo ${tIndex + 1} - Punto ${pIndex + 1}`, {
          permanent: false,
          direction: 'top'
        });

        this.marcadores.push(marcador);
      });
    });
    
    return this.marcadores;
  }

  agregarPunto(punto, tramoActual) {
    tramoActual.push([punto.lat, punto.lng]);
  }

  eliminarPunto(tramos, tIndex, pIndex) {
    const tramo = tramos[tIndex];

    if (pIndex > 0 && pIndex < tramo.length - 1) {
      const primeraParte = tramo.slice(0, pIndex);
      const segundaParte = tramo.slice(pIndex + 1);

      tramos.splice(tIndex, 1);
      let insertIndex = tIndex;

      if (primeraParte.length > 0) {
        tramos.splice(insertIndex, 0, primeraParte);
        insertIndex++;
      }
      if (segundaParte.length > 0) {
        tramos.splice(insertIndex, 0, segundaParte);
      }
    } else {
      tramo.splice(pIndex, 1);
      if (tramo.length === 0) {
        tramos.splice(tIndex, 1);
      }
    }

    return tramos;
  }

  deshacerUltimoPunto(tramos) {
    if (tramos.length > 0) {
      const ultimo = tramos[tramos.length - 1];
      if (ultimo.length > 0) {
        ultimo.pop();
      } else {
        tramos.pop();
      }
    }
    return tramos;
  }

  ajustarVista(puntos) {
    if (puntos.length > 0) {
      this.map.fitBounds(L.latLngBounds(puntos.filter(p => p)));
    }
  }

  getMap() {
    return this.map;
  }
}

export default MapaAdminService;