import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const NewProductScreenOperator = () => {
  const navigation = useNavigation();
  const [nume, setNume] = useState('');
  const [pret, setPret] = useState('');
  const [detalii, setDetalii] = useState('');
  const [imagine, setImagine] = useState('');
  const [imagineLink, setImagineLink] = useState('');
  const [cantitate, setCantitate] = useState('');
  const [categorie, setCategorie] = useState('general');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        setUploading(true);
        const token = await AsyncStorage.getItem('token');
        const imageFormData = new FormData();
        imageFormData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'product-image.jpg',
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
          throw new Error('Nu am putut încărca imaginea');
        }
        const uploadData = await uploadResponse.json();
        setImagine(uploadData.imageUrl);
      }
    } catch (e) {
      Alert.alert('Eroare', 'Nu am putut încărca imaginea.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!nume.trim() || !pret.trim() || !detalii.trim() || !cantitate.trim()) {
      Alert.alert('Eroare', 'Completează toate câmpurile obligatorii!');
      return;
    }
    if (isNaN(Number(pret)) || Number(pret) <= 0) {
      Alert.alert('Eroare', 'Prețul trebuie să fie un număr pozitiv!');
      return;
    }
    if (isNaN(Number(cantitate)) || Number(cantitate) < 0) {
      Alert.alert('Eroare', 'Cantitatea trebuie să fie un număr pozitiv sau zero!');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      let imagineUrl = imagine;
      if (imagineLink.trim()) {
        imagineUrl = imagineLink.trim();
      } else if (imagine && !imagine.startsWith('http')) {
        setUploading(true);
        const imageFormData = new FormData();
        imageFormData.append('image', {
          uri: imagine,
          type: 'image/jpeg',
          name: 'product-image.jpg',
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
        if (!uploadResponse.ok) throw new Error('Nu am putut încărca imaginea');
        const uploadData = await uploadResponse.json();
        imagineUrl = uploadData.imageUrl;
        setUploading(false);
      }
      const resp = await fetch('http://13.60.13.114:5000/api/store/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nume,
          pret: Number(pret),
          detalii,
          imagine: imagineUrl ? imagineUrl : null,
          cantitate: Number(cantitate),
          categorie: categorie.trim() || 'general',
        })
      });
      if (resp.ok) {
        Alert.alert('Succes', 'Produs adăugat cu succes!');
        navigation.goBack();
      } else {
        const data = await resp.json();
        Alert.alert('Eroare', data.error || 'Eroare la adăugare.');
      }
    } catch (e) {
      Alert.alert('Eroare', 'Eroare de rețea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Adaugă produs nou</Text>
        <TextInput
          style={styles.input}
          placeholder="Nume produs*"
          value={nume}
          onChangeText={setNume}
        />
        <TextInput
          style={styles.input}
          placeholder="Preț*"
          value={pret}
          onChangeText={setPret}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Detalii*"
          value={detalii}
          onChangeText={setDetalii}
        />
        <TextInput
          style={styles.input}
          placeholder="Categorie*"
          value={categorie}
          onChangeText={setCategorie}
        />
        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
            {uploading ? (
              <ActivityIndicator color="#6C47FF" />
            ) : imagine ? (
              <Image source={{ uri: imagine }} style={styles.imagePreview} />
            ) : (
              <Ionicons name="image" size={32} color="#6C47FF" />
            )}
          </TouchableOpacity>
          <Text style={styles.imageLabel}>Imagine</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Link imagine (opțional, dacă ai deja una în cloud)"
          value={imagineLink}
          onChangeText={setImagineLink}
        />
        <TextInput
          style={styles.input}
          placeholder="Cantitate*"
          value={cantitate}
          onChangeText={setCantitate}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          <Ionicons name="add-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>{loading ? 'Se adaugă...' : 'Adaugă produs'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6C47FF',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imagePickerBtn: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 4,
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  imageLabel: {
    fontSize: 13,
    color: '#6C47FF',
    fontWeight: '500',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NewProductScreenOperator; 