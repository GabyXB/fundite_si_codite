import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';


const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        Alert.alert('Eroare', 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
        navigation.navigate('Login');
        return;
      }

      console.log('Fetching orders for user:', userId); // Debug log

      const response = await fetch(`http://13.60.13.114:5000/api/comenzi/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Orders data:', data); // Debug log
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Eroare', 'Nu am putut încărca istoricul comenzilor.');
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

  const handleOrderPress = (orderId) => {
    console.log('Navigating to order details:', orderId); // Debug log
    navigation.navigate('OrderDetails', { orderId });
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
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Istoric Comenzi</Text>
          <View style={styles.placeholder} />
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nu aveți comenzi în istoric</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order.id)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Comanda #{order.id}</Text>
                <Text style={[
                  styles.orderStatus,
                  { color: order.status === 'pending' ? '#F59E0B' : '#10B981' }
                ]}>
                  {order.status === 'pending' ? 'În procesare' : 'Finalizată'}
                </Text>
              </View>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{order.pret_total} RON</Text>
                <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))
        )}
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
    padding: 8,
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginRight: 20,
    marginLeft: 20,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.title,
  },
  orderStatus: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  orderDate: {
    fontSize: moderateScale(14),
    color: colors.text,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.title,
  },
});

export default OrderHistoryScreen; 