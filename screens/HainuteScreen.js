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
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HainuteScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);
  const [haine, setHaine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHaine();
  }, []);

  const fetchHaine = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Nu s-a găsit token');
        return;
      }

      const response = await fetch('http://13.60.32.137:5000/api/haine', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la preluarea hainelor');
      }

      const data = await response.json();
      setHaine(data);
    } catch (error) {
      console.error('Eroare:', error);
      Alert.alert('Eroare', 'Nu s-au putut prelua hainele');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHaine().then(() => setRefreshing(false));
  };

  const handleTryOnPet = () => {
    // Acțiune void pentru moment
    Alert.alert('În curând', 'Această funcționalitate va fi disponibilă în curând!');
  };

  const renderHainaCard = (haina) => (
    <TouchableOpacity
      key={haina.id}
      style={styles.card}
      onPress={() => navigation.navigate('HainaDetails', { haina })}
    >
      <Image
        source={haina.imagine ? { uri: haina.imagine } : { uri: 'https://placehold.co/400x400/2D3FE7/FFFFFF/png?text=Haină' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{haina.nume}</Text>
        <Text style={styles.cardPrice}>{haina.pret} RON</Text>
        <Text style={styles.cardDetails}>Material: {haina.material}</Text>
        <Text style={styles.cardDetails}>Mărime: {haina.marime}</Text>
        <TouchableOpacity
          style={styles.tryOnButton}
          onPress={handleTryOnPet}
        >
          <Text style={styles.tryOnButtonText}>Încearcă pe animalut</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredHaine = haine.filter(haina =>
    haina.nume.toLowerCase().includes(searchQuery.toLowerCase()) ||
    haina.material.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hainute</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Caută haine..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.gridContainer}>
          {filteredHaine.map(renderHainaCard)}
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3FE7',
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  tryOnButton: {
    backgroundColor: '#2D3FE7',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  tryOnButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HainuteScreen; 