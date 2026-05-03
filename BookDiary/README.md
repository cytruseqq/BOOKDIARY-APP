# 📚 BookDiary — Dziennik Czytelnika

Aplikacja React Native Expo do zarządzania listą przeczytanych książek/filmów z funkcjami społecznościowymi.

---

## 🚀 Szybki start

### 1. Konfiguracja Supabase

1. Wejdź na [supabase.com](https://supabase.com) i utwórz nowy projekt
2. Przejdź do **SQL Editor** i wklej zawartość pliku `supabase_schema.sql`, uruchom
3. Przejdź do **Settings → API** i skopiuj:
   - `Project URL`
   - `anon public key`

### 2. Konfiguracja projektu

Otwórz plik `src/lib/supabase.ts` i uzupełnij:

```ts
const SUPABASE_URL = 'https://TWOJ_PROJEKT.supabase.co';
const SUPABASE_ANON_KEY = 'TWOJ_ANON_KEY';
```

### 3. Instalacja zależności

```bash
npm install
```

### 4. Uruchomienie

```bash
# Expo Go (telefon)
npm start

# Android
npm run android

# iOS
npm run ios
```

---

## 📱 Ekrany i funkcje

| Ekran | Opis |
|-------|------|
| **Login** | Logowanie e-mail/hasło |
| **Rejestracja** | Nowe konto z nazwą użytkownika |
| **Moje Książki** | Lista książek z filtrowaniem i wyszukiwaniem |
| **Szczegóły książki** | Edycja, inni czytelnicy, obserwowanie |
| **Dodaj książkę** | Formularz z tytułem, autorem, statusem, oceną |
| **Statystyki** | Liczniki, średnia ocena, najwyżej oceniona |
| **Obserwowani** | Lista obserwowanych z ich przeczytanymi |
| **Profil** | Dane użytkownika, wylogowanie |

### ✅ Zaimplementowane wymagania

- [x] Rejestracja i logowanie (Supabase Auth)
- [x] MyBooks — lista z filtrowaniem po statusie
- [x] Sortowanie po dacie dodania (najnowsze na górze)
- [x] Wyszukiwanie po tytule i autorze
- [x] Licznik przeczytanych książek w bieżącym roku
- [x] Status jako select (3 opcje: Chcę / Czytam / Przeczytane)
- [x] Sortowanie po statusie (filtr)
- [x] AddBook — tytuł, autor, status, ocena 1-5, notatki
- [x] Ekran statystyk (wszystkie wymagane liczniki)
- [x] Sekcja "Inni czytelnicy" na szczegółach książki
- [x] Kliknięcie w czytelnika → lista jego przeczytanych
- [x] Obserwowanie/odprowadzanie czytelników
- [x] Sekcja obserwowanych z ich książkami
- [x] "Dodaj do mojej listy" (kopiuje książkę ze statusem to_read)
- [x] Tabela `user_follows(id, follower_id, following_id, created_at)`

---

## 🗄️ Struktura bazy danych

### `books`
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Klucz główny |
| user_id | UUID | FK do auth.users |
| title | TEXT | Tytuł książki |
| author | TEXT | Autor |
| status | TEXT | to_read / reading / finished |
| rating | NUMERIC | Ocena 1-5 (nullable) |
| notes | TEXT | Notatki (nullable) |
| date_added | TIMESTAMPTZ | Data dodania |

### `user_follows`
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Klucz główny |
| follower_id | UUID | FK do auth.users (obserwujący) |
| following_id | UUID | FK do auth.users (obserwowany) |
| created_at | TIMESTAMPTZ | Data obserwowania |

---

## 🛠️ Technologie

- **React Native** z **Expo** (~51)
- **Expo Router** v3 — file-based routing
- **Supabase** — baza danych + autentykacja
- **Zustand** — globalny state management
- **TypeScript** — typowanie
- **@expo/vector-icons** — ikony Ionicons

---

## 📁 Struktura projektu

```
BookDiary/
├── app/
│   ├── _layout.tsx          # Root layout + auth listener
│   ├── index.tsx            # Redirect po statusie auth
│   ├── login.tsx            # Ekran logowania
│   ├── register.tsx         # Ekran rejestracji
│   ├── add-book.tsx         # Dodawanie książki
│   ├── book-detail.tsx      # Szczegóły książki
│   └── (tabs)/
│       ├── _layout.tsx      # Bottom tab navigator
│       ├── my-books.tsx     # Lista moich książek
│       ├── stats.tsx        # Statystyki
│       ├── following.tsx    # Obserwowani
│       └── profile.tsx      # Profil i wylogowanie
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Klient Supabase ⚠️ uzupełnij klucze!
│   │   └── constants.ts     # Kolory i stałe
│   ├── store/
│   │   └── useStore.ts      # Zustand store
│   ├── screens/             # Logika ekranów
│   └── components/          # Komponenty wielokrotnego użytku
├── supabase_schema.sql      # SQL do uruchomienia w Supabase
└── README.md
```
