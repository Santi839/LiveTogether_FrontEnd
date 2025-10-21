// app/resident/_layout.tsx

import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
// Asegúrate de que esta ruta sea correcta
import '../../utils/axios-config'; 

export default function ResidentLayout() {
  return (
    <Tabs
      initialRouteName="announcements"
      screenOptions={{
        tabBarActiveTintColor: '#6A87D8',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        
        // 🟢 SOLUCIÓN PARA CENTRAR: distribuye el espacio igual entre los ítems visibles
        tabBarItemStyle: { flex: 1, justifyContent: 'center', alignItems: 'center' },
      }}
    >
      <Tabs.Screen
        name="my_reservations"
        options={{
          // 🛑 Oculta el botón de la barra de pestañas
          tabBarButton: () => null, 
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vehicules"
        options={{
          // 🛑 Oculta el botón de la barra de pestañas
          tabBarButton: () => null, 
          headerShown: false,
        }}
      />
      {/* 1. Pestañas VISIBLES */}
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Anuncios',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="bullhorn" size={20} color={focused ? color : '#888'} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservaciones',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="calendar-alt" size={20} color={focused ? color : '#888'} />
          ),
        }}
      />
      <Tabs.Screen
        name="information"
        options={{
          title: 'Información',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="info-circle" size={20} color={focused ? color : '#888'} />
          ),
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: 'Paquetes',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="box" size={20} color={focused ? color : '#888'} />
          ),
        }}
      />
      
      {/* 2. Rutas OCULTAS para Navegación Interna */}
      
      <Tabs.Screen
        name="reservation_details"
        options={{
          // 🛑 Oculta el botón de la barra de pestañas
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="guests"
        options={{
          // 🛑 Oculta el botón de la barra de pestañas
          tabBarButton: () => null, 
          headerShown: false,
        }}
      />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});