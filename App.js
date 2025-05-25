import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import Constants from 'expo-constants';
import OperatorApp from './OperatorApp';

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
import NewAppointmentScreen from './screens/NewAppointmentScreen';
import AppointmentDetailsScreen from './screens/AppointmentDetailsScreen';
import HainuteScreen from './screens/HainuteScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import AddPetScreen from './screens/AddPetScreen';
import PetDetailsScreen from './screens/PetDetailsScreen';
import HainaDetailsScreen from './screens/HainaDetailsScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import OrderDetailsScreen from './screens/OrderDetailsScreen';
import EditPetScreen from './screens/EditPetScreen';
import ServiceScreen from './screens/ServiceScreen';
import SpecificProductScreen from './screens/SpecificProductScreen';
import GeneratedAIScreen from './screens/GeneratedAIScreen';
import NewReviewScreen from './screens/NewReviewScreen';
import SpecificReviewScreen from './screens/SpecificReviewScreen';
import EditReviewScreen from './screens/EditReviewScreen';
import MyReviewsScreen from './screens/MyReviewsScreen';
import PoliticaConfScreen from './screens/PoliticaConfScreen';
import TermeniSiConditiiScreen from './screens/TermeniSiConditiiScreen';

// Context
import AuthContext from './context/AuthContext';

const Stack = createStackNavigator();

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
        const response = await fetch('http://13.60.13.114:5000/api/auth/verify-token', {
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

  const appVariant = Constants?.expoConfig?.extra?.appVariant || Constants?.manifest?.extra?.appVariant || process.env.APP_VARIANT;

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated }}>
      {appVariant === 'operator' ? (
        <OperatorApp />
      ) : isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2D3FE7" />
        </View>
      ) : (
        <NavigationContainer>
          <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName={isAuthenticated ? "Home" : "Login"}
          >
            {isAuthenticated ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Appointments" component={AppointmentsScreen} />
                <Stack.Screen name="NewAppointment" component={NewAppointmentScreen} />
                <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
                <Stack.Screen name="Products" component={ProductsScreen} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="Hainute" component={HainuteScreen} />
                <Stack.Screen name="Reviews" component={ReviewsScreen} />
                <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
                <Stack.Screen name="AddPet" component={AddPetScreen} />
                <Stack.Screen name="HainaDetails" component={HainaDetailsScreen} />
                <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
                <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                <Stack.Screen name="EditPet" component={EditPetScreen} />
                <Stack.Screen name="SpecificProduct" component={SpecificProductScreen} />
                <Stack.Screen name="Service" component={ServiceScreen} />
                <Stack.Screen name="GeneratedAI" component={GeneratedAIScreen} />
                <Stack.Screen name="NewReview" component={NewReviewScreen} />
                <Stack.Screen name="SpecificReview" component={SpecificReviewScreen} />
                <Stack.Screen name="EditReviewScreen" component={EditReviewScreen} />
                <Stack.Screen name="MyReviewsScreen" component={MyReviewsScreen} />
                <Stack.Screen name="PoliticaConf" component={PoliticaConfScreen} />
                <Stack.Screen name="TermeniSiConditii" component={TermeniSiConditiiScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="PoliticaConf" component={PoliticaConfScreen} />
                <Stack.Screen name="TermeniSiConditii" component={TermeniSiConditiiScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </AuthContext.Provider>
  );
};

export default App; 