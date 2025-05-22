import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}; 