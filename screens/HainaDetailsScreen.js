import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: viewportWidth } = Dimensions.get('window');

const HainaDetailsScreen = ({ route, navigation }) => {
  const { haina } = route.params;
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectPetModal, setSelectPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // Fetch pets la mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const response = await fetch('http://13.60.32.137:5000/api/pets/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPets(data);
      } catch (err) {
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const handleTryOnPet = () => {
    setSelectPetModal(true);
  };

  const handlePetSelect = async (pet) => {
    setSelectedPet(pet);
    setSelectPetModal(false);
    // Deschide picker-ul de imagine
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setGenerating(true);
      try {
        const animalImageUri = result.assets[0].uri;
        const hainaImageUri = haina.imagini?.[0] || haina.imagine;
        const formData = new FormData();
        formData.append('animal', {
          uri: animalImageUri,
          name: 'animal.jpg',
          type: 'image/jpeg',
        });
        formData.append('haina', {
          uri: hainaImageUri,
          name: 'haina.jpg',
          type: 'image/jpeg',
        });
        formData.append('prompt', 'imbraca animalul acesta cu haina aceasta astfel incat sa obtin o imagine apropriata cu cea a animalului');
        const response = await fetch('https://13.60.32.137:5000/tryon', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const data = await response.json();
        setGeneratedImage(data.link);
        // Trimite linkul la backend pentru asociere cu pet-ul
        await fetch('https://13.60.32.137:5000/api/imagini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pet_id: pet.id,
            user_id: null,
            link: data.link,
          }),
        });
        Alert.alert('Succes', 'Imaginea a fost generată și salvată!');
      } catch (err) {
        Alert.alert('Eroare', 'A apărut o eroare la generarea imaginii.');
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleAddToCart = () => {
    Alert.alert('Succes', 'Produsul a fost adăugat în coș!');
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </View>
          </TouchableOpacity>
          <Image 
            source={haina.imagine ? { uri: haina.imagine } : { uri: 'https://placehold.co/400x400/2D3FE7/FFFFFF/png?text=Haină' }}
            style={styles.image} 
          />
        </View>

        {/* Modal pentru selectarea pet-ului */}
        <Modal
          visible={selectPetModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectPetModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '80%', maxHeight: 400 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, color: '#2D3FE7', textAlign: 'center' }}>Alege animalul</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#2D3FE7" />
              ) : pets.length === 0 ? (
                <Text style={{ color: '#64748B', textAlign: 'center' }}>Nu ai animale adăugate.</Text>
              ) : (
                <FlatList
                  data={pets}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
                      onPress={() => handlePetSelect(item)}
                    >
                      <Ionicons name="paw" size={24} color="#2D3FE7" style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 16, color: '#1E293B' }}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity onPress={() => setSelectPetModal(false)} style={{ marginTop: 16, alignSelf: 'center' }}>
                <Text style={{ color: '#2D3FE7', fontWeight: 'bold' }}>Renunță</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Preview și loader pentru imaginea generată */}
        {generating && (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <ActivityIndicator size="large" color="#2D3FE7" />
            <Text style={{ marginTop: 10, color: '#2D3FE7' }}>Se generează imaginea...</Text>
          </View>
        )}
        {generatedImage && (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={{ marginBottom: 10, color: '#1E293B', fontWeight: 'bold' }}>Rezultat AI:</Text>
            <Image source={{ uri: generatedImage }} style={{ width: 300, height: 300, borderRadius: 20 }} />
          </View>
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{haina.nume}</Text>
            <Text style={styles.price}>{haina.pret} RON</Text>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shirt-outline" size={20} color="#64748B" />
              <Text style={styles.sectionTitle}>Material</Text>
            </View>
            <Text style={styles.details}>{haina.material}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="resize-outline" size={20} color="#64748B" />
              <Text style={styles.sectionTitle}>Mărime</Text>
            </View>
            <Text style={styles.details}>{haina.marime}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.tryOnButton}
              onPress={handleTryOnPet}
            >
              <Ionicons name="paw-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.tryOnButtonText}>Încearcă pe animalut</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Ionicons name="cart-outline" size={20} color="#2D3FE7" style={styles.buttonIcon} />
              <Text style={styles.addToCartText}>Adaugă în coș</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: viewportWidth,
    height: viewportWidth,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 1,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3FE7',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  details: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  tryOnButton: {
    backgroundColor: '#2D3FE7',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  tryOnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D3FE7',
  },
  addToCartText: {
    color: '#2D3FE7',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HainaDetailsScreen; 
