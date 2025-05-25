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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileImage } from '../assets/placeholders/placeholder';
import PetCard from '../components/PetCard';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';

const HomeScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [user, setUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            fetchPets(),
            fetchNextAppointment(),
            fetchUserProfile()
          ]);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const fetchPets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('http://13.60.13.114:5000/api/pets/me', {
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

      const response = await fetch(`http://13.60.13.114:5000/api/programari/user/${userId}`, {
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

      const response = await fetch('http://13.60.13.114:5000/api/users/me', {
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              source={{ uri: user?.image || 'https://via.placeholder.com/100' }}
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
            placeholder="Caută servicii sau pachete animale"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Quick Access Icons */}
        <View style={styles.quickAccess}>
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate('Products', { category: 'Tuns', tab: 'services' })}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="paw" size={24} color="#2196F3" />
            </View>
            <Text style={styles.quickAccessText}>Tuns</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate('Products', { category: 'Pachete', tab: 'services' })}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="cut" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.quickAccessText}>Pachete</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate('Products', { category: 'Terapie', tab: 'services' })}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="medkit" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.quickAccessText}>Sănătate</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => navigation.navigate('Products', { category: 'Pentru Acasa', tab: 'products' })}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="home" size={24} color="#FF9800" />
            </View>
            <Text style={styles.quickAccessText}>Pentru Acasă</Text>
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
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
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
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Spațiu pentru BottomNavigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 30,
    paddingBottom: 20,
    backgroundColor: 'white',
    marginBottom: 20,
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
  greeting: {
    fontSize: moderateScale(16),
    color: colors.text,
  },
  userName: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.title,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: colors.background,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: -4,
          height: -4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  appointmentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  groomerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groomerDetails: {
    flex: 1,
  },
  groomerName: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
  },
  groomerSpecialty: {
    fontSize: moderateScale(16),
    color: colors.background,
    opacity: 0.9,
  },
  appointmentTime: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: moderateScale(14),
    color: colors.background,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: -4,
          height: -4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: moderateScale(16),
    color: colors.title,
  },
  quickAccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickAccessItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: -4,
          height: -4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickAccessText: {
    fontSize: moderateScale(12),
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  nearbySection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: -4,
          height: -4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.title,
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: {
          width: -2,
          height: -2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addPetButtonText: {
    fontSize: moderateScale(14),
    color: colors.accent,
    fontWeight: '600',
  },
});

export default HomeScreen; 