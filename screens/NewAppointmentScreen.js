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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../utils/theme';
import TimeSelectionSlider from '../components/TimeSelectionSlider';

const NewAppointmentScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [date, setDate] = useState(new Date());
  const [hours, setHours] = useState(new Date().getHours());
  const [minutes, setMinutes] = useState(new Date().getMinutes());
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await Promise.all([fetchPets(), fetchServices(), fetchEmployees()]);
      };
      loadData();
    }, [])
  );

  const fetchPets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      const response = await fetch('http://13.60.13.114:5000/api/pets/me', {
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

      const response = await fetch('http://13.60.13.114:5000/api/servicii', {
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

  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://13.60.13.114:5000/api/angajati', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Eroare la încărcarea angajaților');
      const data = await response.json();
      setEmployees(data);
      if (data.length > 0) setSelectedEmployee(data[0].id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDateConfirm = () => {
    const [day, month, year] = tempDate.split('/');
    const newDate = new Date(year, month - 1, day);
    setDate(newDate);
    setShowDateModal(false);
  };

  const handleSubmit = async () => {
    if (!selectedPet) {
      Alert.alert('Eroare', 'Selectați un animal');
      return;
    }

    const now = new Date();
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours);
    appointmentDateTime.setMinutes(minutes);
    appointmentDateTime.setSeconds(0);
    appointmentDateTime.setMilliseconds(0);
    if (appointmentDateTime.getTime() <= now.getTime()) {
      Alert.alert('Eroare', 'Nu poți face o programare în trecut sau la o oră deja trecută!');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Nu s-a putut obține ID-ul utilizatorului');
      }

      const response = await fetch('http://13.60.13.114:5000/api/programari/creare', {
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
          angajat_id: selectedEmployee,
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
          <TimeSelectionSlider
            hours={hours}
            minutes={minutes}
            onHoursChange={setHours}
            onMinutesChange={setMinutes}
          />
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Stilist</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedEmployee}
              onValueChange={(itemValue) => setSelectedEmployee(itemValue)}
              style={styles.picker}
            >
              {employees.map((emp) => (
                <Picker.Item
                  key={emp.id}
                  label={`${emp.nume} ${emp.prenume} (${emp.rol === 0 ? 'Stilist' : 'Alt rol'})`}
                  value={emp.id}
                />
              ))}
            </Picker>
          </View>
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
              onChangeText={(text) => {
                let val = text.replace(/[^0-9]/g, '');
                if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2);
                if (val.length > 5) val = val.slice(0,5) + '/' + val.slice(5,9);
                if (val.length > 10) val = val.slice(0,10);
                setTempDate(val);
              }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.accent,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NewAppointmentScreen; 