import FirebaseUsuarioService from './editor_usuario_firebase.js';
import EstadoUsuarioService from './editor_usuario_estado.js';
import UIUsuarioService from './editor_usuario_ui.js';
import ValidacionUsuarioService from './editor_usuario_validacion.js';

class EditorUsuarioPrincipal {
  constructor() {
    this.firebaseService = new FirebaseUsuarioService();
    this.estadoService = new EstadoUsuarioService();
    this.uiService = new UIUsuarioService();
    this.validacionService = new ValidacionUsuarioService();
    
    this.inicializar();
  }

  inicializar() {
    this.configurarAutenticacion();
    this.configurarEventos();
    this.exponerFuncionesGlobales();
  }

  configurarAutenticacion() {
    this.firebaseService.onAuthStateChanged((user) => {
      if (user) {
        this.estadoService.setUsuario(user);
        this.uiService.mostrarFormularioUsuario();
        this.uiService.actualizarDatosFormulario({ email: user.email });
        this.cargarDatosUsuario(user.uid);
      } else {
        this.estadoService.setUsuario(null);
        this.uiService.ocultarFormularioUsuario();
      }
    });
  }

  configurarEventos() {
    // Evento para cambiar foto de perfil
    const fotoInput = document.getElementById("fotoPerfil");
    if (fotoInput) {
      fotoInput.addEventListener("change", (event) => this.cambiarFotoPerfil(event));
    }

    // Eventos para botones
    const btnCambiarFoto = document.querySelector('button[onclick*="fotoPerfil.click()"]');
    if (btnCambiarFoto) {
      btnCambiarFoto.onclick = null;
      btnCambiarFoto.addEventListener('click', () => this.seleccionarFotoPerfil());
    }

    const btnGuardar = document.querySelector('button[onclick*="guardarCambios()"]');
    if (btnGuardar) {
      btnGuardar.onclick = null;
      btnGuardar.addEventListener('click', () => this.guardarCambios());
    }

    const btnCambiarPassword = document.querySelector('button[onclick*="mostrarCambioContrasena()"]');
    if (btnCambiarPassword) {
      btnCambiarPassword.onclick = null;
      btnCambiarPassword.addEventListener('click', () => this.mostrarCambioContrasena());
    }

    const btnCancelarPassword = document.querySelector('button[onclick*="cancelarCambioContrasena()"]');
    if (btnCancelarPassword) {
      btnCancelarPassword.onclick = null;
      btnCancelarPassword.addEventListener('click', () => this.cancelarCambioContrasena());
    }

    const btnActualizarPassword = document.querySelector('button[onclick*="cambiarContraseña()"]');
    if (btnActualizarPassword) {
      btnActualizarPassword.onclick = null;
      btnActualizarPassword.addEventListener('click', () => this.cambiarContraseña());
    }

    const btnCerrarSesion = document.querySelector('button[onclick*="cerrarSesion()"]');
    if (btnCerrarSesion) {
      btnCerrarSesion.onclick = null;
      btnCerrarSesion.addEventListener('click', () => this.cerrarSesion());
    }

    const btnRegresar = document.querySelector('button[onclick*="regresar()"]');
    if (btnRegresar) {
      btnRegresar.onclick = null;
      btnRegresar.addEventListener('click', () => this.regresar());
    }

    // Eventos para mostrar/ocultar contraseñas
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('toggle-password')) {
        const inputId = event.target.dataset.target;
        this.uiService.togglePasswordVisibility(inputId, event.target);
      }
    });
  }

  async cargarDatosUsuario(uid) {
    try {
      const snapshot = await this.firebaseService.obtenerUsuario(uid);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        this.estadoService.setDatosUsuario(userData);
        
        const datosCompletos = {
          ...userData,
          email: this.firebaseService.getCurrentUser().email
        };
        
        this.uiService.actualizarDatosFormulario(datosCompletos);
      } else {
        // Crear registro de usuario si no existe
        const user = this.firebaseService.getCurrentUser();
        const userData = {
          nombre: user.displayName || '',
          email: user.email,
          rol: 'pasajero',
          fechaCreacion: new Date().toISOString()
        };
        
        await this.firebaseService.crearUsuario(uid, userData);
        this.estadoService.setDatosUsuario(userData);
        this.uiService.mostrarRolUsuario('pasajero');
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      this.uiService.mostrarEstado("Error al cargar datos del usuario", "error");
    }
  }

  seleccionarFotoPerfil() {
    document.getElementById("fotoPerfil").click();
  }

  async cambiarFotoPerfil(event) {
    const file = this.uiService.obtenerFotoSeleccionada();
    
    const validacion = this.validacionService.validarFotoPerfil(file);
    if (!validacion) {
      this.uiService.mostrarEstado(this.validacionService.getErrores()[0], "error");
      return;
    }
    
    try {
      const preview = await this.uiService.mostrarPreviewFoto(file);
      this.estadoService.setNuevaFoto(file);
      this.uiService.mostrarEstado("Foto cargada. Haz clic en 'Guardar Cambios' para guardarla.", "info");
    } catch (error) {
      this.uiService.mostrarEstado(error.message, "error");
    }
  }

  mostrarCambioContrasena() {
    this.uiService.mostrarPasswordFields();
  }

  cancelarCambioContrasena() {
    this.uiService.ocultarPasswordFields();
  }

  async guardarCambios() {
    const datosFormulario = this.uiService.getDatosFormulario();
    const usuario = this.estadoService.getUsuario();
    
    // Validar datos básicos
    const validacion = this.validacionService.validarFormularioCompleto(
      { 
        nombre: datosFormulario.nombre,
        telefono: datosFormulario.telefono,
        email: usuario.email
      }
    );
    
    if (!validacion.valido) {
      this.uiService.mostrarEstado(validacion.errores[0], "error");
      return;
    }
    
    this.uiService.mostrarEstado("Guardando cambios...", "info");
    
    try {
      // Preparar datos para guardar
      const datosParaGuardar = this.estadoService.prepararDatosParaGuardar();
      
      // Si hay nueva foto, procesarla como Base64
      const nuevaFoto = this.estadoService.getNuevaFoto();
      if (nuevaFoto) {
        const reader = new FileReader();
        const fotoBase64 = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error("Error al procesar la imagen"));
          reader.readAsDataURL(nuevaFoto);
        });
        
        datosParaGuardar.fotoPerfil = fotoBase64;
      }
      
      // Guardar en Firebase
      await this.firebaseService.actualizarUsuario(usuario.uid, datosParaGuardar);
      
      // Actualizar estado local
      this.estadoService.setDatosUsuario(datosParaGuardar);
      this.estadoService.limpiarNuevaFoto();
      
      this.uiService.mostrarEstado("Perfil actualizado correctamente", "success");
    } catch (error) {
      console.error("Error al guardar:", error);
      this.uiService.mostrarEstado("Error al guardar: " + error.message, "error");
    }
  }

  async cambiarContraseña() {
    const datosPassword = this.uiService.getDatosFormulario();
    const usuario = this.firebaseService.getCurrentUser();
    
    // Validar datos
    const validacion = this.validacionService.validarCambioPassword(datosPassword);
    if (!validacion) {
      this.uiService.mostrarEstado(this.validacionService.getErrores()[0], "error");
      return;
    }
    
    this.uiService.mostrarEstado("Actualizando contraseña...", "info");
    
    try {
      // Reautenticar y cambiar contraseña
      await this.firebaseService.reautenticarUsuario(usuario.email, datosPassword.currentPassword);
      await this.firebaseService.actualizarPassword(datosPassword.newPassword);
      
      this.uiService.ocultarPasswordFields();
      this.uiService.mostrarEstado("Contraseña actualizada correctamente", "success");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      
      let mensajeError = "Error al cambiar contraseña";
      if (error.code === 'auth/wrong-password') {
        mensajeError = "Contraseña actual incorrecta";
      } else if (error.code === 'auth/requires-recent-login') {
        mensajeError = "Necesitas reautenticarte. Cierra sesión y vuelve a iniciar sesión";
      }
      
      this.uiService.mostrarEstado(mensajeError, "error");
    }
  }

  async cerrarSesion() {
    try {
      await this.firebaseService.signOut();
      window.location.href = '../login/login.html';
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      this.uiService.mostrarEstado("Error al cerrar sesión: " + error.message, "error");
    }
  }

  regresar() {
    window.location.href = '../visor_autobuses/visor_autobuses.html';
  }

  exponerFuncionesGlobales() {
   
    window.togglePasswordVisibility = (inputId, icon) => {
      this.uiService.togglePasswordVisibility(inputId, icon);
    };
  }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  new EditorUsuarioPrincipal();
});