import React, { useState, useEffect, useContext } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors, shadows, neumorphic } from '../utils/theme';
import AuthContext from '../context/AuthContext';

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    image: null,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        throw new Error('Nu sunteți autentificat');
      }

      const response = await fetch(`http://13.60.13.114:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la preluarea profilului');
      }

      const data = await response.json();
      setUser(data);
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
        image: data.image,
      }));
    } catch (error) {
      Alert.alert('Eroare', error.message);
    } finally {
      setLoading(false);
    }
  };

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
          image: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut selecta imaginea. Vă rugăm să încercați din nou.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        throw new Error('Nu sunteți autentificat');
      }

      // Verificăm dacă parolele noi coincid
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        Alert.alert('Eroare', 'Parolele nu coincid');
        return;
      }

      // Verificăm dacă se încearcă modificarea email-ului sau parolei
      if ((formData.email !== user.email || formData.newPassword) && !formData.currentPassword) {
        Alert.alert('Eroare', 'Pentru a modifica email-ul sau parola, trebuie să introduceți parola curentă');
        return;
      }

      const requestData = {
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      // Dacă imaginea a fost schimbată, o încărcăm în S3
      if (formData.image && formData.image !== user.image) {
        setUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append('image', {
          uri: formData.image,
          type: 'image/jpeg',
          name: 'user-image.jpg',
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
        setUploadingImage(false);
      }

      const response = await fetch(`http://13.60.13.114:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la actualizarea profilului');
      }

      // Actualizăm starea locală cu noile date
      setUser(data.user);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        image: data.user.image,
      }));

      Alert.alert('Succes', 'Profilul a fost actualizat cu succes');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Eroare', error.message);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Verificăm dacă avem parola curentă
    if (!formData.currentPassword) {
      Alert.alert('Eroare', 'Trebuie să introduceți parola curentă pentru a șterge contul');
      return;
    }

    Alert.alert(
      'Ștergere cont',
      'Sigur doriți să ștergeți contul? Această acțiune nu poate fi anulată.',
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
              const userId = await AsyncStorage.getItem('userId');
              if (!token || !userId) {
                throw new Error('Nu sunteți autentificat');
              }

              const response = await fetch(`http://13.60.13.114:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password: formData.currentPassword }),
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Eroare la ștergerea contului');
              }

              // Ștergem token-ul și userId-ul
              await AsyncStorage.multiRemove(['token', 'userId']);
              
              // Facem signout
              await signOut();
            } catch (error) {
              Alert.alert('Eroare', error.message);
            }
          },
        },
      ]
    );
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
        <Text style={styles.title}>Setări</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagine de profil</Text>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={handleImagePick}
          >
            {formData.image ? (
              <Image 
                source={{ uri: formData.image }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={40} color="#94A3B8" />
                <Text style={styles.placeholderText}>Adaugă poză</Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informații personale</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nume</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Introdu numele"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Introdu email-ul"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schimbare parolă</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Parola curentă</Text>
            <TextInput
              style={styles.input}
              value={formData.currentPassword}
              onChangeText={(text) => handleInputChange('currentPassword', text)}
              placeholder="Introdu parola curentă"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Parola nouă</Text>
            <TextInput
              style={styles.input}
              value={formData.newPassword}
              onChangeText={(text) => handleInputChange('newPassword', text)}
              placeholder="Introdu parola nouă"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirmă parola nouă</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Confirmă parola nouă"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, (loading || uploadingImage) && styles.disabledButton]}
          onPress={handleUpdateProfile}
          disabled={loading || uploadingImage}
        >
          {loading || uploadingImage ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.updateButtonText}>Salvează Modificările</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Șterge cont</Text>
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
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#00000',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginVertical: 20,
    alignSelf: 'center',
    position: 'relative',
  },
  profileImage: {
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
  updateButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 40,
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
  disabledButton: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF2400',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSettingsScreen; 