import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  onValue 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
  authDomain: "bustrackeriot.firebaseapp.com",
  databaseURL: "https://bustrackeriot-default-rtdb.firebaseio.com",
  projectId: "bustrackeriot",
  storageBucket: "bustrackeriot.appspot.com",
  messagingSenderId: "263881969617",
  appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
};

class FirebaseAdminService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
  }

  guardarRuta(nombreRuta, puntos) {
    return set(ref(this.db, 'rutas/' + nombreRuta), puntos);
  }

  cargarRutas(callback) {
    const rutasRef = ref(this.db, 'rutas/');
    onValue(rutasRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });
  }
}

export default FirebaseAdminService;