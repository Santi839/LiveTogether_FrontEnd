import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// --- [IMPORTACIONES DE API] ---
import axios from 'axios';
import '../../utils/axios-config'; // Asegúrate de que esta ruta sea correcta

// --- Constantes ---
const ACCENT_COLOR = '#6A92E5';

// --- Interface (actualizada para la BD) ---
interface Vehicle {
  id: number;
  placa: string;
  tipo: 'carro' | 'moto';
  num_parqueadero: number | null;
}

type VehicleType = 'carro' | 'moto';

export default function VehiclesScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newPlaca, setNewPlaca] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>('carro');

  // --- [ACTUALIZADO] Lógica de Carga Inicial ---
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        // --- RUTA CORREGIDA ---
        const response = await axios.get('/usuarios/vehiculos/');
        setVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        Alert.alert('Error', 'No se pudieron cargar tus vehículos.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // --- Manejador de Placa (sin cambios) ---
  const handlePlacaChange = (text: string) => {
    const upperText = text.toUpperCase();
    let formattedText = '';

    if (vehicleType === 'carro') {
      const letters = upperText.substring(0, 3).replace(/[^A-Z]/g, '');
      const numbers = upperText.substring(3, 6).replace(/[^0-9]/g, '');
      formattedText = letters + numbers;
    } else {
      const letters1 = upperText.substring(0, 3).replace(/[^A-Z]/g, '');
      const numbers = upperText.substring(3, 5).replace(/[^0-9]/g, '');
      const letter2 = upperText.substring(5, 6).replace(/[^A-Z]/g, '');
      formattedText = letters1 + numbers + letter2;
    }
    setNewPlaca(formattedText);
  };

  // --- [ACTUALIZADO] Lógica de Registro ---
  const handleRegister = async () => {
    // ... (Validaciones sin cambios)
    if (vehicles.length >= 3) {
      Alert.alert('Límite alcanzado', 'Solo puedes registrar un máximo de 3 vehículos.');
      return;
    }
    if (vehicleType === 'carro') {
      const regex = /^[A-Z]{3}\d{3}$/;
      if (!regex.test(newPlaca)) {
        Alert.alert('Formato incorrecto', 'La placa de carro debe tener 3 letras y 3 números (ABC123).');
        return;
      }
    } else {
      const regex = /^[A-Z]{3}\d{2}[A-Z]$/;
      if (!regex.test(newPlaca)) {
        Alert.alert('Formato incorrecto', 'La placa de moto debe tener 3 letras, 2 números y 1 letra (ABC12D).');
        return;
      }
    }

    setIsMutating(true);
    try {
      const payload = {
        placa: newPlaca.trim().toUpperCase(),
        tipo: vehicleType,
      };
      
      // --- RUTA CORREGIDA ---
      const response = await axios.post('/usuarios/vehiculos/', payload);
      
      setVehicles([...vehicles, response.data]);
      setNewPlaca('');
      Alert.alert('Éxito', 'Vehículo registrado correctamente.');
      
    } catch (error: any) {
      console.error('Error registering vehicle:', error);
      if (error.response?.data?.message) {
        Alert.alert('Error al registrar', error.response.data.message);
      } else {
        Alert.alert('Error', 'No se pudo registrar el vehículo.');
      }
    } finally {
      setIsMutating(false);
    }
  };

  // --- [ACTUALIZADO] Lógica de Borrado ---
  const handleDelete = (vehicleToDelete: Vehicle) => {
    Alert.alert(
      'Eliminar Vehículo',
      `¿Estás seguro de que quieres eliminar la placa ${vehicleToDelete.placa}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsMutating(true);
            try {
              // --- RUTA CORREGIDA (con la barra al final) ---
              await axios.delete(`/usuarios/vehiculos/${vehicleToDelete.id}/`);
              
              setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete.id));
              Alert.alert('Éxito', 'Vehículo eliminado.');
              
            } catch (error) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'No se pudo eliminar el vehículo.');
            } finally {
              setIsMutating(false);
            }
          },
        },
      ]
    );
  };

  // --- Renderizado de Lista (sin cambios) ---
  const renderVehicleList = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={ACCENT_COLOR} style={styles.loadingIndicator} />;
    }
    if (vehicles.length === 0) {
      return <Text style={styles.emptyText}>No tienes vehículos registrados.</Text>;
    }
    return vehicles.map((vehicle) => (
      <View key={vehicle.id} style={styles.vehicleCard}>
        <FontAwesome5 
            name={vehicle.tipo === 'carro' ? 'car' : 'motorcycle'} 
            size={24} 
            style={styles.carIcon} 
        />
        <Text style={styles.plateText}>{vehicle.placa}</Text>
        <TouchableOpacity onPress={() => handleDelete(vehicle)} disabled={isMutating}>
          <FontAwesome5 name="trash" size={20} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    ));
  };
  
  const canAddMore = vehicles.length < 3;

  // --- Renderizado Principal (sin cambios visuales) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => router.push('/(resident)/information')} 
          style={styles.backButton}
        >
          <FontAwesome5 name="chevron-left" size={18} color={ACCENT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Vehículos</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainTitle}>Gestiona tus Vehículos</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Registrar nuevo vehículo</Text>
          
          <View style={styles.typeSelectorContainer}>
            <TouchableOpacity
              style={[styles.typeButton, vehicleType === 'carro' && styles.typeButtonActive]}
              onPress={() => { setVehicleType('carro'); setNewPlaca(''); }}
            >
              <FontAwesome5 name="car" size={20} color={vehicleType === 'carro' ? 'white' : ACCENT_COLOR} />
              <Text style={[styles.typeButtonText, vehicleType === 'carro' && styles.typeButtonTextActive]}>Carro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeButton, vehicleType === 'moto' && styles.typeButtonActive]}
              onPress={() => { setVehicleType('moto'); setNewPlaca(''); }}
            >
              <FontAwesome5 name="motorcycle" size={20} color={vehicleType === 'moto' ? 'white' : ACCENT_COLOR} />
              <Text style={[styles.typeButtonText, vehicleType === 'moto' && styles.typeButtonTextActive]}>Moto</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder={vehicleType === 'carro' ? 'ABC123' : 'ABC12D'}
            placeholderTextColor="#999"
            value={newPlaca}
            onChangeText={handlePlacaChange}
            autoCapitalize="characters"
            maxLength={6}
            editable={canAddMore && !isMutating}
          />
          
          <TouchableOpacity
            style={[styles.addButton, (!canAddMore || isMutating) && styles.addButtonDisabled]}
            onPress={handleRegister}
            disabled={!canAddMore || isMutating}
          >
            {isMutating ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.addButtonText}>Agregar Vehículo</Text>
            )}
          </TouchableOpacity>
          
          {!canAddMore && (
            <Text style={styles.limitText}>
              Has alcanzado el límite de 3 vehículos.
            </Text>
          )}
        </View>
        
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Vehículos Registrados ({vehicles.length}/3)</Text>
          {!isLoading && isMutating && <ActivityIndicator size="small" color={ACCENT_COLOR} style={{marginBottom: 10}} />}
          {renderVehicleList()}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos (sin cambios) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F7F7F7',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Raleway-Bold',
    color: '#1A1A1A',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 20,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    color: '#333',
    marginBottom: 15,
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
    fontFamily: 'Raleway-Bold',
    fontSize: 22,
    color: '#1A1A1A',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 3,
  },
  addButton: {
    backgroundColor: ACCENT_COLOR,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Raleway-Bold',
    fontSize: 16,
  },
  limitText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 15,
  },
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  loadingIndicator: {
    marginTop: 30,
  },
  emptyText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 30,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  carIcon: {
    color: ACCENT_COLOR,
    marginRight: 15,
    width: 30,
  },
  plateText: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    color: '#333',
    letterSpacing: 2,
  },
  deleteIcon: {
    color: '#D32F2F',
  },
});