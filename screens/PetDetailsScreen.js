import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows, neumorphic } from '../utils/theme';
import { SIZE_OPTIONS } from '../components/PetSelectionFields';

const SIZE_LABELS = {
  '1': 'Foarte mic',
  '2': 'Mic',
  '3': 'Mediu',
  '4': 'Mare',
  '5': 'Foarte mare'
};

const PetDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { petId } = route.params;
  const [pet, setPet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchPetDetails();
      fetchPetAppointments();
    }, [petId])
  );

  const fetchPetDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://13.60.13.114:5000/api/pets/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch pet details');
      const data = await response.json();
      setPet(data);
    } catch (error) {
      console.error('Error fetching pet details:', error);
    }
  };

  const fetchPetAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://13.60.13.114:5000/api/programari/pet/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async () => {
    Alert.alert(
      'Ștergere animal',
      'Sigur doriți să ștergeți acest animal? Această acțiune nu poate fi anulată.',
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                throw new Error('Nu sunteți autentificat');
              }

              const response = await fetch(`http://13.60.13.114:5000/api/pets/${petId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Eroare la ștergerea animalului');
              }

              Alert.alert('Succes', 'Animalul a fost șters cu succes');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Eroare', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D3FE7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalii Animal</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditPet', { pet })}
          >
            <Ionicons name="create-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.petInfo}>
          <Image
            source={{ uri: pet?.image || 'https://via.placeholder.com/150' }}
            style={styles.petImage}
          />
          <Text style={styles.petName}>{pet?.name}</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="paw" size={20} color={colors.primary} />
              <Text style={styles.detailText}>Specie: {pet?.specie}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.detailText}>Vârstă: {pet?.age} ani</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="resize" size={20} color={colors.primary} />
              <Text style={styles.detailText}>Talie: {SIZE_LABELS[pet?.talie] || 'Necunoscută'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>Programări</Text>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: appointment.id })}
              >
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentService}>
                    {appointment.serviciu?.nume}
                  </Text>
                  <Text style={styles.appointmentDate}>
                    {new Date(appointment.timestamp).toLocaleDateString()}
                  </Text>
                  <Text style={styles.appointmentTime}>
                    {new Date(appointment.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(appointment.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noAppointments}>
              Nu există programări pentru acest animal
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePet}
        >
          <Text style={styles.deleteButtonText}>Șterge animalul</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case -1: return '#EF4444'; // Anulat
    case 0: return '#F59E0B';  // În așteptare
    case 1: return '#10B981';  // Confirmat
    case 2: return '#3B82F6';  // Finalizat
    default: return '#94A3B8';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case -1: return 'Anulat';
    case 0: return 'În așteptare';
    case 1: return 'Confirmat';
    case 2: return 'Finalizat';
    default: return 'Necunoscut';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(149, 157, 165, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
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
  editButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  petInfo: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailsContainer: {
    width: '100%',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#1F2937',
  },
  appointmentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noAppointments: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#FF2400',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PetDetailsScreen; 