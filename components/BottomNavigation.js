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
import { colors, shadows, neumorphic } from '../utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, []);

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
    return currentScreen === screenName ? colors.primary : colors.text;
  };

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom || (Platform.OS === 'ios' ? 24 : 12) }]}>
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
        <Text style={getTextStyle('Reviews')}>Recenzii</Text>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: {
          width: 0,
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
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
    maxWidth: Dimensions.get('window').width / 5,
  },
  activeNavItem: {
    color: colors.primary,
  },
  navText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  activeNavText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default BottomNavigation; 