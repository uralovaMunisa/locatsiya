# Joyni Top (Find Place) 📍

Zamonaviy, tezkor va qulay geolokatsiya hamda navigatsiya veb-ilovasi. React (Vite), Tailwind CSS, OpenStreetMap (Nominatim), Leaflet va OSRM yordamida yaratilgan.

---

## 🚀 Asosiy Imkoniyatlar (Core Features)

1. **Aqlli Qidiruv Paneli (Hero Search Bar)**:
   - 400ms debounce bilan tezkor avtotakliflar (autocomplete).
   - Bepul Nominatim (OpenStreetMap) geokodlash xizmati (API kalitsiz).
   - Har bir natijada: manzil nomi, qisqacha ko'cha/shahar, toifa belgisi (ikonka) va joriy joylashuvdan masofa.
   - Toifalar bo'yicha tezkor filtrlar: Restoranlar, Dorixonalar, Shifoxonalar, Bog'lar, Qahvaxonalar, Tarixiy joylar, Zapravkalar.

2. **Interaktiv Xarita (Interactive Map)**:
   - `react-leaflet` va OpenStreetMap plitalari (Standart, Voyager va Tungi Dark Matter rejimlari).
   - Tanlangan joy uchun maxsus SVG pin marker va batafsil popup (nomi, to'liq manzil, aniq koordinatalar).
   - Silliq va chiroyli fly-to animatsiyasi.
   - "Mening joylashuvim" tugmasi (brauzer Geolocation API) va foydalanuvchi uchun pulsatsiyalanuvchi moviy nuqta.

3. **Manzil Tafsilotlari Paneli (Place Details Panel)**:
   - Mobilda pastdan sirg'alib chiquvchi zamonaviy bottom sheet, kompyuterda esa chap yon panel.
   - Katta sarlavha, toifa nishoni, to'liq manzil va koordinatalar.
   - "Koordinatalarni nusxalash" (bir bosishda buferga nusxa olish).
   - "Joylashuvni ulashish" (Web Share API va avtomatik havola nusxalash).
   - "Google Xaritalarda ochish" (Google Maps havolasi).
   - Foydalanuvchi joylashuvidan masofa va taxminiy yetib borish vaqti (avtomobilda va piyoda).

4. **Navigatsiya va Marshrut ("Qanday yetib borish mumkin?")**:
   - Bepul OSRM (Open Source Routing Machine) API orqali xaritada ko'k chiziqli yo'nalish polilayni.
   - Harakatlanish rejimlari:
     - 🚗 Avtomobilda (Driving)
     - 🚶 Piyoda (Walking)
     - 🚲 Velosipedda (Cycling)
   - Umumiy masofa (km / m) va ketadigan vaqt.
   - Bosqichma-bosqich navigatsiya yo'riqnomasi (burilishlar, aylanma yo'llar, manzilga yetib kelish belgilari bilan).
   - Har bir burilish ustiga bosganda xaritada o'sha nuqtaga zum qilish.

5. **"Qanday ishlaydi?" va Qo'llanma**:
   - 3 qadamli vizual qo'llanma (1. Qidiring → 2. Xaritada ko'ring → 3. Yo'nalish oling).
   - O'zbekistonning mashhur maskanlari (Toshkent City, Chorsu, Samarqand Registon, Minor masjidi) ni bir bosishda sinab ko'rish.
   - Ilk tashrif buyuruvchilar uchun interaktiv onboarding tur (qidiruv paneli, joylashuv tugmasi va navigatsiya imkoniyatlarini tushuntiruvchi).

6. **Qo'shimcha imkoniyatlar**:
   - Oxirgi qidiruvlar tarixi (`localStorage` da saqlanadi).
   - Sevimli joylar ro'yxati (yurakcha orqali saqlash/o'chirish).
   - Tungi va yorug' rejim (Dark Mode / Light Mode).
   - 3 ta tilni qo'llab-quvvatlash: O'zbekcha (asosiy), Ruscha va Inglizcha.
   - URL orqali to'g'ridan-to'g'ri manzilni ochish (`?lat=...&lng=...&name=...`).

---

## 🛠 O'rnatish va Ishga Tushirish

### Talablar:
- Node.js (v18 yoki undan yuqori)
- npm

### Qadamlar:

```bash
# 1. Loyihani yuklab oling va papkaga kiring
cd locatsiya

# 2. Bog'liqliklarni o'rnating
npm install

# 3. Dasturni ishga tushiring
npm run dev
```

Brauzerda `http://localhost:3000` manzilini oching.

### Ishlab chiqarish uchun yig'ish (Build):

```bash
npm run build
npm run preview
```

---

## 📁 Loyiha Strukturasi

```
locatsiya/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── MapView.jsx
│   │   ├── PlaceCard.jsx
│   │   ├── DirectionsPanel.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── OnboardingModal.jsx
│   │   ├── FavoritesDrawer.jsx
│   │   ├── RecentSearchesModal.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── Toast.jsx
│   ├── hooks/
│   │   ├── useGeolocation.js
│   │   ├── useDebounce.js
│   │   └── useLocalStorage.js
│   ├── services/
│   │   ├── nominatim.js
│   │   └── osrm.js
│   ├── utils/
│   │   ├── categories.js
│   │   └── helpers.js
│   └── i18n/
│       ├── index.jsx
│       └── translations.js
```

---

## 🌐 API Ma'lumotlari

- **Nominatim Geocoding**: [https://nominatim.openstreetmap.org/](https://nominatim.openstreetmap.org/)
- **OSRM Routing Engine**: [https://project-osrm.org/](https://project-osrm.org/)
- **Xarita Plitalari**: OpenStreetMap & CartoDB Voyager / Dark Matter
- Barcha xizmatlar ochiq va bepul, hech qanday maxfiy API kalit talab etilmaydi.

