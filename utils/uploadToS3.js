import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Uploads an image to AWS S3 and returns the image URL
 * @param {Object} image - The image object containing uri, type, and name
 * @returns {Promise<string>} - The URL of the uploaded image
 * @throws {Error} - If the upload fails
 */
export const uploadToS3 = async (image) => {
  try {
    // Get the authentication token
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Nu sunteți autentificat');
    }

    // Prepare the image data for upload
    const imageData = {
      uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      type: image.type || 'image/jpeg',
      name: image.name || 'image.jpg'
    };

    // Create FormData and append the image
    const formData = new FormData();
    formData.append('image', imageData);

    // Upload the image to the server
    const uploadResponse = await fetch('http://13.60.13.114:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error('Eroare la încărcarea imaginii');
    }

    const uploadData = await uploadResponse.json();
    if (!uploadData.success) {
      throw new Error(uploadData.error || 'Eroare la încărcarea imaginii');
    }

    return uploadData.imageUrl;
  } catch (error) {
    console.error('Eroare la încărcarea imaginii în S3:', error);
    throw error;
  }
}; 