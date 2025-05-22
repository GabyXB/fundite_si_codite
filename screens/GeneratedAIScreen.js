import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, shadows, neumorphic } from '../utils/theme';

const { width: viewportWidth } = Dimensions.get('window');

const GeneratedAIScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imagine_gen, nume } = route.params;
  const [imagePreviewModal, setImagePreviewModal] = useState(false);

  const handleImagePress = () => {
    setImagePreviewModal(true);
  };

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
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#424874" />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Rezultat Generare</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={handleImagePress}
        >
          <Image
            source={{ uri: imagine_gen }}
            style={styles.generatedImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <View style={styles.textContainer}>
          <Text style={styles.message}>
            Animalul tău drag poartă următorul articol:
          </Text>
          <Text style={styles.hainaName}>{nume}</Text>
        </View>
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
            source={{ uri: imagine_gen }} 
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: viewportWidth - 40,
    height: viewportWidth - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
    overflow: 'hidden',
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  message: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  hainaName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
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
});

export default GeneratedAIScreen; 