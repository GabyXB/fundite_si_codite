import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';

const AppointmentsScreen = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const fetchAppointments = async () => {
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
      console.log('Programari:', data);
      
      // Sortăm programările în funcție de data și status
      const now = new Date();
      const upcoming = [];
      const past = [];

      data.forEach(appointment => {
        const appointmentDate = new Date(appointment.timestamp);
        const formattedAppointment = {
          id: appointment.id,
          petName: appointment.pet.name,
          service: appointment.serviciu.nume,
          groomer: appointment.employee
            ? `${appointment.employee.nume} ${appointment.employee.prenume} (${appointment.employee.rol === 0 ? 'Angajat' : 'Angajat'})`
            : 'Nesetat',
          date: appointmentDate.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: appointmentDate.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: getStatusText(appointment.status),
          originalStatus: appointment.status,
          price: appointment.serviciu.pret,
          duration: appointment.serviciu.durata,
          petDetails: {
            specie: appointment.pet.specie,
            talie: appointment.pet.talie,
          },
          serviceDetails: {
            descriere: appointment.serviciu.descriere,
            observatii: appointment.observatii,
          }
        };

        // Adăugăm în upcoming programările în așteptare și confirmate
        if (appointment.status === 0 || appointment.status === 1) {
          upcoming.push(formattedAppointment);
        } else {
          // Adăugăm în past programările refuzate și finalizate
          past.push(formattedAppointment);
        }
      });

      // Sortăm programările după data
      upcoming.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
      past.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca programările');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case -1: return 'invalid';
      case 0: return 'pending';
      case 1: return 'confirmed';
      case 2: return 'completed';
      default: return 'pending';
    }
  };

  const handleAddAppointment = () => {
    navigation.navigate('NewAppointment');
  };

  const renderAppointmentCard = (appointment) => {
    const statusColors = {
      invalid: '#FF5252',
      confirmed: '#4CAF50',
      pending: '#FFC107',
      completed: '#2196F3',
    };

    const statusText = {
      invalid: 'Invalidă',
      confirmed: 'Confirmată',
      pending: 'În așteptare',
      completed: 'Finalizată',
    };

    return (
      <TouchableOpacity
        key={appointment.id} 
        style={styles.appointmentCard}
        onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: appointment.id })}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.petInfo}>
            <View style={styles.petIconContainer}>
              <Ionicons name="paw" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.petName}>{appointment.petName}</Text>
              <Text style={styles.service}>{appointment.service}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[appointment.status] }]}>
            <Text style={styles.statusText}>{statusText[appointment.status]}</Text>
          </View>
        </View>
        
        <View style={styles.appointmentDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={20} color="#94A3B8" />
            <Text style={styles.detailText}>{appointment.groomer}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
            <Text style={styles.detailText}>{appointment.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color="#94A3B8" />
            <Text style={styles.detailText}>{appointment.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={20} color="#94A3B8" />
            <Text style={styles.detailText}>{appointment.price} RON</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color="#94A3B8" />
            <Text style={styles.detailText}>Durată: {appointment.durata || 60} minute </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.titleHomeLike}>Programările Mele</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddAppointment}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Neconfirmate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Confirmate
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <Text style={styles.loadingText}>Se încarcă programările...</Text>
          ) : activeTab === 'upcoming' ? (
            upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(renderAppointmentCard)
            ) : (
              <Text style={styles.noAppointmentsText}>Nu ai programări viitoare</Text>
            )
          ) : pastAppointments.length > 0 ? (
            pastAppointments.map(renderAppointmentCard)
          ) : (
            <Text style={styles.noAppointmentsText}>Nu ai programări anterioare</Text>
          )}
        </ScrollView>
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
  titleHomeLike: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  service: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  appointmentDetails: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#00000',
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#94A3B8',
  },
  noAppointmentsText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#94A3B8',
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

export default AppointmentsScreen; 