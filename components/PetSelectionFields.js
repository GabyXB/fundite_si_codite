import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

const SPECIES_OPTIONS = [
  { id: 'Câine', label: 'Câine', icon: 'paw' },
  { id: 'Pisică', label: 'Pisică', icon: 'logo-octocat' },
  { id: 'Pasăre', label: 'Pasăre', icon: 'egg-outline' },
  { id: 'Iepure', label: 'Iepure', icon: 'rabbit' },
  { id: 'Hamster', label: 'Hamster', icon: 'hamster' },
  { id: 'Altele', label: 'Altele', icon: 'help-outline' },
];

const SIZE_OPTIONS = [
  { id: 1, label: 'Foarte mic' },
  { id: 2, label: 'Mic' },
  { id: 3, label: 'Mediu' },
  { id: 4, label: 'Mare' },
  { id: 5, label: 'Foarte mare' },
];

const PetSelectionFields = ({ selectedSpecies, selectedSize, onSpeciesChange, onSizeChange, errors = {} }) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specie</Text>
        <View style={styles.optionsContainer}>
          {SPECIES_OPTIONS.map((species) => (
            <TouchableOpacity
              key={species.id}
              style={[
                styles.optionButton,
                selectedSpecies === species.id && styles.selectedOption,
                errors.specie && styles.errorOption,
              ]}
              onPress={() => onSpeciesChange(species.id)}
            >
              <Ionicons
                name={species.icon}
                size={24}
                color={selectedSpecies === species.id ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedSpecies === species.id && styles.selectedOptionText,
                ]}
              >
                {species.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.specie && <Text style={styles.errorText}>{errors.specie}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Talie</Text>
        <View style={styles.optionsContainer}>
          {SIZE_OPTIONS.map((size) => (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.sizeButton,
                selectedSize === size.id.toString() && styles.selectedSize,
                errors.talie && styles.errorOption,
              ]}
              onPress={() => onSizeChange(size.id)}
            >
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === size.id.toString() && styles.selectedSizeText,
                ]}
              >
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.talie && <Text style={styles.errorText}>{errors.talie}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  errorOption: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedSize: {
    backgroundColor: colors.primary,
  },
  sizeText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
});

export default PetSelectionFields; 