import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const statusLabels = {
  '-1': 'Anulată',
  0: 'În așteptare',
  1: 'Confirmată',
  2: 'Finalizată',
};
const statusColors = {
  '-1': '#FF3B30',
  0: '#FFA726',
  1: '#6C47FF',
  2: '#43A047',
};

const AppointmentCard = ({ appt, onChangeStatus, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={{ flex: 1 }}>
      <Text style={styles.client}>
        {appt.user?.name || appt.client || `user_id: ${appt.user_id}`} (
        {appt.pet && typeof appt.pet === 'object' ? appt.pet.name : appt.pet || '-'}
        )
      </Text>
      <Text style={styles.date}>{new Date(appt.timestamp || appt.date).toLocaleString('ro-RO')}</Text>
      <Text style={[styles.status, { color: statusColors[appt.status] }]}>{statusLabels[appt.status]}</Text>
    </View>
    <TouchableOpacity style={styles.iconBtn} onPress={() => onChangeStatus(appt)}>
      <Ionicons name="swap-vertical" size={22} color="#6C47FF" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const AppointmentsOperator = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch('http://13.60.13.114:5000/api/programari', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      console.log('Programari operator:', data);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (appt) => {
    // Ciclare status demo: -1, 0, 1, 2
    const nextStatus = appt.status === 2 ? -1 : appt.status + 1;
    Alert.alert('Schimbă status', `Vrei să schimbi statusul la "${statusLabels[nextStatus]}"?`, [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Schimbă', style: 'default', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const resp = await fetch(`http://13.60.13.114:5000/api/programari/confirma/${appt.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: nextStatus })
          });
          if (resp.ok) fetchAppointments();
        } catch {}
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#6C47FF" />
      </TouchableOpacity>
      <Text style={styles.title}>Programări</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AppointmentCard 
            appt={item} 
            onChangeStatus={handleChangeStatus} 
            onPress={() => navigation.navigate('AppointmentDetailsOperator', { appointmentId: item.id })}
          />
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshing={loading}
        onRefresh={fetchAppointments}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6C47FF',
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  client: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  date: {
    fontSize: 14,
    color: '#6C47FF',
    marginTop: 2,
  },
  status: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 6,
  },
  iconBtn: {
    marginLeft: 12,
    padding: 6,
  },
});

export default AppointmentsOperator; 