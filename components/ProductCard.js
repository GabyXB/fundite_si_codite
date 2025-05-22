import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductCard = ({ product, onPress }) => {
  // Convertim prețul în număr și ne asigurăm că avem o valoare validă
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';
    const numericPrice = Number(price);
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.innerCard}>
        <View style={styles.imageContainer}>
          <Ionicons name="image" size={40} color="#A6B1E1" />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.name} numberOfLines={1}>{product.nume}</Text>
          <Text style={styles.price}>€ {formatPrice(product.pret)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    backgroundColor: '#F0F3FF',
    ...Platform.select({
      ios: {
        shadowColor: '#A6B1E1',
        shadowOffset: {
          width: 8,
          height: 8,
        },
        shadowOpacity: 0.20,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  innerCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F0F3FF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#A6B1E1',
        shadowOffset: {
          width: 4,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#A6B1E1',
        shadowOffset: {
          width: 4,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424874',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#424874',
    letterSpacing: 0.5,
  },
});

export default ProductCard; 