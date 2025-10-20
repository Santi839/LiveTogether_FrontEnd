import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    PressableStateCallbackType,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

// --- CONSTANTES DE ESTILO ---
const LIGHT_BG = '#F0F0F0';
const CARD_BG = '#FFFFFF';
const ACCENT_COLOR = '#6A87D8';
const MAIN_COLOR = '#001F3F';
const TEXT_COLOR = '#333333';

// 🔑 URLs de tu API
import '../../utils/axios-config'; // Importamos la configuración global de axios

// Endpoints relativos
const SPACES_ENDPOINT = '/api/espacios-comunes/';    // Endpoint para obtener detalles del espacio (GET)
const RESERVES_ENDPOINT = '/api/reservas/';   // Endpoint para crear la reserva (POST)


// 🔑 INTERFACES
interface SpaceDetailFromDB {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    disponibilidad: boolean;
    cantidad_max: number;
    imagen: string;
}

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


// --- PANTALLA PRINCIPAL ---

export default function ReservationDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    // 🔑 ESTADOS
    const [reservationData, setReservationData] = useState<SpaceDetailFromDB | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isBooking, setIsBooking] = useState<boolean>(false);

    // 🔑 ESTADOS PARA EL FORMULARIO
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
    const [guestCount, setGuestCount] = useState('1');
    const [showPicker, setShowPicker] = useState<{
        show: boolean;
        type: 'date' | 'startTime' | 'endTime' | null;
    }>({ show: false, type: null });

    // Obtener el máximo de personas del parámetro
    const { maxCapacity } = useLocalSearchParams<{ maxCapacity: string }>();
    const maxGuests = parseInt(maxCapacity || '1');


    // 1. LÓGICA DE CARGA DE DATOS (useEffect)
    useEffect(() => {
        const fetchSpaceDetails = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }
            try {
                // Petición GET: Obtener detalles del espacio específico
                const response = await axios.get(`${SPACES_ENDPOINT}${id}/`);
                setReservationData(response.data);
            } catch (error) {
                console.error('Error al cargar detalles del espacio:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error de Carga',
                    text2: 'No se pudo obtener la información del espacio.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpaceDetails();
    }, [id]); // Dependencia del ID para recargar si cambia


    // Manejador unificado para los pickers
    const handlePickerChange = (event: any, selectedDate?: Date) => {
        if (!selectedDate) return;

        const { type } = event;

        // Para Android, actualizar inmediatamente
        if (Platform.OS === 'android') {
            if (type === 'set') {
                updatePickerValue(selectedDate);
            }
            setShowPicker({ show: false, type: null });
            return;
        }

        // Para iOS, solo actualizar cuando se presiona "Aceptar"
        if (type === 'set') {
            updatePickerValue(selectedDate);
            setShowPicker({ show: false, type: null });
        }
    };

    const updatePickerValue = (value: Date) => {
        switch (showPicker.type) {
            case 'date':
                setSelectedDate(value);
                break;
            case 'startTime':
                setStartTime(value);
                // Actualizar automáticamente la hora de fin una hora después
                const newEndTime = new Date(value);
                newEndTime.setHours(value.getHours() + 1);
                setEndTime(newEndTime);
                break;
            case 'endTime':
                setEndTime(value);
                break;
        }
    };

    const showPickerFor = (type: 'date' | 'startTime' | 'endTime') => {
        setShowPicker({ show: true, type });
    };

    // Formateadores de fecha y hora
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // 2. LÓGICA DE CREACIÓN DE RESERVA (POST)
    const handleBooking = async () => {
        if (isBooking) return;
        setIsBooking(true);

        try {
            if (!selectedDate || !startTime || !endTime) {
                showToast('Selecciona una fecha y rango horario.', '#FF5252');
                return;
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                showToast('No hay sesión activa. Por favor, inicia sesión.', '#FF5252');
                router.replace('/(auth)/login');
                return;
            }

            // Obtener el ID del usuario del token (asumiendo que es 1 por ahora)
            const userId = 1;

            const reservationData = {
                id_espacio: id,
                fecha: selectedDate.toISOString().split('T')[0],
                hora_inicio: formatTime(startTime),
                hora_fin: formatTime(endTime),
                id_usuario: userId,
                cantidad_personas: parseInt(guestCount)
            };

            console.log('Enviando datos de reserva:', reservationData);

            const response = await axios.post(
                '/api/reservas/',
                reservationData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Reserva creada:', response.data);
            showToast('✅ Tu reserva fue creada con éxito.', '#4CAF50');

            // Redirigir a la lista de reservas
            setTimeout(() => {
                router.push('/(resident)/reservations');
            }, 2000);

        } catch (error: any) {
            console.error('Error al reservar:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al crear la reserva';
            showToast(`❌ ${errorMessage}`, '#FF5252');
        } finally {
            setIsBooking(false);
        }
    };


    const showToast = (message: string, backgroundColor: string) => {
        Toast.show({
            type: 'info',
            text1: message,
            position: 'bottom',
            visibilityTime: 3000,
            autoHide: true,
            bottomOffset: 40,
            props: { style: { backgroundColor } }
        });
    };

    // 3. ESTADO DE CARGA Y ERROR
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={ACCENT_COLOR} />
                <Text style={styles.loadingText}>Cargando detalles del espacio...</Text>
            </View>
        );
    }

    if (!reservationData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.errorText}>No se encontró el espacio de reserva con ID: {id}.</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.linkText}>Volver al listado</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 4. RENDERIZADO PRINCIPAL

    // 🔑 Necesitas una imagen de fondo. Como no viene de la DB, usa una por defecto.
    const defaultHeroImage = require('../../assets/images/piscina.jpg');

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <Image source={defaultHeroImage} style={styles.heroImage} resizeMode="cover" />

            {/* Botón de regreso */}
            <View style={styles.overlay}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {/* TÍTULO Y COSTO */}
                    <View style={styles.headerContent}>
                        <Text style={styles.mainTitle}>{reservationData.nombre}</Text>
                        <Text style={styles.costText}>
                            {reservationData.precio > 0 ? `$${reservationData.precio.toLocaleString()} COP` : 'GRATIS'}
                        </Text>
                    </View>

                    {/* DESCRIPCIÓN */}
                    <Text style={styles.subTitle}>Descripción</Text>
                    <Text style={styles.descriptionText}>{reservationData.descripcion}</Text>
                    <View style={styles.separator} />


                </View>
            </ScrollView>

            {/* FOOTER CON BOTÓN DE RESERVA */}
            <View style={styles.footer}>
                <View style={styles.selectionRow}>
                    <Pressable
                        onPress={() => showPickerFor('date')}
                        style={({ pressed }: PressableStateCallbackType) => [
                            styles.dateTimeButton,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                    >
                        <Text style={styles.labelTime}>Fecha</Text>
                        <Text style={styles.valueTime}>{formatDate(selectedDate)}</Text>
                    </Pressable>
                    <View>
                        <Text style={styles.labelTime}>Hora</Text>
                        <View style={styles.timeContainer}>
                            <Pressable
                                onPress={() => showPickerFor('startTime')}
                                style={({ pressed }: PressableStateCallbackType) => [
                                    styles.timeButton,
                                    { opacity: pressed ? 0.7 : 1 }
                                ]}
                            >
                                <Text style={styles.valueTime}>{formatTime(startTime)}</Text>
                            </Pressable>
                            <Text style={styles.valueTime}> - </Text>
                            <Pressable
                                onPress={() => showPickerFor('endTime')}
                                style={({ pressed }: PressableStateCallbackType) => [
                                    styles.timeButton,
                                    { opacity: pressed ? 0.7 : 1 }
                                ]}
                            >
                                <Text style={styles.valueTime}>{formatTime(endTime)}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Picker Unificado */}
                {showPicker.show && (
                    <>
                        {Platform.OS === 'android' ? (
                            <DateTimePicker
                                value={
                                    showPicker.type === 'date'
                                        ? selectedDate
                                        : showPicker.type === 'startTime'
                                            ? startTime
                                            : endTime
                                }
                                mode={showPicker.type === 'date' ? 'date' : 'time'}
                                is24Hour={true}
                                onChange={handlePickerChange}
                                minimumDate={showPicker.type === 'date' ? new Date() : undefined}
                            />
                        ) : (
                            <View style={styles.pickerContainer}>
                                <DateTimePicker
                                    value={
                                        showPicker.type === 'date'
                                            ? selectedDate
                                            : showPicker.type === 'startTime'
                                                ? startTime
                                                : endTime
                                    }
                                    mode={showPicker.type === 'date' ? 'date' : 'time'}
                                    is24Hour={true}
                                    display="spinner"
                                    onChange={handlePickerChange}
                                    minimumDate={showPicker.type === 'date' ? new Date() : undefined}
                                />
                                <View style={styles.pickerButtonsContainer}>
                                    <TouchableOpacity
                                        style={[styles.pickerButton, { backgroundColor: '#ff4444' }]}
                                        onPress={() => setShowPicker({ show: false, type: null })}
                                    >
                                        <Text style={styles.pickerButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.pickerButton, { backgroundColor: ACCENT_COLOR }]}
                                        onPress={() => {
                                            const currentValue = showPicker.type === 'date'
                                                ? selectedDate
                                                : showPicker.type === 'startTime'
                                                    ? startTime
                                                    : endTime;
                                            handlePickerChange({ type: 'set' }, currentValue);
                                        }}
                                    >
                                        <Text style={styles.pickerButtonText}>Aceptar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </>
                )}

                <View style={styles.guestCountContainer}>
                    <Text style={styles.labelTime}>Cantidad de personas</Text>
                    <TextInput
                        style={styles.guestInput}
                        value={guestCount}
                        onChangeText={(text) => {
                            const count = parseInt(text) || 0;
                            if (count <= maxGuests) {
                                setGuestCount(text);
                            }
                        }}
                        keyboardType="numeric"
                        placeholder="Número de personas"
                        maxLength={2}
                    />
                    <Text style={styles.maxGuestsText}>
                        Máximo: {maxGuests} personas
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.bookButton, { opacity: isBooking ? 0.6 : 1 }]}
                    onPress={handleBooking}
                    disabled={isBooking || parseInt(guestCount) < 1 || parseInt(guestCount) > maxGuests}
                >
                    {isBooking ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.bookButtonText}>
                            Reservar
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
            <Toast />
        </View>
    );
}

// --- ESTILOS (sin cambios relevantes en la estructura) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: LIGHT_BG },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    doneButton: {
        backgroundColor: ACCENT_COLOR,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
    },
    dateTimeButton: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 8,
        minWidth: 120,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    timeButton: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 8,
        minWidth: 60,
    },
    heroImage: { width: '100%', height: 350, position: 'absolute', top: 0 },
    overlay: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    backButton: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
    scrollContent: { paddingTop: 330, paddingBottom: 150 },
    guestCountContainer: {
        backgroundColor: LIGHT_BG,
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
    },
    guestInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        marginVertical: 5,
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        textAlign: 'center',
    },
    maxGuestsText: {
        fontSize: 12,
        fontFamily: 'Raleway-Regular',
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    card: {
        backgroundColor: CARD_BG,
        padding: 25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        minHeight: 500,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: 'Raleway-Bold',
        color: MAIN_COLOR,
        flexShrink: 1
    },
    costText: {
        fontSize: 18,
        fontFamily: 'Raleway-Bold',
        color: ACCENT_COLOR,
        backgroundColor: `${ACCENT_COLOR}20`,
        padding: 5,
        borderRadius: 8,
        marginLeft: 10,
    },
    subTitle: {
        fontSize: 18,
        fontFamily: 'Raleway-Bold',
        color: ACCENT_COLOR,
        marginTop: 15,
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR,
        lineHeight: 24
    },
    detailText: {
        fontSize: 15,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR,
        lineHeight: 22,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: CARD_BG,
        padding: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    selectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: LIGHT_BG,
        padding: 10,
        borderRadius: 10,
    },
    labelTime: {
        fontSize: 14,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR,
    },
    valueTime: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: MAIN_COLOR,
        marginTop: 3,
    },
    bookButton: {
        backgroundColor: ACCENT_COLOR,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    bookButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Raleway-Bold',
        fontWeight: 'normal',
    },
    errorText: {
        fontSize: 20,
        fontFamily: 'Raleway-Bold',
        color: MAIN_COLOR,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        color: MAIN_COLOR,
        marginTop: 15,
    },
    linkText: {
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        color: ACCENT_COLOR,
        marginTop: 10,
    },
    pickerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    pickerButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    pickerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});