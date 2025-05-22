import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

const SIZE_LABELS = {
  '1': 'Foarte mic',
  '2': 'Mic',
  '3': 'Mediu',
  '4': 'Mare',
  '5': 'Foarte mare'
};

const PetCard = ({ pet, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = (error) => {
    console.error('Error loading image:', error.nativeEvent.error);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        <Image
          source={{ 
            uri: imageError ? 'https://via.placeholder.com/150' : pet.image,
            cache: 'force-cache'
          }}
          style={[styles.image, isLoading && styles.hiddenImage]}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{pet.name}</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="paw" size={16} color={colors.primary} />
            <Text style={styles.detailText}>{pet.specie}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={styles.detailText}>{pet.age} ani</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="resize" size={16} color={colors.primary} />
            <Text style={styles.detailText}>{SIZE_LABELS[pet.talie] || 'Necunoscută'}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#F8FAFF',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  hiddenImage: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  details: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default PetCard; 