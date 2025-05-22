import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, neumorphic } from '../utils/theme';
import PetSelectionFields from '../components/PetSelectionFields';

const AddPetScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    specie: '',
    talie: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          image: result.assets[0]
        }));
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut selecta imaginea. Vă rugăm să încercați din nou.');
    }
  };

  const uploadToS3 = async (image) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }

      console.log('Selected image URI:', image.uri);
      
      // Creăm FormData și adăugăm imaginea direct din URI
      const formData = new FormData();
      const imageData = {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        type: 'image/jpeg',
        name: 'image.jpg'
      };
      console.log('Image data being sent:', imageData);
      formData.append('image', imageData);

      console.log('Token available:', !!token);
      
      const uploadResponse = await fetch('http://13.60.13.114:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Server response:', errorText);
        throw new Error('Eroare la încărcarea imaginii');
      }

      const uploadData = await uploadResponse.json();
      console.log('Upload response data:', uploadData);
      
      if (uploadData.success) {
        return uploadData.imageUrl;
      } else {
        throw new Error(uploadData.error || 'Eroare la încărcarea imaginii');
      }
    } catch (error) {
      console.error('Eroare la încărcarea imaginii în S3:', error);
      throw error;
    }
  };

  const handleAddPet = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Eroare', 'Nu sunteți autentificat.');
        return;
      }

      let imageUrl = null;
      if (formData.image) {
        try {
          console.log('Starting image upload...');
          imageUrl = await uploadToS3(formData.image);
          console.log('Image upload successful, URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Eroare', 'Nu s-a putut încărca imaginea. Vă rugăm să încercați din nou.');
          return;
        }
      }

      console.log('Creating pet with data:', {
        name: formData.name,
        age: parseInt(formData.age),
        specie: formData.specie,
        talie: formData.talie,
        image: imageUrl
      });

      const response = await fetch('http://13.60.13.114:5000/api/pets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          specie: formData.specie,
          talie: formData.talie,
          image: imageUrl
        }),
      });

      console.log('Pet creation response status:', response.status);
      const responseData = await response.json();
      console.log('Pet creation response data:', responseData);

      if (!response.ok) {
        throw new Error('Failed to add pet');
      }

      Alert.alert('Succes', 'Animalul a fost adăugat cu succes!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Eroare', 'Nu s-a putut adăuga animalul. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.age || !formData.specie || !formData.talie) {
      Alert.alert('Eroare', 'Toate câmpurile sunt obligatorii');
      return false;
    }

    const age = parseInt(formData.age);
    const talie = parseInt(formData.talie);

    if (isNaN(age) || isNaN(talie)) {
      Alert.alert('Eroare', 'Vârsta și talia trebuie să fie numere');
      return false;
    }

    return true;
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
        <Text style={styles.title}>Adaugă Animal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.imageWrapper}
            onPress={handleImagePick}
          >
            {formData.image ? (
              <Image 
                source={{ uri: formData.image.uri }} 
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nume</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Introdu numele animalului"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Vârstă</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => handleInputChange('age', text)}
            placeholder="Introdu vârsta în ani"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </View>

        <PetSelectionFields
          selectedSpecies={formData.specie}
          selectedSize={formData.talie}
          onSpeciesChange={(species) => handleInputChange('specie', species)}
          onSizeChange={(size) => handleInputChange('talie', size.toString())}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleAddPet}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Se adaugă...' : 'Adaugă Animal'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
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
});

export default AddPetScreen; 