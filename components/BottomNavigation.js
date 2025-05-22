import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const getNavItemStyle = (screenName) => {
    return [
      styles.navItem,
      currentScreen === screenName ? styles.activeNavItem : null,
    ];
  };

  const getTextStyle = (screenName) => {
    return [
      styles.navText,
      currentScreen === screenName ? styles.activeNavText : null,
    ];
  };

  const getIconColor = (screenName) => {
    return currentScreen === screenName ? '#2D3FE7' : '#94A3B8';
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={getNavItemStyle('Home')}
        onPress={() => navigateToScreen('Home')}
      >
        <Ionicons name="home-outline" size={24} color={getIconColor('Home')} />
        <Text style={getTextStyle('Home')}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={getNavItemStyle('Appointments')}
        onPress={() => navigateToScreen('Appointments')}
      >
        <Ionicons name="calendar-outline" size={24} color={getIconColor('Appointments')} />
        <Text style={getTextStyle('Appointments')}>Programări</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={getNavItemStyle('Products')}
        onPress={() => navigateToScreen('Products')}
      >
        <Ionicons name="pricetag-outline" size={24} color={getIconColor('Products')} />
        <Text style={getTextStyle('Products')}>Produse</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={getNavItemStyle('Hainute')}
        onPress={() => navigateToScreen('Hainute')}
      >
        <Ionicons name="shirt-outline" size={24} color={getIconColor('Hainute')} />
        <Text style={getTextStyle('Hainute')}>Hainute</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={getNavItemStyle('Reviews')}
        onPress={() => navigateToScreen('Reviews')}
      >
        <Ionicons name="star-outline" size={24} color={getIconColor('Reviews')} />
        <Text style={getTextStyle('Reviews')}>Reviews</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(149, 157, 165, 0.1)',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
    maxWidth: Dimensions.get('window').width / 5,
  },
  activeNavItem: {
    color: '#2D3FE7',
  },
  navText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  activeNavText: {
    color: '#2D3FE7',
    fontWeight: '600',
  },
});

export default BottomNavigation; 