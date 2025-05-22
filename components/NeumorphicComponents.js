import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, GRADIENTS } from '../styles/theme';

export const NeumorphicCard = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const NeumorphicButton = ({ onPress, title, style, textStyle, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.button, disabled && styles.buttonDisabled, style]}
  >
    <LinearGradient
      colors={disabled ? [COLORS.secondary, COLORS.accent] : GRADIENTS.primary}
      style={styles.buttonGradient}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export const NeumorphicInput = ({ value, onChangeText, placeholder, style }) => (
  <View style={[styles.inputContainer, style]}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={styles.input}
      placeholderTextColor={COLORS.accent}
    />
  </View>
);

export const NeumorphicText = ({ children, style }) => (
  <Text style={[styles.text, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.light,
    ...SHADOWS.dark,
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.light,
    ...SHADOWS.dark,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  inputContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    ...SHADOWS.light,
    ...SHADOWS.dark,
  },
  input: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    padding: SPACING.sm,
  },
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
}); 