import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditServiceScreenOperator = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceId } = route.params;
  const [nume, setNume] = useState('');
  const [pret, setPret] = useState('');
  const [detalii, setDetalii] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchService();
    }, [serviceId])
  );

  const fetchService = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch(`http://13.60.13.114:5000/api/servicii/${serviceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setNume(data.nume || '');
      setPret(data.pret?.toString() || '');
      setDetalii(data.detalii || '');
    } catch (e) {
      Alert.alert('Eroare', 'Nu s-au putut încărca detaliile serviciului.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!nume.trim() || !pret.trim()) {
      Alert.alert('Eroare', 'Completează numele și prețul!');
      return;
    }
    if (isNaN(Number(pret)) || Number(pret) <= 0) {
      Alert.alert('Eroare', 'Prețul trebuie să fie un număr pozitiv!');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch(`http://13.60.13.114:5000/api/servicii/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nume,
          pret: Number(pret),
          detalii,
        })
      });
      if (resp.ok) {
        Alert.alert('Succes', 'Serviciu modificat cu succes!');
        navigation.goBack();
      } else {
        const data = await resp.json();
        Alert.alert('Eroare', data.error || 'Eroare la modificare.');
      }
    } catch (e) {
      Alert.alert('Eroare', 'Eroare de rețea.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#6C47FF" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Modifică serviciu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nume serviciu*"
          value={nume}
          onChangeText={setNume}
        />
        <TextInput
          style={styles.input}
          placeholder="Preț*"
          value={pret}
          onChangeText={setPret}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Detalii"
          value={detalii}
          onChangeText={setDetalii}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
          <Ionicons name="save" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>{saving ? 'Se salvează...' : 'Salvează modificările'}</Text>
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

export default EditServiceScreenOperator; 