import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Ya no se usa
import axios from 'axios';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
// 1. IMPORTAR EL NUEVO COMPONENTE DE CALENDARIO
import { Calendar, LocaleConfig } from 'react-native-calendars';
import {
    ActivityIndicator,
    Image,
    Platform,
    // Pressable, // Ya no se usa
    // PressableStateCallbackType, // Ya no se usa
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
const ACCENT_COLOR_LIGHT = '#6A87D820'; // Color para items no seleccionados

// 2. CONFIGURAR IDIOMA ESPAÑOL PARA EL CALENDARIO
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';


// URLs de tu API
import '../../utils/axios-config'; // Importamos la configuración global de axios

// Endpoints relativos
const SPACES_ENDPOINT = '/api/espacios-comunes/'; 	// Endpoint para obtener detalles del espacio (GET)
const RESERVES_ENDPOINT = '/api/reservas/'; 	// Endpoint para crear la reserva (POST)


// INTERFACES
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

// DATOS DE EJEMPLO PARA LA CUADRÍCULA DE HORAS
const MOCK_TIME_SLOTS = [
    "12:00", "12:30", "13:00",
    "14:00", "14:30", "15:30",
    "16:00", "16:30", "17:00",
    "18:00", "18:30", "19:00",
    "19:30", "21:00",
];


// --- PANTALLA PRINCIPAL ---

export default function ReservationDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    // ESTADOS
    const [reservationData, setReservationData] = useState<SpaceDetailFromDB | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isBooking, setIsBooking] = useState<boolean>(false);
    
    // ESTADOS PARA EL FLUJO DE PASOS
    const [step, setStep] = useState(1); // 1 = Fecha, 2 = Hora y Personas
    const [isConfirmed, setIsConfirmed] = useState(false); // 3 = Confirmación

    // ESTADOS PARA EL FORMULARIO
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [guestCount, setGuestCount] = useState('1');
    const [selectedDateString, setSelectedDateString] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null); // Ej: "14:00"


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


    // 2. LÓGICA DE MANEJO DE PICKERS ELIMINADA (ya no se usa)


    // HANDLER PARA EL NUEVO CALENDARIO (CORREGIDO)
    const onDayPress = (day: any) => { // 'day' es de tipo DateData
      console.log('selected day', day.dateString);
      setSelectedDateString(day.dateString);
      
      const [year, month, dayStr] = day.dateString.split('-').map(Number);
      // El mes del calendario (month) está basado en 1, pero el constructor de Date (monthIndex) está basado en 0.
      const dateObject = new Date(year, month - 1, dayStr);

      setSelectedDate(dateObject);
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

    // 3. LÓGICA DE CREACIÓN DE RESERVA (POST)
    const handleBooking = async () => {
        if (isBooking) return;

        if (!selectedTime) {
            showToast('Por favor, selecciona un horario.', '#FF5252');
            return;
        }

        setIsBooking(true);

        try {
            if (!selectedDate || !selectedTime) {
                showToast('Selecciona una fecha y rango horario.', '#FF5252');
                return;
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                showToast('No hay sesión activa. Por favor, inicia sesión.', '#FF5252');
                router.replace('/(auth)/login');
                return;
            }

            const userId = 1;

            // Calcular hora_inicio y hora_fin desde selectedTime
            const [hour, minute] = selectedTime.split(':').map(Number);
            
            const startTimeObj = new Date(selectedDate); 
            startTimeObj.setHours(hour, minute, 0, 0); 
            
            // Asumimos slots de 30 minutos
            const endTimeObj = new Date(startTimeObj.getTime() + 30 * 60000); 

            const reservationData = {
                id_espacio: id,
                fecha: selectedDate.toISOString().split('T')[0],
                hora_inicio: formatTime(startTimeObj), // Ej: "14:00"
                hora_fin: formatTime(endTimeObj),     // Ej: "14:30"
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
            setIsConfirmed(true); // Muestra la pantalla de confirmación

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

    // 4. ESTADO DE CARGA Y ERROR
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

    // 🔑 5. RENDERIZADO DEL PASO 3: PANTALLA DE CONFIRMACIÓN (MODIFICADO)
    if (isConfirmed) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: CARD_BG }]}>
                <StatusBar barStyle="dark-content" />
                <Text style={styles.confirmationTitle}>Reserva confirmada</Text>
                <View style={styles.checkContainer}>
                    <FontAwesome5 name="check" size={80} color="#4CAF50" />
                </View>

                {/* Botón 1: Ver mis reservas (Principal) */}
                <TouchableOpacity
                    style={[styles.bookButton, { width: '100%', marginTop: 40 }]}
                    onPress={() => router.replace('/(resident)/reservations')} 
                >
                    <Text style={styles.bookButtonText}>Ver mis reservas</Text>
                </TouchableOpacity>

                {/* 🔑 Botón 2: Hacer otra reserva (Secundario) */}
                <TouchableOpacity
                    style={[styles.bookButton, styles.secondaryButton, { width: '100%', marginTop: 15 }]}
                    onPress={() => {
                        // Resetea el estado para volver al paso 1
                        setIsConfirmed(false);
                        setStep(1);
                        setSelectedTime(null);
                        setGuestCount('1');
                        // Mantenemos la fecha seleccionada por si quieren reservar otro día cercano
                    }}
                >
                    <Text style={styles.secondaryButtonText}>Hacer otra reserva</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 5. RENDERIZADO PRINCIPAL (PASOS 1 Y 2)

    const defaultHeroImage = require('../../assets/images/piscina.jpg');

    const markedDates = {
      [selectedDateString]: {
        selected: true,
        selectedColor: ACCENT_COLOR,
        selectedTextColor: 'white',
        disableTouchEvent: true,
      },
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <Image source={defaultHeroImage} style={styles.heroImage} resizeMode="cover" />

            {/* Botón de regreso (funciona para ambos pasos) */}
            <View style={styles.overlay}>
                <TouchableOpacity 
                    onPress={() => {
                        if (step === 2) {
                            setStep(1); // Si está en el paso 2, vuelve al 1
                        } else {
                            router.back(); // Si está en el paso 1, vuelve atrás
                        }
                    }} 
                    style={styles.backButton}
                >
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

                    {/* CONTENIDO CONDICIONAL POR PASO */}

                    {/* --- PASO 1: CALENDARIO --- */}
                    {step === 1 && (
                        <>
                            {/* DESCRIPCIÓN */}
                            <Text style={styles.subTitle}>Descripción</Text>
                            <Text style={styles.descriptionText}>{reservationData.descripcion}</Text>
                            <View style={styles.separator} />

                            {/* CALENDARIO VISUAL */}
                            <Text style={styles.subTitle}>Reserva tu fecha</Text>
                            <Calendar
                                style={styles.calendar}
                                onDayPress={onDayPress}
                                markedDates={markedDates}
                                minDate={new Date().toISOString().split('T')[0]} 
                                theme={{
                                    arrowColor: ACCENT_COLOR,
                                    todayTextColor: ACCENT_COLOR,
                                    textSectionTitleColor: ACCENT_COLOR,
                                }}
                            />
                        </>
                    )}

                    {/* --- PASO 2: SELECCIÓN DE HORA --- */}
                    {step === 2 && (
                        <>
                            <Text style={styles.subTitle}>Selecciona el horario</Text>
                            <Text style={styles.descriptionText}>
                                Para el día: {formatDate(selectedDate)}
                            </Text>
                            
                            <View style={styles.timeSlotContainer}>
                                {MOCK_TIME_SLOTS.map((time) => {
                                    const isSelected = selectedTime === time;
                                    return (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeSlotButton,
                                                isSelected
                                                    ? styles.timeSlotSelected
                                                    : styles.timeSlotUnselected
                                            ]}
                                            onPress={() => setSelectedTime(time)}
                                        >
                                            <Text 
                                                style={
                                                    isSelected
                                                        ? styles.timeSlotTextSelected
                                                        : styles.timeSlotTextUnselected
                                                }
                                            >
                                                {time}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}
                    
                    {/* Separador para dar espacio antes del footer */}
                    <View style={styles.separator} /> 

                </View>
            </ScrollView>

            {/* FOOTER CON BOTÓN DE RESERVA */}
            <View style={styles.footer}>

                {/* FOOTER CONDICIONAL POR PASO */}
                
                {/* --- FOOTER PASO 1: BOTÓN DE SIGUIENTE --- */}
                {step === 1 && (
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => setStep(2)} // Avanza al paso 2
                    >
                        <Text style={styles.bookButtonText}>Seleccionar Horario</Text>
                    </TouchableOpacity>
                )}

                {/* --- FOOTER PASO 2: PERSONAS Y BOTÓN DE RESERVA --- */}
                {step === 2 && (
                    <>
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
                            style={[
                                styles.bookButton, 
                                { opacity: (isBooking || !selectedTime) ? 0.6 : 1 }
                            ]}
                            onPress={handleBooking} // Llama a la API
                            disabled={isBooking || !selectedTime || parseInt(guestCount) < 1 || parseInt(guestCount) > maxGuests}
                        >
                            {isBooking ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.bookButtonText}>
                                    Reservar
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
            <Toast />
        </View>
    );
}

// --- ESTILOS (Añadí estilos para el botón secundario) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: LIGHT_BG },
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
        lineHeight: 24,
        marginBottom: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    calendar: {
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    labelTime: { // Re-utilizado para "Cantidad de Personas"
        fontSize: 14,
        fontFamily: 'Raleway-Regular',
        color: TEXT_COLOR,
        marginBottom: 5, 
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
    // 🔑 ESTILOS PARA EL BOTÓN SECUNDARIO
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: ACCENT_COLOR,
    },
    secondaryButtonText: {
        color: ACCENT_COLOR,
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
    // --- NUEVOS ESTILOS PARA PASO 2 (Horas) ---
    timeSlotContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    timeSlotButton: {
        width: '31%', // Para 3 columnas
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
    },
    timeSlotUnselected: {
        backgroundColor: CARD_BG,
        borderColor: ACCENT_COLOR_LIGHT,
    },
    timeSlotSelected: {
        backgroundColor: ACCENT_COLOR,
        borderColor: ACCENT_COLOR,
    },
    timeSlotTextUnselected: {
        color: ACCENT_COLOR,
        fontSize: 14,
        fontFamily: 'Raleway-Bold',
    },
    timeSlotTextSelected: {
        color: CARD_BG,
        fontSize: 14,
        fontFamily: 'Raleway-Bold',
    },

    // --- NUEVOS ESTILOS PARA PASO 3 (Confirmación) ---
    confirmationTitle: {
        fontSize: 28,
        fontFamily: 'Raleway-Bold',
        color: MAIN_COLOR,
        textAlign: 'center',
        marginBottom: 30,
    },
    checkContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
});