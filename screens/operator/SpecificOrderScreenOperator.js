import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SpecificOrderScreenOperator = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrder();
    }, [orderId])
  );

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch(`http://13.60.13.114:5000/api/comenzi/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setOrder(data);
    } catch (e) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    Alert.alert('Confirmare', 'Sigur vrei să ștergi această comandă?', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try {
          const token = await AsyncStorage.getItem('token');
          const resp = await fetch(`http://13.60.13.114:5000/api/comenzi/${order.id}`, {
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
    navigation.navigate('EditOrderScreenOperator', { orderId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C47FF" />
      </View>
    );
  }
  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>Eroare la încărcarea comenzii.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalii comandă</Text>
        <View style={styles.card}>
          <Text style={styles.label}>ID Comandă:</Text>
          <Text style={styles.value}>{order.id}</Text>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{order.user_id}</Text>
          <Text style={styles.label}>Preț total:</Text>
          <Text style={styles.value}>{order.pret_total} lei</Text>
          <Text style={styles.label}>Discount:</Text>
          <Text style={styles.value}>{order.discount || 0} lei</Text>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{order.status || 'necunoscut'}</Text>
          {order.items && Array.isArray(order.items) && (
            <>
              <Text style={styles.label}>Produse/Servicii/Haine:</Text>
              {order.items.map((item, idx) => (
                <Text key={idx} style={styles.value}>- {typeof item === 'object' ? (item.nume || JSON.stringify(item)) : item}</Text>
              ))}
            </>
          )}
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
          <Ionicons name="create-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>Modifică comanda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete} disabled={deleting}>
          <Ionicons name="trash-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>{deleting ? 'Se șterge...' : 'Șterge comanda'}</Text>
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

export default SpecificOrderScreenOperator; 