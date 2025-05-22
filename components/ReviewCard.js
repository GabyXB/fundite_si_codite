import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';

const ReviewCard = ({ review, userName, onPress, hideStars }) => {
  // Trunchiem textul review-ului pentru card
  const previewText = review.previewText?.length > 100
    ? review.previewText.slice(0, 100) + '...'
    : review.previewText;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.userName}>{userName || 'Anonim'}</Text>
        {!hideStars && (
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < review.stele ? 'star' : 'star-outline'}
                size={moderateScale(22)}
                color={'#FFC107'}
                style={{marginHorizontal: 1}}
              />
            ))}
          </View>
        )}
      </View>
      <Text style={styles.topic}>{review.topic}</Text>
      <Text style={styles.text}>{previewText}</Text>
      <Text style={styles.date}>{new Date(review.created_at).toLocaleDateString('ro-RO')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  topic: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: colors.title,
    marginBottom: 4,
  },
  text: {
    fontSize: moderateScale(14),
    color: colors.text,
    marginBottom: 8,
  },
  date: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
    textAlign: 'right',
  },
});

export default ReviewCard; 