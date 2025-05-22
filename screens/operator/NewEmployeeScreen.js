import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NewEmployeeScreen = () => {
  const navigation = useNavigation();
  const [nume, setNume] = useState('');
  const [prenume, setPrenume] = useState('');
  const [rol, setRol] = useState(0); // 0 = Stilist, 1 = Admin

  const handleSubmit = async () => {
    if (!nume.trim() || !prenume.trim()) {
      Alert.alert('Eroare', 'Completează toate câmpurile!');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch('http://13.60.13.114:5000/api/angajati', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nume, prenume, rol })
      });
      if (resp.ok) {
        Alert.alert('Succes', 'Angajat adăugat cu succes!');
        navigation.goBack();
      } else {
        const data = await resp.json();
        Alert.alert('Eroare', data.error || 'Eroare la adăugare.');
      }
    } catch (e) {
      Alert.alert('Eroare', 'Eroare de rețea.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Adaugă angajat</Text>
        <TextInput
          style={styles.input}
          placeholder="Nume"
          value={nume}
          onChangeText={setNume}
        />
        <TextInput
          style={styles.input}
          placeholder="Prenume"
          value={prenume}
          onChangeText={setPrenume}
        />
        <View style={styles.roleRow}>
          <TouchableOpacity style={[styles.roleBtn, rol === 0 && styles.roleBtnActive]} onPress={() => setRol(0)}>
            <Text style={[styles.roleText, rol === 0 && styles.roleTextActive]}>Stilist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleBtn, rol === 1 && styles.roleBtnActive]} onPress={() => setRol(1)}>
            <Text style={[styles.roleText, rol === 1 && styles.roleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="person-add" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>Adaugă</Text>
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  roleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  roleBtnActive: {
    backgroundColor: '#6C47FF',
  },
  roleText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleTextActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NewEmployeeScreen; 