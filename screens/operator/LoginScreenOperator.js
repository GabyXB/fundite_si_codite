import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../../context/AuthContext';

const LoginScreenOperator = () => {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Te rugăm să completezi toate câmpurile');
      return;
    }
    if (!validateEmail(email)) {
      setError('Adresa de email nu este validă');
      return;
    }
    if (!validatePassword(password)) {
      setError('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://13.60.13.114:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      let userId = data.userId;
      if (!userId) {
        try {
          const tokenParts = data.token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          userId = payload.userId;
        } catch (e) {
          throw new Error('Nu s-a putut extrage ID-ul utilizatorului din token');
        }
      }
      if (!response.ok) {
        throw new Error(data.error || 'Eroare la autentificare');
      }
      if (!data.token) {
        throw new Error('Răspuns invalid de la server. Te rugăm să încerci din nou.');
      }
      await signIn(data.token, userId);
      setEmail('');
      setPassword('');
      navigation.replace('DashboardOperator');
    } catch (e) {
      setError(e.message || 'Eroare la autentificare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {navigation.canGoBack() && (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#6C47FF" />
        </TouchableOpacity>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#6C47FF" />
            <Text style={styles.title}>OperatorApp</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email operator"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Parolă"
              placeholderTextColor="#B0B0B0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Autentificare</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C47FF',
    marginTop: 8,
    letterSpacing: 1,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: '#6C47FF',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    color: '#222',
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  error: {
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default LoginScreenOperator; 