import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';

// --- Interface y datos iniciales (sin cambios) ---
interface UserData {
    nombre_completo: string;
    correo: string;
    numero_apartamento: string;
    torre: string;
    foto: string;
}

const initialUserData: UserData = {
    nombre_completo: 'Cargando...',
    correo: 'Cargando...',
    numero_apartamento: '...',
    torre: '...',
    foto: '../../assets/images/PROFILE_IMAGE.png',
};

// --- [ACTUALIZADO] Constante de color secundario ---
const SECONDARY_COLOR = '#6A92E5'; // Nuevo color secundario

// --- Componente reutilizable para filas de información y acciones ---
const InfoRow = ({ iconName, label, value, onPress }: { iconName: string, label: string, value?: string, onPress?: () => void }) => {
    const content = (
        <View style={styles.infoRowContent}>
            <FontAwesome5 name={iconName as any} size={20} color={SECONDARY_COLOR} style={styles.infoRowIcon} />
            <View style={styles.infoRowTextContainer}>
                <Text style={styles.infoRowLabel}>{label}</Text>
                {value && <Text style={styles.infoRowValue}>{value}</Text>}
            </View>
            {onPress && <FontAwesome5 name="chevron-right" size={16} color="#CCCCCC" />}
        </View>
    );

    if (onPress) {
        return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
    }
    return <View>{content}</View>;
};


// --- Componente principal de la pantalla ---
export default function InformationScreen() {
    const { logout } = useAuth();
    const [userData, setUserData] = useState<UserData>(initialUserData);
    const [loading, setLoading] = useState(true);

    // --- Lógica de carga de datos y logout (SIN CAMBIOS) ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/usuarios/');

                if (response.data && response.data.length > 0) {
                    const user = response.data[0];
                    setUserData({
                        nombre_completo: user.nombre_completo || '',
                        correo: user.correo || '',
                        numero_apartamento: user.numero_apartamento || '',
                        torre: user.torre || '',
                        foto: user.foto || '../../assets/images/PROFILE_IMAGE.png'
                    });
                } else {
                    Alert.alert('Sin datos', 'No se encontraron datos del usuario');
                }
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    Alert.alert('Error', 'No se pudieron cargar los datos.');
                }
                console.error('Error al cargar datos del usuario:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);
    
    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar la sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar la sesión.');
                        }
                    },
                },
            ]
        );
    };

    const handleVisitors = () => alert("Navegar a Visitantes");
    const handleVehicles = () => alert("Navegar a Vehículos");
    const handleReservations = () => router.push('/(resident)/my_reservations');
    
    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centered]}>
                <ActivityIndicator size="large" color={SECONDARY_COLOR} />
                <Text style={styles.loadingText}>Cargando información...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* 1. Cabecera de Perfil */}
                <View style={styles.profileHeader}>
                    <Image
                        source={require('../../assets/images/PROFILE_IMAGE.png')} // Usar userData.foto cuando funcione la URL
                        style={styles.profileImage}
                    />
                    <Text style={styles.profileName}>{userData.nombre_completo}</Text>
                    <Text style={styles.profileLocation}>
                        Torre {userData.torre} - Apto {userData.numero_apartamento}
                    </Text>
                </View>

                {/* 2. Sección de Información */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mi Cuenta</Text>
                    <View style={styles.infoCard}>
                        <InfoRow iconName="envelope" label="Correo Electrónico" value={userData.correo} />
                        <View style={styles.divider} />
                        <InfoRow iconName="key" label="Cambiar Contraseña" onPress={() => alert('Ir a cambiar contraseña')} />
                    </View>
                </View>

                {/* 3. Sección de Acciones */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acciones</Text>
                    <View style={styles.infoCard}>
                        <InfoRow iconName="user-check" label="Visitantes" onPress={handleVisitors} />
                        <View style={styles.divider} />
                        <InfoRow iconName="car" label="Tus Vehículos" onPress={handleVehicles} />
                        <View style={styles.divider} />
                        <InfoRow iconName="calendar-alt" label="Mis Reservaciones" onPress={handleReservations} />
                    </View>
                </View>

                {/* 4. Botón de Cerrar Sesión */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

// --- [ACTUALIZADOS] Estilos con el nuevo color secundario ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333'
    },
    // --- Cabecera de Perfil ---
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: SECONDARY_COLOR, // Borde de la imagen de perfil con el color secundario
        marginBottom: 15,
    },
    profileName: {
        fontSize: 24,
        fontFamily: 'Raleway-Bold',
        color: '#1A1A1A',
    },
    profileLocation: {
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        color: '#666',
        marginTop: 4,
    },
    // --- Secciones ---
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: SECONDARY_COLOR, // Títulos de sección con el color secundario
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    // --- Fila de Información ---
    infoRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 15,
    },
    infoRowIcon: {
        width: 30,
        textAlign: 'center',
        color: SECONDARY_COLOR, // Íconos de fila con el color secundario
    },
    infoRowTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    infoRowLabel: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: '#333',
    },
    infoRowValue: {
        fontSize: 14,
        fontFamily: 'Raleway-Regular',
        color: '#666',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 15,
    },
    // --- Botón de Cerrar Sesión ---
    logoutButton: {
        borderWidth: 1,
        borderColor: '#E57373', // Un rojo más suave para el borde
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#D32F2F', // Un rojo estándar para el texto
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
    },
});