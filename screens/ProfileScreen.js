import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { colors, shadows, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        setLoading(false);
        return;
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
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Delogare',
      'Sigur doriți să vă delogați?',
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Delogare',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('userId');
              signOut();
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Eroare', 'A apărut o eroare la delogare.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleWhatsAppHelp = async () => {
    let phoneNumber = '+40756894316'; 
    const message = 'Am nevoie de ajutor';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Eroare', 'WhatsApp nu este instalat pe acest dispozitiv');
        }
      })
      .catch(err => {
        Alert.alert('Eroare', 'Nu s-a putut deschide WhatsApp');
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Se încarcă profilul...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <Image
              source={{ uri: user?.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=2D3FE7&color=fff' }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{user?.name || 'Utilizator'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <Ionicons name="create-outline" size={24} color={colors.title} />
              <Text style={styles.menuText}>Editează Profilul</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Ionicons name="receipt-outline" size={24} color={colors.title} />
              <Text style={styles.menuText}>Istoric Comenzi</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyReviewsScreen')}
            >
              <Ionicons name="star-outline" size={24} color={colors.title} />
              <Text style={styles.menuText}>Recenziile Mele</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleWhatsAppHelp}
            >
              <Ionicons name="help-circle-outline" size={24} color={colors.title} />
              <Text style={styles.menuText}>Ajutor</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={'red'} />
              <Text style={[styles.menuText, styles.logoutText]}>Delogare</Text>
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Spațiu pentru BottomNavigation
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 20,
    backgroundColor: 'white',
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
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.title,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: colors.text,
  },
  label: {
    fontSize: moderateScale(14),
    color: colors.text,
    marginBottom: 4,
  },
  value: {
    fontSize: moderateScale(16),
    color: colors.title,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: -4,
          height: -4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.title,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.text,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: -4,
          height: -4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.title,
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: 'red',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default ProfileScreen; 