import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import PageHeader from '../../components/PageHeader'; // Se mantiene tu componente de cabecera

// --- Datos de las reservaciones (sin cambios) ---
const images = {
  pool: require('../../assets/images/piscina.jpg'),
  cancha: require('../../assets/images/cancha.png'),
  salon: require('../../assets/images/salon.jpg'),
  bbq: require('../../assets/images/bqq.png'),
};

interface ReservationSummary {
  id: string;
  title: string;
  subtitle: string;
  image: any;
}

const reservationsSummary: ReservationSummary[] = [
  {
    id: '1',
    title: 'Piscina',
    subtitle: 'Capacidad máxima: 20 personas',
    image: images.pool,
  },
  {
    id: '2',
    title: 'Cancha Sintética',
    subtitle: 'Capacidad máxima: 14 personas',
    image: images.cancha,
  },
  {
    id: '3',
    title: 'Salón Social',
    subtitle: 'Capacidad máxima: 50 personas',
    image: images.salon,
  },
  {
    id: '4',
    title: 'Zona de BBQ',
    subtitle: 'Capacidad máxima: 15 personas',
    image: images.bbq,
  },
];

// --- Componente de Opción de Reserva (Rediseñado) ---
const ReservationOption = ({ option }: { option: ReservationSummary }) => {
  const router = useRouter();

  // Función para manejar la navegación
  const handlePress = () => {
    router.replace({
      pathname: '/(resident)/reservation_details',
      params: {
        id: option.id,
        title: option.title,
        maxCapacity: parseInt(option.subtitle.split(': ')[1] || '0'), // Previene errores si el formato cambia
      },
    } as never);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {/* Imagen */}
      <Image source={option.image} style={styles.cardImage} />

      {/* Contenedor de texto */}
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
      </View>

      {/* Ícono indicador de acción */}
      <Text style={styles.cardIcon}>{'>'}</Text>
    </TouchableOpacity>
  );
};

// --- Pantalla Principal (con nuevos estilos) ---
export default function ReservationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <PageHeader title="Reservaciones" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainTitle}>¿Qué deseas reservar?</Text>

        {reservationsSummary.map((option) => (
          <ReservationOption key={option.id} option={option} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Hoja de Estilos (Completamente renovada para un look minimalista) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7', // Un fondo gris muy claro para dar un toque suave
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Raleway-Bold',
    color: '#1A1A1A', // Un negro menos intenso
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8', // Borde sutil
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  cardTextContainer: {
    flex: 1, // Ocupa el espacio disponible
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#666666',
  },
  cardIcon: {
    fontSize: 20,
    color: '#CCCCCC', // Un color de ícono discreto
    fontWeight: 'bold',
  },
});