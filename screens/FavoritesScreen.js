import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import { productImages } from '../assets/placeholders/placeholder';

const FavoritesScreen = () => {
  const [activeTab, setActiveTab] = useState('products');

  // Update the favoriteProducts array to use placeholder images
  const favoriteProducts = [
    {
      id: 1,
      name: 'Șampon Premium',
      price: 89.99,
      rating: 4.8,
      reviews: 128,
      image: { uri: productImages.product1 },
    },
    {
      id: 2,
      name: 'Perie Professional',
      price: 129.99,
      rating: 4.9,
      reviews: 256,
      image: { uri: productImages.product2 },
    },
  ];

  // Mock data pentru servicii favorite
  const favoriteServices = [
    {
      id: 1,
      name: 'Pachet Complet',
      description: 'Tuns, spălat, uscat și periaj',
      price: 150,
      duration: '90 min',
      rating: 4.9,
      reviews: 342,
    },
    {
      id: 2,
      name: 'Spa Deluxe',
      description: 'Tratament relaxant și îngrijire blană',
      price: 200,
      duration: '120 min',
      rating: 5.0,
      reviews: 189,
    },
  ];

  const renderProductCard = (product) => (
    <TouchableOpacity key={product.id} style={styles.productCard}>
      <Image source={product.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewCount}>({product.reviews})</Text>
        </View>
        <Text style={styles.price}>{product.price} RON</Text>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart" size={24} color="#2D3FE7" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderServiceCard = (service) => (
    <TouchableOpacity key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{service.rating}</Text>
            <Text style={styles.reviewCount}>({service.reviews})</Text>
          </View>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color="#94A3B8" />
            <Text style={styles.durationText}>{service.duration}</Text>
          </View>
        </View>
        <Text style={styles.servicePrice}>{service.price} RON</Text>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart" size={24} color="#2D3FE7" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorite</Text>
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

      <ScrollView style={styles.content}>
        {activeTab === 'products' ? (
          favoriteProducts.map(renderProductCard)
        ) : (
          favoriteServices.map(renderServiceCard)
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
  title: {
    fontSize: 24,
    fontWeight: '700',
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
  favoriteButton: {
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
});

export default FavoritesScreen; 