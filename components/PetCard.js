import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PetCard = ({ pet, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: pet.image || 'https://via.placeholder.com/64' }}
        style={styles.petImage}
      />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petSpecies}>{pet.specie}</Text>
        <View style={styles.petDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="paw" size={16} color="#FFC107" />
            <Text style={styles.detailText}>{pet.age || 'N/A'} ani</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="paw" size={16} color="#94A3B8" />
            <Text style={styles.detailText}>Talie: {pet.talie || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
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
  petImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  petInfo: {
    marginLeft: 16,
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  petSpecies: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  petDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default PetCard; 