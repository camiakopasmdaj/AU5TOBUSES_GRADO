class EstadoAdminTrazador {
  constructor() {
    this.tramos = [];
    this.tramoActual = [];
    this.trazandoPuntos = false;
    this.eliminandoPuntos = false;
    this.modoEdicionActivo = false;
  }

  getTramos() {
    return this.tramos;
  }

  setTramos(tramos) {
    this.tramos = tramos;
  }

  getTramoActual() {
    return this.tramoActual;
  }

  setTramoActual(tramo) {
    this.tramoActual = tramo;
  }

  iniciarNuevoTramo() {
    this.tramoActual = [];
    this.tramos.push(this.tramoActual);
  }

  getTrazandoPuntos() {
    return this.trazandoPuntos;
  }

  setTrazandoPuntos(valor) {
    this.trazandoPuntos = valor;
    if (valor && !this.tramoActual) {
      this.iniciarNuevoTramo();
    }
  }

  getEliminandoPuntos() {
    return this.eliminandoPuntos;
  }

  setEliminandoPuntos(valor) {
    this.eliminandoPuntos = valor;
  }

  getModoEdicion() {
    return this.modoEdicionActivo;
  }

  setModoEdicion(valor) {
    this.modoEdicionActivo = valor;
  }

  getAllPuntos() {
    return this.tramos.flat();
  }

  limpiarTodo() {
    this.tramos = [];
    this.tramoActual = [];
  }
}

export default EstadoAdminTrazador;