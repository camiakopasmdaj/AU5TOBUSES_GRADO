import FirebaseAdminService from './admin_trazador_firebase.js';
import MapaAdminService from './admin_trazador_mapa.js';
import EstadoAdminTrazador from './admin_trazador_estado.js';
import UIAdminTrazador from './admin_trazador_ui.js';

class AdminTrazadorPrincipal {
  constructor() {
    this.firebaseService = new FirebaseAdminService();
    this.mapaService = new MapaAdminService('map');
    this.estado = new EstadoAdminTrazador();
    this.ui = new UIAdminTrazador();
    
    this.inicializar();
  }

  inicializar() {
    this.cargarRutasIniciales();
    this.configurarEventosMapa();
    this.exponerFuncionesGlobales();
  }

  cargarRutasIniciales() {
    this.firebaseService.cargarRutas((data) => {
      if (data) {
        const primeraRuta = Object.keys(data)[0];
        const puntos = data[primeraRuta];
        this.estado.setTramos([puntos.filter(p => p)]);
        this.actualizarMapa();
        this.mapaService.ajustarVista(puntos.filter(p => p));
      }
    });
  }

  configurarEventosMapa() {
    const map = this.mapaService.getMap();
    
    map.on('click', (e) => {
      if (!this.estado.getTrazandoPuntos() || this.estado.getEliminandoPuntos()) return;
      
      if (!this.estado.getTramoActual()) {
        this.estado.iniciarNuevoTramo();
      }
      
      this.mapaService.agregarPunto(e.latlng, this.estado.getTramoActual());
      this.actualizarMapa();
    });
  }

  actualizarMapa() {
    const marcadores = this.mapaService.dibujarTramos(
      this.estado.getTramos(),
      this.estado.getEliminandoPuntos()
    );
    
    if (this.estado.getEliminandoPuntos()) {
      marcadores.forEach((marcador, index) => {
        // Calcular índices (simplificado - necesitarías lógica más compleja)
        marcador.on('click', () => this.eliminarPunto(index));
      });
    }
  }

  // Funciones expuestas al global/window
  toggleMenuMovil() {
    this.ui.toggleMenuMovil();
  }

  activarModoEdicion() {
    const modoActivo = !this.estado.getModoEdicion();
    this.estado.setModoEdicion(modoActivo);
    
    if (modoActivo) {
      this.ui.mostrarBotonesEdicion();
      this.ui.actualizarBotonEditar(true);
      this.ui.mostrarAlerta("Modo edición activado. Usa las herramientas para modificar la ruta.");
    } else {
      this.guardarCambios();
    }
  }

  activarTrazadoPuntos() {
    const trazando = !this.estado.getTrazandoPuntos();
    this.estado.setTrazandoPuntos(trazando);
    this.estado.setEliminandoPuntos(false);
    
    if (trazando) {
      this.ui.activarModoTrazado();
      this.ui.mostrarAlerta("Modo trazado activado. Cada clic comenzará o ampliará un tramo independiente.");
      this.estado.iniciarNuevoTramo();
    } else {
      this.ui.desactivarModoTrazado();
      this.estado.setTramoActual(null);
    }
    
    this.actualizarMapa();
  }

  activarEliminacionPuntos() {
    const eliminando = !this.estado.getEliminandoPuntos();
    this.estado.setEliminandoPuntos(eliminando);
    this.estado.setTrazandoPuntos(false);
    
    if (eliminando) {
      this.ui.activarModoEliminacion();
      this.ui.mostrarAlerta("Modo eliminación activado. Haz clic en cualquier punto para eliminarlo.");
    } else {
      this.ui.desactivarModoEliminacion();
    }
    
    this.actualizarMapa();
  }

  eliminarPunto(indices) {
    // Nota: necesitarías pasar tIndex y pIndex correctamente
    if (!this.ui.confirmar(`¿Eliminar el punto?`)) return;
    
    this.estado.setTramos(
      this.mapaService.eliminarPunto(this.estado.getTramos(), 0, indices)
    );
    this.actualizarMapa();
  }

  deshacerUltimo() {
    if (this.estado.getTramos().length === 0) {
      this.ui.mostrarAlerta("No hay puntos que deshacer.");
      return;
    }
    
    this.estado.setTramos(
      this.mapaService.deshacerUltimoPunto(this.estado.getTramos())
    );
    this.actualizarMapa();
  }

  eliminarTodo() {
    if (this.ui.confirmar("¿Eliminar todos los tramos y puntos?")) {
      this.estado.limpiarTodo();
      this.actualizarMapa();
    }
  }

  guardarCambios() {
    const todosPuntos = this.estado.getAllPuntos();
    if (todosPuntos.length < 2) {
      this.ui.mostrarAlerta("Debe haber al menos dos puntos para guardar la ruta.");
      return;
    }

    const nombreRuta = this.ui.pedirNombreRuta("Ruta Principal");
    if (!nombreRuta) return;

    this.firebaseService.guardarRuta(nombreRuta, todosPuntos)
      .then(() => {
        this.ui.mostrarAlerta("Ruta guardada correctamente.");
        this.salirModoEdicion();
      })
      .catch((err) => this.ui.mostrarAlerta("Error: " + err.message));
  }

  salirModoEdicion() {
    this.estado.setModoEdicion(false);
    this.estado.setTrazandoPuntos(false);
    this.estado.setEliminandoPuntos(false);
    this.estado.setTramoActual(null);
    
    this.ui.actualizarBotonEditar(false);
    this.ui.ocultarBotonesEdicion();
    this.actualizarMapa();
  }

  exponerFuncionesGlobales() {
    window.toggleMenuMovil = () => this.toggleMenuMovil();
    window.activarModoEdicion = () => this.activarModoEdicion();
    window.activarTrazadoPuntos = () => this.activarTrazadoPuntos();
    window.activarEliminacionPuntos = () => this.activarEliminacionPuntos();
    window.deshacerUltimo = () => this.deshacerUltimo();
    window.eliminarTodo = () => this.eliminarTodo();
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new AdminTrazadorPrincipal();
});