import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
// [ACTUALIZADO] Importamos router y useRouter
import { router, useRouter } from 'expo-router'; 
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    StatusBar,
    Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import '../../utils/axios-config';

// --- Constantes ---
const ACCENT_COLOR = '#6A87D8';
const LIGHT_BG = '#F7F7F7';
const TEXT_COLOR_DARK = '#1A1A1A';
const TEXT_COLOR_MEDIUM = '#666';

// --- Interface (sin cambios) ---
interface Reservation {
    id: number;
    id_usuario: number;
    id_espacio: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;
    nombre_espacio: string;
    nombre_usuario: string;
    apartamento_usuario: string;
    cantidad_personas: number;
}

// --- Estilos de Estado (sin cambios) ---
const getStatusStyles = (estado: string) => {
    switch (estado.toLowerCase()) {
        case 'aprobada':
            return { backgroundColor: '#E6F4E7', color: '#006400' };
        case 'pendiente':
            return { backgroundColor: '#FFF8E1', color: '#E6A700' };
        case 'rechazada':
            return { backgroundColor: '#FDE8E8', color: '#D32F2F' };
        default:
            return { backgroundColor: '#F0F0F0', color: '#666' };
    }
};

// --- Componente Modal (sin cambios) ---
interface ReservationDetailModalProps {
    visible: boolean;
    onClose: () => void;
    reservation: Reservation | null;
}

const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({ visible, onClose, reservation }) => {
    if (!reservation) return null;
    const statusStyle = getStatusStyles(reservation.estado);
    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <View style={modalStyles.modalHeader}>
                        <Text style={modalStyles.modalTitle}>Detalles de la Reserva</Text>
                        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                            <FontAwesome5 name="times" size={24} color={TEXT_COLOR_MEDIUM} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={modalStyles.modalContent}>
                        {/* Contenido del modal... */}
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="space-shuttle" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Espacio:</Text>
                            <Text style={modalStyles.detailValue}>{reservation.nombre_espacio}</Text>
                        </View>
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="calendar-alt" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Fecha:</Text>
                            <Text style={modalStyles.detailValue}>{formatDate(reservation.fecha)}</Text>
                        </View>
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="clock" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Horario:</Text>
                            <Text style={modalStyles.detailValue}>
                                {reservation.hora_inicio.substring(0, 5)} - {reservation.hora_fin.substring(0, 5)}
                            </Text>
                        </View>
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="users" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Personas:</Text>
                            <Text style={modalStyles.detailValue}>{reservation.cantidad_personas}</Text>
                        </View>
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="check-circle" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Estado:</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, marginLeft: 5 }]}>
                                <Text style={[styles.statusText, { color: statusStyle.color }]}>{reservation.estado}</Text>
                            </View>
                        </View>
                        {reservation.nombre_usuario && (
                            <View style={modalStyles.detailRow}>
                                <FontAwesome5 name="user" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                                <Text style={modalStyles.detailLabel}>Usuario:</Text>
                                <Text style={modalStyles.detailValue}>{reservation.nombre_usuario}</Text>
                            </View>
                        )}
                        {reservation.apartamento_usuario && (
                            <View style={modalStyles.detailRow}>
                                <FontAwesome5 name="building" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                                <Text style={modalStyles.detailLabel}>Apto.:</Text>
                                <Text style={modalStyles.detailValue}>{reservation.apartamento_usuario}</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// --- Componente de Tarjeta (sin cambios) ---
interface ReservationCardProps {
    reservation: Reservation;
    onPressDetails: (reservation: Reservation) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onPressDetails }) => {
    const statusStyle = getStatusStyles(reservation.estado);
    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.spaceName}>{reservation.nombre_espacio}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{reservation.estado}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <FontAwesome5 name="calendar" size={16} color={ACCENT_COLOR} />
                    <Text style={styles.infoText}>{formatDate(reservation.fecha)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <FontAwesome5 name="clock" size={16} color={ACCENT_COLOR} />
                    <Text style={styles.infoText}>
                        {reservation.hora_inicio.substring(0, 5)} - {reservation.hora_fin.substring(0, 5)}
                    </Text>
                </View>
                {reservation.cantidad_personas > 0 && (
                    <View style={styles.infoRow}>
                        <FontAwesome5 name="users" size={16} color={ACCENT_COLOR} />
                        <Text style={styles.infoText}>{reservation.cantidad_personas} personas</Text>
                    </View>
                )}
            </View>
            <TouchableOpacity style={styles.detailsButton} onPress={() => onPressDetails(reservation)}>
                <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                <FontAwesome5 name="chevron-right" size={12} color={ACCENT_COLOR} />
            </TouchableOpacity>
        </View>
    );
};

// --- Pantalla Principal (Modificada) ---
export default function MyReservationsScreen() {
    // [NUEVO] Instancia de useRouter
    const router = useRouter(); 

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    // --- Lógica de Fetching (sin cambios) ---
    const fetchReservations = async () => {
        try {
            const response = await axios.get('/api/reservas/');
            setReservations(response.data);
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudieron cargar las reservas'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchReservations();
    }, []);

    // --- Funciones del Modal (sin cambios) ---
    const handleOpenDetails = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setIsModalVisible(true);
    };

    const handleCloseDetails = () => {
        setIsModalVisible(false);
        setSelectedReservation(null);
    };

    // --- Estado de Carga (sin cambios) ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT_COLOR} />
                <Text style={styles.loadingText}>Cargando reservas...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* [ACTUALIZADO] Encabezado con botón de volver */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.push('/(resident)/information')} 
                    style={styles.backButton}
                >
                    <FontAwesome5 name="chevron-left" size={18} color={ACCENT_COLOR} />
                </TouchableOpacity>
                <Text style={styles.mainTitle}>Mis Reservas</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ACCENT_COLOR]} />
                }
            >
                {reservations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <FontAwesome5 name="calendar-times" size={50} color={ACCENT_COLOR} />
                        <Text style={styles.emptyText}>No tienes reservas activas</Text>
                        <TouchableOpacity
                            style={styles.createReservationButton}
                            onPress={() => router.push('/(resident)/reservations')}
                        >
                            <Text style={styles.createReservationText}>Crear una reserva</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    reservations.map((reservation) => (
                        <ReservationCard 
                            key={reservation.id} 
                            reservation={reservation} 
                            onPressDetails={handleOpenDetails}
                        />
                    ))
                )}
            </ScrollView>
            <Toast />

            <ReservationDetailModal
                visible={isModalVisible}
                onClose={handleCloseDetails}
                reservation={selectedReservation}
            />
        </SafeAreaView>
    );
}

// --- [ACTUALIZADO] Hoja de Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },
    // [ACTUALIZADO] Estilos del encabezado
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: LIGHT_BG,
    },
    backButton: {
        padding: 10,
        marginRight: 5, // Espacio entre el botón y el título
    },
    mainTitle: {
        fontSize: 32,
        fontFamily: 'Raleway-Bold',
        color: TEXT_COLOR_DARK,
    },
    // --- Fin de estilos de encabezado ---
    scrollContent: {
        padding: 20,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: LIGHT_BG,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR_DARK,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    spaceName: {
        fontSize: 20,
        fontFamily: 'Raleway-Bold',
        color: ACCENT_COLOR,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Raleway-Bold',
        textTransform: 'capitalize',
    },
    cardContent: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 15,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR_MEDIUM,
    },
    detailsButton: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: ACCENT_COLOR,
    },
    detailsButtonText: {
        color: ACCENT_COLOR,
        fontSize: 14,
        fontFamily: 'Raleway-Bold',
        marginRight: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR_MEDIUM,
        marginTop: 16,
        marginBottom: 24,
    },
    createReservationButton: {
        backgroundColor: ACCENT_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    createReservationText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
    },
});

// --- Estilos del Modal (sin cambios) ---
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Raleway-Bold',
        color: TEXT_COLOR_DARK,
    },
    closeButton: {
        padding: 5,
    },
    modalContent: {
        width: '100%',
        paddingBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    detailIcon: {
        marginRight: 15,
        width: 20,
        textAlign: 'center',
    },
    detailLabel: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: TEXT_COLOR_DARK,
        width: 80,
    },
    detailValue: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR_MEDIUM,
    },
});