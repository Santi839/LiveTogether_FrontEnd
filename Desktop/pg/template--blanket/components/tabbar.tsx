import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

// Definimos un tipo para los íconos para mayor claridad
type IconName = 'bell' | 'package' | 'calendar' | 'user';

// Definimos la estructura de cada botón del tab bar
const tabRoutes: { path: string; icon: IconName; name: string }[] = [
  { path: '/(resident)/announcements', icon: 'bell', name: 'Anuncios' },
  { path: '/(resident)/packages', icon: 'package', name: 'Paquetes' },
  { path: '/(resident)/reservations', icon: 'calendar', name: 'Reservas' },
  { path: '/(resident)/profile', icon: 'user', name: 'Perfil' },
];

const ACTIVE_COLOR = '#6A92E5'; // Azul
const INACTIVE_COLOR = '#9DB2CE'; // Un gris azulado para inactivos

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname(); // Hook para saber la ruta activa

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {tabRoutes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <TouchableOpacity
              key={route.path}
              onPress={() => router.replace(route.path)}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={route.name}
            >
              <Feather
                name={route.icon}
                size={26}
                color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    // Permite que el contenedor no bloquee los toques detrás de él (solo el tab bar lo hará)
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 25,
    height: 60,
    // Sombra para el efecto flotante
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});
