class ValidacionUsuarioService {
  constructor() {
    this.errores = [];
  }

  limpiarErrores() {
    this.errores = [];
  }

  getErrores() {
    return this.errores;
  }

  tieneErrores() {
    return this.errores.length > 0;
  }

  // Validaciones de datos básicos
  validarNombre(nombre) {
    if (!nombre || nombre.trim() === '') {
      this.errores.push('El nombre completo es requerido');
      return false;
    }

    if (nombre.length < 2) {
      this.errores.push('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    if (nombre.length > 100) {
      this.errores.push('El nombre no puede exceder los 100 caracteres');
      return false;
    }

    return true;
  }

  validarTelefono(telefono) {
    if (!telefono) return true; // Teléfono es opcional

    const telefonoLimpio = telefono.replace(/\D/g, '');
    
    if (telefonoLimpio.length < 7) {
      this.errores.push('El teléfono debe tener al menos 7 dígitos');
      return false;
    }

    if (telefonoLimpio.length > 15) {
      this.errores.push('El teléfono no puede exceder los 15 dígitos');
      return false;
    }

    return true;
  }

  validarEmail(email) {
    if (!email || email.trim() === '') {
      this.errores.push('El email es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errores.push('Por favor ingresa un email válido');
      return false;
    }

    return true;
  }

  validarCambioPassword(datosPassword) {
    const { currentPassword, newPassword, confirmPassword } = datosPassword;
    let valido = true;

    if (!currentPassword) {
      this.errores.push('Ingresa tu contraseña actual');
      valido = false;
    }

    if (!newPassword) {
      this.errores.push('Ingresa la nueva contraseña');
      valido = false;
    } else if (newPassword.length < 6) {
      this.errores.push('La contraseña debe tener al menos 6 caracteres');
      valido = false;
    }

    if (newPassword !== confirmPassword) {
      this.errores.push('Las contraseñas no coinciden');
      valido = false;
    }

    return valido;
  }

  validarFotoPerfil(file) {
    if (!file) return true; // No es obligatorio subir foto

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
    const tamañoMaximo = 500 * 1024; // 500KB

    if (!tiposPermitidos.includes(file.type)) {
      this.errores.push('Solo se permiten imágenes (JPEG, PNG, GIF)');
      return false;
    }

    if (file.size > tamañoMaximo) {
      this.errores.push('La imagen debe ser menor a 500KB');
      return false;
    }

    return true;
  }

  // Validación completa del formulario
  validarFormularioCompleto(datosUsuario, incluirPassword = false, datosPassword = {}) {
    this.limpiarErrores();

    this.validarNombre(datosUsuario.nombre);
    this.validarTelefono(datosUsuario.telefono);
    this.validarEmail(datosUsuario.email);

    if (incluirPassword) {
      this.validarCambioPassword(datosPassword);
    }

    return {
      valido: !this.tieneErrores(),
      errores: [...this.errores]
    };
  }
}

export default ValidacionUsuarioService;