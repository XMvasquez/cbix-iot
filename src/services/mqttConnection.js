import mqtt from "mqtt/dist/mqtt";

let mqttClient: mqtt.MqttClient | null = null;
const BROKER_URL: string = "ws://localhost:8083/mqtt";

const mqttConnection = (): mqtt.MqttClient => {
  if (mqttClient == null) {
    const options: mqtt.IClientOptions = {
      clientId: "lc-controller_Client",
    };

    mqttClient = mqtt.connect(BROKER_URL, options);

    mqttClient.on("connect", () => {
      console.log("Conexion exitosa");
    });

    mqttClient.on("error", (error) => {
      console.error("Error en la conexión:", error);
    });
  }

  return mqttClient;
};

export default mqttConnection;
