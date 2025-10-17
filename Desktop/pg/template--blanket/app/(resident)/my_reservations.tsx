import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import '../../utils/axios-config';

// Constantes
const ACCENT_COLOR = '#6A87D8';
const MAIN_COLOR = '#001F3F';
const LIGHT_BG = '#F0F0F0';

// Interfaz para la reserva
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

const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const getStatusColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente':
                return '#FFA000';
            case 'aprobada':
                return '#4CAF50';
            case 'rechazada':
                return '#F44336';
            default:
                return '#757575';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.spaceName}>{reservation.nombre_espacio}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.estado) }]}>
                    <Text style={styles.statusText}>{reservation.estado}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <FontAwesome5 name="calendar" size={16} color={MAIN_COLOR} />
                    <Text style={styles.infoText}>{formatDate(reservation.fecha)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <FontAwesome5 name="clock" size={16} color={MAIN_COLOR} />
                    <Text style={styles.infoText}>
                        {reservation.hora_inicio.substring(0, 5)} - {reservation.hora_fin.substring(0, 5)}
                    </Text>
                </View>

                {reservation.cantidad_personas > 0 && (
                    <View style={styles.infoRow}>
                        <FontAwesome5 name="users" size={16} color={MAIN_COLOR} />
                        <Text style={styles.infoText}>{reservation.cantidad_personas} personas</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver Detalles</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function MyReservationsScreen() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReservations = async () => {
        try {
            const response = await axios.get('/api/reservas/');
            console.log('Reservas obtenidas:', response.data);
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT_COLOR} />
                <Text style={styles.loadingText}>Cargando reservas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Mis Reservas',
                    headerStyle: {
                        backgroundColor: LIGHT_BG,
                    },
                    headerTitleStyle: {
                        fontFamily: 'Raleway-Bold',
                        color: MAIN_COLOR,
                    },
                }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                        <ReservationCard key={reservation.id} reservation={reservation} />
                    ))
                )}
            </ScrollView>
            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },
    scrollContent: {
        padding: 16,
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
        color: MAIN_COLOR,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    spaceName: {
        fontSize: 18,
        fontFamily: 'Raleway-Bold',
        color: MAIN_COLOR,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Raleway-Bold',
    },
    cardContent: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Raleway-Regular',
        color: '#666',
    },
    detailsButton: {
        backgroundColor: `${ACCENT_COLOR}15`,
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: ACCENT_COLOR,
        fontSize: 14,
        fontFamily: 'Raleway-Bold',
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
        color: '#666',
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