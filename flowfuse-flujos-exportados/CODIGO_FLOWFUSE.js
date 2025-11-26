// Código para el nodo Function en FlowFuse/Node-RED
// Este código genera datos simulados de todos los sensores

const temperatura = Math.floor(Math.random() * 15) + 20; // 20-35°C
const latido = Math.floor(Math.random() * 60) + 60; // 60-120 bpm
const movimiento = Math.floor(Math.random() * 2); // 0 o 1
const humedad = Math.floor(Math.random() * 40) + 40; // 40-80%
const depredador = Math.random() > 0.9 ? 1 : 0; // 10% probabilidad de detectar depredador

const timestamp = new Date().toISOString();

msg.payload = {
    fields: {
        valor: { integerValue: temperatura.toString() },
        tipo: { stringValue: "temperatura" },
        latido: { integerValue: latido.toString() },
        movimiento: { integerValue: movimiento.toString() },
        humedad: { integerValue: humedad.toString() },
        depredador: { integerValue: depredador.toString() },
        timestamp: { timestampValue: timestamp }
    }
};

return msg;

