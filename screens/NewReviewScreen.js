import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';

const S3_UPLOAD_URL = 'http://13.60.13.114:5000/api/upload/review'; // Endpoint pentru upload text review (de implementat in backend)

const NewReviewScreen = () => {
  const navigation = useNavigation();
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hadAppointment, setHadAppointment] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      setTopic('');
      setText('');
      setStars(0);
      // Actualizează had_appointment din backend la fiecare focus
      const refreshHadAppointment = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const userId = await AsyncStorage.getItem('userId');
          if (!token || !userId) return setHadAppointment(null);
          const resp = await fetch(`http://13.60.13.114:5000/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!resp.ok) return setHadAppointment(null);
          const user = await resp.json();
          if (user && typeof user.had_appointment !== 'undefined') {
            await AsyncStorage.setItem('had_appointment', user.had_appointment.toString());
            setHadAppointment(parseInt(user.had_appointment));
          } else {
            setHadAppointment(null);
          }
        } catch {
          setHadAppointment(null);
        }
      };
      refreshHadAppointment();
    }, [])
  );

  const handleStarPress = (index) => {
    setStars(index + 1);
  };

  const handleSubmit = async () => {
    if (!topic.trim() || !text.trim() || stars === 0) {
      Alert.alert('Eroare', 'Completează toate câmpurile și selectează stelele!');
      return;
    }
    if (topic.length > 40) {
      Alert.alert('Eroare', 'Topic-ul poate avea maxim 40 de caractere!');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) throw new Error('Nu sunteți autentificat');
      // 1. Upload text in S3 (sau backend)
      const reviewContent = { text };
      const uploadResp = await fetch(S3_UPLOAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reviewContent),
      });
      if (!uploadResp.ok) throw new Error('Eroare la upload text review');
      const { link } = await uploadResp.json();
      // 2. Creeaza recenzia in backend
      const resp = await fetch('http://13.60.13.114:5000/api/recenzii', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          user_id: parseInt(userId),
          topic,
          text_link: link,
          stele: stars,
        }),
      });
      if (!resp.ok) throw new Error('Eroare la crearea recenziei');
      Alert.alert('Succes', 'Recenzia a fost adăugată!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Eroare', e.message || 'Eroare la trimiterea recenziei');
    } finally {
      setLoading(false);
    }
  };

  if (hadAppointment === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adaugă recenzie</Text>
          <View style={{width: 40}} />
        </View>
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (hadAppointment !== 1) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adaugă recenzie</Text>
          <View style={{width: 40}} />
        </View>
        <View style={{flex:1, justifyContent:'center', alignItems:'center', padding:32}}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.accent} style={{marginBottom:24}} />
          <Text style={{fontSize:20, fontWeight:'700', color:colors.primary, marginBottom:12, textAlign:'center'}}>Nu poți adăuga recenzie</Text>
          <Text style={{fontSize:16, color:colors.text, textAlign:'center', marginBottom:24}}>Trebuie să ai cel puțin o programare finalizată pentru a putea lăsa o recenzie.</Text>
          <TouchableOpacity style={styles.bigBackButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={22} color="#fff" style={{marginRight:10}} />
            <Text style={styles.submitButtonText}>Înapoi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header modern sticky */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adaugă recenzie</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Subiect */}
          <View style={styles.inputGroup}>
            <Ionicons name="pricetag-outline" size={20} color={colors.accent} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={topic}
              onChangeText={setTopic}
              maxLength={40}
              placeholder="Subiect (max 40 caractere)"
              placeholderTextColor="#B0B0B0"
            />
          </View>
          {/* Recenzie */}
          <View style={styles.inputGroup}>
            <Ionicons name="document-text-outline" size={20} color={colors.accent} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textarea]}
              value={text}
              onChangeText={setText}
              placeholder="Scrie recenzia aici..."
              placeholderTextColor="#B0B0B0"
              multiline
              numberOfLines={5}
            />
          </View>
          {/* Stele */}
          <Text style={styles.label}>Stele</Text>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <TouchableOpacity key={i} onPress={() => handleStarPress(i)} activeOpacity={0.7}>
                <Ionicons
                  name={i < stars ? 'star' : 'star-outline'}
                  size={moderateScale(36)}
                  color={'#FFC107'}
                  style={[styles.starIcon, i < stars && styles.starSelected]}
                />
              </TouchableOpacity>
            ))}
          </View>
          {/* Buton principal modern */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={styles.buttonContent}>
                <Ionicons name="send" size={22} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.submitButtonText}>Trimite recenzia</Text>
              </View>
            )}
          </TouchableOpacity>
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
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: colors.title,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: moderateScale(15),
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
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
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  bigBackButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default NewReviewScreen; 