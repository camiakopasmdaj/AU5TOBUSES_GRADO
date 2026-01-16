class UIDestinoService {
  constructor() {
    this.elementos = {
      destinoInput: document.getElementById('destino'),
      sugerenciasLista: document.getElementById('sugerencias'),
      loading: document.getElementById('loading'),
      routeInfo: document.getElementById('routeInfo'),
      btnRutaTP10M: document.getElementById('btnRutaTP10M'),
      routeTitle: document.getElementById('routeTitle'),
      routeDescription: document.getElementById('routeDescription'),
      routeOrigin: document.getElementById('routeOrigin'),
      routeDestination: document.getElementById('routeDestination'),
      routeFrequency: document.getElementById('routeFrequency'),
      routeDistance: document.getElementById('routeDistance'),
      routeDuration: document.getElementById('routeDuration')
    };
  }

  mostrarSugerencias(resultados) {
    const lista = this.elementos.sugerenciasLista;
    lista.innerHTML = "";
    
    if (resultados.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No se encontraron resultados. Intenta con otras palabras.";
      lista.appendChild(li);
      return;
    }
    
    resultados.forEach(resultado => {
      const li = document.createElement("li");
      li.textContent = this.formatearNombreLargo(resultado.nombre);
      li.dataset.resultado = JSON.stringify(resultado);
      lista.appendChild(li);
    });
  }

  limpiarSugerencias() {
    this.elementos.sugerenciasLista.innerHTML = "";
  }

  mostrarLoading(mostrar) {
    this.elementos.loading.style.display = mostrar ? 'block' : 'none';
  }

  mostrarPanelRuta() {
    this.elementos.routeInfo.style.display = 'block';
  }

  ocultarPanelRuta() {
    this.elementos.routeInfo.style.display = 'none';
  }

  mostrarInformacionRuta(datos) {
    const {
      titulo,
      descripcion,
      origen,
      destino,
      frecuencia,
      distancia,
      duracion
    } = datos;

    if (titulo) this.elementos.routeTitle.textContent = titulo;
    if (descripcion) this.elementos.routeDescription.textContent = descripcion;
    if (origen) this.elementos.routeOrigin.textContent = origen;
    if (destino) this.elementos.routeDestination.textContent = destino;
    if (frecuencia) this.elementos.routeFrequency.textContent = frecuencia;
    if (distancia) this.elementos.routeDistance.textContent = distancia;
    if (duracion) this.elementos.routeDuration.textContent = duracion;
    
    this.mostrarPanelRuta();
  }

  formatearNombreLargo(nombre, maxLength = 60) {
    return nombre.length > maxLength ? 
      nombre.substring(0, maxLength) + "..." : 
      nombre;
  }

  mostrarError(mensaje) {
    alert(mensaje);
  }

  mostrarAlerta(mensaje) {
    alert(mensaje);
  }

  getValorDestino() {
    return this.elementos.destinoInput.value.trim();
  }

  mostrarBotonTP10M() {
    if (this.elementos.btnRutaTP10M) {
      this.elementos.btnRutaTP10M.style.display = 'block';
    }
  }

  // Para eventos
  agregarEventoInput(callback, delay = 500) {
    let timeout;
    this.elementos.destinoInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      const query = e.target.value.trim();
      
      if (query.length >= 2) {
        timeout = setTimeout(() => {
          callback(query);
        }, delay);
      }
    });
  }

  agregarEventoEnter(callback) {
    this.elementos.destinoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        callback();
      }
    });
  }

  agregarEventoCerrarPanel(callback) {
    const closeBtn = this.elementos.routeInfo?.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', callback);
    }
  }
}

export default UIDestinoService;