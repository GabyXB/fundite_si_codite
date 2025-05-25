# Capitolul VI. Resurse obligatorii

## VI.1. Codul sursă 🗂️

### 🔹 Structurare și standarde
- Codul sursă este organizat pe module și directoare clare:
  - `fsc/` – conține aplicația mobilă (frontend React Native/Expo, componente, screens, context, utils etc.)
  - `backend/` – conține serverul Node.js/Express, rutele, controllerele, modelele, middleware-urile și configurațiile
- Fiecare fișier și funcție are un scop clar, iar denumirile sunt descriptive și respectă convențiile limbajului (camelCase pentru JS, PascalCase pentru componente React).
- Se folosesc standarde moderne de programare (ES6+, async/await, hooks, destructurare, arrow functions).

### 🔹 Comentarii și docstring-uri
- Fiecare funcție importantă și fiecare modul conține comentarii care explică scopul și modul de funcționare.
- Sunt folosite docstring-uri pentru funcțiile complexe, pentru a facilita mentenanța și extinderea codului.
- Exemple de comentarii:
  ```js
  // Validează parola (minim 8 caractere, o literă mare, o cifră)
  const validatePassword = (password) => ...
  ```

### 🔹 Mentenanță și design pattern-uri
- Codul este modular, ușor de extins și întreținut datorită separării pe componente, controllere, modele și middleware-uri.
- Se folosesc pattern-uri precum MRC (Model-Route-Controller) pentru backend și component-based design pentru frontend.
- Orice funcționalitate nouă poate fi adăugată fără a afecta restul aplicației, datorită acestei structuri.

---

## VI.2. Resurse externe 📚

### 🔹 Biblioteci și framework-uri folosite
- **Frontend:**
  - `react`, `react-native`, `expo`, `@react-navigation/native`, `@expo/vector-icons`, `react-native-safe-area-context`, `react-native-async-storage/async-storage`, `react-native-size-matters` , lista completa se gaseste in package.json.
- **Backend:**
  - `express`, `sequelize`, `mysql2`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`, `aws-sdk`, `multer`, `@aws-sdk/client-s3`

### 🔹 Alte resurse externe
- Toate bibliotecile folosite sunt open source și au fost integrate respectând licențele acestora.
- Nu au fost folosite fragmente de cod ce nu îmi aparțin, cu excepția exemplelor din documentația oficială a bibliotecilor menționate.
- Imaginile de placeholder folosite în aplicație provin de pe site-uri gratuite (ex: placehold.co).

---

> "O structură clară a codului și folosirea responsabilă a resurselor externe asigură calitatea și evoluția proiectului!" 📦 