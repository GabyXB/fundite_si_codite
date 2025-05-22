import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmployeeDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { employeeId } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchEmployee = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          const resp = await fetch(`http://13.60.13.114:5000/api/angajati/${employeeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await resp.json();
          if (resp.ok && isActive) setEmployee(data);
          else if (isActive) Alert.alert('Eroare', data.error || 'Eroare la încărcare.');
        } catch (e) {
          if (isActive) Alert.alert('Eroare', 'Eroare de rețea.');
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchEmployee();
      return () => { isActive = false; };
    }, [employeeId])
  );

  const handleDelete = async () => {
    Alert.alert('Confirmare', `Sigur vrei să ștergi angajatul ${employee.nume} ${employee.prenume}?`, [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const resp = await fetch(`http://13.60.13.114:5000/api/angajati/${employee.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) {
            Alert.alert('Succes', 'Angajat șters cu succes!');
            navigation.goBack();
          } else {
            const data = await resp.json();
            Alert.alert('Eroare', data.error || 'Eroare la ștergere.');
          }
        } catch (e) {
          Alert.alert('Eroare', 'Eroare de rețea.');
        }
      }}
    ]);
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#6C47FF" /></View>;
  }
  if (!employee) {
    return <View style={styles.container}><Text style={{ color: '#FF3B30' }}>Eroare la încărcare angajat.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalii angajat</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Nume:</Text>
          <Text style={styles.value}>{employee.nume}</Text>
          <Text style={styles.label}>Prenume:</Text>
          <Text style={styles.value}>{employee.prenume}</Text>
          <Text style={styles.label}>Rol:</Text>
          <Text style={styles.value}>{employee.rol === 0 ? 'Stilist' : 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditEmployeeScreen', { employeeId })}>
          <Ionicons name="create-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.editBtnText}>Editează</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: '#FF3B30' }]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.editBtnText}>Șterge</Text>
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
  editBtn: {
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
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EmployeeDetailsScreen; 