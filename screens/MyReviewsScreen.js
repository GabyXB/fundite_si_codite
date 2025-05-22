import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import { colors } from '../utils/theme';
import ReviewCard from '../components/ReviewCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters';

const MyReviewsScreen = () => {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchMyReviews();
    }, [])
  );

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) throw new Error('Nu sunteți autentificat');
      const response = await fetch(`http://13.60.13.114:5000/api/recenzii/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      // Preluam textul review-ului din text_link (json)
      const reviewsWithText = await Promise.all(data.map(async (review) => {
        let previewText = '';
        try {
          const textResp = await fetch(review.text_link);
          const textJson = await textResp.json();
          previewText = textJson.text || '';
        } catch (e) {}
        return { ...review, userName: review.user?.name || 'Eu', previewText };
      }));
      setReviews(reviewsWithText);
    } catch (e) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header modern sticky */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recenziile mele</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-download-outline" size={48} color={colors.accent} style={{marginBottom: 12}} />
              <Text style={styles.emptyText}>Se încarcă...</Text>
            </View>
          ) : reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={48} color={'#FFC107'} style={{marginBottom: 12}} />
              <Text style={styles.emptyText}>Nu ai recenzii.</Text>
            </View>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                userName={review.userName}
                onPress={() => navigation.navigate('SpecificReview', { review })}
              />
            ))
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomNavContainer}>
        <BottomNavigation />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
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

export default MyReviewsScreen; 