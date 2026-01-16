
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
    const db = firebase.firestore();
    
    // Configurar proveedor de Google
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // Función para iniciar sesión con Google
    function iniciarSesionGoogle() {
      const mensaje = document.getElementById("mensaje");
      
      // Mostrar estado de carga
      mensaje.className = "loading";
      mensaje.textContent = "🔄 Conectando con Google...";
      
      // Forzar reflow/repaint para asegurar que se muestre
      void mensaje.offsetWidth;
      
      // Pequeño retardo para asegurar que el mensaje se renderice
      setTimeout(() => {
        auth.signInWithPopup(provider)
          .then((result) => {
            // El usuario ha iniciado sesión correctamente
            const user = result.user;
            const uid = user.uid;
            
            // Verificar si el usuario ya existe en Firestore
            db.collection("usuarios").doc(uid).get()
              .then((doc) => {
                if (doc.exists) {
                  // El usuario existe, redirigir según su tipo
                  const tipo = doc.data().tipo;
                  mensaje.className = "success";
                  mensaje.textContent = "✅ Inicio de sesión exitoso. Redirigiendo...";
                  
                  setTimeout(() => {
                    window.location.href = tipo === "admin" 
                      ? "registrar_autobus.html" 
                      : "visor_autobuses.html";
                  }, 1500);
                } else {
                  // El usuario no existe en Firestore, crear nuevo registro
                  const nuevoUsuario = {
                    email: user.email,
                    nombre: user.displayName,
                    tipo: "usuario", // Tipo por defecto
                    fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                  };
                  
                  db.collection("usuarios").doc(uid).set(nuevoUsuario)
                    .then(() => {
                      mensaje.className = "success";
                      mensaje.textContent = "✅ Cuenta creada y sesión iniciada. Redirigiendo...";
                      
                      setTimeout(() => {
                        window.location.href = "visor_autobuses.html";
                      }, 1500);
                    })
                    .catch((error) => {
                      mensaje.className = "error";
                      mensaje.textContent = "❌ Error al crear el perfil: " + error.message;
                    });
                }
              })
              .catch((error) => {
                mensaje.className = "error";
                mensaje.textContent = "❌ Error consultando la base de datos: " + error.message;
              });
          })
          .catch((error) => {
            mensaje.className = "error";
            
            // Manejar errores
            if (error.code === 'auth/popup-closed-by-user') {
              mensaje.textContent = "❌ El popup de autenticación fue cerrado";
            } else {
              mensaje.textContent = "❌ Error al iniciar sesión con Google: " + error.message;
            }
          });
      }, 50);
    }

    function iniciarSesion() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const mensaje = document.getElementById("mensaje");
      
      // Mostrar estado de carga inmediatamente
      mensaje.className = "loading";
      mensaje.textContent = "🔄 Verificando credenciales...";
      
      // Forzar reflow/repaint para asegurar que se muestre
      void mensaje.offsetWidth;
      
      // Pequeño retardo para asegurar que el mensaje se renderice
      setTimeout(() => {
        // Validación básica
        if (!email || !password) {
          mensaje.className = "error";
          mensaje.textContent = "❌ Por favor completa todos los campos";
          return;
        }

        auth.signInWithEmailAndPassword(email, password)
          .then((cred) => {
            const uid = cred.user.uid;

            const unsubscribe = db.collection("usuarios").doc(uid)
              .onSnapshot((doc) => {
                unsubscribe();

                if (doc.exists) {
                  const tipo = doc.data().tipo;
                  mensaje.className = "success";
                  mensaje.textContent = "✅ Inicio de sesión exitoso. Redirigiendo...";
                  
                  setTimeout(() => {
                    window.location.href = tipo === "admin" 
                      ? "../registrar_autobus/registrar_autobus.html" 
                      : "../visor_autobuses/visor_autobuses.html";
                  }, 1500);
                } else {
                  mensaje.className = "error";
                  mensaje.textContent = "❌ No se encontró el perfil del usuario.";
                }
              }, (error) => {
                mensaje.className = "error";
                mensaje.textContent = "❌ Error consultando la base de datos: " + error.message;
              });
          })
          .catch((error) => {
            mensaje.className = "error";
            
            switch(error.code) {
              case "auth/user-not-found":
                mensaje.textContent = "❌ No existe una cuenta con este correo";
                break;
              case "auth/wrong-password":
                mensaje.textContent = "❌ Contraseña incorrecta";
                break;
              case "auth/too-many-requests":
                mensaje.textContent = "❌ Demasiados intentos. Intenta más tarde";
                break;
              default:
                mensaje.textContent = "❌ Error al iniciar sesión: " + error.message;
            }
          });
      }, 50);
    }

    // Permitir login con Enter
    document.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        iniciarSesion();
      }
    });
