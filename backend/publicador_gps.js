const mqtt = require('mqtt');

// 🔐 Credenciales del broker
const options = {
  username: "TU_USUARIO_MQTT", // Reemplaza esto
  password: "TU_CONTRASEÑA_MQTT", // Reemplaza esto
  connectTimeout: 4000,
  reconnectPeriod: 2000,
};

// 🔗 Conexión al broker MQTT
const client = mqtt.connect("wss://8d9a31655be84e56b5601620210f24ac.s1.eu.hivemq.cloud:8884/mqtt", options);

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");

  // Posición inicial
  let lat = 2.436972;
  let lng = -76.613099;

  // Enviar ubicación cada 500 ms
  setInterval(() => {
    // Movimiento simulado
    lat += (Math.random() - 0.5) * 0.0005;
    lng += (Math.random() - 0.5) * 0.0005;

    const data = {
      bus_id: "001",
      lat,
      lng
    };

    client.publish("buses/bus_001", JSON.stringify(data));
    console.log(`📍 Latitud: ${lat.toFixed(5)}, Longitud: ${lng.toFixed(5)}`);
  }, 500);
});

client.on('error', (error) => {
  console.error("❌ Error en la conexión:", error);
});
