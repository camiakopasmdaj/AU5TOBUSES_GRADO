import FirebaseRecuperarService from './recuperar_firebase.js';
import ValidacionRecuperarService from './recuperar_validacion.js';
import UIRecuperarService from './recuperar_ui.js';

class RecuperarPrincipal {
  constructor() {
    this.firebaseService = new FirebaseRecuperarService();
    this.validacionService = new ValidacionRecuperarService();
    this.uiService = new UIRecuperarService();
    
    this.inicializar();
  }

  inicializar() {
    this.configurarEventos();
  }

  configurarEventos() {
    this.uiService.configurarEventoClick(() => this.enviarCorreoRecuperacion());
    this.uiService.configurarEventoEnter(() => this.enviarCorreoRecuperacion());
  }

  async enviarCorreoRecuperacion() {
    const email = this.uiService.obtenerEmail();
    
    // Validar email
    const validacion = this.validacionService.validarEmail(email);
    if (!validacion.valido) {
      this.uiService.mostrarNotificacion(validacion.error, "error");
      return;
    }

    try {
      // Mostrar loading
      this.uiService.mostrarLoading();
      
      // Enviar correo de recuperación
      await this.firebaseService.enviarCorreoRecuperacion(email);
      
      // Mostrar mensaje de éxito
      this.uiService.mostrarNotificacion(
        " Te enviamos un correo con el enlace para restablecer tu contraseña.", 
        "success"
      );
      
      // Limpiar formulario
      this.uiService.limpiarFormulario();
      
    } catch (error) {
      console.error("Error al enviar correo:", error);
      
      // Obtener mensaje de error amigable
      const mensajeError = this.validacionService.obtenerMensajeError(error);
      this.uiService.mostrarNotificacion(mensajeError, "error");
      
    } finally {
      // Ocultar loading
      this.uiService.ocultarLoading();
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new RecuperarPrincipal();
});