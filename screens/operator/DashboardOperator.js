import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DashboardOperator = () => {
  const navigation = useNavigation();
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard Operator</Text>
        <View style={styles.buttonsColumn}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EmployeesOperator')}>
            <Ionicons name="people" size={48} color="#6C47FF" />
            <Text style={styles.cardText}>Angajați</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AppointmentsOperator')}>
            <Ionicons name="calendar" size={48} color="#6C47FF" />
            <Text style={styles.cardText}>Programări</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductsScreenOperator')}>
            <Ionicons name="cube" size={48} color="#6C47FF" />
            <Text style={styles.cardText}>Produse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ServiceScreenOperator')}>
            <Ionicons name="construct" size={48} color="#6C47FF" />
            <Text style={styles.cardText}>Servicii</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('HaineScreenOperator')}>
            <Ionicons name="shirt" size={48} color="#6C47FF" />
            <Text style={styles.cardText}>Haine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderScreenOperator')}>
            <Ionicons name="receipt" size={48} color="#6C47FF" />
            <Text style={styles.cardText}>Comenzi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C47FF',
    marginBottom: 32,
  },
  buttonsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 24,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 140,
  },
  cardText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#6C47FF',
  },
});

export default DashboardOperator; 