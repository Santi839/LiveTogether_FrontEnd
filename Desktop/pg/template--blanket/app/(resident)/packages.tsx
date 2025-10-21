import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
// Importa los iconos de Expo
import { Ionicons } from '@expo/vector-icons'; 

// --- Interfaz de Datos ---
interface Package {
  id: number;
  fecha: string;
  id_resident_id: number;
}

// --- Componente de la Tarjeta (PackageCard) ---
interface PackageCardProps {
  pkg: Package;
  onPress: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onPress }) => {
  const formattedDate = new Date(pkg.fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Nuevo: Ícono de paquete */}
      <Ionicons name="cube" size={30} color="#6A87D8" style={styles.packageIcon} /> 
      
      <View style={styles.textContainer}>
        <Text style={styles.packageTitle}>Paquete</Text>
        <Text style={styles.packageDate}>{formattedDate}</Text>
      </View>
      {/* Opcional: Una flecha para indicar que es clickeable */}
      <Ionicons name="chevron-forward" size={24} color="#C0C0C0" />
    </TouchableOpacity>
  );
};

// --- Pantalla Principal (PackagesScreen) ---
export default function PackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPackages = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/paquetes/');
      setPackages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al obtener los paquetes:", error);
      Toast.show({
        type: 'error',
        text1: 'Error de Red',
        text2: 'No se pudieron cargar los paquetes.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  }, []);

  const handlePackagePress = (pkg: Package) => {
    console.log('Paquete presionado, ID:', pkg.id);
    // Aquí podrías navegar a una pantalla de detalles del paquete
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6A87D8" /> 
        <Text style={styles.loadingText}>Cargando paquetes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Mis Paquetes', // Título de la barra de navegación
        headerTitleStyle: styles.headerTitle, // Estilo para el título del header
      }} />

      <FlatList
        data={packages}
        renderItem={({ item }) => (
          <PackageCard pkg={item} onPress={() => handlePackagePress(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Historial de Paquetes</Text> {/* Título principal de la pantalla */}
          </View>
        )}
        ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={60} color="#888" style={{marginBottom: 10}} />
              <Text style={styles.emptyText}>No tienes paquetes disponibles.</Text>
              <Text style={styles.emptySubText}>¡Revisa más tarde!</Text>
            </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A87D8']} tintColor="#6A87D8" /> 
        }
      />
      <Toast /> 
    </SafeAreaView>
  );
}

// --- Estilos Actualizados ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F2F5' // Un fondo más suave
  },
  center: { 
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F0F2F5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    fontFamily: 'Raleway-Regular',
  },
  listContainer: { 
    paddingBottom: 20, 
    paddingTop: 10 
  },
  headerTitle: {
    fontFamily: 'Raleway-Bold',
    fontSize: 20,
    color: '#001F3F',
  },
  titleContainer: { 
    paddingHorizontal: 20, // Más padding
    paddingBottom: 15, // Más espacio debajo del título
    paddingTop: 10 
  },
  mainTitle: { 
    fontSize: 28, // Un poco más pequeño para ser el subtítulo
    fontFamily: 'Raleway-Bold', 
    color: '#001F3F' 
  },
  emptyContainer: { 
    marginTop: 80, // Más margen para centrar mejor
    alignItems: 'center',
    paddingHorizontal: 20
  },
  emptyText: { 
    fontFamily: 'Raleway-SemiBold', // Fuente un poco más audaz
    fontSize: 18, // Tamaño de fuente más legible
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 5,
  },
  emptySubText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // Bordes más redondeados
    padding: 18, // Ligeramente menos padding para un look más compacto
    marginVertical: 7, // Espacio vertical un poco reducido
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Sombra más pronunciada para profundidad
    shadowOpacity: 0.08, // Sombra más suave
    shadowRadius: 6, // Mayor radio de sombra
    elevation: 4,
    flexDirection: 'row', // Para alinear el ícono y el texto horizontalmente
    alignItems: 'center', // Centra verticalmente el contenido
  },
  packageIcon: {
    marginRight: 15, // Espacio entre el ícono y el texto
  },
  textContainer: { 
    flex: 1, // Para que el texto ocupe el espacio restante y empuje la flecha a la derecha
  },
  packageTitle: {
    fontFamily: 'Raleway-Bold',
    fontSize: 17, // Ligeramente más pequeño
    color: '#333', // Un color más oscuro para mejor contraste
    marginBottom: 2, // Menos margen
  },
  packageDate: {
    fontFamily: 'Raleway-Medium', // Un poco más de peso para la fecha
    fontSize: 13, // Ligeramente más grande
    color: '#777', // Color de fecha un poco más oscuro
  },
});