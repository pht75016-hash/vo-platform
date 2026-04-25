# VO Platform — Brief projet Claude Code

## Vision
Application modulaire SaaS pour professionnels de l'automobile (négociants VO,
vendeurs salariés, agents commerciaux, mandataires). Architecture inspirée d'Odoo :
modules activables selon le profil et le tier d'abonnement. Développée initialement
en React JSX single-file artifacts sur Claude.ai, en cours de migration vers un
projet Vite local.

Philosophie Odoo appliquée à ce projet :
- Chaque information saisie une seule fois → propagée automatiquement partout
- Modules indépendants mais reliés par un store partagé
- Interface logique, ergonomique, pensée mobile ET desktop

---

## Stack technique

- **Bundler** : Vite + React (JSX)
- **Routing** : React Router v6 (`BrowserRouter`, `useNavigate`)
- **État global** : Zustand + middleware `persist` (remplace localStorage manuel)
- **Persistance** : localStorage, clé active `vs8`
- **Fonts** : DM Sans (principale), Space Mono (secondaire) via Google Fonts
- **Icônes** : SVG inline uniquement, pas de lib externe
- **CSS** : styles inline en objets JS, système de thème maison (pas de Tailwind)

---

## Structure du projet

```
src/
├── main.jsx
├── App.jsx                    # Routing global
├── store/
│   └── useStore.js            # Zustand store (véhicules, contacts, settings)
├── modules/
│   ├── home/                  # Écran d'accueil négociant VO
│   ├── stock/                 # Gestion du stock véhicules (module le + avancé)
│   ├── crm/                   # CRM prospects et pipeline
│   ├── atelier/               # Ordres de travaux
│   ├── ged/                   # Gestion documentaire
│   ├── notes/                 # Notes rapides
│   └── location/              # Location de voiture
├── components/                # Composants partagés entre modules
│   ├── VehicleCard.jsx
│   ├── StatusBadge.jsx
│   ├── StepTracker.jsx
│   ├── Filters.jsx
│   ├── Modal.jsx
│   └── ...
├── hooks/
│   ├── useIsMobile.js         # Breakpoint 768px
│   └── useVehicles.js
└── utils/
    ├── storage.js             # Migration cascade localStorage
    ├── formatters.js          # Prix, dates, immatriculations
    └── constants.js           # Marques, modèles, carburants...
```

---

## Système de thème

```js
const themes = {
  light: {
    bg: '#FFFFFF',
    bgSecondary: '#F5F5F5',
    bgTertiary: '#EBEBEB',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    accent: '#2563EB',
    // ...
  },
  dark: {
    bg: '#1A1A1A',
    bgSecondary: '#242424',
    bgTertiary: '#2E2E2E',
    text: '#F0F0F0',
    textSecondary: '#A0A0A0',
    border: '#383838',
    accent: '#3B82F6',
    // ...
  }
}
// Toujours utiliser via : const t = themes[theme]
// Jamais de couleurs hardcodées dans les composants
```

---

## Conventions UI obligatoires

- **Hauteur des boutons** : 26px, `box-sizing: border-box`, padding 0 10px
- **Hauteur des inputs** : 26px, même règle
- **Font size inputs mobile** : 16px minimum (empêche le zoom automatique iOS)
- **Breakpoint mobile** : 768px via `useIsMobile()` hook
- **Dropdowns** : `position: fixed` avec `getBoundingClientRect()` pour éviter
  le clipping dans les conteneurs `overflow: hidden`
- **Boutons submit** : ne jamais mettre `disabled` (bloque silencieusement).
  Préférer un feedback visuel de validation
- **Coins arrondis** : 6px par défaut, 10px pour les cards
- **Pas de bibliothèque CSS externe** : tout en styles inline JS

---

## Module Stock — État actuel (le plus avancé)

### Données véhicule
```js
{
  id: string,                    // UUID
  immat: string,                 // Obligatoire
  voNumber: string,              // Optionnel
  vin: string,
  datePurchase: string,          // ISO date
  make: string,                  // 35+ marques disponibles
  model: string,                 // Cascading depuis make
  fuel: string,                  // Essence|Diesel|Hybride|Electrique|GPL|...
  kwh: number,                   // Si électrique : kWh utiles
  acCharge: number,              // Charge AC (kW)
  dcCharge: number,              // Charge DC (kW)
  chademo: boolean,
  comboCCS: boolean,
  mileage: number,               // Kilométrage réel
  mileageMargin: number,         // Auto : +200km
  fiscalHP: number,              // Chevaux fiscaux
  tvaType: 'deductible'|'marge', // Type TVA
  prixHT: number,                // Si TVA déductible
  prixTTC: number,               // Bidirectionnel avec prixHT (×1.20)
  prixVente: number,             // Prix de vente
  margeNette: number,            // Calculé auto
  status: 'projet'|'stock'|'vendu', // 'stock' par défaut
  photos: string[],              // Base64, max 600px, redimensionnées
  documents: Array<{             // GED intégrée
    name: string,
    size: number,                // Flag si > 2MB
    data: string,                // Base64
    path: string                 // Auto-généré : GED/MARQ-MOD/IMMAT
  }>,
  steps: {                       // Suivi par étape
    achatAdmin: { status: 'red'|'orange'|'green' },
    preparation: { status, files: [] },
    mecanique: { status, checklist: string[] },
    carrosserie: { status, ras: boolean, travaux: string, note: string },
    venteAdmin: { status },
    annonce: {
      status,
      leboncoin: boolean,
      laCentrale: boolean,
      autoscout24: boolean
    }
  }
}
```

### Vues disponibles
- **Liste** : colonnes triables, badge jours en stock coloré (vert→orange→rouge)
- **Mosaïque/grille** : cards avec photo principale
- **Filtres** : sidebar desktop / slide-over mobile, dropdowns dynamiques depuis
  stock réel, filtres range (km, prix, CV, dates)

### TVA
- `deductible` : affiche HT + TTC, calcul bidirectionnel 20%
- `marge` : affiche prix unique + marge nette + TVA sur marge
- Badge marge coloré dans toutes les vues

---

## Module Home — État actuel

- 7 modules affichés en cards : Notes, Ventes, CRM, Documents, Stock, Atelier,
  Location de voiture
- Dark/light mode toggle via panneau settings
- Drag-and-drop + boutons flèches pour réordonner les modules
- Boutons de navigation → `useNavigate()` vers les routes correspondantes

---

## Module Vendeur salarié — État actuel

- Formulaire CRM style fiche client
- Champs identité partagés (Nom, Prénom, Email, Tél) avec badge "Auto"
  → se synchronisent automatiquement depuis le profil utilisateur
- Dashboard KPI

---

## Store Zustand (à implémenter)

```js
// store/useStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(persist(
  (set, get) => ({
    // Véhicules
    vehicles: [],
    addVehicle: (v) => set(s => ({ vehicles: [...s.vehicles, v] })),
    updateVehicle: (id, data) => set(s => ({
      vehicles: s.vehicles.map(v => v.id === id ? { ...v, ...data } : v)
    })),
    deleteVehicle: (id) => set(s => ({
      vehicles: s.vehicles.filter(v => v.id !== id)
    })),

    // Contacts / prospects
    contacts: [],
    addContact: (c) => set(s => ({ contacts: [...s.contacts, c] })),
    updateContact: (id, data) => set(s => ({
      contacts: s.contacts.map(c => c.id === id ? { ...c, ...data } : c)
    })),

    // Profil utilisateur (champs auto-sync)
    userProfile: {
      nom: '', prenom: '', email: '', telephone: ''
    },
    updateProfile: (data) => set(s => ({
      userProfile: { ...s.userProfile, ...data }
    })),

    // Préférences UI
    theme: 'light',
    setTheme: (t) => set({ theme: t }),
    moduleOrder: ['notes','ventes','crm','documents','stock','atelier','location'],
    setModuleOrder: (order) => set({ moduleOrder: order }),
  }),
  {
    name: 'vs8',   // Même clé que localStorage existant
    version: 8,
  }
))
```

---

## Migration localStorage existante

La migration cascade doit être préservée. Chaque clé ancienne (vs2→vs7) a son
propre `try/catch` isolé — les clés manquantes lèvent des exceptions qui casseraient
une migration globale non isolée.

```js
// utils/storage.js
export function migrateFromLegacy() {
  const keys = ['vs2','vs3','vs4','vs5','vs6','vs7']
  let vehicles = []
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.vehicles?.length) vehicles = data.vehicles
      }
    } catch (e) {
      // clé absente ou corrompue, on continue
    }
  }
  return vehicles
}
```

---

## Routing (App.jsx)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Routes prévues :
// /              → Home (négociant VO)
// /stock         → Module Stock
// /stock/:id     → Fiche véhicule
// /crm           → Module CRM
// /atelier       → Module Atelier
// /ged           → Gestion documentaire
// /notes         → Notes
// /settings      → Paramètres profil
```

---

## Profils utilisateurs prévus

| Profil | Modules disponibles |
|--------|-------------------|
| Négociant VO | Tous |
| Vendeur salarié | CRM, Stock (lecture), Notes |
| Agent commercial | CRM, Notes |
| Mandataire | Stock, CRM, GED |

---

## Règles de développement absolues

1. **Une info saisie = propagée partout** — jamais demander deux fois la même chose
2. **Mobile-first** — tester mentalement chaque composant sur 375px ET 1440px
3. **Pas de `disabled` sur submit** — feedback visuel à la place
4. **Pas de duplication de composants** — si utilisé 2× → components/
5. **Styles inline JS uniquement** — pas de fichiers CSS, pas de Tailwind
6. **Clé storage `vs8`** — ne pas changer sans migration cascade
7. **Pas de dépendances inutiles** — stack minimaliste (Vite, React, Router, Zustand)
