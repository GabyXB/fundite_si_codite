import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import ProductsScreen from './screens/ProductsScreen';
import CartScreen from './screens/CartScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import ReviewsScreen from './screens/ReviewsScreen';

const Stack = createStackNavigator();

// Create AuthContext
export const AuthContext = createContext();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token găsit în AsyncStorage:', token ? 'Da' : 'Nu');
      
      if (token) {
        const response = await fetch('http://10.0.2.2:5000/api/auth/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Token verificat cu succes. UserId:', data.userId);
          await AsyncStorage.setItem('userId', data.userId.toString());
          setIsAuthenticated(true);
        } else {
          console.log('Token invalid sau expirat');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userId');
          setIsAuthenticated(false);
        }
      } else {
        console.log('Nu există token în AsyncStorage');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Eroare la verificarea autentificării:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token, userId) => {
    try {
      console.log('Stocare token și userId în AsyncStorage');
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId.toString());
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Eroare la stocarea token-ului:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('Ștergere token și userId din AsyncStorage');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Eroare la ștergerea token-ului:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2D3FE7" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated }}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName={isAuthenticated ? "Home" : "Login"}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Appointments" component={AppointmentsScreen} />
              <Stack.Screen name="Products" component={ProductsScreen} />
              <Stack.Screen name="Favorites" component={FavoritesScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Reviews" component={ReviewsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App; 