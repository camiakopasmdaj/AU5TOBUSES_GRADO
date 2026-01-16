class EstadoUsuarioService {
  constructor() {
    this.nuevaFotoArchivo = null;
    this.usuarioActual = null;
    this.datosUsuario = {
      nombre: '',
      telefono: '',
      email: '',
      fotoPerfil: '',
      rol: 'pasajero'
    };
  }

  setNuevaFoto(archivo) {
    this.nuevaFotoArchivo = archivo;
  }

  getNuevaFoto() {
    return this.nuevaFotoArchivo;
  }

  limpiarNuevaFoto() {
    this.nuevaFotoArchivo = null;
  }

  setUsuario(usuario) {
    this.usuarioActual = usuario;
  }

  getUsuario() {
    return this.usuarioActual;
  }

  setDatosUsuario(datos) {
    this.datosUsuario = { ...this.datosUsuario, ...datos };
  }

  getDatosUsuario() {
    return this.datosUsuario;
  }

  actualizarCampo(campo, valor) {
    this.datosUsuario[campo] = valor;
  }

  validarDatosUsuario() {
    const { nombre, email } = this.datosUsuario;
    const errores = [];

    if (!nombre || nombre.trim() === '') {
      errores.push('El nombre completo es requerido');
    }

    if (!email || email.trim() === '') {
      errores.push('El email es requerido');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  validarCambioPassword(datosPassword) {
    const { currentPassword, newPassword, confirmPassword } = datosPassword;
    const errores = [];

    if (!currentPassword) {
      errores.push('Ingresa tu contraseña actual');
    }

    if (!newPassword) {
      errores.push('Ingresa la nueva contraseña');
    } else if (newPassword.length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (newPassword !== confirmPassword) {
      errores.push('Las contraseñas no coinciden');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  prepararDatosParaGuardar() {
    const datos = {
      nombre: this.datosUsuario.nombre.trim(),
      telefono: this.datosUsuario.telefono ? this.datosUsuario.telefono.trim() : '',
      ultimaActualizacion: new Date().toISOString()
    };

    return datos;
  }
}

export default EstadoUsuarioService;