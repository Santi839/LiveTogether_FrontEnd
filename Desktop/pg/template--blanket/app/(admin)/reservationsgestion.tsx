import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, // Usamos FlatList para mejor rendimiento en listas grandes
    TouchableOpacity, 
    Alert, 
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Modal,
    ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// --- Dependencias simuladas ---
// En una app Expo real, necesitarías:
// import { router, useRouter } from 'expo-router'; 
// import axios from 'axios';
// import Toast from 'react-native-toast-message';

// --- Constantes de Diseño (Copiadas del estilo deseado) ---
const ACCENT_COLOR = '#6A87D8';
const LIGHT_BG = '#F7F7F7';
const TEXT_COLOR_DARK = '#1A1A1A';
const TEXT_COLOR_MEDIUM = '#666';

// --- Interface para la Admin/Backend (Copiada del estilo deseado) ---
interface Reservation {
    id: string; // Cambiado a string para consistencia con el uso en las claves (keyExtractor)
    id_usuario: number;
    id_espacio: number;
    fecha: string; // Ejemplo: "2025-11-10"
    hora_inicio: string; // Ejemplo: "10:00:00"
    hora_fin: string; // Ejemplo: "12:00:00"
    estado: 'pendiente' | 'aprobada' | 'rechazada' | string; // Aseguramos tipado estricto para los estados
    nombre_espacio: string;
    nombre_usuario: string;
    apartamento_usuario: string;
    cantidad_personas: number;
}

// --- Utilidad de Estilos de Estado (Copiada del estilo deseado) ---
const getStatusStyles = (estado: string) => {
    const status = estado.toLowerCase();
    switch (status) {
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

// --- Componente Modal de Detalles (Copiada del estilo deseado) ---
interface ReservationDetailModalProps {
    visible: boolean;
    onClose: () => void;
    reservation: Reservation | null;
}

const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({ visible, onClose, reservation }) => {
    if (!reservation) return null;
    const statusStyle = getStatusStyles(reservation.estado);
    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

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
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="space-shuttle" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Espacio:</Text>
                            <Text style={modalStyles.detailValue}>{reservation.nombre_espacio}</Text>
                        </View>
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="user" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Residente:</Text>
                            <Text style={modalStyles.detailValue}>{reservation.nombre_usuario}</Text>
                        </View>
                        <View style={modalStyles.detailRow}>
                            <FontAwesome5 name="building" size={18} color={ACCENT_COLOR} style={modalStyles.detailIcon} />
                            <Text style={modalStyles.detailLabel}>Apto:</Text>
                            <Text style={modalStyles.detailValue}>{reservation.apartamento_usuario}</Text>
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
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// --- Componente de Tarjeta de Reserva para Administrador ---
interface AdminReservationCardProps {
    reservation: Reservation;
    onPressDetails: (reservation: Reservation) => void;
    onUpdateStatus: (id: string, newStatus: 'aprobada' | 'rechazada') => void;
}

const AdminReservationCard: React.FC<AdminReservationCardProps> = ({ reservation, onPressDetails, onUpdateStatus }) => {
    const statusStyle = getStatusStyles(reservation.estado);
    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

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
                    <FontAwesome5 name="user" size={16} color={TEXT_COLOR_DARK} />
                    <Text style={styles.infoTextName}>{reservation.nombre_usuario} (Apto {reservation.apartamento_usuario})</Text>
                </View>
                <View style={styles.infoRow}>
                    <FontAwesome5 name="calendar" size={16} color={ACCENT_COLOR} />
                    <Text style={styles.infoText}>{formatDate(reservation.fecha)} | {reservation.hora_inicio.substring(0, 5)} - {reservation.hora_fin.substring(0, 5)}</Text>
                </View>
            </View>
            
            <View style={styles.actionContainer}>
                {/* Botón de Ver Detalles */}
                <TouchableOpacity style={styles.detailsButton} onPress={() => onPressDetails(reservation)}>
                    <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                    <FontAwesome5 name="search" size={12} color={ACCENT_COLOR} style={{ marginLeft: 5 }} />
                </TouchableOpacity>

                {/* Botones de Acción para Pendientes */}
                {reservation.estado === 'pendiente' && (
                    <View style={styles.adminActionButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.approveButton]} 
                            onPress={() => onUpdateStatus(reservation.id, 'aprobada')}
                        >
                            <FontAwesome5 name="check" size={14} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectButton]} 
                            onPress={() => onUpdateStatus(reservation.id, 'rechazada')}
                        >
                            <FontAwesome5 name="times" size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

// --- Pantalla Principal del Administrador ---
export default function AdminReservationsScreen() {
    // Usamos un mock de useRouter para evitar errores de compilación de Expo Router
    const router = { push: (path: string) => console.log(`Navegando a: ${path}`) }; 
    
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    // --- Simulación de Fetching de Datos para Admin ---
    const fetchReservations = useCallback(async () => {
        setLoading(true);
        // Simulación de datos para Administrador (incluye aprobadas, pendientes y rechazadas)
        const mockData: Reservation[] = [
            { id: '1', id_usuario: 101, id_espacio: 1, fecha: '2025-11-10', hora_inicio: '10:00:00', hora_fin: '12:00:00', estado: 'pendiente', nombre_espacio: 'Salón Comunal', nombre_usuario: 'Juan Pérez', apartamento_usuario: '301', cantidad_personas: 5 },
            { id: '2', id_usuario: 102, id_espacio: 2, fecha: '2025-11-15', hora_inicio: '18:00:00', hora_fin: '22:00:00', estado: 'aprobada', nombre_espacio: 'Zona BBQ', nombre_usuario: 'Ana Gómez', apartamento_usuario: '402', cantidad_personas: 12 },
            { id: '3', id_usuario: 103, id_espacio: 1, fecha: '2025-11-20', hora_inicio: '08:00:00', hora_fin: '10:00:00', estado: 'pendiente', nombre_espacio: 'Salón Comunal', nombre_usuario: 'Carlos Ruiz', apartamento_usuario: '101', cantidad_personas: 2 },
            { id: '4', id_usuario: 104, id_espacio: 3, fecha: '2025-10-01', hora_inicio: '14:00:00', hora_fin: '16:00:00', estado: 'rechazada', nombre_espacio: 'Piscina', nombre_usuario: 'Elena Castro', apartamento_usuario: '501', cantidad_personas: 4 },
        ];
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simula latencia
        
        // El administrador ve todas, pero ordenamos: Pendientes primero
        const sortedData = mockData.sort((a, b) => {
            if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
            if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
            return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });

        setReservations(sortedData);
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReservations();
    }, [fetchReservations]);


    // --- Lógica de Aprobación/Rechazo ---
    const handleUpdateStatus = (id: string, newStatus: 'aprobada' | 'rechazada') => {
        const action = newStatus === 'aprobada' ? 'APROBAR' : 'RECHAZAR';
        
        Alert.alert(
            'Confirmar Acción',
            `¿Está seguro de ${action} la reserva ${id}?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí',
                    onPress: async () => {
                        // Simulación de llamada API
                        try {
                            setLoading(true);
                            await new Promise(resolve => setTimeout(resolve, 500)); 
                            
                            // Actualizar el estado local
                            setReservations(prev => 
                                prev.map(res => 
                                    res.id === id ? { ...res, estado: newStatus } : res
                                ).sort((a, b) => { // Reordenar después de la actualización
                                    if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
                                    if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
                                    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
                                })
                            );
                            // Usaríamos Toast.show() aquí
                            console.log(`Reserva ${id} ${newStatus} con éxito.`);
                        } catch (error) {
                            console.error(`Error al ${action} reserva:`, error);
                            // Usaríamos Toast.show() aquí
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    // --- Funciones del Modal ---
    const handleOpenDetails = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setIsModalVisible(true);
    };

    const handleCloseDetails = () => {
        setIsModalVisible(false);
        setSelectedReservation(null);
    };

    // --- Renderizado Condicional ---
    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT_COLOR} />
                <Text style={styles.loadingText}>Cargando reservas...</Text>
            </View>
        );
    }
    
    // Función para renderizar item de FlatList
    const renderItem = ({ item }: { item: Reservation }) => (
        <AdminReservationCard 
            reservation={item} 
            onPressDetails={handleOpenDetails}
            onUpdateStatus={handleUpdateStatus}
        />
    );


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Encabezado fijo de Admin */}
            <View style={styles.header}>
                <Text style={styles.mainTitle}>Gestión de Reservas</Text>
            </View>

            <FlatList
                data={reservations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ACCENT_COLOR]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome5 name="calendar-check" size={50} color={ACCENT_COLOR} />
                        <Text style={styles.emptyText}>No hay reservas pendientes ni activas.</Text>
                    </View>
                }
            />

            {/* Modal de Detalles */}
            <ReservationDetailModal
                visible={isModalVisible}
                onClose={handleCloseDetails}
                reservation={selectedReservation}
            />
            {/* Si estuviera usando la librería, se agregaría <Toast /> aquí */}
        </SafeAreaView>
    );
}

// --- Hoja de Estilos Consolidada ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },
    // Estilos del encabezado
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold', // Simulamos Raleway-Bold
        color: TEXT_COLOR_DARK,
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
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
        color: TEXT_COLOR_DARK,
    },
    // Estilos de la Tarjeta
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: ACCENT_COLOR, // Estilo de Admin
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    spaceName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardContent: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoTextName: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
        color: TEXT_COLOR_DARK,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 15,
        color: TEXT_COLOR_MEDIUM,
    },
    // Estilos de Acciones Admin
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
    },
    adminActionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 10,
        borderRadius: 8,
        marginLeft: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    approveButton: {
        backgroundColor: '#4CAF50', // Verde
    },
    rejectButton: {
        backgroundColor: '#F44336', // Rojo
    },
    detailsButton: {
        backgroundColor: 'transparent',
        paddingVertical: 5,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ACCENT_COLOR,
        paddingHorizontal: 10,
    },
    detailsButtonText: {
        color: ACCENT_COLOR,
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: TEXT_COLOR_MEDIUM,
        marginTop: 16,
    },
});

// --- Estilos del Modal (Copiados del estilo deseado) ---
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
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
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
        fontWeight: 'bold',
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
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
        width: 80,
    },
    detailValue: {
        flex: 1,
        fontSize: 16,
        color: TEXT_COLOR_MEDIUM,
    },
});
