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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const AppointmentDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentDetails();
  }, []);

  const fetchAppointmentDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`http://13.60.32.137:5000/api/programari/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointment details');
      }

      const data = await response.json();
      setAppointment(data);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca detaliile programării');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case -1: return 'Invalidă';
      case 0: return 'În așteptare';
      case 1: return 'Confirmată';
      case 2: return 'Finalizată';
      default: return 'În așteptare';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case -1: return '#FF5252';
      case 0: return '#FFC107';
      case 1: return '#4CAF50';
      case 2: return '#2196F3';
      default: return '#FFC107';
    }
  };

  const handleCancelAppointment = () => {
    // Implement the logic to handle canceling the appointment
    console.log('Cancel appointment');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Se încarcă detaliile programării...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Nu s-au putut încărca detaliile programării</Text>
        </View>
      </SafeAreaView>
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
        <Text style={styles.title}>Detalii Programare</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informații despre serviciu</Text>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>{appointment.serviciu.nume}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="pricetag" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>{appointment.serviciu.pret} RON</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>{appointment.serviciu.durata} minute</Text>
          </View>
          {appointment.serviciu.descriere && (
            <View style={styles.infoItem}>
              <Ionicons name="document-text" size={20} color="#2D3FE7" />
              <Text style={styles.infoText}>{appointment.serviciu.descriere}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informații despre animal</Text>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>{appointment.pet.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>Specie: {appointment.pet.specie}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>Talie: {appointment.pet.talie}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data și ora</Text>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>
              {new Date(appointment.timestamp).toLocaleDateString('ro-RO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#2D3FE7" />
            <Text style={styles.infoText}>
              {new Date(appointment.timestamp).toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {appointment.observatii && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observații</Text>
            <View style={styles.infoItem}>
              <Ionicons name="document-text" size={20} color="#2D3FE7" />
              <Text style={styles.infoText}>{appointment.observatii}</Text>
            </View>
          </View>
        )}

        {appointment.status === 0 && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelAppointment}
          >
            <Text style={styles.cancelButtonText}>Anulează programarea</Text>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentDetailsScreen; 