import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

import { AuthProvider } from '../contexts/AuthContext';

// Ajusta la ruta si 'utils' está en la raíz del proyecto
import '../utils/axios-config';

// Importar fuentes solo en web
if (Platform.OS === 'web') {
  require('../assets/fonts/fonts.css');
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Solo necesitamos el estado para controlar la inicialización de la pantalla de bienvenida (splash screen)
  const [appInitialized, setAppInitialized] = useState<boolean>(false);

  // 1️⃣ Lógica ÚNICA de Inicialización (Pre-Auth)
  useEffect(() => {
    async function initializeApp() {
      try {
        // Lógica de preparación (ej: cargar fuentes/recursos). 
        // Ya NO se necesita lógica de chequeo de token aquí.

      } catch (e) {
        console.warn('Error durante la inicialización:', e);
      } finally {
        // Marcar la aplicación como inicializada y OCULTAR SPLASH
        setAppInitialized(true);
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, []);

  // 🛑 Lógica de Redirección Manual ELIMINADA:
  // El useEffect basado en 'isAuthenticated' y el estado 'isAuthenticated' 
  // ya no son necesarios porque el AuthProvider lo gestiona internamente.

  // 2️⃣ Renderizado Principal
  // Muestra una pantalla vacía mientras la inicialización de assets está en curso.
  if (!appInitialized) {
    return <Toast />;
  }

  // Una vez inicializado, envolvemos el Stack con el AuthProvider.
  // El AuthProvider cargará el token, gestionará la navegación inicial y renderizará el Stack
  // con la ruta correcta (resident o auth).
  return (
    // 🛑 PASO 2: ENVUELVE TODO EL STACK DENTRO DEL AuthProvider
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </AuthProvider>
  );
}
