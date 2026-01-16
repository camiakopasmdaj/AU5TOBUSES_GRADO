class BusquedaDestinosService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org/search';
  }

  async buscarDestinos(query) {
    if (!query || query.trim().length < 2) {
      throw new Error("Escribe al menos 2 caracteres para buscar.");
    }

    const url = `${this.baseUrl}?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(query + ', Popayán, Colombia')}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        return [];
      }

      return data.slice(0, 5).map(item => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        nombre: item.display_name,
        datosCompletos: item
      }));
    } catch (error) {
      console.error("Error en búsqueda:", error);
      throw error;
    }
  }

  formatearNombreLargo(nombre, maxLength = 60) {
    return nombre.length > maxLength ? 
      nombre.substring(0, maxLength) + "..." : 
      nombre;
  }
}

export default BusquedaDestinosService;