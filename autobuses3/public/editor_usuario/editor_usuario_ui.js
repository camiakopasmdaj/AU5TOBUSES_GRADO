class UIUsuarioService {
  constructor() {
    this.elementos = {
      status: document.getElementById("status"),
      userForm: document.getElementById("userForm"),
      loginMessage: document.getElementById("loginMessage"),
      fullNameInput: document.getElementById("fullName"),
      phoneNumberInput: document.getElementById("phoneNumber"),
      passwordFields: document.getElementById("passwordFields"),
      profileImage: document.getElementById("profileImage"),
      roleBadge: document.getElementById("roleBadge"),
      currentEmail: document.getElementById("currentEmail"),
      currentPassword: document.getElementById("currentPassword"),
      newPassword: document.getElementById("newPassword"),
      confirmPassword: document.getElementById("confirmPassword"),
      fotoPerfilInput: document.getElementById("fotoPerfil")
    };
  }

  mostrarEstado(mensaje, tipo) {
    const status = this.elementos.status;
    status.style.display = "block";
    status.textContent = mensaje;
    status.className = `status-container status-${tipo}`;
    
    setTimeout(() => {
      status.style.display = "none";
    }, 5000);
  }

  togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }

  mostrarPasswordFields() {
    this.elementos.passwordFields.style.display = 'block';
  }

  ocultarPasswordFields() {
    this.elementos.passwordFields.style.display = 'none';
    this.limpiarCamposPassword();
  }

  limpiarCamposPassword() {
    this.elementos.currentPassword.value = '';
    this.elementos.newPassword.value = '';
    this.elementos.confirmPassword.value = '';
  }

  actualizarFotoPerfil(src) {
    this.elementos.profileImage.src = src || "https://via.placeholder.com/120";
  }

  mostrarRolUsuario(rol) {
    const roleBadge = this.elementos.roleBadge;
    
    // Limpiar clases anteriores
    roleBadge.className = 'role-badge';
    
    // Configurar según el rol
    const configuracionRoles = {
      'conductor': { texto: 'Conductor', clase: 'role-conductor' },
      'pasajero': { texto: 'Pasajero', clase: 'role-pasajero' },
      'admin': { texto: 'Administrador', clase: 'role-admin' },
      'default': { texto: 'Usuario', clase: 'role-pasajero' }
    };
    
    const config = configuracionRoles[rol] || configuracionRoles.default;
    roleBadge.textContent = config.texto;
    roleBadge.classList.add(config.clase);
  }

  mostrarFormularioUsuario() {
    this.elementos.userForm.style.display = "block";
    this.elementos.loginMessage.style.display = "none";
  }

  ocultarFormularioUsuario() {
    this.elementos.userForm.style.display = "none";
    this.elementos.loginMessage.style.display = "block";
  }

  actualizarDatosFormulario(datos) {
    if (datos.nombre) {
      this.elementos.fullNameInput.value = datos.nombre;
    }
    
    if (datos.telefono) {
      this.elementos.phoneNumberInput.value = datos.telefono;
    }
    
    if (datos.email) {
      this.elementos.currentEmail.value = datos.email;
    }
    
    if (datos.fotoPerfil) {
      this.actualizarFotoPerfil(datos.fotoPerfil);
    }
    
    if (datos.rol) {
      this.mostrarRolUsuario(datos.rol);
    }
  }

  getDatosFormulario() {
    return {
      nombre: this.elementos.fullNameInput.value.trim(),
      telefono: this.elementos.phoneNumberInput.value.trim(),
      currentPassword: this.elementos.currentPassword.value,
      newPassword: this.elementos.newPassword.value,
      confirmPassword: this.elementos.confirmPassword.value
    };
  }

  obtenerFotoSeleccionada() {
    const fileInput = this.elementos.fotoPerfilInput;
    return fileInput.files[0];
  }

  mostrarPreviewFoto(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No hay archivo seleccionado"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.actualizarFotoPerfil(e.target.result);
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"));
      };
      reader.readAsDataURL(file);
    });
  }

  validarArchivoImagen(file) {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
    const tamañoMaximo = 500 * 1024; // 500KB

    if (!tiposPermitidos.includes(file.type)) {
      return {
        valido: false,
        error: "Por favor selecciona una imagen válida (JPEG, PNG, GIF)"
      };
    }

    if (file.size > tamañoMaximo) {
      return {
        valido: false,
        error: "La imagen debe ser menor a 500KB para mejor rendimiento"
      };
    }

    return { valido: true };
  }
}

export default UIUsuarioService;