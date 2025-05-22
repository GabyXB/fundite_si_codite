import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../components/BottomNavigation';
import { colors, shadows, neumorphic } from '../utils/theme';
import PetSelectionFields from '../components/PetSelectionFields';

const EditPetScreen = ({ route, navigation }) => {
  const { pet } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: pet.name || '',
    specie: pet.specie || '',
    age: pet.age?.toString() || '',
    talie: pet.talie?.toString() || '',
    image: pet.image || null,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Numele este obligatoriu';
    if (!formData.specie.trim()) newErrors.specie = 'Specia este obligatorie';
    if (!formData.age.trim()) newErrors.age = 'Vârsta este obligatorie';
    if (isNaN(formData.age) || parseInt(formData.age) < 0) newErrors.age = 'Vârsta trebuie să fie un număr pozitiv';
    if (!formData.talie.trim()) newErrors.talie = 'Talia este obligatorie';
    if (isNaN(formData.talie) || parseInt(formData.talie) <= 0) newErrors.talie = 'Talia trebuie să fie un număr pozitiv';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          image: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut selecta imaginea. Vă rugăm să încercați din nou.');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      // Construim datele pentru request
      const requestData = {
        name: formData.name,
        specie: formData.specie,
        age: parseInt(formData.age),
        talie: parseInt(formData.talie)
      };

      // Dacă imaginea a fost schimbată, o încărcăm în S3
      if (formData.image && formData.image !== pet.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', {
          uri: formData.image,
          type: 'image/jpeg',
          name: 'pet-image.jpg',
        });

        const uploadResponse = await fetch('http://13.60.13.114:5000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Nu am putut încărca noua imagine');
        }

        const uploadData = await uploadResponse.json();
        requestData.image = uploadData.imageUrl;
      }

      const response = await fetch(`http://13.60.13.114:5000/api/pets/${pet.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      let errorMessage = 'Eroare la actualizarea datelor';
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          const responseText = await response.text();
          console.error('Server response:', responseText);
          errorMessage = 'Serverul nu a putut procesa cererea. Vă rugăm să încercați din nou.';
        }
        throw new Error(errorMessage);
      }

      Alert.alert('Succes', 'Datele animalului au fost actualizate cu succes!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert(
        'Eroare',
        error.message || 'Nu am putut actualiza datele. Vă rugăm să încercați din nou.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Editează Animalul</Text>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.imageWrapper}
            onPress={handleImagePick}
          >
            {formData.image ? (
              <Image 
                source={{ uri: formData.image }} 
                style={styles.petImage} 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="paw" size={40} color="#94A3B8" />
                <Text style={styles.placeholderText}>Adaugă poză</Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nume</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Numele animalului"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vârstă (ani)</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              value={formData.age}
              onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              placeholder="Vârsta animalului"
              keyboardType="numeric"
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          <PetSelectionFields
            selectedSpecies={formData.specie}
            selectedSize={formData.talie}
            onSpeciesChange={(species) => setFormData(prev => ({ ...prev, specie: species }))}
            onSizeChange={(size) => setFormData(prev => ({ ...prev, talie: size.toString() }))}
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>Salvează Modificările</Text>
              </>
            )}
          </TouchableOpacity>
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
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#94A3B8',
    marginTop: 8,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(45, 63, 231, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditPetScreen; 