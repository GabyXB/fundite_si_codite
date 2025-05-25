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
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';

const SIZE_OPTIONS = [
  { id: 1, label: 'Foarte mic' },
  { id: 2, label: 'Mic' },
  { id: 3, label: 'Mediu' },
  { id: 4, label: 'Mare' },
  { id: 5, label: 'Foarte mare' },
];

const AppointmentDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointmentDetails();
  }, []);

  const fetchAppointmentDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      const response = await fetch(`http://13.60.13.114:5000/api/programari/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Nu s-au putut încărca detaliile programării');
      }

      const data = await response.json();
      setAppointment(data);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      let errorMessage = 'A apărut o eroare la încărcarea detaliilor programării';
      
      if (error.message === 'Network request failed') {
        errorMessage = 'Nu s-a putut conecta la server. Vă rugăm să verificați conexiunea la internet.';
      } else if (error.message === 'Nu sunteți autentificat') {
        errorMessage = 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Eroare', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointmentDetails();
  };

  const handleCancelAppointment = async () => {
    Alert.alert(
      'Anulare Programare',
      'Sigur doriți să anulați această programare?',
      [
        {
          text: 'Nu',
          style: 'cancel',
        },
        {
          text: 'Da',
          onPress: async () => {
            setCancelling(true);
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                throw new Error('Nu sunteți autentificat');
              }

              const response = await fetch(`http://13.60.13.114:5000/api/programari/sterge/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Nu s-a putut anula programarea');
              }

              Alert.alert('Succes', 'Programarea a fost anulată cu succes', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Eroare', error.message || 'A apărut o eroare');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
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

  const getSizeLabel = (sizeId) => {
    const size = SIZE_OPTIONS.find(s => s.id === parseInt(sizeId));
    return size ? size.label : 'Necunoscută';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Se încarcă detaliile programării...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.primary} />
          <Text style={styles.errorText}>Nu s-au putut încărca detaliile programării</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAppointmentDetails}>
            <Text style={styles.retryButtonText}>Reîncearcă</Text>
          </TouchableOpacity>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.title} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalii Programare</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviciu</Text>
          <View style={styles.infoItem}>
            <Ionicons name="cut" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{appointment.serviciu.nume}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="pricetag" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{appointment.serviciu.pret} RON</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Durată: {appointment.serviciu.durata || 60} minute</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cut" size={20} color={colors.primary} />
            <Text style={styles.infoText}>La persoana: {appointment.employee.nume} {appointment.employee.prenume}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informații despre animal</Text>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Nume: {appointment.pet.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Specie: {appointment.pet.specie}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Talie: {getSizeLabel(appointment.pet.talie)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data și ora</Text>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              {new Date(appointment.timestamp).toLocaleDateString('ro-RO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color={colors.primary} />
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
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{appointment.observatii}</Text>
            </View>
          </View>
        )}

        {appointment.status === 0 && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelAppointment}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Anulează programarea</Text>
            )}
          </TouchableOpacity>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
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
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.title,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.title,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
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
  retryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  statusText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginRight: 20,
    marginLeft: 20,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.title,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: 'black',
  },
  cancelButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    marginRight: 20,
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
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
  cancelButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: colors.text,
  },
  label: {
    fontSize: moderateScale(14),
    color: colors.text,
    marginBottom: 4,
  },
  value: {
    fontSize: moderateScale(16),
    color: colors.title,
    fontWeight: '500',
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

export default AppointmentDetailsScreen; 