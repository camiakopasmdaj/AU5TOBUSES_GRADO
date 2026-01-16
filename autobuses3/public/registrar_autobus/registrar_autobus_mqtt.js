// Función para conectar a MQTT
async function connectToMQTT() {
  return new Promise((resolve, reject) => {
    client = mqtt.connect("wss://8d9a31655be84e56b5601620210f24ac.s1.eu.hivemq.cloud:8884/mqtt", mqttOptions);

    client.on("connect", () => {
      updateStatus(`Conectado - Bus ID: ${busId}`, "active");
      showSystemNotification(` Conexión establecida para el bus ${busId}`, "success");
      resolve();
    });

    client.on("error", (err) => {
      console.error("Error MQTT:", err);
      updateStatus("Error de conexión MQTT", "error");
      showSystemNotification("Error de conexión MQTT", "error");
      reject(err);
    });
  });
}

// Función para limpiar posición al salir
function limpiarPosicionAlSalir() {
  if (client && client.connected && busId) {
    const payload = JSON.stringify({
      busId: busId,
      status: "offline",
      timestamp: new Date().toISOString()
    });
    client.publish(`buses/${busId}/status`, payload, { qos: 1, retain: true });
    client.publish(`buses/${busId}`, "", { retain: true });
    client.publish(`buses/${busId}/backup`, "", { retain: true });
  }
}