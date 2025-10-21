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
import PageHeader from '../../components/PageHeader';

// --- Datos (sin cambios) ---
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
  // ... (datos sin cambios)
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

// --- Componente ReservationOption (sin cambios) ---
const ReservationOption = ({ option }: { option: ReservationSummary }) => {
  const router = useRouter();

  const handlePress = () => {
    router.replace({
      pathname: '/(resident)/reservation_details',
      params: {
        id: option.id,
        title: option.title,
        maxCapacity: parseInt(option.subtitle.split(': ')[1] || '0'),
      },
    } as never);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={option.image} style={styles.cardImage} />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
      </View>
      <Text style={styles.cardIcon}>{'>'}</Text>
    </TouchableOpacity>
  );
};

// --- Componente ReservationsScreen (sin cambios) ---
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

// --- [ACTUALIZADO] Hoja de Estilos ---

const ACCENT_COLOR = '#6A92E5';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Raleway-Bold',
    color: ACCENT_COLOR,
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
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
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    color: ACCENT_COLOR, // --- [ACTUALIZADO] ---
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#666666',
  },
  cardIcon: {
    fontSize: 20,
    color: ACCENT_COLOR,
    fontWeight: 'bold',
  },
});