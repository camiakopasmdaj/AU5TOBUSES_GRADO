class FirebaseUsuarioService {
  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCgBbH8LrjYGfCOg8sNBaLvekIbicQu_b0",
      authDomain: "bustrackeriot.firebaseapp.com",
      projectId: "bustrackeriot",
      storageBucket: "bustrackeriot.appspot.com",
      messagingSenderId: "263881969617",
      appId: "1:263881969617:web:5d09d1e49f6711f1461af0"
    };
    
    firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.db = firebase.database();
    this.storage = firebase.storage();
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }

  signOut() {
    return this.auth.signOut();
  }

  // Operaciones CRUD de usuario
  obtenerUsuario(uid) {
    return this.db.ref('usuarios/' + uid).get();
  }

  actualizarUsuario(uid, datos) {
    return this.db.ref('usuarios/' + uid).update(datos);
  }

  crearUsuario(uid, datos) {
    return this.db.ref('usuarios/' + uid).set(datos);
  }

  // Autenticación
  reautenticarUsuario(email, password) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado");
    
    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
    return user.reauthenticateWithCredential(credential);
  }

  actualizarPassword(newPassword) {
    const user = this.auth.currentUser;
    return user.updatePassword(newPassword);
  }
}

export default FirebaseUsuarioService;