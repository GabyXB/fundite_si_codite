import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import TextLink from '../components/TextLink';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      })
    ]).start();
  }, []);

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

    try {
      const response = await fetch('http://13.60.32.137:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eroare la autentificare');
      }

      if (!data.token) {
        console.error('Răspuns invalid de la server:', data);
        throw new Error('Răspuns invalid de la server. Te rugăm să încerci din nou.');
      }

      // Extragem userId din token dacă nu este în răspuns
      let userId = data.userId;
      if (!userId) {
        try {
          const tokenParts = data.token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          userId = payload.userId;
        } catch (e) {
          console.error('Eroare la decodarea tokenului:', e);
          throw new Error('Nu s-a putut extrage ID-ul utilizatorului din token');
        }
      }

      await signIn(data.token, userId);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Eroare la login:', error);
      setError(error.message || 'A apărut o eroare. Încearcă din nou.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.topSection,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim
                }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="person" size={40} color="#424874" />
              </View>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [50, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={styles.title}>Bine ai venit!</Text>
            <Text style={styles.subtitle}>Autentifică-te pentru a continua</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />

              <CustomInput
                placeholder="Parolă"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity 
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>Ai uitat parola?</Text>
              </TouchableOpacity>

              <CustomButton
                title="Autentificare"
                onPress={handleLogin}
                style={styles.loginButton}
              />

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Nu ai un cont? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Înregistrează-te</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3FF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    height: 260,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#A6B1E1',
        shadowOffset: {
          width: 8,
          height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F3FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#A6B1E1',
        shadowOffset: {
          width: 0,
          height: -8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#424874',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    letterSpacing: 0.3,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#424874',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: '#424874',
    borderRadius: 12,
    height: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#A6B1E1',
        shadowOffset: {
          width: 4,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#424874',
    fontWeight: '600',
  },
});

export default LoginScreen; 