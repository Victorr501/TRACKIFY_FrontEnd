# Trackify Frontend

Trackify Frontend es una aplicación móvil construida con **React Native** y **Expo** que proporciona las pantallas iniciales del flujo de autenticación para la plataforma Trackify. Actualmente el proyecto incluye la navegación entre una pantalla de inicio de sesión y un formulario de registro, listos para conectarse a servicios de backend.

## Características principales
- ✅ Pantalla de inicio de sesión con campos para correo y contraseña, incluyendo alternancia de visibilidad para la contraseña.
- ✅ Enlace rápido hacia el formulario de registro para nuevas personas usuarias.
- ✅ Formulario de registro con campos para nombre, correo, contraseña y confirmación, todos con control de estado local.
- ✅ Navegación basada en stack provista por **@react-navigation/native**.

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

## Estructura del proyecto
```
.
├── App.js                # Punto de entrada principal que monta la navegación
├── index.js              # Registro de la app con Expo
├── src
│   ├── navigation
│   │   └── AppNavigator.js   # Configuración del stack de navegación
│   └── screens
│       ├── LoginScreen.js    # UI y estado de la pantalla de inicio de sesión
│       └── RegistroScreen.js # UI y estado de la pantalla de registro
└── assets                # Recursos estáticos (iconos, fuentes, etc.)
```

## Scripts disponibles
- `npm start`: Inicia el servidor de desarrollo de Expo.
- `npm run android`: Lanza la aplicación en un emulador o dispositivo Android.
- `npm run ios`: Lanza la aplicación en un simulador de iOS.
- `npm run web`: Ejecuta la aplicación en el navegador.

