import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// -----------------------------------------------------------
// 🛑 Funciones de utilidad exportadas para manejo de Token
// -----------------------------------------------------------

/**
 * Elimina el token de Authorization de los headers comunes de Axios.
 * Usado en el proceso de logout.
 */
export const removeAuthToken = () => {
    delete axios.defaults.headers.common['Authorization'];
    console.log('Token de Axios eliminado de los headers comunes.');
};

/**
 * Establece el token de Authorization en los headers comunes de Axios.
 * Puede ser usado en el proceso de login.
 * @param token El token JWT a usar.
 */
export const setAuthToken = (token: string) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        removeAuthToken();
    }
};

// -----------------------------------------------------------
// Configuración y Interceptores de Axios
// -----------------------------------------------------------

// Configurar URL base de la API
axios.defaults.baseURL = 'https://4ldjl2hx-8000.use2.devtunnels.ms'; // URL base proporcionada por el usuario

// Configurar headers por defecto
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Interceptor para las solicitudes (lee el token en cada petición)
axios.interceptors.request.use(
    async (config) => {
        try {
            // Obtener el token desde AsyncStorage
            const token = await AsyncStorage.getItem('token');
            
            // Si existe un token, agregarlo al header de la petición actual
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Token agregado a la petición:', token.substring(0, 15) + '...');
            } else {
                // Asegurarse de que no haya un header Authorization si no hay token
                delete config.headers.Authorization;
                console.log('No hay token disponible, omitiendo header de Authorization.');
            }

            return config;
        } catch (error) {
            console.error('Error en el interceptor de solicitud:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error('Error en la configuración de la solicitud:', error);
        return Promise.reject(error);
    }
);

// Interceptor para las respuestas (maneja errores 401)
axios.interceptors.response.use(
    (response) => {
        console.log('Respuesta exitosa:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    async (error) => {
        console.error('Error en la respuesta:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Si el error es 401 (No autorizado)
        if (error.response?.status === 401) {
            console.log('Error 401 detectado, limpiando sesión en AsyncStorage...');
            try {
                // Solo necesitamos limpiar AsyncStorage, ya que el interceptor de request
                // leerá el valor vacío en la próxima petición.
                await AsyncStorage.removeItem('token');
                
                // Opcionalmente, puedes forzar la redirección aquí si usas un sistema de navegación global.
                // router.replace('/(auth)/login'); 
                
            } catch (storageError) {
                console.error('Error al limpiar el token:', storageError);
            }
        }

        return Promise.reject(error);
    }
);
