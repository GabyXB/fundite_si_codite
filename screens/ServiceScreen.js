import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows, neumorphic } from '../utils/theme';


const ServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceId } = route.params;
  const { signOut } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Nu sunteți autentificat');
        return;
      }

      const response = await fetch(`http://13.60.13.114:5000/api/servicii/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
          signOut();
          return;
        }
        throw new Error('Nu am putut încărca detaliile serviciului');
      }

      const data = await response.json();
      setService(data);
    } catch (error) {
      console.error('Error fetching service details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchServiceDetails();
    }, [serviceId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchServiceDetails();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D3FE7" />
          <Text style={styles.loadingText}>Se încarcă...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchServiceDetails}>
            <Text style={styles.retryButtonText}>Reîncearcă</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="search-outline" size={48} color="#94A3B8" />
          <Text style={styles.errorText}>Serviciul nu a fost găsit</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={true}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#424874" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: service.imagine || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.serviceName}>{service.nume}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFC107" />
            <Text style={styles.ratingText}>{service.rating || 4.5}</Text>
            <Text style={styles.reviewCount}>({service.reviews || 0} review-uri)</Text>
          </View>
          <Text style={styles.price}>{service.pret} RON</Text>
          <Text style={styles.description}>{service.detalii || 'Nu există descriere pentru acest serviciu.'}</Text>
        </View>

        <View style={styles.specificationsContainer}>
          <Text style={styles.sectionTitle}>Detalii</Text>
          <View style={styles.specificationItem}>
            <Ionicons name="time-outline" size={20} color="#94A3B8" />
            <Text style={styles.specificationText}>
              Durată: {service.durata || 60} minute
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('NewAppointment', { service })}
        >
          <Ionicons name="calendar-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.scheduleButtonText}>Programează-te</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#94A3B8',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  specificationsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  specificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  specificationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4B5563',
  },
  scheduleButton: {
    backgroundColor: colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(45, 63, 231, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2D3FE7',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceScreen; 