import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

class FirebaseRecuperarService {
  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
      authDomain: "bustrackeriot.firebaseapp.com",
      projectId: "bustrackeriot",
      storageBucket: "bustrackeriot.appspot.com",
      messagingSenderId: "263881969617",
      appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
  }

  async enviarCorreoRecuperacion(email) {
    return await sendPasswordResetEmail(this.auth, email);
  }
}

export default FirebaseRecuperarService;