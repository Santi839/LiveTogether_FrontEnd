import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const TOKEN_KEY = '@auth_token';

export const setAuthToken = async (token: string) => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
        console.error('Error guardando el token:', error);
    }
};

export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error obteniendo el token:', error);
        return null;
    }
};

export const removeAuthToken = async () => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
        console.error('Error eliminando el token:', error);
    }
};

export const checkAuth = async () => {
    try {
        const token = await getAuthToken();

        if (!token) {
            throw new Error('No token found');
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Intenta hacer una petición al servidor para validar el token
        await axios.get('/api/usuarios/verify-token/');
        return true;
    } catch (error) {
        await removeAuthToken();
        router.replace('/(auth)/login');
        return false;
    }
};