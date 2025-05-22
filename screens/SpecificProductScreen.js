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
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows, neumorphic } from '../utils/theme';


const { width: screenWidth } = Dimensions.get('window');

const SpecificProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  const { signOut } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchProductDetails();
    fetchCart();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`http://13.60.13.114:5000/api/store/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Eroare', 'Nu am putut încărca detaliile produsului');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        console.log('Token sau userId lipsesc:', { token: !!token, userId: !!userId });
        setCartItems([]);
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
        if (response.status === 404) {
          await createCart();
          return;
        }
        throw new Error(errorData.error || 'Eroare la preluarea coșului');
      }

      const data = await response.json();
      if (data.cart && data.cart.CartItems) {
        const processedItems = data.cart.CartItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          cantitate: item.cantitate,
          Product: item.Product ? {
            id: item.Product.id,
            nume: item.Product.nume,
            pret: parseFloat(item.Product.pret),
            imagine: item.Product.imagine,
            detalii: item.Product.detalii,
            cantitate: item.Product.cantitate,
            categorie: item.Product.categorie
          } : null
        }));
        setCartItems(processedItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Eroare la preluarea coșului:', err);
      setCartItems([]);
    }
  };

  const createCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) return;

      const response = await fetch('http://13.60.13.114:5000/api/cos/creaza', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la crearea coșului');
      }

      await fetchCart();
    } catch (err) {
      console.error('Eroare la crearea coșului:', err);
    }
  };

  const addToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        Alert.alert('Eroare', 'Trebuie să fii autentificat pentru a adăuga produse în coș');
        return;
      }

      const response = await fetch('http://13.60.13.114:5000/api/cos/adaugare', {
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
        await fetchCart();
        Alert.alert('Succes', 'Produsul a fost adăugat în coș');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la adăugarea produsului în coș');
      }
    } catch (err) {
      Alert.alert('Eroare', err.message);
    }
  };

  const renderImageItem = ({ item, index }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item || 'https://via.placeholder.com/400' }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );

  const renderPagination = () => {
    if (!product?.imagini || product.imagini.length <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {product.imagini.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
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

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produsul nu a fost găsit</Text>
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

        <View style={styles.imageContainer}>
          <FlatList
            data={product.imagini || [product.imagine]}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
              setActiveSlide(newIndex);
            }}
            keyExtractor={(_, index) => index.toString()}
          />
          {renderPagination()}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.nume}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFC107" />
            <Text style={styles.ratingText}>{product.rating || 4.5}</Text>
            <Text style={styles.reviewCount}>({product.reviews || 0} review-uri)</Text>
          </View>
          <Text style={styles.price}>{product.pret} RON</Text>
          <Text style={styles.description}>{product.detalii}</Text>
        </View>

        <View style={styles.specificationsContainer}>
          <Text style={styles.sectionTitle}>Specificații</Text>
          <View style={styles.specificationItem}>
            <Ionicons name="cube-outline" size={20} color="#94A3B8" />
            <Text style={styles.specificationText}>
              Cantitate disponibilă: {product.cantitate}
            </Text>
          </View>
          <View style={styles.specificationItem}>
            <Ionicons name="pricetag-outline" size={20} color="#94A3B8" />
            <Text style={styles.specificationText}>
              Categorie: {product.categorie}
            </Text>
          </View>
        </View>

        <View style={styles.reviewsContainer}>
          <Text style={styles.sectionTitle}>Review-uri</Text>
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, index) => (
              <View key={index} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={16} color="#FFC107" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>Nu există review-uri pentru acest produs</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCart}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Adaugă în coș</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
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
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  slide: {
    width: screenWidth,
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#94A3B8',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3FE7',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  specificationsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  specificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  specificationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4B5563',
  },
  reviewsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginBottom: 100,
  },
  reviewItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addToCartButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D3FE7',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SpecificProductScreen; 