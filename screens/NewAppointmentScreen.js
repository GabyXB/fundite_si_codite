import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const NewAppointmentScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    fetchPets();
    fetchServices();
  }, []);

  const fetchPets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      const response = await fetch('http://13.60.32.137:5000/api/pets/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la încărcarea animalelor');
      }

      const data = await response.json();
      setPets(data);
      if (data.length > 0) {
        setSelectedPet(data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Eroare', error.message || 'A apărut o eroare');
    }
  };

  const fetchServices = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      const response = await fetch('http://13.60.32.137:5000/api/servicii', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la încărcarea serviciilor');
      }

      const data = await response.json();
      setServices(data);
      if (data.length > 0) {
        setSelectedService(data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Eroare', error.message || 'A apărut o eroare la încărcarea serviciilor');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleDateConfirm = () => {
    const [day, month, year] = tempDate.split('/');
    const newDate = new Date(year, month - 1, day);
    setDate(newDate);
    setShowDateModal(false);
  };

  const handleTimeConfirm = () => {
    const [hours, minutes] = tempTime.split(':');
    const newTime = new Date();
    newTime.setHours(parseInt(hours), parseInt(minutes));
    setTime(newTime);
    setShowTimeModal(false);
  };

  const handleSubmit = async () => {
    if (!selectedPet) {
      Alert.alert('Eroare', 'Selectați un animal');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      // Obținem user_id din token
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Nu s-a putut obține ID-ul utilizatorului');
      }

      // Combinăm data și ora
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(time.getHours());
      appointmentDateTime.setMinutes(time.getMinutes());

      const response = await fetch('http://13.60.32.137:5000/api/programari/creare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          pet_id: selectedPet,
          serviciu_id: selectedService,
          timestamp: appointmentDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la crearea programării');
      }

      Alert.alert('Succes', 'Programarea a fost creată cu succes', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Eroare', error.message || 'A apărut o eroare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Programare Nouă</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Animal</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPet}
              onValueChange={(itemValue) => setSelectedPet(itemValue)}
              style={styles.picker}
            >
              {pets.map((pet) => (
                <Picker.Item
                  key={pet.id}
                  label={`${pet.name} (${pet.specie})`}
                  value={pet.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={styles.dateTimeText}>
              {date.toLocaleDateString('ro-RO')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ora</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimeModal(true)}
          >
            <Text style={styles.dateTimeText}>
              {time.toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Serviciu</Text>
          {loadingServices ? (
            <ActivityIndicator size="small" color="#2D3FE7" />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedService}
                onValueChange={(itemValue) => setSelectedService(itemValue)}
                style={styles.picker}
              >
                {services.map((service) => (
                  <Picker.Item
                    key={service.id}
                    label={`${service.nume} - ${service.pret} RON`}
                    value={service.id}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Se creează...' : 'Creează Programare'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selectați data</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={tempDate}
              onChangeText={setTempDate}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.modalButtonText}>Anulare</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDateConfirm}
              >
                <Text style={styles.modalButtonText}>Confirmare</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selectați ora</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={tempTime}
              onChangeText={setTempTime}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.modalButtonText}>Anulare</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleTimeConfirm}
              >
                <Text style={styles.modalButtonText}>Confirmare</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  picker: {
    height: 50,
  },
  dateTimeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  dateTimeText: {
    fontSize: 16,
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#2D3FE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#2D3FE7',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewAppointmentScreen; 