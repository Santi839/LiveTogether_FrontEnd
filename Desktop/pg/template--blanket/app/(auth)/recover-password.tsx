import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';

export default function RecoverPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleRecoverPassword = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa tu correo electrónico' });
      return;
    }

    try {
      const response = await axios.post('https://localhost:8000/api/usuarios/reset-password', {
        email,
      });

      Toast.show({
        type: 'success',
        text1: 'Correo enviado',
        text2: 'Revisa tu bandeja para continuar con la recuperación.',
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo enviar el correo de recuperación. Verifica el email o intenta más tarde.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleRecoverPassword}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F0F0F0' },
  title: { fontSize: 24, fontFamily: 'Raleway-Bold', marginBottom: 20, color: '#001F3F' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#6A87D8', borderRadius: 10, padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Raleway-Bold' },
});
