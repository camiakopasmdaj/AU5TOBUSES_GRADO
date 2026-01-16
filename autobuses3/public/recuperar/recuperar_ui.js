class UIRecuperarService {
  constructor() {
    this.elementos = {
      emailInput: document.getElementById("emailRecuperar"),
      btnEnviar: document.getElementById("btnEnviarCorreo"),
      notification: document.getElementById("notification")
    };
  }

  mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = this.elementos.notification;
    if (!notification) return;
    
    notification.textContent = mensaje;
    notification.className = `notification ${tipo} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 5000);
  }

  ocultarNotificacion() {
    const notification = this.elementos.notification;
    if (notification) {
      notification.classList.remove('show');
    }
  }

  limpiarFormulario() {
    this.elementos.emailInput.value = "";
  }

  obtenerEmail() {
    return this.elementos.emailInput.value.trim();
  }

  configurarEventoEnter(callback) {
    this.elementos.emailInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        callback();
      }
    });
  }

  configurarEventoClick(callback) {
    this.elementos.btnEnviar.addEventListener("click", callback);
  }

  deshabilitarFormulario() {
    this.elementos.btnEnviar.disabled = true;
    this.elementos.btnEnviar.textContent = "Enviando...";
  }

  habilitarFormulario() {
    this.elementos.btnEnviar.disabled = false;
    this.elementos.btnEnviar.textContent = "Enviar Correo";
  }

  mostrarLoading() {
    this.deshabilitarFormulario();
  }

  ocultarLoading() {
    this.habilitarFormulario();
  }
}

export default UIRecuperarService;