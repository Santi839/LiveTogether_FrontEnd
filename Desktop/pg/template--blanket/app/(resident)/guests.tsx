import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
// Note: DateTimePicker is removed as it's replaced by the time grid
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import '../../utils/axios-config'; 

// --- Configuración de Idioma (sin cambios) ---
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

// --- Constantes (sin cambios) ---
const ACCENT_COLOR = '#6A87D8';
const ACCENT_COLOR_LIGHT = '#6A87D820';
const LIGHT_BG = '#F7F7F7';
const CARD_BG = '#FFFFFF';
const TEXT_COLOR_DARK = '#1A1A1A';
const TEXT_COLOR_MEDIUM = '#666';

type VisitType = 'visitante' | 'domicilio';

// --- Horarios (sin cambios) ---
const TIME_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

export default function VisitorsScreen() {
  const router = useRouter();
  
  // --- Estado del Formulario ---
  const [visitType, setVisitType] = useState<VisitType>('visitante');
  const [visitorName, setVisitorName] = useState('');
  // ## ELIMINADO ## Estado para documento
  // const [documento, setDocumento] = useState(''); 
  const [selectedDateString, setSelectedDateString] = useState<string>(new Date().toISOString().split('T')[0]); 
  const [selectedTime, setSelectedTime] = useState<string | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Eliminado showTimePicker state

  // --- Manejador de Calendario (sin cambios) ---
  const onDayPress = (day: any) => {
    setSelectedDateString(day.dateString);
  };

  // --- Lógica de Registro (ACTUALIZADA) ---
  const handleRegister = async () => {
    try {
      // Validación de nombre
      if (!visitorName.trim()) {
        Alert.alert('Campo Requerido', 'Por favor, ingresa el nombre completo.');
        return;
      }

      // Validación de hora (si es visitante)
      if (visitType === 'visitante' && !selectedTime) {
        Alert.alert('Campo Requerido', 'Por favor, selecciona una hora de llegada.');
        return;
      }

      // Obtener ID del usuario
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario.');
        return;
      }

      setIsSubmitting(true);

      let payload: any = {
        nombre_completo: visitorName.trim(),
        tipo_visita: visitType,
        fecha_visita: null,
        hora_llegada: null,
        registrado: true,
        id_anfitrion_id: parseInt(userId)
      };

    if (visitType === 'visitante' && selectedTime) {
      payload.fecha_visita = selectedDateString;
      payload.hora_llegada = `${selectedTime}:00`; 
    }
    
    console.log("Enviando Payload:", payload); // Para depuración

      // Realizar la petición
      await axios.post('/api/visitantes/', payload);
      Alert.alert(
        'Registro Exitoso',
        `${visitType === 'visitante' ? 'Visitante' : 'Domicilio'} registrado correctamente.`
      );    
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(resident)/information');
      }
    } catch (error: any) {
      console.error('Error registering visitor:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo completar el registro.';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Marked Dates (sin cambios) ---
  const markedDates: MarkedDates = {
    [selectedDateString]: { 
        selected: true, 
        selectedColor: ACCENT_COLOR, 
        selectedTextColor: 'white',
        disableTouchEvent: true,
    },
  };

  // --- Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header (sin cambios) */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <FontAwesome5 name="chevron-left" size={18} color={ACCENT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Visita</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainTitle}>Informar una nueva visita</Text>
        
        <View style={styles.formContainer}>
          
          {/* Selector de Tipo (sin cambios) */}
          <Text style={styles.formTitle}>Tipo de Visita</Text>
          <View style={styles.typeSelectorContainer}>
             <TouchableOpacity
              style={[styles.typeButton, visitType === 'visitante' && styles.typeButtonActive]}
              onPress={() => setVisitType('visitante')}
            >
              <FontAwesome5 name="user-friends" size={20} color={visitType === 'visitante' ? 'white' : ACCENT_COLOR} />
              <Text style={[styles.typeButtonText, visitType === 'visitante' && styles.typeButtonTextActive]}>Visitante</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, visitType === 'domicilio' && styles.typeButtonActive]}
              onPress={() => setVisitType('domicilio')}
            >
              <FontAwesome5 name="box" size={20} color={visitType === 'domicilio' ? 'white' : ACCENT_COLOR} />
              <Text style={[styles.typeButtonText, visitType === 'domicilio' && styles.typeButtonTextActive]}>Domicilio</Text>
            </TouchableOpacity>
          </View>

          {/* Nombre (sin cambios) */}
          <Text style={styles.formTitle}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            placeholder={visitType === 'visitante' ? 'Nombre del visitante' : 'Nombre o app de domicilio'}
            placeholderTextColor="#999"
            value={visitorName}
            onChangeText={setVisitorName}
            autoCapitalize="words"
          />

          {/* ## ELIMINADO ## Campo de Documento */}
          {/* <Text style={styles.formTitle}>Documento</Text> */}
          {/* <TextInput ... /> */}
          
          {/* Campos condicionales para Visitante (sin cambios) */}
          {visitType === 'visitante' && (
            <>
              {/* Calendario (sin cambios) */}
              <Text style={styles.formTitle}>Fecha de Llegada</Text>
              <Calendar
                style={styles.calendar}
                onDayPress={onDayPress}
                markedDates={markedDates}
                minDate={new Date().toISOString().split('T')[0]} 
                theme={{
                  arrowColor: ACCENT_COLOR,
                  todayTextColor: ACCENT_COLOR,
                  textSectionTitleColor: ACCENT_COLOR,
                  backgroundColor: CARD_BG,
                  calendarBackground: CARD_BG,
                  dayTextColor: TEXT_COLOR_DARK,
                  textDisabledColor: '#d9e1e8',
                  monthTextColor: TEXT_COLOR_DARK,
                  textDayFontFamily: 'Raleway-Regular',
                  textMonthFontFamily: 'Raleway-Bold',
                  textDayHeaderFontFamily: 'Raleway-Bold',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
              />

              {/* Cuadrícula de Horas (sin cambios) */}
              <Text style={styles.formTitle}>Hora Estimada de Llegada</Text>
              <View style={styles.timeSlotContainer}>
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlotButton,
                        isSelected ? styles.timeSlotSelected : styles.timeSlotUnselected
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text 
                        style={isSelected ? styles.timeSlotTextSelected : styles.timeSlotTextUnselected}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Botón de Enviar (sin cambios) */}
          <TouchableOpacity
            style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.addButtonText}>Registrar Visita</Text>
            )}
          </TouchableOpacity>
        </View> 
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos (sin cambios) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: LIGHT_BG,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Raleway-Bold',
    color: TEXT_COLOR_DARK,
    marginLeft: 15,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Raleway-Bold',
    color: ACCENT_COLOR,
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 20,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: TEXT_COLOR_DARK,
    marginBottom: 10,
    marginTop: 10,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
    backgroundColor: 'white',
  },
  typeButtonActive: {
    backgroundColor: ACCENT_COLOR,
  },
  typeButtonText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 16,
    color: ACCENT_COLOR,
    marginLeft: 10,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  input: {
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    backgroundColor: LIGHT_BG, 
    borderWidth: 1,
    borderColor: '#E8E8E8', 
    borderRadius: 8,
    padding: 15,
    marginBottom: 15, 
  },
  calendar: {
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    marginTop: 10,
    marginBottom: 10,
  },
  timeSlotButton: {
    width: '31%', 
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
  addButton: {
    backgroundColor: ACCENT_COLOR,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    marginTop: 20, 
  },
  addButtonDisabled: {
    backgroundColor: '#B0B0B0', 
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Raleway-Bold',
    fontSize: 16,
  },
});