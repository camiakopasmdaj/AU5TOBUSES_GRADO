class UIAdminTrazador {
  constructor() {
    this.botonesEdicion = document.getElementById('botones-edicion');
    this.btnEditar = document.getElementById('btn-editar');
    this.btnTrazar = document.getElementById('btn-trazar-puntos');
    this.btnEliminar = document.getElementById('btn-eliminar-punto');
    this.mapElement = document.getElementById('map');
  }

  toggleMenuMovil() {
    this.botonesEdicion.classList.toggle('movil-colapsado');
  }

  mostrarBotonesEdicion() {
    this.botonesEdicion.classList.remove('oculto');
    
    if (window.innerWidth <= 768) {
      this.botonesEdicion.classList.remove('movil-colapsado');
    }
  }

  ocultarBotonesEdicion() {
    this.botonesEdicion.classList.add('oculto');
  }

  activarModoTrazado() {
    this.mapElement.classList.add('lapiz');
    this.btnTrazar.classList.replace('btn-info', 'btn-success');
    this.btnEliminar.classList.replace('btn-danger', 'btn-warning');
  }

  desactivarModoTrazado() {
    this.mapElement.classList.remove('lapiz');
    this.btnTrazar.classList.replace('btn-success', 'btn-info');
  }

  activarModoEliminacion() {
    this.btnEliminar.classList.replace('btn-warning', 'btn-danger');
    this.btnTrazar.classList.replace('btn-success', 'btn-info');
  }

  desactivarModoEliminacion() {
    this.btnEliminar.classList.replace('btn-danger', 'btn-warning');
  }

  actualizarBotonEditar(modoActivo) {
    if (modoActivo) {
      this.btnEditar.classList.replace('btn-primary', 'btn-success');
      this.btnEditar.innerHTML = ' Guardar y Salir';
    } else {
      this.btnEditar.classList.replace('btn-success', 'btn-primary');
      this.btnEditar.innerHTML = ' Editar';
    }
  }

  mostrarAlerta(mensaje) {
    alert(mensaje);
  }

  confirmar(mensaje) {
    return confirm(mensaje);
  }

  pedirNombreRuta(valorPredeterminado = "Ruta Principal") {
    return prompt("Nombre de la ruta:", valorPredeterminado);
  }
}

export default UIAdminTrazador;