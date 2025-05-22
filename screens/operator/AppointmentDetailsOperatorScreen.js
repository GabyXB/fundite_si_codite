import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

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

const AppointmentDetailsOperatorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchAppointment();
    }, [appointmentId])
  );

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch(`http://13.60.13.114:5000/api/programari/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setAppointment(data);
    } catch (e) {
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!appointment) return;
    setChangingStatus(true);
    const nextStatus = appointment.status === 2 ? -1 : appointment.status + 1;
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch(`http://13.60.13.114:5000/api/programari/confirma/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      if (resp.ok) {
        fetchAppointment();
      }
    } catch {}
    setChangingStatus(false);
  };

  const handleDelete = async () => {
    if (!appointment) return;
    Alert.alert('Confirmare', 'Sigur vrei să ștergi această programare?', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try {
          const token = await AsyncStorage.getItem('token');
          const resp = await fetch(`http://13.60.13.114:5000/api/programari/sterge/${appointment.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) {
            navigation.goBack();
          }
        } catch {}
        setDeleting(false);
      }}
    ]);
  };

  const handleEdit = () => {
    // TODO: Navighează la ecran de editare sau deschide modal
    Alert.alert('Funcționalitate demo', 'Modificare programare - de implementat.');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C47FF" />
      </View>
    );
  }
  if (!appointment) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>Eroare la încărcarea programării.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalii programare</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Client:</Text>
          <Text style={styles.value}>{appointment.user?.name || `user_id: ${appointment.user_id}` || '-'}</Text>
          <Text style={styles.label}>Email client:</Text>
          <Text style={styles.value}>{appointment.user?.email || '-'}</Text>
          <Text style={styles.label}>Animal:</Text>
          <Text style={styles.value}>{appointment.pet?.name || '-'}</Text>
          <Text style={styles.label}>Specie:</Text>
          <Text style={styles.value}>{appointment.pet?.specie || '-'}</Text>
          <Text style={styles.label}>Talie:</Text>
          <Text style={styles.value}>{appointment.pet?.talie || '-'}</Text>
          <Text style={styles.label}>Vârstă:</Text>
          <Text style={styles.value}>{appointment.pet?.age || '-'}</Text>
          {appointment.pet?.image && (
            <>
              <Text style={styles.label}>Imagine animal:</Text>
              <Text style={styles.value}>{appointment.pet.image}</Text>
            </>
          )}
          <Text style={styles.label}>Stilist:</Text>
          <Text style={styles.value}>
            {appointment.employee ? `${appointment.employee.nume} ${appointment.employee.prenume}` : appointment.angajat_id || '-'}
          </Text>
          <Text style={styles.label}>Serviciu:</Text>
          <Text style={styles.value}>{appointment.serviciu?.nume || '-'}</Text>
          <Text style={styles.label}>Data și ora:</Text>
          <Text style={styles.value}>{new Date(appointment.timestamp).toLocaleString('ro-RO')}</Text>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: statusColors[appointment.status] }]}>{statusLabels[appointment.status]}</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={handleChangeStatus} disabled={changingStatus}>
          <Ionicons name="swap-vertical" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>{changingStatus ? 'Se schimbă...' : 'Schimbă statusul'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]} onPress={handleDelete} disabled={deleting}>
          <Ionicons name="trash-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>{deleting ? 'Se șterge...' : 'Șterge programarea'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFA726' }]} onPress={handleEdit}>
          <Ionicons name="create-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>Modifică programarea</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#6C47FF',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
  },
  actionBtn: {
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppointmentDetailsOperatorScreen; 