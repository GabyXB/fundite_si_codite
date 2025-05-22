import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TextLink = ({ text, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.text, style]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TextLink;