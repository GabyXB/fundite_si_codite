import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const EmployeeCard = ({ employee, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{employee.nume} {employee.prenume}</Text>
      <Text style={styles.role}>{employee.rol === 0 ? 'Stilist' : 'Admin'}</Text>
    </View>
    <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(employee)}>
      <Ionicons name="create-outline" size={22} color="#6C47FF" />
    </TouchableOpacity>
    <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(employee)}>
      <Ionicons name="trash-outline" size={22} color="#FF3B30" />
    </TouchableOpacity>
  </View>
);

const EmployeesOperator = () => {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchEmployees();
    }, [])
  );

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch('http://13.60.13.114:5000/api/angajati', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigation.navigate('NewEmployeeScreen');
  };
  const handleEdit = (emp) => {
    navigation.navigate('EditEmployeeScreen', { employeeId: emp.id });
  };
  const handleDetails = (emp) => {
    navigation.navigate('EmployeeDetailsScreen', { employeeId: emp.id });
  };
  const handleDelete = async (emp) => {
    Alert.alert('Confirmare', `Sigur vrei să ștergi angajatul ${emp.nume} ${emp.prenume}?`, [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const resp = await fetch(`http://13.60.13.114:5000/api/angajati/${emp.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) fetchEmployees();
        } catch {}
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#6C47FF" />
      </TouchableOpacity>
      <Text style={styles.title}>Angajați</Text>
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Ionicons name="person-add" size={22} color="#fff" />
        <Text style={styles.addBtnText}>Adaugă angajat</Text>
      </TouchableOpacity>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDetails(item)} activeOpacity={0.85}>
            <EmployeeCard employee={item} onEdit={handleEdit} onDelete={handleDelete} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshing={loading}
        onRefresh={fetchEmployees}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 18,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  role: {
    fontSize: 14,
    color: '#6C47FF',
    marginTop: 2,
  },
  iconBtn: {
    marginLeft: 12,
    padding: 6,
  },
});

export default EmployeesOperator; 