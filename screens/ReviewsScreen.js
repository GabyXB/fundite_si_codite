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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import { userImages } from '../assets/placeholders/placeholder';

const ReviewsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock data pentru statistici
  const stats = {
    averageRating: 4.8,
    totalReviews: 856,
    ratingDistribution: {
      5: 620,
      4: 180,
      3: 40,
      2: 10,
      1: 6,
    },
  };

  // Mock data pentru reviews
  const reviews = [
    {
      id: 1,
      userName: 'Alexandra M.',
      rating: 5,
      date: '2 zile în urmă',
      comment: 'Servicii excelente! Cățelul meu arată minunat după vizită. Personalul este foarte profesionist și atent.',
      service: 'Tuns și Spălat',
      likes: 24,
      userImage: { uri: userImages.user1 },
    },
    {
      id: 2,
      userName: 'Mihai P.',
      rating: 4,
      date: '5 zile în urmă',
      comment: 'Foarte mulțumit de servicii, doar că timpul de așteptare a fost puțin mai lung decât mă așteptam.',
      service: 'Spa Deluxe',
      likes: 18,
      userImage: { uri: userImages.user2 },
    },
  ];

  const renderRatingBar = (rating, count) => {
    const percentage = (count / stats.totalReviews) * 100;
    return (
      <View style={styles.ratingBar} key={rating}>
        <Text style={styles.ratingNumber}>{rating}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingCount}>{count}</Text>
      </View>
    );
  };

  const renderReviewCard = (review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Image source={review.userImage} style={styles.userImage} />
          <View>
            <Text style={styles.userName}>{review.userName}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < review.rating ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFC107"
                />
              ))}
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.serviceTag}>{review.service}</Text>
      </View>
      <Text style={styles.reviewText}>{review.comment}</Text>
      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={20} color="#94A3B8" />
          <Text style={styles.likeCount}>{review.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reviews</Text>
        <View style={styles.overallRating}>
          <Text style={styles.ratingNumber}>{stats.averageRating}</Text>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.floor(stats.averageRating) ? 'star' : 'star-outline'}
                size={20}
                color="#FFC107"
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>({stats.totalReviews} reviews)</Text>
        </View>
      </View>

      <View style={styles.ratingDistribution}>
        {Object.entries(stats.ratingDistribution)
          .reverse()
          .map(([rating, count]) => renderRatingBar(rating, count))}
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              Toate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === '5star' && styles.activeFilter]}
            onPress={() => setActiveFilter('5star')}
          >
            <Text style={[styles.filterText, activeFilter === '5star' && styles.activeFilterText]}>
              5 stele
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'recent' && styles.activeFilter]}
            onPress={() => setActiveFilter('recent')}
          >
            <Text style={[styles.filterText, activeFilter === 'recent' && styles.activeFilterText]}>
              Recente
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.reviewsList}>
        {reviews.map(renderReviewCard)}
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#94A3B8',
  },
  ratingDistribution: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#2D3FE7',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#94A3B8',
    width: 40,
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#2D3FE7',
  },
  filterText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  reviewsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  serviceTag: {
    fontSize: 12,
    color: '#2D3FE7',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default ReviewsScreen; 