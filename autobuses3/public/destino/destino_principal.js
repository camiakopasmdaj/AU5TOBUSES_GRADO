import FirebaseDestinoService from './destino_firebase.js';
import MapaDestinoService from './destino_mapa.js';
import GeolocalizacionService from './destino_geolocalizacion.js';
import BusquedaDestinosService from './destino_busqueda.js';
import UIDestinoService from './destino_ui.js';

class DestinoPrincipal {
  constructor() {
    this.firebaseService = new FirebaseDestinoService();
    this.mapaService = new MapaDestinoService('map');
    this.geolocalizacion = new GeolocalizacionService();
    this.busquedaService = new BusquedaDestinosService();
    this.ui = new UIDestinoService();
    
    this.userMarker = null;
    this.destinoMarker = null;
    
    this.inicializar();
  }

  inicializar() {
    this.obtenerUbicacionUsuario();
    this.configurarEventos();
  }

  async obtenerUbicacionUsuario() {
    this.ui.mostrarLoading(true);
    
    try {
      const ubicacion = await this.geolocalizacion.obtenerUbicacion();
      
      this.userMarker = this.mapaService.agregarMarcadorUsuario(
        ubicacion,
        "📍 Tu ubicación actual"
      );
      
      this.mapaService.setView(ubicacion, 15);
      this.ui.mostrarBotonTP10M();
      
    } catch (error) {
      // Usar ubicación por defecto
      const ubicacionDefault = [2.4382, -76.6131];
      this.userMarker = this.mapaService.agregarMarcadorUsuario(
        ubicacionDefault,
        "📍 Centro de Popayán"
      );
      this.mapaService.setView(ubicacionDefault, 14);
      this.ui.mostrarError(error.message);
    } finally {
      this.ui.mostrarLoading(false);
    }
  }

  configurarEventos() {
    // Búsqueda en tiempo real
    this.ui.agregarEventoInput((query) => {
      this.buscarDestinos(query);
    }, 500);

    // Búsqueda con Enter
    this.ui.agregarEventoEnter(() => {
      const query = this.ui.getValorDestino();
      if (query.length >= 2) {
        this.buscarDestinos(query);
      }
    });

    // Cerrar panel de ruta
    this.ui.agregarEventoCerrarPanel(() => {
      this.ui.ocultarPanelRuta();
    });

    // Evento para clics en sugerencias
    this.ui.elementos.sugerenciasLista.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI' && e.target.dataset.resultado) {
        const resultado = JSON.parse(e.target.dataset.resultado);
        this.mostrarDestinoEnMapa(resultado);
      }
    });

    // Exponer función global para TP10M
    window.mostrarRutaTP10M = () => this.mostrarRutaTP10M();
  }

  async buscarDestinos(query) {
    try {
      this.ui.mostrarLoading(true);
      const resultados = await this.busquedaService.buscarDestinos(query);
      this.ui.mostrarSugerencias(resultados);
    } catch (error) {
      this.ui.mostrarError(error.message);
    } finally {
      this.ui.mostrarLoading(false);
    }
  }

  mostrarDestinoEnMapa(resultado) {
    // Limpiar elementos anteriores
    if (this.destinoMarker) {
      this.mapaService.getMap().removeLayer(this.destinoMarker);
    }
    this.mapaService.limpiarRuta();

    // Crear marcador de destino
    this.destinoMarker = this.mapaService.agregarMarcadorDestino(
      [resultado.lat, resultado.lon],
      `📍 ${resultado.nombre}`
    );

    this.mapaService.setView([resultado.lat, resultado.lon], 16);
    this.ui.limpiarSugerencias();

    // Calcular ruta si tenemos ubicación del usuario
    const ubicacionUsuario = this.geolocalizacion.getUbicacion();
    if (ubicacionUsuario) {
      this.calcularRutaUsuario(ubicacionUsuario, [resultado.lat, resultado.lon], resultado.nombre);
    }
  }

  calcularRutaUsuario(origen, destino, nombreDestino) {
    const controlRuta = this.mapaService.calcularRuta(origen, destino);
    
    controlRuta.on('routesfound', (e) => {
      const route = e.routes[0];
      const distanciaKm = (route.summary.totalDistance / 1000).toFixed(2);
      const duracionMin = Math.round(route.summary.totalTime / 60);
      
      this.mostrarInfoRutaUsuario(distanciaKm, duracionMin, nombreDestino);
    });
  }

  mostrarInfoRutaUsuario(distancia, duracion, nombreDestino) {
    const datosRuta = {
      titulo: 'Ruta hacia tu destino',
      descripcion: 'Ruta calculada desde tu ubicación actual hasta el destino seleccionado.',
      origen: 'Tu ubicación',
      destino: this.ui.formatearNombreLargo(nombreDestino, 30),
      distancia: `${distancia} km`,
      duracion: `${duracion} min`
    };

    this.ui.mostrarInformacionRuta(datosRuta);
  }

  async mostrarRutaTP10M() {
    const ubicacionUsuario = this.geolocalizacion.getUbicacion();
    if (!ubicacionUsuario) {
      this.ui.mostrarAlerta("Obteniendo tu ubicación...");
      await this.obtenerUbicacionUsuario();
      return;
    }

    this.ui.mostrarLoading(true);

    try {
      const snapshot = await this.firebaseService.obtenerRutaTP10M();
      const puntosRutaTP10M = snapshot.val();
      
      if (!puntosRutaTP10M || puntosRutaTP10M.length === 0) {
        throw new Error("No se encontró la ruta TP10M en la base de datos.");
      }

      // Dibujar ruta TP10M
      this.mapaService.dibujarRutaTP10M(puntosRutaTP10M);

      // Calcular distancia total
      const distanciaTotal = this.mapaService.calcularDistanciaTotal(puntosRutaTP10M);

      // Ajustar vista
      const bounds = L.latLngBounds(puntosRutaTP10M);
      if (this.userMarker) bounds.extend(this.userMarker.getLatLng());
      this.mapaService.ajustarVista(bounds);

      // Mostrar información
      this.mostrarInfoRutaTP10M(distanciaTotal);
      
    } catch (error) {
      console.error("Error al obtener la ruta TP10M:", error);
      this.ui.mostrarError(error.message || "Error al cargar la ruta TP10M.");
    } finally {
      this.ui.mostrarLoading(false);
    }
  }

  mostrarInfoRutaTP10M(distanciaTotal) {
    const duracionEstimada = Math.round((distanciaTotal / 20) * 60);
    
    const datosRuta = {
      titulo: 'Ruta TP10M',
      descripcion: 'Ruta principal que conecta el norte y sur de Popayán.',
      origen: 'Terminal Norte',
      destino: 'Terminal Sur',
      frecuencia: '15-20 min',
      distancia: `${distanciaTotal.toFixed(1)} km`,
      duracion: `${duracionEstimada} min`
    };

    this.ui.mostrarInformacionRuta(datosRuta);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new DestinoPrincipal();
});