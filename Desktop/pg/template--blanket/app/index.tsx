import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          router.replace('/(resident)/announcements');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        console.warn(e);
        router.replace('/(auth)/login');
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export const colorFondo = '#FFFFFF';
export const colorPrincipal = '#0D47A1';
export const colorSecundario = '#1976D2';
export const colorTerciario = '#BBDEFB';
export const colorTextoClaro = '#FFFFFF';
export const colorTextoOscuro = '#000000';