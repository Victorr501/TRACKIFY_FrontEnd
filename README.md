# Trackify Frontend

Trackify Frontend es una aplicación móvil construida con **React Native** y **Expo** que implementa el flujo inicial de autenticación para la plataforma Trackify y la interacción con los servicios de backend ya disponibles.

## Características principales
- ✅ Pantalla de inicio de sesión con campos para correo y contraseña, alternancia de visibilidad para la contraseña y validación básica del email.
- ✅ Formulario de registro con campos para nombre, correo, contraseña y confirmación, todos controlados por estado local y listos para enviar datos reales.
- ✅ Pantalla **Home** que consulta a la API para obtener a la persona usuaria autenticada, muestra un mensaje de bienvenida y permite cerrar sesión limpiando el token almacenado.
- ✅ Navegación basada en stack provista por **@react-navigation/native**, que gestiona la transición entre Login, Registro y Home.
- ✅ Servicios reutilizables con **Axios** y **AsyncStorage** para manejar el token JWT automáticamente en cada petición.

## Requisitos previos
Antes de comenzar asegúrate de contar con:
- [Node.js](https://nodejs.org/) (se recomienda la versión LTS más reciente).
- npm (incluido con Node.js) o [Yarn](https://yarnpkg.com/).
- Expo CLI instalado globalmente (`npm install -g expo-cli`) o utilizar los comandos `npx expo` incluidos en el proyecto.
- Un emulador Android/iOS configurado, o la app **Expo Go** instalada en tu dispositivo móvil para pruebas.

## Instalación y ejecución
1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo de Expo:
   ```bash
   npm start
   ```
   También puedes usar `npm run android`, `npm run ios` o `npm run web` según el destino que prefieras.
3. Sigue las instrucciones que aparecen en la terminal o en la interfaz web de Expo para abrir la app en tu dispositivo o emulador.

## Configuración del backend
- La URL base de la API se define en `src/services/Api.js` (`BASE_URL`). De forma predeterminada está configurada a `http://10.0.2.2:8000`, ideal para pruebas en un emulador Android que consume un backend local.
- Ajusta `BASE_URL` para apuntar al servidor que estés utilizando (por ejemplo, `http://localhost:8000` para web o `https://api.midominio.com` si está desplegado).
- Los tokens de acceso se almacenan en `AsyncStorage` bajo la clave `access_token` y se adjuntan automáticamente a cada petición mediante un interceptor de Axios.

## Flujo de autenticación
1. **Inicio de sesión**: `AuthService.login` envía las credenciales al backend y persiste el `access_token` recibido.
2. **Registro**: `AuthService.register` crea una cuenta nueva, guarda el token retornado y redirige a la pantalla principal.
3. **Sesión activa**: `HomeScreen` consulta `AuthService.getCurrentUser` para mostrar el nombre de la persona usuaria y, si el token es inválido, limpia el estado y redirige al inicio de sesión.
4. **Cerrar sesión**: al presionar el botón de logout se remueve el token del almacenamiento y se navega nuevamente al flujo de autenticación.


## Estructura del proyecto
```
.
├── App.js                # Punto de entrada principal que monta la navegación
├── index.js              # Registro de la app con Expo
├── src
│   ├── navigation
│   │   └── AppNavigator.js   # Configuración del stack de navegación
│   ├── screens
│   │   ├── HomeScreen.js     # Pantalla protegida que muestra la información del usuario
│   │   ├── LoginScreen.js    # UI y estado de la pantalla de inicio de sesión
│   │   └── RegistroScreen.js # UI y estado de la pantalla de registro
│   ├── services
│   │   ├── Api.js            # Instancia de Axios con manejo de tokens mediante interceptores
│   │   └── AuthService.js    # Lógica de autenticación (login, registro, sesión actual, logout)
│   └── utils
│       └── validation.js     # Utilidades reutilizables de validación
└── assets                # Recursos estáticos (iconos, fuentes, etc.)
```

## Scripts disponibles
- `npm start`: Inicia el servidor de desarrollo de Expo.
- `npm run android`: Lanza la aplicación en un emulador o dispositivo Android.
- `npm run ios`: Lanza la aplicación en un simulador de iOS.
- `npm run web`: Ejecuta la aplicación en el navegador.

