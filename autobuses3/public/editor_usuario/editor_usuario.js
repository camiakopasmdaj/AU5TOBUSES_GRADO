
const firebaseConfig = {
  apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
  authDomain: "bustrackeriot.firebaseapp.com",
  projectId: "bustrackeriot",
  storageBucket: "bustrackeriot.appspot.com",
  messagingSenderId: "263881969617",
  appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

const status = document.getElementById("status");
const userForm = document.getElementById("userForm");
const loginMessage = document.getElementById("loginMessage");
const fullNameInput = document.getElementById("fullName");
const phoneNumberInput = document.getElementById("phoneNumber");
const passwordFields = document.getElementById("passwordFields");
const profileImage = document.getElementById("profileImage");
const roleBadge = document.getElementById("roleBadge");


let nuevaFotoArchivo = null;

// Función para regresar a la página anterior
function regresar() {

  window.location.href = '../visor_autobuses/visor_autobuses.html'; 
}

function updateStatus(msg, type){
  status.style.display="block";
  status.textContent=msg;
  status.className=`status-container status-${type}`;
  setTimeout(()=>{status.style.display="none";},5000);
}

// Función para mostrar/ocultar contraseñas
function togglePasswordVisibility(inputId, icon) {
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

// Mostrar campos para cambiar contraseña
function mostrarCambioContrasena() {
  passwordFields.style.display = 'block';
}

// Cancelar cambio de contraseña
function cancelarCambioContrasena() {
  passwordFields.style.display = 'none';
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

// Cambiar foto de perfil
function cambiarFotoPerfil(event) {
  const file = event.target.files[0];
  if (file) {
    const user = auth.currentUser;
    if (!user) return;
   
    // Validar que sea una imagen
    if (!file.type.match('image.*')) {
      updateStatus("Por favor selecciona una imagen válida", "error");
      return;
    }
   
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
      profileImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
   
    // Guardar el archivo para subirlo después
    nuevaFotoArchivo = file;
   
    updateStatus("Foto cargada. Haz clic en 'Guardar Cambios' para guardarla.", "info");
  }
}

// Función para mostrar el rol del usuario
function mostrarRolUsuario(rol) {
  // Limpiar clases anteriores
  roleBadge.className = 'role-badge';
 
  // Configurar según el rol
  switch(rol) {
    case 'conductor':
      roleBadge.textContent = 'Conductor';
      roleBadge.classList.add('role-conductor');
      break;
    case 'pasajero':
      roleBadge.textContent = 'Pasajero';
      roleBadge.classList.add('role-pasajero');
      break;
    case 'admin':
      roleBadge.textContent = 'Administrador';
      roleBadge.classList.add('role-admin');
      break;
    default:
      roleBadge.textContent = 'Usuario';
      roleBadge.classList.add('role-pasajero');
  }
}

// Cargar datos del usuario
auth.onAuthStateChanged(user=>{
  if(user){
    userForm.style.display="block";
    loginMessage.style.display="none";
    document.getElementById('currentEmail').value=user.email;
   
    // Cargar datos desde Firebase Database
    db.ref('usuarios/'+user.uid).get().then(snapshot=>{
      if(snapshot.exists()){
        const userData = snapshot.val();
        if(userData.nombre) fullNameInput.value = userData.nombre;
        if(userData.telefono) phoneNumberInput.value = userData.telefono;
        if(userData.fotoPerfil) {
          profileImage.src = userData.fotoPerfil;
        } else {
          profileImage.src = "https://via.placeholder.com/120";
        }
     
        // Mostrar el rol del usuario
        if(userData.rol) {
          mostrarRolUsuario(userData.rol);
        } else {
          // Si no hay rol definido, establecer por defecto como pasajero
          mostrarRolUsuario('pasajero');
          // Guardar el rol por defecto en la base de datos
          db.ref('usuarios/'+user.uid).update({rol: 'pasajero'});
        }
      } else {
        // Si no existe el usuario en la base de datos, crear registro con rol por defecto
        const userData = {
          nombre: user.displayName || '',
          email: user.email,
          rol: 'pasajero', // Rol por defecto
          fechaCreacion: new Date().toISOString()
        };
        db.ref('usuarios/'+user.uid).set(userData);
        mostrarRolUsuario('pasajero');
      }
    });
  } else {
    userForm.style.display="none";
    loginMessage.style.display="block";
  }
});

// Función para reautenticar al usuario
function reautenticarUsuario(password) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado");
 
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    password
  );
 
  return user.reauthenticateWithCredential(credential);
}

// Cambiar contraseña
function cambiarContraseña(){
  const user = auth.currentUser;
  if(!user) return updateStatus("No hay usuario autenticado","error");

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validaciones
  if(!currentPassword) return updateStatus("Ingresa tu contraseña actual","error");
  if(!newPassword) return updateStatus("Ingresa la nueva contraseña","error");
  if(newPassword.length < 6) return updateStatus("La contraseña debe tener al menos 6 caracteres","error");
  if(newPassword !== confirmPassword) return updateStatus("Las contraseñas no coinciden","error");

  updateStatus("Actualizando contraseña...", "info");

  // Reautenticar y cambiar contraseña
  reautenticarUsuario(currentPassword)
    .then(() => {
      return user.updatePassword(newPassword);
    })
    .then(() => {
      updateStatus("Contraseña actualizada correctamente","success");
      cancelarCambioContrasena(); // Limpiar campos
    })
    .catch(error => {
      console.error("Error al cambiar contraseña:", error);
      if (error.code === 'auth/wrong-password') {
        updateStatus("Contraseña actual incorrecta","error");
      } else if (error.code === 'auth/requires-recent-login') {
        updateStatus("Necesitas reautenticarte. Cierra sesión y vuelve a iniciar sesión","error");
      } else {
        updateStatus("Error al cambiar contraseña: " + error.message, "error");
      }
    }); // Cierre del .catch
} // Cierre de la función cambiarContraseña


// --- FUNCIONES AÑADIDAS ---

// Función para guardar cambios (Nombre, Teléfono y FOTO DE PERFIL)
// Reemplaza la función guardarCambios con esta versión
function guardarCambios() {
  const user = auth.currentUser;
  if (!user) return updateStatus("No estás autenticado.", "error");

  updateStatus("Guardando cambios...", "info");

  const fullName = fullNameInput.value.trim();
  const phoneNumber = phoneNumberInput.value.trim();

  if (!fullName) {
    updateStatus("Por favor ingresa tu nombre completo", "error");
    return;
  }

  const updates = {
    nombre: fullName,
    telefono: phoneNumber,
    ultimaActualizacion: new Date().toISOString()
  };

  // Si hay una nueva foto, convertir a Base64
  if (nuevaFotoArchivo) {
    updateStatus("Procesando imagen...", "info");
    
    const reader = new FileReader();
    reader.onload = function(e) {
      // Guardar la imagen como Base64 en la base de datos
      updates.fotoPerfil = e.target.result;
      
      // Guardar todo en la base de datos
      guardarEnBaseDeDatos(updates);
    };
    reader.onerror = function() {
      updateStatus("Error al procesar la imagen", "error");
    };
    reader.readAsDataURL(nuevaFotoArchivo);
  } else {
    // Solo guardar datos sin foto nueva
    guardarEnBaseDeDatos(updates);
  }
}

// Función auxiliar para guardar en la base de datos
function guardarEnBaseDeDatos(updates) {
  const user = auth.currentUser;
  
  db.ref('usuarios/' + user.uid).update(updates)
    .then(() => {
      updateStatus("Perfil actualizado correctamente", "success");
      nuevaFotoArchivo = null;
    })
    .catch(error => {
      console.error("Error al guardar:", error);
      updateStatus("Error al guardar: " + error.message, "error");
    });
}

// También modifica la función cambiarFotoPerfil para mejor manejo
function cambiarFotoPerfil(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validar que sea una imagen
  if (!file.type.match('image.*')) {
    updateStatus("Por favor selecciona una imagen válida", "error");
    return;
  }

  // Validar tamaño (máximo 500KB para Base64)
  if (file.size > 500 * 1024) {
    updateStatus("La imagen debe ser menor a 500KB para mejor rendimiento", "error");
    return;
  }

  // Mostrar preview inmediatamente
  const reader = new FileReader();
  reader.onload = function(e) {
    profileImage.src = e.target.result;
    updateStatus("Vista previa actualizada", "info");
  };
  reader.readAsDataURL(file);

  nuevaFotoArchivo = file;
}

// Función para cerrar sesión
function cerrarSesion() {
  auth.signOut()
    .then(() => {
      // Redirigir a la página de inicio de sesión
      window.location.href = 'login.html'; // Asegúrate de que esta sea tu página de login
    })
    .catch(error => {
      console.error("Error al cerrar sesión:", error);
      updateStatus("Error al cerrar sesión: " + error.message, "error");
    });
}

