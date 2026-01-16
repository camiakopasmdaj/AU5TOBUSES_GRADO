
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
    import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
      authDomain: "bustrackeriot.firebaseapp.com",
      projectId: "bustrackeriot",
      storageBucket: "bustrackeriot.firebasestorage.app",
      messagingSenderId: "263881969617",
      appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    document.getElementById('btnRegistrar').addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const adminCode = document.getElementById('adminCode').value;
      const mensaje = document.getElementById('mensaje');

      // Mostrar estado de carga
      mensaje.className = "loading";
      mensaje.textContent = "🔄 Creando cuenta...";
      mensaje.style.display = "block";

      // Validación básica
      if (!email || !password) {
        mensaje.className = "error";
        mensaje.textContent = "❌ Por favor completa todos los campos obligatorios";
        return;
      }

      if (password.length < 6) {
        mensaje.className = "error";
        mensaje.textContent = " La contraseña debe tener al menos 6 caracteres";
        return;
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const tipo = (adminCode === "123admin") ? "admin" : "usuario";

        await setDoc(doc(db, "usuarios", cred.user.uid), {
          correo: email,
          tipo: tipo,
          fechaCreacion: new Date()
        });

        mensaje.className = "success";
        mensaje.textContent = `Cuenta registrada como ${tipo}. Redirigiendo...`;
        
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        console.error(error);
        
        mensaje.className = "error";
        
        // Manejo de errores específicos
        switch(error.code) {
          case "auth/email-already-in-use":
            mensaje.textContent = "❌ Este correo electrónico ya está registrado";
            break;
          case "auth/invalid-email":
            mensaje.textContent = "❌ El formato del correo electrónico no es válido";
            break;
          case "auth/weak-password":
            mensaje.textContent = "❌ La contraseña es demasiado débil";
            break;
          default:
            mensaje.textContent = "❌ Error al crear la cuenta: " + error.message;
        }
      }
    });

    // Permitir registro con Enter
    document.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('btnRegistrar').click();
      }
    });
