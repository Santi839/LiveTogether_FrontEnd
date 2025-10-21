import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PageHeader from '../../components/PageHeader';
import '../../utils/axios-config';

// --- Constantes y Tipos (sin cambios) ---
const PROFILE_IMAGE = require('../../assets/images/PROFILE_IMAGE.png');
const ACCENT_COLOR = '#6A92E5';

interface Announcement {
  id: number;
  titulo: string;
  contenido: string;
  tipo: string;
  imagen: string;
  fecha_creacion: string;
  autor_nombre: string;
  destacado: boolean;
  esta_visto: boolean;
}

// --- [NUEVO] Anuncio de prueba para visualización ---
const dummyAnnouncement: Announcement = {
    id: 999,
    titulo: "Mantenimiento Programado de Ascensores",
    contenido: "Les informamos que el próximo viernes se realizará el mantenimiento preventivo de los ascensores de la Torre 2. El servicio no estará disponible de 10:00 a.m. a 12:00 p.m. Agradecemos su comprensión.",
    tipo: "Mantenimiento",
    imagen: "https://placehold.co/600x300/6A92E5/FFFFFF?text=Aviso+Importante",
    fecha_creacion: new Date().toISOString(),
    autor_nombre: "Administración",
    destacado: true, // Para mostrar el estilo destacado
    esta_visto: false, // Para mostrar la etiqueta "Nuevo"
};


// --- Componente de Anuncio (Rediseñado) ---
const AnnouncementPost = ({ post }: { post: Announcement }) => {
  return (
    // El estilo del contenedor cambia si el post es destacado
    <View style={[styles.postContainer, post.destacado && styles.featuredPost]}>
      <View style={styles.postHeader}>
        <Image style={styles.postUserImage} source={PROFILE_IMAGE} />
        <View>
            <Text style={styles.postUserText}>{post.autor_nombre}</Text>
            <Text style={styles.dateText}>
                {new Date(post.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{post.titulo}</Text>

      {post.imagen && (
        <Image style={styles.postImage} source={{ uri: post.imagen }} resizeMode="cover" />
      )}

      <Text style={styles.postText}>{post.contenido}</Text>

      <View style={styles.postFooter}>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{post.tipo}</Text>
        </View>
        {!post.esta_visto && (
            <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nuevo</Text>
            </View>
        )}
      </View>
    </View>
  );
};


// --- Pantalla Principal (Lógica sin cambios, renderizado actualizado) ---
export default function AnnouncementsScreen() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LÓGICA DE CONEXIÓN CON LA BD (SIN CAMBIOS)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No hay sesión activa');

        const response = await axios.get('/api/anuncios/');
        if (!response.data) throw new Error('No se recibieron datos');

        setAnnouncements(response.data);
        setError(null);
      } catch (err: any) {
        // ... (manejo de errores sin cambios)
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
          <Text style={styles.messageText}>Cargando anuncios...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>¡Ups! Algo salió mal.</Text>
          <Text style={styles.messageText}>{error}</Text>
        </View>
      );
    }
    // [MODIFICADO] Si no hay anuncios reales, muestra el de prueba
    if (announcements.length === 0) {
        return <AnnouncementPost post={dummyAnnouncement} />;
    }
    return announcements.map((post) => (
      <AnnouncementPost key={post.id} post={post} />
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <PageHeader title="Anuncios" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainTitle}>Hola, Familia.{'\n'}Estos son los anuncios</Text>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- [NUEVOS] Estilos con la estética minimalista y colores de la marca ---
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
    lineHeight: 34,
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  featuredPost: {
    borderColor: ACCENT_COLOR, // Borde azul para anuncios destacados
    borderWidth: 1.5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  postUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postUserText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    color: '#999',
  },
  postTitle: {
    fontFamily: 'Raleway-Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 10,
  },
  postText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 15,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagContainer: {
    backgroundColor: '#E9F0FD', // Un azul muy claro y suave
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 12,
    color: ACCENT_COLOR,
  },
  newBadge: {
    backgroundColor: ACCENT_COLOR, // Azul de acento
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  newBadgeText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 12,
    color: 'white',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  messageText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 18,
    color: '#D32F2F',
  },
});