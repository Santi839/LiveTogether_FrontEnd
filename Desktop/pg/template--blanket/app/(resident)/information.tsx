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

// La ruta de importación de useAuth (dada en el historial)
import { useAuth } from '../../contexts/AuthContext'; // CORRECCIÓN IMPLICADA POR LA CONVERSACIÓN PREVIA

// Constantes de colores
const ACCENT_COLOR = '#6A87D8';
const MAIN_COLOR = '#001F3F';


// Interface para los datos del usuario
interface UserData {
    nombre_completo: string;
    correo: string;
    numero_apartamento: string;
    torre: string;
    foto: string;
}

const initialUserData: UserData = {
    nombre_completo: '',
    correo: '',
    numero_apartamento: '',
    torre: '',
    foto: '../../assets/images/PROFILE_IMAGE.png',
};

// Componente Tarjeta de Acción 
const ActionCard = ({ iconName, title, onPress }: { iconName: string, title: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <FontAwesome5 name={iconName as any} size={24} color="#001F3F" style={styles.actionIcon} />
        <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
);

// Componente Tarjeta de Navegación
const NavCard = ({ iconName, title, onPress }: { iconName: string, title: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.navCard} onPress={onPress}>
        <FontAwesome5 name={iconName as any} size={40} color="#001F3F" />
        <Text style={styles.navCardTitle}>{title}</Text>
    </TouchableOpacity>
);

// Componente Botón de Cerrar Sesión
const LogoutButton = ({ onLogout }: { onLogout: () => void }) => (
    <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <FontAwesome5 name="sign-out-alt" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
    </TouchableOpacity>
);


export default function InformationScreen() {
    // Obtener la función logout del contexto de autenticación
    const { logout } = useAuth();
    const [userData, setUserData] = useState<UserData>(initialUserData);
    const [loading, setLoading] = useState(true);

    // FUNCIÓN DE CERRAR SESIÓN
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
                            Alert.alert(
                                'Error',
                                'No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.'
                            );
                        }
                    },
                },
            ]
        );
    };

    // Función para cargar los datos del usuario
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // La petición debe tener el token gracias al interceptor de axios-config
                const response = await axios.get('/api/usuarios/');

                if (response.data && response.data.length > 0) {
                    const userData = response.data[0];
                    setUserData({
                        nombre_completo: userData.nombre_completo || '',
                        correo: userData.correo || '',
                        numero_apartamento: userData.numero_apartamento || '',
                        torre: userData.torre || '',
                        foto: userData.foto || '../../assets/images/PROFILE_IMAGE.png'
                    });
                } else {
                    Alert.alert('Sin datos', 'No se encontraron datos del usuario');
                }
            } catch (error: any) {
                // Si la API falla (ej. 401), el interceptor ya habrá limpiado AsyncStorage
                const errorMessage = error.response?.data?.message || 'Error al cargar los datos';
                if (error.response?.status !== 401) {
                    Alert.alert('Error', errorMessage);
                }
                console.error('Error al cargar datos del usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Manejadores de navegación
    const handleEdit = () => alert("Editar Información");
    const handleVisitors = () => alert("Navegar a Visitantes");
    const handleVehicles = () => alert("Navegar a Vehículos");
    
    // RUTA MODIFICADA: Ahora navega a '/(resident)/my_reservations'
    const handleReservations = () => router.push('/(resident)/my_reservations');

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* 1. HEADER */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <FontAwesome5 name="house-user" size={24} color={MAIN_COLOR} />
                        <Text style={styles.logoText}>LIFETOGETHER</Text>
                    </View>
                    <Image
                        source={require('../../assets/images/PROFILE_IMAGE.png')}
                        style={styles.profileImage}
                    />
                </View>

                <View style={styles.paddingContainer}>
                    {/* 2. TÍTULO */}
                    <Text style={styles.mainTitle}>Tu información está aquí</Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={ACCENT_COLOR} />
                            <Text style={styles.loadingText}>Cargando información...</Text>
                        </View>
                    ) : (
                        <>
                            {/* 3. TARJETA DE INFORMACIÓN PERSONAL BÁSICA */}
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Torre:</Text>
                                    <Text style={styles.infoValue}>{userData.torre}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Apartamento:</Text>
                                    <Text style={styles.infoValue}>{userData.numero_apartamento}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Nombre:</Text>
                                    <Text style={styles.infoValue}>{userData.nombre_completo}</Text>
                                </View>
                            </View>

                            {/* 4. TARJETA DE CORREO Y EDICIÓN */}
                            <Text style={styles.sectionTitle}>Información personal</Text>
                            <View style={styles.emailCard}>
                                <Text style={styles.emailLabel}>Correo:</Text>
                                <Text style={styles.emailValue}>{userData.correo}</Text>
                            </View>
                            {/* 5. SECCIÓN DE VISITANTES */}
                            <ActionCard iconName="user-check" title="Visitantes" onPress={handleVisitors} />

                            {/* 6. SECCIÓN DE NAVEGACIÓN */}
                            <View style={styles.navGrid}>
                                <NavCard iconName="car" title="Tus vehículos" onPress={handleVehicles} />
                                <NavCard iconName="calendar-alt" title="Reservaciones" onPress={handleReservations} />
                            </View>

                            {/* 7. BOTÓN DE CERRAR SESIÓN */}
                            <LogoutButton onLogout={handleLogout} />
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    paddingContainer: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: 'white',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: MAIN_COLOR,
        marginLeft: 8,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: ACCENT_COLOR,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MAIN_COLOR,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ACCENT_COLOR,
        marginBottom: 10,
        marginTop: 20,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ACCENT_COLOR,
        width: '40%',
    },
    infoValue: {
        fontSize: 18,
        color: MAIN_COLOR,
        width: '60%',
        textAlign: 'right',
    },
    emailCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    emailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ACCENT_COLOR,
        marginBottom: 5,
    },
    emailValue: {
        fontSize: 16,
        color: MAIN_COLOR,
        marginBottom: 15,
    },
    editButton: {
        backgroundColor: ACCENT_COLOR,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    actionIcon: {
        marginRight: 15,
        color: ACCENT_COLOR,
    },
    actionTitle: {
        fontSize: 20,
        color: MAIN_COLOR,
    },
    navGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    navCard: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        aspectRatio: 1,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    navCardTitle: {
        fontSize: 14,
        color: MAIN_COLOR,
        marginTop: 10,
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D86A6A',
        borderRadius: 8,
        padding: 15,
        marginTop: 30,
        marginBottom: 20,
        elevation: 3,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    loadingText: {
        fontSize: 16,
        color: MAIN_COLOR,
        marginTop: 10,
    },
});