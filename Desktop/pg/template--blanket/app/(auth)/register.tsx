import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

// ✅ CAMBIO 1: Agrega 'torre' a la "forma" de tu estado
interface RegisterFormState {
  numero_apartamento: string;
  nombre_completo: string;
  correo: string;
  password: string;
  confirmPassword: string;
  torre: string; // <-- Agregado
}

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // ✅ CAMBIO 2: Inicializa 'torre' en el estado
  const [form, setForm] = useState<RegisterFormState>({
    numero_apartamento: '',
    nombre_completo: '',
    correo: '',
    password: '',
    confirmPassword: '',
    torre: '' // <-- Agregado
  });

  const handleRegister = async () => {
    if (loading) return;

    // ✅ CAMBIO 3: Agrega 'torre' a la validación de campos
    if (!form.numero_apartamento || !form.password || !form.confirmPassword || !form.nombre_completo || !form.correo || !form.torre) {
      Toast.show({ type: 'error', text1: 'Campos incompletos', text2: 'Todos los campos son obligatorios' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error en contraseñas', text2: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);

    try {
      // ✅ CAMBIO 4: Ajusta el payload para que coincida 100% con el serializer
      const payload = {
        // No uses parseInt, la DB espera 'character varying' (un string)
        numero_apartamento: form.numero_apartamento, 
        nombre_completo: form.nombre_completo,
        correo: form.correo,
        password: form.password,
        // El backend espera 'password_confirmation', no 'confirmPassword'
        password_confirmation: form.confirmPassword, // <-- Agregado
        torre: form.torre, // <-- Agregado
        rol: 'residente'
      };

      console.log("Enviando Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post('http://localhost:8000/api/usuarios/registro/', payload);

      Toast.show({ type: 'success', text1: 'Registro exitoso', text2: 'Tu cuenta ha sido creada correctamente' });
      router.replace('/(auth)/login');

    } catch (error: any) {
      console.error('Error del servidor:', error.response?.data);
      
      let errorMessage = 'Error de conexión. Inténtalo más tarde.';

      if (axios.isAxiosError(error) && error.response) {
        // Manejar errores de validación del backend
        if (error.response.data.errors) {
            const errors = error.response.data.errors;
            // Tomar el primer mensaje de error
            const firstErrorKey = Object.keys(errors)[0];
            errorMessage = errors[firstErrorKey][0]; 
        } else {
            errorMessage = error.response.data.message || 'Los datos enviados son inválidos.';
        }
      }

      Toast.show({ type: 'error', text1: 'Error de registro', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.logoContainer}>
        <FontAwesome5 name="house-user" size={80} color="#001F3F" />
        <Text style={styles.logoText}>LIFETOGETHER</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>
        
        <Text style={styles.label}>Número de Apartamento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 101"
          placeholderTextColor="#888"
          // keyboardType="numeric" // Quitado para permitir aptos como "101A"
          value={form.numero_apartamento}
          onChangeText={(text) => setForm({ ...form, numero_apartamento: text })}
        />

        {/* ✅ CAMBIO 5: Agrega el campo 'Torre' al formulario */}
        <Text style={styles.label}>Torre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 1"
          placeholderTextColor="#888"
          value={form.torre}
          onChangeText={(text) => setForm({ ...form, torre: text })}
        />

        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nombre completo"
          placeholderTextColor="#888"
          value={form.nombre_completo}
          onChangeText={(text) => setForm({ ...form, nombre_completo: text })}
        />
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.correo}
          onChangeText={(text) => setForm({ ...form, correo: text })}
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu contraseña"
          placeholderTextColor="#888"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
        />
        <Text style={styles.label}>Confirmar Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirma tu contraseña"
          placeholderTextColor="#888"
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
        />
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    marginBottom: 0,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Raleway-Bold',
    color: '#001F3F',
    marginTop: 10,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    padding: 25,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'stretch',
    marginTop: 120,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    color: '#001F3F',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Raleway-Regular',
    color: '#000',
  },
  registerButton: {
    backgroundColor: '#6A87D8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#6A87D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    fontWeight: 'normal',
  },
  backButton: {
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6A87D8',
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    textDecorationLine: 'underline',
  }
});