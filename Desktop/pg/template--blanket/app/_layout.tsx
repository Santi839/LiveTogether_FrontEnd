// app/_layout.tsx

import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

// --- NUEVAS IMPORTACIONES ---
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
// --- FIN NUEVAS IMPORTACIONES ---

// Previene que la pantalla de inicio se oculte antes de cargar las fuentes
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    
    // --- NUEVO CÓDIGO PARA CARGAR FUENTES ---
    const [fontsLoaded, fontError] = useFonts({
        // La ruta '../' sube de 'app/' a la carpeta raíz (donde está 'assets')
        'Raleway-Regular': require('../assets/fonts/static/Raleway-Regular.ttf'),
        'Raleway-Bold': require('../assets/fonts/static/Raleway-Bold.ttf'),
    });

    useEffect(() => {
        // Oculta la pantalla de inicio cuando las fuentes están listas (o si hay un error)
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    // Si las fuentes no están cargadas o hay un error, no renderices nada
    if (!fontsLoaded && !fontError) {
        return null;
    }
    // --- FIN NUEVO CÓDIGO ---

    // Tu código original: se ejecuta DESPUÉS de que las fuentes cargan
    return (
        <AuthProvider>
            {/* Slot renderiza la pantalla/layout actual (ej: 'index' o '(resident)') */}
            <Slot /> 
        </AuthProvider>
    );
}
