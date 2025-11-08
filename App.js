import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator"; 
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {initializeNotifications, getFcmToken, setupTokenRefreshListener, setupForegroundNotificationListener,} from "./src/utils/notifications";


export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token_not = await initializeNotifications();
      console.log("📲 Token Expo obtenido:", token_not);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setIsLogged(false);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          console.log("✅ Token válido, usuario autenticado");
          setIsLogged(true);
        } else {
          console.log("⚠️ Token expirado, cerrando sesión");
          await AsyncStorage.removeItem('access_token');
          setIsLogged(false);
        }
      } catch (err) {
        console.error("Error decodificando token:", err);
        setIsLogged(false);
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator isLogged={isLogged}/>
    </NavigationContainer>
  );
}
