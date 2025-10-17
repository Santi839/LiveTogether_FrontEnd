// app/(admin)/_layout.tsx

import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
// ⚠️ Asegúrate de que esta ruta sea correcta para la configuración de Axios
import '../../utils/axios-config'; 

export default function AdminLayout() {
  return (
    <Tabs
      initialRouteName="announcements"
      screenOptions={{
        tabBarActiveTintColor: '#D86A6A', // Color distintivo para Admin
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="announcements" // Mapea a announcements.tsx
        options={{
          title: 'Subir Anuncios',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="bullhorn" size={20} color={focused ? color : '#888'} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations" // Mapea a reservations.tsx
        options={{
          title: 'Gestión de Reservas',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="calendar-check" size={20} color={focused ? color : '#888'} />
          ),
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