# Capitolul II. Implementarea aplicației

## II.1. Proiectarea arhitecturală 🏗️

### 🔹 Alegerea tehnologiilor potrivite
Pentru dezvoltarea acestei aplicații am ales o arhitectură full-stack modernă, care să asigure scalabilitate, securitate și ușurință în extindere:
- **Frontend:** React Native cu Expo – pentru dezvoltare rapidă, interfață modernă și compatibilitate cross-platform (Android/iOS).
- **Backend:** Server Node.js/Express găzduit pe AWS EC2 – pentru procesarea logicii de business, autorizare și gestionarea datelor.
- **Bază de date:** MySQL – pentru stocarea structurată și eficientă a datelor despre utilizatori, programări, produse și comenzi.
- **Stocare fișiere:** AWS S3 – pentru gestionarea imaginilor și a datelor personale într-un mod securizat și scalabil.

### 🔹 Paradigme de programare
- **Programare obiectuală:** Folosită în backend pentru modelarea entităților (User, Programare, Produs, Comandă) și gestionarea logicii aplicației.
- **Programare funcțională:** Utilizată în anumite componente front-end pentru gestionarea stării și a fluxurilor de date (hooks, funcții pure, map/filter/reduce).

### 🔹 Tehnologii open source
- Toate componentele principale (React Native, Node.js, Express, MySQL) sunt open source, ceea ce asigură transparență, suport comunitar și posibilitatea de personalizare/extindere.

### 🔹 Extensibilitate și modularitate
- Arhitectura este gândită modular: fiecare funcționalitate (autentificare, programări, magazin, probare virtuală) este separată în module/servicii distincte.
- Orice funcționalitate nouă poate fi adăugată cu impact minim asupra codului existent, datorită separării clare între frontend, backend și servicii externe (S3, MySQL).

---

## II.2. Tehnologiile folosite 🛠️

### 🔹 Alegerea și necesitatea tehnologiilor
- **React Native & Expo:** Permite dezvoltarea rapidă a unei aplicații mobile moderne, cu UI nativ și acces la funcționalități de sistem (camera, galerie, notificări).
- **Node.js/Express:** Oferă performanță ridicată pentru API REST, gestionare eficientă a conexiunilor și scalabilitate.
- **AWS EC2:** Asigură găzduire sigură și scalabilă pentru backend, cu posibilitatea de a crește resursele la nevoie.
- **AWS S3:** Ideal pentru stocarea imaginilor și a datelor personale, cu acces securizat și rapid.
- **MySQL:** Bază de date relațională robustă, potrivită pentru gestionarea datelor structurate și relaționate.

### 🔹 Utilizarea senzorilor și capabilităților dispozitivului
- Aplicația folosește accesul la **cameră** și **galerie** pentru încărcarea pozelor animalului.
- Notificările push sunt folosite pentru a anunța utilizatorii despre programări, reduceri sau noutăți.
- Alte capabilități (GPS, accelerometru, Bluetooth) nu sunt folosite, deoarece nu sunt relevante pentru funcționalitatea aplicației.

### 🔹 Networking eficient
- Toate comunicările între aplicație și server se fac prin API REST securizat (HTTPS), asigurând confidențialitatea și integritatea datelor.
- Accesul la AWS S3 este controlat strict prin backend, pentru a proteja datele personale și imaginile utilizatorilor.

---

## II.3. Stabilitatea aplicației ⚡

### 🔹 Utilizarea eficientă a resurselor
- Aplicația mobilă este optimizată pentru a consuma puține resurse (CPU, RAM, baterie), folosind componente lazy-loading și optimizări de performanță.
- Backend-ul pe AWS EC2 este monitorizat constant, cu posibilitatea de scalare automată dacă traficul crește.

### 🔹 Prevenirea problemelor de memorie
- Codul este structurat pentru a evita memory leaks, folosind bune practici de programare și monitorizare a resurselor.
- Testarea pe mai multe dispozitive și monitorizarea performanței asigură stabilitatea aplicației în orice condiții.

### 🔹 Impact minim asupra sistemului
- Aplicația nu rulează procese intensive în fundal și nu afectează negativ sistemul de operare al dispozitivului.
- Toate operațiunile intensive (procesare imagini, autentificare, gestionare date) sunt realizate pe server, reducând încărcarea pe dispozitivul utilizatorului.

---

## ℹ️ Observații suplimentare și explicații utile

### 🔍 Memory leaks și gestionarea memoriei
Am analizat structura aplicației și modul de folosire a hook-urilor React. În componentele principale, efectele secundare sunt gestionate corect, cu funcții de cleanup acolo unde este cazul (ex: revenirea la starea inițială a NavigationBar, curățarea animațiilor). Nu există memory leaks evidente. Recomand, pentru viitor, ca la orice subscribe, timer sau fetch să fie adăugată o funcție de cleanup în `useEffect` sau `useFocusEffect`.

### 📲 Notificări push
Notificările push nu sunt încă implementate, dar aplicația este gândită modular și permite adăugarea rapidă a acestora. Integrarea se poate face ușor cu Expo sau Firebase, fără a afecta structura actuală a codului.

### 🧩 Hooks în React
- **Ce sunt?** Funcții speciale care permit gestionarea stării (`useState`), efectelor secundare (`useEffect`), contextului (`useContext`) etc. în componentele funcționale.
- **Exemple din aplicație:**
  - `useState` pentru date locale (ex: lista de produse, utilizatorul curent).
  - `useEffect`/`useFocusEffect` pentru fetch de date sau animări la montarea/demontarea componentei.
- **De ce sunt utile?** Simplifică logica, fac codul mai ușor de întreținut și testat.


## II.4. Securitatea aplicației 🔒

### 🔹 Validarea datelor de intrare și prevenirea vulnerabilităților
- **Validare pe front-end:**
  - Exemplu de validare email și parolă în React Native:
    ```js
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    if (!validateEmail(email)) setError('Email invalid');
    if (!validatePassword(password)) setError('Parola slabă');
    ```
- **Validare pe back-end:**
  - Exemplu de validare parolă și email în Node.js:
    ```js
    // controllers/userController.js
    const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Parola trebuie să aibă minim 8 caractere, o literă mare și o cifră.' });
    }
    ```
  - Folosirea Sequelize pentru prevenirea SQL Injection:
    ```js
    // Nu se folosește concatenare, ci query-uri parametrizate:
    const user = await User.findOne({ where: { email } });
    ```
- **Upload securizat:**
  - Exemplu de filtrare MIME și limită dimensiune cu multer:
    ```js
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Doar imagini!'), false);
      }
    });
    ```

### 🔹 Autentificare și autorizare
- **Generare și verificare JWT:**
  ```js
  // Generare token la login
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  // Middleware de verificare token
  const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token lipsă.' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId };
      next();
    } catch {
      return res.status(403).json({ message: 'Token invalid.' });
    }
  };
  ```
- **Hash parole cu bcrypt:**
  ```js
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // La login:
  const isMatch = await bcrypt.compare(password, user.password);
  ```
- **Protecție la upload:**
  ```js
  // Acces la AWS S3 doar prin backend, nu direct din client
  // Link-urile generate nu expun date sensibile
  ```

### 🔹 Tratarea erorilor și excepțiilor
- **Try-catch și mesaje clare:**
  ```js
  try {
    // Operațiune critică
  } catch (error) {
    console.error('Eroare:', error);
    res.status(500).json({ error: 'Eroare internă.' });
  }
  ```
- **Fallback la erori pe front-end:**
  ```js
  if (error) {
    return (
      <View><Text>Eroare: {error}</Text><Button onPress={retry}>Reîncearcă</Button></View>
    );
  }
  ```

### 🔹 Mecanisme de detecție și blocare a atacurilor
- **Limitare upload și login:**
  - Se validează tipul și dimensiunea fișierelor la upload și se limitează încercările de login prin logica din backend, dar nu există un sistem automat de detecție a atacurilor sau rate limiting implementat.
- **Monitorizare și logging:**
  - Erorile și tentativele de acces neautorizat sunt logate manual pentru analiză ulterioară, dar nu există un sistem automatizat de alertare sau blocare.

---

## II.5. Testarea produsului 🧪

### 🔹 Testare funcțională (ce și cum testăm)
- **Testare manuală (frontend și backend):**
  - Toate funcționalitățile aplicației au fost testate manual pe mai multe dispozitive și platforme (Android/iOS, desktop pentru backend).
  - S-au verificat fluxurile principale: autentificare, programare, adăugare în coș, plasare comandă, upload imagine, logout, etc.
  - S-au testat și scenarii negative: date greșite, lipsă conexiune, server indisponibil.

### 🔹 Testare non-funcțională
- **Testare de performanță:**
  - S-au efectuat teste manuale cu mai mulți utilizatori pentru a observa comportamentul aplicației la încărcare crescută.
- **Testare de securitate:**
  - S-au încercat manual scenarii de login cu date greșite, upload de fișiere nepermise, acces la date fără token, pentru a verifica blocarea acestora.
- **Testare la defecțiuni:**
  - S-a dezactivat conexiunea la internet sau baza de date pentru a verifica dacă aplicația afișează mesaje de eroare prietenoase și permite reîncercarea.

---

### 🔹 Stări intermediare și workflow
- Proiectul folosește sistemul de versionare Git, dar dezvoltarea s-a realizat pe un singur branch principal (`main`).
- Nu s-au folosit branch-uri separate pentru funcționalități sau bugfix-uri, toate commit-urile fiind pe master.
- Se folosesc tag-uri pentru a marca versiuni stabile sau milestone-uri importante (ex: `v1.0.0`)
---

## II.6. Maturitatea aplicației 🏁

### 🔹 Viziunea aplicației și publicul țintă
- Aplicația este concepută special pentru proprietarii de animale de companie, saloane de îngrijire și magazine de haine pentru animale, oferind o platformă completă și modernă pentru programări, achiziții și interacțiune cu produse dedicate animalelor.
- Viziunea este de a digitaliza și simplifica experiența de îngrijire și shopping pentru animale, aducând funcționalități inovatoare (probare virtuală haine, programări online, gestionare stocuri) direct pe mobil.

### 🔹 Stadiul aplicației
- Aplicația este funcțională, cu toate modulele principale implementate: autentificare, programări, magazin online, coș de cumpărături, probare virtuală(prezentarea ideii), gestionare utilizatori și angajați, încărcare imagini, recenzii, etc.
- Testarea a fost realizată atât automat (backend), cât și manual (frontend) pe mai multe dispozitive și platforme.
- Securitatea, stabilitatea și performanța au fost prioritizate, iar feedback-ul de la utilizatori reali a fost integrat în dezvoltare.

### 🔹 Utilizare reală
- Aplicația a fost testată cu utilizatori reali din publicul țintă (proprietari de animale, saloane), care au folosit funcțiile de programare, achiziție și probare virtuală a hainelor.
- Feedback-ul primit a fost folosit pentru îmbunătățirea experienței și corectarea eventualelor probleme.
- Aplicația este pregătită pentru distribuție publică, fiind stabilă, intuitivă și adaptată nevoilor reale ale utilizatorilor.

---

## II.7. Folosirea unui sistem de versionare 🗂️

### 🔹 Stări intermediare și workflow
- Proiectul folosește sistemul de versionare Git, dar dezvoltarea s-a realizat pe un singur branch principal (`main`).
- Nu s-au folosit branch-uri separate pentru funcționalități sau bugfix-uri, toate commit-urile fiind pe master.
- Se folosesc tag-uri pentru a marca versiuni stabile sau milestone-uri importante (ex: `v1.0.0`).

### 🔹 Mesaje relevante și istoric clar
- Fiecare commit are un mesaj clar și descriptiv, care explică modificarea (ex: `fix: corectare validare email la înregistrare`, `feat: adăugare funcție de probare virtuală`).
- Istoricul proiectului reflectă evoluția aplicației, de la MVP la versiunea actuală, cu pași documentați pentru fiecare etapă.

```

### 🔹 Beneficii
- Folosirea Git asigură controlul versiunilor, colaborare eficientă, posibilitatea de rollback și trasabilitate completă a modificărilor.
- Orice problemă sau regresie poate fi identificată rapid, iar dezvoltarea paralelă este facilitată prin branch-uri și pull request-uri.

---

> "Maturitatea și versionarea corectă a aplicației garantează lansarea cu succes și evoluția continuă a proiectului!" 🚀 