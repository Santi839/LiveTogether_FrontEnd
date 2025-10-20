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
import { colorFondo } from '../../app/index';
import PageHeader from '../../components/PageHeader';
import '../../utils/axios-config';


// IMPORTACIONES LOCALES DE IMÁGENES (Asegúrate de que estas rutas sean correctas)
const PROFILE_IMAGE = require('../../assets/images/PROFILE_IMAGE.png');

// Definimos la interfaz para el anuncio
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

const AnnouncementPost = ({ post }: { post: Announcement }) => {
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image style={styles.postUserImage} source={PROFILE_IMAGE} />
        <Text style={styles.postUserText}>{post.autor_nombre}</Text>
        <Text style={styles.dateText}>
          {new Date(post.fecha_creacion).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.postTitle}>{post.titulo}</Text>

      {post.imagen && (
        <Image
          style={styles.postImage}
          source={{ uri: post.imagen }}
          resizeMode="cover"
        />
      )}

      <Text style={styles.postText}>{post.contenido}</Text>

      <View style={styles.postFooter}>
        <View style={[styles.tagContainer, { backgroundColor: post.destacado ? '#FFD700' : '#E8E8E8' }]}>
          <Text style={styles.tagText}>{post.tipo}</Text>
        </View>
        {!post.esta_visto && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Nuevo</Text></View>}
      </View>
    </View>
  );
};

export default function AnnouncementsScreen() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LÓGICA DE CONEXIÓN CON LA BD usando useEffect
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);

        // Verificar si tenemos token
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No hay sesión activa');
        }

        console.log('Solicitando anuncios...');
        console.log('Token:', token);

        const response = await axios.get('/api/anuncios/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        console.log('URL completa:', axios.defaults.baseURL + '/api/anuncios/');
        console.log('Headers enviados:', {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        });
        console.log('Respuesta del servidor:', response.data);

        if (!response.data) {
          throw new Error('No se recibieron datos del servidor');
        }

        setAnnouncements(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error al cargar anuncios:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
            router.replace('/(auth)/login');
          } else if (err.response?.status === 404) {
            setError("No se encontraron anuncios.");
          } else if (err.response) {
            setError(`Error del servidor: ${err.response.data.message || 'Error desconocido'}`);
          } else if (err.request) {
            setError("No se pudo conectar con el servidor. Verifica tu conexión.");
          }
        } else {
          setError(err.message || "Ocurrió un error inesperado.");
        }

        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // CONTENIDO DINÁMICO (sin cambios funcionales)
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A87D8" />
          <Text style={styles.loadingText}>Cargando anuncios...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>¡Error! {error}</Text>
          <Text style={styles.loadingText}>Por favor, intenta de nuevo más tarde.</Text>
        </View>
      );
    }

    if (announcements.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No hay anuncios disponibles en este momento.</Text>
        </View>
      );
    }

    return announcements.map((post) => (
      <AnnouncementPost key={post.id} post={post} />
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>
          <PageHeader title="Anuncios" />
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Anuncios aquí</Text>
          </View>
        </View>

        {renderContent()}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorFondo,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  titleContainer: {
    padding: 15,
  },
  greetingText: {
    fontSize: 20,
    fontFamily: 'Raleway-Regular',
    color: '#555',
  },
  mainTitle: {
    fontSize: 25,
    fontFamily: 'Raleway-Bold',
    color: '#001F3F',
    marginTop: 5,
    textAlign: 'left',
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postUserImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  postUserText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dateText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  postTitle: {
    fontFamily: 'Raleway-Bold',
    fontSize: 18,
    color: '#001F3F',
    marginBottom: 10,
  },
  postText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    color: '#333',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 12,
    color: 'white',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  errorText: {
    fontFamily: 'Raleway-Bold',
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});