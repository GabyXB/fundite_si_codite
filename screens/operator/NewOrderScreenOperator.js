import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NewOrderScreenOperator = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [discount, setDiscount] = useState('0');
  const [pretTotal, setPretTotal] = useState('');
  const [items, setItems] = useState(''); // id-uri separate prin virgulă
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId.trim() || !pretTotal.trim() || !items.trim()) {
      Alert.alert('Eroare', 'Completează toate câmpurile obligatorii!');
      return;
    }
    if (isNaN(Number(pretTotal)) || Number(pretTotal) <= 0) {
      Alert.alert('Eroare', 'Prețul total trebuie să fie un număr pozitiv!');
      return;
    }
    if (isNaN(Number(discount)) || Number(discount) < 0) {
      Alert.alert('Eroare', 'Discountul trebuie să fie un număr pozitiv sau zero!');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch('http://13.60.13.114:5000/api/comenzi', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          discount: Number(discount),
          pret_total: Number(pretTotal),
          items: items.split(',').map((id) => id.trim()),
        })
      });
      if (resp.ok) {
        Alert.alert('Succes', 'Comanda a fost adăugată!');
        navigation.goBack();
      } else {
        const data = await resp.json();
        Alert.alert('Eroare', data.error || 'Eroare la adăugare.');
      }
    } catch (e) {
      Alert.alert('Eroare', 'Eroare de rețea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Adaugă comandă nouă</Text>
        <TextInput
          style={styles.input}
          placeholder="User ID*"
          value={userId}
          onChangeText={setUserId}
        />
        <TextInput
          style={styles.input}
          placeholder="Discount (lei)"
          value={discount}
          onChangeText={setDiscount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Preț total*"
          value={pretTotal}
          onChangeText={setPretTotal}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="ID-uri produse/servicii/haine* (ex: 1,2,3)"
          value={items}
          onChangeText={setItems}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          <Ionicons name="add-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>{loading ? 'Se adaugă...' : 'Adaugă comandă'}</Text>
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

export default NewOrderScreenOperator; 