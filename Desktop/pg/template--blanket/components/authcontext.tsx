import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define la interfaz del Contexto
interface AuthContextType {
    token: string | null;
    loading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// Crea el Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto fácilmente
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}

// 🛑 Función auxiliar para limpiar el token de los headers de Axios
const removeAuthToken = () => {
    delete axios.defaults.headers.common['Authorization'];
};

// Proveedor del Contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const segments = useSegments(); 

    // 1. Carga inicial del token al iniciar la app
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (e) {
                console.error('Error al cargar el token inicial:', e);
            } finally {
                setLoading(false);
            }
        };

        loadToken();
    }, []);

    // 2. Navegación automática basada en el estado del token (CRUCIAL)
    useEffect(() => {
        if (loading) return;

        // Comprueba si el usuario está en el grupo de rutas de autenticación (ej: /(auth)/login)
        const inAuthGroup = segments[0] === '(auth)';

        if (token && inAuthGroup) {
            // Usuario logeado, redirigir a la app principal
            router.replace('/(resident)/announcements');
        } else if (!token && !inAuthGroup) {
            // Usuario deslogeado, redirigir a /login
            router.replace('/(auth)/login');
        }
    }, [token, loading, segments]);


    // 3. Función de INICIO de sesión
    const signIn = async (newToken: string) => {
        try {
            await AsyncStorage.setItem('token', newToken);
            setToken(newToken);
            console.log('SignIn completado. Token guardado.');
        } catch (e) {
            console.error('Error durante signIn:', e);
        }
    };

    // 4. Función de CIERRE de sesión (Lógica centralizada)
    const signOut = async () => {
        try {
            // Intenta notificar al backend
            await axios.post('/api/usuarios/logout');
            
        } catch (e: any) {
            console.error('Error al cerrar sesión en el backend. Forzando logout local:', e);
        } finally {
            // Limpieza total del cliente
            await AsyncStorage.removeItem('token');
            removeAuthToken(); 
            // Esto dispara el useEffect de navegación y redirige a /(auth)/login
            setToken(null); 
            console.log('SignOut completado. Estado y almacenamiento limpiados.');
        }
    };

    return (
        <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
