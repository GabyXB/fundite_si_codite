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

const TermeniSiConditiiScreen = () => {
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
          <Text style={styles.title}>Termeni de Utilizare</Text>
          <Text style={styles.date}>Ultima actualizare: 19/05/2025</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Acceptarea termenilor</Text>
          <Text style={styles.text}>Prin utilizarea acestei aplicații, ești de acord cu acești Termeni de Utilizare. Dacă nu ești de acord, te rugăm să nu utilizezi aplicația.</Text>
          <Text style={styles.sectionTitle}>2. Descrierea serviciului</Text>
          <Text style={styles.text}>Aplicația oferă utilizatorilor posibilitatea de a:</Text>
          <Text style={styles.bullet}>• Crea un cont și a-și adăuga animalele de companie;</Text>
          <Text style={styles.bullet}>• Programa sesiuni de cosmetică în saloane partenere;</Text>
          <Text style={styles.bullet}>• Vizualiza și comanda produse și haine pentru animale;</Text>
          <Text style={styles.bullet}>• Genera imagini AI cu animalele îmbrăcate cu articolele selectate;</Text>
          <Text style={styles.bullet}>• Lăsa recenzii după finalizarea programărilor.</Text>
          <Text style={styles.sectionTitle}>3. Eligibilitate</Text>
          <Text style={styles.text}>Aplicația poate fi utilizată de persoane majore. Minorii pot folosi aplicația doar cu acordul părinților sau al tutorelui legal.</Text>
          <Text style={styles.sectionTitle}>4. Răspundere și utilizare corectă</Text>
          <Text style={styles.text}>Utilizatorii se obligă să nu:</Text>
          <Text style={styles.bullet}>• Încarce conținut ilegal, dăunător sau ofensator;</Text>
          <Text style={styles.bullet}>• Folosească aplicația pentru a încălca drepturile altora;</Text>
          <Text style={styles.bullet}>• Tenteze să acceseze neautorizat datele sau sistemele aplicației;</Text>
          <Text style={styles.bullet}>• Încarce imagini care nu le aparțin sau care nu au legătură cu animalele și hainele proprii.</Text>
          <Text style={styles.sectionTitle}>5. Proprietate intelectuală</Text>
          <Text style={styles.text}>Toate drepturile asupra aplicației, interfeței, logo-urilor, algoritmilor AI și conținutului generat aparțin dezvoltatorilor aplicației. Utilizatorii nu au dreptul de a redistribui, copia sau utiliza în alte scopuri aplicația fără permisiune scrisă.</Text>
          <Text style={styles.sectionTitle}>6. Modificări ale serviciilor</Text>
          <Text style={styles.text}>Ne rezervăm dreptul de a modifica, suspenda sau întrerupe parțial sau total funcționalitățile aplicației fără notificare prealabilă.</Text>
          <Text style={styles.sectionTitle}>7. Limitarea răspunderii</Text>
          <Text style={styles.text}>Nu suntem răspunzători pentru eventuale daune cauzate de utilizarea incorectă a aplicației, nefuncționarea temporară sau erori tehnice independente de noi.</Text>
          <Text style={styles.sectionTitle}>8. Încetarea utilizării</Text>
          <Text style={styles.text}>Putem suspenda sau închide contul unui utilizator care încalcă acești termeni sau folosește aplicația în mod abuziv.</Text>
          <Text style={styles.sectionTitle}>9. Contact și suport</Text>
          <Text style={styles.text}>Pentru orice întrebări sau probleme, ne puteți contacta la: support@funditesicodite.ro</Text>
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

export default TermeniSiConditiiScreen; 