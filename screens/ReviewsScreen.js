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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import { userImages } from '../assets/placeholders/placeholder';
import { colors, shadows, neumorphic } from '../utils/theme';
import ReviewCard from '../components/ReviewCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from 'react-native-size-matters';

const ReviewsScreen = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchReviews();
    }, [])
  );

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://13.60.13.114:5000/api/recenzii');
      const data = await response.json();
      // Preluam textul review-ului din text_link (json)
      const reviewsWithText = await Promise.all(data.map(async (review) => {
        let previewText = '';
        try {
          const textResp = await fetch(review.text_link);
          const textJson = await textResp.json();
          previewText = textJson.text || '';
        } catch (e) {}
        return { ...review, userName: review.user?.name || 'Anonim', previewText };
      }));
      setReviews(reviewsWithText);
      // Statistici
      const total = reviewsWithText.length;
      const sum = reviewsWithText.reduce((acc, r) => acc + r.stele, 0);
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsWithText.forEach(r => { dist[r.stele] = (dist[r.stele] || 0) + 1; });
      setStats({
        averageRating: total ? (sum / total).toFixed(1) : 0,
        totalReviews: total,
        ratingDistribution: dist,
      });
    } catch (e) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = React.useMemo(() => {
    if (activeFilter === 'all') return reviews;
    if (activeFilter === '5star') return reviews.filter(r => r.stele === 5);
    if (activeFilter === '4star') return reviews.filter(r => r.stele === 4);
    if (activeFilter === '3star') return reviews.filter(r => r.stele === 3);
    if (activeFilter === '2star') return reviews.filter(r => r.stele === 2);
    if (activeFilter === '1star') return reviews.filter(r => r.stele === 1);
    if (activeFilter === 'recent') return [...reviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return reviews;
  }, [reviews, activeFilter]);

  const renderRatingBar = (rating, count) => {
    const percentage = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
    return (
      <View style={styles.ratingBar} key={rating}>
        <Text style={styles.ratingNumber}>{rating}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: '#FFC107' }]} />
        </View>
        <Text style={styles.ratingCount}>{count}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recenzii</Text>
        <TouchableOpacity style={styles.addReviewButton} onPress={() => navigation.navigate('NewReview')}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addReviewButtonText}>Adaugă recenzie</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsCard}>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>{stats.averageRating}</Text>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.floor(stats.averageRating) ? 'star' : 'star-outline'}
                  size={22}
                  color={'#FFC107'}
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>({stats.totalReviews} recenzii)</Text>
          </View>
          <View style={styles.ratingDistribution}>
            {Object.entries(stats.ratingDistribution)
              .reverse()
              .map(([rating, count]) => renderRatingBar(rating, count))}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{paddingHorizontal: 8}}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              Toate
            </Text>
          </TouchableOpacity>
          {[5,4,3,2,1].map(star => (
            <TouchableOpacity
              key={star}
              style={[styles.filterButton, activeFilter === `${star}star` && styles.activeFilter]}
              onPress={() => setActiveFilter(`${star}star`)}
            >
              <Text style={[styles.filterText, activeFilter === `${star}star` && styles.activeFilterText]}>
                {star} stele
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'recent' && styles.activeFilter]}
            onPress={() => setActiveFilter('recent')}
          >
            <Text style={[styles.filterText, activeFilter === 'recent' && styles.activeFilterText]}>
              Recente
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-download-outline" size={48} color={colors.accent} style={{marginBottom: 12}} />
              <Text style={styles.emptyText}>Se încarcă...</Text>
            </View>
          ) : filteredReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={48} color={'#FFC107'} style={{marginBottom: 12}} />
              <Text style={styles.emptyText}>Nu există recenzii.</Text>
            </View>
          ) : (
            filteredReviews.map((review) => (
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
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  addReviewButtonText: {
    marginLeft: 8,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingNumber: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: colors.primary,
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#000000',
  },
  ratingDistribution: {
    marginTop: 8,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.accent,
    width: 40,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 4,
    paddingLeft: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#000000',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
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

export default ReviewsScreen; 
