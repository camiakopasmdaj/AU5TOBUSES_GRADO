class FirebaseDestinoService {
  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
      authDomain: "bustrackeriot.firebaseapp.com",
      databaseURL: "https://bustrackeriot-default-rtdb.firebaseio.com",
      projectId: "bustrackeriot",
      storageBucket: "bustrackeriot.appspot.com",
      messagingSenderId: "263881969617",
      appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
    };

    firebase.initializeApp(firebaseConfig);
    this.database = firebase.database();
  }

  obtenerRutaTP10M() {
    return this.database.ref("rutas/TP10M").once("value");
  }
}

export default FirebaseDestinoService;