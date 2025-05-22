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
  Alert,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows, neumorphic } from '../utils/theme';
import { useFocusEffect } from '@react-navigation/native';



const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stockIssues, setStockIssues] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(1));

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        setError('Trebuie să fii autentificat pentru a vedea coșul');
        return;
      }

      const response = await fetch(`http://13.60.13.114:5000/api/cos/vezi?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la preluarea coșului');
      }

      const data = await response.json();
      console.log('Răspuns coș:', data);
      if (data.cart && data.cart.CartItems) {
        const cartItemsWithProducts = data.cart.CartItems.map(item => ({
          productId: item.product_id,
          nume: item.Product.nume,
          pret: parseFloat(item.Product.pret),
          imagine: item.Product.imagine,
          quantity: item.cantitate,
          available: item.Product.cantitate
        }));
        setCartItems(cartItemsWithProducts);
        setStockIssues(data.cart.stockIssues || []);
      } else {
        setCartItems([]);
        setStockIssues([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        throw new Error('Trebuie să fii autentificat');
      }

      // Animație de fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const response = await fetch('http://13.60.13.114:5000/api/cos/scoate', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          product_id: productId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la eliminarea produsului din coș');
      }

      // Animație de fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setCartItems(cartItems.filter(item => item.productId !== productId));
    } catch (err) {
      Alert.alert('Eroare', err.message);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        throw new Error('Trebuie să fii autentificat');
      }

      if (newQuantity < 1) {
        await removeFromCart(productId);
        return;
      }

      const response = await fetch('http://13.60.13.114:5000/api/cos/modifica', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          product_id: productId,
          cantitate: newQuantity 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la actualizarea cantității');
      }

      const data = await response.json();
      // Dacă backendul trimite item cu relația Product, actualizez și available, altfel doar quantity
      setCartItems(cartItems.map(item => 
        item.productId === productId 
          ? {
              ...item,
              quantity: newQuantity,
              available: data.item && data.item.Product ? data.item.Product.cantitate : item.available
            }
          : item
      ));
    } catch (err) {
      Alert.alert('Eroare', err.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.pret) * item.quantity);
    }, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        Alert.alert('Eroare', 'Trebuie să fii autentificat pentru a finaliza comanda');
        return;
      }

      if (stockIssues.length > 0) {
        Alert.alert(
          'Stoc insuficient',
          'Unele produse nu mai sunt în stoc în cantitatea dorită. Te rugăm să actualizezi cantitățile.',
          [{ text: 'OK' }]
        );
        return;
      }

      const response = await fetch('http://13.60.13.114:5000/api/cos/finalizeaza', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la finalizarea comenzii');
      }

      const data = await response.json();
      Alert.alert(
        'Succes',
        'Comanda a fost plasată cu succes!',
        [
          {
            text: 'OK',
            onPress: () => {
              setCartItems([]);
              navigation.navigate('Products');
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Eroare', err.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCart();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D3FE7" />
          <Text style={styles.loadingText}>Se încarcă coșul...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCart}>
            <Text style={styles.retryButtonText}>Reîncearcă</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  console.log('cartItems:', cartItems);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3FE7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coș de cumpărături</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2D3FE7']}
            tintColor="#2D3FE7"
          />
        }
      >
        {cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyCartText}>Coșul tău este gol</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.shopButtonText}>Vezi produse</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {stockIssues.length > 0 && (
              <View style={styles.stockWarningContainer}>
                <Ionicons name="warning-outline" size={24} color="#F59E0B" />
                <Text style={styles.stockWarningText}>
                  Unele produse nu mai sunt în stoc în cantitatea dorită
                </Text>
              </View>
            )}
            <Animated.View style={{ opacity: fadeAnim }}>
              {cartItems.map((item) => (
                <View key={item.productId} style={styles.cartItem}>
                  <Image
                    source={{ uri: item.imagine }}
                    style={styles.productImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.productName}>{item.nume}</Text>
                    <Text style={styles.productPrice}>{item.pret.toFixed(2)} RON</Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={20} color="#2D3FE7" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          item.quantity >= item.available && styles.quantityButtonDisabled
                        ]}
                        onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.available}
                      >
                        <Ionicons 
                          name="add" 
                          size={20} 
                          color={item.quantity >= item.available ? '#94A3B8' : '#2D3FE7'} 
                        />
                      </TouchableOpacity>
                    </View>
                    {item.quantity > item.available && (
                      <Text style={styles.stockWarning}>
                        Stoc disponibil: {item.available}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.productId)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{calculateTotal()} RON</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                stockIssues.length > 0 && styles.checkoutButtonDisabled
              ]}
              onPress={handleCheckout}
              disabled={stockIssues.length > 0}
            >
              <Text style={styles.checkoutButtonText}>
                {stockIssues.length > 0 ? 'Rezolvă problemele de stoc' : 'Finalizează comanda'}
              </Text>
            </TouchableOpacity>
          </>
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
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Spațiu pentru BottomNavigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerRight: {
    width: 40,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#000000',
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stockWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stockWarningText: {
    marginLeft: 8,
    color: '#92400E',
    fontSize: 14,
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 16,
  },
  removeButton: {
    padding: 8,
  },
  stockWarning: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  checkoutButtonDisabled: {
    backgroundColor: colors.secondary,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CartScreen; 