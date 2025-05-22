import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../utils/theme';

const TimeSelectionSlider = ({ hours, minutes, onHoursChange, onMinutesChange }) => {
  // Generăm array-urile pentru ore și minute
  const hoursArray = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <View style={styles.container}>
      <View style={styles.pickerRow}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Ora</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={hours.toString().padStart(2, '0')}
              onValueChange={(value) => onHoursChange(parseInt(value))}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {hoursArray.map((hour) => (
                <Picker.Item
                  key={hour}
                  label={hour}
                  value={hour}
                  color="#1F2937"
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Minute</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={minutes.toString().padStart(2, '0')}
              onValueChange={(value) => onMinutesChange(parseInt(value))}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {minutesArray.map((minute) => (
                <Picker.Item
                  key={minute}
                  label={minute}
                  value={minute}
                  color="#1F2937"
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
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
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerWrapper: {
    height: 100,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  picker: {
    height: 100,
    width: '100%',
  },
  pickerItem: {
    fontSize: 20,
    height: 100,
  },
});

export default TimeSelectionSlider; 