import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, neumorphic } from '../utils/theme';
import { moderateScale } from 'react-native-size-matters';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigation } from '@react-navigation/native';

const PoliticaConfScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Ionicons name="document-text-outline" size={40} color={colors.primary} style={styles.icon} />
          <Text style={styles.title}>Politica de Confidențialitate</Text>
          <Text style={styles.date}>Ultima actualizare: 20/05/2025</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Introducere</Text>
          <Text style={styles.text}>Această Politică de Confidențialitate descrie modul în care colectăm, folosim, stocăm și protejăm datele cu caracter personal ale utilizatorilor aplicației noastre destinate programărilor la salonul de cosmetică pentru animale și utilizării funcției AI de probare digitală a hainelor pentru animale.</Text>
          <Text style={styles.sectionTitle}>2. Date colectate</Text>
          <Text style={styles.text}>Prin intermediul aplicației colectăm următoarele categorii de date:</Text>
          <Text style={styles.bullet}>• Date personale: nume, adresă de e-mail, număr de telefon;</Text>
          <Text style={styles.bullet}>• Date despre animale: nume, rasă, vârstă, dimensiune;</Text>
          <Text style={styles.bullet}>• Imagini: fotografii ale animalului și ale hainelor încărcate de utilizator pentru utilizarea funcționalității AI;</Text>
          <Text style={styles.bullet}>• Informații de utilizare: programări, produse achiziționate, servicii selectate;</Text>
          <Text style={styles.bullet}>• Feedback / recenzii (dacă sunt oferite voluntar).</Text>
          <Text style={styles.sectionTitle}>3. Scopul prelucrării datelor</Text>
          <Text style={styles.text}>Datele sunt colectate pentru a:</Text>
          <Text style={styles.bullet}>• Permite crearea și gestionarea conturilor de utilizator;</Text>
          <Text style={styles.bullet}>• Furniza servicii de programare și achiziție de produse;</Text>
          <Text style={styles.bullet}>• Personaliza experiența utilizatorului și recomandările;</Text>
          <Text style={styles.bullet}>• Genera imagini AI realiste cu animalele utilizatorilor îmbrăcate cu produsele selectate;</Text>
          <Text style={styles.bullet}>• Îmbunătăți aplicația și analiza comportamentului utilizatorilor;</Text>
          <Text style={styles.bullet}>• Respecta obligațiile legale și de reglementare.</Text>
          <Text style={styles.sectionTitle}>4. Stocarea datelor</Text>
          <Text style={styles.text}>Datele sunt stocate în medii securizate și nu sunt păstrate mai mult decât este necesar. Imaginile procesate prin AI pot fi salvate temporar pentru afișarea rezultatului, dar nu sunt utilizate în alte scopuri.</Text>
          <Text style={styles.sectionTitle}>5. Partajarea datelor</Text>
          <Text style={styles.text}>Nu vindem, închiriem sau distribuim datele personale către terți în scopuri comerciale. Datele pot fi partajate doar cu parteneri tehnologici (ex. procesatori AI) strict pentru furnizarea serviciului, și doar în condiții de confidențialitate.</Text>
          <Text style={styles.sectionTitle}>6. Drepturile utilizatorilor</Text>
          <Text style={styles.text}>Utilizatorii au dreptul să:</Text>
          <Text style={styles.bullet}>• Acceseze datele proprii;</Text>
          <Text style={styles.bullet}>• Rectifice datele incorecte;</Text>
          <Text style={styles.bullet}>• Solicite ștergerea datelor;</Text>
          <Text style={styles.bullet}>• Se opun prelucrării sau să solicite restricționarea acesteia.</Text>
          <Text style={styles.sectionTitle}>7. Securitate</Text>
          <Text style={styles.text}>Aplicăm măsuri tehnice și organizatorice pentru a proteja datele utilizatorilor împotriva accesului neautorizat, pierderii sau modificării.</Text>
          <Text style={styles.sectionTitle}>8. Contact</Text>
          <Text style={styles.text}>Pentru orice întrebare legată de confidențialitate sau pentru a exercita drepturile tale, ne poți contacta la: support@funditesicodite.ro</Text>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  headerCard: {
    ...neumorphic,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    margin: 20,
    padding: 24,
    marginBottom: 0,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: moderateScale(13),
    color: colors.text,
    marginBottom: 0,
    textAlign: 'center',
  },
  card: {
    ...neumorphic,
    backgroundColor: '#fff',
    borderRadius: 24,
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: moderateScale(14),
    color: colors.text,
    marginBottom: 8,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: moderateScale(14),
    color: colors.text,
    marginLeft: 12,
    marginBottom: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 5,
  },
});

export default PoliticaConfScreen; 