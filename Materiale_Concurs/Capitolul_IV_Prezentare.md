# Capitolul IV. Prezentarea proiectului

## IV.1. Prezentare 🗣️

### 🔹 Maniera de prezentare și justificare
- Proiectul este prezentat atât prin materiale scrise (documentație, capturi de ecran, exemple de cod), cât și prin prezentare orală, adaptată publicului țintă.
- Necesitatea aplicației este justificată prin lipsa unei soluții integrate pentru saloane și magazine de haine pentru animale, precum și prin cererea crescută pentru digitalizarea serviciilor dedicate animalelor de companie.
- Materialele de prezentare includ: slide-uri, demo video, documentație detaliată, exemple de utilizare reală și testimoniale.

---

## IV.2. Documentația proiectului 📄

### 🔹 Descrierea problemei
- Proprietarii de animale și saloanele de îngrijire se confruntă cu dificultăți în gestionarea programărilor, achiziția de haine potrivite și lipsa unei platforme integrate care să le ofere toate serviciile într-un singur loc.

### 🔹 Descrierea soluției propuse
- Aplicația oferă o platformă completă pentru programări la salon, magazin online de haine pentru animale, probare virtuală a produselor, gestionare utilizatori și recenzii, totul într-o interfață modernă și intuitivă.

### 🔹 Definirea publicului țintă
- Publicul țintă este format din proprietari de animale de companie, saloane de îngrijire și magazine de haine pentru animale care doresc să-și digitalizeze serviciile și să ofere o experiență modernă clienților.

### 🔹 Prezentarea funcționalităților aplicației
- Programare la salon cu selectarea serviciilor dorite
- Magazin online cu haine și accesorii pentru animale
- Probare virtuală a hainelor pe animal (prin încărcare poză)
- Coș de cumpărături și plasare comenzi
- Gestionare utilizatori și angajați
- Recenzii
- Notificări (TO-DO)

### 🔹 Arhitectura aplicației
- Frontend: React Native + Expo (cross-platform)
- Backend: Node.js/Express pe AWS EC2
- Bază de date: MySQL
- Stocare imagini: AWS S3
- API REST cu răspunsuri JSON
- Securitate: JWT, bcrypt, validare date, middleware autorizare
- AI : OpenAI pentru prelucrarea imaginilor (in viitor)

### 🔹 Elemente distinctive / puncte forte
- Probare virtuală a hainelor pe animal (unic pe piață)
- Platformă all-in-one pentru programări și shopping
- Design modern, adaptabil, experiență rapidă și intuitivă
- Securitate și protecție a datelor personale

### 🔹 Ghid de instalare și configurare
1. Clonează repository-ul:
   ```bash
   git clone https://github.com/username/fsc-v2-cu-operator.git
   ```
2. Instalează dependențele pentru frontend și backend:
   ```bash
   cd fsc && npm install
   cd ../backend && npm install
   ```
3. Configurează variabilele de mediu (`.env`) pentru backend (exemplu: DB, AWS, JWT etc.).
4. Pornește backend-ul:
   ```bash
   npm run dev
   ```
5. Pornește aplicația mobilă cu Expo:
   ```bash
   cd ../fsc && npx expo start
   ```
6. Accesează aplicația pe Android/iOS folosind Expo Go sau emulator.

### 🔹 Răspunsuri la întrebări
- **Justificarea tehnologiilor:**
  - React Native și Expo permit dezvoltarea rapidă și cross-platform, cu UI nativ și acces la funcții de sistem.
  - Node.js/Express oferă performanță și scalabilitate pentru backend, iar AWS EC2/S3 asigură găzduire sigură și scalabilă.
  - MySQL este robust pentru date relaționale, iar JWT și bcrypt asigură securitatea datelor.
- **Opinia autorului despre idee și utilitate:**
  - Consider că această aplicație răspunde unei nevoi reale, aducând digitalizare și confort pentru proprietarii de animale și saloane. De exemplu, un client poate programa rapid o vizită la salon și poate vedea cum ar arăta animalul său cu o haină nouă, totul din câteva click-uri, fără drumuri inutile sau incertitudini.

### 🔹 Roadmap (exemple de viitor)
- Integrare notificări push pentru programări și oferte
- Sistem de fidelizare/clienți VIP
- Integrare plăți online
- Extindere cu funcții de socializare (galerie animale, evenimente)

---

> "O prezentare clară și o documentație completă demonstrează profesionalismul și potențialul real al aplicației!" 📝🚀 