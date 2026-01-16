
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
    import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

    // Configuración Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
      authDomain: "bustrackeriot.firebaseapp.com",
      projectId: "bustrackeriot",
      storageBucket: "bustrackeriot.appspot.com",
      messagingSenderId: "263881969617",
      appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification ${type} show`;
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 5000);
    }

    document.getElementById("btnEnviarCorreo").addEventListener("click", async () => {
      const email = document.getElementById("emailRecuperar").value;
      if (!email) {
        showNotification("Por favor ingresa tu correo electrónico", "error");
        return;
      }

      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification("Por favor ingresa un correo electrónico válido", "error");
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        showNotification("📩 Te enviamos un correo con el enlace para restablecer tu contraseña.", "success");
        
        // Limpiar campo después de enviar
        document.getElementById("emailRecuperar").value = "";
      } catch (error) {
        console.error(error);
        
        // Mensajes de error más específicos
        let errorMessage = "❌ Error al enviar el correo. Inténtalo de nuevo.";
        if (error.code === 'auth/user-not-found') {
          errorMessage = "❌ No existe una cuenta con este correo electrónico.";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "❌ El formato del correo electrónico no es válido.";
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = "❌ Demasiados intentos. Por favor, espera un momento antes de intentarlo de nuevo.";
        }
        
        showNotification(errorMessage, "error");
      }
    });

    // Agregar funcionalidad para presionar Enter
    document.getElementById("emailRecuperar").addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        document.getElementById("btnEnviarCorreo").click();
      }
    });
 