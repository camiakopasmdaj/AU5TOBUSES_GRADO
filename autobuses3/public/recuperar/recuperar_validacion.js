class ValidacionRecuperarService {
  constructor() {
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  }

  validarEmail(email) {
    if (!email || email.trim() === '') {
      return {
        valido: false,
        error: "Por favor ingresa tu correo electrónico"
      };
    }

    if (!this.emailRegex.test(email)) {
      return {
        valido: false,
        error: "Por favor ingresa un correo electrónico válido"
      };
    }

    return { valido: true };
  }

  obtenerMensajeError(error) {
    const mensajesError = {
      'auth/user-not-found': "❌ No existe una cuenta con este correo electrónico.",
      'auth/invalid-email': "❌ El formato del correo electrónico no es válido.",
      'auth/too-many-requests': "❌ Demasiados intentos. Por favor, espera un momento antes de intentarlo de nuevo.",
      'default': "❌ Error al enviar el correo. Inténtalo de nuevo."
    };

    return mensajesError[error.code] || mensajesError.default;
  }
}

export default ValidacionRecuperarService;