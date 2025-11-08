import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/Api"; // ajusta la ruta si tu Api.js está en otro sitio

const EXPO_PUSH_TOKEN_KEY = "expo_push_token";

/**
 * Configuración general de cómo se muestran las notificaciones
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pide permisos y obtiene el token de notificaciones Expo
 */
export async function getPushToken() {
  try {
    if (!Device.isDevice) {
      console.log("❌ Las notificaciones solo funcionan en un dispositivo físico");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("⚠️ Permisos de notificación no concedidos");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log("🔑 Expo Push Token:", token);

    await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.error("Error obteniendo token Expo:", error);
    return null;
  }
}

/**
 * Escucha notificaciones cuando llegan con la app abierta
 */
export function setupNotificationListeners() {
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log("📩 Notificación recibida:", notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("👆 Usuario tocó la notificación:", response);
  });

  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

/**
 * Inicializa todo el sistema de notificaciones
 */
export async function initializeNotifications() {
  console.log("🔔 Inicializando notificaciones Expo...");
  const token = await getPushToken();
  setupNotificationListeners();
  return token;
}
