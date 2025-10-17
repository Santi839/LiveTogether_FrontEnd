// app/(admin)/reservations.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

// 🛑 INTERFAZ: Define el tipo de dato de cada reserva
interface Reservation {
  id: string;
  commonArea: string;
  residentName: string;
  requestedAt: string; // ISOString de la fecha de solicitud
  status: 'pendiente_pago' | 'aprobada' | 'cancelada';
}

// Importa tu función de API para obtener y actualizar reservas
// import { getReservations, updateReservationStatus } from 'your/api/service'; 

export default function AdminReservationsScreen() {
  // 🛑 TIPADO DEL ESTADO: Inicializado como un array de Reservation
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulación de fetch de datos (Reemplazar con llamada a la API)
  const fetchReservations = () => {
    setLoading(true);
    // Simulación de datos: Dos pendientes (uno expirado, uno activo) y uno aprobado
    const data: Reservation[] = [
        { id: 'R001', commonArea: 'Piscina', residentName: 'Juan Pérez', requestedAt: new Date(Date.now() - 12 * 3600000).toISOString(), status: 'pendiente_pago' }, 
        { id: 'R002', commonArea: 'Salón Comunal', residentName: 'Ana Gómez', requestedAt: new Date(Date.now() - 25 * 3600000).toISOString(), status: 'pendiente_pago' }, 
        { id: 'R003', commonArea: 'Gimnasio', residentName: 'Carlos Ruiz', requestedAt: new Date(Date.now() - 40 * 3600000).toISOString(), status: 'aprobada' },
    ];
    // En una app real, aquí llamarías a tu API: setReservations(await getReservations());
    setReservations(data.filter(r => r.status !== 'cancelada')); // Muestra solo activas
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: 'aprobada' | 'cancelada') => {
    Alert.alert(
      'Confirmar Acción',
      `¿Desea ${newStatus === 'aprobada' ? 'APROBAR' : 'CANCELAR'} la reserva ${id}?`,
      [
        { text: 'No' },
        {
          text: 'Sí',
          onPress: async () => {
            // 🛑 Lógica de API: Llamar para actualizar el estado en el Backend
            // try { await updateReservationStatus(id, newStatus); } catch (e) { ... }
            
            // Actualizar el estado local (esto es lo que causaba el error)
            setReservations(prev => 
              // prev es de tipo Reservation[]
              prev.map(res => 
                // res es de tipo Reservation
                res.id === id ? { ...res, status: newStatus } : res
              )
              // Filtra para que las canceladas desaparezcan de la vista del admin
              .filter(res => res.status === 'pendiente_pago' || res.status === 'aprobada')
            );
          },
        },
      ],
    );
  };

  // 🛑 TIPADO DEL ITEM: Asegura que el parámetro 'item' sea de tipo Reservation
  const renderReservationItem = ({ item }: { item: Reservation }) => {
    const requestedTime = new Date(item.requestedAt).getTime();
    const expirationTime = requestedTime + 24 * 60 * 60 * 1000;
    const isExpired = Date.now() > expirationTime;
    const remainingHours = isExpired ? 0 : Math.round((expirationTime - Date.now()) / 3600000);

    const cardColor = item.status === 'aprobada' ? '#e8f5e9' : (isExpired ? '#ffebee' : '#fff3e0');
    const statusColor = item.status === 'aprobada' ? 'green' : (isExpired ? 'red' : 'orange');

    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={styles.cardTitle}>Reserva: {item.commonArea} (ID: {item.id})</Text>
        <Text>Residente: {item.residentName}</Text>
        
        <Text style={{ color: statusColor, fontWeight: 'bold', marginTop: 5 }}>
          Estado: {item.status.toUpperCase().replace('_PAGO', ' PAGO')}
        </Text>
        
        {item.status === 'pendiente_pago' && (
          <Text style={{ color: isExpired ? 'red' : 'orange', fontSize: 12 }}>
            {isExpired 
                ? '¡EXPIRÓ! (Pendiente de cancelación automática)' 
                : `Tiempo restante: ${remainingHours} horas`}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          {item.status === 'pendiente_pago' && (
            <TouchableOpacity 
              style={[styles.button, styles.approveButton]} 
              onPress={() => handleUpdateStatus(item.id, 'aprobada')}
            >
              <Text style={styles.buttonText}>APROBAR PAGO</Text>
            </TouchableOpacity>
          )}
          {item.status !== 'cancelada' && (
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => handleUpdateStatus(item.id, 'cancelada')}
            >
              <Text style={styles.buttonText}>CANCELAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
      return <Text style={{ textAlign: 'center', marginTop: 50 }}>Cargando Reservas...</Text>;
  }

  return (
    <View style={styles.managementContainer}>
      <Text style={styles.header}>Gestión de Reservas</Text>
      <FlatList
        data={reservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay reservas pendientes de acción.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  managementContainer: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 15, textAlign: 'center', color: '#333' },
  card: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#D86A6A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 },
  button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginLeft: 10 },
  approveButton: { backgroundColor: '#4CAF50' },
  cancelButton: { backgroundColor: '#F44336' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});