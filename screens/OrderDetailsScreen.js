import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../components/BottomNavigation';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';


const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      Alert.alert('Eroare', 'ID-ul comenzii lipsește');
      navigation.goBack();
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Eroare', 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
        navigation.navigate('Login');
        return;
      }

      console.log('Fetching order details for ID:', orderId);
      const response = await fetch(`http://13.60.13.114:5000/api/comenzi/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const orderData = await response.json();
      console.log('Received order data:', orderData);
      setOrder(orderData);

    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert(
        'Eroare',
        'Nu am putut încărca detaliile comenzii. Vă rugăm să încercați din nou.'
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D3FE7" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nu am putut găsi detaliile comenzii.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.title} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalii Comandă</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Comanda #{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.status, { color: order.status === 'pending' ? '#F59E0B' : '#10B981' }]}>
              {order.status === 'pending' ? 'În procesare' : 'Finalizată'}
            </Text>
          </View>
        </View>

        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Produse comandate</Text>
          {order.items && order.items.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image 
                source={{ uri: item.imagine || 'https://via.placeholder.com/150' }} 
                style={styles.productImage} 
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.nume}</Text>
                <View style={styles.productDetails}>
                  <View style={styles.quantityContainer}>
                    <Ionicons name="cube-outline" size={16} color="#94A3B8" />
                    <Text style={styles.quantityText}>{item.cantitate} bucăți</Text>
                  </View>
                  <Text style={styles.price}>{item.pret} RON</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{order.pret_total} RON</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Reducere</Text>
              <Text style={[styles.summaryValue, styles.discount]}>-{order.discount} RON</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.pret_total - (order.discount || 0)} RON</Text>
          </View>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    marginRight: 20,
    marginLeft: 20,
    paddingBottom: 80, // Spațiu pentru BottomNavigation
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
    marginLeft: -10,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: -4,
          height: -4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.title,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  orderInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  productsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  discount: {
    color: '#10B981',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: colors.text,
  },
  label: {
    fontSize: moderateScale(14),
    color: colors.text,
    marginBottom: 4,
  },
  value: {
    fontSize: moderateScale(16),
    color: colors.title,
    fontWeight: '500',
  },
  statusText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen; 