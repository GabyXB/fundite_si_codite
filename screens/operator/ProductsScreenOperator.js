import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductsScreenOperator = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const resp = await fetch('http://13.60.13.114:5000/api/store', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigation.navigate('NewProductScreenOperator');
  };
  const handleDetails = (prod) => {
    navigation.navigate('SpecificProductScreenOperator', { productId: prod.id });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#6C47FF" />
      </TouchableOpacity>
      <Text style={styles.title}>Produse</Text>
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.addBtnText}>Adaugă produs</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#6C47FF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleDetails(item)} activeOpacity={0.85}>
              <View style={styles.card}>
                <Text style={styles.name}>{item.nume}</Text>
                <Text style={styles.price}>{item.pret} lei</Text>
                <Text style={styles.qty}>Stoc: {item.cantitate} | Categorie: {item.categorie}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
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
  price: {
    fontSize: 16,
    color: '#6C47FF',
    marginTop: 2,
  },
  qty: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
});

export default ProductsScreenOperator; 