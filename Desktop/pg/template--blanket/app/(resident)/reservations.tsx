import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PageHeader from '../../components/PageHeader';

const screenWidth = Dimensions.get('window').width;
const PROFILE_IMAGE = require('../../assets/images/PROFILE_IMAGE.png');
// ------------------------------------------------------------------

// ------------------------------------------------------------------

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

const ReservationOption = ({ option }: { option: ReservationSummary }) => {
  const router = useRouter();

  const imageSource = typeof option.image === 'string'
    ? { uri: option.image }
    : option.image;

  return (
    <View style={styles.optionContainer}>
      <Image style={styles.optionImage} source={imageSource} resizeMode="cover" />
      <View style={styles.textOverlay}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        {option.subtitle !== ' ' && (
          <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.reserveButton}
        onPress={() => router.replace({
            pathname: '/(resident)/reservation_details',
          params: {
            id: option.id,
            title: option.title,
            maxCapacity: parseInt(option.subtitle.split(': ')[1])
          }
        } as never)}
      >
        <Text style={styles.reserveButtonText}>Reservar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ReservationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>
          <PageHeader title="Reservaciones" />
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>¿Qué reservaremos hoy?</Text>
          </View>
        </View>

        {reservationsSummary.map((option) => (
          <ReservationOption key={option.id} option={option} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  titleContainer: {
    padding: 15,
  },
  mainTitle: {
    fontSize: 25,
    fontFamily: 'Raleway-Bold',
    fontWeight: 'normal',
    color: '#001F3F',
    marginTop: 5,
    textAlign: 'left',
  },
  optionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  optionImage: {
    width: '100%',
    height: 180,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  optionTitle: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    fontWeight: 'normal',
    color: 'white',
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: 'white',
  },
  reserveButton: {
    backgroundColor: '#6A87D8',
    padding: 15,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    fontWeight: 'normal',
  },
});