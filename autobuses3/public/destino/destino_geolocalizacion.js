class GeolocalizacionService {
  constructor() {
    this.ubicacionUsuario = null;
  }

  obtenerUbicacion() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La geolocalización no es soportada por este navegador."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          this.ubicacionUsuario = [latitude, longitude];
          resolve(this.ubicacionUsuario);
        },
        (err) => {
          console.error("No se pudo obtener la ubicación:", err);
          // Ubicación por defecto (Popayán)
          this.ubicacionUsuario = [2.4382, -76.6131];
          resolve(this.ubicacionUsuario);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  getUbicacion() {
    return this.ubicacionUsuario;
  }

  setUbicacion(ubicacion) {
    this.ubicacionUsuario = ubicacion;
  }

  static calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default GeolocalizacionService;