import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileImage } from '../assets/placeholders/placeholder';
import PetCard from '../components/PetCard';

const HomeScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPets();
    fetchNextAppointment();
    fetchUserProfile();
  }, []);

  const fetchPets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('http://13.60.32.137:5000/api/pets/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }

      const data = await response.json();
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextAppointment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        console.log('No token or userId found');
        return;
      }

      const response = await fetch(`http://13.60.32.137:5000/api/programari/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      
      // Find the next upcoming appointment
      const now = new Date();
      const upcomingAppointments = data
        .filter(appointment => appointment.status === 0 || appointment.status === 1)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      if (upcomingAppointments.length > 0) {
        const nextApp = upcomingAppointments[0];
        setNextAppointment({
          id: nextApp.id,
          petName: nextApp.pet.nume,
          service: nextApp.serviciu.nume,
          date: new Date(nextApp.timestamp).toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: new Date(nextApp.timestamp).toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      }
    } catch (error) {
      console.error('Error fetching next appointment:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('http://13.60.32.137:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bună,</Text>
          <Text style={styles.userName}>{user?.name || 'Utilizator'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image
            source={{ uri: user?.imagine || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Next Appointment Card */}
      {nextAppointment && (
        <TouchableOpacity 
          style={styles.appointmentCard}
          onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: nextAppointment.id })}
        >
          <View style={styles.groomerInfo}>
            <View style={styles.groomerDetails}>
              <Text style={styles.groomerName}>Următoarea Programare</Text>
              <Text style={styles.groomerSpecialty}>{nextAppointment.service}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.appointmentTime}>
            <View style={styles.timeItem}>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              <Text style={styles.timeText}>{nextAppointment.date}</Text>
            </View>
            <View style={styles.timeItem}>
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              <Text style={styles.timeText}>{nextAppointment.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services or pet issues"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Quick Access Icons */}
      <View style={styles.quickAccess}>
        <TouchableOpacity 
          style={styles.quickAccessItem}
          onPress={() => navigation.navigate('Products', { category: 'grooming' })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="paw" size={24} color="#2196F3" />
          </View>
          <Text style={styles.quickAccessText}>Grooming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAccessItem}
          onPress={() => navigation.navigate('Products', { category: 'styling' })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="cut" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.quickAccessText}>Styling</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAccessItem}
          onPress={() => navigation.navigate('Products', { category: 'health' })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="medkit" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.quickAccessText}>Health</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAccessItem}
          onPress={() => navigation.navigate('Products', { category: 'spa' })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="home" size={24} color="#FF9800" />
          </View>
          <Text style={styles.quickAccessText}>Spa</Text>
        </TouchableOpacity>
      </View>

      {/* Pets Section */}
      <View style={styles.nearbySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Animalele mele</Text>
          <TouchableOpacity 
            style={styles.addPetButton}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#2D3FE7" />
            <Text style={styles.addPetButtonText}>Adaugă</Text>
          </TouchableOpacity>
        </View>
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onPress={() => navigation.navigate('PetDetails', { petId: pet.id })}
          />
        ))}
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#94A3B8',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2D3FE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  appointmentCard: {
    backgroundColor: '#2D3FE7',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    marginTop: 20,
  },
  groomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groomerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  groomerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  groomerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  groomerSpecialty: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  appointmentTime: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  quickAccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  quickAccessItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  nearbySection: {
    marginTop: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addPetButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3FE7',
  },
});

export default HomeScreen; 