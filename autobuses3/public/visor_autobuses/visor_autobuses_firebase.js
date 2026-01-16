// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
  authDomain: "bustrackeriot.firebaseapp.com",
  databaseURL: "https://bustrackeriot-default-rtdb.firebaseio.com",
  projectId: "bustrackeriot",
  storageBucket: "bustrackeriot.appspot.com",
  messagingSenderId: "263881969617",
  appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();


document.addEventListener('DOMContentLoaded', function() {
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      firebase.auth().signOut()
        .then(() => {
          showAlert('success', 'Sesión cerrada correctamente');
          localStorage.clear();
          sessionStorage.clear();
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        })
        .catch((error) => {
          console.error('Error al cerrar sesión:', error);
          showAlert('error', 'No se pudo cerrar la sesión');
        });
    });
  }
});