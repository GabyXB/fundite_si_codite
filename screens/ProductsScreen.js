import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params || { category: 'all' };
  const { signOut } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchServices();
    fetchCart();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`http://13.60.32.137:5000/api/store`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchServices = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('http://13.60.32.137:5000/api/servicii', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) return;

      const response = await fetch('http://13.60.32.137:5000/api/cos/vezi', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart.CartItems || []);
      }
    } catch (err) {
      console.error('Eroare la preluarea coșului:', err);
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        Alert.alert('Eroare', 'Trebuie să fii autentificat pentru a adăuga produse în coș');
        return;
      }

      const response = await fetch('http://13.60.32.137:5000/api/cos/adaugare', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          product_id: productId,
          cantitate: 1 
        }),
      });

      if (response.ok) {
        fetchCart();
        Alert.alert('Succes', 'Produsul a fost adăugat în coș');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la adăugarea produsului în coș');
      }
    } catch (err) {
      Alert.alert('Eroare', err.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    fetchServices();
    fetchCart();
  };

  const filteredProducts = products.filter(product =>
    product.nume.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.nume.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductCard = (product) => (
    <TouchableOpacity key={product.id} style={styles.productCard}>
      <Image 
        source={{ uri: product.imagine || 'https://via.placeholder.com/150' }} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.nume}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={styles.ratingText}>{product.rating || 4.5}</Text>
          <Text style={styles.reviewCount}>({product.reviews || 0})</Text>
        </View>
        <Text style={styles.price}>{product.pret} RON</Text>
      </View>
      <TouchableOpacity 
        style={styles.addToCartButton}
        onPress={() => addToCart(product.id)}
      >
        <Ionicons name="add-circle" size={24} color="#2D3FE7" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderServiceCard = (service) => (
    <TouchableOpacity key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.nume}</Text>
        <Text style={styles.serviceDescription}>{service.detalii}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{service.rating || 4.5}</Text>
            <Text style={styles.reviewCount}>({service.reviews || 0})</Text>
          </View>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color="#94A3B8" />
            <Text style={styles.durationText}>{service.durata || 60} minute</Text>
          </View>
        </View>
        <Text style={styles.servicePrice}>{service.pret} RON</Text>
      </View>
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => navigation.navigate('NewAppointment', { serviceId: service.id })}
      >
        <Ionicons name="calendar" size={24} color="#2D3FE7" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {category === 'grooming' ? 'Grooming' :
           category === 'styling' ? 'Styling' :
           category === 'health' ? 'Health' :
           category === 'spa' ? 'Spa' : 'Toate Produsele'}
        </Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart" size={24} color="#1F2937" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Caută produse sau servicii..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Produse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            Servicii
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Se încarcă...</Text>
          </View>
        ) : activeTab === 'products' ? (
          filteredProducts.length > 0 ? (
            filteredProducts.map(renderProductCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nu există produse în această categorie</Text>
            </View>
          )
        ) : filteredServices.length > 0 ? (
          filteredServices.map(renderServiceCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nu există servicii în această categorie</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(149, 157, 165, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#2D3FE7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(149, 157, 165, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#94A3B8',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3FE7',
    marginTop: 4,
  },
  addToCartButton: {
    padding: 8,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(149, 157, 165, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  durationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#94A3B8',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3FE7',
    marginTop: 8,
  },
  bookButton: {
    padding: 8,
  },
});

export default ProductsScreen; 