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
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';



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

      const response = await fetch('http://13.60.13.114:5000/api/haine', {
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
        <View style={styles.headerHomeLike}>
          <Text style={styles.headerTitleHomeLike}>Hăinuțe</Text>
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

        <View style={styles.gridContainer}>
          {filteredHaine.map(renderHainaCard)}
        </View>
      </ScrollView>
      <View style={styles.bottomNavContainer}>
        <BottomNavigation />
      </View>
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
    paddingBottom: 100, // Mărim padding-ul pentru a evita suprapunerea cu BottomNavigation
  },
  headerHomeLike: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitleHomeLike: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.primary,
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
    color: colors.primary,
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  tryOnButton: {
    backgroundColor: colors.primary,
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

export default HainuteScreen; 