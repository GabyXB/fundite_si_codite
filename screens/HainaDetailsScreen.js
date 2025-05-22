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
  FlatList,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { colors, shadows, neumorphic } from '../utils/theme';

const { width: viewportWidth } = Dimensions.get('window');

const HainaDetailsScreen = ({ route, navigation }) => {
  const { haina } = route.params;
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectPetModal, setSelectPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [imagePreviewModal, setImagePreviewModal] = useState(false);

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const token = await AsyncStorage.getItem('token');
          if (!token) return;
          
          // Fetch updated haina data
          const response = await fetch(`http://13.60.13.114:5000/api/haine/${haina.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const updatedHaina = await response.json();
          
          // Update the haina object with new data
          Object.assign(haina, updatedHaina);
          
          // Fetch pets
          const petsResponse = await fetch('http://13.60.13.114:5000/api/pets/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const petsData = await petsResponse.json();
          setPets(petsData);
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  const handleTryOnPet = () => {
    setSelectPetModal(true);
  };

  const handlePetSelect = async (pet) => {
    try {
      setSelectedPet(pet);
      setSelectPetModal(false);
      
      // Deschide picker-ul de imagine
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Obținem token-ul pentru autentificare
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Eroare', 'Nu sunteți autentificat');
          return;
        }

        // Fetch pets pentru a ne asigura că avem datele actualizate
        const petsResponse = await fetch('http://13.60.13.114:5000/api/pets/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!petsResponse.ok) {
          throw new Error('Eroare la încărcarea animalelor');
        }

        const petsData = await petsResponse.json();
        setPets(petsData);

        // Navigăm către ecranul GeneratedAI cu imaginea generată și numele hainei
        navigation.navigate('GeneratedAI', {
          imagine_gen: haina.imagine_gen,
          nume: haina.nume
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Eroare', 'A apărut o eroare la procesarea cererii');
    }
  };

  const handleAddToCart = () => {
    Alert.alert('Succes', 'Produsul a fost adăugat în coș!');
  };

  const handleImageSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        
        // Creăm un obiect File din URI-ul imaginii
        const response = await fetch(selectedImage.uri);
        const blob = await response.blob();
        const filename = selectedImage.uri.split('/').pop();
        const file = new File([blob], filename, { type: 'image/jpeg' });

        // Încărcăm imaginea în S3
        const formData = new FormData();
        formData.append('image', file);

        const token = await AsyncStorage.getItem('token');
        const uploadResponse = await fetch('http://13.60.13.114:5000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          // Actualizăm imaginea în state cu URL-ul din S3
          setHaina(prev => ({
            ...prev,
            imagine: uploadData.imageUrl
          }));
        } else {
          throw new Error(uploadData.error || 'Eroare la încărcarea imaginii');
        }
      }
    } catch (error) {
      console.error('Eroare la selectarea/încărcarea imaginii:', error);
      Alert.alert('Eroare', 'Nu am putut încărca imaginea. Vă rugăm să încercați din nou.');
    }
  };

  const handleUploadToS3 = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        console.log('Selected image URI:', selectedImage.uri);
        
        // Creăm FormData și adăugăm imaginea direct din URI
        const formData = new FormData();
        const imageData = {
          uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
          type: 'image/jpeg',
          name: 'image.jpg'
        };
        console.log('Image data being sent:', imageData);
        formData.append('image', imageData);

        const token = await AsyncStorage.getItem('token');
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
          Alert.alert('Succes', 'Imaginea a fost încărcată cu succes în S3!');
          console.log('URL imagine S3:', uploadData.imageUrl);
        } else {
          throw new Error(uploadData.error || 'Eroare la încărcarea imaginii');
        }
      }
    } catch (error) {
      console.error('Eroare la încărcarea imaginii în S3:', error);
      Alert.alert('Eroare', 'Nu am putut încărca imaginea în S3. Vă rugăm să încercați din nou.');
    }
  };

  const handleImagePress = () => {
    setImagePreviewModal(true);
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
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.imageWrapper} 
            onPress={handleImagePress}
          >
            {(haina.imagine) ? (
              <Image 
                source={{ uri: haina.imagine }} 
                style={styles.hainaImage} 
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={40} color="#94A3B8" />
                <Text style={styles.placeholderText}>Adaugă o imagine</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Image Preview Modal */}
        <Modal
          visible={imagePreviewModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImagePreviewModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalBackButton}
              onPress={() => setImagePreviewModal(false)}
            >
              <View style={styles.modalBackButtonCircle}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Image 
              source={{ uri: haina.imagine }} 
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Modal>

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

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube-outline" size={20} color="#64748B" />
              <Text style={styles.sectionTitle}>Cantitate disponibilă</Text>
            </View>
            <Text style={styles.details}>{haina.cantitate} bucăți</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="#64748B" />
              <Text style={styles.sectionTitle}>Detalii</Text>
            </View>
            <Text style={styles.details}>{haina.detalii}</Text>
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
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  scrollContent: {
    paddingBottom: 80, // Spațiu pentru BottomNavigation
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
  imageWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hainaImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: colors.primary,
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
    backgroundColor: colors.primary,
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
  uploadButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(16, 185, 129, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 1,
  },
  modalBackButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 16,
  },
});

export default HainaDetailsScreen; 
