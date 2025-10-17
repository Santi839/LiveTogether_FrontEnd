import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    userRole: string | null;
    login: (token: string, role: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const role = await AsyncStorage.getItem('userRole');

            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setIsAuthenticated(true);
                setUserRole(role);
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setIsAuthenticated(false);
            setUserRole(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (token: string, role: string) => {
        try {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userRole', role);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
            setUserRole(role);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Primero intentamos hacer logout en el backend
            try {
                await axios.post('/api/usuarios/logout/', {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
            } catch (apiError) {
                console.error('Error al hacer logout en el backend:', apiError);
                // Continuamos con el logout local incluso si falla el backend
            }

            // Limpiamos el almacenamiento local
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userRole');

            // Limpiamos los headers de axios
            delete axios.defaults.headers.common['Authorization'];

            // Actualizamos el estado
            setIsAuthenticated(false);
            setUserRole(null);

            // Redirigimos al login
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            loading,
            userRole,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}