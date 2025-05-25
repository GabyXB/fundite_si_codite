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
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';



const ProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, tab } = route.params || { category: 'all', tab: undefined };
  const { signOut } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');
  const [categories, setCategories] = useState([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPriceSort, setShowPriceSort] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            fetchProducts(),
            fetchServices(),
            fetchCart()
          ]);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [category])
  );

  useEffect(() => {
    // Extragem categoriile unice din produse
    const uniqueProductCategories = [...new Set(products.map(p => p.categorie))];
    setProductCategories(['all', ...uniqueProductCategories]);
  }, [products]);

  useEffect(() => {
    // Extragem categoriile unice din servicii
    const uniqueServiceCategories = [...new Set(services.map(s => s.categorie))];
    setServiceCategories(['all', ...uniqueServiceCategories]);
  }, [services]);

  useEffect(() => {
    // La schimbarea tab-ului, daca selectedCategory nu exista in lista, resetez la 'all'
    if (activeTab === 'products') {
      if (!productCategories.includes(selectedCategory)) {
        setSelectedCategory('all');
      }
    } else if (activeTab === 'services') {
      if (!serviceCategories.includes(selectedCategory)) {
        setSelectedCategory('all');
      }
    }
  }, [activeTab, productCategories, serviceCategories]);

  useEffect(() => {
    // Extragem categoriile unice din produse
    const uniqueCategories = [...new Set(products.map(p => p.categorie))];
    setCategories(['all', ...uniqueCategories]);
  }, [products]);

  useEffect(() => {
    if (tab && (tab === 'services' || tab === 'products')) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (category && category !== 'all') {
      if (activeTab === 'products' && productCategories.includes(category)) {
        setSelectedCategory(category);
      } else if (activeTab === 'services' && serviceCategories.includes(category)) {
        setSelectedCategory(category);
      } else {
        setSelectedCategory('all');
      }
    }
  }, [category, activeTab, productCategories, serviceCategories]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`http://13.60.13.114:5000/api/store`, {
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

      const response = await fetch('http://13.60.13.114:5000/api/servicii', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      console.log('Received services:', data);
      setServices(data);
    } catch (error) { 
      console.error('Error fetching services:', error);
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

      // După crearea coșului, îl încărcăm
      await fetchCart();
    } catch (err) {
      console.error('Eroare la crearea coșului:', err);
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

      console.log('Încercăm să accesăm coșul pentru user_id:', userId);

      const response = await fetch(`http://13.60.13.114:5000/api/cos/vezi?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Status răspuns coș:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Eroare răspuns coș:', errorData);
        
        if (response.status === 404) {
          console.log('Coșul nu există, încercăm să-l creăm...');
          await createCart();
          return;
        }
        throw new Error(errorData.error || 'Eroare la preluarea coșului');
      }

      const data = await response.json();
      console.log('Răspuns coș complet:', JSON.stringify(data, null, 2));

      if (data.cart && data.cart.CartItems) {
        // Procesăm datele pentru a le face compatibile cu frontend-ul
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

        console.log('Produse procesate:', processedItems);
        setCartItems(processedItems);
      } else {
        console.log('Nu există produse în coș sau formatul răspunsului este invalid');
        setCartItems([]);
      }
    } catch (err) {
      console.error('Eroare la preluarea coșului:', err);
      setCartItems([]);
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
        // Reîmprospătăm coșul după adăugare
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


  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    fetchServices();
    fetchCart();
  };

  const getFilteredAndSortedProducts = () => {
    let filteredProducts = products.filter(product =>
      product.nume.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.categorie === selectedCategory);
    }
    if (sortOrder !== 'none') {
      filteredProducts.sort((a, b) => {
        return sortOrder === 'asc' ? a.pret - b.pret : b.pret - a.pret;
      });
    }
    return filteredProducts;
  };

  const getFilteredServices = () => {
    let filtered = services.filter(service =>
      service.nume.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.categorie === selectedCategory);
    }
    return filtered;
  };

  const renderFilterButtons = () => (
    <View style={styles.filterButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          (showCategoryFilter || selectedCategory !== 'all') && styles.filterButtonActive
        ]}
        onPress={() => {
          setShowCategoryFilter(!showCategoryFilter);
          setShowPriceSort(false);
        }}
      >
        <Ionicons 
          name="filter" 
          size={20} 
          color={showCategoryFilter || selectedCategory !== 'all' ? '#fff' : '#666'} 
        />
        <Text style={[
          styles.filterButtonText,
          (showCategoryFilter || selectedCategory !== 'all') && styles.filterButtonTextActive
        ]}>
          Filtrare
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          (showPriceSort || sortOrder !== 'none') && styles.filterButtonActive
        ]}
        onPress={() => {
          setShowPriceSort(!showPriceSort);
          setShowCategoryFilter(false);
        }}
      >
        <Ionicons 
          name="swap-vertical" 
          size={20} 
          color={showPriceSort || sortOrder !== 'none' ? '#fff' : '#666'} 
        />
        <Text style={[
          styles.filterButtonText,
          (showPriceSort || sortOrder !== 'none') && styles.filterButtonTextActive
        ]}>
          Sortare
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryOptions = () => {
    const cats = activeTab === 'products' ? productCategories : serviceCategories;
    return (
      <View style={styles.optionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cats.filter(cat => cat !== 'all').map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.optionButton,
                selectedCategory === cat && selectedCategory !== 'all' && styles.optionButtonActive
              ]}
              onPress={() => {
                if (selectedCategory === cat) {
                  setSelectedCategory('all');
                } else {
                  setSelectedCategory(cat);
                }
                setShowCategoryFilter(false);
              }}
            >
              <Text style={[
                styles.optionButtonText,
                selectedCategory === cat && selectedCategory !== 'all' && styles.optionButtonTextActive
              ]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSortOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity
        style={[
          styles.optionButton,
          sortOrder === 'asc' && styles.optionButtonActive
        ]}
        onPress={() => {
          setSortOrder(sortOrder === 'asc' ? 'none' : 'asc');
          setShowPriceSort(false);
        }}
      >
        <Text style={[
          styles.optionButtonText,
          sortOrder === 'asc' && styles.optionButtonTextActive
        ]}>
          Preț Crescător
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.optionButton,
          sortOrder === 'desc' && styles.optionButtonActive
        ]}
        onPress={() => {
          setSortOrder(sortOrder === 'desc' ? 'none' : 'desc');
          setShowPriceSort(false);
        }}
      >
        <Text style={[
          styles.optionButtonText,
          sortOrder === 'desc' && styles.optionButtonTextActive
        ]}>
          Preț Descrescător
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filteredProducts = getFilteredAndSortedProducts();
  const filteredServices = getFilteredServices();

  const renderProductCard = (product) => (
    <TouchableOpacity 
      key={product.id} 
      style={styles.productCard}
      onPress={() => navigation.navigate('SpecificProduct', { productId: product.id })}
    >
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
        <Ionicons name="add-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => navigation.navigate('Service', { serviceId: service.id })}
    >
      <Image
        source={{ uri: service.imagine }}
        style={styles.serviceImage}
        resizeMode="cover"
      />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.nume}</Text>
        <Text style={styles.servicePrice}>{service.pret} RON</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {service.descriere}
        </Text>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('NewAppointment', { service })}
        >
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.scheduleButtonText}>Programează-te</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={true}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.headerHomeLike}>
          <Text style={styles.titleHomeLike}>
            {activeTab === 'services' ? 'Servicii' : 'Produse'}
          </Text>
          <TouchableOpacity
            style={styles.cartButtonHomeLike}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart" size={28} color={colors.primary} />
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
            placeholder={activeTab === 'services' ? "Caută servicii..." : "Caută produse..."}
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

        {renderFilterButtons()}
        {showCategoryFilter && renderCategoryOptions()}
        {showPriceSort && renderSortOptions()}

        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Se încarcă...</Text>
            </View>
          ) : activeTab === 'products' ? (
            getFilteredAndSortedProducts().length > 0 ? (
              getFilteredAndSortedProducts().map(renderProductCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nu există produse în această categorie</Text>
              </View>
            )
          ) : getFilteredServices().length > 0 ? (
            getFilteredServices().map(renderServiceCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nu există servicii în această categorie</Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>
      <View style={styles.bottomNavContainer}>
        <BottomNavigation />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Mărim padding-ul pentru a evita suprapunerea cu BottomNavigation
  },
  headerHomeLike: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  titleHomeLike: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.primary,
  },
  cartButtonHomeLike: {
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
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
    color: colors.primary,
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
  serviceImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
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
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
  scheduleButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(45, 63, 231, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 120,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom:20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});

export default ProductsScreen; 