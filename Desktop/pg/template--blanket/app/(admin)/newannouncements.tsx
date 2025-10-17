// app/(admin)/announcements.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
// Importa tu función de API para subir el anuncio

export default function AdminAnnouncementsScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'El título y el cuerpo del anuncio son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      // 🛑 Llama a tu API aquí para publicar el anuncio
      // await api.post('/admin/announcements', { title, body });
      
      Alert.alert('Éxito', 'Anuncio publicado correctamente.');
      setTitle('');
      setBody('');
    } catch (error) {
      console.error('Error al publicar anuncio:', error);
      Alert.alert('Error', 'No se pudo publicar el anuncio. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Subir Nuevo Anuncio</Text>
      
      <Text style={styles.label}>Título:</Text>
      <TextInput
        style={styles.input}
        placeholder="Título corto del anuncio"
        value={title}
        onChangeText={setTitle}
        editable={!loading}
      />
      
      <Text style={styles.label}>Cuerpo del Mensaje:</Text>
      <TextInput
        style={[styles.input, styles.bodyInput]}
        placeholder="Contenido completo del anuncio"
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={6}
        editable={!loading}
      />
      
      <Button
        title={loading ? "Publicando..." : "Publicar Anuncio"}
        onPress={handleSubmit}
        disabled={loading}
        color="#D86A6A"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  bodyInput: {
    height: 120,
    textAlignVertical: 'top',
  },
})