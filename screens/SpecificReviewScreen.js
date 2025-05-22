import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';

const SpecificReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { review } = route.params;
  const [fullText, setFullText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchFullText();
    checkOwner();
  }, []);

  const fetchFullText = async () => {
    try {
      const resp = await fetch(review.text_link);
      const data = await resp.json();
      setFullText(data.text || '');
    } catch (e) {
      setFullText('Eroare la încărcarea recenziei.');
    } finally {
      setLoading(false);
    }
  };

  const checkOwner = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setIsOwner(parseInt(userId) === review.user_id);
  };

  const handleDelete = async () => {
    Alert.alert('Confirmare', 'Sigur vrei să ștergi această recenzie?', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const resp = await fetch(`http://13.60.13.114:5000/api/recenzii/${review.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!resp.ok) throw new Error('Eroare la ștergere');
          Alert.alert('Succes', 'Recenzia a fost ștearsă!');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Eroare', e.message || 'Eroare la ștergere');
        }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header modern sticky */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalii recenzie</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.topic}>{review.topic}</Text>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < review.stele ? 'star' : 'star-outline'}
                size={moderateScale(32)}
                color={'#FFC107'}
                style={[styles.starIcon, i < review.stele && styles.starSelected]}
              />
            ))}
          </View>
          <Text style={styles.date}>{new Date(review.created_at).toLocaleDateString('ro-RO')}</Text>
          <Text style={styles.userName}>{review.userName || 'Anonim'}</Text>
          {loading ? <ActivityIndicator color={colors.primary} style={{marginTop: 24}} /> :
            <Text style={styles.text}>{fullText}</Text>
          }
          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditReviewScreen', { review, fullText })}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
                <Text style={styles.editButtonText}>Editează</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#fff" />
                <Text style={styles.deleteButtonText}>Șterge</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
    marginBottom: 24,
  },
  topic: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  starIcon: {
    marginHorizontal: 6,
    opacity: 0.7,
    transform: [{ scale: 1 }],
  },
  starSelected: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  date: {
    fontSize: moderateScale(13),
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: moderateScale(15),
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: moderateScale(15),
    color: colors.title,
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF2400',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default SpecificReviewScreen; 