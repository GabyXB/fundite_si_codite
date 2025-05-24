# Documentație Frontend (React Native Expo) – FSC V2 CU OPERATOR

---

## Structură generală

- **App.js** – Punctul de intrare principal pentru aplicația client (user).
- **OperatorApp.js** – Punctul de intrare pentru aplicația de operator/admin.
- **/screens/** – Ecrane principale pentru utilizator (user).
- **/screens/operator/** – Ecrane pentru operator/admin.
- **/components/** – Componente UI reutilizabile (butoane, carduri, inputuri etc).

---

## App.js

### Rol și flux

- Inițializează contextul de autentificare (`AuthContext`).
- Verifică automat dacă există token valid în AsyncStorage la pornire.
- Decide dacă se pornește aplicația de operator (`OperatorApp`) sau aplicația de client, în funcție de variabila de build.
- Dacă utilizatorul nu este autentificat, afișează ecranele de login/register.
- Dacă este autentificat, afișează stack-ul principal de navigație cu toate ecranele aplicației.

### Navigație și fluxuri

- Folosește `@react-navigation/native` și `@react-navigation/stack`.
- Toate ecranele principale sunt înregistrate în navigator.
- Navigarea între ecrane se face fără header (`headerShown: false`).
- Navigarea se face pe baza autentificării: dacă există token valid, utilizatorul ajunge direct în aplicație, altfel la login/register.
- Contextul de autentificare (`AuthContext`) oferă funcții globale pentru login/logout, folosite în toate ecranele unde este nevoie de autentificare sau delogare.

### Exemplu de flux de autentificare

1. Utilizatorul introduce email și parolă în LoginScreen.
2. Se face request POST la `/api/auth/login`.
3. Dacă răspunsul conține token valid, acesta este salvat în AsyncStorage și contextul setează `isAuthenticated=true`.
4. Utilizatorul este redirecționat către HomeScreen.
5. La fiecare request către backend, tokenul este trimis în headerul Authorization.

### Props și context

- `signIn(token, userId)` – salvează tokenul și userId în AsyncStorage și setează autentificarea.
- `signOut()` – șterge tokenul și userId din AsyncStorage și deloghează utilizatorul.
- `isAuthenticated` – boolean, folosit pentru a decide ce stack de navigație să fie afișat.

---

## OperatorApp.js

### Rol și flux

- Punct de intrare pentru aplicația de operator/admin.
- Stack separat de navigație, cu ecrane dedicate pentru management (angajați, produse, comenzi, servicii, haine etc).
- Nu folosește contextul de autentificare din App.js, ci are propriul flux de login și management.

### Navigație și ecrane

- Toate ecranele de operator sunt înregistrate în navigator.
- Navigarea este fără header (`headerShown: false`).
- Ecrane principale:
  - **DashboardOperator** – Dashboard cu statistici și acces rapid la secțiuni de management.
  - **EmployeesOperator** – Listă angajați, cu opțiuni de adăugare, editare, ștergere.
  - **ProductsScreenOperator** – Listă produse, adăugare/editare/ștergere produs.
  - **ServiceScreenOperator** – Listă servicii, adăugare/editare/ștergere serviciu.
  - **HaineScreenOperator** – Listă haine, adăugare/editare/ștergere haină.
  - **OrderScreenOperator** – Listă comenzi, detalii comandă, editare status.
  - **AppointmentsOperator** – Listă programări, detalii, modificare status.

### Fluxuri tipice operator

- Operatorul se loghează cu user și parolă dedicate.
- Poate adăuga/edita/șterge angajați, produse, servicii, haine, comenzi.
- Poate vizualiza și modifica statusul programărilor și comenzilor.
- Navigarea între secțiuni se face rapid, fără reload, cu feedback vizual la acțiuni.

---

## Ecrane principale (screens/)

### HomeScreen.js

- **Rol:** Dashboard-ul principal al utilizatorului.
- **Funcționalități:**
  - Salută utilizatorul și afișează poza de profil (fetch din backend).
  - Afișează următoarea programare (fetch programări, filtrare după status și dată).
  - Listează animalele de companie (fetch animale, carduri interactive).
  - Navigare rapidă către profil, detalii animal, detalii programare.
- **Props:** none (folosește hooks și context).
- **Exemplu de interacțiune:**
  - Utilizatorul apasă pe un animal → navighează la PetDetailsScreen cu id-ul animalului.
  - Utilizatorul apasă pe cardul de programare → navighează la AppointmentDetailsScreen cu id-ul programării.
- **UX:** Scroll vertical, design modern, carduri, iconițe, animații, feedback la loading.

### LoginScreen.js

- **Rol:** Autentificare utilizator.
- **Funcționalități:**
  - Input email și parolă (cu validare locală și feedback vizual).
  - Buton de login, link către înregistrare.
  - Afișare erori de validare și backend.
- **Props:** none (folosește context pentru signIn).
- **Exemplu de request:**
  ```js
  fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  ```
- **UX:** Animații la intrare, feedback vizual pentru erori, buton custom cu loading.

### RegisterScreen.js

- **Rol:** Înregistrare utilizator nou.
- **Funcționalități:**
  - Inputuri pentru nume, email, parolă, validare locală și submit către backend.
  - Feedback vizual pentru erori și succes.
- **Exemplu de request:**
  ```js
  fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) })
  ```

### ProfileScreen.js

- **Rol:** Vizualizare și management profil utilizator.
- **Funcționalități:**
  - Afișează datele userului (nume, email, poză, fetch din backend).
  - Navigare către editare profil, istoric comenzi, recenzii proprii.
  - Buton de delogare (șterge token și userId din AsyncStorage, apelează signOut din context).
  - Acces rapid la suport (WhatsApp, deschide aplicația cu mesaj predefinit).
- **UX:** Card profil, meniu cu iconițe, animații, confirmare la delogare.

### AppointmentsScreen.js

- **Rol:** Listă programări (upcoming/past) pentru utilizator.
- **Funcționalități:**
  - Tab-uri pentru programări viitoare și trecute.
  - Carduri cu detalii programare (animal, serviciu, dată, status, preț, durată).
  - Navigare către detalii programare, adăugare programare nouă.
- **Flux date:** Fetch programări din backend, sortare și filtrare locală după status și dată.
- **Exemplu de request:**
  ```js
  fetch(`/api/programari/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
  ```

### CartScreen.js

- **Rol:** Vizualizare și management coș de cumpărături.
- **Funcționalități:**
  - Listă produse din coș, actualizare cantitate, eliminare produs (request la backend pentru fiecare acțiune).
  - Calcul total, validare stoc, buton de checkout (finalizează comanda).
- **Exemplu de request pentru eliminare produs:**
  ```js
  fetch('/api/cos/scoate', { method: 'DELETE', body: JSON.stringify({ user_id, product_id }) })
  ```
- **UX:** Feedback la acțiuni, animații la eliminare/adăugare, alertă la stoc insuficient.

### ProductsScreen.js

- **Rol:** Listă produse și servicii disponibile.
- **Funcționalități:**
  - Filtrare, sortare, căutare produse (local, după datele din backend).
  - Adăugare produs în coș (request la backend), vizualizare detalii produs.
- **Exemplu de request pentru adăugare în coș:**
  ```js
  fetch('/api/cos/adaugare', { method: 'POST', body: JSON.stringify({ user_id, product_id, cantitate }) })
  ```
- **UX:** Carduri produse, filtre vizuale, feedback la adăugare în coș.

### HainuteScreen.js

- **Rol:** Listă haine pentru animale.
- **Funcționalități:**
  - Listare, filtrare, vizualizare detalii haină.
- **UX:** Carduri haine, imagini, preț, filtrare după mărime/specie.

### ReviewsScreen.js

- **Rol:** Listă recenzii publice.
- **Funcționalități:**
  - Carduri recenzie, stele, preview text, navigare către detalii recenzie.
- **UX:** Carduri cu stele, preview text, dată, user.

### ProfileSettingsScreen.js

- **Rol:** Editare date profil (nume, email, parolă, poză).
- **Funcționalități:**
  - Form editabil, validare, submit către backend.
- **Exemplu de request:**
  ```js
  fetch(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify({ ... }) })
  ```

### AddPetScreen.js / EditPetScreen.js / PetDetailsScreen.js

- **Rol:** Adăugare, editare, vizualizare detalii animal de companie.
- **Funcționalități:**
  - Form cu validare, selectare specie/talie, upload poză, vizualizare detalii animal.
- **Exemplu de request pentru adăugare:**
  ```js
  fetch('/api/pets', { method: 'POST', body: JSON.stringify({ name, age, specie, talie, image }) })
  ```

### OrderHistoryScreen.js / OrderDetailsScreen.js

- **Rol:** Istoric comenzi și detalii comandă.
- **Funcționalități:**
  - Listă comenzi, detalii produse, status, preț total.
- **UX:** Carduri comenzi, detalii produse, status vizual.

### AppointmentDetailsScreen.js

- **Rol:** Detalii programare selectată.
- **Funcționalități:**
  - Informații complete despre programare, status, animal, serviciu, angajat.
- **UX:** Card detalii, status colorat, acțiuni rapide (anulare, confirmare).

### ServiceScreen.js

- **Rol:** Listă servicii disponibile.
- **Funcționalități:**
  - Carduri servicii, detalii, preț, adăugare la programare.
- **UX:** Carduri servicii, preț, descriere, buton de adăugare.

### SpecificProductScreen.js / HainaDetailsScreen.js

- **Rol:** Detalii produs/haine.
- **Funcționalități:**
  - Informații extinse, imagini, preț, adăugare în coș.
- **UX:** Galerie imagini, preț mare, buton de adăugare în coș.

### MyReviewsScreen.js / NewReviewScreen.js / EditReviewScreen.js / SpecificReviewScreen.js

- **Rol:** Management recenzii proprii și vizualizare detalii recenzie.
- **Funcționalități:**
  - Listă recenzii proprii, editare, adăugare, vizualizare recenzie specifică.
- **UX:** Form recenzie, stele, preview, editare rapidă.

---

## Ecrane Operator (screens/operator/)

- **LoginScreenOperator.js** – Login pentru operator/admin.
- **DashboardOperator.js** – Dashboard cu statistici, acces rapid la management.
- **EmployeesOperator.js** – Listă angajați, adăugare/editare/ștergere.
- **ProductsScreenOperator.js** – Listă produse, adăugare/editare/ștergere.
- **ServiceScreenOperator.js** – Listă servicii, adăugare/editare/ștergere.
- **HaineScreenOperator.js** – Listă haine, adăugare/editare/ștergere.
- **OrderScreenOperator.js** – Listă comenzi, detalii, editare status.
- **AppointmentsOperator.js** – Listă programări, detalii, modificare status.
- **Fiecare ecran are fluxuri similare cu cele de user, dar cu drepturi de administrare și acțiuni suplimentare.**

---

## Componente principale (components/)

### BottomNavigation.js
- **Rol:** Bară de navigație persistentă jos, cu iconițe și denumiri pentru Home, Programări, Produse, Hainute, Recenzii.
- **Funcționalități:** Navigare rapidă între secțiuni, highlight pe secțiunea activă, adaptare la platformă (iOS/Android).
- **Props:** none (folosește context și hooks de navigație).
- **Exemplu de utilizare:**
  ```jsx
  <BottomNavigation />
  ```

### CustomInput.js
- **Rol:** Input text custom cu iconițe, stil modern, validare vizuală.
- **Props:**
  - `placeholder` (string)
  - `value` (string)
  - `onChangeText` (func)
  - `secureTextEntry` (bool)
  - `leftIcon` (string, ex: 'mail-outline')
  - `rightIcon` (string, ex: 'eye-outline')
  - `onRightIconPress` (func)
  - `error` (bool)
- **Exemplu:**
  ```jsx
  <CustomInput placeholder="Email" value={email} onChangeText={setEmail} leftIcon="mail-outline" />
  ```

### CustomButton.js
- **Rol:** Buton custom cu variante (primary, secondary, outline), loading state, disabled state.
- **Props:**
  - `title` (string)
  - `onPress` (func)
  - `loading` (bool)
  - `disabled` (bool)
  - `variant` (string: 'primary' | 'secondary' | 'outline')
- **Exemplu:**
  ```jsx
  <CustomButton title="Salvează" onPress={handleSave} loading={isSaving} />
  ```

### PetCard.js
- **Rol:** Card animal de companie (nume, specie, talie, vârstă, poză).
- **Props:**
  - `pet` (obiect cu { name, specie, talie, age, image })
  - `onPress` (func)
- **Exemplu:**
  ```jsx
  <PetCard pet={pet} onPress={() => navigation.navigate('PetDetails', { id: pet.id })} />
  ```

### ProductCard.js
- **Rol:** Card produs (nume, preț, imagine placeholder).
- **Props:**
  - `product` (obiect cu { nume, pret })
  - `onPress` (func)
- **Exemplu:**
  ```jsx
  <ProductCard product={product} onPress={() => navigation.navigate('SpecificProduct', { id: product.id })} />
  ```

### ReviewCard.js
- **Rol:** Card recenzie (nume user, stele, topic, preview text, dată).
- **Props:**
  - `review` (obiect cu { topic, stele, previewText, created_at })
  - `userName` (string)
  - `onPress` (func)
  - `hideStars` (bool)
- **Exemplu:**
  ```jsx
  <ReviewCard review={review} userName={user.name} onPress={() => navigation.navigate('SpecificReview', { id: review.id })} />
  ```

### TimeSelectionSlider.js
- **Rol:** Selector oră/minut pentru programări.
- **Props:**
  - `hours` (number)
  - `minutes` (number)
  - `onHoursChange` (func)
  - `onMinutesChange` (func)
- **Exemplu:**
  ```jsx
  <TimeSelectionSlider hours={10} minutes={30} onHoursChange={setHours} onMinutesChange={setMinutes} />
  ```

### PetSelectionFields.js
- **Rol:** Selector specie și talie pentru animale.
- **Props:**
  - `selectedSpecies` (string)
  - `selectedSize` (string/number)
  - `onSpeciesChange` (func)
  - `onSizeChange` (func)
  - `errors` (obiect)
- **Exemplu:**
  ```jsx
  <PetSelectionFields selectedSpecies={specie} selectedSize={talie} onSpeciesChange={setSpecie} onSizeChange={setTalie} errors={errors} />
  ```

### NeumorphicComponents.js
- **Rol:** Componente cu design neumorphic (card, buton, input, text).
- **Exportă:**
  - `NeumorphicCard`, `NeumorphicButton`, `NeumorphicInput`, `NeumorphicText`
- **Exemplu:**
  ```jsx
  <NeumorphicCard><Text>Card cu efect neumorphic</Text></NeumorphicCard>
  ```

### TextLink.js
- **Rol:** Link text custom (ex: "Ai uitat parola?", "Nu ai cont?").
- **Props:**
  - `text` (string)
  - `onPress` (func)
  - `style` (object)
- **Exemplu:**
  ```jsx
  <TextLink text="Nu ai cont? Înregistrează-te" onPress={goToRegister} />
  ```

---

## Alte observații

- Aproximativ toate fetch-urile către backend folosesc token JWT din AsyncStorage.
- Navigarea și starea aplicației sunt gestionate modern, cu hooks și context.
- Designul este responsive, cu accent pe UX, animații și feedback vizual.
- Codul este structurat pe module, ușor de extins și întreținut.
- Codul utilizeaza librarii open source de la expo si npm.
- Pentru unele bucati mici de cod s-a folosit Cursor.
